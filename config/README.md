# Configuration Files

This directory contains environment-specific configuration files for the Language Detection Service.

## File Structure

- `local.json` - Local development environment
- `qat.json` - QA/Testing environment
- `stg.json` - Staging environment
- `prd.json` - Production environment

## Configuration Schema

### Service Configuration
- `service.name` - Service identifier
- `service.version` - Service version
- `service.host` - Bind host address
- `service.port` - Service port number

### Services
This section defines other microservices that this service depends on:
- `baseUrl` - The base URL of the service (e.g., `http://service-name:3001`)
- `endpoints` - Object containing endpoint paths (e.g., `{ "detect": "/api/detect" }`)
- `timeout` - Request timeout in milliseconds

### External APIs
External third-party APIs:
- `baseUrl` - The base URL of the external API
- `endpoints` - Available API endpoints
- `timeout` - Request timeout in milliseconds

### Infrastructure
- `database` - PostgreSQL connection settings
- `redis` - Redis cache configuration
- `rabbitmq` - Message queue configuration

### Application Settings
- `cors` - CORS allowed origins
- `logging` - Log level and format
- `monitoring` - Metrics collection settings

## Usage

Set the `NODE_ENV` environment variable to load the appropriate config:

```bash
# Local development
NODE_ENV=development npm start

# QA environment
NODE_ENV=qat npm start

# Staging environment
NODE_ENV=staging npm start

# Production environment
NODE_ENV=production npm start
```

## Loading Configuration in Code

```typescript
import * as fs from 'fs';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const envMap = {
  'development': 'local',
  'qat': 'qat',
  'staging': 'stg',
  'production': 'prd'
};

const configFile = path.join(__dirname, '../../config', `${envMap[env]}.json`);
const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
```

## Security Notes

- **Never commit sensitive data** (passwords, API keys) to these files
- Use environment variables for secrets
- Production passwords should be managed via secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.)
- The example configurations use placeholder values that must be replaced in actual deployments
