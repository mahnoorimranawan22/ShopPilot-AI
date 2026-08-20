import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Storage Strategy ────────────────────────────────────────
// Use Cloudinary if configured, otherwise fall back to local storage

let storage

// Try to use Cloudinary storage
try {
    const { default: cloudinaryStorage } = await import('multer-storage-cloudinary')
    const { v2: cloudinary } = await import('cloudinary')

    if (process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })

        storage = new cloudinaryStorage({
            cloudinary,
            params: {
                folder: 'shoppilot-ai/products',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
                ],
            },
        })

        console.log('✅ Upload: Using Cloudinary storage')
    }
} catch {
    // Cloudinary not available, use local storage
}

// Fallback to local storage
if (!storage) {
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '..', 'uploads'))
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`)
        },
    })
    console.log('📁 Upload: Using local storage')
}

// ─── File Filter ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`), false)
    }
}

// ─── Upload Middleware ───────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 10,                  // Max 10 files per request
    },
})

// ─── Named Exports ──────────────────────────────────────────
export const uploadSingle = (fieldName) => upload.single(fieldName)
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount)
export const uploadFields = (fields) => upload.fields(fields)

// ─── Error Handler ──────────────────────────────────────────
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 5MB.',
            })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files. Maximum is 10 files per upload.',
            })
        }
        return res.status(400).json({ error: err.message })
    }

    if (err.message?.includes('Invalid file type')) {
        return res.status(400).json({ error: err.message })
    }

    next(err)
}

export default upload
