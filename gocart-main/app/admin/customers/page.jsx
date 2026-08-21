'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { UsersIcon, SearchIcon, ShieldIcon, BanIcon, CheckCircleIcon } from "lucide-react"

const demoCustomers = [
    { id: 1, name: 'Jane Customer', email: 'buyer@shoppilot.ai', role: 'buyer', orders: 12, spent: '$1,240', joined: 'Jan 2025', active: true },
    { id: 2, name: 'Alex Morgan', email: 'alex@shoppilot.ai', role: 'buyer', orders: 8, spent: '$890', joined: 'Feb 2025', active: true },
    { id: 3, name: 'TechStore Owner', email: 'seller@shoppilot.ai', role: 'seller', orders: 0, spent: '—', joined: 'Jan 2025', active: true },
    { id: 4, name: 'Kristin Watson', email: 'kristin@example.com', role: 'buyer', orders: 5, spent: '$520', joined: 'Mar 2025', active: true },
    { id: 5, name: 'Jenny Wilson', email: 'jenny@example.com', role: 'buyer', orders: 3, spent: '$340', joined: 'Apr 2025', active: false },
    { id: 6, name: 'Bessie Cooper', email: 'bessie@example.com', role: 'buyer', orders: 15, spent: '$2,100', joined: 'Jan 2025', active: true },
    { id: 7, name: 'Admin User', email: 'admin@shoppilot.ai', role: 'admin', orders: 0, spent: '—', joined: 'Jan 2025', active: true },
]

export default function AdminCustomers() {
    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    useEffect(() => { setTimeout(() => { setCustomers(demoCustomers); setLoading(false) }, 500) }, [])

    if (loading) return <Loading />

    let filtered = search ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) : customers
    if (roleFilter !== 'all') filtered = filtered.filter(c => c.role === roleFilter)

    const roleColors = { buyer: 'bg-slate-100 text-slate-600', seller: 'bg-orange-100 text-orange-600', admin: 'bg-amber-100 text-amber-700' }

    return (
        <div className="text-slate-500 mb-28 max-w-6xl">
            <h1 className="text-2xl mb-4">Platform <span className="text-slate-800 font-medium">Customers</span></h1>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
                    <SearchIcon size={16} className="text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="flex-1 text-sm outline-none" />
                </div>
                {['all', 'buyer', 'seller', 'admin'].map(r => (
                    <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${roleFilter === r ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{r}</button>
                ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Customer</th>
                            <th className="px-5 py-3 text-left hidden md:table-cell">Email</th>
                            <th className="px-5 py-3 text-center">Role</th>
                            <th className="px-5 py-3 text-center">Orders</th>
                            <th className="px-5 py-3 text-center">Spent</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">{c.name[0]}</div>
                                        <span className="font-medium text-slate-700">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 hidden md:table-cell text-slate-500">{c.email}</td>
                                <td className="px-5 py-3 text-center"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColors[c.role]}`}>{c.role}</span></td>
                                <td className="px-5 py-3 text-center text-slate-600">{c.orders}</td>
                                <td className="px-5 py-3 text-center font-medium text-slate-700">{c.spent}</td>
                                <td className="px-5 py-3 text-center">
                                    {c.active ? <CheckCircleIcon size={16} className="text-green-500 mx-auto" /> : <BanIcon size={16} className="text-red-400 mx-auto" />}
                                </td>
                                <td className="px-5 py-3 text-right text-xs text-slate-400">{c.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
