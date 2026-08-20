import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    forNewUser: {
        type: Boolean,
        default: false,
    },
    forMember: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxUses: {
        type: Number,
        default: 0, // 0 = unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
})



export default mongoose.model('Coupon', couponSchema)
