/**
 * AI Product Generator Service
 * 
 * Generates product content from a name + features list.
 * Uses intelligent templating — no external API needed.
 * 
 * Input: { name: "Wireless Headphones", features: ["Bluetooth 5.3", "Noise cancellation", "30-hour battery"] }
 * Output: { description, shortDescription, seoTitle, seoDescription, tags, highlights, brand, category }
 */

// ─── Category Detection ──────────────────────────────────────
const CATEGORY_MAP = {
    headphones: ['headphone', 'earphone', 'earbud', 'headset', 'airpod', 'headband'],
    speakers: ['speaker', 'soundbar', 'subwoofer', 'audio system'],
    watch: ['watch', 'smartwatch', 'fitness tracker', 'wearable'],
    camera: ['camera', 'gopro', 'webcam', 'dslr', 'mirrorless', 'lens', 'drone'],
    laptop: ['laptop', 'notebook', 'macbook', 'chromebook', 'ultrabook'],
    keyboard: ['keyboard', 'numpad'],
    mouse: ['mouse', 'trackpad'],
    monitor: ['monitor', 'display', 'screen', 'tv', 'television'],
    phone: ['phone', 'smartphone', 'iphone', 'galaxy', 'pixel'],
    tablet: ['tablet', 'ipad', 'kindle'],
    home: ['vacuum', 'cleaner', 'blender', 'appliance', 'fan', 'heater', 'air purifier'],
    smart_home: ['smart bulb', 'smart plug', 'hub', 'alexa', 'google home', 'thermostat', 'camera security'],
    accessories: ['case', 'charger', 'cable', 'adapter', 'stand', 'holder', 'pencil', 'stylus', 'strap', 'band'],
    gaming: ['gaming', 'controller', 'joystick', 'gamepad'],
    audio: ['microphone', 'amp', 'dac', 'dac/amp', 'recorder'],
}

// ─── Use Case Detection ──────────────────────────────────────
const USE_CASE_MAP = {
    'Perfect for music lovers': ['headphone', 'speaker', 'earbud', 'audio', 'sound', 'bass', 'music'],
    'Ideal for content creators': ['camera', 'microphone', 'webcam', 'vlog', 'stream', 'podcast'],
    'Great for gamers': ['gaming', 'rgb', 'mechanical', 'controller', 'fps', 'esport'],
    'Perfect for remote work': ['laptop', 'monitor', 'webcam', 'microphone', 'headset', 'zoom', 'meeting'],
    'Stay connected on the go': ['bluetooth', 'wireless', 'portable', 'battery', 'travel'],
    'Smart home ready': ['smart', 'wifi', 'alexa', 'google', 'home', 'automation', 'hub'],
    'Built for productivity': ['keyboard', 'mouse', 'monitor', 'laptop', 'ergonomic', 'office'],
}

// ─── Adjective Generators ────────────────────────────────────
const PREMIUM_ADJECTIVES = ['Premium', 'Professional', 'Elite', 'Advanced', 'Ultra', 'Superior']
const QUALITY_ADJECTIVES = ['High-quality', 'Sleek', 'Elegant', 'Robust', 'Durable', 'Versatile']

// ─── Detect Category ─────────────────────────────────────────
function detectCategory(name, features) {
    const text = `${name} ${features.join(' ')}`.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        for (const kw of keywords) {
            if (text.includes(kw)) return cat
        }
    }
    return 'accessories'
}

// ─── Detect Features from Text ───────────────────────────────
function categorizeFeatures(features) {
    const result = {
        connectivity: [],
        performance: [],
        design: [],
        battery: [],
        audio: [],
        display: [],
        other: [],
    }

    const featureText = features.map(f => f.toLowerCase()).join(' ')

    for (const feature of features) {
        const f = feature.toLowerCase()

        if (/bluetooth|wifi|wireless|nfc|usb|thunderbolt|hdmi|type-c|lightning/i.test(f)) {
            result.connectivity.push(feature)
        } else if (/battery|charge|mah|hour|wireless charg/i.test(f)) {
            result.battery.push(feature)
        } else if (/noise|anc|cancell|bass|sound|audio|dolby|atmos|spatial|hi-res|ldac|aptx/i.test(f)) {
            result.audio.push(feature)
        } else if (/display|screen|resolution|amoled|oled|lcd|retina|hz|refresh/i.test(f)) {
            result.display.push(feature)
        } else if (/weight|light|thin|compact|ergonomic|design|aluminum|titanium|color/i.test(f)) {
            result.design.push(feature)
        } else if (/speed|fast|powerful|processor|chip|ram|storage|memory|dpi/i.test(f)) {
            result.performance.push(feature)
        } else {
            result.other.push(feature)
        }
    }

    return result
}

