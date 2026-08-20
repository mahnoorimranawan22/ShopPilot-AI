import { Order, Cart, Product, Coupon } from '../models/index.js'
import { emitToUser, emitToStore, emitToAdmins } from '../config/socket.js'

// POST /api/orders — place order
export const placeOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, couponCode } = req.body

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ error: 'Shipping address and payment method are required' })
        }

        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product')

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' })
        }

        for (const item of cart.items) {
            if (!item.product.inStock || item.product.stock < item.quantity) {
                return res.status(400).json({
                    error: `${item.product.name} is out of stock or has insufficient quantity`,
                })
            }
        }

        const storeItems = {}
        for (const item of cart.items) {
            const storeId = item.product.storeId.toString()
            if (!storeItems[storeId]) storeItems[storeId] = []
            storeItems[storeId].push(item)
        }

        let subtotal = 0
        const orderItems = []

        for (const item of cart.items) {
            const itemTotal = item.product.price * item.quantity
            subtotal += itemTotal
            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images[0] || '',
                quantity: item.quantity,
                price: item.product.price,
            })
        }

        let discount = 0
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiresAt: { $gt: new Date() },
            })
            if (coupon && (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses)) {
                if (subtotal >= (coupon.minOrderAmount || 0)) {
                    discount = (subtotal * coupon.discount) / 100
                    coupon.usedCount += 1
                    await coupon.save()
                }
            }
        }

        const total = Math.max(0, subtotal - discount)
        const storeId = Object.keys(storeItems)[0]

        const order = await Order.create({
            user: req.user._id,
            store: storeId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            discount,
            couponCode: couponCode || '',
            total,
            isPaid: paymentMethod === 'STRIPE',
            paidAt: paymentMethod === 'STRIPE' ? new Date() : undefined,
        })

        // Update stock
        const lowStockProducts = []
        for (const item of cart.items) {
            const updated = await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, soldCount: item.quantity },
            }, { new: true })
            if (updated && updated.stock < 10 && updated.stock >= 0) {
                lowStockProducts.push({ id: updated._id, name: updated.name, stock: updated.stock })
            }
        }

        cart.items = []
        await cart.save()

        const populated = await Order.findById(order._id)
            .populate('items.product', 'name price images')
            .populate('store', 'name username')

        // ─── SOCKET EVENTS ──────────────────────────────────

        // 1. Notify the merchant (store room)
        emitToStore(storeId, 'order:created', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            customer: req.user.name || req.user.email,
            total: total,
            items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            paymentMethod,
            timestamp: order.createdAt,
        })

        // 2. Notify all admins
        emitToAdmins('order:created', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            customer: req.user.name || req.user.email,
            total: total,
            store: populated.store?.name || 'Unknown',
        })

        // 3. Confirm to customer
        emitToUser(req.user._id, 'order:confirmed', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            total: total,
            estimatedDelivery: '3-5 business days',
        })

        // 4. Low stock alert to merchant + admin
        for (const product of lowStockProducts) {
            emitToStore(storeId, 'inventory:low', {
                productId: product.id,
                productName: product.name,
                stock: product.stock,
                message: `Low stock: "${product.name}" has only ${product.stock} units left`,
            })
            emitToAdmins('inventory:low', {
                productId: product.id,
                productName: product.name,
                stock: product.stock,
                storeId,
            })
        }

        res.status(201).json(populated)
    } catch (error) {
        next(error)
    }
}

// GET /api/orders — my orders
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name price images')
            .populate('store', 'name username')
            .sort({ createdAt: -1 })

        res.json(orders)
    } catch (error) {
        next(error)
    }
}

// GET /api/orders/:id — order details
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name price images description')
            .populate('store', 'name username logo email contact')
            .populate('user', 'name email image')

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        res.json(order)
    } catch (error) {
        next(error)
    }
}

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        if (!['ORDER_PLACED', 'PROCESSING'].includes(order.status)) {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' })
        }

        order.status = 'CANCELLED'
        await order.save()

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, soldCount: -item.quantity },
            })
        }

        // Socket: notify merchant + admin of cancellation
        emitToStore(order.store.toString(), 'order:cancelled', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            customer: req.user.name || req.user.email,
        })
        emitToAdmins('order:cancelled', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
        })

        res.json(order)
    } catch (error) {
        next(error)
    }
}
