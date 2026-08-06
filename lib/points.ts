import { insforge } from '@/lib/insforge';
import { triggerRewardCelebration } from '@/components/points/reward-toast';

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  action_type: string;
  reference_id?: string;
  created_at: string;
}

export interface UserCompletedTask {
  id: string;
  user_id: string;
  task_key: string;
  created_at: string;
}

/**
 * Fetch current user points balance from public.users table.
 */
export async function getUserPoints(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const { data, error } = await insforge.database
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (error || !data) return 0;
    return data.points || 0;
  } catch (err) {
    console.error('Error fetching user points:', err);
    return 0;
  }
}

/**
 * Fetch set of completed task keys for a given user.
 */
export async function getUserCompletedTaskKeys(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const { data, error } = await insforge.database
      .from('user_completed_tasks')
      .select('task_key')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((t: { task_key: string }) => t.task_key);
  } catch (err) {
    console.error('Error fetching completed tasks:', err);
    return [];
  }
}

/**
 * Claim a social or one-time task (e.g. follow X, follow founder, share product).
 * Enforces anti-fraud via unique user_completed_tasks lock.
 */
export async function claimSocialTask(
  userId: string,
  taskKey: string,
  amount: number,
  actionType: string,
  handle?: string,
  openedAt?: number
): Promise<{ success: boolean; points: number; message: string }> {
  if (!userId || !taskKey) {
    return { success: false, points: 0, message: 'Invalid parameters' };
  }

  try {
    const res = await fetch('/api/points/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, taskKey, amount, actionType, handle, openedAt }),
    });

    const data = await res.json();
    return {
      success: !!data.success,
      points: typeof data.points === 'number' ? data.points : 0,
      message: data.message || 'Points process finished.',
    };
  } catch (err: any) {
    console.error('Error claiming social task:', err);
    return {
      success: false,
      points: 0,
      message: err.message || 'Failed to claim points',
    };
  }
}

/**
 * Award +1 point for liking a product (0 pts for own product, max 1 per launch).
 */
export async function rewardLike(
  userId: string,
  launchOwnerId: string,
  launchId: string
): Promise<void> {
  if (!userId || !launchId || userId === launchOwnerId) return;

  try {
    const taskKey = `like_${launchId}`;
    const res = await fetch('/api/points/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        taskKey,
        amount: 1,
        actionType: 'like_product',
      }),
    });

    const data = await res.json();
    if (data.success && !data.message?.includes('already been completed')) {
      triggerRewardCelebration({
        amount: 1,
        message: 'Product Liked! +1 Point Awarded',
        type: 'like',
      });
    }
  } catch (err) {
    console.error('Error rewarding like:', err);
  }
}

/**
 * Revoke -1 point when un-liking a product.
 */
export async function revokeLike(userId: string, launchId: string): Promise<void> {
  if (!userId || !launchId) return;

  try {
    const taskKey = `like_${launchId}`;
    const { data: existing } = await insforge.database
      .from('point_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'like_product')
      .eq('reference_id', taskKey)
      .limit(1);

    if (!existing || existing.length === 0) return;

    // Log negative transaction
    await insforge.database.from('point_transactions').insert([
      {
        user_id: userId,
        amount: -1,
        action_type: 'revoke_like_product',
        reference_id: taskKey,
      },
    ]);

    // Update user balance
    const currentPoints = await getUserPoints(userId);
    const newPoints = Math.max(0, currentPoints - 1);
    await insforge.database
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);
  } catch (err) {
    console.error('Error revoking like points:', err);
  }
}

/**
 * Award +2 points for commenting on a product (min 5 chars, 0 pts for own product, max 1 per launch).
 */
export async function rewardComment(
  userId: string,
  launchOwnerId: string,
  launchId: string,
  commentId: string,
  commentText: string
): Promise<void> {
  if (!userId || !launchId || userId === launchOwnerId) return;
  if (!commentText || commentText.trim().length < 5) return;

  try {
    const taskKey = `comment_${launchId}`;
    const res = await fetch('/api/points/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        taskKey,
        amount: 2,
        actionType: 'comment_product',
      }),
    });

    const data = await res.json();
    if (data.success && !data.message?.includes('already been completed')) {
      triggerRewardCelebration({
        amount: 2,
        message: 'Comment Posted! +2 Points Awarded',
        type: 'comment',
      });
    }
  } catch (err) {
    console.error('Error rewarding comment points:', err);
  }
}

/**
 * Revoke -2 points when deleting a comment.
 */
export async function revokeComment(userId: string, launchId: string, commentId: string): Promise<void> {
  if (!userId || !launchId) return;

  try {
    const { data: existing } = await insforge.database
      .from('point_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'comment_product')
      .eq('reference_id', launchId)
      .limit(1);

    if (!existing || existing.length === 0) return;

    await insforge.database.from('point_transactions').insert([
      {
        user_id: userId,
        amount: -2,
        action_type: 'revoke_comment_product',
        reference_id: launchId,
      },
    ]);

    const currentPoints = await getUserPoints(userId);
    const newPoints = Math.max(0, currentPoints - 2);
    await insforge.database
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);
  } catch (err) {
    console.error('Error revoking comment points:', err);
  }
}

/**
 * Deduct 15 points upon successful product launch submission.
 */
export async function deductPointsForLaunch(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'User not authenticated' };

  try {
    const currentPoints = await getUserPoints(userId);
    if (currentPoints < 15) {
      return { success: false, error: `You need 15 points to launch a product. Current balance: ${currentPoints} points.` };
    }

    // Insert deduction audit transaction
    await insforge.database.from('point_transactions').insert([
      {
        user_id: userId,
        amount: -15,
        action_type: 'launch_product',
        reference_id: null,
      },
    ]);

    // Update user balance
    const newPoints = currentPoints - 15;
    await insforge.database
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    return { success: true };
  } catch (err: any) {
    console.error('Error deducting launch points:', err);
    return { success: false, error: err.message || 'Failed to deduct points' };
  }
}
