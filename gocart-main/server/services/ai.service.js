import { Product } from '../models/index.js'

// ─── NLP Keyword Maps ────────────────────────────────────────
const CATEGORY_KEYWORDS = {
    laptop: ['laptop', 'notebook', 'macbook', 'chromebook', 'computer'],
    phone: ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'galaxy', 'pixel'],
    headphones: ['headphones', 'headset', 'earphones', 'earbuds', 'airpods', 'earpiece'],
    watch: ['watch', 'smartwatch', 'fitness tracker', 'wearable'],
    speaker: ['speaker', 'soundbar', 'subwoofer', 'audio'],
    camera: ['camera', 'gopro', 'dslr', 'mirrorless', 'webcam', 'lens'],
    keyboard: ['keyboard', 'mechanical', 'typing'],
    mouse: ['mouse', 'trackpad', 'cursor'],
    monitor: ['monitor', 'display', 'screen', 'tv', 'television'],
    home: ['vacuum', 'cleaner', 'appliance', 'home', 'kitchen', 'blender'],
    smart_home: ['smart home', 'smart bulb', 'alexa', 'google home', 'hue', 'thermostat'],
    accessories: ['case', 'charger', 'cable', 'adapter', 'stand', 'holder', 'pencil', 'stylus'],
}

const USE_CASE_KEYWORDS = {
    programming: ['programming', 'coding', 'development', 'developer', 'software', 'ide', 'compile', 'debug'],
    gaming: ['gaming', 'game', 'gamer', 'esports', 'competitive', 'fps', 'rpg'],
    music: ['music', 'audio', 'listening', 'songs', 'podcast', 'hi-fi', 'hifi', 'audiophile'],
    photography: ['photography', 'photo', 'shooting', 'video', 'vlog', 'filming', 'cinematic'],
    productivity: ['productivity', 'office', 'work', 'business', 'professional', 'remote', 'meeting'],
    fitness: ['fitness', 'workout', 'running', 'exercise', 'gym', 'health', 'steps'],
    travel: ['travel', 'portable', 'lightweight', 'compact', 'on-the-go', 'commute'],
    smart: ['smart', 'automation', 'voice', 'assistant', 'connected', 'iot'],
    creative: ['creative', 'design', 'art', 'drawing', 'editing', 'illustration'],
}

const QUALITY_KEYWORDS = {
    premium: ['premium', 'best', 'top', 'flagship', 'high-end', 'professional', 'pro'],
    budget: ['budget', 'cheap', 'affordable', 'low-cost', 'economical', 'value', 'save'],
    mid: ['mid-range', 'midrange', 'moderate', 'standard'],
}

const FEATURE_KEYWORDS = {
    wireless: ['wireless', 'bluetooth', 'cordless', 'untethered'],
    noise_cancelling: ['noise cancelling', 'noise-cancelling', 'anc', 'noise reduction'],
    waterproof: ['waterproof', 'water-resistant', 'water resistant', 'ip67', 'ip68'],
    ergonomic: ['ergonomic', 'comfortable', 'comfort', 'lumbar'],
    battery: ['battery', 'long battery', 'all day', 'all-day', 'endurance'],
    fast_charging: ['fast charging', 'quick charge', 'rapid charge'],
    '4k': ['4k', 'uhd', 'ultra hd', 'high resolution', 'retina'],
    rgb: ['rgb', 'led', 'lights', 'lighting', 'ambient'],
}

