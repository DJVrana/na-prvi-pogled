import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  Mail, 
  Heart, 
  Wine, 
  LogOut, 
  ShieldAlert, 
  Loader2, 
  Users, 
  Sparkles, 
  Music, 
  Coffee, 
  PartyPopper, 
  CheckCircle2, 
  MessageCircleHeart,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { FaInstagram as Instagram, FaGoogle } from 'react-icons/fa';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, provider, db } from '../firebase';

const ADMIN_UIDS = ['iKe7lzl7Msf7hd3kWyHC1ysyS3C3', 'Izt37mNGtpY82AKZTbyYsnctoxJ2', 'JRms1cPi2Bc513TOW0WBEFZMzrC3'];

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

// Full-screen floating particles spanning across 0% to 100% width
const FULLSCREEN_PARTICLES = [
  { id: 1, left: '3%', type: 'heart', size: 20, delay: '0s', duration: '15s', opacity: 0.4 },
  { id: 2, left: '9%', type: 'sparkle', size: 16, delay: '4s', duration: '18s', opacity: 0.55 },
  { id: 3, left: '15%', type: 'wine', size: 18, delay: '8s', duration: '16s', opacity: 0.3 },
  { id: 4, left: '22%', type: 'heart', size: 24, delay: '2s', duration: '14s', opacity: 0.45 },
  { id: 5, left: '29%', type: 'star', size: 14, delay: '10s', duration: '20s', opacity: 0.5 },
  { id: 6, left: '38%', type: 'sparkle', size: 18, delay: '6s', duration: '17s', opacity: 0.4 },
  { id: 7, left: '62%', type: 'heart', size: 16, delay: '3s', duration: '16s', opacity: 0.45 },
  { id: 8, left: '71%', type: 'star', size: 15, delay: '9s', duration: '19s', opacity: 0.55 },
  { id: 9, left: '78%', type: 'music', size: 19, delay: '1s', duration: '15s', opacity: 0.35 },
  { id: 10, left: '85%', type: 'sparkle', size: 22, delay: '7s', duration: '18s', opacity: 0.5 },
  { id: 11, left: '92%', type: 'heart', size: 26, delay: '5s', duration: '14s', opacity: 0.4 },
  { id: 12, left: '97%', type: 'wine', size: 17, delay: '11s', duration: '17s', opacity: 0.3 }
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const [matchingEvent, setMatchingEvent] = useState<ActiveEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Interactive mouse position for dynamic ambient cursor glow
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const q = query(collection(db, 'events'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const eventsList: ActiveEvent[] = snapshot.docs.map(docData => ({
            id: docData.id,
            ...(docData.data() as any)
          }));
          
          setActiveEvents(eventsList);
          setSelectedEventId(eventsList[0].id);
        } else {
          setActiveEvents([]);
          setSelectedEventId('');
        }

        // Check if any event has matching active
        const matchingQuery = query(collection(db, 'events'), where('isMatchingActive', '==', true));
        const matchingSnap = await getDocs(matchingQuery);
        if (!matchingSnap.empty) {
          setMatchingEvent({ id: matchingSnap.docs[0].id, ...(matchingSnap.docs[0].data() as any) });
        } else {
          setMatchingEvent(null);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju aktivnih događaja:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    fetchActiveEvents();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Greška pri prijavi: ", err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Greška pri odjavi: ", err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const currentEvent = activeEvents.find(e => e.id === selectedEventId) || activeEvents[0] || null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden bg-peach selection:bg-brand selection:text-white"
    >
      
      {/* ========================================================================= */}
      {/* 1. DYNAMIC INTERACTIVE MOUSE SPOTLIGHT (Full screen follow)                */}
      {/* ========================================================================= */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(123, 29, 41, 0.08), transparent 75%)`
        }}
      />

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN AURORA & GLOWING BLUR ORBS (Across 4 corners & center)    */}
      {/* ========================================================================= */}
      <div className="fixed -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-rose-400/25 blur-[120px] animate-aurora pointer-events-none z-0" />
      <div className="fixed -top-20 -right-20 w-[34rem] h-[34rem] rounded-full bg-amber-200/25 blur-[110px] animate-ambient-drift pointer-events-none z-0" style={{ animationDelay: '3s' }} />
      <div className="fixed -bottom-28 -left-24 w-[42rem] h-[42rem] rounded-full bg-brand/12 blur-[130px] animate-aurora pointer-events-none z-0" style={{ animationDelay: '6s' }} />
      <div className="fixed -bottom-24 -right-24 w-[40rem] h-[40rem] rounded-full bg-rose-300/25 blur-[120px] animate-ambient-drift pointer-events-none z-0" style={{ animationDelay: '9s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[55rem] rounded-full bg-peach-dark/50 blur-[150px] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 3. FULL-SCREEN RISING PARTICLES LAYER (Spanning whole width & height)     */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {FULLSCREEN_PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 animate-float-up text-brand-light"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: p.opacity
            }}
          >
            {p.type === 'heart' && <Heart size={p.size} className="fill-brand/20 text-brand" />}
            {p.type === 'sparkle' && <Sparkles size={p.size} className="text-amber-500 animate-twinkle" />}
            {p.type === 'star' && <Star size={p.size} className="fill-amber-400/20 text-amber-500 animate-twinkle" />}
            {p.type === 'wine' && <Wine size={p.size} className="text-brand-light" />}
            {p.type === 'music' && <Music size={p.size} className="text-brand" />}
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. WIDE-SCREEN FLANK ELEMENTS (Desktop / Tablet screen width decorations) */}
      {/* ========================================================================= */}

      {/* --- FAR LEFT FLANK --- */}
      <div className="hidden xl:flex flex-col gap-8 fixed left-6 2xl:left-14 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none">
        {/* Card 1: Wine & Cocktails */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-slow transform -rotate-2">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <Wine size={20} className="text-brand-light" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">Piće dobrodošlice</p>
            <p className="text-[10px] text-brand/60">Uključeno u kotizaciju 🍷</p>
          </div>
        </div>

        {/* Card 2: Live Chemistry */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-medium transform rotate-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-brand shrink-0 relative">
            <Heart size={20} className="fill-brand/20 text-brand animate-pulse-soft" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">Stvarna kemija</p>
            <p className="text-[10px] text-brand/60">Upoznaj nekoga uživo ✨</p>
          </div>
        </div>

        {/* Card 3: No awkward silences */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-fast transform -rotate-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700 shrink-0">
            <Flame size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">Zaboravi swipeanje</p>
            <p className="text-[10px] text-brand/60">Bez gubljenja vremena ⏳</p>
          </div>
        </div>

        {/* Big Watermark Heart on Far Left */}
        <div className="absolute -top-32 -left-8 text-brand-light/10 rotate-[-25deg] pointer-events-none">
          <Heart size={180} strokeWidth={1} />
        </div>
      </div>

      {/* --- FAR RIGHT FLANK --- */}
      <div className="hidden xl:flex flex-col gap-8 fixed right-6 2xl:right-14 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none">
        {/* Card 1: Balanced Participants */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-reverse transform rotate-2">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">Balans sudionika</p>
            <p className="text-[10px] text-brand/60">Jednak broj M & Ž 👥</p>
          </div>
        </div>

        {/* Card 2: Relaxed Atmosphere */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-slow transform -rotate-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700 shrink-0">
            <Coffee size={20} className="text-brand-light" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">Opuštena atmosfera</p>
            <p className="text-[10px] text-brand/60">Ugodan ambijent i glazba 🎶</p>
          </div>
        </div>

        {/* Card 3: Safe & Private */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-brand/5 flex items-center gap-3 animate-float-medium transform rotate-1">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 shrink-0">
            <Sparkles size={20} className="text-green-600 animate-twinkle" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand">100% Privatnost</p>
            <p className="text-[10px] text-brand/60">Podaci su sigurni 🔒</p>
          </div>
        </div>

        {/* Big Watermark Wine on Far Right */}
        <div className="absolute -bottom-24 -right-6 text-brand-light/10 rotate-[20deg] pointer-events-none">
          <Wine size={180} strokeWidth={1} />
        </div>
      </div>

      {/* Top right discrete auth widget */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/80 shadow-sm transition-all hover:bg-white/90">
            {ADMIN_UIDS.includes(user.uid) && (
              <Link to="/admin" className="text-brand flex items-center gap-1 text-xs font-bold uppercase tracking-wider mr-1 hover:text-brand-light transition-colors">
                <ShieldAlert size={14} /> Admin
              </Link>
            )}
            <Link to="/profil" className="flex items-center gap-2 text-brand hover:text-brand-light transition-colors" title="Moj profil">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-brand/20 shadow-inner" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold hidden sm:inline">Moj profil</span>
            </Link>
            <button onClick={handleLogout} className="text-brand/60 hover:text-red-500 transition-colors ml-1" title="Odjavi se">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-md hover:bg-white px-4 py-2 rounded-full border border-white/80 shadow-sm text-brand text-sm font-medium transition-all transform hover:scale-105"
            title="Prijava (Google)"
          >
            <FaGoogle size={14} /> Prijavi se
          </button>
        )}
      </div>

      {/* Active Matching Announcement Banner */}
      {matchingEvent && (
        <div className="z-20 mt-14 sm:mt-10 mb-2 animate-fade-in-up">
          <Link
            to={`/matching?eventId=${matchingEvent.id}`}
            className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
              matchingEvent.matchingPhase === 'live'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                : 'bg-gradient-to-r from-rose-500 to-brand hover:shadow-rose-500/25'
            }`}
          >
            <Flame size={15} className={matchingEvent.matchingPhase === 'live' ? 'animate-pulse' : ''} />
            <span>
              {matchingEvent.matchingPhase === 'live'
                ? `Matching uživo je u tijeku za ${matchingEvent.title}! Označi simpatije 🔒✨`
                : `Matching je otvoren za ${matchingEvent.title}! Pronađi svoje simpatije ✨`}
            </span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN CARD WRAPPER WITH SURROUNDING FLOATING ACCENTS                     */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-3xl my-8 z-10">

        {/* Close Top-Left: Ruby Heart Glass Badge */}
        <div className="absolute -top-7 -left-5 sm:-top-9 sm:-left-9 z-20 animate-float-slow pointer-events-none select-none">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center justify-center text-brand transform -rotate-6">
            <Heart size={26} className="text-brand fill-brand/15 drop-shadow-sm" />
          </div>
        </div>

        {/* Close Top-Right: Sparkles Glass Badge */}
        <div className="absolute -top-8 -right-4 sm:-top-10 sm:-right-8 z-20 animate-float-medium pointer-events-none select-none">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center justify-center text-amber-600 transform rotate-12">
            <Sparkles size={24} className="text-amber-600 animate-pulse-soft" />
          </div>
        </div>

        {/* Close Mid-Left: Floating Live Connection Pill */}
        <div className="absolute top-1/4 -left-6 sm:-left-14 z-20 animate-float-fast pointer-events-none select-none hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-lg shadow-brand/10 text-brand text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <PartyPopper size={15} className="text-brand-light" />
          <span>Uživo susreti</span>
        </div>

        {/* Close Mid-Right: Floating Wine & Drinks Glass Badge */}
        <div className="absolute top-1/3 -right-6 sm:-right-12 z-20 animate-float-slow pointer-events-none select-none hidden sm:flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center justify-center text-brand transform -rotate-12">
            <Wine size={24} className="text-brand-light" />
          </div>
        </div>

        {/* Close Bottom-Left: Message Connection Glass Badge */}
        <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 z-20 animate-float-medium pointer-events-none select-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center justify-center text-brand transform rotate-6">
            <MessageCircleHeart size={24} className="text-brand" />
          </div>
        </div>

        {/* Close Bottom-Right: Calendar Glass Badge */}
        <div className="absolute -bottom-7 -right-4 sm:-bottom-9 sm:-right-8 z-20 animate-float-fast pointer-events-none select-none">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-brand/10 flex items-center justify-center text-brand-light transform -rotate-6">
            <Calendar size={24} className="text-brand-light" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTRAL MAIN CARD CONTAINER                                  */}
        {/* ============================================================ */}
        <div className="w-full bg-white/55 backdrop-blur-2xl p-6 sm:p-10 md:p-14 rounded-3xl shadow-2xl shadow-brand/15 border border-white/90 z-10 relative animate-fade-in-up ring-1 ring-white/60">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="relative inline-flex items-center justify-center p-3.5 rounded-2xl bg-brand/5 border border-brand/10 text-brand shadow-sm">
                <Heart size={46} strokeWidth={1.5} className="fill-brand/15 text-brand animate-pulse-soft" />
                <Sparkles size={18} className="absolute -top-1 -right-1 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
            
            <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-brand-light mb-2 font-semibold">
              Upoznaj nekoga. Kao nekad.
            </p>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight uppercase text-brand">
              Na prvi<br/>pogled
            </h1>
            
            <div className="inline-block border-y border-brand/30 py-3 px-8 mb-8 bg-white/30 backdrop-blur-sm rounded-lg shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-brand-light">Manje Ekrana</h2>
              <p className="font-serif italic text-lg sm:text-xl text-brand/90 mt-0.5">Više stvarnih susreta</p>
            </div>
            
            <div className="text-base sm:text-lg space-y-4 font-light text-brand/80 max-w-2xl mx-auto mb-6 leading-relaxed">
              <p>
                Koliko puta si pomislio/la da bi nekoga volio/la upoznati, ali nikad nisi napravio/la prvi korak?
              </p>
              <p className="font-medium text-brand">
                <strong>Na prvi pogled</strong> je večer stvorena za nove susrete. Druženje, opuštena atmosfera i prilika da nekoga upoznaš onako kako se nekad upoznavalo — uživo.
              </p>
              <p>
                Ti napravi prvi korak. Za sve ostalo pobrinut ćemo se mi.
              </p>
            </div>
          </div>

          {/* Events Section */}
          {loadingEvents ? (
            <div className="flex flex-col justify-center items-center py-16 text-brand/60 gap-3">
              <Loader2 className="animate-spin text-brand" size={36} />
              <p className="text-sm font-medium">Učitavanje događaja...</p>
            </div>
          ) : activeEvents.length > 0 && currentEvent ? (
            <>
              {/* If Multiple Active Events Exist: Interactive Event Selector */}
              {activeEvents.length > 1 && (
                <div className="mb-8 pt-2">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles size={16} className="text-brand-light animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-brand font-bold">
                      Odaberi termin & dobnu skupinu ({activeEvents.length} aktivna događanja)
                    </span>
                    <Sparkles size={16} className="text-brand-light animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm text-brand/70 text-center mb-4 font-normal">
                    Klikni na termin koji te zanima za pregled detalja i prijavu:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeEvents.map((evt) => {
                      const isSelected = evt.id === currentEvent.id;
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => setSelectedEventId(evt.id)}
                          className={`relative text-left p-4 rounded-2xl transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-white/95 border-brand shadow-lg shadow-brand/15 ring-2 ring-brand/30 scale-[1.01]'
                              : 'bg-white/50 hover:bg-white/75 border-white/80 hover:border-brand/40 shadow-sm'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -top-2.5 right-4 bg-brand text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <CheckCircle2 size={11} /> Odabrano
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-brand text-base line-clamp-1">{evt.title}</h4>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-brand/80 mb-2">
                              <Users size={13} className="text-brand-light shrink-0" />
                              <span>Dob: <strong className="text-brand font-semibold">{evt.ageGroup}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-brand/10 text-xs">
                            <span className="font-medium text-brand/90 flex items-center gap-1">
                              <Calendar size={13} className="text-brand-light shrink-0" />
                              {evt.dateStr}
                            </span>
                            <span className="font-bold text-brand-light bg-brand/5 px-2 py-0.5 rounded-md">
                              {evt.price}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Event Details Card */}
              <div 
                key={currentEvent.id} 
                className="bg-white/65 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/90 shadow-md mb-8 transition-all duration-300 animate-fade-in-up"
              >
                <div className="text-center mb-6 pb-4 border-b border-brand/10">
                  <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Prijave su otvorene
                  </div>
                  <h3 className="font-bold text-2xl text-brand">{currentEvent.title}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div className="flex items-center gap-3.5 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <div className="bg-brand/10 p-2.5 rounded-full text-brand shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-brand/60 font-semibold">Dobna skupina</p>
                      <p className="font-semibold text-brand text-base">{currentEvent.ageGroup}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <div className="bg-brand/10 p-2.5 rounded-full text-brand shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-brand/60 font-semibold">Datum</p>
                      <p className="font-semibold text-brand text-base">{currentEvent.dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <div className="bg-brand/10 p-2.5 rounded-full text-brand shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-brand/60 font-semibold">Vrijeme</p>
                      <p className="font-semibold text-brand text-base">{currentEvent.timeStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <div className="bg-brand/10 p-2.5 rounded-full text-brand shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-brand/60 font-semibold">Lokacija</p>
                      <p className="font-semibold text-brand text-base">{currentEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <div className="bg-brand/10 p-2.5 rounded-full text-brand shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-brand/60 font-semibold">Kotizacija</p>
                      <p className="font-semibold text-brand text-base">{currentEvent.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center gap-2 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                    <a 
                      href="https://instagram.com/na.prvi.pogled" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-light transition-colors"
                    >
                      <Instagram size={16} className="text-brand-light" /> @na.prvi.pogled
                    </a>
                    <a 
                      href="mailto:naprvipogled.events@gmail.com" 
                      className="flex items-center gap-2 text-xs font-medium text-brand/80 hover:text-brand-light transition-colors truncate"
                    >
                      <Mail size={16} className="text-brand-light shrink-0" /> naprvipogled.events@gmail.com
                    </a>
                  </div>
                </div>

                {/* Direct Action Registration CTA */}
                <div className="text-center pt-2">
                  <Link 
                    to={`/prijava?eventId=${currentEvent.id}`} 
                    className="group relative inline-flex items-center justify-center gap-3 bg-brand hover:bg-brand-light text-white px-9 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-brand/30 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Prijavi se za ovaj događaj 
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    {/* Animated Shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  </Link>
                  <p className="mt-4 text-xs font-medium uppercase tracking-widest text-brand-light">
                    Broj mjesta je ograničen radi balansa sudionika
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/65 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-white/90 text-center mb-6 shadow-sm">
              <div className="bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
                <Clock size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand mb-3">Trenutno nema aktivnih prijava</h3>
              <p className="text-brand/80 max-w-md mx-auto leading-relaxed">
                Sva mjesta za trenutne događaje su popunjena ili uskoro objavljujemo nove datume i dobne skupine.
              </p>
              <p className="text-brand/90 mt-4 font-semibold">
                Pratite naš <a href="https://instagram.com/na.prvi.pogled" target="_blank" rel="noreferrer" className="underline hover:text-brand-light font-bold">Instagram profil</a> za prve najave!
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
