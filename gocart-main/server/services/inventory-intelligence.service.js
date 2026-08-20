/**
 * AI Inventory Intelligence Service
 * 
 * Tracks:
 * - Current stock levels
 * - Sales velocity (units/day)
 * - Days until stock-out
 * - Restock recommendations
 * 
 * Returns:
 * - Low-stock warnings
 * - Expected stock-out dates
 * - Sales velocity per product
 * - Health summary
 */

import { Product, Order } from '../models/index.js'

// ─── Calculate Sales Velocity ────────────────────────────────
async function calculateSalesVelocity(storeId, productIds, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get orders in the period
    const orders = await Order.find({
        storeId,
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled', 'refunded'] },
    }).select('items createdAt')

    // Count units sold per product
    const salesMap = {}
    for (const order of orders) {
        for (const item of (order.items || [])) {
            const pid = item.product?.toString() || item.productId?.toString()
            if (pid) {
                salesMap[pid] = (salesMap[pid] || 0) + (item.quantity || 1)
            }
        }
    }

    // Calculate daily velocity for each product
    const velocityMap = {}
    for (const pid of productIds) {
        const totalSold = salesMap[pid] || 0
        velocityMap[pid] = {
            totalSold,
            dailyVelocity: totalSold / days,
            weeklyVelocity: (totalSold / days) * 7,
        }
    }

    return velocityMap
}

// ─── Predict Stock-Out ───────────────────────────────────────
function predictStockOut(stock, dailyVelocity) {
    if (dailyVelocity <= 0) {
        return { daysUntilStockOut: Infinity, date: null, status: 'no_sales' }
    }

    const daysUntilStockOut = Math.floor(stock / dailyVelocity)
    const date = new Date()
    date.setDate(date.getDate() + daysUntilStockOut)

    let status = 'healthy'
    if (daysUntilStockOut <= 3) status = 'critical'
    else if (daysUntilStockOut <= 7) status = 'warning'
    else if (daysUntilStockOut <= 14) status = 'attention'

    return { daysUntilStockOut, date, status }
}

// ─── Calculate Restock Quantity ──────────────────────────────
function calculateRestockQuantity(dailyVelocity, currentStock, leadTimeDays = 7, safetyDays = 7) {
    // How much we'll sell during lead time + safety buffer
    const neededForLeadTime = dailyVelocity * leadTimeDays
    const safetyBuffer = dailyVelocity * safetyDays
    const restockQty = Math.ceil(neededForLeadTime + safetyBuffer - currentStock)

    return Math.max(0, restockQty)
}

