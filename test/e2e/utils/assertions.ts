import Joi from 'joi';

/**
 * Joi schema for LanguageInfo
 */
const languageInfoSchema = Joi.object({
  language: Joi.string().required(),
  confidence: Joi.number().min(0).max(1).required(),
  percentage: Joi.number().min(0).max(100).required(),
  fileCount: Joi.number().integer().min(0).required(),
  packageManager: Joi.string().optional().allow(null),
  framework: Joi.string().optional().allow(null),
  version: Joi.string().optional().allow(null),
});

/**
 * Joi schema for DetectionResponse
 */
const detectionResponseSchema = Joi.object({
  requestId: Joi.string().uuid().required(),
  projectPath: Joi.string().required(),
  languages: Joi.array().items(languageInfoSchema).required(),
  primaryLanguage: languageInfoSchema.required(),
  totalFiles: Joi.number().integer().min(0).required(),
  timestamp: Joi.string().isoDate().required(),
  duration: Joi.number().min(0).required(),
  metadata: Joi.object({
    hasGitRepository: Joi.boolean().optional(),
    hasDependencies: Joi.boolean().optional(),
    hasTests: Joi.boolean().optional(),
    hasDocumentation: Joi.boolean().optional(),
    packageManagers: Joi.array().items(Joi.string()).optional(),
    frameworks: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});

/**
 * Joi schema for batch detection response
 */
const batchDetectionResponseSchema = Joi.object({
  requestId: Joi.string().uuid().required(),
  totalProjects: Joi.number().integer().min(0).required(),
  successfulDetections: Joi.number().integer().min(0).required(),
  failedDetections: Joi.number().integer().min(0).required(),
  results: Joi.array()
    .items(
      Joi.object({
        projectPath: Joi.string().required(),
        success: Joi.boolean().required(),
        data: detectionResponseSchema.optional(),
        error: Joi.string().optional(),
      })
    )
    .required(),
  duration: Joi.number().min(0).required(),
  timestamp: Joi.string().isoDate().required(),
});

/**
 * Joi schema for supported languages response
 */
const supportedLanguagesSchema = Joi.object({
  languages: Joi.array().items(Joi.string()).min(1).required(),
  count: Joi.number().integer().min(1).required(),
});

/**
 * Joi schema for health check response
 */
const healthResponseSchema = Joi.object({
  status: Joi.string().valid('healthy', 'unhealthy').required(),
  service: Joi.string().required(),
  version: Joi.string().optional(),
  uptime: Joi.number().min(0).optional(),
  timestamp: Joi.string().optional(),
});

/**
 * Joi schema for error response
 */
const errorResponseSchema = Joi.object({
  error: Joi.string().required(),
  message: Joi.string().required(),
  statusCode: Joi.number().integer().required(),
  timestamp: Joi.string().optional(),
  requestId: Joi.string().optional(),
});

/**
 * Assert that a response is a valid detection response
 */
export function assertValidDetectionResponse(response: any): void {
  const { error, value } = detectionResponseSchema.validate(response, {
    abortEarly: false,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new Error(`Invalid detection response: ${details}`);
  }

  expect(response).toMatchObject(value);
}

/**
 * Assert that a response is a valid batch detection response
 */
export function assertValidBatchDetectionResponse(response: any): void {
  const { error, value } = batchDetectionResponseSchema.validate(response, {
    abortEarly: false,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new Error(`Invalid batch detection response: ${details}`);
  }

  expect(response).toMatchObject(value);
}

/**
 * Assert that a response is a valid supported languages response
 */
export function assertValidSupportedLanguagesResponse(response: any): void {
  const { error, value } = supportedLanguagesSchema.validate(response, {
    abortEarly: false,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new Error(`Invalid supported languages response: ${details}`);
  }

  expect(response).toMatchObject(value);
}

/**
 * Assert that a response is a valid health check response
 */
export function assertValidHealthResponse(response: any): void {
  const { error, value } = healthResponseSchema.validate(response, {
    abortEarly: false,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new Error(`Invalid health response: ${details}`);
  }

  expect(response).toMatchObject(value);
}

/**
 * Assert that a response is a valid error response
 */
export function assertValidErrorResponse(response: any): void {
  const { error, value } = errorResponseSchema.validate(response, {
    abortEarly: false,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new Error(`Invalid error response: ${details}`);
  }

  expect(response).toMatchObject(value);
}

/**
 * Assert that a language was detected with minimum confidence
 */
export function assertLanguageDetected(
  response: any,
  language: string,
  minConfidence: number = 0.5
): void {
  const detected = response.languages.find(
    (l: any) => l.language === language
  );

  expect(detected).toBeDefined();
  expect(detected.confidence).toBeGreaterThanOrEqual(minConfidence);
}

/**
 * Assert that a framework was detected
 */
export function assertFrameworkDetected(
  response: any,
  framework: string
): void {
  const detected = response.languages.some(
    (l: any) => l.framework === framework
  );

  expect(detected).toBe(true);
}

/**
 * Assert that a package manager was detected
 */
export function assertPackageManagerDetected(
  response: any,
  packageManager: string
): void {
  const detected = response.languages.some(
    (l: any) => l.packageManager === packageManager
  );

  expect(detected).toBe(true);
}
