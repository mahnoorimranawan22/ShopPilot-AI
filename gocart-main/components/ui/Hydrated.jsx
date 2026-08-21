'use client'
import { useState, useEffect } from 'react'

export default function Hydrated({ children }) {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    if (!hydrated) {
        // Return a static placeholder that matches the initial server render
        return (
            <nav className="relative bg-white">
                <div className="mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
                        {/* Logo */}
                        <span className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-0">
                            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Shop</span>
                            <span className="text-slate-700">Pilot</span>
                            <span className="ml-1.5 text-xs font-bold px-2 py-0.5 bg-orange-500 text-white rounded-md leading-none mt-1">AI</span>
                        </span>
                        {/* Static placeholder for nav links */}
                        <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 text-sm">
                            <span className="font-medium">Home</span>
                            <span className="font-medium">Shop</span>
                            <span className="text-orange-500 font-medium">AI</span>
                            <span className="font-medium">About</span>
                            <span className="font-medium">Contact</span>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300" />
            </nav>
        )
    }

    return children
}
