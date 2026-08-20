export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    // Enable ESM support
    extensionsToTreatAsEsm: [],
}
