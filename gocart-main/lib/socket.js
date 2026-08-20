import { io } from 'socket.io-client'

let socket = null
let listeners = new Map()

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

export const getSocket = () => {
    if (typeof window === 'undefined') return null

    if (!socket) {
        const token = localStorage.getItem('shoppilot_token')
        socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
        })
    }

    return socket
}

export const connectSocket = (userData) => {
    if (typeof window === 'undefined') return

    const s = getSocket()
    if (!s) return

    if (userData) {
        s.auth = {
            token: localStorage.getItem('shoppilot_token'),
            role: userData.role,
            name: userData.name,
        }
    }

    if (!s.connected) {
        s.connect()
    }

    return s
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
        listeners.clear()
    }
}

// Safe event listener registration (deduplicates)
export const onSocket = (event, callback) => {
    const s = getSocket()
    if (!s) return () => {}

    // Remove previous listener for this event if exists
    if (listeners.has(event)) {
        s.off(event, listeners.get(event))
    }

    s.on(event, callback)
    listeners.set(event, callback)

    // Return cleanup function
    return () => {
        s.off(event, callback)
        listeners.delete(event)
    }
}

// Emit event
export const emitSocket = (event, data) => {
    const s = getSocket()
    if (s?.connected) {
        s.emit(event, data)
    }
}

// Join a store room (for merchants)
export const joinStoreRoom = (storeId) => {
    emitSocket('store:join', storeId)
}

// Join a chat room
export const joinChatRoom = (roomId) => {
    emitSocket('chat:join', roomId)
}

// Leave a chat room
export const leaveChatRoom = (roomId) => {
    emitSocket('chat:leave', roomId)
}

// Send chat message
export const sendChatMessage = (data) => {
    emitSocket('chat:message', data)
}

// Send typing indicator
export const sendTyping = (data) => {
    emitSocket('chat:typing', data)
}
