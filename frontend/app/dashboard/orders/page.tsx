"use client"

import { useEffect, useState } from 'react'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'
import { fetchOrders, fetchProducts, createOrder } from '../../../services/api'
import type { Order, Product } from '../../../types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [orderData, productData] = await Promise.all([fetchOrders(), fetchProducts()])
        setOrders(orderData)
        setProducts(productData)
      } catch {
        setError('Unable to load orders and products. Please check your backend connection.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProductId || quantity <= 0 || !customerName.trim()) {
      setError('Please select a product, quantity, and customer name.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const product = products.find((item) => item.id === selectedProductId)
      if (!product) {
        throw new Error('Selected product is invalid')
      }

      const newOrder = await createOrder({
        customerName,
        items: [{ productId: product.id, quantity, price: product.price }],
      })
      setOrders((current) => [newOrder, ...current])
      setCustomerName('')
      setSelectedProductId('')
      setQuantity(1)
    } catch {
      setError('Unable to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                  <h1 className="mt-3 text-3xl font-semibold text-white">Create and review orders</h1>
                </div>
              </div>
            </div>

            <Card title="Create new order">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Customer name"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    value={selectedProductId}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — ${product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    placeholder="Quantity"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Creating order…' : 'Create order'}
                </button>
              </form>
              {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
            </Card>

            <Card title="Order history">
              {loading && <p className="text-slate-400">Loading orders…</p>}
              {!loading && orders.length === 0 && <p className="text-slate-400">No recent orders available.</p>}
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-white">Order #{order.id}</p>
                        <p className="text-slate-400">{order.customerName}</p>
                      </div>
                      <p className="text-sm text-slate-300">${order.totalAmount.toFixed(2)} • {order.status}</p>
                    </div>
                    <div className="mt-3 text-slate-400">
                      <p className="font-semibold text-slate-200">Items</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {order.items?.map((item) => (
                          <li key={item.productId}>
                            {item.productName} — {item.quantity} × ${item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
