import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
        maxlength: 2000,
    },
    reply: {
        type: String,
        default: '',
        maxlength: 2000,
    },
}, {
    timestamps: true,
})

// One review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true })
reviewSchema.index({ product: 1, createdAt: -1 })

export default mongoose.model('Review', reviewSchema)
