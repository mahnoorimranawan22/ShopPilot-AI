import { Product } from '../models/index.js'
import UserBehavior from '../models/UserBehavior.js'

/**
 * AI Recommendation Engine
 * 
 * Uses 5 signals to score and rank products:
 * 1. Browsing history — products in same categories as viewed
 * 2. Wishlist signals — similar to wishlisted products
 * 3. Cart signals — products in same categories as carted
 * 4. Purchase history — same categories/brands as purchased
 * 5. Category affinity — weighted category preference
 */

// ─── Weight Config ───────────────────────────────────────────
const WEIGHTS = {
    view: 1,
    cart: 3,
    wishlist: 4,
    purchase: 5,
    categoryAffinity: 2,
    brandAffinity: 1.5,
    trending: 0.5,
    freshness: 0.3,
}

// ─── Time Decay ──────────────────────────────────────────────
function timeDecay(timestamp, halfLifeDays = 7) {
    const now = Date.now()
    const age = now - new Date(timestamp).getTime()
    const halfLife = halfLifeDays * 24 * 60 * 60 * 1000
    return Math.pow(0.5, age / halfLife)
}

// ─── Build User Profile from Behavior ────────────────────────
export async function buildUserProfile(userId) {
    const behavior = await UserBehavior.findOne({ user: userId })

    if (!behavior) {
        return {
            categories: {},
            brands: {},
            priceRange: { min: 0, max: 500 },
            viewedProducts: [],
            purchasedProducts: [],
            hasHistory: false,
        }
    }

    const categoryScores = {}
    const brandScores = {}
    const viewedProducts = new Set()
    const purchasedProducts = new Set()

    // Process views
    for (const view of behavior.views) {
        const decay = timeDecay(view.timestamp, 7)
        viewedProducts.add(view.product.toString())
        // We'll enrich these later with product details
    }

    // Process cart additions (stronger signal)
    for (const cart of behavior.cartAdds) {
        const decay = timeDecay(cart.timestamp, 14)
        // Score handled via product enrichment
    }

    // Process wishlist (strongest intent signal)
    for (const wish of behavior.wishlistAdds) {
        const decay = timeDecay(wish.timestamp, 30)
        // Score handled via product enrichment
    }

    // Process purchases
    for (const purchase of behavior.purchases) {
        const decay = timeDecay(purchase.timestamp, 30)
        purchasedProducts.add(purchase.product.toString())

        if (purchase.category) {
            categoryScores[purchase.category] = (categoryScores[purchase.category] || 0) + WEIGHTS.purchase * decay
        }
        if (purchase.brand) {
            brandScores[purchase.brand] = (brandScores[purchase.brand] || 0) + WEIGHTS.purchase * decay
        }
    }

    // Enrich with product details for views/cart/wishlist
    const allProductIds = [
        ...behavior.views.map(v => v.product),
        ...behavior.cartAdds.map(c => c.product),
        ...behavior.wishlistAdds.map(w => w.product),
    ]

    if (allProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: allProductIds } }).select('category brand price')
        const productMap = {}
        for (const p of products) {
            productMap[p._id.toString()] = p
        }

        // Score views
        for (const view of behavior.views) {
            const prod = productMap[view.product.toString()]
            if (prod) {
                const decay = timeDecay(view.timestamp, 7)
                if (prod.category) categoryScores[prod.category] = (categoryScores[prod.category] || 0) + WEIGHTS.view * decay
                if (prod.brand) brandScores[prod.brand] = (brandScores[prod.brand] || 0) + WEIGHTS.view * decay
            }
        }

        // Score cart adds
        for (const cart of behavior.cartAdds) {
            const prod = productMap[cart.product.toString()]
            if (prod) {
                const decay = timeDecay(cart.timestamp, 14)
                if (prod.category) categoryScores[prod.category] = (categoryScores[prod.category] || 0) + WEIGHTS.cart * decay
                if (prod.brand) brandScores[prod.brand] = (brandScores[prod.brand] || 0) + WEIGHTS.cart * decay
            }
        }

        // Score wishlist
        for (const wish of behavior.wishlistAdds) {
            const prod = productMap[wish.product.toString()]
            if (prod) {
                const decay = timeDecay(wish.timestamp, 30)
                if (prod.category) categoryScores[wish.product.category || prod.category] = (categoryScores[prod.category] || 0) + WEIGHTS.wishlist * decay
                if (prod.brand) brandScores[prod.brand] = (brandScores[prod.brand] || 0) + WEIGHTS.wishlist * decay
            }
        }
    }

    // Compute preferred price range from purchase history
    let priceRange = { min: 0, max: 500 }
    if (behavior.purchases.length > 0) {
        const prices = behavior.purchases.map(p => p.price).filter(Boolean)
        if (prices.length > 0) {
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length
            priceRange = {
                min: Math.max(0, avg * 0.3),
                max: avg * 2.5,
            }
        }
    }

    // Convert to sorted arrays
    const categories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

    const brands = Object.entries(brandScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

    return {
        categories: Object.fromEntries(categories),
        brands: Object.fromEntries(brands),
        priceRange,
        viewedProducts: [...viewedProducts],
        purchasedProducts: [...purchasedProducts],
        hasHistory: true,
    }
}

