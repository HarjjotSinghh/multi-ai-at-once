// Placeholder auth library for build compatibility
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuth(req: NextRequest) {
  // Logic to verify authentication would go here
  // For now, we return true or a mock user session
  return {
    isAuthenticated: true,
    user: { id: 'mock-user-id', role: 'admin' },
  };
}

export async function getSession(options?: any) {
  return {
    user: { id: 'mock-user-id', email: 'user@example.com', name: 'Operator' },
    session: { id: 'mock-session-id' }
  };
}

const mockMiddleware = (handler: any) => {
  return async (req: any, ctx: any) => {
    // Mock session on request
    req.auth = {
       user: { id: 'mock-user-id', email: 'user@example.com', name: 'Operator' },
       session: { id: 'mock-session-id' }
    };
    return handler(req, ctx);
  };
};

export const auth = {
  verifyAuth,
  getSession,
  api: {
    getSession,
  },
  middleware: mockMiddleware,
};

export type Session = {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  session: {
    id: string;
    expiresAt?: Date;
  };
} | null;

export type User = {
  id: string;
  email: string;
  name?: string;
};