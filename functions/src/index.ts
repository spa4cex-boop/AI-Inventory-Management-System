import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import axios from 'axios'
import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

admin.initializeApp()
const db = admin.firestore()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat:free'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

if (!OPENROUTER_API_KEY) {
  throw new Error('Missing required environment variable OPENROUTER_API_KEY')
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

function getUserRole(user: admin.auth.DecodedIdToken | null): string {
  if (!user) return 'staff'
  return (user.role as string) || (user.role_claims as any)?.role || 'staff'
}

function requireRole(role: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user as admin.auth.DecodedIdToken | null
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userRole = getUserRole(user)
    if (userRole !== role && userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    }

    return next()
  }
}

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'AI Inventory Management System', provider: 'Firebase Functions' })
})

app.get('/products', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').limit(100).get()
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json(products)
  } catch (error) {
    console.error('Failed to load products:', error)
    res.status(500).json({ error: 'Unable to load products' })
  }
})

app.post('/products', verifyFirebaseToken, async (req, res) => {
  const { name, sku, barcode, categoryId, categoryName, supplierId, supplierName, quantity, price, reorderLevel, expiryDate, imageUrl } = req.body
  if (!name || !sku) {
    return res.status(400).json({ error: 'Product name and SKU are required' })
  }

  try {
    const docRef = await db.collection('products').add({
      name,
      sku,
      barcode: barcode || null,
      categoryId: categoryId || null,
      categoryName: categoryName || null,
      supplierId: supplierId || null,
      supplierName: supplierName || null,
      quantity: Number(quantity || 0),
      price: Number(price || 0),
      reorderLevel: Number(reorderLevel || 0),
      expiryDate: expiryDate || null,
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    const snapshot = await docRef.get()
    res.status(201).json({ id: docRef.id, ...snapshot.data() })
  } catch (error) {
    console.error('Failed to create product:', error)
    res.status(500).json({ error: 'Unable to create product' })
  }
})

app.post('/products/bulk', verifyFirebaseToken, async (req, res) => {
  const products = req.body
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'A non-empty array of products is required' })
  }

  try {
    const batch = db.batch()
    const createdProducts: any[] = []

    products.forEach((product: any) => {
      const { name, sku, barcode, categoryId, categoryName, supplierId, supplierName, quantity, price, reorderLevel, expiryDate, imageUrl } = product
      if (!name || !sku) {
        return
      }
      const productRef = db.collection('products').doc()
      batch.set(productRef, {
        name,
        sku,
        barcode: barcode || null,
        categoryId: categoryId || null,
        categoryName: categoryName || null,
        supplierId: supplierId || null,
        supplierName: supplierName || null,
        quantity: Number(quantity || 0),
        price: Number(price || 0),
        reorderLevel: Number(reorderLevel || 0),
        expiryDate: expiryDate || null,
        imageUrl: imageUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      createdProducts.push({ id: productRef.id, name, sku, barcode: barcode || null, categoryId: categoryId || null, categoryName: categoryName || null, supplierId: supplierId || null, supplierName: supplierName || null, quantity: Number(quantity || 0), price: Number(price || 0), reorderLevel: Number(reorderLevel || 0), expiryDate: expiryDate || null, imageUrl: imageUrl || null })
    })

    await batch.commit()
    res.status(201).json(createdProducts)
  } catch (error) {
    console.error('Failed to bulk create products:', error)
    res.status(500).json({ error: 'Unable to bulk create products' })
  }
})

app.put('/products/:id', verifyFirebaseToken, async (req, res) => {
  const productId = req.params.id
  const fields = req.body
  if (!Object.keys(fields).length) {
    return res.status(400).json({ error: 'No fields provided for update' })
  }

  try {
    const productRef = db.collection('products').doc(productId)
    const snapshot = await productRef.get()
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await productRef.update(fields)
    const updated = await productRef.get()
    res.json({ id: updated.id, ...updated.data() })
  } catch (error) {
    console.error('Failed to update product:', error)
    res.status(500).json({ error: 'Unable to update product' })
  }
})

app.delete('/products/:id', verifyFirebaseToken, async (req, res) => {
  const productId = req.params.id
  try {
    await db.collection('products').doc(productId).delete()
    res.status(204).send(null)
  } catch (error) {
    console.error('Failed to delete product:', error)
    res.status(500).json({ error: 'Unable to delete product' })
  }
})

app.get('/categories', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get()
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json(categories)
  } catch (error) {
    console.error('Failed to load categories:', error)
    res.status(500).json({ error: 'Unable to load categories' })
  }
})

app.post('/categories', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const docRef = await db.collection('categories').add({ name, createdAt: admin.firestore.FieldValue.serverTimestamp() })
    const snapshot = await docRef.get()
    res.status(201).json({ id: docRef.id, ...snapshot.data() })
  } catch (error) {
    console.error('Failed to create category:', error)
    res.status(500).json({ error: 'Unable to create category' })
  }
})