// ─── Score Products Against Profile ──────────────────────────
function scoreProducts(products, profile, excludeIds = new Set()) {
    return products
        .filter(p => !excludeIds.has(p._id.toString()))
        .map(product => {
            let score = 0
            const reasons = []

            // Category affinity
            const catScore = profile.categories[product.category] || 0
            if (catScore > 0) {
                score += catScore * WEIGHTS.categoryAffinity
                reasons.push(`Matches your interest in ${product.category}`)
            }

            // Brand affinity
            const brandScore = profile.brands[product.brand] || 0
            if (brandScore > 0) {
                score += brandScore * WEIGHTS.brandAffinity
                reasons.push(`You like ${product.brand}`)
            }

            // Price range fit
            if (product.price >= profile.priceRange.min && product.price <= profile.priceRange.max) {
                score += 3
                reasons.push('Within your budget')
            }

            // Trending bonus (high sold count)
            const trendingScore = Math.min((product.soldCount || 0) / 200, 5)
            score += trendingScore * WEIGHTS.trending
            if (product.soldCount > 200) {
                reasons.push('Trending now')
            }

            // Freshness bonus (newer products)
            if (product.createdAt) {
                const ageDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                if (ageDays < 30) {
                    score += WEIGHTS.freshness * (30 - ageDays) / 30
                    reasons.push('New arrival')
                }
            }

            // Rating bonus
            score += (product.avgRating || 0) * 0.5
            if (product.avgRating >= 4.5) {
                reasons.push('Highly rated')
            }

            // Discount bonus
            if (product.mrp && product.mrp > product.price) {
                const discount = ((product.mrp - product.price) / product.mrp) * 100
                if (discount >= 15) {
                    score += 2
                    reasons.push(`${Math.round(discount)}% off`)
                }
            }

            return {
                product,
                score,
                reasons: [...new Set(reasons)].slice(0, 3),
            }
        })
        .sort((a, b) => b.score - a.score)
}

// ─── Main: Get Personalized Recommendations ──────────────────
export async function getPersonalizedRecommendations(userId, limit = 8) {
    const profile = await buildUserProfile(userId)

    let recommended

    if (!profile.hasHistory || Object.keys(profile.categories).length === 0) {
        // No history — return trending + popular products (cold start)
        const products = await Product.find({ inStock: true, stock: { $gt: 0 } })
            .populate('storeId', 'name username')
            .sort({ soldCount: -1, avgRating: -1 })
            .limit(limit * 2)

        recommended = products.map(p => ({
            product: p,
            score: (p.soldCount || 0) + (p.avgRating || 0) * 10,
            reasons: ['Popular choice', 'Highly rated'],
        })).slice(0, limit)

        return {
            type: 'trending',
            label: 'Trending Now',
            subtitle: 'Popular products everyone is loving',
            products: recommended,
        }
    }

    // Personalized: fetch products matching preferred categories/brands
    const categoryNames = Object.keys(profile.categories).slice(0, 5)
    const brandNames = Object.keys(profile.brands).slice(0, 5)

    const filter = {
        inStock: true,
        stock: { $gt: 0 },
        _id: { $nin: profile.purchasedProducts },
    }

    // Query for category/brand matches
    const queryConditions = []
    if (categoryNames.length > 0) {
        queryConditions.push({ category: { $in: categoryNames } })
    }
    if (brandNames.length > 0) {
        queryConditions.push({ brand: { $in: brandNames } })
    }

    if (queryConditions.length > 0) {
        filter.$or = queryConditions
    }

    let products = await Product.find(filter)
        .populate('storeId', 'name username')
        .limit(limit * 4)

    // If not enough personalized results, fill with trending
    if (products.length < limit) {
        const trendingFilter = {
            inStock: true,
            stock: { $gt: 0 },
            _id: { $nin: [...products.map(p => p._id), ...profile.purchasedProducts] },
        }
        const trending = await Product.find(trendingFilter)
            .populate('storeId', 'name username')
            .sort({ soldCount: -1 })
            .limit(limit * 2)
        products = [...products, ...trending]
    }

    const scored = scoreProducts(products, profile, new Set(profile.purchasedProducts))

    return {
        type: 'personalized',
        label: 'Recommended for You',
        subtitle: 'Based on your browsing, wishlist, and purchase history',
        products: scored.slice(0, limit),
        profileSummary: {
            topCategories: categoryNames.slice(0, 3),
            topBrands: brandNames.slice(0, 3),
        },
    }
}

// ─── Record Behavior Event ───────────────────────────────────
export async function recordBehavior(userId, eventType, data) {
    if (!userId) return // Guest users — skip

    const update = {}
    const timestamp = new Date()

    switch (eventType) {
        case 'view':
            update.$push = { views: { $each: [{ product: data.productId, timestamp }], $slice: -100 } }
            break
        case 'cart':
            update.$push = { cartAdds: { $each: [{ product: data.productId, timestamp }], $slice: -100 } }
            break
        case 'wishlist':
            update.$push = { wishlistAdds: { $each: [{ product: data.productId, timestamp }], $slice: -100 } }
            break
        case 'purchase':
            update.$push = {
                purchases: {
                    $each: [{
                        product: data.productId,
                        category: data.category,
                        brand: data.brand,
                        price: data.price,
                        timestamp,
                    }],
                    $slice: -100,
                },
            }
            break
        case 'search':
            update.$push = { searches: { $each: [{ query: data.query, timestamp }], $slice: -100 } }
            break
        default:
            return
    }

    await UserBehavior.findOneAndUpdate(
        { user: userId },
        update,
        { upsert: true, new: true }
    )
}

// ─── Get Trending (for cold start / guests) ──────────────────
export async function getTrendingRecommendations(limit = 8) {
    const products = await Product.find({ inStock: true, stock: { $gt: 0 } })
        .populate('storeId', 'name username')
        .sort({ soldCount: -1, avgRating: -1 })
        .limit(limit)

    return {
        type: 'trending',
        label: 'Trending Now',
        subtitle: 'Popular products everyone is loving',
        products: products.map(p => ({
            product: p,
            score: (p.soldCount || 0) + (p.avgRating || 0) * 10,
            reasons: ['Popular choice', 'Highly rated'],
        })),
    }
}
