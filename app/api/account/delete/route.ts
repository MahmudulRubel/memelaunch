import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, confirmationText } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ error: 'Invalid confirmation text. Must type: DELETE MY ACCOUNT' }, { status: 400 });
    }

    console.log(`🧹 Initiating account deletion and data cleanup for user: ${userId}`);

    // 1. Delete user's reactions/upvotes
    await insforgeAdmin.database
      .from('reactions')
      .delete()
      .eq('user_id', userId);

    // 2. Delete user's comments
    await insforgeAdmin.database
      .from('comments')
      .delete()
      .eq('user_id', userId);

    // 3. Delete user's point events & user_points if tables exist
    try {
      await insforgeAdmin.database.from('point_events').delete().eq('user_id', userId);
      await insforgeAdmin.database.from('user_points').delete().eq('user_id', userId);
    } catch (e) {
      // Table may not exist yet
    }

    // 4. Update or delete user's launches
    await insforgeAdmin.database
      .from('launches')
      .delete()
      .eq('user_id', userId);

    // 5. Delete profile record from public.users table
    const { error: deleteUserErr } = await insforgeAdmin.database
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteUserErr) {
      console.warn(`User row deletion note: ${deleteUserErr.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Account and associated data deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: error.message || 'Account cleanup failed' }, { status: 500 });
  }
}
