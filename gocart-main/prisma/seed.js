import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Reuse existing images from assets — both local Unsplash URLs and local files
const IMGS = {
    product_img1: '/product_img1.png',
    product_img2: '/product_img2.png',
    product_img3: '/product_img3.png',
    product_img4: '/product_img4.png',
    product_img5: '/product_img5.png',
    product_img6: '/product_img6.png',
    product_img7: '/product_img7.png',
    product_img8: '/product_img8.png',
    product_img9: '/product_img9.png',
    product_img10: '/product_img10.png',
    product_img11: '/product_img11.png',
    product_img12: '/product_img12.png',
    // High-quality Unsplash product images
    unsplash_headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500',
    unsplash_watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500',
    unsplash_speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=500',
    unsplash_camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500',
    unsplash_keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=500',
    unsplash_mouse: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500',
    unsplash_earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&q=80&w=500',
    unsplash_desk: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=500',
    unsplash_lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?auto=format&fit=crop&q=80&w=500',
    unsplash_cleaner: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=500',
    unsplash_pen: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=500',
    unsplash_home: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=500',
}

// A dedicated store for the seed data
const SEED_STORE_ID = 'store_shoppilot_default'

const storeData = {
    id: SEED_STORE_ID,
    userId: 'user_seed_admin',
    name: 'ShopPilot AI Official',
    description: 'Official ShopPilot AI store — curated products recommended by our AI engine. Quality electronics, home goods, and lifestyle products.',
    username: 'shoppilot',
    address: '123 Innovation Drive, San Francisco, CA 94105, USA',
    status: 'approved',
    isActive: true,
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=200',
    email: 'store@shoppilot.ai',
    contact: '+1 415-555-0199',
}

const userData = {
    id: 'user_seed_admin',
    name: 'ShopPilot Admin',
    email: 'admin@shoppilot.ai',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
}

