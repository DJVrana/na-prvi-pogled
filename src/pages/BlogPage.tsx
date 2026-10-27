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
  Share2, 
  Check, 
  Heart,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  featured?: boolean;
  content: {
    intro: string;
    sections: { heading: string; text: string; bulletPoints?: string[] }[];
    conclusion: string;
  };
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'speed-dating-zagreb-kako-funkcionira',
    title: 'Speed dating u Zagrebu: Kako funkcionira i zašto svi pričaju o tome?',
    category: 'Vodiči',
    date: '15. ožujka 2026.',
    readTime: '4 min čitanja',
    image: `${import.meta.env.BASE_URL}images/hero-speed-dating.jpg`,
    featured: true,
    excerpt: 'Detaljan vodič kroz večer brzih spojeva: od dolaska i pića dobrodošlice do 5-minutnih razgovora i tajnog označavanja simpatija.',
    content: {
      intro: 'Ako ti je dosta beskrajnog dopisivanja na aplikacijama koje rijetko vodi do susreta uživo, speed dating je pravo osvježenje. Koncept je jednostavan, dinamičan i nevjerojatno zabavan.',
      sections: [
        {
          heading: '1. Dolazak i piće dobrodošlice',
          text: 'Večer počinje u ugodnom, intimnom ambijentu jednog od zagrebačkih wine/lounge barova. Naš tim te dočekuje s osmijehom, preuzimaš svoje piće dobrodošlice (vrhunsko vino ili bezalkoholni koktel) i dobivaš svoj anonimni broj i karticu za bilješke.',
        },
        {
          heading: '2. Kratki spojevi od 5 do 7 minuta',
          text: 'Svaki sudionik sjedi za svojim stolom. Muški sudionici rotiraju se svakih nekoliko minuta na zvuk zvonca. Tijekom 5 do 7 minuta imate priliku popričati, nasmijati se i osjetiti ima li između vas one stvarne "iskre".',
          bulletPoints: [
            'Dovoljno vremena za prvi dojam, premalo da bi postalo dosadno',
            'Nema neugodnih odbijanja uživo — sve se bilježi privatno',
            'Jednak broj žena i muškaraca u istoj dobnoj skupini'
          ]
        },
        {
          heading: '3. Tajno označavanje simpatija',
          text: 'Nakon svakog spoja u karticu ili naš digitalni sustav zabilježiš je li ti se osoba svidjela. Nitko ne vidi tvoje odgovore — sve je 100% diskretno.'
        },
        {
          heading: '4. Obostrani match i razmjena kontakata',
          text: 'Ako ste oboje označili simpatiju, sutradan dobivate obavijest i kontakte kako biste mogli dogovoriti pravi, opušteni drugi spoj.'
        }
      ],
      conclusion: 'Za samo dva sata upoznat ćeš 10 do 15 novih ljudi u stvarnom životu. Bez filtera, bez lažnih profila, samo stvarni osmijesi.'
    }
  },
  {
    id: '2',
    slug: '5-nacina-kako-razbiti-led-na-spoju',
    title: '5 dokazanih načina kako razbiti led na prvom spoju u 5 minuta',
    category: 'Savjeti za spoj',
    date: '20. ožujka 2026.',
    readTime: '3 min čitanja',
    image: `${import.meta.env.BASE_URL}images/event-wine-cheers.jpg`,
    featured: false,
    excerpt: 'Zaboravi dosadno ispitivanje o poslu i vremenu. Pitanja koja odmah stvaraju osmijeh, iskru i opuštenu atmosferu.',
    content: {
      intro: 'Prvih 30 sekundi razgovora presudno je za ton cijelog susreta. Umjesto klasičnog intervjua ("Čime se baviš?"), evo pitanja koja stvaraju prirodnu povezanost.',
      sections: [
        {
          heading: 'Pitanje 1: "Što te danas najviše nasmijalo?"',
          text: 'Ovo pitanje trenutno prebacuje fokus na pozitivne emocije i pomaže osobi da se opusti i sjeti nečeg veselog.'
        },
        {
          heading: 'Pitanje 2: "Koje je najbolje putovanje na kojem si bio/la?"',
          text: 'Razgovor o putovanjima otkriva vrijednosti, želju za avanturom i otvara beskonačno mnogo tema za nastavak druženja.'
        },
        {
          heading: 'Pitanje 3: "Da sada možeš teleportirati na bilo koje mjesto na svijetu, gdje bi to bilo?"',
          text: 'Zabavno, maštovito pitanje koje odmah potiče kreativnost i osmijeh.'
        },
        {
          heading: 'Zlatno pravilo: Slušaj više nego što govoriš',
          text: 'Aktivno slušanje s iskrenim kontaktom očima privlačnije je od bilo koje uvježbane rečenice. Postavi potpitanje i pokaži iskreni interes.'
        }
      ],
      conclusion: 'Cilj speed datinga nije predstaviti životopis, nego osjetiti energiju i humor druge osobe. Budi svoja/svoj!'
    }
  },
  {
    id: '3',
    slug: 'zaboravi-swipeanje-zasto-je-upoznavanje-uzivo-ponovno-in',
    title: 'Zaboravi swipeanje: Zašto se u 2026. vraćamo susretima uživo?',
    category: 'Trendovi',
    date: '10. ožujka 2026.',
    readTime: '5 min čitanja',
    image: `${import.meta.env.BASE_URL}images/zagreb-dating-vibe.jpg`,
    featured: false,
    excerpt: 'Zašto je dating fatigue na aplikacijama postao stvarnost i zašto govor tijela, miris i glas niti jedan algoritam ne može zamijeniti.',
    content: {
      intro: 'Nakon godina beskonačnog listanja profila, dopisivanja koje izblijedi nakon tri dana i razočaranja kada se osoba u stvarnosti pokaže sasvim drugačijom, dogodio se preokret.',
      sections: [
        {
          heading: 'Fenomen "Dating fatigue"',
          text: 'Psiholozi diljem svijeta bilježe zamor od dating aplikacija. Ljudi su siti površnih algoritama i žele stvarni ljudski kontakt.'
        },
        {
          heading: 'Govor tijela govori više od 1000 poruka',
          text: 'U prvih 5 sekundi uživo mozak procesuira boju glasa, miris, toplinu pogleda i iskrenost osmijeha — faktore koje niti jedna fotografija ne može prenijeti.'
        },
        {
          heading: 'Ušteda vremena i energije',
          text: 'Umjesto tjedana dopisivanja, u jednoj večeri osjetiš s kim ima kemije, a s kim ne, uz čašu finog vina u ugodnom društvu.'
        }
      ],
      conclusion: 'Upoznavanje uživo nije zastarjelo — ono je najprirodniji, najromantičniji i najiskreniji način za pronaći ljubav.'
    }
  },
  {
    id: '4',
    slug: 'sto-obuci-na-speed-dating-vodic',
    title: 'Što obući na speed dating: Vodič za ležeran i privlačan stil',
    category: 'Stil & Priprema',
    date: '05. ožujka 2026.',
    readTime: '3 min čitanja',
    image: `${import.meta.env.BASE_URL}images/hero-speed-dating.jpg`,
    featured: false,
    excerpt: 'Savjeti za smart-casual dress code u kojem ćeš se osjećati opušteno, samopouzdano i privlačno bez pretjerivanja.',
    content: {
      intro: 'Najvažnije pravilo je da se osjećaš ugodno u onome što nosiš. Kad se osjećaš ugodno, zračiš samopouzdanjem.',
      sections: [
        {
          heading: 'Za žene: Elegantna jednostavnost',
          text: 'Kombinacija lijepih hlača ili traperica uz profinjenu bluzu, lijep sako ili jednostavna ležerna haljina savršen su izbor. Diskretan nakit i omiljeni parfem dat će završni pečat.'
        },
        {
          heading: 'Za muškarce: Smart-casual je pobjednik',
          text: 'Tamne traperice ili chinos hlače, uredna košulja ili fina jednobojna majica uz sportski sako. Čista obuća i uredna frizura/brada šalju signal da držiš do sebe.'
        },
        {
          heading: 'Što izbjegavati?',
          text: 'Previše formalnu poslovnu odjeću (odijela s kravatom) koja stvara dojam razgovora za posao, kao i previše sportsku odjeću (trenirke).'
        }
      ],
      conclusion: 'Obuci ono u čemu bi rado otišao/la na opušteni večernji izlazak s prijateljima u fini zagrebački bar.'
    }
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve teme');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = ['Sve teme', 'Vodiči', 'Savjeti za spoj', 'Trendovi', 'Stil & Priprema'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'Sve teme' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];

  const handleShare = (post: BlogPost) => {
    const url = `${window.location.origin}/blog#${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Na prvi pogled Blog | Vodiči i savjeti za speed dating Zagreb",
    "description": "Savjeti za prvi spoj, upoznavanje uživo u Zagrebu i vodiči za moderan dating.",
    "url": "https://naprvipogled.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Na prvi pogled",
      "logo": "https://naprvipogled.com/apple-touch-icon.png"
    }
  };

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title="Blog & Savjeti za spojeve | Na prvi pogled 💞 Zagreb"
        description="Savjeti za uspješan speed dating, kako razbiti led na spoju, što obući i zašto je upoznavanje uživo ponovno in. Pročitaj naše vodiče za Zagreb."
        canonical="https://naprvipogled.com/blog"
        structuredData={blogStructuredData}
        keywords="speed dating savjeti, kako razbiti led na spoju, upoznavanje uzivo zagreb, spoj zagreb ideje, vodic za speed dating"
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen size={14} className="text-brand-light" />
            <span>Na prvi pogled Članci & Vodiči</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand tracking-tight mb-4">
            Sve što trebaš znati o modernom upoznavanju
          </h1>
          <p className="text-brand/80 text-base sm:text-lg leading-relaxed font-light">
            Praktični savjeti, priče s naših evenata i psihologija privlačnosti koja će ti pomoći da zablistaš na sljedećem susretu u Zagrebu.
          </p>
        </section>

        {/* Featured Big Hero Article */}
        {featuredPost && selectedCategory === 'Sve teme' && !searchQuery && (
          <section className="mb-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 shadow-xl shadow-brand/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 group transition-all duration-300 hover:shadow-2xl">
              
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    Istaknuti vodič
                  </span>
                </div>
              </div>

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

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand mb-4 group-hover:text-brand-light transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="text-brand/80 text-sm leading-relaxed mb-6 font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(featuredPost)}
                    className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-light transition-all cursor-pointer"
                  >
                    <span>Pročitaj cijeli članak</span>
                    <ArrowRight size={14} />
                  </button>
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
              placeholder="Pretraži članke..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/70 border border-white/80 text-xs text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand"
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
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {post.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-brand/60 mb-2">
                    <Calendar size={12} />
                    <span>{post.date}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-brand group-hover:text-brand-light transition-colors mb-3 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-brand/70 line-clamp-3 leading-relaxed font-light">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => setActiveArticle(post)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand/5 hover:bg-brand text-brand hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <span>Pročitaj članak</span>
                  <ChevronRight size={14} />
                </button>
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

      {/* Interactive Full Article Reader Modal */}
      {activeArticle && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in-up"
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="bg-peach max-w-3xl w-full rounded-3xl shadow-2xl border border-white/80 my-8 overflow-hidden text-brand relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-peach/95 backdrop-blur-md px-6 py-4 border-b border-brand/10 flex items-center justify-between z-20">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand/70">
                <span className="bg-brand text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShare(activeArticle)}
                  className="p-2 rounded-full hover:bg-brand/10 text-brand transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Kopiraj poveznicu članka"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-full hover:bg-brand/10 text-brand transition-colors cursor-pointer"
                  aria-label="Zatvori članak"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              
              <div className="rounded-2xl overflow-hidden shadow-md max-h-72">
                <img 
                  src={activeArticle.image} 
                  alt={activeArticle.title}
                  className="w-full h-full object-cover" 
                />
              </div>

              <div>
                <p className="text-xs text-brand/60 mb-2">{activeArticle.date}</p>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand mb-4 leading-tight">
                  {activeArticle.title}
                </h2>
                <p className="text-base sm:text-lg text-brand/90 font-medium italic border-l-4 border-brand-light pl-4 py-1 bg-white/40 rounded-r-xl">
                  {activeArticle.content.intro}
                </p>
              </div>

              <div className="space-y-6 text-sm sm:text-base text-brand/85 font-light leading-relaxed">
                {activeArticle.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-serif font-bold text-xl text-brand">
                      {sec.heading}
                    </h3>
                    <p>{sec.text}</p>
                    {sec.bulletPoints && (
                      <ul className="list-disc list-inside space-y-1 pl-2 text-brand/80 font-normal">
                        {sec.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div className="bg-brand/5 border border-brand/10 p-5 rounded-2xl">
                  <h4 className="font-serif font-bold text-brand text-base mb-1">Zaključak</h4>
                  <p className="text-sm text-brand/80">{activeArticle.content.conclusion}</p>
                </div>
              </div>

              {/* In-article CTA */}
              <div className="pt-6 border-t border-brand/10 text-center space-y-3">
                <p className="text-xs uppercase tracking-widest text-brand font-bold">
                  Spreman/na primijeniti ove savjete u praksi?
                </p>
                <Link
                  to="/eventi"
                  onClick={() => setActiveArticle(null)}
                  className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-full text-xs font-bold hover:bg-brand-light shadow-lg transition-transform hover:scale-105"
                >
                  <Heart size={14} className="fill-white" />
                  <span>Prijavi se na sljedeći speed dating u Zagrebu</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
