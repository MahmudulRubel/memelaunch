/**
 * HTML Email Template Generators for MemeLaunch Notifications
 */

export function renderWelcomeEmailHtml(userName: string = 'Builder') {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 24px; border-bottom: 1px solid #27272a; pb-16; padding-bottom: 16px;">
          <span style="font-size: 24px; font-weight: 800; color: #a3e635; tracking: -0.05em; letter-spacing: -0.5px;">MEMELAUNCH 🚀</span>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 12px; margin-top: 0;">Welcome to the Arena, ${userName}! 👋</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
          MemeLaunch is where indie builders, creators, and founders launch products powered by community energy and meme culture.
        </p>

        <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #a3e635; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px;">Quick Start Guide ⚡</h3>
          <ul style="margin: 0; padding-left: 20px; color: #d4d4d8; font-size: 14px; line-height: 1.8;">
            <li><strong>Earn Points</strong>: Like launches (+1 pt), comment (+2 pts), share (+5 pts).</li>
            <li><strong>Launch Products</strong>: Spend 15 points to list your product live in the Arena.</li>
            <li><strong>Track Live Telemetry</strong>: Monitor upvotes, views, and clicks on your profile dashboard.</li>
          </ul>
        </div>

        <a href="https://memelaunch.com" style="display: block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box; letter-spacing: 0.5px;">
          EXPLORE THE ARENA 🚀
        </a>
      </div>
    </div>
  `;
}

export function renderUpvoteEmailHtml({
  productName,
  reacterName,
  totalUpvotes,
}: {
  productName: string;
  reacterName: string;
  totalUpvotes: number;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 16px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 🔥</span>
        </div>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px; margin-top: 0;">New Upvote on ${productName}!</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 20px;">
          Boom! <strong style="color: #ffffff;">${reacterName}</strong> just reacted to your launch <strong style="color: #a3e635;">${productName}</strong>.
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <span style="color: #a1a1aa; font-size: 13px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Total Product Upvotes</span>
          <span style="font-size: 28px; font-weight: 800; color: #a3e635; font-family: monospace;">${totalUpvotes}</span>
        </div>

        <a href="https://memelaunch.com" style="display: block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          VIEW LAUNCH STATS 📈
        </a>
      </div>
    </div>
  `;
}

export function renderLaunchApprovedEmailHtml({ productName }: { productName: string }) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 16px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 🎉</span>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 12px; margin-top: 0;">Your launch is APPROVED & LIVE!</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
          Great news! Our moderation team has reviewed and <strong style="color: #a3e635;">APPROVED</strong> your submission for <strong style="color: #ffffff;">${productName}</strong>. It is now active on the public Arena feed!
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24; font-weight: 600; line-height: 1.5;">
            💡 Pro-Tip: Share your launch link on X/Twitter and LinkedIn to drive your first 50 upvotes and rank on today's leaderboard.
          </p>
        </div>

        <a href="https://memelaunch.com" style="display: block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          VIEW YOUR LIVE LAUNCH ⚡
        </a>
      </div>
    </div>
  `;
}

export function renderWeeklyDigestEmailHtml({
  makerName = 'Builder',
  weeklyUpvotes = 0,
  weeklyViews = 0,
  weeklyClicks = 0,
  userPoints = 0,
}: {
  makerName?: string;
  weeklyUpvotes?: number;
  weeklyViews?: number;
  weeklyClicks?: number;
  userPoints?: number;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 16px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 📈</span>
        </div>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px;">Weekly Performance Digest</h1>
        <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 24px;">
          Here is how your launches performed over the last 7 days, <strong style="color: #ffffff;">${makerName}</strong>:
        </p>

        <div style="margin-bottom: 24px;">
          <table width="100%" cellPadding="0" cellSpacing="8" border={0}>
            <tr>
              <td width="50%" style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
                <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; letter-spacing: 0.5px;">NEW UPVOTES</div>
                <div style="font-size: 24px; font-weight: 800; color: #a3e635; font-family: monospace; margin-top: 4px;">+${weeklyUpvotes}</div>
              </td>
              <td width="50%" style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
                <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; letter-spacing: 0.5px;">PRODUCT VIEWS</div>
                <div style="font-size: 24px; font-weight: 800; color: #38bdf8; font-family: monospace; margin-top: 4px;">${weeklyViews}</div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
                <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; letter-spacing: 0.5px;">LINK CLICKS</div>
                <div style="font-size: 24px; font-weight: 800; color: #fbbf24; font-family: monospace; margin-top: 4px;">${weeklyClicks}</div>
              </td>
              <td width="50%" style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
                <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; letter-spacing: 0.5px;">MAKER POINTS</div>
                <div style="font-size: 24px; font-weight: 800; color: #f43f5e; font-family: monospace; margin-top: 4px;">${userPoints}</div>
              </td>
            </tr>
          </table>
        </div>

        <a href="https://memelaunch.com" style="display: block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          OPEN ANALYTICS DASHBOARD 📊
        </a>
      </div>
    </div>
  `;
}

export function renderAnnouncementEmailHtml({
  title,
  bodyHtml,
  ctaText = 'EXPLORE NEW FEATURES 🚀',
  ctaUrl = 'https://memelaunch.com',
}: {
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 16px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 📣</span>
        </div>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 16px;">${title}</h1>
        
        <div style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 28px;">
          ${bodyHtml}
        </div>

        <a href="${ctaUrl}" style="display: block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          ${ctaText}
        </a>
      </div>
    </div>
  `;
}
