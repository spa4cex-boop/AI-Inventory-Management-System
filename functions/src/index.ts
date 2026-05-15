import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import axios from 'axios'
import cors from 'cors'
import express from 'express'
import { Pool } from 'pg'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseProjectId,
      clientEmail: firebaseClientEmail,
      privateKey: firebasePrivateKey,
    }),
  })
} else {
  admin.initializeApp()
}

const SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat:free'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

if (!SUPABASE_DATABASE_URL) {
  throw new Error('Missing required environment variable SUPABASE_DATABASE_URL')
}
if (!OPENROUTER_API_KEY) {
  throw new Error('Missing required environment variable OPENROUTER_API_KEY')
}

const pool = new Pool({
  connectionString: SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function query(sql: string, params: unknown[] = []) {
  const client = await pool.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

async function verifyFirebaseToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer\s+(.*)$/)
  if (!match) {
    return res.status(401).json({ error: 'Unauthorized: missing bearer token' })
  }

  const idToken = match[1]
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    ;(req as any).user = decoded
    return next()
  } catch (error) {
    console.error('Firebase token verification failed:', error)
    return res.status(401).json({ error: 'Unauthorized: invalid token' })
  }
}

function requireRole(role: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userRole = (user.role || user.role_claims || 'staff') as string
    if (userRole !== role && userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    }

    return next()
  }
}

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'AI Inventory Management System', provider: 'Firebase Functions' })
})

