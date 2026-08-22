'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import StatCard from "@/components/dashboard/StatCard"
import SectionCard from "@/components/dashboard/SectionCard"
import Sparkline from "@/components/dashboard/Sparkline"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, UsersIcon, TrendingUpIcon, EyeIcon, ShoppingCartIcon } from "lucide-react"
import LiveOrderFeed from "@/components/dashboard/LiveOrderFeed"
import BusinessInsight from "@/components/BusinessInsight"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        // Simulate API fetch — replace with real API call when backend is connected
        setTimeout(() => {
            setData({
                revenue: { total: 45300, change: 12.5, trend: [3200, 3800, 4200, 3900, 5100, 4700, 6200, 5800, 7400, 8100, 7600, 8900] },
                orders: { total: 462, change: 8.3, trend: [32, 38, 42, 39, 52, 48, 63, 59, 75, 82, 78, 89] },
                customers: { total: 312, change: 15.2, trend: [20, 25, 28, 22, 35, 30, 42, 38, 50, 55, 48, 62] },
                products: { total: 48, change: 5.1 },
                conversion: { rate: 3.8, change: 0.5 },
                avgOrderValue: { value: 98.05, change: 3.2 },
                pageViews: { total: 24500, change: 18.7 },
                viewToCart: { rate: 28.4, change: 2.1 },

                // Revenue by month chart
                revenueByMonth: [
                    { month: 'Jan', revenue: 4200, orders: 45 },
                    { month: 'Feb', revenue: 3800, orders: 38 },
                    { month: 'Mar', revenue: 5100, orders: 52 },
                    { month: 'Apr', revenue: 4700, orders: 48 },
                    { month: 'May', revenue: 6200, orders: 63 },
                    { month: 'Jun', revenue: 5800, orders: 59 },
                    { month: 'Jul', revenue: 7400, orders: 75 },
                    { month: 'Aug', revenue: 8100, orders: 82 },
                    { month: 'Sep', revenue: 7600, orders: 78 },
                    { month: 'Oct', revenue: 8900, orders: 89 },
                ],

                // Top products
                topProducts: [
                    { name: 'AirPods Pro', sold: 89, revenue: 17711, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&q=80&w=100' },
                    { name: 'Sony WH-1000XM5', sold: 67, revenue: 18759, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100' },
                    { name: 'Casio G-Shock', sold: 54, revenue: 3779, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100' },
                    { name: 'Dyson V15', sold: 23, revenue: 13799, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=100' },
                    { name: 'MX Master 3S', sold: 41, revenue: 3279, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=100' },
                ],

                // Recent orders
                recentOrders: [
                    { id: '#ORD-1247', customer: 'Jane Customer', total: 478.99, status: 'DELIVERED', time: '2 min ago' },
                    { id: '#ORD-1246', customer: 'Alex Morgan', total: 199.00, status: 'SHIPPED', time: '15 min ago' },
                    { id: '#ORD-1245', customer: 'Kristin Watson', total: 279.99, status: 'PROCESSING', time: '1 hour ago' },
                    { id: '#ORD-1244', customer: 'Bessie Cooper', total: 529.99, status: 'ORDER_PLACED', time: '2 hours ago' },
                    { id: '#ORD-1243', customer: 'Jenny Wilson', total: 139.95, status: 'DELIVERED', time: '3 hours ago' },
                ],

                // Reviews
                recentReviews: [
                    { user: 'Jane C.', rating: 5, product: 'AirPods Pro', text: 'Absolutely love these! Best purchase this year.', time: '1h ago' },
                    { user: 'Alex M.', rating: 4, product: 'Sony WH-1000XM5', text: 'Great noise cancellation, comfortable fit.', time: '3h ago' },
                    { user: 'Bessie C.', rating: 5, product: 'Casio G-Shock', text: 'Exactly what I expected. Premium build quality.', time: '5h ago' },
                ],

                // Category breakdown
                categoryBreakdown: [
                    { name: 'Earbuds', value: 35, color: '#f97316' },
                    { name: 'Headphones', value: 25, color: '#f43f5e' },
                    { name: 'Watches', value: 20, color: '#06b6d4' },
                    { name: 'Home', value: 12, color: '#10b981' },
                    { name: 'Other', value: 8, color: '#94a3b8' },
                ],
            })
            setLoading(false)
        }, 600)
    }, [])

    if (loading) return <Loading />

    const statusColors = {
        DELIVERED: 'bg-emerald-50 text-emerald-700',
        SHIPPED: 'bg-blue-50 text-blue-700',
        PROCESSING: 'bg-amber-50 text-amber-700',
        ORDER_PLACED: 'bg-slate-100 text-slate-600',
        CANCELLED: 'bg-red-50 text-red-700',
    }

    const statusLabels = {
        DELIVERED: 'Delivered',
        SHIPPED: 'Shipped',
        PROCESSING: 'Processing',
        ORDER_PLACED: 'Placed',
        CANCELLED: 'Cancelled',
    }

    return (
        <div className="text-slate-500 mb-28 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Welcome back! Here's your store overview.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-medium">Last 30 days</span>
                </div>
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Revenue" value={`${currency}${data.revenue.total.toLocaleString()}`} change={data.revenue.change} changeLabel="vs last month" icon={CircleDollarSignIcon} color="green" sparkData={data.revenue.trend} />
                <StatCard title="Total Orders" value={data.orders.total} change={data.orders.change} changeLabel="vs last month" icon={TagsIcon} color="indigo" sparkData={data.orders.trend} />
                <StatCard title="Total Customers" value={data.customers.total} change={data.customers.change} changeLabel="vs last month" icon={UsersIcon} color="violet" sparkData={data.customers.trend} />
                <StatCard title="Total Products" value={data.products.total} change={data.products.change} changeLabel="vs last month" icon={ShoppingBasketIcon} color="amber" />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Conversion Rate" value={`${data.conversion.rate}%`} change={data.conversion.change} icon={TrendingUpIcon} color="emerald" />
                <StatCard title="Avg. Order Value" value={`${currency}${data.avgOrderValue.value}`} change={data.avgOrderValue.change} icon={ShoppingCartIcon} color="cyan" />
                <StatCard title="Page Views" value={data.pageViews.total.toLocaleString()} change={data.pageViews.change} icon={EyeIcon} color="indigo" />
                <StatCard title="View → Cart" value={`${data.viewToCart.rate}%`} change={data.viewToCart.change} icon={ShoppingCartIcon} color="violet" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Revenue Chart */}
                <SectionCard title="Revenue Trend" subtitle="Monthly revenue" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.revenueByMonth}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </SectionCard>

                {/* Category Breakdown */}
                <SectionCard title="Sales by Category" subtitle="Product distribution">
                    <div className="flex items-center justify-center mb-4">
                        <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                                <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                                    {data.categoryBreakdown.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        {data.categoryBreakdown.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                                    <span className="text-slate-600">{cat.name}</span>
                                </div>
                                <span className="font-medium text-slate-700">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* AI Business Intelligence */}
            <div className="mb-6">
                <BusinessInsight />
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Recent Orders */}
                <SectionCard title="Recent Orders" action={<button onClick={() => router.push('/store/orders')} className="text-xs text-orange-500 hover:text-orange-600 font-medium">View all →</button>}>
                    <div className="space-y-3">
                        {data.recentOrders.map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{order.id}</p>
                                    <p className="text-xs text-slate-400">{order.customer} · {order.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-700">{currency}{order.total}</p>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Top Products */}
                <SectionCard title="Top Products" subtitle="By units sold" action={<button onClick={() => router.push('/store/manage-product')} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Manage →</button>}>
                    <div className="space-y-3">
                        {data.topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0">
                                    <Image src={product.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.sold} sold</p>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{currency}{product.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Live Order Feed */}
            <div className="mb-6">
                <LiveOrderFeed />
            </div>

            {/* Recent Reviews */}
            <SectionCard title="Recent Reviews" subtitle="Latest customer feedback" action={<button onClick={() => router.push('/store/reviews')} className="text-xs text-orange-500 hover:text-orange-600 font-medium">View all →</button>}>
                <div className="space-y-3">
                    {data.recentReviews.map((review, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {review.user[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-700">{review.user}</p>
                                    <div className="flex">
                                        {Array(5).fill('').map((_, j) => (
                                            <StarIcon key={j} size={12} fill={j < review.rating ? "#f97316" : "#D1D5DB"} className="text-transparent" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400">{review.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{review.product}</p>
                                <p className="text-sm text-slate-600 mt-1">{review.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    )
}
