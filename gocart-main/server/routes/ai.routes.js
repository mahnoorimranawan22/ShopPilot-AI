import { Router } from 'express'
import {
    askAssistant, getSuggestions, getFollowUps,
    getRecommended, trackBehavior, generateProduct, reviewAnalysis, businessInsight, inventoryIntelligence,
    getRecommendations, getTrending, getSearchSuggestions,
    priceCompare, getCategoryInsights, visualSearch,
} from '../controllers/ai.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// AI Shopping Assistant
router.post('/ask', askAssistant)
router.get('/suggestions', getSuggestions)
router.post('/follow-up', getFollowUps)

// AI Inventory Intelligence
router.get('/inventory-intelligence', inventoryIntelligence)

// AI Business Intelligence
router.post('/business-insight', businessInsight)

// AI Review Analysis
router.post('/review-analysis', reviewAnalysis)

// AI Product Generator
router.post('/generate-product', generateProduct)

// Personalized recommendations (optional auth)
router.get('/recommended', getRecommended)
router.post('/track', trackBehavior)

// Visual Search
router.post('/visual-search', visualSearch)

// Existing endpoints
router.get('/recommendations/:productId', getRecommendations)
router.get('/trending', getTrending)
router.get('/search-suggestions', getSearchSuggestions)
router.get('/price-compare/:productId', priceCompare)
router.get('/category-insights', getCategoryInsights)

export default router
