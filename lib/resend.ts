import { Resend } from 'resend';
import {
  renderWelcomeEmailHtml,
  renderEmailVerificationHtml,
  renderPasswordResetEmailHtml,
  renderSubscriptionConfirmationHtml,
  renderUpvoteEmailHtml,
  renderLaunchApprovedEmailHtml,
  renderWeeklyDigestEmailHtml,
  renderAnnouncementEmailHtml,
} from './email-templates';

// Initialize Resend SDK
export const resend = new Resend(process.env.RESEND_API_KEY || 're_xxxxxxxxx');

// Sender address — set RESEND_FROM_EMAIL in production after verifying your domain in Resend dashboard.
// Default uses Resend's sandbox domain for development.
const DEFAULT_SENDER = process.env.RESEND_FROM_EMAIL || 'MemeLaunch <onboarding@resend.dev>';

/**
 * Generic email sender wrapper
 */
export async function sendEmail({
  from = DEFAULT_SENDER,
  to,
  subject,
  html,
}: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
}) {
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

// ─── Transactional Email Senders ────────────────────────────────────────

/**
 * 1. Welcome & Guidelines Email
 * Sent after a user successfully verifies their email and completes signup.
 */
export async function sendWelcomeEmail(toEmail: string, userName?: string) {
  return await sendEmail({
    to: toEmail,
    subject: '🚀 Welcome to MemeLaunch! Here\'s how to launch & win',
    html: renderWelcomeEmailHtml(userName),
  });
}

/**
 * 2. Email Verification (OTP Code)
 * Branded version of InsForge's default verification email.
 */
export async function sendEmailVerificationEmail({
  toEmail,
  code,
  userName,
}: {
  toEmail: string;
  code: string;
  userName?: string;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `🔐 Your MemeLaunch verification code: ${code}`,
    html: renderEmailVerificationHtml({ code, userName }),
  });
}

/**
 * 3. Password Reset Email
 * Branded password reset with 6-digit OTP code.
 */
export async function sendPasswordResetEmail({
  toEmail,
  code,
  userName,
}: {
  toEmail: string;
  code: string;
  userName?: string;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `🔑 Reset your MemeLaunch password`,
    html: renderPasswordResetEmailHtml({ code, userName }),
  });
}

/**
 * 4. Subscription Confirmation Email
 * Double opt-in confirmation for newsletter/product updates.
 */
export async function sendSubscriptionConfirmationEmail({
  toEmail,
  userName,
  confirmUrl,
}: {
  toEmail: string;
  userName?: string;
  confirmUrl: string;
}) {
  return await sendEmail({
    to: toEmail,
    subject: '📬 Confirm your MemeLaunch subscription',
    html: renderSubscriptionConfirmationHtml({ userName, confirmUrl }),
  });
}

/**
 * 5. Upvote / Reaction Notification Email
 */
export async function sendUpvoteNotificationEmail({
  toEmail,
  productName,
  reacterName,
  totalUpvotes,
}: {
  toEmail: string;
  productName: string;
  reacterName: string;
  totalUpvotes: number;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `🔥 ${reacterName} upvoted ${productName} on MemeLaunch!`,
    html: renderUpvoteEmailHtml({ productName, reacterName, totalUpvotes }),
  });
}

/**
 * 6. Launch Approved Email
 */
export async function sendLaunchApprovedEmail({
  toEmail,
  productName,
}: {
  toEmail: string;
  productName: string;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `🎉 CONGRATS! ${productName} is APPROVED and LIVE!`,
    html: renderLaunchApprovedEmailHtml({ productName }),
  });
}

/**
 * 7. Weekly Performance Digest Email
 */
export async function sendWeeklyDigestEmail({
  toEmail,
  makerName,
  weeklyUpvotes,
  weeklyViews,
  weeklyClicks,
  userPoints,
}: {
  toEmail: string;
  makerName?: string;
  weeklyUpvotes?: number;
  weeklyViews?: number;
  weeklyClicks?: number;
  userPoints?: number;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `📈 Your Weekly MemeLaunch Digest: +${weeklyUpvotes || 0} new upvotes!`,
    html: renderWeeklyDigestEmailHtml({
      makerName,
      weeklyUpvotes,
      weeklyViews,
      weeklyClicks,
      userPoints,
    }),
  });
}

/**
 * 8. Community Update / Announcement Email
 */
export async function sendCommunityBroadcastEmail({
  toEmail,
  subject,
  title,
  bodyHtml,
  ctaText,
  ctaUrl,
}: {
  toEmail: string | string[];
  subject: string;
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return await sendEmail({
    to: toEmail,
    subject: `📣 ${subject}`,
    html: renderAnnouncementEmailHtml({ title, bodyHtml, ctaText, ctaUrl }),
  });
}
