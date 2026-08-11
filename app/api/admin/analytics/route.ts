import { NextResponse } from 'next/server';
import { getAnalyticsData, getRealtimeActiveUsers } from '@/lib/posthog';
import { insforgeAdmin } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const realtimeOnly = searchParams.get('realtime') === 'true';
    const forceRefresh = searchParams.get('refresh') === 'true';
    const userId = searchParams.get('userId') || request.headers.get('x-user-id');

    // Admin Auth verification
    if (userId) {
      const superAdminIds = [
        '2ab40b92-175e-4815-8e5f-0d6b58c5c94d',
        '5f844f38-e651-4b83-a6b7-924afd4d95b7',
        'f7eea2d5-5153-4604-bc36-7bed011078e1',
      ];

      const isSuperId = superAdminIds.includes(userId);

      if (isSuperId) {
        // Ensure super admin ID is synced in database asynchronously
        try {
          await insforgeAdmin.database
            .from('users')
            .update({ is_admin: true })
            .eq('id', userId);
        } catch (_) {}
      } else {
        const { data: user } = await insforgeAdmin.database
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();

        const isAdminFlag = user?.is_admin === true;

        if (!isAdminFlag) {
          return NextResponse.json(
            { error: 'Unauthorized: Admin privileges required.' },
            { status: 403 }
          );
        }
      }
    }

    // Lightweight real-time ping endpoint for 60s auto-refresh card
    if (realtimeOnly) {
      const activeUsers30Min = await getRealtimeActiveUsers();
      return NextResponse.json({
        success: true,
        activeUsers30Min,
        timestamp: new Date().toISOString(),
      });
    }

    // Full analytics payload
    const data = await getAnalyticsData(range, forceRefresh);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('PostHog Analytics API Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to query PostHog HogQL analytics endpoint.',
      },
      { status: 500 }
    );
  }
}
