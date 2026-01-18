/**
 * Base error class for all multi-ai errors
 */
export class MultiAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MultiAIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when browser initialization fails
 */
export class BrowserInitializationError extends MultiAIError {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserInitializationError';
  }
}

/**
 * Error thrown when a page operation fails
 */
export class PageOperationError extends MultiAIError {
  constructor(message: string, public readonly serviceName?: string) {
    super(message);
    this.name = 'PageOperationError';
  }
}

/**
 * Error thrown when an element cannot be found
 */
export class ElementNotFoundError extends PageOperationError {
  constructor(selector: string, serviceName?: string) {
    super(`Element not found: ${selector}`, serviceName);
    this.name = 'ElementNotFoundError';
  }
}

/**
 * Error thrown when a service times out
 */
export class ServiceTimeoutError extends MultiAIError {
  constructor(serviceName: string, timeout: number) {
    super(`Service "${serviceName}" timed out after ${timeout}ms`);
    this.name = 'ServiceTimeoutError';
  }
}

/**
 * Error thrown when response extraction fails
 */
export class ResponseExtractionError extends PageOperationError {
  constructor(serviceName: string, message: string) {
    super(`Failed to extract response from ${serviceName}: ${message}`, serviceName);
    this.name = 'ResponseExtractionError';
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigError extends MultiAIError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Error thrown when a service is not configured
 */
export class ServiceNotConfiguredError extends MultiAIError {
  constructor(serviceName: string) {
    super(`Service "${serviceName}" is not configured`);
    this.name = 'ServiceNotConfiguredError';
  }
}
