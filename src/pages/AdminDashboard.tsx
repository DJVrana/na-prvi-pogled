import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, doc, where, updateDoc, deleteDoc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Link, Navigate } from 'react-router';
import { ArrowLeft, Users, UserRound, ArrowDown01, Loader2, Plus, Calendar as CalendarIcon, CheckCircle2, List, PlayCircle, StopCircle, Trash2, X, ChevronDown, Pencil, Clock, XCircle, Flame, Heart, UserX, Send, Sparkles, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { sendMatchEmail } from '../utils/matchingEmails';

const ADMIN_UIDS = ['iKe7lzl7Msf7hd3kWyHC1ysyS3C3', 'Izt37mNGtpY82AKZTbyYsnctoxJ2', 'JRms1cPi2Bc513TOW0WBEFZMzrC3'];

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  rawOptions?: string;
  required: boolean;
}

interface EventData {
  id: string;
  title: string;
  ageGroup: string;
  dateStr: string;
  timeStr: string;
  location: string;
  price: string;
  isActive: boolean;
  isMatchingActive?: boolean;
  matchingPhase?: 'live' | 'post_event' | 'closed';
  createdAt: any;
  customFields?: CustomField[];
  maxRegistrations?: number | string;
  introText?: string; // Legacy
  noteText?: string; // Legacy
  middleText?: string; // Legacy
  closingText?: string; // Legacy
  timeNote?: string; // Legacy
  introTextM?: string;
  introTextZ?: string;
  noteTextM?: string;
  noteTextZ?: string;
  middleTextM?: string;
  middleTextZ?: string;
  closingTextM?: string;
  closingTextZ?: string;
  timeNoteM?: string;
  timeNoteZ?: string;
  registrationCount?: number;
}

interface Prijava {
  id: string;
  imePrezime: string;
  email: string;
  spol: string;
  godine: number;
  napomena: string;
  createdAt: any;
  eventId?: string;
  uid?: string;
  customAnswers?: { label: string; value: any }[];
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'waiting_list';
  cancelledAt?: any;
  contactHandle?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'prijave' | 'events'>('prijave');

  // Data states
  const [events, setEvents] = useState<EventData[]>([]);
  const [prijave, setPrijave] = useState<Prijava[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Loading & Error
  const [dataLoading, setDataLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState('');

  // New event form state
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [previewGender, setPreviewGender] = useState<'M' | 'Ž'>('Ž');
  const [newEvent, setNewEvent] = useState({
    title: '',
    ageGroup: '',
    dateStr: '',
    timeStr: '',
    location: '',
    price: '',
    maxRegistrations: '',
    introTextM: 'Hvala ti što si nam ukazao povjerenje i odlučio biti dio prvog "Na prvi pogled" speed dating eventa!',
    introTextZ: 'Hvala ti što si nam ukazala povjerenje i odlučila biti dio prvog "Na prvi pogled" speed dating eventa!',
    middleTextM: 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj.',
    middleTextZ: 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoja.',
    noteTextM: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
    noteTextZ: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
    closingTextM: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
    closingTextZ: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
    timeNoteM: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.',
    timeNoteZ: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.'
  });
  const [newCustomFields, setNewCustomFields] = useState<CustomField[]>([]);
  const [openFieldDropdownIndex, setOpenFieldDropdownIndex] = useState<number | null>(null);

  // Modal state
  const [selectedPrijava, setSelectedPrijava] = useState<Prijava | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchesModalOpen, setMatchesModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending' | 'waiting_list' | 'rejected' | 'cancelled'>('all');
  const [selectedEventForMatches, setSelectedEventForMatches] = useState<EventData | null>(null);
  const [eventMatchesList, setEventMatchesList] = useState<any[]>([]);
  const [loadingMatchesModal, setLoadingMatchesModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Nažalost, zbog ograničenog broja mjesta i velikog interesa, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje. Mjesta su se popunila vrlo brzo ili pokušavamo balansirati omjer sudionika.');
  const [rejectDropdownOpen, setRejectDropdownOpen] = useState(false);

  // Live Matching completion modal state
  const [finishLiveModalOpen, setFinishLiveModalOpen] = useState(false);
  const [liveStatsData, setLiveStatsData] = useState<{
    totalVotes: number;
    likesCount: number;
    passesCount: number;
    mutualMatches: any[];
    maleCount: number;
    femaleCount: number;
    votedUsersCount: number;
  } | null>(null);
  const [loadingLiveStats, setLoadingLiveStats] = useState(false);
  const [publishingMatches, setPublishingMatches] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState('');

  const REJECT_REASONS = [
    { id: 'full', label: 'Popunjena mjesta', text: 'Nažalost, zbog ograničenog broja mjesta i velikog interesa, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje. Mjesta su se popunila vrlo brzo ili pokušavamo balansirati omjer sudionika.' },
    { id: 'age', label: 'Dobna skupina', text: 'Nažalost, za ovaj događaj prednost smo morali dati prijavama koje se točno uklapaju u predviđenu dobnu skupinu kako bismo osigurali najbolje iskustvo za sve sudionike.' },
    { id: 'other', label: 'Općenito', text: 'Nažalost, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje.' },
  ];

  const WAITLIST_REASONS = [
    {
      id: 'ratio',
      label: 'Balansiranje omjera sudionika (veći broj prijava)',
      text: 'Zbog iznimno velikog broja prijava u tvojoj kategoriji i želje da osiguramo optimalan i uravnotežen omjer sudionika, tvoja prijava je trenutačno stavljena na listu čekanja. Čim se oslobodi mjesto ili se stvore uvjeti za tvoje sudjelovanje, javit ćemo ti se s potvrdom!'
    },
    {
      id: 'capacity',
      label: 'Trenutačno popunjena mjesta',
      text: 'Trenutačni kapacitet mjesta za tvoju kategoriju je popunjen, stoga se tvoja prijava trenutačno nalazi na listi čekanja. Ako netko od sudionika otkaže ili se otvori dodatno mjesto, odmah ćemo te obavijestiti!'
    },
    {
      id: 'general',
      label: 'Općenito - Lista čekanja',
      text: 'Tvoja prijava je zaprimljena i trenutačno se nalazi na listi čekanja za ovaj Speed Dating događaj. Obavijestit ćemo te čim bude novih informacija.'
    }
  ];

  const [waitlistReason, setWaitlistReason] = useState(WAITLIST_REASONS[0].text);
  const [waitlistDropdownOpen, setWaitlistDropdownOpen] = useState(false);

  // Dropdown state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && ADMIN_UIDS.includes(user.uid)) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (user && ADMIN_UIDS.includes(user.uid)) {
      fetchPrijave(selectedEventId);
    }
  }, [selectedEventId, user]);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as EventData[];
      setEvents(data);

