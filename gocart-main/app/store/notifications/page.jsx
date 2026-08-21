'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { BellIcon, ShoppingBagIcon, StarIcon, AlertTriangleIcon, CheckCircleIcon, PackageIcon } from "lucide-react"

const demoNotifications = [
    { id: 1, type: 'order', title: 'New order received', text: 'Order #ORD-1247 from Jane Customer — $478.99', time: '2 min ago', read: false, icon: ShoppingBagIcon, color: 'text-orange-500 bg-orange-50' },
    { id: 2, type: 'review', title: 'New 5★ review', text: 'Jane C. reviewed AirPods Pro — "Absolutely love this product!"', time: '1h ago', read: false, icon: StarIcon, color: 'text-amber-600 bg-amber-50' },
    { id: 3, type: 'order', title: 'Order shipped', text: 'Order #ORD-1246 has been marked as shipped', time: '2h ago', read: true, icon: CheckCircleIcon, color: 'text-green-600 bg-green-50' },
    { id: 4, type: 'stock', title: 'Low stock alert', text: 'Canon EOS R50 has only 18 units remaining', time: '5h ago', read: true, icon: AlertTriangleIcon, color: 'text-amber-600 bg-amber-50' },
    { id: 5, type: 'order', title: 'Order delivered', text: 'Order #ORD-1243 has been delivered to Jenny Wilson', time: '1d ago', read: true, icon: PackageIcon, color: 'text-green-600 bg-green-50' },
    { id: 6, type: 'review', title: 'New 4★ review', text: 'Alex M. reviewed Sony WH-1000XM5 — "Great headphones"', time: '1d ago', read: true, icon: StarIcon, color: 'text-amber-600 bg-amber-50' },
]

export default function StoreNotifications() {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        setTimeout(() => { setNotifications(demoNotifications); setLoading(false) }, 500)
    }, [])

    if (loading) return <Loading />

    const unread = notifications.filter(n => !n.read).length
    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter)

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    return (
        <div className="text-slate-500 mb-28 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl">Notifications</h1>
                    {unread > 0 && <p className="text-sm text-slate-400 mt-0.5">{unread} unread</p>}
                </div>
                {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Mark all read</button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'unread', 'order', 'review', 'stock'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Notifications */}
            <div className="space-y-2">
                {filtered.map(n => (
                    <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition hover:shadow-sm ${n.read ? 'bg-white border-slate-100' : 'bg-orange-50/30 border-orange-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                            <n.icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700">{n.title}</p>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{n.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-slate-400 py-12 text-sm">No notifications to show</p>
                )}
            </div>
        </div>
    )
}
