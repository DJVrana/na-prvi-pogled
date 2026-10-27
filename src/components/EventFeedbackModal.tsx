import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  X, 
  MessageSquare, 
  Calendar, 
  Loader2, 
  Trash2, 
  Sparkles, 
  Star, 
  ThumbsUp, 
  AlertCircle,
  Clock
} from 'lucide-react';
import type { EventData } from '../pages/AdminDashboard';

interface EventFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
  onFeedbackChanged?: () => void;
}

interface FeedbackItem {
  id: string;
  eventId: string;
  eventTitle?: string;
  rating?: number | null;
  ratingLabel?: string | null;
  message?: string;
  createdAt?: any;
}

export function EventFeedbackModal({
  isOpen,
  onClose,
  event,
  onFeedbackChanged
}: EventFeedbackModalProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<'all' | 'positive' | 'critical'>('all');

  useEffect(() => {
    if (!isOpen || !event) {
      setFeedbacks([]);
      return;
    }

    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'event_feedbacks'),
          where('eventId', '==', event.id)
        );
        const snapshot = await getDocs(q);
        const list: FeedbackItem[] = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as any)
        }));

        // Sort descending by createdAt in memory to avoid index requirements
        list.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return tB - tA;
        });

        setFeedbacks(list);
      } catch (err) {
        console.error("Greška pri dohvatu anonimnih dojmova:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleDelete = async (feedbackId: string) => {
    if (!window.confirm("Jeste li sigurni da želite trajno obrisati ovaj dojam?")) return;
    setDeletingId(feedbackId);
    try {
      await deleteDoc(doc(db, 'event_feedbacks', feedbackId));
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));

      // Decrement counter on event if exists
      try {
        await updateDoc(doc(db, 'events', event.id), {
          feedbackCount: increment(-1)
        });
      } catch (e) {
        console.warn("Greška pri smanjivanju brojača:", e);
      }

      if (onFeedbackChanged) {
        onFeedbackChanged();
      }
    } catch (err) {
      console.error("Greška pri brisanju dojma:", err);
      alert("Došlo je do greške prilikom brisanja dojma.");
    } finally {
      setDeletingId(null);
    }
  };

  // Format date helper
  const formatDate = (ts: any) => {
    if (!ts) return 'Nepoznat datum';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return d.toLocaleString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute stats
  const ratingsOnly = feedbacks.filter(f => f.rating && typeof f.rating === 'number');
  const avgRating = ratingsOnly.length > 0
    ? (ratingsOnly.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingsOnly.length).toFixed(1)
    : null;

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterRating === 'positive') return (f.rating || 0) >= 4;
    if (filterRating === 'critical') return (f.rating || 0) > 0 && (f.rating || 0) <= 3;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-scale-up">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 to-rose-50/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-gray-900">
                  Anonimni dojmovi sudionika
                </h2>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {feedbacks.length}
                </span>
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                <Calendar size={13} className="text-brand" />
                <strong className="text-gray-800">{event.title}</strong> • {event.dateStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            title="Zatvori"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Ukupno prikupljeno</span>
              <strong className="text-sm font-bold text-gray-900">{feedbacks.length} dojmova</strong>
            </div>

            {avgRating && (
              <div className="pl-4 border-l border-gray-200">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Prosječna ocjena</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <strong className="text-sm font-bold text-gray-900">{avgRating} / 5.0</strong>
                  <span className="text-gray-500 text-[11px]">({ratingsOnly.length} ocjena)</span>
                </div>
              </div>
            )}
          </div>

          {/* Filter options */}
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterRating('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterRating === 'all' ? 'bg-brand text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Svi ({feedbacks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRating('positive')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterRating === 'positive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pozitivno (4-5★)
              </button>
              <button
                type="button"
                onClick={() => setFilterRating('critical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterRating === 'critical' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Prijedlozi (1-3★)
              </button>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 size={32} className="animate-spin text-brand" />
              <p className="text-xs font-semibold uppercase tracking-wider">Učitavanje dojmova...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Još nema poslanih dojmova
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Kada sudionici završe s ocjenjivanjem osoba u matching sustavu za ovaj događaj, ovdje će se automatski pojaviti njihove anonimne poruke, pohvale i prijedlozi.
              </p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-xs">
              Nema dojmova u odabranoj kategoriji filtera.
            </div>
          ) : (
            filteredFeedbacks.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand/20 transition-all flex flex-col justify-between gap-3 relative group"
              >
                {/* Top: Rating & Date */}
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    {item.rating ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                        <span>
                          {item.rating === 5 ? '🤩' : item.rating === 4 ? '😊' : item.rating === 3 ? '👍' : item.rating === 2 ? '😐' : '👎'}
                        </span>
                        <span>{item.ratingLabel || `${item.rating}/5`}</span>
                        <span className="text-amber-700/60 font-medium">({item.rating}★)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-lg">
                        Bez brojčane ocjene
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      #{feedbacks.length - idx}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(item.createdAt)}
                    </span>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer opacity-70 group-hover:opacity-100 hover:bg-rose-50"
                      title="Obriši ovaj dojam"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={13} className="animate-spin text-rose-600" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message text */}
                <div className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {item.message ? (
                    <p className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 text-gray-900">
                      "{item.message}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Sudionik je poslao samo ocjenu bez tekstualne poruke.
                    </p>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Svi podaci su 100% anonimni – bez korisničkih imena i e-mailova.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Zatvori
          </button>
        </div>

      </div>
    </div>
  );
}
