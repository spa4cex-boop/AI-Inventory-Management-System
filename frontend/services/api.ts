import axios, { type AxiosInstance } from 'axios'
import type {
  Category,
  DashboardSummary,
  Notification,
  Order,
  Product,
  Supplier,
  AIResponse,
} from '../types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  throw new Error(
    'Missing NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL environment variable. Cloud deployment requires an API URL.'
  )
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>('/reports/dashboard')
  return response.data
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products')
  return response.data
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const response = await api.post<Product>('/products', payload)
  return response.data
}

export async function createProductsBulk(payload: Partial<Product>[]): Promise<Product[]> {
  const response = await api.post<Product[]>('/products/bulk', payload)
  return response.data
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, payload)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await api.get<Supplier[]>('/suppliers')
  return response.data
}

export async function createSupplier(payload: Partial<Supplier>): Promise<Supplier> {
  const response = await api.post<Supplier>('/suppliers', payload)
  return response.data
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders')
  return response.data
}

export async function createOrder(payload: {
  customerName: string
  items: Array<{ productId: string; quantity: number; price: number }>
  status?: string
}): Promise<Order> {
  const response = await api.post<Order>('/orders', payload)
  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories')
  return response.data
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>('/notifications')
  return response.data
}

export async function sendNotification(payload: {
  title: string
  message: string
  type?: string
  fcmToken?: string
}): Promise<Notification> {
  const response = await api.post<Notification>('/notifications', payload)
  return response.data
}

export async function sendAIMessage(prompt: string): Promise<AIResponse> {
  const response = await api.post<AIResponse>('/ai/assist', { prompt })
  return response.data
}

export async function fetchLowStockProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/inventory/low-stock')
  return response.data
}
