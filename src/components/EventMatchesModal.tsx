import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Heart,
  Users,
  Send,
  Loader2,
  RefreshCw,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  Check,
  Info
} from 'lucide-react';
import { collection, getDocs, query, where, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendMatchEmail } from '../utils/matchingEmails';
import type { EventData, Prijava } from '../pages/AdminDashboard';

function parseContactHandle(p?: Prijava | null) {
  if (!p) return { instagram: '', phone: '' };
  let ig = p.contactInstagram || '';
  let ph = p.contactPhone || '';

  if (!ig && !ph && p.contactHandle) {
    const raw = p.contactHandle.trim();
    if (raw.startsWith('@')) {
      ig = raw;
    } else {
      const digitsOnly = raw.replace(/[\s+\-()\/]/g, '');
      if (digitsOnly.length >= 6 && !isNaN(Number(digitsOnly))) {
        ph = raw;
      } else {
        ig = `@${raw}`;
      }
    }
  }
  return { instagram: ig, phone: ph };
}

interface EventMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  prijave?: Prijava[];
  onResendEmail?: (match: any) => Promise<void>;
}

export const EventMatchesModal: React.FC<EventMatchesModalProps> = ({
  isOpen,
  onClose,
  event,
  prijave: initialPrijave,
  onResendEmail
}) => {
  // Modal Navigation
  const [activeTab, setActiveTab] = useState<'matches' | 'votes'>('matches');
  const [votesViewMode, setVotesViewMode] = useState<'by_person' | 'all_votes'>('by_person');

  // Raw fetched data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [likesList, setLikesList] = useState<any[]>([]);
  const [participantsList, setParticipantsList] = useState<Prijava[]>([]);

  // Filtering & Search
  const [matchesSearchTerm, setMatchesSearchTerm] = useState('');
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [personGenderFilter, setPersonGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [personVotesDirection, setPersonVotesDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [allVotesFilter, setAllVotesFilter] = useState<'all' | 'likes' | 'dislikes' | 'mutual'>('all');
  const [allVotesSearchTerm, setAllVotesSearchTerm] = useState('');

  // Actions state: saving matches & sending emails
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [resendingMatchId, setResendingMatchId] = useState<string | null>(null);
  const [actionResultMsg, setActionResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all matches, likes, and participants
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const qMatches = query(collection(db, 'event_matches'), where('eventId', '==', event.id));
      const qLikes = query(collection(db, 'event_likes'), where('eventId', '==', event.id));
      const qPrijave = query(collection(db, 'prijave'), where('eventId', '==', event.id));

      const [snapMatches, snapLikes, snapPrijave] = await Promise.all([
        getDocs(qMatches),
        getDocs(qLikes),
        getDocs(qPrijave)
      ]);

      const matches = snapMatches.docs.map(d => ({ id: d.id, ...d.data() }));
      const likes = snapLikes.docs.map(d => ({ id: d.id, ...d.data() }));
      const prijave = snapPrijave.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Prijava[];

      setMatchesList(matches);
      setLikesList(likes);
      // If prijave from Firestore is empty, fallback to initialPrijave
      setParticipantsList(prijave.length > 0 ? prijave : (initialPrijave || []));
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka za matcheve i glasove:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [event.id, initialPrijave]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setActiveTab('matches'); // Default to matches view
      setMatchesSearchTerm('');
      setSelectedPersonId(null);
      setAllVotesFilter('all');
      setAllVotesSearchTerm('');
    }
  }, [isOpen, fetchData]);

  // Accepted participants for this event
  const acceptedParticipants = useMemo(() => {
    const accepted = participantsList.filter(p => p.status === 'accepted');
    return accepted.length > 0 ? accepted : participantsList.filter(p => p.status !== 'rejected' && p.status !== 'cancelled');
  }, [participantsList]);

  // Lists by gender
  const femaleList = useMemo(() => {
    return acceptedParticipants
      .filter(p => p.spol === 'Ž' || p.spol?.toLowerCase() === 'žensko')
      .sort((a, b) => (a.imePrezime || '').localeCompare(b.imePrezime || '', 'hr'));
  }, [acceptedParticipants]);

  const maleList = useMemo(() => {
    return acceptedParticipants
      .filter(p => p.spol === 'M' || p.spol?.toLowerCase() === 'muško')
      .sort((a, b) => (a.imePrezime || '').localeCompare(b.imePrezime || '', 'hr'));
  }, [acceptedParticipants]);

  // Badge mapping for consistent Ž-1..N and M-1..N numbers
  const badgeMap = useMemo(() => {
    const map = new Map<string, string>();
    femaleList.forEach((p, idx) => {
      map.set(p.id, `Ž-${idx + 1}`);
      if (p.uid) map.set(p.uid, `Ž-${idx + 1}`);
    });
    maleList.forEach((p, idx) => {
      map.set(p.id, `M-${idx + 1}`);
      if (p.uid) map.set(p.uid, `M-${idx + 1}`);
    });
    return map;
  }, [femaleList, maleList]);

  // Helper lookup for participants
  const participantLookup = useMemo(() => {
    const byId = new Map<string, Prijava>();
    const byUid = new Map<string, Prijava>();
    participantsList.forEach(p => {
      byId.set(p.id, p);
      if (p.uid) byUid.set(p.uid, p);
    });
    return {
      get: (uid?: string, prijavaId?: string): Prijava | null => {
        if (prijavaId && byId.has(prijavaId)) return byId.get(prijavaId)!;
        if (uid && byUid.has(uid)) return byUid.get(uid)!;
        return null;
      }
    };
  }, [participantsList]);

  // Positive likes pairs set: "fromUid->toUid"
  const positiveLikesSet = useMemo(() => {
    const set = new Set<string>();
    likesList.forEach(l => {
      if (l.liked === true) {
        let fromU = l.fromUid;
        let toU = l.toUid;
        if (!fromU && l.fromPrijavaId) fromU = participantLookup.get(undefined, l.fromPrijavaId)?.uid;
        if (!toU && l.toPrijavaId) toU = participantLookup.get(undefined, l.toPrijavaId)?.uid;
        if (fromU && toU) {
          set.add(`${fromU}->${toU}`);
        }
      }
    });
    return set;
  }, [likesList, participantLookup]);

  // Mutual likes check
  const isMutualLike = useCallback((fromUid?: string, toUid?: string) => {
    if (!fromUid || !toUid) return false;
    return positiveLikesSet.has(`${fromUid}->${toUid}`) && positiveLikesSet.has(`${toUid}->${fromUid}`);
  }, [positiveLikesSet]);

  // Map of matches already saved in Firestore event_matches collection
  const savedMatchesByPair = useMemo(() => {
    const map = new Map<string, any>();
    matchesList.forEach(m => {
      if (m.maleUid && m.femaleUid) {
        map.set([m.maleUid, m.femaleUid].sort().join('_'), m);
      }
      if (m.id) {
        map.set(m.id, m);
        const strippedId = m.id.replace(`${event.id}_`, '');
        map.set(strippedId, m);
      }
    });
    return map;
  }, [matchesList, event.id]);

  // Derived or combined mutual matches (incorporates both published/saved matches and live/post-event detected matches)
  const allMatches = useMemo(() => {
    const pairs: any[] = [];
    const processedPairs = new Set<string>();

    // 1. Process all mutual likes detected from event_likes
    positiveLikesSet.forEach(key => {
      const [u1, u2] = key.split('->');
      const reciprocalKey = `${u2}->${u1}`;
      const pairId = [u1, u2].sort().join('_');

      if (positiveLikesSet.has(reciprocalKey) && !processedPairs.has(pairId)) {
        processedPairs.add(pairId);
        const p1 = participantLookup.get(u1);
        const p2 = participantLookup.get(u2);

        const g1 = (p1?.spol || '').trim().toUpperCase();
        const p1IsMale = g1 === 'M' || g1 === 'MUŠKO' || g1 === 'MUSKO';
        const male = p1IsMale ? p1 : p2;
        const female = p1IsMale ? p2 : p1;

        const maleUid = male?.uid || (p1IsMale ? u1 : u2);
        const femaleUid = female?.uid || (p1IsMale ? u2 : u1);

        const docKey = `${event.id}_${pairId}`;
        const existingDbMatch = savedMatchesByPair.get(pairId) || 
                               savedMatchesByPair.get(docKey) || 
                               savedMatchesByPair.get([maleUid, femaleUid].sort().join('_'));

        const isSavedInDb = !!existingDbMatch;

        const mContacts = parseContactHandle(male);
        const fContacts = parseContactHandle(female);

        const maleInstagram = mContacts.instagram || existingDbMatch?.maleInstagram || '';
        const malePhone = mContacts.phone || existingDbMatch?.malePhone || '';
        const femaleInstagram = fContacts.instagram || existingDbMatch?.femaleInstagram || '';
        const femalePhone = fContacts.phone || existingDbMatch?.femalePhone || '';

        const maleContact = [maleInstagram, malePhone].filter(Boolean).join(' • ') || male?.email || existingDbMatch?.maleContact || '';
        const femaleContact = [femaleInstagram, femalePhone].filter(Boolean).join(' • ') || female?.email || existingDbMatch?.femaleContact || '';

        pairs.push({
          id: existingDbMatch?.id || docKey,
          dbDocId: existingDbMatch?.id,
          pairId,
          eventId: event.id,
          eventTitle: event.title || 'Speed Dating',
          eventDate: event.dateStr || '',
          maleUid,
          femaleUid,
          malePrijavaId: male?.id,
          femalePrijavaId: female?.id,
          maleName: male?.imePrezime || existingDbMatch?.maleName || 'Sudionik',
          femaleName: female?.imePrezime || existingDbMatch?.femaleName || 'Sudionica',
          maleEmail: (male?.email || existingDbMatch?.maleEmail || '').trim(),
          femaleEmail: (female?.email || existingDbMatch?.femaleEmail || '').trim(),
          maleInstagram,
          malePhone,
          maleContact,
          femaleInstagram,
          femalePhone,
          femaleContact,
          isSavedInDb,
          emailSent: existingDbMatch?.emailSent === true,
          emailSentAt: existingDbMatch?.emailSentAt,
          createdAt: existingDbMatch?.createdAt
        });
      }
    });

    // 2. Include any matches that were in matchesList from DB but pair wasn't yet in processedPairs
    matchesList.forEach(m => {
      const pairId = m.maleUid && m.femaleUid ? [m.maleUid, m.femaleUid].sort().join('_') : m.id.replace(`${event.id}_`, '');
      if (!processedPairs.has(pairId)) {
        processedPairs.add(pairId);
        pairs.push({
          ...m,
          dbDocId: m.id,
          pairId,
          isSavedInDb: true,
          emailSent: m.emailSent === true
        });
      }
    });

    return pairs;
  }, [positiveLikesSet, savedMatchesByPair, matchesList, event.id, event.title, event.dateStr, participantLookup]);

  // Unsaved and saved match counts
  const unsavedMatches = useMemo(() => {
    return allMatches.filter(m => !m.isSavedInDb);
  }, [allMatches]);

  const savedMatchesCount = useMemo(() => {
    return allMatches.filter(m => m.isSavedInDb).length;
  }, [allMatches]);

  // Function to save a single match in event_matches and optionally send email
  const saveSingleMatch = async (m: any, sendEmail = true) => {
    const pairKey = m.pairId || [m.maleUid, m.femaleUid].sort().join('_');
    const matchDocId = m.dbDocId || `${event.id}_${pairKey}`;

    const matchData = {
      eventId: event.id,
      eventTitle: m.eventTitle || event.title || 'Speed Dating',
      eventDate: m.eventDate || event.dateStr || '',
      maleUid: m.maleUid || '',
      femaleUid: m.femaleUid || '',
      maleName: m.maleName || 'Sudionik',
      femaleName: m.femaleName || 'Sudionica',
      maleEmail: (m.maleEmail || '').trim(),
      femaleEmail: (m.femaleEmail || '').trim(),
      maleInstagram: m.maleInstagram || '',
      malePhone: m.malePhone || '',
      maleContact: m.maleContact || '',
      femaleInstagram: m.femaleInstagram || '',
      femalePhone: m.femalePhone || '',
      femaleContact: m.femaleContact || '',
      emailSent: m.emailSent === true,
      createdAt: m.createdAt || serverTimestamp(),
      recordedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'event_matches', matchDocId), matchData, { merge: true });

    let emailSent = false;
    if (sendEmail && m.maleEmail) {
      try {
        await sendMatchEmail({
          eventTitle: m.eventTitle || event.title || 'Speed Dating',
          maleName: m.maleName,
          femaleName: m.femaleName,
          maleEmail: m.maleEmail,
          femaleEmail: m.femaleEmail,
          femaleInstagram: m.femaleInstagram,
          femalePhone: m.femalePhone
        });
        emailSent = true;
        await updateDoc(doc(db, 'event_matches', matchDocId), {
          emailSent: true,
          emailSentAt: serverTimestamp()
        });
      } catch (emailErr) {
        console.error(`Greška pri slanju emaila na ${m.maleEmail}:`, emailErr);
      }
    }

    return { success: true, emailSent };
  };

  // Mass save all unsaved matches and send emails to male participants
  const handleSaveAllUnrecordedMatches = async () => {
    if (unsavedMatches.length === 0) return;
    setBatchSaving(true);
    setBatchProgress({ current: 0, total: unsavedMatches.length });
    setActionResultMsg(null);

    let savedCount = 0;
    let emailSuccessCount = 0;
    let emailFailCount = 0;

    try {
      for (let i = 0; i < unsavedMatches.length; i++) {
        const match = unsavedMatches[i];
        setBatchProgress({ current: i + 1, total: unsavedMatches.length });
        const res = await saveSingleMatch(match, true);
        if (res.success) savedCount++;
        if (res.emailSent) emailSuccessCount++;
        else if (match.maleEmail) emailFailCount++;
      }

      await fetchData(true);
      setActionResultMsg({
        type: 'success',
        text: `Uspješno zabilježeno ${savedCount} matcheva u bazu! Poslano ${emailSuccessCount} emailova.${emailFailCount > 0 ? ` (${emailFailCount} nije uspjelo poslati)` : ''}`
      });
    } catch (err) {
      console.error("Greška pri masovnom bilježenju matcheva:", err);
      setActionResultMsg({
        type: 'error',
        text: "Došlo je do greške prilikom spremanja matcheva u bazu podataka."
      });
    } finally {
      setBatchSaving(false);
      setBatchProgress(null);
    }
  };

  // Record single match button handler
  const handleRecordSingle = async (m: any) => {
    setSavingMatchId(m.id);
    setActionResultMsg(null);
    try {
      const res = await saveSingleMatch(m, true);
      await fetchData(true);
      setActionResultMsg({
        type: 'success',
        text: `Match za ${m.maleName} & ${m.femaleName} uspješno zabilježen u bazi! ${res.emailSent ? `Email poslan na ${m.maleEmail}.` : ''}`
      });
    } catch (err) {
      console.error("Greška pri bilježenju pojedinačnog matcha:", err);
      setActionResultMsg({
        type: 'error',
        text: "Greška pri bilježenju matcha u bazu."
      });
    } finally {
      setSavingMatchId(null);
    }
  };

  // Send or resend match email handler
  const handleSendMail = async (m: any) => {
    if (!m.maleEmail) {
      alert("Nema zabilježene email adrese za muškog sudionika.");
      return;
    }
    setResendingMatchId(m.id);
    setActionResultMsg(null);
    try {
      if (onResendEmail) {
        await onResendEmail(m);
      } else {
        await sendMatchEmail({
          eventTitle: m.eventTitle || event.title || 'Speed Dating',
          maleName: m.maleName,
          femaleName: m.femaleName,
          maleEmail: m.maleEmail,
          femaleEmail: m.femaleEmail,
          femaleInstagram: m.femaleInstagram,
          femalePhone: m.femalePhone
        });
      }

      // Mark emailSent: true on match doc
      const pairKey = m.pairId || [m.maleUid, m.femaleUid].sort().join('_');
      const matchDocId = m.dbDocId || m.id || `${event.id}_${pairKey}`;
      try {
        await updateDoc(doc(db, 'event_matches', matchDocId), {
          emailSent: true,
          emailSentAt: serverTimestamp()
        });
      } catch (upErr) {
        console.warn("Ažuriranje emailSent polja:", upErr);
      }

      await fetchData(true);
      setActionResultMsg({
        type: 'success',
        text: `Email o matchu uspješno poslan na ${m.maleEmail}!`
      });
    } catch (err) {
      console.error("Greška pri slanju emaila:", err);
      setActionResultMsg({
        type: 'error',
        text: "Došlo je do greške prilikom slanja emaila."
      });
    } finally {
      setResendingMatchId(null);
    }
  };

  // Voters statistics
  const voterUids = useMemo(() => {
    const set = new Set<string>();
    likesList.forEach(l => {
      if (l.fromUid) set.add(l.fromUid);
    });
    return set;
  }, [likesList]);

  const totalAcceptedCount = acceptedParticipants.length;
  const votedCount = acceptedParticipants.filter(p => p.uid && voterUids.has(p.uid)).length;
  const votedFemaleCount = femaleList.filter(p => p.uid && voterUids.has(p.uid)).length;
  const votedMaleCount = maleList.filter(p => p.uid && voterUids.has(p.uid)).length;
  const turnoutPercentage = totalAcceptedCount > 0 ? Math.round((votedCount / totalAcceptedCount) * 100) : 0;

  const totalVotesCount = likesList.length;
  const totalLikesCount = likesList.filter(l => l.liked === true).length;
  const totalDislikesCount = likesList.filter(l => l.liked === false).length;
  const likesPercentage = totalVotesCount > 0 ? Math.round((totalLikesCount / totalVotesCount) * 100) : 0;
  const dislikesPercentage = totalVotesCount > 0 ? (100 - likesPercentage) : 0;

  // Filtered matches for Tab 1
  const filteredMatches = useMemo(() => {
    if (!matchesSearchTerm.trim()) return allMatches;
    const term = matchesSearchTerm.toLowerCase().trim();
    return allMatches.filter(m => {
      const maleBadge = (badgeMap.get(m.maleUid) || '').toLowerCase();
      const femaleBadge = (badgeMap.get(m.femaleUid) || '').toLowerCase();
      const maleName = (m.maleName || '').toLowerCase();
      const femaleName = (m.femaleName || '').toLowerCase();
      const maleContact = (m.maleContact || m.maleEmail || '').toLowerCase();
      const femaleContact = (m.femaleContact || m.femaleEmail || '').toLowerCase();
      return (
        maleName.includes(term) ||
        femaleName.includes(term) ||
        maleContact.includes(term) ||
        femaleContact.includes(term) ||
        maleBadge.includes(term) ||
        femaleBadge.includes(term)
      );
    });
  }, [allMatches, matchesSearchTerm, badgeMap]);

  // Selected person in "Pregled po sudioniku"
  const selectedPerson = useMemo(() => {
    if (!selectedPersonId) {
      // Pick the first participant who voted or simply the first participant
      const firstVoted = acceptedParticipants.find(p => p.uid && voterUids.has(p.uid));
      return firstVoted || acceptedParticipants[0] || null;
    }
    return acceptedParticipants.find(p => p.id === selectedPersonId) || null;
  }, [selectedPersonId, acceptedParticipants, voterUids]);

  // Outgoing votes from selected person
  const personOutgoingVotes = useMemo(() => {
    if (!selectedPerson || !selectedPerson.uid) return [];
    return likesList.filter(l => l.fromUid === selectedPerson.uid);
  }, [selectedPerson, likesList]);

  // Incoming votes to selected person
  const personIncomingVotes = useMemo(() => {
    if (!selectedPerson || !selectedPerson.uid) return [];
    return likesList.filter(l => l.toUid === selectedPerson.uid);
  }, [selectedPerson, likesList]);

  // Opponents list of opposite gender for the selected person
  const oppositeGenderCandidates = useMemo(() => {
    if (!selectedPerson) return [];
    const isMale = selectedPerson.spol === 'M' || selectedPerson.spol?.toLowerCase() === 'muško';
    return isMale ? femaleList : maleList;
  }, [selectedPerson, femaleList, maleList]);

  // Filtered participants list for the sidebar in "Pregled po sudioniku"
  const filteredParticipantsForSidebar = useMemo(() => {
    return acceptedParticipants.filter(p => {
      if (personGenderFilter === 'female' && p.spol !== 'Ž' && p.spol?.toLowerCase() !== 'žensko') return false;
      if (personGenderFilter === 'male' && p.spol !== 'M' && p.spol?.toLowerCase() !== 'muško') return false;
      if (personSearchTerm.trim()) {
        const term = personSearchTerm.toLowerCase().trim();
        const badge = (badgeMap.get(p.id) || '').toLowerCase();
        const name = (p.imePrezime || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        return name.includes(term) || email.includes(term) || badge.includes(term);
      }
      return true;
    });
  }, [acceptedParticipants, personGenderFilter, personSearchTerm, badgeMap]);

  // Filtered all-votes stream for Tab 2 subview
  const filteredAllVotes = useMemo(() => {
    return likesList.filter(vote => {
      // Status filter
      if (allVotesFilter === 'likes' && vote.liked !== true) return false;
      if (allVotesFilter === 'dislikes' && vote.liked !== false) return false;
      if (allVotesFilter === 'mutual') {
        if (!isMutualLike(vote.fromUid, vote.toUid)) return false;
      }

      // Search term
      if (allVotesSearchTerm.trim()) {
        const term = allVotesSearchTerm.toLowerCase().trim();
        const voter = participantLookup.get(vote.fromUid, vote.fromPrijavaId);
        const candidate = participantLookup.get(vote.toUid, vote.toPrijavaId);
        const voterName = (voter?.imePrezime || '').toLowerCase();
        const candidateName = (candidate?.imePrezime || '').toLowerCase();
        const voterBadge = voter ? (badgeMap.get(voter.id) || '').toLowerCase() : '';
        const candidateBadge = candidate ? (badgeMap.get(candidate.id) || '').toLowerCase() : '';
        return (
          voterName.includes(term) ||
          candidateName.includes(term) ||
          voterBadge.includes(term) ||
          candidateBadge.includes(term)
        );
      }
      return true;
    });
  }, [likesList, allVotesFilter, allVotesSearchTerm, isMutualLike, participantLookup, badgeMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[94vh] max-h-[94vh] overflow-hidden border border-gray-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-2xs flex-shrink-0">
              <Heart size={22} className="fill-rose-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  Rezultati & Analiza matchinga
                </h3>
                {event.matchingPhase === 'live' && (
                  <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Uživo
                  </span>
                )}
                {event.matchingPhase === 'post_event' && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Post-event faza
                  </span>
                )}
                {event.matchingPhase === 'closed' && (
                  <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Završeno
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {event.title} • {event.dateStr} • {event.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Osvježi podatke o glasovima i matchevima"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-rose-600' : 'text-gray-500'} />
              <span>{refreshing ? 'Osvježavam...' : 'Osvježi'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Zatvori prozor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Broader Statistics Bar */}
        <div className="bg-gray-50/90 px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            
            {/* Turnout / Voted */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Odaziv na glasanje
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-gray-900">{votedCount}</span>
                <span className="text-xs text-gray-400">/ {totalAcceptedCount} ({turnoutPercentage}%)</span>
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                👩 {votedFemaleCount}/{femaleList.length} Ž • 👨 {votedMaleCount}/{maleList.length} M
              </div>
            </div>

            {/* Mutual Matches */}
            <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                  Obostrani matchevi
                </span>
                <span className="text-xs">💞</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-rose-700">{allMatches.length}</span>
                <span className="text-xs text-rose-600 font-medium">parova</span>
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-1 truncate">
                <span className="font-semibold text-emerald-700">{savedMatchesCount} u bazi</span>
                {unsavedMatches.length > 0 && (
                  <span className="text-amber-700 font-bold ml-1">
                    • {unsavedMatches.length} čeka upis
                  </span>
                )}
              </div>
            </div>

            {/* Sviđanja (Likes) */}
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Sviđanja (Lajkovi)
                </span>
                <ThumbsUp size={12} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-700">{totalLikesCount}</span>
                <span className="text-xs text-emerald-600 font-medium">({likesPercentage}%)</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1 truncate">
                Označeno sa "Sviđa mi se"
              </div>
            </div>

            {/* Odbijanja (Passes/Dislikes) */}
            <div className="bg-gray-100/80 p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                  Odbijanja (Preskočeno)
                </span>
                <ThumbsDown size={12} className="text-gray-500" />
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-gray-800">{totalDislikesCount}</span>
                <span className="text-xs text-gray-500 font-medium">({dislikesPercentage}%)</span>
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                Nije bilo simpatije
              </div>
            </div>

            {/* Total Votes */}
            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Ukupno glasova
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-blue-700">{totalVotesCount}</span>
                <span className="text-xs text-blue-600 font-medium">poslano</span>
              </div>
              <div className="text-[10px] text-blue-600 font-medium mt-1 truncate">
                Prosječno {totalAcceptedCount > 0 ? (totalVotesCount / totalAcceptedCount).toFixed(1) : 0} po sudioniku
              </div>
            </div>

          </div>
        </div>

        {/* Primary Filter Tabs Navigation */}
        <div className="px-5 py-2.5 border-b border-gray-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                activeTab === 'matches'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={16} className={activeTab === 'matches' ? 'fill-white' : 'text-gray-500'} />
              <span>Obostrani matchevi</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'matches' ? 'bg-rose-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {allMatches.length}
              </span>
              {unsavedMatches.length > 0 && (
                <span className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full text-[10px] font-black animate-pulse shadow-2xs" title={`${unsavedMatches.length} nije zabilježeno u bazi`}>
                  {unsavedMatches.length} novo
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('votes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                activeTab === 'votes'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users size={16} className={activeTab === 'votes' ? 'text-white' : 'text-gray-500'} />
              <span>Sviđanja i odbijanja</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'votes' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {totalVotesCount}
              </span>
            </button>
          </div>

          {/* Sub-view toggle only shown in Votes tab */}
          {activeTab === 'votes' && (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setVotesViewMode('by_person')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  votesViewMode === 'by_person'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Po sudionicima
              </button>
              <button
                onClick={() => setVotesViewMode('all_votes')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  votesViewMode === 'all_votes'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Svi pojedinačni glasovi
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col">
          
          {/* Loading Indicator */}
          {loading ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center flex-1">
              <Loader2 size={36} className="animate-spin mb-3 text-rose-500" />
              <p className="text-sm font-semibold text-gray-700">Učitavanje podataka o matchingima i glasovima...</p>
              <p className="text-xs text-gray-400 mt-1">Dohvaćamo glasove sudionika iz baze podataka</p>
            </div>
          ) : activeTab === 'matches' ? (
            
            /* ========================================================================= */
            /* TAB 1: OBOSTRANI MATCHVI (DEFAULT)                                        */
            /* ========================================================================= */
            <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto w-full">
              {/* Action Result Notification Toast */}
              {actionResultMsg && (
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all animate-fade-in ${
                  actionResultMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {actionResultMsg.type === 'success' ? (
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                    )}
                    <span>{actionResultMsg.text}</span>
                  </div>
                  <button
                    onClick={() => setActionResultMsg(null)}
                    className="p-1 hover:bg-black/5 rounded-lg cursor-pointer text-gray-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Unsaved Matches Alert & Global Sync Button Banner */}
              {unsavedMatches.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border-2 border-amber-300 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                          Pronađeni su novi matchevi koji nisu zabilježeni u bazi!
                        </h4>
                        <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                          {unsavedMatches.length} nezabilježeno
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 max-w-xl">
                        Detektirana su uzajamna sviđanja sudionika koja još nisu spremljena u bazu podataka (<code className="bg-white/80 px-1 rounded text-amber-900 font-mono text-[11px]">event_matches</code>) i muški sudionici još nisu primili obavijest. Klikom na gumb ispod, sustav će ih sve automatski zabilježiti u bazu i poslati e-mailove!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={batchSaving}
                    onClick={handleSaveAllUnrecordedMatches}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-600 to-brand hover:from-rose-700 hover:to-brand-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 flex-shrink-0"
                  >
                    {batchSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Spremanje ({batchProgress ? `${batchProgress.current}/${batchProgress.total}` : '...'})</span>
                      </>
                    ) : (
                      <>
                        <Database size={16} />
                        <Send size={14} />
                        <span>Zabilježi sve ({unsavedMatches.length}) & pošalji mailove</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Search Toolbar for Matches */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pretraži matcheve po imenu ili kontaktu..."
                    value={matchesSearchTerm}
                    onChange={e => setMatchesSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  {matchesSearchTerm && (
                    <button
                      onClick={() => setMatchesSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Prikazano: <strong className="text-gray-900">{filteredMatches.length}</strong> od {allMatches.length} matcheva • <strong className="text-emerald-700">{savedMatchesCount}</strong> u bazi {unsavedMatches.length > 0 && <span className="text-amber-700 font-bold">({unsavedMatches.length} čeka upis)</span>}
                </div>
              </div>

              {/* Matches List */}
              {allMatches.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
                  <Heart size={40} className="mx-auto text-gray-300 mb-2" />
                  <h4 className="text-base font-bold text-gray-800">Nema zabilježenih obostranih matcheva</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    {event.matchingPhase === 'live'
                      ? "Matching je u tijeku. Čim dvoje sudionika obostrano označe 'Sviđa mi se', automatski će se pojaviti ovdje."
                      : "Još nema obostranih simpatija ili matching još nije započeo."}
                  </p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8">
                  <Search size={32} className="mx-auto text-gray-400 mb-2" />
                  <h4 className="text-base font-bold text-gray-800">Nema rezultata za "{matchesSearchTerm}"</h4>
                  <button
                    onClick={() => setMatchesSearchTerm('')}
                    className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Poništi pretragu
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredMatches.map((m, idx) => {
                    const maleBadge = badgeMap.get(m.maleUid) || 'M';
                    const femaleBadge = badgeMap.get(m.femaleUid) || 'Ž';

                    return (
                      <div
                        key={m.id || idx}
                        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          m.isSavedInDb
                            ? 'border-rose-100 shadow-2xs hover:shadow-md'
                            : 'border-amber-300 shadow-xs ring-2 ring-amber-400/20 bg-amber-50/20'
                        }`}
                      >
                        {/* Pair Info Container */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                          
                          {/* Number Badge */}
                          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs ${
                            m.isSavedInDb
                              ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                              : 'bg-gradient-to-tr from-amber-500 to-orange-500'
                          }`}>
                            #{idx + 1}
                          </div>

                          {/* Male Participant */}
                          <div className="flex items-center gap-3 min-w-0 flex-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-full sm:w-auto">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {maleBadge}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-gray-900 text-sm truncate">
                                {m.maleName}
                              </h5>
                              <div className="text-xs text-gray-600 truncate mt-0.5">
                                {m.maleContact || m.maleEmail || 'Nema kontakta'}
                              </div>
                            </div>
                          </div>

                          {/* Love Connector */}
                          <div className="flex items-center justify-center self-center px-1">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                              <Heart size={16} className="fill-rose-600 animate-pulse" />
                            </div>
                          </div>

                          {/* Female Participant */}
                          <div className="flex items-center gap-3 min-w-0 flex-1 bg-pink-50/50 p-3 rounded-xl border border-pink-100 w-full sm:w-auto">
                            <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {femaleBadge}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-gray-900 text-sm truncate">
                                {m.femaleName}
                              </h5>
                              <div className="text-xs text-gray-600 truncate mt-0.5">
                                {m.femaleContact || m.femaleEmail || 'Nema kontakta'}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Actions / Status */}
                        <div className="flex items-center gap-2 justify-end flex-wrap flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
                          {/* Database Status Badge */}
                          {m.isSavedInDb ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Zabilježeno u bazi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs animate-pulse">
                              <AlertCircle size={13} className="text-amber-600" />
                              <span>Nije u bazi</span>
                            </span>
                          )}

                          {/* Email Sent Status Badge */}
                          {m.emailSent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              <Check size={11} className="text-emerald-600" /> Mail poslan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                              Mail nije poslan
                            </span>
                          )}

                          {/* Action Button */}
                          {!m.isSavedInDb ? (
                            <button
                              type="button"
                              disabled={savingMatchId === m.id || batchSaving}
                              onClick={() => handleRecordSingle(m)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                              title="Spremi ovaj match u bazu podataka i pošalji email muškom sudioniku"
                            >
                              {savingMatchId === m.id ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Spremanje...</span>
                                </>
                              ) : (
                                <>
                                  <Database size={13} />
                                  <Send size={12} />
                                  <span>Zabilježi & pošalji mail</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={resendingMatchId === m.id || batchSaving}
                              onClick={() => handleSendMail(m)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                              title="Pošalji obavijest muškom sudioniku na email"
                            >
                              {resendingMatchId === m.id ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Slanje...</span>
                                </>
                              ) : (
                                <>
                                  <Send size={13} />
                                  <span>{m.emailSent ? 'Pošalji ponovno mail' : 'Pošalji mail'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          ) : votesViewMode === 'by_person' ? (
            
            /* ========================================================================= */
            /* TAB 2, VIEW A: PREGLED PO SUDIONIKU                                       */
            /* ========================================================================= */
            <div className="flex flex-col md:flex-row flex-1 h-full min-h-0">
              
              {/* Left Column: Participant List & Selector */}
              <div className="w-full md:w-80 lg:w-88 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                {/* Search & Gender filter in sidebar */}
                <div className="p-3.5 border-b border-gray-200 space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pretraži sudionika..."
                      value={personSearchTerm}
                      onChange={e => setPersonSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    {personSearchTerm && (
                      <button
                        onClick={() => setPersonSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPersonGenderFilter('all')}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                        personGenderFilter === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Svi ({acceptedParticipants.length})
                    </button>
                    <button
                      onClick={() => setPersonGenderFilter('female')}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                        personGenderFilter === 'female'
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                      }`}
                    >
                      Žene ({femaleList.length})
                    </button>
                    <button
                      onClick={() => setPersonGenderFilter('male')}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                        personGenderFilter === 'male'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Muški ({maleList.length})
                    </button>
                  </div>
                </div>

                {/* Participant Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {filteredParticipantsForSidebar.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">
                      Nema pronađenih sudionika.
                    </div>
                  ) : (
                    filteredParticipantsForSidebar.map(p => {
                      const isSelected = selectedPerson?.id === p.id;
                      const isFemale = p.spol === 'Ž' || p.spol?.toLowerCase() === 'žensko';
                      const badge = badgeMap.get(p.id) || (isFemale ? 'Ž' : 'M');
                      const pVotes = likesList.filter(l => l.fromUid === p.uid);
                      const pLikes = pVotes.filter(l => l.liked === true).length;
                      const pDislikes = pVotes.filter(l => l.liked === false).length;
                      const pMatches = allMatches.filter(m => m.maleUid === p.uid || m.femaleUid === p.uid).length;
                      const hasVoted = p.uid && voterUids.has(p.uid);

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPersonId(p.id)}
                          className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-rose-50/80 border-l-4 border-rose-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs flex-shrink-0 ${
                                isFemale
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {badge}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h6 className="font-bold text-gray-900 text-xs truncate">
                                {p.imePrezime}
                              </h6>
                              <div className="text-[10px] text-gray-500 truncate">
                                {hasVoted ? (
                                  <span className="text-emerald-700 font-semibold">
                                    {pVotes.length} glasova ({pLikes} ❤️ / {pDislikes} ✕)
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">Još nije glasovao/la ⏳</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {pMatches > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                              <Heart size={10} className="fill-rose-600" />
                              {pMatches}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Breakdown for Selected Person */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {selectedPerson ? (
                  <>
                    {/* Person Summary Card */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center shadow-xs flex-shrink-0 ${
                            selectedPerson.spol === 'Ž' || selectedPerson.spol?.toLowerCase() === 'žensko'
                              ? 'bg-pink-100 text-pink-700 border border-pink-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {badgeMap.get(selectedPerson.id) || (selectedPerson.spol === 'Ž' ? 'Ž' : 'M')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-900">
                              {selectedPerson.imePrezime}
                            </h4>
                            <span className="text-xs text-gray-500 font-medium">
                              ({selectedPerson.godine} god.)
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {selectedPerson.email} {selectedPerson.contactHandle ? `• ${selectedPerson.contactHandle}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stat Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                          <span className="text-gray-500 text-[10px] uppercase font-bold block">Dano glasova</span>
                          <span className="font-bold text-gray-900">
                            {personOutgoingVotes.length} ({personOutgoingVotes.filter(l => l.liked).length} ❤️ / {personOutgoingVotes.filter(l => !l.liked).length} ✕)
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                          <span className="text-gray-500 text-[10px] uppercase font-bold block">Primljeno glasova</span>
                          <span className="font-bold text-gray-900">
                            {personIncomingVotes.length} ({personIncomingVotes.filter(l => l.liked).length} ❤️ / {personIncomingVotes.filter(l => !l.liked).length} ✕)
                          </span>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                          <span className="text-rose-600 text-[10px] uppercase font-bold block">Matchevi</span>
                          <span className="font-bold text-rose-700 flex items-center gap-1">
                            <Heart size={12} className="fill-rose-600" />
                            {allMatches.filter(m => m.maleUid === selectedPerson.uid || m.femaleUid === selectedPerson.uid).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tab Switcher: Outgoing vs Incoming */}
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                      <button
                        onClick={() => setPersonVotesDirection('outgoing')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          personVotesDirection === 'outgoing'
                            ? 'bg-gray-900 text-white shadow-2xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        Koga je {selectedPerson.imePrezime.split(' ')[0]} označio/la ({personOutgoingVotes.length})
                      </button>

                      <button
                        onClick={() => setPersonVotesDirection('incoming')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          personVotesDirection === 'incoming'
                            ? 'bg-gray-900 text-white shadow-2xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        Tko je označio {selectedPerson.imePrezime.split(' ')[0]} ({personIncomingVotes.length})
                      </button>
                    </div>

                    {/* Voted Cards Grid */}
                    {personVotesDirection === 'outgoing' ? (
                      /* Outgoing votes from this person */
                      personOutgoingVotes.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-xs">
                          Ovaj sudionik još nije poslao nijedan glas.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {personOutgoingVotes.map(vote => {
                            const candidate = participantLookup.get(vote.toUid, vote.toPrijavaId);
                            const candBadge = candidate ? badgeMap.get(candidate.id) || (candidate.spol === 'Ž' ? 'Ž' : 'M') : '?';
                            const isLiked = vote.liked === true;
                            const mutual = isMutualLike(selectedPerson.uid, vote.toUid);
                            
                            // Check what candidate voted on this person
                            const reciprocalVote = likesList.find(l => l.fromUid === vote.toUid && l.toUid === selectedPerson.uid);

                            return (
                              <div
                                key={vote.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  mutual
                                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                                    : isLiked
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                      {candBadge}
                                    </div>
                                    <div className="min-w-0">
                                      <h6 className="font-bold text-gray-900 text-xs truncate">
                                        {candidate?.imePrezime || 'Nepoznat sudionik'}
                                      </h6>
                                      <p className="text-[11px] text-gray-500 truncate">
                                        {candidate?.godine ? `${candidate.godine} god.` : ''} {candidate?.contactHandle || ''}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Vote Badge */}
                                  <div className="flex-shrink-0">
                                    {isLiked ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                        <Heart size={11} className="fill-emerald-700 text-emerald-700" /> Sviđa mi se
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
                                        ✕ Preskočeno
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Reciprocal response indicator */}
                                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                  <span className="text-gray-500">Druga strana:</span>
                                  {mutual ? (
                                    <span className="font-bold text-rose-700 flex items-center gap-1">
                                      <Heart size={11} className="fill-rose-600" /> OBOSTRANI MATCH!
                                    </span>
                                  ) : reciprocalVote ? (
                                    reciprocalVote.liked ? (
                                      <span className="text-emerald-700 font-medium">❤️ I kandidat je rekao Da</span>
                                    ) : (
                                      <span className="text-gray-500 font-normal">✕ Kandidat je preskočio</span>
                                    )
                                  ) : (
                                    <span className="text-gray-400 italic">⏳ Nije još glasovao/la</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      /* Incoming votes to this person */
                      personIncomingVotes.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-xs">
                          Nitko još nije poslao glas za ovog sudionika.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {personIncomingVotes.map(vote => {
                            const voter = participantLookup.get(vote.fromUid, vote.fromPrijavaId);
                            const voterBadge = voter ? badgeMap.get(voter.id) || (voter.spol === 'Ž' ? 'Ž' : 'M') : '?';
                            const isLiked = vote.liked === true;
                            const mutual = isMutualLike(vote.fromUid, selectedPerson.uid);
                            
                            // Did this person like them back?
                            const myVoteOnThem = likesList.find(l => l.fromUid === selectedPerson.uid && l.toUid === vote.fromUid);

                            return (
                              <div
                                key={vote.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  mutual
                                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                                    : isLiked
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                      {voterBadge}
                                    </div>
                                    <div className="min-w-0">
                                      <h6 className="font-bold text-gray-900 text-xs truncate">
                                        {voter?.imePrezime || 'Nepoznat sudionik'}
                                      </h6>
                                      <p className="text-[11px] text-gray-500 truncate">
                                        {voter?.godine ? `${voter.godine} god.` : ''} {voter?.contactHandle || ''}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Vote Badge */}
                                  <div className="flex-shrink-0">
                                    {isLiked ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                        <Heart size={11} className="fill-emerald-700 text-emerald-700" /> Sviđa mu/joj se
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
                                        ✕ Preskočeno
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Outcome indicator */}
                                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                  <span className="text-gray-500">Odgovor sudionika:</span>
                                  {mutual ? (
                                    <span className="font-bold text-rose-700 flex items-center gap-1">
                                      <Heart size={11} className="fill-rose-600" /> OBOSTRANI MATCH!
                                    </span>
                                  ) : myVoteOnThem ? (
                                    myVoteOnThem.liked ? (
                                      <span className="text-emerald-700 font-medium">❤️ Uzvraćena simpatija</span>
                                    ) : (
                                      <span className="text-gray-500 font-normal">✕ Označio/la kao "Preskoči"</span>
                                    )
                                  ) : (
                                    <span className="text-gray-400 italic">⏳ Nije još glasovao/la za ovu osobu</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}

                    {/* Remaining candidates not yet voted on */}
                    {personVotesDirection === 'outgoing' && (
                      (() => {
                        const votedCandidateUids = new Set(personOutgoingVotes.map(l => l.toUid));
                        const unvotedOpponents = oppositeGenderCandidates.filter(c => c.uid && !votedCandidateUids.has(c.uid));
                        if (unvotedOpponents.length === 0) return null;

                        return (
                          <div className="mt-4 p-4 bg-gray-100/70 border border-dashed border-gray-300 rounded-xl">
                            <h6 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                              <Clock size={13} className="text-amber-600" />
                              <span>Još nije ocijenjeno ({unvotedOpponents.length} sudionika):</span>
                            </h6>
                            <div className="flex flex-wrap gap-1.5">
                              {unvotedOpponents.map(c => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg"
                                >
                                  <span className="font-bold text-[11px] text-gray-500">
                                    {badgeMap.get(c.id) || (c.spol === 'Ž' ? 'Ž' : 'M')}
                                  </span>
                                  <span>{c.imePrezime}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center text-gray-400 text-sm">
                    Odaberite sudionika s lijevog popisa za pregled njegovih glasova.
                  </div>
                )}
              </div>

            </div>

          ) : (
            
            /* ========================================================================= */
            /* TAB 2, VIEW B: SVI POJEDINAČNI GLASOVI (STREAM)                           */
            /* ========================================================================= */
            <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto w-full">
              
              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pretraži po imenu ili oznaci..."
                    value={allVotesSearchTerm}
                    onChange={e => setAllVotesSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  {allVotesSearchTerm && (
                    <button
                      onClick={() => setAllVotesSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setAllVotesFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      allVotesFilter === 'all'
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Svi ({totalVotesCount})
                  </button>

                  <button
                    onClick={() => setAllVotesFilter('likes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      allVotesFilter === 'likes'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span>Sviđanja ({totalLikesCount})</span>
                    <ThumbsUp size={11} />
                  </button>

                  <button
                    onClick={() => setAllVotesFilter('dislikes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      allVotesFilter === 'dislikes'
                        ? 'bg-gray-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <span>Odbijanja ({totalDislikesCount})</span>
                    <ThumbsDown size={11} />
                  </button>

                  <button
                    onClick={() => setAllVotesFilter('mutual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      allVotesFilter === 'mutual'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <span>Matchevi</span>
                    <Heart size={11} className="fill-rose-700" />
                  </button>
                </div>
              </div>

              {/* Votes List Stream */}
              {likesList.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
                  <Users size={36} className="mx-auto text-gray-300 mb-2" />
                  <h4 className="text-base font-bold text-gray-800">Nema zabilježenih glasova</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    Kada sudionici počnu glasovati, svaki pojedinačni odabir pojavit će se ovdje.
                  </p>
                </div>
              ) : filteredAllVotes.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8">
                  <Search size={32} className="mx-auto text-gray-400 mb-2" />
                  <h4 className="text-base font-bold text-gray-800">Nema glasova za odabrane kriterije</h4>
                  <button
                    onClick={() => {
                      setAllVotesSearchTerm('');
                      setAllVotesFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Poništi filtre
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAllVotes.map((vote, idx) => {
                    const voter = participantLookup.get(vote.fromUid, vote.fromPrijavaId);
                    const candidate = participantLookup.get(vote.toUid, vote.toPrijavaId);
                    const voterBadge = voter ? badgeMap.get(voter.id) || (voter.spol === 'Ž' ? 'Ž' : 'M') : '?';
                    const candidateBadge = candidate ? badgeMap.get(candidate.id) || (candidate.spol === 'Ž' ? 'Ž' : 'M') : '?';
                    const isLiked = vote.liked === true;
                    const mutual = isMutualLike(vote.fromUid, vote.toUid);

                    return (
                      <div
                        key={vote.id || idx}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          mutual
                            ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                            : isLiked
                            ? 'bg-white hover:bg-emerald-50/30 border-gray-200'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        {/* Voter */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs flex-shrink-0 ${
                              voter?.spol === 'Ž' || voter?.spol?.toLowerCase() === 'žensko'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {voterBadge}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 text-xs truncate block">
                              {voter?.imePrezime || 'Nepoznat birač'}
                            </span>
                          </div>
                        </div>

                        {/* Action Direction */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ArrowRight size={14} className="text-gray-400" />
                          {isLiked ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                              <Heart size={12} className="fill-emerald-700" />
                              <span>Sviđa mi se</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                              <span>✕ Preskočeno</span>
                            </span>
                          )}
                          <ArrowRight size={14} className="text-gray-400" />
                        </div>

                        {/* Target Candidate */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                          <div className="min-w-0 text-right">
                            <span className="font-bold text-gray-900 text-xs truncate block">
                              {candidate?.imePrezime || 'Nepoznat sudionik'}
                            </span>
                          </div>
                          <div
                            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs flex-shrink-0 ${
                              candidate?.spol === 'Ž' || candidate?.spol?.toLowerCase() === 'žensko'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {candidateBadge}
                          </div>
                        </div>

                        {/* Mutual Highlight Pill */}
                        {mutual && (
                          <div className="hidden sm:flex items-center gap-1 bg-rose-100 text-rose-700 font-bold text-[11px] px-2 py-0.5 rounded-full border border-rose-300 flex-shrink-0">
                            <Heart size={11} className="fill-rose-600" />
                            <span>Obostrano!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          )}

        </div>

        {/* Bottom Status Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>
              {activeTab === 'matches'
                ? `Ukupno zabilježeno ${allMatches.length} obostranih matcheva.`
                : `Ukupno zabilježeno ${totalVotesCount} glasova (${totalLikesCount} sviđanja, ${totalDislikesCount} preskakanja).`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Zatvori
          </button>
        </div>

      </div>
    </div>
  );
};