app.get('/suppliers', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('suppliers').orderBy('name').get()
    const suppliers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json(suppliers)
  } catch (error) {
    console.error('Failed to load suppliers:', error)
    res.status(500).json({ error: 'Unable to load suppliers' })
  }
})

app.post('/suppliers', verifyFirebaseToken, async (req, res) => {
  const { name, email, phone, address } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required' })
  }

  try {
    const docRef = await db.collection('suppliers').add({
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      rating: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    const snapshot = await docRef.get()
    res.status(201).json({ id: docRef.id, ...snapshot.data() })
  } catch (error) {
    console.error('Failed to create supplier:', error)
    res.status(500).json({ error: 'Unable to create supplier' })
  }
})

app.get('/orders', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
    const orders = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const itemsSnapshot = await db.collection('orderItems').where('orderId', '==', doc.id).get()
        return {
          id: doc.id,
          ...data,
          items: itemsSnapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() })),
        }
      })
    )
    res.json(orders)
  } catch (error) {
    console.error('Failed to load orders:', error)
    res.status(500).json({ error: 'Unable to load orders' })
  }
})

app.post('/orders', verifyFirebaseToken, async (req, res) => {
  const { customerName, items = [], status = 'pending' } = req.body
  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerName and items are required' })
  }

  try {
    const orderRef = db.collection('orders').doc()
    const batch = db.batch()
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    )

    batch.set(orderRef, {
      customerName,
      totalAmount,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    items.forEach((item: any) => {
      const productRef = db.collection('products').doc(item.productId)
      const orderItemRef = db.collection('orderItems').doc()
      batch.update(productRef, { quantity: admin.firestore.FieldValue.increment(-Number(item.quantity || 1)) })
      batch.set(orderItemRef, {
        orderId: orderRef.id,
        productId: item.productId,
        productName: item.productName || null,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      const logRef = db.collection('inventoryLogs').doc()
      batch.set(logRef, {
        productId: item.productId,
        action: 'order',
        quantity: Number(item.quantity || 1),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()
    const createdOrder = await orderRef.get()
    res.status(201).json({ id: createdOrder.id, ...createdOrder.data() })
  } catch (error) {
    console.error('Failed to create order:', error)
    res.status(500).json({ error: 'Unable to create order' })
  }
})

app.get('/inventory/low-stock', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('products').get()
    const products = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      .filter((product: any) => {
        const quantity = Number(product.quantity || 0)
        const reorderLevel = Number(product.reorderLevel || 0)
        return quantity <= reorderLevel
      })
    res.json(products)
  } catch (error) {
    console.error('Failed to load low-stock products:', error)
    res.status(500).json({ error: 'Unable to load low-stock products' })
  }
})

app.get('/reports/dashboard', verifyFirebaseToken, async (req, res) => {
  try {
    const [productSnapshot, orderSnapshot] = await Promise.all([
      db.collection('products').get(),
      db.collection('orders').get(),
    ])

    const lowStockProducts = productSnapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      .filter((product: any) => {
        const quantity = Number(product.quantity || 0)
        const reorderLevel = Number(product.reorderLevel || 0)
        return quantity <= reorderLevel
      })

    const totalProducts = productSnapshot.size
    const totalOrders = orderSnapshot.size
    let totalRevenue = 0
    const monthlyMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()

    orderSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const createdAt = data.createdAt?.toDate?.()
      if (createdAt) {
        const month = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + Number(data.totalAmount || 0))
      }
      totalRevenue += Number(data.totalAmount || 0)
    })

    productSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const category = data.categoryName || 'General'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const monthlySales = Array.from(monthlyMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }))

    res.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalOrders,
      totalRevenue,
      monthlySales,
      categoryBreakdown,
      lowStockProducts,
    })
  } catch (error) {
    console.error('Failed to load dashboard metrics:', error)
    res.status(500).json({ error: 'Unable to load dashboard metrics' })
  }
})

app.get('/notifications', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('notifications').orderBy('createdAt', 'desc').limit(100).get()
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json(notifications)
  } catch (error) {
    console.error('Failed to load notifications:', error)
    res.status(500).json({ error: 'Unable to load notifications' })
  }
})

app.post('/notifications', verifyFirebaseToken, async (req, res) => {
  const { title, message, type = 'info', fcmToken } = req.body
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' })
  }

  try {
    const docRef = await db.collection('notifications').add({
      title,
      message,
      type,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    const notification = { id: docRef.id, title, message, type, isRead: false }

    if (fcmToken) {
      try {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title,
            body: message,
          },
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' } },
        })
      } catch (sendError) {
        console.warn('FCM notification error:', sendError)
      }
    }

    res.status(201).json(notification)
  } catch (error) {
    console.error('Failed to create notification:', error)
    res.status(500).json({ error: 'Unable to save notification' })
  }
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

    const assistant = response.data?.choices?.[0]?.message?.content || ''
    await db.collection('aiInsights').add({
      insight: assistant,
      recommendation: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    res.json({ assistant })
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
