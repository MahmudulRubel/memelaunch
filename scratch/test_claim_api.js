const https = require('https');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

// Test database query to verify points update
const { createClient } = require('@insforge/sdk');
const insforge = createClient({ baseUrl, anonKey: serviceKey });

async function verifyPointsSystem() {
  console.log('🧪 Testing Points API & Database user points state...');
  
  const { data: users, error } = await insforge.database.from('users').select('*').limit(5);
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log('Sample Users with Points:');
  users.forEach(u => {
    console.log(`- User: ${u.name} (ID: ${u.id}) | Points: ${u.points}`);
  });

  const targetUser = users[0];
  if (targetUser) {
    console.log(`\nTesting point award simulation for user ${targetUser.name}...`);
    const taskKey = `test_verification_${Date.now()}`;

    // Insert completed task
    const { error: taskErr } = await insforge.database
      .from('user_completed_tasks')
      .insert([{ user_id: targetUser.id, task_key: taskKey }]);
    
    if (taskErr) {
      console.error('Task lock insert error:', taskErr);
      return;
    }

    // Insert transaction
    await insforge.database.from('point_transactions').insert([
      { user_id: targetUser.id, amount: 5, action_type: 'test_action', reference_id: taskKey }
    ]);

    // Update user balance
    const newPoints = (targetUser.points || 0) + 5;
    await insforge.database.from('users').update({ points: newPoints }).eq('id', targetUser.id);

    console.log(`✅ Points update simulation succeeded! New points: ${newPoints}`);
  }
}

verifyPointsSystem().catch(console.error);
