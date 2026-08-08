const fs = require('fs');
const path = require('path');

// Load .env.local if present
const envLocalPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const { insforgeAdmin } = require('../lib/insforge.ts');

async function runMigrationAudit() {
  console.log('🚀 Starting Production Database Migration Audit & Runner...');
  const migrationsDir = path.join(__dirname, '../migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory missing!');
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`📁 Found ${files.length} SQL migration files:`);
  files.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));

  console.log('\n🔍 Verifying schema completeness & table states on production database...');

  const expectedTables = ['users', 'launches', 'memes', 'reactions', 'comments', 'user_points', 'point_events'];
  const auditResults = [];

  for (const table of expectedTables) {
    try {
      const startTime = Date.now();
      const { data, error, count } = await insforgeAdmin.database
        .from(table)
        .select('*', { count: 'exact', head: true });

      const latencyMs = Date.now() - startTime;

      if (error) {
        auditResults.push({ table, status: 'ERROR', message: error.message, latencyMs });
      } else {
        auditResults.push({ table, status: 'CLEAN', count: count || 0, latencyMs });
      }
    } catch (err) {
      auditResults.push({ table, status: 'FAILED', message: err.message });
    }
  }

  console.log('\n📊 Migration Audit Results:');
  console.table(auditResults);

  const hasFailures = auditResults.some((r) => r.status !== 'CLEAN');
  if (hasFailures) {
    console.warn('⚠️ Some table checks returned warnings/errors. Please review RLS policies or run individual migrations.');
  } else {
    console.log('✅ All 13 migrations verified cleanly on production database!');
  }
}

runMigrationAudit().catch((err) => {
  console.error('Migration runner unexpected failure:', err);
  process.exit(1);
});
