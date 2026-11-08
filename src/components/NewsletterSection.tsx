import { useState } from 'react';
import {
  Mail,
  Sparkles,
  Check,
  Loader2,
  Heart,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface NewsletterSectionProps {
  id?: string;
  className?: string;
  compact?: boolean;
}

const AGE_GROUPS = [
  '20 – 28 godina',
  '25 – 35 godina',
  '30 – 42 godine',
  '40 – 55 godina',
  '50+ godina',
  'Sve dobne skupine'
];

export default function NewsletterSection({ id = 'newsletter-sekcija', className = '', compact = false }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(['25 – 35 godina']);
  const [exactAge, setExactAge] = useState('');
  const [gender, setGender] = useState<'Ž' | 'M' | ''>('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleAgeGroup = (group: string) => {
    if (group === 'Sve dobne skupine') {
      setSelectedAgeGroups(['Sve dobne skupine']);
      return;
    }

    let updated = selectedAgeGroups.filter(g => g !== 'Sve dobne skupine');
    if (updated.includes(group)) {
      updated = updated.filter(g => g !== group);
    } else {
      updated.push(group);
    }

    if (updated.length === 0) {
      updated = [group];
    }
    setSelectedAgeGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Molimo unesite vaše ime.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Molimo unesite valjanu e-mail adresu.');
      return;
    }

    const ageNum = parseInt(exactAge.trim(), 10);
    if (!exactAge.trim() || isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      setErrorMessage('Molimo unesite valjane godine (18 – 99).');
      return;
    }

    if (!gender || (gender !== 'Ž' && gender !== 'M')) {
      setErrorMessage('Molimo odaberite spol (Žensko ili Muško).');
      return;
    }

    if (selectedAgeGroups.length === 0) {
      setErrorMessage('Molimo odaberite barem jednu dobnu skupinu za obavijesti.');
      return;
    }

    setLoading(true);

    try {
      // Use clean email hash/key to avoid duplicates
      const emailDocId = cleanEmail.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const docRef = doc(db, 'newsletter_subscribers', emailDocId);

      await setDoc(docRef, {
        email: cleanEmail,
        name: name.trim(),
        ageGroups: selectedAgeGroups,
        exactAge: ageNum,
        gender: gender,
        active: true,
        updatedAt: serverTimestamp(),
        source: compact ? 'compact_section' : 'main_section'
      }, { merge: true });

      setSuccess(true);
    } catch (err: any) {
      console.error('Greška pri prijavi na newsletter:', err);
      setErrorMessage('Došlo je do greške pri spremanju. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 p-8 sm:p-12 lg:p-14 shadow-xl shadow-brand/5 overflow-hidden">

        {/* Subtle decorative background circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Mail size={14} className="text-brand-light" />
              <span>Obavijesti o novim terminima</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand tracking-tight mb-3">
              Želiš prvi/a saznati za novu večer u tvojoj dobnoj skupini?
            </h2>

            <p className="text-brand/80 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
              Termini za speed dating susrete brzo se popunjavaju radi balansa spolova.
              Prijavi se i javit ćemo ti čim otvorimo prijave za tvoju dob!
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 text-center animate-fade-in-up">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/20">
                <Check size={28} />
              </div>

              <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
                Uspješno si prijavljen/a na obavijesti! 🎉
              </h3>

              <p className="text-emerald-800 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-4 font-light">
                Zabilježili smo tvoje postavke za dobnu skupinu{' '}
                <strong className="font-semibold text-emerald-950">{selectedAgeGroups.join(', ')}</strong>.
                Čim raspišemo novi odgovarajući termin, poslat ćemo ti obavijest na{' '}
                <strong className="font-semibold text-emerald-950">{email}</strong>.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setName('');
                  setExactAge('');
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Prijavi drugu e-mail adresu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Age group selection pills */}
              <div>
                <label className="block text-xs font-bold text-brand uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-light" />
                  <span>Odaberi svoju dobnu skupinu (ili više njih):</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((group) => {
                    const isSelected = selectedAgeGroups.includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleAgeGroup(group)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${isSelected
                            ? 'bg-brand text-white border-brand shadow-sm shadow-brand/20 scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-brand border-brand/15 hover:border-brand/30'
                          }`}
                      >
                        {isSelected && <span className="mr-1.5">✓</span>}
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newsletter-name" className="block text-xs font-semibold text-brand/80 mb-1">
                    Tvoje ime *
                  </label>
                  <input
                    id="newsletter-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Npr. Ana Horvat"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm text-brand placeholder:text-brand/40 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="newsletter-email" className="block text-xs font-semibold text-brand/80 mb-1">
                    E-mail adresa *
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvoja@adresa.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm text-brand placeholder:text-brand/40 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Exact age and gender selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label htmlFor="newsletter-exact-age" className="block text-xs font-semibold text-brand/80 mb-1">
                    Koliko imaš godina? *
                  </label>
                  <input
                    id="newsletter-exact-age"
                    type="number"
                    min="18"
                    max="99"
                    required
                    value={exactAge}
                    onChange={(e) => setExactAge(e.target.value)}
                    placeholder="Npr. 28"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm text-brand placeholder:text-brand/40 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand/80 mb-1">
                    Tvoj spol *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('Ž')}
                      className={`py-3 text-xs sm:text-sm font-semibold rounded-2xl border transition-all cursor-pointer ${
                        gender === 'Ž'
                          ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 font-bold'
                          : 'bg-white/80 text-brand border-brand/15 hover:bg-white'
                      }`}
                    >
                      👩 Žensko
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`py-3 text-xs sm:text-sm font-semibold rounded-2xl border transition-all cursor-pointer ${
                        gender === 'M'
                          ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 font-bold'
                          : 'bg-white/80 text-brand border-brand/15 hover:bg-white'
                      }`}
                    >
                      👨 Muško
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button row */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-light px-6 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Spremanje prijave...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="text-amber-300" />
                      <span>Prijavi se na besplatni newsletter</span>
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Trust statement */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] text-brand/60 font-light text-center">
                <span className="flex items-center gap-1.5">
                  <Heart size={12} className="text-rose-500 fill-rose-500" />
                  Bez neželjene pošte (spam-a)
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Šaljemo obavijesti samo za nove termine i važne novosti</span>
                <span className="hidden sm:inline">•</span>
                <span>Odjava jednim klikom u svakom trenutku</span>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
}

