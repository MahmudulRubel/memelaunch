import React from 'react';
import type { Metadata } from 'next';
import { HelpCircle, Mail, Globe, Award, Sparkles, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ & Support - MemeLaunch',
  description: 'Got questions about launching on MemeLaunch? Find answers to frequently asked questions and learn how to get in touch with our team.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/support',
  },
};

export default function SupportPage() {
  const faqs = [
    {
      question: 'What exactly is MemeLaunch?',
      answer: 'MemeLaunch is a playful, high-contrast, meme-native alternative to Product Hunt. Instead of boring, buzzword-heavy headers, every product launch is represented by a single custom meme. If your meme resonates, users click it to reveal a clean detail overlay containing descriptions, screenshots, external links, and comment sections.',
    },
    {
      question: 'How do I submit my product?',
      answer: 'Just sign in with Google or GitHub, and click the "Launch a Shitpost" button on the home page. You can upload an image or select one of our 15+ viral templates. Use the built-in editor to add custom positioned text, set your product title, descriptions, category, links, and upload screenshots of your actual application.',
    },
    {
      question: 'Why is my launch not appearing in the feed?',
      answer: 'To prevent spam, illegal content, and low-effort posts from drowning out quality builds, every new launch is placed in a "Pending Approval" queue. Our admin team moderates submissions within a few hours. Once approved, your launch immediately joins the live arena.',
    },
    {
      question: 'How does the ranking system work?',
      answer: 'The feed defaults to "Trending," which sorts launches by the total number of user reactions (likes, fire, laughs, etc.). You can switch to the "Fresh" tab to view them in reverse-chronological order. Weekly rotations reset every Sunday to keep the arena fresh.',
    },
    {
      question: 'Is there a limit to how many products I can launch?',
      answer: 'We enforce a limit of one launch per product. However, if you release a major update (e.g. v2.0, new feature line), you are welcome to launch it as a fresh submission with a new meme.',
    },
    {
      question: 'How do I delete my data or account?',
      answer: 'If you want to clear your launches, reactions, comments, or completely delete your account, reach out to us at support@memelaunch.app. We process deletion requests within 48 hours.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-violet-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-violet-400">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Support Headquarters</span>
          </div>
          <h1 id="support-title" className="font-impact text-4xl md:text-5xl uppercase tracking-tight text-zinc-50">
            FAQ & <span className="text-violet-400">SUPPORT</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            Need help navigating the arena? Check the questions below or get in touch with our team directly.
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-violet-400" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              id={`faq-item-${idx + 1}`}
              className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-800 transition-all duration-300 space-y-2"
            >
              <h3 className="font-bold text-zinc-100 text-base">{faq.question}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Channels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all duration-300 flex items-start gap-4">
          <div className="p-3 bg-violet-400/10 rounded-xl text-violet-400">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-100">Email Support</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Have account issues, bugs, or copyright inquiries? Drop us an email.
            </p>
            <a 
              id="support-email-link"
              href="mailto:support@memelaunch.app" 
              className="inline-block text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors mt-2"
            >
              support@memelaunch.app
            </a>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all duration-300 flex items-start gap-4">
          <div className="p-3 bg-violet-400/10 rounded-xl text-violet-400">
            <Globe className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-100">Submit a Complaint</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Report toxic content, RLS exploits, or voter fraud directly to moderators.
            </p>
            <a 
              id="support-report-link"
              href="mailto:abuse@memelaunch.app" 
              className="inline-block text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors mt-2"
            >
              abuse@memelaunch.app
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
