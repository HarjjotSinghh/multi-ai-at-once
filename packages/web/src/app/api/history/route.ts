import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { promptHistory } from '@/lib/db/schema';
import { eq, desc, lt } from 'drizzle-orm';
import type { AIServiceName, AIResponse } from '@multi-ai/core';

/**
 * GET /api/history
 * Get prompt history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const history = await db
      .select()
      .from(promptHistory)
      .where(eq(promptHistory.userId, session.user.id))
      .orderBy(desc(promptHistory.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history
 * Save a new prompt to history (called after successful AI response)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();
    const { prompt, services, responses } = body as {
      prompt: string;
      services: AIServiceName[];
      responses: AIResponse[];
    };

    if (!prompt || !services || !responses) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Store with user ID if authenticated, otherwise use session ID
    const historyData = {
      prompt,
      services,
      responses,
      userAgent,
      ipAddress,
      ...(session?.user?.id && { userId: session.user.id }),
      ...(!session?.user?.id && {
        sessionId: crypto.randomUUID?.() || Math.random().toString(36),
      }),
    };

    const result = await db
      .insert(promptHistory)
      .values(historyData)
      .returning();

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history
 * Clear old prompt history (entries older than 30 days by default)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await db
      .delete(promptHistory)
      .where(
        eq(promptHistory.userId, session.user.id) &&
          lt(promptHistory.timestamp, cutoffDate)
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
