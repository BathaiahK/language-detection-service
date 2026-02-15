# Language Detection Microservice - Architecture Document

## Overview

The Language Detection Microservice is a standalone, production-ready service designed to analyze codebases and identify programming languages, package managers, frameworks, and dependencies. It's built with scalability, maintainability, and observability in mind.

## Design Principles

1. **Single Responsibility**: Each service does one thing well
2. **Microservices Architecture**: Loosely coupled, independently deployable
3. **API-First**: RESTful API with comprehensive validation
4. **Observability**: Structured logging, metrics, health checks
5. **Resilience**: Error handling, rate limiting, graceful degradation
6. **Scalability**: Stateless design, horizontal scaling ready

## Technology Stack

- **Runtime**: Node.js 18+ (TypeScript)
- **Framework**: Express.js
- **Message Queue**: RabbitMQ (AMQP)
- **Service Discovery**: Consul (optional)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston (structured JSON)
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     External Systems                            │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway  │  Other Services  │  Monitoring  │  Git Platforms│
└────────┬──────────────┬──────────────┬──────────────┬───────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Language Detection Microservice                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (Express)                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Rate Limiter │ CORS │ Helmet │ Compression │ Logger       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Controller Layer                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • LanguageDetectionController                             │ │
│  │  • Request validation (Joi)                                │ │
│  │  • Response formatting                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Service Layer                           │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │  │LanguageDetector  │  │DependencyAnalyzer│               │ │
│  │  └──────────────────┘  └──────────────────┘               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │  │FrameworkDetector │  │FileTraverser     │               │ │
│  │  └──────────────────┘  └──────────────────┘               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Model Layer                             │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • LanguagePatterns (15+ languages)                        │ │
│  │  • Framework signatures                                    │ │
│  │  • Package manager mappings                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                Integration Layer                           │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • MessageQueueService (RabbitMQ)                          │ │
│  │  • ServiceRegistry (Consul)                                │ │
│  │  • MetricsService (Prometheus)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. API Layer

**Responsibilities:**
- HTTP request handling
- Security (Helmet, CORS)
- Rate limiting
- Request/response logging
- Compression

**Key Files:**
- `src/app.ts` - Express application setup
- `src/routes/index.ts` - Route definitions
- `src/middleware/*` - Middleware components

### 2. Controller Layer

**Responsibilities:**
- Request validation
- Business logic orchestration
- Response formatting
- Error handling

**Key Files:**
- `src/controllers/languageDetection.controller.ts`

### 3. Service Layer

**Responsibilities:**
- Core business logic
- Language detection algorithm
- Dependency analysis
- Framework detection
- File system operations

**Key Components:**

#### LanguageDetector
- Orchestrates the entire detection process
- Combines results from multiple analyzers
- Calculates confidence scores

#### FileTraverser
- Efficient async file system traversal
- Respects .gitignore patterns
- Handles large codebases (100k+ files)

#### DependencyAnalyzer
- Parses package.json, requirements.txt, pom.xml, etc.
- Counts dependencies
- Identifies package managers

#### FrameworkDetector
- Detects React, Vue, Django, Spring Boot, etc.
- Checks indicator files and dependencies

**Key Files:**
- `src/services/languageDetector.service.ts`
- `src/services/dependencyAnalyzer.service.ts`
- `src/services/frameworkDetector.service.ts`
- `src/utils/fileTraverser.ts`

### 4. Model Layer

**Responsibilities:**
- Language signature database
- Pattern matching rules
- Framework indicators

**Key Files:**
- `src/models/languagePatterns.ts`

### 5. Integration Layer

**Responsibilities:**
- External service communication
- Message queue pub/sub
- Service discovery
- Metrics collection

**Key Files:**
- `src/services/messageQueue.service.ts`
- `src/services/serviceRegistry.service.ts`
- `src/middleware/metrics.ts`

## Data Flow

### Typical Detection Request Flow

```
1. HTTP Request → API Layer
   ├─ Rate limiter checks
   ├─ CORS validation
   ├─ Request logging
   └─ Body parsing

2. Controller Layer
   ├─ Joi validation
   ├─ Extract parameters
   └─ Call service layer

3. Service Layer (LanguageDetector)
   ├─ Initialize FileTraverser
   ├─ Scan all files (async)
   │   ├─ Detect by extension
   │   ├─ Detect by filename
   │   └─ Detect by content
   ├─ Aggregate results
   ├─ Enrich with tools (package manager, build tool)
   ├─ Detect frameworks (optional)
   ├─ Analyze dependencies (optional)
   └─ Calculate metadata

4. Response
   ├─ Format response
   ├─ Record metrics
   ├─ Log completion
   └─ Return JSON

5. Post-Processing
   ├─ Publish to message queue (if enabled)
   └─ Update service metrics
```

