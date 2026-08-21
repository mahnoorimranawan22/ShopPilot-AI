'use client'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'

export default function NavbarWrapper() {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    if (!hydrated) {
        // Server-safe placeholder: matches exactly what server renders
        // No dynamic content, no Redux state, no localStorage
        return (
            <nav className="relative bg-white">
                <div className="mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
                        <a href="/" className="relative text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-0">
                            <span className="text-orange-500">Shop</span>
                            <span className="text-slate-700">Pilot</span>
                            <span className="ml-1.5 text-xs font-bold px-2 py-0.5 bg-orange-500 text-white rounded-md leading-none mt-1">AI</span>
                        </a>
                        <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 text-sm">
                            <a href="/" className="hover:text-orange-500 transition-colors font-medium">Home</a>
                            <a href="/shop" className="hover:text-orange-500 transition-colors font-medium">Shop</a>
                            <span className="text-orange-500 font-medium">AI</span>
                            <a href="/" className="hover:text-orange-500 transition-colors font-medium">About</a>
                            <a href="/" className="hover:text-orange-500 transition-colors font-medium">Contact</a>
                            <a href="/login" className="px-8 py-2 bg-orange-500 hover:bg-orange-500 transition text-white rounded-full font-medium">Login</a>
                        </div>
                        {/* Mobile placeholder */}
                        <div className="sm:hidden flex items-center gap-3">
                            <a href="/login" className="text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300" />
            </nav>
        )
    }

    return <Navbar />
}
