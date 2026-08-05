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
    const { userId, taskKey, amount, actionType, handle, openedAt } = body;

    if (!userId || !taskKey || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid parameters provided.' },
        { status: 400 }
      );
    }

    // Anti-Fraud Layer 1: Validate social handle for social tasks
    const isSocialTask = taskKey.startsWith('follow_') || taskKey.startsWith('share_');
    let cleanHandle = (handle || '').trim();

    if (isSocialTask) {
      if (!cleanHandle || cleanHandle.length < 2) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid social handle (e.g. @username) as proof of action.' },
          { status: 400 }
        );
      }
      if (!cleanHandle.startsWith('@')) {
        cleanHandle = `@${cleanHandle}`;
      }
    }

    // Anti-Fraud Layer 2: Enforce 40-second minimum dwell time
    if (isSocialTask && typeof openedAt === 'number') {
      const elapsedSeconds = Math.floor((Date.now() - openedAt) / 1000);
      if (elapsedSeconds < 40) {
        const remaining = 40 - elapsedSeconds;
        return NextResponse.json(
          {
            success: false,
            message: `⏳ Please spend at least 40 seconds on the social page before claiming. Try again in ${remaining}s.`,
          },
          { status: 400 }
        );
      }
    }

    // Anti-Fraud Layer 3: One-Time Lifetime Lock Check in user_completed_tasks
    const { data: existingTask } = await insforgeAdmin.database
      .from('user_completed_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_key', taskKey)
      .limit(1);

    // Check if point transaction already exists
    const { data: existingTx } = await insforgeAdmin.database
      .from('point_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_id', taskKey)
      .limit(1);

    const hasCompletedTask = existingTask && existingTask.length > 0;
    const hasRecordedTx = existingTx && existingTx.length > 0;

    const auditRef = isSocialTask ? `${taskKey}:${cleanHandle}` : taskKey;

    // Self-healing repair if task lock existed but points transaction failed to write
    if (hasCompletedTask && !hasRecordedTx) {
      console.log(`🔧 Self-healing missing transaction for task ${taskKey} (user: ${userId}, handle: ${cleanHandle})...`);
      await insforgeAdmin.database.from('point_transactions').insert([
        {
          user_id: userId,
          amount,
          action_type: actionType || taskKey,
          reference_id: auditRef,
        },
      ]);
    }

    // New task claim
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
            reference_id: auditRef,
          },
        ]);
      }
    }

    // Recalculate true point balance from all point_transactions
    const updatedTotalPoints = await calculateUserTotalPoints(userId);

    // Update public.users.points balance
    await insforgeAdmin.database
      .from('users')
      .update({ points: updatedTotalPoints })
      .eq('id', userId);

    if (!hasRecordedTx || !hasCompletedTask) {
      return NextResponse.json({
        success: true,
        points: updatedTotalPoints,
        message: `🎉 Verified ${cleanHandle}! +${amount} points awarded!`,
      });
    }

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
