'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TagIcon, CheckIcon, XIcon, Loader2Icon } from 'lucide-react'

const VALID_COUPONS = {
    NEW20: { discount: 20, type: 'percent', label: '20% OFF — New customer' },
    SAVE10: { discount: 10, type: 'fixed', label: '$10 OFF your order' },
    FREESHIP: { discount: 0, type: 'shipping', label: 'Free shipping applied' },
    HOLIDAY30: { discount: 30, type: 'percent', label: '30% OFF — Holiday sale' },
}

export default function CouponInput({ onApply }) {
    const [code, setCode] = useState('')
    const [status, setStatus] = useState(null) // null | 'checking' | 'success' | 'error'
    const [coupon, setCoupon] = useState(null)
    const [message, setMessage] = useState('')

    const handleApply = async () => {
        if (!code.trim()) return
        setStatus('checking')

        // Simulate API delay
        await new Promise(r => setTimeout(r, 800))

        const found = VALID_COUPONS[code.toUpperCase().trim()]
        if (found) {
            setStatus('success')
            setCoupon(found)
            setMessage(found.label)
            onApply?.({ code: code.toUpperCase().trim(), ...found })
        } else {
            setStatus('error')
            setCoupon(null)
            setMessage('Invalid coupon code')
            onApply?.(null)
        }
    }

    const handleRemove = () => {
        setCode('')
        setStatus(null)
        setCoupon(null)
        setMessage('')
        onApply?.(null)
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-50 transition-all">
                    <TagIcon size={14} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); if (status) setStatus(null) }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium tracking-wider"
                        disabled={status === 'success'}
                    />
                    {status === 'success' && (
                        <button onClick={handleRemove} className="text-slate-400 hover:text-red-400 transition-colors">
                            <XIcon size={14} />
                        </button>
                    )}
                </div>
                {status !== 'success' ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApply}
                        disabled={!code.trim() || status === 'checking'}
                        className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                    >
                        {status === 'checking' ? <Loader2Icon size={14} className="animate-spin" /> : 'Apply'}
                    </motion.button>
                ) : (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl flex items-center gap-1.5">
                        <CheckIcon size={14} /> Applied
                    </div>
                )}
            </div>

            <AnimatePresence>
                {message && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`text-xs font-medium px-1 ${status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                        {message}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Hint */}
            {!status && (
                <p className="text-[10px] text-slate-400 px-1">
                    Try: NEW20, SAVE10, FREESHIP, HOLIDAY30
                </p>
            )}
        </div>
    )
}
