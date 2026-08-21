import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/products — list all products with optional filters
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || ''
        const brand = searchParams.get('brand') || ''
        const sort = searchParams.get('sort') || 'createdAt'
        const order = searchParams.get('order') || 'desc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const minPrice = parseFloat(searchParams.get('minPrice') || '0')
        const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
        const inStock = searchParams.get('inStock')

        const where = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ]
        }

        if (category) {
            where.category = { equals: category, mode: 'insensitive' }
        }

        if (brand) {
            where.brand = { equals: brand, mode: 'insensitive' }
        }

        if (inStock === 'true') {
            where.inStock = true
        }

        where.price = { gte: minPrice, lte: maxPrice }

        const skip = (page - 1) * limit

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    store: {
                        select: { id: true, name: true, username: true, logo: true },
                    },
                    rating: {
                        select: { rating: true, review: true, userId: true, createdAt: true },
                    },
                },
                orderBy: { [sort]: order },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ])

        return NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('GET /api/products error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST /api/products — create a new product
export async function POST(request) {
    try {
        const body = await request.json()
        const { name, description, mrp, price, images, category, brand, stock, tags, storeId, inStock } = body

        if (!name || !description || mrp == null || price == null || !category || !storeId) {
            return NextResponse.json(
                { error: 'Missing required fields: name, description, mrp, price, category, storeId' },
                { status: 400 }
            )
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                mrp: parseFloat(mrp),
                price: parseFloat(price),
                images: images || [],
                category,
                brand: brand || '',
                stock: stock != null ? parseInt(stock) : 100,
                tags: tags || [],
                inStock: inStock !== false,
                storeId,
            },
            include: {
                store: {
                    select: { id: true, name: true, username: true, logo: true },
                },
            },
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error('POST /api/products error:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
