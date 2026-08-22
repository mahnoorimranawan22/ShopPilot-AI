'use client'

export default function Sparkline({ data = [], color = '#f97316', width = 80, height = 32 }) {
    if (!data.length) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 2

    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = height - padding - ((val - min) / range) * (height - padding * 2)
        return `${x},${y}`
    }).join(' ')

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

    return (
        <svg width={width} height={height} className="inline-block">
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points.split(' ').pop()?.split(',')[0]} cy={points.split(' ').pop()?.split(',')[1]} r="2" fill={color} />
        </svg>
    )
}
