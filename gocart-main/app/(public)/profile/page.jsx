'use client'
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/features/user/userSlice"
import { UserIcon, PackageIcon, HeartIcon, MapPinIcon, LogOutIcon, ChevronRightIcon, MailIcon, ShieldIcon, LayoutDashboardIcon } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function Profile() {

    const router = useRouter()
    const dispatch = useDispatch()
    const { isLoggedIn, userData } = useSelector(state => state.user)
    const { items: wishlistItems } = useSelector(state => state.wishlist)

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Logged out successfully')
        router.push('/')
    }

    const roleLabels = {
        buyer: 'Customer',
        seller: 'Merchant',
        admin: 'Administrator',
    }

    const roleColors = {
        buyer: 'bg-slate-100 text-slate-600',
        seller: 'bg-orange-100 text-orange-600',
        admin: 'bg-amber-100 text-amber-700',
    }

    const menuItems = [
        { label: 'My Orders', description: 'Track and manage your orders', icon: PackageIcon, href: '/orders' },
        { label: 'My Wishlist', description: `${wishlistItems.length} saved items`, icon: HeartIcon, href: '/wishlist' },
        { label: 'Addresses', description: 'Manage delivery addresses', icon: MapPinIcon, href: '/checkout' },
    ]

    // Add role-specific menu items
    if (userData?.role === 'seller' || userData?.role === 'admin') {
        menuItems.push({
            label: 'Store Dashboard',
            description: 'Manage your store, products, and orders',
            icon: LayoutDashboardIcon,
            href: '/store',
        })
    }
    if (userData?.role === 'admin') {
        menuItems.push({
            label: 'Admin Dashboard',
            description: 'Manage users, stores, and platform settings',
            icon: ShieldIcon,
            href: '/admin',
        })
    }

    // Redirect to login if not logged in
    if (!isLoggedIn || !userData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-[70vh] mx-6 flex items-center justify-center">
                <div className="text-center">
                    <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-600">Sign in to view your profile</h2>
                    <p className="text-sm text-slate-400 mt-2">You need to be logged in to access this page</p>
                    <button
                        onClick={() => router.push('/login?redirect=/profile')}
                        className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition"
                    >
                        Sign In
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[70vh] mx-6">
            <div className="max-w-3xl mx-auto py-8">
                {/* Profile Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 overflow-hidden">
                            {userData.image ? (
                                <Image src={userData.image} alt="" width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={32} />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{userData.name}</h1>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roleColors[userData.role] || roleColors.buyer}`}>
                                    {roleLabels[userData.role] || userData.role}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <MailIcon size={14} />
                                <span>{userData.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-500">12</p>
                            <p className="text-xs text-slate-500 mt-1">Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-500">{wishlistItems.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Wishlist</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-500">3</p>
                            <p className="text-xs text-slate-500 mt-1">Reviews</p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 transition ${index < menuItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                <item.icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-700 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.description}</p>
                            </div>
                            <ChevronRightIcon size={16} className="text-slate-400 shrink-0" />
                        </button>
                    ))}
                </div>

                {/* Account Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-red-50 transition text-red-500"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <LogOutIcon size={20} />
                        </div>
                        <p className="font-medium text-sm">Sign Out</p>
                    </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-8">
                    ShopPilot AI · Smart Shopping, Powered by Intelligence
                </p>
            </div>
        </motion.div>
    )
}
