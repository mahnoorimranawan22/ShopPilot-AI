'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUpIcon, TrendingDownIcon, ClockIcon, ZapIcon,
    AlertTriangleIcon, CheckCircleIcon, BarChart3Icon, ArrowUpIcon, ArrowDownIcon
} from 'lucide-react'

// ─── Price Trend Sparkline (SVG) ─────────────────────────────
function PriceSparkline({ data = [], width = 120, height = 36 }) {
    if (!data.length) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1 || 1)

    const points = data.map((val, i) => {
        const x = i * stepX
        const y = height - ((val - min) / range) * (height - 4) - 2
        return `${x},${y}`
    }).join(' ')

    const currentPrice = data[data.length - 1]
    const prevPrice = data[data.length - 2] || currentPrice
    const isRising = currentPrice > prevPrice

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                <linearGradient id={`sparkGrad-${isRising ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isRising ? '#ef4444' : '#22c55e'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isRising ? '#ef4444' : '#22c55e'} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={isRising ? '#ef4444' : '#22c55e'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
                cx={(data.length - 1) * stepX}
                cy={height - ((currentPrice - min) / range) * (height - 4) - 2}
                r="3"
                fill={isRising ? '#ef4444' : '#22c55e'}
            />
        </svg>
    )
}

// ─── Price Intelligence Badge ─────────────────────────────────
export function PriceIntelligenceBadge({ product, compact = false }) {
    const [data, setData] = useState(null)

    useEffect(() => {
        // Generate price intelligence data from product
        if (product) {
            const basePrice = product.price || 29
            const mrp = product.mrp || basePrice * 1.4

            // Simulate 12-month price history
            const months = 12
            const priceHistory = []
            for (let i = 0; i < months; i++) {
                const variance = (Math.sin(i * 0.8) * 0.15 + Math.random() * 0.1) * basePrice
                priceHistory.push(Math.round(basePrice + variance))
            }
            priceHistory[months - 1] = basePrice // Current price

            const avgPrice = Math.round(priceHistory.reduce((a, b) => a + b, 0) / months)
            const lowestPrice = Math.min(...priceHistory)
            const highestPrice = Math.max(...priceHistory)

            // Determine recommendation
            const priceVsAvg = basePrice / avgPrice
            const priceVsLow = basePrice / lowestPrice
            const trend = priceHistory.slice(-3)
            const isTrendingDown = trend[2] < trend[0]

            let recommendation, reason, color, icon

            if (priceVsLow <= 1.05 && isTrendingDown) {
                recommendation = 'BUY NOW'
                reason = 'Near lowest price in 12 months'
                color = 'emerald'
                icon = 'ZapIcon'
            } else if (isTrendingDown && priceVsAvg < 0.92) {
                recommendation = 'BUY NOW'
                reason = 'Price is below average and dropping'
                color = 'emerald'
                icon = 'ZapIcon'
            } else if (priceVsAvg > 1.1) {
                recommendation = 'WAIT'
                reason = `Currently ${Math.round((priceVsAvg - 1) * 100)}% above average`
                color = 'amber'
                icon = 'ClockIcon'
            } else if (!isTrendingDown && priceVsLow > 1.15) {
                recommendation = 'WAIT'
                reason = 'Price trend is rising'
                color = 'amber'
                icon = 'ClockIcon'
            } else {
                recommendation = 'FAIR PRICE'
                reason = 'Price is near the 12-month average'
                color = 'blue'
                icon = 'CheckCircleIcon'
            }

            setData({
                priceHistory,
                avgPrice,
                lowestPrice,
                highestPrice,
                recommendation,
                reason,
                color,
                savingsFromHigh: mrp - basePrice,
                priceVsAvg: Math.round(priceVsAvg * 100),
            })
        }
    }, [product])

    if (!data) return null

    const colorMap = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            badge: 'bg-emerald-500',
            icon: 'text-emerald-500',
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            badge: 'bg-amber-500',
            icon: 'text-amber-500',
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            badge: 'bg-blue-500',
            icon: 'text-blue-500',
        },
    }

    const colors = colorMap[data.color] || colorMap.blue
    const IconComp = data.color === 'emerald' ? ZapIcon
        : data.color === 'amber' ? ClockIcon : CheckCircleIcon

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${colors.bg} ${colors.border} border ${colors.text}`}
            >
                <IconComp size={10} />
                {data.recommendation}
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${colors.badge} bg-opacity-20 flex items-center justify-center`}>
                        <IconComp size={16} className={colors.icon} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${colors.text}`}>{data.recommendation}</p>
                        <p className="text-[10px] text-slate-500">{data.reason}</p>
                    </div>
                </div>
                <PriceSparkline data={data.priceHistory} width={80} height={30} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                    <p className="text-[10px] text-slate-400 uppercase">Avg Price</p>
                    <p className="text-sm font-bold text-slate-700">${data.avgPrice}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase">Lowest</p>
                    <p className="text-sm font-bold text-emerald-600">${data.lowestPrice}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase">Highest</p>
                    <p className="text-sm font-bold text-slate-700">${data.highestPrice}</p>
                </div>
            </div>

            {data.savingsFromHigh > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                    <TrendingDownIcon size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 font-medium">
                        Save ${data.savingsFromHigh} vs. maximum price
                    </span>
                </div>
            )}
        </motion.div>
    )
}

