import { DependencyInfo } from '../types';
import { logger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DependencyAnalyzer {
  async analyze(
    projectPath: string,
    language: string,
    packageManager: string
  ): Promise<DependencyInfo | null> {
    try {
      switch (language) {
        case 'javascript':
        case 'typescript':
          return await this.analyzeNpmPackage(projectPath, packageManager);

        case 'python':
          return await this.analyzePythonPackage(projectPath, packageManager);

        case 'java':
          return await this.analyzeJavaPackage(projectPath, packageManager);

        case 'go':
          return await this.analyzeGoPackage(projectPath);

        default:
          return null;
      }
    } catch (error) {
      logger.warn('Failed to analyze dependencies', {
        projectPath,
        language,
        error,
      });
      return null;
    }
  }

  private async analyzeNpmPackage(
    projectPath: string,
    packageManager: string
  ): Promise<DependencyInfo | null> {
    const packageJsonPath = path.join(projectPath, 'package.json');

    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const prodDeps = Object.keys(packageJson.dependencies || {}).length;
      const devDeps = Object.keys(packageJson.devDependencies || {}).length;

      return {
        language: 'javascript',
        packageManager,
        filePath: 'package.json',
        totalDependencies: prodDeps + devDeps,
        productionDependencies: prodDeps,
        devDependencies: devDeps,
      };
    } catch {
      return null;
    }
  }

  private async analyzePythonPackage(
    projectPath: string,
    packageManager: string
  ): Promise<DependencyInfo | null> {
    // Try requirements.txt first
    const requirementsPath = path.join(projectPath, 'requirements.txt');

    try {
      const content = await fs.readFile(requirementsPath, 'utf-8');
      const deps = content
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'));

      return {
        language: 'python',
        packageManager,
        filePath: 'requirements.txt',
        totalDependencies: deps.length,
        productionDependencies: deps.length,
        devDependencies: 0,
      };
    } catch {
      return null;
    }
  }

  private async analyzeJavaPackage(
    projectPath: string,
    packageManager: string
  ): Promise<DependencyInfo | null> {
    if (packageManager === 'maven') {
      const pomPath = path.join(projectPath, 'pom.xml');
      // Basic counting - would need XML parsing for accurate count
      try {
        const content = await fs.readFile(pomPath, 'utf-8');
        const depCount = (content.match(/<dependency>/g) || []).length;

        return {
          language: 'java',
          packageManager: 'maven',
          filePath: 'pom.xml',
          totalDependencies: depCount,
          productionDependencies: depCount,
          devDependencies: 0,
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  private async analyzeGoPackage(
    projectPath: string
  ): Promise<DependencyInfo | null> {
    const goModPath = path.join(projectPath, 'go.mod');

    try {
      const content = await fs.readFile(goModPath, 'utf-8');
      const deps = content.match(/^\s+[\w\/.-]+\s+v[\d.]+/gm) || [];

      return {
        language: 'go',
        packageManager: 'go-modules',
        filePath: 'go.mod',
        totalDependencies: deps.length,
        productionDependencies: deps.length,
        devDependencies: 0,
      };
    } catch {
      return null;
    }
  }
}
