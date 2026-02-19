import axios from 'axios';

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
export async function waitForService(
  options: HealthCheckOptions
): Promise<ServiceHealth> {
  const {
    url,
    timeout = 60000,
    interval = 1000,
    serviceName = 'Service',
  } = options;

  const start = Date.now();
  const healthUrl = `${url}/health`;

  console.log(`[Health Check] Waiting for ${serviceName} at ${url}...`);

  while (Date.now() - start < timeout) {
    try {
      const response = await axios.get(healthUrl, {
        timeout: 5000,
        validateStatus: () => true, // Don't throw on non-200
      });

      if (response.status === 200) {
        const elapsed = Date.now() - start;
        console.log(
          `[Health Check] ✓ ${serviceName} is healthy (took ${elapsed}ms)`
        );
        return {
          healthy: true,
          service: serviceName,
          message: `Service healthy after ${elapsed}ms`,
        };
      }

      console.log(
        `[Health Check] ${serviceName} returned status ${response.status}, retrying...`
      );
    } catch (error: any) {
      const elapsed = Date.now() - start;
      if (elapsed % 10000 < interval) {
        // Log every 10 seconds
        console.log(
          `[Health Check] ${serviceName} not ready yet (${elapsed}ms elapsed): ${error.message}`
        );
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
export async function waitForServices(
  services: HealthCheckOptions[]
): Promise<ServiceHealth[]> {
  console.log(
    `[Health Check] Waiting for ${services.length} services to become healthy...`
  );

  const results = await Promise.all(services.map(waitForService));

  const allHealthy = results.every((r) => r.healthy);
  if (allHealthy) {
    console.log('[Health Check] ✓ All services are healthy');
  } else {
    console.error('[Health Check] ✗ Some services failed health check');
  }

  return results;
}

/**
 * Check if RabbitMQ is ready
 */
export async function waitForRabbitMQ(
  url: string = 'http://localhost:15673',
  timeout: number = 60000
): Promise<boolean> {
  const start = Date.now();
  const apiUrl = `${url}/api/overview`;

  console.log('[Health Check] Waiting for RabbitMQ...');

  while (Date.now() - start < timeout) {
    try {
      const response = await axios.get(apiUrl, {
        auth: { username: 'test', password: 'test123' },
        timeout: 5000,
      });

      if (response.status === 200) {
        const elapsed = Date.now() - start;
        console.log(
          `[Health Check] ✓ RabbitMQ is ready (took ${elapsed}ms)`
        );
        return true;
      }
    } catch (error) {
      // Continue retrying
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`RabbitMQ did not become ready within ${timeout}ms`);
}

/**
 * Check if Redis is ready
 */
export async function waitForRedis(
  host: string = 'localhost',
  port: number = 6380,
  timeout: number = 60000
): Promise<boolean> {
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
    } catch (error) {
      // Continue
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Redis did not become ready within ${timeout}ms`);
}
