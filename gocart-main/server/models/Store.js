import mongoose from 'mongoose'

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000,
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    logo: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    contact: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

storeSchema.index({ status: 1 })

export default mongoose.model('Store', storeSchema)
