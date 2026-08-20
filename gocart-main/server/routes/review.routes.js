import { Router } from 'express'
import { getProductReviews, addReview, updateReview, deleteReview } from '../controllers/review.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/product/:productId', getProductReviews)
router.post('/', protect, addReview)
router.put('/:id', protect, updateReview)
router.delete('/:id', protect, deleteReview)

export default router
