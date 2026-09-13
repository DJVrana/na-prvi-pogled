import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Link, useSearchParams } from 'react-router';
import { 
  ArrowLeft, 
  Heart, 
  X, 
  Sparkles, 
  Loader2, 
  Flame, 
  Calendar, 
  PartyPopper,
  ChevronRight,
  Mail,
  Phone,
  Search,
  LayoutList,
  Layers,
  Edit3,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { FaInstagram, FaGoogle } from 'react-icons/fa';
import { sendMatchEmail } from '../utils/matchingEmails';

interface EventItem {
  id: string;
  title: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  isMatchingActive?: boolean;
  matchingPhase?: 'live' | 'post_event' | 'closed';
}

interface Candidate {
  id: string; // prijava id
  uid: string;
  imePrezime: string;
  godine: number;
  spol: string;
  email: string;
  napomena?: string;
  contactHandle?: string;
  contactInstagram?: string;
  contactPhone?: string;
  customAnswers?: { label: string; value: any }[];
  voteStatus?: 'like' | 'pass' | 'unvoted';
}

interface MatchResult {
  partnerName: string;
  partnerInstagram?: string;
  partnerPhone?: string;
  partnerContact?: string;
  partnerEmail: string;
  partnerGender: string;
}

export default function MatchingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const eventIdParam = searchParams.get('eventId');

  // State
  const [event, setEvent] = useState<EventItem | null>(null);
  const [availableEvents, setAvailableEvents] = useState<EventItem[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // User's registration for this event
  const [myRegistration, setMyRegistration] = useState<any | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState<string>('');

  // Contact info onboarding & editing
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [hasConfirmedContact, setHasConfirmedContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);

  // Candidates & Voting
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Search, Filtering & View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'unvoted' | 'all' | 'liked'>('unvoted');
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>('list');

  // Interactive feedback
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Match celebration modal (only used in post_event phase)
  const [newMatch, setNewMatch] = useState<MatchResult | null>(null);
  const [sessionMatches, setSessionMatches] = useState<MatchResult[]>([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.instagram) {
              setInstagram(data.instagram.startsWith('@') ? data.instagram : `@${data.instagram}`);
            }
            if (data.phone) {
              setPhone(data.phone);
            }
          }
        } catch (e) {
          console.error("Greška pri dohvaćanju profila:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Active Matching Event(s)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvent(true);
      try {
        if (eventIdParam) {
          const evDoc = await getDoc(doc(db, 'events', eventIdParam));
          if (evDoc.exists()) {
            setEvent({ id: evDoc.id, ...evDoc.data() } as EventItem);
          } else {
            setAccessError("Događaj nije pronađen.");
          }
        } else {
          // Fetch events where matching is active
          const q = query(collection(db, 'events'), where('isMatchingActive', '==', true));
          const snap = await getDocs(q);
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
          setAvailableEvents(list);

          if (list.length === 1) {
            setEvent(list[0]);
          }
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju događaja:", err);
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvents();
  }, [eventIdParam]);

  // 3. Verify user has accepted registration for this event
  useEffect(() => {
    const checkUserEligibility = async () => {
      if (!user || !event) {
        setCheckingAccess(false);
        return;
      }

      setCheckingAccess(true);
      setAccessError('');

      try {
        if (!event.isMatchingActive) {
          setAccessError("Matching za ovaj događaj trenutno nije aktivan. Administrator će ga aktivirati tijekom ili nakon susreta.");
          setCheckingAccess(false);
          return;
        }

        // Check user's registration
        const q = query(
          collection(db, 'prijave'),
          where('eventId', '==', event.id),
          where('uid', '==', user.uid)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setAccessError("Nisi prijavljen/a na ovaj događaj. Samo sudionici ovog događaja mogu pristupiti matchingu.");
          setCheckingAccess(false);
          return;
        }

        const regData = snap.docs[0].data();
        if (regData.status !== 'accepted') {
          setAccessError("Pristup matchingu moguć je isključivo za sudionike čija je prijava bila potvrđena od strane organizatora.");
          setCheckingAccess(false);
          return;
        }

        setMyRegistration({ id: snap.docs[0].id, ...regData });

        let currentIg = '';
        let currentPhone = '';

        if (regData.contactInstagram) {
          currentIg = regData.contactInstagram.startsWith('@') ? regData.contactInstagram : `@${regData.contactInstagram}`;
        }
        if (regData.contactPhone) {
          currentPhone = regData.contactPhone;
        }
        if (!currentIg && !currentPhone && regData.contactHandle) {
          if (regData.contactHandle.startsWith('@')) {
            currentIg = regData.contactHandle;
          } else {
            currentPhone = regData.contactHandle;
          }
        }

        if (currentIg) setInstagram(currentIg);
        if (currentPhone) setPhone(currentPhone);

        // If user already has contact info registered or in profile, allow immediate entry
        if (currentIg || currentPhone || instagram || phone) {
          setHasConfirmedContact(true);
        }
      } catch (err) {
        console.error("Greška pri provjeri prava pristupa:", err);
        setAccessError("Došlo je do greške prilikom provjere pristupa.");
      } finally {
        setCheckingAccess(false);
      }
    };

    checkUserEligibility();
  }, [user, event]);

  // 4. Fetch Candidates & Existing Votes
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!user || !event || !myRegistration || !hasConfirmedContact) return;

      setLoadingCandidates(true);
      try {
        // Determine opposite gender
        const myGender = (myRegistration.spol || '').trim().toUpperCase();
        const isMale = myGender === 'M' || myGender === 'MUŠKO' || myGender === 'MUSKO';

        // 1. Fetch all accepted participants for this event
        const qAll = query(
          collection(db, 'prijave'),
          where('eventId', '==', event.id),
          where('status', '==', 'accepted')
        );
        const allSnap = await getDocs(qAll);

        // 2. Fetch votes already cast by this user for this event
        const qLikes = query(
          collection(db, 'event_likes'),
          where('eventId', '==', event.id),
          where('fromUid', '==', user.uid)
        );
        const likesSnap = await getDocs(qLikes);
        const userVoteMap = new Map<string, boolean>();
        likesSnap.forEach(d => {
          const data = d.data();
          if (data.toUid) {
            userVoteMap.set(data.toUid, data.liked === true);
          }
        });

        // 3. Filter candidates of opposite gender
        const list: Candidate[] = [];
        allSnap.forEach(d => {
          const data = d.data();
          if (data.uid === user.uid) return; // exclude self

          const cGender = (data.spol || '').trim().toUpperCase();
          const cIsFemale = cGender === 'Ž' || cGender === 'Z' || cGender === 'ŽENSKO' || cGender === 'ZENSKO';
          const cIsMale = cGender === 'M' || cGender === 'MUŠKO' || cGender === 'MUSKO';

          const cContactIg = data.contactInstagram || (data.contactHandle?.startsWith('@') ? data.contactHandle : '');
          const cContactPhone = data.contactPhone || (!data.contactHandle?.startsWith('@') && !isNaN(Number(data.contactHandle?.replace(/[\s+-]/g, ''))) ? data.contactHandle : '');

          const voteStatus: 'like' | 'pass' | 'unvoted' = userVoteMap.has(data.uid)
            ? (userVoteMap.get(data.uid) ? 'like' : 'pass')
            : 'unvoted';

          const candItem: Candidate = {
            id: d.id,
            ...(data as any),
            contactInstagram: cContactIg,
            contactPhone: cContactPhone,
            voteStatus
          };

          if (isMale && cIsFemale) {
            list.push(candItem);
          } else if (!isMale && cIsMale) {
            list.push(candItem);
          }
        });

        setCandidates(list);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Greška pri dohvaćanju kandidata:", err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, [user, event, myRegistration, hasConfirmedContact]);

  // Handle Contact Save / Update
  const handleSaveContact = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanIg = instagram.trim() ? (instagram.trim().startsWith('@') ? instagram.trim() : `@${instagram.trim()}`) : '';
    const cleanPhone = phone.trim();

    if (!cleanIg && !cleanPhone) {
      alert("Molimo unesite barem jedan kontakt podatak (Instagram ili broj mobitela).");
      return;
    }

    setSavingContact(true);
    try {
      const combinedHandle = [cleanIg, cleanPhone].filter(Boolean).join(' • ');

      // Save to registration
      if (myRegistration?.id) {
        await setDoc(doc(db, 'prijave', myRegistration.id), {
          contactInstagram: cleanIg,
          contactPhone: cleanPhone,
          contactHandle: combinedHandle
        }, { merge: true });
      }

      // Save to user profile so it's remembered everywhere
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          ...(cleanIg ? { instagram: cleanIg } : {}),
          ...(cleanPhone ? { phone: cleanPhone } : {}),
          updatedAt: new Date()
        }, { merge: true });
      }

      setHasConfirmedContact(true);
      setEditContactModalOpen(false);
    } catch (err) {
      console.error("Greška pri spremanju kontakta:", err);
      alert("Došlo je do greške prilikom spremanja kontakta.");
    } finally {
      setSavingContact(false);
    }
  };

  // Process Voting (Handles both Live & Post-Event phases)
  const handleVote = async (candidate: Candidate, liked: boolean) => {
    if (!user || !event || !myRegistration) return;

    // Optimistic state update
    setCandidates(prev => prev.map(c => {
      if (c.uid === candidate.uid) {
        return { ...c, voteStatus: liked ? 'like' : 'pass' };
      }
      return c;
    }));

    // User feedback toast
    if (liked) {
      if (event.matchingPhase === 'live') {
        setToastMessage("Sviđa ti se! Spremljeno u tajnosti do završetka susreta 🔒💖");
      } else {
        setToastMessage("Sviđa ti se! 💖");
      }
    } else {
      setToastMessage("Preskočeno ❌");
    }
    setTimeout(() => setToastMessage(null), 3000);

    try {
      // 1. Save vote in event_likes
      const myLikeDocId = `${event.id}_${user.uid}_${candidate.uid}`;
      await setDoc(doc(db, 'event_likes', myLikeDocId), {
        eventId: event.id,
        fromUid: user.uid,
        toUid: candidate.uid,
        fromPrijavaId: myRegistration.id,
        toPrijavaId: candidate.id,
        liked: liked,
        createdAt: serverTimestamp()
      });

      // 2. CRITICAL LOGIC:
      // During LIVE event phase: Absolutely NO match detection or notification is shown or emailed!
      // In POST-EVENT phase: Check reciprocal like and celebrate / notify male participant immediately!
      if (liked && event.matchingPhase === 'post_event') {
        const reciprocalLikeDocId = `${event.id}_${candidate.uid}_${user.uid}`;
        const reciprocalSnap = await getDoc(doc(db, 'event_likes', reciprocalLikeDocId));

        if (reciprocalSnap.exists() && reciprocalSnap.data()?.liked === true) {
          // IT'S A POST-EVENT MATCH! 🎉
          const myGender = (myRegistration.spol || '').trim().toUpperCase();
          const amIMale = myGender === 'M' || myGender === 'MUŠKO' || myGender === 'MUSKO';

          const maleUid = amIMale ? user.uid : candidate.uid;
          const femaleUid = amIMale ? candidate.uid : user.uid;

          const maleName = amIMale ? myRegistration.imePrezime : candidate.imePrezime;
          const femaleName = amIMale ? candidate.imePrezime : myRegistration.imePrezime;

          const maleEmail = amIMale ? (user.email || myRegistration.email) : candidate.email;
          const femaleEmail = amIMale ? candidate.email : (user.email || myRegistration.email);

          const myIg = instagram.trim() ? (instagram.trim().startsWith('@') ? instagram.trim() : `@${instagram.trim()}`) : '';
          const myPh = phone.trim();

          const candIg = candidate.contactInstagram || (candidate.contactHandle?.startsWith('@') ? candidate.contactHandle : '');
          const candPh = candidate.contactPhone || (!candidate.contactHandle?.startsWith('@') && !isNaN(Number(candidate.contactHandle?.replace(/[\s+-]/g, ''))) ? candidate.contactHandle : '');

          const maleInstagram = amIMale ? myIg : candIg;
          const malePhone = amIMale ? myPh : candPh;

          const femaleInstagram = amIMale ? candIg : myIg;
          const femalePhone = amIMale ? candPh : myPh;

          const maleContact = [maleInstagram, malePhone].filter(Boolean).join(' • ');
          const femaleContact = [femaleInstagram, femalePhone].filter(Boolean).join(' • ');

          const matchDocId = `${event.id}_${[maleUid, femaleUid].sort().join('_')}`;

          // Save match
          await setDoc(doc(db, 'event_matches', matchDocId), {
            eventId: event.id,
            eventTitle: event.title || 'Speed Dating',
            eventDate: event.dateStr || '',
            maleUid,
            femaleUid,
            maleName,
            femaleName,
            maleEmail,
            femaleEmail,
            maleInstagram,
            malePhone,
            maleContact,
            femaleInstagram,
            femalePhone,
            femaleContact,
            createdAt: serverTimestamp()
          }, { merge: true });

          const matchResult: MatchResult = {
            partnerName: candidate.imePrezime,
            partnerInstagram: candIg,
            partnerPhone: candPh,
            partnerContact: [candIg, candPh].filter(Boolean).join(' • '),
            partnerEmail: candidate.email,
            partnerGender: amIMale ? 'Ž' : 'M'
          };

          setNewMatch(matchResult);
          setSessionMatches(prev => [...prev, matchResult]);

          // Send email notification to male participant
          try {
            await sendMatchEmail({
              eventTitle: event.title || 'Speed Dating',
              maleName,
              femaleName,
              maleEmail,
              femaleEmail,
              femaleInstagram,
              femalePhone
            });
          } catch (emailErr) {
            console.error("Greška pri slanju emaila o matchu:", emailErr);
          }
        }
      }
    } catch (err) {
      console.error("Greška pri spremanju odabira:", err);
    }
  };

  // Handle Swipe in Card Deck mode
  const handleSwipeVote = async (liked: boolean) => {
    if (currentIndex >= filteredCandidates.length) return;
    const currentCandidate = filteredCandidates[currentIndex];

    setSwipeDirection(liked ? 'right' : 'left');

    setTimeout(async () => {
      await handleVote(currentCandidate, liked);
      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Greška pri prijavi:", err);
    }
  };

  // Loading screen
  if (authLoading || loadingEvent) {
    return (
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />
        <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white mx-auto flex items-center justify-center mb-6 shadow-md">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3 text-brand">Speed Dating Matching</h1>
          <p className="text-brand/80 mb-8 font-light text-sm leading-relaxed">
            Prijavi se sa svojim Google računom kako bi pristupio/la brzom odabiru simpatija s eventa!
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

  // Multiple events active and none selected
  if (!event && availableEvents.length > 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex justify-center items-center bg-peach text-brand font-sans">
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl max-w-lg w-full border border-white">
          <h2 className="text-2xl font-serif font-bold mb-4 text-brand text-center">Odaberi Speed Dating Događaj</h2>
          <p className="text-sm text-brand/70 text-center mb-6 font-light">
            Matching je trenutačno otvoren za sljedeće susrete. Odaberi onaj na kojem si sudjelovao/la:
          </p>
          <div className="space-y-3">
            {availableEvents.map(evt => (
              <button
                key={evt.id}
                onClick={() => setEvent(evt)}
                className="w-full p-4 rounded-2xl bg-white hover:bg-brand/5 border border-brand/10 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h3 className="font-serif font-bold text-brand group-hover:text-brand-light">{evt.title}</h3>
                  <p className="text-xs text-brand/60">{evt.dateStr} • {evt.location}</p>
                </div>
                <ChevronRight size={18} className="text-brand/40 group-hover:text-brand transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Access error or no event
  if (accessError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans">
        <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
            <Flame size={28} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-3 text-brand">Matching nije dostupan</h2>
          <p className="text-brand/80 mb-6 font-light text-sm leading-relaxed">
            {accessError || "Trenutno nema aktivnih matching sesija za odabrani događaj."}
          </p>
          <div className="flex flex-col gap-2">
            <Link 
              to="/profil" 
              className="w-full bg-brand text-white py-3 rounded-2xl font-semibold text-xs shadow-md hover:bg-brand-light transition-colors inline-block text-center"
            >
              Idi na svoj profil
            </Link>
            <Link 
              to="/" 
              className="text-xs text-brand/70 hover:text-brand transition-colors mt-2 text-center"
            >
              Povratak na naslovnicu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Access check loading
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60" />
      </div>
    );
  }

  // STEP 1: Confirm contact onboarding if user has none saved
  if (!hasConfirmedContact) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-8 flex justify-center items-center bg-peach text-brand font-sans relative overflow-hidden">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />
        
        <div className="bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-white relative z-10 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Sparkles size={28} />
            </div>
            <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {event.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand mt-1 mb-2">
              Tvoji kontakti za Match
            </h1>
            <p className="text-xs sm:text-sm text-brand/70 font-light leading-relaxed">
              Unesi svoj Instagram profil i/ili broj mobitela. Ove informacije dijelimo <strong>isključivo s osobom s kojom ostvariš obostrani match</strong>!
            </p>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand/80 mb-1.5 flex items-center gap-1.5">
                <FaInstagram size={14} className="text-pink-600" />
                Instagram (@profil)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-brand/50 text-sm font-medium">@</span>
                <input
                  type="text"
                  value={instagram.startsWith('@') ? instagram.slice(1) : instagram}
                  onChange={e => setInstagram(e.target.value ? (e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`) : '')}
                  placeholder="tvoje_korisnicko_ime"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white border border-brand/20 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none text-brand font-medium text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand/80 mb-1.5 flex items-center gap-1.5">
                <Phone size={14} className="text-green-600" />
                Broj mobitela (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Npr. 091 123 4567"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-brand/20 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none text-brand font-medium text-sm transition-all"
              />
            </div>

            <p className="text-[11px] text-brand/60 leading-relaxed font-light bg-brand/5 p-3 rounded-xl">
              💡 Možeš unijeti oba kontakta ili samo jedan. Podatak se sigurno sprema za ovaj i buduće susrete.
            </p>

            <button
              type="submit"
              disabled={savingContact}
              className="w-full bg-gradient-to-r from-rose-500 to-brand text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-rose-500/20 transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 text-sm mt-2"
            >
              {savingContact ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
              Započni Matching 💖
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/profil" className="text-xs text-brand/60 hover:text-brand transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={12} /> Odustani i idi u profil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter candidates according to Search and Active Tab
  const filteredCandidates = candidates.filter(c => {
    // Search query filter
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery) {
      const nameMatch = c.imePrezime.toLowerCase().includes(cleanQuery);
      const noteMatch = c.napomena?.toLowerCase().includes(cleanQuery);
      if (!nameMatch && !noteMatch) return false;
    }

    // Active tab filter
    if (activeTab === 'unvoted') {
      return c.voteStatus === 'unvoted';
    } else if (activeTab === 'liked') {
      return c.voteStatus === 'like';
    }
    return true; // 'all'
  });

  const unvotedCount = candidates.filter(c => c.voteStatus === 'unvoted').length;
  const likedCount = candidates.filter(c => c.voteStatus === 'like').length;
  const totalCount = candidates.length;

  const currentSwipeCandidate = filteredCandidates[currentIndex];
  const isSwipeFinished = currentIndex >= filteredCandidates.length;

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 flex flex-col items-center bg-peach text-brand font-sans relative overflow-x-hidden selection:bg-brand selection:text-white">
      
      {/* Decorative ambient background */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-rose-300/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-96 h-96 rounded-full bg-brand/10 blur-[100px] pointer-events-none" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-[80] bg-brand text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles size={14} className="text-rose-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="max-w-2xl w-full flex items-center justify-between mb-4 z-10">
        <Link 
          to="/profil" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand/70 hover:text-brand transition-colors bg-white/70 px-3 py-1.5 rounded-full border border-white shadow-xs"
        >
          <ArrowLeft size={14} /> Profil
        </Link>

        <div className="flex items-center gap-2">
          {/* Contact info quick badge */}
          <button
            onClick={() => setEditContactModalOpen(true)}
            className="text-[11px] font-medium text-brand/70 hover:text-brand bg-white/70 hover:bg-white px-2.5 py-1 rounded-full border border-white transition-all flex items-center gap-1 cursor-pointer"
            title="Klikni za izmjenu svojih kontakata"
          >
            <Edit3 size={11} className="text-rose-500" />
            <span className="hidden sm:inline">Moji kontakti:</span>
            <span className="font-semibold text-brand">{instagram || phone || 'Uredi kontakt'}</span>
          </button>

          {/* Event title */}
          <span className="text-xs font-bold text-brand/80 uppercase tracking-wider flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-white">
            <Flame size={13} className="text-rose-500" />
            <span className="hidden sm:inline">{event.title}</span>
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-2xl w-full relative z-10 space-y-4">
        
        {/* PHASE INFORMATIONAL BANNER */}
        {event.matchingPhase === 'live' ? (
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs leading-relaxed flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Lock size={15} />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                Matching UŽIVO je u tijeku! 🔴
              </p>
              <p className="text-amber-900/90 mt-0.5">
                Pronađi i označi simpatije odmah nakon razgovora. Tvoji odabiri su <strong>potpuno tajni</strong> i nitko ne zna jesi li ih označio/la tijekom večeri. Službeni matchevi i kontakti objavljuju se tek nakon završetka susreta!
              </p>
            </div>
          </div>
        ) : event.matchingPhase === 'post_event' ? (
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-brand text-xs leading-relaxed flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Heart size={15} className="fill-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-brand flex items-center gap-1.5">
                Susret je završen! Matchevi su objavljeni 💖
              </p>
              <p className="text-brand/80 mt-0.5">
                Sve matcheve iz noći možeš vidjeti na svom profilu. Ako nisi stigao/la ocijeniti sve sudionike tijekom večeri, ovdje možeš dovršiti ocjenjivanje preostalih osoba!
              </p>
            </div>
          </div>
        ) : null}

        {/* SEARCH & CONTROLS BAR */}
        <div className="bg-white/80 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl shadow-sm border border-white space-y-3">
          
          {/* Top row: Search input + View Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-brand/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="Brza pretraga po imenu..."
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white border border-brand/15 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none text-brand text-xs sm:text-sm font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-brand/40 hover:text-brand cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Mode Toggle: List vs Swipe */}
            <div className="flex items-center bg-brand/5 p-1 rounded-2xl border border-brand/10 flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-brand shadow-xs'
                    : 'text-brand/60 hover:text-brand'
                }`}
                title="Popis i brza pretraga"
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">Popis</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('swipe');
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'swipe'
                    ? 'bg-white text-brand shadow-xs'
                    : 'text-brand/60 hover:text-brand'
                }`}
                title="Swipe kartice"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Kartice</span>
              </button>
            </div>
          </div>

          {/* Filter Chips / Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('unvoted');
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'unvoted'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white text-brand/70 hover:bg-brand/5 border border-brand/10'
              }`}
            >
              Za ocijeniti ({unvotedCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white text-brand/70 hover:bg-brand/5 border border-brand/10'
              }`}
            >
              Svi sudionici ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('liked');
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'liked'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-brand/70 hover:bg-rose-50 border border-brand/10'
              }`}
            >
              Moje simpatije ({likedCount})
            </button>
          </div>

        </div>

        {/* LOADING STATE */}
        {loadingCandidates ? (
          <div className="py-20 text-center text-brand/60 flex flex-col items-center justify-center bg-white/50 rounded-3xl backdrop-blur-md">
            <Loader2 size={36} className="animate-spin mb-3 text-brand" />
            <p className="text-sm font-medium">Učitavanje sudionika...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          /* EMPTY FILTER RESULT */
          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-sm border border-white text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand mb-2">
              {activeTab === 'unvoted'
                ? "Svi sudionici su ocijenjeni! 🎉"
                : activeTab === 'liked'
                ? "Nema zabilježenih simpatija"
                : "Nema pronađenih sudionika"}
            </h3>
            <p className="text-brand/70 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed mb-6">
              {activeTab === 'unvoted'
                ? (event.matchingPhase === 'live' 
                    ? "Uspješno si pregledao/la sve osobe! Tvoji odabiri su zabilježeni, a matchevi će biti objavljeni po završetku eventa." 
                    : "Pregledao/la si sve sudionike za ovaj događaj. Čim druga strana također označi da joj se sviđaš, dobit ćeš obavijest!")
                : activeTab === 'liked'
                ? "Još nisi označio/la niti jednu osobu sa 'Sviđa mi se'."
                : "Pokušaj prilagoditi pojam pretrage ili odabrati drugu kategoriju."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {activeTab !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-brand-light transition-colors cursor-pointer"
                >
                  Prikaži sve sudionike
                </button>
              )}
              <Link
                to="/profil"
                className="px-4 py-2 bg-white text-brand/80 border border-brand/20 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Idi u profil
              </Link>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* MODE 1: LIST / DIRECTORY VIEW (Search friendly) */
          <div className="space-y-3">
            {filteredCandidates.map(candidate => (
              <div
                key={candidate.uid}
                className="bg-white/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-sm border border-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-brand-light text-white font-serif font-bold text-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    {candidate.imePrezime.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-brand">
                        {candidate.imePrezime}
                      </h3>
                      <span className="text-xs font-semibold text-brand/60">
                        {candidate.godine} god.
                      </span>
                    </div>

                    {candidate.napomena && (
                      <p className="text-xs text-brand/70 italic mt-0.5 line-clamp-2">
                        "{candidate.napomena}"
                      </p>
                    )}

                    {candidate.customAnswers && candidate.customAnswers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {candidate.customAnswers.slice(0, 2).map((ans, idx) => (
                          <span key={idx} className="text-[10px] bg-brand/5 text-brand/80 px-2 py-0.5 rounded-md font-medium border border-brand/10">
                            <strong>{ans.label}:</strong> {Array.isArray(ans.value) ? ans.value.join(', ') : String(ans.value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Voting status & Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                  {candidate.voteStatus === 'like' ? (
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-xs">
                        <Heart size={13} className="fill-rose-600 text-rose-600" />
                        Sviđa ti se
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVote(candidate, false)}
                        className="text-[11px] text-brand/50 hover:text-red-600 hover:underline px-1 cursor-pointer transition-colors"
                        title="Promijeni u preskočeno"
                      >
                        Promijeni
                      </button>
                    </div>
                  ) : candidate.voteStatus === 'pass' ? (
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5">
                        <X size={13} />
                        Preskočeno
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVote(candidate, true)}
                        className="text-[11px] text-rose-600 hover:underline px-1 font-semibold cursor-pointer transition-colors"
                        title="Promijeni u sviđa mi se"
                      >
                        Sviđa mi se ipak 💖
                      </button>
                    </div>
                  ) : (
                    /* UNVOTED BUTTONS */
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(candidate, false)}
                        className="px-3.5 py-2 rounded-2xl border border-gray-200 hover:border-red-300 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        title="Preskoči"
                      >
                        <X size={14} />
                        <span>Ne</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote(candidate, true)}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-brand hover:from-rose-600 hover:to-brand-light text-white text-xs font-bold shadow-md hover:shadow-rose-500/20 transition-all transform hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
                        title="Sviđa mi se!"
                      >
                        <Heart size={14} className="fill-white" />
                        <span>Sviđa mi se!</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* MODE 2: SWIPE CARDS (Classic deck view) */
          <div className="max-w-md mx-auto w-full">
            {isSwipeFinished ? (
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand mb-2">
                  Sve kartice su pregledane! 🥂
                </h3>
                <p className="text-xs sm:text-sm text-brand/70 font-light leading-relaxed mb-6">
                  {event.matchingPhase === 'live'
                    ? "Tvoji odabiri su zabilježeni. Matchevi će biti objavljeni nakon završetka susreta!"
                    : "Svi sudionici iz ovog odabira su ocijenjeni."}
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setActiveTab('all');
                    }}
                    className="w-full bg-brand text-white py-3 rounded-2xl font-semibold text-xs shadow-md hover:bg-brand-light transition-colors cursor-pointer"
                  >
                    Otvori popis svih sudionika
                  </button>
                  <Link
                    to="/profil"
                    className="inline-block text-xs text-brand/60 hover:text-brand transition-colors pt-2"
                  >
                    Idi na svoj profil
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-brand/60 mb-2 px-2 font-medium">
                  <span>Preostalo za pregled:</span>
                  <span className="bg-white/80 px-2.5 py-0.5 rounded-full border border-white shadow-xs font-bold text-brand">
                    {currentIndex + 1} / {filteredCandidates.length}
                  </span>
                </div>

                {/* The Active Swipe Card */}
                <div 
                  className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden transition-all duration-300 transform select-none ${
                    swipeDirection === 'left' ? '-translate-x-32 rotate-[-12deg] opacity-0' : ''
                  } ${
                    swipeDirection === 'right' ? 'translate-x-32 rotate-[12deg] opacity-0' : ''
                  }`}
                >
                  {/* Top Gradient Banner */}
                  <div className="h-32 bg-gradient-to-tr from-brand to-brand-light relative flex items-center justify-center p-6 text-white overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl" />
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-serif font-bold shadow-inner">
                      {currentSwipeCandidate.imePrezime.charAt(0)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand">
                          {currentSwipeCandidate.imePrezime}
                        </h3>
                        <span className="text-2xl font-serif font-semibold text-brand/80">
                          {currentSwipeCandidate.godine} god.
                        </span>
                      </div>
                      <p className="text-xs text-brand/60 mt-1 flex items-center gap-1">
                        <Calendar size={12} className="text-brand-light" /> Sudionik susreta {event.title}
                      </p>
                    </div>

                    {currentSwipeCandidate.napomena && (
                      <div className="p-3.5 rounded-2xl bg-peach/60 border border-brand/10 text-xs text-brand/80 leading-relaxed italic">
                        "{currentSwipeCandidate.napomena}"
                      </div>
                    )}

                    {currentSwipeCandidate.customAnswers && currentSwipeCandidate.customAnswers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-brand/10">
                        {currentSwipeCandidate.customAnswers.slice(0, 2).map((ans, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-semibold text-brand/70 block">{ans.label}:</span>
                            <span className="text-brand font-medium">
                              {Array.isArray(ans.value) ? ans.value.join(', ') : String(ans.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 pt-0 flex items-center justify-center gap-8">
                    {/* Pass Button */}
                    <button
                      type="button"
                      onClick={() => handleSwipeVote(false)}
                      className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
                      title="Preskoči"
                    >
                      <X size={28} className="group-hover:stroke-[3]" />
                    </button>

                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => handleSwipeVote(true)}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-brand hover:from-rose-600 hover:to-brand-light text-white shadow-xl hover:shadow-rose-500/30 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
                      title="Sviđa mi se!"
                    >
                      <Heart size={36} className="fill-white group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* EDIT CONTACT MODAL */}
      {editContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white relative animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-xl text-brand">Ažuriraj kontakte</h3>
              <button
                onClick={() => setEditContactModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-brand/70 mb-4 leading-relaxed">
              Ovi podaci se dijele isključivo s osobama s kojima ostvariš obostrani match.
            </p>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand/80 mb-1 flex items-center gap-1.5">
                  <FaInstagram size={13} className="text-pink-600" /> Instagram (@profil)
                </label>
                <input
                  type="text"
                  value={instagram.startsWith('@') ? instagram.slice(1) : instagram}
                  onChange={e => setInstagram(e.target.value ? (e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`) : '')}
                  placeholder="tvoje_korisnicko_ime"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand/20 text-brand text-sm focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand/80 mb-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-green-600" /> Broj mobitela (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Npr. 091 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand/20 text-brand text-sm focus:border-brand outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditContactModalOpen(false)}
                  className="px-4 py-2 text-xs text-brand/60 hover:text-brand font-medium cursor-pointer"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2 bg-brand text-white rounded-xl text-xs font-semibold shadow-md hover:bg-brand-light transition-colors cursor-pointer"
                >
                  {savingContact ? <Loader2 size={14} className="animate-spin" /> : 'Spremi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CELEBRATORY MATCH MODAL (Triggered ONLY in post_event phase!) */}
      {newMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl border border-white text-center animate-scale-up relative overflow-hidden">
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-brand text-white flex items-center justify-center mx-auto mb-4 shadow-xl animate-bounce-gentle">
              <Heart size={40} className="fill-white" />
            </div>

            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              🎉 Imate Match!
            </span>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand mb-2">
              Obostrana simpatija!
            </h3>

            <p className="text-sm text-brand/80 mb-6 font-light leading-relaxed">
              I ti i <strong>{newMatch.partnerName}</strong> ste označili da se jedno drugom sviđate!
            </p>

            {/* Contact Reveal */}
            <div className="p-4 rounded-2xl bg-peach/80 border border-brand/10 text-left mb-6 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand/60 block mb-1">
                Kontakt za javljanje:
              </span>
              {newMatch.partnerInstagram && (
                <div className="text-sm font-semibold text-brand flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FaInstagram size={16} className="text-pink-600 flex-shrink-0" />
                    <span>{newMatch.partnerInstagram}</span>
                  </span>
                  <a
                    href={`https://instagram.com/${newMatch.partnerInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand font-bold hover:underline"
                  >
                    Otvori IG
                  </a>
                </div>
              )}
              {newMatch.partnerPhone && (
                <div className="text-sm font-semibold text-brand flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Phone size={16} className="text-green-600 flex-shrink-0" />
                    <span>{newMatch.partnerPhone}</span>
                  </span>
                  <a
                    href={`tel:${newMatch.partnerPhone}`}
                    className="text-xs text-brand font-bold hover:underline"
                  >
                    Nazovi
                  </a>
                </div>
              )}
              {!newMatch.partnerInstagram && !newMatch.partnerPhone && newMatch.partnerContact && (
                <div className="text-sm font-semibold text-brand flex items-center gap-2">
                  <span>{newMatch.partnerContact}</span>
                </div>
              )}
              {newMatch.partnerEmail && (
                <div className="text-xs text-brand/70 flex items-center gap-2 pt-1 border-t border-brand/10">
                  <Mail size={14} className="text-brand-light flex-shrink-0" />
                  <span>{newMatch.partnerEmail}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setNewMatch(null)}
              className="w-full bg-gradient-to-r from-rose-500 to-brand text-white font-semibold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer text-sm"
            >
              Nastavi s odabirom ✨
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