// ─── Parse Query ─────────────────────────────────────────────
function parseQuery(query) {
    const q = query.toLowerCase().trim()
    const result = {
        categories: [],
        useCases: [],
        quality: null,
        maxPrice: null,
        minPrice: null,
        features: [],
        keywords: [],
        brands: [],
        excludeKeywords: [],
    }

    // Extract price constraints
    const pricePatterns = [
        /under\s*\$?\s*(\d+(?:\.\d+)?)/i,
        /below\s*\$?\s*(\d+(?:\.\d+)?)/i,
        /less\s+than\s*\$?\s*(\d+(?:\.\d+)?)/i,
        /max(?:imum)?\s*\$?\s*(\d+(?:\.\d+)?)/i,
        /cheaper\s+than\s*\$?\s*(\d+(?:\.\d+)?)/i,
        /\$?\s*(\d+(?:\.\d+)?)\s+or\s+less/i,
        /\$?\s*(\d+(?:\.\d+)?)\s+and\s+under/i,
    ]
    for (const pattern of pricePatterns) {
        const match = q.match(pattern)
        if (match) {
            result.maxPrice = parseFloat(match[1])
            break
        }
    }

    // Also check "between X and Y"
    const betweenMatch = q.match(/between\s*\$?\s*(\d+)\s+and\s*\$?\s*(\d+)/i)
    if (betweenMatch) {
        result.minPrice = parseFloat(betweenMatch[1])
        result.maxPrice = parseFloat(betweenMatch[2])
    }

    // "over $X" or "above $X"
    const aboveMatch = q.match(/(?:over|above|more\s+than|at\s+least)\s*\$?\s*(\d+)/i)
    if (aboveMatch) {
        result.minPrice = parseFloat(aboveMatch[1])
    }

    // Extract categories
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            if (q.includes(kw)) {
                result.categories.push(cat)
                break
            }
        }
    }

    // Extract use cases
    for (const [useCase, keywords] of Object.entries(USE_CASE_KEYWORDS)) {
        for (const kw of keywords) {
            if (q.includes(kw)) {
                result.useCases.push(useCase)
                break
            }
        }
    }

    // Extract quality tier
    for (const [tier, keywords] of Object.entries(QUALITY_KEYWORDS)) {
        for (const kw of keywords) {
            if (q.includes(kw)) {
                result.quality = tier
                break
            }
        }
    }

    // Extract features
    for (const [feat, keywords] of Object.entries(FEATURE_KEYWORDS)) {
        for (const kw of keywords) {
            if (q.includes(kw)) {
                result.features.push(feat)
                break
            }
        }
    }

    // Extract brand mentions
    const knownBrands = ['sony', 'apple', 'samsung', 'jbl', 'logitech', 'canon', 'dyson', 'philips', 'razer', 'casio', 'sonos', 'bose', 'sennheiser', 'dell', 'hp', 'lenovo', 'asus', 'lg', 'nike', 'adidas']
    for (const brand of knownBrands) {
        if (q.includes(brand)) {
            result.brands.push(brand)
        }
    }

    // Extract remaining meaningful keywords (stop words removed)
    const stopWords = new Set(['i', 'need', 'want', 'looking', 'for', 'a', 'an', 'the', 'with', 'that', 'is', 'under', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'it', 'my', 'me', 'we', 'our', 'you', 'your', 'some', 'one', 'best', 'good', 'great', 'nice', 'please', 'recommend', 'suggest', 'find', 'get', 'buy', 'purchase', 'can', 'could', 'would', 'should', 'really', 'very', 'just', 'also', 'than', 'this', 'which', 'who', 'what', 'where', 'how', 'type', 'kind', 'something', 'anything', 'make', 'do', 'does'])
    const words = q.replace(/[^a-z0-9\s-]/g, '').split(/\s+/)
    result.keywords = words.filter(w => w.length > 2 && !stopWords.has(w))

    return result
}

// ─── Map use cases to category/tag relationships ─────────────
const USE_CASE_CATEGORY_MAP = {
    programming: {
        categories: ['laptop', 'keyboard', 'mouse', 'monitor', 'accessories'],
        tags: ['ergonomic', 'premium', 'usb-c'],
        boostCategories: ['laptop'],
    },
    gaming: {
        categories: ['keyboard', 'mouse', 'monitor', 'headphones', 'accessories'],
        tags: ['gaming', 'rgb', 'mechanical'],
        boostCategories: ['keyboard', 'mouse', 'headphones'],
    },
    music: {
        categories: ['headphones', 'speaker', 'earbuds'],
        tags: ['wireless', 'noise-cancelling', 'premium', 'audio', 'spatial-audio'],
        boostCategories: ['headphones', 'speaker'],
    },
    photography: {
        categories: ['camera', 'monitor', 'accessories'],
        tags: ['mirrorless', '4k', 'vlogging'],
        boostCategories: ['camera'],
    },
    productivity: {
        categories: ['laptop', 'keyboard', 'mouse', 'monitor'],
        tags: ['wireless', 'ergonomic', 'premium', 'usb-c'],
        boostCategories: ['laptop', 'monitor'],
    },
    fitness: {
        categories: ['watch', 'earbuds', 'accessories'],
        tags: ['waterproof', 'wireless'],
        boostCategories: ['watch'],
    },
    travel: {
        categories: ['headphones', 'speaker', 'earbuds', 'camera', 'accessories'],
        tags: ['portable', 'wireless', 'waterproof'],
        boostCategories: ['speaker', 'earbuds'],
    },
    smart: {
        categories: ['smart_home', 'watch', 'speaker', 'accessories'],
        tags: ['smart-home', 'voice-control', 'rgb'],
        boostCategories: ['smart_home'],
    },
    creative: {
        categories: ['monitor', 'camera', 'accessories', 'keyboard'],
        tags: ['premium', 'creative', 'stylus'],
        boostCategories: ['monitor', 'camera'],
    },
}

