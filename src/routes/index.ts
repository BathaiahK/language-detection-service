import { Router } from 'express';
import { LanguageDetectionController } from '../controllers/languageDetection.controller';
import { metricsHandler } from '../middleware/metrics';

const router = Router();
const languageDetectionController = new LanguageDetectionController();

// Metrics endpoint
router.get('/metrics', metricsHandler);

// Language detection routes
router.post(
  '/detect',
  languageDetectionController.detect.bind(languageDetectionController)
);

router.post(
  '/detect/batch',
  languageDetectionController.detectBatch.bind(languageDetectionController)
);

router.get(
  '/languages',
  languageDetectionController.getSupportedLanguages.bind(
    languageDetectionController
  )
);

export default router;
