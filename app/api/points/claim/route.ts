import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = process.env.INSFORGE_SERVICE_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serviceKey,
});

/**
 * Calculate total points balance for a user from point_transactions.
 */
async function calculateUserTotalPoints(userId: string): Promise<number> {
  const { data: txs, error } = await insforgeAdmin.database
    .from('point_transactions')
    .select('amount')
    .eq('user_id', userId);

  if (error || !txs) return 0;
  return txs.reduce((sum: number, tx: { amount: number }) => sum + (tx.amount || 0), 0);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, taskKey, amount, actionType } = body;

    if (!userId || !taskKey || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid parameters provided.' },
        { status: 400 }
      );
    }

    // 1. Check if task exists in user_completed_tasks lock table
    const { data: existingTask } = await insforgeAdmin.database
      .from('user_completed_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_key', taskKey)
      .limit(1);

    // 2. Check if point transaction already exists for this task
    const { data: existingTx } = await insforgeAdmin.database
      .from('point_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_id', taskKey)
      .limit(1);

    const hasCompletedTask = existingTask && existingTask.length > 0;
    const hasRecordedTx = existingTx && existingTx.length > 0;

    // Case A: Task lock existed BUT point transaction was missing (Self-healing repair)
    if (hasCompletedTask && !hasRecordedTx) {
      console.log(`🔧 Self-healing missing point transaction for task ${taskKey} (user: ${userId})...`);
      await insforgeAdmin.database.from('point_transactions').insert([
        {
          user_id: userId,
          amount,
          action_type: actionType || taskKey,
          reference_id: taskKey,
        },
      ]);
    }

    // Case B: Task lock did NOT exist -> Insert lock and transaction
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

    // 3. Recalculate true point balance from all point_transactions
    const updatedTotalPoints = await calculateUserTotalPoints(userId);

    // 4. Update public.users.points balance
    await insforgeAdmin.database
      .from('users')
      .update({ points: updatedTotalPoints })
      .eq('id', userId);

    // If points were repaired or awarded now:
    if (!hasRecordedTx || !hasCompletedTask) {
      return NextResponse.json({
        success: true,
        points: updatedTotalPoints,
        message: `🎉 Earned +${amount} points!`,
      });
    }

    // If task and points transaction were both already present:
    return NextResponse.json({
      success: true,
      points: updatedTotalPoints,
      message: 'This task has already been completed!',
    });

  } catch (err: any) {
    console.error('Error claiming social points:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
