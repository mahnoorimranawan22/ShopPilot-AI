import { Product } from '../models/index.js'

// GET /api/products — list with search, filter, sort, pagination
export const getProducts = async (req, res, next) => {
    try {
        const {
            search, category, brand, minPrice, maxPrice,
            sort = 'createdAt', order = 'desc',
            page = 1, limit = 20, inStock, featured,
        } = req.query

        const where = {}

        if (search) {
            where.$text = { $search: search }
        }
        if (category) where.category = category
        if (brand) where.brand = brand
        if (inStock === 'true') where.inStock = true
        if (featured === 'true') where.isFeatured = true
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.$gte = Number(minPrice)
            if (maxPrice) where.price.$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)
        const sortObj = { [sort]: order === 'desc' ? -1 : 1 }

        const [products, total] = await Promise.all([
            Product.find(where)
                .populate('storeId', 'name username logo')
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(where),
        ])

        res.json({
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/products/:id
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('storeId', 'name username logo description email contact')

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        res.json(product)
    } catch (error) {
        next(error)
    }
}

// POST /api/products — create (seller only)
export const createProduct = async (req, res, next) => {
    try {
        const { name, description, mrp, price, images, category, brand, stock, tags, inStock } = req.body

        if (!name || !description || mrp == null || price == null || !category) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Get seller's store
        const { Store } = await import('../models/index.js')
        const store = await Store.findOne({ userId: req.user._id })
        if (!store) {
            return res.status(404).json({ error: 'You must create a store first' })
        }

        const product = await Product.create({
            name, description, mrp, price,
            images: images || [],
            category,
            brand: brand || '',
            stock: stock ?? 100,
            tags: tags || [],
            inStock: inStock !== false,
            storeId: store._id,
        })

        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
}

// PUT /api/products/:id — update (owner only)
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Verify ownership
        const { Store } = await import('../models/index.js')
        const store = await Store.findById(product.storeId)
        if (!store || store.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this product' })
        }

        const allowed = ['name', 'description', 'mrp', 'price', 'images', 'category', 'brand', 'stock', 'tags', 'inStock', 'isFeatured']
        const updates = {}
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key]
        }

        const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        })

        res.json(updated)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        const { Store } = await import('../models/index.js')
        const store = await Store.findById(product.storeId)
        if (!store || store.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this product' })
        }

        await Product.findByIdAndDelete(req.params.id)
        res.json({ message: 'Product deleted' })
    } catch (error) {
        next(error)
    }
}

// GET /api/products/categories/list
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category')
        res.json(categories)
    } catch (error) {
        next(error)
    }
}

// GET /api/products/brands/list
export const getBrands = async (req, res, next) => {
    try {
        const brands = await Product.distinct('brand')
        res.json(brands.filter(Boolean))
    } catch (error) {
        next(error)
    }
}
