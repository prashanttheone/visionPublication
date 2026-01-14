
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required but not defined.");
}

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increased from 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10s to handle DNS/network lag
};

// Create a singleton pool instance
let pool: Pool | null = null;

/**
 * Get the database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  
  return pool;
}

/**
 * Execute a query with automatic connection handling and retry logic for DNS issues
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  retryCount = 0
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (>1000ms)
    if (duration > 1000) {
      console.warn('Slow query detected:', {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    
    return result;
  } catch (error: any) {
    // Retry on temporary DNS resolution failures (EAI_AGAIN)
    if (error.code === 'EAI_AGAIN' && retryCount < 2) {
      console.warn(`DNS resolution failed (EAI_AGAIN). Retrying... (${retryCount + 1}/2)`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return query(text, params, retryCount + 1);
    }

    console.error('Database query error:', {
      text,
      params,
      error: error instanceof Error ? error.message : error,
      code: error.code
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Close the pool (use on application shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
