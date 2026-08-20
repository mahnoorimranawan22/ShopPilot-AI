import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 5000,
    },
    mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: 0,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    images: [{
        type: String,
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    brand: {
        type: String,
        default: '',
        trim: true,
    },
    stock: {
        type: Number,
        default: 100,
        min: 0,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    inStock: {
        type: Boolean,
        default: true,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    avgRating: {
        type: Number,
        default: 0,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store ID is required'],
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
})

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' })
productSchema.index({ category: 1, price: 1 })
productSchema.index({ storeId: 1 })
productSchema.index({ avgRating: -1 })
productSchema.index({ createdAt: -1 })

// Update avgRating when ratings change
productSchema.methods.recalculateRating = async function () {
    const Review = mongoose.model('Review')
    const stats = await Review.aggregate([
        { $match: { product: this._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    if (stats.length > 0) {
        this.avgRating = Math.round(stats[0].avgRating * 10) / 10
        this.ratingCount = stats[0].count
    } else {
        this.avgRating = 0
        this.ratingCount = 0
    }
    await this.save()
}

export default mongoose.model('Product', productSchema)
