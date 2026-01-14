import fs from 'fs';
import path from 'path';

// Load environment variables from .env files
const envFiles = ['.env', '.env.local'];
for (const file of envFiles) {
  try {
    if (fs.existsSync(file)) {
      // @ts-ignore - loadEnvFile is available in Node 20.6.0+
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(file);
        console.log(`Loaded environment variables from ${file}`);
      }
    }
  } catch (error) {
    console.warn(`Could not load ${file} file:`, error);
  }
}

async function runMigrations() {
  // Dynamic import to ensure env variables are loaded first
  const { getClient, closePool } = await import('./lib/db');
  
  console.log('Starting migrations...');
  const client = await getClient();

  try {
    // 1. Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read migration files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // 3. Get already executed migrations
    const { rows: executedRows } = await client.query('SELECT name FROM _migrations');
    const executedMigrations = new Set(executedRows.map(row => row.name));

    // 4. Execute pending migrations
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        // We execute the whole file content. pg doesn't support multiple statements in one query call well 
        // if they are complex, but for standard SQL scripts it usually works.
        // However, it's safer to split by ';' if possible, but that's complex due to functions/triggers.
        // 'pg' actually supports multiple statements separated by ';' in a single string.
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Successfully executed: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error executing ${file}:`, err);
        throw err;
      }
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await closePool();
  }
}

runMigrations();
