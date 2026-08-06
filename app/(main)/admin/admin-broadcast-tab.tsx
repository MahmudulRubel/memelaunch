'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Megaphone } from 'lucide-react';

export function AdminBroadcastTab() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body || !title) {
      alert('Please fill out Title, Subject, and Body content.');
      return;
    }

    if (!confirm('Are you sure you want to broadcast this announcement email to registered platform users?')) {
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/email/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          body,
          buttonText: ctaText || undefined,
          buttonUrl: ctaUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send announcement email.');

      setStatusMsg({
        type: 'success',
        text: `Announcement successfully dispatched to ${data.sentCount || 'all'} user(s)!`,
      });

      // Clear form
      setTitle('');
      setSubject('');
      setBody('');
      setCtaText('');
      setCtaUrl('');
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to send announcement.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-lime-400" />
          <span>Broadcast Announcement Station</span>
        </h2>
        <p className="text-zinc-400 text-xs">Compose and dispatch announcement emails directly to platform makers.</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSendAnnouncement} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Announcement Title</label>
          <input
            type="text"
            required
            placeholder="e.g. MemeLaunch Weekly Arena Roundup #1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Email Subject Line</label>
          <input
            type="text"
            required
            placeholder="e.g. 🚀 Top Memes of the Week Are Live!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Message Body</label>
          <textarea
            required
            rows={5}
            placeholder="Enter announcement text for your users..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Call to Action Button Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Explore Arena"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Call to Action Target URL (Optional)</label>
            <input
              type="url"
              placeholder="https://memelaunch.com"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="px-6 py-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send Broadcast Announcement</span>
        </button>
      </form>
    </div>
  );
}
