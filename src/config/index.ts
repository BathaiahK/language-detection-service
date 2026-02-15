import { cleanEnv, str, port, num, bool } from 'envalid';

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production', 'staging'],
    default: 'development',
  }),
  PORT: port({ default: 3001 }),
  HOST: str({ default: '0.0.0.0' }),
  SERVICE_NAME: str({ default: 'language-detection-service' }),
  SERVICE_VERSION: str({ default: '1.0.0' }),
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'debug'],
    default: 'info',
  }),
  LOG_FORMAT: str({ choices: ['json', 'simple'], default: 'json' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 900000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  CACHE_TTL: num({ default: 3600 }),
  CACHE_MAX_KEYS: num({ default: 1000 }),
  RABBITMQ_ENABLED: bool({ default: false }),
  RABBITMQ_URL: str({ default: 'amqp://localhost:5672' }),
  RABBITMQ_EXCHANGE: str({ default: 'securestack' }),
  RABBITMQ_QUEUE: str({ default: 'language-detection' }),
  ENABLE_SERVICE_DISCOVERY: bool({ default: false }),
  CONSUL_HOST: str({ default: 'localhost' }),
  CONSUL_PORT: port({ default: 8500 }),
  ENABLE_METRICS: bool({ default: true }),
  METRICS_PORT: port({ default: 9090 }),
  CORS_ORIGIN: str({ default: 'http://localhost:3000' }),
  HEALTH_CHECK_INTERVAL: num({ default: 30000 }),
});

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  serviceName: env.SERVICE_NAME,
  serviceVersion: env.SERVICE_VERSION,

  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  cache: {
    ttl: env.CACHE_TTL,
    maxKeys: env.CACHE_MAX_KEYS,
  },

  rabbitmq: {
    enabled: env.RABBITMQ_ENABLED && env.NODE_ENV !== 'test',
    url: env.RABBITMQ_URL,
    exchange: env.RABBITMQ_EXCHANGE,
    queue: env.RABBITMQ_QUEUE,
  },

  serviceDiscovery: {
    enabled: env.ENABLE_SERVICE_DISCOVERY,
    consul: {
      host: env.CONSUL_HOST,
      port: env.CONSUL_PORT,
    },
  },

  monitoring: {
    enabled: env.ENABLE_METRICS,
    port: env.METRICS_PORT,
  },

  cors: {
    origins: env.CORS_ORIGIN.split(','),
  },

  healthCheck: {
    interval: env.HEALTH_CHECK_INTERVAL,
  },
} as const;

export type Config = typeof config;
