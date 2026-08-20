'use client'

export default function SectionCard({ title, subtitle, action, children, className = '' }) {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    )
}
