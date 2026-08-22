'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GitCompareArrowsIcon, SparklesIcon, SendIcon, XIcon,
    BotIcon, UserIcon, Loader2Icon, StarIcon, CheckIcon, MinusIcon,
    ArrowRightIcon, ShoppingCartIcon
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

// ─── Comparison Feature Row ──────────────────────────────────
function ComparisonRow({ feature, p1, p2, highlight }) {
    const p1Wins = highlight === 'left'
    const p2Wins = highlight === 'right'

    return (
        <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-slate-50 last:border-0">
            <div className="text-xs font-medium text-slate-500 flex items-center">{feature}</div>
            <div className={`text-xs text-center px-2 py-1 rounded-lg ${p1Wins ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'}`}>
                {p1}
            </div>
            <div className={`text-xs text-center px-2 py-1 rounded-lg ${p2Wins ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'}`}>
                {p2}
            </div>
        </div>
    )
}

// ─── AI Chat Message ─────────────────────────────────────────
function ChatMessage({ message, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`flex gap-2.5 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20">
                    <BotIcon size={13} className="text-white" />
                </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                message.role === 'user'
                    ? 'bg-orange-500 text-white rounded-tr-md'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-md shadow-sm'
            }`}>
                {message.content.split('\n').map((line, i) => {
                    const parts = line.split(/\*\*(.*?)\*\*/g)
                    return (
                        <span key={i}>
                            {parts.map((part, k) =>
                                k % 2 === 1 ? (
                                    <strong key={k} className="font-semibold">{part}</strong>
                                ) : (
                                    <span key={k}>{part}</span>
                                )
                            )}
                            {i < message.content.split('\n').length - 1 && <br />}
                        </span>
                    )
                })}
            </div>
            {message.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={13} className="text-slate-500" />
                </div>
            )}
        </motion.div>
    )
}

