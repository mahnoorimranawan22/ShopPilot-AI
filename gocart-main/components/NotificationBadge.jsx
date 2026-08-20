'use client'
import { useState, useEffect } from 'react'
import { BellIcon } from 'lucide-react'
import { onSocket } from '@/lib/socket'

export default function NotificationBadge({ className = '' }) {
    const [count, setCount] = useState(0)
    const [recent, setRecent] = useState([])

    useEffect(() => {
        const unsub1 = onSocket('order:created', (data) => {
            setCount(prev => prev + 1)
            setRecent(prev => [{ type: 'order', text: `New order ${data.orderNumber}`, time: 'now' }, ...prev].slice(0, 5))
        })

        const unsub2 = onSocket('order:statusChanged', (data) => {
            setCount(prev => prev + 1)
            setRecent(prev => [{ type: 'status', text: `${data.orderNumber}: ${data.status}`, time: 'now' }, ...prev].slice(0, 5))
        })

        const unsub3 = onSocket('inventory:low', (data) => {
            setCount(prev => prev + 1)
            setRecent(prev => [{ type: 'alert', text: data.message, time: 'now' }, ...prev].slice(0, 5))
        })

        const unsub4 = onSocket('store:approved', (data) => {
            setCount(prev => prev + 1)
            setRecent(prev => [{ type: 'store', text: data.message, time: 'now' }, ...prev].slice(0, 5))
        })

        return () => { unsub1(); unsub2(); unsub3(); unsub4() }
    }, [])

    const clearCount = () => setCount(0)

    return (
        <div className={`relative inline-flex ${className}`} onClick={clearCount}>
            <BellIcon size={20} className="text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center animate-bounce">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </div>
    )
}
