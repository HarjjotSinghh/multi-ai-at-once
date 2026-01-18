import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { AIServiceName } from '@multi-ai/core';

/**
 * GET /api/settings
 * Get user settings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id));

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          defaultServices: ['chatgpt', 'claude', 'gemini'] as AIServiceName[],
          responseTimeout: 60000,
          streamResponses: true,
          viewMode: 'grid' as const,
          rateLimitTier: 'free' as const,
          customRateLimit: null,
        },
      });
    }

    return NextResponse.json({ settings: settings[0] });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Update user settings for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      defaultServices,
      responseTimeout,
      streamResponses,
      viewMode,
      rateLimitTier,
      customRateLimit,
    } = body as {
      defaultServices?: AIServiceName[];
      responseTimeout?: number;
      streamResponses?: boolean;
      viewMode?: 'grid' | 'comparison';
      rateLimitTier?: 'free' | 'pro' | 'unlimited';
      customRateLimit?: number | null;
    };

    const existing = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id));

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (defaultServices !== undefined) updateData.defaultServices = defaultServices;
    if (responseTimeout !== undefined) updateData.responseTimeout = responseTimeout;
    if (streamResponses !== undefined) updateData.streamResponses = streamResponses;
    if (viewMode !== undefined) updateData.viewMode = viewMode;
    if (rateLimitTier !== undefined) updateData.rateLimitTier = rateLimitTier;
    if (customRateLimit !== undefined) updateData.customRateLimit = customRateLimit;

    if (existing.length > 0) {
      await db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, session.user.id));
    } else {
      await db.insert(userSettings).values({
        userId: session.user.id,
        ...updateData,
        defaultServices: defaultServices || ['chatgpt', 'claude', 'gemini'],
        responseTimeout: responseTimeout || 60000,
        streamResponses: streamResponses ?? true,
        viewMode: viewMode || 'grid',
        rateLimitTier: rateLimitTier || 'free',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
