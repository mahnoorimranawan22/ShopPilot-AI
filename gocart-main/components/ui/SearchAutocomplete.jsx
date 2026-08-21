'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, XIcon, ClockIcon, TrendingUpIcon, ArrowRightIcon, MicIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { productDummyData } from '@/assets/assets'
import { useVoiceSearch } from './useVoiceSearch'
import toast from 'react-hot-toast'

const TRENDING = ['Headphones', 'Smart Watch', 'Wireless', 'Gaming', 'Camera']
const MAX_RECENT = 5

export default function SearchAutocomplete({ className = '' }) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const inputRef = useRef(null)
    const wrapperRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
        const saved = localStorage.getItem('shoppilot-recent-searches')
        if (saved) setRecentSearches(JSON.parse(saved))
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getSuggestions = useCallback((q) => {
        if (!q.trim()) {
            setSuggestions([])
            return
        }
        const lower = q.toLowerCase()
        const matches = productDummyData
            .filter(p => p.name.toLowerCase().includes(lower) || p.category?.toLowerCase().includes(lower))
            .slice(0, 5)
            .map(p => ({ text: p.name, type: 'product', category: p.category }))
        setSuggestions(matches)
    }, [])

    const handleChange = (e) => {
        const val = e.target.value
        setQuery(val)
        getSuggestions(val)
    }

    const saveRecent = (term) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT)
        setRecentSearches(updated)
        localStorage.setItem('shoppilot-recent-searches', JSON.stringify(updated))
    }

    const handleSearch = (term) => {
        const search = term || query
        if (!search.trim()) return
        saveRecent(search.trim())
        setIsOpen(false)
        router.push(`/shop?search=${encodeURIComponent(search.trim())}`)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch()
    }

    const clearRecent = () => {
        setRecentSearches([])
        localStorage.removeItem('shoppilot-recent-searches')
    }

    const removeRecent = (term) => {
        const updated = recentSearches.filter(s => s !== term)
        setRecentSearches(updated)
        localStorage.setItem('shoppilot-recent-searches', JSON.stringify(updated))
    }

    const showDropdown = isOpen && (query.trim() || recentSearches.length > 0 || suggestions.length > 0)

    // Voice search
    const handleVoiceResult = useCallback((text) => {
        setQuery(text)
        getSuggestions(text)
        // Auto-search after voice input
        setTimeout(() => handleSearch(text), 200)
    }, [getSuggestions])

    const handleVoiceError = useCallback((msg) => {
        toast.error(msg)
    }, [])

    const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceSearch({
        onResult: handleVoiceResult,
        onError: handleVoiceError,
    })

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <SearchIcon size={18} className="text-slate-400 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, brands, categories..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none ml-2"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }} className="text-slate-400 hover:text-slate-600">
                        <XIcon size={16} />
                    </button>
                )}
                {voiceSupported && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleListening() }}
                        className={`ml-1 flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                            isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
                        }`}
                        title={isListening ? 'Listening...' : 'Voice search'}
                    >
                        <MicIcon size={15} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                    >
                        {/* Search suggestions */}
                        {suggestions.length > 0 && (
                            <div className="p-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Suggestions</p>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setQuery(s.text); handleSearch(s.text) }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-left"
                                    >
                                        <SearchIcon size={14} className="text-slate-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{s.text}</p>
                                            {s.category && <p className="text-[10px] text-slate-400">{s.category}</p>}
                                        </div>
                                        <ArrowRightIcon size={14} className="text-slate-300 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Recent searches */}
                        {!query.trim() && recentSearches.length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center justify-between px-3 py-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</p>
                                    <button onClick={clearRecent} className="text-[10px] text-orange-500 hover:text-orange-500 font-medium">Clear all</button>
                                </div>
                                {recentSearches.map((term, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <ClockIcon size={14} className="text-slate-300 shrink-0" />
                                        <button onClick={() => { setQuery(term); handleSearch(term) }} className="flex-1 text-left text-sm text-slate-600 truncate">{term}</button>
                                        <button onClick={() => removeRecent(term)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <XIcon size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Trending */}
                        {!query.trim() && (
                            <div className="p-2 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Trending</p>
                                <div className="flex flex-wrap gap-1.5 px-3 py-2">
                                    {TRENDING.map(term => (
                                        <button
                                            key={term}
                                            onClick={() => { setQuery(term); handleSearch(term) }}
                                            className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-500 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            <TrendingUpIcon size={10} />
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {query.trim() && suggestions.length === 0 && (
                            <div className="p-6 text-center">
                                <p className="text-sm text-slate-400">No results for "{query}"</p>
                                <button onClick={() => handleSearch()} className="mt-2 text-xs font-medium text-orange-500 hover:text-orange-600">
                                    Search anyway →
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
