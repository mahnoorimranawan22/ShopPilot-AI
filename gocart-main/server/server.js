import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { connectDB } from './config/db.js'
import { initSocket } from './config/socket.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import userRoutes from './routes/user.routes.js'
import reviewRoutes from './routes/review.routes.js'
import adminRoutes from './routes/admin.routes.js'
import aiRoutes from './routes/ai.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import chatRoutes from './routes/chat.routes.js'

// Middleware
import { errorHandler, notFound } from './middleware/error.js'
import {
    sanitizeInput, authRateLimit, aiRateLimit,
    validateRequestSize, protectAPIKeys, enhancedSecurityHeaders,
    mongoSanitizeMiddleware, securityAuditLog
} from './middleware/security.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Initialize Socket.IO
initSocket(httpServer)

// ─── Global Middleware ────────────────────────────────────────
app.use(helmet())
app.use(enhancedSecurityHeaders)
app.use(securityAuditLog)
app.use(morgan('dev'))
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(sanitizeInput)
app.use(mongoSanitizeMiddleware)
app.use(protectAPIKeys)

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// Strict rate limiting for auth
app.use('/api/auth/login', authRateLimit)
app.use('/api/auth/register', authRateLimit)
app.use('/api/auth/password', authRateLimit)

// AI rate limiting
app.use('/api/ai', aiRateLimit)

// Static uploads
app.use('/uploads', express.static('uploads'))

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ShopPilot AI',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/chat', chatRoutes)

// ─── Error Handling ───────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────
const start = async () => {
    await connectDB()
    httpServer.listen(PORT, () => {
        console.log(`\n🚀 ShopPilot AI Server running on port ${PORT}`)
        console.log(`📡 Health: http://localhost:${PORT}/api/health`)
        console.log(`🔌 Socket.IO: ws://localhost:${PORT}`)
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`)
    })
}

start()
