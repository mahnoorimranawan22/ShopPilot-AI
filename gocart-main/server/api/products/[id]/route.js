import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/products/[id] — get a single product with ratings and store
export async function GET(request, { params }) {
    try {
        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                store: {
                    select: { id: true, name: true, username: true, logo: true, description: true, email: true, contact: true },
                },
                rating: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('GET /api/products/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// PUT /api/products/[id] — update a product
export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const body = await request.json()

        const existing = await prisma.product.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        const data = {}
        if (body.name !== undefined) data.name = body.name
        if (body.description !== undefined) data.description = body.description
        if (body.mrp !== undefined) data.mrp = parseFloat(body.mrp)
        if (body.price !== undefined) data.price = parseFloat(body.price)
        if (body.images !== undefined) data.images = body.images
        if (body.category !== undefined) data.category = body.category
        if (body.brand !== undefined) data.brand = body.brand
        if (body.stock !== undefined) data.stock = parseInt(body.stock)
        if (body.tags !== undefined) data.tags = body.tags
        if (body.inStock !== undefined) data.inStock = body.inStock

        const product = await prisma.product.update({
            where: { id },
            data,
            include: {
                store: {
                    select: { id: true, name: true, username: true, logo: true },
                },
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('PUT /api/products/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE /api/products/[id] — delete a product
export async function DELETE(request, { params }) {
    try {
        const { id } = await params

        const existing = await prisma.product.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        await prisma.product.delete({ where: { id } })

        return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error('DELETE /api/products/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
