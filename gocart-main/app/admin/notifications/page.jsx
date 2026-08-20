'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { BellIcon, StoreIcon, ShoppingBagIcon, ShieldCheckIcon, AlertTriangleIcon, UsersIcon } from "lucide-react"

const demoNotifications = [
    { id: 1, type: 'store', title: 'New store application', text: 'TechZone by Mike R. applied to become a seller', time: '2h ago', read: false, icon: StoreIcon, color: 'text-indigo-600 bg-indigo-50' },
    { id: 2, type: 'store', title: 'New store application', text: 'HomeEssentials by Tom B. applied to become a seller', time: '3d ago', read: false, icon: StoreIcon, color: 'text-indigo-600 bg-indigo-50' },
    { id: 3, type: 'order', title: 'High-value order', text: 'Order #ORD-1245 — $1,240 from Bessie Cooper', time: '5h ago', read: true, icon: ShoppingBagIcon, color: 'text-green-600 bg-green-50' },
    { id: 4, type: 'alert', title: 'System alert', text: '3 stores pending approval review', time: '1d ago', read: true, icon: ShieldCheckIcon, color: 'text-amber-600 bg-amber-50' },
    { id: 5, type: 'user', title: 'New user registration', text: '15 new users joined in the last 24 hours', time: '1d ago', read: true, icon: UsersIcon, color: 'text-cyan-600 bg-cyan-50' },
]

export default function AdminNotifications() {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState([])

    useEffect(() => { setTimeout(() => { setNotifications(demoNotifications); setLoading(false) }, 500) }, [])

    if (loading) return <Loading />
    const unread = notifications.filter(n => !n.read).length

    return (
        <div className="text-slate-500 mb-28 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl">Notifications</h1>
                    {unread > 0 && <p className="text-sm text-slate-400">{unread} unread</p>}
                </div>
                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
            </div>
            <div className="space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition hover:shadow-sm ${n.read ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}><n.icon size={18} /></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700">{n.title}</p>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{n.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
