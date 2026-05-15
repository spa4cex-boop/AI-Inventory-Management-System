"use client"

import { FormEvent, useEffect, useState } from 'react'
import api from '../../../services/api'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'

interface Product {
  id: number
  name: string
  sku: string
  quantity: number
  price: number
  reorder_level: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    reorder_level: 0,
  })
  const [editId, setEditId] = useState<number | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (err) {
      setError('Unable to load products. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setForm({ name: '', sku: '', quantity: 0, price: 0, reorder_level: 0 })
    setEditId(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editId) {
        const response = await api.put(`/products/${editId}`, {
          name: form.name,
          sku: form.sku,
          quantity: form.quantity,
          price: form.price,
          reorder_level: form.reorder_level,
        })
        setProducts((current) => current.map((item) => (item.id === response.data.id ? response.data : item)))
      } else {
        const response = await api.post('/products', {
          name: form.name,
          sku: form.sku,
          quantity: form.quantity,
          price: form.price,
          reorder_level: form.reorder_level,
        })
        setProducts((current) => [response.data, ...current])
      }
      resetForm()
    } catch (err) {
      setError('Unable to save product. Please verify the backend API is available.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      price: product.price,
      reorder_level: product.reorder_level,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/products/${id}`)
      setProducts((current) => current.filter((item) => item.id !== id))
      if (editId === id) resetForm()
    } catch (err) {
      setError('Unable to delete product. Please try again.')
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
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Products</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Manage inventory items</h1>
                </div>
              </div>
            </div>

            <Card title={editId ? 'Edit product' : 'Add product'}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Name"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(event) => setForm({ ...form, sku: event.target.value })}
                    placeholder="SKU"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
                    placeholder="Quantity"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                    placeholder="Price"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                  <input
                    type="number"
                    value={form.reorder_level}
                    onChange={(event) => setForm({ ...form, reorder_level: Number(event.target.value) })}
                    placeholder="Reorder level"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editId ? 'Update product' : 'Add product'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-3xl border border-white/10 px-5 py-3 text-sm text-slate-200 hover:bg-white/5"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
              {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
            </Card>

            <Card title="Product list">
              {loading && <p className="text-slate-400">Loading products…</p>}
              {!loading && products.length === 0 && <p className="text-slate-400">No products found. Add one to get started.</p>}
              {products.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 font-semibold text-white">Name</th>
                        <th className="px-4 py-3 font-semibold text-white">SKU</th>
                        <th className="px-4 py-3 font-semibold text-white">Qty</th>
                        <th className="px-4 py-3 font-semibold text-white">Price</th>
                        <th className="px-4 py-3 font-semibold text-white">Reorder</th>
                        <th className="px-4 py-3 font-semibold text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t border-white/10">
                          <td className="px-4 py-4">{product.name}</td>
                          <td className="px-4 py-4">{product.sku}</td>
                          <td className="px-4 py-4">{product.quantity}</td>
                          <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-4">{product.reorder_level}</td>
                          <td className="px-4 py-4 space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="rounded-2xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
