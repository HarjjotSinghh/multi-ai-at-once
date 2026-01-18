import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Allow build to pass without real DB
const connectionString = process.env.DATABASE_URL || 'postgres://mock:mock@localhost:5432/mock';

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Fix for some environments
});

// Create drizzle instance
export const db = drizzle(client);

// Close connection on shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    client.end();
  });
}
