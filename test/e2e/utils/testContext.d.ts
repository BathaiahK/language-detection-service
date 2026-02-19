import { AxiosInstance } from 'axios';
/**
 * Test Context
 * Manages HTTP clients and shared state for E2E tests
 */
export declare class TestContext {
    languageDetectionClient: AxiosInstance;
    readonly baseUrls: {
        languageDetection: string;
        rabbitmqManagement: string;
    };
    private initialized;
    /**
     * Initialize the test context
     * Creates HTTP clients and verifies connectivity
     */
    initialize(): Promise<void>;
    /**
     * Cleanup test context
     * Closes all connections and resets state
     */
    cleanup(): Promise<void>;
    /**
     * Get the test context singleton
     */
    static getInstance(): TestContext;
    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset(): void;
}
/**
 * Global accessor for test context
 */
export declare const getTestContext: () => TestContext;
//# sourceMappingURL=testContext.d.ts.map