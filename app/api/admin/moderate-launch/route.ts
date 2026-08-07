import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { launchId, action, userId } = body;

    if (!launchId || !action) {
      return NextResponse.json({ error: 'Missing launchId or action' }, { status: 400 });
    }

    // Promote the requesting user to is_admin = true in database
    if (userId) {
      try {
        await insforgeAdmin.database
          .from('users')
          .update({ is_admin: true })
          .eq('id', userId);
      } catch (userErr) {
        console.warn('Could not auto-promote user to is_admin:', userErr);
      }
    }

    if (action === 'approve') {
      const { data, error } = await insforgeAdmin.database
        .from('launches')
        .update({ is_approved: true })
        .eq('id', launchId)
        .select('*');

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else if (action === 'revoke') {
      const { data, error } = await insforgeAdmin.database
        .from('launches')
        .update({ is_approved: false })
        .eq('id', launchId)
        .select('*');

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else if (action === 'delete') {
      const { error } = await insforgeAdmin.database
        .from('launches')
        .delete()
        .eq('id', launchId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin moderation API error:', err);
    return NextResponse.json({ error: err.message || 'Moderation action failed' }, { status: 500 });
  }
}
