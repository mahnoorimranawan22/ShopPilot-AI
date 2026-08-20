'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import StatCard from "@/components/dashboard/StatCard"
import SectionCard from "@/components/dashboard/SectionCard"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, UsersIcon, TrendingUpIcon, ShieldCheckIcon, TicketPercentIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        setTimeout(() => {
            setData({
                revenue: { total: 95910, change: 14.2 },
                orders: { total: 1247, change: 9.8 },
                stores: { total: 24, pending: 3, approved: 21, change: 12.0 },
                users: { total: 1892, change: 18.5 },
                products: { total: 342, change: 7.3 },
                pendingApprovals: 3,
                activeCoupons: 5,
                conversion: { rate: 4.2, change: 0.8 },

                revenueByMonth: [
                    { month: 'Jan', revenue: 8200 },
                    { month: 'Feb', revenue: 7800 },
                    { month: 'Mar', revenue: 9500 },
                    { month: 'Apr', revenue: 8900 },
                    { month: 'May', revenue: 11200 },
                    { month: 'Jun', revenue: 10400 },
                    { month: 'Jul', revenue: 13800 },
                    { month: 'Aug', revenue: 12500 },
                    { month: 'Sep', revenue: 14200 },
                    { month: 'Oct', revenue: 15800 },
                ],

                ordersByStatus: [
                    { status: 'Placed', count: 145, color: '#94a3b8' },
                    { status: 'Processing', count: 89, color: '#f59e0b' },
                    { status: 'Shipped', count: 124, color: '#3b82f6' },
                    { status: 'Delivered', count: 847, color: '#10b981' },
                    { status: 'Cancelled', count: 42, color: '#ef4444' },
                ],

                recentStores: [
                    { name: 'TechZone', owner: 'Mike R.', status: 'pending', products: 0, date: '2h ago' },
                    { name: 'GadgetWorld', owner: 'Sara K.', status: 'approved', products: 24, date: '1d ago' },
                    { name: 'HomeEssentials', owner: 'Tom B.', status: 'pending', products: 0, date: '3d ago' },
                    { name: 'AudioPro', owner: 'Lisa M.', status: 'approved', products: 18, date: '5d ago' },
                ],

                recentOrders: [
                    { id: '#ORD-1247', customer: 'Jane C.', store: 'ShopPilot', total: 478.99, status: 'DELIVERED' },
                    { id: '#ORD-1246', customer: 'Alex M.', store: 'GadgetWorld', total: 199.00, status: 'SHIPPED' },
                    { id: '#ORD-1245', customer: 'Kristin W.', store: 'ShopPilot', total: 279.99, status: 'PROCESSING' },
                ],

                topStores: [
                    { name: 'ShopPilot AI Official', revenue: 45300, orders: 312, products: 12 },
                    { name: 'GadgetWorld', revenue: 28900, orders: 198, products: 24 },
                    { name: 'AudioPro', revenue: 18200, orders: 145, products: 18 },
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
    }
    const statusLabels = { DELIVERED: 'Delivered', SHIPPED: 'Shipped', PROCESSING: 'Processing', ORDER_PLACED: 'Placed' }

    return (
        <div className="text-slate-500 mb-28 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Platform overview and management.</p>
                </div>
                {data.pendingApprovals > 0 && (
                    <button onClick={() => router.push('/admin/approve')} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition">
                        <ShieldCheckIcon size={16} />
                        {data.pendingApprovals} pending approvals
                    </button>
                )}
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Revenue" value={`${currency}${data.revenue.total.toLocaleString()}`} change={data.revenue.change} icon={CircleDollarSignIcon} color="green" />
                <StatCard title="Total Orders" value={data.orders.total.toLocaleString()} change={data.orders.change} icon={TagsIcon} color="indigo" />
                <StatCard title="Total Stores" value={data.stores.total} change={data.stores.change} subtitle={`${data.stores.approved} active`} icon={StoreIcon} color="violet" />
                <StatCard title="Total Users" value={data.users.total.toLocaleString()} change={data.users.change} icon={UsersIcon} color="cyan" />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Products" value={data.products.total} change={data.products.change} icon={ShoppingBasketIcon} color="amber" />
                <StatCard title="Platform Conversion" value={`${data.conversion.rate}%`} change={data.conversion.change} icon={TrendingUpIcon} color="emerald" />
                <StatCard title="Pending Approvals" value={data.pendingApprovals} icon={ShieldCheckIcon} color="rose" />
                <StatCard title="Active Coupons" value={data.activeCoupons} icon={TicketPercentIcon} color="violet" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <SectionCard title="Revenue Trend" subtitle="Monthly platform revenue" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.revenueByMonth}>
                            <defs>
                                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#adminRevGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </SectionCard>

                {/* Orders by Status */}
                <SectionCard title="Orders by Status">
                    <div className="space-y-4 mt-2">
                        {data.ordersByStatus.map((s, i) => {
                            const max = Math.max(...data.ordersByStatus.map(x => x.count))
                            const pct = (s.count / max) * 100
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600">{s.status}</span>
                                        <span className="font-medium text-slate-700">{s.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </SectionCard>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Top Stores */}
                <SectionCard title="Top Stores" subtitle="By revenue" action={<button onClick={() => router.push('/admin/stores')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</button>}>
                    <div className="space-y-3">
                        {data.topStores.map((store, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{store.name}</p>
                                    <p className="text-xs text-slate-400">{store.orders} orders · {store.products} products</p>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{currency}{store.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Recent Orders */}
                <SectionCard title="Recent Orders" action={<button onClick={() => router.push('/admin/coupons')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">All orders →</button>}>
                    <div className="space-y-3">
                        {data.recentOrders.map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{order.id}</p>
                                    <p className="text-xs text-slate-400">{order.customer} · {order.store}</p>
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
            </div>

            {/* Pending Stores */}
            <SectionCard title="Recent Store Applications" action={<button onClick={() => router.push('/admin/approve')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Review all →</button>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-slate-500 uppercase">
                                <th className="pb-3">Store</th>
                                <th className="pb-3">Owner</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Products</th>
                                <th className="pb-3 text-right">Applied</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentStores.map((store, i) => (
                                <tr key={i} className="border-t border-slate-100">
                                    <td className="py-3 font-medium text-slate-700">{store.name}</td>
                                    <td className="py-3 text-slate-500">{store.owner}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${store.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {store.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-500">{store.products}</td>
                                    <td className="py-3 text-right text-slate-400 text-xs">{store.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}
