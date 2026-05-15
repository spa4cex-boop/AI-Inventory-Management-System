"use client"

import { useEffect, useState } from 'react'
import api from '../../../services/api'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
}

interface Order {
  id: number
  customer_name: string
  status: string
  total_amount: number
  order_items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (err) {
      setError('Unable to load orders. Please ensure the backend API is reachable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto py-10">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Sidebar />
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Orders</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Recent orders</h1>
                </div>
              </div>
            </div>

            <Card title="Orders list">
              {loading && <p className="text-slate-400">Loading orders…</p>}
              {error && <p className="rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
              {!loading && !error && orders.length === 0 && <p className="text-slate-400">No orders found yet.</p>}
              {orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">Order #{order.id}</p>
                          <p className="text-slate-400">{order.customer_name} — {order.status}</p>
                        </div>
                        <p className="text-sm text-slate-300">Total: ${order.total_amount.toFixed(2)}</p>
                      </div>
                      <div className="mt-3 text-slate-400">
                        <p className="font-semibold text-slate-200">Items:</p>
                        <ul className="list-disc space-y-1 pl-5">
                          {order.order_items.map((item) => (
                            <li key={item.id}>
                              Product {item.product_id} — {item.quantity} × ${item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
