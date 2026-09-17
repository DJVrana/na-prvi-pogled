import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Search,
  UserCheck,
  CheckCircle2,
  Circle,
  Users,
  CreditCard,
  FileText
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Prijava } from '../pages/AdminDashboard';

interface EventData {
  id: string;
  title: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  price?: string;
  [key: string]: any;
}

interface EventCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  prijave: Prijava[];
  onToggleAttendance: (prijavaId: string, attended: boolean, attendedAt?: any) => Promise<void>;
  onOpenPdfModal?: () => void;
}

export const EventCheckInModal: React.FC<EventCheckInModalProps> = ({
  isOpen,
  onClose,
  event,
  prijave,
  onToggleAttendance,
  onOpenPdfModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unattended' | 'attended' | 'female' | 'male'>('all');
  const [groupByGender, setGroupByGender] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter only accepted participants for this event
  const acceptedList = useMemo(() => {
    return prijave.filter(p => p.status === 'accepted');
  }, [prijave]);

  // Separate by gender
  const femaleList = useMemo(() => {
    return acceptedList
      .filter(p => p.spol === 'Ž' || p.spol?.toLowerCase() === 'žensko')
      .sort((a, b) => a.imePrezime.localeCompare(b.imePrezime, 'hr'));
  }, [acceptedList]);

  const maleList = useMemo(() => {
    return acceptedList
      .filter(p => p.spol === 'M' || p.spol?.toLowerCase() === 'muško')
      .sort((a, b) => a.imePrezime.localeCompare(b.imePrezime, 'hr'));
  }, [acceptedList]);

  // Create indexed map for consistent Ž-1..N and M-1..N badges
  const badgeMap = useMemo(() => {
    const map = new Map<string, string>();
    femaleList.forEach((p, idx) => {
      map.set(p.id, `Ž-${idx + 1}`);
    });
    maleList.forEach((p, idx) => {
      map.set(p.id, `M-${idx + 1}`);
    });
    return map;
  }, [femaleList, maleList]);

  // Stats calculation
  const totalAccepted = acceptedList.length;
  const attendedCount = acceptedList.filter(p => p.attended).length;
  const unattendedCount = totalAccepted - attendedCount;
  const femaleAttended = femaleList.filter(p => p.attended).length;
  const maleAttended = maleList.filter(p => p.attended).length;
  const attendancePercentage = totalAccepted > 0 ? Math.round((attendedCount / totalAccepted) * 100) : 0;

  // Filtered and searched list
  const filterList = useCallback((list: Prijava[]) => {
    return list.filter(p => {
      // Status/Gender filter
      if (activeFilter === 'attended' && !p.attended) return false;
      if (activeFilter === 'unattended' && p.attended) return false;
      if (activeFilter === 'female' && p.spol !== 'Ž' && p.spol?.toLowerCase() !== 'žensko') return false;
      if (activeFilter === 'male' && p.spol !== 'M' && p.spol?.toLowerCase() !== 'muško') return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const badge = badgeMap.get(p.id)?.toLowerCase() || '';
        const name = (p.imePrezime || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const note = (p.napomena || '').toLowerCase();

        return name.includes(term) || email.includes(term) || badge.includes(term) || note.includes(term);
      }

      return true;
    });
  }, [activeFilter, searchTerm, badgeMap]);

  const filteredAccepted = useMemo(() => filterList(acceptedList), [acceptedList, filterList]);
  const filteredFemale = useMemo(() => filterList(femaleList), [femaleList, filterList]);
  const filteredMale = useMemo(() => filterList(maleList), [maleList, filterList]);

  // Handle single check-in toggle
  const handleToggle = async (prijava: Prijava) => {
    const newAttended = !prijava.attended;
    setLoadingId(prijava.id);
    try {
      await onToggleAttendance(prijava.id, newAttended);
    } catch (err) {
      console.error("Greška pri promjeni statusa dolaska:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Handle fee paid toggle
  const handleTogglePaid = async (prijava: Prijava, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPaid = !prijava.paid;
    try {
      await updateDoc(doc(db, 'prijave', prijava.id), {
        paid: newPaid
      });
      // Update local state
      prijava.paid = newPaid;
    } catch (err) {
      console.error("Greška pri promjeni statusa kotizacije:", err);
    }
  };

  // Format timestamp helper
  const formatTime = (ts: any) => {
    if (!ts) return null;
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[94vh] max-h-[94vh] overflow-hidden border border-gray-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
              <UserCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Evidencija dolazaka (Check-in uživo)
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Uživo
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-md sm:max-w-xl">
                {event.title} • {event.dateStr} u {event.timeStr}h • {event.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Otvori listu za ispis u PDF-u"
              >
                <FileText size={14} className="text-brand" />
                <span>Otvori PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Zatvori prozor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Counters & Progress Bar */}
        <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Total Accepted */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Prihvaćeni
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-gray-900">{totalAccepted}</span>
                <span className="text-xs text-gray-400">sudionika</span>
              </div>
            </div>

            {/* Checked-in Progress */}
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Prisutno
                </span>
                <span className="text-[11px] font-bold text-emerald-700">{attendancePercentage}%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-700">{attendedCount}</span>
                <span className="text-xs text-emerald-600 font-medium">/ {totalAccepted}</span>
              </div>
            </div>

            {/* Waiting / Unattended */}
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Nisu stigli
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-amber-700">{unattendedCount}</span>
                <span className="text-xs text-amber-600 font-medium">preostalo</span>
              </div>
            </div>

            {/* Female Ratio */}
            <div className="bg-pink-50/60 p-2.5 rounded-xl border border-pink-200 shadow-2xs">
              <span className="text-[11px] font-bold text-pink-800 uppercase tracking-wider block">
                👩 Žene
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-pink-700">{femaleAttended}</span>
                <span className="text-xs text-pink-600 font-medium">/ {femaleList.length}</span>
              </div>
            </div>

            {/* Male Ratio */}
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                👨 Muškarci
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-blue-700">{maleAttended}</span>
                <span className="text-xs text-blue-600 font-medium">/ {maleList.length}</span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="px-5 py-3 border-b border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-3 flex-shrink-0">
          {/* Instant Search Bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraži po imenu, emailu ili oznaci (npr. M-2)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Svi ({totalAccepted})
            </button>

            <button
              onClick={() => setActiveFilter('unattended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'unattended'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>Nisu stigli</span>
              <span className="bg-amber-200/60 px-1.5 py-0.2 rounded-full text-[10px]">
                {unattendedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('attended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'attended'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>Prisutni</span>
              <span className="bg-emerald-200/60 px-1.5 py-0.2 rounded-full text-[10px]">
                {attendedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'female'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
              }`}
            >
              Žene ({femaleList.length})
            </button>

            <button
              onClick={() => setActiveFilter('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'male'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              Muškarci ({maleList.length})
            </button>
          </div>

          {/* Group Toggle */}
          <div className="hidden lg:flex items-center gap-1 border-l border-gray-200 pl-3">
            <button
              onClick={() => setGroupByGender(!groupByGender)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                groupByGender
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {groupByGender ? 'Grupirano po spolu' : 'Jedinstvena lista'}
            </button>
          </div>
        </div>

        {/* Main List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          {acceptedList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
              <Users size={36} className="mx-auto text-gray-400 mb-2" />
              <h4 className="text-base font-bold text-gray-800">Nema prihvaćenih sudionika</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Za ovaj događaj još nema prijava u statusu 'Prihvaćeno'. Prijave možete prihvatiti u tablici prijava.
              </p>
            </div>
          ) : filteredAccepted.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <Search size={32} className="mx-auto text-gray-400 mb-2" />
              <h4 className="text-base font-bold text-gray-800">Nema rezultata za odabrane kriterije</h4>
              <p className="text-xs text-gray-500 mt-1">
                Pokušajte promijeniti pojam pretrage ili odabrani filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="mt-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Poništi filtre
              </button>
            </div>
          ) : groupByGender && (activeFilter === 'all' || activeFilter === 'unattended' || activeFilter === 'attended') ? (
            /* Grouped View (Women / Men) */
            <div className="space-y-6">
              {/* Women Section */}
              {filteredFemale.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-sm font-bold text-pink-700 flex items-center gap-2">
                      <span>👩 Žene (Sudionice)</span>
                      <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full font-bold">
                        {filteredFemale.filter(p => p.attended).length} / {filteredFemale.length} stiglo
                      </span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredFemale.map(prijava => (
                      <AttendeeCheckInCard
                        key={prijava.id}
                        prijava={prijava}
                        badge={badgeMap.get(prijava.id) || 'Ž'}
                        onToggle={() => handleToggle(prijava)}
                        onTogglePaid={e => handleTogglePaid(prijava, e)}
                        isLoading={loadingId === prijava.id}
                        eventPrice={event.price}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Men Section */}
              {filteredMale.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1 pt-2">
                    <h4 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                      <span>👨 Muškarci (Sudionici)</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                        {filteredMale.filter(p => p.attended).length} / {filteredMale.length} stiglo
                      </span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredMale.map(prijava => (
                      <AttendeeCheckInCard
                        key={prijava.id}
                        prijava={prijava}
                        badge={badgeMap.get(prijava.id) || 'M'}
                        onToggle={() => handleToggle(prijava)}
                        onTogglePaid={e => handleTogglePaid(prijava, e)}
                        isLoading={loadingId === prijava.id}
                        eventPrice={event.price}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Flat / Unified List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAccepted.map(prijava => (
                <AttendeeCheckInCard
                  key={prijava.id}
                  prijava={prijava}
                  badge={badgeMap.get(prijava.id) || (prijava.spol === 'Ž' ? 'Ž' : 'M')}
                  onToggle={() => handleToggle(prijava)}
                  onTogglePaid={e => handleTogglePaid(prijava, e)}
                  isLoading={loadingId === prijava.id}
                  eventPrice={event.price}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Status Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Promjene se automatski i trajno spremaju u bazu podataka.</span>
          </div>

          <div className="font-semibold text-gray-700">
            Ukupno evidentirano: <strong className="text-emerald-700 text-sm">{attendedCount}</strong> / {totalAccepted} ({attendancePercentage}%)
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-component for individual participant card
interface AttendeeCardProps {
  prijava: Prijava;
  badge: string;
  onToggle: () => void;
  onTogglePaid: (e: React.MouseEvent) => void;
  isLoading: boolean;
  eventPrice?: string;
  formatTime: (ts: any) => string | null;
}

const AttendeeCheckInCard: React.FC<AttendeeCardProps> = ({
  prijava,
  badge,
  onToggle,
  onTogglePaid,
  isLoading,
  eventPrice,
  formatTime
}) => {
  const isFemale = badge.startsWith('Ž') || prijava.spol === 'Ž' || prijava.spol?.toLowerCase() === 'žensko';
  const attendedTime = formatTime(prijava.attendedAt);

  return (
    <div
      onClick={onToggle}
      className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
        prijava.attended
          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs hover:bg-emerald-50'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
      }`}
    >
      {/* Left: Badge + Name & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Number/Gender Badge */}
        <div
          className={`w-11 h-11 rounded-xl font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-2xs ${
            isFemale
              ? 'bg-pink-100/80 text-pink-700 border border-pink-200'
              : 'bg-blue-100/80 text-blue-700 border border-blue-200'
          }`}
        >
          {badge}
        </div>

        {/* Text Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-bold text-gray-900 text-sm truncate">
              {prijava.imePrezime}
            </h5>
            <span className="text-xs text-gray-500 font-medium">
              ({prijava.godine} god.)
            </span>
          </div>

          <div className="text-xs text-gray-500 truncate mt-0.5">
            {prijava.email}
          </div>

          {prijava.napomena && (
            <div className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200 rounded px-1.5 py-0.5 mt-1 truncate inline-block max-w-full">
              Napomena: {prijava.napomena}
            </div>
          )}
        </div>
      </div>

      {/* Right: Kotizacija + Big Check-in Button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Kotizacija toggle */}
        {eventPrice && (
          <button
            type="button"
            onClick={onTogglePaid}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
              prijava.paid
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
            title="Klikni za evidenciju plaćanja kotizacije"
          >
            <CreditCard size={12} />
            <span>{prijava.paid ? 'Plaćeno' : eventPrice.split(' ')[0]}</span>
          </button>
        )}

        {/* Check-in Toggle Button */}
        <button
          type="button"
          disabled={isLoading}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            prijava.attended
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-600/20'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-emerald-500'
          }`}
        >
          {prijava.attended ? (
            <>
              <CheckCircle2 size={16} className="text-white" />
              <div className="text-left">
                <div>Prisutan/na</div>
                {attendedTime && (
                  <div className="text-[10px] text-emerald-100 font-normal leading-none mt-0.5">
                    {attendedTime}h
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Circle size={15} className="text-gray-400" />
              <span>Označi dolazak</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
