/**
 * @description: This is the Jest configuration file.
 * @returns {Object} - A Jest configuration object.
 */
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    transform: {}
}; 