// ─── AI Comparison Engine ────────────────────────────────────
function generateComparison(p1, p2, question) {
    const q = (question || '').toLowerCase()
    const name1 = p1.name || 'Product A'
    const name2 = p2.name || 'Product B'
    const price1 = p1.price || 0
    const price2 = p2.price || 0
    const rating1 = p1.avgRating || 0
    const rating2 = p2.avgRating || 0
    const stock1 = p1.stock ?? 50
    const stock2 = p2.stock ?? 50

    // Determine winners per category
    const priceWinner = price1 < price2 ? 'left' : price2 < price1 ? 'right' : 'tie'
    const ratingWinner = rating1 > rating2 ? 'left' : rating2 > rating1 ? 'right' : 'tie'
    const stockWinner = stock1 > stock2 ? 'left' : stock2 > stock1 ? 'right' : 'tie'
    const discount1 = p1.mrp > price1 ? Math.round(((p1.mrp - price1) / p1.mrp) * 100) : 0
    const discount2 = p2.mrp > price2 ? Math.round(((p2.mrp - price2) / p2.mrp) * 100) : 0
    const discountWinner = discount1 > discount2 ? 'left' : discount2 > discount1 ? 'right' : 'tie'

    // Build comparison features
    const features = [
        { feature: 'Price', p1: `$${price1}`, p2: `$${price2}`, highlight: priceWinner },
        { feature: 'Rating', p1: `${rating1} ⭐`, p2: `${rating2} ⭐`, highlight: ratingWinner },
        { feature: 'Stock', p1: `${stock1} units`, p2: `${stock2} units`, highlight: stockWinner },
    ]

    if (discount1 > 0 || discount2 > 0) {
        features.push({
            feature: 'Discount',
            p1: discount1 > 0 ? `${discount1}% off` : '—',
            p2: discount2 > 0 ? `${discount2}% off` : '—',
            highlight: discountWinner,
        })
    }

    // Category
    if (p1.category === p2.category) {
        features.push({ feature: 'Category', p1: p1.category, p2: p2.category, highlight: null })
    } else {
        features.push({ feature: 'Category', p1: p1.category, p2: p2.category, highlight: null })
    }

    // Brand
    features.push({ feature: 'Brand', p1: p1.brand || '—', p2: p2.brand || '—', highlight: null })

    // Build AI explanation
    let explanation = ''

    if (q.includes('price') || q.includes('cheap') || q.includes('budget') || q.includes('afford')) {
        const cheaper = price1 < price2 ? name1 : name2
        const diff = Math.abs(price1 - price2)
        explanation = `**Price analysis:** ${cheaper} is the more affordable option at $${Math.min(price1, price2)} — that's $${diff} less than the other.\n\n`
        if (discount1 > discount2) {
            explanation += `Also, ${name1} has a bigger discount (${discount1}% vs ${discount2}%), making it even better value.`
        } else if (discount2 > discount1) {
            explanation += `Also, ${name2} has a bigger discount (${discount2}% vs ${discount1}%), making it even better value.`
        }
    } else if (q.includes('quality') || q.includes('best') || q.includes('better') || q.includes('recommend')) {
        const betterRated = rating1 > rating2 ? name1 : rating2 > rating1 ? name2 : null
        if (betterRated) {
            explanation = `**Quality verdict:** Based on customer ratings, **${betterRated}** edges ahead with ${Math.max(rating1, rating2)} stars vs ${Math.min(rating1, rating2)} stars.\n\n`
        } else {
            explanation = `**Quality verdict:** Both products have similar ratings — you really can't go wrong with either! 🤝\n\n`
        }
        if (rating1 === rating2) {
            explanation += `Since ratings are equal, consider other factors like price, brand preference, or specific features.`
        }
    } else if (q.includes('stock') || q.includes('available') || q.includes('in stock')) {
        const moreStock = stock1 > stock2 ? name1 : name2
        explanation = `**Stock check:** ${moreStock} has better availability with ${Math.max(stock1, stock2)} units in stock. `
        if (Math.min(stock1, stock2) < 10) {
            explanation += `\n\n⚠️ **Warning:** ${stock1 < stock2 ? name1 : name2} has low stock (${Math.min(stock1, stock2)} left) — order soon if you want it!`
        }
    } else if (q.includes('discount') || q.includes('deal') || q.includes('save') || q.includes('off')) {
        const betterDeal = discount1 > discount2 ? name1 : discount2 > discount1 ? name2 : null
        if (betterDeal) {
            explanation = `**Deal alert:** **${betterDeal}** has the better discount at ${Math.max(discount1, discount2)}% off, saving you more money right now!`
        } else {
            explanation = `Both products have similar discount levels. Price is the main differentiator here.`
        }
    } else {
        // General comparison
        let overallWinner = null
        let score1 = 0
        let score2 = 0

        if (priceWinner === 'left') score1 += 1; else if (priceWinner === 'right') score2 += 1
        if (ratingWinner === 'left') score1 += 1; else if (ratingWinner === 'right') score2 += 1
        if (stockWinner === 'left') score1 += 1; else if (stockWinner === 'right') score2 += 1

        if (score1 > score2) overallWinner = name1
        else if (score2 > score1) overallWinner = name2

        explanation = `**Overall comparison:**\n`
        if (priceWinner === 'left') explanation += `• ${name1} is cheaper 💰\n`
        else if (priceWinner === 'right') explanation += `• ${name2} is cheaper 💰\n`

        if (ratingWinner === 'left') explanation += `• ${name1} has better ratings ⭐\n`
        else if (ratingWinner === 'right') explanation += `• ${name2} has better ratings ⭐\n`

        if (overallWinner) {
            explanation += `\n**Recommendation:** **${overallWinner}** offers better overall value based on price, ratings, and availability.`
        } else {
            explanation += `\n**Verdict:** These products are very close! Your choice depends on personal preference.`
        }
    }

    return { features, explanation }
}