// ─── Full Price Trend Chart (for product page) ───────────────
export function PriceTrendChart({ product }) {
    const [data, setData] = useState(null)
    const [period, setPeriod] = useState('12m')

    useEffect(() => {
        if (!product) return
        const basePrice = product.price || 29
        const periods = { '1m': 4, '3m': 8, '6m': 12, '12m': 24 }
        const count = periods[period] || 12

        const priceData = []
        for (let i = 0; i < count; i++) {
            const variance = (Math.sin(i * 0.6) * 0.12 + Math.random() * 0.08) * basePrice
            priceData.push(Math.round(basePrice + variance))
        }
        priceData[count - 1] = basePrice

        setData(priceData)
    }, [product, period])

    if (!data) return null

    const width = 500
    const height = 160
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    const min = Math.min(...data) * 0.95
    const max = Math.max(...data) * 1.05
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartW
        const y = padding.top + chartH - ((val - min) / range) * chartH
        return { x, y, val }
    })

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

    const currentPrice = data[data.length - 1]
    const avgPrice = Math.round(data.reduce((a, b) => a + b, 0) / data.length)

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-800">Price History</h4>
                    <p className="text-xs text-slate-400">12-month price trend analysis</p>
                </div>
                <div className="flex gap-1">
                    {['1m', '3m', '6m', '12m'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition ${
                                period === p
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padding.top + chartH * (1 - pct)
                    const val = Math.round(min + range * pct)
                    return (
                        <g key={i}>
                            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                            <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">${val}</text>
                        </g>
                    )
                })}

                {/* Area fill */}
                <path d={areaD} fill="url(#priceAreaGrad)" />

                {/* Price line */}
                <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Average line */}
                <line
                    x1={padding.left}
                    y1={padding.top + chartH - ((avgPrice - min) / range) * chartH}
                    x2={padding.left + chartW}
                    y2={padding.top + chartH - ((avgPrice - min) / range) * chartH}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                />

                {/* Current price dot */}
                <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="5"
                    fill="#f97316"
                    stroke="white"
                    strokeWidth="2"
                />

                {/* Current price label */}
                <text
                    x={points[points.length - 1].x}
                    y={points[points.length - 1].y - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#f97316"
                >
                    ${currentPrice}
                </text>

                <defs>
                    <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-orange-500 rounded" />
                    <span>Price trend</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-amber-400 rounded border-dashed" style={{ borderTop: '1px dashed #f59e0b', height: 0 }} />
                    <span>Average (${avgPrice})</span>
                </div>
            </div>
        </div>
    )
}

// ─── Merchant Dynamic Pricing Suggestion ──────────────────────
export function DynamicPricingSuggestion({ product }) {
    if (!product) return null

    const basePrice = product.price || 29
    const mrp = product.mrp || basePrice * 1.4
    const stock = product.stock ?? 50

    // Calculate optimal price
    const demandScore = Math.min(1, (product.soldCount || 10) / 50)
    const stockPressure = stock < 10 ? 1.2 : stock > 80 ? 0.85 : 1
    const suggestedPrice = Math.round(basePrice * (0.9 + demandScore * 0.2) * stockPressure)
    const minPrice = Math.round(basePrice * 0.7)
    const maxPrice = Math.round(mrp * 0.95)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <BarChart3Icon size={16} className="text-rose-500" />
                <p className="text-xs font-bold text-violet-700">AI Pricing Suggestion</p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Current Price</span>
                    <span className="text-sm font-bold text-slate-700">${basePrice}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Suggested Price</span>
                    <span className={`text-sm font-bold ${suggestedPrice > basePrice ? 'text-emerald-600' : 'text-amber-600'}`}>
                        ${suggestedPrice}
                        {suggestedPrice > basePrice ? (
                            <ArrowUpIcon size={12} className="inline ml-1" />
                        ) : (
                            <ArrowDownIcon size={12} className="inline ml-1" />
                        )}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Price Range</span>
                    <span className="text-xs text-slate-600">${minPrice} — ${maxPrice}</span>
                </div>
            </div>

            <div className="mt-3 p-2 bg-white rounded-lg border border-rose-100">
                <p className="text-[10px] text-rose-600 leading-relaxed">
                    {suggestedPrice > basePrice
                        ? `📈 Demand is strong. Consider raising to $${suggestedPrice} to maximize revenue.`
                        : stock > 80
                        ? `📉 High inventory. Consider lowering to $${suggestedPrice} to boost sales velocity.`
                        : `✅ Current pricing is competitive. Hold at $${basePrice}.`}
                </p>
            </div>
        </motion.div>
    )
}