      // Select the active event or the first one if none is selected
      if (!selectedEventId && data.length > 0) {
        const active = data.find(e => e.isActive);
        setSelectedEventId(active ? active.id : data[0].id);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError('Greška pri dohvaćanju događaja.');
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchPrijave = async (eventId: string) => {
    setDataLoading(true);
    setError('');
    try {
      let q;
      if (eventId) {
        q = query(collection(db, 'prijave'), where('eventId', '==', eventId), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'prijave'), orderBy('createdAt', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as Prijava[];
      setPrijave(data);
    } catch (err) {
      console.error("Error fetching prijave:", err);
      setError('Greška pri dohvaćanju prijava. (Možda je potrebno kreirati Firestore indeks)');
    } finally {
      setDataLoading(false);
    }
  };

  const openEditEvent = (eventToEdit: EventData) => {
    setEditingEventId(eventToEdit.id);
    setNewEvent({
      title: eventToEdit.title,
      ageGroup: eventToEdit.ageGroup,
      dateStr: eventToEdit.dateStr,
      timeStr: eventToEdit.timeStr,
      location: eventToEdit.location,
      price: eventToEdit.price,
      maxRegistrations: eventToEdit.maxRegistrations ? String(eventToEdit.maxRegistrations) : '',
      introTextM: eventToEdit.introTextM || eventToEdit.introText || 'Hvala ti što si nam ukazao povjerenje i odlučio biti dio prvog "Na prvi pogled" speed dating eventa!',
      introTextZ: eventToEdit.introTextZ || eventToEdit.introText || 'Hvala ti što si nam ukazala povjerenje i odlučila biti dio prvog "Na prvi pogled" speed dating eventa!',
      middleTextM: eventToEdit.middleTextM || eventToEdit.middleText || 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj.',
      middleTextZ: eventToEdit.middleTextZ || eventToEdit.middleText || 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoja.',
      noteTextM: eventToEdit.noteTextM || eventToEdit.noteText || 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
      noteTextZ: eventToEdit.noteTextZ || eventToEdit.noteText || 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
      closingTextM: eventToEdit.closingTextM || eventToEdit.closingText || 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
      closingTextZ: eventToEdit.closingTextZ || eventToEdit.closingText || 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
      timeNoteM: eventToEdit.timeNoteM || eventToEdit.timeNote || 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.',
      timeNoteZ: eventToEdit.timeNoteZ || eventToEdit.timeNote || 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.'
    });
    setNewCustomFields(eventToEdit.customFields?.map(f => ({
      ...f,
      rawOptions: f.options?.join(', ') || ''
    })) || []);
    setShowNewEventForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setShowNewEventForm(false);
    setEditingEventId(null);
    setNewEvent({ title: '', ageGroup: '', dateStr: '', timeStr: '', location: '', price: '', maxRegistrations: '', introTextM: 'Hvala ti što si nam ukazao povjerenje i odlučio biti dio prvog "Na prvi pogled" speed dating eventa!', introTextZ: 'Hvala ti što si nam ukazala povjerenje i odlučila biti dio prvog "Na prvi pogled" speed dating eventa!', middleTextM: 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj.', middleTextZ: 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoja.', noteTextM: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.', noteTextZ: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.', closingTextM: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.', closingTextZ: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.', timeNoteM: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.', timeNoteZ: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.' });
    setNewCustomFields([]);
    setOpenFieldDropdownIndex(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mappedCustomFields = newCustomFields.map(f => {
        const { rawOptions, ...rest } = f;
        return {
          ...rest,
          options: rawOptions ? rawOptions.split(',').map(s => s.trim()).filter(Boolean) : rest.options || []
        };
      });

      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), {
          ...newEvent,
          maxRegistrations: newEvent.maxRegistrations ? Number(newEvent.maxRegistrations) : null,
          customFields: mappedCustomFields,
          // ne mijenjamo createdAt ni isActive prilikom uređivanja
        });
      } else {
        await addDoc(collection(db, 'events'), {
          ...newEvent,
          maxRegistrations: newEvent.maxRegistrations ? Number(newEvent.maxRegistrations) : null,
          customFields: mappedCustomFields,
          registrationCount: 0,
          isActive: false, // Default to inactive, admin must manually activate
          createdAt: serverTimestamp()
        });
      }
      handleCancelEdit();
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Greška pri spremanju događaja.");
    }
  };

