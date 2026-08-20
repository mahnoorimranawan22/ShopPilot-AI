'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon, SendIcon, BotIcon, TrendingUpIcon, TrendingDownIcon,
    AlertTriangleIcon, CheckCircleIcon, BarChart3Icon, Loader2Icon,
    ShoppingCartIcon, PackageIcon, DollarSignIcon, UsersIcon, LightbulbIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'

// ─── Quick Question Chips ────────────────────────────────────
const QUICK_QUESTIONS = [
    { text: 'What are my best-selling products?', icon: <TrendingUpIcon size={14} /> },
    { text: 'Which products should I restock?', icon: <PackageIcon size={14} /> },
    { text: 'Why did sales drop this month?', icon: <TrendingDownIcon size={14} /> },
    { text: 'What is my revenue trend?', icon: <DollarSignIcon size={14} /> },
    { text: 'Give me a business overview', icon: <BarChart3Icon size={14} /> },
    { text: 'How are my customers doing?', icon: <UsersIcon size={14} /> },
]

// ─── Insight Card ────────────────────────────────────────────
function InsightCard({ insight, index }) {
    const icons = {
        critical: <AlertTriangleIcon size={14} className="text-rose-500" />,
        warning: <AlertTriangleIcon size={14} className="text-amber-500" />,
        info: <CheckCircleIcon size={14} className="text-blue-500" />,
        success: <CheckCircleIcon size={14} className="text-emerald-500" />,
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm text-slate-700"
        >
            <span className="mt-0.5 flex-shrink-0">{icons[insight.type] || icons.info}</span>
            <span>{insight.text}</span>
        </motion.div>
    )
}

// ─── Metric Card ─────────────────────────────────────────────
function MetricCard({ label, value, change, icon: Icon }) {
    const isPositive = change && parseFloat(change) >= 0
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-3 text-center">
            <Icon size={16} className="mx-auto text-indigo-500 mb-1" />
            <p className="text-lg font-bold text-slate-800">{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
            {change !== undefined && (
                <p className={`text-[10px] font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(parseFloat(change))}%
                </p>
            )}
        </div>
    )
}

// ─── Response Bubble ─────────────────────────────────────────
function ResponseBubble({ data }) {
    return (
        <div className="flex items-start gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
                <BotIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm mb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-800">{data.title}</span>
                        {data.severity && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                data.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                                data.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {data.severity.toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Insights */}
                    <div className="space-y-1.5">
                        {data.insights?.map((text, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span className="leading-relaxed">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                {data.recommendations?.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-3 py-2.5 mb-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <LightbulbIcon size={12} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-indigo-700">Recommendations</span>
                        </div>
                        {data.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 mb-1">
                                <span className="text-indigo-400">→</span>
                                <span>{rec}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Key Metrics */}
                {data.metrics && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {data.metrics.revenue && (
                            <MetricCard
                                label="Revenue"
                                value={`$${data.metrics.revenue.current?.toFixed(0) || 0}`}
                                change={data.metrics.revenue.change}
                                icon={DollarSignIcon}
                            />
                        )}
                        {data.metrics.orders !== undefined && (
                            <MetricCard
                                label="Orders"
                                value={data.metrics.orders.current || data.metrics.orders}
                                change={data.metrics.orders.change}
                                icon={ShoppingCartIcon}
                            />
                        )}
                        {data.metrics.lowStockCount !== undefined && (
                            <MetricCard
                                label="Low Stock"
                                value={data.metrics.lowStockCount}
                                icon={PackageIcon}
                            />
                        )}
                        {data.metrics.avgOrderValue !== undefined && (
                            <MetricCard
                                label="Avg Order"
                                value={`$${data.metrics.avgOrderValue?.toFixed(0) || 0}`}
                                icon={DollarSignIcon}
                            />
                        )}
                    </div>
                )}

                {/* Top Products Table */}
                {data.metrics?.topProducts?.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-xl p-3 mt-2">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-400 text-left">
                                    <th className="pb-1 font-medium">#</th>
                                    <th className="pb-1 font-medium">Product</th>
                                    <th className="pb-1 font-medium text-right">Sold</th>
                                    <th className="pb-1 font-medium text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.metrics.topProducts.map((p, i) => (
                                    <tr key={i} className="border-t border-slate-50">
                                        <td className="py-1.5 text-slate-400">{i + 1}</td>
                                        <td className="py-1.5 font-medium text-slate-700 max-w-[150px] truncate">{p.name}</td>
                                        <td className="py-1.5 text-right font-semibold text-slate-800">{p.sold}</td>
                                        <td className="py-1.5 text-right text-slate-600">${p.revenue?.toFixed(0) || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Typing Indicator ────────────────────────────────────────
function TypingIndicator() {
    return (
        <div className="flex items-start gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
                <BotIcon size={16} className="text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-violet-400" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────
export default function BusinessInsight() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    const handleSend = async (text) => {
        const query = text || inputValue.trim()
        if (!query || isLoading) return

        setMessages(prev => [...prev, { role: 'user', content: query }])
        setInputValue('')
        setIsLoading(true)

        try {
            const result = await aiAPI.businessInsight(query)
            setMessages(prev => [...prev, { role: 'assistant', data: result }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                data: {
                    title: 'AI Business Intelligence',
                    severity: 'info',
                    insights: [
                        'I can help analyze your business data once the backend is connected with real data.',
                        'Try asking about: sales trends, restocking needs, best sellers, or revenue.',
                    ],
                    recommendations: ['Connect MongoDB and seed your store data to get real insights.'],
                },
            }])
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

    const welcomeMessage = {
        role: 'assistant',
        data: {
            title: 'AI Business Intelligence',
            severity: 'info',
            insights: [
                "Hi! I'm your AI business analyst. Ask me anything about your store's performance.",
                "I can analyze sales trends, identify restocking needs, rank your best sellers, and provide actionable business insights.",
            ],
            recommendations: ['Try one of the quick questions below to get started!'],
        },
    }

    const displayMessages = messages.length === 0 ? [welcomeMessage] : messages

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <SparklesIcon size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">AI Business Intelligence</h3>
                    <p className="text-indigo-100 text-[11px]">Ask about sales, inventory, customers, and more</p>
                </div>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 space-y-1 max-h-96 overflow-y-auto">
                {displayMessages.map((msg, i) => (
                    <div key={i}>
                        {msg.role === 'user' ? (
                            <div className="flex items-start gap-2.5 justify-end mb-3">
                                <div className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[80%] shadow-lg shadow-indigo-500/10">
                                    {msg.content}
                                </div>
                            </div>
                        ) : (
                            <ResponseBubble data={msg.data} />
                        )}
                    </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
                <div className="px-4 pb-3">
                    <p className="text-[10px] font-medium text-slate-400 mb-1.5">Quick questions</p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_QUESTIONS.map((q, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSend(q.text)}
                                className="flex items-center gap-1.5 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-[11px] font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-all"
                            >
                                {q.icon}
                                {q.text}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your business..."
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                        disabled={isLoading}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md disabled:opacity-40 disabled:shadow-none transition-all"
                    >
                        {isLoading ? <Loader2Icon size={14} className="animate-spin" /> : <SendIcon size={14} />}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
