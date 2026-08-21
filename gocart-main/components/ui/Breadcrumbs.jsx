'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRightIcon, HomeIcon } from 'lucide-react'

export default function Breadcrumbs({ items = [] }) {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 overflow-x-auto"
            aria-label="Breadcrumb"
        >
            <Link href="/" className="flex items-center gap-1 hover:text-orange-500 transition-colors shrink-0">
                <HomeIcon size={14} />
                <span>Home</span>
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 shrink-0">
                    <ChevronRightIcon size={12} className="text-slate-300" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-orange-500 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-700 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </motion.nav>
    )
}
