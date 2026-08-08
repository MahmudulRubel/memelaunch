/**
 * HTML Email Template Generators for MemeLaunch Transactional Emails
 *
 * All templates share a consistent layout with:
 * - Full HTML document skeleton for inbox rendering
 * - Hidden preheader text (preview snippet in inbox list)
 * - Branded MemeLaunch header
 * - Unsubscribe / manage preferences footer
 */

const BRAND_GREEN = '#a3e635';
const BRAND_BG = '#09090b';
const CARD_BG = '#18181b';
const BORDER = '#27272a';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#a1a1aa';
const TEXT_MUTED = '#71717a';
const ACCENT_BLUE = '#38bdf8';
const ACCENT_AMBER = '#fbbf24';
const ACCENT_ROSE = '#f43f5e';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://memelaunch.com';

// ─── Shared Email Layout ───────────────────────────────────────────────

/**
 * Wraps any email body in a full HTML document with preheader text,
 * branded header, and unsubscribe footer.
 */
export function emailLayout({
  preheader,
  headerEmoji = '🚀',
  body,
}: {
  preheader: string;
  headerEmoji?: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>MemeLaunch</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    img { border: 0; line-height: 100%; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${BRAND_GREEN}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .email-card { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; color: #f4f4f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${preheader}${'&zwnj;&nbsp;'.repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_BG};">
    <tr>
      <td align="center" style="padding: 40px 20px;" class="email-container">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${CARD_BG}; border: 1px solid ${BORDER}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" class="email-card">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0 32px;">
              <div style="margin-bottom: 24px; border-bottom: 1px solid ${BORDER}; padding-bottom: 16px;">
                <a href="${APP_URL}" style="font-size: 24px; font-weight: 800; color: ${BRAND_GREEN}; text-decoration: none; letter-spacing: -0.5px;">MEMELAUNCH ${headerEmoji}</a>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="border-top: 1px solid ${BORDER}; padding-top: 20px; margin-top: 8px;">
                <p style="font-size: 12px; color: ${TEXT_MUTED}; margin: 0 0 8px 0; line-height: 1.5;">
                  You're receiving this because you have a MemeLaunch account.
                </p>
                <p style="font-size: 12px; color: ${TEXT_MUTED}; margin: 0; line-height: 1.5;">
                  <a href="${APP_URL}/settings/notifications" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">Manage email preferences</a>
                  &nbsp;&middot;&nbsp;
                  <a href="${APP_URL}/unsubscribe" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">Unsubscribe</a>
                  &nbsp;&middot;&nbsp;
                  <a href="${APP_URL}" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">MemeLaunch</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── CTA Button Helper ─────────────────────────────────────────────────

function ctaButton(text: string, href: string, color: string = BRAND_GREEN) {
  const textColor = color === BRAND_GREEN ? BRAND_BG : TEXT_PRIMARY;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding-top: 8px;">
      <a href="${href}" style="display: inline-block; width: 100%; max-width: 400px; text-align: center; background-color: ${color}; color: ${textColor}; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; letter-spacing: 0.5px; box-sizing: border-box;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Stat Card Helper ───────────────────────────────────────────────────

function statCard(label: string, value: string | number, color: string = BRAND_GREEN) {
  return `<td width="50%" style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; padding: 16px; border-radius: 10px;">
  <div style="font-size: 11px; color: ${TEXT_SECONDARY}; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${label}</div>
  <div style="font-size: 24px; font-weight: 800; color: ${color}; font-family: monospace; margin-top: 4px;">${value}</div>
</td>`;
}

// ═══════════════════════════════════════════════════════════════════════
// 1. WELCOME EMAIL
// ═══════════════════════════════════════════════════════════════════════

export function renderWelcomeEmailHtml(userName: string = 'Builder') {
  return emailLayout({
    preheader: `Welcome to MemeLaunch, ${userName}! Your launch pad is ready. Here's how to get your first 50 upvotes.`,
    headerEmoji: '🚀',
    body: `
      <h1 style="font-size: 24px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">Welcome to the Arena, ${userName}! 👋</h1>
      <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_SECONDARY}; margin-bottom: 24px;">
        You just joined the only launch platform where meme energy meets real product traction. No gatekeepers, no pay-to-play — just raw community support.
      </p>

      <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: ${BRAND_GREEN}; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px;">Your 3-Step Quick Start ⚡</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${BORDER};">
              <span style="color: ${BRAND_GREEN}; font-weight: 800; font-size: 18px; margin-right: 12px;">①</span>
              <span style="color: #d4d4d8; font-size: 14px;"><strong style="color: ${TEXT_PRIMARY};">Earn Points</strong> — Like launches (+1 pt), comment (+2 pts), share (+5 pts)</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${BORDER};">
              <span style="color: ${ACCENT_BLUE}; font-weight: 800; font-size: 18px; margin-right: 12px;">②</span>
              <span style="color: #d4d4d8; font-size: 14px;"><strong style="color: ${TEXT_PRIMARY};">Launch Your Product</strong> — Spend 15 points to go live in the Arena</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: ${ACCENT_AMBER}; font-weight: 800; font-size: 18px; margin-right: 12px;">③</span>
              <span style="color: #d4d4d8; font-size: 14px;"><strong style="color: ${TEXT_PRIMARY};">Track Everything</strong> — Real-time upvotes, views, and clicks on your dashboard</span>
            </td>
          </tr>
        </table>
      </div>

      ${ctaButton('EXPLORE THE ARENA 🚀', APP_URL)}
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 2. EMAIL VERIFICATION (OTP Code)
// ═══════════════════════════════════════════════════════════════════════

export function renderEmailVerificationHtml({
  code,
  userName = 'Builder',
}: {
  code: string;
  userName?: string;
}) {
  return emailLayout({
    preheader: `Your MemeLaunch verification code is ${code}. Enter it to activate your account.`,
    headerEmoji: '🔐',
    body: `
      <h1 style="font-size: 24px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">Verify Your Email</h1>
      <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_SECONDARY}; margin-bottom: 24px;">
        Hey ${userName} — you're one step from the Arena. Enter this code to verify your email and unlock your account:
      </p>

      <div style="background: ${BRAND_BG}; border: 2px solid ${BRAND_GREEN}; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 800; color: ${BRAND_GREEN}; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace; letter-spacing: 8px;">${code}</div>
        <div style="font-size: 12px; color: ${TEXT_MUTED}; margin-top: 8px;">Expires in 15 minutes</div>
      </div>

      <p style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5; margin-bottom: 0;">
        If you didn't create a MemeLaunch account, you can safely ignore this email. Someone may have entered your email by mistake.
      </p>
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 3. PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════════

export function renderPasswordResetEmailHtml({
  code,
  userName = 'Builder',
}: {
  code: string;
  userName?: string;
}) {
  return emailLayout({
    preheader: `Your MemeLaunch password reset code is ${code}. This code expires in 15 minutes.`,
    headerEmoji: '🔑',
    body: `
      <h1 style="font-size: 24px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">Reset Your Password</h1>
      <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_SECONDARY}; margin-bottom: 24px;">
        No worries, ${userName} — it happens to the best of us. Use this code to set a new password and get back to building:
      </p>

      <div style="background: ${BRAND_BG}; border: 2px solid ${ACCENT_AMBER}; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 800; color: ${ACCENT_AMBER}; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace; letter-spacing: 8px;">${code}</div>
        <div style="font-size: 12px; color: ${TEXT_MUTED}; margin-top: 8px;">Expires in 15 minutes</div>
      </div>

      ${ctaButton('RESET PASSWORD →', `${APP_URL}/reset-password`, ACCENT_AMBER)}

      <p style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5; margin-top: 20px; margin-bottom: 0;">
        If you didn't request a password reset, you can safely ignore this email. Your account is secure — no changes have been made.
      </p>
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 4. SUBSCRIPTION CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════

export function renderSubscriptionConfirmationHtml({
  userName = 'Builder',
  confirmUrl,
}: {
  userName?: string;
  confirmUrl: string;
}) {
  return emailLayout({
    preheader: `Confirm your subscription to get weekly product launches, maker insights, and meme-tier updates from MemeLaunch.`,
    headerEmoji: '📬',
    body: `
      <h1 style="font-size: 24px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">Confirm Your Subscription</h1>
      <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_SECONDARY}; margin-bottom: 24px;">
        Hey ${userName} — you're about to unlock the most unhinged product newsletter on the internet. Weekly launches, maker war stories, and memes that actually convert.
      </p>

      <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: ${BRAND_GREEN}; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px;">What You'll Get 📦</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 6px 0; color: #d4d4d8; font-size: 14px;">
              ⚡ <strong style="color: ${TEXT_PRIMARY};">Weekly Top Launches</strong> — The products everyone's talking about
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #d4d4d8; font-size: 14px;">
              🧠 <strong style="color: ${TEXT_PRIMARY};">Maker Insights</strong> — Growth tactics from founders who ship
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #d4d4d8; font-size: 14px;">
              🎯 <strong style="color: ${TEXT_PRIMARY};">Early Access</strong> — First dibs on new MemeLaunch features
            </td>
          </tr>
        </table>
      </div>

      ${ctaButton('YES, SUBSCRIBE ME 🎉', confirmUrl)}

      <p style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5; margin-top: 20px; margin-bottom: 0;">
        If you didn't sign up for MemeLaunch updates, just ignore this email. No hard feelings.
      </p>
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 5. UPVOTE NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════

export function renderUpvoteEmailHtml({
  productName,
  reacterName,
  totalUpvotes,
}: {
  productName: string;
  reacterName: string;
  totalUpvotes: number;
}) {
  return emailLayout({
    preheader: `${reacterName} just upvoted ${productName}! You now have ${totalUpvotes} total upvotes.`,
    headerEmoji: '🔥',
    body: `
      <h1 style="font-size: 22px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">New Upvote on ${productName}!</h1>
      <p style="font-size: 15px; color: ${TEXT_SECONDARY}; line-height: 1.6; margin-bottom: 20px;">
        Boom! <strong style="color: ${TEXT_PRIMARY};">${reacterName}</strong> just reacted to your launch <strong style="color: ${BRAND_GREEN};">${productName}</strong>.
      </p>

      <div style="background-color: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <span style="color: ${TEXT_SECONDARY}; font-size: 13px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Total Product Upvotes</span>
        <span style="font-size: 28px; font-weight: 800; color: ${BRAND_GREEN}; font-family: monospace;">${totalUpvotes}</span>
      </div>

      ${ctaButton('VIEW LAUNCH STATS 📈', APP_URL)}
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 6. LAUNCH APPROVED
// ═══════════════════════════════════════════════════════════════════════

export function renderLaunchApprovedEmailHtml({ productName }: { productName: string }) {
  return emailLayout({
    preheader: `${productName} is APPROVED and LIVE on MemeLaunch! Share it to get your first 50 upvotes.`,
    headerEmoji: '🎉',
    body: `
      <h1 style="font-size: 24px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-bottom: 12px; margin-top: 0;">Your Launch is APPROVED & LIVE!</h1>
      <p style="font-size: 15px; color: ${TEXT_SECONDARY}; line-height: 1.6; margin-bottom: 24px;">
        Great news! Our moderation team has reviewed and <strong style="color: ${BRAND_GREEN};">APPROVED</strong> your submission for <strong style="color: ${TEXT_PRIMARY};">${productName}</strong>. It's now active on the public Arena feed!
      </p>

      <div style="background-color: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: ${ACCENT_AMBER}; font-weight: 600; line-height: 1.5;">
          💡 Pro-Tip: Share your launch link on X/Twitter and LinkedIn to drive your first 50 upvotes and rank on today's leaderboard.
        </p>
      </div>

      ${ctaButton('VIEW YOUR LIVE LAUNCH ⚡', APP_URL)}
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 7. WEEKLY PERFORMANCE DIGEST
// ═══════════════════════════════════════════════════════════════════════

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
  return emailLayout({
    preheader: `Your weekly MemeLaunch digest: +${weeklyUpvotes} new upvotes, ${weeklyViews} views, and ${weeklyClicks} clicks this week.`,
    headerEmoji: '📈',
    body: `
      <h1 style="font-size: 22px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-top: 0; margin-bottom: 12px;">Weekly Performance Digest</h1>
      <p style="font-size: 15px; color: ${TEXT_SECONDARY}; margin-bottom: 24px;">
        Here's how your launches performed over the last 7 days, <strong style="color: ${TEXT_PRIMARY};">${makerName}</strong>:
      </p>

      <div style="margin-bottom: 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="8" border="0">
          <tr>
            ${statCard('NEW UPVOTES', `+${weeklyUpvotes}`, BRAND_GREEN)}
            ${statCard('PRODUCT VIEWS', weeklyViews, ACCENT_BLUE)}
          </tr>
          <tr>
            ${statCard('LINK CLICKS', weeklyClicks, ACCENT_AMBER)}
            ${statCard('MAKER POINTS', userPoints, ACCENT_ROSE)}
          </tr>
        </table>
      </div>

      ${ctaButton('OPEN ANALYTICS DASHBOARD 📊', APP_URL)}
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 8. COMMUNITY ANNOUNCEMENT / BROADCAST
// ═══════════════════════════════════════════════════════════════════════

export function renderAnnouncementEmailHtml({
  title,
  bodyHtml,
  ctaText = 'EXPLORE NEW FEATURES 🚀',
  ctaUrl = APP_URL,
}: {
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return emailLayout({
    preheader: title,
    headerEmoji: '📣',
    body: `
      <h1 style="font-size: 22px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-top: 0; margin-bottom: 16px;">${title}</h1>
      
      <div style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 28px;">
        ${bodyHtml}
      </div>

      ${ctaButton(ctaText, ctaUrl)}
    `,
  });
}
