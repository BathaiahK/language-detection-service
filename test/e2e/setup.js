"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const healthCheck_helper_1 = require("./utils/healthCheck.helper");
const testContext_1 = require("./utils/testContext");
/**
 * Global setup for E2E tests
 * This runs once before all test suites
 */
async function globalSetup() {
    console.log('\n===========================================');
    console.log('  E2E Test Suite - Global Setup');
    console.log('===========================================\n');
    try {
        // Step 1: Wait for all services to be healthy
        console.log('[Setup] Step 1: Waiting for services to be healthy...');
        await (0, healthCheck_helper_1.waitForServices)([
            {
                url: 'http://localhost:3101',
                timeout: 60000,
                serviceName: 'Language Detection Service',
            },
        ]);
        // Step 2: Initialize test context
        console.log('\n[Setup] Step 2: Initializing test context...');
        const testContext = (0, testContext_1.getTestContext)();
        await testContext.initialize();
        // Step 3: Verify connectivity
        console.log('\n[Setup] Step 3: Verifying service connectivity...');
        const healthResponse = await testContext.languageDetectionClient.get('/health');
        if (healthResponse.status !== 200) {
            throw new Error(`Language Detection Service health check failed: ${healthResponse.status}`);
        }
        console.log('[Setup] ✓ Language Detection Service is healthy');
        console.log('\n===========================================');
        console.log('  ✓ Global Setup Complete');
        console.log('===========================================\n');
    }
    catch (error) {
        console.error('\n===========================================');
        console.error('  ✗ Global Setup Failed');
        console.error('===========================================');
        console.error('\nError:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure Docker is running');
        console.error('2. Run: docker-compose -f docker-compose.test.yml up -d');
        console.error('3. Check service logs: docker-compose -f docker-compose.test.yml logs');
        console.error('4. Verify ports are not in use: lsof -i :3101');
        console.error('\n');
        throw error;
    }
}
//# sourceMappingURL=setup.js.map