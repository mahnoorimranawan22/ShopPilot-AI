import { Cart, Product } from '../models/index.js'

// GET /api/cart
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price images mrp inStock stock')

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] })
        }

        res.json(cart)
    } catch (error) {
        next(error)
    }
}

// POST /api/cart/items — add item
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' })
        }

        const product = await Product.findById(productId)
        if (!product || !product.inStock) {
            return res.status(404).json({ error: 'Product not found or out of stock' })
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: `Only ${product.stock} items in stock` })
        }

        let cart = await Cart.findOne({ user: req.user._id })
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] })
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        )

        if (existingItem) {
            existingItem.quantity += quantity
            if (existingItem.quantity > product.stock) {
                existingItem.quantity = product.stock
            }
        } else {
            cart.items.push({ product: productId, quantity })
        }

        await cart.save()
        cart = await cart.populate('items.product', 'name price images mrp inStock stock')

        res.json(cart)
    } catch (error) {
        next(error)
    }
}

// PUT /api/cart/items/:productId — update quantity
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body
        const { productId } = req.params

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        const cart = await Cart.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        const item = cart.items.find(i => i.product.toString() === productId)
        if (!item) {
            return res.status(404).json({ error: 'Item not in cart' })
        }

        item.quantity = Math.min(quantity, product.stock)
        await cart.save()

        const updated = await cart.populate('items.product', 'name price images mrp inStock stock')
        res.json(updated)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/cart/items/:productId — remove item
export const removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        )
        await cart.save()

        const updated = await cart.populate('items.product', 'name price images mrp inStock stock')
        res.json(updated)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/cart — clear cart
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
        if (cart) {
            cart.items = []
            await cart.save()
        }
        res.json({ message: 'Cart cleared' })
    } catch (error) {
        next(error)
    }
}
