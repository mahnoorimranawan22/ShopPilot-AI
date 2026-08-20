'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon, SendIcon, XIcon, BotIcon, UserIcon,
    ArrowRightIcon, StarIcon, ShoppingCartIcon, TrendingUpIcon,
    ChevronRightIcon, Loader2Icon, MessageCircleIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Product Recommendation Card ─────────────────────────────
function ProductCard({ product, index, rank }) {
    const rankColors = {
        'Top pick': 'from-indigo-500 to-violet-500',
        'Runner-up': 'from-emerald-500 to-teal-500',
        'Also great': 'from-amber-500 to-orange-500',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.4, ease: 'easeOut' }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 overflow-hidden"
        >
            {/* Rank Badge */}
            <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 bg-gradient-to-r ${rankColors[rank] || rankColors['Top pick']} text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg`}>
                {rank}
            </div>

            {/* Image */}
            <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                        }}
                    />
                ) : null}
                <div
                    className={`${product.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <SparklesIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                    <span className="text-lg font-bold text-slate-800">${product.price.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-1.5 text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Brand */}
                <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">{product.brand}</p>

                {/* Name */}
                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2 leading-snug">{product.productName}</h4>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                size={12}
                                className={i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{product.rating}</span>
                    <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
                </div>

                {/* Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {h}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <Link
                    href={`/product/${product.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 group/link"
                >
                    View Details
                    <ChevronRightIcon size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </motion.div>
    )
}

// ─── Typing Indicator ────────────────────────────────────────
function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
                <BotIcon size={16} className="text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-violet-400"
                    />
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Quick Suggestion Chip ───────────────────────────────────
function SuggestionChip({ suggestion, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(suggestion.text)}
            className="flex items-center gap-2 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-medium px-3 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
        >
            <span className="text-base">{suggestion.icon}</span>
            <span className="line-clamp-1">{suggestion.text}</span>
        </motion.button>
    )
}

// ─── Main AI Assistant Component ─────────────────────────────
export default function AIAssistant({ isOpen, onClose, initialQuery }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [followUps, setFollowUps] = useState([])
    const [lastQuery, setLastQuery] = useState('')
    const [lastResults, setLastResults] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const router = useRouter()

    // Load initial suggestions
    useEffect(() => {
        if (isOpen) {
            loadSuggestions()
            if (initialQuery) {
                setTimeout(() => handleSend(initialQuery), 300)
            }
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, initialQuery])

    const loadSuggestions = async () => {
        try {
            const data = await aiAPI.suggestions()
            setSuggestions(data.suggestions || [])
        } catch {
            // Fallback suggestions
            setSuggestions([
                { text: 'Best wireless headphones under $300', icon: '🎧' },
                { text: 'I need a laptop for programming under $1000', icon: '💻' },
                { text: 'Affordable smart home devices', icon: '🏠' },
                { text: 'Best camera for vlogging', icon: '📹' },
            ])
        }
    }

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const handleSend = async (text) => {
        const query = text || inputValue.trim()
        if (!query || isLoading) return

        const userMessage = { role: 'user', content: query }
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)
        setFollowUps([])

        try {
            const result = await aiAPI.ask(query, 3)
            const assistantMessage = {
                role: 'assistant',
                content: result.message,
                closing: result.closing,
                products: result.products || [],
                insights: result.insights,
            }
            setMessages(prev => [...prev, assistantMessage])
            setLastQuery(query)
            setLastResults(result)

            // Load follow-up suggestions
            try {
                const followUpData = await aiAPI.followUp(query, result)
                setFollowUps(followUpData.suggestions || [])
            } catch { /* ignore */ }
        } catch (error) {
            // Fallback: show helpful error message
            const errorMessage = {
                role: 'assistant',
                content: `I had trouble finding products for "${query}". This might be because the backend isn't connected yet. Try browsing our [Shop](/shop) for available products!`,
                products: [],
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Welcome message
    const welcomeMessage = {
        role: 'assistant',
        content: "Hi! I'm **ShopPilot AI** — your personal shopping assistant. 🛍️\n\nTell me what you're looking for, and I'll find the best products that match your needs. You can describe:\n\n• **What** you need (laptop, headphones, camera...)\n• **How** you'll use it (programming, gaming, travel...)\n• **Your budget** (under $500, between $100-$300...)\n• **Features** you want (wireless, waterproof, ergonomic...)",
        products: [],
    }

    const displayMessages = messages.length === 0 ? [welcomeMessage] : messages

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Chat Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:max-h-[700px] z-50 bg-slate-50 rounded-3xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <SparklesIcon size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">ShopPilot AI</h3>
                                    <p className="text-indigo-100 text-[11px]">Your smart shopping assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <XIcon size={16} className="text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {displayMessages.map((msg, i) => (
                                <div key={i}>
                                    {msg.role === 'user' ? (
                                        /* User Message */
                                        <div className="flex items-start gap-2.5 justify-end mb-4">
                                            <div className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[85%] shadow-lg shadow-indigo-500/10">
                                                {msg.content}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                                <UserIcon size={16} className="text-slate-500" />
                                            </div>
                                        </div>
                                    ) : (
                                        /* Assistant Message */
                                        <div className="flex items-start gap-2.5 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
                                                <BotIcon size={16} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                                                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                                        {msg.content.split('\n').map((line, j) => {
                                                            // Simple markdown bold
                                                            const parts = line.split(/\*\*(.*?)\*\*/g)
                                                            return (
                                                                <span key={j}>
                                                                    {parts.map((part, k) =>
                                                                        k % 2 === 1 ? (
                                                                            <strong key={k} className="font-semibold text-slate-800">{part}</strong>
                                                                        ) : (
                                                                            <span key={k}>{part}</span>
                                                                        )
                                                                    )}
                                                                    {j < msg.content.split('\n').length - 1 && <br />}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                    {msg.closing && (
                                                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-50">{msg.closing}</p>
                                                    )}
                                                </div>

                                                {/* Product Recommendations */}
                                                {msg.products && msg.products.length > 0 && (
                                                    <div className="mt-3 space-y-3">
                                                        {/* Insight badge */}
                                                        {msg.insights && (
                                                            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-3 py-2">
                                                                <TrendingUpIcon size={14} className="text-indigo-500" />
                                                                <span className="text-[11px] font-medium text-indigo-600">
                                                                    Found {msg.insights.totalMatches} match{msg.insights.totalMatches > 1 ? 'es' : ''}
                                                                    {msg.insights.priceRange && (
                                                                        <> · ${msg.insights.priceRange.min.toFixed(0)} – ${msg.insights.priceRange.max.toFixed(0)}</>
                                                                    )}
                                                                    {msg.insights.avgRating && (
                                                                        <> · Avg ★{msg.insights.avgRating}</>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {msg.products.map((product, idx) => (
                                                            <ProductCard
                                                                key={idx}
                                                                product={product}
                                                                index={idx}
                                                                rank={product.rank}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && <TypingIndicator />}

                            {/* Quick Suggestions (only when no messages yet or shown as chips) */}
                            {!isLoading && messages.length === 0 && suggestions.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-1">Try asking</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s, i) => (
                                            <SuggestionChip key={i} suggestion={s} onClick={handleSend} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Follow-up suggestions */}
                            {!isLoading && followUps.length > 0 && messages.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {followUps.map((s, i) => (
                                        <SuggestionChip key={i} suggestion={s} onClick={handleSend} />
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything about products..."
                                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                                    disabled={isLoading}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:shadow-none hover:shadow-xl transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2Icon size={16} className="animate-spin" />
                                    ) : (
                                        <SendIcon size={16} />
                                    )}
                                </motion.button>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-2">
                                Powered by ShopPilot AI · Results based on our product catalog
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
