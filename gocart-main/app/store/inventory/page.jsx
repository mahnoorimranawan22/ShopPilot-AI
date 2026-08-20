'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import InventoryIntelligence from "@/components/InventoryIntelligence"
import { PackageIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"
import { productDummyData } from "@/assets/assets"

export default function StoreInventory() {

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    useEffect(() => {
        // Simulate loading inventory with stock data
        const inventory = productDummyData.map((p, i) => ({
            ...p,
            stock: [45, 78, 120, 200, 95, 32, 25, 88, 18, 150, 60, 42][i] || 50,
            soldCount: [312, 245, 410, 789, 340, 180, 520, 410, 230, 350, 260, 190][i] || 0,
        }))
        setTimeout(() => {
            setProducts(inventory)
            setLoading(false)
        }, 500)
    }, [])

    if (loading) return <Loading />

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
    const lowStockProducts = products.filter(p => p.stock < 30)
    const outOfStock = products.filter(p => p.stock === 0)

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Inventory <span className="text-slate-800 font-medium">Management</span></h1>

            {/* AI Inventory Intelligence */}
            <div className="mt-6">
                <InventoryIntelligence />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                    <PackageIcon size={24} className="mx-auto text-indigo-500 mb-2" />
                    <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
                    <p className="text-xs text-slate-500">Total Units in Stock</p>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl p-5 text-center">
                    <AlertTriangleIcon size={24} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</p>
                    <p className="text-xs text-slate-500">Low Stock (&lt;30 units)</p>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-5 text-center">
                    <CheckCircleIcon size={24} className="mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-green-600">{products.length - outOfStock.length}</p>
                    <p className="text-xs text-slate-500">In Stock Products</p>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 hidden md:table-cell">Category</th>
                            <th className="px-6 py-3 text-center">Stock</th>
                            <th className="px-6 py-3 text-center">Sold</th>
                            <th className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-700">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.brand || '—'}</p>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-slate-500">{product.category}</td>
                                <td className="px-6 py-4 text-center font-medium">
                                    <span className={product.stock < 30 ? 'text-amber-600' : 'text-slate-700'}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-500">{product.soldCount}</td>
                                <td className="px-6 py-4 text-center">
                                    {product.stock === 0 ? (
                                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>
                                    ) : product.stock < 30 ? (
                                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Low Stock</span>
                                    ) : (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">In Stock</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
