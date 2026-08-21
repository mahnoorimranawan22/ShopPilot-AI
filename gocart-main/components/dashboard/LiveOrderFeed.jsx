'use client'
import { useState, useEffect } from 'react'
import { onSocket } from '@/lib/socket'
import { ShoppingBagIcon, PackageIcon, XCircleIcon, BellIcon } from 'lucide-react'

export default function LiveOrderFeed({ storeId }) {
    const [orders, setOrders] = useState([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const unsub1 = onSocket('order:created', (data) => {
            setOrders(prev => [{
                id: data.orderId,
                type: 'new',
                icon: ShoppingBagIcon,
                color: 'text-orange-500 bg-orange-50',
                title: `New Order ${data.orderNumber}`,
                subtitle: `$${data.total} from ${data.customer}`,
                items: data.items,
                time: 'Just now',
                timestamp: data.timestamp,
            }, ...prev].slice(0, 20))
        })

        const unsub2 = onSocket('order:statusChanged', (data) => {
            setOrders(prev => [{
                id: data.orderId + Date.now(),
                type: 'status',
                icon: PackageIcon,
                color: 'text-blue-600 bg-blue-50',
                title: `Order ${data.orderNumber}`,
                subtitle: `Status: ${data.status?.replace('_', ' ')}`,
                time: 'Just now',
                timestamp: data.timestamp,
            }, ...prev].slice(0, 20))
        })

        const unsub3 = onSocket('order:cancelled', (data) => {
            setOrders(prev => [{
                id: data.orderId + Date.now(),
                type: 'cancelled',
                icon: XCircleIcon,
                color: 'text-red-600 bg-red-50',
                title: `Order Cancelled ${data.orderNumber}`,
                subtitle: data.customer ? `by ${data.customer}` : '',
                time: 'Just now',
                timestamp: data.timestamp,
            }, ...prev].slice(0, 20))
        })

        const unsub4 = onSocket('inventory:low', (data) => {
            setOrders(prev => [{
                id: 'low-' + Date.now(),
                type: 'inventory',
                icon: BellIcon,
                color: 'text-amber-600 bg-amber-50',
                title: 'Low Stock Alert',
                subtitle: data.message,
                time: 'Just now',
                timestamp: data.timestamp,
            }, ...prev].slice(0, 20))
        })

        setConnected(true)

        return () => {
            unsub1()
            unsub2()
            unsub3()
            unsub4()
        }
    }, [])

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">Live Feed</h3>
                    <span className="flex items-center gap-1 text-[10px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {connected ? 'Live' : 'Offline'}
                    </span>
                </div>
                <span className="text-xs text-slate-400">{orders.length} events</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <BellIcon size={24} className="mx-auto mb-2 text-slate-300" />
                        Waiting for real-time events...
                        <p className="text-xs mt-1">New orders and updates will appear here instantly</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {orders.map((order, i) => (
                            <div key={order.id + i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${order.color}`}>
                                    <order.icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700">{order.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{order.subtitle}</p>
                                    {order.items && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {order.items.slice(0, 3).map((item, j) => (
                                                <span key={j} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                    {item.name} ×{item.quantity}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && (
                                                <span className="text-[10px] text-slate-400">+{order.items.length - 3} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0">{order.time}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
