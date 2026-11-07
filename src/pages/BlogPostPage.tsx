import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Heart, 
  ChevronRight, 
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getBlogPostBySlug } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
        <SEO 
          title="Članak nije pronađen | Na prvi pogled"
          description="Traženi članak ili priča ne postoji na Na prvi pogled blogu."
          canonical="https://naprvipogled.com/blog"
        />
        <Navbar />
        <main className="flex-1 pt-36 pb-24 px-4 max-w-2xl mx-auto w-full text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6">
            <BookOpen size={32} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand mb-3">
            Članak nije pronađen
          </h1>
          <p className="text-brand/70 text-sm sm:text-base leading-relaxed mb-8">
            Priča koju tražiš možda je premještena ili je unesena neispravna adresa.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-brand-light shadow-md transition-all"
          >
            <ArrowLeft size={16} />
            <span>Povratak na sve priče</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const postStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://naprvipogled.com/images/hero-speed-dating.jpg`,
    "datePublished": "2026-03-01",
    "author": {
      "@type": "Organization",
      "name": "Na prvi pogled tim",
      "url": "https://naprvipogled.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Na prvi pogled",
      "logo": "https://naprvipogled.com/apple-touch-icon.png"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://naprvipogled.com/blog/${post.slug}`
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://naprvipogled.com/blog/${post.slug}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title={`${post.title} | Na prvi pogled 💞`}
        description={post.excerpt}
        canonical={`https://naprvipogled.com/blog/${post.slug}`}
        structuredData={postStructuredData}
        keywords="kako je nastala ideja, speed dating zagreb, na prvi pogled prica, upoznavanje uzivo zagreb, spoj zagreb"
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumbs & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center gap-2 text-xs text-brand/60" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand transition-colors">Početna</Link>
            <ChevronRight size={12} />
            <Link to="/blog" className="hover:text-brand transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-brand font-medium truncate max-w-[220px] sm:max-w-xs">{post.title}</span>
          </nav>

          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-light bg-white/60 hover:bg-white px-4 py-2 rounded-full border border-white/80 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Natrag na sve priče</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand/70 mb-4 font-medium">
            <span className="bg-brand text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
              {post.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold text-brand leading-[1.18] tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="text-lg sm:text-xl text-brand/90 font-medium italic border-l-4 border-brand-light pl-6 py-3 bg-white/40 rounded-r-2xl leading-relaxed">
            {post.content.intro}
          </div>
        </header>

        {/* Hero Cover Image */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/90 mb-12 relative max-h-[460px] bg-brand/5">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover max-h-[460px]" 
          />
        </div>

        {/* Article Content */}
        <article className="space-y-8 text-base sm:text-lg text-brand/85 font-light leading-relaxed">
          {post.content.sections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              {sec.heading && (
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand pt-4">
                  {sec.heading}
                </h2>
              )}
              {sec.text.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {sec.bulletPoints && (
                <ul className="list-disc list-inside space-y-2 pl-4 text-brand/80 font-normal">
                  {sec.bulletPoints.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {post.content.conclusion && (
            <div className="mt-12 bg-white/70 border border-white/90 p-6 sm:p-8 rounded-3xl shadow-md text-center">
              <p className="font-sans font-semibold text-brand text-lg sm:text-xl leading-relaxed">
                {post.content.conclusion}
              </p>
            </div>
          )}
        </article>

        {/* Social Share & Interaction Bar */}
        <div className="mt-14 pt-8 border-t border-brand/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand">
            <Share2 size={16} className="text-brand-light" />
            <span>Podijeli ovu priču:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-brand text-xs font-bold transition-all border border-white/80 shadow-xs cursor-pointer"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
              <span>{copied ? 'Kopirano!' : 'Kopiraj poveznicu'}</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedShareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
            >
              <FaWhatsapp size={14} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200 cursor-pointer"
            >
              <FaFacebook size={14} className="text-blue-600" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <section className="mt-16 bg-brand text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Sparkles size={14} />
              <span>Doživi Na prvi pogled uživo</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Upoznaj nekoga novog. Kao nekad.
            </h2>
            <p className="text-sm sm:text-base text-peach-dark/80 font-light leading-relaxed">
              Pridruži nam se na sljedećem speed dating susretu u Zagrebu i doživi opuštenu atmosferu, nova poznanstva i iskren razgovor licem u lice.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/eventi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-peach text-brand hover:bg-white px-8 py-3.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all"
              >
                <Heart size={16} className="text-brand fill-brand" />
                <span>Pogledaj nadolazeće termine</span>
              </Link>
              <Link
                to="/blog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-full font-bold text-sm border border-white/20 transition-all"
              >
                <span>Sve priče s bloga</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
