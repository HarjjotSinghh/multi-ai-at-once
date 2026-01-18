import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiServiceCredentials } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/encryption/cookies';
import type { CookieData, AIServiceName } from '@multi-ai/core';

/**
 * GET /api/credentials
 * Get all stored AI service credentials for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await db
      .select()
      .from(aiServiceCredentials)
      .where(eq(aiServiceCredentials.userId, session.user.id));

    // Decrypt credentials before sending
    const decrypted = credentials.map((cred) => ({
      id: cred.id,
      serviceName: cred.serviceName,
      cookies: decrypt<CookieData[]>(cred.encryptedCookies),
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      expiresAt: cred.expiresAt,
    }));

    return NextResponse.json({ credentials: decrypted });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credentials
 * Store new AI service credentials for the authenticated user
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
    const { serviceName, cookies, expiresAt } = body as {
      serviceName: AIServiceName;
      cookies: CookieData[];
      expiresAt?: string;
    };

    if (!serviceName || !cookies || !Array.isArray(cookies)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Check if credentials already exist for this service
    const existing = await db
      .select()
      .from(aiServiceCredentials)
      .where(
        and(
          eq(aiServiceCredentials.userId, session.user.id),
          eq(aiServiceCredentials.serviceName, serviceName)
        )
      );

    const encryptedCookies = encrypt(cookies);
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

    if (existing.length > 0) {
      // Update existing credentials
      await db
        .update(aiServiceCredentials)
        .set({
          encryptedCookies,
          updatedAt: new Date(),
          expiresAt: expiresAtDate,
        })
        .where(eq(aiServiceCredentials.id, existing[0].id));

      return NextResponse.json({
        success: true,
        id: existing[0].id,
        updated: true,
      });
    }

    // Insert new credentials
    const result = await db
      .insert(aiServiceCredentials)
      .values({
        userId: session.user.id,
        serviceName,
        encryptedCookies,
        expiresAt: expiresAtDate,
      })
      .returning();

    return NextResponse.json({
      success: true,
      id: result[0].id,
      created: true,
    });
  } catch (error) {
    console.error('Error storing credentials:', error);
    return NextResponse.json(
      { error: 'Failed to store credentials' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/credentials
 * Delete AI service credentials for the authenticated user
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
    const serviceName = searchParams.get('service');

    if (!serviceName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    await db
      .delete(aiServiceCredentials)
      .where(
        and(
          eq(aiServiceCredentials.userId, session.user.id),
          eq(aiServiceCredentials.serviceName, serviceName as AIServiceName)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting credentials:', error);
    return NextResponse.json(
      { error: 'Failed to delete credentials' },
      { status: 500 }
    );
  }
}
