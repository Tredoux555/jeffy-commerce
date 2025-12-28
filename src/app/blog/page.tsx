'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  author_name: string;
  category: string;
  read_time_minutes: number;
  published_at: string;
}

// Mock data
const mockPosts: BlogPost[] = [
  { id: '1', title: 'How to Get Products for FREE with Jeffy Wants', slug: 'how-jeffy-wants-works', excerpt: 'Learn how our viral sharing system can get you free products...', author_name: 'Jeffy Team', category: 'Tips', read_time_minutes: 5, published_at: '2024-12-20' },
  { id: '2', title: 'Top 10 Trending Products This Month', slug: 'trending-december-2024', excerpt: 'Check out what everyone is buying this holiday season...', author_name: 'Jeffy Team', category: 'News', read_time_minutes: 3, published_at: '2024-12-18' },
  { id: '3', title: 'Zone Partner Success Stories', slug: 'zone-partner-success', excerpt: 'Meet our top earning Zone Partners and learn their secrets...', author_name: 'Jeffy Team', category: 'Behind the Scenes', read_time_minutes: 7, published_at: '2024-12-15' },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', 'News', 'Tips', 'Reviews', 'Behind the Scenes'];

  const filtered = posts.filter(post => {
    if (category !== 'all' && post.category !== category) return false;
    if (search && !post.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Jeffy Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Tips, news, and stories from the Jeffy community</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                category === cat ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {filtered.length > 0 && (
        <Link href={`/blog/${filtered[0].slug}`}>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl overflow-hidden mb-8 hover:shadow-xl transition group">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video bg-black/20 flex items-center justify-center text-6xl">📰</div>
              <div className="p-6 text-white flex flex-col justify-center">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full w-fit mb-4">{filtered[0].category}</span>
                <h2 className="text-2xl font-bold mb-3 group-hover:underline">{filtered[0].title}</h2>
                <p className="text-white/80 mb-4">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{filtered[0].published_at}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{filtered[0].read_time_minutes} min read</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(1).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group h-full">
              <div className="aspect-video bg-gray-100 flex items-center justify-center text-4xl">📄</div>
              <div className="p-5">
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{post.category}</span>
                <h3 className="font-bold mt-3 mb-2 group-hover:text-[#ff6b35] transition">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{post.published_at}</span>
                  <span>{post.read_time_minutes} min read</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No articles found</p>
        </div>
      )}
    </div>
  );
}
