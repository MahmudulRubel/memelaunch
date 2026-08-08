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

async function createDatabaseBackup() {
  console.log('📦 Starting Production Database Backup Snapshot...');

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotFileName = `db-backup-${timestamp}.json`;
  const targetPath = path.join(backupDir, snapshotFileName);

  const tables = ['users', 'launches', 'memes', 'reactions', 'comments', 'user_points', 'point_events'];
  const snapshotData = {
    createdAt: new Date().toISOString(),
    region: 'ap-southeast',
    tables: {},
    metadata: {
      tableCount: tables.length,
      insforgeBaseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app',
    },
  };

  for (const table of tables) {
    console.log(`   Exporting table: ${table}...`);
    try {
      const { data, error } = await insforgeAdmin.database
        .from(table)
        .select('*');

      if (error) {
        console.warn(`   ⚠️ Warning exporting ${table}: ${error.message}`);
        snapshotData.tables[table] = { error: error.message, rows: [] };
      } else {
        snapshotData.tables[table] = { count: data?.length || 0, rows: data || [] };
        console.log(`   ✅ Exported ${table}: ${data?.length || 0} rows.`);
      }
    } catch (err) {
      console.error(`   ❌ Failed exporting ${table}:`, err.message);
      snapshotData.tables[table] = { error: err.message, rows: [] };
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(snapshotData, null, 2), 'utf8');
  console.log(`\n🎉 Backup snapshot created successfully at: ${targetPath}`);
  return { path: targetPath, snapshotData };
}

if (require.main === module) {
  createDatabaseBackup().catch((err) => {
    console.error('Backup creation error:', err);
    process.exit(1);
  });
}

module.exports = { createDatabaseBackup };
