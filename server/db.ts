import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.warn('DATABASE_URL not set. Database features will be disabled.');
}

// Create postgres client (only if connection string is available)
let client: any = null;
let db: any = null;

if (connectionString) {
  try {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Create drizzle instance
    db = drizzle(client, { schema });
    logger.info('Database client initialized');
  } catch (error) {
    logger.error('Failed to initialize database client', { error: error instanceof Error ? error.message : String(error) });
  }
}

// Export db (will be null if no database)
export { db };

// Migration runner
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    const migrationsDir = path.join(process.cwd(), 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      logger.warn('Migrations directory not found, skipping migrations');
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
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
    logger.error('Migration failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!client) {
    logger.warn('Database client not available');
    return false;
  }

  try {
    await client`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error: error instanceof Error ? error.message : String(error) });
  }
}

// Initialize database
export async function initializeDatabase(): Promise<void> {
  if (!connectionString) {
    logger.warn('Skipping database initialization - no DATABASE_URL provided');
    return;
  }

  try {
    // Check connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      logger.warn('Database connection failed, continuing without database');
      return;
    }

    // Run migrations
    await runMigrations();

    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed', { error: error instanceof Error ? error.message : String(error) });
    logger.warn('Continuing without database functionality');
  }
}
