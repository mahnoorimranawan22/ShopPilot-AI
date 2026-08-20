/**
 * AI Business Intelligence Service
 * 
 * Answers merchant questions like:
 * - "Why did sales drop this month?"
 * - "Which products should I restock?"
 * - "What are my best-selling products?"
 * - "What's my revenue trend?"
 * 
 * Uses MongoDB aggregation + intelligent analysis to generate insights.
 */

import { Product, Order, Review, UserBehavior } from '../models/index.js'

// ─── Query Classification ────────────────────────────────────
const QUERY_PATTERNS = {
    sales_drop: [
        /why.*sales.*drop/i, /sales.*decrease/i, /sales.*decline/i,
        /why.*revenue.*down/i, /revenue.*drop/i, /revenue.*decline/i,
        /why.*revenue.*decrease/i, /what.*happen.*sales/i,
        /sales.*slow/i, /less.*sales/i, /fewer.*orders/i,
    ],
    restock: [
        /restock/i, /low.*stock/i, /out.*stock/i, /inventory.*low/i,
        /what.*reorder/i, /need.*restock/i, /running.*out/i,
        /which.*product.*stock/i, /inventory.*alert/i,
    ],
    best_sellers: [
        /best.*sell/i, /top.*product/i, /most.*popular/i,
        /highest.*sell/i, /what.*sell.*best/i, /top.*perform/i,
        /best.*perform/i, /most.*order/i, /popular.*product/i,
    ],
    revenue: [
        /revenue/i, /income/i, /earnings/i, /how.*much.*made/i,
        /total.*sales/i, /total.*revenue/i, /monthly.*revenue/i,
        /revenue.*trend/i, /revenue.*report/i,
    ],
    inventory: [
        /inventory/i, /stock.*level/i, /how.*much.*stock/i,
        /inventory.*status/i, /what.*in.*stock/i,
    ],
    customers: [
        /customer/i, /who.*bought/i, /returning.*customer/i,
        /new.*customer/i, /customer.*trend/i, /customer.*insight/i,
    ],
    products: [
        /product.*insight/i, /product.*performance/i, /product.*analy/i,
        /which.*product/i, /product.*trend/i, /product.*report/i,
    ],
    general: [
        /summary/i, /overview/i, /how.*business/i, /business.*health/i,
        /insight/i, /analyze/i, /report/i, /health/i,
    ],
}

function classifyQuery(query) {
    for (const [category, patterns] of Object.entries(QUERY_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(query)) return category
        }
    }
    return 'general'
}

// ─── Time Range Extraction ───────────────────────────────────
function extractTimeRange(query) {
    const q = query.toLowerCase()

    if (/today/i.test(q)) {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        return { start, end: new Date(), label: 'today' }
    }
    if (/yesterday/i.test(q)) {
        const start = new Date()
        start.setDate(start.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'yesterday' }
    }
    if (/this\s*week|past\s*week|last\s*7\s*days/i.test(q)) {
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return { start, end: new Date(), label: 'this week' }
    }
    if (/this\s*month|past\s*month|last\s*30\s*days/i.test(q)) {
        const start = new Date()
        start.setDate(start.getDate() - 30)
        return { start, end: new Date(), label: 'this month' }
    }
    if (/last\s*month/i.test(q)) {
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'last month' }
    }
    if (/this\s*quarter|past\s*3\s*months/i.test(q)) {
        const start = new Date()
        start.setMonth(start.getMonth() - 3)
        return { start, end: new Date(), label: 'this quarter' }
    }
    if (/this\s*year|past\s*year|last\s*12\s*months/i.test(q)) {
        const start = new Date()
        start.setFullYear(start.getFullYear() - 1)
        return { start, end: new Date(), label: 'this year' }
    }

    // Default: last 30 days
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return { start, end: new Date(), label: 'the last 30 days' }
}

