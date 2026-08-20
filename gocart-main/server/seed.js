import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Store, Product, Review, Coupon, Cart } from './models/index.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shoppilot-ai'

const seed = async () => {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Promise.all([
        User.deleteMany(), Store.deleteMany(), Product.deleteMany(),
        Review.deleteMany(), Coupon.deleteMany(), Cart.deleteMany(),
    ])
    console.log('🗑️  Cleared existing data')

    // ─── Users ──────────────────────────────────────────────
    const admin = await User.create({
        name: 'Admin', email: 'admin@shoppilot.ai', password: 'admin123', role: 'admin',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    })

    const seller = await User.create({
        name: 'TechStore Owner', email: 'seller@shoppilot.ai', password: 'seller123', role: 'seller',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    })

    const buyer = await User.create({
        name: 'Jane Customer', email: 'buyer@shoppilot.ai', password: 'buyer123', role: 'buyer',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    })

    const buyer2 = await User.create({
        name: 'Alex Morgan', email: 'alex@shoppilot.ai', password: 'buyer123', role: 'buyer',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    })

    console.log('👤 Users created: admin, seller, buyer, buyer2')

    // ─── Store ──────────────────────────────────────────────
    const store = await Store.create({
        name: 'ShopPilot AI Official',
        description: 'Official ShopPilot AI store — curated products recommended by our AI engine.',
        username: 'shoppilot',
        userId: seller._id,
        logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=200',
        email: 'store@shoppilot.ai',
        contact: '+1 415-555-0199',
        address: '123 Innovation Drive, San Francisco, CA 94105',
        status: 'approved',
        isActive: true,
    })
    console.log('🏪 Store created: ShopPilot AI Official')

    // ─── Products ───────────────────────────────────────────
    const productsData = [
        {
            name: 'Sony WH-1000XM5 Wireless Headphones',
            description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30 hours battery life. Multipoint connection.',
            mrp: 399.99, price: 279.99, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500'],
            category: 'Headphones', brand: 'Sony', stock: 45, tags: ['wireless', 'noise-cancelling', 'bluetooth'],
            avgRating: 4.7, ratingCount: 234, soldCount: 312,
        },
        {
            name: 'JBL Charge 5 Portable Bluetooth Speaker',
            description: 'JBL Pro Sound with deep bass. IP67 waterproof. 20 hours playtime. Built-in power bank. PartyBoost compatible.',
            mrp: 179.95, price: 139.95, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=500'],
            category: 'Speakers', brand: 'JBL', stock: 78, tags: ['portable', 'waterproof', 'bass'],
            avgRating: 4.5, ratingCount: 189, soldCount: 245,
        },
        {
            name: 'Casio G-Shock GA2100 Digital Watch',
            description: 'Iconic octagonal bezel. Super LED backlight. World time. 200M water resistance. Shock-resistant.',
            mrp: 99.00, price: 69.99, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500'],
            category: 'Watch', brand: 'Casio', stock: 120, tags: ['digital', 'shock-resistant', 'military'],
            avgRating: 4.6, ratingCount: 312, soldCount: 410,
        },
        {
            name: 'Apple AirPods Pro (2nd Gen) USB-C',
            description: 'Active Noise Cancellation. Transparency mode. Personalized Spatial Audio. Up to 6 hours listening time. MagSafe case.',
            mrp: 249.00, price: 199.00, images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&q=80&w=500'],
            category: 'Earbuds', brand: 'Apple', stock: 200, tags: ['wireless', 'noise-cancelling', 'apple'],
            avgRating: 4.8, ratingCount: 567, soldCount: 789,
        },
        {
            name: 'Logitech MX Master 3S Mouse',
            description: 'Quiet Clicks. 8K DPI tracks on any surface. MagSpeed scroll wheel. Ergonomic. USB-C quick charging. 3-device connectivity.',
            mrp: 99.99, price: 79.99, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500'],
            category: 'Mouse', brand: 'Logitech', stock: 95, tags: ['wireless', 'ergonomic', 'premium'],
            avgRating: 4.7, ratingCount: 278, soldCount: 340,
        },
        {
            name: 'Samsung 34" Ultra Wide Curved Monitor',
            description: '34-inch WQHD 1000R curved. 100Hz refresh rate. HDR10. USB-C hub with 90W power delivery. KVM switch.',
            mrp: 549.99, price: 399.99, images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=500'],
            category: 'Monitor', brand: 'Samsung', stock: 32, tags: ['ultrawide', 'curved', 'usb-c'],
            avgRating: 4.4, ratingCount: 156, soldCount: 180,
        },
        {
            name: 'Dyson V15 Detect Cordless Vacuum',
            description: 'Laser reveals microscopic dust. Piezo sensor particle count. HEPA filtration. 60 minutes suction. Converts to handheld.',
            mrp: 749.99, price: 599.99, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=500'],
            category: 'Home', brand: 'Dyson', stock: 25, tags: ['cordless', 'hepa', 'premium'],
            avgRating: 4.6, ratingCount: 445, soldCount: 520,
        },
        {
            name: 'Philips Hue Smart Bulb Starter Kit',
            description: '4 White and Color Ambiance bulbs + Bridge. 16 million colors. App, voice, and automation control. Syncs with media.',
            mrp: 179.99, price: 129.99, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?auto=format&fit=crop&q=80&w=500'],
            category: 'Smart Home', brand: 'Philips', stock: 88, tags: ['smart-home', 'rgb', 'voice-control'],
            avgRating: 4.5, ratingCount: 334, soldCount: 410,
        },
        {
            name: 'Canon EOS R50 Mirrorless Camera',
            description: '24.2MP APS-C CMOS sensor. 4K 30p video. 15fps shooting. 375g lightweight. Vari-angle LCD. Wi-Fi + Bluetooth.',
            mrp: 679.99, price: 529.99, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500'],
            category: 'Camera', brand: 'Canon', stock: 18, tags: ['mirrorless', '4k', 'vlogging'],
            avgRating: 4.7, ratingCount: 198, soldCount: 230,
        },
        {
            name: 'Razer BlackWidow V4 Mechanical Keyboard',
            description: 'Razer Green switches. Per-key RGB. Dedicated macro keys. Magnetic wrist rest. Aluminum alloy top plate.',
            mrp: 199.99, price: 169.99, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=500'],
            category: 'Keyboard', brand: 'Razer', stock: 60, tags: ['mechanical', 'rgb', 'gaming'],
            avgRating: 4.4, ratingCount: 189, soldCount: 260,
        },
        {
            name: 'Apple Pencil Pro',
            description: 'Pixel-perfect precision. Squeeze gesture. Barrel roll. Haptic feedback. Find My support. Magnetic charging.',
            mrp: 129.00, price: 119.00, images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=500'],
            category: 'Accessories', brand: 'Apple', stock: 150, tags: ['stylus', 'ipad', 'creative'],
            avgRating: 4.6, ratingCount: 267, soldCount: 350,
        },
        {
            name: 'Sonos Era 300 Smart Speaker',
            description: 'Spatial Audio with Dolby Atmos. Six drivers. Trueplay tuning. Alexa built-in. Bluetooth, USB-C, 3.5mm input.',
            mrp: 449.00, price: 399.00, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=500'],
            category: 'Speakers', brand: 'Sonos', stock: 42, tags: ['spatial-audio', 'dolby-atmos', 'premium'],
            avgRating: 4.5, ratingCount: 156, soldCount: 190,
        },
    ]

    const products = await Product.insertMany(
        productsData.map(p => ({ ...p, storeId: store._id }))
    )
    console.log(`📦 ${products.length} products created`)

    // ─── Reviews ────────────────────────────────────────────
    const reviewTexts = [
        { rating: 5, text: 'Absolutely love this product! The quality exceeded my expectations and it arrived quickly.' },
        { rating: 4, text: 'Great value for money. Works as described and the build quality is solid.' },
        { rating: 5, text: 'This is hands down the best purchase I have made this year. Works flawlessly.' },
        { rating: 4, text: 'Very good product overall. The design is sleek and modern. Delivery was fast.' },
        { rating: 5, text: 'Exactly what I was looking for. The AI recommendations were spot on.' },
        { rating: 3, text: 'Decent product but could be better. Fair for the price point.' },
    ]

    const buyers = [buyer, buyer2]
    const reviewDocs = []

    for (const product of products) {
        for (let i = 0; i < 2; i++) {
            const rev = reviewTexts[(products.indexOf(product) + i) % reviewTexts.length]
            reviewDocs.push({
                user: buyers[i % buyers.length]._id,
                product: product._id,
                order: new mongoose.Types.ObjectId(), // placeholder
                rating: rev.rating,
                review: rev.text,
            })
        }
    }

    await Review.insertMany(reviewDocs)
    console.log(`⭐ ${reviewDocs.length} reviews created`)

    // ─── Coupons ────────────────────────────────────────────
    await Coupon.insertMany([
        { code: 'NEW20', description: '20% Off for New Users', discount: 20, forNewUser: true, isPublic: false, expiresAt: '2026-12-31' },
        { code: 'NEW10', description: '10% Off for New Users', discount: 10, forNewUser: true, isPublic: false, expiresAt: '2026-12-31' },
        { code: 'OFF20', description: '20% Off for All Users', discount: 20, forNewUser: false, isPublic: true, expiresAt: '2026-12-31' },
        { code: 'OFF10', description: '10% Off for All Users', discount: 10, forNewUser: false, isPublic: true, expiresAt: '2026-12-31' },
    ])
    console.log('🎟️  4 coupons created')

    console.log('\n🎉 Seed complete!')
    console.log('   Admin: admin@shoppilot.ai / admin123')
    console.log('   Seller: seller@shoppilot.ai / seller123')
    console.log('   Buyer: buyer@shoppilot.ai / buyer123')

    await mongoose.disconnect()
    process.exit(0)
}

seed().catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
