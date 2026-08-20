import { User, Wishlist, Product } from '../models/index.js'

// GET /api/users/:id — public profile
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-email')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(user)
    } catch (error) {
        next(error)
    }
}

// GET /api/users/wishlist
export const getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products', 'name price images avgRating mrp inStock category brand')

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] })
        }

        res.json(wishlist)
    } catch (error) {
        next(error)
    }
}

// POST /api/users/wishlist/:productId — toggle wishlist
export const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id })
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, products: [] })
        }

        const index = wishlist.products.findIndex(p => p.toString() === productId)
        if (index > -1) {
            wishlist.products.splice(index, 1)
        } else {
            wishlist.products.push(productId)
        }

        await wishlist.save()
        wishlist = await wishlist.populate('products', 'name price images avgRating mrp inStock category brand')

        res.json({
            wishlist,
            action: index > -1 ? 'removed' : 'added',
        })
    } catch (error) {
        next(error)
    }
}