// ─── Main: Get Inventory Intelligence ────────────────────────
export async function getInventoryIntelligence(storeId) {
    // Get all products
    const products = await Product.find({ storeId })
        .select('name stock price images category brand inStock soldCount avgRating createdAt')

    if (products.length === 0) {
        return {
            summary: { totalProducts: 0, totalStock: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0, healthyCount: 0 },
            products: [],
            alerts: [],
            velocity: {},
        }
    }

    const productIds = products.map(p => p._id.toString())

    // Calculate sales velocity over last 30 days
    const velocity = await calculateSalesVelocity(storeId, productIds, 30)

    // Analyze each product
    const analyzedProducts = products.map(product => {
        const pid = product._id.toString()
        const vel = velocity[pid] || { totalSold: 0, dailyVelocity: 0, weeklyVelocity: 0 }
        const stockOut = predictStockOut(product.stock, vel.dailyVelocity)
        const restockQty = calculateRestockQuantity(vel.dailyVelocity, product.stock)

        // Health status
        let health = 'healthy'
        if (product.stock === 0 || !product.inStock) health = 'out_of_stock'
        else if (stockOut.status === 'critical') health = 'critical'
        else if (stockOut.status === 'warning') health = 'warning'
        else if (stockOut.status === 'attention') health = 'attention'
        else if (product.stock < 10) health = 'low'

        return {
            _id: product._id,
            name: product.name,
            category: product.category,
            brand: product.brand,
            price: product.price,
            image: product.images?.[0] || null,
            currentStock: product.stock,
            inStock: product.inStock,
            avgRating: product.avgRating,
            // Velocity
            dailyVelocity: Math.round(vel.dailyVelocity * 100) / 100,
            weeklyVelocity: Math.round(vel.weeklyVelocity * 10) / 10,
            monthlySold: vel.totalSold,
            // Prediction
            daysUntilStockOut: stockOut.daysUntilStockOut === Infinity ? null : stockOut.daysUntilStockOut,
            stockOutDate: stockOut.date,
            stockOutStatus: stockOut.status,
            // Restock
            recommendedRestock: restockQty,
            // Health
            health,
            // Value at risk (stock × price)
            valueAtRisk: product.stock * product.price,
        }
    })

    // Sort by urgency (critical first, then by days until stock-out)
    const healthOrder = { out_of_stock: 0, critical: 1, warning: 2, attention: 3, low: 4, healthy: 5 }
    analyzedProducts.sort((a, b) => {
        const ha = healthOrder[a.health] ?? 5
        const hb = healthOrder[b.health] ?? 5
        if (ha !== hb) return ha - hb
        return (a.daysUntilStockOut ?? 999) - (b.daysUntilStockOut ?? 999)
    })

    // Generate alerts
    const alerts = []
    const criticalProducts = analyzedProducts.filter(p => p.health === 'critical' || p.health === 'out_of_stock')
    const warningProducts = analyzedProducts.filter(p => p.health === 'warning')
    const attentionProducts = analyzedProducts.filter(p => p.health === 'attention')

    if (criticalProducts.length > 0) {
        alerts.push({
            type: 'critical',
            title: 'Critical: Immediate Restocking Needed',
            message: `${criticalProducts.length} product${criticalProducts.length > 1 ? 's need' : ' needs'} immediate restocking!`,
            products: criticalProducts.map(p => ({
                name: p.name,
                stock: p.currentStock,
                daysLeft: p.daysUntilStockOut,
                restock: p.recommendedRestock,
            })),
        })
    }

    if (warningProducts.length > 0) {
        alerts.push({
            type: 'warning',
            title: 'Warning: Low Stock Alert',
            message: `${warningProducts.length} product${warningProducts.length > 1 ? 's are' : ' is'} running low.`,
            products: warningProducts.map(p => ({
                name: p.name,
                stock: p.currentStock,
                daysLeft: p.daysUntilStockOut,
                restock: p.recommendedRestock,
            })),
        })
    }

    if (attentionProducts.length > 0) {
        alerts.push({
            type: 'attention',
            title: 'Attention: Plan Restocking Soon',
            message: `${attentionProducts.length} product${attentionProducts.length > 1 ? 's need' : ' needs'} restocking within 2 weeks.`,
            products: attentionProducts.map(p => ({
                name: p.name,
                stock: p.currentStock,
                daysLeft: p.daysUntilStockOut,
                restock: p.recommendedRestock,
            })),
        })
    }

    // Summary
    const totalStock = analyzedProducts.reduce((sum, p) => sum + p.currentStock, 0)
    const totalValue = analyzedProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0)
    const lowStockCount = analyzedProducts.filter(p => ['critical', 'warning', 'attention', 'low'].includes(p.health)).length
    const outOfStockCount = analyzedProducts.filter(p => p.health === 'out_of_stock').length
    const healthyCount = analyzedProducts.filter(p => p.health === 'healthy').length

    return {
        summary: {
            totalProducts: products.length,
            totalStock,
            totalValue: Math.round(totalValue),
            lowStockCount,
            outOfStockCount,
            healthyCount,
            avgDailyVelocity: analyzedProducts.reduce((sum, p) => sum + p.dailyVelocity, 0) / products.length,
        },
        products: analyzedProducts,
        alerts,
        velocity,
    }
}
