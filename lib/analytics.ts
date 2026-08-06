import { insforge } from './insforge';

/**
 * Tracks a view event for a specific launch/product.
 * Uses sessionStorage to prevent duplicate view increments within the same session.
 */
export async function trackLaunchView(launchId: string): Promise<void> {
  if (!launchId || typeof window === 'undefined') return;

  const storageKey = `memelaunch_viewed_${launchId}`;
  if (sessionStorage.getItem(storageKey)) {
    return; // Already tracked in this session
  }

  try {
    sessionStorage.setItem(storageKey, 'true');
    // Call RPC function to increment views_count
    const { error } = await insforge.database.rpc('increment_launch_views', {
      launch_id: launchId,
    });

    if (error) {
      // Fallback direct update if RPC function is not registered
      const { data: current } = await insforge.database
        .from('launches')
        .select('views_count')
        .eq('id', launchId)
        .single();
      
      const newCount = ((current as any)?.views_count || 0) + 1;
      await insforge.database
        .from('launches')
        .update({ views_count: newCount })
        .eq('id', launchId);
    }
  } catch (err) {
    console.error('Failed to track launch view:', err);
  }
}

/**
 * Tracks an outbound link click for a launch/product.
 */
export async function trackLaunchClick(launchId: string): Promise<void> {
  if (!launchId) return;

  try {
    const { error } = await insforge.database.rpc('increment_launch_clicks', {
      launch_id: launchId,
    });

    if (error) {
      // Fallback direct update
      const { data: current } = await insforge.database
        .from('launches')
        .select('clicks_count')
        .eq('id', launchId)
        .single();
      
      const newCount = ((current as any)?.clicks_count || 0) + 1;
      await insforge.database
        .from('launches')
        .update({ clicks_count: newCount })
        .eq('id', launchId);
    }
  } catch (err) {
    console.error('Failed to track launch click:', err);
  }
}
