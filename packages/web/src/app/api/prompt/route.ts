/**
 * POST /api/prompt
 * Send a prompt to multiple AI services (non-streaming)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIServiceName } from '@multi-ai/core';
import { sendPromptAction } from '@/lib/services/prompt';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, services, timeout } = body as {
      prompt: string;
      services: AIServiceName[];
      timeout?: number;
    };

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'Services must be a non-empty array' },
        { status: 400 }
      );
    }

    // Send prompt
    const result = await sendPromptAction(prompt, services, timeout);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/prompt:', error);
    return NextResponse.json(
      {
        error: 'Failed to process prompt',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
