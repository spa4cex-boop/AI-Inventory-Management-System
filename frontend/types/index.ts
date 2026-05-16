export interface MetricCard {
  title: string
  value: string
  delta: string
}

export interface ChartPoint {
  name: string
  value: number
}

export interface ProductSummary {
  id: number
  name: string
  quantity: number
  reorder_level: number
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  quantity: number
  reorderLevel: number
  categoryId?: string
  categoryName?: string
  supplierId?: string
  supplierName?: string
  expiryDate?: string
  imageUrl?: string
  createdAt?: string
}

export interface OrderItem {
  id: string
  orderId?: string
  productId: string
  productName?: string | null
  quantity: number
  price: number
  createdAt?: string
}

export interface Order {
  id: string
  customerName: string
  status: string
  totalAmount: number
  createdAt?: string
  items: OrderItem[]
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead?: boolean
  createdAt?: string
}

export interface DashboardSummary {
  totalProducts: number
  lowStockCount: number
  totalOrders: number
  totalRevenue: number
  monthlySales: Array<{ month: string; revenue: number }>
  categoryBreakdown: Array<{ category: string; count: number }>
  lowStockProducts: Product[]
}

export interface AIResponse {
  assistant: string
}
