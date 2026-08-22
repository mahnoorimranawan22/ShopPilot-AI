/**
 * Security Middleware Suite
 * 
 * Adds:
 * 1. Input sanitization (XSS prevention)
 * 2. Strict rate limiting for auth endpoints
 * 3. Request size limiting
 * 4. API key validation (protect AI keys from exposure)
 * 5. Security headers enhancement
 * 6. MongoDB injection prevention
 */

import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'

// ─── 1. Input Sanitization ───────────────────────────────────
// Prevent NoSQL injection and XSS
export const sanitizeInput = (req, res, next) => {
    // Sanitize body, query, and params to prevent NoSQL injection
    if (req.body) {
        req.body = sanitizeObject(req.body)
    }
    if (req.query) {
        req.query = sanitizeObject(req.query)
    }
    if (req.params) {
        req.params = sanitizeObject(req.params)
    }
    next()
}

function sanitizeObject(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null || depth > 10) return obj

    const sanitized = Array.isArray(obj) ? [] : {}

    for (const [key, value] of Object.entries(obj)) {
        // Remove __proto__ and constructor injection
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue

        if (typeof value === 'string') {
            // Basic XSS prevention: strip script tags and event handlers
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '')
                .trim()
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, depth + 1)
        } else {
            sanitized[key] = value
        }
    }

    return sanitized
}

// ─── 2. Strict Rate Limiting ─────────────────────────────────
// General API rate limit (already in server.js, but enhanced here)

// Strict rate limit for authentication endpoints
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Rate limit for password reset
export const passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        error: 'Too many password reset attempts. Please try again in 1 hour.',
    },
})

// Rate limit for AI endpoints (prevent abuse)
export const aiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: {
        error: 'Too many AI requests. Please slow down.',
    },
})

// Rate limit for file uploads
export const uploadRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        error: 'Upload limit reached. Please try again later.',
    },
})

// ─── 3. Request Size Validation ──────────────────────────────
export const validateRequestSize = (maxSizeKB = 1024) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0')
        const maxBytes = maxSizeKB * 1024

        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: `Request too large. Maximum size is ${maxSizeKB}KB.`,
            })
        }
        next()
    }
}

// ─── 4. API Key Protection ───────────────────────────────────
// Ensure AI API keys are never exposed in responses
export const protectAPIKeys = (req, res, next) => {
    const originalJson = res.json.bind(res)

    res.json = (data) => {
        try {
            if (data && typeof data === 'object') {
                // Convert to plain object first (safe for Mongoose docs)
                const plain = JSON.parse(JSON.stringify(data))
                const cleaned = removeSensitiveFields(plain)
                return originalJson(cleaned)
            }
        } catch {}
        return originalJson(data)
    }

    next()
}

function removeSensitiveFields(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null || depth > 10) return obj

    const sensitiveKeys = [
        'apiKey', 'api_key', 'secret', 'token', 'password',
        'openaiApiKey', 'OPENAI_API_KEY', 'jwtSecret',
        'accessToken', 'refreshToken', 'secretKey',
    ]

    const cleaned = Array.isArray(obj) ? [] : {}

    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
            cleaned[key] = '[REDACTED]'
        } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = removeSensitiveFields(value, depth + 1)
        } else {
            cleaned[key] = value
        }
    }

    return cleaned
}

// ─── 5. Security Headers Enhancement ─────────────────────────
export const enhancedSecurityHeaders = (req, res, next) => {
    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions policy (restrict browser features)
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

    next()
}

// ─── 6. MongoDB Injection Prevention ─────────────────────────
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️ NoSQL injection attempt blocked: ${key} in ${req.originalUrl}`)
    },
})

// ─── 7. CORS Configuration ───────────────────────────────────
export const configureCORS = (allowedOrigins = []) => {
    return (req, res, next) => {
        const origin = req.headers.origin

        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || !origin) {
            res.setHeader('Access-Control-Allow-Origin', origin || '*')
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Max-Age', '86400')

        if (req.method === 'OPTIONS') {
            return res.status(204).end()
        }

        next()
    }
}

// ─── 8. Password Strength Validation ─────────────────────────
export const validatePassword = (password) => {
    const errors = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

// ─── 9. Email Validation ─────────────────────────────────────
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// ─── 10. SQL/NoSQL Query Logger (for audit) ──────────────────
export const securityAuditLog = (req, res, next) => {
    const suspicious = []

    // Check for suspicious patterns in request
    const fullUrl = req.originalUrl + JSON.stringify(req.body || {})

    if (/(\$\w+|\.\.\/|\.\.\\)/.test(fullUrl)) {
        suspicious.push('path_traversal')
    }
    if (/(union\s+select|select\s+\*|insert\s+into|drop\s+table|delete\s+from)/i.test(fullUrl)) {
        suspicious.push('sql_injection')
    }
    if (/(<script|javascript:|onerror=|onload=)/i.test(fullUrl)) {
        suspicious.push('xss_attempt')
    }

    if (suspicious.length > 0) {
        console.warn(`🚨 Security alert: ${suspicious.join(', ')} from ${req.ip} on ${req.method} ${req.originalUrl}`)
    }

    next()
}
