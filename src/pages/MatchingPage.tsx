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
  Phone
} from 'lucide-react';
import { FaInstagram, FaGoogle } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

interface EventItem {
  id: string;
  title: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  isMatchingActive?: boolean;
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

  // Step 1: Contact info onboarding (both Instagram and Phone)
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [hasConfirmedContact, setHasConfirmedContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Step 2: Candidates & Swiping
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Swiping animations
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Match celebration modal
  const [newMatch, setNewMatch] = useState<MatchResult | null>(null);
  const [sessionMatches, setSessionMatches] = useState<MatchResult[]>([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Pre-fill contact handle from profile if existing
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
          console.error("Greška pri dohvaćanju korisnika:", e);
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
          setAccessError("Matching za ovaj događaj trenutno nije aktivan. Administrator će ga aktivirati nakon završetka susreta.");
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

        if (regData.contactInstagram) {
          setInstagram(regData.contactInstagram.startsWith('@') ? regData.contactInstagram : `@${regData.contactInstagram}`);
        }
        if (regData.contactPhone) {
          setPhone(regData.contactPhone);
        }
        if (!regData.contactInstagram && !regData.contactPhone && regData.contactHandle) {
          if (regData.contactHandle.startsWith('@')) {
            setInstagram(regData.contactHandle);
          } else {
            setPhone(regData.contactHandle);
          }
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

  // 4. Fetch Candidates once contact is confirmed
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
        const alreadyVotedTargetUids = new Set<string>();
        likesSnap.forEach(d => {
          const data = d.data();
          if (data.toUid) alreadyVotedTargetUids.add(data.toUid);
        });

        // 3. Filter candidates
        const list: Candidate[] = [];
        allSnap.forEach(d => {
          const data = d.data();
          // Exclude self
          if (data.uid === user.uid) return;

          // Exclude already voted
          if (alreadyVotedTargetUids.has(data.uid)) return;

          // Match opposite gender
          const cGender = (data.spol || '').trim().toUpperCase();
          const cIsFemale = cGender === 'Ž' || cGender === 'Z' || cGender === 'ŽENSKO' || cGender === 'ZENSKO';
          const cIsMale = cGender === 'M' || cGender === 'MUŠKO' || cGender === 'MUSKO';

          const cContactIg = data.contactInstagram || (data.contactHandle?.startsWith('@') ? data.contactHandle : '');
          const cContactPhone = data.contactPhone || (!data.contactHandle?.startsWith('@') && !isNaN(Number(data.contactHandle?.replace(/[\s+-]/g, ''))) ? data.contactHandle : '');

          if (isMale && cIsFemale) {
            list.push({ 
              id: d.id, 
              ...(data as any),
              contactInstagram: cContactIg,
              contactPhone: cContactPhone
            });
          } else if (!isMale && cIsMale) {
            list.push({ 
              id: d.id, 
              ...(data as any),
              contactInstagram: cContactIg,
              contactPhone: cContactPhone
            });
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

  // Handle Contact Confirmation
  const handleConfirmContact = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      console.error("Greška pri spremanju kontakta:", err);
      alert("Došlo je do greške prilikom spremanja kontakta.");
    } finally {
      setSavingContact(false);
    }
  };

  // Check and Notify Match
  const processMatchDetection = async (candidate: Candidate) => {
    if (!user || !event || !myRegistration) return;

    try {
      // 1. Save my like
      const myLikeDocId = `${event.id}_${user.uid}_${candidate.uid}`;
      await setDoc(doc(db, 'event_likes', myLikeDocId), {
        eventId: event.id,
        fromUid: user.uid,
        toUid: candidate.uid,
        fromPrijavaId: myRegistration.id,
        toPrijavaId: candidate.id,
        liked: true,
        createdAt: serverTimestamp()
      });

      // 2. Check if candidate previously liked me
      const reciprocalLikeDocId = `${event.id}_${candidate.uid}_${user.uid}`;
      const reciprocalSnap = await getDoc(doc(db, 'event_likes', reciprocalLikeDocId));

      if (reciprocalSnap.exists() && reciprocalSnap.data()?.liked === true) {
        // IT'S A MATCH! 🎉
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

        // Save to event_matches
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
        });

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

        // Send Email to Male Person as requested
        try {
          const matchHtmlMessage = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Dragi <strong>${maleName.split(' ')[0]}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${event.title}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${femaleName.split(' ')[0]} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${femaleName}</p>
    ${femaleInstagram ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${femaleInstagram.replace('@', '')}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${femaleInstagram.startsWith('@') ? femaleInstagram : '@' + femaleInstagram}</a></p>` : ''}
    ${femalePhone ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${femalePhone}" style="color: #333333; font-weight: bold;">${femalePhone}</a></p>` : ''}
    ${femaleEmail ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${femaleEmail}" style="color: #666666;">${femaleEmail}</a></p>` : ''}
  </div>

  <p style="font-size: 15px;">Vrijeme je da napraviš prvi korak, pošalješ poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">Srdačan pozdrav,<br/><strong style="color: #333333;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.</p>
  </div>
</div>
          `;

          await emailjs.send(
            'default_service',
            'template_uuvkcp3',
            {
              name: maleName.split(' ')[0],
              email: maleEmail,
              subject: "Pronađen je novi Match! 💖 | Na prvi pogled",
              html_message: matchHtmlMessage
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
        } catch (emailErr) {
          console.error("Greška pri slanju emaila o matchu:", emailErr);
        }
      }
    } catch (err) {
      console.error("Greška pri obradi odabira:", err);
    }
  };

  // Handle Swipe/Action
  const handleVote = async (liked: boolean) => {
    if (currentIndex >= candidates.length) return;
    const currentCandidate = candidates[currentIndex];

    // Trigger visual swipe animation
    setSwipeDirection(liked ? 'right' : 'left');

    setTimeout(async () => {
      if (liked) {
        await processMatchDetection(currentCandidate);
      } else {
        // Save pass vote
        if (user && event && myRegistration) {
          try {
            const myLikeDocId = `${event.id}_${user.uid}_${currentCandidate.uid}`;
            await setDoc(doc(db, 'event_likes', myLikeDocId), {
              eventId: event.id,
              fromUid: user.uid,
              toUid: currentCandidate.uid,
              fromPrijavaId: myRegistration.id,
              toPrijavaId: currentCandidate.id,
              liked: false,
              createdAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Greška pri spremanju pass odabira:", err);
          }
        }
      }

      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 280);
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Greška pri prijavi:", err);
    }
  };

  // Loading state
  if (authLoading || loadingEvent) {
    return (
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60" />
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl animate-ambient-drift pointer-events-none" />
        <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white mx-auto flex items-center justify-center mb-6 shadow-md">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3 text-brand">Speed Dating Matching</h1>
          <p className="text-brand/80 mb-8 font-light text-sm leading-relaxed">
            Prijavi se sa svojim računom kako bi potvrdio/la svoj identitet i započeo/la odabir simpatija s eventa!
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

  // If multiple events are open for matching and user hasn't selected one
  if (!event && availableEvents.length > 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex justify-center items-center bg-peach text-brand font-sans">
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl max-w-lg w-full border border-white">
          <h2 className="text-2xl font-serif font-bold mb-4 text-brand text-center">Odaberi Speed Dating Događaj</h2>
          <p className="text-sm text-brand/70 text-center mb-6 font-light">
            Matching je trenutačno aktivan za sljedeće događaje. Odaberi onaj na kojem si sudjelovao/la:
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

  // If no event found or access error
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
              className="w-full bg-brand text-white py-3 rounded-2xl font-semibold text-xs shadow-md hover:bg-brand-light transition-colors inline-block"
            >
              Idi na svoj profil
            </Link>
            <Link 
              to="/" 
              className="text-xs text-brand/70 hover:text-brand transition-colors mt-2"
            >
              Povratak na naslovnicu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Checking eligibility loading
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-peach text-brand flex items-center justify-center font-sans">
        <Loader2 size={36} className="animate-spin text-brand/60" />
      </div>
    );
  }

  // STEP 1: Confirm contact info (Instagram or Phone) before matching
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

          <form onSubmit={handleConfirmContact} className="space-y-4">
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
              💡 Možeš unijeti <strong>oba kontakta</strong> ili samo jedan. Preuzeti su iz tvog profila ako si ih već ranije spremio/la.
            </p>

            <button
              type="submit"
              disabled={savingContact}
              className="w-full bg-gradient-to-r from-rose-500 to-brand text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-rose-500/20 transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 text-sm mt-2"
            >
              {savingContact ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
              Započni Speed Dating Matching 💖
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

  // STEP 2: Candidates Loading
  if (loadingCandidates) {
    return (
      <div className="min-h-screen bg-peach text-brand flex flex-col items-center justify-center font-sans">
        <Loader2 size={40} className="animate-spin text-brand mb-3" />
        <p className="text-sm font-medium text-brand/70">Učitavanje sudionika za matching...</p>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];
  const isFinished = currentIndex >= candidates.length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 flex flex-col items-center justify-center bg-peach text-brand font-sans relative overflow-x-hidden selection:bg-brand selection:text-white">
      
      {/* Decorative ambient lighting */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-rose-300/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-96 h-96 rounded-full bg-brand/10 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="max-w-md w-full flex items-center justify-between mb-6 z-10">
        <Link 
          to="/profil" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand/70 hover:text-brand transition-colors bg-white/60 px-3 py-1.5 rounded-full border border-white shadow-xs"
        >
          <ArrowLeft size={14} /> Moj Profil
        </Link>
        <span className="text-xs font-bold text-brand/60 uppercase tracking-wider flex items-center gap-1">
          <Flame size={14} className="text-rose-500" /> {event.title}
        </span>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-md w-full relative z-10">

        {/* FINISHED STATE */}
        {isFinished ? (
          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <PartyPopper size={36} />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand mb-2">
              Svi sudionici su pregledani! 🥂
            </h2>
            <p className="text-brand/80 text-sm font-light leading-relaxed mb-6">
              Uspješno si pregledao/la sve osobe za ovaj događaj. Čim druga osoba također označi da joj se sviđaš, bit ćeš obaviješten/a!
            </p>

            {/* Session matches summary */}
            {sessionMatches.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                  <Heart size={14} className="fill-rose-600 text-rose-600" />
                  Ostvareni matchevi na ovom susretu ({sessionMatches.length}):
                </h4>
                <div className="space-y-1.5">
                  {sessionMatches.map((m, idx) => (
                    <div key={idx} className="text-xs font-medium text-brand flex items-center justify-between">
                      <span>{m.partnerName}</span>
                      <span className="text-rose-600 font-bold">{m.partnerContact || m.partnerEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Link
                to="/profil"
                className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg transition-all inline-flex justify-center items-center gap-2 text-sm"
              >
                <Heart size={16} className="fill-white" />
                Pogledaj sve matcheve u Profilu
              </Link>
              <Link
                to="/"
                className="inline-block text-xs text-brand/60 hover:text-brand transition-colors pt-2"
              >
                Povratak na naslovnicu
              </Link>
            </div>
          </div>
        ) : (
          /* TINDER CARD STACK */
          <div className="relative">
            
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-brand/60 mb-3 px-2 font-medium">
              <span>Preostalo za pregled:</span>
              <span className="bg-white/80 px-2.5 py-0.5 rounded-full border border-white shadow-xs font-bold text-brand">
                {currentIndex + 1} / {candidates.length}
              </span>
            </div>

            {/* The Active Card */}
            <div 
              className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden transition-all duration-300 transform select-none ${
                swipeDirection === 'left' ? '-translate-x-32 rotate-[-12deg] opacity-0' : ''
              } ${
                swipeDirection === 'right' ? 'translate-x-32 rotate-[12deg] opacity-0' : ''
              }`}
            >
              {/* Top Banner Gradient with Gender Color Accent */}
              <div className="h-32 bg-gradient-to-tr from-brand to-brand-light relative flex items-center justify-center p-6 text-white overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl" />
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-serif font-bold shadow-inner">
                  {currentCandidate.imePrezime.charAt(0)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand">
                      {currentCandidate.imePrezime}
                    </h3>
                    <span className="text-2xl font-serif font-semibold text-brand/80">
                      {currentCandidate.godine} god.
                    </span>
                  </div>
                  <p className="text-xs text-brand/60 mt-1 flex items-center gap-1">
                    <Calendar size={12} className="text-brand-light" /> Sudionik događaja {event.title}
                  </p>
                </div>

                {/* Candidate bio / answers if available */}
                {currentCandidate.napomena && (
                  <div className="p-3.5 rounded-2xl bg-peach/60 border border-brand/10 text-xs text-brand/80 leading-relaxed italic">
                    "{currentCandidate.napomena}"
                  </div>
                )}

                {/* Custom questions answered by candidate */}
                {currentCandidate.customAnswers && currentCandidate.customAnswers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-brand/10">
                    {currentCandidate.customAnswers.slice(0, 2).map((ans, idx) => (
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

              {/* ACTION BUTTONS (NO & LIKE) */}
              <div className="p-6 pt-0 flex items-center justify-center gap-8">
                
                {/* PASS BUTTON (❌) */}
                <button
                  type="button"
                  onClick={() => handleVote(false)}
                  className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
                  title="Ne / Preskoči"
                >
                  <X size={28} className="group-hover:stroke-[3]" />
                </button>

                {/* LIKE BUTTON (💖) */}
                <button
                  type="button"
                  onClick={() => handleVote(true)}
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

      {/* CELEBRATORY MATCH MODAL */}
      {newMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl border border-white text-center animate-scale-up relative overflow-hidden">
            
            {/* Ambient burst */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand/20 rounded-full blur-3xl pointer-events-none" />

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