// ─── Detect Use Cases ────────────────────────────────────────
function detectUseCases(name, features) {
    const text = `${name} ${features.join(' ')}`.toLowerCase()
    const matches = []
    for (const [useCase, keywords] of Object.entries(USE_CASE_MAP)) {
        for (const kw of keywords) {
            if (text.includes(kw)) {
                matches.push(useCase)
                break
            }
        }
    }
    return matches.length > 0 ? matches : ['Great value for money']
}

// ─── Generate Description ────────────────────────────────────
function generateDescription(name, features, categorized) {
    const adjectives = PREMIUM_ADJECTIVES
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]

    let desc = ''

    // Opening sentence
    desc += `Introducing the ${adj} ${name} — designed to elevate your experience with cutting-edge technology and thoughtful engineering.\n\n`

    // Feature sentences
    const allFeatures = features.slice(0, 6)
    if (allFeatures.length > 0) {
        desc += 'Key features include:\n'
        for (const feat of allFeatures) {
            desc += `• ${feat}\n`
        }
        desc += '\n'
    }

    // Connectivity section
    if (categorized.connectivity.length > 0) {
        desc += `Seamless connectivity with ${categorized.connectivity.join(' and ')} ensures you stay connected wherever you go. `
    }

    // Performance section
    if (categorized.performance.length > 0) {
        desc += `Powered by ${categorized.performance.join(', ')} for smooth, responsive performance. `
    }

    // Battery section
    if (categorized.battery.length > 0) {
        desc += `Enjoy ${categorized.battery.join(' and ')} — perfect for all-day use. `
    }

    // Audio section
    if (categorized.audio.length > 0) {
        desc += `Experience superior audio quality with ${categorized.audio.join(', ')}. `
    }

    // Display section
    if (categorized.display.length > 0) {
        desc += `Featuring a stunning ${categorized.display.join(' with ')} display. `
    }

    // Design section
    if (categorized.design.length > 0) {
        desc += `Crafted with ${categorized.design.join(' and ')} for a premium look and feel. `
    }

    // Closing
    desc += `\n\nWhether for work, play, or everyday use, the ${name} delivers exceptional performance and reliability. Order now and experience the difference.`

    return desc
}

// ─── Generate Short Description ──────────────────────────────
function generateShortDescription(name, features, categorized) {
    const topFeatures = features.slice(0, 3)
    return `${name} featuring ${topFeatures.join(', ')}. Built for performance and designed for comfort — the perfect companion for your daily needs.`
}

// ─── Generate SEO ────────────────────────────────────────────
function generateSEO(name, features, categorized) {
    const title = `Buy ${name} Online — Best Price & Features | ShopPilot AI`

    const topFeatures = features.slice(0, 3).join(', ')
    const description = `Shop the ${name} with ${topFeatures}. Free shipping, easy returns, and AI-powered recommendations. Find the best deal at ShopPilot AI.`

    return { title, description }
}

// ─── Generate Tags ───────────────────────────────────────────
function generateTags(name, features, category) {
    const tags = new Set()

    // Add category tags
    tags.add(category)
    tags.add(category.replace('_', '-'))

    // Add feature-derived tags
    for (const feat of features) {
        const words = feat.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
        for (const word of words) {
            if (word.length > 2 && !['for', 'and', 'the', 'with', 'up', 'to'].includes(word)) {
                tags.add(word)
            }
        }
        // Add multi-word feature as single tag
        const tag = feat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        if (tag.length > 2) tags.add(tag)
    }

    // Add generic commerce tags
    tags.add('new-arrival')
    tags.add('shop-online')

    // Add wireless/bluetooth tags if relevant
    const text = features.join(' ').toLowerCase()
    if (/bluetooth|wireless/i.test(text)) {
        tags.add('wireless')
        tags.add('bluetooth')
    }
    if (/noise|anc/i.test(text)) tags.add('noise-cancelling')
    if (/waterproof|water-resistant|ip6/i.test(text)) tags.add('waterproof')
    if (/gaming|rgb|led/i.test(text)) tags.add('gaming')
    if (/premium|pro|professional/i.test(text)) tags.add('premium')
    if (/portable|compact|travel/i.test(text)) tags.add('portable')

    return [...tags].slice(0, 15)
}

