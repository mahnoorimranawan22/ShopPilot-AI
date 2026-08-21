'use client'
import { StarIcon, HeartIcon, EyeIcon, ShoppingCartIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { apiToggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { addToCart } from '@/lib/features/cart/cartSlice'
import QuickView from './ui/QuickView'
import { PriceIntelligenceBadge } from './PriceIntelligence'
import toast from 'react-hot-toast'

const ProductCard = ({ product, index = 0 }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const { items: wishlistItems } = useSelector(state => state.wishlist)
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)
    const [showQuickView, setShowQuickView] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const productId = product._id || product.id
    const isWishlisted = wishlistItems.includes(productId)

    const ratingCount = product.ratingCount || product.rating?.length || 0
    const avgRating = product.avgRating || (product.rating?.length > 0
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0)

    const price = product.price || product.offerPrice || 0
    const mrp = product.mrp || 0
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0

    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLoggedIn) {
            dispatch(apiToggleWishlist(productId))
        } else {
            dispatch(toggleWishlist({ productId }))
        }
        if (!isWishlisted) {
            toast('❤️ Added to wishlist', { duration: 2000, position: 'bottom-right' })
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ ...product, quantity: 1 }))
        toast.success('🛒 Added to cart!', { duration: 2000, position: 'bottom-right' })
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <Link href={`/product/${productId}`} className='group block max-xl:mx-auto'>
                    {/* Image Container */}
                    <div className='relative bg-gradient-to-br from-slate-50 to-slate-100  h-40 sm:w-60 sm:h-68 rounded-2xl flex items-center justify-center overflow-hidden'>
                        {product.images?.[0] ? (
                            <motion.div
                                animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                                <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto object-contain' src={product.images[0]} alt={product.name} />
                            </motion.div>
                        ) : (
                            <div className="w-20 h-20 bg-slate-200  rounded-xl" />
                        )}

                        {/* Price Intelligence Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                            <PriceIntelligenceBadge product={product} compact />
                        </div>

                        {/* Discount badge */}
                        {discount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                            >
                                -{discount}%
                            </motion.span>
                        )}

                        {/* Wishlist Heart */}
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={handleWishlistToggle}
                            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-colors z-10 ${
                                isWishlisted
                                    ? 'bg-red-50 text-red-500 shadow-lg shadow-red-500/25'
                                    : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-400 hover:bg-white'
                            }`}
                            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <motion.div
                                animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <HeartIcon size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                            </motion.div>
                        </motion.button>

                        {/* Quick View + Add to Cart overlay */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-2.5 left-2.5 right-2.5 flex gap-2"
                        >
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true) }}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold py-2 rounded-xl hover:bg-white transition-colors shadow-lg"
                            >
                                <EyeIcon size={13} />
                                Quick View
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white text-[11px] font-semibold py-2 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
                            >
                                <ShoppingCartIcon size={13} />
                                Add to Cart
                            </button>
                        </motion.div>

                        {/* Stock badge */}
                        {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Only {product.stock} left
                            </span>
                        )}
                        {product.stock === 0 && (
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                Out of stock
                            </span>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className='flex justify-between gap-3 text-sm text-slate-800  pt-3 max-w-60'>
                        <div className='min-w-0 flex-1'>
                            <p className='truncate font-medium group-hover:text-orange-500  transition-colors'>{product.name}</p>
                            <div className='flex items-center gap-0.5 mt-0.5'>
                                {Array(5).fill('').map((_, index) => (
                                    <StarIcon key={index} size={12} className='text-transparent' fill={avgRating >= index + 1 ? "#f59e0b" : "#D1D5DB"} />
                                ))}
                                {ratingCount > 0 && <span className='text-[10px] text-slate-400 ml-1'>({ratingCount})</span>}
                            </div>
                        </div>
                        <div className='text-right shrink-0'>
                            <p className='font-bold'>{currency}{price}</p>
                            {mrp > price && (
                                <p className='text-xs text-slate-400 line-through'>{currency}{mrp}</p>
                            )}
                        </div>
                    </div>
                </Link>
            </motion.div>

            <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
        </>
    )
}

export default ProductCard
