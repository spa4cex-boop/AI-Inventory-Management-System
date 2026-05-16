/**
 * Netlify Functions - AI Inventory Management System API
 * Handles all backend operations with Firebase Firestore database
 * Complete API server for inventory, products, orders, and AI assistance
 */

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const admin = require('firebase-admin')
const serverless = require('serverless-http')

// ============ INITIALIZATION ============

const app = express()

// Middleware
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))

// Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat:free'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'mixtral-8x7b-32768'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

// Parse Firebase service account
let serviceAccount
try {
  serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
  if (!serviceAccount.project_id) {
    console.error('WARNING: Invalid Firebase service account configuration')
  }
} catch (error) {
  console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message)
}

// Initialize Firebase Admin SDK
if (!admin.apps.length && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })
}

const db = admin.apps.length > 0 ? admin.firestore() : null
const auth = admin.apps.length > 0 ? admin.auth() : null

// ============ MIDDLEWARE FUNCTIONS ============

/**
 * Get user role from decoded Firebase token
 */
function getUserRole(user) {
  if (!user) return 'staff'
  const customClaims = user.customClaims || {}
  return customClaims.role || user.role || 'staff'
}

/**
 * Role-based access control middleware
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: missing user' })
    }

    const userRole = getUserRole(user)
    const roleHierarchy = { staff: 1, manager: 2, admin: 3, owner: 4 }
    const userLevel = roleHierarchy[userRole] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: `Forbidden: ${requiredRole} role required, user has ${userRole}` 
      })
    }
    return next()
  }
}

/**
 * Firebase token verification middleware
 */
async function verifyFirebaseToken(req, res, next) {
  if (!auth) {
    return res.status(503).json({ error: 'Firebase not configured' })
  }

  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer\s+(.*)$/)
  
  if (!match) {
    return res.status(401).json({ error: 'Unauthorized: missing bearer token' })
  }

  const idToken = match[1]
  
  try {
    const decoded = await auth.verifyIdToken(idToken)
    req.user = decoded
    return next()
  } catch (error) {
    console.error('Firebase token verification failed:', error.message)
    return res.status(401).json({ error: 'Unauthorized: invalid token' })
  }
}

/**
 * Route prefix normalization for Netlify
 */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.path.substring(4) + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  }
  next()
})

// ============ HEALTH CHECK ============

app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AI Inventory Management System',
    provider: 'Netlify Functions',
    timestamp: new Date().toISOString()
  })
})

// ============ PRODUCTS ENDPOINTS ============

/**
 * GET /products - Get all products
 */
app.get('/products', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500)
    const snapshot = await db
      .collection('products')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }))

    res.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (error) {
    console.error('Failed to load products:', error)
    res.status(500).json({ error: 'Unable to load products' })
  }
})

/**
 * POST /products - Create new product
 */
app.post('/products', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: null,
    })

    const snapshot = await docRef.get()
    res.status(201).json({ 
      success: true,
      data: {
        id: docRef.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.() || null,
      }
    })
  } catch (error) {
    console.error('Failed to create product:', error)
    res.status(500).json({ error: 'Unable to create product' })
  }
})

/**
 * PUT /products/:id - Update product
 */
app.put('/products/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
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

    fields.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    fields.updatedBy = null

    await productRef.update(fields)
    const updated = await productRef.get()

    res.json({ 
      success: true,
      data: {
        id: updated.id,
        ...updated.data(),
        createdAt: updated.data().createdAt?.toDate?.() || null,
      }
    })
  } catch (error) {
    console.error('Failed to update product:', error)
    res.status(500).json({ error: 'Unable to update product' })
  }
})

/**
 * DELETE /products/:id - Delete product
 */
app.delete('/products/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  const productId = req.params.id

  try {
    const productRef = db.collection('products').doc(productId)
    const snapshot = await productRef.get()

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await productRef.delete()
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete product:', error)
    res.status(500).json({ error: 'Unable to delete product' })
  }
})

// ============ CATEGORIES ENDPOINTS ============

/**
 * GET /categories - Get all categories
 */
app.get('/categories', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const snapshot = await db.collection('categories').orderBy('name').get()
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }))
    res.json({ success: true, data: categories, count: categories.length })
  } catch (error) {
    console.error('Failed to load categories:', error)
    res.status(500).json({ error: 'Unable to load categories' })
  }
})

/**
 * POST /categories - Create category
 */
app.post('/categories', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  const { name } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const docRef = await db.collection('categories').add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: null,
    })
    const snapshot = await docRef.get()
    res.status(201).json({ 
      success: true,
      data: {
        id: docRef.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.() || null,
      }
    })
  } catch (error) {
    console.error('Failed to create category:', error)
    res.status(500).json({ error: 'Unable to create category' })
  }
})