  const confirmDeletePrijava = async () => {
    if (!selectedPrijava) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'prijave', selectedPrijava.id));
      if (selectedPrijava.status !== 'rejected' && selectedPrijava.status !== 'cancelled' && selectedPrijava.status !== 'waiting_list') {
        await updateDoc(doc(db, 'events', selectedEventId), {
          registrationCount: increment(-1)
        });
      }
      setSelectedPrijava(null);
      setDeleteModalOpen(false);
      fetchPrijave(selectedEventId);
      fetchEvents();
    } catch (err) {
      console.error("Greška pri brisanju prijave:", err);
      alert("Dogodila se greška prilikom brisanja prijave.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptPrijava = async (prijava: Prijava) => {
    setActionLoading(true);
    try {
      const activeEvent = events.find(e => e.id === prijava.eventId);
      if (!activeEvent) {
        alert("Greška: Događaj nije pronađen.");
        setActionLoading(false);
        return;
      }

      await updateDoc(doc(db, 'prijave', prijava.id), { status: 'accepted' });
      if (prijava.status === 'rejected' || prijava.status === 'cancelled' || prijava.status === 'waiting_list') {
        await updateDoc(doc(db, 'events', activeEvent.id), {
          registrationCount: increment(1)
        });
      }

      const isMale = prijava.spol === 'M' || prijava.spol.toLowerCase() === 'muško';
      const introText = isMale ? (activeEvent.introTextM || activeEvent.introText || '') : (activeEvent.introTextZ || activeEvent.introText || '');
      const middleText = isMale ? (activeEvent.middleTextM || activeEvent.middleText || 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj.') : (activeEvent.middleTextZ || activeEvent.middleText || 'Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoja.');
      const noteText = isMale ? (activeEvent.noteTextM || activeEvent.noteText || '') : (activeEvent.noteTextZ || activeEvent.noteText || '');
      const closingText = isMale ? (activeEvent.closingTextM || activeEvent.closingText || '') : (activeEvent.closingTextZ || activeEvent.closingText || '');
      const timeNote = isMale ? (activeEvent.timeNoteM || activeEvent.timeNote || '') : (activeEvent.timeNoteZ || activeEvent.timeNote || '');

      const acceptHtmlMessage = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Potvrda prijave za speed dating</p>
  </div>
  
  <p style="font-size: 16px;">${isMale ? 'Dragi' : 'Draga'} <strong>${prijava.imePrezime.split(' ')[0]}</strong>,</p>
  
  <p style="font-size: 16px; white-space: pre-wrap;">${introText}</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">Ovim mailom potvrđujemo tvoju prijavu!</p>
  </div>
  
  <p style="font-size: 16px;">${middleText}</p>

  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <p style="margin: 0; font-size: 15px; color: #555555; white-space: pre-wrap;">${noteText}</p>
  </div>
  
  <div style="margin: 30px 0; padding: 20px 0; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee;">
    <h3 style="margin-top: 0; color: #333333; font-size: 18px; text-transform: uppercase;">Detalji eventa:</h3>
    <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
      <tr><td style="padding: 10px 0; width: 35px; font-size: 20px;">📅</td><td style="padding: 10px 0;"><strong>${activeEvent.dateStr || ''}</strong></td></tr>
      <tr><td style="padding: 10px 0; font-size: 20px;">🕖</td><td style="padding: 10px 0;"><strong>${activeEvent.timeStr || ''}</strong></td></tr>
      <tr><td style="padding: 10px 0; font-size: 20px;">⏰</td><td style="padding: 10px 0; color: #E85D75; white-space: pre-wrap;">${timeNote}</td></tr>
      <tr><td style="padding: 10px 0; font-size: 20px;">📍</td><td style="padding: 10px 0;"><strong>${activeEvent.location || ''}</strong></td></tr>
      <tr><td style="padding: 10px 0; font-size: 20px;">🎂</td><td style="padding: 10px 0;">Dobna skupina: <strong>${activeEvent.ageGroup || ''}</strong></td></tr>
      <tr><td style="padding: 10px 0; font-size: 20px;">💳</td><td style="padding: 10px 0;">Kotizacija: <strong>${activeEvent.price || ''}</strong></td></tr>
    </table>
  </div>
  
  <p style="font-size: 15px; text-align: center; background-color: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eeeeee; color: #333333; white-space: pre-wrap;">${closingText}</p>
  
  <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
    <p style="font-size: 20px; font-weight: bold; color: #E85D75;">Vidimo se uskoro! ✨</p>
  </div>
  
  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="font-size: 15px; margin: 0; color: #666666;">
      Srdačan pozdrav,<br>
      <strong style="color: #333333; font-size: 16px;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.
    </p>
  </div>
</div>
      `;

      try {
        await emailjs.send(
          'default_service',
          'template_uuvkcp3',
          {
            name: prijava.imePrezime.split(' ')[0],
            email: prijava.email,
            subject: "Tvoja prijava je potvrđena! ✨",
            html_message: acceptHtmlMessage
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error("Greška pri slanju emaila o prihvaćanju: ", emailErr);
        alert("Status je ažuriran, ali slanje emaila nije uspjelo.");
      }

      setSelectedPrijava({ ...prijava, status: 'accepted' });
      fetchPrijave(selectedEventId);
      fetchEvents();
    } catch (err) {
      console.error("Greška pri prihvaćanju:", err);
      alert("Dogodila se greška prilikom prihvaćanja prijave.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejectPrijava = async () => {
    if (!selectedPrijava) return;

    const wasOnWaitingList = selectedPrijava.status === 'waiting_list';

    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'prijave', selectedPrijava.id), { status: 'rejected' });
      if (selectedPrijava.status !== 'rejected' && selectedPrijava.status !== 'cancelled' && selectedPrijava.status !== 'waiting_list') {
        await updateDoc(doc(db, 'events', selectedEventId), {
          registrationCount: increment(-1)
        });
      }

      // Ako je kandidat bio na listi čekanja, NE šaljemo email odbijenice radi uštede limita
      // (kandidat je u zadanom mailu za listu čekanja već obaviješten da se javljamo isključivo u slučaju potvrde).
      if (!wasOnWaitingList) {
        const htmlMessage = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #E85D75; text-align: center; text-transform: uppercase; margin-bottom: 5px;">Na prvi pogled</h2>
          <p style="text-align: center; color: #888; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Obavijest o prijavi</p>
          <p>${selectedPrijava.spol === 'M' || selectedPrijava.spol.toLowerCase() === 'muško' ? 'Dragi' : 'Draga'} <strong>${selectedPrijava.imePrezime.split(' ')[0]}</strong>,</p>
          <p>Zahvaljujemo ti na interesu i poslanoj prijavi za nadolazeći <em>Na prvi pogled</em> speed dating event.</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #ccc; padding: 15px; margin: 25px 0;">
            <p style="margin: 0;">${rejectReason}</p>
          </div>
          <p>Iskreno se nadamo da ćeš nam se pridružiti na nekom od sljedećih događaja. Prati nas i dalje za nove najave!</p>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #555; font-size: 14px; margin: 0; line-height: 1.5;">Srdačan pozdrav,<br/><strong style="color: #333;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.</p>
          </div>
        </div>
        `;

        try {
          await emailjs.send(
            'default_service',
            'template_uuvkcp3',
            {
              name: selectedPrijava.imePrezime.split(' ')[0],
              email: selectedPrijava.email,
              subject: "Tvoja prijava je odbijena!",
              html_message: htmlMessage
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
        } catch (emailErr) {
          console.error("Greška pri slanju emaila o odbijanju: ", emailErr);
          alert("Status je ažuriran, ali slanje emaila nije uspjelo.");
        }
      }

      setSelectedPrijava({ ...selectedPrijava, status: 'rejected' });
      setRejectModalOpen(false);
      fetchPrijave(selectedEventId);
      fetchEvents();
    } catch (err) {
      console.error("Greška pri odbijanju:", err);
      alert("Dogodila se greška prilikom odbijanja prijave.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmWaitlistPrijava = async () => {
    if (!selectedPrijava) return;

    setActionLoading(true);
    try {
      const activeEvent = events.find(e => e.id === (selectedPrijava.eventId || selectedEventId));

      await updateDoc(doc(db, 'prijave', selectedPrijava.id), { status: 'waiting_list' });

      // If previously taking up an occupied spot, decrement registrationCount
      if (selectedPrijava.status !== 'rejected' && selectedPrijava.status !== 'cancelled' && selectedPrijava.status !== 'waiting_list') {
        const targetEvtId = selectedPrijava.eventId || selectedEventId;
        if (targetEvtId) {
          await updateDoc(doc(db, 'events', targetEvtId), {
            registrationCount: increment(-1)
          });
        }
      }

      const isMale = selectedPrijava.spol === 'M' || selectedPrijava.spol.toLowerCase() === 'muško';
      const eventTitle = activeEvent?.title || 'Speed Dating';

      const htmlMessage = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Obavijest o prijavi – Lista čekanja</p>
  </div>
  
  <p style="font-size: 16px;">${isMale ? 'Dragi' : 'Draga'} <strong>${selectedPrijava.imePrezime.split(' ')[0]}</strong>,</p>
  
  <p style="font-size: 16px;">Hvala ti na interesu i prijavi za događaj <strong>${eventTitle}</strong>!</p>
  
  <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #B45309; font-weight: bold;">Status prijave: Na listi čekanja ⏳</p>
  </div>
  
  <div style="background-color: #f9f9f9; border: 1px dashed #dddddd; padding: 18px; margin: 25px 0; border-radius: 8px;">
    <p style="margin: 0; font-size: 15px; color: #444444; white-space: pre-wrap;">${waitlistReason}</p>
  </div>
  
  <p style="font-size: 15px; color: #555555; line-height: 1.6;">
    Tvoje mjesto još nije potvrđeno. Pratimo stanje prijava te ćemo te kontaktirati <strong>isključivo ako se oslobodi mjesto i tvoja prijava bude prihvaćena</strong>. Ako ti se povratno ne javimo s potvrdom, to znači da ovaj put nažalost nismo u mogućnosti osigurati tvoje sudjelovanje na događaju.
  </p>
  <p style="font-size: 14px; color: #777777; line-height: 1.5;">
    Ako u međuvremenu znaš da nećeš moći doći, molimo te da se odjaviš putem svog korisničkog profila.
  </p>

  ${activeEvent ? `
  <div style="margin: 25px 0; padding: 15px 0; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee;">
    <h4 style="margin-top: 0; color: #555555; font-size: 15px; text-transform: uppercase;">Detalji događaja:</h4>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #555555;">
      ${activeEvent.dateStr ? `<tr><td style="padding: 6px 0; width: 30px;">📅</td><td><strong>${activeEvent.dateStr}</strong></td></tr>` : ''}
      ${activeEvent.timeStr ? `<tr><td style="padding: 6px 0;">🕖</td><td><strong>${activeEvent.timeStr}</strong></td></tr>` : ''}
      ${activeEvent.location ? `<tr><td style="padding: 6px 0;">📍</td><td><strong>${activeEvent.location}</strong></td></tr>` : ''}
      ${activeEvent.ageGroup ? `<tr><td style="padding: 6px 0;">🎂</td><td>Dobna skupina: <strong>${activeEvent.ageGroup}</strong></td></tr>` : ''}
      ${activeEvent.price ? `<tr><td style="padding: 6px 0;">💳</td><td>Kotizacija: <strong>${activeEvent.price}</strong></td></tr>` : ''}
    </table>
  </div>
  ` : ''}
  
  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="font-size: 15px; margin: 0; color: #666666;">
      Srdačan pozdrav,<br>
      <strong style="color: #333333; font-size: 16px;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.
    </p>
  </div>
</div>
      `;

      try {
        await emailjs.send(
          'default_service',
          'template_uuvkcp3',
          {
            name: selectedPrijava.imePrezime.split(' ')[0],
            email: selectedPrijava.email,
            subject: "Tvoja prijava je na listi čekanja! ⏳",
            html_message: htmlMessage
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error("Greška pri slanju emaila o listi čekanja: ", emailErr);
        alert("Status je ažuriran, ali slanje emaila nije uspjelo.");
      }

      setSelectedPrijava({ ...selectedPrijava, status: 'waiting_list' });
      setWaitlistModalOpen(false);
      fetchPrijave(selectedEventId);
      fetchEvents();
    } catch (err) {
      console.error("Greška pri postavljanju na listu čekanja:", err);
      alert("Dogodila se greška prilikom postavljanja prijave na listu čekanja.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEventActive = async (eventToToggle: EventData) => {
    try {
      const targetRef = doc(db, 'events', eventToToggle.id);
      await updateDoc(targetRef, { isActive: !eventToToggle.isActive });
      fetchEvents();
    } catch (err) {
      console.error("Error toggling event:", err);
      setError("Greška pri promjeni statusa događaja.");
    }
  };

  const setEventMatchingPhase = async (eventToUpdate: EventData, phase: 'live' | 'post_event' | 'closed') => {
    try {
      const targetRef = doc(db, 'events', eventToUpdate.id);
      if (phase === 'closed') {
        await updateDoc(targetRef, {
          isMatchingActive: false,
          matchingPhase: 'closed'
        });
      } else {
        await updateDoc(targetRef, {
          isMatchingActive: true,
          matchingPhase: phase
        });
      }
      fetchEvents();
    } catch (err) {
      console.error("Error setting matching phase:", err);
      setError("Greška pri promjeni statusa matchinga.");
    }
  };

  const openFinishLiveMatchingModal = async (eventItem: EventData) => {
    setSelectedEventForMatches(eventItem);
    setFinishLiveModalOpen(true);
    setLoadingLiveStats(true);
    setPublishSuccessMsg('');
    setError('');

    try {
      // 1. Fetch all accepted registrations for this event
      const qPrijave = query(
        collection(db, 'prijave'),
        where('eventId', '==', eventItem.id),
        where('status', '==', 'accepted')
      );
      const prijaveSnap = await getDocs(qPrijave);
      const prijavaMap = new Map<string, any>();
      let maleCount = 0;
      let femaleCount = 0;

      prijaveSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.uid) {
          prijavaMap.set(data.uid, { id: docSnap.id, ...data });
          const g = (data.spol || '').trim().toUpperCase();
          if (g === 'M' || g === 'MUŠKO' || g === 'MUSKO') {
            maleCount++;
          } else {
            femaleCount++;
          }
        }
      });

      // 2. Fetch all event_likes for this event
      const qLikes = query(
        collection(db, 'event_likes'),
        where('eventId', '==', eventItem.id)
      );
      const likesSnap = await getDocs(qLikes);
      let totalVotes = 0;
      let likesCount = 0;
      let passesCount = 0;
      const votedUsersSet = new Set<string>();
      const positiveLikesSet = new Set<string>(); // "fromUid->toUid"

      likesSnap.forEach(docSnap => {
        const data = docSnap.data();
        totalVotes++;
        if (data.fromUid) votedUsersSet.add(data.fromUid);
        if (data.liked === true) {
          likesCount++;
          if (data.fromUid && data.toUid) {
            positiveLikesSet.add(`${data.fromUid}->${data.toUid}`);
          }
        } else {
          passesCount++;
        }
      });

      // 3. Detect mutual matches
      const mutualPairs: any[] = [];
      const processedPairs = new Set<string>();

      positiveLikesSet.forEach(key => {
        const [u1, u2] = key.split('->');
        const reciprocalKey = `${u2}->${u1}`;
        const pairId = [u1, u2].sort().join('_');

        if (positiveLikesSet.has(reciprocalKey) && !processedPairs.has(pairId)) {
          processedPairs.add(pairId);

          const p1 = prijavaMap.get(u1);
          const p2 = prijavaMap.get(u2);

          if (p1 && p2) {
            const g1 = (p1.spol || '').trim().toUpperCase();
            const p1IsMale = g1 === 'M' || g1 === 'MUŠKO' || g1 === 'MUSKO';

            const male = p1IsMale ? p1 : p2;
            const female = p1IsMale ? p2 : p1;

            const maleName = male.imePrezime || 'Sudionik';
            const femaleName = female.imePrezime || 'Sudionica';
            const maleEmail = male.email || '';
            const femaleEmail = female.email || '';

            const maleIg = male.contactInstagram || (male.contactHandle?.startsWith('@') ? male.contactHandle : '');
            const malePhone = male.contactPhone || (!male.contactHandle?.startsWith('@') && !isNaN(Number(male.contactHandle?.replace(/[\s+-]/g, ''))) ? male.contactHandle : '');

            const femaleIg = female.contactInstagram || (female.contactHandle?.startsWith('@') ? female.contactHandle : '');
            const femalePhone = female.contactPhone || (!female.contactHandle?.startsWith('@') && !isNaN(Number(female.contactHandle?.replace(/[\s+-]/g, ''))) ? female.contactHandle : '');

            const maleContact = [maleIg, malePhone].filter(Boolean).join(' • ');
            const femaleContact = [femaleIg, femalePhone].filter(Boolean).join(' • ');

            mutualPairs.push({
              pairId,
              maleUid: male.uid,
              femaleUid: female.uid,
              maleName,
              femaleName,
              maleEmail,
              femaleEmail,
              maleInstagram: maleIg,
              malePhone,
              maleContact,
              femaleInstagram: femaleIg,
              femalePhone,
              femaleContact,
              eventId: eventItem.id,
              eventTitle: eventItem.title,
              eventDate: eventItem.dateStr || ''
            });
          }
        }
      });

      setLiveStatsData({
        totalVotes,
        likesCount,
        passesCount,
        mutualMatches: mutualPairs,
        maleCount,
        femaleCount,
        votedUsersCount: votedUsersSet.size
      });
    } catch (err) {
      console.error("Greška pri dohvatu live statistike:", err);
      setError("Greška pri dohvatu statistike za live matching.");
    } finally {
      setLoadingLiveStats(false);
    }
  };

  const executePublishLiveMatches = async () => {
    if (!selectedEventForMatches || !liveStatsData) return;
    setPublishingMatches(true);
    setError('');

    try {
      const matches = liveStatsData.mutualMatches;
      let emailSuccessCount = 0;
      let emailFailCount = 0;

      for (const m of matches) {
        const matchDocId = `${selectedEventForMatches.id}_${m.pairId}`;

        // Save to event_matches
        await setDoc(doc(db, 'event_matches', matchDocId), {
          eventId: selectedEventForMatches.id,
          eventTitle: selectedEventForMatches.title || 'Speed Dating',
          eventDate: selectedEventForMatches.dateStr || '',
          maleUid: m.maleUid,
          femaleUid: m.femaleUid,
          maleName: m.maleName,
          femaleName: m.femaleName,
          maleEmail: m.maleEmail,
          femaleEmail: m.femaleEmail,
          maleInstagram: m.maleInstagram,
          malePhone: m.malePhone,
          maleContact: m.maleContact,
          femaleInstagram: m.femaleInstagram,
          femalePhone: m.femalePhone,
          femaleContact: m.femaleContact,
          createdAt: serverTimestamp(),
          publishedDuringLiveConclusion: true
        }, { merge: true });

        // Send EmailJS to male participant
        if (m.maleEmail) {
          try {
            await sendMatchEmail({
              eventTitle: selectedEventForMatches.title || 'Speed Dating',
              maleName: m.maleName,
              femaleName: m.femaleName,
              maleEmail: m.maleEmail,
              femaleEmail: m.femaleEmail,
              femaleInstagram: m.femaleInstagram,
              femalePhone: m.femalePhone
            });
            emailSuccessCount++;
          } catch (emailErr) {
            console.error(`Greška pri slanju maila za ${m.maleEmail}:`, emailErr);
            emailFailCount++;
          }
        }
      }

      // Update event to post_event phase
      await updateDoc(doc(db, 'events', selectedEventForMatches.id), {
        isMatchingActive: true,
        matchingPhase: 'post_event'
      });

      await fetchEvents();

      setPublishSuccessMsg(
        `Uspješno objavljeno ${matches.length} obostranih matcheva! Poslano ${emailSuccessCount} emailova.${emailFailCount > 0 ? ` (${emailFailCount} nije uspjelo poslati)` : ''} Post-event matching je sada otvoren!`
      );
    } catch (err) {
      console.error("Greška pri objavi matcheva:", err);
      setError("Došlo je do greške prilikom objave matcheva.");
    } finally {
      setPublishingMatches(false);
    }
  };

  const handleResendMatchEmail = async (m: any) => {
    if (!m.maleEmail) {
      alert("Nema zabilježene email adrese za muškog sudionika.");
      return;
    }
    try {
      await sendMatchEmail({
        eventTitle: m.eventTitle || selectedEventForMatches?.title || 'Speed Dating',
        maleName: m.maleName,
        femaleName: m.femaleName,
        maleEmail: m.maleEmail,
        femaleEmail: m.femaleEmail,
        femaleInstagram: m.femaleInstagram,
        femalePhone: m.femalePhone
      });
      alert(`Email o matchu uspješno poslan na ${m.maleEmail}!`);
    } catch (err) {
      console.error("Greška pri ponovnom slanju emaila:", err);
      alert("Došlo je do greške prilikom slanja emaila.");
    }
  };

  const openMatchesModal = async (eventItem: EventData) => {
    setSelectedEventForMatches(eventItem);
    setMatchesModalOpen(true);
    setLoadingMatchesModal(true);
    try {
      const q = query(collection(db, 'event_matches'), where('eventId', '==', eventItem.id));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEventMatchesList(list);
    } catch (err) {
      console.error("Greška pri dohvaćanju matcheva:", err);
    } finally {
      setLoadingMatchesModal(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-peach flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  if (!user || !ADMIN_UIDS.includes(user.uid)) {
    return <Navigate to="/" replace />;
  }

  // Calculate statistics for currently displayed prijave (isključivo prihvaćene/potvrđene prijave)
  const validPrijave = prijave.filter(p => p.status === 'accepted');
  const total = validPrijave.length;
  const femaleCount = validPrijave.filter(p => p.spol === 'Ž' || p.spol === 'Z' || p.spol.toLowerCase() === 'žensko').length;
  const maleCount = validPrijave.filter(p => p.spol === 'M' || p.spol.toLowerCase() === 'muško').length;
  const avgAge = total > 0 ? (validPrijave.reduce((sum, p) => sum + (Number(p.godine) || 0), 0) / total).toFixed(1) : 0;

  // Zauzeta mjesta u bazi pod događajem: broje se sve prijave dokle god nisu odbijene, otkazane ili na listi čekanja
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const dbOccupiedCount = prijave.filter(p => p.status !== 'rejected' && p.status !== 'cancelled' && p.status !== 'waiting_list').length;

  const handleSyncRegistrationCount = async () => {
    if (!selectedEventId || !selectedEvent) return;
    try {
      await updateDoc(doc(db, 'events', selectedEventId), {
        registrationCount: dbOccupiedCount
      });
      await fetchEvents();
      alert(`Brojač zauzetih mjesta u bazi za događaj "${selectedEvent.title}" uspješno je usklađen na: ${dbOccupiedCount}`);
    } catch (err) {
      console.error("Greška pri sinkronizaciji brojača:", err);
      alert("Došlo je do greške prilikom sinkronizacije brojača.");
    }
  };

  const totalAll = prijave.length;
  const approvedCount = prijave.filter(p => p.status === 'accepted').length;
  const rejectedCount = prijave.filter(p => p.status === 'rejected').length;
  const pendingCount = prijave.filter(p => p.status === 'pending' || !p.status).length;
  const waitingListCount = prijave.filter(p => p.status === 'waiting_list').length;
  const cancelledCount = prijave.filter(p => p.status === 'cancelled').length;

  const displayedPrijave = prijave.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return p.status === 'pending' || !p.status;
    return p.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-brand/70 hover:text-brand mb-2 transition-colors font-medium">
              <ArrowLeft size={16} /> Natrag na naslovnicu
            </Link>
            <h1 className="text-3xl font-serif font-bold text-brand">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Upravljanje prijavama i događajima</p>
          </div>

          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('prijave')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'prijave' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={16} /> Prijave
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'events' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <CalendarIcon size={16} /> Događaji
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-serif text-brand">Događaji</h2>
                <button
                  onClick={() => {
                    if (showNewEventForm && !editingEventId) {
                      handleCancelEdit();
                    } else {
                      handleCancelEdit();
                      setShowNewEventForm(true);
                    }
                  }}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-light transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Novi Događaj
                </button>
              </div>

              {showNewEventForm && (
                <form onSubmit={handleSaveEvent} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">{editingEventId ? 'Uredi događaj' : 'Kreiraj novi događaj'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Naziv događaja (npr. Speed Dating Zagreb)</label>
                      <input required type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Dobna skupina (npr. 20–25 godina)</label>
                      <input required type="text" value={newEvent.ageGroup} onChange={e => setNewEvent({ ...newEvent, ageGroup: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Datum (npr. 17. rujna 2026.)</label>
                      <input required type="text" value={newEvent.dateStr} onChange={e => setNewEvent({ ...newEvent, dateStr: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vrijeme (npr. 19:00)</label>
                      <input required type="text" value={newEvent.timeStr} onChange={e => setNewEvent({ ...newEvent, timeStr: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Lokacija (npr. Café de Paris, Zagreb)</label>
                      <input required type="text" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cijena / Kotizacija (npr. 10 € (uključena 2 pića))</label>
                      <input required type="text" value={newEvent.price} onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Maksimalan broj prijava (ostavi prazno za neograničeno)</label>
                      <input type="number" min="1" value={newEvent.maxRegistrations} onChange={e => setNewEvent({ ...newEvent, maxRegistrations: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="Npr. 40" />
                    </div>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-700">Dodatna prilagođena polja (opcionalno)</h4>
                      <button
                        type="button"
                        onClick={() => setNewCustomFields([...newCustomFields, { id: `cf_${Date.now()}`, label: '', type: 'text', required: false }])}
                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Dodaj polje
                      </button>
                    </div>

                    {newCustomFields.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Nema dodanih prilagođenih polja.</p>
                    ) : (
                      <div className="space-y-3">
                        {newCustomFields.map((field, index) => (
                          <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                            <button
                              type="button"
                              onClick={() => setNewCustomFields(newCustomFields.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                              title="Obriši polje"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Naziv polja (Pitanje)</label>
                                <input
                                  required
                                  type="text"
                                  value={field.label}
                                  onChange={e => {
                                    const updated = [...newCustomFields];
                                    updated[index].label = e.target.value;
                                    setNewCustomFields(updated);
                                  }}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-brand focus:border-brand"
                                  placeholder="Npr. Vaš Instagram profil"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tip polja</label>
                                <button
                                  type="button"
                                  onClick={() => setOpenFieldDropdownIndex(openFieldDropdownIndex === index ? null : index)}
                                  className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                                >
                                  <span className="truncate pr-2">
                                    {field.type === 'text' && 'Kratki tekst'}
                                    {field.type === 'textarea' && 'Dugi tekst (Više linija)'}
                                    {field.type === 'select' && 'Odabir jednog (Radio/Dropdown)'}
                                    {field.type === 'multiselect' && 'Odabir više (Checkboxes)'}
                                  </span>
                                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${openFieldDropdownIndex === index ? 'rotate-180' : ''}`} />
                                </button>

                                {openFieldDropdownIndex === index && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenFieldDropdownIndex(null)}></div>
                                    <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1">
                                      {[
                                        { value: 'text', label: 'Kratki tekst' },
                                        { value: 'textarea', label: 'Dugi tekst (Više linija)' },
                                        { value: 'select', label: 'Odabir jednog (Radio/Dropdown)' },
                                        { value: 'multiselect', label: 'Odabir više (Checkboxes)' }
                                      ].map(option => (
                                        <button
                                          key={option.value}
                                          type="button"
                                          onClick={() => {
                                            const updated = [...newCustomFields];
                                            updated[index].type = option.value as any;
                                            setNewCustomFields(updated);
                                            setOpenFieldDropdownIndex(null);
                                          }}
                                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${field.type === option.value ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                          {option.label}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {(field.type === 'select' || field.type === 'multiselect') && (
                              <div className="mb-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Opcije (odvojene zarezom)</label>
                                <input
                                  required
                                  type="text"
                                  value={field.rawOptions !== undefined ? field.rawOptions : (field.options?.join(', ') || '')}
                                  onChange={e => {
                                    const updated = [...newCustomFields];
                                    updated[index].rawOptions = e.target.value;
                                    setNewCustomFields(updated);
                                  }}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-brand focus:border-brand"
                                  placeholder="Opcija 1, Opcija 2, Opcija 3"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`req_${field.id}`}
                                checked={field.required}
                                onChange={e => {
                                  const updated = [...newCustomFields];
                                  updated[index].required = e.target.checked;
                                  setNewCustomFields(updated);
                                }}
                                className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
                              />
                              <label htmlFor={`req_${field.id}`} className="text-xs font-medium text-gray-700 cursor-pointer">Obavezno polje</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Live pregled i uređivanje E-maila (potvrda prijave)</h4>
                    <p className="text-xs text-gray-500 mb-6">Uredi tekst u isprekidanim okvirima ispod. Podaci iz gornjih polja (datum, cijena...) se automatski ubacuju u mail.</p>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm font-sans" style={{ maxWidth: '600px', margin: '0 auto' }}>
                      <div className="text-center mb-6 pb-5 border-b border-gray-100">
                        <h1 className="text-[#E85D75] text-2xl font-bold uppercase tracking-wider mb-1">Na prvi pogled</h1>
                        <p className="text-gray-500 text-sm">Potvrda prijave za speed dating</p>
                      </div>

                      <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                          <button type="button" onClick={() => setPreviewGender('Ž')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${previewGender === 'Ž' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}>Ženska osoba</button>
                          <button type="button" onClick={() => setPreviewGender('M')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${previewGender === 'M' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}>Muška osoba</button>
                        </div>
                      </div>

                      <p className="mb-4">{previewGender === 'M' ? 'Dragi' : 'Draga'} <strong>[Ime Korisnika]</strong>,</p>

                      <textarea
                        required
                        value={previewGender === 'M' ? (newEvent.introTextM ?? '') : (newEvent.introTextZ ?? '')}
                        onChange={e => previewGender === 'M' ? setNewEvent({ ...newEvent, introTextM: e.target.value }) : setNewEvent({ ...newEvent, introTextZ: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-gray-50 text-gray-700 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-1 text-sm"
                        rows={2}
                      />

                      <div className="bg-[#FFF0F2] border-l-4 border-[#E85D75] p-4 my-6 rounded-r-lg">
                        <p className="text-[#E85D75] font-bold m-0">Ovim mailom potvrđujemo tvoju prijavu!</p>
                      </div>

                      <textarea
                        required
                        value={previewGender === 'M' ? (newEvent.middleTextM ?? '') : (newEvent.middleTextZ ?? '')}
                        onChange={e => previewGender === 'M' ? setNewEvent({ ...newEvent, middleTextM: e.target.value }) : setNewEvent({ ...newEvent, middleTextZ: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-gray-50 text-gray-700 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-1 text-sm"
                        rows={2}
                      />

                      <textarea
                        required
                        value={previewGender === 'M' ? (newEvent.noteTextM ?? '') : (newEvent.noteTextZ ?? '')}
                        onChange={e => previewGender === 'M' ? setNewEvent({ ...newEvent, noteTextM: e.target.value }) : setNewEvent({ ...newEvent, noteTextZ: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-[#f9f9f9] text-gray-600 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-6 text-sm"
                        rows={2}
                      />

                      <div className="my-8 py-5 border-y border-gray-100">
                        <h3 className="text-gray-800 font-bold mb-4 uppercase text-sm">Detalji eventa:</h3>
                        <table className="w-full text-sm">
                          <tbody>
                            <tr><td className="py-2 w-8 text-lg">📅</td><td className="py-2"><strong>{newEvent.dateStr || '[Datum]'}</strong></td></tr>
                            <tr><td className="py-2 text-lg">🕖</td><td className="py-2"><strong>{newEvent.timeStr || '[Vrijeme]'}</strong></td></tr>
                            <tr>
                              <td className="py-2 text-lg align-top pt-3">⏰</td>
                              <td className="py-2">
                                <textarea
                                  required
                                  value={previewGender === 'M' ? (newEvent.timeNoteM ?? '') : (newEvent.timeNoteZ ?? '')}
                                  onChange={e => previewGender === 'M' ? setNewEvent({ ...newEvent, timeNoteM: e.target.value }) : setNewEvent({ ...newEvent, timeNoteZ: e.target.value })}
                                  className="w-full px-2 py-1 rounded border border-dashed border-gray-300 bg-[#f9f9f9] text-[#E85D75] font-semibold resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand text-sm m-0"
                                  rows={2}
                                />
                              </td>
                            </tr>
                            <tr><td className="py-2 text-lg">📍</td><td className="py-2"><strong>{newEvent.location || '[Lokacija]'}</strong></td></tr>
                            <tr><td className="py-2 text-lg">🎂</td><td className="py-2">Dobna skupina: <strong>{newEvent.ageGroup || '[Dob]'}</strong></td></tr>
                            <tr><td className="py-2 text-lg">💳</td><td className="py-2">Kotizacija: <strong>{newEvent.price || '[Cijena]'}</strong></td></tr>
                          </tbody>
                        </table>
                      </div>

                      <textarea
                        required
                        value={previewGender === 'M' ? (newEvent.closingTextM ?? '') : (newEvent.closingTextZ ?? '')}
                        onChange={e => previewGender === 'M' ? setNewEvent({ ...newEvent, closingTextM: e.target.value }) : setNewEvent({ ...newEvent, closingTextZ: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-[#fafafa] text-gray-700 text-center resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-8 text-sm"
                        rows={4}
                      />

                      <div className="text-center mt-10 mb-5">
                        <p className="text-lg font-bold text-[#E85D75]">Vidimo se uskoro! ✨</p>
                      </div>
                      <div className="mt-8 border-t border-gray-100 pt-5">
                        <p className="text-sm text-gray-500 m-0 leading-relaxed">Srdačan pozdrav,<br /><strong className="text-gray-700">Ivan</strong><br />Na prvi pogled<br />Upoznaj nekoga, kao nekad.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Odustani</button>
                    <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-light">{editingEventId ? 'Spremi promjene' : 'Spremi događaj'}</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {eventsLoading ? (
                  <p className="text-gray-500 py-4 flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Učitavanje...</p>
                ) : events.length === 0 ? (
                  <p className="text-gray-500 py-4">Nema kreiranih događaja.</p>
                ) : (
                  events.map(event => (
                    <div key={event.id} className={`p-4 rounded-xl border ${event.isActive ? 'border-brand bg-brand/5' : 'border-gray-200 bg-white'} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          {event.isActive && <span className="bg-brand text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Prijave Aktivne</span>}
                          {event.matchingPhase === 'live' && (
                            <span className="bg-amber-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-xs">
                              <Flame size={12} /> Matching Uživo (Tijekom eventa)
                            </span>
                          )}
                          {event.matchingPhase === 'post_event' && (
                            <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Heart size={12} /> Post-Event Matching Aktivan
                            </span>
                          )}
                          {event.isMatchingActive && !event.matchingPhase && (
                            <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-xs">
                              <Flame size={12} /> Matching Aktivan
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{event.dateStr} u {event.timeStr} • {event.location}</p>
                        <p className="text-xs text-gray-500 mt-1">Dob: {event.ageGroup} | Cijena: {event.price} | Zauzeta mjesta u bazi: <strong className="text-gray-700">{event.registrationCount || 0}</strong>{event.maxRegistrations ? ` / ${event.maxRegistrations}` : ''}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openMatchesModal(event)}
                          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 cursor-pointer"
                          title="Pregledaj obostrane matcheve za ovaj događaj"
                        >
                          <Heart size={16} className="text-rose-600" />
                          <span className="hidden sm:inline">Matchevi</span>
                        </button>

                        {/* Matching Phase Controls */}
                        {event.matchingPhase === 'live' ? (
                          <>
                            <button
                              onClick={() => openFinishLiveMatchingModal(event)}
                              className="px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all bg-gradient-to-r from-rose-500 to-brand hover:from-rose-600 hover:to-brand-light text-white shadow-md hover:shadow-lg cursor-pointer animate-pulse"
                              title="Završi noćni matching, pošalji mailove i otvori post-event matching"
                            >
                              <Sparkles size={16} />
                              <span>Završi noć & Objavi matcheve</span>
                            </button>
                            <button
                              onClick={() => setEventMatchingPhase(event, 'closed')}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                              title="Zaustavi matching bez objave"
                            >
                              Zaustavi
                            </button>
                          </>
                        ) : event.matchingPhase === 'post_event' ? (
                          <button
                            onClick={() => setEventMatchingPhase(event, 'closed')}
                            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 cursor-pointer"
                            title="Zatvori post-event matching"
                          >
                            <Flame size={16} className="text-rose-600" />
                            <span>Zatvori Matching</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEventMatchingPhase(event, 'live')}
                              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
                              title="Pokreni matching za sudionike tijekom večeri (tajno glasanje bez ometanja)"
                            >
                              <Flame size={16} />
                              <span>Pokreni Matching Uživo</span>
                            </button>
                            <button
                              onClick={() => setEventMatchingPhase(event, 'post_event')}
                              className="px-2.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                              title="Pokreni direktno post-event matching (ako je susret već završio)"
                            >
                              Otvori Post-Event
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => openEditEvent(event)}
                          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors bg-white hover:bg-gray-100 border border-gray-200 text-gray-700"
                        >
                          <Pencil size={16} /> <span className="hidden sm:inline">Uredi</span>
                        </button>
                        <button
                          onClick={() => toggleEventActive(event)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${event.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}
                        >
                          {event.isActive ? <><StopCircle size={16} /> Završi prijave</> : <><PlayCircle size={16} /> Otvori prijave</>}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prijave' && (
          <>
            {/* Filter */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <CalendarIcon size={16} className="text-brand" /> Prikaži prijave za događaj:
              </label>

              <div className="relative w-full sm:w-80">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <span className="truncate pr-4 font-medium">
                    {selectedEventId === ''
                      ? '-- Svi događaji (Stare prijave) --'
                      : events.find(e => e.id === selectedEventId)?.title || 'Nepoznat događaj'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {filterDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setFilterDropdownOpen(false)}></div>
                    <div className="absolute z-40 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 max-h-60 overflow-y-auto transform opacity-100 scale-100 transition-all origin-top">
                      <button
                        onClick={() => {
                          setSelectedEventId('');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${selectedEventId === '' ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        -- Svi događaji (Stare prijave) --
                      </button>
                      {events.map(e => (
                        <button
                          key={e.id}
                          onClick={() => {
                            setSelectedEventId(e.id);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex flex-col ${selectedEventId === e.id ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <span className="flex items-center justify-between w-full">
                            <span className="truncate">{e.title}</span>
                            {e.isActive && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">Aktivno</span>}
                          </span>
                          <span className="text-xs text-gray-400 font-normal mt-0.5">{e.dateStr}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="ml-auto flex items-center gap-3 flex-wrap">
                {selectedEvent && (
                  <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-600">
                    <span>Zauzeta mjesta u bazi:</span>
                    <strong className="text-brand font-bold text-sm">{selectedEvent.registrationCount ?? 0}</strong>
                    {selectedEvent.maxRegistrations ? <span className="text-gray-400">/ {selectedEvent.maxRegistrations}</span> : ''}
                  </div>
                )}
                {selectedEvent && (selectedEvent.registrationCount ?? 0) !== dbOccupiedCount && (
                  <button
                    onClick={handleSyncRegistrationCount}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Uskladi brojač u bazi s prijavama koje nisu odbijene ili na listi čekanja"
                  >
                    Uskladi bazu ({dbOccupiedCount})
                  </button>
                )}
                <button
                  onClick={() => {
                    fetchPrijave(selectedEventId);
                    fetchEvents();
                  }}
                  className="bg-brand/10 text-brand px-5 py-3 rounded-xl text-sm font-semibold hover:bg-brand/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Osvježi
                </button>
              </div>
            </div>

            {/* Statistics Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-brand/10 p-3 rounded-full text-brand">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sve prijave</p>
                  <p className="text-2xl font-bold">{totalAll}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Odobreno</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Na čekanju</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Lista čekanja</p>
                  <p className="text-2xl font-bold text-amber-600">{waitingListCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Odbijeno</p>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                  <UserX size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Otkazano</p>
                  <p className="text-2xl font-bold text-gray-700">{cancelledCount}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Važeće prijave (Potvrđeno)</p>
                  <p className="text-2xl font-bold text-green-700">{total}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Samo odobreni sudionici</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Žene (Važeće)</p>
                  <p className="text-2xl font-bold">{femaleCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Muškarci (Važeće)</p>
                  <p className="text-2xl font-bold">{maleCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                  <ArrowDown01 size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Prosjek godina</p>
                  <p className="text-2xl font-bold">{avgAge}</p>
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 mr-2">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-brand text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Sve ({totalAll})
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'accepted' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-green-50 border border-gray-200'
                }`}
              >
                Odobreno ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-yellow-50 border border-gray-200'
                }`}
              >
                Na čekanju ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('waiting_list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'waiting_list' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                Lista čekanja ({waitingListCount})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-red-50 border border-gray-200'
                }`}
              >
                Odbijeno ({rejectedCount})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'cancelled' ? 'bg-gray-700 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Otkazano ({cancelledCount})
              </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ime i prezime</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spol</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Godine</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Napomena</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Učitavanje podataka...
                          </div>
                        </td>
                      </tr>
                    ) : displayedPrijave.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          Nema prijava za odabrani filter.
                        </td>
                      </tr>
                    ) : (
                      displayedPrijave.map((prijava) => (
                        <tr
                          key={prijava.id}
                          onClick={() => setSelectedPrijava(prijava)}
                          className={`cursor-pointer transition-colors group ${
                            prijava.status === 'cancelled'
                              ? 'bg-gray-50/70 hover:bg-gray-100/80 opacity-75'
                              : 'hover:bg-brand/5'
                          }`}
                        >
                          <td className="p-4 font-medium text-brand group-hover:text-brand-light flex items-center gap-1.5">
                            {prijava.status === 'cancelled' && <UserX size={14} className="text-gray-400 flex-shrink-0" />}
                            <span>{prijava.imePrezime}</span>
                          </td>
                          <td className="p-4 text-gray-600 text-sm">{prijava.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${prijava.spol === 'Ž' ? 'bg-pink-100 text-pink-700' :
                              prijava.spol === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {prijava.spol}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{prijava.godine}</td>
                          <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={prijava.napomena}>
                            {prijava.napomena || '-'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prijava.status === 'pending' || !prijava.status ? 'bg-yellow-100 text-yellow-800' :
                              prijava.status === 'waiting_list' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              prijava.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              prijava.status === 'cancelled' ? 'bg-gray-200 text-gray-700 border border-gray-300' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {prijava.status === 'pending' || !prijava.status ? 'Na čekanju' :
                               prijava.status === 'waiting_list' ? 'Lista čekanja' :
                               prijava.status === 'rejected' ? 'Odbijeno' :
                               prijava.status === 'cancelled' ? 'Otkazano' :
                               'Prihvaćeno'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs">
                            {prijava.createdAt?.toDate ? prijava.createdAt.toDate().toLocaleString('hr-HR') : 'Nedavno'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal za prikaz detalja prijave */}
      {selectedPrijava && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-brand">Detalji Prijave</h3>
              <button
                onClick={() => setSelectedPrijava(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-sm font-semibold ${
                  selectedPrijava.status === 'pending' || !selectedPrijava.status ? 'bg-yellow-100 text-yellow-800' :
                  selectedPrijava.status === 'waiting_list' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  selectedPrijava.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  selectedPrijava.status === 'cancelled' ? 'bg-gray-200 text-gray-800 border border-gray-300' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedPrijava.status === 'pending' || !selectedPrijava.status ? 'Status: Na čekanju' :
                   selectedPrijava.status === 'waiting_list' ? 'Status: Na listi čekanja' :
                   selectedPrijava.status === 'rejected' ? 'Status: Odbijeno' :
                   selectedPrijava.status === 'cancelled' ? 'Status: Otkazana prijava' :
                   'Status: Prihvaćeno'}
                </span>
              </div>

              {selectedPrijava.status === 'waiting_list' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-950 block text-sm">Korisnik je na listi čekanja</span>
                    <span className="text-amber-800">
                      Ova prijava trenutačno ne zauzima kapacitet mjesta. U bilo kojem trenutku možete je naknadno prihvatiti ili odbiti, pri čemu će korisnik primiti odgovarajući email.
                    </span>
                  </div>
                </div>
              )}

              {selectedPrijava.status === 'cancelled' && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-start gap-3">
                  <UserX size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-800 block text-sm">Korisnik je samostalno otkazao prijavu</span>
                    <span className="text-gray-500">
                      Mjesto na događaju je automatski oslobođeno kada se korisnik odjavio sa svog profila.
                    </span>
                    {selectedPrijava.cancelledAt && (
                      <div className="mt-1 font-medium text-gray-700">
                        Datum i vrijeme odjave: {selectedPrijava.cancelledAt?.toDate ? selectedPrijava.cancelledAt.toDate().toLocaleString('hr-HR') : 'Nedavno'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Osnovni podaci</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Ime i prezime</p>
                    <p className="font-semibold text-gray-800">{selectedPrijava.imePrezime}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{selectedPrijava.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Spol</p>
                    <p className="font-semibold text-gray-800">{selectedPrijava.spol}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Godine</p>
                    <p className="font-semibold text-gray-800">{selectedPrijava.godine}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4">
                  <p className="text-xs text-gray-500 mb-1">Napomena</p>
                  <p className="font-medium text-gray-800 whitespace-pre-wrap">{selectedPrijava.napomena || 'Nema napomene'}</p>
                </div>
              </div>

              {selectedPrijava.customAnswers && selectedPrijava.customAnswers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Prilagođena polja</h4>
                  <div className="space-y-3">
                    {selectedPrijava.customAnswers.map((answer, i) => (
                      <div key={i} className="bg-brand/5 p-4 rounded-lg border border-brand/10">
                        <p className="text-xs font-semibold text-brand/70 mb-1">{answer.label}</p>
                        <p className="font-medium text-gray-900">
                          {Array.isArray(answer.value) ? answer.value.join(', ') : (answer.value?.toString() || '-')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Trash2 size={16} /> Izbriši
                </button>
                {(selectedPrijava.status === 'pending' || selectedPrijava.status === 'cancelled' || selectedPrijava.status === 'waiting_list') && (
                  <button
                    onClick={() => handleAcceptPrijava(selectedPrijava)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> {
                      selectedPrijava.status === 'cancelled' ? 'Reaktiviraj i prihvati' :
                      selectedPrijava.status === 'waiting_list' ? 'Prihvati s liste čekanja' :
                      'Prihvati'
                    }
                  </button>
                )}
                {selectedPrijava.status === 'pending' && (
                  <button
                    onClick={() => setWaitlistModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Clock size={16} /> Stavi na listu čekanja
                  </button>
                )}
                {(selectedPrijava.status === 'pending' || selectedPrijava.status === 'waiting_list') && (
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <X size={16} /> Odbij
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPrijava(null)}
                className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedPrijava && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-brand flex items-center gap-2">
                <X size={20} className="text-yellow-600" />
                Odbijanje Prijave
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {selectedPrijava.status === 'waiting_list' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  ⏳ <strong>Korisnik je na listi čekanja:</strong> Prema postavkama sustava, kandidat je u inicijalnom emailu za listu čekanja već obaviješten da ćemo se javiti isključivo ako bude prihvaćen. Radi uštede limita, <strong>email odbijenice se neće slati</strong>. Status će se promijeniti u <em>Odbijeno</em>.
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Odaberi razlog odbijanja za korisnika <strong>{selectedPrijava.imePrezime}</strong>. Ovaj tekst bit će uključen u email poruku.
                  </p>

                  <div className="relative mb-6">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Razlog odbijanja</label>
                    <button
                      type="button"
                      onClick={() => setRejectDropdownOpen(!rejectDropdownOpen)}
                      className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                      <span className="truncate pr-2 font-medium">
                        {REJECT_REASONS.find(r => r.text === rejectReason)?.label || 'Prilagođeni razlog'}
                      </span>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${rejectDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {rejectDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setRejectDropdownOpen(false)}></div>
                        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                          {REJECT_REASONS.map(option => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setRejectReason(option.text);
                                setRejectDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors ${rejectReason === option.text ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tekst u emailu</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-brand focus:border-brand text-sm bg-gray-50 min-h-[100px]"
                      placeholder="Unesite razlog odbijanja..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Možeš urediti tekst prije slanja.</p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Odustani
              </button>
              <button
                onClick={confirmRejectPrijava}
                disabled={actionLoading || (selectedPrijava.status !== 'waiting_list' && !rejectReason.trim())}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                {selectedPrijava.status === 'waiting_list' ? 'Potvrdi odbijanje (bez emaila)' : 'Potvrdi i pošalji email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {waitlistModalOpen && selectedPrijava && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-amber-700 flex items-center gap-2">
                <Clock size={20} className="text-amber-600" />
                Stavljanje na Listu Čekanja
              </h3>
              <button
                onClick={() => setWaitlistModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Kandidata <strong>{selectedPrijava.imePrezime}</strong> stavljate na listu čekanja. Mjesto će biti oslobođeno na događaju, a korisnik će primiti email obavijest s navedenim tekstom.
              </p>

              <div className="relative mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Predložak objašnjenja</label>
                <button
                  type="button"
                  onClick={() => setWaitlistDropdownOpen(!waitlistDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <span className="truncate pr-2 font-medium">
                    {WAITLIST_REASONS.find(r => r.text === waitlistReason)?.label || 'Prilagođeni tekst'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${waitlistDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {waitlistDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setWaitlistDropdownOpen(false)}></div>
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                      {WAITLIST_REASONS.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setWaitlistReason(option.text);
                            setWaitlistDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${waitlistReason === option.text ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tekst objašnjenja u emailu</label>
                <textarea
                  value={waitlistReason}
                  onChange={(e) => setWaitlistReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-gray-50 min-h-[110px]"
                  placeholder="Unesite poruku za kandidata..."
                />
                <p className="text-xs text-gray-500 mt-1">Tekst možete dodatno urediti prema potrebi.</p>
              </div>

              <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                💡 <strong>Napomena:</strong> Kandidat ostaje evidentiran u sustavu pod statusom "Lista čekanja". Kasnije ga možete u bilo kojem trenutku odobriti ("Prihvati") ili odbiti po potrebi.
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setWaitlistModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Odustani
              </button>
              <button
                onClick={confirmWaitlistPrijava}
                disabled={actionLoading || !waitlistReason.trim()}
                className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                Potvrdi i pošalji email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedPrijava && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={20} className="text-red-500" />
                Brisanje prijave
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Jeste li sigurni da želite obrisati prijavu korisnika <strong className="text-gray-900">{selectedPrijava.imePrezime}</strong>?
              </p>
              <p className="text-sm text-red-500 font-medium">Ova akcija je nepovratna i trajno uklanja podatke.</p>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Odustani
              </button>
              <button
                onClick={confirmDeletePrijava}
                disabled={actionLoading}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Obriši prijavu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Matches Overview Modal */}
      {matchesModalOpen && selectedEventForMatches && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Heart size={22} className="text-rose-600 fill-rose-600" />
                  Ostvareni matchevi: {selectedEventForMatches.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Popis svih obostranih simpatija zabilježenih na ovom događaju ({eventMatchesList.length})
                </p>
              </div>
              <button
                onClick={() => setMatchesModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {loadingMatchesModal ? (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                  <Loader2 size={32} className="animate-spin mb-2" />
                  <p className="text-sm">Učitavanje matcheva...</p>
                </div>
              ) : eventMatchesList.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-semibold text-base mb-1">Nema zabilježenih matcheva</p>
                  <p className="text-xs text-gray-400">
                    {selectedEventForMatches.isMatchingActive 
                      ? "Matching je aktivan. Čim dvoje sudionika označe jedno drugo, pojavit će se ovdje." 
                      : "Matching za ovaj događaj trenutno nije aktivan. Pokrenite ga klikom na 'Pokreni Matching'."}
                  </p>
                </div>
              ) : (
                eventMatchesList.map((m, idx) => (
                  <div key={m.id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{m.maleName}</span>
                          <span className="text-rose-500 text-xs font-bold">💞</span>
                          <span className="font-bold text-gray-900">{m.femaleName}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                          <div>
                            <span className="font-semibold text-gray-600">M:</span> {m.maleContact || m.maleEmail || 'Nema kontakta'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Ž:</span> {m.femaleContact || m.femaleEmail || 'Nema kontakta'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleResendMatchEmail(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Pošalji obavijest muškom sudioniku na email"
                      >
                        <Send size={13} />
                        <span>Pošalji mail</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setMatchesModalOpen(false)}
                className="px-5 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINISH LIVE MATCHING & PUBLISH MODAL */}
      {finishLiveModalOpen && selectedEventForMatches && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-brand text-white flex items-center justify-center shadow-md">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Završi event & Objavi matcheve
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedEventForMatches.title} ({selectedEventForMatches.dateStr})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFinishLiveModalOpen(false)}
                disabled={publishingMatches}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingLiveStats ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                  <Loader2 size={36} className="animate-spin mb-3 text-brand" />
                  <p className="text-sm font-medium">Analiziranje noćnih glasova i traženje matcheva...</p>
                </div>
              ) : publishSuccessMsg ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Matchevi su uspješno objavljeni! 🎉</h4>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    {publishSuccessMsg}
                  </p>
                  <button
                    onClick={() => {
                      setFinishLiveModalOpen(false);
                      setPublishSuccessMsg('');
                    }}
                    className="px-6 py-2.5 bg-brand text-white font-semibold rounded-xl shadow-md hover:bg-brand-light transition-colors text-sm cursor-pointer"
                  >
                    U redu
                  </button>
                </div>
              ) : liveStatsData ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-xs text-gray-500 block">Sudionika</span>
                      <span className="text-lg font-bold text-gray-900">
                        {liveStatsData.maleCount + liveStatsData.femaleCount}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {liveStatsData.femaleCount} Ž / {liveStatsData.maleCount} M
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-xs text-gray-500 block">Glasovalo</span>
                      <span className="text-lg font-bold text-gray-900">
                        {liveStatsData.votedUsersCount}
                      </span>
                      <span className="text-[10px] text-gray-400 block">sudionika</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-xs text-gray-500 block">Ukupno glasova</span>
                      <span className="text-lg font-bold text-gray-900">
                        {liveStatsData.totalVotes}
                      </span>
                      <span className="text-[10px] text-rose-500 block">
                        {liveStatsData.likesCount} lajkova
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-xs text-rose-700 font-semibold block">Obostranih simpatija</span>
                      <span className="text-2xl font-bold text-rose-600">
                        {liveStatsData.mutualMatches.length}
                      </span>
                      <span className="text-[10px] text-rose-600 block font-medium">
                        spojeno parova 💖
                      </span>
                    </div>
                  </div>

                  {/* Explanation Banner */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-xs text-blue-900 leading-relaxed space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-blue-800">
                      <AlertCircle size={15} />
                      Što se događa kada potvrdite objavu?
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-blue-800/90">
                      <li>Sustav sprema sve obostrane matcheve u bazu podataka.</li>
                      <li>Muškim sudionicima šalje se EmailJS obavijest s kontakt podacima partnerice.</li>
                      <li>Događaj prelazi u <strong>Post-Event Matching</strong> fazu – sudionici odmah vide svoje matcheve na profilu, a oni koji nisu stigli ocijeniti sve sudionike mogu dovršiti odabir za preostale osobe!</li>
                    </ol>
                  </div>

                  {/* List of Detected Matches */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center justify-between">
                      <span>Pronađeni matchevi iz noći ({liveStatsData.mutualMatches.length}):</span>
                    </h4>

                    {liveStatsData.mutualMatches.length === 0 ? (
                      <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-sm">
                        Zasad nema zabilježenih obostranih matcheva iz noći.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {liveStatsData.mutualMatches.map((m, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-gray-900">{m.maleName}</span>
                                <span className="text-rose-500 font-bold mx-1.5">💞</span>
                                <span className="font-bold text-gray-900">{m.femaleName}</span>
                              </div>
                            </div>
                            <div className="text-right text-gray-500 text-[11px]">
                              <div>Mail za: <span className="font-medium text-gray-700">{m.maleEmail}</span></div>
                              {m.femaleContact && <div>Kontakt: <span className="text-rose-600">{m.femaleContact}</span></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer Buttons */}
            {!publishSuccessMsg && (
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFinishLiveModalOpen(false)}
                  disabled={publishingMatches}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Odustani
                </button>

                <button
                  type="button"
                  onClick={executePublishLiveMatches}
                  disabled={publishingMatches || loadingLiveStats}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-brand hover:from-rose-600 hover:to-brand-light text-white shadow-lg hover:shadow-rose-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {publishingMatches ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Objavljivanje i slanje mailova...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Potvrdi, pošalji mailove i otvori Post-Event
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
