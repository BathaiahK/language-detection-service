import * as fs from 'fs/promises';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export class FileTraverser {
  private ig: Ignore;
  private initialized: boolean = false;

  constructor() {
    this.ig = ignore();
  }

  /**
   * Initialize the traverser with ignore rules
   */
  async initialize(
    rootPath: string,
    additionalExcludes?: string[]
  ): Promise<void> {
    // Load .gitignore
    try {
      const gitignorePath = path.join(rootPath, '.gitignore');
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      this.ig.add(gitignoreContent);
    } catch {
      // .gitignore doesn't exist, skip
    }

    // Default ignores (common patterns)
    const defaultIgnores = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'out/**',
      'target/**',
      '.next/**',
      '.nuxt/**',
      'coverage/**',
      '.cache/**',
      '*.min.js',
      '*.min.css',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '*.log',
      '.DS_Store',
      'Thumbs.db',
      '*.pyc',
      '__pycache__/**',
      '*.class',
      '*.jar',
      '*.war',
      '.gradle/**',
      '.mvn/**',
      '*.exe',
      '*.dll',
      '*.so',
      '*.dylib',
    ];

    this.ig.add(defaultIgnores);

    // Add user-specified excludes
    if (additionalExcludes && additionalExcludes.length > 0) {
      this.ig.add(additionalExcludes);
    }

    this.initialized = true;
  }

  /**
   * Traverse directory and yield file paths
   */
  async *traverse(rootPath: string): AsyncGenerator<string> {
    if (!this.initialized) {
      throw new Error('FileTraverser not initialized. Call initialize() first.');
    }

    yield* this.traverseDirectory(rootPath, rootPath);
  }

  private async *traverseDirectory(
    currentPath: string,
    rootPath: string
  ): AsyncGenerator<string> {
    let entries;

    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      // Permission denied or directory doesn't exist
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      // Check if path should be ignored
      if (this.ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively traverse subdirectory
        yield* this.traverseDirectory(fullPath, rootPath);
      } else if (entry.isFile()) {
        // Yield file path
        yield fullPath;
      }
    }
  }

  /**
   * Count total files in directory
   */
  async countFiles(rootPath: string): Promise<number> {
    let count = 0;

    for await (const _ of this.traverse(rootPath)) {
      count++;
    }

    return count;
  }

  /**
   * Get all files as array (use sparingly for large directories)
   */
  async getAllFiles(rootPath: string): Promise<string[]> {
    const files: string[] = [];

    for await (const file of this.traverse(rootPath)) {
      files.push(file);
    }

    return files;
  }

  /**
   * Get files with specific extensions
   */
  async *getFilesByExtension(
    rootPath: string,
    extensions: string[]
  ): AsyncGenerator<string> {
    const lowerExtensions = extensions.map((ext) =>
      ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );

    for await (const file of this.traverse(rootPath)) {
      const ext = path.extname(file).toLowerCase();
      if (lowerExtensions.includes(ext)) {
        yield file;
      }
    }
  }
}
