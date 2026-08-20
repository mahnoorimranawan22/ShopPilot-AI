import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: String, // snapshot at time of order
    image: String, // snapshot at time of order
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
        name: String,
        email: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'STRIPE'],
        required: true,
    },
    paymentId: String,
    subtotal: {
        type: Number,
        required: true,
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    couponCode: String,
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'ORDER_PLACED',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    deliveredAt: Date,
    trackingNumber: String,
}, {
    timestamps: true,
})

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ store: 1, status: 1 })
orderSchema.index({ status: 1 })

export default mongoose.model('Order', orderSchema)
