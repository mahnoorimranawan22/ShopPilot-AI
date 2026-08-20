'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon } from 'lucide-react'
import AIAssistant from './AIAssistant'

export default function AIFloatingButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [initialQuery, setInitialQuery] = useState('')
    const [hasPulsed, setHasPulsed] = useState(false)

    // Auto-pulse once after 3 seconds to draw attention
    useEffect(() => {
        const timer = setTimeout(() => setHasPulsed(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    // Listen for custom events from other components (e.g., Hero button)
    useEffect(() => {
        const handleOpenAI = (e) => {
            setInitialQuery(e.detail?.query || '')
            setIsOpen(true)
        }
        window.addEventListener('open-ai-assistant', handleOpenAI)
        return () => window.removeEventListener('open-ai-assistant', handleOpenAI)
    }, [])

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:shadow-2xl hover:shadow-indigo-500/40 transition-shadow group"
            >
                <SparklesIcon size={22} className="group-hover:rotate-12 transition-transform" />

                {/* Pulse ring */}
                {!hasPulsed && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-2xl border-2 border-indigo-400"
                    />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Ask ShopPilot AI
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
                </div>
            </motion.button>

            {/* Chat Modal */}
            <AIAssistant
                isOpen={isOpen}
                onClose={() => { setIsOpen(false); setInitialQuery('') }}
                initialQuery={initialQuery}
            />
        </>
    )
}
