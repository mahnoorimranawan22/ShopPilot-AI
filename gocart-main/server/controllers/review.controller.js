import { Review, Product, Order } from '../models/index.js'

// GET /api/reviews/product/:productId
export const getProductReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const [reviews, total] = await Promise.all([
            Review.find({ product: req.params.productId })
                .populate('user', 'name image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Review.countDocuments({ product: req.params.productId }),
        ])

        res.json({
            reviews,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

// POST /api/reviews — add review (must have purchased)
export const addReview = async (req, res, next) => {
    try {
        const { productId, orderId, rating, review } = req.body

        if (!productId || !orderId || !rating || !review) {
            return res.status(400).json({ error: 'productId, orderId, rating, and review are required' })
        }

        // Verify the user ordered this product
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            'items.product': productId,
            status: 'DELIVERED',
        })

        if (!order) {
            return res.status(400).json({ error: 'You can only review products from delivered orders' })
        }

        const existingReview = await Review.findOne({
            user: req.user._id,
            product: productId,
            order: orderId,
        })

        if (existingReview) {
            return res.status(409).json({ error: 'You have already reviewed this product for this order' })
        }

        const newReview = await Review.create({
            user: req.user._id,
            product: productId,
            order: orderId,
            rating,
            review,
        })

        // Recalculate product rating
        const product = await Product.findById(productId)
        if (product) {
            await product.recalculateRating()
        }

        const populated = await newReview.populate('user', 'name image')
        res.status(201).json(populated)
    } catch (error) {
        next(error)
    }
}

// PUT /api/reviews/:id
export const updateReview = async (req, res, next) => {
    try {
        const reviewDoc = await Review.findById(req.params.id)
        if (!reviewDoc) {
            return res.status(404).json({ error: 'Review not found' })
        }

        if (reviewDoc.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        const { rating, review } = req.body
        if (rating !== undefined) reviewDoc.rating = rating
        if (review !== undefined) reviewDoc.review = review

        await reviewDoc.save()

        // Recalculate product rating
        const product = await Product.findById(reviewDoc.product)
        if (product) await product.recalculateRating()

        res.json(reviewDoc)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
    try {
        const reviewDoc = await Review.findById(req.params.id)
        if (!reviewDoc) {
            return res.status(404).json({ error: 'Review not found' })
        }

        if (reviewDoc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' })
        }

        const productId = reviewDoc.product
        await Review.findByIdAndDelete(req.params.id)

        // Recalculate product rating
        const product = await Product.findById(productId)
        if (product) await product.recalculateRating()

        res.json({ message: 'Review deleted' })
    } catch (error) {
        next(error)
    }
}
