import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// Protect routes — require valid JWT
export const protect = async (req, res, next) => {
    try {
        let token

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized — no token' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)

        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized — user not found' })
        }

        if (!req.user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' })
        }

        next()
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized — invalid token' })
    }
}

// Require specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Role '${req.user.role}' is not authorized for this action`,
            })
        }
        next()
    }
}

// Optional auth — attach user if token present, but don't block
export const optionalAuth = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id)
        }
    } catch {
        // Ignore invalid tokens
    }
    next()
}

// Generate JWT
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })
}
