import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { type AIServiceName } from '@multi-ai/core';

// ============================================================================
// Better Auth Tables
// ============================================================================

/**
 * user: Better Auth user table
 */
export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * session: Better Auth session table
 */
export const session = pgTable('session', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * account: Better Auth account table for OAuth providers
 */
export const account = pgTable('account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * verification: Better Auth verification table for email verification
 */
export const verification = pgTable('verification', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Custom Application Tables
// ============================================================================

/**
 * prompt_history: Stores prompt history for both authenticated and anonymous users
 * - userId is nullable for anonymous users
 * - sessionId tracks anonymous user sessions
 */
export const promptHistory = pgTable(
  'prompt_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'), // For anonymous users
    prompt: text('prompt').notNull(),
    services: jsonb('services').$type<AIServiceName[]>().notNull(),
    responses: jsonb('responses').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
  },
  (table) => ({
    userIdIdx: index('prompt_history_user_id_idx').on(table.userId),
    sessionIdIdx: index('prompt_history_session_id_idx').on(table.sessionId),
    timestampIdx: index('prompt_history_timestamp_idx').on(table.timestamp),
  })
);

/**
 * ai_service_credentials: Stores encrypted AI service cookies for authenticated users
 * - Uses AES-256-GCM encryption for cookie storage
 */
export const aiServiceCredentials = pgTable(
  'ai_service_credentials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    serviceName: text('service_name').$type<AIServiceName>().notNull(),
    encryptedCookies: text('encrypted_cookies').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  (table) => ({
    userIdServiceIdx: index('ai_credentials_user_service_idx').on(
      table.userId,
      table.serviceName
    ),
  })
);

/**
 * user_settings: Stores user preferences and configuration
 */
export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    defaultServices: jsonb('default_services').$type<AIServiceName[]>(),
    responseTimeout: integer('response_timeout').default(60000),
    streamResponses: boolean('stream_responses').default(true),
    viewMode: text('view_mode').$type<'grid' | 'comparison'>().default('grid'),
    rateLimitTier: text('rate_limit_tier')
      .$type<'free' | 'pro' | 'unlimited'>()
      .default('free'),
    customRateLimit: integer('custom_rate_limit'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('user_settings_user_id_idx').on(table.userId),
  })
);

/**
 * usage_tracking: Tracks user usage for rate limiting and analytics
 */
export const usageTracking = pgTable(
  'usage_tracking',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    promptCount: integer('prompt_count').default(0).notNull(),
    totalResponseTime: integer('total_response_time').default(0).notNull(),
    lastPromptAt: timestamp('last_prompt_at'),
    windowStart: timestamp('window_start').defaultNow().notNull(),
    windowCount: integer('window_count').default(0).notNull(),
  },
  (table) => ({
    userIdIdx: index('usage_tracking_user_id_idx').on(table.userId),
  })
);

// Types
export type PromptHistory = typeof promptHistory.$inferSelect;
export type NewPromptHistory = typeof promptHistory.$inferInsert;
export type AIServiceCredentials = typeof aiServiceCredentials.$inferSelect;
export type NewAIServiceCredentials = typeof aiServiceCredentials.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;
