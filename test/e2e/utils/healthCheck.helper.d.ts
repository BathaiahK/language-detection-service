export interface HealthCheckOptions {
    url: string;
    timeout?: number;
    interval?: number;
    serviceName?: string;
}
export interface ServiceHealth {
    healthy: boolean;
    service: string;
    message?: string;
}
/**
 * Wait for a service to become healthy
 * Polls the service's /health endpoint until it returns 200 or timeout is reached
 */
export declare function waitForService(options: HealthCheckOptions): Promise<ServiceHealth>;
/**
 * Wait for multiple services in parallel
 */
export declare function waitForServices(services: HealthCheckOptions[]): Promise<ServiceHealth[]>;
/**
 * Check if RabbitMQ is ready
 */
export declare function waitForRabbitMQ(url?: string, timeout?: number): Promise<boolean>;
/**
 * Check if Redis is ready
 */
export declare function waitForRedis(host?: string, port?: number, timeout?: number): Promise<boolean>;
//# sourceMappingURL=healthCheck.helper.d.ts.map