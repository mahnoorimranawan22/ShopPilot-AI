import { Router } from 'express'
import { placeOrder, getMyOrders, getOrder, cancelOrder } from '../controllers/order.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.post('/', placeOrder)
router.get('/', getMyOrders)
router.get('/:id', getOrder)
router.put('/:id/cancel', cancelOrder)

export default router