const products = [
    {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life with quick charging (3 min charge for 3 hours of playback). Multipoint connection lets you switch between two devices. Ultra-comfortable and lightweight design for all-day wear.',
        mrp: 399.99,
        price: 279.99,
        images: [IMGS.unsplash_headphones, IMGS.product_img4],
        category: 'Headphones',
        brand: 'Sony',
        stock: 45,
        tags: ['wireless', 'noise-cancelling', 'bluetooth', 'premium'],
        ratingCount: 234,
        avgRating: 4.7,
        inStock: true,
    },
    {
        name: 'JBL Charge 5 Portable Bluetooth Speaker',
        description: 'JBL Pro Sound delivers surprisingly powerful, deep sound despite its compact size. IP67 waterproof and dustproof — take it to the pool, park, or beach. 20 hours of playtime keeps the music going all day long. Built-in power bank charges your devices via USB. PartyBoost lets you pair two JBL PartyBoost-compatible speakers together.',
        mrp: 179.95,
        price: 139.95,
        images: [IMGS.unsplash_speaker, IMGS.product_img2, IMGS.product_img8],
        category: 'Speakers',
        brand: 'JBL',
        stock: 78,
        tags: ['portable', 'waterproof', 'bluetooth', 'bass'],
        ratingCount: 189,
        avgRating: 4.5,
        inStock: true,
    },
    {
        name: 'Casio G-Shock GA2100 Digital Watch',
        description: 'The iconic "Casiak" with octagonal bezel design. Super LED backlight for easy reading in low light. World time feature covering 31 time zones. 200M water resistance — suitable for swimming and diving. Shock-resistant construction built to military standards. Battery life: approximately 3 years.',
        mrp: 99.00,
        price: 69.99,
        images: [IMGS.product_img3, IMGS.product_img5, IMGS.product_img10],
        category: 'Watch',
        brand: 'Casio',
        stock: 120,
        tags: ['digital', 'shock-resistant', 'waterproof', 'military'],
        ratingCount: 312,
        avgRating: 4.6,
        inStock: true,
    },
    {
        name: 'Apple AirPods Pro (2nd Gen) USB-C',
        description: 'Active Noise Cancellation reduces unwanted background noise. Transparency mode lets you hear the world around you. Personalized Spatial Audio with dynamic head tracking for immersive sound. Up to 6 hours of listening time on a single charge. MagSafe charging case with speaker and lanyard loop. IP54 dust, sweat, and water resistant.',
        mrp: 249.00,
        price: 199.00,
        images: [IMGS.unsplash_earbuds, IMGS.product_img9],
        category: 'Earbuds',
        brand: 'Apple',
        stock: 200,
        tags: ['wireless', 'noise-cancelling', 'apple', 'premium'],
        ratingCount: 567,
        avgRating: 4.8,
        inStock: true,
    },
    {
        name: 'Logitech MX Master 3S Mouse',
        description: 'Quiet Clicks — near-silent experience with tactile feedback. 8K DPI tracks on virtually any surface including glass. MagSpeed electromagnetic scroll wheel scrolls 1,000 lines per second. Ergonomic shape designed for right-hand comfort. USB-C quick charging: 3 hours from 1-minute charge. Connect to up to 3 devices via Bluetooth or USB-C.',
        mrp: 99.99,
        price: 79.99,
        images: [IMGS.unsplash_mouse, IMGS.product_img11],
        category: 'Mouse',
        brand: 'Logitech',
        stock: 95,
        tags: ['wireless', 'ergonomic', 'ergonomic', 'premium'],
        ratingCount: 278,
        avgRating: 4.7,
        inStock: true,
    },
    {
        name: 'Samsung 34" Ultra Wide Curved Monitor',
        description: '34-inch WQHD (3440x1440) Ultra-Wide Curved display with 1000R curvature. 100Hz refresh rate for smooth visuals. HDR10 support with 3000:1 contrast ratio. USB-C hub with 90W power delivery. Built-in KVM switch for seamless multi-device control. Height adjustable stand with tilt and swivel.',
        mrp: 549.99,
        price: 399.99,
        images: [IMGS.unsplash_desk, IMGS.product_img1],
        category: 'Monitor',
        brand: 'Samsung',
        stock: 32,
        tags: ['ultrawide', 'curved', '4k', 'usb-c'],
        ratingCount: 156,
        avgRating: 4.4,
        inStock: true,
    },
    {
        name: 'Dyson V15 Detect Cordless Vacuum',
        description: 'Laser reveals microscopic dust on hard floors. Piezo sensor counts and sizes particles — displayed on the LCD screen. HEPA whole-machine filtration captures 99.99% of particles. Up to 60 minutes of fade-free suction. Converts to handheld for above-floor cleaning. Includes Fluffy Optic and Motorbar cleaner heads.',
        mrp: 749.99,
        price: 599.99,
        images: [IMGS.unsplash_cleaner, IMGS.product_img12],
        category: 'Home',
        brand: 'Dyson',
        stock: 25,
        tags: ['cordless', 'hepa', 'laser', 'premium'],
        ratingCount: 445,
        avgRating: 4.6,
        inStock: true,
    },
    {
        name: 'Philips Hue Smart Bulb Starter Kit',
        description: 'Includes 4 White and Color Ambiance A19 smart bulbs + Hue Bridge. 16 million colors and warm-to-cool white light. Control via app, voice (Alexa, Google, Siri), or automations. Set schedules, scenes, and routines. Syncs with movies, music, and gaming. Bridge connects up to 50 lights.',
        mrp: 179.99,
        price: 129.99,
        images: [IMGS.unsplash_lamp, IMGS.product_img6],
        category: 'Smart Home',
        brand: 'Philips',
        stock: 88,
        tags: ['smart-home', 'rgb', 'voice-control', 'alexa'],
        ratingCount: 334,
        avgRating: 4.5,
        inStock: true,
    },
    {
        name: 'Canon EOS R50 Mirrorless Camera',
        description: '24.2MP APS-C CMOS sensor with DIGIC X processor. 4K 30p uncropped video with Dual Pixel CMOS AF II. 15fps continuous shooting with electronic shutter. Compact and lightweight body at just 375g. vari-angle touchscreen LCD. Built-in Wi-Fi and Bluetooth for easy sharing.',
        mrp: 679.99,
        price: 529.99,
        images: [IMGS.unsplash_camera, IMGS.product_img6],
        category: 'Camera',
        brand: 'Canon',
        stock: 18,
        tags: ['mirrorless', '4k', 'af', 'vlogging'],
        ratingCount: 198,
        avgRating: 4.7,
        inStock: true,
    },
    {
        name: 'Apple Pencil Pro',
        description: 'Pixel-perfect precision with tilt and pressure sensitivity. Squeeze gesture activates tool palette for quick switching. Barrel roll support for natural pen and brush controls. Haptic feedback when squeezing and double-tapping. Find My support for easy locating. Magnetic attachment and wireless charging on compatible iPad models.',
        mrp: 129.00,
        price: 119.00,
        images: [IMGS.unsplash_pen, IMGS.product_img7],
        category: 'Accessories',
        brand: 'Apple',
        stock: 150,
        tags: ['stylus', 'ipad', 'apple', 'creative'],
        ratingCount: 267,
        avgRating: 4.6,
        inStock: true,
    },
    {
        name: 'Sonos Era 300 Smart Speaker',
        description: 'Spatial Audio with Dolby Atmos support for immersive 3D sound. Six drivers including two tweeters and four woofers. Trueplay tuning adapts sound to your room. Built-in voice control with Alexa. Line-in connection via Bluetooth, USB-C, or 3.5mm. Stream from 100+ music services.',
        mrp: 449.00,
        price: 399.00,
        images: [IMGS.product_img2, IMGS.product_img8],
        category: 'Speakers',
        brand: 'Sonos',
        stock: 42,
        tags: ['spatial-audio', 'dolby-atmos', 'smart', 'premium'],
        ratingCount: 156,
        avgRating: 4.5,
        inStock: true,
    },
    {
        name: 'Razer BlackWidow V4 Mechanical Keyboard',
        description: 'Razer Green mechanical switches for clicky, tactile feedback. Per-key RGB lighting with 16.8 million colors. Dedicated macro keys and multi-function roller. Magnetic plush leatherette wrist rest. Aluminum alloy top plate for durability. N-key rollover with anti-ghosting.',
        mrp: 199.99,
        price: 169.99,
        images: [IMGS.unsplash_keyboard, IMGS.product_img11],
        category: 'Keyboard',
        brand: 'Razer',
        stock: 60,
        tags: ['mechanical', 'rgb', 'gaming', 'premium'],
        ratingCount: 189,
        avgRating: 4.4,
        inStock: true,
    },
]

