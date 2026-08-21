'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon, TrendingUpIcon, StarIcon, HeartIcon, ShoppingCartIcon, ArrowRightIcon } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import Link from 'next/link'

// ─── Recommendation Product Card ─────────────────────────────
function RecProductCard({ item, index }) {
    const { product, reasons } = item
    const [isWishlisted, setIsWishlisted] = useState(false)
    const id = product._id || product.id

    // Track view when component mounts
    useEffect(() => {
        if (id) {
            aiAPI.trackBehavior('view', { productId: id }).catch(() => {})
        }
    }, [id])

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-100 transition-all duration-300 overflow-hidden flex-shrink-0 w-[200px] sm:w-[220px]"
        >
            {/* Discount badge */}
            {discount > 0 && (
                <div className="absolute top-2.5 left-2.5 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                </div>
            )}

            {/* Wishlist button */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    setIsWishlisted(!isWishlisted)
                    aiAPI.trackBehavior('wishlist', { productId: id }).catch(() => {})
                }}
                className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
                <HeartIcon
                    size={14}
                    className={isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}
                />
            </button>

            {/* Image */}
            <Link href={`/product/${id}`} className="block relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <SparklesIcon className="w-10 h-10 text-orange-300" />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-3.5">
                {product.brand && (
                    <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-0.5">{product.brand}</p>
                )}
                <Link href={`/product/${id}`}>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1.5 leading-snug hover:text-orange-500 transition-colors min-h-[30px]">
                        {product.name}
                    </h4>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                size={10}
                                className={i < Math.round(product.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400">({product.ratingCount || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-800">${product.price?.toFixed(2)}</span>
                    {discount > 0 && (
                        <span className="text-[10px] text-slate-400 line-through">${product.mrp?.toFixed(2)}</span>
                    )}
                </div>

                {/* AI reasons */}
                {reasons && reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {reasons.slice(0, 2).map((reason, i) => (
                            <span key={i} className="text-[9px] font-medium bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">
                                {reason}
                            </span>
                        ))}
                    </div>
                )}

                {/* Add to cart */}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        // Dispatch add to cart event
                        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { productId: id } }))
                        aiAPI.trackBehavior('cart', { productId: id }).catch(() => {})
                    }}
                    className="w-full mt-2.5 py-1.5 bg-slate-900 hover:bg-orange-500 text-white text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                    <ShoppingCartIcon size={12} />
                    Add to Cart
                </button>
            </div>
        </motion.div>
    )
}

// ─── Loading Skeleton ────────────────────────────────────────
function RecSkeleton() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-40 bg-slate-100" />
                    <div className="p-3.5 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-20" />
                        <div className="h-5 bg-slate-100 rounded w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────
export default function RecommendedForYou() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadRecommendations()
    }, [])

    const loadRecommendations = async () => {
        try {
            setLoading(true)
            const result = await aiAPI.recommended(8)
            setData(result)
        } catch {
            // API not available — show trending from dummy data
            setData({
                type: 'trending',
                label: 'Recommended for You',
                subtitle: 'Popular products everyone is loving',
                products: [],
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-10 px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                        <SparklesIcon size={16} className="text-white" />
                    </div>
                    <div>
                        <div className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
                        <div className="h-3 bg-slate-50 rounded w-64 mt-1 animate-pulse" />
                    </div>
                </div>
                <RecSkeleton />
            </section>
        )
    }

    if (!data || !data.products || data.products.length === 0) {
        return null
    }

    return (
        <section className="py-10 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <SparklesIcon size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">{data.label || 'Recommended for You'}</h2>
                        <p className="text-xs text-slate-500">{data.subtitle || 'Based on your browsing and purchase history'}</p>
                    </div>
                </div>
                <Link
                    href="/shop"
                    className="hidden sm:flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 transition"
                >
                    View all <ArrowRightIcon size={14} />
                </Link>
            </div>

            {/* Type badge */}
            {data.type === 'personalized' && data.profileSummary && (
                <div className="flex items-center gap-2 mb-4">
                    {data.profileSummary.topCategories?.slice(0, 3).map((cat, i) => (
                        <span key={i} className="text-[10px] font-medium bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full">
                            {cat}
                        </span>
                    ))}
                    {data.profileSummary.topBrands?.slice(0, 2).map((brand, i) => (
                        <span key={`b${i}`} className="text-[10px] font-medium bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">
                            {brand}
                        </span>
                    ))}
                </div>
            )}

            {data.type === 'trending' && (
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUpIcon size={14} className="text-orange-500" />
                    <span className="text-[10px] font-medium text-orange-500">Based on popularity and ratings</span>
                </div>
            )}

            {/* Scrollable product row */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {data.products.map((item, index) => (
                    <RecProductCard key={item.product._id || item.product.id || index} item={item} index={index} />
                ))}
            </div>

            {/* Mobile view all */}
            <div className="sm:hidden mt-4 text-center">
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
                >
                    View all recommendations <ArrowRightIcon size={14} />
                </Link>
            </div>
        </section>
    )
}
