'use client'
import { Search, ShoppingCart, HeartIcon, UserIcon, LayoutDashboardIcon, LogOutIcon, ShieldIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/features/user/userSlice";
import toast from "react-hot-toast";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch()

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const wishlistCount = useSelector(state => state.wishlist.items.length)
    const { isLoggedIn, userData } = useSelector(state => state.user)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Logged out successfully')
        router.push('/')
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-0">
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Shop</span>
                        <span className="text-slate-700">Pilot</span>
                        <span className="ml-1.5 text-xs font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md leading-none mt-1">AI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { query: '' } }))}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition"
                        >
                            <SparklesIcon size={14} />
                            AI
                        </button>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="relative text-slate-600 hover:text-indigo-600 transition">
                            <HeartIcon size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-red-500 size-3.5 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-indigo-500 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {isLoggedIn ? (
                            <>
                                {/* Admin Dashboard Link */}
                                {userData?.role === 'admin' && (
                                    <Link href="/admin" className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition" title="Admin Dashboard">
                                        <ShieldIcon size={16} />
                                        Admin
                                    </Link>
                                )}

                                {/* Seller Dashboard Link */}
                                {(userData?.role === 'seller' || userData?.role === 'admin') && (
                                    <Link href="/store" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition" title="Store Dashboard">
                                        <LayoutDashboardIcon size={16} />
                                        Dashboard
                                    </Link>
                                )}

                                {/* Profile + Logout */}
                                <div className="flex items-center gap-2">
                                    <Link href="/profile" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                            {userData?.image ? (
                                                <img src={userData.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (userData?.name || 'U')[0].toUpperCase()
                                            )}
                                        </div>
                                        <span className="hidden lg:inline max-w-20 truncate">{userData?.name?.split(' ')[0]}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition" title="Logout">
                                        <LogOutIcon size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link href="/login" className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile User Buttons */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/wishlist" className="relative text-slate-600">
                            <HeartIcon size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-red-500 size-3.5 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
                            )}
                        </Link>
                        <Link href="/cart" className="relative text-slate-600">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] text-white bg-indigo-500 size-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                            )}
                        </Link>
                        {isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <Link href="/profile" className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
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
