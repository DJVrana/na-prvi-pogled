import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  Menu, 
  X, 
  Calendar, 
  Mail, 
  Home, 
  LogOut, 
  ShieldAlert, 
  Flame,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { FaGoogle, FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, provider, db } from '../firebase';
import { isEventMatchingActive, syncEventLifecycle, isEventDay } from '../utils/eventLifecycle';

const ADMIN_UIDS = ['iKe7lzl7Msf7hd3kWyHC1ysyS3C3', 'Izt37mNGtpY82AKZTbyYsnctoxJ2', 'JRms1cPi2Bc513TOW0WBEFZMzrC3'];

interface ActiveMatchingEvent {
  id: string;
  title: string;
  dateStr?: string;
  matchingPhase?: 'live' | 'post_event' | 'closed';
  isMatchingActive?: boolean;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [matchingEvent, setMatchingEvent] = useState<ActiveMatchingEvent | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Check matching status
  useEffect(() => {
    const checkMatching = async () => {
      try {
        const q = query(collection(db, 'events'), where('isMatchingActive', '==', true));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const evt = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
          syncEventLifecycle(db, evt);
          if (isEventMatchingActive(evt)) {
            setMatchingEvent(evt);
          } else {
            setMatchingEvent(null);
          }
        } else {
          setMatchingEvent(null);
        }
      } catch {
        // Silently catch in navbar
      }
    };
    checkMatching();
  }, []);

  // Check whether to show the live matching modal (specifically on event day for registered attendees)
  useEffect(() => {
    const checkLiveModal = async () => {
      if (!user || !matchingEvent || location.pathname === '/matching') {
        setShowLiveModal(false);
        return;
      }

      // Only show popup modal ON the day of the event
      if (!isEventDay(matchingEvent.dateStr)) {
        setShowLiveModal(false);
        return;
      }

      // Check if dismissed in this browser session
      try {
        if (sessionStorage.getItem('dismissed_matching_live_' + matchingEvent.id) === 'true') {
          setShowLiveModal(false);
          return;
        }
      } catch {
        // ignore storage errors
      }

      // Verify the user is registered for this event
      try {
        const regQ = query(
          collection(db, 'prijave'),
          where('uid', '==', user.uid),
          where('eventId', '==', matchingEvent.id)
        );
        const regSnap = await getDocs(regQ);
        const isRegistered = !regSnap.empty && regSnap.docs.some(d => {
          const data = d.data();
          return data.status !== 'cancelled' && data.status !== 'rejected';
        });

        setShowLiveModal(isRegistered);
      } catch (err) {
        console.warn('Navbar checkLiveModal error:', err);
      }
    };

    checkLiveModal();
  }, [user, matchingEvent, location.pathname]);

  const handleDismissLiveModal = (eventId: string) => {
    try {
      sessionStorage.setItem('dismissed_matching_live_' + eventId, 'true');
    } catch {
      // ignore
    }
    setShowLiveModal(false);
  };


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

  const navLinks = [
    { name: 'Početna', path: '/', icon: Home },
    { name: 'Eventi', path: '/eventi', icon: Calendar },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Kontakt', path: '/kontakt', icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-peach/90 backdrop-blur-xl shadow-md shadow-brand/5 border-b border-brand/10 py-3' 
            : 'bg-peach/40 backdrop-blur-md py-4 sm:py-5 border-b border-brand/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-[1.02]"
              aria-label="Na prvi pogled - Početna stranica"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-brand/10 border border-brand/10 flex items-center justify-center shrink-0">
                <img 
                  src={`${import.meta.env.BASE_URL}images/logo.png`} 
                  alt="Na prvi pogled logo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-brand leading-none">
                  Na prvi pogled
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-light/80 font-medium">
                  Speed Dating
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-sm" aria-label="Glavna navigacija">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                      active
                        ? 'bg-brand text-white shadow-sm shadow-brand/20'
                        : 'text-brand/80 hover:text-brand hover:bg-brand/5'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-white' : 'text-brand-light'} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions (Auth & CTA) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Active Matching Ticker Pill if active */}
              {matchingEvent && (
                <Link
                  to={`/matching?eventId=${matchingEvent.id}`}
                  className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-brand hover:from-rose-500 hover:to-brand-light text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md shadow-rose-500/25 ring-2 ring-rose-400/50 hover:ring-rose-400 hover:scale-105 transition-all animate-pulse"
                  title="Matching je u tijeku – otvori i označi favorite!"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                  </span>
                  <Flame size={14} className="text-amber-300 fill-amber-300 shrink-0" />
                  <span className="tracking-wide">Matching u tijeku</span>
                  <ArrowUpRight size={14} className="text-amber-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/90 shadow-sm">
                  {ADMIN_UIDS.includes(user.uid) && (
                    <Link 
                      to="/admin" 
                      className="text-brand flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider hover:text-brand-light transition-colors pr-1 border-r border-brand/15"
                      title="Admin nadzorna ploča"
                    >
                      <ShieldAlert size={14} className="text-brand-light" /> Admin
                    </Link>
                  )}
                  <Link 
                    to="/profil" 
                    className="flex items-center gap-2 text-brand hover:text-brand-light transition-colors"
                    title="Moj profil"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "Profilna slika"} 
                        referrerPolicy="no-referrer" 
                        className="w-6 h-6 rounded-full border border-brand/20 object-cover" 
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-brand max-w-[90px] truncate">
                      {user.displayName?.split(' ')[0] || 'Profil'}
                    </span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-brand/50 hover:text-red-600 transition-colors p-0.5 rounded-full hover:bg-brand/5" 
                    title="Odjavi se"
                    aria-label="Odjavi se"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 bg-white/80 hover:bg-white text-brand px-3.5 py-1.5 rounded-full border border-white/90 shadow-sm text-xs font-semibold transition-all hover:scale-105"
                  title="Prijavi se s Google računom"
                >
                  <FaGoogle size={12} className="text-brand-light" />
                  <span>Prijava</span>
                </button>
              )}

              {/* Fast Registration CTA */}
              <Link
                to="/eventi"
                className="group relative inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-brand/25 transition-all hover:scale-105 overflow-hidden"
              >
                <span>Prijavi se</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Actions: Matching Pill & Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {matchingEvent && (
                <Link
                  to={`/matching?eventId=${matchingEvent.id}`}
                  className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-brand text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-rose-500/30 border border-white/50 animate-pulse hover:scale-105 transition-all"
                  title="Matching je u tijeku - otvori!"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                  </span>
                  <Flame size={13} className="text-amber-300 fill-amber-300 shrink-0" />
                  <span className="whitespace-nowrap tracking-wide uppercase text-[10px] drop-shadow-xs font-bold">Matching</span>
                  <ArrowUpRight size={13} className="text-amber-200 shrink-0" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/70 border border-white/80 text-brand hover:text-brand-light transition-colors"
                aria-label="Otvori navigacijski izbornik"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </header>
      {/* Event-Day Live Matching Modal */}
      {showLiveModal && matchingEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => handleDismissLiveModal(matchingEvent.id)}
        >
          <div 
            className="bg-white/95 backdrop-blur-xl border border-rose-200/90 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => handleDismissLiveModal(matchingEvent.id)}
              className="absolute top-4 right-4 p-2 text-brand/50 hover:text-brand hover:bg-brand/5 rounded-full transition-colors cursor-pointer"
              aria-label="Zatvori"
            >
              <X size={20} />
            </button>

            {/* Glowing animated Flame icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/30">
              <Flame size={32} className="fill-white animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Matching Uživo je u tijeku</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-brand mb-2">
              Večerašnji matching je otvoren!
            </h3>

            <p className="text-xs sm:text-sm text-brand/80 mb-6 leading-relaxed font-light">
              Prijavljen/a si na susret <strong>{matchingEvent.title}</strong> koji se održava danas! Uđi i označi osobe koje su ti se svidjele kako biste saznali je li kemija obostrana.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                to={`/matching?eventId=${matchingEvent.id}`}
                onClick={() => handleDismissLiveModal(matchingEvent.id)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-brand hover:from-rose-500 hover:to-brand-light text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-rose-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Flame size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
                <span>Uđi u matching uživo</span>
                <ArrowUpRight size={18} />
              </Link>

              <button
                type="button"
                onClick={() => handleDismissLiveModal(matchingEvent.id)}
                className="text-xs text-brand/60 hover:text-brand font-medium py-2 transition-colors cursor-pointer"
              >
                Možda kasnije
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in-up"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed top-16 left-4 right-4 bg-peach/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 z-50 text-brand"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 mb-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-brand text-white shadow-md shadow-brand/20'
                        : 'bg-white/50 text-brand hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={active ? 'text-white' : 'text-brand-light'} />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight size={16} className="opacity-60" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth and Action */}
            <div className="pt-4 border-t border-brand/10 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-white/80">
                    <Link to="/profil" className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Profil" 
                          referrerPolicy="no-referrer" 
                          className="w-8 h-8 rounded-full border border-brand/20" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-brand">{user.displayName || 'Moj Profil'}</p>
                        <p className="text-[10px] text-brand/60">{user.email}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-brand/60 hover:text-red-600 p-2"
                      title="Odjava"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>

                  {ADMIN_UIDS.includes(user.uid) && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand/10 text-brand font-bold text-xs uppercase tracking-wider"
                    >
                      <ShieldAlert size={16} /> Admin Kontrolna Ploča
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-2xl border border-brand/15 text-brand text-sm font-semibold shadow-sm"
                >
                  <FaGoogle size={15} /> Prijavi se s Googleom
                </button>
              )}

              <Link
                to="/eventi"
                className="w-full flex items-center justify-center gap-2 bg-brand text-white p-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-brand/20"
              >
                <Sparkles size={16} className="text-amber-300" />
                <span>Prijavi se na sljedeći događaj</span>
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-brand/70 text-xs">
                <a 
                  href="https://instagram.com/na.prvi.pogled" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 hover:text-brand"
                  title="Instagram"
                >
                  <FaInstagram size={14} className="text-pink-600" /> <span>Instagram</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@na.prvi.pogled" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 hover:text-brand"
                  title="TikTok"
                >
                  <FaTiktok size={13} className="text-black" /> <span>TikTok</span>
                </a>
                <a 
                  href="https://web.facebook.com/profile.php?id=61594619954084" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 hover:text-brand"
                  title="Facebook"
                >
                  <FaFacebook size={14} className="text-blue-600" /> <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
