'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connectSocket, disconnectSocket, onSocket, getSocket } from '@/lib/socket'
import toast from 'react-hot-toast'
import { BellIcon } from 'lucide-react'

// Custom event for triggering notification badge updates
let notificationCallback = null
export const onNewNotification = (cb) => { notificationCallback = cb }
export const offNewNotification = () => { notificationCallback = null }

export default function SocketProvider({ children }) {
    const dispatch = useDispatch()
    const { isLoggedIn, userData } = useSelector(state => state.user)
    const connectedRef = useRef(false)

    const handleNotification = useCallback((data) => {
        if (notificationCallback) notificationCallback(data)
    }, [])

    useEffect(() => {
        if (isLoggedIn && userData && !connectedRef.current) {
            connectSocket(userData)
            connectedRef.current = true

            // ─── Order Events ───────────────────────────────
            const unsub1 = onSocket('order:created', (data) => {
                toast.success(
                    <div className="flex items-center gap-2">
                        <BellIcon size={16} className="text-orange-500" />
                        <div>
                            <p className="font-semibold text-sm">New Order {data.orderNumber}</p>
                            <p className="text-xs text-slate-500">${data.total} from {data.customer}</p>
                        </div>
                    </div>,
                    { duration: 6000, position: 'top-right' }
                )
                handleNotification({ type: 'order', ...data })
            })

            const unsub2 = onSocket('order:confirmed', (data) => {
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 text-lg">✓</span>
                        <div>
                            <p className="font-semibold text-sm">Order Confirmed!</p>
                            <p className="text-xs text-slate-500">{data.orderNumber} · ${data.total}</p>
                            <p className="text-xs text-orange-500">Est. delivery: {data.estimatedDelivery}</p>
                        </div>
                    </div>,
                    { duration: 5000, position: 'top-right' }
                )
                handleNotification({ type: 'order:confirmed', ...data })
            })

            const unsub3 = onSocket('order:statusChanged', (data) => {
                const statusColors = {
                    PROCESSING: 'text-blue-500',
                    SHIPPED: 'text-orange-500',
                    DELIVERED: 'text-green-500',
                    CANCELLED: 'text-red-500',
                }
                toast(
                    <div className="flex items-center gap-2">
                        <span className={`text-lg ${statusColors[data.status] || 'text-slate-500'}`}>📦</span>
                        <div>
                            <p className="font-semibold text-sm">Order {data.orderNumber}</p>
                            <p className="text-xs text-slate-500">{data.message || `Status: ${data.status?.replace('_', ' ')}`}</p>
                        </div>
                    </div>,
                    { duration: 5000, position: 'top-right' }
                )
                handleNotification({ type: 'order:statusChanged', ...data })
            })

            const unsub4 = onSocket('order:cancelled', (data) => {
                toast.error(
                    <div>
                        <p className="font-semibold text-sm">Order Cancelled</p>
                        <p className="text-xs text-slate-500">{data.orderNumber} by {data.customer}</p>
                    </div>,
                    { duration: 5000, position: 'top-right' }
                )
                handleNotification({ type: 'order:cancelled', ...data })
            })

            // ─── Inventory Events ────────────────────────────
            const unsub5 = onSocket('inventory:low', (data) => {
                toast.warning(
                    <div className="flex items-center gap-2">
                        <span className="text-amber-500">⚠️</span>
                        <div>
                            <p className="font-semibold text-sm">Low Stock Alert</p>
                            <p className="text-xs text-slate-500">{data.message}</p>
                        </div>
                    </div>,
                    { duration: 6000, position: 'top-right' }
                )
                handleNotification({ type: 'inventory', ...data })
            })

            // ─── Store Events ────────────────────────────────
            const unsub6 = onSocket('store:approved', (data) => {
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 text-lg">🎉</span>
                        <div>
                            <p className="font-semibold text-sm">Store Approved!</p>
                            <p className="text-xs text-slate-500">{data.message}</p>
                        </div>
                    </div>,
                    { duration: 6000, position: 'top-right' }
                )
                handleNotification({ type: 'store:approved', ...data })
            })

            // ─── Admin Events ────────────────────────────────
            const unsub7 = onSocket('admin:announcement', (data) => {
                toast(
                    <div className="flex items-center gap-2">
                        <span>📢</span>
                        <div>
                            <p className="font-semibold text-sm">{data.title}</p>
                            <p className="text-xs text-slate-500">{data.message}</p>
                        </div>
                    </div>,
                    { duration: 8000, position: 'top-right' }
                )
                handleNotification({ type: 'admin', ...data })
            })

            // ─── Chat Events ─────────────────────────────────
            const unsub8 = onSocket('chat:message', (data) => {
                // Only show toast if not in the chat room
                if (userData?.role === 'admin' || userData?.role === 'seller') {
                    toast(
                        <div className="flex items-center gap-2">
                            <span>💬</span>
                            <div>
                                <p className="font-semibold text-sm">New message from {data.senderName}</p>
                                <p className="text-xs text-slate-500 truncate max-w-48">{data.message}</p>
                            </div>
                        </div>,
                        { duration: 4000, position: 'top-right' }
                    )
                }
                handleNotification({ type: 'chat', ...data })
            })

            return () => {
                unsub1()
                unsub2()
                unsub3()
                unsub4()
                unsub5()
                unsub6()
                unsub7()
                unsub8()
            }
        }

        if (!isLoggedIn && connectedRef.current) {
            disconnectSocket()
            connectedRef.current = false
        }
    }, [isLoggedIn, userData, handleNotification])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectSocket()
            connectedRef.current = false
        }
    }, [])

    return children
}
