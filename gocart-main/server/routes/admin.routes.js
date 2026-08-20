import { Router } from 'express'
import {
    getDashboard, getUsers, updateUserRole, toggleUserStatus,
    getStores, approveStore, rejectStore,
    getOrders, updateOrderStatus,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
} from '../controllers/admin.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

// All admin routes require admin role
router.use(protect, authorize('admin'))

// Dashboard
router.get('/dashboard', getDashboard)

// Users
router.get('/users', getUsers)
router.put('/users/:id/role', updateUserRole)
router.put('/users/:id/status', toggleUserStatus)

// Stores
router.get('/stores', getStores)
router.put('/stores/:id/approve', approveStore)
router.put('/stores/:id/reject', rejectStore)

// Orders
router.get('/orders', getOrders)
router.put('/orders/:id/status', updateOrderStatus)

// Coupons
router.get('/coupons', getCoupons)
router.post('/coupons', createCoupon)
router.put('/coupons/:code', updateCoupon)
router.delete('/coupons/:code', deleteCoupon)

export default router
