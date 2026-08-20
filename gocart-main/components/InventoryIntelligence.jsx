'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    SparklesIcon, AlertTriangleIcon, PackageIcon, TrendingUpIcon,
    ClockIcon, CheckCircleIcon, Loader2Icon, RefreshCwIcon,
    ShoppingCartIcon, BarChart3Icon, ArrowDownIcon, ArrowUpIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'

// ─── Health Badge ────────────────────────────────────────────
function HealthBadge({ health }) {
    const config = {
        out_of_stock: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Out of Stock' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', icon: '!', label: 'Critical' },
        warning: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⚠', label: 'Low Stock' },
        attention: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '↻', label: 'Restock Soon' },
        low: { bg: 'bg-orange-50', text: 'text-orange-600', icon: '•', label: 'Getting Low' },
        healthy: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '✓', label: 'Healthy' },
    }
    const c = config[health] || config.healthy
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {c.icon} {c.label}
        </span>
    )
}

// ─── Velocity Bar ────────────────────────────────────────────
function VelocityBar({ daily, max }) {
    const width = max > 0 ? Math.min((daily / max) * 100, 100) : 0
    return (
        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.6 }}
                className={`h-full rounded-full ${daily > 2 ? 'bg-indigo-500' : daily > 0.5 ? 'bg-blue-400' : 'bg-slate-300'}`}
            />
        </div>
    )
}

// ─── Days Left Indicator ─────────────────────────────────────
function DaysLeftIndicator({ days, status }) {
    const colors = {
        critical: 'text-red-600 font-bold',
        warning: 'text-amber-600 font-semibold',
        attention: 'text-yellow-600',
        healthy: 'text-emerald-600',
        no_sales: 'text-slate-400',
    }

    return (
        <div className={`flex items-center gap-1 text-xs ${colors[status] || 'text-slate-500'}`}>
            <ClockIcon size={12} />
            {days !== null ? (
                <span>{days}d left</span>
            ) : (
                <span>No sales</span>
            )}
        </div>
    )
}

