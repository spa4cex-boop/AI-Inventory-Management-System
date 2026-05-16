"use client"

import { useEffect, useState } from 'react'
import { fetchCategories, fetchProducts, fetchSuppliers, createProduct, createProductsBulk, updateProduct, deleteProduct } from '../../../services/api'
import { uploadProductImage } from '../../../services/firebaseStorage'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'
import type { Category, Product, Supplier } from '../../../types'

interface ProductFormState {
  name: string
  sku: string
  barcode: string
  price: number
  quantity: number
  reorderLevel: number
  categoryId: string
  categoryName: string
  supplierId: string
  supplierName: string
  expiryDate: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bulkCsv, setBulkCsv] = useState<string>('')
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    sku: '',
    barcode: '',
    price: 0,
    quantity: 0,
    reorderLevel: 0,
    categoryId: '',
    categoryName: '',
    supplierId: '',
    supplierName: '',
    expiryDate: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productData, categoryData, supplierData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSuppliers(),
        ])
        setProducts(productData)
        setCategories(categoryData)
        setSuppliers(supplierData)
      } catch {
        setError('Unable to load product data. Check your API connection.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      barcode: '',
      price: 0,
      quantity: 0,
      reorderLevel: 0,
      categoryId: '',
      categoryName: '',
      supplierId: '',
      supplierName: '',
      expiryDate: '',
    })
    setImageFile(null)
    setEditId(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl: string | undefined
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile)
      }

      const payload = {
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || undefined,
        price: form.price,
        quantity: form.quantity,
        reorderLevel: form.reorderLevel,
        categoryId: form.categoryId || undefined,
        categoryName: form.categoryName || undefined,
        supplierId: form.supplierId || undefined,
        supplierName: form.supplierName || undefined,
        expiryDate: form.expiryDate || undefined,
        imageUrl,
      }

      if (editId) {
        const updated = await updateProduct(editId, payload)
        setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      } else {
        const created = await createProduct(payload)
        setProducts((current) => [created, ...current])
      }

      resetForm()
    } catch {
      setError('Unable to save the product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? '',
      price: product.price,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      categoryId: product.categoryId ?? '',
      categoryName: product.categoryName ?? '',
      supplierId: product.supplierId ?? '',
      supplierName: product.supplierName ?? '',
      expiryDate: product.expiryDate ?? '',
    })
  }

  const handleBulkImport = async () => {
    setLoading(true)
    setError(null)

    try {
      const rows = bulkCsv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (rows.length === 0) {
        throw new Error('Enter at least one product row to import.')
      }

      const hasHeader = rows[0].toLowerCase().includes('name') && rows[0].toLowerCase().includes('sku')
      const dataRows = hasHeader ? rows.slice(1) : rows
      const productsToImport = dataRows.map((row) => {
        const columns = row.split(',').map((value) => value.trim())
        return {
          name: columns[0] || '',
          sku: columns[1] || '',
          quantity: Number(columns[2] || 0),
          price: Number(columns[3] || 0),
          reorderLevel: Number(columns[4] || 0),
          categoryName: columns[5] || undefined,
          supplierName: columns[6] || undefined,
          expiryDate: columns[7] || undefined,
        }
      })

      const invalidProduct = productsToImport.find((product) => !product.name || !product.sku)
      if (invalidProduct) {
        throw new Error('Each imported product must include at least a name and SKU.')
      }

      const created = await createProductsBulk(productsToImport)
      setProducts((current) => [...created, ...current])
      setBulkCsv('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to import products. Please check the CSV format.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      await deleteProduct(id)
      setProducts((current) => current.filter((item) => item.id !== id))
      if (editId === id) resetForm()
    } catch {
      setError('Unable to delete the product. Please try again.')
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
                    placeholder="Product Name"
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(event) => setForm({ ...form, barcode: event.target.value })}
                    placeholder="Barcode"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  />
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
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
                    placeholder="Price (PKR)"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                  <input
                    type="number"
                    value={form.reorderLevel}
                    onChange={(event) => setForm({ ...form, reorderLevel: Number(event.target.value) })}
                    placeholder="Reorder level"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    value={form.categoryId}
                    onChange={(event) => {
                      const selected = categories.find((category) => category.id === event.target.value)
                      setForm({
                        ...form,
                        categoryId: event.target.value,
                        categoryName: selected?.name ?? event.target.value,
                      })
                    }}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.supplierId}
                    onChange={(event) => {
                      const selected = suppliers.find((supplier) => supplier.id === event.target.value)
                      setForm({
                        ...form,
                        supplierId: event.target.value,
                        supplierName: selected?.name ?? event.target.value,
                      })
                    }}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="relative block rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-slate-300">
                    <span className="text-sm text-slate-400">Product image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                      className="mt-3 w-full text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:text-slate-950"
                    />
                  </label>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-400">
                    <p>Optional image upload for product cards and inventory management.</p>
                    <p className="mt-3 text-xs text-slate-500">Accepted formats: PNG, JPG, JPEG.</p>
                  </div>
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

            <Card title="Bulk import products">
              <p className="text-sm text-slate-400">
                Paste CSV rows with columns: <span className="font-semibold">name, sku, quantity, price (PKR), reorderLevel, categoryName, supplierName, expiryDate</span>
              </p>
              <textarea
                value={bulkCsv}
                onChange={(event) => setBulkCsv(event.target.value)}
                rows={8}
                className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                placeholder="Product A, SKU001, 10, 1250.00, 5, Electronics, Supplier A, 2025-12-31"
              />
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={loading}
                className="mt-4 rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Import bulk products
              </button>
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
                        <th className="px-4 py-3 font-semibold text-white">Category</th>
                        <th className="px-4 py-3 font-semibold text-white">Qty</th>
                        <th className="px-4 py-3 font-semibold text-white">Price</th>
                        <th className="px-4 py-3 font-semibold text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t border-white/10">
                          <td className="px-4 py-4">{product.name}</td>
                          <td className="px-4 py-4">{product.sku}</td>
                          <td className="px-4 py-4">{product.categoryName ?? 'General'}</td>
                          <td className="px-4 py-4">{product.quantity}</td>
                          <td className="px-4 py-4">PKR {product.price.toFixed(2)}</td>
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
