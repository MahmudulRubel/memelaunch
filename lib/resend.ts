import { Resend } from 'resend';
import {
  renderWelcomeEmailHtml,
  renderUpvoteEmailHtml,
  renderLaunchApprovedEmailHtml,
  renderWeeklyDigestEmailHtml,
  renderAnnouncementEmailHtml,
} from './email-templates';

// Initialize Resend SDK
export const resend = new Resend(process.env.RESEND_API_KEY || 're_xxxxxxxxx');

const DEFAULT_SENDER = 'MemeLaunch <onboarding@resend.dev>';

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

/**
 * 1. Send Welcome & Guidelines Email
 */
export async function sendWelcomeEmail(toEmail: string, userName?: string) {
  return await sendEmail({
    to: toEmail,
    subject: '🚀 Welcome to MemeLaunch! Here is how to launch & win',
    html: renderWelcomeEmailHtml(userName),
  });
}

/**
 * 2. Send Upvote / Reaction Email
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
 * 3. Send Launch Approved Email
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
 * 4. Send Weekly Performance Digest Email
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
 * 5. Send Community Update / Announcement Email
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
