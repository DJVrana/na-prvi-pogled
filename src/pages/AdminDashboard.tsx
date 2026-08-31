import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, doc, writeBatch, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Link, Navigate } from 'react-router';
import { ArrowLeft, Users, UserRound, ArrowDown01, Loader2, Plus, Calendar as CalendarIcon, CheckCircle2, List, PlayCircle, StopCircle, Trash2, X, ChevronDown, Pencil } from 'lucide-react';

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
  createdAt: any;
  customFields?: CustomField[];
  maxRegistrations?: number | string;
  introText?: string;
  noteText?: string;
  closingText?: string;
  timeNote?: string;
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
  const [newEvent, setNewEvent] = useState({
    title: '',
    ageGroup: '',
    dateStr: '',
    timeStr: '',
    location: '',
    price: '',
    maxRegistrations: '',
    introText: 'Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog "Na prvi pogled" speed dating eventa!',
    noteText: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
    closingText: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
    timeNote: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.'
  });
  const [newCustomFields, setNewCustomFields] = useState<CustomField[]>([]);
  const [openFieldDropdownIndex, setOpenFieldDropdownIndex] = useState<number | null>(null);

  // Modal state
  const [selectedPrijava, setSelectedPrijava] = useState<Prijava | null>(null);

  // Dropdown state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

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
      maxRegistrations: eventToEdit.maxRegistrations || '',
      introText: eventToEdit.introText || 'Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog "Na prvi pogled" speed dating eventa!',
      noteText: eventToEdit.noteText || 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.',
      closingText: eventToEdit.closingText || 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.',
      timeNote: eventToEdit.timeNote || 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.'
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
    setNewEvent({ title: '', ageGroup: '', dateStr: '', timeStr: '', location: '', price: '', maxRegistrations: '', introText: 'Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog "Na prvi pogled" speed dating eventa!', noteText: 'Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.', closingText: 'Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.', timeNote: 'Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije.' });
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

  const handleDeletePrijava = async (prijavaId: string) => {
    if (!window.confirm("Jeste li sigurni da želite izbrisati ovu prijavu?")) return;
    try {
      await deleteDoc(doc(db, 'prijave', prijavaId));
      setSelectedPrijava(null);
      fetchPrijave(selectedEventId);
    } catch (err) {
      console.error("Greška pri brisanju prijave:", err);
      alert("Dogodila se greška prilikom brisanja prijave.");
    }
  };

  const toggleEventActive = async (eventToToggle: EventData) => {
    try {
      const batch = writeBatch(db);
      
      // If we are activating this one, deactivate all others
      if (!eventToToggle.isActive) {
        const activeEvents = events.filter(e => e.isActive);
        activeEvents.forEach(e => {
          const eRef = doc(db, 'events', e.id);
          batch.update(eRef, { isActive: false });
        });
      }
      
      // Toggle the target event
      const targetRef = doc(db, 'events', eventToToggle.id);
      batch.update(targetRef, { isActive: !eventToToggle.isActive });
      
      await batch.commit();
      fetchEvents();
    } catch (err) {
      console.error("Error toggling event:", err);
      setError("Greška pri promjeni statusa događaja.");
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

  // Calculate statistics for currently displayed prijave
  const total = prijave.length;
  const femaleCount = prijave.filter(p => p.spol === 'Ž' || p.spol === 'Z' || p.spol.toLowerCase() === 'žensko').length;
  const maleCount = prijave.filter(p => p.spol === 'M' || p.spol.toLowerCase() === 'muško').length;
  const avgAge = total > 0 ? (prijave.reduce((sum, p) => sum + (Number(p.godine) || 0), 0) / total).toFixed(1) : 0;

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
                      <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Dobna skupina (npr. 20–25 godina)</label>
                      <input required type="text" value={newEvent.ageGroup} onChange={e => setNewEvent({...newEvent, ageGroup: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Datum (npr. 17. rujna 2026.)</label>
                      <input required type="text" value={newEvent.dateStr} onChange={e => setNewEvent({...newEvent, dateStr: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vrijeme (npr. 19:00)</label>
                      <input required type="text" value={newEvent.timeStr} onChange={e => setNewEvent({...newEvent, timeStr: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Lokacija (npr. Café de Paris, Zagreb)</label>
                      <input required type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cijena / Kotizacija (npr. 10 € (uključena 2 pića))</label>
                      <input required type="text" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Maksimalan broj prijava (ostavi prazno za neograničeno)</label>
                      <input type="number" min="1" value={newEvent.maxRegistrations} onChange={e => setNewEvent({...newEvent, maxRegistrations: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="Npr. 40" />
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
                      
                      <p className="mb-4">Draga/i <strong>[Ime Korisnika]</strong>,</p>
                      
                      <textarea
                        required
                        value={newEvent.introText}
                        onChange={e => setNewEvent({...newEvent, introText: e.target.value})}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-gray-50 text-gray-700 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-4 text-sm"
                        rows={2}
                      />
                      
                      <div className="bg-[#FFF0F2] border-l-4 border-[#E85D75] p-4 my-6 rounded-r-lg">
                        <p className="text-[#E85D75] font-bold m-0">Ovim mailom potvrđujemo tvoju prijavu!</p>
                      </div>
                      
                      <p className="mb-4 text-sm">Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj/a.</p>
                      
                      <textarea
                        required
                        value={newEvent.noteText}
                        onChange={e => setNewEvent({...newEvent, noteText: e.target.value})}
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
                                  value={newEvent.timeNote}
                                  onChange={e => setNewEvent({...newEvent, timeNote: e.target.value})}
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
                        value={newEvent.closingText}
                        onChange={e => setNewEvent({...newEvent, closingText: e.target.value})}
                        className="w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-[#fafafa] text-gray-700 text-center resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-8 text-sm"
                        rows={4}
                      />
                      
                      <div className="text-center mt-10 mb-5">
                        <p className="text-lg font-bold text-[#E85D75]">Vidimo se uskoro! ✨</p>
                      </div>
                      <div className="mt-8 border-t border-gray-100 pt-5">
                        <p className="text-sm text-gray-500 m-0">Srdačan pozdrav,<br/><strong className="text-gray-700">tim Na prvi pogled</strong></p>
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          {event.isActive && <span className="bg-brand text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Aktivno</span>}
                        </div>
                        <p className="text-sm text-gray-600">{event.dateStr} u {event.timeStr} • {event.location}</p>
                        <p className="text-xs text-gray-500 mt-1">Dob: {event.ageGroup} | Cijena: {event.price} {event.maxRegistrations ? `| Max prijava: ${event.maxRegistrations}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => openEditEvent(event)}
                          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors bg-white hover:bg-gray-100 border border-gray-200 text-gray-700"
                        >
                          <Pencil size={16}/> <span className="hidden sm:inline">Uredi</span>
                        </button>
                        <button 
                          onClick={() => toggleEventActive(event)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${event.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}
                        >
                          {event.isActive ? <><StopCircle size={16}/> Završi / Deaktiviraj</> : <><PlayCircle size={16}/> Postavi kao Aktivno</>}
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
              
              <button 
                onClick={() => fetchPrijave(selectedEventId)}
                className="ml-auto bg-brand/10 text-brand px-5 py-3 rounded-xl text-sm font-semibold hover:bg-brand/20 transition-colors flex items-center gap-2"
              >
                Osvježi
              </button>
            </div>

            {/* Statistics Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-brand/10 p-3 rounded-full text-brand">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ukupno prijava</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Žene</p>
                  <p className="text-2xl font-bold">{femaleCount}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Muškarci</p>
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
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Učitavanje podataka...
                          </div>
                        </td>
                      </tr>
                    ) : prijave.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          Još nema pristiglih prijava za odabrani događaj.
                        </td>
                      </tr>
                    ) : (
                      prijave.map((prijava) => (
                        <tr 
                          key={prijava.id} 
                          onClick={() => setSelectedPrijava(prijava)}
                          className="hover:bg-brand/5 cursor-pointer transition-colors group"
                        >
                          <td className="p-4 font-medium text-brand group-hover:text-brand-light">{prijava.imePrezime}</td>
                          <td className="p-4 text-gray-600 text-sm">{prijava.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              prijava.spol === 'Ž' ? 'bg-pink-100 text-pink-700' : 
                              prijava.spol === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {prijava.spol}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{prijava.godine}</td>
                          <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={prijava.napomena}>
                            {prijava.napomena || '-'}
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
              <button 
                onClick={() => handleDeletePrijava(selectedPrijava.id)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Izbriši prijavu
              </button>
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
    </div>
  );
}
