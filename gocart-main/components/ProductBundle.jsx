'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    PackageIcon, SparklesIcon, PlusIcon, CheckIcon,
    ShoppingCartIcon, ArrowRightIcon, TagIcon, PercentIcon
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

// ─── AI Bundle Generator ─────────────────────────────────────
function generateBundles(product, allProducts) {
    if (!product || !allProducts?.length) return []

    const bundles = []
    const category = product.category
    const brand = product.brand
    const price = product.price || 29
    const productId = product._id || product.id

    // Find complementary products (same category, different product)
    const sameCategory = allProducts
        .filter(p => (p._id || p.id) !== productId && p.category === category)
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))

    // Find popular products from related categories
    const relatedCategories = {
        'Earphones': ['Headphones', 'Speakers', 'Smartwatches'],
        'Headphones': ['Earphones', 'Speakers', 'Microphones'],
        'Smartwatches': ['Earphones', 'Fitness Bands', 'Smartphones'],
        'Speakers': ['Earphones', 'Headphones', 'Home Theater'],
        'Cameras': ['Lenses', 'Tripods', 'Memory Cards'],
        'Laptops': ['Keyboards', 'Mice', 'Monitors'],
    }

    const related = relatedCategories[category] || []
    const relatedProducts = allProducts
        .filter(p => (p._id || p.id) !== productId && related.includes(p.category))
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))

    // Bundle 1: "Frequently Bought Together" (2 items)
    if (sameCategory.length >= 1) {
        const partner = sameCategory[0]
        const bundlePrice = Math.round((price + (partner.price || 29)) * 0.9)
        const savings = Math.round((price + (partner.price || 29)) * 0.1)

        bundles.push({
            id: 'fbt',
            title: 'Frequently Bought Together',
            description: `Pair with ${partner.name}`,
            badge: '10% OFF',
            icon: '🛒',
            items: [product, partner],
            bundlePrice,
            originalPrice: price + (partner.price || 29),
            savings,
            discount: 10,
        })
    }

    // Bundle 2: "Complete Your Setup" (2-3 items)
    if (relatedProducts.length >= 1) {
        const setupItems = [product, relatedProducts[0]]
        if (relatedProducts[1]) setupItems.push(relatedProducts[1])

        const totalOriginal = setupItems.reduce((sum, p) => sum + (p.price || 29), 0)
        const bundlePrice = Math.round(totalOriginal * 0.85)
        const savings = totalOriginal - bundlePrice

        bundles.push({
            id: 'setup',
            title: 'Complete Your Setup',
            description: 'Everything you need in one bundle',
            badge: '15% OFF',
            icon: '⚡',
            items: setupItems,
            bundlePrice,
            originalPrice: totalOriginal,
            savings,
            discount: 15,
        })
    }

    // Bundle 3: "Best Value" (3+ items) if enough products
    if (sameCategory.length >= 2) {
        const valueItems = [product, sameCategory[0], sameCategory[1]]
        const totalOriginal = valueItems.reduce((sum, p) => sum + (p.price || 29), 0)
        const bundlePrice = Math.round(totalOriginal * 0.8)
        const savings = totalOriginal - bundlePrice

        bundles.push({
            id: 'best-value',
            title: 'Best Value Bundle',
            description: 'Maximum savings on 3 products',
            badge: '20% OFF',
            icon: '💎',
            items: valueItems,
            bundlePrice,
            originalPrice: totalOriginal,
            savings,
            discount: 20,
        })
    }

    return bundles
}

// ─── Bundle Card Component ───────────────────────────────────
function BundleCard({ bundle, index, onAddAll }) {
    const [added, setAdded] = useState(false)
    const currency = '$'

    const handleAdd = () => {
        onAddAll(bundle.items)
        setAdded(true)
        toast.success(`Added ${bundle.items.length} items to cart! 🎉`)
        setTimeout(() => setAdded(false), 3000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-orange-100 transition-all duration-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{bundle.icon}</span>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">{bundle.title}</h4>
                            <p className="text-[11px] text-slate-400">{bundle.description}</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                        {bundle.badge}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div className="px-5 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {bundle.items.map((item, i) => (
                        <div key={item._id || item.id || i} className="flex items-center gap-2 shrink-0">
                            <Link href={`/product/${item._id || item.id}`} className="flex items-center gap-2 group/item">
                                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group-hover/item:border-orange-200 transition">
                                    {item.images?.[0] ? (
                                        <Image src={item.images[0]} alt={item.name} width={400} height={300} className="w-full h-full object-cover" />
                                    ) : (
                                        <PackageIcon size={20} className="text-slate-300" />
                                    )}
                                </div>
                            </Link>
                            {i < bundle.items.length - 1 && (
                                <PlusIcon size={14} className="text-slate-300 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price & CTA */}
            <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-800">{currency}{bundle.bundlePrice}</span>
                            <span className="text-sm text-slate-400 line-through">{currency}{bundle.originalPrice}</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            Save {currency}{bundle.savings} ({bundle.discount}% off)
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAdd}
                    disabled={added}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        added
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-900 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    }`}
                >
                    {added ? (
                        <>
                            <CheckIcon size={16} />
                            Added to Cart!
                        </>
                    ) : (
                        <>
                            <ShoppingCartIcon size={16} />
                            Add Bundle to Cart
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    )
}

// ─── Main ProductBundle Component ────────────────────────────
export default function ProductBundle({ currentProduct }) {
    const [bundles, setBundles] = useState([])
    const dispatch = useDispatch()
    const allProducts = useSelector(state => state.product.list)

    useEffect(() => {
        if (currentProduct && allProducts.length > 0) {
            const generated = generateBundles(currentProduct, allProducts)
            setBundles(generated)
        }
    }, [currentProduct, allProducts])

    const handleAddAll = (items) => {
        items.forEach(item => {
            dispatch(addToCart({ ...item, quantity: 1 }))
        })
    }

    if (bundles.length === 0) return null

    return (
        <div className="my-8">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <PackageIcon size={16} className="text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Smart Bundles</h3>
                    <p className="text-xs text-slate-400">AI-curated combos to save you more</p>
                </div>
            </div>

            {/* Bundle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bundles.map((bundle, index) => (
                    <BundleCard
                        key={bundle.id}
                        bundle={bundle}
                        index={index}
                        onAddAll={handleAddAll}
                    />
                ))}
            </div>
        </div>
    )
}
