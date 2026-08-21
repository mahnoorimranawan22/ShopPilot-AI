'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { BarChart3Icon, TrendingUpIcon, DollarSignIcon, ShoppingBagIcon, StarIcon } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Demo chart data
const salesData = [
    { month: 'Jan', sales: 4200, orders: 45 },
    { month: 'Feb', sales: 3800, orders: 38 },
    { month: 'Mar', sales: 5100, orders: 52 },
    { month: 'Apr', sales: 4700, orders: 48 },
    { month: 'May', sales: 6200, orders: 63 },
    { month: 'Jun', sales: 5800, orders: 59 },
    { month: 'Jul', sales: 7400, orders: 75 },
    { month: 'Aug', sales: 8100, orders: 82 },
]

const categoryData = [
    { category: 'Headphones', revenue: 12400 },
    { category: 'Speakers', revenue: 8900 },
    { category: 'Watches', revenue: 7200 },
    { category: 'Earbuds', revenue: 15600 },
    { category: 'Mice', revenue: 5400 },
]

export default function StoreAnalytics() {

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [])

    if (loading) return <Loading />

    const stats = [
        { label: 'Total Revenue', value: '$45,300', change: '+12.5%', icon: DollarSignIcon, color: 'text-green-600 bg-green-50' },
        { label: 'Total Orders', value: '462', change: '+8.3%', icon: ShoppingBagIcon, color: 'text-orange-500 bg-orange-50' },
        { label: 'Avg. Order Value', value: '$98.05', change: '+3.2%', icon: TrendingUpIcon, color: 'text-rose-600 bg-rose-50' },
        { label: 'Avg. Rating', value: '4.6', change: '+0.1', icon: StarIcon, color: 'text-amber-600 bg-amber-50' },
    ]

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Store <span className="text-slate-800 font-medium">Analytics</span></h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Sales Over Time */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders Over Time */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Orders Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Category</h3>
                <div className="space-y-3">
                    {categoryData.map((cat, index) => {
                        const maxRevenue = Math.max(...categoryData.map(c => c.revenue))
                        const percentage = (cat.revenue / maxRevenue) * 100
                        return (
                            <div key={index} className="flex items-center gap-4">
                                <p className="text-sm text-slate-600 w-24 shrink-0">{cat.category}</p>
                                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                </div>
                                <p className="text-sm font-medium text-slate-700 w-16 text-right">${cat.revenue.toLocaleString()}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
