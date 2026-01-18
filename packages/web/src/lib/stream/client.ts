/**
 * Client-side SSE connection management
 */

'use client';

import { StreamEvent } from '@/types';

export type SSEEventHandler = (event: StreamEvent) => void;
export type SSEErrorHandler = (error: Error) => void;
export type SSECloseHandler = () => void;

/**
 * SSE client connection
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, Set<SSEEventHandler>> = new Map();
  private errorHandler: SSEErrorHandler | null = null;
  private closeHandler: SSECloseHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  /**
   * Connect to SSE endpoint
   */
  connect(url: string): void {
    this.disconnect();

    this.eventSource = new EventSource(url, {
      withCredentials: true,
    });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        this.emit(data.type, data);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    this.eventSource.onerror = (error) => {
      this.handleError(new Error('SSE connection error'));

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.connect(url);
          }
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        this.disconnect();
      }
    };

    this.reconnectAttempts = 0;
  }

  /**
   * Register event handler
   */
  on(eventType: StreamEvent['type'], handler: SSEEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(eventType: StreamEvent['type'], handler: SSEEventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  /**
   * Register error handler
   */
  onError(handler: SSEErrorHandler): void {
    this.errorHandler = handler;
  }

  /**
   * Register close handler
   */
  onClose(handler: SSECloseHandler): void {
    this.closeHandler = handler;
  }

  /**
   * Emit event to handlers
   */
  private emit(type: StreamEvent['type'], event: StreamEvent): void {
    this.handlers.get(type)?.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in SSE event handler:', error);
      }
    });
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;

      if (this.closeHandler) {
        this.closeHandler();
      }
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

/**
 * React hook for SSE connection
 */
export function useSSE(url: string | null) {
  const client = new SSEClient();

  if (url) {
    client.connect(url);
  }

  return client;
}
