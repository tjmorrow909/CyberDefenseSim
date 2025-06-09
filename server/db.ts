import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

// Validate DATABASE_URL format if provided
function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {
    return false;
  }
}

if (!connectionString) {
  logger.warn('DATABASE_URL not set. Database features will be disabled.');
} else if (!validateDatabaseUrl(connectionString)) {
  logger.error('Invalid DATABASE_URL format. Expected postgresql:// or postgres:// URL', {
    providedUrl: connectionString.substring(0, 20) + '...' // Log only first 20 chars for security
  });
}

// Create postgres client (only if connection string is available and valid)
let client: any = null;
let db: any = null;

if (connectionString && validateDatabaseUrl(connectionString)) {
  try {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      // Add retry logic for connection issues
      max_lifetime: 60 * 30, // 30 minutes
      transform: {
        undefined: null
      }
    });

    // Create drizzle instance
    db = drizzle(client, { schema });
    logger.info('Database client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database client', {
      error: error instanceof Error ? error.message : String(error),
      connectionStringProvided: !!connectionString,
      connectionStringValid: validateDatabaseUrl(connectionString)
    });
    // Don't exit here, let the app continue without database
    client = null;
    db = null;
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
    logger.info('Application will run without database functionality');
    return;
  }

  if (!validateDatabaseUrl(connectionString)) {
    logger.error('Invalid DATABASE_URL format, skipping database initialization');
    logger.info('Application will run without database functionality');
    return;
  }

  if (!client) {
    logger.warn('Database client not initialized, skipping database setup');
    logger.info('Application will run without database functionality');
    return;
  }

  try {
    logger.info('Starting database initialization...');

    // Check connection with timeout
    const connectionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );

    const connectionCheck = checkDatabaseConnection();
    const isConnected = await Promise.race([connectionCheck, connectionTimeout]);

    if (!isConnected) {
      logger.warn('Database connection failed, continuing without database');
      return;
    }

    logger.info('Database connection successful, running migrations...');

    // Run migrations with timeout
    const migrationTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Migration timeout')), 30000)
    );

    const migration = runMigrations();
    await Promise.race([migration, migrationTimeout]);

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    logger.warn('Continuing without database functionality - this may limit some features');

    // Don't throw the error, let the app continue
  }
}
