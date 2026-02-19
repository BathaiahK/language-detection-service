import 'dotenv/config';
import { Server } from 'http';
import app from './app';
import { logger } from './utils/logger';
import { config } from './config';
import { MessageQueueService } from './services/messageQueue.service';
import { ServiceRegistry } from './services/serviceRegistry.service';

const PORT = config.port;
const HOST = config.host;

let server: Server | undefined;
let messageQueueService: MessageQueueService;
let serviceRegistry: ServiceRegistry;

async function start(): Promise<void> {
  try {
    // Initialize Message Queue
    if (config.rabbitmq.enabled) {
      messageQueueService = new MessageQueueService();
      await messageQueueService.connect();
      await messageQueueService.setupConsumers();
      logger.info('Message queue connected');
    }

    // Initialize Service Registry (Consul/Eureka)
    if (config.serviceDiscovery.enabled) {
      serviceRegistry = new ServiceRegistry();
      await serviceRegistry.register();
      logger.info('Service registered with service discovery');
    }

    // Start HTTP server
    server = app.listen(PORT, HOST, () => {
      logger.info(
        `🚀 ${config.serviceName} v${config.serviceVersion} is running`,
        {
          port: PORT,
          host: HOST,
          env: config.nodeEnv,
        }
      );
    });

    // Graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to start service', { error });
    process.exit(1);
  }
}

function setupGracefulShutdown(): void {
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      // Stop accepting new requests
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');

          // Disconnect from message queue
          if (messageQueueService) {
            await messageQueueService.disconnect();
            logger.info('Message queue disconnected');
          }

          // Deregister from service discovery
          if (serviceRegistry) {
            await serviceRegistry.deregister();
            logger.info('Service deregistered');
          }

          logger.info('Graceful shutdown completed');
          process.exit(0);
        });
      }

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
  });
}

// Start the service
start().catch((error) => {
  logger.error('Fatal error during startup', { error });
  process.exit(1);
});