// ─── Alert Card ──────────────────────────────────────────────
function AlertCard({ alert, index }) {
    const colors = {
        critical: 'border-red-200 bg-red-50',
        warning: 'border-amber-200 bg-amber-50',
        attention: 'border-yellow-200 bg-yellow-50',
    }

    const icons = {
        critical: <AlertTriangleIcon size={16} className="text-red-500" />,
        warning: <AlertTriangleIcon size={16} className="text-amber-500" />,
        attention: <PackageIcon size={16} className="text-yellow-500" />,
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-xl p-4 ${colors[alert.type] || colors.warning}`}
        >
            <div className="flex items-center gap-2 mb-2">
                {icons[alert.type]}
                <span className="text-sm font-bold text-slate-800">{alert.title}</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">{alert.message}</p>
            <div className="space-y-2">
                {alert.products?.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-700">{p.name}</span>
                            <span className="text-[10px] text-slate-400">({p.stock} left)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {p.daysLeft !== null && (
                                <span className="text-[10px] text-slate-500">~{p.daysLeft}d</span>
                            )}
                            {p.restock > 0 && (
                                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                    Order {p.restock}+
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

// ─── Main Component ──────────────────────────────────────────
export default function InventoryIntelligence() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const result = await aiAPI.inventoryIntelligence()
            setData(result)
        } catch {
            // Fallback demo data
            setData(generateDemoData())
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
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data) return null

    const maxVelocity = Math.max(...(data.products || []).map(p => p.dailyVelocity), 1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <PackageIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">🔮 Inventory Intelligence</h3>
                        <p className="text-xs text-slate-500">AI-powered stock analysis with velocity tracking</p>
                    </div>
                </div>
                <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCwIcon size={12} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Stock', value: data.summary.totalStock, icon: PackageIcon, color: 'text-indigo-500' },
                    { label: 'Stock Value', value: `$${data.summary.totalValue.toLocaleString()}`, icon: BarChart3Icon, color: 'text-emerald-500' },
                    { label: 'Low Stock', value: data.summary.lowStockCount, icon: AlertTriangleIcon, color: data.summary.lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400' },
                    { label: 'Out of Stock', value: data.summary.outOfStockCount, icon: ArrowDownIcon, color: data.summary.outOfStockCount > 0 ? 'text-red-500' : 'text-slate-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 rounded-xl p-4 text-center"
                    >
                        <stat.icon size={16} className={`mx-auto mb-1 ${stat.color}`} />
                        <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                        <p className="text-[10px] text-slate-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Alerts */}
            {data.alerts && data.alerts.length > 0 && (
                <div className="space-y-3">
                    {data.alerts.map((alert, i) => (
                        <AlertCard key={i} alert={alert} index={i} />
                    ))}
                </div>
            )}

            {/* Product Inventory Table */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUpIcon size={16} className="text-indigo-500" />
                        <h4 className="text-sm font-bold text-slate-700">Product Inventory Analysis</h4>
                    </div>
                    <span className="text-[10px] text-slate-400">{data.products.length} products</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-slate-400 text-left bg-slate-50">
                                <th className="px-4 py-2 font-medium">Product</th>
                                <th className="px-4 py-2 font-medium">Stock</th>
                                <th className="px-4 py-2 font-medium">Velocity</th>
                                <th className="px-4 py-2 font-medium">Stock-Out</th>
                                <th className="px-4 py-2 font-medium">Restock</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products.map((product, i) => (
                                <motion.tr
                                    key={product._id || i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {product.image ? (
                                                <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <PackageIcon size={14} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-700 max-w-[150px] truncate">{product.name}</p>
                                                {product.brand && <p className="text-[10px] text-slate-400">{product.brand}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className={`font-semibold ${product.currentStock < 10 ? 'text-red-600' : product.currentStock < 30 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                {product.currentStock}
                                            </span>
                                            <span className="text-slate-400">units</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <VelocityBar daily={product.dailyVelocity} max={maxVelocity} />
                                            <span className="text-slate-600 font-medium">{product.dailyVelocity}/d</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <DaysLeftIndicator days={product.daysUntilStockOut} status={product.stockOutStatus} />
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.recommendedRestock > 0 ? (
                                            <span className="text-indigo-600 font-semibold">{product.recommendedRestock} units</span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <HealthBadge health={product.health} />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── Demo Data (fallback) ────────────────────────────────────
function generateDemoData() {
    const products = [
        { name: 'Sony WH-1000XM5', category: 'Headphones', brand: 'Sony', price: 279.99, stock: 8, dailyVelocity: 2.3, weeklyVelocity: 16.1, monthlySold: 69, daysUntilStockOut: 3, stockOutStatus: 'critical', recommendedRestock: 50, health: 'critical' },
        { name: 'Apple AirPods Pro', category: 'Earbuds', brand: 'Apple', price: 199.00, stock: 45, dailyVelocity: 3.8, weeklyVelocity: 26.6, monthlySold: 114, daysUntilStockOut: 11, stockOutStatus: 'attention', recommendedRestock: 80, health: 'attention' },
        { name: 'Casio G-Shock GA2100', category: 'Watch', brand: 'Casio', price: 69.99, stock: 3, dailyVelocity: 1.5, weeklyVelocity: 10.5, monthlySold: 45, daysUntilStockOut: 2, stockOutStatus: 'critical', recommendedRestock: 40, health: 'critical' },
        { name: 'JBL Charge 5', category: 'Speakers', brand: 'JBL', price: 139.95, stock: 78, dailyVelocity: 1.2, weeklyVelocity: 8.4, monthlySold: 36, daysUntilStockOut: 65, stockOutStatus: 'healthy', recommendedRestock: 0, health: 'healthy' },
        { name: 'Logitech MX Master 3S', category: 'Mouse', brand: 'Logitech', price: 79.99, stock: 95, dailyVelocity: 1.8, weeklyVelocity: 12.6, monthlySold: 54, daysUntilStockOut: 52, stockOutStatus: 'healthy', recommendedRestock: 0, health: 'healthy' },
        { name: 'Dyson V15 Detect', category: 'Home', brand: 'Dyson', price: 599.99, stock: 5, dailyVelocity: 0.8, weeklyVelocity: 5.6, monthlySold: 24, daysUntilStockOut: 6, stockOutStatus: 'warning', recommendedRestock: 20, health: 'warning' },
        { name: 'Canon EOS R50', category: 'Camera', brand: 'Canon', price: 529.99, stock: 18, dailyVelocity: 0.5, weeklyVelocity: 3.5, monthlySold: 15, daysUntilStockOut: 36, stockOutStatus: 'healthy', recommendedRestock: 0, health: 'healthy' },
        { name: 'Samsung 34" Monitor', category: 'Monitor', brand: 'Samsung', price: 399.99, stock: 0, dailyVelocity: 0.3, weeklyVelocity: 2.1, monthlySold: 9, daysUntilStockOut: 0, stockOutStatus: 'critical', recommendedRestock: 15, health: 'out_of_stock' },
    ]

    return {
        summary: {
            totalProducts: 8,
            totalStock: 252,
            totalValue: 68445,
            lowStockCount: 4,
            outOfStockCount: 1,
            healthyCount: 3,
            avgDailyVelocity: 1.5,
        },
        products,
        alerts: [
            {
                type: 'critical',
                title: 'Critical: Immediate Restocking Needed',
                message: '3 products need immediate restocking!',
                products: [
                    { name: 'Samsung 34" Monitor', stock: 0, daysLeft: 0, restock: 15 },
                    { name: 'Casio G-Shock GA2100', stock: 3, daysLeft: 2, restock: 40 },
                    { name: 'Sony WH-1000XM5', stock: 8, daysLeft: 3, restock: 50 },
                ],
            },
            {
                type: 'warning',
                title: 'Warning: Low Stock Alert',
                message: '1 product is running low.',
                products: [
                    { name: 'Dyson V15 Detect', stock: 5, daysLeft: 6, restock: 20 },
                ],
            },
            {
                type: 'attention',
                title: 'Attention: Plan Restocking Soon',
                message: '1 product needs restocking within 2 weeks.',
                products: [
                    { name: 'Apple AirPods Pro', stock: 45, daysLeft: 11, restock: 80 },
                ],
            },
        ],
    }
}
