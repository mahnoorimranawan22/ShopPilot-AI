'use client'
import { ShoppingCart, HeartIcon, UserIcon, LayoutDashboardIcon, LogOutIcon, ShieldIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/features/user/userSlice";
import toast from "react-hot-toast";
import SearchAutocomplete from "./ui/SearchAutocomplete";


const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch()

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const wishlistCount = useSelector(state => state.wishlist.items.length)
    const { isLoggedIn, userData } = useSelector(state => state.user)

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Logged out successfully')
        router.push('/')
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-0">
                        <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Shop</span>
                        <span className="text-slate-700">Pilot</span>
                        <span className="ml-1.5 text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-md leading-none mt-1">AI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 text-sm">
                        <Link href="/" className="hover:text-orange-500 transition-colors font-medium">Home</Link>
                        <Link href="/shop" className="hover:text-orange-500 transition-colors font-medium">Shop</Link>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { query: '' } }))}
                            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium transition"
                        >
                            <SparklesIcon size={14} />
                            AI
                        </button>
                        <Link href="/" className="hover:text-orange-500 transition-colors font-medium">About</Link>
                        <Link href="/" className="hover:text-orange-500 transition-colors font-medium">Contact</Link>

                        {/* Search Autocomplete */}
                        <div className="hidden xl:block w-72">
                            <SearchAutocomplete />
                        </div>



                        {/* Wishlist */}
                        <Link href="/wishlist" className="relative hover:text-orange-500 transition-colors">
                            <HeartIcon size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-rose-500 size-3.5 rounded-full flex items-center justify-center font-bold" suppressHydrationWarning>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative flex items-center gap-2 hover:text-orange-500 transition-colors">
                            <ShoppingCart size={18} />
                            Cart
                            {cartCount > 0 && (
                                <span className="absolute -top-1 left-3 text-[8px] text-white bg-orange-500 size-3.5 rounded-full" suppressHydrationWarning />
                            )}
                        </Link>

                        {isLoggedIn ? (
                            <>
                                {userData?.role === 'admin' && (
                                    <Link href="/admin" className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition" title="Admin Dashboard">
                                        <ShieldIcon size={16} />
                                        Admin
                                    </Link>
                                )}

                                {(userData?.role === 'seller' || userData?.role === 'admin') && (
                                    <Link href="/store" className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 transition" title="Store Dashboard">
                                        <LayoutDashboardIcon size={16} />
                                        Dashboard
                                    </Link>
                                )}

                                <div className="flex items-center gap-2">
                                    <Link href="/profile" className="flex items-center gap-1.5 text-sm hover:text-orange-500 transition">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                                        >
                                            {userData?.image ? (
                                                <img src={userData.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (userData?.name || 'U')[0].toUpperCase()
                                            )}
                                        </motion.div>
                                        <span className="hidden lg:inline max-w-20 truncate">{userData?.name?.split(' ')[0]}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition" title="Logout">
                                        <LogOutIcon size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link href="/login" className="px-8 py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 transition text-white rounded-full font-medium">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile User Buttons */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/wishlist" className="relative">
                            <HeartIcon size={20} className="text-slate-600" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-rose-500 size-3.5 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
                            )}
                        </Link>
                        <Link href="/cart" className="relative">
                            <ShoppingCart size={20} className="text-slate-600" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-orange-500 size-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                            )}
                        </Link>
                        {isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <Link href="/profile" className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                    {userData?.image ? (
                                        <img src={userData.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (userData?.name || 'U')[0].toUpperCase()
                                    )}
                                </Link>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                                    <LogOutIcon size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="text-slate-600">
                                <UserIcon size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
