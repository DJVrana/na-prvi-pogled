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
  Check,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { FaGoogle, FaInstagram } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface UserRegistration {
  id: string;
  eventId: string;
  imePrezime: string;
  spol: string;
  godine: number;
  email: string;
  napomena?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'waiting_list';
  createdAt?: any;
  eventDetails?: {
    title: string;
    dateStr: string;
    timeStr: string;
    location: string;
    price: string;
    ageGroup: string;
    isMatchingActive?: boolean;
    matchingPhase?: 'live' | 'post_event' | 'closed';
    isActive?: boolean;
    coreEventUrl?: string;
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
                matchingPhase: evt.matchingPhase,
                isActive: !!evt.isActive,
                coreEventUrl: evt.coreEventUrl || ''
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
      if (cancellingRegistration.eventId && cancellingRegistration.status !== 'rejected' && cancellingRegistration.status !== 'cancelled' && cancellingRegistration.status !== 'waiting_list') {
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
      <div className="min-h-screen bg-peach text-brand flex flex-col items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60 mb-3" />
        <p className="text-xs font-semibold text-brand/60 uppercase tracking-wider">Učitavanje profila...</p>
      </div>
    );
  }

  // If user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-peach flex flex-col selection:bg-brand selection:text-white">
        <SEO 
          title="Prijava na profil | Na prvi pogled 💞 Speed Dating Zagreb"
          description="Prijavi se sa svojim Google računom na korisnički profil kako bi pregledao/la svoje prijave i ostvarene matcheve."
        />
        <Navbar />

        <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full flex items-center justify-center">
          <div className="bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-brand/10 border border-white/90 text-center w-full animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-6 shadow-inner">
              <UserRound size={32} className="text-brand-light" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-3 text-brand">Korisnički profil</h1>
            <p className="text-brand/80 mb-8 font-light text-sm sm:text-base leading-relaxed">
              Prijavi se sa svojim Google računom kako bi pregledao/la svoje prijave, statuse događaja i ostvarene matcheve!
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] border border-gray-200 flex justify-center items-center gap-3 cursor-pointer mb-5"
            >
              <FaGoogle size={18} className="text-blue-600" />
              <span>Prijavi se s Googleom</span>
            </button>

            <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand transition-colors text-xs font-semibold">
              <ArrowLeft size={14} /> Povratak na naslovnicu
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
        title="Korisnički Profil | Na prvi pogled 💞 Speed Dating Zagreb"
        description="Pregledaj svoje prijave za speed dating susrete u Zagrebu, uredi kontakt podatke za razmjenu simpatija i provjeri ostvarene matcheve."
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Header Hero Banner */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} className="text-brand-light" />
              <span>Korisnički račun</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand tracking-tight">
              Tvoj profil i prijave
            </h1>
            <p className="text-brand/75 text-sm sm:text-base font-light mt-1">
              Pregledaj statuse svojih prijava, uredi kontakt podatke i otkrij ostvarene simpatije.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-white/70 hover:bg-rose-50 text-brand/70 hover:text-rose-700 px-4 py-2.5 rounded-full border border-white/80 text-xs font-bold transition-all shadow-sm cursor-pointer hover:border-rose-200"
            >
              <LogOut size={14} /> Odjavi se
            </button>
          </div>
        </section>

        {/* Success Alert Banner */}
        {cancelSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{cancelSuccessMsg}</span>
          </div>
        )}

        {/* User Profile Overview Card */}
        <section className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand/5 border border-white/90 mb-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-brand/10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "Korisnik"} 
                    referrerPolicy="no-referrer" 
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl border-2 border-white shadow-lg shadow-brand/10 object-cover ring-4 ring-brand/5" 
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-brand to-brand-light text-white text-3xl font-serif font-bold flex items-center justify-center shadow-lg shadow-brand/20 ring-4 ring-brand/5">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow-sm" title="Verificiran račun">
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand">
                    {user.displayName || "Korisnik"}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 bg-brand/5 text-brand border border-brand/15 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    <ShieldCheck size={13} className="text-brand-light" /> Verificiran
                  </span>
                </div>
                <p className="text-brand/75 text-sm flex items-center justify-center sm:justify-start gap-2 font-light">
                  <Mail size={15} className="text-brand-light shrink-0" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="flex gap-3">
              <div className="bg-brand/5 border border-brand/10 px-4 sm:px-5 py-3 rounded-2xl text-center min-w-[95px] shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-brand/60 mb-1">
                  <Calendar size={13} className="text-brand-light" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Prijave</span>
                </div>
                <span className="block text-2xl font-serif font-bold text-brand">{registrations.length}</span>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 px-4 sm:px-5 py-3 rounded-2xl text-center min-w-[95px] shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-rose-700/80 mb-1">
                  <Heart size={13} className="fill-rose-500 text-rose-500" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Matchevi</span>
                </div>
                <span className="block text-2xl font-serif font-bold text-rose-600">{matches.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Settings */}
          <div className="mt-6 pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Sparkles size={14} className="text-brand-light" />
                </div>
                <span className="font-serif font-bold text-base text-brand">
                  Kontakt podaci za Speed Dating Match
                </span>
              </div>

              {contactSavedSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-fade-in">
                  <Check size={14} /> Spremljeno!
                </span>
              )}
            </div>

            <p className="text-xs text-brand/70 mb-5 font-light leading-relaxed max-w-2xl">
              Ove kontakt podatke dijelimo isključivo s osobama s kojima ostvariš obostrani match nakon završenog događaja kako biste se mogli povezati.
            </p>

            <form onSubmit={handleSaveContact} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand flex items-center gap-1.5">
                  <FaInstagram size={14} className="text-pink-600" />
                  <span>Instagram korisničko ime</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand/50 text-sm font-semibold select-none">@</span>
                  <input
                    type="text"
                    value={instagram.startsWith('@') ? instagram.slice(1) : instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="tvoje_korisnicko_ime"
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all placeholder:text-brand/35 text-brand shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-700" />
                  <span>Broj mobitela (WhatsApp)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Npr. 091 123 4567"
                  className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/15 text-sm font-medium outline-none transition-all placeholder:text-brand/35 text-brand shadow-xs"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingContact}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md shadow-brand/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  {savingContact ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  <span>{savingContact ? 'Spremanje...' : 'Spremi kontakt podatke'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="mb-6">
          <div className="flex items-center justify-center sm:justify-start gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs inline-flex w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('registrations')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-brand/75 hover:text-brand hover:bg-white/60'
              }`}
            >
              <Calendar size={16} />
              <span>Moje prijave</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'registrations' ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
              }`}>
                {registrations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-brand/75 hover:text-brand hover:bg-white/60'
              }`}
            >
              <MessageCircleHeart size={16} className={activeTab === 'matches' ? 'text-white' : 'text-rose-500'} />
              <span>Moji matchevi</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'matches' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {matches.length}
              </span>
            </button>
          </div>
        </section>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <section className="space-y-4">
            {loadingData ? (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center text-brand/60 flex flex-col items-center justify-center border border-white/80">
                <Loader2 size={32} className="animate-spin mb-3 text-brand/50" />
                <p className="text-sm font-medium">Učitavanje tvojih prijava...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 sm:p-14 text-center border border-white/90 shadow-xl shadow-brand/5">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Calendar size={32} className="text-brand-light" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand mb-3">
                  Nemaš aktivnih prijava
                </h3>
                <p className="text-brand/75 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed mb-7">
                  Trenutno nisi prijavljen/a ni na jedan nadolazeći speed dating susret. Provjeri dostupne termine i rezerviraj svoje mjesto!
                </p>
                <Link
                  to="/eventi"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white font-bold px-7 py-3.5 rounded-full text-sm shadow-xl shadow-brand/20 transition-all hover:scale-105"
                >
                  <Sparkles size={16} />
                  <span>Pregledaj dostupne termine</span>
                  <ChevronRight size={16} />
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
                    className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/90 shadow-xl shadow-brand/5 transition-all hover:shadow-2xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand">
                            {eventInfo?.title || 'Speed Dating Događaj'}
                          </h3>
                          
                          {/* Status Badges with glowing dots */}
                          {status === 'accepted' && (
                            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Prijava potvrđena
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Na čekanju pregleda
                            </span>
                          )}
                          {status === 'waiting_list' && (
                            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Na listi čekanja
                            </span>
                          )}
                          {status === 'rejected' && (
                            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200/70 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              <XCircle size={13} /> Odbijeno
                            </span>
                          )}
                          {status === 'cancelled' && (
                            <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              <XCircle size={13} /> Otkazana prijava
                            </span>
                          )}
                        </div>

                        {/* Event Details Grid matching EventsPage */}
                        {eventInfo && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs text-brand/85">
                            {eventInfo.dateStr && (
                              <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-white/80">
                                <Calendar size={15} className="text-brand-light shrink-0" />
                                <div>
                                  <span className="text-[10px] text-brand/60 uppercase block leading-none font-semibold">Datum</span>
                                  <span className="font-medium text-brand">{eventInfo.dateStr}</span>
                                </div>
                              </div>
                            )}
                            {eventInfo.timeStr && (
                              <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-white/80">
                                <Clock3 size={15} className="text-brand-light shrink-0" />
                                <div>
                                  <span className="text-[10px] text-brand/60 uppercase block leading-none font-semibold">Vrijeme</span>
                                  <span className="font-medium text-brand">{eventInfo.timeStr} h</span>
                                </div>
                              </div>
                            )}
                            {eventInfo.location && (
                              <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-white/80">
                                <MapPin size={15} className="text-brand-light shrink-0" />
                                <div>
                                  <span className="text-[10px] text-brand/60 uppercase block leading-none font-semibold">Lokacija</span>
                                  <span className="font-medium text-brand truncate max-w-[150px] block" title={eventInfo.location}>{eventInfo.location}</span>
                                </div>
                              </div>
                            )}
                            {eventInfo.price && (
                              <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-white/80">
                                <CreditCard size={15} className="text-brand-light shrink-0" />
                                <div>
                                  <span className="text-[10px] text-brand/60 uppercase block leading-none font-semibold">Kotizacija</span>
                                  <span className="font-medium text-brand">{eventInfo.price}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status Explanations */}
                        {status === 'pending' && eventInfo?.coreEventUrl ? (
                          <div className="space-y-3">
                            <div className="text-xs text-amber-950 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-2.5 shadow-2xs leading-relaxed">
                              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                                <CreditCard size={16} className="text-amber-700 shrink-0" />
                                <span>Korak do potvrde: Kupnja ulaznice na CoreEventu</span>
                              </div>
                              <p>
                                Broj mjesta za ovaj događaj je ograničen radi balansa sudionika i osigurava se kupnjom ulaznice po principu najbrže prijave.
                              </p>
                              <div className="pt-2 flex flex-col gap-1.5 text-[11px] text-amber-900/90 border-t border-amber-200/60">
                                <p>
                                  🔒 <strong>Potvrda s CoreEventa je 100% važeća:</strong> Ako si već kupio/la ulaznicu na CoreEventu, tvoje mjesto je sigurno i upad ti je zajamčen!
                                </p>
                                <p>
                                  ⏳ <strong>Ljudska provjera (rok do 24h):</strong> U našem sustavu kupnja postaje vidljiva tek nakon ljudske provjere (unutar 24 sata), kada status prelazi u "Prijava potvrđena". Do tada, tvoja karta s CoreEventa je tvoje 100% osiguranje.
                                </p>
                                <p>
                                  ℹ️ <strong>Već imaš ulaznicu?</strong> Ako si već obavio/la kupnju na CoreEventu, slobodno zanemari ovaj gumb za plaćanje i primljene e-mailove s pozivom na kupnju.
                                </p>
                                <p>
                                  📬 <strong>Spam mapa:</strong> Obavezno provjeri mapu <strong>Spam / Promocije</strong> i označi poruke kao "Nije neželjena pošta" kako bi sigurno primao/la sve buduće obavijesti.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : status === 'pending' ? (
                          <div className="text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 leading-relaxed">
                            <Clock3 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                            <span>
                              Prijava je zaprimljena i čeka na pregled organizatora. Obavijest o potvrdi primit ćeš na e-mail unutar <strong>24 sata</strong>. Ako je ne vidiš u pristigloj pošti, svakako provjeri mapu <strong>Spam / Neželjena pošta</strong>.
                            </span>
                          </div>
                        ) : null}

                        {status === 'waiting_list' && (
                          <div className="text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 leading-relaxed">
                            <Clock3 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                            <span>
                              Trenutačno se nalaziš na <strong>listi čekanja</strong> za ovaj događaj. Organizator će te obavijestiti putem e-maila ako se oslobodi mjesto.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap lg:flex-col gap-2 pt-2 lg:pt-0 shrink-0">
                        {/* CoreEvent Payment Button while pending */}
                        {status === 'pending' && eventInfo?.coreEventUrl && (
                          <a
                            href={eventInfo.coreEventUrl.startsWith('http') ? eventInfo.coreEventUrl : `https://${eventInfo.coreEventUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md shadow-brand/20 hover:scale-[1.02] transition-all"
                            title="Kupi ulaznicu na CoreEventu"
                          >
                            <CreditCard size={15} />
                            <span>Kupi ulaznicu na CoreEventu</span>
                            <ExternalLink size={13} />
                          </a>
                        )}

                        {/* Matching Button if enabled and user was accepted */}
                        {isMatchingActive && status === 'accepted' && (
                          <Link
                            to={`/matching?eventId=${reg.eventId}`}
                            className={`inline-flex items-center justify-center gap-2 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md hover:scale-[1.02] transition-all ${
                              eventInfo?.matchingPhase === 'live'
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                                : 'bg-gradient-to-r from-rose-500 to-brand hover:shadow-rose-500/20'
                            }`}
                          >
                            <Flame size={15} className={eventInfo?.matchingPhase === 'live' ? 'animate-pulse' : ''} />
                            <span>{eventInfo?.matchingPhase === 'live' ? 'Matching Uživo 🔴' : 'Speed Dating Matching 💖'}</span>
                          </Link>
                        )}

                        {/* Link to Form Page for this event */}
                        <Link
                          to={`/prijava?eventId=${reg.eventId}`}
                          className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-brand border border-brand/20 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-xs"
                          title="Pogledaj stranicu prijave za ovaj događaj"
                        >
                          <ExternalLink size={13} />
                          <span>Stranica prijave</span>
                        </Link>

                        {/* Cancel Registration Button (only for active registrations) */}
                        {(status === 'pending' || status === 'accepted' || status === 'waiting_list') && (
                          <button
                            type="button"
                            onClick={() => setCancellingRegistration(reg)}
                            className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <XCircle size={14} />
                            <span>Odjavi se s događaja</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* TAB 2: MATCHES */}
        {activeTab === 'matches' && (
          <section className="space-y-4">
            {loadingData ? (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center text-brand/60 flex flex-col items-center justify-center border border-white/80">
                <Loader2 size={32} className="animate-spin mb-3 text-brand/50" />
                <p className="text-sm font-medium">Učitavanje tvojih matcheva...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/90 shadow-xl shadow-brand/5">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 animate-float-slow">
                  <Heart size={32} className="fill-rose-500/20" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand mb-2">Još nema zabilježenih matcheva</h3>
                <p className="text-brand/75 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed mb-6">
                  Nakon završenog speed dating eventa organizator pokreće Matching. Kada ti i druga osoba označite da se jedno drugom sviđate, vaš kontakt pojavit će se ovdje!
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-brand text-white font-bold px-6 py-3 rounded-full text-xs shadow-md hover:bg-brand-light transition-all"
                >
                  <ArrowLeft size={14} /> Povratak na naslovnicu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(m => {
                  const cleanIg = m.partnerContact?.startsWith('@') ? m.partnerContact.slice(1) : m.partnerContact;
                  const isInstagram = m.partnerContact?.includes('@') || (!m.partnerContact?.includes('+') && isNaN(Number(cleanIg)));

                  return (
                    <div 
                      key={m.id}
                      className="bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/90 shadow-xl shadow-brand/5 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />

                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white flex items-center justify-center font-serif font-bold text-xl shadow-md shadow-rose-500/20">
                              {m.partnerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-bold text-xl text-brand">{m.partnerName}</h4>
                                <Heart size={16} className="text-rose-500 fill-rose-500" />
                              </div>
                              <p className="text-xs text-brand/60 font-medium">
                                {m.eventTitle} {m.eventDate ? `• ${m.eventDate}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Match 💞
                          </span>
                        </div>

                        {/* Contact channels */}
                        <div className="space-y-2 pt-3 border-t border-brand/10">
                          {m.partnerInstagram && (
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-white/80 text-xs">
                              <span className="font-medium text-brand/80 flex items-center gap-2">
                                <FaInstagram size={16} className="text-pink-600 shrink-0" />
                                <span className="font-semibold">{m.partnerInstagram}</span>
                              </span>
                              <a 
                                href={`https://instagram.com/${m.partnerInstagram.replace('@', '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 bg-brand/5 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-full font-bold text-[11px] transition-all"
                              >
                                <span>Otvori IG</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}

                          {m.partnerPhone && (
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-white/80 text-xs">
                              <span className="font-medium text-brand/80 flex items-center gap-2">
                                <Phone size={15} className="text-emerald-700 shrink-0" />
                                <span className="font-semibold">{m.partnerPhone}</span>
                              </span>
                              <a 
                                href={`tel:${m.partnerPhone}`}
                                className="inline-flex items-center gap-1.5 bg-brand/5 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-full font-bold text-[11px] transition-all"
                              >
                                <span>Nazovi</span>
                                <Phone size={12} />
                              </a>
                            </div>
                          )}

                          {!m.partnerInstagram && !m.partnerPhone && m.partnerContact && (
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-white/80 text-xs">
                              <span className="font-medium text-brand/80 flex items-center gap-2">
                                {isInstagram ? <FaInstagram size={16} className="text-pink-600" /> : <Phone size={15} className="text-emerald-700" />}
                                <span className="font-semibold">{m.partnerContact}</span>
                              </span>
                              {isInstagram ? (
                                <a 
                                  href={`https://instagram.com/${cleanIg}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-brand/5 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-full font-bold text-[11px] transition-all"
                                >
                                  <span>Otvori IG</span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <a 
                                  href={`tel:${m.partnerContact}`}
                                  className="inline-flex items-center gap-1.5 bg-brand/5 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-full font-bold text-[11px] transition-all"
                                >
                                  <span>Nazovi</span>
                                  <Phone size={12} />
                                </a>
                              )}
                            </div>
                          )}

                          {m.partnerEmail && (
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-white/80 text-xs">
                              <span className="font-medium text-brand/80 flex items-center gap-2 truncate pr-2">
                                <Mail size={15} className="text-brand-light shrink-0" />
                                <span className="truncate">{m.partnerEmail}</span>
                              </span>
                              <a 
                                href={`mailto:${m.partnerEmail}`}
                                className="inline-flex items-center gap-1.5 bg-brand/5 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-full font-bold text-[11px] transition-all shrink-0"
                              >
                                <span>Pošalji e-mail</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </main>

      {/* CANCEL REGISTRATION CONFIRMATION MODAL */}
      {cancellingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle size={26} />
            </div>
            
            <h3 className="text-2xl font-serif font-bold text-center text-brand mb-2">
              Potvrda odjave s događaja
            </h3>
            
            <p className="text-sm text-brand/75 text-center mb-6 leading-relaxed">
              Jeste li sigurni da želite otkazati prijavu za događaj{' '}
              <strong className="text-brand">"{cancellingRegistration.eventDetails?.title || 'Speed Dating'}"</strong>? 
              Vaše mjesto bit će oslobođeno za druge zainteresirane sudionike.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCancellingRegistration(null)}
                disabled={cancelLoading}
                className="flex-1 py-3 rounded-2xl border border-brand/20 text-brand font-semibold text-sm hover:bg-brand/5 transition-colors cursor-pointer"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelRegistration}
                disabled={cancelLoading}
                className="flex-1 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-rose-700/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {cancelLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{cancelLoading ? 'Otkazivanje...' : 'Da, odjavi me'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
