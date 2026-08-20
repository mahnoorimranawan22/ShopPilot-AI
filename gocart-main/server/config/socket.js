import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let io

// Connected users map: userId -> Set of socket IDs
const connectedUsers = new Map()
// Store rooms: storeId -> Set of socket IDs
const storeRooms = new Map()

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    })

    // ─── Auth Middleware ─────────────────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                socket.userId = decoded.id
                socket.userRole = socket.handshake.auth?.role || 'buyer'
                socket.userName = socket.handshake.auth?.name || 'User'
            } catch {
                // Allow anonymous connections for chat
                socket.userId = null
            }
        }
        next()
    })

    // ─── Connection Handler ──────────────────────────────────
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId || 'anonymous'})`)

        // Join personal room if authenticated
        if (socket.userId) {
            socket.join(`user:${socket.userId}`)

            if (!connectedUsers.has(socket.userId)) {
                connectedUsers.set(socket.userId, new Set())
            }
            connectedUsers.get(socket.userId).add(socket.id)

            // Notify admin of new connection
            io.to('room:admin').emit('user:online', {
                userId: socket.userId,
                name: socket.userName,
                timestamp: new Date().toISOString(),
            })
        }

        // Join role-based rooms
        if (socket.userRole === 'admin') {
            socket.join('room:admin')
        }

        // ─── Store Room Management ──────────────────────────
        socket.on('store:join', (storeId) => {
            socket.join(`store:${storeId}`)
            socket.storeId = storeId

            if (!storeRooms.has(storeId)) {
                storeRooms.set(storeId, new Set())
            }
            storeRooms.get(storeId).add(socket.id)
            console.log(`🏪 Socket ${socket.id} joined store:${storeId}`)
        })

        socket.on('store:leave', (storeId) => {
            socket.leave(`store:${storeId}`)
            if (storeRooms.has(storeId)) {
                storeRooms.get(storeId).delete(socket.id)
            }
        })

        // ─── Chat Events ────────────────────────────────────
        socket.on('chat:join', (roomId) => {
            socket.join(`chat:${roomId}`)
            console.log(`💬 Socket ${socket.id} joined chat:${roomId}`)
        })

        socket.on('chat:leave', (roomId) => {
            socket.leave(`chat:${roomId}`)
        })

        socket.on('chat:message', (data) => {
            // Broadcast to the chat room
            io.to(`chat:${data.roomId}`).emit('chat:message', {
                ...data,
                timestamp: new Date().toISOString(),
            })
        })

        socket.on('chat:typing', (data) => {
            socket.to(`chat:${data.roomId}`).emit('chat:typing', data)
        })

        // ─── Admin Events ───────────────────────────────────
        socket.on('admin:broadcast', (data) => {
            if (socket.userRole === 'admin') {
                io.emit('admin:announcement', {
                    ...data,
                    timestamp: new Date().toISOString(),
                })
            }
        })

        // ─── Disconnect ─────────────────────────────────────
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`)

            if (socket.userId && connectedUsers.has(socket.userId)) {
                connectedUsers.get(socket.userId).delete(socket.id)
                if (connectedUsers.get(socket.userId).size === 0) {
                    connectedUsers.delete(socket.userId)
                }
            }

            if (socket.storeId && storeRooms.has(socket.storeId)) {
                storeRooms.get(socket.storeId).delete(socket.id)
            }
        })
    })

    console.log('✅ Socket.IO initialized')
    return io
}

export const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized')
    return io
}

// ─── Emit Helpers ────────────────────────────────────────────

// Send to a specific user
export const emitToUser = (userId, event, data) => {
    if (!io) return
    io.to(`user:${userId}`).emit(event, { ...data, timestamp: new Date().toISOString() })
}

// Send to a store room
export const emitToStore = (storeId, event, data) => {
    if (!io) return
    io.to(`store:${storeId}`).emit(event, { ...data, timestamp: new Date().toISOString() })
}

// Send to all admins
export const emitToAdmins = (event, data) => {
    if (!io) return
    io.to('room:admin').emit(event, { ...data, timestamp: new Date().toISOString() })
}

// Broadcast to all connected clients
export const broadcast = (event, data) => {
    if (!io) return
    io.emit(event, { ...data, timestamp: new Date().toISOString() })
}

// Get online user count
export const getOnlineCount = () => connectedUsers.size

// Check if a user is online
export const isUserOnline = (userId) => connectedUsers.has(userId)
