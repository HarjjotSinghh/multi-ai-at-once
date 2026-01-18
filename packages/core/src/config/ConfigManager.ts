import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { MultiAIConfig } from '../types';
import { ConfigError } from '../errors';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: MultiAIConfig = {
  services: ['chatgpt', 'claude', 'gemini'],
  browser: {
    headless: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    timeout: 30000,
  },
  output: {
    format: 'table',
    includeTimestamp: true,
    includeResponseTime: true,
    maxContentLength: 500,
  },
  responseTimeout: 60000,
  maxConcurrent: 7,
};

/**
 * Manages configuration for the multi-AI platform
 */
export class ConfigManager {
  private configPath: string;
  private config: MultiAIConfig;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.multi-ai-config.json');
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Load configuration from file
   * @returns The loaded configuration
   */
  async load(): Promise<MultiAIConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const loadedConfig = JSON.parse(content) as Partial<MultiAIConfig>;

      // Merge with defaults
      this.config = this.mergeWithDefaults(loadedConfig);
      return this.config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Config file doesn't exist, use defaults
        this.config = { ...DEFAULT_CONFIG };
        await this.save();
        return this.config;
      }
      throw new ConfigError(
        `Failed to load config from ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Save current configuration to file
   */
  async save(): Promise<void> {
    try {
      const content = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, content, 'utf-8');
    } catch (error) {
      throw new ConfigError(
        `Failed to save config to ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the current configuration
   * @returns The current configuration
   */
  get(): MultiAIConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value by path
   * @param path - Dot-notation path to the config value (e.g., 'browser.headless')
   * @returns The config value or undefined if not found
   */
  getPath(path: string): unknown {
    const keys = path.split('.');
    let value: unknown = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Update configuration with new values
   * @param updates - Partial configuration updates to apply
   */
  async update(updates: Partial<MultiAIConfig>): Promise<void> {
    this.config = this.deepMerge(this.config as Record<string, unknown>, updates as Record<string, unknown>) as MultiAIConfig;
    await this.save();
  }

  /**
   * Set a specific configuration value by path
   * @param path - Dot-notation path to the config value (e.g., 'browser.headless')
   * @param value - The value to set
   */
  async setPath(path: string, value: unknown): Promise<void> {
    const keys = path.split('.');
    let current: Record<string, unknown> = { ...this.config };

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;

    // Update the config
    this.config = current as MultiAIConfig;
    await this.save();
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await this.save();
  }

  /**
   * Get the path to the config file
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Check if a config file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Merge loaded config with defaults
   */
  private mergeWithDefaults(loaded: Partial<MultiAIConfig>): MultiAIConfig {
    return this.deepMerge(DEFAULT_CONFIG as Record<string, unknown>, loaded as Record<string, unknown>) as MultiAIConfig;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Partial<Record<string, unknown>>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Partial<Record<string, unknown>>
        );
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }

    return result;
  }
}