// ─── Build MongoDB Query ─────────────────────────────────────
function buildQuery(parsed) {
    const filter = { inStock: true, stock: { $gt: 0 } }

    const conditions = []

    // Category filter
    if (parsed.categories.length > 0) {
        const categoryMap = {
            laptop: ['Laptop', 'Computer', 'Notebook'],
            phone: ['Phone', 'Smartphone', 'Mobile'],
            headphones: ['Headphones'],
            earbuds: ['Earbuds'],
            watch: ['Watch'],
            speaker: ['Speakers', 'Speaker'],
            camera: ['Camera'],
            keyboard: ['Keyboard'],
            mouse: ['Mouse'],
            monitor: ['Monitor', 'Display'],
            home: ['Home', 'Appliance'],
            smart_home: ['Smart Home'],
            accessories: ['Accessories'],
        }

        const expandedCategories = []
        for (const cat of parsed.categories) {
            const mapped = categoryMap[cat]
            if (mapped) expandedCategories.push(...mapped)
            else expandedCategories.push(cat)
        }

        conditions.push({ category: { $in: expandedCategories } })
    }

    // Price filter
    if (parsed.maxPrice || parsed.minPrice) {
        const priceFilter = {}
        if (parsed.maxPrice) priceFilter.$lte = parsed.maxPrice
        if (parsed.minPrice) priceFilter.$gte = parsed.minPrice
        conditions.push({ price: priceFilter })
    }

    // Brand filter
    if (parsed.brands.length > 0) {
        const brandPatterns = parsed.brands.map(b => new RegExp(b, 'i'))
        conditions.push({ brand: { $in: brandPatterns } })
    }

    // Features → tags
    if (parsed.features.length > 0) {
        const featureTagMap = {
            wireless: ['wireless', 'bluetooth'],
            noise_cancelling: ['noise-cancelling', 'noise-cancelling', 'anc'],
            waterproof: ['waterproof', 'water-resistant'],
            ergonomic: ['ergonomic'],
            battery: ['battery', 'endurance'],
            fast_charging: ['fast-charging', 'quick-charge'],
            '4k': ['4k', 'uhd', 'retina'],
            rgb: ['rgb', 'led', 'lighting'],
        }

        const tagSets = parsed.features
            .map(f => featureTagMap[f])
            .filter(Boolean)
            .flat()

        if (tagSets.length > 0) {
            conditions.push({ tags: { $in: tagSets } })
        }
    }

    // Text search for keywords
    if (parsed.keywords.length > 0) {
        const keywordRegex = parsed.keywords.join('|')
        conditions.push({
            $or: [
                { name: new RegExp(keywordRegex, 'i') },
                { description: new RegExp(keywordRegex, 'i') },
                { tags: new RegExp(keywordRegex, 'i') },
                { brand: new RegExp(keywordRegex, 'i') },
            ],
        })
    }

    if (conditions.length > 0) {
        filter.$and = conditions
    }

    return filter
}

