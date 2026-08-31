import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, Clock, MapPin, CreditCard, Mail, Heart, Wine, LogOut, ShieldAlert, Loader2, Users } from 'lucide-react';
import { FaInstagram as Instagram, FaGoogle } from 'react-icons/fa';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
          setActiveEvent({ id: docData.id, ...(docData.data() as any) } as ActiveEvent);
        } else {
          setActiveEvent(null);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju aktivnog događaja:", err);
      } finally {
        setLoadingEvent(false);
      }
    };
    
    fetchActiveEvent();
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      
      {/* Top right discrete auth widget */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm">
            {ADMIN_UIDS.includes(user.uid) && (
              <Link to="/admin" className="text-brand flex items-center gap-1 text-xs font-bold uppercase tracking-wider mr-2 hover:text-brand-light transition-colors">
                <ShieldAlert size={14} /> Admin
              </Link>
            )}
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-brand/20" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-xs">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={handleLogout} className="text-brand/60 hover:text-red-500 transition-colors" title="Odjavi se">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 bg-white/50 backdrop-blur-md hover:bg-white/80 px-4 py-2 rounded-full border border-white/60 shadow-sm text-brand text-sm font-medium transition-all"
            title="Prijava (Google)"
          >
            <FaGoogle size={14} /> Prijavi se
          </button>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-brand-light/20 rotate-[-15deg]">
        <Heart size={120} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 right-10 text-brand-light/20 rotate-[15deg]">
        <Wine size={140} strokeWidth={1} />
      </div>

      <div className="max-w-3xl w-full bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-white/50 z-10 relative mt-12 sm:mt-0">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 text-brand">
            <Heart size={48} strokeWidth={1.5} className="fill-brand/10" />
          </div>
          <p className="text-sm uppercase tracking-widest text-brand-light mb-2 font-medium">Upoznaj nekoga. Kao nekad.</p>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight uppercase">Na prvi<br/>pogled</h1>
          
          <div className="inline-block border-y border-brand py-3 px-6 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-brand-light">Manje Ekrana</h2>
            <p className="font-serif italic text-xl">Više stvarnih susreta</p>
          </div>
          
          <div className="text-lg space-y-4 font-light text-brand/80 max-w-2xl mx-auto mb-8">
            <p>
              Koliko puta si pomislio/la da bi nekoga volio/la upoznati, ali nikad nisi napravio/la prvi korak?
            </p>
            <p className="font-medium">
              <strong>Na prvi pogled</strong> je večer stvorena za nove susrete. Druženje, opuštena atmosfera i prilika da nekoga upoznaš onako kako se nekad upoznavalo - uživo.
            </p>
            <p>
              Ti napravi prvi korak. Za sve ostalo pobrinut ćemo se mi.
            </p>
          </div>
        </div>

        {loadingEvent ? (
          <div className="flex justify-center items-center py-12 text-brand/50">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : activeEvent ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-white/50 p-6 rounded-2xl border border-white/60">
              <div className="col-span-1 sm:col-span-2 text-center mb-2 pb-4 border-b border-white/60">
                <h3 className="font-bold text-xl text-brand">{activeEvent.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-full text-brand">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand/60 font-semibold">Dobna skupina</p>
                  <p className="font-medium">{activeEvent.ageGroup}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-full text-brand">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand/60 font-semibold">Datum</p>
                  <p className="font-medium">{activeEvent.dateStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-full text-brand">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand/60 font-semibold">Vrijeme</p>
                  <p className="font-medium">{activeEvent.timeStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-full text-brand">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand/60 font-semibold">Lokacija</p>
                  <p className="font-medium">{activeEvent.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-full text-brand">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand/60 font-semibold">Kotizacija</p>
                  <p className="font-medium">{activeEvent.price}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 justify-center">
                <a href="https://instagram.com/na.prvi.pogled" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium hover:text-brand-light transition-colors w-fit">
                  <Instagram size={16} /> @na.prvi.pogled
                </a>
                <a href="mailto:naprvipogled.events@gmail.com" className="flex items-center gap-2 text-sm font-medium hover:text-brand-light transition-colors w-fit">
                  <Mail size={16} /> naprvipogled.events@gmail.com
                </a>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to={`/prijava?eventId=${activeEvent.id}`} 
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white px-10 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand/30"
              >
                Prijavi se <Heart size={18} className="fill-white" />
              </Link>
              <p className="mt-4 text-xs font-medium uppercase tracking-widest text-brand-light">Broj mjesta je ograničen</p>
            </div>
          </>
        ) : (
          <div className="bg-white/50 p-8 rounded-2xl border border-white/60 text-center mb-6">
            <div className="bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand mb-2">Trenutno nema aktivnih prijava</h3>
            <p className="text-brand/80">
              Sva mjesta za trenutni događaj su popunjena ili još nismo najavili novi susret.
            </p>
            <p className="text-brand/80 mt-2 font-medium">
              Pratite naš <a href="https://instagram.com/na.prvi.pogled" target="_blank" rel="noreferrer" className="underline hover:text-brand">Instagram profil</a> za najave!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
