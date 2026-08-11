/**
 * PostHog HogQL API Query Utility & Analytics Aggregator for MemeLaunch Admin
 */

interface PostHogConfig {
  personalApiKey: string;
  projectApiKey: string;
  projectId: string;
  host: string;
}

interface CacheItem<T> {
  data: T;
  expiry: number;
}

// 5-minute server-side in-memory cache
const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Returns resolved PostHog environment configuration with intelligent fallbacks.
 */
export function getPostHogConfig(): PostHogConfig {
  const personalApiKey =
    process.env.POSTHOG_PERSONAL_API_KEY ||
    process.env.POSTHOG_API ||
    '';

  const projectApiKey =
    process.env.POSTHOG_PROJECT_API_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    '';

  const rawHost =
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    'https://us.i.posthog.com';

  const host = rawHost.replace(/\/+$/, '');

  const projectId = process.env.POSTHOG_PROJECT_ID || '474543';

  return {
    personalApiKey,
    projectApiKey,
    projectId,
    host,
  };
}

/**
 * Dynamically resolves project ID if not set in environment variables.
 */
async function resolveProjectId(config: PostHogConfig): Promise<string> {
  if (config.projectId && config.projectId !== '@current') {
    return config.projectId;
  }

  if (!config.personalApiKey) {
    return '@current';
  }

  try {
    const res = await fetch(`${config.host}/api/projects/`, {
      headers: {
        Authorization: `Bearer ${config.personalApiKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return String(data.results[0].id);
      }
    }
  } catch (err) {
    console.warn('Could not auto-discover PostHog project ID:', err);
  }

  return '474543';
}

/**
 * Executes a HogQL query against PostHog Query API.
 */
export async function queryHogQL(
  hogql: string,
  config?: PostHogConfig
): Promise<{ results: any[][]; columns: string[]; types: any[] }> {
  const cfg = config || getPostHogConfig();

  if (!cfg.personalApiKey) {
    throw new Error(
      'PostHog Personal API Key is missing. Set POSTHOG_PERSONAL_API_KEY or POSTHOG_API in environment variables.'
    );
  }

  const activeProjectId = await resolveProjectId(cfg);

  const endpoint = `${cfg.host}/api/projects/${activeProjectId}/query/`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.personalApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: hogql,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `PostHog HogQL Query failed (${response.status} ${response.statusText}): ${errText}`
    );
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`PostHog HogQL Error: ${data.error}`);
  }

  return {
    results: data.results || [],
    columns: data.columns || [],
    types: data.types || [],
  };
}

/**
 * Types for analytics payload returned to dashboard
 */
export interface AnalyticsData {
  timeframe: string;
  summary: {
    totalVisitors: number;
    visitorsChangePercent: number;
    totalPageviews: number;
    pageviewsChangePercent: number;
    activeUsers30Min: number;
    bounceRate: number; // percentage e.g. 42.5
    avgSessionDurationSec: number; // seconds
  };
  visitorTrends: Array<{
    date: string;
    visitors: number;
    pageviews: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    visitors: number;
  }>;
  trafficSources: Array<{
    category: 'Organic' | 'Social' | 'Direct' | 'Referral';
    domain: string;
    count: number;
    percentage: number;
  }>;
  countries: Array<{
    country: string;
    city: string;
    visitors: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    count: number;
  }>;
  conversionFunnel: {
    landingViews: number;
    signupStarted: number;
    signupCompleted: number;
    startConversionRate: number;
    completeConversionRate: number;
  };
  customEvents: Array<{
    event: string;
    displayName: string;
    count: number;
  }>;
  cachedAt: string;
}

/**
 * Fetches lightweight real-time active users (last 30 minutes).
 */
export async function getRealtimeActiveUsers(): Promise<number> {
  try {
    const query = `
      SELECT count(DISTINCT distinct_id)
      FROM events
      WHERE timestamp >= now() - INTERVAL 30 MINUTE
    `;
    const res = await queryHogQL(query);
    return res.results?.[0]?.[0] ? Number(res.results[0][0]) : 0;
  } catch (err) {
    console.error('Failed to fetch real-time active users:', err);
    return 0;
  }
}

/**
 * Gets date range filter clauses for HogQL queries based on requested range.
 */
function getDateFilters(range: string): {
  currentFilter: string;
  previousFilter: string;
} {
  switch (range) {
    case 'today':
      return {
        currentFilter: 'timestamp >= toStartOfDay(now())',
        previousFilter:
          'timestamp >= toStartOfDay(now() - INTERVAL 1 DAY) AND timestamp < toStartOfDay(now())',
      };
    case '30d':
      return {
        currentFilter: 'timestamp >= now() - INTERVAL 30 DAY',
        previousFilter:
          'timestamp >= now() - INTERVAL 60 DAY AND timestamp < now() - INTERVAL 30 DAY',
      };
    case '90d':
      return {
        currentFilter: 'timestamp >= now() - INTERVAL 90 DAY',
        previousFilter:
          'timestamp >= now() - INTERVAL 180 DAY AND timestamp < now() - INTERVAL 90 DAY',
      };
    case '7d':
    default:
      return {
        currentFilter: 'timestamp >= now() - INTERVAL 7 DAY',
        previousFilter:
          'timestamp >= now() - INTERVAL 14 DAY AND timestamp < now() - INTERVAL 7 DAY',
      };
  }
}

/**
 * Categorizes referring domain strings into Organic, Social, Direct, or Referral.
 */
function categorizeDomain(domain: string | null): 'Organic' | 'Social' | 'Direct' | 'Referral' {
  if (!domain || domain === '$direct' || domain === 'direct' || domain.trim() === '') {
    return 'Direct';
  }

  const d = domain.toLowerCase();

  const organicKeywords = ['google', 'bing', 'duckduckgo', 'yahoo', 'baidu', 'yandex', 'ecosia', 'search'];
  if (organicKeywords.some((k) => d.includes(k))) return 'Organic';

  const socialKeywords = [
    'twitter',
    't.co',
    'x.com',
    'reddit',
    'linkedin',
    'facebook',
    'instagram',
    'tiktok',
    'youtube',
    'threads.net',
    'bsky.app',
    'producthunt',
  ];
  if (socialKeywords.some((k) => d.includes(k))) return 'Social';

  return 'Referral';
}

/**
 * Maps custom raw PostHog event names to clean human readable labels.
 */
function getEventDisplayName(event: string): string {
  const map: Record<string, string> = {
    launch_viewed: 'Launch Viewed',
    launch_upvoted: 'Launch Upvoted',
    launch_submitted: 'Launch Submitted',
    comment_posted: 'Comment Posted',
    cta_clicked: 'CTA Clicked',
    signin_started: 'Sign In Started',
    user_signed_in: 'User Signed In',
    profile_completed: 'Profile Completed',
    $pageview: 'Pageview',
    $autocapture: 'Auto Capture',
    $rageclick: 'Rage Click',
  };
  return map[event] || event;
}

/**
 * Aggregates complete analytics data from PostHog with server-side caching.
 */
export async function getAnalyticsData(
  range: string = '7d',
  forceRefresh: boolean = false
): Promise<AnalyticsData> {
  const cacheKey = `analytics_${range}`;
  const now = Date.now();

  if (!forceRefresh && cache.has(cacheKey)) {
    const item = cache.get(cacheKey)!;
    if (now < item.expiry) {
      return item.data;
    }
  }

  const { currentFilter, previousFilter } = getDateFilters(range);
  const config = getPostHogConfig();

  // Run HogQL queries in parallel for high speed
  const [
    currentSummaryRes,
    previousSummaryRes,
    activeUsersRes,
    trendsRes,
    topPagesRes,
    referrersRes,
    countriesRes,
    devicesRes,
    browsersRes,
    customEventsRes,
    sessionsRes,
    funnelStartedRes,
    funnelCompletedRes,
  ] = await Promise.allSettled([
    // 1. Current Visitors & Pageviews
    queryHogQL(
      `SELECT count(DISTINCT distinct_id) as visitors, count() as pageviews FROM events WHERE event = '$pageview' AND ${currentFilter}`,
      config
    ),

    // 2. Previous Period Visitors & Pageviews
    queryHogQL(
      `SELECT count(DISTINCT distinct_id) as visitors, count() as pageviews FROM events WHERE event = '$pageview' AND ${previousFilter}`,
      config
    ),

    // 3. Realtime active users (30 min)
    getRealtimeActiveUsers(),

    // 4. Daily trend breakdown
    queryHogQL(
      `SELECT toString(toStartOfDay(timestamp)) as date, count(DISTINCT distinct_id) as visitors, count() as pageviews FROM events WHERE event = '$pageview' AND ${currentFilter} GROUP BY date ORDER BY date ASC`,
      config
    ),

    // 5. Top pages
    queryHogQL(
      `SELECT properties.$pathname as path, count() as views, count(DISTINCT distinct_id) as visitors FROM events WHERE event = '$pageview' AND ${currentFilter} AND properties.$pathname IS NOT NULL GROUP BY path ORDER BY views DESC LIMIT 10`,
      config
    ),

    // 6. Traffic sources
    queryHogQL(
      `SELECT properties.$referring_domain as domain, count() as count FROM events WHERE event = '$pageview' AND ${currentFilter} GROUP BY domain ORDER BY count DESC LIMIT 15`,
      config
    ),

    // 7. Top Countries & Cities
    queryHogQL(
      `SELECT properties.$geoip_country_name as country, properties.$geoip_city_name as city, count(DISTINCT distinct_id) as visitors FROM events WHERE ${currentFilter} AND properties.$geoip_country_name IS NOT NULL GROUP BY country, city ORDER BY visitors DESC LIMIT 10`,
      config
    ),

    // 8. Devices
    queryHogQL(
      `SELECT properties.$device_type as device, count(DISTINCT distinct_id) as count FROM events WHERE ${currentFilter} GROUP BY device ORDER BY count DESC`,
      config
    ),

    // 9. Browsers
    queryHogQL(
      `SELECT properties.$browser as browser, count(DISTINCT distinct_id) as count FROM events WHERE ${currentFilter} AND properties.$browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 8`,
      config
    ),

    // 10. Custom events breakdown
    queryHogQL(
      `SELECT event, count() as total FROM events WHERE ${currentFilter} GROUP BY event ORDER BY total DESC LIMIT 20`,
      config
    ),

    // 11. Sessions for bounce rate and session duration calculation
    queryHogQL(
      `SELECT properties.$session_id as session_id, count() as pageviews, min(timestamp) as start_time, max(timestamp) as end_time FROM events WHERE properties.$session_id IS NOT NULL AND ${currentFilter} GROUP BY session_id LIMIT 1000`,
      config
    ),

    // 12. Signup started events
    queryHogQL(
      `SELECT count(DISTINCT distinct_id) FROM events WHERE event IN ('signin_started', 'cta_clicked') AND ${currentFilter}`,
      config
    ),

    // 13. Signup completed events
    queryHogQL(
      `SELECT count(DISTINCT distinct_id) FROM events WHERE event IN ('user_signed_in', 'profile_completed') AND ${currentFilter}`,
      config
    ),
  ]);

  // Safely extract summary numbers
  const curSummary =
    currentSummaryRes.status === 'fulfilled' ? currentSummaryRes.value.results[0] : [0, 0];
  const prevSummary =
    previousSummaryRes.status === 'fulfilled' ? previousSummaryRes.value.results[0] : [0, 0];

  const totalVisitors = Number(curSummary?.[0] || 0);
  const totalPageviews = Number(curSummary?.[1] || 0);
  const prevVisitors = Number(prevSummary?.[0] || 0);
  const prevPageviews = Number(prevSummary?.[1] || 0);

  const visitorsChangePercent =
    prevVisitors > 0
      ? Math.round(((totalVisitors - prevVisitors) / prevVisitors) * 100)
      : totalVisitors > 0
      ? 100
      : 0;

  const pageviewsChangePercent =
    prevPageviews > 0
      ? Math.round(((totalPageviews - prevPageviews) / prevPageviews) * 100)
      : totalPageviews > 0
      ? 100
      : 0;

  const activeUsers30Min =
    activeUsersRes.status === 'fulfilled' ? activeUsersRes.value : 0;

  // Process session duration & bounce rate
  let bounceRate = 0;
  let avgSessionDurationSec = 0;

  if (sessionsRes.status === 'fulfilled' && sessionsRes.value.results.length > 0) {
    const sessions = sessionsRes.value.results;
    const totalSessions = sessions.length;
    let singlePageSessions = 0;
    let totalDurationMs = 0;

    sessions.forEach((row) => {
      const pvs = Number(row[1] || 1);
      if (pvs <= 1) singlePageSessions += 1;

      if (row[2] && row[3]) {
        const start = new Date(row[2]).getTime();
        const end = new Date(row[3]).getTime();
        if (end > start) {
          totalDurationMs += end - start;
        }
      }
    });

    bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 1000) / 10 : 0;
    avgSessionDurationSec =
      totalSessions > 0 ? Math.round(totalDurationMs / totalSessions / 1000) : 0;
  }

  // Format visitor trends daily
  const visitorTrends =
    trendsRes.status === 'fulfilled'
      ? trendsRes.value.results.map((row) => ({
          date: String(row[0] || '').substring(0, 10),
          visitors: Number(row[1] || 0),
          pageviews: Number(row[2] || 0),
        }))
      : [];

  // Top Pages
  const topPages =
    topPagesRes.status === 'fulfilled'
      ? topPagesRes.value.results.map((row) => ({
          path: String(row[0] || '/'),
          views: Number(row[1] || 0),
          visitors: Number(row[2] || 0),
        }))
      : [];

  // Traffic sources with domain categorization
  const trafficMap = new Map<string, { category: 'Organic' | 'Social' | 'Direct' | 'Referral'; domain: string; count: number }>();
  let totalRefHits = 0;

  if (referrersRes.status === 'fulfilled') {
    referrersRes.value.results.forEach((row) => {
      const rawDomain = String(row[0] || 'Direct');
      const count = Number(row[1] || 0);
      totalRefHits += count;

      const category = categorizeDomain(rawDomain);
      const cleanDomain = rawDomain === '$direct' || !rawDomain ? 'Direct / Bookmark' : rawDomain;

      if (trafficMap.has(cleanDomain)) {
        trafficMap.get(cleanDomain)!.count += count;
      } else {
        trafficMap.set(cleanDomain, { category, domain: cleanDomain, count });
      }
    });
  }

  const trafficSources = Array.from(trafficMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      ...item,
      percentage: totalRefHits > 0 ? Math.round((item.count / totalRefHits) * 100) : 0,
    }));

  // Geographic countries & cities
  const countries =
    countriesRes.status === 'fulfilled'
      ? countriesRes.value.results.map((row) => ({
          country: String(row[0] || 'Unknown'),
          city: String(row[1] || 'Unknown'),
          visitors: Number(row[2] || 0),
        }))
      : [];

  // Devices
  let totalDeviceUsers = 0;
  const rawDevices =
    devicesRes.status === 'fulfilled'
      ? devicesRes.value.results.map((row) => {
          const count = Number(row[1] || 0);
          totalDeviceUsers += count;
          return {
            device: String(row[0] || 'Desktop').toUpperCase(),
            count,
          };
        })
      : [];

  const devices = rawDevices.map((d) => ({
    ...d,
    percentage: totalDeviceUsers > 0 ? Math.round((d.count / totalDeviceUsers) * 100) : 0,
  }));

  // Browsers
  const browsers =
    browsersRes.status === 'fulfilled'
      ? browsersRes.value.results.map((row) => ({
          browser: String(row[0] || 'Other'),
          count: Number(row[1] || 0),
        }))
      : [];

  // Custom Events
  const customEvents =
    customEventsRes.status === 'fulfilled'
      ? customEventsRes.value.results.map((row) => {
          const evtName = String(row[0] || '');
          return {
            event: evtName,
            displayName: getEventDisplayName(evtName),
            count: Number(row[1] || 0),
          };
        })
      : [];

  // Conversion Funnel
  const signupStarted =
    funnelStartedRes.status === 'fulfilled' && funnelStartedRes.value.results[0]?.[0]
      ? Number(funnelStartedRes.value.results[0][0])
      : 0;

  const signupCompleted =
    funnelCompletedRes.status === 'fulfilled' && funnelCompletedRes.value.results[0]?.[0]
      ? Number(funnelCompletedRes.value.results[0][0])
      : 0;

  const landingViews = totalVisitors || 1;

  const resultPayload: AnalyticsData = {
    timeframe: range,
    summary: {
      totalVisitors,
      visitorsChangePercent,
      totalPageviews,
      pageviewsChangePercent,
      activeUsers30Min,
      bounceRate,
      avgSessionDurationSec,
    },
    visitorTrends,
    topPages,
    trafficSources,
    countries,
    devices,
    browsers,
    conversionFunnel: {
      landingViews,
      signupStarted,
      signupCompleted,
      startConversionRate: Math.round((signupStarted / landingViews) * 100),
      completeConversionRate:
        signupStarted > 0 ? Math.round((signupCompleted / signupStarted) * 100) : 0,
    },
    customEvents,
    cachedAt: new Date().toISOString(),
  };

  // Update server memory cache
  cache.set(cacheKey, {
    data: resultPayload,
    expiry: now + CACHE_TTL_MS,
  });

  return resultPayload;
}
