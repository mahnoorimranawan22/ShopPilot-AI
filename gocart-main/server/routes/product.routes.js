import { Router } from 'express'
import {
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getCategories, getBrands,
} from '../controllers/product.controller.js'
import { protect, authorize, optionalAuth } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/brands', getBrands)
router.get('/:id', optionalAuth, getProduct)

// Seller only
router.post('/', protect, authorize('seller', 'admin'), createProduct)
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct)
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct)

export default router
