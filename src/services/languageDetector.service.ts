import * as fs from 'fs/promises';
import * as path from 'path';
import {
  LanguageInfo,
  DetectionRequest,
  DetectionResponse,
  FileAnalysis,
} from '../types';
import { FileTraverser } from '../utils/fileTraverser';
import { LanguagePatterns } from '../models/languagePatterns';
import { DependencyAnalyzer } from './dependencyAnalyzer.service';
import { FrameworkDetector } from './frameworkDetector.service';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

export class LanguageDetector {
  private fileTraverser: FileTraverser;
  private patterns: LanguagePatterns;
  private dependencyAnalyzer: DependencyAnalyzer;
  private frameworkDetector: FrameworkDetector;

  constructor() {
    this.fileTraverser = new FileTraverser();
    this.patterns = new LanguagePatterns();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.frameworkDetector = new FrameworkDetector();
  }

  /**
   * Detect languages in a codebase
   */
  async detect(request: DetectionRequest): Promise<DetectionResponse> {
    const startTime = Date.now();
    const requestId = randomUUID();

    logger.info('Starting language detection', {
      requestId,
      projectPath: request.projectPath,
    });

    try {
      // Initialize file traverser
      await this.fileTraverser.initialize(
        request.projectPath,
        request.excludePaths
      );

      // Analyze all files
      const fileAnalyses = await this.analyzeFiles(
        request.projectPath,
        request.maxFiles
      );

      logger.info('File analysis complete', {
        requestId,
        filesAnalyzed: fileAnalyses.length,
      });

      // Aggregate language statistics
      const languages = this.aggregateLanguages(fileAnalyses);

      // Detect package managers and build tools
      await this.enrichWithToolDetection(request.projectPath, languages);

      // Detect frameworks (if requested)
      if (request.detectFrameworks) {
        await this.enrichWithFrameworks(request.projectPath, languages);
      }

      // Analyze dependencies (if requested)
      if (request.analyzeDependencies) {
        await this.enrichWithDependencies(request.projectPath, languages);
      }

      // Sort by confidence
      languages.sort((a, b) => b.confidence - a.confidence);

      // Calculate metadata
      const metadata = await this.calculateMetadata(request.projectPath);

      const response: DetectionResponse = {
        requestId,
        projectPath: request.projectPath,
        languages,
        primaryLanguage: languages.length > 0 ? languages[0] : null,
        totalFiles: fileAnalyses.length,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        metadata,
      };

      logger.info('Language detection complete', {
        requestId,
        primaryLanguage: response.primaryLanguage?.language,
        languagesDetected: languages.length,
        duration: response.duration,
      });

      return response;
    } catch (error) {
      logger.error('Language detection failed', {
        requestId,
        error,
        projectPath: request.projectPath,
      });
      throw error;
    }
  }

  /**
   * Analyze all files in the project
   */
  private async analyzeFiles(
    projectPath: string,
    maxFiles?: number
  ): Promise<FileAnalysis[]> {
    const analyses: FileAnalysis[] = [];
    let fileCount = 0;

    for await (const filePath of this.fileTraverser.traverse(projectPath)) {
      if (maxFiles && fileCount >= maxFiles) {
        logger.warn('Reached max files limit', { maxFiles });
        break;
      }

      try {
        const analysis = await this.analyzeFile(filePath);
        if (analysis.language) {
          analyses.push(analysis);
          fileCount++;
        }
      } catch (error) {
        logger.warn('Failed to analyze file', { filePath, error });
      }
    }

    return analyses;
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    const stats = await fs.stat(filePath);

    // Detect language by extension
    let language = this.patterns.getLanguageByExtension(ext);
    let confidence = language ? 0.8 : 0.0;

    // Check if it's a special file (package.json, etc.)
    if (!language) {
      language = this.patterns.getLanguageByFilename(basename);
      confidence = language ? 0.9 : 0.0;
    }

    // For ambiguous cases, analyze content
    if (!language || confidence < 0.7) {
      const contentLanguage = await this.detectLanguageByContent(filePath);
      if (contentLanguage) {
        language = contentLanguage;
        confidence = 0.7;
      }
    }

    return {
      path: filePath,
      language,
      extension: ext,
      size: stats.size,
      confidence,
      isTest: this.isTestFile(filePath),
      isConfig: this.isConfigFile(filePath),
      isBuildArtifact: this.isBuildArtifact(filePath),
    };
  }

  /**
   * Detect language by analyzing file content
   */
  private async detectLanguageByContent(
    filePath: string
  ): Promise<string | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const firstLine = content.split('\n')[0];

      // Check shebang
      if (firstLine.startsWith('#!')) {
        if (firstLine.includes('python')) return 'python';
        if (firstLine.includes('node')) return 'javascript';
        if (firstLine.includes('ruby')) return 'ruby';
        if (firstLine.includes('bash') || firstLine.includes('sh'))
          return 'shell';
      }