// ─── Generate Highlights ─────────────────────────────────────
function generateHighlights(name, features, categorized) {
    const highlights = []

    // Top 3 features as highlights
    for (const feat of features.slice(0, 3)) {
        highlights.push(feat)
    }

    // Add contextual highlights
    if (categorized.connectivity.length > 0) {
        highlights.push(`${categorized.connectivity[0]} for seamless connectivity`)
    }
    if (categorized.battery.length > 0) {
        highlights.push(categorized.battery[0])
    }
    if (categorized.audio.length > 0) {
        highlights.push(categorized.audio[0])
    }
    if (categorized.design.length > 0) {
        highlights.push(`${categorized.design[0]} design`)
    }

    // Deduplicate and limit
    return [...new Set(highlights)].slice(0, 6)
}

// ─── Detect Brand ────────────────────────────────────────────
function detectBrand(name) {
    const knownBrands = ['Sony', 'Apple', 'Samsung', 'JBL', 'Logitech', 'Canon', 'Dyson', 'Philips', 'Razer', 'Casio', 'Sonos', 'Bose', 'Sennheiser', 'Dell', 'HP', 'Lenovo', 'Asus', 'LG', 'Google', 'Microsoft', 'Nintendo', 'GoPro', 'Anker', 'Beats', 'Audio-Technica']
    for (const brand of knownBrands) {
        if (name.toLowerCase().includes(brand.toLowerCase())) return brand
    }
    return ''
}

// ─── Main: Generate Product Content ──────────────────────────
export function generateProductContent(name, features = []) {
    if (!name || name.trim().length === 0) {
        throw new Error('Product name is required')
    }

    const cleanName = name.trim()
    const cleanFeatures = features.filter(f => f && f.trim().length > 0).map(f => f.trim())

    // Detect category
    const category = detectCategory(cleanName, cleanFeatures)

    // Detect brand
    const brand = detectBrand(cleanName)

    // Categorize features
    const categorized = categorizeFeatures(cleanFeatures)

    // Detect use cases
    const useCases = detectUseCases(cleanName, cleanFeatures)

    // Generate all content
    const description = generateDescription(cleanName, cleanFeatures, categorized)
    const shortDescription = generateShortDescription(cleanName, cleanFeatures, categorized)
    const seo = generateSEO(cleanName, cleanFeatures, categorized)
    const tags = generateTags(cleanName, cleanFeatures, category)
    const highlights = generateHighlights(cleanName, cleanFeatures, categorized)

    return {
        name: cleanName,
        description,
        shortDescription,
        seo: {
            title: seo.title,
            description: seo.description,
        },
        tags,
        highlights,
        category: category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        brand,
        suggestedPrice: generateSuggestedPrice(cleanName, category, cleanFeatures),
        useCases,
    }
}

// ─── Suggest Price ───────────────────────────────────────────
function generateSuggestedPrice(name, category, features) {
    const text = `${name} ${features.join(' ')}`.toLowerCase()

    // Base prices by category
    const basePrices = {
        laptop: 899,
        phone: 699,
        headphones: 149,
        speakers: 199,
        watch: 249,
        camera: 499,
        keyboard: 89,
        mouse: 49,
        monitor: 349,
        tablet: 449,
        smart_home: 129,
        gaming: 69,
        accessories: 39,
        home: 299,
        audio: 199,
    }

    let price = basePrices[category] || 99

    // Adjust for premium features
    if (/pro|premium|professional|elite/i.test(text)) price *= 1.3
    if (/budget|affordable|value/i.test(text)) price *= 0.6
    if (/premium|titanium|aluminum/i.test(text)) price *= 1.2
    if (/wireless|bluetooth/i.test(text)) price *= 1.1
    if (/noise.cancell/i.test(text)) price *= 1.2
    if (/4k|uhd|retina/i.test(text)) price *= 1.3
    if (/dolby|atmos|hi-res|spatial/i.test(text)) price *= 1.2
    if (/waterproof|ip6/i.test(text)) price *= 1.1
    if (/fast charg/i.test(text)) price *= 1.05

    const suggested = Math.round(price * 100) / 100
    const mrp = Math.round(suggested * 1.25 * 100) / 100

    return { mrp, price: suggested }
}
