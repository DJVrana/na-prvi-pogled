import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db, auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Heart, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Loader2, 
  UserRound, 
  Flame, 
  MessageCircleHeart,
  Phone,
  Mail,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { FaGoogle, FaInstagram } from 'react-icons/fa';

interface UserRegistration {
  id: string;
  eventId: string;
  imePrezime: string;
  spol: string;
  godine: number;
  email: string;
  napomena?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt?: any;
  eventDetails?: {
    title: string;
    dateStr: string;
    timeStr: string;
    location: string;
    price: string;
    ageGroup: string;
    isMatchingActive?: boolean;
    isActive?: boolean;
  };
}

interface UserMatch {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  partnerName: string;
  partnerContact: string;
  partnerInstagram?: string;
  partnerPhone?: string;
  partnerEmail: string;
  partnerGender: string;
  createdAt: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'registrations' | 'matches'>('registrations');

  // User Profile contact info
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [contactSavedSuccess, setContactSavedSuccess] = useState(false);

  // Registrations & Matches
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cancel registration modal
  const [cancellingRegistration, setCancellingRegistration] = useState<UserRegistration | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Fetch saved user profile data if exists
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.instagram) setInstagram(data.instagram);
            if (data.phone) setPhone(data.phone);
          }
        } catch (err) {
          console.error("Greška pri dohvaćanju profila korisnika:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch registrations & matches
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      try {
        // Fetch all registrations by uid or email
        const qPrijave = query(collection(db, 'prijave'), where('uid', '==', user.uid));
        const prijaveSnap = await getDocs(qPrijave);

        const loadedRegistrations: UserRegistration[] = [];

        // Cache events to avoid fetching identical events multiple times
        const eventsCache: Record<string, any> = {};

        for (const docSnap of prijaveSnap.docs) {
          const regData = { id: docSnap.id, ...docSnap.data() } as UserRegistration;

          if (regData.eventId) {
            if (!eventsCache[regData.eventId]) {
              try {
                const eventDoc = await getDoc(doc(db, 'events', regData.eventId));
                if (eventDoc.exists()) {
                  eventsCache[regData.eventId] = eventDoc.data();
                }
              } catch (e) {
                console.error("Greška pri dohvaćanju eventa:", e);
              }
            }

            const evt = eventsCache[regData.eventId];
            if (evt) {
              regData.eventDetails = {
                title: evt.title || 'Speed Dating Event',
                dateStr: evt.dateStr || '',
                timeStr: evt.timeStr || '',
                location: evt.location || '',
                price: evt.price || '',
                ageGroup: evt.ageGroup || '',
                isMatchingActive: !!evt.isMatchingActive,
                isActive: !!evt.isActive
              };
            }
          }

          loadedRegistrations.push(regData);
        }

        // Sort registrations by creation time desc
        loadedRegistrations.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setRegistrations(loadedRegistrations);

        // Fetch matches where user is either maleUid or femaleUid
        const matchesList: UserMatch[] = [];

        const qMatchesMale = query(collection(db, 'event_matches'), where('maleUid', '==', user.uid));
        const maleSnap = await getDocs(qMatchesMale);
        maleSnap.forEach(snap => {
          const data = snap.data();
          matchesList.push({
            id: snap.id,
            eventId: data.eventId,
            eventTitle: data.eventTitle || 'Speed Dating Susret',
            eventDate: data.eventDate || '',
            partnerName: data.femaleName || 'Partnerica',
            partnerContact: data.femaleContact || '',
            partnerInstagram: data.femaleInstagram || '',
            partnerPhone: data.femalePhone || '',
            partnerEmail: data.femaleEmail || '',
            partnerGender: 'Ž',
            createdAt: data.createdAt
          });
        });

        const qMatchesFemale = query(collection(db, 'event_matches'), where('femaleUid', '==', user.uid));
        const femaleSnap = await getDocs(qMatchesFemale);
        femaleSnap.forEach(snap => {
          const data = snap.data();
          matchesList.push({
            id: snap.id,
            eventId: data.eventId,
            eventTitle: data.eventTitle || 'Speed Dating Susret',
            eventDate: data.eventDate || '',
            partnerName: data.maleName || 'Partner',
            partnerContact: data.maleContact || '',
            partnerInstagram: data.maleInstagram || '',
            partnerPhone: data.malePhone || '',
            partnerEmail: data.maleEmail || '',
            partnerGender: 'M',
            createdAt: data.createdAt
          });
        });

        // Sort matches desc
        matchesList.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setMatches(matchesList);

      } catch (err) {
        console.error("Greška pri učitavanju podataka profila:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle Save Contact Details
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingContact(true);
    setContactSavedSuccess(false);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        instagram: instagram.trim(),
        phone: phone.trim(),
        updatedAt: new Date()
      }, { merge: true });

      setContactSavedSuccess(true);
      setTimeout(() => setContactSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Greška pri spremanju kontakata:", err);
    } finally {
      setSavingContact(false);
    }
  };

  // Handle Cancel Registration Confirmation
  const handleConfirmCancelRegistration = async () => {
    if (!cancellingRegistration || !user) return;

    setCancelLoading(true);
    try {
      // 1. Update status to 'cancelled'
      await updateDoc(doc(db, 'prijave', cancellingRegistration.id), {
        status: 'cancelled',
        cancelledAt: new Date()
      });

      // 2. Decrement event registrationCount if the registration was previously active
      if (cancellingRegistration.eventId && cancellingRegistration.status !== 'rejected') {
        try {
          await updateDoc(doc(db, 'events', cancellingRegistration.eventId), {
            registrationCount: increment(-1)
          });
        } catch (evtErr) {
          console.error("Greška pri dekrementiranju broja prijava:", evtErr);
        }
      }

      // 3. Update local state
      setRegistrations(prev => prev.map(reg => {
        if (reg.id === cancellingRegistration.id) {
          return { ...reg, status: 'cancelled' };
        }
        return reg;
      }));

      setCancelSuccessMsg(`Uspješno ste otkazali prijavu za "${cancellingRegistration.eventDetails?.title || 'događaj'}".`);
      setTimeout(() => setCancelSuccessMsg(''), 4000);
      setCancellingRegistration(null);
    } catch (err) {
      console.error("Greška pri otkazivanju prijave:", err);
      alert("Došlo je do greške prilikom otkazivanja prijave. Molimo pokušajte ponovno.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Login handler
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Greška pri prijavi:", err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Greška pri odjavi:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60" />
      </div>
    );
  }

  // If user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl animate-ambient-drift pointer-events-none" />
        <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-6 shadow-inner">
            <UserRound size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3 text-brand">Korisnički Profil</h1>
          <p className="text-brand/80 mb-8 font-light text-sm leading-relaxed">
            Prijavi se sa svojim Google računom kako bi pregledao svoje prijave, upravljao događajima i vidio svoje ostvarene matcheve!
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] border border-gray-200 flex justify-center items-center gap-3 cursor-pointer mb-4"
          >
            <FaGoogle size={18} className="text-blue-600" />
            Prijavi se s Googleom
          </button>

          <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand transition-colors text-xs font-medium">
            <ArrowLeft size={14} /> Povratak na naslovnicu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 md:px-12 flex flex-col items-center bg-peach text-brand relative overflow-x-hidden selection:bg-brand selection:text-white">
      
      {/* Decorative ambient background */}
      <div className="absolute top-10 left-[-5%] w-96 h-96 rounded-full bg-rose-300/20 blur-[100px] animate-ambient-drift pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-96 h-96 rounded-full bg-brand/10 blur-[100px] animate-ambient-drift pointer-events-none" />

      {/* Floating Watermark Icons */}
      <div className="absolute top-24 right-6 text-brand-light/10 rotate-[20deg] pointer-events-none hidden lg:block">
        <Heart size={160} strokeWidth={1} />
      </div>

      <div className="max-w-4xl w-full z-10">

        {/* Top bar navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Natrag na početnu
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white/60 hover:bg-red-50 text-brand/70 hover:text-red-600 px-4 py-2 rounded-full border border-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <LogOut size={14} /> Odjavi se
          </button>
        </div>

        {/* Success Alert Banner */}
        {cancelSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <span className="font-medium">{cancelSuccessMsg}</span>
          </div>
        )}

        {/* User Profile Overview Card */}
        <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand/5 border border-white mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-brand/10">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Korisnik"} 
                  referrerPolicy="no-referrer" 
                  className="w-20 h-20 rounded-full border-2 border-brand/20 shadow-md object-cover" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand/10 text-brand text-2xl font-bold flex items-center justify-center border-2 border-brand/20 shadow-inner">
                  {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand">
                    {user.displayName || "Korisnik"}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldCheck size={12} /> Verificiran
                  </span>
                </div>
                <p className="text-brand/70 text-sm flex items-center justify-center sm:justify-start gap-1.5 font-light">
                  <Mail size={14} className="text-brand-light" /> {user.email}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="bg-white/80 border border-white px-4 py-2 rounded-2xl text-center shadow-xs">
                <span className="block text-xl font-serif font-bold text-brand">{registrations.length}</span>
                <span className="text-[10px] uppercase font-bold text-brand/60">Prijave</span>
              </div>
              <div className="bg-white/80 border border-white px-4 py-2 rounded-2xl text-center shadow-xs">
                <span className="block text-xl font-serif font-bold text-rose-600">{matches.length}</span>
                <span className="text-[10px] uppercase font-bold text-brand/60">Matchevi</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Settings */}
          <div className="mt-6 pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand/70 flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-light" /> Kontakt podaci za Speed Dating Match
              </span>
              {contactSavedSuccess && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <Check size={14} /> Spremljeno!
                </span>
              )}
            </div>
            <p className="text-xs text-brand/60 mb-4 font-light">
              Ove kontakt podatke dijelimo isključivo s osobama s kojima ostvariš obostrani match nakon završenog događaja.
            </p>

            <form onSubmit={handleSaveContact} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[11px] font-bold text-brand/80 mb-1 flex items-center gap-1">
                  <FaInstagram size={12} className="text-pink-600" /> Instagram korisničko ime
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-brand/50 text-sm font-medium">@</span>
                  <input
                    type="text"
                    value={instagram.startsWith('@') ? instagram.slice(1) : instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="tvoje_korisnicko_ime"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/80 border border-brand/15 focus:border-brand focus:ring-1 focus:ring-brand text-sm outline-none transition-all placeholder:text-brand/30"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[11px] font-bold text-brand/80 mb-1 flex items-center gap-1">
                  <Phone size={12} className="text-brand-light" /> Broj mobitela (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Npr. 091 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-brand/15 focus:border-brand focus:ring-1 focus:ring-brand text-sm outline-none transition-all placeholder:text-brand/30"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingContact}
                  className="bg-brand hover:bg-brand-light text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {savingContact ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Spremi kontakt podatke
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-brand/15 pb-2">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center gap-2 pb-2 px-3 font-serif text-lg font-bold transition-all relative cursor-pointer ${
              activeTab === 'registrations' 
                ? 'text-brand' 
                : 'text-brand/50 hover:text-brand/80'
            }`}
          >
            <Calendar size={18} />
            Moje Prijave
            <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-sans font-bold">
              {registrations.length}
            </span>
            {activeTab === 'registrations' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full animate-fade-in" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 pb-2 px-3 font-serif text-lg font-bold transition-all relative cursor-pointer ${
              activeTab === 'matches' 
                ? 'text-brand' 
                : 'text-brand/50 hover:text-brand/80'
            }`}
          >
            <MessageCircleHeart size={18} className="text-rose-600" />
            Moji Matchevi
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-sans font-bold">
              {matches.length}
            </span>
            {activeTab === 'matches' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-12 text-center text-brand/60 flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin mb-3 text-brand/50" />
                <p className="text-sm">Učitavanje tvojih prijava...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-10 text-center border border-white shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand mb-2">Nemaš aktivnih prijava</h3>
                <p className="text-brand/70 text-sm font-light max-w-md mx-auto mb-6">
                  Trenutno nisi prijavljen/a ni na jedan nadolazeći speed dating susret. Provjeri dostupne termine i rezerviraj svoje mjesto!
                </p>
                <Link
                  to="/prijava"
                  className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-full text-sm shadow-lg hover:bg-brand-light transition-all transform hover:scale-105"
                >
                  <Sparkles size={16} /> Pregledaj dostupne termine
                </Link>
              </div>
            ) : (
              registrations.map(reg => {
                const status = reg.status || 'pending';
                const eventInfo = reg.eventDetails;
                const isMatchingActive = eventInfo?.isMatchingActive;

                return (
                  <div 
                    key={reg.id} 
                    className="bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white shadow-md shadow-brand/5 transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-brand">
                            {eventInfo?.title || 'Speed Dating Događaj'}
                          </h3>
                          
                          {/* Status Badges */}
                          {status === 'accepted' && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              <CheckCircle2 size={13} /> Prijava potvrđena
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Clock3 size={13} /> Na čekanju pregleda
                            </span>
                          )}
                          {status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              <XCircle size={13} /> Odbijeno
                            </span>
                          )}
                          {status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              <XCircle size={13} /> Otkazana prijava
                            </span>
                          )}
                        </div>

                        {/* Event Details */}
                        {eventInfo && (
                          <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-brand/70 font-light">
                            {eventInfo.dateStr && (
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-brand-light" /> {eventInfo.dateStr} u {eventInfo.timeStr}
                              </span>
                            )}
                            {eventInfo.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-brand-light" /> {eventInfo.location}
                              </span>
                            )}
                            {eventInfo.ageGroup && (
                              <span className="flex items-center gap-1">
                                Dob: <strong>{eventInfo.ageGroup}</strong>
                              </span>
                            )}
                            {eventInfo.price && (
                              <span className="flex items-center gap-1">
                                Kotizacija: <strong>{eventInfo.price}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                        {/* Matching Button if enabled and user was accepted */}
                        {isMatchingActive && status === 'accepted' && (
                          <Link
                            to={`/matching?eventId=${reg.eventId}`}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-brand text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:shadow-rose-500/20 hover:scale-[1.03] transition-all"
                          >
                            <Flame size={15} className="animate-pulse" />
                            Speed Dating Matching
                          </Link>
                        )}

                        {/* Cancel Registration Button (only for active registrations) */}
                        {(status === 'pending' || status === 'accepted') && (
                          <button
                            type="button"
                            onClick={() => setCancellingRegistration(reg)}
                            className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <XCircle size={14} /> Odjavi se s događaja
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MATCHES */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-12 text-center text-brand/60 flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin mb-3 text-brand/50" />
                <p className="text-sm">Učitavanje tvojih matcheva...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center border border-white shadow-sm">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 animate-float-slow">
                  <Heart size={32} className="fill-rose-500/20" />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand mb-2">Još nema zabilježenih matcheva</h3>
                <p className="text-brand/70 text-sm font-light max-w-md mx-auto leading-relaxed mb-6">
                  Nakon završenog speed dating eventa organizator pokreće Matching. Kada ti i druga osoba označite da se jedno drugom sviđate, vaš kontakt pojavit će se ovdje!
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-2.5 rounded-full text-xs shadow-md hover:bg-brand-light transition-all"
                >
                  <ArrowLeft size={14} /> Povratak na naslovnicu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(m => {
                  const cleanIg = m.partnerContact?.startsWith('@') ? m.partnerContact.slice(1) : m.partnerContact;
                  const isInstagram = m.partnerContact?.includes('@') || (!m.partnerContact?.includes('+') && isNaN(Number(cleanIg)));

                  return (
                    <div 
                      key={m.id}
                      className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg shadow-brand/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {m.partnerName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-serif font-bold text-lg text-brand">{m.partnerName}</h4>
                              <Heart size={14} className="text-rose-500 fill-rose-500" />
                            </div>
                            <p className="text-[11px] text-brand/60 font-medium">
                              {m.eventTitle} {m.eventDate ? `• ${m.eventDate}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Match 💞
                        </span>
                      </div>

                      {/* Contact Channels */}
                      <div className="space-y-2 pt-3 border-t border-brand/10">
                        {m.partnerInstagram && (
                          <div className="flex items-center justify-between bg-peach/50 p-2.5 rounded-xl text-xs">
                            <span className="font-medium text-brand/70 flex items-center gap-1.5">
                              <FaInstagram size={14} className="text-pink-600 flex-shrink-0" />
                              <span>{m.partnerInstagram}</span>
                            </span>
                            <a 
                              href={`https://instagram.com/${m.partnerInstagram.replace('@', '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-brand font-bold hover:text-brand-light flex items-center gap-1 text-[11px] hover:underline flex-shrink-0"
                            >
                              Otvori IG <ExternalLink size={12} />
                            </a>
                          </div>
                        )}

                        {m.partnerPhone && (
                          <div className="flex items-center justify-between bg-peach/50 p-2.5 rounded-xl text-xs">
                            <span className="font-medium text-brand/70 flex items-center gap-1.5">
                              <Phone size={14} className="text-green-600 flex-shrink-0" />
                              <span>{m.partnerPhone}</span>
                            </span>
                            <a 
                              href={`tel:${m.partnerPhone}`}
                              className="text-brand font-bold hover:text-brand-light flex items-center gap-1 text-[11px] hover:underline flex-shrink-0"
                            >
                              Nazovi <Phone size={12} />
                            </a>
                          </div>
                        )}

                        {!m.partnerInstagram && !m.partnerPhone && m.partnerContact && (
                          <div className="flex items-center justify-between bg-peach/50 p-2.5 rounded-xl text-xs">
                            <span className="font-medium text-brand/70 flex items-center gap-1.5">
                              {isInstagram ? <FaInstagram size={14} className="text-pink-600" /> : <Phone size={14} className="text-green-600" />}
                              <span>{m.partnerContact}</span>
                            </span>
                            {isInstagram ? (
                              <a 
                                href={`https://instagram.com/${cleanIg}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-brand font-bold hover:text-brand-light flex items-center gap-1 text-[11px] hover:underline"
                              >
                                Otvori IG <ExternalLink size={12} />
                              </a>
                            ) : (
                              <a 
                                href={`tel:${m.partnerContact}`}
                                className="text-brand font-bold hover:text-brand-light flex items-center gap-1 text-[11px] hover:underline"
                              >
                                Nazovi <Phone size={12} />
                              </a>
                            )}
                          </div>
                        )}

                        {m.partnerEmail && (
                          <div className="flex items-center justify-between bg-peach/50 p-2.5 rounded-xl text-xs">
                            <span className="font-medium text-brand/70 flex items-center gap-1.5 truncate pr-2">
                              <Mail size={14} className="text-brand-light flex-shrink-0" />
                              <span className="truncate">{m.partnerEmail}</span>
                            </span>
                            <a 
                              href={`mailto:${m.partnerEmail}`}
                              className="text-brand font-bold hover:text-brand-light flex items-center gap-1 text-[11px] hover:underline flex-shrink-0"
                            >
                              Pošalji mail <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CANCEL REGISTRATION CONFIRMATION MODAL */}
      {cancellingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            
            <h3 className="text-xl font-serif font-bold text-center text-gray-900 mb-2">
              Potvrda odjave s događaja
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Jeste li sigurni da želite otkazati prijavu za događaj{' '}
              <strong>"{cancellingRegistration.eventDetails?.title || 'Speed Dating'}"</strong>? 
              Vaše mjesto bit će oslobođeno za druge zainteresirane sudionike.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCancellingRegistration(null)}
                disabled={cancelLoading}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelRegistration}
                disabled={cancelLoading}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {cancelLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {cancelLoading ? 'Otkazivanje...' : 'Da, odjavi me'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
