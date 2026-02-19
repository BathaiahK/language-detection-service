import { Request, Response, NextFunction } from 'express';
import { LanguageDetector } from '../services/languageDetector.service';
import { DetectionRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import {
  languageDetectionDuration,
  languageDetectionTotal,
} from '../middleware/metrics';
import Joi from 'joi';

export class LanguageDetectionController {
  private languageDetector: LanguageDetector;

  constructor() {
    this.languageDetector = new LanguageDetector();
  }

  /**
   * POST /api/v1/detect
   * Detect languages in a codebase
   */
  async detect(req: Request, res: Response, next: NextFunction): Promise<void> {
    const start = Date.now();

    try {
      // Validate request body
      const schema = Joi.object({
        projectPath: Joi.string().required(),
        includePaths: Joi.array().items(Joi.string()).optional(),
        excludePaths: Joi.array().items(Joi.string()).optional(),
        analyzeDependencies: Joi.boolean().default(false),
        detectFrameworks: Joi.boolean().default(true),
        maxFiles: Joi.number().integer().min(1).max(100000).optional(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        throw new AppError(400, error.details[0].message, 'VALIDATION_ERROR');
      }

      const request = value as DetectionRequest;

      logger.info('Starting language detection', {
        projectPath: request.projectPath,
      });

      // Perform detection
      const result = await this.languageDetector.detect(request);

      // Record metrics
      const duration = (Date.now() - start) / 1000;
      languageDetectionDuration.observe({ success: 'true' }, duration);
      languageDetectionTotal.inc({ success: 'true' });

      logger.info('Language detection completed', {
        requestId: result.requestId,
        primaryLanguage: result.primaryLanguage?.language,
        duration: result.duration,
      });

      res.json(result);
    } catch (err) {
      // Record failure metrics
      const duration = (Date.now() - start) / 1000;
      languageDetectionDuration.observe({ success: 'false' }, duration);
      languageDetectionTotal.inc({ success: 'false' });

      next(err);
    }
  }

  /**
   * GET /api/v1/languages
   * Get list of supported languages
   */
  getSupportedLanguages(
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const patterns = this.languageDetector['patterns'];
      const languages = patterns.getAllLanguages();

      res.json({
        languages: languages.sort(),
        count: languages.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/detect/batch
   * Detect languages for multiple projects
   */
  async detectBatch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        projects: Joi.array()
          .items(
            Joi.object({
              projectPath: Joi.string().required(),
              analyzeDependencies: Joi.boolean().default(false),
              detectFrameworks: Joi.boolean().default(true),
            })
          )
          .min(1)
          .max(10)
          .required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        throw new AppError(400, error.details[0].message, 'VALIDATION_ERROR');
      }

      const { projects } = value as { projects: DetectionRequest[] };

      logger.info('Starting batch language detection', {
        projectCount: projects.length,
      });

      // Process all projects in parallel
      const results = await Promise.allSettled(
        projects.map((project: DetectionRequest) =>
          this.languageDetector.detect(project)
        )
      );

      const successResults = results
        .filter(
          (
            r
          ): r is PromiseFulfilledResult<
            Awaited<ReturnType<typeof this.languageDetector.detect>>
          > => r.status === 'fulfilled'
        )
        .map((r) => r.value);

      const failedResults = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => ({
          error: r.reason?.message || 'Unknown error',
        }));

      res.json({
        success: successResults,
        failed: failedResults,
        total: projects.length,
        successCount: successResults.length,
        failedCount: failedResults.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
