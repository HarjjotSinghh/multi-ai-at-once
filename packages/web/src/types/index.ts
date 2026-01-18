import { AIResponse, AIServiceName } from '@multi-ai/core';

/**
 * Result of sending a prompt to multiple services
 */
export interface SendPromptResult {
  /** Unique ID for this request */
  id: string;
  /** Responses from all services */
  responses: AIResponse[];
  /** Timestamp when request was sent */
  timestamp: Date;
}

/**
 * Stream event types for SSE
 */
export type StreamEventType =
  | 'init'
  | 'progress'
  | 'response'
  | 'error'
  | 'complete';

/**
 * Server-sent event data
 */
export interface StreamEvent {
  type: StreamEventType;
  requestId: string;
  service?: AIServiceName | string;
  content?: string;
  error?: string;
  progress?: number;
  total?: number;
}

/**
 * Service metadata for UI
 */
export interface ServiceMetadata {
  name: AIServiceName;
  displayName: string;
  icon: string;
  color: string;
  baseUrl: string;
}

/**
 * Prompt history entry
 */
export interface HistoryEntry {
  id: string;
  prompt: string;
  services: AIServiceName[];
  responses: AIResponse[];
  timestamp: Date;
}

/**
 * App configuration
 */
export interface AppConfig {
  /** Default selected services */
  defaultServices: AIServiceName[];
  /** Response timeout in ms */
  responseTimeout: number;
  /** Whether to stream responses */
  streamResponses: boolean;
  /** View mode */
  viewMode: 'grid' | 'comparison';
}

/**
 * Client-side state for active request
 */
export interface ActiveRequestState {
  id: string;
  prompt: string;
  services: AIServiceName[];
  responses: Map<AIServiceName, AIResponse | null>;
  pending: Set<AIServiceName>;
  errors: Map<AIServiceName, string>;
  startTime: number;
}
