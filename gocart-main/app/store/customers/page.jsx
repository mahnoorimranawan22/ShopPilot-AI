'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { UsersIcon, MailIcon, ShoppingBagIcon } from "lucide-react"

const demoCustomers = [
    { id: 1, name: 'Jane Customer', email: 'buyer@shoppilot.ai', orders: 12, spent: '$1,240', lastOrder: '2025-08-20', image: null },
    { id: 2, name: 'Alex Morgan', email: 'alex@shoppilot.ai', orders: 8, spent: '$890', lastOrder: '2025-08-19', image: null },
    { id: 3, name: 'Kristin Watson', email: 'kristin@example.com', orders: 5, spent: '$520', lastOrder: '2025-08-18', image: null },
    { id: 4, name: 'Jenny Wilson', email: 'jenny@example.com', orders: 3, spent: '$340', lastOrder: '2025-08-15', image: null },
    { id: 5, name: 'Bessie Cooper', email: 'bessie@example.com', orders: 15, spent: '$2,100', lastOrder: '2025-08-20', image: null },
]

export default function StoreCustomers() {

    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([])

    useEffect(() => {
        setTimeout(() => {
            setCustomers(demoCustomers)
            setLoading(false)
        }, 500)
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Store <span className="text-slate-800 font-medium">Customers</span></h1>
            <p className="text-sm text-slate-400 mt-1">{customers.length} customers have purchased from your store</p>

            <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3 hidden md:table-cell">Email</th>
                            <th className="px-6 py-3 text-center">Orders</th>
                            <th className="px-6 py-3 text-right">Total Spent</th>
                            <th className="px-6 py-3 hidden md:table-cell text-right">Last Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                                            {customer.name[0]}
                                        </div>
                                        <p className="font-medium text-slate-700">{customer.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-slate-500">{customer.email}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                        <ShoppingBagIcon size={12} />
                                        {customer.orders}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-700">{customer.spent}</td>
                                <td className="px-6 py-4 hidden md:table-cell text-right text-slate-400 text-xs">{customer.lastOrder}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
