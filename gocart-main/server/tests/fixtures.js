// ─── Test Fixtures ───────────────────────────────────────────

export const testUsers = {
    buyer: {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'TestPass123',
        role: 'buyer',
    },
    seller: {
        name: 'Test Seller',
        email: 'seller@test.com',
        password: 'TestPass123',
        role: 'seller',
    },
    admin: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'TestPass123',
        role: 'admin',
    },
}

export const testProducts = {
    headphones: {
        name: 'Test Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation for testing.',
        mrp: 299.99,
        price: 199.99,
        category: 'Headphones',
        brand: 'TestBrand',
        stock: 50,
        tags: ['wireless', 'noise-cancelling', 'bluetooth'],
        images: ['https://example.com/test-headphones.jpg'],
    },
    watch: {
        name: 'Test Smart Watch',
        description: 'A smart watch with fitness tracking for testing.',
        mrp: 399.99,
        price: 299.99,
        category: 'Watch',
        brand: 'TestBrand',
        stock: 30,
        tags: ['smart', 'fitness', 'waterproof'],
        images: ['https://example.com/test-watch.jpg'],
    },
    lowStock: {
        name: 'Test Low Stock Item',
        description: 'A product with very low stock for testing.',
        mrp: 99.99,
        price: 79.99,
        category: 'Accessories',
        brand: 'TestBrand',
        stock: 3,
        tags: ['limited'],
        images: ['https://example.com/test-low-stock.jpg'],
    },
}

export const testOrder = {
    items: [], // Will be populated with product IDs
    address: {
        fullName: 'Test Buyer',
        phone: '+1-555-0100',
        area: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipcode: '12345',
        country: 'US',
    },
}

export const testReview = {
    rating: 5,
    review: 'Excellent product! Great quality and fast delivery.',
}

// ─── Test Helpers ────────────────────────────────────────────

export function generateTestEmail() {
    return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`
}

export function createMockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides,
    }
}

export function createMockResponse() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
    }
    return res
}

export function createMockNext() {
    return jest.fn()
}
