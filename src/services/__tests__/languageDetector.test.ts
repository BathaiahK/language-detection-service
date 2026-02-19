import { LanguageDetector } from '../languageDetector.service';

describe('LanguageDetector', () => {
  let detector: LanguageDetector;

  beforeEach(() => {
    detector = new LanguageDetector();
  });

  describe('detect', () => {
    it('should be defined', () => {
      expect(detector).toBeDefined();
      expect(detector.detect).toBeDefined();
    });

    // Add more tests here as you develop
  });
});
