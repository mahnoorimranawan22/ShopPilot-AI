'use client'
import { Suspense, useEffect, useState, useCallback } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, SlidersHorizontalIcon, XIcon, SearchIcon, ChevronDownIcon, MicIcon } from "lucide-react"
import VisualSearchButton from "@/components/VisualSearchButton"
import { useVoiceSearch } from "@/components/ui/useVoiceSearch"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { fetchProducts, setProduct } from "@/lib/features/product/productSlice"
import { productDummyData } from "@/assets/assets"

import PageTransition from '@/components/ui/PageTransition'

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || ''
    const router = useRouter()
    const dispatch = useDispatch()

    const { list: products, loading } = useSelector(state => state.product)

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState(categoryParam)
    const [selectedBrand, setSelectedBrand] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [showFilters, setShowFilters] = useState(false)
    const [searchInput, setSearchInput] = useState(search)
    const [suggestions, setSuggestions] = useState([])

    // Categories & brands derived from products
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean).sort()
    const brands = [...new Set(products.map(p => p.brand))].filter(Boolean).sort()

    // Fetch products on filter change
    useEffect(() => {
        const params = {}
        if (search) params.search = search
        if (selectedCategory) params.category = selectedCategory
        if (selectedBrand) params.brand = selectedBrand
        params.sort = sortBy
        params.order = sortOrder

        dispatch(fetchProducts(params)).unwrap().catch(() => {
            // Fallback to local dummy data when API unavailable
            dispatch(setProduct(productDummyData))
        })
    }, [dispatch, search, selectedCategory, selectedBrand, sortBy, sortOrder])

    // Set category from URL param
    useEffect(() => {
        setSelectedCategory(categoryParam)
    }, [categoryParam])

    // Search autocomplete
    const handleSearchInput = useCallback(async (value) => {
        setSearchInput(value)
        if (value.length < 2) {
            setSuggestions([])
            return
        }
        try {
            const res = await fetch(`http://localhost:5000/api/ai/search-suggestions?q=${encodeURIComponent(value)}`)
            if (res.ok) {
                const data = await res.json()
                setSuggestions(data.suggestions || [])
            }
        } catch {
            // Fallback: local filter
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5).map(p => ({ type: 'product', text: p.name, id: p._id || p.id }))
            setSuggestions(matches)
        }
    }, [products])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setSuggestions([])
        if (searchInput) {
            router.push(`/shop?search=${encodeURIComponent(searchInput)}`)
        } else {
            router.push('/shop')
        }
    }

    // Client-side filtering for local fallback data
    const filteredProducts = products.filter(p => {
        if (selectedCategory && p.category !== selectedCategory) return false
        if (selectedBrand && p.brand !== selectedBrand) return false
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false
        return true
    })

    const activeFilterCount = [selectedCategory, selectedBrand, priceRange[0] > 0, priceRange[1] < 1000].filter(Boolean).length

    // Voice search
    const handleVoiceResult = useCallback((text) => {
        setSearchInput(text)
        handleSearchInput(text)
        // Auto-search after voice input
        setTimeout(() => {
            router.push(`/shop?search=${encodeURIComponent(text)}`)
        }, 200)
    }, [handleSearchInput, router])

    const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceSearch({
        onResult: handleVoiceResult,
        onError: (msg) => toast.error(msg),
    })

    return (
        <PageTransition>
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between my-6">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer">
                        {search && <MoveLeftIcon size={20} />}
                        All <span className="text-slate-700 font-medium">Products</span>
                        {search && <span className="text-sm text-slate-400">— &quot;{search}&quot;</span>}
                    </h1>
                    <div className="flex items-center gap-3">
                        <VisualSearchButton />
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                            <SlidersHorizontalIcon size={16} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                            )}
                        </button>
                        <select value={`${sortBy}-${sortOrder}`} onChange={(e) => {
                            const [s, o] = e.target.value.split('-')
                            setSortBy(s)
                            setSortOrder(o)
                        }} className="text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-lg outline-none">
                            <option value="createdAt-desc">Newest</option>
                            <option value="createdAt-asc">Oldest</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="avgRating-desc">Top Rated</option>
                            <option value="soldCount-desc">Best Selling</option>
                        </select>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 gap-3">
                        <SearchIcon size={18} className="text-slate-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Search products, brands, categories..."
                            className="flex-1 outline-none text-sm"
                        />
                        {searchInput && (
                            <button type="button" onClick={() => { setSearchInput(''); setSuggestions([]); router.push('/shop') }} className="text-slate-400 hover:text-slate-600">
                                <XIcon size={16} />
                            </button>
                        )}
                        {voiceSupported && (
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); toggleListening() }}
                                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                                    isListening
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
                                }`}
                                title={isListening ? 'Listening...' : 'Voice search'}
                            >
                                <MicIcon size={16} />
                            </button>
                        )}
                        <button type="submit" className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600 transition">Search</button>
                    </form>
                    {/* Autocomplete dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 shadow-lg z-50 overflow-hidden">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => {
                                    if (s.type === 'product') {
                                        router.push(`/product/${s.id}`)
                                    } else if (s.type === 'category') {
                                        setSelectedCategory(s.text)
                                        setSuggestions([])
                                    } else {
                                        setSearchInput(s.text)
                                        router.push(`/shop?search=${encodeURIComponent(s.text)}`)
                                    }
                                }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition text-left">
                                    <span className="text-xs text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">{s.type}</span>
                                    <span>{s.text}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-slate-700">Filters</h3>
                            <button onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setPriceRange([0, 1000]) }} className="text-xs text-orange-500 hover:text-orange-600">Clear all</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Categories */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Category</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    <button onClick={() => setSelectedCategory('')} className={`block text-sm w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-orange-50 text-orange-500 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>All</button>
                                    {categories.map(cat => (
                                        <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} className={`block text-sm w-full text-left px-2 py-1 rounded ${selectedCategory === cat ? 'bg-orange-50 text-orange-500 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Brands */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Brand</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    <button onClick={() => setSelectedBrand('')} className={`block text-sm w-full text-left px-2 py-1 rounded ${!selectedBrand ? 'bg-orange-50 text-orange-500 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>All</button>
                                    {brands.map(brand => (
                                        <button key={brand} onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)} className={`block text-sm w-full text-left px-2 py-1 rounded ${selectedBrand === brand ? 'bg-orange-50 text-orange-500 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{brand}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Price Range */}
                            <div className="col-span-2">
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Price Range</p>
                                <div className="flex items-center gap-3">
                                    <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-24 text-sm p-2 border border-slate-200 rounded outline-none" placeholder="Min" />
                                    <span className="text-slate-400">—</span>
                                    <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-24 text-sm p-2 border border-slate-200 rounded outline-none" placeholder="Max" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active filter chips */}
                {(selectedCategory || selectedBrand) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedCategory && (
                            <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory('')}><XIcon size={12} /></button>
                            </span>
                        )}
                        {selectedBrand && (
                            <span className="flex items-center gap-1 text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full">
                                {selectedBrand}
                                <button onClick={() => setSelectedBrand('')}><XIcon size={12} /></button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results count */}
                <p className="text-sm text-slate-400 mb-4">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-200 h-40 sm:w-60 sm:h-68 rounded-lg" />
                                <div className="bg-slate-200 h-4 w-32 rounded mt-3" />
                                <div className="bg-slate-200 h-4 w-20 rounded mt-2" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <p className="text-xl font-semibold text-slate-500 mb-2">No products found</p>
                        <p className="text-sm mb-6">Try adjusting your filters or search term</p>
                        <button onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setSearchInput(''); router.push('/shop') }} className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm hover:bg-orange-600 transition">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
        </PageTransition>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-slate-400">Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}
