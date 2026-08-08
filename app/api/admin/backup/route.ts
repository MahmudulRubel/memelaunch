import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.INSFORGE_SERVER_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: 'Unauthorized backup request' }, { status: 401 });
    }

    const tables = ['users', 'launches', 'reactions', 'comments'];
    const snapshotData: Record<string, any> = {};

    for (const table of tables) {
      const { data, error } = await insforgeAdmin.database.from(table).select('*');
      if (error) {
        snapshotData[table] = { error: error.message, count: 0, rows: [] };
      } else {
        snapshotData[table] = { count: data?.length || 0, rows: data || [] };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Production database backup snapshot compiled successfully',
      timestamp: new Date().toISOString(),
      backup: snapshotData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Backup creation failed' }, { status: 500 });
  }
}
