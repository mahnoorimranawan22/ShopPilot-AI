'use client'
import Link from "next/link"
import NotificationBadge from "@/components/NotificationBadge"
import { useSelector } from "react-redux"

const StoreNavbar = () => {
    const userData = useSelector(state => state.user.userData)

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-0">
                <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Shop</span>
                <span className="text-slate-700">Pilot</span>
                <span className="ml-1.5 text-xs font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md leading-none mt-1">AI</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-indigo-500">
                    Store
                </p>
            </Link>
            <div className="flex items-center gap-4">
                <NotificationBadge />
                <p className="text-sm text-slate-600">Hi, {userData?.name?.split(' ')[0] || 'Seller'}</p>
            </div>
        </div>
    )
}

export default StoreNavbar
