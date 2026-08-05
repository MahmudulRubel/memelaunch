const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: serviceKey });

async function checkAllUserPointsData() {
  console.log('🔍 Inspecting all users, completed tasks, and point transactions...');

  const { data: users } = await insforge.database.from('users').select('*');
  const { data: tasks } = await insforge.database.from('user_completed_tasks').select('*');
  const { data: txs } = await insforge.database.from('point_transactions').select('*');

  console.log('\n--- USERS ---');
  console.table(users.map(u => ({ id: u.id, name: u.name, points: u.points })));

  console.log('\n--- COMPLETED TASKS ---');
  console.table(tasks);

  console.log('\n--- POINT TRANSACTIONS ---');
  console.table(txs);
}

checkAllUserPointsData().catch(console.error);
