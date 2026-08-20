import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true, // e.g. "support-user123" or "support-order456"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderRole: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 5000,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

chatMessageSchema.index({ room: 1, createdAt: -1 })
chatMessageSchema.index({ sender: 1 })

export default mongoose.model('ChatMessage', chatMessageSchema)
