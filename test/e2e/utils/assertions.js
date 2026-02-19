"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidDetectionResponse = assertValidDetectionResponse;
exports.assertValidBatchDetectionResponse = assertValidBatchDetectionResponse;
exports.assertValidSupportedLanguagesResponse = assertValidSupportedLanguagesResponse;
exports.assertValidHealthResponse = assertValidHealthResponse;
exports.assertValidErrorResponse = assertValidErrorResponse;
exports.assertLanguageDetected = assertLanguageDetected;
exports.assertFrameworkDetected = assertFrameworkDetected;
exports.assertPackageManagerDetected = assertPackageManagerDetected;
const joi_1 = __importDefault(require("joi"));
/**
 * Joi schema for LanguageInfo
 */
const languageInfoSchema = joi_1.default.object({
    language: joi_1.default.string().required(),
    confidence: joi_1.default.number().min(0).max(1).required(),
    percentage: joi_1.default.number().min(0).max(100).required(),
    fileCount: joi_1.default.number().integer().min(0).required(),
    packageManager: joi_1.default.string().optional().allow(null),
    framework: joi_1.default.string().optional().allow(null),
    version: joi_1.default.string().optional().allow(null),
});
/**
 * Joi schema for DetectionResponse
 */
const detectionResponseSchema = joi_1.default.object({
    requestId: joi_1.default.string().uuid().required(),
    projectPath: joi_1.default.string().required(),
    languages: joi_1.default.array().items(languageInfoSchema).required(),
    primaryLanguage: languageInfoSchema.required(),
    totalFiles: joi_1.default.number().integer().min(0).required(),
    timestamp: joi_1.default.string().isoDate().required(),
    duration: joi_1.default.number().min(0).required(),
    metadata: joi_1.default.object({
        hasGitRepository: joi_1.default.boolean().optional(),
        hasDependencies: joi_1.default.boolean().optional(),
        hasTests: joi_1.default.boolean().optional(),
        hasDocumentation: joi_1.default.boolean().optional(),
        packageManagers: joi_1.default.array().items(joi_1.default.string()).optional(),
        frameworks: joi_1.default.array().items(joi_1.default.string()).optional(),
    }).optional(),
});
/**
 * Joi schema for batch detection response
 */
const batchDetectionResponseSchema = joi_1.default.object({
    requestId: joi_1.default.string().uuid().required(),
    totalProjects: joi_1.default.number().integer().min(0).required(),
    successfulDetections: joi_1.default.number().integer().min(0).required(),
    failedDetections: joi_1.default.number().integer().min(0).required(),
    results: joi_1.default.array()
        .items(joi_1.default.object({
        projectPath: joi_1.default.string().required(),
        success: joi_1.default.boolean().required(),
        data: detectionResponseSchema.optional(),
        error: joi_1.default.string().optional(),
    }))
        .required(),
    duration: joi_1.default.number().min(0).required(),
    timestamp: joi_1.default.string().isoDate().required(),
});
/**
 * Joi schema for supported languages response
 */
const supportedLanguagesSchema = joi_1.default.object({
    languages: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    count: joi_1.default.number().integer().min(1).required(),
});
/**
 * Joi schema for health check response
 */
const healthResponseSchema = joi_1.default.object({
    status: joi_1.default.string().valid('healthy', 'unhealthy').required(),
    service: joi_1.default.string().required(),
    version: joi_1.default.string().optional(),
    uptime: joi_1.default.number().min(0).optional(),
    timestamp: joi_1.default.string().optional(),
});
/**
 * Joi schema for error response
 */
const errorResponseSchema = joi_1.default.object({
    error: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
    statusCode: joi_1.default.number().integer().required(),
    timestamp: joi_1.default.string().optional(),
    requestId: joi_1.default.string().optional(),
});
/**
 * Assert that a response is a valid detection response
 */
function assertValidDetectionResponse(response) {
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
function assertValidBatchDetectionResponse(response) {
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
function assertValidSupportedLanguagesResponse(response) {
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
function assertValidHealthResponse(response) {
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
function assertValidErrorResponse(response) {
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
function assertLanguageDetected(response, language, minConfidence = 0.5) {
    const detected = response.languages.find((l) => l.language === language);
    expect(detected).toBeDefined();
    expect(detected.confidence).toBeGreaterThanOrEqual(minConfidence);
}
/**
 * Assert that a framework was detected
 */
function assertFrameworkDetected(response, framework) {
    const detected = response.languages.some((l) => l.framework === framework);
    expect(detected).toBe(true);
}
/**
 * Assert that a package manager was detected
 */
function assertPackageManagerDetected(response, packageManager) {
    const detected = response.languages.some((l) => l.packageManager === packageManager);
    expect(detected).toBe(true);
}
//# sourceMappingURL=assertions.js.map