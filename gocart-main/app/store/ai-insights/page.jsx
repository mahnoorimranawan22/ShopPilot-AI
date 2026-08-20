'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { SparklesIcon, TrendingUpIcon, LightbulbIcon, BarChart3Icon } from "lucide-react"

export default function AIInsights() {

    const [loading, setLoading] = useState(true)
    const [insights, setInsights] = useState(null)

    useEffect(() => {
        setTimeout(() => {
            setInsights({
                trendingProducts: [
                    { name: 'Apple AirPods Pro', trend: '+34% this week', confidence: 92 },
                    { name: 'Sony WH-1000XM5', trend: '+21% this week', confidence: 88 },
                    { name: 'Casio G-Shock', trend: '+18% this week', confidence: 85 },
                ],
                recommendations: [
                    { title: 'Bundle earbuds with phone cases', impact: 'Could increase AOV by 15%', type: 'cross-sell' },
                    { title: 'Run flash sale on watches', impact: 'Watches have 40% margin, high demand', type: 'promotion' },
                    { title: 'Restock Logitech MX Master', impact: 'Only 3 units left, selling 2/day', type: 'inventory' },
                    { title: 'Add wireless charging pads', impact: 'High search volume in your categories', type: 'expansion' },
                ],
                priceOptimization: [
                    { name: 'JBL Charge 5', currentPrice: 139.95, suggestedPrice: 149.99, reason: 'Competitors at $155-170' },
                    { name: 'Canon EOS R50', currentPrice: 529.99, suggestedPrice: 499.99, reason: 'Price elasticity suggests volume increase' },
                ],
                demandForecast: [
                    { period: 'Next Week', expected: '$2,400', confidence: 87 },
                    { period: 'Next Month', expected: '$9,800', confidence: 72 },
                    { period: 'Q4 Holiday', expected: '$45,000', confidence: 65 },
                ],
            })
            setLoading(false)
        }, 800)
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl">AI <span className="text-slate-800 font-medium">Insights</span></h1>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <SparklesIcon size={12} /> Powered by ShopPilot AI
                </span>
            </div>

            {/* Trending Products */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUpIcon size={18} className="text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Trending in Your Store</h3>
                </div>
                <div className="space-y-3">
                    {insights.trendingProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{product.name}</p>
                                <p className="text-xs text-green-600">{product.trend}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Confidence</p>
                                <div className="w-16 h-2 bg-slate-200 rounded-full mt-1">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${product.confidence}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <LightbulbIcon size={18} className="text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Smart Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 border border-slate-100 rounded-lg hover:border-indigo-200 transition">
                            <div className="flex items-start gap-3">
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded capitalize shrink-0">
                                    {rec.type}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{rec.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{rec.impact}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Optimization */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3Icon size={18} className="text-violet-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Price Optimization</h3>
                </div>
                <div className="space-y-3">
                    {insights.priceOptimization.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.reason}</p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <span className="text-sm text-slate-400 line-through">${item.currentPrice}</span>
                                <span className="text-sm font-bold text-indigo-600">${item.suggestedPrice}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demand Forecast */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon size={18} className="text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Demand Forecast</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {insights.demandForecast.map((forecast, index) => (
                        <div key={index} className="text-center p-4 bg-white/80 rounded-lg">
                            <p className="text-xs text-slate-500">{forecast.period}</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">{forecast.expected}</p>
                            <p className="text-xs text-indigo-600 mt-1">{forecast.confidence}% confidence</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
