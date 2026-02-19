import path from 'path';
import { getTestContext } from '../utils/testContext';
import {
  assertValidDetectionResponse,
  assertValidSupportedLanguagesResponse,
  assertValidHealthResponse,
  assertLanguageDetected,
  assertFrameworkDetected,
  assertPackageManagerDetected,
} from '../utils/assertions';

describe('Language Detection API - E2E Tests', () => {
  let testContext: ReturnType<typeof getTestContext>;

  beforeAll(() => {
    testContext = getTestContext();
  });

  describe('POST /api/v1/detect - Single Project Detection', () => {
    it('should detect JavaScript/React project correctly', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/javascript-react'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          analyzeDependencies: true,
          detectFrameworks: true,
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.primaryLanguage.language).toBe('javascript');
      assertLanguageDetected(response.data, 'javascript', 0.7);
      assertFrameworkDetected(response.data, 'React');
      assertPackageManagerDetected(response.data, 'npm');
    });

    it('should detect Python/Django project correctly', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/python-django'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          analyzeDependencies: true,
          detectFrameworks: true,
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.primaryLanguage.language).toBe('python');
      assertLanguageDetected(response.data, 'python', 0.7);
      assertFrameworkDetected(response.data, 'Django');
      assertPackageManagerDetected(response.data, 'pip');
    });

    it('should detect multi-language project correctly', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/multi-language'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        { projectPath, analyzeDependencies: true, detectFrameworks: true }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.languages.length).toBeGreaterThanOrEqual(2);
      assertLanguageDetected(response.data, 'javascript', 0.3);
      assertLanguageDetected(response.data, 'python', 0.3);
    });

    it('should handle empty project gracefully', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/empty-project'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        { projectPath }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.languages).toHaveLength(0);
      expect(response.data.totalFiles).toBe(0);
    });

    it('should return error for non-existent path', async () => {
      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        { projectPath: '/non/existent/path' }
      );

      expect(response.status).toBe(400);
      expect(response.data.error).toBeDefined();
    });

    it('should return error for missing projectPath', async () => {
      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {}
      );

      expect(response.status).toBe(400);
      expect(response.data.error).toBeDefined();
      expect(response.data.message).toContain('projectPath');
    });

    it('should respect maxFiles limit', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/javascript-react'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          maxFiles: 2,
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);
      expect(response.data.totalFiles).toBeLessThanOrEqual(2);
    });

    it('should support custom excludePaths', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/javascript-react'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          excludePaths: ['src/**'],
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);
    });

    it('should detect Java/Spring Boot project correctly', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/java-spring'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          analyzeDependencies: true,
          detectFrameworks: true,
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.primaryLanguage.language).toBe('java');
      assertLanguageDetected(response.data, 'java', 0.7);
      assertPackageManagerDetected(response.data, 'maven');
    });

    it('should detect Go project correctly', async () => {
      const projectPath = path.join(
        __dirname,
        '../fixtures/projects/go-project'
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect',
        {
          projectPath,
          analyzeDependencies: true,
          detectFrameworks: true,
        }
      );

      expect(response.status).toBe(200);
      assertValidDetectionResponse(response.data);

      expect(response.data.primaryLanguage.language).toBe('go');
      assertLanguageDetected(response.data, 'go', 0.7);
      assertPackageManagerDetected(response.data, 'go-modules');
    });
  });

  describe('POST /api/v1/detect/batch - Batch Detection', () => {
    it('should detect multiple projects in parallel', async () => {
      const projects = [
        path.join(__dirname, '../fixtures/projects/javascript-react'),
        path.join(__dirname, '../fixtures/projects/python-django'),
        path.join(__dirname, '../fixtures/projects/go-project'),
      ];

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect/batch',
        {
          projects: projects.map((p) => ({ projectPath: p })),
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.results).toHaveLength(3);
      expect(response.data.successfulDetections).toBe(3);
      expect(response.data.failedDetections).toBe(0);

      response.data.results.forEach((result: any) => {
        expect(result.success).toBe(true);
        assertValidDetectionResponse(result.data);
      });
    });

    it('should handle mixed valid and invalid projects', async () => {
      const projects = [
        path.join(__dirname, '../fixtures/projects/javascript-react'),
        '/non/existent/path',
        path.join(__dirname, '../fixtures/projects/python-django'),
      ];

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect/batch',
        {
          projects: projects.map((p) => ({ projectPath: p })),
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.results).toHaveLength(3);
      expect(response.data.successfulDetections).toBe(2);
      expect(response.data.failedDetections).toBe(1);
    });

    it('should enforce batch limit of 10 projects', async () => {
      const projects = Array(11).fill(
        path.join(__dirname, '../fixtures/projects/javascript-react')
      );

      const response = await testContext.languageDetectionClient.post(
        '/api/v1/detect/batch',
        {
          projects: projects.map((p) => ({ projectPath: p })),
        }
      );

      expect(response.status).toBe(400);
      expect(response.data.error).toBeDefined();
      expect(response.data.message).toContain('10');
    });
  });

  describe('GET /api/v1/languages - Supported Languages', () => {
    it('should return list of supported languages', async () => {
      const response = await testContext.languageDetectionClient.get(
        '/api/v1/languages'
      );

      expect(response.status).toBe(200);
      assertValidSupportedLanguagesResponse(response.data);

      expect(response.data.languages).toContain('javascript');
      expect(response.data.languages).toContain('python');
      expect(response.data.languages).toContain('java');
      expect(response.data.languages).toContain('go');
      expect(response.data.count).toBeGreaterThanOrEqual(15);
    });
  });

  describe('GET /metrics - Prometheus Metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await testContext.languageDetectionClient.get(
        '/metrics'
      );

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.data).toContain('# HELP');
      expect(response.data).toContain('# TYPE');
    });
  });

  describe('GET /health - Health Check', () => {
    it('should return healthy status', async () => {
      const response = await testContext.languageDetectionClient.get(
        '/health'
      );

      expect(response.status).toBe(200);
      assertValidHealthResponse(response.data);

      expect(response.data.status).toBe('healthy');
      expect(response.data.service).toBeDefined();
    });
  });

  describe('GET /ready - Readiness Probe', () => {
    it('should return ready status', async () => {
      const response = await testContext.languageDetectionClient.get(
        '/ready'
      );

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ready');
    });
  });
});
