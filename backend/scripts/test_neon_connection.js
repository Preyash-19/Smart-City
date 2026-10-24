import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Read .env.local from project root
const envLocalPath = path.resolve(process.cwd(), '../.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('Error: .env.local not found at', envLocalPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf8');
let pooledUrl = '';
let unpooledUrl = '';

for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    pooledUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
  } else if (trimmed.startsWith('DATABASE_URL_UNPOOLED=')) {
    unpooledUrl = trimmed.substring('DATABASE_URL_UNPOOLED='.length).replace(/^["']|["']$/g, '');
  }
}

if (!pooledUrl) {
  console.error('Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  console.log('Testing Neon connection safely (no credentials logged)...');
  
  // Test Pooled Connection
  const pool = new pg.Pool({ connectionString: pooledUrl, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query('SELECT current_database() as db, current_user as usr, version() as ver;');
    console.log('[SUCCESS] Pooled connection verified:');
    console.log('  Database:', res.rows[0].db);
    console.log('  Role:', res.rows[0].usr);
    console.log('  Postgres Version:', res.rows[0].ver.split(' ')[0], res.rows[0].ver.split(' ')[1]);

    const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    console.log('  Existing public base tables count:', tableRes.rows.length);
    for (const r of tableRes.rows) {
      if (r.table_name !== '_prisma_migrations') {
        const countRes = await pool.query(`SELECT COUNT(*) as cnt FROM "${r.table_name}"`);
        console.log(`   - ${r.table_name}: ${countRes.rows[0].cnt} records`);
      } else {
        console.log(`   - ${r.table_name} (internal Prisma migration tracking)`);
      }
    }
  } catch (err) {
    console.error('[FAILED] Pooled connection error:', err.message);
  } finally {
    await pool.end();
  }

  // Test Unpooled / Direct Connection
  if (unpooledUrl) {
    const directClient = new pg.Client({ connectionString: unpooledUrl, ssl: { rejectUnauthorized: false } });
    try {
      await directClient.connect();
      const res = await directClient.query('SELECT current_database() as db, current_user as usr;');
      console.log('[SUCCESS] Direct/Unpooled connection verified:');
      console.log('  Database:', res.rows[0].db);
      console.log('  Role:', res.rows[0].usr);
    } catch (err) {
      console.error('[FAILED] Direct connection error:', err.message);
    } finally {
      await directClient.end();
    }
  }
}

testConnection();
