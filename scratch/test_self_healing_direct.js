const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({ baseUrl, anonKey: serviceKey });

async function calculateUserTotalPoints(userId) {
  const { data: txs, error } = await insforgeAdmin.database
    .from('point_transactions')
    .select('amount')
    .eq('user_id', userId);

  if (error || !txs) return 0;
  return txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

async function simulateSelfHealing(userId, taskKey, amount, actionType) {
  console.log(`🔧 Running self-healing for user ${userId}, task ${taskKey}...`);

  const { data: existingTask } = await insforgeAdmin.database
    .from('user_completed_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('task_key', taskKey)
    .limit(1);

  const { data: existingTx } = await insforgeAdmin.database
    .from('point_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('reference_id', taskKey)
    .limit(1);

  const hasCompletedTask = existingTask && existingTask.length > 0;
  const hasRecordedTx = existingTx && existingTx.length > 0;

  if (hasCompletedTask && !hasRecordedTx) {
    console.log(`✅ Self-healing detected stuck task without transaction! Awarding +${amount} points...`);
    await insforgeAdmin.database.from('point_transactions').insert([
      {
        user_id: userId,
        amount,
        action_type: actionType || taskKey,
        reference_id: taskKey,
      },
    ]);
  }

  if (!hasCompletedTask) {
    await insforgeAdmin.database
      .from('user_completed_tasks')
      .insert([{ user_id: userId, task_key: taskKey }]);

    if (!hasRecordedTx) {
      await insforgeAdmin.database.from('point_transactions').insert([
        {
          user_id: userId,
          amount,
          action_type: actionType || taskKey,
          reference_id: taskKey,
        },
      ]);
    }
  }

  const updatedTotalPoints = await calculateUserTotalPoints(userId);
  await insforgeAdmin.database
    .from('users')
    .update({ points: updatedTotalPoints })
    .eq('id', userId);

  console.log(`🎉 User ${userId} now has ${updatedTotalPoints} points in DB!`);
}

// Clean up all users' out-of-sync stuck completed tasks automatically
async function repairAllUsers() {
  const { data: users } = await insforgeAdmin.database.from('users').select('*');
  for (const user of users) {
    const { data: tasks } = await insforgeAdmin.database.from('user_completed_tasks').select('*').eq('user_id', user.id);
    for (const t of tasks) {
      await simulateSelfHealing(user.id, t.task_key, 5, t.task_key);
    }
  }
}

repairAllUsers().catch(console.error);
