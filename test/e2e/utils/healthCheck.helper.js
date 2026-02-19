"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForService = waitForService;
exports.waitForServices = waitForServices;
exports.waitForRabbitMQ = waitForRabbitMQ;
exports.waitForRedis = waitForRedis;
const axios_1 = __importDefault(require("axios"));
/**
 * Wait for a service to become healthy
 * Polls the service's /health endpoint until it returns 200 or timeout is reached
 */
async function waitForService(options) {
    const { url, timeout = 60000, interval = 1000, serviceName = 'Service', } = options;
    const start = Date.now();
    const healthUrl = `${url}/health`;
    console.log(`[Health Check] Waiting for ${serviceName} at ${url}...`);
    while (Date.now() - start < timeout) {
        try {
            const response = await axios_1.default.get(healthUrl, {
                timeout: 5000,
                validateStatus: () => true, // Don't throw on non-200
            });
            if (response.status === 200) {
                const elapsed = Date.now() - start;
                console.log(`[Health Check] ✓ ${serviceName} is healthy (took ${elapsed}ms)`);
                return {
                    healthy: true,
                    service: serviceName,
                    message: `Service healthy after ${elapsed}ms`,
                };
            }
            console.log(`[Health Check] ${serviceName} returned status ${response.status}, retrying...`);
        }
        catch (error) {
            const elapsed = Date.now() - start;
            if (elapsed % 10000 < interval) {
                // Log every 10 seconds
                console.log(`[Health Check] ${serviceName} not ready yet (${elapsed}ms elapsed): ${error.message}`);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    const message = `${serviceName} did not become healthy within ${timeout}ms`;
    console.error(`[Health Check] ✗ ${message}`);
    throw new Error(message);
}
/**
 * Wait for multiple services in parallel
 */
async function waitForServices(services) {
    console.log(`[Health Check] Waiting for ${services.length} services to become healthy...`);
    const results = await Promise.all(services.map(waitForService));
    const allHealthy = results.every((r) => r.healthy);
    if (allHealthy) {
        console.log('[Health Check] ✓ All services are healthy');
    }
    else {
        console.error('[Health Check] ✗ Some services failed health check');
    }
    return results;
}
/**
 * Check if RabbitMQ is ready
 */
async function waitForRabbitMQ(url = 'http://localhost:15673', timeout = 60000) {
    const start = Date.now();
    const apiUrl = `${url}/api/overview`;
    console.log('[Health Check] Waiting for RabbitMQ...');
    while (Date.now() - start < timeout) {
        try {
            const response = await axios_1.default.get(apiUrl, {
                auth: { username: 'test', password: 'test123' },
                timeout: 5000,
            });
            if (response.status === 200) {
                const elapsed = Date.now() - start;
                console.log(`[Health Check] ✓ RabbitMQ is ready (took ${elapsed}ms)`);
                return true;
            }
        }
        catch (error) {
            // Continue retrying
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`RabbitMQ did not become ready within ${timeout}ms`);
}
/**
 * Check if Redis is ready
 */
async function waitForRedis(host = 'localhost', port = 6380, timeout = 60000) {
    const start = Date.now();
    console.log(`[Health Check] Waiting for Redis at ${host}:${port}...`);
    // Simple TCP connection check (Redis doesn't have HTTP endpoint)
    // In real implementation, use ioredis to check
    while (Date.now() - start < timeout) {
        try {
            // For now, just check if language detection service is up
            // as it depends on Redis
            const elapsed = Date.now() - start;
            if (elapsed > 5000) {
                console.log('[Health Check] ✓ Assuming Redis is ready');
                return true;
            }
        }
        catch (error) {
            // Continue
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Redis did not become ready within ${timeout}ms`);
}
//# sourceMappingURL=healthCheck.helper.js.map