/**
 * Supported AI service names
 */
export type AIServiceName =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'perplexity'
  | 'grok'
  | 'deepseek'
  | 'zai';

/**
 * Result status for individual AI service calls
 */
export type ResponseStatus = 'success' | 'error' | 'timeout';

/**
 * Interface that all AI service adapters must implement
 */
export interface IAIService {
  /**
   * The service name identifier
   */
  readonly serviceName: AIServiceName;

  /**
   * The base URL for the AI service
   */
  readonly baseUrl: string;

  /**
   * Send a prompt to the AI service
   * @param prompt - The prompt text to send
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise resolving to the AI response
   */
  sendPrompt(prompt: string, timeout?: number): Promise<AIResponse>;

  /**
   * Initialize the service (navigate to URL, perform setup)
   */
  initialize(): Promise<void>;

  /**
   * Check if the service is ready to accept prompts
   */
  isReady(): Promise<boolean>;

  /**
   * Clean up resources (close pages, contexts)
   */
  cleanup(): Promise<void>;
}

/**
 * Response from an AI service
 */
export interface AIResponse {
  /**
   * The service that generated this response
   */
  serviceName: AIServiceName;

  /**
   * The response text content
   */
  content: string;

  /**
   * Status of the response
   */
  status: ResponseStatus;

  /**
   * Error message if status is 'error'
   */
  error?: string;

  /**
   * Time taken to get the response in milliseconds
   */
  responseTime: number;

  /**
   * Timestamp when the response was received
   */
  timestamp: Date;
}

/**
 * Configuration for browser automation
 */
export interface BrowserConfig {
  /**
   * Whether to run in headless mode
   * @default false
   */
  headless?: boolean;

  /**
   * Browser viewport width
   * @default 1280
   */
  viewportWidth?: number;

  /**
   * Browser viewport height
   * @default 720
   */
  viewportHeight?: number;

  /**
   * Timeout for page operations in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * User agent string
   */
  userAgent?: string;

  /**
   * Whether to bypass browser's CSP (Content Security Policy)
   * @default false
   */
  bypassCSP?: boolean;
}

/**
 * Configuration for output formatting
 */
export interface OutputConfig {
  /**
   * Output format
   * @default 'table'
   */
  format?: 'table' | 'json' | 'markdown';

  /**
   * Whether to include timestamps
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Whether to include response times
   * @default true
   */
  includeResponseTime?: boolean;

  /**
   * Maximum length for response content (0 for unlimited)
   * @default 500
   */
  maxContentLength?: number;
}

/**
 * Main configuration for the multi-AI platform
 */
export interface MultiAIConfig {
  /**
   * List of AI services to use
   * @default ['chatgpt', 'claude', 'gemini']
   */
  services?: AIServiceName[];

  /**
   * Browser configuration
   */
  browser?: BrowserConfig;

  /**
   * Output configuration
   */
  output?: OutputConfig;

  /**
   * Default timeout for AI responses in milliseconds
   * @default 60000
   */
  responseTimeout?: number;

  /**
   * Maximum concurrent requests
   * @default 7
   */
  maxConcurrent?: number;
}

/**
 * DOM selectors for an AI service
 */
export interface ServiceSelectors {
  /**
   * The main URL for the service
   */
  url: string;

  /**
   * Selector for the textarea/input where prompts are entered
   */
  textareaSelector: string;

  /**
   * Selector for the submit/send button
   */
  submitSelector: string;

  /**
   * Selector for the response container
   */
  responseSelector: string;

  /**
   * Optional selector to check if page is ready
   */
  readySelector?: string;

  /**
   * Optional selector for loading state
   */
  loadingSelector?: string;
}

/**
 * Options for sending a prompt
 */
export interface PromptOptions {
  /**
   * Specific services to use (overrides config)
   */
  services?: AIServiceName[];

  /**
   * Custom timeout for this prompt
   */
  timeout?: number;

  /**
   * Whether to wait for all services before returning
   * @default false
   */
  waitForAll?: boolean;
}

/**
 * Cookie data structure for browser authentication
 */
export interface CookieData {
  /**
   * Cookie name
   */
  name: string;

  /**
   * Cookie value
   */
  value: string;

  /**
   * Domain the cookie belongs to
   */
  domain: string;

  /**
   * Path the cookie is valid for
   */
  path?: string;

  /**
   * Expiration timestamp (Unix time in seconds)
   */
  expires?: number;

  /**
   * Whether cookie is HTTP-only
   */
  httpOnly?: boolean;

  /**
   * Whether cookie is secure (HTTPS only)
   */
  secure?: boolean;

  /**
   * SameSite attribute
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Service-specific authentication cookies
 */
export interface ServiceCookies {
  /**
   * Service name
   */
  service: AIServiceName;

  /**
   * Array of cookies for this service
   */
  cookies: CookieData[];

  /**
   * Optional headers to include with requests
   */
  headers?: Record<string, string>;

  /**
   * Last updated timestamp
   */
  lastUpdated?: number;
}
