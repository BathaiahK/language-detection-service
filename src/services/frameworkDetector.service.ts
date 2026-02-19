import { logger } from '../utils/logger';
import { LanguagePatterns } from '../models/languagePatterns';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FrameworkDetector {
  private patterns: LanguagePatterns;

  constructor() {
    this.patterns = new LanguagePatterns();
  }

  async detect(projectPath: string, language: string): Promise<string | null> {
    try {
      const pattern = this.patterns.getPattern(language);
      if (!pattern || !pattern.frameworkIndicators) {
        return null;
      }

      for (const framework of pattern.frameworkIndicators) {
        // Check indicator files
        for (const indicatorFile of framework.indicatorFiles) {
          const filePath = path.join(projectPath, indicatorFile);
          try {
            await fs.access(filePath);
            return framework.name;
          } catch {
            // File doesn't exist
          }
        }

        // Check dependencies (for JS/TS projects)
        if (framework.dependencies) {
          const hasFramework = await this.checkDependencies(
            projectPath,
            framework.dependencies
          );
          if (hasFramework) {
            return framework.name;
          }
        }
      }

      return null;
    } catch (error) {
      logger.warn('Failed to detect framework', {
        projectPath,
        language,
        error,
      });
      return null;
    }
  }

  private async checkDependencies(
    projectPath: string,
    dependencies: string[]
  ): Promise<boolean> {
    const packageJsonPath = path.join(projectPath, 'package.json');

    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      return dependencies.some((dep) => dep in allDeps);
    } catch {
      return false;
    }
  }
}