// ─── Data Collection ─────────────────────────────────────────
async function collectMerchantData(storeId, timeRange) {
    const { start, end } = timeRange

    // Get orders in time range
    const orders = await Order.find({
        storeId,
        createdAt: { $gte: start, $lte: end },
    }).populate('items.product', 'name category brand price images')

    // Get all products for this store
    const products = await Product.find({ storeId })

    // Get previous period orders for comparison
    const periodLength = end - start
    const prevStart = new Date(start.getTime() - periodLength)
    const prevOrders = await Order.find({
        storeId,
        createdAt: { $gte: prevStart, $lte: start },
    })

    // Get reviews
    const reviews = await Review.find({
        product: { $in: products.map(p => p._id) },
        createdAt: { $gte: start, $lte: end },
    })

    return {
        orders,
        prevOrders,
        products,
        reviews,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        prevRevenue: prevOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length : 0,
    }
}

// ─── Analyze Sales Drop ──────────────────────────────────────
function analyzeSalesDrop(data, timeRange) {
    const { orders, prevOrders, products, totalRevenue, prevRevenue, totalOrders } = data
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0
    const orderChange = prevOrders.length > 0 ? ((totalOrders - prevOrders.length) / prevOrders.length * 100) : 0

    const insights = []
    let severity = 'info'

    if (revenueChange < -20) {
        severity = 'critical'
        insights.push(`Revenue dropped ${Math.abs(revenueChange).toFixed(1)}% compared to the previous period ($${totalRevenue.toFixed(0)} vs $${prevRevenue.toFixed(0)}).`)
    } else if (revenueChange < -5) {
        severity = 'warning'
        insights.push(`Revenue declined ${Math.abs(revenueChange).toFixed(1)}% compared to the previous period.`)
    } else {
        insights.push(`Revenue is actually ${revenueChange > 0 ? 'up' : 'down'} ${Math.abs(revenueChange).toFixed(1)}% compared to the previous period.`)
    }

    if (orderChange < -10) {
        insights.push(`Order volume dropped ${Math.abs(orderChange).toFixed(1)}% — fewer customers are placing orders.`)
    }

    // Analyze which products dropped
    const currentProductSales = {}
    const prevProductSales = {}

    for (const order of orders) {
        for (const item of (order.items || [])) {
            const name = item.product?.name || item.name || 'Unknown'
            currentProductSales[name] = (currentProductSales[name] || 0) + (item.quantity || 1)
        }
    }

    for (const order of prevOrders) {
        for (const item of (order.items || [])) {
            const name = item.product?.name || item.name || 'Unknown'
            prevProductSales[name] = (prevProductSales[name] || 0) + (item.quantity || 1)
        }
    }

    // Find products that dropped significantly
    const droppedProducts = []
    for (const [name, current] of Object.entries(currentProductSales)) {
        const prev = prevProductSales[name] || 0
        if (prev > 0 && current < prev * 0.7) {
            droppedProducts.push({ name, current, prev, drop: ((prev - current) / prev * 100).toFixed(0) })
        }
    }

    if (droppedProducts.length > 0) {
        const top = droppedProducts.sort((a, b) => b.drop - a.drop)[0]
        insights.push(`"${top.name}" dropped ${top.drop}% in sales (${top.prev} → ${top.current} units).`)
    }

    // Low stock products
    const lowStock = products.filter(p => p.stock < 10 && p.inStock)
    if (lowStock.length > 0) {
        insights.push(`${lowStock.length} product${lowStock.length > 1 ? 's have' : ' has'} low inventory (less than 10 units).`)
    }

    // Recommendations
    const recommendations = []
    if (droppedProducts.length > 0) {
        recommendations.push(`Consider running a promotion on "${droppedProducts[0].name}" to boost sales.`)
    }
    if (lowStock.length > 0) {
        recommendations.push(`Restock ${lowStock.slice(0, 3).map(p => p.name).join(', ')} to avoid lost sales.`)
    }
    if (revenueChange < -10) {
        recommendations.push('Review your marketing channels — a decline this significant may indicate reduced traffic.')
    }

    return {
        type: 'analysis',
        title: 'Sales Drop Analysis',
        severity,
        insights,
        recommendations,
        metrics: {
            revenue: { current: totalRevenue, previous: prevRevenue, change: revenueChange.toFixed(1) },
            orders: { current: totalOrders, previous: prevOrders.length, change: orderChange.toFixed(1) },
            avgOrderValue: data.avgOrderValue,
        },
    }
}

