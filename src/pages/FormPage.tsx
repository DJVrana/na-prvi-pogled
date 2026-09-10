import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ArrowLeft, CheckCircle2, Heart, LogOut, Loader2, Sparkles, Calendar, Users, UserRound } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router';
import emailjs from '@emailjs/browser';

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
      setError("Morate biti prijavljeni da biste se prijavili.");
      return;
    }
    if (!activeEvent) {
      setError("Prijave su trenutno zatvorene.");
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
        eventId: activeEvent.id, // Link to the active event
        customAnswers: customAnswersArray,
        status: 'pending', // Postavljamo početni status
        createdAt: serverTimestamp()
      });

      // Increment the event registration count safely
      await updateDoc(doc(db, 'events', activeEvent.id), {
        registrationCount: increment(1)
      });

      try {
        const adminHtmlMessage = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #E85D75; text-align: center; text-transform: uppercase; margin-bottom: 5px;">Na prvi pogled</h2>
            <p style="text-align: center; color: #888; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Nova prijava</p>
            <p>Zaprimljena je nova prijava za događaj <strong>${activeEvent.title}</strong>.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #E85D75; padding: 15px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Ime i prezime:</strong> ${formData.imePrezime}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${formData.email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Spol:</strong> ${formData.spol}</p>
              <p style="margin: 0 0 10px 0;"><strong>Godine:</strong> ${formData.godine}</p>
              <p style="margin: 0 0 10px 0;"><strong>Napomena:</strong> ${formData.napomena}</p>
            </div>
            <p>Detalje i odgovore na dodatna pitanja možete provjeriti u Admin panelu.</p>
          </div>
        `;

        await emailjs.send(
          'default_service',
          'template_uuvkcp3',
          {
            name: "Admin",
            email: "naprvipogled.events@gmail.com",
            subject: "Pristigla je nova prijava za događaj! 📢",
            html_message: adminHtmlMessage
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error("Greška pri slanju obavijesti adminu: ", emailErr);
      }

      // Postavljamo u state kako bi korisnik odmah vidio ekran "Na čekanju"
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
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={32} className="animate-spin text-brand/50" />
      </div>
    );
  }

  // Ovdje više ne koristimo success blok jer existingRegistration upravlja ekranom


  // If someone enters the URL directly when there is no active event
  if (!activeEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl animate-ambient-drift pointer-events-none" />
        <div className="bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white relative z-10">
          <h2 className="text-2xl font-serif font-bold mb-4">Prijave su trenutno zatvorene</h2>
          <p className="text-brand/80 mb-8 font-light leading-relaxed">
            Trenutno nema aktivnih događaja za koje se moguće prijaviti. Pratite naš Instagram za najave novih susreta!
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors">
            <ArrowLeft size={18} /> Povratak na naslovnicu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 md:px-12 flex justify-center bg-peach text-brand relative overflow-x-hidden">

      {/* Decorative ambient blobs */}
      <div className="absolute top-10 left-[-5%] w-80 h-80 rounded-full bg-rose-300/20 blur-[90px] animate-ambient-drift pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-96 h-96 rounded-full bg-brand/10 blur-[100px] animate-ambient-drift pointer-events-none" />

      {/* Decorative floating icons */}
      <div className="absolute top-20 right-[-20px] text-brand-light/10 rotate-[25deg] pointer-events-none animate-float-slow hidden sm:block">
        <Heart size={200} strokeWidth={1} />
      </div>

      <div className="max-w-xl w-full z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand mb-6 transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Natrag na početnu
        </Link>

        <div className="bg-white/50 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl shadow-brand/10 border border-white/80 animate-fade-in-up">
          
          {/* Active Events Switcher in FormPage */}
          {activeEvents.length > 1 && (
            <div className="mb-6 p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand/70 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand-light" /> Odaberi termin za prijavu:
                </span>
                <span className="text-[11px] font-semibold text-brand/50">
                  {activeEvents.length} termina
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                        isCurrent
                          ? 'bg-brand text-white border-brand shadow-md font-semibold'
                          : 'bg-white/70 text-brand hover:bg-white border-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs truncate">{evt.title}</span>
                        {isFull && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Popunjeno
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] flex items-center justify-between ${isCurrent ? 'text-white/80' : 'text-brand/60'}`}>
                        <span>Dob: {evt.ageGroup}</span>
                        <span>{evt.dateStr}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Header of the event */}
          <div className="text-center mb-6">
            <span className="bg-brand/10 text-brand text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {activeEvent.title}
            </span>
            <div className="flex items-center justify-center gap-4 text-xs text-brand/70 mb-3">
              <span className="flex items-center gap-1"><Calendar size={13} className="text-brand-light" /> {activeEvent.dateStr} u {activeEvent.timeStr}</span>
              <span className="flex items-center gap-1"><Users size={13} className="text-brand-light" /> {activeEvent.ageGroup}</span>
            </div>

            {!existingRegistration && (
              <>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2 uppercase tracking-tight text-brand">Prijava</h1>
                <p className="text-brand/80 font-light text-sm">
                  {!user ? "Prijava je zaštićena. Molimo potvrdite svoj identitet kako bi pristupili formi." : "Ispuni podatke ispod. Sva polja s "}
                  {user && <span className="text-red-500">*</span>}
                  {user && " su obavezna."}
                </p>
              </>
            )}
          </div>

          {/* Event Full Warning banner */}
          {isEventFull && (
            <div className="bg-red-50/90 border border-red-200 text-red-800 p-5 rounded-2xl mb-6 text-center shadow-sm">
              <p className="font-bold text-base mb-1">Popunjena sva mjesta za ovaj događaj</p>
              <p className="text-xs text-red-700/90 mb-3">
                Nažalost, sva mjesta za <strong>{activeEvent.title}</strong> ({activeEvent.dateStr}) su već popunjena.
                {activeEvents.length > 1 ? " Molimo odaberi drugi dostupni termin iznad." : " Prati naš Instagram profil za najave novih termina!"}
              </p>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline">
                <ArrowLeft size={13} /> Povratak na naslovnicu
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {!user ? (
            <div className="flex flex-col items-center py-6">
              <div className="bg-white p-4 rounded-full shadow-md mb-6 text-brand">
                <FaGoogle size={32} />
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] border border-gray-200 flex justify-center items-center gap-3"
              >
                <FaGoogle size={20} className="text-blue-600" />
                Prijavi se s Googleom
              </button>
              <p className="text-center text-xs text-brand/60 mt-6">
                Koristimo Google prijavu isključivo za sprječavanje spama i automatiziranih prijava.
              </p>
            </div>
          ) : checkRegistrationLoading ? (
            <div className="flex justify-center items-center py-12 text-brand/50">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : existingRegistration ? (
            <div className="text-center py-8">
              {(!existingRegistration.status || existingRegistration.status === 'accepted') && (
                <>
                  <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                  <h2 className="text-2xl font-serif font-bold mb-2">Prijava prihvaćena!</h2>
                  <p className="text-brand/80 mb-8 font-light">Tvoja prijava za ovaj događaj je uspješno prihvaćena i osigurano ti je mjesto. Vidimo se!</p>
                </>
              )}
              {existingRegistration.status === 'pending' && (
                <>
                  <Loader2 size={48} className="mx-auto text-yellow-500 mb-4 animate-spin-slow" />
                  <h2 className="text-2xl font-serif font-bold mb-2">Prijava je poslana</h2>
                  <p className="text-brand/80 mb-8 font-light">Tvoja prijava je uspješno zaprimljena i trenutačno čeka na pregled organizatora. Javit ćemo ti se povratno na email!</p>
                </>
              )}
              {existingRegistration.status === 'rejected' && (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <div className="text-red-500 text-2xl font-bold">X</div>
                  </div>
                  <h2 className="text-2xl font-serif font-bold mb-2 text-red-600">Prijava odbijena</h2>
                  <p className="text-brand/80 mb-8 font-light">Nažalost, nismo u mogućnosti potvrditi tvoju prijavu za ovaj događaj. Hvala ti na interesu!</p>
                </>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/profil" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors text-sm">
                  <UserRound size={16} /> Pregledaj u profilu
                </Link>
                <Link to="/" className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-brand px-6 py-3 rounded-full font-medium transition-colors text-sm border border-brand/20">
                  <ArrowLeft size={16} /> Povratak na naslovnicu
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand/10">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-brand/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-semibold">{user.displayName || "Korisnik"}</p>
                    <p className="text-brand/60 text-xs">{user.email}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/profil"
                      className="text-xs font-semibold text-brand hover:text-brand-light bg-white/80 px-3 py-1.5 rounded-full border border-brand/10 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <UserRound size={13} /> Moj profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-brand/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Odjavi se"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label htmlFor="imePrezime" className="block text-sm font-semibold text-brand mb-2">Ime i prezime *</label>
                  <input
                    type="text"
                    id="imePrezime"
                    name="imePrezime"
                    required
                    value={formData.imePrezime}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    placeholder="Unesite ime i prezime"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand mb-3">Spol *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="spol"
                        value="M"
                        required
                        checked={formData.spol === 'M'}
                        onChange={handleChange}
                        className="w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
                      />
                      <span className="group-hover:text-brand-light transition-colors">M</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="spol"
                        value="Ž"
                        required
                        checked={formData.spol === 'Ž'}
                        onChange={handleChange}
                        className="w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
                      />
                      <span className="group-hover:text-brand-light transition-colors">Ž</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand mb-2">E-mail adresa *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    readOnly
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-500 cursor-not-allowed outline-none"
                  />
                  <p className="text-xs text-brand/60 mt-1">E-mail je automatski preuzet s vašeg Google računa.</p>
                </div>

                <div>
                  <label htmlFor="godine" className="block text-sm font-semibold text-brand mb-2">Koliko imaš godina? *</label>
                  <input
                    type="number"
                    id="godine"
                    name="godine"
                    min="18"
                    max="99"
                    required
                    value={formData.godine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    placeholder="Npr. 21"
                  />
                </div>

                <div>
                  <label htmlFor="napomena" className="block text-sm font-semibold text-brand mb-2">Napomena (ako ju imaš)</label>
                  <textarea
                    id="napomena"
                    name="napomena"
                    rows={3}
                    value={formData.napomena}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                    placeholder="Imaš li neku napomenu za nas?"
                  />
                </div>

                {/* Custom Fields */}
                {activeEvent.customFields && activeEvent.customFields.length > 0 && (
                  <div className="pt-4 border-t border-brand/10 space-y-6">
                    <h3 className="font-serif font-bold text-lg text-brand mb-4">Dodatna pitanja</h3>
                    {activeEvent.customFields.map((field) => (
                      <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-semibold text-brand mb-2">
                          {field.label} {field.required && '*'}
                        </label>

                        {field.type === 'text' && (
                          <input
                            type="text"
                            id={field.id}
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) => handleCustomChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            id={field.id}
                            rows={3}
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) => handleCustomChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                          />
                        )}

                        {field.type === 'select' && (
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => (
                              <label key={idx} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={option}
                                  required={field.required}
                                  checked={customAnswers[field.id] === option}
                                  onChange={(e) => handleCustomChange(field.id, e.target.value)}
                                  className="w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
                                />
                                <span className="group-hover:text-brand-light transition-colors">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'multiselect' && (
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => {
                              const currentValues: string[] = customAnswers[field.id] || [];
                              return (
                                <label key={idx} className="flex items-center gap-2 cursor-pointer group">
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
                                    className="w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer rounded"
                                  />
                                  <span className="group-hover:text-brand-light transition-colors">{option}</span>
                                </label>
                              );
                            })}
                            {/* Hidden input to enforce 'required' for multiselect */}
                            {field.required && (customAnswers[field.id]?.length || 0) === 0 && (
                              <input type="checkbox" required className="opacity-0 absolute w-0 h-0" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isEventFull}
                  className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Slanje...' : isEventFull ? 'Mjesta su popunjena' : 'Prijavi se'}
                  {!loading && !isEventFull && <Heart size={18} className="fill-white" />}
                </button>
                <p className="text-center text-xs text-brand/60 mt-4">
                  Pritiskom na gumb potvrđuješ prijavu. Podaci se koriste isključivo u svrhu organizacije eventa.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
