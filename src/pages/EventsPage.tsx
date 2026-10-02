import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Wine, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
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

export default function EventsPage() {
  const [events, setEvents] = useState<ActiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('Sve');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: ActiveEvent[] = snapshot.docs.map(docData => ({
            id: docData.id,
            ...(docData.data() as any)
          }));
          setEvents(list);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Greška pri dohvatu događaja:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const ageCategories = ['Sve', '20-30', '25-35', '30-45'];

  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'Sve') return events;
    return events.filter(e => e.ageGroup.includes(selectedFilter.split('-')[0]));
  }, [events, selectedFilter]);

  // Schema.org Structured Data for Events
  const eventsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Nadolazeći Speed Dating Događaji u Zagrebu",
    "itemListElement": events.map((evt, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Event",
        "name": evt.title,
        "description": `Speed dating događaj u Zagrebu za dobnu skupinu ${evt.ageGroup}. Upoznajte nove ljude uživo u opuštenoj atmosferi.`,
        "startDate": evt.dateStr,
        "location": {
          "@type": "Place",
          "name": evt.location,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Zagreb",
            "addressCountry": "HR"
          }
        },
        "offers": {
          "@type": "Offer",
          "price": evt.price.replace(/[^0-9]/g, '') || "20",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": `https://naprvipogled.com/prijava?eventId=${evt.id}`
        },
        "organizer": {
          "@type": "Organization",
          "name": "Na prvi pogled",
          "url": "https://naprvipogled.com"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title="Događaji i Termini | Na prvi pogled 💞 Speed Dating Zagreb"
        description="Pregledaj sve aktivne speed dating večeri u Zagrebu po dobnim skupinama. Prijavi se online na vrijeme – broj mjesta je ograničen radi jednakog omjera sudionika."
        canonical="https://naprvipogled.com/eventi"
        structuredData={eventsStructuredData}
        keywords="speed dating zagreb termini, prijava na speed dating, upoznavanje zagreb događaji, na prvi pogled prijave"
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Header Hero Banner */}
        <section className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Calendar size={14} className="text-brand-light" />
            <span>Nadolazeći termini susreta</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand tracking-tight mb-4">
            Pronađi večer za svoju dobnu skupinu
          </h1>
          <p className="text-brand/80 text-base sm:text-lg leading-relaxed font-light">
            Svi naši događaji pažljivo su organizirani kako bi se osigurao jednak omjer žena i muškaraca u sličnim dobnim rasponima. Odaberi termin i osiguraj svoje mjesto na vrijeme.
          </p>
        </section>

        {/* What's Included Strip */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-6 sm:p-8 shadow-lg shadow-brand/5 mb-14">
          <h2 className="text-xs uppercase tracking-widest text-brand-light font-bold mb-4 text-center">
            Što je sve uključeno u svaku kotizaciju?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-brand">
            <div className="flex items-center gap-3 bg-white/60 p-3.5 rounded-2xl border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Wine size={20} className="text-brand-light" />
              </div>
              <span className="text-xs font-semibold">Piće dobrodošlice (vrhunsko vino ili sok)</span>
            </div>

            <div className="flex items-center gap-3 bg-white/60 p-3.5 rounded-2xl border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <span className="text-xs font-semibold">10 do 15 brzih spojeva od 5-7 min</span>
            </div>

            <div className="flex items-center gap-3 bg-white/60 p-3.5 rounded-2xl border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-semibold">100% anonimni matching sustav</span>
            </div>

            <div className="flex items-center gap-3 bg-white/60 p-3.5 rounded-2xl border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-amber-500" />
              </div>
              <span className="text-xs font-semibold">Domaćin i opuštena, vođena atmosfera</span>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        {events.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="text-xs font-bold text-brand uppercase tracking-wider mr-2 hidden sm:inline">
              Filtriraj po dobi:
            </span>
            {ageCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'bg-white/70 hover:bg-white text-brand border border-white/80'
                }`}
              >
                {cat === 'Sve' ? 'Svi događaji' : `Dob: ${cat}`}
              </button>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brand gap-3">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-sm font-semibold">Učitavanje termina u tijeku...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 shadow-xl shadow-brand/10 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div>
                  {/* Status pill */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand/10">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Prijave otvorene
                    </span>
                    <span className="text-sm font-extrabold text-brand bg-brand/5 px-2.5 py-1 rounded-lg">
                      {evt.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-brand group-hover:text-brand-light transition-colors mb-4">
                    {evt.title}
                  </h3>

                  {/* Details items */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-brand/85 bg-white/60 p-2.5 rounded-xl border border-white/70">
                      <Users size={16} className="text-brand-light shrink-0" />
                      <div>
                        <span className="text-[10px] text-brand/60 uppercase block leading-none">Dobna skupina</span>
                        <strong className="text-brand">{evt.ageGroup}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-brand/85 bg-white/60 p-2.5 rounded-xl border border-white/70">
                      <Calendar size={16} className="text-brand-light shrink-0" />
                      <div>
                        <span className="text-[10px] text-brand/60 uppercase block leading-none">Datum</span>
                        <span className="font-medium text-brand">{evt.dateStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-brand/85 bg-white/60 p-2.5 rounded-xl border border-white/70">
                      <Clock size={16} className="text-brand-light shrink-0" />
                      <div>
                        <span className="text-[10px] text-brand/60 uppercase block leading-none">Vrijeme početka</span>
                        <span className="font-medium text-brand">{evt.timeStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-brand/85 bg-white/60 p-2.5 rounded-xl border border-white/70">
                      <MapPin size={16} className="text-brand-light shrink-0" />
                      <div>
                        <span className="text-[10px] text-brand/60 uppercase block leading-none">Lokacija</span>
                        <span className="font-medium text-brand">{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration CTA button */}
                <div className="pt-4 border-t border-brand/10">
                  <Link
                    to={`/prijava?eventId=${evt.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-brand/20 transition-all transform hover:scale-[1.02]"
                  >
                    <span>Prijavi se za ovaj termin</span>
                    <ChevronRight size={16} />
                  </Link>
                  <p className="text-[11px] text-center text-brand/60 mt-2 font-medium">
                    Preostalo malo mjesta radi balansa
                  </p>
                </div>

              </div>
            ))}
          </section>
        ) : (
          /* Empty / In-between events announcement */
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/90 p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-5">
              <Calendar size={32} />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand mb-3">
              Uskoro objavljujemo nove termine!
            </h3>
            <p className="text-brand/80 text-sm leading-relaxed mb-6 font-light">
              Prijave za prethodne večeri su popunjene. Trenutno pripremamo nove datume za sve dobne skupine u Zagrebu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://instagram.com/na.prvi.pogled"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-brand-light transition-all shadow-md"
              >
                Prati najave na Instagramu
              </a>
              <Link
                to="/kontakt"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand px-6 py-3 rounded-full text-xs font-bold border border-brand/20 hover:bg-white/80 transition-all"
              >
                Pošalji upit za listu čekanja
              </Link>
            </div>
          </div>
        )}

        {/* How it works info section */}
        <section className="mt-24 pt-16 border-t border-brand/15">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand mb-4">
              Kako točno izgleda speed dating večer?
            </h2>
            <p className="text-brand/80 text-sm sm:text-base font-light">
              Ako dolaziš prvi put, nema razloga za brigu! Cijela večer je osmišljena tako da se osjećaš opušteno i prirodno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                1
              </div>
              <h3 className="font-bold text-brand text-base mb-2">Dolazak & Piće</h3>
              <p className="text-xs text-brand/75 leading-relaxed font-light">
                Dođi 15 minuta ranije. Domaćin te dočekuje, preuzimaš svoje piće dobrodošlice i svoj osobni broj stola.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                2
              </div>
              <h3 className="font-bold text-brand text-base mb-2">Brzi spojevi</h3>
              <p className="text-xs text-brand/75 leading-relaxed font-light">
                Sa svakom osobom razgovaraš 5 do 7 minuta. Zvonce označava rotaciju. Nema neugodnih pauza.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                3
              </div>
              <h3 className="font-bold text-brand text-base mb-2">Tajno glasanje</h3>
              <p className="text-xs text-brand/75 leading-relaxed font-light">
                Nakon svakog razgovora označiš sviđa li ti se osoba. Tvoje odluke su 100% tajne i nitko ih ne vidi.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                4
              </div>
              <h3 className="font-bold text-brand text-base mb-2">Match & Spoj</h3>
              <p className="text-xs text-brand/75 leading-relaxed font-light">
                U roku 24h dobivaš obavijest o obostranim simpatijama i kontakte za dogovor pravog drugog spoja.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ for Events using modern <details name="faq"> disclosure */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand text-center mb-8">
            Najčešća pitanja o događajima
          </h2>

          <div className="space-y-4">
            <details name="event-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Što ako mi se nitko na događaju ne svidi?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                To je sasvim u redu! Nisi obvezan/na označiti nikoga. Ako nema obostrane simpatije, tvoji podaci se nikome ne prosljeđuju, a večer si svejedno proveo/la u zabavnom društvu uz čašu vina.
              </div>
            </details>

            <details name="event-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Mogu li doći s prijateljem ili prijateljicom?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Naravno! Mnogi sudionici dolaze u paru s prijateljima radi podrške. Tijekom brzih spojeva svatko razgovara samostalno sa svojim sugovornikom, no prije i poslije možete se družiti zajedno.
              </div>
            </details>

            <details name="event-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Što je dress code?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Preporučujemo <strong>smart-casual</strong> stil. Obuci ono u čemu se osjećaš privlačno i samopouzdano, kao za subotnji večernji izlazak na piće.
              </div>
            </details>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
