const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: serviceKey });

async function applyRlsFix() {
  console.log('🔒 Applying RLS policies for user_completed_tasks and point_transactions...');

  const sqlStatements = [
    `CREATE POLICY IF NOT EXISTS insert_own_transactions ON public.point_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS insert_own_completed_tasks ON public.user_completed_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS insert_own_transactions ON public.point_transactions;`,
    `CREATE POLICY insert_own_transactions ON public.point_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS insert_own_completed_tasks ON public.user_completed_tasks;`,
    `CREATE POLICY insert_own_completed_tasks ON public.user_completed_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`,
  ];

  for (const sql of sqlStatements) {
    try {
      console.log(`Executing: ${sql}`);
      const { data, error } = await insforge.database.rpc('exec_sql', { sql });
      if (error) {
        console.warn(`SQL Notice/Error:`, error.message);
      } else {
        console.log(`✅ Success`);
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

applyRlsFix();
