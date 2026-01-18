/**
 * GET/PUT /api/config
 * Manage app configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIServiceName, ServiceFactory } from '@multi-ai/core';

export const runtime = 'nodejs';

/**
 * GET /api/config - Get available services and current configuration
 */
export async function GET() {
  const availableServices = ServiceFactory.getAvailableServices();

  return NextResponse.json({
    availableServices,
    defaultTimeout: 60000,
    maxConcurrentRequests: 3,
  });
}

/**
 * PUT /api/config - Update configuration (reserved for future use)
 */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { defaultServices, responseTimeout, streamResponses } = body as {
    defaultServices?: AIServiceName[];
    responseTimeout?: number;
    streamResponses?: boolean;
  };

  // Validate services
  if (defaultServices) {
    const available = ServiceFactory.getAvailableServices();
    const invalid = defaultServices.filter((s) => !available.includes(s));

    if (invalid.length > 0) {
      return NextResponse.json(
        { error: 'Invalid services', invalid },
        { status: 400 }
      );
    }
  }

  // For now, config is stored in localStorage on the client
  // In the future, this could be stored in a database
  return NextResponse.json({
    message: 'Configuration updated (client-side only)',
    config: { defaultServices, responseTimeout, streamResponses },
  });
}
