'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCompareArrowsIcon } from 'lucide-react'
import ProductComparison from './ProductComparison'

export default function ComparisonButton() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleOpen = (e) => {
            setIsOpen(true)
        }
        window.addEventListener('open-comparison', handleOpen)
        return () => window.removeEventListener('open-comparison', handleOpen)
    }, [])

    return (
        <>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-orange-500 to-cyan-500 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center hover:shadow-2xl hover:shadow-rose-500/40 transition-shadow group"
            >
                <GitCompareArrowsIcon size={20} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Compare Products
                    <div className="absolute top-full right-3 w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
                </div>
            </motion.button>
            <ProductComparison isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
