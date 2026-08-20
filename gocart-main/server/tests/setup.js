// Test environment setup
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.JWT_EXPIRES_IN = '1h'
process.env.PORT = '0' // Random port
