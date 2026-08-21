'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { SunIcon, MoonIcon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function DarkModeToggle({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme()

    if (!mounted) return null

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${className}`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SunIcon size={18} className="text-amber-400" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: 90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: -90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MoonIcon size={18} className="text-orange-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