async function main() {
    console.log('🌱 Seeding ShopPilot AI database...')

    // Create admin user
    await prisma.user.upsert({
        where: { id: userData.id },
        update: {},
        create: userData,
    })
    console.log('  ✅ User seeded')

    // Create store
    await prisma.store.upsert({
        where: { id: storeData.id },
        update: {},
        create: storeData,
    })
    console.log('  ✅ Store seeded')

    // Upsert products
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: `seed_${product.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}` },
            update: {
                ...product,
                storeId: SEED_STORE_ID,
            },
            create: {
                id: `seed_${product.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`,
                ...product,
                storeId: SEED_STORE_ID,
            },
        })
        console.log(`  ✅ Product: ${product.name}`)
    }

    // Seed some reviews
    const reviewers = [
        { id: 'user_reviewer_1', name: 'Alex Morgan', email: 'alex@example.com', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
        { id: 'user_reviewer_2', name: 'Jordan Lee', email: 'jordan@example.com', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
        { id: 'user_reviewer_3', name: 'Sam Taylor', email: 'sam@example.com', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
    ]

    for (const reviewer of reviewers) {
        await prisma.user.upsert({
            where: { id: reviewer.id },
            update: {},
            create: reviewer,
        })
    }
    console.log('  ✅ Reviewers seeded')

    const productIds = await prisma.product.findMany({ select: { id: true }, take: 12 })
    const reviewTexts = [
        { rating: 5, text: 'Absolutely love this product! The quality exceeded my expectations and it arrived quickly. Would definitely recommend to anyone looking for a reliable option.' },
        { rating: 4, text: 'Great value for money. Works as described and the build quality is solid. Minor issue with setup but nothing major.' },
        { rating: 5, text: 'This is hands down the best purchase I have made this year. The features are amazing and it works flawlessly.' },
        { rating: 4, text: 'Very good product overall. The design is sleek and modern. Delivery was fast and packaging was secure.' },
        { rating: 5, text: 'Exactly what I was looking for. The AI recommendations were spot on — this product fits my needs perfectly.' },
        { rating: 3, text: 'Decent product but could be better in some areas. The quality is good but not premium. Fair for the price point.' },
    ]

    let reviewIndex = 0
    for (const { id: productId } of productIds) {
        for (let i = 0; i < 2; i++) {
            const reviewer = reviewers[i % reviewers.length]
            const review = reviewTexts[reviewIndex % reviewTexts.length]
            try {
                await prisma.rating.create({
                    data: {
                        rating: review.rating,
                        review: review.text,
                        userId: reviewer.id,
                        productId,
                        orderId: `seed_order_${reviewIndex}`,
                    },
                })
            } catch {
                // skip duplicates
            }
            reviewIndex++
        }
    }
    console.log(`  ✅ ${reviewIndex} reviews seeded`)

    console.log('\n🎉 Seeding complete!')
    console.log(`   ${products.length} products`)
    console.log(`   ${reviewers.length} reviewers`)
    console.log(`   ${reviewIndex} reviews`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
