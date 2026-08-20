'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react"
import OrderItem from "@/components/OrderItem"
import { orderDummyData } from "@/assets/assets"
import { ordersAPI } from "@/lib/api"
import { useSelector } from "react-redux"
import { PackageIcon } from "lucide-react"
import Link from "next/link"

export default function Orders() {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)

    useEffect(() => {
        const fetchOrders = async () => {
            if (isLoggedIn) {
                try {
                    const data = await ordersAPI.list()
                    setOrders(data || [])
                } catch {
                    // Fallback to demo data
                    setOrders(orderDummyData)
                }
            } else {
                setOrders(orderDummyData)
            }
            setLoading(false)
        }
        fetchOrders()
    }, [isLoggedIn])

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    return orders.length > 0 ? (
        <div className="min-h-[70vh] mx-6">
            <div className="my-20 max-w-7xl mx-auto">
                <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />
                <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                    <thead>
                        <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                            <th className="text-left">Product</th>
                            <th className="text-center">Total Price</th>
                            <th className="text-left">Address</th>
                            <th className="text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <OrderItem order={order} key={order._id || order.id} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
            <PackageIcon size={64} strokeWidth={1} className="text-slate-300" />
            <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
            <p className="text-sm">Start shopping to see your orders here</p>
            <Link href="/shop" className="bg-indigo-600 text-white px-8 py-2.5 rounded-full hover:bg-indigo-700 transition text-sm">
                Browse Products
            </Link>
        </div>
    )
}
