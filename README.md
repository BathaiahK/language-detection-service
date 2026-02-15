# Language Detection Microservice

A high-performance, language-agnostic microservice for detecting programming languages in codebases. Part of the SecureStack security platform.

## Features

- ✅ Supports 15+ programming languages (JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, C#, Rust, etc.)
- ✅ Detects package managers and build tools
- ✅ Framework detection (React, Vue, Django, Spring Boot, etc.)
- ✅ Dependency analysis
- ✅ RESTful API with comprehensive validation
- ✅ Message queue integration (RabbitMQ)
- ✅ Prometheus metrics for monitoring
- ✅ Health checks and graceful shutdown
- ✅ Rate limiting and security best practices
- ✅ Docker support with multi-stage builds
- ✅ Comprehensive logging with Winston

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Testing](#testing)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run in development mode:**

```bash
npm run dev
```

The service will start on `http://localhost:3001`

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f language-detection

# Stop services
docker-compose down
```

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────┐
│     Language Detection Service          │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    HTTP API (Express)              │ │
│  │    - /api/v1/detect                │ │
│  │    - /api/v1/detect/batch          │ │
│  │    - /api/v1/languages             │ │
│  │    - /health                       │ │
│  │    - /metrics                      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Core Detection Engine           │ │
│  │    - Language Detector             │ │
│  │    - File Traverser                │ │
│  │    - Dependency Analyzer           │ │
│  │    - Framework Detector            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Integrations                    │ │
│  │    - Message Queue (RabbitMQ)      │ │
│  │    - Service Discovery (Consul)    │ │
│  │    - Metrics (Prometheus)          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Key Components

- **Language Detector**: Core detection logic using file extensions, patterns, and content analysis
- **File Traverser**: Efficient async file system traversal with ignore patterns
- **Language Patterns**: Database of language signatures, extensions, and frameworks
- **Dependency Analyzer**: Analyzes package.json, requirements.txt, pom.xml, etc.
- **Framework Detector**: Identifies frameworks like React, Django, Spring Boot

## API Documentation

### POST /api/v1/detect

Detect languages in a codebase.

**Request Body:**

```json
{
  "projectPath": "/path/to/project",
  "analyzeDependencies": true,
  "detectFrameworks": true,
  "maxFiles": 10000,
  "excludePaths": ["node_modules", "dist"]
}
```

**Response:**

```json
{
  "requestId": "uuid",
  "projectPath": "/path/to/project",
  "languages": [
    {
      "language": "javascript",
      "confidence": 0.95,
      "percentage": 75.5,
      "fileCount": 150,
      "files": ["..."],
      "packageManager": "npm",
      "framework": "React"
    }
  ],
  "primaryLanguage": { ... },
  "totalFiles": 200,
  "timestamp": "2024-01-15T10:30:00Z",
  "duration": 1250,
  "metadata": {
    "hasGitRepository": true,
    "hasDependencies": true,
    "hasTests": true,
    "hasDocumentation": true
  }
}
```

### POST /api/v1/detect/batch

Detect languages for multiple projects in parallel.

**Request Body:**

```json
{
  "projects": [
    {
      "projectPath": "/path/to/project1",
      "detectFrameworks": true
    },
    {
      "projectPath": "/path/to/project2",
      "detectFrameworks": false
    }
  ]
}
```

### GET /api/v1/languages

Get list of supported languages.

**Response:**

```json
{
  "languages": ["javascript", "python", "java", "go", ...],
  "count": 15
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "language-detection-service",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

### GET /api/v1/metrics

Prometheus metrics endpoint.

## Configuration

All configuration is done through environment variables. See `.env.example` for all options.

### Key Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `RABBITMQ_URL` | Message queue URL | `amqp://localhost:5672` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `ENABLE_SERVICE_DISCOVERY` | Enable Consul registration | `false` |

## Development

### Project Structure

```
language-detection-service/
├── src/
│   ├── config/              # Configuration management
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   ├── app.ts               # Express app setup
│   └── index.ts             # Entry point
├── dist/                    # Compiled output
├── tests/                   # Test files
├── Dockerfile               # Docker image
├── docker-compose.yml       # Local dev stack
└── package.json
```

### Available Scripts

```bash
npm run dev          # Start in development mode with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

### Adding a New Language

1. Update `src/models/languagePatterns.ts`:

```typescript
{
  language: 'your-language',
  extensions: ['.ext'],
  packageFiles: ['package-file.json'],
  buildFiles: ['build-file'],
  configFiles: [],
  frameworkIndicators: [],
  contentPatterns: [/pattern/]
}
```

2. Add tests in `tests/languageDetector.test.ts`

3. Update documentation

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t securestack/language-detection:1.0.0 .

# Run container
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  --name language-detection \
  securestack/language-detection:1.0.0
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

```bash
kubectl apply -f k8s/
```

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
LOG_FORMAT=json
RABBITMQ_URL=amqp://rabbitmq-cluster:5672
ENABLE_SERVICE_DISCOVERY=true
CONSUL_HOST=consul
ENABLE_METRICS=true
```

## Monitoring

### Prometheus Metrics

Available at `/api/v1/metrics`:

- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total HTTP requests counter
- `language_detection_duration_seconds` - Detection duration histogram
- `language_detections_total` - Total detections counter
- `nodejs_*` - Node.js runtime metrics

### Health Checks

- **Liveness**: `GET /health`
- **Readiness**: `GET /ready`

### Logging

Structured JSON logging with Winston:

```json
{
  "level": "info",
  "message": "Language detection completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "language-detection-service",
  "requestId": "uuid",
  "duration": 1250
}
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Example Test

```typescript
describe('Language Detector', () => {
  it('should detect JavaScript project', async () => {
    const result = await detector.detect({
      projectPath: '/test/fixtures/js-project'
    });
    
    expect(result.primaryLanguage?.language).toBe('javascript');
    expect(result.languages).toHaveLength(1);
  });
});
```

## Performance

- **Detection Speed**: ~1000 files/second
- **Memory Usage**: ~50MB base + ~100KB per 1000 files
- **Concurrent Requests**: Supports 100+ concurrent detections
- **Scalability**: Horizontally scalable with message queue

## Security

- Rate limiting enabled by default
- Helmet.js for security headers
- Input validation with Joi
- No arbitrary code execution
- File system access limited to specified paths

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [link]
- Email: support@securestack.io
- Documentation: [link]

---

Built with ❤️ by SecureStack Team
