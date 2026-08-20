'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { productDummyData } from "@/assets/assets"
import { SearchIcon, Trash2Icon, EyeIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AdminProducts() {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        setTimeout(() => { setProducts(productDummyData); setLoading(false) }, 500)
    }, [])

    if (loading) return <Loading />

    const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())) : products
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className="text-slate-500 mb-28 max-w-6xl">
            <h1 className="text-2xl mb-4">Platform <span className="text-slate-800 font-medium">Products</span></h1>
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
                    <SearchIcon size={16} className="text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 text-sm outline-none" />
                </div>
                <span className="text-xs text-slate-400">{filtered.length} products</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Product</th>
                            <th className="px-5 py-3 hidden md:table-cell">Category</th>
                            <th className="px-5 py-3 hidden md:table-cell">Brand</th>
                            <th className="px-5 py-3 text-center">Price</th>
                            <th className="px-5 py-3 text-center">Stock</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            <Image src={p.images[0]} alt="" width={36} height={36} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-slate-700 truncate max-w-48">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 hidden md:table-cell text-slate-500">{p.category}</td>
                                <td className="px-5 py-3 hidden md:table-cell text-slate-500">{p.brand || '—'}</td>
                                <td className="px-5 py-3 text-center font-medium text-slate-700">{currency}{p.price}</td>
                                <td className="px-5 py-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${(p.stock ?? 50) < 10 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {p.stock ?? 50}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Link href={`/product/${p.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><EyeIcon size={15} /></Link>
                                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2Icon size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