// ============ SUPPLIERS ENDPOINTS ============

/**
 * GET /suppliers - Get all suppliers
 */
app.get('/suppliers', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const snapshot = await db.collection('suppliers').orderBy('name').get()
    const suppliers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }))
    res.json({ success: true, data: suppliers, count: suppliers.length })
  } catch (error) {
    console.error('Failed to load suppliers:', error)
    res.status(500).json({ error: 'Unable to load suppliers' })
  }
})

/**
 * POST /suppliers - Create supplier
 */
app.post('/suppliers', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
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
      rating: 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: null,
    })
    const snapshot = await docRef.get()
    res.status(201).json({ 
      success: true,
      data: {
        id: docRef.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.() || null,
      }
    })
  } catch (error) {
    console.error('Failed to create supplier:', error)
    res.status(500).json({ error: 'Unable to create supplier' })
  }
})

// ============ ORDERS ENDPOINTS ============

/**
 * GET /orders - Get all orders with items
 */
app.get('/orders', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
    const orders = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const itemsSnapshot = await db.collection('orderItems').where('orderId', '==', doc.id).get()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          items: itemsSnapshot.docs.map((itemDoc) => ({
            id: itemDoc.id,
            ...itemDoc.data(),
            createdAt: itemDoc.data().createdAt?.toDate?.() || null,
          })),
        }
      })
    )
    res.json({ success: true, data: orders, count: orders.length })
  } catch (error) {
    console.error('Failed to load orders:', error)
    res.status(500).json({ error: 'Unable to load orders' })
  }
})

/**
 * POST /orders - Create order
 */
app.post('/orders', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  const { customerName, items = [], status = 'pending' } = req.body
  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer name and at least one item are required' })
  }

  try {
    const orderRef = db.collection('orders').doc()
    const batch = db.batch()
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)

    batch.set(orderRef, {
      customerName,
      totalAmount,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: null,
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
    res.status(201).json({ 
      success: true,
      data: {
        id: createdOrder.id,
        ...createdOrder.data(),
        createdAt: createdOrder.data().createdAt?.toDate?.() || null,
      }
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    res.status(500).json({ error: 'Unable to create order' })
  }
})

// ============ INVENTORY ENDPOINTS ============

/**
 * GET /inventory/low-stock - Get low stock products
 */
app.get('/inventory/low-stock', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const snapshot = await db.collection('products').get()
    const products = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => {
        const quantity = Number(product.quantity || 0)
        const reorderLevel = Number(product.reorderLevel || 0)
        return quantity <= reorderLevel
      })
    res.json({ success: true, data: products, count: products.length })
  } catch (error) {
    console.error('Failed to load low-stock products:', error)
    res.status(500).json({ error: 'Unable to load low-stock products' })
  }
})

// ============ REPORTS ENDPOINTS ============

/**
 * GET /reports/dashboard - Get dashboard metrics
 */
app.get('/reports/dashboard', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const [productSnapshot, orderSnapshot] = await Promise.all([
      db.collection('products').get(),
      db.collection('orders').get(),
    ])

    const lowStockProducts = productSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => {
        const quantity = Number(product.quantity || 0)
        const reorderLevel = Number(product.reorderLevel || 0)
        return quantity <= reorderLevel
      })

    const totalProducts = productSnapshot.size
    const totalOrders = orderSnapshot.size
    let totalRevenue = 0
    const monthlyMap = new Map()
    const categoryMap = new Map()

    orderSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const createdAt = data.createdAt?.toDate?.() || null
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
      success: true,
      data: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalOrders,
        totalRevenue,
        monthlySales,
        categoryBreakdown,
        lowStockProducts: lowStockProducts.slice(0, 10),
      }
    })
  } catch (error) {
    console.error('Failed to load dashboard metrics:', error)
    res.status(500).json({ error: 'Unable to load dashboard metrics' })
  }
})

// ============ NOTIFICATIONS ENDPOINTS ============

/**
 * GET /notifications - Get notifications
 */
app.get('/notifications', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  try {
    const snapshot = await db.collection('notifications').orderBy('createdAt', 'desc').limit(100).get()
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }))
    res.json({ success: true, data: notifications, count: notifications.length })
  } catch (error) {
    console.error('Failed to load notifications:', error)
    res.status(500).json({ error: 'Unable to load notifications' })
  }
})

/**
 * POST /notifications - Create notification
 */
