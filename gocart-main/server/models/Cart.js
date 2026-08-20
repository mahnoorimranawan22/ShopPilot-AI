import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, { _id: false })

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    couponCode: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
})



// Virtual for total item count
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
})

cartSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Cart', cartSchema)
