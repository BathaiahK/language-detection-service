/**
 * Assert that a response is a valid detection response
 */
export declare function assertValidDetectionResponse(response: any): void;
/**
 * Assert that a response is a valid batch detection response
 */
export declare function assertValidBatchDetectionResponse(response: any): void;
/**
 * Assert that a response is a valid supported languages response
 */
export declare function assertValidSupportedLanguagesResponse(response: any): void;
/**
 * Assert that a response is a valid health check response
 */
export declare function assertValidHealthResponse(response: any): void;
/**
 * Assert that a response is a valid error response
 */
export declare function assertValidErrorResponse(response: any): void;
/**
 * Assert that a language was detected with minimum confidence
 */
export declare function assertLanguageDetected(response: any, language: string, minConfidence?: number): void;
/**
 * Assert that a framework was detected
 */
export declare function assertFrameworkDetected(response: any, framework: string): void;
/**
 * Assert that a package manager was detected
 */
export declare function assertPackageManagerDetected(response: any, packageManager: string): void;
//# sourceMappingURL=assertions.d.ts.map