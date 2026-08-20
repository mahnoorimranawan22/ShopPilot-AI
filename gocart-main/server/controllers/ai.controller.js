import { Product, Review } from '../models/index.js'
import { processShoppingQuery, getQuickSuggestions, getFollowUpSuggestions } from '../services/ai.service.js'
import { getPersonalizedRecommendations, getTrendingRecommendations, recordBehavior } from '../services/recommendation.service.js'
import { generateProductContent } from '../services/product-generator.service.js'
import { analyzeReviews } from '../services/review-analysis.service.js'
import { processBusinessQuery } from '../services/business-intelligence.service.js'
import { getInventoryIntelligence } from '../services/inventory-intelligence.service.js'

// POST /api/ai/review-analysis — Analyze reviews for sentiment and topics
export const reviewAnalysis = async (req, res, next) => {
    try {
        const { productId, reviews } = req.body

        let reviewData = reviews

        // If productId provided, fetch reviews from DB
        if (productId && !reviews) {
            reviewData = await Review.find({ product: productId })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
        }

        if (!reviewData || reviewData.length === 0) {
            return res.json(analyzeReviews([]))
        }

        const result = analyzeReviews(reviewData)
        res.json(result)
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/inventory-intelligence — AI Inventory Intelligence
export const inventoryIntelligence = async (req, res, next) => {
    try {
        const storeId = req.user?.storeId || req.query.storeId
        if (!storeId) {
            return res.status(400).json({ error: 'Store ID required' })
        }
        const result = await getInventoryIntelligence(storeId)
        res.json(result)
    } catch (error) {
        next(error)
    }
}

// POST /api/ai/business-insight — AI Business Intelligence
export const businessInsight = async (req, res, next) => {
    try {
        const { query } = req.body
        const storeId = req.user?.storeId || req.body.storeId

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Please ask a business question' })
        }

        if (!storeId) {
            return res.status(400).json({ error: 'Store ID required for business insights' })
        }

        const result = await processBusinessQuery(storeId, query.trim())
        res.json(result)
    } catch (error) {
        next(error)
    }
}

// POST /api/ai/generate-product — Generate product content from name + features
export const generateProduct = async (req, res, next) => {
    try {
        const { name, features = [] } = req.body

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Product name is required' })
        }

        const result = generateProductContent(name.trim(), features)
        res.json(result)
    } catch (error) {
        next(error)
    }
}


// POST /api/ai/ask — AI Shopping Assistant
export const askAssistant = async (req, res, next) => {
    try {
        const { query, limit = 3 } = req.body

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Please provide a question or product requirement' })
        }

        const result = await processShoppingQuery(query.trim(), Math.min(limit, 5))
        res.json(result)
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/suggestions — Quick suggestion chips
export const getSuggestions = async (req, res, next) => {
    try {
        const suggestions = getQuickSuggestions()
        res.json({ suggestions })
    } catch (error) {
        next(error)
    }
}

// POST /api/ai/follow-up — Contextual follow-up suggestions
export const getFollowUps = async (req, res, next) => {
    try {
        const { lastQuery, lastResults } = req.body
        const followUps = getFollowUpSuggestions(lastQuery, lastResults)
        res.json({ suggestions: followUps })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/recommended — personalized recommendations for logged-in user
export const getRecommended = async (req, res, next) => {
    try {
        const userId = req.user?._id
        const { limit = 8 } = req.query

        if (!userId) {
            // Guest: return trending
            const result = await getTrendingRecommendations(Number(limit))
            return res.json(result)
        }

        const result = await getPersonalizedRecommendations(userId, Number(limit))
        res.json(result)
    } catch (error) {
        next(error)
    }
}

// POST /api/ai/track — record user behavior event
export const trackBehavior = async (req, res, next) => {
    try {
        const userId = req.user?._id
        const { eventType, data } = req.body

        if (!userId) {
            return res.json({ tracked: false, reason: 'guest' })
        }

        await recordBehavior(userId, eventType, data)
        res.json({ tracked: true })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/recommendations/:productId — similar products
export const getRecommendations = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Find similar products by category, tags, and brand
        const similarProducts = await Product.find({
            _id: { $ne: product._id },
            $or: [
                { category: product.category },
                { tags: { $in: product.tags } },
                { brand: product.brand },
            ],
        })
            .populate('storeId', 'name username')
            .sort({ avgRating: -1, soldCount: -1 })
            .limit(8)

        res.json({
            currentProduct: {
                id: product._id,
                name: product.name,
                category: product.category,
                brand: product.brand,
            },
            recommendations: similarProducts,
            strategy: 'category_tag_brand_match',
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/trending — trending products
export const getTrending = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query

        const trending = await Product.find({ inStock: true })
            .populate('storeId', 'name username')
            .sort({ soldCount: -1, avgRating: -1 })
            .limit(Number(limit))

        res.json({
            products: trending,
            strategy: 'sold_count_and_rating',
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/search-suggestions?q=...
export const getSearchSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query
        if (!q || q.length < 2) {
            return res.json({ suggestions: [] })
        }

        const regex = new RegExp(q, 'i')

        const [products, categories, brands] = await Promise.all([
            Product.find({ name: regex })
                .select('name category brand')
                .limit(5),
            Product.distinct('category', { category: regex }),
            Product.distinct('brand', { brand: regex }),
        ])

        const suggestions = [
            ...products.map(p => ({ type: 'product', text: p.name, id: p._id })),
            ...categories.map(c => ({ type: 'category', text: c })),
            ...brands.filter(Boolean).map(b => ({ type: 'brand', text: b })),
        ].slice(0, 8)

        res.json({ suggestions })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/price-compare/:productId — price comparison across stores
export const priceCompare = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Find same product across different stores
        const alternatives = await Product.find({
            _id: { $ne: product._id },
            $or: [
                { name: new RegExp(product.name, 'i') },
                { category: product.category, brand: product.brand },
            ],
        })
            .populate('storeId', 'name username')
            .sort({ price: 1 })
            .limit(5)

        res.json({
            currentProduct: {
                id: product._id,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                store: product.storeId,
            },
            alternatives,
            savings: product.mrp - product.price,
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/ai/category-insights — category analytics
export const getCategoryInsights = async (req, res, next) => {
    try {
        const insights = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    avgRating: { $avg: '$avgRating' },
                    totalSold: { $sum: '$soldCount' },
                },
            },
            { $sort: { count: -1 } },
        ])

        res.json(insights)
    } catch (error) {
        next(error)
    }
}
