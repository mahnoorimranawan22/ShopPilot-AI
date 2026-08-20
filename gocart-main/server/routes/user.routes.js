import { Router } from 'express'
import { getUserProfile, getWishlist, toggleWishlist } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/wishlist', protect, getWishlist)
router.post('/wishlist/:productId', protect, toggleWishlist)
router.get('/:id', getUserProfile)

export default router
