import { getTestContext } from './utils/testContext';

/**
 * Global teardown for E2E tests
 * This runs once after all test suites complete
 */
export default async function globalTeardown() {
  console.log('\n===========================================');
  console.log('  E2E Test Suite - Global Teardown');
  console.log('===========================================\n');

  try {
    // Cleanup test context
    console.log('[Teardown] Cleaning up test context...');
    const testContext = getTestContext();
    await testContext.cleanup();

    console.log('[Teardown] ✓ Test context cleaned up');

    console.log('\n===========================================');
    console.log('  ✓ Global Teardown Complete');
    console.log('===========================================\n');

    console.log('Note: To stop test services, run:');
    console.log('  docker-compose -f docker-compose.test.yml down -v\n');
  } catch (error: any) {
    console.error('\n✗ Global teardown failed:', error.message);
    throw error;
  }
}
