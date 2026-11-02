import { doc, updateDoc, type Firestore } from 'firebase/firestore';

const CRO_MONTHS = [
  { name: 'siječnja', aliases: ['sijec', 'siječ'] },
  { name: 'veljače', aliases: ['veljac', 'veljač'] },
  { name: 'ožujka', aliases: ['ozuj', 'ožuj'] },
  { name: 'travnja', aliases: ['trav'] },
  { name: 'svibnja', aliases: ['svib'] },
  { name: 'lipnja', aliases: ['lip'] },
  { name: 'srpnja', aliases: ['srp'] },
  { name: 'kolovoza', aliases: ['kolov'] },
  { name: 'rujna', aliases: ['ruj'] },
  { name: 'listopada', aliases: ['list'] },
  { name: 'studenoga', aliases: ['studen'] },
  { name: 'prosinca', aliases: ['prosin'] }
];

/**
 * Parses human-readable or numeric date string to JavaScript Date.
 * Supports: "11. prosinca (petak)", "11.12.2026", "2026-12-11", "11. 12.", etc.
 */
export function parseEventDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim().toLowerCase();
  if (!str) return null;

  let day: number | undefined;
  let monthIndex: number | undefined;
  let year: number | undefined;

  const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    monthIndex = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else {
    const yearMatch = str.match(/\b(20\d\d)\b/);
    year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    const wordMatch = str.match(/(\d{1,2})\.?\s*([a-čćžšđ]+)/i);
    if (wordMatch) {
      const d = parseInt(wordMatch[1], 10);
      const mWord = wordMatch[2];
      const mIdx = CRO_MONTHS.findIndex(m => m.aliases.some(a => mWord.includes(a)));
      if (mIdx !== -1 && d >= 1 && d <= 31) {
        day = d;
        monthIndex = mIdx;
      }
    }

    if (day === undefined) {
      const numMatch = str.match(/(\d{1,2})\s*\.\s*(\d{1,2})\.?/);
      if (numMatch) {
        const d = parseInt(numMatch[1], 10);
        const m = parseInt(numMatch[2], 10) - 1;
        if (d >= 1 && d <= 31 && m >= 0 && m <= 11) {
          day = d;
          monthIndex = m;
        }
      }
    }
  }

  if (day === undefined || monthIndex === undefined || isNaN(day) || isNaN(monthIndex)) return null;
  return new Date(year, monthIndex, day);
}

/**
 * Checks if today is the day of the event.
 */
export function isEventDay(dateStr?: string | null): boolean {
  const d = parseEventDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return (
    now.getFullYear() === d.getFullYear() &&
    now.getMonth() === d.getMonth() &&
    now.getDate() === d.getDate()
  );
}

/**
 * Checks if the event day has already passed (now >= end of event day midnight).
 */
export function isEventDayPassed(dateStr?: string | null): boolean {
  const d = parseEventDate(dateStr);
  if (!d) return false;
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  return new Date() >= endOfDay;
}

/**
 * Returns registration closure time: midnight at the end of the event day (i.e. day + 1 at 00:00:00).
 * Example: Event on 11.12. closes on 12.12. at 00:00:00.
 */
export function getRegistrationCloseDate(dateStr?: string | null): Date | null {
  const d = parseEventDate(dateStr);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
}

/**
 * Checks whether an event's registrations are open.
 * Can also check for a specific gender ('M' or 'Ž').
 */
export function isEventRegistrationOpen(
  event?: {
    isActive?: boolean;
    dateStr?: string;
    closeRegistrationsM?: boolean;
    closeRegistrationsZ?: boolean;
  } | null,
  gender?: 'M' | 'Ž'
): boolean {
  if (!event || !event.isActive) return false;

  // Check manual gender lock
  if (gender === 'M' && event.closeRegistrationsM) return false;
  if (gender === 'Ž' && event.closeRegistrationsZ) return false;
  if (event.closeRegistrationsM && event.closeRegistrationsZ) return false;

  // Check automated midnight cutoff
  const regClose = getRegistrationCloseDate(event.dateStr);
  if (regClose && new Date() >= regClose) {
    return false;
  }

  return true;
}

/**
 * Returns when matching automatically expires (approx. 48 hours after start or event date).
 */
export function getMatchingCloseDate(event?: {
  dateStr?: string;
  matchingStartedAt?: any;
} | null): Date | null {
  if (!event) return null;

  if (event.matchingStartedAt) {
    try {
      const startTime = typeof event.matchingStartedAt.toDate === 'function'
        ? event.matchingStartedAt.toDate().getTime()
        : new Date(event.matchingStartedAt).getTime();
      if (!isNaN(startTime)) {
        return new Date(startTime + 48 * 60 * 60 * 1000); // 48h after activation
      }
    } catch {
      // fallback to dateStr calculation
    }
  }

  const d = parseEventDate(event.dateStr);
  if (!d) return null;
  // Matching ends approx 48-72h after event (end of 2nd day after event)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3, 0, 0, 0, 0);
}

/**
 * Checks whether matching is actively open for an event.
 */
export function isEventMatchingActive(event?: {
  isMatchingActive?: boolean;
  matchingPhase?: string;
  dateStr?: string;
  matchingStartedAt?: any;
} | null): boolean {
  if (!event || !event.isMatchingActive || event.matchingPhase === 'closed') {
    return false;
  }

  const matchClose = getMatchingCloseDate(event);
  if (matchClose && new Date() >= matchClose) {
    return false;
  }

  return true;
}

/**
 * Synchronizes expired event registration or matching state with Firestore in the background.
 */
export async function syncEventLifecycle(
  db: Firestore,
  event: {
    id: string;
    isActive?: boolean;
    isMatchingActive?: boolean;
    matchingPhase?: string;
    dateStr?: string;
    matchingStartedAt?: any;
    closeRegistrationsM?: boolean;
    closeRegistrationsZ?: boolean;
  }
): Promise<void> {
  try {
    const shouldCloseRegistration = event.isActive && !isEventRegistrationOpen(event);
    const shouldCloseMatching = event.isMatchingActive && !isEventMatchingActive(event);

    if (shouldCloseRegistration || shouldCloseMatching) {
      const updates: Record<string, any> = {};
      if (shouldCloseRegistration) {
        updates.isActive = false;
      }
      if (shouldCloseMatching) {
        updates.isMatchingActive = false;
        updates.matchingPhase = 'closed';
      }
      await updateDoc(doc(db, 'events', event.id), updates);
    }
  } catch (err) {
    console.warn('[syncEventLifecycle] Error syncing expired event:', err);
  }
}

