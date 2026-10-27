import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Wine, 
  Loader2, 
  Users, 
  Sparkles, 
  Music, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  ArrowRight, 
  ChevronDown 
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface ActiveEvent {
  id: string;
  title: string;
  ageGroup: string;
  dateStr: string;
  timeStr: string;
  location: string;
  price: string;
  maxRegistrations?: number | string;
  registrationCount?: number;
  isMatchingActive?: boolean;
  matchingPhase?: 'live' | 'post_event' | 'closed';
  createdAt?: any;
}

// Full-screen floating particles spanning across 0% to 100% width
const FULLSCREEN_PARTICLES = [
  { id: 1, left: '3%', type: 'heart', size: 20, delay: '0s', duration: '15s', opacity: 0.35 },
  { id: 2, left: '9%', type: 'sparkle', size: 16, delay: '4s', duration: '18s', opacity: 0.45 },
  { id: 3, left: '16%', type: 'wine', size: 18, delay: '8s', duration: '16s', opacity: 0.3 },
  { id: 4, left: '24%', type: 'heart', size: 24, delay: '2s', duration: '14s', opacity: 0.4 },
  { id: 5, left: '32%', type: 'star', size: 14, delay: '10s', duration: '20s', opacity: 0.4 },
  { id: 6, left: '42%', type: 'sparkle', size: 18, delay: '6s', duration: '17s', opacity: 0.35 },
  { id: 7, left: '60%', type: 'heart', size: 16, delay: '3s', duration: '16s', opacity: 0.4 },
  { id: 8, left: '72%', type: 'star', size: 15, delay: '9s', duration: '19s', opacity: 0.45 },
  { id: 9, left: '80%', type: 'music', size: 19, delay: '1s', duration: '15s', opacity: 0.3 },
  { id: 10, left: '88%', type: 'sparkle', size: 22, delay: '7s', duration: '18s', opacity: 0.45 },
  { id: 11, left: '95%', type: 'heart', size: 26, delay: '5s', duration: '14s', opacity: 0.35 }
];

