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
  ChevronDown,
  Share2
} from 'lucide-react';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import FaqAccordion from '../components/FaqAccordion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Opći upit',
    message: ''
  });

  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
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
    setErrorMsg('');

    if (!acceptedPrivacy) {
      setErrorMsg("Molimo potvrdite suglasnost s obradom osobnih podataka kako biste poslali upit.");
      return;
    }

    setLoading(true);

    try {
      // 1. Uvijek sigurno spremamo upit u Firestore bazu 'contact_messages'
      await addDoc(collection(db, 'contact_messages'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject,
        message: formData.message.trim(),
        acceptedPrivacy: true,
        consentedAt: serverTimestamp(),
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
      setAcceptedPrivacy(false);
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
      "sameAs": [
        "https://instagram.com/na.prvi.pogled",
        "https://www.tiktok.com/@na.prvi.pogled",
        "https://web.facebook.com/profile.php?id=61594619954084"
      ]
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

            {/* Društvene mreže Card */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-md shadow-brand/5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Share2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand text-lg mb-1">Društvene mreže</h3>
                  <p className="text-xs text-brand/70 mb-3">Prati najave, objave i atmosferu s evenata:</p>
                  
                  <div className="space-y-2">
                    <a 
                      href="https://instagram.com/na.prvi.pogled" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 border border-pink-200/70 text-xs font-bold text-brand transition-all group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FaInstagram size={15} />
                      </span>
                      <span className="flex-1 truncate">Instagram</span>
                      <span className="text-pink-600 font-semibold text-[11px]">@na.prvi.pogled</span>
                    </a>

                    <a 
                      href="https://www.tiktok.com/@na.prvi.pogled" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-brand transition-all group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FaTiktok size={13} />
                      </span>
                      <span className="flex-1 truncate">TikTok</span>
                      <span className="text-gray-700 font-semibold text-[11px]">@na.prvi.pogled</span>
                    </a>

                    <a 
                      href="https://web.facebook.com/profile.php?id=61594619954084" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/70 text-xs font-bold text-brand transition-all group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FaFacebook size={14} />
                      </span>
                      <span className="flex-1 truncate">Facebook</span>
                      <span className="text-blue-600 font-semibold text-[11px]">Na prvi pogled</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Times Card */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-md shadow-brand/5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand text-lg mb-1">Lokacije održavanja</h3>
                  <p className="text-base text-brand font-semibold mb-1.5">
                    Café de Paris, Zagreb
                  </p>
                  
                  <div className="mb-3 inline-flex items-center gap-1.5 bg-brand/5 border border-brand/15 text-brand text-xs font-semibold px-3 py-1 rounded-full">
                    <Sparkles size={12} className="text-brand-light shrink-0" />
                    <span>Za sada samo u Zagrebu, uskoro dolazimo i u ostale gradove u Hrvatskoj!</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-brand/75 pt-2 border-t border-brand/10">
                    <Clock size={14} className="text-brand-light shrink-0" />
                    <span>Događaji se najčešće održavaju četvrtkom u 19:00 h.</span>
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

                {/* Consent Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      id="contactAcceptedPrivacy"
                      name="acceptedPrivacy"
                      required
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-brand bg-white/90 border-brand/30 focus:ring-brand accent-brand cursor-pointer rounded shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-brand/85 leading-snug group-hover:text-brand transition-colors">
                      Suglasan/na sam s obradom mojih osobnih podataka u svrhu pružanja odgovora na poslani upit. Pročitajte kako rukujemo vašim podacima u našim{' '}
                      <Link
                        to="/pravila-privatnosti#kontakt-obrada"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-brand hover:text-brand-light transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pravilima privatnosti
                      </Link>
                      . <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </label>
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
                  Tvoji podaci su strogo povjerljivi i koriste se isključivo za odgovor na tvoju poruku.
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

          <div className="max-w-3xl mx-auto">
            <FaqAccordion
              items={[
                {
                  question: 'Kako se prijaviti na nadolazeći event?',
                  answer: (
                    <span>
                      Prijave se vrše direktno na stranici{' '}
                      <a href="/eventi" className="font-semibold underline text-brand">
                        Eventi
                      </a>{' '}
                      ili na početnoj stranici klikom na željeni termin. Dovoljno je odabrati dobnu skupinu i ispuniti kratku prijavnicu.
                    </span>
                  )
                },
                {
                  question: 'Što ako moram otkazati dolazak?',
                  answer: 'Radi balansa sudionika molimo te da nas obavijestiš barem 48 sati unaprijed putem stranice gdje si se prijavio/la (preko svog profila ili prijavnice) kako bismo tvoje mjesto ponudili osobi s liste čekanja.'
                },
                {
                  question: 'Održavaju li se događaji i u drugim gradovima u Hrvatskoj?',
                  answer: 'Za sada organiziramo speed dating događaje isključivo u Zagrebu, no uskoro dolazimo i u ostale gradove diljem Hrvatske! Ako želiš da speed dating dođe u tvoj grad, slobodno nam pošalji poruku putem kontakt obrasca.'
                }
              ]}
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