// ─── Score & Rank Products ───────────────────────────────────
function scoreProducts(products, parsed) {
    const scored = products.map(product => {
        let score = 0
        const reasons = []

        // Base score from rating
        score += (product.avgRating || 0) * 5
        if (product.avgRating >= 4.5) reasons.push('Highly rated')

        // Popularity bonus
        const popularityScore = Math.min((product.soldCount || 0) / 100, 10)
        score += popularityScore
        if (product.soldCount > 300) reasons.push('Best seller')

        // Price fit
        if (parsed.maxPrice && product.price <= parsed.maxPrice) {
            const priceRatio = product.price / parsed.maxPrice
            score += (1 - priceRatio) * 15 // Better value = higher score
            if (product.price <= parsed.maxPrice * 0.5) reasons.push('Great value')
            else if (product.price <= parsed.maxPrice * 0.8) reasons.push('Within budget')
        }
        if (parsed.minPrice && product.price >= parsed.minPrice) {
            score += 10
        }

        // Category relevance (use case boost)
        for (const useCase of parsed.useCases) {
            const mapping = USE_CASE_CATEGORY_MAP[useCase]
            if (mapping) {
                const productCatLower = (product.category || '').toLowerCase()
                if (mapping.boostCategories.includes(productCatLower)) {
                    score += 25
                    reasons.push(`Great for ${useCase}`)
                } else if (mapping.categories.some(c => productCatLower.includes(c))) {
                    score += 10
                }
            }
        }

        // Direct category match
        if (parsed.categories.length > 0) {
            const productCatLower = (product.category || '').toLowerCase()
            const matchedCat = parsed.categories.some(c => productCatLower.includes(c))
            if (matchedCat) {
                score += 15
                reasons.push('Matches your category')
            }
        }

        // Feature match
        if (parsed.features.length > 0 && product.tags) {
            const productTags = product.tags.map(t => t.toLowerCase()).join(' ')
            for (const feat of parsed.features) {
                if (productTags.includes(feat.replace('_', '-')) || productTags.includes(feat)) {
                    score += 10
                    reasons.push(`Has ${feat.replace('_', ' ')}`)
                }
            }
        }

        // Brand match
        if (parsed.brands.length > 0) {
            const productBrandLower = (product.brand || '').toLowerCase()
            if (parsed.brands.some(b => productBrandLower.includes(b))) {
                score += 20
                reasons.push('Preferred brand')
            }
        }

        // Discount bonus
        if (product.mrp && product.mrp > product.price) {
            const discount = ((product.mrp - product.price) / product.mrp) * 100
            if (discount >= 20) {
                score += 5
                reasons.push(`${Math.round(discount)}% off`)
            }
        }

        // Quality tier
        if (parsed.quality === 'premium' && product.price > 150) {
            score += 10
            reasons.push('Premium quality')
        }
        if (parsed.quality === 'budget' && product.price < 100) {
            score += 10
            reasons.push('Budget-friendly')
        }

        // Stock availability bonus
        if (product.stock > 50) {
            score += 2
        }

        return {
            product,
            score,
            reasons: [...new Set(reasons)], // deduplicate
        }
    })

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    return scored
}

// ─── Generate AI Explanation ─────────────────────────────────
function generateExplanation(query, topResults) {
    const parsed = parseQuery(query)
    const explanations = []

    // Opening
    if (topResults.length === 0) {
        return {
            message: `I couldn't find products matching "${query}" in our catalog. Try broadening your search — for example, remove price constraints or try different keywords like "headphones" or "wireless speaker".`,
            products: [],
        }
    }

    // Build natural language explanation
    const categoryNames = parsed.categories.map(c => c.replace('_', ' '))
    const useCaseNames = parsed.useCases.map(u => u.replace('_', ' '))

    let intro = `Great question! I found **${topResults.length} product${topResults.length > 1 ? 's' : ''}** that match your needs`

    if (categoryNames.length > 0) {
        intro += ` in ${categoryNames.join(' and ')}`
    }
    if (useCaseNames.length > 0) {
        intro += ` for ${useCaseNames.join(' and ')}`
    }
    if (parsed.maxPrice) {
        intro += ` under $${parsed.maxPrice}`
    }
    intro += '.'

    // Individual product explanations
    for (let i = 0; i < topResults.length; i++) {
        const { product, reasons } = topResults[i]
        const rank = i === 0 ? 'Top pick' : i === 1 ? 'Runner-up' : 'Also great'

        const explanation = {
            rank,
            productName: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            originalPrice: product.mrp,
            rating: product.avgRating,
            reviewCount: product.ratingCount,
            image: product.images?.[0] || null,
            reason: reasons.length > 0 ? reasons.join('. ') : 'Great match for your request',
            highlights: reasons.slice(0, 3),
        }

        explanations.push(explanation)
    }

    // Closing insight
    let closing = ''
    if (topResults.length >= 2) {
        const priceRange = topResults.map(r => r.product.price)
        const low = Math.min(...priceRange)
        const high = Math.max(...priceRange)
        if (low !== high) {
            closing = `Prices range from $${low.toFixed(2)} to $${high.toFixed(2)}, so you have options at different price points.`
        } else {
            closing = `All options are priced at $${low.toFixed(2)}.`
        }
    }

    // Parse insights
    const insights = {
        totalMatches: topResults.length,
        priceRange: topResults.length > 0 ? {
            min: Math.min(...topResults.map(r => r.product.price)),
            max: Math.max(...topResults.map(r => r.product.price)),
        } : null,
        avgRating: topResults.length > 0
            ? (topResults.reduce((sum, r) => sum + (r.product.avgRating || 0), 0) / topResults.length).toFixed(1)
            : null,
        topCategory: parsed.categories[0] || null,
        useCase: parsed.useCases[0] || null,
    }

    return {
        message: intro,
        closing,
        products: explanations,
        insights,
    }
}

