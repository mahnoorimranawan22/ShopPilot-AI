import mongoose from 'mongoose'

const userBehaviorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // What products they viewed
    views: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
    }],
    // What they added to cart
    cartAdds: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
    }],
    // What they wishlisted
    wishlistAdds: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
    }],
    // What they purchased
    purchases: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        category: String,
        brand: String,
        price: Number,
        timestamp: { type: Date, default: Date.now },
    }],
    // Search queries they made
    searches: [{
        query: String,
        timestamp: { type: Date, default: Date.now },
    }],
    // Categories they've shown interest in (computed)
    preferredCategories: [{
        category: String,
        score: { type: Number, default: 0 },
    }],
    // Brands they prefer (computed)
    preferredBrands: [{
        brand: String,
        score: { type: Number, default: 0 },
    }],
    // Price range they typically shop in
    priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 1000 },
    },
}, { timestamps: true })

// Keep only last 100 items per behavior type
userBehaviorSchema.pre('save', function (next) {
    const MAX = 100
    if (this.views.length > MAX) this.views = this.views.slice(-MAX)
    if (this.cartAdds.length > MAX) this.cartAdds = this.cartAdds.slice(-MAX)
    if (this.wishlistAdds.length > MAX) this.wishlistAdds = this.wishlistAdds.slice(-MAX)
    if (this.purchases.length > MAX) this.purchases = this.purchases.slice(-MAX)
    if (this.searches.length > MAX) this.searches = this.searches.slice(-MAX)
    next()
})

// Index for fast lookup
userBehaviorSchema.index({ user: 1 })
userBehaviorSchema.index({ 'views.product': 1 })
userBehaviorSchema.index({ 'purchases.product': 1 })

export default mongoose.model('UserBehavior', userBehaviorSchema)
