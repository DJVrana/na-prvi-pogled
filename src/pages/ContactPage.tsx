import { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Opći upit',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subjects = [
    'Opći upit',
    'Pitanje vezano za nadolazeći event',
    'Problem s prijavom ili matchingom',
    'Poslovna suradnja / Privatni event',
    'Povratna informacija / Dojam'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Uvijek sigurno spremamo upit u Firestore bazu 'contact_messages'
      await addDoc(collection(db, 'contact_messages'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject,
        message: formData.message.trim(),
        createdAt: serverTimestamp(),
        status: 'new'
      });

      // 2. Šaljemo obavijest organizatoru na email putem EmailJS-a
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (publicKey) {
        try {
          await emailjs.send(
            'default_service',
            'template_uuvkcp3', // Koristi postojeći verificirani template
            {
              name: formData.name.trim(),
              email: formData.email.trim(),
              subject: `[Na prvi pogled UPIT] ${formData.subject} - ${formData.name.trim()}`,
              html_message: `
                <h3>Novi kontakt upit s web stranice Na prvi pogled</h3>
                <p><strong>Ime i prezime:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Broj mobitela:</strong> ${formData.phone || 'Nije navedeno'}</p>
                <p><strong>Kategorija / Predmet:</strong> ${formData.subject}</p>
                <p><strong>Poruka:</strong></p>
                <div style="background-color: #f7f0eb; padding: 16px; border-radius: 8px; font-style: italic;">
                  ${formData.message.replace(/\n/g, '<br/>')}
                </div>
              `
            },
            publicKey
          );
        } catch (emailErr) {
          console.warn("EmailJS slanje nije uspjelo, no poruka je uspješno spremljena u bazu:", emailErr);
          // Čak i ako EmailJS javi grešku, poruka je u bazi tako da organizator ne gubi upit
        }
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Opći upit',
        message: ''
      });
    } catch (err: any) {
      console.error("Greška pri slanju kontakt forme:", err);
      setErrorMsg("Došlo je do poteškoće pri slanju poruke. Molimo pošaljite nam email direktno na naprvipogled.events@gmail.com.");
    } finally {
      setLoading(false);
    }
  };

  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Kontakt - Na prvi pogled",
    "description": "Stupite u kontakt s timom Na prvi pogled speed dating susreta u Zagrebu.",
    "url": "https://naprvipogled.com/kontakt",
    "mainEntity": {
      "@type": "Organization",
      "name": "Na prvi pogled",
      "email": "naprvipogled.events@gmail.com",
      "areaServed": "Zagreb, Croatia",
      "sameAs": ["https://instagram.com/na.prvi.pogled"]
    }
  };

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title="Kontakt | Na prvi pogled 💞 Speed Dating Zagreb"
        description="Imaš pitanje o speed dating događajima u Zagrebu? Pošalji nam poruku i javit ćemo ti se u najkraćem roku. Dostupni smo i na Instagramu."
        canonical="https://naprvipogled.com/kontakt"
        structuredData={contactStructuredData}
        keywords="kontakt na prvi pogled, speed dating zagreb upit, prijava zagreb susreti, organizacija speed dating"
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-brand-light" />
            <span>Stupi u kontakt s nama</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand tracking-tight mb-4">
            Tu smo za sva tvoja pitanja
          </h1>
          <p className="text-brand/80 text-base sm:text-lg leading-relaxed font-light">
            Imaš nedoumicu oko formata večeri, želiš saznati više o dobnim skupinama ili nas želiš angažirati za privatni događaj? Javi nam se, odgovaramo brzo i rado!
          </p>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Info Cards (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Email Card */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-md shadow-brand/5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Mail size={24} className="text-brand-light" />
                </div>
                <div>
                  <h3 className="font-bold text-brand text-lg mb-1">E-mail adresa</h3>
                  <p className="text-xs text-brand/70 mb-2">Piši nam u bilo koje doba dana.</p>
                  <a 
                    href="mailto:naprvipogled.events@gmail.com" 
                    className="font-semibold text-brand hover:text-brand-light underline transition-colors break-all"
                  >
                    naprvipogled.events@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Instagram Card */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-md shadow-brand/5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FaInstagram size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-brand text-lg mb-1">Instagram</h3>
                  <p className="text-xs text-brand/70 mb-2">Prati najave, storyje i atmosferu s evenata.</p>
                  <a 
                    href="https://instagram.com/na.prvi.pogled" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-brand hover:text-brand-light transition-colors"
                  >
                    @na.prvi.pogled
                  </a>
                </div>
              </div>
            </div>

            {/* Location & Times Card */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-md shadow-brand/5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-brand text-lg mb-1">Lokacije održavanja</h3>
                  <p className="text-sm text-brand/80 leading-relaxed mb-2">
                    Zagreb, Hrvatska. Evente održavamo u pažljivo odabranim, elegantnim i intimnim lounge & wine barovima u širem i užem centru Zagreba.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-brand/70 pt-2 border-t border-brand/10">
                    <Clock size={14} className="text-brand-light" />
                    <span>Događaji se najčešće održavaju srijedom i četvrtkom od 19:30 ili 20:00 h.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note about Safety & Discretion */}
            <div className="bg-brand/5 border border-brand/15 p-5 rounded-2xl text-xs text-brand/80 leading-relaxed">
              <p className="font-bold text-brand mb-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Diskrecija na prvom mjestu
              </p>
              Tvoji kontakt podaci i poruke su 100% povjerljivi i nikada se ne dijele s trećim stranama.
            </div>

          </section>

          {/* Right Column: Interactive Contact Form (7 Cols) */}
          <section className="lg:col-span-7 bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/90 shadow-xl shadow-brand/10">
            
            <div className="mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand mb-2">
                Pošalji nam poruku
              </h2>
              <p className="text-sm text-brand/70">
                Ispuni obrazac i javit ćemo ti se na tvoj e-mail u najkraćem roku (obično unutar 24 sata).
              </p>
            </div>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-bold text-xl text-emerald-900">
                  Poruka je uspješno poslana!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Hvala ti na javljanju. Tvoj upit je zabilježen i naš tim će ti odgovoriti u najkraćem roku na navedenu email adresu.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 bg-brand text-white rounded-full text-xs font-bold hover:bg-brand-light transition-all"
                >
                  Pošalji novu poruku
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider font-bold text-brand mb-1.5">
                    Ime i prezime <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="npr. Ana Horvat"
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-brand/20 text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm shadow-sm transition-all"
                  />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider font-bold text-brand mb-1.5">
                      Email adresa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tvoj@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/90 border border-brand/20 text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-xs uppercase tracking-wider font-bold text-brand mb-1.5">
                      Broj mobitela <span className="text-brand/50 font-normal">(opcionalno)</span>
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="091 234 5678"
                      className="w-full px-4 py-3 rounded-xl bg-white/90 border border-brand/20 text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Subject Selector */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs uppercase tracking-wider font-bold text-brand mb-1.5">
                    Predmet upita <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-brand/20 text-brand focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm shadow-sm transition-all"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider font-bold text-brand mb-1.5">
                    Tvoja poruka <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Napiši nam svoje pitanje, prijedlog ili komentar..."
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-brand/20 text-brand placeholder:text-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm shadow-sm transition-all resize-y"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-light text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-brand/25 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed text-base cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>Šaljem poruku...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Pošalji upit</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-brand/60">
                  Slanjem ovog obrasca prihvaćaš komunikaciju vezanu uz tvoj upit. Nikada ne šaljemo neželjenu poštu.
                </p>

              </form>
            )}

          </section>

        </div>

        {/* Quick FAQ Accordion Section using modern HTML details disclosure */}
        <section className="mt-24 pt-12 border-t border-brand/15">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl font-bold text-brand mb-3">
              Česta pitanja prije kontakta
            </h2>
            <p className="text-sm text-brand/70">
              Možda je odgovor na tvoje pitanje već ovdje:
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            
            <details name="contact-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Kako se prijaviti na nadolazeći event?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Prijave se vrše direktno na stranici <a href="/eventi" className="font-semibold underline text-brand">Eventi</a> ili na početnoj stranici klikom na željeni termin. Dovoljno je odabrati dobnu skupinu i ispuniti kratku prijavnicu.
              </div>
            </details>

            <details name="contact-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Što ako moram otkazati dolazak?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Radi balansa sudionika molimo te da nas obavijestiš barem 48 sati unaprijed putem ovog kontakt obrasca ili direktno na Instagram / mail kako bismo tvoje mjesto ponudili osobi s liste čekanja.
              </div>
            </details>

            <details name="contact-faq" className="group bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-5 cursor-pointer shadow-sm open:ring-2 open:ring-brand/20">
              <summary className="font-bold text-brand text-base flex items-center justify-between list-none">
                <span>Organizirate li privatne speed dating večeri za tvrtke ili rođendane?</span>
                <ChevronDown size={18} className="text-brand-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="pt-3 text-sm text-brand/80 leading-relaxed border-t border-brand/10 mt-3 font-light">
                Da! Vrlo rado organiziramo prilagođene tematske i privatne večeri. U kontakt formi odaberi predmet "Poslovna suradnja / Privatni event" i opiši nam svoju ideju.
              </div>
            </details>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
