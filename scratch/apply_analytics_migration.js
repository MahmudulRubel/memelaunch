const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: serviceKey });

async function applyMigration() {
  console.log('🚀 Executing database migration using InsForge SDK...');

  const sqlStatements = [
    `ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0 NOT NULL;`,
    `ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0 NOT NULL;`,
    `CREATE OR REPLACE FUNCTION increment_launch_views(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET views_count = views_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
    `CREATE OR REPLACE FUNCTION increment_launch_clicks(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET clicks_count = clicks_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
  ];

  for (const sql of sqlStatements) {
    try {
      console.log(`Executing SQL: ${sql.slice(0, 50)}...`);
      const { data, error } = await insforge.database.rpc('exec_sql', { sql });
      if (error) {
        console.warn(`Notice/Response:`, error);
      } else {
        console.log(`✅ Success:`, data);
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

applyMigration();
