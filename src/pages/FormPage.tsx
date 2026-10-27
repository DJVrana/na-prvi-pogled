import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  limit, 
  getDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db, auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Heart, 
  LogOut, 
  Loader2, 
  Sparkles, 
  Calendar, 
  Users, 
  UserRound, 
  Clock, 
  Clock3, 
  ChevronDown, 
  Mail,
  MapPin,
  CreditCard,
  Check,
  AlertCircle
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

interface ActiveEvent {
  id: string;
  title: string;
  customFields?: CustomField[];
  maxRegistrations?: number | string;
  registrationCount?: number;
  introText?: string;
  noteText?: string;
  closingText?: string;
  timeNote?: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  ageGroup?: string;
  price?: string;
}

export default function FormPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');

  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [isEventFull, setIsEventFull] = useState(false);

  const [formData, setFormData] = useState({
    imePrezime: '',
    spol: '',
    email: '',
    godine: '',
    napomena: ''
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMediaConsent, setAcceptedMediaConsent] = useState(false);
  const [showMediaDetails, setShowMediaDetails] = useState(false);

  const [existingRegistration, setExistingRegistration] = useState<any | null>(null);
  const [checkRegistrationLoading, setCheckRegistrationLoading] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (user && activeEvent) {
        setCheckRegistrationLoading(true);
        try {
          const q = query(
            collection(db, 'prijave'),
            where('eventId', '==', activeEvent.id),
            where('uid', '==', user.uid),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setExistingRegistration(snap.docs[0].data());
          } else {
            setExistingRegistration(null);
          }
        } catch (err) {
          console.error("Greška pri provjeri prijave:", err);
        } finally {
          setCheckRegistrationLoading(false);
        }
      }
    };
    checkRegistration();
  }, [user, activeEvent]);

  const handleCustomChange = (fieldId: string, value: any) => {
    setCustomAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || ''
        }));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const q = query(collection(db, 'events'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: ActiveEvent[] = snapshot.docs.map(docData => {
            const data = docData.data();
            return {
              id: docData.id,
              title: data.title,
              customFields: data.customFields || [],
              maxRegistrations: data.maxRegistrations,
              registrationCount: data.registrationCount || 0,
              introText: data.introText || '',
              noteText: data.noteText || '',
              closingText: data.closingText || '',
              timeNote: data.timeNote || '',
              dateStr: data.dateStr || '',
              timeStr: data.timeStr || '',
              location: data.location || '',
              ageGroup: data.ageGroup || '',
              price: data.price || ''
            };
          });

          setActiveEvents(list);

          let target = list.find(e => e.id === eventIdFromUrl) || null;
          if (!target && eventIdFromUrl) {
            const singleDoc = await getDoc(doc(db, 'events', eventIdFromUrl));
            if (singleDoc.exists()) {
              const data = singleDoc.data();
              target = {
                id: singleDoc.id,
                title: data.title,
                customFields: data.customFields || [],
                maxRegistrations: data.maxRegistrations,
                registrationCount: data.registrationCount || 0,
                introText: data.introText || '',
                noteText: data.noteText || '',
                closingText: data.closingText || '',
                timeNote: data.timeNote || '',
                dateStr: data.dateStr || '',
                timeStr: data.timeStr || '',
                location: data.location || '',
                ageGroup: data.ageGroup || '',
                price: data.price || ''
              };
            }
          }

          if (!target && list.length > 0) {
            target = list[0];
          }

          if (target) {
            setActiveEvent(target);
            let isFull = false;
            if (target.maxRegistrations && Number(target.maxRegistrations) > 0) {
              const validCount = Number(target.registrationCount) || 0;
              if (validCount >= Number(target.maxRegistrations)) {
                isFull = true;
              }
            }
            setIsEventFull(isFull);
          } else {
            setActiveEvent(null);
          }
        } else {
          setActiveEvents([]);
          setActiveEvent(null);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju događaja:", err);
      } finally {
        setEventLoading(false);
      }
    };
    fetchActiveEvents();
  }, [eventIdFromUrl]);

  const handleSelectEvent = (evt: ActiveEvent) => {
    setActiveEvent(evt);
    setSearchParams({ eventId: evt.id }, { replace: true });
    let isFull = false;
    if (evt.maxRegistrations && Number(evt.maxRegistrations) > 0) {
      const validCount = Number(evt.registrationCount) || 0;
      if (validCount >= Number(evt.maxRegistrations)) {
        isFull = true;
      }
    }
    setIsEventFull(isFull);
    setCustomAnswers({});
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Greška pri prijavi: ", err);
      setError("Došlo je do greške pri prijavi s Google računom.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Greška pri odjavi: ", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Morate biti prijavljeni da biste poslali prijavu.");
      return;
    }
    if (!activeEvent) {
      setError("Prijave su trenutno zatvorene.");
      return;
    }

    if (!formData.spol) {
      setError("Molimo odaberite spol (M ili Ž).");
      return;
    }

    if (!acceptedPrivacy) {
      setError("Za slanje prijave potrebno je prihvatiti Pravila privatnosti.");
      return;
    }

    if (!acceptedMediaConsent) {
      setError("Za sudjelovanje na događaju potrebno je prihvatiti suglasnost za snimanje i fotografiranje.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map customAnswers to { label, value } array
      const customAnswersArray = (activeEvent.customFields || [])
        .filter(field => customAnswers[field.id] !== undefined && customAnswers[field.id] !== '' && (!Array.isArray(customAnswers[field.id]) || customAnswers[field.id].length > 0))
        .map(field => ({
          label: field.label,
          value: customAnswers[field.id]
        }));

      // Check count again right before saving to prevent race conditions
      if (activeEvent.maxRegistrations && Number(activeEvent.maxRegistrations) > 0) {
        const eventSnap = await getDoc(doc(db, 'events', activeEvent.id));
        if (eventSnap.exists()) {
          const validCount = Number(eventSnap.data().registrationCount) || 0;
          if (validCount >= Number(activeEvent.maxRegistrations)) {
            setError("Nažalost, u međuvremenu su se popunila sva mjesta.");
            setLoading(false);
            setIsEventFull(true);
            return;
          }
        }
      }

      await addDoc(collection(db, 'prijave'), {
        ...formData,
        godine: Number(formData.godine),
        uid: user.uid,
        eventId: activeEvent.id,
        customAnswers: customAnswersArray,
        status: 'pending',
        acceptedPrivacy: true,
        acceptedMediaConsent: true,
        consentedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Increment the event registration count safely
      await updateDoc(doc(db, 'events', activeEvent.id), {
        registrationCount: increment(1)
      });

      setExistingRegistration({
        status: 'pending',
        ...formData
      });
    } catch (err) {
      console.error("Error adding document: ", err);
      setError('Došlo je do greške prilikom prijave. Pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-peach text-brand flex flex-col items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60 mb-3" />
        <p className="text-xs font-semibold text-brand/60 uppercase tracking-wider">Učitavanje prijavnice...</p>
      </div>
    );
  }

  // If someone enters the URL directly when there is no active event
  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
        <SEO 
          title="Prijave su zatvorene | Na prvi pogled 💞 Speed Dating"
          description="Trenutno nema otvorenih termina za prijavu na speed dating. Pratite naše nove najave na profilu i prijavite se na vrijeme."
        />
        <Navbar />

        <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full flex items-center justify-center">
          <div className="bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-brand/10 border border-white/90 text-center w-full animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-5">
              <Calendar size={32} className="text-brand-light" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-brand">Prijave su trenutno zatvorene</h1>
            <p className="text-brand/80 mb-8 font-light text-sm sm:text-base leading-relaxed">
              Trenutno nema aktivnih događaja za koje se moguće prijaviti. Pratite naš Instagram za najave novih susreta i termina!
            </p>
            <Link to="/eventi" className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-brand-light transition-all shadow-md">
              <ArrowLeft size={16} /> Pregledaj događaje
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
      <SEO 
        title={`Prijava za ${activeEvent.title} | Na prvi pogled 💞 Speed Dating`}
        description={`Prijavi se za speed dating događaj ${activeEvent.title} (${activeEvent.dateStr || ''}). Upoznaj nekoga uživo kroz kratke razgovore u opuštenoj atmosferi.`}
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand/70 hover:text-brand transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Natrag na početnu</span>
          </Link>
        </div>

        {/* Active Events Switcher (if multiple active events exist) */}
        {activeEvents.length > 1 && (
          <div className="mb-6 p-4 rounded-3xl bg-white/70 backdrop-blur-md border border-white/90 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-light" />
                Odaberi termin za prijavu:
              </span>
              <span className="text-xs font-semibold text-brand/60">
                {activeEvents.length} {activeEvents.length === 1 ? 'termin' : activeEvents.length < 5 ? 'termina' : 'termina'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeEvents.map(evt => {
                const isCurrent = evt.id === activeEvent.id;
                const isFull = evt.maxRegistrations && Number(evt.maxRegistrations) > 0 
                  ? Number(evt.registrationCount || 0) >= Number(evt.maxRegistrations) 
                  : false;

                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => handleSelectEvent(evt)}
                    className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 ring-2 ring-brand/30'
                        : 'bg-white/80 text-brand hover:bg-white border-white/90 hover:border-brand/20 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-serif font-bold text-sm truncate">{evt.title}</span>
                        {isFull ? (
                          <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                            Popunjeno
                          </span>
                        ) : isCurrent ? (
                          <CheckCircle2 size={16} className="text-white shrink-0" />
                        ) : null}
                      </div>
                      <p className={`text-xs font-medium ${isCurrent ? 'text-white/80' : 'text-brand/70'}`}>
                        Dob: <strong className={isCurrent ? 'text-white' : 'text-brand'}>{evt.ageGroup}</strong>
                      </p>
                    </div>

                    <div className={`text-[11px] pt-2 mt-2 border-t flex items-center justify-between ${
                      isCurrent ? 'border-white/15 text-white/90' : 'border-brand/10 text-brand/75'
                    }`}>
                      <span>{evt.dateStr}</span>
                      <span className="font-bold">{evt.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Form Container Card */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand/10 border border-white/90">
          
          {/* Selected Event Details Header Badge */}
          <div className="text-center mb-8 pb-6 border-b border-brand/10">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span>Speed Dating</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-3 text-xs text-brand/80 font-medium mb-4">
              {activeEvent.dateStr && (
                <span className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-full">
                  <Calendar size={13} className="text-brand-light" />
                  <span>{activeEvent.dateStr} u {activeEvent.timeStr || '19:00'}</span>
                </span>
              )}
              {activeEvent.ageGroup && (
                <span className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-full">
                  <Users size={13} className="text-brand-light" />
                  <span>{activeEvent.ageGroup}</span>
                </span>
              )}
              {activeEvent.location && (
                <span className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-full">
                  <MapPin size={13} className="text-brand-light" />
                  <span className="truncate max-w-[180px]">{activeEvent.location}</span>
                </span>
              )}
              {activeEvent.price && (
                <span className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-full">
                  <CreditCard size={13} className="text-brand-light" />
                  <span>{activeEvent.price}</span>
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand uppercase mb-2">
              Prijava
            </h1>
            <p className="text-xs sm:text-sm text-brand/70 font-light">
              Ispuni podatke ispod. Sva polja s <span className="text-rose-600 font-bold">*</span> su obavezna.
            </p>
          </div>

          {/* Event Full Warning banner */}
          {isEventFull && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-2xl mb-8 text-center shadow-xs">
              <p className="font-serif font-bold text-lg mb-1">Popunjena su sva mjesta za ovaj termin</p>
              <p className="text-xs text-rose-800/80 mb-3 leading-relaxed">
                Nažalost, sva mjesta za <strong>{activeEvent.title}</strong> ({activeEvent.dateStr}) su već rezervirana radi balansa sudionika.
                {activeEvents.length > 1 ? " Molimo odaberi drugi dostupni termin iznad." : " Prati naš profil za najave novih susreta!"}
              </p>
              <Link to="/eventi" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline">
                <ArrowLeft size={13} /> Pregledaj ostale događaje
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl mb-6 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User Authentication Status or Login */}
          {!user ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-5 shadow-inner">
                <UserRound size={32} className="text-brand-light" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand mb-2">
                Prijavi se prije ispunjavanja prijavnice
              </h3>
              <p className="text-brand/75 text-sm max-w-md mx-auto mb-6 leading-relaxed font-light">
                Kako bismo osigurali autentičnost prijava i spriječili spam, prijava se vrši putem Google računa u jednom kliku.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] border border-gray-200 flex justify-center items-center gap-3 cursor-pointer"
              >
                <FaGoogle size={18} className="text-blue-600" />
                <span>Prijavi se s Googleom</span>
              </button>
            </div>
          ) : checkRegistrationLoading ? (
            <div className="flex flex-col items-center justify-center py-14 text-brand/60 gap-3">
              <Loader2 className="animate-spin text-brand/60" size={32} />
              <p className="text-xs font-semibold uppercase tracking-wider">Provjera statusa prijave...</p>
            </div>
          ) : existingRegistration ? (
            /* User already registered for this event */
            <div className="text-center py-6">
              {(!existingRegistration.status || existingRegistration.status === 'accepted') && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2 text-brand">Prijava je potvrđena!</h3>
                  <p className="text-brand/80 mb-8 font-light leading-relaxed max-w-md mx-auto">
                    Tvoja prijava za ovaj događaj je uspješno prihvaćena i osigurano ti je mjesto. Radujemo se susretu!
                  </p>
                </>
              )}

              {existingRegistration.status === 'pending' && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <Clock3 size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2 text-brand">Prijava je zaprimljena</h3>
                  <p className="text-brand/80 mb-6 font-light leading-relaxed max-w-md mx-auto">
                    Tvoja prijava je uspješno poslana i trenutačno čeka na pregled i odobrenje organizatora radi balansa sudionika.
                  </p>

                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-8 text-left shadow-xs">
                    <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base mb-3 border-b border-amber-200 pb-2.5">
                      <Mail size={18} className="text-amber-700 shrink-0" />
                      <span>Važne napomene o potvrdi prijave</span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-brand/90 leading-relaxed">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-950 text-xs font-bold mt-0.5">1</span>
                        <p>
                          <strong>Obavijest putem e-maila kroz 24 sata:</strong> Organizator će pregledati tvoju prijavu te ćeš potvrdu primiti na e-mail u roku od <strong>24 sata</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-950 text-xs font-bold mt-0.5">2</span>
                        <p>
                          <strong>Provjeri neželjenu poštu (Spam / Promocije):</strong> Ako ne vidiš e-mail, <strong>obavezno provjeri Spam mapu</strong> i označi poruku da nije neželjena pošta.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-950 text-xs font-bold mt-0.5">3</span>
                        <p>
                          <strong>Provjera statusa:</strong> Status svoje prijave možeš u svakom trenutku provjeriti na svom <Link to="/profil" className="text-brand font-bold underline hover:text-brand-light">korisničkom profilu</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {existingRegistration.status === 'waiting_list' && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2 text-brand">Na listi čekanja</h3>
                  <p className="text-brand/80 mb-8 font-light leading-relaxed max-w-md mx-auto">
                    Tvoja prijava se trenutačno nalazi na listi čekanja. Kontaktirat ćemo te putem emaila ako se oslobodi mjesto.
                  </p>
                </>
              )}

              {existingRegistration.status === 'rejected' && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2 text-brand">Prijava odbijena</h3>
                  <p className="text-brand/80 mb-8 font-light leading-relaxed max-w-md mx-auto">
                    Nažalost, nismo u mogućnosti potvrditi tvoju prijavu za ovaj događaj. Hvala ti na iskazanom interesu!
                  </p>
                </>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/profil" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-brand-light transition-all shadow-md text-xs sm:text-sm">
                  <UserRound size={16} /> Pregledaj u profilu
                </Link>
                <Link to="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-brand px-6 py-3 rounded-full font-bold transition-all text-xs sm:text-sm border border-brand/20">
                  <ArrowLeft size={16} /> Povratak na naslovnicu
                </Link>
              </div>
            </div>
          ) : (
            /* Active Form to fill out */
            <>
              {/* Authenticated User Status Bar */}
              <div className="bg-brand/5 rounded-2xl p-4 sm:p-5 border border-brand/10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profil" 
                      referrerPolicy="no-referrer" 
                      className="w-11 h-11 rounded-2xl border border-white shadow-xs object-cover" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand to-brand-light text-white font-serif font-bold text-base flex items-center justify-center shadow-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand text-sm sm:text-base">
                        {user.displayName || "Korisnik"}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        <Check size={10} strokeWidth={3} /> Prijavljen
                      </span>
                    </div>
                    <p className="text-xs text-brand/65 flex items-center gap-1.5 font-light">
                      <Mail size={12} className="text-brand-light" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/profil"
                    className="text-xs font-bold text-brand hover:text-white hover:bg-brand bg-white/90 px-3.5 py-2 rounded-xl border border-brand/15 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <UserRound size={13} />
                    <span>Moj profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-brand/50 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                    title="Odjavi se"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Ime i prezime */}
                <div className="space-y-1.5">
                  <label htmlFor="imePrezime" className="block text-xs font-bold text-brand">
                    Ime i prezime <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="imePrezime"
                    name="imePrezime"
                    required
                    value={formData.imePrezime}
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all placeholder:text-brand/35 text-brand shadow-xs"
                    placeholder="Unesite svoje ime i prezime"
                  />
                </div>

                {/* Spol */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand">
                    Spol <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, spol: 'M' }))}
                      className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.spol === 'M'
                          ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 ring-2 ring-brand/30'
                          : 'bg-white/80 hover:bg-white text-brand border-brand/15 hover:border-brand/30 shadow-xs'
                      }`}
                    >
                      <span>Muški (M)</span>
                      {formData.spol === 'M' && <Check size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, spol: 'Ž' }))}
                      className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.spol === 'Ž'
                          ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 ring-2 ring-brand/30'
                          : 'bg-white/80 hover:bg-white text-brand border-brand/15 hover:border-brand/30 shadow-xs'
                      }`}
                    >
                      <span>Ženski (Ž)</span>
                      {formData.spol === 'Ž' && <Check size={16} />}
                    </button>
                  </div>
                </div>

                {/* Email (Google account read-only) */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-brand">
                    E-mail adresa <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      readOnly
                      value={formData.email}
                      className="w-full px-4 py-3 rounded-2xl bg-brand/5 border border-brand/10 text-brand/80 cursor-not-allowed outline-none text-sm font-medium shadow-xs"
                    />
                  </div>
                  <p className="text-[11px] text-brand/60 font-light">
                    E-mail je automatski preuzet s vašeg Google računa radi sigurnosti.
                  </p>
                </div>

                {/* Godine */}
                <div className="space-y-1.5">
                  <label htmlFor="godine" className="block text-xs font-bold text-brand">
                    Koliko imaš godina? <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="godine"
                    name="godine"
                    min="18"
                    max="99"
                    required
                    value={formData.godine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all placeholder:text-brand/35 text-brand shadow-xs"
                    placeholder="Npr. 28"
                  />
                </div>

                {/* Napomena */}
                <div className="space-y-1.5">
                  <label htmlFor="napomena" className="block text-xs font-bold text-brand">
                    Napomena (opcionalno)
                  </label>
                  <textarea
                    id="napomena"
                    name="napomena"
                    rows={3}
                    value={formData.napomena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all placeholder:text-brand/35 text-brand shadow-xs resize-none"
                    placeholder="Imaš li neku napomenu, prehrambeno ograničenje ili pitanje za nas?"
                  />
                </div>

                {/* Custom Fields if configured */}
                {activeEvent.customFields && activeEvent.customFields.length > 0 && (
                  <div className="pt-4 border-t border-brand/10 space-y-5">
                    <h3 className="font-serif font-bold text-lg text-brand">Dodatna pitanja</h3>
                    {activeEvent.customFields.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <label htmlFor={field.id} className="block text-xs font-bold text-brand">
                          {field.label} {field.required && <span className="text-rose-600">*</span>}
                        </label>

                        {field.type === 'text' && (
                          <input
                            type="text"
                            id={field.id}
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) => handleCustomChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all text-brand shadow-xs"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            id={field.id}
                            rows={3}
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) => handleCustomChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all text-brand shadow-xs resize-none"
                          />
                        )}

                        {field.type === 'select' && (
                          <div className="space-y-2 pt-1">
                            {field.options?.map((option, idx) => (
                              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={option}
                                  required={field.required}
                                  checked={customAnswers[field.id] === option}
                                  onChange={(e) => handleCustomChange(field.id, e.target.value)}
                                  className="w-4 h-4 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
                                />
                                <span className="text-sm text-brand/85 group-hover:text-brand transition-colors">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'multiselect' && (
                          <div className="space-y-2 pt-1">
                            {field.options?.map((option, idx) => {
                              const currentValues: string[] = customAnswers[field.id] || [];
                              return (
                                <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    name={`${field.id}_${idx}`}
                                    value={option}
                                    checked={currentValues.includes(option)}
                                    onChange={(e) => {
                                      let newValues = [...currentValues];
                                      if (e.target.checked) {
                                        newValues.push(option);
                                      } else {
                                        newValues = newValues.filter(v => v !== option);
                                      }
                                      handleCustomChange(field.id, newValues);
                                    }}
                                    className="w-4 h-4 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer rounded"
                                  />
                                  <span className="text-sm text-brand/85 group-hover:text-brand transition-colors">{option}</span>
                                </label>
                              );
                            })}
                            {field.required && (customAnswers[field.id]?.length || 0) === 0 && (
                              <input type="checkbox" required className="opacity-0 absolute w-0 h-0" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Consent & Privacy Checkboxes */}
                <div className="pt-5 border-t border-brand/10 space-y-4">
                  
                  {/* Checkbox 1: Pravila privatnosti */}
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      id="acceptedPrivacy"
                      name="acceptedPrivacy"
                      required
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-brand bg-white/80 border-brand/30 focus:ring-brand accent-brand cursor-pointer rounded shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-brand/85 leading-snug group-hover:text-brand transition-colors">
                      Pročitao/la sam i prihvaćam{' '}
                      <Link
                        to="/pravila-privatnosti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-brand hover:text-brand-light transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pravila privatnosti
                      </Link>{' '}
                      i{' '}
                      <Link
                        to="/uvjeti-koristenja"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-brand hover:text-brand-light transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Uvjete korištenja
                      </Link>{' '}
                      <span className="text-rose-600">*</span>
                    </span>
                  </label>

                  {/* Checkbox 2: Suglasnost za snimanje */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        id="acceptedMediaConsent"
                        name="acceptedMediaConsent"
                        required
                        checked={acceptedMediaConsent}
                        onChange={(e) => setAcceptedMediaConsent(e.target.checked)}
                        className="mt-0.5 w-5 h-5 text-brand bg-white/80 border-brand/30 focus:ring-brand accent-brand cursor-pointer rounded shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-brand/85 leading-snug group-hover:text-brand transition-colors">
                        Suglasan/na sam sa snimanjem i fotografiranjem na susretu <span className="text-rose-600">*</span>
                      </span>
                    </label>

                    <div className="pl-8 mt-1">
                      <button
                        type="button"
                        onClick={() => setShowMediaDetails(!showMediaDetails)}
                        className="text-[11px] sm:text-xs text-brand/70 hover:text-brand font-medium underline inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{showMediaDetails ? 'Sakrij detalje suglasnosti' : 'Pročitaj detalje suglasnosti'}</span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${showMediaDetails ? 'rotate-180' : ''}`} />
                      </button>

                      {showMediaDetails && (
                        <div className="text-[11px] sm:text-xs text-brand/80 leading-relaxed bg-brand/5 p-4 rounded-2xl border border-brand/10 mt-2.5 max-h-48 overflow-y-auto">
                          <p className="mb-2">
                            Dolaskom na susret „Na prvi pogled” dajem suglasnost za sudjelovanje u snimanju te za prikazivanje snimki, fotografija i drugih materijala na društvenoj mreži Instagram na profilu „Na prvi pogled”. Organizator će u svrhu promocije objaviti kratke audiovizualne isječke na društvenim mrežama (story i reel videozapise). Potvrđujem da su sve snimke i fotografije izrađene uz moje znanje od strane organizatora „Na prvi pogled” te ovime dajem svoju suglasnost za njihovo objavljivanje u promotivne svrhe.
                          </p>
                          <p>
                            Suglasan/na sam da autorska prava na promotivnim materijalima pripadaju organizatoru „Na prvi pogled”.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || isEventFull}
                    className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-brand/20 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Slanje prijave...</span>
                      </>
                    ) : isEventFull ? (
                      <span>Mjesta su popunjena</span>
                    ) : (
                      <>
                        <span>Prijavi se</span>
                        <Heart size={18} className="fill-white" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-brand/60 mt-3 font-light">
                    Pritiskom na gumb potvrđuješ prijavu. Tvoji podaci čuvaju se strogo povjerljivo i koriste se isključivo za potrebe organizacije susreta.
                  </p>
                </div>

              </form>
            </>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
