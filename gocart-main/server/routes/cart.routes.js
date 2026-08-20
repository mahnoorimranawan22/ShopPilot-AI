import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect) // All cart routes require auth

router.get('/', getCart)
router.post('/items', addToCart)
router.put('/items/:productId', updateCartItem)
router.delete('/items/:productId', removeFromCart)
router.delete('/', clearCart)

export default router