      // Check content patterns
      return this.patterns.detectByContentPatterns(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Aggregate file analyses into language statistics
   */
  private aggregateLanguages(analyses: FileAnalysis[]): LanguageInfo[] {
    const languageMap = new Map<string, LanguageInfo>();

    // Filter out test files, config files, and build artifacts
    const productionFiles = analyses.filter(
      (a) => !a.isTest && !a.isConfig && !a.isBuildArtifact && a.language
    );

    const totalFiles = productionFiles.length;

    productionFiles.forEach((analysis) => {
      const lang = analysis.language!;

      if (!languageMap.has(lang)) {
        languageMap.set(lang, {
          language: lang,
          confidence: 0,
          percentage: 0,
          fileCount: 0,
          files: [],
        });
      }

      const langInfo = languageMap.get(lang)!;
      langInfo.fileCount++;
      langInfo.files.push(analysis.path);
      langInfo.confidence = Math.max(langInfo.confidence, analysis.confidence);
    });

    // Calculate percentages
    languageMap.forEach((langInfo) => {
      langInfo.percentage = (langInfo.fileCount / totalFiles) * 100;
      // Adjust confidence based on percentage
      langInfo.confidence = Math.min(
        1.0,
        langInfo.confidence + langInfo.percentage / 200
      );
    });

    return Array.from(languageMap.values());
  }

  /**
   * Enrich with package manager and build tool detection
   */
  private async enrichWithToolDetection(
    projectPath: string,
    languages: LanguageInfo[]
  ): Promise<void> {
    for (const langInfo of languages) {
      const pattern = this.patterns.getPattern(langInfo.language);
      if (!pattern) continue;

      // Detect package manager
      for (const packageFile of pattern.packageFiles) {
        const packagePath = path.join(projectPath, packageFile);
        try {
          await fs.access(packagePath);
          langInfo.packageManager = this.patterns.getPackageManager(
            langInfo.language,
            packageFile
          );
          break;
        } catch {
          // File doesn't exist
        }
      }

      // Detect build tool
      for (const buildFile of pattern.buildFiles) {
        const buildPath = path.join(projectPath, buildFile);
        try {
          await fs.access(buildPath);
          langInfo.buildTool = this.patterns.getBuildTool(
            langInfo.language,
            buildFile
          );
          break;
        } catch {
          // File doesn't exist
        }
      }
    }
  }

  /**
   * Enrich with framework detection
   */
  private async enrichWithFrameworks(
    projectPath: string,
    languages: LanguageInfo[]
  ): Promise<void> {
    for (const langInfo of languages) {
      const framework = await this.frameworkDetector.detect(
        projectPath,
        langInfo.language
      );
      if (framework) {
        langInfo.framework = framework;
      }
    }
  }

  /**
   * Enrich with dependency analysis
   */
  private async enrichWithDependencies(
    projectPath: string,
    languages: LanguageInfo[]
  ): Promise<void> {
    for (const langInfo of languages) {
      if (!langInfo.packageManager) continue;

      const depInfo = await this.dependencyAnalyzer.analyze(
        projectPath,
        langInfo.language,
        langInfo.packageManager
      );

      if (depInfo) {
        // Store additional dependency info in a metadata field
        Object.assign(langInfo, { dependencyInfo: depInfo });
      }
    }
  }

  /**
   * Calculate project metadata
   */
  private async calculateMetadata(
    projectPath: string
  ): Promise<DetectionResponse['metadata']> {
    const hasGit = await this.fileExists(path.join(projectPath, '.git'));
    const hasTests = await this.hasTestFiles(projectPath);
    const hasDocs = await this.hasDocumentation(projectPath);
    const hasDeps = await this.hasDependencyFiles(projectPath);

    return {
      hasGitRepository: hasGit,
      hasDependencies: hasDeps,
      hasTests,
      hasDocumentation: hasDocs,
    };
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async hasTestFiles(projectPath: string): Promise<boolean> {
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    for (const dir of testDirs) {
      if (await this.fileExists(path.join(projectPath, dir))) {
        return true;
      }
    }
    return false;
  }

  private async hasDocumentation(projectPath: string): Promise<boolean> {
    const docFiles = ['README.md', 'README.txt', 'docs'];
    for (const file of docFiles) {
      if (await this.fileExists(path.join(projectPath, file))) {
        return true;
      }
    }
    return false;
  }

  private async hasDependencyFiles(projectPath: string): Promise<boolean> {
    const depFiles = [
      'package.json',
      'requirements.txt',
      'pom.xml',
      'build.gradle',
      'go.mod',
      'Gemfile',
      'composer.json',
      'Cargo.toml',
    ];

    for (const file of depFiles) {
      if (await this.fileExists(path.join(projectPath, file))) {
        return true;
      }
    }
    return false;
  }

  private isTestFile(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase();
    return (
      lowerPath.includes('/test/') ||
      lowerPath.includes('/tests/') ||
      lowerPath.includes('/__tests__/') ||
      lowerPath.includes('/spec/') ||
      lowerPath.endsWith('.test.js') ||
      lowerPath.endsWith('.test.ts') ||
      lowerPath.endsWith('.spec.js') ||
      lowerPath.endsWith('.spec.ts') ||
      lowerPath.endsWith('_test.py') ||
      lowerPath.endsWith('_test.go')
    );
  }

  private isConfigFile(filePath: string): boolean {
    const basename = path.basename(filePath).toLowerCase();
    const configFiles = [
      '.gitignore',
      '.eslintrc',
      '.prettierrc',
      'tsconfig.json',
      'jest.config.js',
      'webpack.config.js',
      '.env',
      'package.json',
      'package-lock.json',
    ];
    return configFiles.some((cf) => basename.includes(cf));
  }

  private isBuildArtifact(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase();
    return (
      lowerPath.includes('/dist/') ||
      lowerPath.includes('/build/') ||
      lowerPath.includes('/node_modules/') ||
      lowerPath.includes('/.next/') ||
      lowerPath.includes('/target/') ||
      lowerPath.includes('/out/')
    );
  }
}
