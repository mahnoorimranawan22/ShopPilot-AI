import { User } from '../models/index.js'
import { generateToken } from '../middleware/auth.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' })
        }

        const user = await User.create({ name, email, password })
        const token = generateToken(user._id)

        res.status(201).json({ user, token })
    } catch (error) {
        next(error)
    }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const user = await User.findOne({ email }).select('+password')
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        user.lastLogin = new Date()
        await user.save()

        const token = generateToken(user._id)
        res.json({ user, token })
    } catch (error) {
        next(error)
    }
}

// GET /api/auth/me
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        res.json(user)
    } catch (error) {
        next(error)
    }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name, image, phone } = req.body
        const updates = {}
        if (name !== undefined) updates.name = name
        if (image !== undefined) updates.image = image
        if (phone !== undefined) updates.phone = phone

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        })
        res.json(user)
    } catch (error) {
        next(error)
    }
}

// PUT /api/auth/password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' })
        }

        const user = await User.findById(req.user._id).select('+password')
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Current password is incorrect' })
        }

        user.password = newPassword
        await user.save()

        const token = generateToken(user._id)
        res.json({ message: 'Password updated', token })
    } catch (error) {
        next(error)
    }
}
