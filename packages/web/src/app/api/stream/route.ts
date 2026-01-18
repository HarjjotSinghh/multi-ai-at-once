/**
 * POST /api/stream
 * Send a prompt to multiple AI services with Server-Sent Events streaming
 */

import { NextRequest } from 'next/server';
import { AIServiceName, ServiceFactory } from '@multi-ai/core';
import { getBrowserManager, releaseBrowserManager } from '@/lib/browser/singleton';
import { createSSEEncoder } from '@/lib/stream/sse';
import {
  createInitEvent,
  createProgressEvent,
  createResponseEvent,
  createErrorEvent,
  createCompleteEvent,
  SSE_KEEPALIVE,
} from '@/lib/stream/sse';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes

export async function POST(request: NextRequest) {
  const encoder = createSSEEncoder();

  const body = await request.json();
  const { prompt, services, timeout = 60000 } = body as {
    prompt: string;
    services: AIServiceName[];
    timeout?: number;
  };

  // Validate input
  if (!prompt || typeof prompt !== 'string') {
    return new Response(
      encoder.encode(
        `data: ${JSON.stringify({ type: 'error', error: 'Invalid prompt' })}\n\n`
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }

  if (!Array.isArray(services) || services.length === 0) {
    return new Response(
      encoder.encode(
        `data: ${JSON.stringify({ type: 'error', error: 'Invalid services' })}\n\n`
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }

  const requestId = crypto.randomUUID();
  const browserManager = await getBrowserManager();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(data));
      };

      try {
        // Send init event
        sendEvent(createInitEvent(requestId, services.length));

        // Create services
        const factory = new ServiceFactory(browserManager);
        const aiServices = factory.createServices(services);

        // Initialize all services
        await Promise.all(
          aiServices.map((service) =>
            service.initialize().catch((err) => {
              console.error(`Failed to initialize ${service.serviceName}:`, err);
              sendEvent(
                createErrorEvent(
                  requestId,
                  service.serviceName,
                  err.message || 'Failed to initialize'
                )
              );
            })
          )
        );

        let completed = 0;

        // Send prompts and stream results
        await Promise.allSettled(
          aiServices.map(async (service) => {
            try {
              const response = await service.sendPrompt(prompt, timeout);

              if (response.status === 'success') {
                sendEvent(
                  createResponseEvent(
                    requestId,
                    service.serviceName,
                    response.content
                  )
                );
              } else if (response.status === 'error') {
                sendEvent(
                  createErrorEvent(
                    requestId,
                    service.serviceName,
                    response.error || 'Unknown error'
                  )
                );
              } else if (response.status === 'timeout') {
                sendEvent(
                  createErrorEvent(
                    requestId,
                    service.serviceName,
                    'Request timed out'
                  )
                );
              }

              completed++;
              sendEvent(
                createProgressEvent(
                  requestId,
                  completed,
                  service.serviceName
                )
              );
            } catch (error) {
              sendEvent(
                createErrorEvent(
                  requestId,
                  service.serviceName,
                  error instanceof Error ? error.message : String(error)
                )
              );
              completed++;
            } finally {
              await service.cleanup().catch(() => {});
            }
          })
        );

        // Send complete event
        sendEvent(createCompleteEvent(requestId));
      } catch (error) {
        sendEvent(
          createErrorEvent(
            requestId,
            'system',
            error instanceof Error ? error.message : String(error)
          )
        );
      } finally {
        await releaseBrowserManager();
        controller.close();
      }
    },

    cancel() {
      releaseBrowserManager();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