## Scalability Considerations

### Horizontal Scaling

The service is **stateless** and can be scaled horizontally:

```yaml
# Kubernetes example
replicas: 5
```

### Load Balancing

Use a load balancer to distribute requests:
- NGINX
- HAProxy
- Kubernetes Service
- API Gateway

### Performance Optimizations

1. **File Caching**: Cache file traversal results (Redis)
2. **Parallel Processing**: Analyze files in parallel
3. **Stream Processing**: Use async generators for large directories
4. **Result Caching**: Cache detection results by project hash
5. **Resource Limits**: Configurable max files, max depth

## Observability

### Logging

**Structured JSON logging** with Winston:

```json
{
  "level": "info",
  "message": "Language detection completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "language-detection-service",
  "requestId": "uuid",
  "primaryLanguage": "javascript",
  "duration": 1250
}
```

**Log Levels:**
- `error`: System errors, exceptions
- `warn`: Non-critical issues
- `info`: General informational messages
- `debug`: Detailed debugging information

### Metrics

**Prometheus metrics:**
- `http_request_duration_seconds`: Request latency histogram
- `http_requests_total`: Total requests counter
- `language_detection_duration_seconds`: Detection time histogram
- `language_detections_total`: Total detections counter
- Node.js runtime metrics

### Health Checks

- **Liveness**: `/health` - Is the service alive?
- **Readiness**: `/ready` - Is the service ready to accept traffic?

### Tracing

**Future addition:**
- OpenTelemetry integration
- Jaeger/Zipkin support
- Distributed tracing

## Security

### Authentication & Authorization

**Current**: No authentication (internal service)
**Future**: 
- API Key authentication
- JWT tokens
- mTLS for service-to-service

### Input Validation

- Joi schema validation
- Path traversal prevention
- File size limits
- Request size limits

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable via environment variables

### Security Headers

- Helmet.js enabled
- CORS configured
- Content Security Policy

## Error Handling

### Error Types

```typescript
class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;
}
```

### Error Responses

```json
{
  "code": "VALIDATION_ERROR",
  "message": "projectPath is required",
  "details": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Graceful Degradation

- Service continues if dependency analysis fails
- Returns partial results if possible
- Logs errors but doesn't crash

## Deployment

### Docker

```bash
docker build -t securestack/language-detection:1.0.0 .
docker run -p 3001:3001 securestack/language-detection:1.0.0
```

### Docker Compose

```bash
docker-compose up -d
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: language-detection
spec:
  replicas: 3
  selector:
    matchLabels:
      app: language-detection
  template:
    metadata:
      labels:
        app: language-detection
    spec:
      containers:
      - name: language-detection
        image: securestack/language-detection:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: production
```

## Future Enhancements

### Short Term
- [ ] Redis caching layer
- [ ] More language support (Swift, Scala, Elixir)
- [ ] Version detection for languages
- [ ] License detection
- [ ] Code quality metrics

### Medium Term
- [ ] API authentication
- [ ] GraphQL API
- [ ] WebSocket support for real-time updates
- [ ] Batch processing optimization
- [ ] Multi-repository analysis

### Long Term
- [ ] Machine learning for ambiguous detection
- [ ] Code similarity analysis
- [ ] Dependency vulnerability integration
- [ ] IDE plugins
- [ ] Web UI dashboard

## Testing Strategy

### Unit Tests
- Service layer logic
- Pattern matching
- File traversal

### Integration Tests
- API endpoints
- Database operations
- Message queue

### E2E Tests
- Full detection workflow
- Multi-language projects

### Performance Tests
- Large codebase handling
- Concurrent requests
- Memory usage

## Monitoring & Alerting

### Key Metrics to Monitor

1. **Latency**: p50, p95, p99 response times
2. **Error Rate**: 4xx and 5xx errors
3. **Throughput**: Requests per second
4. **Resource Usage**: CPU, Memory, Disk I/O
5. **Queue Depth**: RabbitMQ queue size

### Alerts

- Detection time > 30 seconds
- Error rate > 5%
- Memory usage > 80%
- Queue depth > 1000

## Conclusion

This microservice is designed for:
- **Production readiness**: Logging, metrics, health checks
- **Scalability**: Horizontal scaling, stateless design
- **Maintainability**: Clean architecture, TypeScript, comprehensive docs
- **Observability**: Structured logging, Prometheus metrics
- **Security**: Rate limiting, input validation, security headers

It serves as a solid foundation for the larger SecureStack security platform.
