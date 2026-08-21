'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CameraIcon } from 'lucide-react'
import VisualSearch from './VisualSearch'

export default function VisualSearchButton({ className = '' }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all ${className}`}
            >
                <CameraIcon size={15} />
                Visual Search
            </motion.button>
            <VisualSearch isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
