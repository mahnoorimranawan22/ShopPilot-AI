'use client'
import { StarIcon, HeartIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { apiToggleWishlist } from '@/lib/features/wishlist/wishlistSlice'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const { items: wishlistItems, useAPI } = useSelector(state => state.wishlist)
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)

    const productId = product._id || product.id
    const isWishlisted = wishlistItems.includes(productId)

    // Support both legacy dummy data (rating array) and API data (avgRating/ratingCount)
    const ratingCount = product.ratingCount || product.rating?.length || 0
    const avgRating = product.avgRating || (product.rating?.length > 0
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0)

    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLoggedIn) {
            dispatch(apiToggleWishlist(productId))
        } else {
            dispatch(toggleWishlist({ productId }))
        }
    }

    return (
        <Link href={`/product/${productId}`} className='group max-xl:mx-auto'>
            <div className='relative bg-[#F0F0FF] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden'>
                {product.images?.[0] ? (
                    <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300 object-contain' src={product.images[0]} alt={product.name} />
                ) : (
                    <div className="w-20 h-20 bg-slate-200 rounded" />
                )}
                {/* Wishlist Heart */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all z-10 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-400 hover:bg-white'}`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <HeartIcon size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                {/* Stock badge */}
                {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Only {product.stock} left
                    </span>
                )}
                {product.stock === 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        Out of stock
                    </span>
                )}
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div className='min-w-0 flex-1'>
                    <p className='truncate'>{product.name}</p>
                    <div className='flex items-center gap-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={avgRating >= index + 1 ? "#6366f1" : "#D1D5DB"} />
                        ))}
                        {ratingCount > 0 && <span className="text-[10px] text-slate-400 ml-1">({ratingCount})</span>}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-medium">{currency}{product.price}</p>
                    {product.mrp > product.price && (
                        <p className="text-xs text-slate-400 line-through">{currency}{product.mrp}</p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