app.post('/notifications', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  const { title, message, type = 'info' } = req.body
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
      createdBy: null,
    })
    const notification = { 
      id: docRef.id, 
      title, 
      message, 
      type, 
      isRead: false,
      createdAt: new Date().toISOString()
    }
    res.status(201).json({ success: true, data: notification })
  } catch (error) {
    console.error('Failed to create notification:', error)
    res.status(500).json({ error: 'Unable to save notification' })
  }
})

// ============ AI ASSISTANT ENDPOINTS ============

/**
 * POST /ai/assist - Get AI assistance
 * Supports: OpenRouter, Groq (free), HuggingFace, or fallback mock response
 */
app.post('/ai/assist', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not available' })
  
  const { prompt } = req.body
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const systemPrompt = 'You are an inventory assistant for a SaaS inventory management platform. Provide stock recommendations, order guidance, and product insights. Use plain text responses.'

  try {
    let assistant = null

    // Try OpenRouter first
    if (OPENROUTER_API_KEY && !OPENROUTER_API_KEY.startsWith('sk-or-v1-test')) {
      try {
        console.log('Attempting OpenRouter API...')
        const response = await axios.post(
          OPENROUTER_URL,
          {
            model: OPENROUTER_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
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
            timeout: 10000,
          }
        )
        assistant = response.data?.choices?.[0]?.message?.content || ''
      } catch (error) {
        console.warn('OpenRouter failed:', error.message)
      }
    }

    // Try Groq (free tier - no payment required)
    if (!assistant && GROQ_API_KEY) {
      try {
        console.log('Attempting Groq API (free)...')
        const response = await axios.post(
          GROQ_URL,
          {
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 800,
          },
          {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        )
        assistant = response.data?.choices?.[0]?.message?.content || ''
      } catch (error) {
        console.warn('Groq failed:', error.message)
      }
    }

    // Try HuggingFace
    if (!assistant && HUGGINGFACE_API_KEY) {
      try {
        console.log('Attempting HuggingFace API...')
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
          { inputs: `${systemPrompt}\n\nUser: ${prompt}` },
          {
            headers: {
              Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            },
            timeout: 10000,
          }
        )
        assistant = response.data?.[0]?.generated_text || ''
      } catch (error) {
        console.warn('HuggingFace failed:', error.message)
      }
    }

    // Fallback: generate mock response based on prompt
    if (!assistant) {
      console.log('Using fallback mock response')
      const keywords = prompt.toLowerCase()
      if (keywords.includes('low stock') || keywords.includes('reorder')) {
        assistant = 'Based on your inventory analysis, we recommend reordering these items:\n\n- Check products below reorder level\n- Prioritize high-velocity items\n- Negotiate bulk discounts with suppliers\n- Set up automated reorder alerts'
      } else if (keywords.includes('supplier') || keywords.includes('vendor')) {
        assistant = 'Supplier management recommendations:\n\n- Compare pricing across suppliers\n- Evaluate delivery times\n- Track supplier performance metrics\n- Negotiate payment terms for better cash flow'
      } else if (keywords.includes('category') || keywords.includes('product')) {
        assistant = 'Product category insights:\n\n- Identify top-selling categories\n- Analyze seasonal trends\n- Optimize inventory by category\n- Review pricing strategy per category'
      } else if (keywords.includes('forecast') || keywords.includes('predict')) {
        assistant = 'Inventory forecasting insights:\n\n- Analyze historical sales trends\n- Account for seasonal variations\n- Use ABC analysis for better planning\n- Set optimal safety stock levels'
      } else {
        assistant = `Inventory Assistant Response:\n\nRegarding your inquiry about ${prompt.substring(0, 30)}...\n\n- Review current inventory levels\n- Analyze sales trends\n- Optimize stock allocation\n- Monitor supplier performance\n\nFor more precise recommendations, please connect an AI API key (Groq free tier recommended).`
      }
    }

    // Save insight to database
    if (db && assistant) {
      try {
        await db.collection('aiInsights').add({
          insight: assistant,
          prompt,
          apiUsed: OPENROUTER_API_KEY ? 'openrouter' : (GROQ_API_KEY ? 'groq' : (HUGGINGFACE_API_KEY ? 'huggingface' : 'fallback')),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: null,
        })
      } catch (dbError) {
        console.warn('Failed to save AI insight:', dbError.message)
      }
    }

    res.json({ success: true, data: { assistant } })
  } catch (error) {
    console.error('AI assistant error:', error.message)
    res.status(500).json({ 
      error: 'AI service temporarily unavailable',
      message: 'Using fallback response. Configure GROQ_API_KEY for free AI access.'
    })
  }
})

// ============ ERROR HANDLING ============

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// ============ EXPORT ============

module.exports.handler = serverless(app)
