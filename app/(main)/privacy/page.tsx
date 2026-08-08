'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Eye, 
  Database, 
  Cookie, 
  FileText, 
  UserCheck, 
  Send, 
  CheckCircle2, 
  Sliders,
  Server,
  Building
} from 'lucide-react';

export default function PrivacyPage() {
  const [requestType, setRequestType] = useState('export');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGdprSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  const handleOpenCookieSettings = () => {
    if (typeof window !== 'undefined' && (window as any).openCookieConsentModal) {
      (window as any).openCookieConsentModal();
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy & Data Rights Hub',
    description: 'Comprehensive Privacy Policy, Cookie Disclosures, GDPR Rights Portal, and Data Processing Agreement for MemeLaunch.',
    url: 'https://memelaunch.insforge.app/privacy',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          id="privacy-back-btn"
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Last Updated: August 2026
        </span>
      </div>

      {/* Page Title Hero Banner */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-10 shadow-brutal space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-400 text-zinc-950 border-2 border-black flex items-center justify-center font-black text-2xl shadow-brutal-sm shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-black uppercase text-zinc-50 tracking-tight">
              Privacy & Data <span className="text-cyan-400">Rights Hub</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Transparent privacy policies, cookie controls, GDPR compliance, and sub-processor disclosures.
            </p>
          </div>
        </div>

        {/* Sub-Nav Jump Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-800">
          <a
            id="nav-jump-privacy"
            href="#privacy-policy"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-cyan-400 hover:border-cyan-400 transition-all"
          >
            1. Privacy Policy
          </a>
          <a
            id="nav-jump-cookies"
            href="#cookie-policy"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-[#ffe600] hover:border-[#ffe600] transition-all"
          >
            2. Cookie Policy
          </a>
          <a
            id="nav-jump-gdpr"
            href="#gdpr-rights"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-emerald-400 hover:border-emerald-400 transition-all"
          >
            3. GDPR Rights & Requests
          </a>
          <a
            id="nav-jump-dpa"
            href="#dpa-subprocessors"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-purple-400 hover:border-purple-400 transition-all"
          >
            4. DPA & Sub-Processors
          </a>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">

        {/* SECTION 1: PRIVACY POLICY */}
        <section
          id="privacy-policy"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-cyan-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              1
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              Privacy Policy
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              When you interact with MemeLaunch (“Platform”, “we”, or “us”), we collect limited necessary information to provide the product launch arena:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-cyan-400" /> Account Data
                </h3>
                <p className="text-xs text-zinc-400">Email address, profile display name, avatar, and OAuth provider tokens via Google or GitHub.</p>
              </div>
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-cyan-400" /> Launch Content
                </h3>
                <p className="text-xs text-zinc-400">Product names, URLs, taglines, meme captions, uploaded logos, screenshots, and comments.</p>
              </div>
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-cyan-400" /> Points & Audits
                </h3>
                <p className="text-xs text-zinc-400">Point transaction history, verified social handles, reaction votes, and anti-fraud timestamps.</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2 text-xs">
              <h4 className="font-black uppercase text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Data Retention & Security Measures
              </h4>
              <p className="text-zinc-400">
                All data is encrypted in transit via TLS 1.3 and at rest using AES-256 encryption on Postgres storage. We retain active account data as long as your account remains active. Deleted accounts are purged from primary databases within 30 days.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: COOKIE POLICY */}
        <section
          id="cookie-policy"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-[#ffe600] text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
                2
              </span>
              <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
                Cookie Policy & Consent
              </h2>
            </div>
            <button
              id="privacy-open-cookie-settings-btn"
              onClick={handleOpenCookieSettings}
              className="px-3.5 py-2 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-brutal-sm hover:bg-yellow-400 transition-all flex items-center gap-1.5"
            >
              <Sliders className="h-4 w-4" /> Manage Cookie Preferences
            </button>
          </div>

          <div className="space-y-4">
            <p>
              MemeLaunch uses essential cookies to preserve your authenticated session and optional performance telemetry to keep the platform fast and responsive.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-2 border-black rounded-2xl overflow-hidden">
                <thead className="bg-zinc-900 text-zinc-100 font-black uppercase">
                  <tr>
                    <th className="p-3 border-b border-zinc-800">Cookie / Storage Key</th>
                    <th className="p-3 border-b border-zinc-800">Category</th>
                    <th className="p-3 border-b border-zinc-800">Duration</th>
                    <th className="p-3 border-b border-zinc-800">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-mono text-cyan-400 font-bold">insforge_session</td>
                    <td className="p-3 font-bold text-zinc-100">Essential</td>
                    <td className="p-3">Session / 30 days</td>
                    <td className="p-3">Maintains secure user login state and auth token.</td>
                  </tr>
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-mono text-cyan-400 font-bold">memelaunch_cookie_consent</td>
                    <td className="p-3 font-bold text-zinc-100">Essential</td>
                    <td className="p-3">1 Year</td>
                    <td className="p-3">Stores your cookie consent preferences locally.</td>
                  </tr>
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-mono text-yellow-400 font-bold">ph_* (PostHog)</td>
                    <td className="p-3 font-bold text-yellow-400">Analytics</td>
                    <td className="p-3">1 Year</td>
                    <td className="p-3">Anonymous pageview telemetry & UI performance metrics.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: GDPR COMPLIANCE & RIGHTS PORTAL */}
        <section
          id="gdpr-rights"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-emerald-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              3
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              GDPR Compliance & Data Rights Portal
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              If you reside in the European Union (EU) or European Economic Area (EEA), you enjoy specific statutory rights under Articles 15–22 of the General Data Protection Regulation (GDPR):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 uppercase">Right to Access (Art. 15)</span>
                <p className="text-zinc-400">Request a complete export copy of all personal data held about you.</p>
              </div>
              <div className="p-3 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 uppercase">Right to Erasure / Be Forgotten (Art. 17)</span>
                <p className="text-zinc-400">Request permanent deletion of your account and submitted content.</p>
              </div>
              <div className="p-3 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 uppercase">Right to Rectification (Art. 16)</span>
                <p className="text-zinc-400">Correct any inaccurate account details or incorrect launch data.</p>
              </div>
              <div className="p-3 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 uppercase">Right to Data Portability (Art. 20)</span>
                <p className="text-zinc-400">Receive your data in a structured, machine-readable JSON format.</p>
              </div>
            </div>

            {/* Interactive Data Subject Request Form */}
            <div className="mt-6 p-6 bg-zinc-900 border-2 border-black rounded-2xl space-y-4">
              <h3 className="font-heading text-lg font-black text-zinc-50 uppercase flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-400" /> Submit a GDPR Data Request
              </h3>

              {isSubmitted ? (
                <div id="gdpr-success-msg" className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl text-emerald-200 text-xs space-y-2 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="h-5 w-5" /> Request Received Successfully
                  </div>
                  <p>
                    Thank you! Your GDPR data subject request has been logged. Our Data Protection Officer (<span className="font-mono text-white">dpo@memelaunch.app</span>) will fulfill your request within 30 days.
                  </p>
                </div>
              ) : (
                <form id="gdpr-request-form" onSubmit={handleGdprSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold uppercase text-zinc-200">Request Type</label>
                      <select
                        id="gdpr-select-request-type"
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border-2 border-black rounded-xl text-zinc-100 font-bold focus:outline-none focus:border-emerald-400"
                      >
                        <option value="export">Export My Data (JSON Copy)</option>
                        <option value="delete">Delete My Account & All Data</option>
                        <option value="rectify">Rectify / Correct Information</option>
                        <option value="restrict">Restrict Processing</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold uppercase text-zinc-200">Account Email</label>
                      <input
                        id="gdpr-input-email"
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border-2 border-black rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase text-zinc-200">Additional Details (Optional)</label>
                    <textarea
                      id="gdpr-input-details"
                      rows={3}
                      placeholder="Specify any particular launches or profile details..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full p-2.5 bg-zinc-950 border-2 border-black rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-400 resize-none"
                    />
                  </div>
                  <button
                    id="gdpr-request-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-400 text-zinc-950 border-2 border-black rounded-xl font-black text-xs uppercase shadow-brutal-sm hover:bg-emerald-300 transition-all flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Submit Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA PROCESSING AGREEMENT & SUB-PROCESSORS */}
        <section
          id="dpa-subprocessors"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-purple-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              4
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              Data Processing Agreement & Sub-Processors
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              MemeLaunch engages trusted cloud infrastructure sub-processors to store data, execute serverless logic, deliver static assets, and analyze performance.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-2 border-black rounded-2xl overflow-hidden">
                <thead className="bg-zinc-900 text-zinc-100 font-black uppercase">
                  <tr>
                    <th className="p-3 border-b border-zinc-800">Sub-Processor</th>
                    <th className="p-3 border-b border-zinc-800">Service Provided</th>
                    <th className="p-3 border-b border-zinc-800">Location</th>
                    <th className="p-3 border-b border-zinc-800">Security Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-bold text-zinc-100 flex items-center gap-1.5">
                      <Database className="h-4 w-4 text-purple-400" /> InsForge / Postgres
                    </td>
                    <td className="p-3">Database, Row-Level Security, Auth Tokens</td>
                    <td className="p-3">AP-Southeast / Global Edge</td>
                    <td className="p-3 font-mono text-[11px] text-purple-300">AES-256 & RLS Policies</td>
                  </tr>
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-bold text-zinc-100 flex items-center gap-1.5">
                      <Server className="h-4 w-4 text-purple-400" /> Vercel Cloud Network
                    </td>
                    <td className="p-3">Edge Functions, Application Hosting & CDN</td>
                    <td className="p-3">Global Edge Network</td>
                    <td className="p-3 font-mono text-[11px] text-purple-300">SOC 2 Type II & TLS 1.3</td>
                  </tr>
                  <tr className="bg-zinc-950">
                    <td className="p-3 font-bold text-zinc-100 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-purple-400" /> PostHog Analytics
                    </td>
                    <td className="p-3">Anonymous Telemetry & Error Logging</td>
                    <td className="p-3">EU / US Cloud Servers</td>
                    <td className="p-3 font-mono text-[11px] text-purple-300">Data Anonymization</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl text-xs space-y-1">
              <span className="font-bold uppercase text-purple-400">Security Breach Notification Commitment</span>
              <p className="text-zinc-400">
                In the event of a verified data breach impacting personal records, MemeLaunch commits to notifying affected users and supervisory regulatory authorities within 72 hours of verification.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
