/**
 * Server-Sent Events utilities
 */

import { StreamEvent } from '@/types';

/**
 * Create a text/event-stream encoder
 */
export function createSSEEncoder(): TextEncoder {
  return new TextEncoder();
}

/**
 * Format data as SSE event
 */
export function formatSSEEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Create an SSE event string
 */
export function createSSEEvent(
  type: StreamEvent['type'],
  data: Omit<StreamEvent, 'type'>
): string {
  const event: StreamEvent = { type, ...data };
  return formatSSEEvent(event);
}

/**
 * Create an init event
 */
export function createInitEvent(requestId: string, total: number): string {
  return createSSEEvent('init', { requestId, total, progress: 0 });
}

/**
 * Create a progress event
 */
export function createProgressEvent(
  requestId: string,
  progress: number,
  service: string
): string {
  return createSSEEvent('progress', { requestId, progress, service });
}

/**
 * Create a response event
 */
export function createResponseEvent(
  requestId: string,
  service: string,
  content: string
): string {
  return createSSEEvent('response', { requestId, service, content });
}

/**
 * Create an error event
 */
export function createErrorEvent(
  requestId: string,
  service: string,
  error: string
): string {
  return createSSEEvent('error', { requestId, service, error });
}

/**
 * Create a complete event
 */
export function createCompleteEvent(requestId: string): string {
  return createSSEEvent('complete', { requestId });
}

/**
 * Keep-alive comment for SSE connection
 */
export const SSE_KEEPALIVE = ': keep-alive\n\n';
