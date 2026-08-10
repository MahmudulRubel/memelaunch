import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SafeImage } from '@/components/safe-image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blog-data';
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Rocket,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | MemeLaunch Blog',
    };
  }

  return {
    title: `${post.title} | MemeLaunch Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://www.launchme.me/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.launchme.me/blog/${post.slug}`,
      siteName: 'MemeLaunch',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: `https://www.launchme.me${post.coverImage}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      site: '@launchme_me',
      creator: '@launchme_me',
      images: [`https://www.launchme.me${post.coverImage}`],
    },
  };
}

export default async function BlogPostPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MemeLaunch',
      url: 'https://memelaunch.insforge.app',
      logo: 'https://memelaunch.insforge.app/favicon.ico',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://memelaunch.insforge.app/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:bg-[#ffe600] hover:text-zinc-950 shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <span className="px-3 py-1 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase border border-black rounded-full shadow-brutal-sm">
          {post.category}
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-zinc-950 border-4 border-black p-6 md:p-10 rounded-3xl shadow-brutal space-y-4">
        <h1 className="font-heading text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-50 leading-tight">
          {post.title}
        </h1>

        <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-400 border-2 border-black flex items-center justify-center font-black text-zinc-950 shadow-brutal-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-zinc-100 font-extrabold block">{post.author.name}</span>
              <span className="text-zinc-400 text-[11px] font-normal">{post.author.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="h-4 w-4 text-[#ffe600]" /> {post.readTime}
            </span>
            <span>• Published {post.publishedAt}</span>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-black bg-zinc-950 shadow-brutal">
        <SafeImage
          src={post.coverImage}
          fallbackType="general"
          alt={post.title}
          fill
          sizes="(max-width: 1200px) 100vw, 900px"
          className="object-cover"
          priority
        />
      </div>

      {/* Article Main Body Content */}
      <div className="bg-zinc-950 border-4 border-black p-6 md:p-10 rounded-3xl shadow-brutal space-y-6 text-zinc-200 text-base leading-relaxed">
        
        {/* Render formatted content */}
        <div className="prose prose-invert max-w-none space-y-6">
          {post.content
            .trim()
            .split('\n\n')
            .map((paragraph, idx) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={idx} className="font-heading text-3xl font-black uppercase text-[#ffe600] border-b-2 border-zinc-800 pb-2">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="font-heading text-2xl font-black uppercase text-zinc-50 pt-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-heading text-xl font-black uppercase text-cyan-400 pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="p-4 bg-zinc-900 border-l-4 border-[#ffe600] rounded-r-2xl text-zinc-300 italic font-medium">
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="text-zinc-300 font-normal leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
        </div>

        {/* Action Callout Box */}
        <div className="my-8 p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 border-4 border-black rounded-3xl shadow-brutal flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading text-lg font-black uppercase text-[#ffe600] flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Launch Your Startup Meme Now
            </h4>
            <p className="text-xs text-zinc-400 font-semibold">
              Test your product positioning live in the MemeLaunch Arena. Zero ad spend required.
            </p>
          </div>
          <Link
            href="/launch"
            className="px-5 py-2.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl border-2 border-black shadow-brutal hover:bg-yellow-300 transition-all shrink-0 flex items-center gap-2"
          >
            <Rocket className="h-4 w-4" /> Open Meme Studio
          </Link>
        </div>

        {/* Tags / Keywords */}
        <div className="pt-6 border-t border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-zinc-400 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-[#ffe600]" /> Topics:
          </span>
          {post.keywords.map((kw) => (
            <span key={kw} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-mono text-[11px]">
              #{kw}
            </span>
          ))}
        </div>

      </div>

      {/* Author Bio Box */}
      <div className="bg-zinc-900 border-4 border-black p-6 rounded-3xl shadow-brutal flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-[#ffe600] border-2 border-black flex items-center justify-center font-black text-xl text-zinc-950 shadow-brutal-sm shrink-0">
          RM
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-sm uppercase text-zinc-100">
            Written by {post.author.name}
          </h3>
          <p className="text-xs text-zinc-400">
            {post.author.role}. Helping indie hackers build in public and gain viral distribution through humor.
          </p>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="font-heading text-xl font-black uppercase text-zinc-50 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#ffe600]" /> Read Next
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <div key={rel.slug} className="bg-zinc-950 border-2 border-black p-4 rounded-2xl shadow-brutal-sm space-y-2 hover:border-[#ffe600] transition-colors">
                <span className="text-[10px] font-black uppercase text-[#ffe600]">
                  {rel.category}
                </span>
                <h3 className="font-heading text-base font-black uppercase text-zinc-100">
                  <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{rel.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
