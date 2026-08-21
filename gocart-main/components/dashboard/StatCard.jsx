'use client'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'indigo', sparkData, suffix }) {
    const colors = {
        indigo: { bg: 'bg-orange-50', text: 'text-orange-500', ring: 'ring-orange-100' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        violet: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100' },
    }

    const c = colors[color] || colors.indigo
    const isPositive = change > 0
    const isNegative = change < 0

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} ring-1 ${c.ring} group-hover:scale-110 transition`}>
                    <Icon size={20} className={c.text} />
                </div>
                {change !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : isNegative ? 'text-rose-700 bg-rose-50' : 'text-slate-500 bg-slate-50'}`}>
                        {isPositive ? <TrendingUpIcon size={12} /> : isNegative ? <TrendingDownIcon size={12} /> : null}
                        {isPositive ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{suffix ? `${suffix}` : ''}{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{title}</p>
            {changeLabel && <p className="text-[10px] text-slate-300 mt-0.5">{changeLabel}</p>}
        </div>
    )
}
