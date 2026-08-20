// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not found — ${req.originalUrl}`)
    error.statusCode = 404
    next(error)
}

// Global error handler
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ error: 'Validation Error', details: messages })
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(409).json({ error: `Duplicate value for '${field}'` })
    }

    // Mongoose cast error (bad ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' })
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' })
    }

    console.error('❌ Error:', err.message)
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack)
    }

    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    })
}
