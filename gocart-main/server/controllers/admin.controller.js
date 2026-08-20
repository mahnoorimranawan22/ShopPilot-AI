import { User, Product, Order, Store, Coupon, Review } from '../models/index.js'
import { emitToUser, emitToStore, emitToAdmins, broadcast } from '../config/socket.js'

// GET /api/admin/dashboard
export const getDashboard = async (req, res, next) => {
    try {
        const [totalUsers, totalProducts, totalOrders, totalStores, revenue, recentOrders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Store.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.find()
                .populate('user', 'name email')
                .populate('store', 'name')
                .sort({ createdAt: -1 })
                .limit(10),
        ])

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalStores,
            totalRevenue: revenue[0]?.total || 0,
            recentOrders,
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 })
        res.json(users)
    } catch (error) {
        next(error)
    }
}

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body
        if (!['buyer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' })
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
        if (!user) return res.status(404).json({ error: 'User not found' })

        emitToUser(req.params.id, 'user:roleChanged', { role })
        res.json(user)
    } catch (error) {
        next(error)
    }
}

// PUT /api/admin/users/:id/status
export const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        user.isActive = !user.isActive
        await user.save()

        emitToUser(req.params.id, 'user:statusChanged', { isActive: user.isActive })
        res.json(user)
    } catch (error) {
        next(error)
    }
}

// GET /api/admin/stores
export const getStores = async (req, res, next) => {
    try {
        const { status } = req.query
        const where = status ? { status } : {}
        const stores = await Store.find(where)
            .populate('userId', 'name email image')
            .sort({ createdAt: -1 })
        res.json(stores)
    } catch (error) {
        next(error)
    }
}

// PUT /api/admin/stores/:id/approve
export const approveStore = async (req, res, next) => {
    try {
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', isActive: true },
            { new: true }
        )
        if (!store) return res.status(404).json({ error: 'Store not found' })

        await User.findByIdAndUpdate(store.userId, { role: 'seller' })

        // Socket: notify the store owner
        emitToUser(store.userId.toString(), 'store:approved', {
            storeId: store._id,
            storeName: store.name,
            message: `Your store "${store.name}" has been approved! You can now start selling.`,
        })

        // Socket: notify admins
        emitToAdmins('store:approved', {
            storeId: store._id,
            storeName: store.name,
            owner: store.userId,
        })

        res.json(store)
    } catch (error) {
        next(error)
    }
}

// PUT /api/admin/stores/:id/reject
export const rejectStore = async (req, res, next) => {
    try {
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isActive: false },
            { new: true }
        )
        if (!store) return res.status(404).json({ error: 'Store not found' })

        emitToUser(store.userId.toString(), 'store:rejected', {
            storeId: store._id,
            storeName: store.name,
            message: `Your store application was not approved. Please contact support.`,
        })

        res.json(store)
    } catch (error) {
        next(error)
    }
}

// GET /api/admin/orders
export const getOrders = async (req, res, next) => {
    try {
        const { status } = req.query
        const where = status ? { status } : {}
        const orders = await Order.find(where)
            .populate('user', 'name email')
            .populate('store', 'name username')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        next(error)
    }
}

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const valid = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
        if (!valid.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status,
                ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
            },
            { new: true }
        ).populate('user', 'name email').populate('store', 'name')

        if (!order) return res.status(404).json({ error: 'Order not found' })

        // Socket: notify customer of status change
        emitToUser(order.user._id.toString(), 'order:statusChanged', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            status,
            storeName: order.store?.name,
            message: `Your order status has been updated to ${status.replace('_', ' ').toLowerCase()}`,
        })

        // Socket: notify store of status change
        emitToStore(order.store._id.toString(), 'order:statusChanged', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            status,
            customer: order.user.name,
        })

        // Socket: notify admins
        emitToAdmins('order:statusChanged', {
            orderId: order._id,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            status,
        })

        res.json(order)
    } catch (error) {
        next(error)
    }
}

// ─── Coupons ──────────────────────────────────────────────────

export const getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 })
        res.json(coupons)
    } catch (error) {
        next(error)
    }
}

export const createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body)
        res.status(201).json(coupon)
    } catch (error) {
        next(error)
    }
}

export const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findOneAndUpdate(
            { code: req.params.code.toUpperCase() },
            req.body,
            { new: true }
        )
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
        res.json(coupon)
    } catch (error) {
        next(error)
    }
}

export const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findOneAndDelete({ code: req.params.code.toUpperCase() })
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
        res.json({ message: 'Coupon deleted' })
    } catch (error) {
        next(error)
    }
}
