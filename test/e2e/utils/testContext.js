"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestContext = exports.TestContext = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Test Context
 * Manages HTTP clients and shared state for E2E tests
 */
class TestContext {
    languageDetectionClient;
    baseUrls = {
        languageDetection: 'http://localhost:3101',
        rabbitmqManagement: 'http://localhost:15673',
    };
    initialized = false;
    /**
     * Initialize the test context
     * Creates HTTP clients and verifies connectivity
     */
    async initialize() {
        if (this.initialized) {
            console.log('[TestContext] Already initialized, skipping...');
            return;
        }
        console.log('[TestContext] Initializing test context...');
        // Create Language Detection client
        this.languageDetectionClient = axios_1.default.create({
            baseURL: this.baseUrls.languageDetection,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'E2E-Test-Suite/1.0',
            },
            validateStatus: () => true, // Don't throw on any status code
        });
        // Add request logging interceptor
        this.languageDetectionClient.interceptors.request.use((config) => {
            console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            return config;
        }, (error) => {
            console.error('[HTTP Request Error]', error.message);
            return Promise.reject(error);
        });
        // Add response logging interceptor
        this.languageDetectionClient.interceptors.response.use((response) => {
            console.log(`[HTTP Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
            return response;
        }, (error) => {
            console.error(`[HTTP Response Error] ${error.response?.status} ${error.message}`);
            return Promise.reject(error);
        });
        this.initialized = true;
        console.log('[TestContext] ✓ Test context initialized');
    }
    /**
     * Cleanup test context
     * Closes all connections and resets state
     */
    async cleanup() {
        if (!this.initialized) {
            return;
        }
        console.log('[TestContext] Cleaning up test context...');
        // Axios clients don't need explicit cleanup
        // But we can reset the flag
        this.initialized = false;
        console.log('[TestContext] ✓ Test context cleaned up');
    }
    /**
     * Get the test context singleton
     */
    static getInstance() {
        if (!global.testContext) {
            global.testContext = new TestContext();
        }
        return global.testContext;
    }
    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset() {
        delete global.testContext;
    }
}
exports.TestContext = TestContext;
/**
 * Global accessor for test context
 */
const getTestContext = () => {
    return TestContext.getInstance();
};
exports.getTestContext = getTestContext;
//# sourceMappingURL=testContext.js.map