/**
 * Email Template Test Script
 *
 * Sends one of each transactional email type to verify rendering and delivery.
 *
 * Usage:
 *   node scripts/test-emails.js
 *
 * Set environment variables:
 *   RESEND_API_KEY=re_xxxxx
 *   TEST_EMAIL=your-email@example.com  (defaults to onboarding@resend.dev)
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL || 'mahomudulhasanrubel@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MemeLaunch <onboarding@resend.dev>';

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required.');
  console.error('   Set it: $env:RESEND_API_KEY="re_xxxxx"');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// ─── Inline Templates (simplified versions for testing) ────────────────

const BRAND_GREEN = '#a3e635';
const BRAND_BG = '#09090b';
const CARD_BG = '#18181b';
const BORDER = '#27272a';
const APP_URL = 'https://memelaunch.com';

function emailLayout({ preheader, headerEmoji = '🚀', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>MemeLaunch</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_BG};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${CARD_BG}; border: 1px solid ${BORDER}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 32px 32px 0 32px;">
              <div style="margin-bottom: 24px; border-bottom: 1px solid ${BORDER}; padding-bottom: 16px;">
                <a href="${APP_URL}" style="font-size: 24px; font-weight: 800; color: ${BRAND_GREEN}; text-decoration: none;">MEMELAUNCH ${headerEmoji}</a>
              </div>
            </td>
          </tr>
          <tr><td style="padding: 0 32px 32px 32px;">${body}</td></tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="border-top: 1px solid ${BORDER}; padding-top: 20px;">
                <p style="font-size: 12px; color: #71717a; margin: 0;">
                  <a href="${APP_URL}/settings/notifications" style="color: #a1a1aa; text-decoration: underline;">Manage preferences</a>
                  &middot; <a href="${APP_URL}/unsubscribe" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe</a>
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

// ─── Test Email Definitions ────────────────────────────────────────────

const testEmails = [
  {
    name: '1. Welcome Email',
    subject: '🚀 Welcome to MemeLaunch! Here\'s how to launch & win',
    html: emailLayout({
      preheader: 'Welcome to MemeLaunch! Your launch pad is ready.',
      body: `
        <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px;">Welcome to the Arena, TestUser! 👋</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6;">You just joined the only launch platform where meme energy meets real product traction.</p>
        <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; color: ${BRAND_GREEN}; text-transform: uppercase; margin: 0 0 12px;">Quick Start ⚡</h3>
          <p style="color: #d4d4d8; font-size: 14px; margin: 0;">① Earn Points → ② Launch Products → ③ Track Everything</p>
        </div>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">EXPLORE THE ARENA 🚀</a>
      `,
    }),
  },
  {
    name: '2. Email Verification',
    subject: '🔐 Your MemeLaunch verification code: 847293',
    html: emailLayout({
      preheader: 'Your MemeLaunch verification code is 847293.',
      headerEmoji: '🔐',
      body: `
        <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px;">Verify Your Email</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6;">Enter this code to verify your email and unlock your account:</p>
        <div style="background: ${BRAND_BG}; border: 2px solid ${BRAND_GREEN}; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 36px; font-weight: 800; color: ${BRAND_GREEN}; font-family: monospace; letter-spacing: 8px;">847293</div>
          <div style="font-size: 12px; color: #71717a; margin-top: 8px;">Expires in 15 minutes</div>
        </div>
      `,
    }),
  },
  {
    name: '3. Password Reset',
    subject: '🔑 Reset your MemeLaunch password',
    html: emailLayout({
      preheader: 'Your MemeLaunch password reset code is 562190.',
      headerEmoji: '🔑',
      body: `
        <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px;">Reset Your Password</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6;">Use this code to set a new password:</p>
        <div style="background: ${BRAND_BG}; border: 2px solid #fbbf24; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 36px; font-weight: 800; color: #fbbf24; font-family: monospace; letter-spacing: 8px;">562190</div>
          <div style="font-size: 12px; color: #71717a; margin-top: 8px;">Expires in 15 minutes</div>
        </div>
        <a href="${APP_URL}/reset-password" style="display: block; text-align: center; background: #fbbf24; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">RESET PASSWORD →</a>
      `,
    }),
  },
  {
    name: '4. Subscription Confirmation',
    subject: '📬 Confirm your MemeLaunch subscription',
    html: emailLayout({
      preheader: 'Confirm your subscription to get weekly launches and meme-tier updates.',
      headerEmoji: '📬',
      body: `
        <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px;">Confirm Your Subscription</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6;">You're about to unlock the most unhinged product newsletter on the internet.</p>
        <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; color: ${BRAND_GREEN}; text-transform: uppercase; margin: 0 0 12px;">What You'll Get 📦</h3>
          <p style="color: #d4d4d8; font-size: 14px; margin: 0;">⚡ Weekly Top Launches · 🧠 Maker Insights · 🎯 Early Access</p>
        </div>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">YES, SUBSCRIBE ME 🎉</a>
      `,
    }),
  },
  {
    name: '5. Upvote Notification',
    subject: '🔥 DevBuilder69 upvoted MemeForge on MemeLaunch!',
    html: emailLayout({
      preheader: 'DevBuilder69 just upvoted MemeForge! You now have 42 total upvotes.',
      headerEmoji: '🔥',
      body: `
        <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 12px;">New Upvote on MemeForge!</h1>
        <p style="font-size: 15px; color: #a1a1aa;">Boom! <strong style="color: #fff;">DevBuilder69</strong> just reacted to <strong style="color: ${BRAND_GREEN};">MemeForge</strong>.</p>
        <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 13px; color: #a1a1aa; text-transform: uppercase; font-weight: 600;">Total Upvotes</div>
          <div style="font-size: 28px; font-weight: 800; color: ${BRAND_GREEN}; font-family: monospace;">42</div>
        </div>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">VIEW LAUNCH STATS 📈</a>
      `,
    }),
  },
  {
    name: '6. Launch Approved',
    subject: '🎉 CONGRATS! MemeForge is APPROVED and LIVE!',
    html: emailLayout({
      preheader: 'MemeForge is APPROVED and LIVE on MemeLaunch!',
      headerEmoji: '🎉',
      body: `
        <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px;">Your Launch is APPROVED & LIVE!</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6;">Our moderation team has <strong style="color: ${BRAND_GREEN};">APPROVED</strong> your submission for <strong style="color: #fff;">MemeForge</strong>.</p>
        <div style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24; font-weight: 600;">💡 Share your launch on X/Twitter to get your first 50 upvotes!</p>
        </div>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">VIEW YOUR LIVE LAUNCH ⚡</a>
      `,
    }),
  },
  {
    name: '7. Weekly Digest',
    subject: '📈 Your Weekly MemeLaunch Digest: +23 new upvotes!',
    html: emailLayout({
      preheader: 'Your weekly digest: +23 new upvotes, 156 views, and 34 clicks.',
      headerEmoji: '📈',
      body: `
        <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 12px;">Weekly Performance Digest</h1>
        <p style="font-size: 15px; color: #a1a1aa;">Here's how your launches performed, <strong style="color: #fff;">TestUser</strong>:</p>
        <table width="100%" cellpadding="0" cellspacing="8" border="0" style="margin: 24px 0;">
          <tr>
            <td width="50%" style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; padding: 16px; border-radius: 10px;">
              <div style="font-size: 11px; color: #a1a1aa; font-weight: 700;">NEW UPVOTES</div>
              <div style="font-size: 24px; font-weight: 800; color: ${BRAND_GREEN}; font-family: monospace;">+23</div>
            </td>
            <td width="50%" style="background: ${BRAND_BG}; border: 1px solid ${BORDER}; padding: 16px; border-radius: 10px;">
              <div style="font-size: 11px; color: #a1a1aa; font-weight: 700;">VIEWS</div>
              <div style="font-size: 24px; font-weight: 800; color: #38bdf8; font-family: monospace;">156</div>
            </td>
          </tr>
        </table>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">OPEN DASHBOARD 📊</a>
      `,
    }),
  },
  {
    name: '8. Community Announcement',
    subject: '📣 MemeLaunch v2.0 is HERE!',
    html: emailLayout({
      preheader: 'MemeLaunch v2.0 just dropped — new features, new vibes.',
      headerEmoji: '📣',
      body: `
        <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 16px;">MemeLaunch v2.0 is HERE!</h1>
        <div style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 28px;">
          <p>We've been cooking. New features include real-time analytics, AI meme generation, and a completely redesigned leaderboard.</p>
        </div>
        <a href="${APP_URL}" style="display: block; text-align: center; background: ${BRAND_GREEN}; color: ${BRAND_BG}; font-weight: 800; padding: 14px; border-radius: 10px; text-decoration: none;">EXPLORE NEW FEATURES 🚀</a>
      `,
    }),
  },
];

// ─── Runner ────────────────────────────────────────────────────────────

async function runTests() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       MEMELAUNCH EMAIL TEMPLATE TEST SUITE              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📧 Sending to: ${TEST_EMAIL}`);
  console.log(`📤 From: ${FROM_EMAIL}`);
  console.log(`🔑 API Key: ${RESEND_API_KEY.substring(0, 8)}...`);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const email of testEmails) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: TEST_EMAIL,
        subject: `[TEST] ${email.subject}`,
        html: email.html,
      });

      if (error) {
        console.log(`  ❌ ${email.name}: ${error.message}`);
        failed++;
      } else {
        console.log(`  ✅ ${email.name}: sent (id: ${data?.id})`);
        passed++;
      }
    } catch (err) {
      console.log(`  ❌ ${email.name}: ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('');
  console.log('─'.repeat(58));
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${testEmails.length} emails`);
  console.log('─'.repeat(58));

  if (failed > 0) {
    console.log('');
    console.log('⚠️  Some emails failed. Check your RESEND_API_KEY and try again.');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 All emails sent successfully! Check your inbox at:');
    console.log(`   ${TEST_EMAIL}`);
    console.log('');
  }
}

runTests();
