'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data';
import {
  BookOpen,
  Search,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Flame,
  Rocket,
  Tag
} from 'lucide-react';

const CATEGORIES = ['All', 'Growth', 'Playbooks', 'Comparison', 'Guide', 'Memes'];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPost = BLOG_POSTS[0];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 border-4 border-black p-6 md:p-10 rounded-3xl shadow-brutal space-y-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-full font-black text-xs uppercase shadow-brutal-sm">
            <BookOpen className="h-4 w-4" /> The Meme Launch Playbook
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-50">
            Growth, Memes & <span className="text-[#ffe600]">Product Launches</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base font-medium">
            Actionable strategies, viral playbooks, and transparent guides to help indie hackers gain real user traction without spending on ad budgets.
          </p>
        </div>

        <Link
          href="/launch"
          className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs sm:text-sm rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 shrink-0"
        >
          <Rocket className="h-4 w-4 stroke-[2.5]" /> Launch Your Product
        </Link>
      </div>

      {/* Featured Hero Article */}
      {featuredPost && (
        <section className="bg-zinc-900 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal hover:-translate-y-1 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-5 relative aspect-video md:aspect-square rounded-2xl overflow-hidden border-2 border-black bg-zinc-950 shadow-brutal-sm">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-[#ffe600] text-zinc-950 border border-black rounded-full font-black text-xs uppercase">
                ⭐ Featured Article
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase">
                <span className="px-2.5 py-0.5 bg-cyan-400 text-zinc-950 font-black border border-black rounded-md">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#ffe600]" /> {featuredPost.readTime}
                </span>
                <span>• {featuredPost.publishedAt}</span>
              </div>

              <h2 className="font-heading text-2xl md:text-3xl font-black uppercase text-zinc-50 hover:text-[#ffe600] transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-zinc-300 text-sm leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-zinc-950 border border-black flex items-center justify-center font-black text-xs text-[#ffe600]">
                    RM
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{featuredPost.author.name}</span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl border-2 border-black shadow-brutal-sm hover:bg-yellow-300 transition-all flex items-center gap-1.5"
                >
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-950 border-4 border-black p-4 rounded-2xl shadow-brutal">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-900 text-zinc-400 border-black hover:text-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search articles or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#ffe600]"
          />
        </div>

      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 bg-zinc-900 border-4 border-black rounded-3xl text-center space-y-3">
          <p className="font-heading text-lg font-black text-zinc-300 uppercase">
            No articles found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-zinc-950 border-4 border-black rounded-3xl p-5 shadow-brutal flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all group"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-black bg-zinc-900 shadow-brutal-sm">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-zinc-950/90 text-[#ffe600] border border-black rounded-lg text-[10px] font-black uppercase">
                    {post.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase">
                  <Clock className="h-3 w-3 text-[#ffe600]" /> {post.readTime}
                  <span>• {post.publishedAt}</span>
                </div>

                <h3 className="font-heading text-xl font-black text-zinc-100 uppercase group-hover:text-[#ffe600] transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">{post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-black text-xs uppercase text-[#ffe600] group-hover:underline flex items-center gap-1"
                >
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Bottom Launch Banner CTA */}
      <div className="bg-[#ffe600] text-zinc-950 border-4 border-black p-8 rounded-3xl shadow-brutal flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2 max-w-xl">
          <h2 className="font-heading text-2xl md:text-3xl font-black uppercase">
            Ready to Drop Your Product Meme?
          </h2>
          <p className="text-zinc-900 text-sm font-semibold">
            Join indie hackers competing in the weekly Meme Launch Arena. Free, fast, and viral.
          </p>
        </div>
        <Link
          href="/launch"
          className="px-6 py-3.5 bg-zinc-950 text-white font-black uppercase text-xs sm:text-sm rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shrink-0 inline-flex items-center gap-2"
        >
          <Rocket className="h-4 w-4 text-[#ffe600]" /> Launch Your Product
        </Link>
      </div>

    </div>
  );
}
