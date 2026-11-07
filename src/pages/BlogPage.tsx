import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Search, 
  X, 
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { BLOG_POSTS, type BlogPost } from '../data/blogPosts';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve teme');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Sve teme', 'Naša priča'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post: BlogPost) => {
      const matchesCategory = selectedCategory === 'Sve teme' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Na prvi pogled Blog | Priče i vodiči za speed dating Zagreb",
    "description": "Kako je nastala ideja za Na prvi pogled i zašto vjerujemo u upoznavanje uživo.",
    "url": "https://naprvipogled.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Na prvi pogled",
      "logo": "https://naprvipogled.com/apple-touch-icon.png"
    },
    "blogPost": [
      {
        "@type": "BlogPosting",
        "headline": "Kako je nastala ideja za Naprvipogled?",
        "description": "Sve je počelo jedne sasvim obične večeri, uz razgovor dvojice prijatelja u McDonald'su...",
        "image": "https://naprvipogled.com/images/hero-speed-dating.jpg",
        "datePublished": "2026-03-01",
        "author": {
          "@type": "Organization",
          "name": "Na prvi pogled tim"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title="Blog & Naša priča | Na prvi pogled 💞 Zagreb"
        description="Kako je nastala ideja za Na prvi pogled speed dating susrete u Zagrebu i zašto vjerujemo u magiju susreta uživo."
        canonical="https://naprvipogled.com/blog"
        structuredData={blogStructuredData}
        keywords="kako je nastala ideja, speed dating zagreb, na prvi pogled prica, upoznavanje uzivo zagreb, spoj zagreb"
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen size={14} className="text-brand-light" />
            <span>Na prvi pogled Priče & Vodiči</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand tracking-tight mb-4">
            Naša priča & Blog
          </h1>
          <p className="text-brand/80 text-base sm:text-lg leading-relaxed font-light">
            Saznaj kako je nastala ideja za Na prvi pogled i zašto vjerujemo u iskreno povezivanje i upoznavanje u stvarnom životu.
          </p>
        </section>

        {/* Featured Big Hero Article */}
        {featuredPost && selectedCategory === 'Sve teme' && !searchQuery && (
          <section className="mb-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 shadow-xl shadow-brand/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 group transition-all duration-300 hover:shadow-2xl">
              
              <Link 
                to={`/blog/${featuredPost.slug}`}
                className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden block"
              >
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    Istaknuta priča
                  </span>
                </div>
              </Link>

              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-brand/60 mb-3">
                    <span className="font-semibold text-brand-light uppercase tracking-wider">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {featuredPost.readTime}
                    </span>
                  </div>

                  <Link to={`/blog/${featuredPost.slug}`} className="block group/title">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand mb-4 group-hover/title:text-brand-light transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-brand/80 text-sm leading-relaxed mb-6 font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand/10 flex items-center justify-between">
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-light transition-all shadow-md"
                  >
                    <span>Pročitaj cijelu priču</span>
                    <ArrowRight size={14} />
                  </Link>
                  <span className="text-xs text-brand/60">{featuredPost.date}</span>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* Filter Bar & Search Input */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-brand/10">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'bg-white/70 hover:bg-white text-brand border border-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pretraži priče..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/70 border border-white/80 text-xs text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </section>

        {/* Article Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/90 shadow-md shadow-brand/5 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                <Link to={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {post.category}
                  </span>
                </Link>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-brand/60 mb-2">
                    <Calendar size={12} />
                    <span>{post.date}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{post.readTime}</span>
                  </div>

                  <Link to={`/blog/${post.slug}`} className="block group/cardtitle">
                    <h3 className="font-serif text-xl font-bold text-brand group-hover/cardtitle:text-brand-light transition-colors mb-3 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-brand/70 line-clamp-3 leading-relaxed font-light">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/blog/${post.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand/5 hover:bg-brand text-brand hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                >
                  <span>Pročitaj priču</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

            </article>
          ))}
        </section>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white/50 rounded-3xl border border-white/80">
            <BookOpen size={40} className="mx-auto text-brand/40 mb-3" />
            <h3 className="text-lg font-bold text-brand mb-1">Nema pronađenih članaka</h3>
            <p className="text-xs text-brand/70">Pokušaj s drugim pojmom za pretraživanje ili drugom kategorijom.</p>
          </div>
        )}

        {/* Bottom CTA to Events */}
        <section className="mt-20 bg-brand text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Sparkles size={14} />
              <span>Spreman/na za spoj uživo?</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Isprobaj speed dating već ovog tjedna
            </h2>
            <p className="text-sm sm:text-base text-peach-dark/80 font-light leading-relaxed">
              Zaboravi teoriju — doživi pravu atmosferu, upoznaj nove ljude u Zagrebu i prepusti se trenutku.
            </p>
            <div className="pt-4">
              <Link
                to="/eventi"
                className="inline-flex items-center gap-2 bg-peach text-brand hover:bg-white px-8 py-3.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all"
              >
                <span>Pogledaj termine događaja</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
