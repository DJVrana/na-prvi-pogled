import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ArrowLeft, CheckCircle2, Heart, LogOut, Loader2 } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router';

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
          email: currentUser.email || '',
          imePrezime: currentUser.displayName || prev.imePrezime
        }));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const q = query(collection(db, 'events'), where('isActive', '==', true), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          const data = docData.data();
          let isFull = false;

          if (data.maxRegistrations && Number(data.maxRegistrations) > 0) {
            const prijaveQ = query(collection(db, 'prijave'), where('eventId', '==', docData.id));
            const prijaveSnap = await getDocs(prijaveQ);
            const validCount = prijaveSnap.docs.filter(doc => doc.data().status !== 'rejected').length;
            if (validCount >= Number(data.maxRegistrations)) {
              isFull = true;
            }
          }

          if (isFull) {
            setIsEventFull(true);
            setActiveEvent(null);
          } else {
            setActiveEvent({ 
              id: docData.id, 
              title: data.title,
              customFields: data.customFields || [],
              maxRegistrations: data.maxRegistrations,
              introText: data.introText || '',
              noteText: data.noteText || '',
              closingText: data.closingText || '',
              timeNote: data.timeNote || '',
              dateStr: data.dateStr || '',
              timeStr: data.timeStr || '',
              location: data.location || '',
              ageGroup: data.ageGroup || '',
              price: data.price || ''
            });
          }
        } else {
          setActiveEvent(null);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju događaja:", err);
      } finally {
        setEventLoading(false);
      }
    };
    fetchActiveEvent();
  }, []);

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
        const prijaveQ = query(collection(db, 'prijave'), where('eventId', '==', activeEvent.id));
        const prijaveSnap = await getDocs(prijaveQ);
        const validCount = prijaveSnap.docs.filter(doc => doc.data().status !== 'rejected').length;
        if (validCount >= Number(activeEvent.maxRegistrations)) {
          setError("Nažalost, u međuvremenu su se popunila sva mjesta.");
          setLoading(false);
          setIsEventFull(true);
          setActiveEvent(null);
          return;
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans">
        <div className="bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white">
          <h2 className="text-2xl font-serif font-bold mb-4">{isEventFull ? "Prijave su popunjene" : "Prijave su zatvorene"}</h2>
          <p className="text-brand/80 mb-8 font-light">
            {isEventFull ? "Nažalost, sva mjesta za ovaj događaj su popunjena." : "Trenutno nema aktivnih događaja za koje se moguće prijaviti."}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors">
            <ArrowLeft size={18} /> Povratak na naslovnicu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 sm:px-12 flex justify-center bg-peach text-brand relative overflow-x-hidden">
      
      {/* Decorative */}
      <div className="absolute top-20 right-[-20px] text-brand-light/10 rotate-[25deg] pointer-events-none">
        <Heart size={200} strokeWidth={1} />
      </div>

      <div className="max-w-xl w-full z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand mb-8 transition-colors font-medium">
          <ArrowLeft size={18} /> Natrag
        </Link>
        
        <div className="bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-white/50">
          <div className="text-center mb-6">
            <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              {activeEvent.title}
            </span>
            {!existingRegistration && (
              <>
                <h1 className="text-4xl font-serif font-bold mb-3 uppercase tracking-tight mt-2">Prijava</h1>
                <p className="text-brand/80 font-light">
                  {!user ? "Prijava je zaštićena. Molimo potvrdite svoj identitet kako bi pristupili formi." : "Ispuni podatke ispod. Sva polja s "}
                  {user && <span className="text-red-500">*</span>}
                  {user && " su obavezna."}
                </p>
              </>
            )}
          </div>

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

                <Link to="/" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors">
                  <ArrowLeft size={18} /> Povratak na naslovnicu
                </Link>
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
                <button 
                  onClick={handleLogout}
                  className="p-2 text-brand/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Odjavi se"
                >
                  <LogOut size={18} />
                </button>
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
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2"
                >
                  {loading ? 'Slanje...' : 'Prijavi se'} 
                  {!loading && <Heart size={18} className="fill-white" />}
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
