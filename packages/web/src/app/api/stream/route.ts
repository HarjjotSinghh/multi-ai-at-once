/**
 * POST /api/stream
 * Send a prompt to multiple AI services with Server-Sent Events streaming
 */

import { NextRequest } from 'next/server';
import { AIServiceName, ServiceFactory, type AIResponse } from '@multi-ai/core';
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
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { promptHistory, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes

async function handleRequest(request: NextRequest) {
  const encoder = createSSEEncoder();

  let prompt: string;
  let services: AIServiceName[];
  let timeout: number = 60000;

  try {
    if (request.method === 'POST') {
      const body = await request.json();
      prompt = body.prompt;
      services = body.services;
      if (body.timeout) timeout = body.timeout;
    } else {
      const { searchParams } = new URL(request.url);
      prompt = searchParams.get('prompt') || '';
      const servicesParam = searchParams.get('services');
      services = servicesParam ? (servicesParam.split(',') as AIServiceName[]) : [];
      if (searchParams.get('timeout')) timeout = parseInt(searchParams.get('timeout')!);
    }
  } catch (e) {
    return new Response(
      encoder.encode(
         `data: ${JSON.stringify({ type: 'error', error: 'Invalid request format' })}\n\n`
      ),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }

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

  // Check authentication and get user settings
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  let userTimeout = timeout;
  if (session?.user?.id) {
    // Fetch user settings
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (settings.length > 0 && settings[0].responseTimeout) {
      userTimeout = settings[0].responseTimeout;
    }
  }

  const requestId = crypto.randomUUID();
  const browserManager = await getBrowserManager();

  // Store responses for history saving
  const collectedResponses: AIResponse[] = [];

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
        // Create services
        const factory = new ServiceFactory(browserManager);
        const aiServices = factory.createServices(services);
        
        let completed = 0;

        // Execute all services in parallel
        await Promise.all(
          aiServices.map(async (service) => {
            try {
              // Initialize service
              try {
                await service.initialize();
              } catch (initErr) {
                console.error(`Failed to initialize ${service.serviceName}:`, initErr);
                sendEvent(
                  createErrorEvent(
                    requestId,
                    service.serviceName,
                    initErr instanceof Error ? initErr.message : 'Failed to initialize'
                  )
                );
                return; // Stop processing for this service
              }

              // Send prompt
              try {
                const response = await service.sendPrompt(prompt, userTimeout);

                if (response.status === 'success') {
                  collectedResponses.push(response);
                  sendEvent(
                    createResponseEvent(
                      requestId,
                      service.serviceName,
                      response.content
                    )
                  );
                } else if (response.status === 'error') {
                  collectedResponses.push(response);
                  sendEvent(
                    createErrorEvent(
                      requestId,
                      service.serviceName,
                      response.error || 'Unknown error'
                    )
                  );
                } else if (response.status === 'timeout') {
                  collectedResponses.push(response);
                  console.log(`[${service.serviceName}] Request timed out`);
                  sendEvent(
                    createErrorEvent(
                      requestId,
                      service.serviceName,
                      'Request timed out'
                    )
                  );
                }
              } catch (screenError) {
                 console.error(`[${service.serviceName}] Error processing prompt:`, screenError);
                 sendEvent(
                    createErrorEvent(
                      requestId,
                      service.serviceName,
                      screenError instanceof Error ? screenError.message : String(screenError)
                    )
                 );
              }
            } catch (error) {
              console.error(`[${service.serviceName}] Unexpected error:`, error);
              sendEvent(
                createErrorEvent(
                  requestId,
                  service.serviceName,
                  error instanceof Error ? error.message : String(error)
                )
              );
            } finally {
              completed++;
              sendEvent(
                createProgressEvent(
                  requestId,
                  completed,
                  service.serviceName
                )
              );
              console.log(`[${service.serviceName}] Cleaning up...`);
              await service.cleanup().catch(() => {});
            }
          })
        );

        // Save to history if user is authenticated
        if (session?.user?.id && collectedResponses.length > 0) {
          try {
            const userAgent = request.headers.get('user-agent') || undefined;
            const ipAddress =
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              undefined;

            await db.insert(promptHistory).values({
              userId: session.user.id,
              prompt,
              services,
              responses: collectedResponses,
              userAgent,
              ipAddress,
            });
          } catch (error) {
            console.error('Error saving prompt history:', error);
            // Don't fail the request if history saving fails
          }
        }

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

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}
