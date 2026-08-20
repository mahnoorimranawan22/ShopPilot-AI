'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, StoreIcon, ShieldCheckIcon, TicketPercentIcon, ShoppingBasketIcon, TagsIcon, UsersIcon, StarIcon, BarChart3Icon, BellIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { useSelector } from "react-redux"

const AdminSidebar = () => {
    const pathname = usePathname()
    const userData = useSelector(state => state.user.userData)

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBasketIcon },
        { name: 'Orders', href: '/admin/orders', icon: TagsIcon },
        { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
        { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
        { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
        { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-2 justify-center items-center pt-8 max-sm:hidden">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                    {userData?.name?.[0] || 'A'}
                </div>
                <p className="text-sm font-medium text-slate-700">{userData?.name || 'Admin'}</p>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Administrator</span>
            </div>

            <div className="max-sm:mt-6 flex-1 overflow-y-auto no-scrollbar">
                {sidebarLinks.map((link, index) => (
                    <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                        <link.icon size={18} className="sm:ml-5" />
                        <p className="max-sm:hidden text-sm">{link.name}</p>
                        {pathname === link.href && <span className="absolute bg-indigo-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l" />}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AdminSidebar