// ─── Main ProductComparison Component ────────────────────────
export default function ProductComparison({ isOpen, onClose }) {
    const [products, setProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([null, null])
    const [chatMessages, setChatMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [showTable, setShowTable] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const dispatch = useDispatch()

    const allProducts = useSelector(state => state.product.list)

    useEffect(() => {
        if (allProducts.length > 0) {
            setProducts(allProducts)
        }
    }, [allProducts])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const handleSelectProduct = (index, productId) => {
        const product = products.find(p => (p._id || p.id) === productId)
        const newSelected = [...selectedProducts]
        newSelected[index] = product
        setSelectedProducts(newSelected)

        // If both selected, auto-generate comparison
        if (newSelected[0] && newSelected[1]) {
            setShowTable(true)
            const { features, explanation } = generateComparison(newSelected[0], newSelected[1], '')
            setChatMessages([{
                role: 'assistant',
                content: `I've compared **${newSelected[0].name}** vs **${newSelected[1].name}** for you!\n\n${explanation}\n\n💡 **Ask me anything:** "Which is cheaper?", "Which has better reviews?", "Any deals available?"`,
            }])
        }
    }

    const handleSend = async (text) => {
        const query = text || inputValue.trim()
        if (!query || !selectedProducts[0] || !selectedProducts[1]) return

        setChatMessages(prev => [...prev, { role: 'user', content: query }])
        setInputValue('')
        setLoading(true)

        // Simulate AI processing
        setTimeout(() => {
            const { explanation } = generateComparison(selectedProducts[0], selectedProducts[1], query)
            setChatMessages(prev => [...prev, { role: 'assistant', content: explanation }])
            setLoading(false)
        }, 600)
    }

    const handleAddToCart = (product) => {
        dispatch(addToCart({ ...product, quantity: 1 }))
        toast.success(`Added ${product.name} to cart!`)
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
                    className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-600 via-orange-500 to-cyan-500 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <GitCompareArrowsIcon size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">Compare Products</h3>
                                <p className="text-orange-100 text-xs">AI-powered natural language comparison</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <XIcon size={16} className="text-white" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Product Selectors */}
                        <div className="p-6 pb-4 border-b border-slate-100">
                            <div className="grid grid-cols-2 gap-4">
                                {[0, 1].map(idx => (
                                    <div key={idx}>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Product {idx === 0 ? 'A' : 'B'}
                                        </p>
                                        {selectedProducts[idx] ? (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
                                                    {selectedProducts[idx].images?.[0] ? (
                                                        <Image src={selectedProducts[idx].images[0]} alt="" width={400} height={300} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <SparklesIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{selectedProducts[idx].name}</p>
                                                    <p className="text-[10px] text-slate-400">${selectedProducts[idx].price}</p>
                                                </div>
                                                <button onClick={() => handleSelectProduct(idx, null)} className="text-slate-400 hover:text-red-500">
                                                    <XIcon size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                onChange={(e) => e.target.value && handleSelectProduct(idx, e.target.value)}
                                                className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-orange-400 bg-white text-slate-600"
                                                value=""
                                            >
                                                <option value="">Choose a product...</option>
                                                {products.map(p => (
                                                    <option key={p._id || p.id} value={p._id || p.id}>{p.name} — ${p.price}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison Table */}
                        {showTable && selectedProducts[0] && selectedProducts[1] && (
                            <div className="px-6 pt-4">
                                {/* Product headers */}
                                <div className="grid grid-cols-3 gap-4 mb-2">
                                    <div />
                                    {[0, 1].map(idx => (
                                        <div key={idx} className="text-center">
                                            <p className="text-xs font-bold text-slate-700">{selectedProducts[idx].name}</p>
                                        </div>
                                    ))}
                                </div>
                                {(() => {
                                    const { features } = generateComparison(selectedProducts[0], selectedProducts[1], '')
                                    return features.map((f, i) => (
                                        <ComparisonRow key={i} {...f} />
                                    ))
                                })()}

                                {/* Add to cart buttons */}
                                <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                                    <div />
                                    {[0, 1].map(idx => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAddToCart(selectedProducts[idx])}
                                            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-orange-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                                        >
                                            <ShoppingCartIcon size={13} />
                                            Add to Cart
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        {chatMessages.length > 0 && (
                            <div className="px-6 py-4">
                                {chatMessages.map((msg, i) => (
                                    <ChatMessage key={i} message={msg} index={i} />
                                ))}
                                {loading && (
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                                            <Loader2Icon size={13} className="text-white animate-spin" />
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm">
                                            <p className="text-xs text-slate-400">Analyzing products...</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    {selectedProducts[0] && selectedProducts[1] && (
                        <div className="px-6 pb-4 pt-2 border-t border-slate-100 bg-white">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                                <SparklesIcon size={14} className="text-orange-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                    placeholder="Ask about these products..."
                                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                                    disabled={loading}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || loading}
                                    className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md disabled:opacity-40 transition-all"
                                >
                                    <SendIcon size={14} />
                                </motion.button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {['Which is cheaper?', 'Better reviews?', 'Any deals?'].map(q => (
                                    <button key={q} onClick={() => handleSend(q)} className="text-[10px] text-orange-500 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-full transition font-medium">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
