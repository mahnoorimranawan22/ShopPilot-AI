'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TruckIcon, ClockIcon, ShieldIcon, RotateCcwIcon, ZapIcon } from 'lucide-react'

export default function DeliveryEstimate({ stock = 10, category = '' }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const getDeliveryDate = () => {
        const delivery = new Date(now)
        delivery.setDate(delivery.getDate() + (stock > 0 ? 3 : 7))
        return delivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const getExpressDate = () => {
        const delivery = new Date(now)
        delivery.setDate(delivery.getDate() + 1)
        return delivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const urgencyLevel = stock === 0 ? 'out' : stock <= 3 ? 'critical' : stock <= 10 ? 'low' : 'normal'

    return (
        <div className="space-y-3">
            {/* Delivery options */}
            <div className="space-y-2">
                {/* Standard */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <TruckIcon size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">Free Delivery</p>
                        <p className="text-[11px] text-slate-500">Arrives by {getDeliveryDate()}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">FREE</span>
                </motion.div>

                {/* Express */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <ZapIcon size={16} className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">Express Delivery</p>
                        <p className="text-[11px] text-slate-500">Arrives by {getExpressDate()}</p>
                    </div>
                    <span className="text-xs font-bold text-orange-500">$9.99</span>
                </motion.div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldIcon size={13} className="text-slate-400" />
                    Secure checkout
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <RotateCcwIcon size={13} className="text-slate-400" />
                    30-day returns
                </div>
            </div>

            {/* Stock urgency */}
            {urgencyLevel !== 'normal' && urgencyLevel !== 'out' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl"
                >
                    <ClockIcon size={14} className="text-amber-500 shrink-0 animate-pulse" />
                    <p className="text-xs font-medium text-amber-700">
                        {stock <= 3
                            ? `Only ${stock} left in stock — order soon!`
                            : `Low stock — ${stock} units remaining`
                        }
                    </p>
                </motion.div>
            )}

            {urgencyLevel === 'out' && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-medium text-red-600">Currently out of stock. Notify me when available.</p>
                </div>
            )}
        </div>
    )
}
