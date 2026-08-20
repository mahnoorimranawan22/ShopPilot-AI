'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, BarChart3Icon, UsersIcon, PackageIcon, SparklesIcon, StarIcon, BellIcon, SettingsIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSelector } from "react-redux"

const StoreSidebar = ({ storeInfo }) => {
    const pathname = usePathname()
    const userData = useSelector(state => state.user.userData)

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Products', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
        { name: 'Inventory', href: '/store/inventory', icon: PackageIcon },
        { name: 'Customers', href: '/store/customers', icon: UsersIcon },
        { name: 'Reviews', href: '/store/reviews', icon: StarIcon },
        { name: 'Analytics', href: '/store/analytics', icon: BarChart3Icon },
        { name: 'AI Insights', href: '/store/ai-insights', icon: SparklesIcon },
        { name: 'Notifications', href: '/store/notifications', icon: BellIcon },
        { name: 'Settings', href: '/store/settings', icon: SettingsIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-2 justify-center items-center pt-8 max-sm:hidden">
                {storeInfo?.logo ? (
                    <Image className="w-12 h-12 rounded-full shadow-md object-cover" src={storeInfo.logo} alt="" width={48} height={48} />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                        {userData?.name?.[0] || 'S'}
                    </div>
                )}
                <p className="text-sm font-medium text-slate-700 text-center truncate max-w-48">{storeInfo?.name || userData?.name || 'Store'}</p>
                <span className="text-[10px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Merchant</span>
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

export default StoreSidebar
