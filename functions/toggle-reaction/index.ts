import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In-memory rate limiting fallback for Deno runtime
const memoryCache = new Map<string, { count: number; resetAt: number }>();

export default async function (req: Request): Promise<Response> {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Get user token
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!userToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Initialize InsForge Client
    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken,
    });

    // 3. Get current authenticated user
    const { data: userData, error: userError } = await client.auth.getCurrentUser();
    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;

    // 4. Parse request body
    const body = await req.json();
    const { launchId, emojiType } = body;

    if (!launchId || !emojiType) {
      return new Response(JSON.stringify({ error: 'Bad Request: launchId and emojiType are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['😂', '🔥', '🤔'].includes(emojiType)) {
      return new Response(JSON.stringify({ error: 'Bad Request: Invalid emojiType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Rate limiting
    let isRateLimited = false;
    const now = Date.now();
    const limitWindowMs = 10000; // 10 seconds
    const limitMaxRequests = 10;  // 10 requests per 10 seconds

    try {
      const kv = await Deno.openKv();
      const key = ['rate_limit', userId];
      const record = await kv.get<{ count: number; resetAt: number }>(key);
      
      if (record.value) {
        const { count, resetAt } = record.value;
        if (now < resetAt) {
          if (count >= limitMaxRequests) {
            isRateLimited = true;
          } else {
            await kv.set(key, { count: count + 1, resetAt }, { expireIn: limitWindowMs });
          }
        } else {
          await kv.set(key, { count: 1, resetAt: now + limitWindowMs }, { expireIn: limitWindowMs });
        }
      } else {
        await kv.set(key, { count: 1, resetAt: now + limitWindowMs }, { expireIn: limitWindowMs });
      }
    } catch (err) {
      console.warn('Deno KV failed, falling back to memory rate limiting:', err);
      // Fallback to in-memory rate limiter
      const userRate = memoryCache.get(userId);
      if (userRate) {
        if (now < userRate.resetAt) {
          if (userRate.count >= limitMaxRequests) {
            isRateLimited = true;
          } else {
            userRate.count++;
          }
        } else {
          memoryCache.set(userId, { count: 1, resetAt: now + limitWindowMs });
        }
      } else {
        memoryCache.set(userId, { count: 1, resetAt: now + limitWindowMs });
      }
    }

    if (isRateLimited) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Check existing reaction
    const { data: existingReaction, error: fetchError } = await client.database
      .from('reactions')
      .select('id')
      .eq('launch_id', launchId)
      .eq('user_id', userId)
      .eq('emoji_type', emojiType)
      .maybeSingle();

    if (fetchError) {
      return new Response(JSON.stringify({ error: `Database fetch error: ${fetchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingReaction) {
      // Toggle off: Delete existing reaction
      const { error: deleteError } = await client.database
        .from('reactions')
        .delete()
        .eq('launch_id', launchId)
        .eq('user_id', userId)
        .eq('emoji_type', emojiType);

      if (deleteError) {
        return new Response(JSON.stringify({ error: `Database delete error: ${deleteError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ action: 'removed', emojiType }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Toggle on: Insert new reaction
      const { error: insertError } = await client.database
        .from('reactions')
        .insert([
          {
            launch_id: launchId,
            user_id: userId,
            emoji_type: emojiType,
          },
        ]);

      if (insertError) {
        return new Response(JSON.stringify({ error: `Database insert error: ${insertError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ action: 'added', emojiType }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
