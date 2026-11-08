import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Calendar, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialName?: string;
  initialAge?: string | number;
  initialGender?: string;
  onSuccess?: (ageGroups: string[], exactAge?: number | null) => void;
}

const AGE_GROUPS = [
  '20 – 28 godina',
  '25 – 35 godina',
  '30 – 42 godine',
  '40 – 55 godina',
  '50+ godina',
  'Sve dobne skupine'
];

export default function NewsletterModal({
  isOpen,
  onClose,
  initialEmail = '',
  initialName = '',
  initialAge = '',
  initialGender = '',
  onSuccess
}: NewsletterModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(['25 – 35 godina']);
  const [exactAge, setExactAge] = useState(initialAge ? String(initialAge) : '');
  const [gender, setGender] = useState<'Ž' | 'M' | ''>(
    initialGender === 'Ž' || initialGender === 'M' ? initialGender : ''
  );
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      if (initialName) setName(initialName);
      if (initialAge) setExactAge(String(initialAge));
      if (initialGender === 'Ž' || initialGender === 'M') {
        setGender(initialGender);
      }
      setSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, initialEmail, initialName, initialAge, initialGender]);

  if (!isOpen) return null;

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
      setErrorMessage('Molimo odaberite barem jednu dobnu skupinu.');
      return;
    }

    setLoading(true);

    try {
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
        source: 'modal'
      }, { merge: true });

      setSuccess(true);
      if (onSuccess) {
        onSuccess(selectedAgeGroups, ageNum);
      }
    } catch (err: any) {
      console.error('Greška pri prijavi na newsletter:', err);
      setErrorMessage('Došlo je do greške pri spremanju. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-peach max-w-xl w-full rounded-3xl shadow-2xl border border-white/90 overflow-hidden text-brand relative max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-brand/10 bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-inner">
              <Mail size={20} className="text-brand-light" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand">
                Prijava na newsletter
              </h3>
              <p className="text-xs text-brand/70 mt-0.5">
                Obavijesti o novim terminima za tvoju dobnu skupinu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-brand/50 hover:text-brand hover:bg-brand/5 rounded-full transition-colors cursor-pointer"
            aria-label="Zatvori modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {success ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 text-center animate-fade-in-up space-y-3">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check size={24} />
              </div>
              <h4 className="font-serif text-xl font-bold text-emerald-950">
                Uspješno si prijavljen/a! 🎉
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-light">
                Zabilježili smo tvoje postavke za dobnu skupinu{' '}
                <strong className="font-semibold">{selectedAgeGroups.join(', ')}</strong>.
                Poslat ćemo ti obavijest čim objavimo novi termin za tebe.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
                >
                  U redu, zatvori
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand mb-1">
                    Tvoje ime *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Npr. Ana Horvat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-xs font-medium text-brand shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand mb-1">
                    E-mail adresa *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvoj.email@primjer.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-xs font-medium text-brand shadow-xs outline-none"
                  />
                </div>
              </div>

              {/* Exact age and Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand mb-1">
                    Koliko imaš godina? *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    required
                    value={exactAge}
                    onChange={(e) => setExactAge(e.target.value)}
                    placeholder="Npr. 28"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-xs text-brand shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand mb-1">
                    Tvoj spol *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('Ž')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        gender === 'Ž'
                          ? 'bg-brand text-white border-brand shadow-sm font-bold'
                          : 'bg-white/80 text-brand border-brand/15 hover:bg-white'
                      }`}
                    >
                      👩 Žensko
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        gender === 'M'
                          ? 'bg-brand text-white border-brand shadow-sm font-bold'
                          : 'bg-white/80 text-brand border-brand/15 hover:bg-white'
                      }`}
                    >
                      👨 Muško
                    </button>
                  </div>
                </div>
              </div>

              {/* Age Groups Selector */}
              <div>
                <label className="block text-xs font-bold text-brand uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-light" />
                  <span>Odaberi dobne skupine koje te zanimaju: *</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((group) => {
                    const isSelected = selectedAgeGroups.includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleAgeGroup(group)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-brand text-white border-brand shadow-sm'
                            : 'bg-white/80 hover:bg-white text-brand border-brand/15 hover:border-brand/30'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-brand/70 hover:bg-brand/5 cursor-pointer"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-brand text-white hover:bg-brand-light px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Spremanje...</span>
                    </>
                  ) : (
                    <>
                      <span>Potvrdi prijavu</span>
                      <Sparkles size={14} className="text-amber-300" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

