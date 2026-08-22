'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, StarIcon, ShoppingCartIcon, HeartIcon, TruckIcon, ShieldIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function QuickView({ product, isOpen, onClose }) {
    const [currentImage, setCurrentImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const dispatch = useDispatch()

    if (!product) return null

    const images = product.images || (product.image ? [product.image] : [])
    const price = product.price || product.offerPrice || 0
    const mrp = product.mrp || product.price || 0
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

    const handleAddToCart = () => {
        dispatch(addToCart({ ...product, quantity, selectedSize }))
        toast.success(
            <div className="flex items-center gap-2">
                <ShoppingCartIcon size={16} className="text-orange-500" />
                <span className="font-medium text-sm">Added to cart!</span>
            </div>,
            { duration: 3000, position: 'top-right' }
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[700px] sm:max-h-[85vh] z-50 bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row h-full max-h-[85vh] overflow-y-auto sm:overflow-hidden">
                            {/* Image Gallery */}
                            <div className="relative sm:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 p-4 min-h-[280px]">
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                                >
                                    <XIcon size={16} className="text-slate-600" />
                                </button>

                                {images.length > 0 && (
                                    <>
                                        <Image src={images[currentImage]} alt={product.name || product.productName} width={400} height={300} className="w-full h-64 sm:h-full object-contain rounded-2xl"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImage(p => (p > 0 ? p - 1 : images.length - 1))}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                                                >
                                                    <ChevronLeftIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentImage(p => (p < images.length - 1 ? p + 1 : 0))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                                                >
                                                    <ChevronRightIcon size={16} />
                                                </button>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                    {images.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentImage(i)}
                                                            className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-orange-500 w-4' : 'bg-slate-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {discount > 0 && (
                                    <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        -{discount}%
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="sm:w-1/2 p-6 flex flex-col overflow-y-auto">
                                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
                                    {product.brand || 'ShopPilot AI'}
                                </p>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">
                                    {product.name || product.productName}
                                </h2>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                size={14}
                                                className={i < Math.round(product.rating || product.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400">({product.reviewCount || product.ratingCount || 0} reviews)</span>
                                </div>

                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-2xl font-bold text-slate-800">${price.toFixed(2)}</span>
                                    {discount > 0 && (
                                        <span className="text-sm text-slate-400 line-through">${mrp.toFixed(2)}</span>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="mb-4">
                                    {(product.stock || 0) > 10 ? (
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">✓ In Stock</span>
                                    ) : (product.stock || 0) > 0 ? (
                                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">⚠ Only {product.stock} left</span>
                                    ) : (
                                        <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">✕ Out of Stock</span>
                                    )}
                                </div>

                                {/* Size Selector */}
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Size</p>
                                    <div className="flex gap-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all ${
                                                    selectedSize === size
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="mb-5">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Quantity</p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors font-medium"
                                        >
                                            −
                                        </button>
                                        <span className="w-10 text-center font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors font-medium"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddToCart}
                                        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                                    >
                                        <ShoppingCartIcon size={18} />
                                        Add to Cart
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all group"
                                    >
                                        <HeartIcon size={18} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                    </motion.button>
                                </div>

                                {/* Trust signals */}
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <TruckIcon size={12} /> Free Shipping
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <ShieldIcon size={12} /> Secure Payment
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
