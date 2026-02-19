import { LanguagePattern } from '../types';

export class LanguagePatterns {
  private patterns: Map<string, LanguagePattern>;
  private extensionMap: Map<string, string>;
  private filenameMap: Map<string, string>;

  constructor() {
    this.patterns = new Map();
    this.extensionMap = new Map();
    this.filenameMap = new Map();
    this.initializePatterns();
    this.buildMaps();
  }

  private initializePatterns(): void {
    const patterns: LanguagePattern[] = [
      // JavaScript / TypeScript
      {
        language: 'javascript',
        extensions: ['.js', '.jsx', '.mjs', '.cjs'],
        packageFiles: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
        buildFiles: ['webpack.config.js', 'rollup.config.js', 'vite.config.js'],
        configFiles: ['.eslintrc.js', '.prettierrc.js', 'tsconfig.json'],
        frameworkIndicators: [
          {
            name: 'React',
            indicatorFiles: [],
            dependencies: ['react', 'react-dom'],
          },
          {
            name: 'Vue',
            indicatorFiles: ['vue.config.js'],
            dependencies: ['vue'],
          },
          {
            name: 'Angular',
            indicatorFiles: ['angular.json'],
            dependencies: ['@angular/core'],
          },
          {
            name: 'Next.js',
            indicatorFiles: ['next.config.js'],
            dependencies: ['next'],
          },
          {
            name: 'Express',
            indicatorFiles: [],
            dependencies: ['express'],
          },
          {
            name: 'Nest.js',
            indicatorFiles: ['nest-cli.json'],
            dependencies: ['@nestjs/core'],
          },
        ],
        contentPatterns: [
          /import .+ from ['"]react['"]/,
          /require\(['"]express['"]\)/,
        ],
      },
      {
        language: 'typescript',
        extensions: ['.ts', '.tsx'],
        packageFiles: ['package.json', 'tsconfig.json'],
        buildFiles: ['webpack.config.ts', 'vite.config.ts'],
        configFiles: ['tsconfig.json', 'tsconfig.build.json'],
        frameworkIndicators: [
          {
            name: 'React',
            indicatorFiles: [],
            dependencies: ['react', '@types/react'],
          },
          {
            name: 'Next.js',
            indicatorFiles: ['next.config.ts'],
            dependencies: ['next'],
          },
          {
            name: 'Nest.js',
            indicatorFiles: ['nest-cli.json'],
            dependencies: ['@nestjs/core'],
          },
        ],
        contentPatterns: [/interface \w+/, /type \w+ =/],
      },

      // Python
      {
        language: 'python',
        extensions: ['.py', '.pyw', '.pyx'],
        packageFiles: ['requirements.txt', 'Pipfile', 'setup.py', 'pyproject.toml', 'poetry.lock'],
        buildFiles: ['setup.py', 'pyproject.toml'],
        configFiles: ['setup.cfg', 'pytest.ini', 'mypy.ini'],
        frameworkIndicators: [
          {
            name: 'Django',
            indicatorFiles: ['manage.py'],
            dependencies: ['django'],
          },
          {
            name: 'Flask',
            indicatorFiles: [],
            dependencies: ['flask'],
          },
          {
            name: 'FastAPI',
            indicatorFiles: [],
            dependencies: ['fastapi'],
          },
          {
            name: 'Pandas',
            indicatorFiles: [],
            dependencies: ['pandas'],
          },
        ],
        contentPatterns: [/import \w+/, /from \w+ import/, /def \w+\(/],
      },

      // Java
      {
        language: 'java',
        extensions: ['.java'],
        packageFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
        buildFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
        configFiles: ['application.properties', 'application.yml'],
        frameworkIndicators: [
          {
            name: 'Spring Boot',
            indicatorFiles: ['application.properties'],
            dependencies: ['org.springframework.boot'],
          },
          {
            name: 'Hibernate',
            indicatorFiles: [],
            dependencies: ['org.hibernate'],
          },
        ],
        contentPatterns: [/public class \w+/, /package \w+;/],
      },

      // Go
      {
        language: 'go',
        extensions: ['.go'],
        packageFiles: ['go.mod', 'go.sum'],
        buildFiles: ['Makefile'],
        configFiles: ['go.mod'],
        frameworkIndicators: [
          {
            name: 'Gin',
            indicatorFiles: [],
            dependencies: ['github.com/gin-gonic/gin'],
          },
          {
            name: 'Echo',
            indicatorFiles: [],
            dependencies: ['github.com/labstack/echo'],
          },
        ],
        contentPatterns: [/package \w+/, /func \w+\(/],
      },

      // Ruby
      {
        language: 'ruby',
        extensions: ['.rb', '.rake'],
        packageFiles: ['Gemfile', 'Gemfile.lock', '*.gemspec'],
        buildFiles: ['Rakefile'],
        configFiles: ['config.ru'],
        frameworkIndicators: [
          {
            name: 'Rails',
            indicatorFiles: ['config/routes.rb'],
            dependencies: ['rails'],
          },
          {
            name: 'Sinatra',
            indicatorFiles: [],
            dependencies: ['sinatra'],
          },
        ],
        contentPatterns: [/class \w+ < \w+/, /def \w+/],
      },

      // PHP
      {
        language: 'php',
        extensions: ['.php'],
        packageFiles: ['composer.json', 'composer.lock'],
        buildFiles: [],
        configFiles: ['php.ini'],
        frameworkIndicators: [
          {
            name: 'Laravel',
            indicatorFiles: ['artisan'],
            dependencies: ['laravel/framework'],
          },
          {
            name: 'Symfony',
            indicatorFiles: ['symfony.lock'],
            dependencies: ['symfony/symfony'],
          },
        ],
        contentPatterns: [/<\?php/, /namespace \w+;/],
      },

      // C#
      {
        language: 'csharp',
        extensions: ['.cs'],
        packageFiles: ['*.csproj', '*.sln', 'packages.config'],
        buildFiles: ['*.csproj', '*.sln'],
        configFiles: ['app.config', 'web.config'],
        frameworkIndicators: [
          {
            name: 'ASP.NET Core',
            indicatorFiles: ['Program.cs', 'Startup.cs'],
          },
          {
            name: '.NET',
            indicatorFiles: [],
          },
        ],
        contentPatterns: [/namespace \w+/, /class \w+/],
      },

      // Rust
      {
        language: 'rust',
        extensions: ['.rs'],
        packageFiles: ['Cargo.toml', 'Cargo.lock'],
        buildFiles: ['Cargo.toml'],
        configFiles: [],
        frameworkIndicators: [],
        contentPatterns: [/fn \w+\(/, /use \w+::/],
      },

      // Kotlin
      {
        language: 'kotlin',
        extensions: ['.kt', '.kts'],
        packageFiles: ['build.gradle.kts'],
        buildFiles: ['build.gradle.kts'],
        configFiles: [],
        frameworkIndicators: [],
        contentPatterns: [/fun \w+\(/, /class \w+/],
      },

      // Swift
      {
        language: 'swift',
        extensions: ['.swift'],
        packageFiles: ['Package.swift'],
        buildFiles: ['Package.swift'],
        configFiles: [],
        frameworkIndicators: [],
        contentPatterns: [/func \w+\(/, /class \w+/],
      },

      // Shell
      {
        language: 'shell',
        extensions: ['.sh', '.bash', '.zsh'],
        packageFiles: [],
        buildFiles: ['Makefile'],
        configFiles: [],
        frameworkIndicators: [],
        contentPatterns: [/^#!\/bin\/(ba)?sh/],
      },

      // YAML / Configuration
      {
        language: 'yaml',
        extensions: ['.yml', '.yaml'],
        packageFiles: [],
        buildFiles: [],
        configFiles: [],
        frameworkIndicators: [],
      },

      // JSON
      {
        language: 'json',
        extensions: ['.json'],
        packageFiles: [],
        buildFiles: [],
        configFiles: [],
        frameworkIndicators: [],
      },

      // Docker
      {
        language: 'dockerfile',
        extensions: [],
        packageFiles: ['Dockerfile', 'docker-compose.yml'],
        buildFiles: [],
        configFiles: [],
        frameworkIndicators: [],
      },
    ];

    patterns.forEach((pattern) => {
      this.patterns.set(pattern.language, pattern);
    });
  }

  private buildMaps(): void {
    this.patterns.forEach((pattern, language) => {
      // Build extension map
      pattern.extensions.forEach((ext) => {
        this.extensionMap.set(ext.toLowerCase(), language);
      });

      // Build filename map
      pattern.packageFiles.forEach((file) => {
        if (!file.includes('*')) {
          this.filenameMap.set(file.toLowerCase(), language);
        }
      });

      pattern.buildFiles.forEach((file) => {
        if (!file.includes('*')) {
          this.filenameMap.set(file.toLowerCase(), language);
        }
      });
    });
  }

  getLanguageByExtension(extension: string): string | null {
    return this.extensionMap.get(extension.toLowerCase()) || null;
  }

  getLanguageByFilename(filename: string): string | null {
    return this.filenameMap.get(filename.toLowerCase()) || null;
  }

  getPattern(language: string): LanguagePattern | undefined {
    return this.patterns.get(language);
  }

  detectByContentPatterns(content: string): string | null {
    for (const [language, pattern] of this.patterns.entries()) {
      if (!pattern.contentPatterns) continue;

      for (const regex of pattern.contentPatterns) {
        if (regex.test(content)) {
          return language;
        }
      }
    }

    return null;
  }

  getPackageManager(language: string, packageFile: string): string | undefined {
    const managers: Record<string, Record<string, string>> = {
      javascript: {
        'package.json': 'npm',
        'yarn.lock': 'yarn',
        'pnpm-lock.yaml': 'pnpm',
      },
      typescript: {
        'package.json': 'npm',
        'yarn.lock': 'yarn',
        'pnpm-lock.yaml': 'pnpm',
      },
      python: {
        'requirements.txt': 'pip',
        Pipfile: 'pipenv',
        'pyproject.toml': 'poetry',
      },
      java: {
        'pom.xml': 'maven',
        'build.gradle': 'gradle',
      },
      go: {
        'go.mod': 'go-modules',
      },
      ruby: {
        Gemfile: 'bundler',
      },
      php: {
        'composer.json': 'composer',
      },
      rust: {
        'Cargo.toml': 'cargo',
      },
    };

    return managers[language]?.[packageFile];
  }

  getBuildTool(language: string, buildFile: string): string | undefined {
    const tools: Record<string, Record<string, string>> = {
      javascript: {
        'webpack.config.js': 'webpack',
        'rollup.config.js': 'rollup',
        'vite.config.js': 'vite',
      },
      typescript: {
        'webpack.config.ts': 'webpack',
        'vite.config.ts': 'vite',
      },
      java: {
        'pom.xml': 'maven',
        'build.gradle': 'gradle',
      },
      python: {
        'setup.py': 'setuptools',
        'pyproject.toml': 'poetry',
      },
    };

    return tools[language]?.[buildFile];
  }

  getAllLanguages(): string[] {
    return Array.from(this.patterns.keys());
  }

  getAllPatterns(): LanguagePattern[] {
    return Array.from(this.patterns.values());
  }
}
