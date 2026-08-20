'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"
import { SearchIcon, ChevronDownIcon } from "lucide-react"

export default function AdminOrders() {
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => { setTimeout(() => { setOrders(orderDummyData); setLoading(false) }, 500) }, [])

    if (loading) return <Loading />

    const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const statusColors = {
        DELIVERED: 'bg-emerald-50 text-emerald-700',
        SHIPPED: 'bg-blue-50 text-blue-700',
        PROCESSING: 'bg-amber-50 text-amber-700',
        ORDER_PLACED: 'bg-slate-100 text-slate-600',
        CANCELLED: 'bg-red-50 text-red-700',
    }

    return (
        <div className="text-slate-500 mb-28 max-w-6xl">
            <h1 className="text-2xl mb-4">Platform <span className="text-slate-800 font-medium">Orders</span></h1>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                {['all', 'ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s === 'all' ? 'All' : s.replace('_', ' ')}
                    </button>
                ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Order</th>
                            <th className="px-5 py-3 text-left">Customer</th>
                            <th className="px-5 py-3 text-center">Items</th>
                            <th className="px-5 py-3 text-center">Total</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-5 py-3 font-medium text-slate-700">{order.id.slice(0, 12)}...</td>
                                <td className="px-5 py-3 text-slate-500">{order.user?.name || 'Customer'}</td>
                                <td className="px-5 py-3 text-center text-slate-500">{order.orderItems?.length || 0}</td>
                                <td className="px-5 py-3 text-center font-medium text-slate-700">{currency}{order.total}</td>
                                <td className="px-5 py-3 text-center">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {order.status?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
