import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.use(protect)

// Single image upload
router.post('/single', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }
    res.json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
    })
})

// Multiple images upload (max 5)
router.post('/multiple', upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
    }
    const files = req.files.map(f => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        size: f.size,
    }))
    res.json(files)
})

export default router