// ─── Main: Process AI Shopping Query ─────────────────────────
export async function processShoppingQuery(query, limit = 3) {
    // 1. Parse the natural language query
    const parsed = parseQuery(query)

    // 2. Build MongoDB filter
    const filter = buildQuery(parsed)

    // 3. Search products (fetch more than needed for better ranking)
    let products = await Product.find(filter)
        .populate('storeId', 'name username')
        .sort({ soldCount: -1, avgRating: -1 })
        .limit(20)

    // Fallback: if no results with strict filter, try relaxed search
    if (products.length === 0 && parsed.keywords.length > 0) {
        const relaxedFilter = { inStock: true, stock: { $gt: 0 } }
        const keywordRegex = parsed.keywords.join('|')
        relaxedFilter.$or = [
            { name: new RegExp(keywordRegex, 'i') },
            { description: new RegExp(keywordRegex, 'i') },
            { tags: new RegExp(keywordRegex, 'i') },
        ]
        products = await Product.find(relaxedFilter)
            .populate('storeId', 'name username')
            .limit(20)
    }

    // 4. Score and rank
    const scored = scoreProducts(products, parsed)

    // 5. Take top N
    const topResults = scored.slice(0, limit)

    // 6. Generate explanation
    const result = generateExplanation(query, topResults)

    return {
        query,
        parsed: {
            categories: parsed.categories,
            useCases: parsed.useCases,
            maxPrice: parsed.maxPrice,
            features: parsed.features,
            quality: parsed.quality,
        },
        ...result,
    }
}

// ─── Quick Suggestions ───────────────────────────────────────
export function getQuickSuggestions() {
    return [
        {
            text: 'Best wireless headphones under $300',
            icon: '🎧',
            category: 'Headphones',
        },
        {
            text: 'I need a laptop for programming under $1000',
            icon: '💻',
            category: 'Laptop',
        },
        {
            text: 'Affordable smart home devices',
            icon: '🏠',
            category: 'Smart Home',
        },
        {
            text: 'Best camera for vlogging',
            icon: '📹',
            category: 'Camera',
        },
        {
            text: 'Gaming keyboard and mouse combo',
            icon: '🎮',
            category: 'Gaming',
        },
        {
            text: 'Portable speaker for travel',
            icon: '🔊',
            category: 'Speakers',
        },
    ]
}

// ─── Follow-up Suggestions Based on Context ──────────────────
export function getFollowUpSuggestions(lastQuery, lastResults) {
    const suggestions = []

    if (lastResults.products && lastResults.products.length > 0) {
        // Suggest comparing products
        suggestions.push({
            text: `Compare prices for ${lastResults.products[0].productName}`,
            icon: '💰',
        })

        // Suggest alternatives
        if (lastResults.insights?.topCategory) {
            suggestions.push({
                text: `Show me other ${lastResults.insights.topCategory} options`,
                icon: '🔄',
            })
        }

        // Suggest accessories
        suggestions.push({
            text: 'Show me accessories for these products',
            icon: '🔗',
        })
    }

    suggestions.push({
        text: 'What are the trending products right now?',
        icon: '🔥',
    })

    return suggestions.slice(0, 4)
}
