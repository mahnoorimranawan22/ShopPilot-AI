'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomInIcon, ZoomOutIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

export default function ProductGallery({ images = [], alt = '' }) {
    const [current, setCurrent] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
    const imgRef = useRef(null)

    if (!images.length) {
        return (
            <div className="w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center">
                <p className="text-slate-400 text-sm">No images available</p>
            </div>
        )
    }

    const handleMouseMove = (e) => {
        if (!imgRef.current || !isZoomed) return
        const rect = imgRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPos({ x, y })
    }

    return (
        <div className="space-y-3">
            {/* Main Image */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        ref={imgRef}
                        className="relative cursor-zoom-in"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        <Image src={images[current]} alt={alt} width={400} height={300} className="w-full h-[400px] sm:h-[500px] object-contain p-4 transition-transform duration-200"
                            style={isZoomed ? {
                                transform: 'scale(2)',
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            } : {}}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Zoom indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-slate-500 flex items-center gap-1 shadow-sm">
                        {isZoomed ? <ZoomOutIcon size={12} /> : <ZoomInIcon size={12} />}
                        {isZoomed ? 'Zoomed' : 'Hover to zoom'}
                    </div>
                </div>

                {/* Nav arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrent(p => (p > 0 ? p - 1 : images.length - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                            <ChevronLeftIcon size={18} />
                        </button>
                        <button
                            onClick={() => setCurrent(p => (p < images.length - 1 ? p + 1 : 0))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                            <ChevronRightIcon size={18} />
                        </button>
                    </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {current + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrent(i)}
                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                i === current
                                    ? 'border-orange-500 shadow-lg shadow-orange-500/25'
                                    : 'border-transparent hover:border-slate-200'
                            }`}
                        >
                            <Image src={img} alt="" width={400} height={300} className="w-full h-full object-cover" />
                            {i === current && (
                                <motion.div
                                    layoutId="thumb-indicator"
                                    className="absolute inset-0 border-2 border-orange-500 rounded-xl"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    )
}
