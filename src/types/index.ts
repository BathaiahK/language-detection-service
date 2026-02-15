/**
 * Represents information about a detected programming language
 */
export interface LanguageInfo {
  /** Language name (e.g., 'javascript', 'python', 'java') */
  language: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Percentage of files in this language */
  percentage: number;

  /** Number of files detected */
  fileCount: number;

  /** List of file paths */
  files: string[];

  /** Package manager detected (if applicable) */
  packageManager?: string;

  /** Build tool detected (if applicable) */
  buildTool?: string;

  /** Framework detected (if applicable) */
  framework?: string;

  /** Language version (if detectable) */
  version?: string;
}

/**
 * Request to detect languages in a codebase
 */
export interface DetectionRequest {
  /** Path to the codebase (local path or repository URL) */
  projectPath: string;

  /** Optional: Specific paths to analyze */
  includePaths?: string[];

  /** Optional: Paths to exclude */
  excludePaths?: string[];

  /** Optional: Include dependency analysis */
  analyzeDependencies?: boolean;

  /** Optional: Detect frameworks */
  detectFrameworks?: boolean;

  /** Optional: Maximum files to scan */
  maxFiles?: number;
}

/**
 * Response from language detection
 */
export interface DetectionResponse {
  /** Unique request ID */
  requestId: string;

  /** Path that was analyzed */
  projectPath: string;

  /** List of detected languages, sorted by confidence */
  languages: LanguageInfo[];

  /** Primary language (highest confidence) */
  primaryLanguage: LanguageInfo | null;

  /** Total files analyzed */
  totalFiles: number;

  /** Analysis timestamp */
  timestamp: Date;

  /** Time taken for analysis (ms) */
  duration: number;

  /** Metadata about the project */
  metadata: {
    hasGitRepository: boolean;
    hasDependencies: boolean;
    hasTests: boolean;
    hasDocumentation: boolean;
  };
}

/**
 * Language pattern definition
 */
export interface LanguagePattern {
  /** Language identifier */
  language: string;

  /** File extensions */
  extensions: string[];

  /** Package/dependency files */
  packageFiles: string[];

  /** Build tool files */
  buildFiles: string[];

  /** Configuration files */
  configFiles: string[];

  /** Framework indicators */
  frameworkIndicators: FrameworkIndicator[];

  /** File content patterns (for ambiguous cases) */
  contentPatterns?: RegExp[];
}

/**
 * Framework detection indicator
 */
export interface FrameworkIndicator {
  /** Framework name */
  name: string;

  /** Files that indicate this framework */
  indicatorFiles: string[];

  /** Dependencies that indicate this framework */
  dependencies?: string[];

  /** Package.json scripts that indicate this framework */
  scripts?: string[];
}

/**
 * File analysis result
 */
export interface FileAnalysis {
  /** File path */
  path: string;

  /** Detected language */
  language: string | null;

  /** File extension */
  extension: string;

  /** File size in bytes */
  size: number;

  /** Confidence in detection */
  confidence: number;

  /** Whether this is a test file */
  isTest: boolean;

  /** Whether this is a configuration file */
  isConfig: boolean;

  /** Whether this is a build artifact */
  isBuildArtifact: boolean;
}

/**
 * Dependency information
 */
export interface DependencyInfo {
  /** Language/ecosystem */
  language: string;

  /** Package manager used */
  packageManager: string;

  /** Dependencies file path */
  filePath: string;

  /** Total number of dependencies */
  totalDependencies: number;

  /** Production dependencies */
  productionDependencies: number;

  /** Development dependencies */
  devDependencies: number;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Additional details */
  details?: any;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Cache entry for language detection
 */
export interface CachedDetection {
  /** Project path (cache key) */
  projectPath: string;

  /** Detection result */
  result: DetectionResponse;

  /** Cache timestamp */
  cachedAt: Date;

  /** Cache expiry */
  expiresAt: Date;
}
