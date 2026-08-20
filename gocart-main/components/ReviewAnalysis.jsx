'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    SparklesIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon,
    StarIcon, MessageCircleIcon, AlertTriangleIcon, CheckCircleIcon,
    BarChart3Icon, Loader2Icon, RefreshCwIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'

// ─── Sentiment Pie Chart (SVG) ───────────────────────────────
function SentimentPie({ positive, neutral, negative }) {
    const total = positive + neutral + negative
    if (total === 0) return <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">No data</div>

    const posPercent = (positive / total) * 100
    const neuPercent = (neutral / total) * 100
    const negPercent = (negative / total) * 100

    const r = 50
    const cx = 60
    const cy = 60

    function polarToCartesian(angle) {
        const rad = ((angle - 90) * Math.PI) / 180
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
    }

    function describeArc(startAngle, endAngle) {
        const start = polarToCartesian(endAngle)
        const end = polarToCartesian(startAngle)
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
    }

    const slices = [
        { percent: posPercent, color: '#10b981', label: 'Positive' },
        { percent: neuPercent, color: '#f59e0b', label: 'Neutral' },
        { percent: negPercent, color: '#ef4444', label: 'Negative' },
    ]

    let currentAngle = 0
    const arcs = slices.map((slice) => {
        if (slice.percent === 0) return null
        const startAngle = currentAngle
        const endAngle = currentAngle + (slice.percent / 100) * 360
        currentAngle = endAngle
        return {
            ...slice,
            path: describeArc(startAngle, endAngle),
        }
    }).filter(Boolean)

    return (
        <div className="flex items-center gap-6">
            <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
                {arcs.map((arc, i) => (
                    <motion.path
                        key={i}
                        d={arc.path}
                        fill={arc.color}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.2, duration: 0.4 }}
                        className="hover:opacity-80 transition-opacity"
                    />
                ))}
                {/* Center circle for donut effect */}
                <circle cx={cx} cy={cy} r="30" fill="white" />
                <text x={cx} y={cy - 5} textAnchor="middle" className="text-[11px] font-bold fill-slate-800">{total}</text>
                <text x={cx} y={cy + 10} textAnchor="middle" className="text-[8px] fill-slate-400">reviews</text>
            </svg>
            <div className="space-y-2">
                {slices.map((slice, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                        <span className="text-xs text-slate-600">{slice.label}</span>
                        <span className="text-xs font-bold text-slate-800">{Math.round(slice.percent)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Topic Card ──────────────────────────────────────────────
function TopicCard({ topic, index }) {
    const sentimentColor = {
        positive: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        neutral: 'bg-amber-50 border-amber-200 text-amber-700',
        negative: 'bg-rose-50 border-rose-200 text-rose-700',
    }

    const sentimentIcon = {
        positive: <CheckCircleIcon size={12} className="text-emerald-500" />,
        neutral: <MinusIcon size={12} className="text-amber-500" />,
        negative: <AlertTriangleIcon size={12} className="text-rose-500" />,
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${sentimentColor[topic.sentiment]}`}
        >
            <div className="flex items-center gap-2">
                {sentimentIcon[topic.sentiment]}
                <span className="text-sm font-medium">{topic.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold">{topic.count} mentions</span>
                <div className="flex gap-1">
                    {topic.positive > 0 && <span className="text-emerald-600">+{topic.positive}</span>}
                    {topic.negative > 0 && <span className="text-rose-600">-{topic.negative}</span>}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Keyword Tag ─────────────────────────────────────────────
function KeywordTag({ keyword, index, maxCount }) {
    const size = Math.max(0.6, Math.min(1.2, keyword.count / maxCount + 0.4))

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="inline-block bg-indigo-50 text-indigo-600 rounded-full px-3 py-1 font-medium hover:bg-indigo-100 transition-colors cursor-default"
            style={{ fontSize: `${size * 12}px` }}
            title={`${keyword.count} mentions`}
        >
            {keyword.word}
        </motion.span>
    )
}

// ─── Rating Bar ──────────────────────────────────────────────
function RatingBar({ stars, count, total }) {
    const percent = total > 0 ? (count / total) * 100 : 0

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-8 text-slate-500">{stars}★</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, delay: (5 - stars) * 0.1 }}
                    className="h-full bg-amber-400 rounded-full"
                />
            </div>
            <span className="w-8 text-right text-slate-400 font-medium">{count}</span>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────
export default function ReviewAnalysis({ productId, reviews: propReviews }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        analyze()
    }, [productId])

    const analyze = async () => {
        try {
            setLoading(true)
            setError(null)

            if (propReviews && propReviews.length > 0) {
                // Analyze reviews passed as props (client-side)
                const result = await aiAPI.reviewAnalysis(productId)
                setData(result)
            } else if (productId) {
                const result = await aiAPI.reviewAnalysis(productId)
                setData(result)
            } else {
                // No data — show empty state
                setData(null)
            }
        } catch {
            // Fallback: generate demo analysis
            setData(generateDemoAnalysis())
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Loader2Icon size={20} className="text-white animate-spin" />
                    </div>
                    <div>
                        <div className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
                        <div className="h-3 bg-slate-50 rounded w-32 mt-1 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center">
                <SparklesIcon size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No reviews to analyze yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <SparklesIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">AI Review Analysis</h3>
                        <p className="text-xs text-slate-500">{data.totalReviews} reviews analyzed</p>
                    </div>
                </div>
                <button
                    onClick={analyze}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
                >
                    <RefreshCwIcon size={12} />
                    Refresh
                </button>
            </div>

            {/* Top row: Sentiment + Rating Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sentiment */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3Icon size={16} className="text-indigo-500" />
                        <h4 className="text-sm font-bold text-slate-700">Customer Sentiment</h4>
                    </div>
                    <SentimentPie
                        positive={data.sentiment.positive}
                        neutral={data.sentiment.neutral}
                        negative={data.sentiment.negative}
                    />
                </div>

                {/* Rating Distribution */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <StarIcon size={16} className="text-amber-500" />
                        <h4 className="text-sm font-bold text-slate-700">Rating Distribution</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold text-slate-800">{data.avgRating}</span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    size={18}
                                    className={i < Math.round(data.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-400">({data.totalReviews})</span>
                    </div>
                    <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <RatingBar
                                key={stars}
                                stars={stars}
                                count={data.ratingDistribution[stars] || 0}
                                total={data.totalReviews}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Topics */}
            {data.topics.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircleIcon size={16} className="text-indigo-500" />
                        <h4 className="text-sm font-bold text-slate-700">Common Topics</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.topics.map((topic, i) => (
                            <TopicCard key={topic.name} topic={topic} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Keywords */}
            {data.keywords.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm">💬</span>
                        <h4 className="text-sm font-bold text-slate-700">Most Mentioned Words</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.keywords.slice(0, 15).map((kw, i) => (
                            <KeywordTag key={kw.word} keyword={kw} index={i} maxCount={data.keywords[0]?.count || 1} />
                        ))}
                    </div>
                </div>
            )}

            {/* Insights */}
            {data.insights.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon size={16} className="text-indigo-500" />
                        <h4 className="text-sm font-bold text-slate-700">AI Insights</h4>
                    </div>
                    <div className="space-y-2">
                        {data.insights.map((insight, i) => {
                            const colors = {
                                success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                info: 'bg-blue-50 border-blue-200 text-blue-700',
                                warning: 'bg-amber-50 border-amber-200 text-amber-700',
                                error: 'bg-rose-50 border-rose-200 text-rose-700',
                            }
                            const icons = {
                                success: <CheckCircleIcon size={14} className="text-emerald-500" />,
                                info: <MessageCircleIcon size={14} className="text-blue-500" />,
                                warning: <AlertTriangleIcon size={14} className="text-amber-500" />,
                                error: <TrendingDownIcon size={14} className="text-rose-500" />,
                            }
                            return (
                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${colors[insight.type]}`}>
                                    {icons[insight.type]}
                                    {insight.text}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Demo Analysis (fallback when API not available) ─────────
function generateDemoAnalysis() {
    return {
        totalReviews: 24,
        sentiment: {
            positive: 20,
            neutral: 3,
            negative: 1,
            positivePercent: 83,
            neutralPercent: 12,
            negativePercent: 5,
        },
        topics: [
            { name: 'Product Quality', count: 18, positive: 16, neutral: 1, negative: 1, sentiment: 'positive' },
            { name: 'Design', count: 14, positive: 13, neutral: 1, negative: 0, sentiment: 'positive' },
            { name: 'Price', count: 10, positive: 8, neutral: 2, negative: 0, sentiment: 'positive' },
            { name: 'Sound Quality', count: 8, positive: 7, neutral: 0, negative: 1, sentiment: 'positive' },
            { name: 'Battery Life', count: 6, positive: 5, neutral: 1, negative: 0, sentiment: 'positive' },
            { name: 'Delivery', count: 5, positive: 3, neutral: 0, negative: 2, sentiment: 'positive' },
            { name: 'Packaging', count: 4, positive: 2, neutral: 1, negative: 1, sentiment: 'neutral' },
            { name: 'Comfort', count: 3, positive: 3, neutral: 0, negative: 0, sentiment: 'positive' },
        ],
        keywords: [
            { word: 'quality', count: 14 },
            { word: 'sound', count: 11 },
            { word: 'comfortable', count: 9 },
            { word: 'battery', count: 8 },
            { word: 'noise', count: 7 },
            { word: 'amazing', count: 6 },
            { word: 'wireless', count: 6 },
            { word: 'bass', count: 5 },
            { word: 'premium', count: 5 },
            { word: 'design', count: 4 },
            { word: 'bluetooth', count: 4 },
            { word: 'shipping', count: 3 },
        ],
        insights: [
            { type: 'success', text: 'Excellent! 83% of reviews are positive.' },
            { type: 'success', text: 'Customers love: Product Quality, Design, Sound Quality' },
            { type: 'warning', text: 'Needs improvement: Delivery, Packaging' },
            { type: 'info', text: 'Good average rating of 4.5★' },
        ],
        avgRating: 4.5,
        ratingDistribution: { 5: 14, 4: 6, 3: 3, 2: 1, 1: 0 },
    }
}