export default function Home() {
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const q = query(collection(db, 'events'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const eventsList: ActiveEvent[] = snapshot.docs.map(docData => ({
            id: docData.id,
            ...(docData.data() as any)
          }));
          setActiveEvents(eventsList);
          setSelectedEventId(eventsList[0].id);
        } else {
          setActiveEvents([]);
          setSelectedEventId('');
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju aktivnih događaja:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchActiveEvents();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const currentEvent = activeEvents.find(e => e.id === selectedEventId) || activeEvents[0] || null;

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Na prvi pogled - Speed Dating Zagreb",
    "url": "https://naprvipogled.com/",
    "description": "Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nekoga uživo, u opuštenoj atmosferi bez aplikacija i swipeanja.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://naprvipogled.com/eventi?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-peach selection:bg-brand selection:text-white"
    >
      <SEO 
        title="Na prvi pogled 💞 | Speed Dating Zagreb - Upoznaj nekoga. Kao nekad."
        description="Ekskluzivni speed dating eventi u Zagrebu. Zaboravi swipeanje – doživi stvarni prvi pogled u opuštenoj atmosferi najboljih vinskih barova. Prijavi se!"
        canonical="https://naprvipogled.com/"
        structuredData={homeStructuredData}
        keywords="speed dating zagreb, upoznavanje zagreb, dejtanje zagreb, na prvi pogled, izlasci zagreb, brzi spojevi"
      />

      {/* ========================================================================= */}
      {/* 1. DYNAMIC INTERACTIVE MOUSE SPOTLIGHT (Ambient glow)                      */}
      {/* ========================================================================= */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(123, 29, 41, 0.07), transparent 75%)`
        }}
      />

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN AURORA & GLOWING BLUR ORBS                                */}
      {/* ========================================================================= */}
      <div className="fixed -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-rose-400/20 blur-[130px] animate-aurora pointer-events-none z-0" />
      <div className="fixed -top-20 -right-20 w-[34rem] h-[34rem] rounded-full bg-amber-200/20 blur-[120px] animate-ambient-drift pointer-events-none z-0" style={{ animationDelay: '3s' }} />
      <div className="fixed -bottom-28 -left-24 w-[42rem] h-[42rem] rounded-full bg-brand/10 blur-[140px] animate-aurora pointer-events-none z-0" style={{ animationDelay: '6s' }} />
      <div className="fixed -bottom-24 -right-24 w-[40rem] h-[40rem] rounded-full bg-rose-300/20 blur-[130px] animate-ambient-drift pointer-events-none z-0" style={{ animationDelay: '9s' }} />

      {/* ========================================================================= */}
      {/* 3. FULL-SCREEN RISING PARTICLES LAYER                                     */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {FULLSCREEN_PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 animate-float-up text-brand-light"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: p.opacity
            }}
          >
            {p.type === 'heart' && <Heart size={p.size} className="fill-brand/20 text-brand" />}
            {p.type === 'sparkle' && <Sparkles size={p.size} className="text-amber-500 animate-twinkle" />}
            {p.type === 'star' && <Star size={p.size} className="fill-amber-400/20 text-amber-500 animate-twinkle" />}
            {p.type === 'wine' && <Wine size={p.size} className="text-brand-light" />}
            {p.type === 'music' && <Music size={p.size} className="text-brand" />}
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ========================================================================= */}
        {/* 4. HERO SECTION                                                          */}
        {/* ========================================================================= */}
        <section className="pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-sm text-brand text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <Sparkles size={14} className="text-amber-500" />
                <span>Ekskluzivni Speed Dating Zagreb</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-brand tracking-tight leading-[1.08]">
                Manje ekrana.<br />
                <span className="italic font-normal text-brand-light">Više stvarnih susreta.</span>
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-lg sm:text-xl text-brand/85 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Koliko puta si pomislio/la da bi nekoga volio/la upoznati, ali nikad nisi napravio/la prvi korak? <strong>Na prvi pogled</strong> je večer stvorena za nove susrete uživo. Opuštena atmosfera, vrhunsko vino i stvarna kemija.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#dogadaji-sekcija"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-brand/25 transform hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Prijavi se na sljedeći događaj
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </a>

                <a
                  href="#kako-funkcionira"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/75 hover:bg-white text-brand px-6 py-4 rounded-full font-bold text-sm transition-all border border-white/90 shadow-sm hover:shadow"
                >
                  Kako funkcionira?
                </a>
              </div>

              {/* Quick stats / Trust points */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-brand/10 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <p className="font-serif font-bold text-2xl sm:text-3xl text-brand">100%</p>
                  <p className="text-[11px] uppercase tracking-wider text-brand/70 font-semibold">Uživo bez filtera</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-2xl sm:text-3xl text-brand">5 – 7</p>
                  <p className="text-[11px] uppercase tracking-wider text-brand/70 font-semibold">Minuta po spoju</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-2xl sm:text-3xl text-brand">1 : 1</p>
                  <p className="text-[11px] uppercase tracking-wider text-brand/70 font-semibold">Omjer M & Ž</p>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Card with Glass Floating Accents */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Card with Generated High-End Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand/20 border-4 border-white/80 bg-brand/5 group">
                  <img
                    src={`${import.meta.env.BASE_URL}images/hero-speed-dating.jpg`}
                    alt="Atmosfera speed dating večeri u Zagrebu uz svijeće i vino"
                    className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/20 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                    <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">
                      Zagrebački wine & lounge barovi
                    </p>
                    <p className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                      Upoznaj nekoga onako kako se nekad upoznavalo. Uživo.
                    </p>
                  </div>
                </div>

                {/* Floating Glass Badge 1: Top Left */}
                <div className="absolute -top-5 -left-5 sm:-top-7 sm:-left-7 z-20 animate-float-slow pointer-events-none">
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center gap-3 text-brand">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                      <Wine size={20} className="text-brand-light" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Piće dobrodošlice</p>
                      <p className="text-[10px] text-brand/60">Uključeno u kotizaciju 🍷</p>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badge 2: Bottom Right */}
                <div className="absolute -bottom-5 -right-5 sm:-bottom-7 sm:-right-7 z-20 animate-float-fast pointer-events-none">
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center gap-3 text-brand">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <Heart size={20} className="fill-rose-500/20 animate-pulse-soft" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Stvarna kemija</p>
                      <p className="text-[10px] text-brand/60">Bez lažnih profila ✨</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE EVENTS SECTION (Sekcija za prikaz događaja)                */}
        {/* ========================================================================= */}
        <section id="dogadaji-sekcija" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Calendar size={14} className="text-brand-light" />
              <span>Aktivne prijave</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand tracking-tight mb-4">
              Odaberi svoj termin & dobnu skupinu
            </h2>
            <p className="text-brand/80 text-base sm:text-lg font-light leading-relaxed">
              Prijavi se za večer koja ti odgovara. Broj mjesta je ograničen radi ravnomjernog omjera sudionika.
            </p>
          </div>

          {loadingEvents ? (
            <div className="flex flex-col justify-center items-center py-16 text-brand gap-3">
              <Loader2 className="animate-spin text-brand" size={40} />
              <p className="text-sm font-semibold">Učitavanje aktivnih događaja...</p>
            </div>
          ) : activeEvents.length > 0 && currentEvent ? (
            <div className="max-w-4xl mx-auto">
              
              {/* Event selector pills if multiple events */}
              {activeEvents.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {activeEvents.map((evt) => {
                    const isSelected = evt.id === currentEvent.id;
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`p-4 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-white/95 border-brand shadow-lg ring-2 ring-brand/30 scale-[1.02]'
                            : 'bg-white/60 hover:bg-white/80 border-white/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-brand text-sm line-clamp-1">{evt.title}</span>
                            {isSelected && <CheckCircle2 size={16} className="text-brand shrink-0" />}
                          </div>
                          <p className="text-xs text-brand/70 font-semibold mb-2">Dob: {evt.ageGroup}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-brand/10 text-brand/90">
                          <span>{evt.dateStr}</span>
                          <span className="font-bold text-brand-light">{evt.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Selected Event Showcase Card */}
              <div className="bg-white/75 backdrop-blur-2xl p-6 sm:p-10 md:p-12 rounded-3xl border border-white/90 shadow-2xl shadow-brand/15 relative overflow-hidden">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-brand/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Prijave su u tijeku
                    </div>
                    <h3 className="font-serif font-bold text-3xl sm:text-4xl text-brand">
                      {currentEvent.title}
                    </h3>
                  </div>

                  <div className="bg-brand text-white px-5 py-3 rounded-2xl text-center self-start sm:self-auto shadow-md">
                    <span className="text-[10px] uppercase tracking-wider block opacity-80">Kotizacija</span>
                    <span className="font-serif font-bold text-2xl">{currentEvent.price}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-brand/60 block font-semibold">Dobna skupina</span>
                      <strong className="text-sm text-brand">{currentEvent.ageGroup}</strong>
                    </div>
                  </div>

                  <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-brand/60 block font-semibold">Datum</span>
                      <strong className="text-sm text-brand">{currentEvent.dateStr}</strong>
                    </div>
                  </div>

                  <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-brand/60 block font-semibold">Vrijeme</span>
                      <strong className="text-sm text-brand">{currentEvent.timeStr}</strong>
                    </div>
                  </div>

                  <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-brand/60 block font-semibold">Lokacija</span>
                      <strong className="text-sm text-brand truncate block max-w-[150px]">{currentEvent.location}</strong>
                    </div>
                  </div>
                </div>

                {/* Included perks checklist */}
                <div className="bg-brand/5 rounded-2xl p-4 sm:p-5 mb-8 border border-brand/10">
                  <p className="text-xs uppercase tracking-wider font-bold text-brand mb-3">Uključeno u večer:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-brand/85">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-brand shrink-0" />
                      <span>Piće dobrodošlice (vrhunsko vino ili sok)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-brand shrink-0" />
                      <span>10 – 15 brzih spojeva uz ugodnu glazbu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-brand shrink-0" />
                      <span>100% diskretno označavanje simpatija</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-brand shrink-0" />
                      <span>Rezultati i kontakti u roku 24 sata</span>
                    </div>
                  </div>
                </div>

                {/* CTA Registration Button */}
                <div className="text-center">
                  <Link
                    to={`/prijava?eventId=${currentEvent.id}`}
                    className="group relative inline-flex items-center justify-center gap-3 bg-brand hover:bg-brand-light text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-brand/25 transform hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Ispuni prijavu za ovaj termin
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  </Link>
                  <p className="mt-3 text-xs text-brand/70 font-medium">
                    Mjesta se brzo popunjavaju radi balansa spolova
                  </p>
                </div>

              </div>

              <div className="text-center mt-6">
                <Link to="/eventi" className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-light underline">
                  Pogledaj sve termine i pravila događaja <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-md p-10 rounded-3xl border border-white/90 text-center max-w-xl mx-auto shadow-sm">
              <Clock size={36} className="text-brand/50 mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-bold text-brand mb-2">Uskoro novi termini</h3>
              <p className="text-sm text-brand/80 mb-6">
                Sva mjesta za trenutne termine su popunjena. Uskoro objavljujemo nove datume!
              </p>
              <Link 
                to="/kontakt" 
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-brand-light transition-all"
              >
                Obavijesti me o novim datumima
              </Link>
            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* 6. KAKO FUNKCIONIRA? (Visual 4-step Guide)                                */}
        {/* ========================================================================= */}
        <section id="kako-funkcionira" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="text-brand-light" />
              <span>Jednostavan koncept</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand tracking-tight mb-4">
              Kako funkcionira Na prvi pogled?
            </h2>
            <p className="text-brand/80 text-base sm:text-lg font-light leading-relaxed">
              Zaboravi komplicirana pravila i tremu. Cijela večer je ležerna, ugodna i pod vodstvom naših simpatičnih domaćina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="font-serif font-bold text-xl text-brand mb-2">Online prijava</h3>
                <p className="text-xs text-brand/80 leading-relaxed font-light">
                  Odaberi svoju dobnu skupinu i ispuni kratku prijavu. Pazimo na točan balans broja žena i muškaraca.
                </p>
              </div>
              <div className="pt-4 border-t border-brand/10 mt-6 text-[11px] font-semibold text-brand/60">
                Trajanje: 1 minuta
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="font-serif font-bold text-xl text-brand mb-2">Piće dobrodošlice</h3>
                <p className="text-xs text-brand/80 leading-relaxed font-light">
                  Dolazak u bar, upoznavanje s domaćinom i čaša finog vina koja odmah razbija svaku početnu tremu.
                </p>
              </div>
              <div className="pt-4 border-t border-brand/10 mt-6 text-[11px] font-semibold text-brand/60">
                15 min prije početka
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="font-serif font-bold text-xl text-brand mb-2">Spojevi od 5 min</h3>
                <p className="text-xs text-brand/80 leading-relaxed font-light">
                  Sa svakom osobom razgovaraš 5 do 7 minuta. Zvuk zvonca označava rotaciju. Nema neugodnih tišina.
                </p>
              </div>
              <div className="pt-4 border-t border-brand/10 mt-6 text-[11px] font-semibold text-brand/60">
                10 – 15 zanimljivih susreta
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
                  4
                </div>
                <h3 className="font-serif font-bold text-xl text-brand mb-2">Obostrani match</h3>
                <p className="text-xs text-brand/80 leading-relaxed font-light">
                  U potpunoj tajnosti označavaš simpatije. Ako je simpatija obostrana, razmjenjujete kontakte unutar 24h.
                </p>
              </div>
              <div className="pt-4 border-t border-brand/10 mt-6 text-[11px] font-semibold text-brand/60">
                100% diskretno & sigurno
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. WHY CHOOSE US (Zašto upoznavanje uživo?)                                */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/90 p-8 sm:p-12 lg:p-16 shadow-xl shadow-brand/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Wine size={14} className="text-brand-light" />
                  <span>Stvarni dojam</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand leading-tight">
                  Zašto odabrati Na prvi pogled umjesto aplikacija za upoznavanje?
                </h2>
                <p className="text-brand/80 text-sm sm:text-base leading-relaxed font-light">
                  Aplikacije troše sate i sate na listanje profila i dopisivanje koje najčešće nikamo ne vodi. Na našim večerima u samo dva sata upoznaješ stvarne ljude u stvarnom svijetu.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong className="text-sm text-brand block">Odmah znaš postoji li kemija</strong>
                      <span className="text-xs text-brand/70 font-light">Govor tijela, glas, osmijeh i energija — to niti jedan algoritam ne može dočarati.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong className="text-sm text-brand block">Nema neugodnog odbijanja</strong>
                      <span className="text-xs text-brand/70 font-light">Nitko na licu mjesta ne zna koga si označio/la. Sve je 100% anonimno i bez stresa.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong className="text-sm text-brand block">Kvalitetan ambijent</strong>
                      <span className="text-xs text-brand/70 font-light">Odabiremo isključivo intimne, ugodne zagrebačke prostore u kojima se osjećaš opušteno.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-white/90">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/event-wine-cheers.jpg`} 
                    alt="Sretan par koji razgovara uz čašu vina na speed datingu" 
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. TESTIMONIALS (Dojmovi polaznika)                                       */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand mb-3">
              Što kažu oni koji su probali?
            </h2>
            <p className="text-brand/80 text-sm sm:text-base font-light">
              Iskustva ljudi koji su odlučili napraviti prvi korak:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-brand/85 italic leading-relaxed mb-6 font-light">
                  "Bila sam jako skeptična i imala veliku tremu, ali domaćini su toliko opušteni da sam se već nakon prvog pića osjećala kao na kavi s frendovima. Upoznala sam super dečka s kojim sam već tri mjeseca!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand/10">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  AH
                </div>
                <div>
                  <p className="font-bold text-xs text-brand">Ana H. (27)</p>
                  <p className="text-[10px] text-brand/60">Zagreb Centar</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-brand/85 italic leading-relaxed mb-6 font-light">
                  "Nakon tjedana dopisivanja na aplikacijama bez ijednog spoja, ovdje sam u jednoj večeri pričao s 12 cura. Format od 5 minuta je pun pogodak — točno vidiš je li kliknulo ili nije."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand/10">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  MK
                </div>
                <div>
                  <p className="font-bold text-xs text-brand">Marko K. (32)</p>
                  <p className="text-[10px] text-brand/60">Zagreb Maksimir</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md shadow-brand/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-brand/85 italic leading-relaxed mb-6 font-light">
                  "Ambijent vinskog bara bio je predivan, sve je bilo vrhunski organizirano. Čak i s onima s kojima nije bilo romantične iskre popila sam čašu vina i ugodno proćaskala."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand/10">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  PL
                </div>
                <div>
                  <p className="font-bold text-xs text-brand">Petra L. (29)</p>
                  <p className="text-[10px] text-brand/60">Zagreb Trešnjevka</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. HOME FAQ ACCORDION (Modern HTML details disclosure)                     */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand mb-3">
              Često postavljana pitanja
            </h2>
            <p className="text-brand/80 text-sm font-light">
              Sve što želiš znati prije prve prijave:
            </p>
          </div>

          <div className="space-y-4">
            
            <details name="home-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Što ako mi bude neugodno ili ostanem bez teksta?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Pet do sedam minuta prođe u trenu! Osim toga, na svakom stolu se nalaze diskretne kartice sa zabavnim i neobičnim pitanjima za razbijanje leda, tako da nikad ne morate brinuti o čemu pričati.
              </div>
            </details>

            <details name="home-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Kako funkcionira razmjena kontakata?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Nitko ne daje svoj kontakt za stolom uživo. Nakon svakog spoja u listić ili online profil zabilježiš je li ti se osoba svidjela. Ako ste oboje označili potvrdno, unutar 24h na email i u profil dobivate kontakt jedno drugoga.
              </div>
            </details>

            <details name="home-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Tko su ostali sudionici?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Naši sudionici su zaposleni, urbani samci iz Zagreba i okolice koji žele proširiti krug poznanstava i kojima je dosta površnih aplikacija. Svi sudionici su u istoj dobnoj skupini koju si odabrao/la.
              </div>
            </details>

            <details name="home-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Što ako moram otkazati?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Ako nas obavijestiš najmanje 48 sati prije početka, tvoju kotizaciju prebacujemo na sljedeći odgovarajući termin.
              </div>
            </details>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. FINAL BOTTOM CALL TO ACTION                                           */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-brand text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center mx-auto mb-2">
                <Heart size={24} className="fill-amber-300" />
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
                Ti napravi prvi korak.
              </h2>
              <p className="font-serif italic text-lg sm:text-xl text-peach-dark/90">
                Za sve ostalo pobrinut ćemo se mi.
              </p>
              <p className="text-xs sm:text-sm text-peach-dark/70 font-light max-w-md mx-auto">
                Pridruži se sljedećoj večeri u Zagrebu i doživi nezaboravne susrete.
              </p>
              <div className="pt-4">
                <a
                  href="#dogadaji-sekcija"
                  className="inline-flex items-center gap-2 bg-peach text-brand hover:bg-white px-9 py-4 rounded-full font-bold text-base shadow-xl hover:scale-105 transition-all"
                >
                  <span>Pogledaj termine i prijavi se</span>
                  <ChevronRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}