// ─── Analyze Restock Needs ───────────────────────────────────
function analyzeRestockNeeds(data) {
    const { products, orders } = data

    const insights = []
    const recommendations = []

    // Low stock products
    const lowStock = products
        .filter(p => p.stock <= 10 && p.inStock)
        .sort((a, b) => a.stock - b.stock)

    // Out of stock
    const outOfStock = products.filter(p => p.stock === 0 || !p.inStock)

    // Fast sellers (need more stock)
    const productSales = {}
    for (const order of orders) {
        for (const item of (order.items || [])) {
            const id = item.product?._id?.toString() || item.productId
            productSales[id] = (productSales[id] || 0) + (item.quantity || 1)
        }
    }

    const fastSellers = products
        .map(p => ({ ...p, soldRecently: productSales[p._id?.toString()] || 0 }))
        .filter(p => p.soldRecently > 0 && p.stock < p.soldRecently * 2)
        .sort((a, b) => b.soldRecently - a.soldRecently)

    if (lowStock.length > 0) {
        insights.push(`${lowStock.length} product${lowStock.length > 1 ? 's are' : ' is'} running low (≤10 units):`)
        for (const p of lowStock.slice(0, 5)) {
            insights.push(`  • ${p.name}: ${p.stock} units left`)
        }
    }

    if (outOfStock.length > 0) {
        insights.push(`${outOfStock.length} product${outOfStock.length > 1 ? 's are' : ' is'} out of stock.`)
    }

    if (fastSellers.length > 0) {
        insights.push(`${fastSellers.length} product${fastSellers.length > 1 ? 's are' : ' is'} selling faster than expected:`)
        for (const p of fastSellers.slice(0, 3)) {
            insights.push(`  • ${p.name}: sold ${p.soldRecently} recently, only ${p.stock} in stock`)
        }
    }

    // Recommendations
    if (lowStock.length > 0) {
        recommendations.push(`Priority restock: ${lowStock.slice(0, 3).map(p => p.name).join(', ')}`)
    }
    if (fastSellers.length > 0) {
        recommendations.push(`Consider increasing stock for ${fastSellers[0].name} — it's selling ${fastSellers[0].soldRecently} units per period with only ${fastSellers[0].stock} left.`)
    }

    return {
        type: 'analysis',
        title: 'Restock Recommendations',
        severity: lowStock.length > 3 || outOfStock.length > 0 ? 'warning' : 'info',
        insights,
        recommendations,
        metrics: {
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            fastSellerCount: fastSellers.length,
        },
    }
}

// ─── Analyze Best Sellers ────────────────────────────────────
function analyzeBestSellers(data) {
    const { products, orders } = data

    const productSales = {}
    const productRevenue = {}

    for (const order of orders) {
        for (const item of (order.items || [])) {
            const id = item.product?._id?.toString() || item.productId
            const name = item.product?.name || item.name || 'Unknown'
            const price = item.price || item.product?.price || 0
            const qty = item.quantity || 1

            productSales[id] = (productSales[id] || 0) + qty
            productRevenue[id] = (productRevenue[id] || 0) + (price * qty)
            if (!productSales[`${id}_name`]) productSales[`${id}_name`] = name
        }
    }

    const sorted = Object.entries(productSales)
        .filter(([k]) => !k.endsWith('_name'))
        .map(([id, sold]) => ({
            id,
            name: productSales[`${id}_name`] || 'Unknown',
            sold,
            revenue: productRevenue[id] || 0,
        }))
        .sort((a, b) => b.sold - a.sold)

    const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0)
    const totalSold = sorted.reduce((sum, p) => sum + p.sold, 0)

    const insights = []
    if (sorted.length > 0) {
        insights.push(`Your top seller is "${sorted[0].name}" with ${sorted[0].sold} units sold ($${sorted[0].revenue.toFixed(0)} revenue).`)
        if (sorted.length > 1) {
            insights.push(`"#${2} ${sorted[1].name}" follows with ${sorted[1].sold} units.`)
        }
        if (sorted[0].revenue > 0 && totalRevenue > 0) {
            const share = ((sorted[0].revenue / totalRevenue) * 100).toFixed(1)
            insights.push(`Your top product generated ${share}% of total revenue.`)
        }
    } else {
        insights.push('No sales data found for this period.')
    }

    const recommendations = []
    if (sorted.length > 0) {
        recommendations.push(`Keep "${sorted[0].name}" well-stocked — it's your revenue driver.`)
        if (sorted.length >= 3) {
            recommendations.push(`Consider bundling "${sorted[0].name}" with "${sorted[2].name}" to boost the latter\'s sales.`)
        }
    }

    return {
        type: 'analysis',
        title: 'Best Selling Products',
        severity: 'info',
        insights,
        recommendations,
        metrics: {
            topProducts: sorted.slice(0, 5),
            totalRevenue,
            totalSold,
        },
    }
}

