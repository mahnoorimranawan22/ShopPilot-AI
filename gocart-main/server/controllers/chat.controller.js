import ChatMessage from '../models/Chat.js'

// GET /api/chat/:roomId — get message history
export const getMessages = async (req, res, next) => {
    try {
        const { roomId } = req.params
        const { limit = 50, before } = req.query

        const query = { room: roomId }
        if (before) {
            query.createdAt = { $lt: new Date(before) }
        }

        const messages = await ChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean()

        res.json(messages.reverse())
    } catch (error) {
        next(error)
    }
}

// POST /api/chat/:roomId — save a message (called alongside socket emit)
export const saveMessage = async (req, res, next) => {
    try {
        const { roomId } = req.params
        const { message, senderName, senderRole } = req.body

        if (!message) {
            return res.status(400).json({ error: 'Message is required' })
        }

        const chatMessage = await ChatMessage.create({
            room: roomId,
            sender: req.user._id,
            senderName: senderName || req.user.name,
            senderRole: senderRole || req.user.role,
            message,
        })

        res.status(201).json(chatMessage)
    } catch (error) {
        next(error)
    }
}

// GET /api/chat/rooms/list — admin: list all active chat rooms
export const getChatRooms = async (req, res, next) => {
    try {
        // Get distinct rooms with their latest message
        const rooms = await ChatMessage.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$room',
                    lastMessage: { $first: '$message' },
                    lastSender: { $first: '$senderName' },
                    lastTime: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] },
                    },
                },
            },
            { $sort: { lastTime: -1 } },
            { $limit: 50 },
        ])

        res.json(rooms)
    } catch (error) {
        next(error)
    }
}

// PUT /api/chat/:roomId/read — mark messages as read
export const markAsRead = async (req, res, next) => {
    try {
        const { roomId } = req.params
        await ChatMessage.updateMany(
            { room: roomId, read: false },
            { read: true }
        )
        res.json({ message: 'Marked as read' })
    } catch (error) {
        next(error)
    }
}
