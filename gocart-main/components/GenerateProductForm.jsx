'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon, PlusIcon, XIcon, Loader2Icon, CopyIcon,
    CheckIcon, TagIcon, FileTextIcon, SearchIcon, LightbulbIcon,
    ChevronDownIcon, ChevronUpIcon
} from 'lucide-react'
import { aiAPI } from '@/lib/api'

// ─── Generated Content Card ──────────────────────────────────
function ContentCard({ label, icon: Icon, content, onCopy, field }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600">{label}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {copied ? <><CheckIcon size={12} className="text-green-500" /> Copied</> : <><CopyIcon size={12} /> Copy</>}
                </button>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{content}</div>
        </div>
    )
}

// ─── Feature Input ───────────────────────────────────────────
function FeatureInput({ value, onChange, onRemove, index }) {
    return (
        <div className="flex items-center gap-2 group">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <span className="text-[10px] font-bold text-indigo-400 w-4">{index + 1}</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g. Bluetooth 5.3, 30-hour battery, IP67 waterproof"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                />
            </div>
            <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
                <XIcon size={14} />
            </button>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────
export default function GenerateProductForm({ onApply }) {
    const [name, setName] = useState('')
    const [features, setFeatures] = useState(['', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [showAdvanced, setShowAdvanced] = useState(false)

    const addFeature = () => {
        if (features.length < 10) {
            setFeatures([...features, ''])
        }
    }

    const removeFeature = (index) => {
        if (features.length > 1) {
            setFeatures(features.filter((_, i) => i !== index))
        }
    }

    const updateFeature = (index, value) => {
        const updated = [...features]
        updated[index] = value
        setFeatures(updated)
    }

    const handleGenerate = async () => {
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const cleanFeatures = features.filter(f => f.trim().length > 0)
            const data = await aiAPI.generateProduct(name.trim(), cleanFeatures)
            setResult(data)
        } catch {
            // Fallback: generate locally if API not available
            const cleanFeatures = features.filter(f => f.trim().length > 0)
            setResult({
                name: name.trim(),
                description: `Introducing the ${name.trim()} — designed to elevate your experience.\n\nKey features:\n${cleanFeatures.map(f => `• ${f}`).join('\n')}\n\nOrder now and experience the difference.`,
                shortDescription: `${name.trim()} featuring ${cleanFeatures.slice(0, 3).join(', ')}. Built for performance and designed for comfort.`,
                seo: {
                    title: `Buy ${name.trim()} Online — Best Price | ShopPilot AI`,
                    description: `Shop the ${name.trim()} with ${cleanFeatures.slice(0, 3).join(', ')}. Free shipping and easy returns.`,
                },
                tags: cleanFeatures.map(f => f.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 10),
                highlights: cleanFeatures.slice(0, 5),
                category: 'Accessories',
                brand: '',
                suggestedPrice: { mrp: 99, price: 79 },
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = () => {
        if (result && onApply) {
            onApply({
                name: result.name || name,
                description: result.description,
                category: result.category || '',
                brand: result.brand || '',
                tags: result.tags || [],
                highlights: result.highlights || [],
                mrp: result.suggestedPrice?.mrp || 0,
                price: result.suggestedPrice?.price || 0,
                seoTitle: result.seo?.title || '',
                seoDescription: result.seo?.description || '',
                shortDescription: result.shortDescription || '',
            })
        }
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100 rounded-2xl p-6 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-violet-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <SparklesIcon size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">✨ AI Product Generator</h3>
                    <p className="text-xs text-slate-500">Enter your product details and let AI create the perfect listing</p>
                </div>
            </div>

            {/* Product Name */}
            <div className="relative mb-4">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Product Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. "Wireless Headphones" or "Organic Green Tea"'
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
            </div>

            {/* Features */}
            <div className="relative mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">Features & Specifications</label>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-600"
                    >
                        {showAdvanced ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                        {showAdvanced ? 'Less' : 'More features'}
                    </button>
                </div>

                <div className="space-y-2">
                    {features.slice(0, showAdvanced ? features.length : 3).map((feature, i) => (
                        <FeatureInput
                            key={i}
                            value={feature}
                            onChange={(v) => updateFeature(i, v)}
                            onRemove={() => removeFeature(i)}
                            index={i}
                        />
                    ))}
                </div>

                {features.length < 10 && (
                    <button
                        onClick={addFeature}
                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                        <PlusIcon size={14} />
                        Add feature
                    </button>
                )}
            </div>

            {/* Quick Feature Suggestions */}
            <div className="relative mb-5">
                <p className="text-[10px] font-medium text-slate-400 mb-1.5">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                    {['Bluetooth 5.3', 'Noise cancellation', 'Waterproof IP67', 'Fast charging', '30-hour battery', 'USB-C', 'Ergonomic design', 'LED display'].map((feat) => (
                        <button
                            key={feat}
                            onClick={() => {
                                const emptyIdx = features.findIndex(f => !f.trim())
                                if (emptyIdx >= 0) updateFeature(emptyIdx, feat)
                                else addFeature(), updateFeature(features.length, feat)
                            }}
                            className="text-[10px] font-medium bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-full transition-all"
                        >
                            + {feat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={!name.trim() || isLoading}
                className="relative w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2Icon size={18} className="animate-spin" />
                        Generating with AI...
                    </>
                ) : (
                    <>
                        <SparklesIcon size={18} />
                        Generate with AI
                    </>
                )}
            </motion.button>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mt-6 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <CheckIcon size={16} className="text-green-500" />
                                Generated Content
                            </h4>
                            {onApply && (
                                <button
                                    onClick={handleApply}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Apply All to Product →
                                </button>
                            )}
                        </div>

                        {/* Auto-detected fields */}
                        <div className="flex flex-wrap gap-2">
                            {result.category && (
                                <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                                    📁 {result.category}
                                </span>
                            )}
                            {result.brand && (
                                <span className="text-[10px] font-medium bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full">
                                    🏷️ {result.brand}
                                </span>
                            )}
                            {result.suggestedPrice && (
                                <span className="text-[10px] font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                                    💰 ${result.suggestedPrice.price} (MRP: ${result.suggestedPrice.mrp})
                                </span>
                            )}
                        </div>

                        {/* Content cards */}
                        <ContentCard label="Product Description" icon={FileTextIcon} content={result.description} field="description" />
                        <ContentCard label="Short Description" icon={FileTextIcon} content={result.shortDescription} field="shortDescription" />
                        <ContentCard label="SEO Title" icon={SearchIcon} content={result.seo?.title || ''} field="seoTitle" />
                        <ContentCard label="SEO Description" icon={SearchIcon} content={result.seo?.description || ''} field="seoDescription" />

                        {/* Tags */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TagIcon size={14} className="text-indigo-500" />
                                <span className="text-xs font-semibold text-slate-600">Tags</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {result.tags?.map((tag, i) => (
                                    <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <LightbulbIcon size={14} className="text-amber-500" />
                                <span className="text-xs font-semibold text-slate-600">Highlights</span>
                            </div>
                            <ul className="space-y-1">
                                {result.highlights?.map((h, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckIcon size={12} className="text-green-500 flex-shrink-0" />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