// ─── Analyze Revenue ─────────────────────────────────────────
function analyzeRevenue(data, timeRange) {
    const { orders, prevOrders, totalRevenue, prevRevenue, avgOrderValue } = data
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0

    // Daily revenue breakdown
    const dailyRevenue = {}
    for (const order of orders) {
        const day = new Date(order.createdAt).toISOString().split('T')[0]
        dailyRevenue[day] = (dailyRevenue[day] || 0) + (order.totalAmount || 0)
    }

    // Status breakdown
    const statusCounts = {}
    for (const order of orders) {
        const status = order.status || 'unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
    }

    const insights = []
    insights.push(`Total revenue for ${timeRange.label}: $${totalRevenue.toFixed(2)}`)
    insights.push(`${orders.length} orders with an average order value of $${avgOrderValue.toFixed(2)}`)
    if (revenueChange !== 0) {
        insights.push(`${revenueChange > 0 ? 'Up' : 'Down'} ${Math.abs(revenueChange).toFixed(1)}% from the previous period.`)
    }

    return {
        type: 'analysis',
        title: 'Revenue Report',
        severity: revenueChange < -10 ? 'warning' : 'info',
        insights,
        recommendations: revenueChange < -5 ? ['Consider marketing campaigns to boost revenue.'] : ['Revenue is healthy. Keep up the good work!'],
        metrics: {
            revenue: { current: totalRevenue, previous: prevRevenue, change: revenueChange.toFixed(1) },
            orders: orders.length,
            avgOrderValue,
            dailyRevenue,
            statusBreakdown: statusCounts,
        },
    }
}

// ─── General Analysis ────────────────────────────────────────
function analyzeGeneral(data, timeRange) {
    const { orders, products, reviews, totalRevenue, avgOrderValue } = data

    const insights = []
    insights.push(`Business summary for ${timeRange.label}:`)
    insights.push(`• ${orders.length} orders generating $${totalRevenue.toFixed(2)} in revenue`)
    insights.push(`• ${products.length} active products in your catalog`)
    insights.push(`• Average order value: $${avgOrderValue.toFixed(2)}`)

    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        insights.push(`• ${reviews.length} new reviews with an average rating of ${avgRating.toFixed(1)}★`)
    }

    return {
        type: 'analysis',
        title: 'Business Overview',
        severity: 'info',
        insights,
        recommendations: ['Check your best sellers to double down on what works.', 'Monitor low-stock items to avoid lost sales.'],
        metrics: {
            totalOrders: orders.length,
            totalRevenue,
            totalProducts: products.length,
            totalReviews: reviews.length,
        },
    }
}

// ─── Main: Process Business Query ────────────────────────────
export async function processBusinessQuery(storeId, query) {
    const category = classifyQuery(query)
    const timeRange = extractTimeRange(query)
    const data = await collectMerchantData(storeId, timeRange)

    let result

    switch (category) {
        case 'sales_drop':
            result = analyzeSalesDrop(data, timeRange)
            break
        case 'restock':
            result = analyzeRestockNeeds(data)
            break
        case 'best_sellers':
            result = analyzeBestSellers(data)
            break
        case 'revenue':
            result = analyzeRevenue(data, timeRange)
            break
        default:
            result = analyzeGeneral(data, timeRange)
    }

    return {
        query,
        category,
        timeRange: timeRange.label,
        ...result,
    }
}
