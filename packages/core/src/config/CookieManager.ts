import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { AIServiceName, ServiceCookies, CookieData } from '../types';
import { ConfigError } from '../errors';

/**
 * Manages authentication cookies for AI services
 */
export class CookieManager {
  private cookiesPath: string;

  constructor(cookiesPath?: string) {
    this.cookiesPath = cookiesPath || path.join(os.homedir(), '.multi-ai-cookies.json');
  }

  /**
   * Get the path to the cookies file
   */
  getCookiesPath(): string {
    return this.cookiesPath;
  }

  /**
   * Load all stored cookies
   */
  async loadAll(): Promise<Record<AIServiceName, ServiceCookies>> {
    try {
      const content = await fs.readFile(this.cookiesPath, 'utf-8');
      return JSON.parse(content) as Record<AIServiceName, ServiceCookies>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Cookies file doesn't exist, return empty object
        return {} as Record<AIServiceName, ServiceCookies>;
      }
      throw new ConfigError(
        `Failed to load cookies from ${this.cookiesPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Save cookies for all services
   */
  async saveAll(cookies: Record<AIServiceName, ServiceCookies>): Promise<void> {
    try {
      const content = JSON.stringify(cookies, null, 2);
      await fs.writeFile(this.cookiesPath, content, 'utf-8');
    } catch (error) {
      throw new ConfigError(
        `Failed to save cookies to ${this.cookiesPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cookies for a specific service
   */
  async getCookies(service: AIServiceName): Promise<ServiceCookies | null> {
    const allCookies = await this.loadAll();
    return allCookies[service] || null;
  }

  /**
   * Save cookies for a specific service
   */
  async saveCookies(service: AIServiceName, serviceCookies: ServiceCookies): Promise<void> {
    const allCookies = await this.loadAll();
    allCookies[service] = {
      ...serviceCookies,
      service,
      lastUpdated: Date.now(),
    };
    await this.saveAll(allCookies);
  }

  /**
   * Delete cookies for a specific service
   */
  async deleteCookies(service: AIServiceName): Promise<void> {
    const allCookies = await this.loadAll();
    delete allCookies[service];
    await this.saveAll(allCookies);
  }

  /**
   * Parse cookies from Netscape cookies.txt format
   * Format: domain, flag, path, secure, expiration, name, value
   */
  parseCookiesTxt(content: string, domain?: string): CookieData[] {
    const lines = content.split('\n');
    const cookies: CookieData[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse Netscape cookies.txt format
      // Format: domain, flag, path, secure, expiration, name, value
      const parts = trimmed.split('\t');
      if (parts.length >= 7) {
        const cookieDomain = parts[0];
        const flag = parts[1] === 'TRUE';
        const cookiePath = parts[2] || '/';
        const secure = parts[3] === 'TRUE';
        const expiration = parseInt(parts[4], 10);
        const name = parts[5];
        const value = parts[6];

        // If domain is specified, filter by it
        if (domain && !cookieDomain.includes(domain)) {
          continue;
        }

        cookies.push({
          name,
          value,
          domain: cookieDomain.startsWith('.') ? cookieDomain.substring(1) : cookieDomain,
          path: cookiePath,
          expires: expiration > 0 ? expiration : undefined,
          httpOnly: flag,
          secure,
          sameSite: secure ? 'None' : 'Lax',
        });
      }
    }

    return cookies;
  }

  /**
   * Parse cookies from JSON format (array of cookie objects)
   */
  parseCookiesJson(content: string): CookieData[] {
    try {
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        return data.map((cookie: any) => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || '/',
          expires: cookie.expires || cookie.expiration,
          httpOnly: cookie.httpOnly || false,
          secure: cookie.secure || false,
          sameSite: cookie.sameSite || (cookie.secure ? 'None' : 'Lax'),
        }));
      }
      
      throw new Error('JSON must be an array of cookie objects');
    } catch (error) {
      throw new ConfigError(
        `Failed to parse cookies JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Import cookies from a file (supports .txt and .json)
   */
  async importFromFile(filePath: string, service: AIServiceName, domain?: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let cookies: CookieData[];

      if (filePath.endsWith('.txt') || filePath.endsWith('.cookies')) {
        cookies = this.parseCookiesTxt(content, domain);
      } else if (filePath.endsWith('.json')) {
        cookies = this.parseCookiesJson(content);
      } else {
        // Try to detect format
        if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
          cookies = this.parseCookiesJson(content);
        } else {
          cookies = this.parseCookiesTxt(content, domain);
        }
      }

      if (cookies.length === 0) {
        throw new ConfigError('No cookies found in file');
      }

      await this.saveCookies(service, {
        service,
        cookies,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError(
        `Failed to import cookies from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if cookies exist for a service
   */
  async hasCookies(service: AIServiceName): Promise<boolean> {
    const cookies = await this.getCookies(service);
    return cookies !== null && cookies.cookies.length > 0;
  }
}
