'use client'
import { useSelector, useDispatch } from "react-redux"
import { removeFromWishlist, apiToggleWishlist } from "@/lib/features/wishlist/wishlistSlice"
import ProductCard from "@/components/ProductCard"
import { HeartIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { productDummyData } from "@/assets/assets"
import Link from "next/link"

export default function Wishlist() {

    const router = useRouter()
    const dispatch = useDispatch()
    const { items, products: apiProducts, useAPI } = useSelector(state => state.wishlist)
    const allProducts = useSelector(state => state.product.list)
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)

    // Get wishlisted products from either API or local data
    const products = allProducts.length > 0 ? allProducts : productDummyData

    const wishlistedProducts = useAPI
        ? apiProducts  // API returns full product objects
        : products.filter(p => items.includes(p._id || p.id))

    const handleRemove = (productId) => {
        if (isLoggedIn) {
            dispatch(apiToggleWishlist(productId))
        } else {
            dispatch(removeFromWishlist({ productId }))
        }
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="my-8">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">My Wishlist</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {wishlistedProducts.length > 0
                            ? `${wishlistedProducts.length} item${wishlistedProducts.length > 1 ? 's' : ''} saved`
                            : 'Your wishlist is empty'}
                    </p>
                </div>

                {wishlistedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 xl:gap-12 mb-32">
                        {wishlistedProducts.map((product) => (
                            <div key={product._id || product.id} className="relative group max-xl:mx-auto">
                                <ProductCard product={product} />
                                <button
                                    onClick={() => handleRemove(product._id || product.id)}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur text-red-500 p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 active:scale-90 transition z-10"
                                    title="Remove from wishlist"
                                >
                                    <Trash2Icon size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <HeartIcon size={64} strokeWidth={1} className="mb-4 text-slate-300" />
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-500 mb-2">Your wishlist is empty</h2>
                        <p className="text-sm text-slate-400 mb-6">Save products you love by tapping the heart icon</p>
                        <Link href="/shop" className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
