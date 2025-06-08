import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Migration runner
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    const migrationsDir = path.join(process.cwd(), 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      logger.warn('Migrations directory not found, skipping migrations');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`Running migration: ${file}`);

      // Split SQL file by statements and execute each one
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await client.unsafe(statement);
        }
      }

      logger.info(`Completed migration: ${file}`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error: error.message });
    throw error;
  }
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error: error.message });
  }
}

// Initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    // Check connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Run migrations
    await runMigrations();

    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    throw error;
  }
}