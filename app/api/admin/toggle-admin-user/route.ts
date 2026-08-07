import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const { targetUserId, is_admin } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    const { data, error } = await insforgeAdmin.database
      .from('users')
      .update({ is_admin: !!is_admin })
      .eq('id', targetUserId)
      .select('*');

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Admin user toggle API error:', err);
    return NextResponse.json({ error: err.message || 'Toggle admin failed' }, { status: 500 });
  }
}
