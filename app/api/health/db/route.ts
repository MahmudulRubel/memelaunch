import { NextResponse } from 'next/server';
import { insforgeAdmin, dbConnectionPoolConfig } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const { count: usersCount, error: usersErr } = await insforgeAdmin.database
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: launchesCount, error: launchesErr } = await insforgeAdmin.database
      .from('launches')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;
    const isHealthy = !usersErr && !launchesErr;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      latencyMs,
      database: {
        provider: 'InsForge PostgreSQL',
        region: dbConnectionPoolConfig.region,
        baseUrl: dbConnectionPoolConfig.baseUrl,
        connectionPooling: {
          maxConnections: dbConnectionPoolConfig.maxConnections,
          timeoutMs: dbConnectionPoolConfig.timeoutMs,
          keepAlive: dbConnectionPoolConfig.keepAlive,
        },
        encryptionAtRest: 'AES-256 (Managed Storage Disk)',
      },
      tables: {
        users: { status: usersErr ? 'error' : 'ok', count: usersCount || 0 },
        launches: { status: launchesErr ? 'error' : 'ok', count: launchesCount || 0 },
      },
    }, { status: isHealthy ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message || 'Database health check failed',
    }, { status: 500 });
  }
}