app.get('/products', verifyFirebaseToken, async (req, res) => {
  const limit = Number(req.query.limit || 100)
  const offset = Number(req.query.offset || 0)
  const result = await query('SELECT * FROM products ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset])
  res.json(result.rows)
})

app.post('/products', verifyFirebaseToken, async (req, res) => {
  const { name, sku, barcode, category_id, supplier_id, quantity, price, reorder_level, expiry_date, image_url } = req.body
  const result = await query(
    `INSERT INTO products (name, sku, barcode, category_id, supplier_id, quantity, price, reorder_level, expiry_date, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name, sku, barcode || null, category_id || null, supplier_id || null, quantity || 0, price || 0.0, reorder_level || 0, expiry_date || null, image_url || null]
  )
  res.status(201).json(result.rows[0])
})

app.get('/products/:id', verifyFirebaseToken, async (req, res) => {
  const result = await query('SELECT * FROM products WHERE id = $1', [Number(req.params.id)])
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(result.rows[0])
})

app.put('/products/:id', verifyFirebaseToken, async (req, res) => {
  const productId = Number(req.params.id)
  const fields = req.body
  const keys = Object.keys(fields)
  if (!keys.length) {
    return res.status(400).json({ error: 'No fields provided for update' })
  }

  const sets = keys.map((key, index) => `${key} = $${index + 1}`).join(', ')
  const values = keys.map((key) => fields[key])
  values.push(productId)

  const result = await query(`UPDATE products SET ${sets} WHERE id = $${values.length} RETURNING *`, values)
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(result.rows[0])
})

app.delete('/products/:id', verifyFirebaseToken, async (req, res) => {
  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [Number(req.params.id)])
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.status(204).send(null)
})

app.get('/orders', verifyFirebaseToken, async (req, res) => {
  const result = await query('SELECT * FROM orders ORDER BY created_at DESC')
  res.json(result.rows)
})

app.post('/orders', verifyFirebaseToken, async (req, res) => {
  const { customer_name, items = [], status = 'pending' } = req.body
  if (!customer_name || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customer_name and items are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const orderResult = await client.query(
      'INSERT INTO orders (customer_name, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [customer_name, 0.0, status]
    )
    const order = orderResult.rows[0]
    let totalAmount = 0

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [Number(item.product_id)])
      if (productResult.rowCount === 0) {
        throw new Error(`Product not found: ${item.product_id}`)
      }
      const product = productResult.rows[0]
      const quantity = Number(item.quantity || 1)
      const price = Number(item.price ?? product.price)
      totalAmount += price * quantity

      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, product.id, quantity, price]
      )
      await client.query('UPDATE products SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2', [quantity, product.id])
    }

    const updatedOrderResult = await client.query('UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *', [totalAmount, order.id])
    await client.query('COMMIT')
    res.status(201).json(updatedOrderResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Order creation failed:', error)
    res.status(500).json({ error: String(error) })
  } finally {
    client.release()
  }
})

app.get('/suppliers', verifyFirebaseToken, async (req, res) => {
  const result = await query('SELECT * FROM suppliers ORDER BY id DESC')
  res.json(result.rows)
})

app.post('/suppliers', verifyFirebaseToken, async (req, res) => {
  const { name, email, phone, address, rating } = req.body
  const result = await query(
    'INSERT INTO suppliers (name, email, phone, address, rating) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email || null, phone || null, address || null, rating || 0.0]
  )
  res.status(201).json(result.rows[0])
})

app.put('/suppliers/:id', verifyFirebaseToken, async (req, res) => {
  const supplierId = Number(req.params.id)
  const fields = req.body
  const keys = Object.keys(fields)
  if (!keys.length) {
    return res.status(400).json({ error: 'No fields provided for update' })
  }
  const sets = keys.map((key, index) => `${key} = $${index + 1}`).join(', ')
  const values = keys.map((key) => fields[key])
  values.push(supplierId)
  const result = await query(`UPDATE suppliers SET ${sets} WHERE id = $${values.length} RETURNING *`, values)
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Supplier not found' })
  }
  res.json(result.rows[0])
})

app.delete('/suppliers/:id', verifyFirebaseToken, async (req, res) => {
  const result = await query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [Number(req.params.id)])
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Supplier not found' })
  }
  res.status(204).send(null)
})

app.get('/inventory/low-stock', verifyFirebaseToken, async (req, res) => {
  const result = await query('SELECT * FROM products WHERE quantity <= reorder_level ORDER BY quantity ASC')
  res.json(result.rows)
})

app.get('/reports/inventory', verifyFirebaseToken, async (req, res) => {
  const lowStock = await query('SELECT COUNT(*) AS low_stock FROM products WHERE quantity <= reorder_level')
  const totalProducts = await query('SELECT COUNT(*) AS total_products FROM products')
  const totalOrders = await query('SELECT COUNT(*) AS total_orders FROM orders')
  res.json({
    low_stock: Number(lowStock.rows[0]?.low_stock || 0),
    total_products: Number(totalProducts.rows[0]?.total_products || 0),
    total_orders: Number(totalOrders.rows[0]?.total_orders || 0),
  })
})

app.get('/notifications', verifyFirebaseToken, async (req, res) => {
  const result = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100')
  res.json(result.rows)
})

app.post('/notifications', verifyFirebaseToken, async (req, res) => {
  const { title, message, type = 'info', fcm_token } = req.body
  const result = await query(
    'INSERT INTO notifications (title, message, type) VALUES ($1,$2,$3) RETURNING *',
    [title, message, type]
  )
  const notification = result.rows[0]

  if (fcm_token) {
    try {
      await admin.messaging().send({
        token: fcm_token,
        notification: {
          title,
          body: message,
        },
        android: { priority: 'high' },
        apns: { headers: { 'apns-priority': '10' } },
      })
    } catch (sendError) {
      console.warn('Failed to send FCM notification:', sendError)
    }
  }

  res.status(201).json(notification)
})

app.post('/ai/assist', verifyFirebaseToken, async (req, res) => {
  const { prompt } = req.body
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' })
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an inventory assistant for a SaaS inventory management platform. Provide stock recommendations, order guidance, and product insights. Use plain text responses. Do not expose internal debug details.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const message = response.data?.choices?.[0]?.message?.content || ''
    await query('INSERT INTO ai_insights (insight, recommendation) VALUES ($1, $2)', [message, null])
    res.json({ assistant: message })
  } catch (error) {
    console.error('AI assistant error:', error)
    res.status(502).json({ error: 'Failed to generate AI response' })
  }
})

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export const api = functions.region('us-central1').https.onRequest(app)
