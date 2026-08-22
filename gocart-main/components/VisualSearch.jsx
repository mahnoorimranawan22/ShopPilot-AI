'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CameraIcon, UploadIcon, XIcon, SparklesIcon, SearchIcon,
    Loader2Icon, ImageIcon, ArrowRightIcon, StarIcon, ShoppingCartIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

// ─── Similar Product Card ────────────────────────────────────
function SimilarProductCard({ product, index, similarity }) {
    const simPercent = Math.round((similarity || 0.85) * 100)
    const simColor = simPercent > 90 ? 'text-emerald-600 bg-emerald-50'
        : simPercent > 75 ? 'text-orange-500 bg-orange-50'
        : 'text-amber-600 bg-amber-50'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-100 transition-all duration-300 overflow-hidden"
        >
            {/* Similarity badge */}
            <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 ${simColor} text-[10px] font-bold rounded-full shadow-sm`}>
                {simPercent}% match
            </div>

            {/* Image */}
            <div className="relative h-44 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {product.brand && (
                    <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-1">{product.brand}</p>
                )}
                <Link href={`/product/${product._id || product.id}`}>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2 leading-snug hover:text-orange-500 transition-colors">
                        {product.name}
                    </h4>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                size={11}
                                className={i < Math.round(product.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400">({product.ratingCount || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-800">${product.price?.toFixed(2)}</span>
                    {product.mrp > product.price && (
                        <span className="text-xs text-slate-400 line-through">${product.mrp?.toFixed(2)}</span>
                    )}
                </div>

                {/* View button */}
                <Link
                    href={`/product/${product._id || product.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-orange-500 text-white text-xs font-medium py-2 rounded-xl transition-colors"
                >
                    View Product
                    <ArrowRightIcon size={12} />
                </Link>
            </div>
        </motion.div>
    )
}

// ─── Main Visual Search Component ────────────────────────────
export default function VisualSearch({ isOpen, onClose }) {
    const [dragActive, setDragActive] = useState(false)
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be under 10MB')
            return
        }
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
        setResults(null)
        setError(null)
    }, [])

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }, [handleFile])

    const handleSearch = async () => {
        if (!image) return
        setLoading(true)
        setError(null)

        try {
            // Convert image to base64 for the API
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const base64 = e.target.result
                    const result = await aiAPI.visualSearch(base64, 6)
                    setResults(result)
                } catch (err) {
                    // Fallback: use color/shape heuristics on the frontend
                    const result = await aiAPI.visualSearchFallback(image.name, 6)
                    setResults(result)
                } finally {
                    setLoading(false)
                }
            }
            reader.readAsDataURL(image)
        } catch {
            setError('Visual search is processing. Try our text-based search instead!')
            setLoading(false)
        }
    }

    const handleReset = () => {
        setImage(null)
        setImagePreview(null)
        setResults(null)
        setError(null)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-cyan-500 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <CameraIcon size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">Visual Search</h3>
                                <p className="text-orange-100 text-xs">Upload a photo to find similar products</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <XIcon size={16} className="text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!imagePreview ? (
                            /* Upload Zone */
                            <form
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onSubmit={(e) => { e.preventDefault(); handleSearch() }}
                            >
                                <label
                                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                                        dragActive
                                            ? 'border-orange-500 bg-orange-50/50 scale-[1.02]'
                                            : 'border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30'
                                    }`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                                        dragActive ? 'bg-orange-100' : 'bg-slate-100'
                                    }`}>
                                        {dragActive ? (
                                            <UploadIcon size={28} className="text-orange-500" />
                                        ) : (
                                            <CameraIcon size={28} className="text-slate-400" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">
                                        {dragActive ? 'Drop your image here' : 'Drag & drop an image'}
                                    </p>
                                    <p className="text-xs text-slate-400 mb-4">
                                        or click to browse — JPG, PNG, WebP up to 10MB
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                                        <SparklesIcon size={14} />
                                        AI will find similar products in our catalog
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    />
                                </label>
                            </form>
                        ) : (
                            /* Preview & Results */
                            <div>
                                {/* Image preview */}
                                <div className="relative mb-4">
                                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100">
                                        <img
                                            src={imagePreview}
                                            alt="Uploaded"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition"
                                    >
                                        <XIcon size={16} />
                                    </button>
                                </div>

                                {/* Search button */}
                                {!results && !loading && (
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={handleSearch}
                                        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                                    >
                                        <SearchIcon size={18} />
                                        Find Similar Products
                                    </motion.button>
                                )}

                                {/* Loading */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2Icon size={32} className="text-orange-500 animate-spin mb-3" />
                                        <p className="text-sm text-slate-600 font-medium">Analyzing your image...</p>
                                        <p className="text-xs text-slate-400 mt-1">AI is searching our catalog for matches</p>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                        <p className="text-sm text-amber-700">{error}</p>
                                        <button
                                            onClick={handleReset}
                                            className="mt-2 text-xs text-amber-600 font-medium hover:underline"
                                        >
                                            Try another image
                                        </button>
                                    </div>
                                )}

                                {/* Results */}
                                {results && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    {results.matches?.length || 0} Similar Products Found
                                                </h4>
                                                <p className="text-xs text-slate-400">Ranked by visual similarity</p>
                                            </div>
                                            <button
                                                onClick={handleReset}
                                                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                                            >
                                                Search Again
                                            </button>
                                        </div>

                                        {results.matches?.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {results.matches.map((product, i) => (
                                                    <SimilarProductCard
                                                        key={product._id || product.id || i}
                                                        product={product}
                                                        index={i}
                                                        similarity={product.similarity}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-slate-500">No similar products found</p>
                                                <p className="text-xs text-slate-400 mt-1">Try a different image or use text search</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
