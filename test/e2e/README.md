# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the Language Detection Service. These tests verify the entire system working together in a production-like environment.

## Overview

The E2E test suite covers:
- ✅ All 6 API endpoints
- ✅ Language detection for 6+ programming languages
- ✅ Framework detection (React, Django, Spring Boot, Gin)
- ✅ Package manager detection (npm, pip, Maven, Go modules)
- ✅ Batch processing
- ✅ Error handling and validation
- ✅ Health checks and monitoring

## Prerequisites

- **Docker** installed and running
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

## Test Infrastructure

### Docker Services

Tests run against isolated Docker containers defined in [docker-compose.test.yml](../../docker-compose.test.yml):

| Service | Port | Purpose |
|---------|------|---------|
| language-detection-test | 3101 | Main service under test |
| rabbitmq-test | 5673, 15673 | Message queue |
| redis-test | 6380 | Cache |

### Test Structure

```
test/e2e/
├── fixtures/
│   └── projects/          # Sample projects for testing
│       ├── javascript-react/
│       ├── python-django/
│       ├── multi-language/
│       ├── java-spring/
│       ├── go-project/
│       └── empty-project/
├── utils/
│   ├── testContext.ts     # HTTP clients and shared state
│   ├── healthCheck.helper.ts  # Service health verification
│   └── assertions.ts      # Response validation helpers
├── language-detection/
│   └── api.e2e.test.ts   # API endpoint tests
├── setup.ts              # Global test setup
└── teardown.ts           # Global cleanup
```

## Running Tests

### Quick Start

```bash
# Run E2E tests (services must be running)
npm run test:e2e

# Run E2E tests with full orchestration (recommended)
npm run test:e2e:local
```

### Step-by-Step

#### 1. Build the service

```bash
npm run build
```

#### 2. Start test environment

```bash
npm run docker:test:up
# or manually:
docker-compose -f docker-compose.test.yml up -d
```

Wait ~30 seconds for all services to become healthy.

#### 3. Run tests

```bash
npm run test:e2e
```

#### 4. View test results

Tests will output detailed logs including:
- HTTP requests/responses
- Service health checks
- Test assertions
- Pass/fail summary

#### 5. Stop test environment

```bash
npm run docker:test:down
# or manually:
docker-compose -f docker-compose.test.yml down -v
```

### Watch Mode

```bash
# Keep services running and re-run tests on changes
npm run docker:test:up
npm run test:e2e:watch
```

### Coverage

```bash
npm run test:e2e:coverage
```

Coverage reports are generated in `coverage-e2e/`.

## Test Fixtures

### Sample Projects

The test suite includes realistic sample projects:

| Project | Languages | Frameworks | Package Managers |
|---------|-----------|------------|------------------|
| javascript-react | JavaScript | React | npm |
| python-django | Python | Django | pip |
| multi-language | JS + Python | Vue + FastAPI | npm + pip |
| java-spring | Java | Spring Boot | Maven |
| go-project | Go | Gin | Go Modules |
| empty-project | None | None | None |

### Adding New Fixtures

1. Create project directory in `test/e2e/fixtures/projects/`
2. Add realistic files (package.json, source files, etc.)
3. Add README.md documenting expected detection results
4. Reference in test cases

## Writing Tests

### Example Test

```typescript
import { getTestContext } from '../utils/testContext';
import { assertValidDetectionResponse } from '../utils/assertions';

describe('My Feature', () => {
  let testContext: ReturnType<typeof getTestContext>;

  beforeAll(() => {
    testContext = getTestContext();
  });

  it('should detect my language', async () => {
    const response = await testContext.languageDetectionClient.post(
      '/api/v1/detect',
      { projectPath: '/path/to/project' }
    );

    expect(response.status).toBe(200);
    assertValidDetectionResponse(response.data);
    expect(response.data.primaryLanguage.language).toBe('javascript');
  });
});
```

### Utilities

#### Test Context

Access HTTP clients via `getTestContext()`:

```typescript
const testContext = getTestContext();
testContext.languageDetectionClient // Axios instance
```

#### Assertions

Use helper functions for validation:

```typescript
import {
  assertValidDetectionResponse,
  assertLanguageDetected,
  assertFrameworkDetected,
  assertPackageManagerDetected,
} from '../utils/assertions';

// Validate response schema
assertValidDetectionResponse(response.data);

// Assert language detected with confidence >= 0.7
assertLanguageDetected(response.data, 'javascript', 0.7);

// Assert framework detected
assertFrameworkDetected(response.data, 'React');

// Assert package manager detected
assertPackageManagerDetected(response.data, 'npm');
```

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :3101
lsof -i :5673

# View service logs
docker-compose -f docker-compose.test.yml logs

# Restart services
docker-compose -f docker-compose.test.yml restart
```

### Tests Timeout

- Increase `testTimeout` in [jest.config.e2e.js](../../jest.config.e2e.js)
- Check service health: `curl http://localhost:3101/health`
- Review logs: `docker-compose -f docker-compose.test.yml logs language-detection-test`

### Tests Fail Randomly (Flaky)

- Ensure services are fully healthy before running tests
- Check for port conflicts
- Verify Docker has sufficient resources

### Permission Errors

On Linux, ensure your user can access Docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## CI/CD Integration

E2E tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests

See [.github/workflows/e2e-tests.yml](../../.github/workflows/e2e-tests.yml)

### Running in CI

The workflow:
1. Checks out code
2. Installs dependencies
3. Builds the service
4. Starts test environment
5. Runs E2E tests
6. Uploads test results
7. Cleans up containers

## Best Practices

### DO
✅ Use realistic test data
✅ Validate response schemas
✅ Test error scenarios
✅ Clean up after tests
✅ Use descriptive test names
✅ Keep tests independent

### DON'T
❌ Share state between tests
❌ Hard-code timeouts
❌ Skip cleanup
❌ Test implementation details
❌ Ignore flaky tests

## Maintenance

### Updating Test Fixtures

When adding new language support:
1. Add sample project in `fixtures/projects/`
2. Add test case in relevant test suite
3. Update this README

### Updating Dependencies

```bash
npm update
npm run test:all  # Verify all tests pass
```

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.test.yml logs`
- Review test output
- Contact the team

## Test Metrics

Current coverage:
- API Endpoints: 6/6 (100%)
- Languages: 6+ supported
- Frameworks: 5+ detected
- Error Scenarios: Comprehensive

Target execution time: < 5 minutes
