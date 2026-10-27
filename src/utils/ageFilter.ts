export interface ParsedAgeRange {
  min: number;
  max: number;
  key: string;
  label: string;
  displayLabel: string;
  raw: string;
}

export interface AgeCategoryOption {
  key: string;
  label: string;
  count?: number;
}

/**
 * Normalizes input text by replacing various unicode dashes/hyphens with a standard ASCII hyphen
 * and removing extra whitespace.
 */
export function normalizeAgeString(str: string): string {
  return str
    .replace(/[\u2010-\u2015\u2212]/g, '-') // Unicode hyphens and dashes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Smart parser for event age group strings.
 * Handles patterns such as:
 * - "41-59"
 * - "24-30"
 * - "20 - 26 godina"
 * - "20 - 26 god."
 * - "od 20 do 26 godina"
 * - "20/26"
 * - "35+" or "35+ godina"
 */
export function parseAgeRange(rawAge?: string | null): ParsedAgeRange | null {
  if (!rawAge || typeof rawAge !== 'string') return null;

  const normalized = normalizeAgeString(rawAge);
  if (!normalized) return null;

  // 1. Try matching range: two numbers separated by dash, slash, or "do"
  // e.g. "20-26", "20 - 26 godina", "od 20 do 26", "20/26"
  const rangeMatch = normalized.match(/(?<!\d)(\d{1,2})\s*(?:-|\/|\bdo\b)\s*(\d{1,2})(?!\d)/i);
  if (rangeMatch) {
    const n1 = parseInt(rangeMatch[1], 10);
    const n2 = parseInt(rangeMatch[2], 10);
    const min = Math.min(n1, n2);
    const max = Math.max(n1, n2);

    if (min >= 16 && max <= 100) {
      return {
        min,
        max,
        key: `${min}-${max}`,
        label: `${min}-${max}`,
        displayLabel: `Dob: ${min}-${max}`,
        raw: rawAge
      };
    }
  }

  // 2. Try matching "plus" pattern: e.g. "35+", "40 +", "od 35 naviše", "35 i više"
  const plusMatch = normalized.match(/(?<!\d)(\d{1,2})\s*(?:\+|i više|naviše|plus)/i);
  if (plusMatch) {
    const min = parseInt(plusMatch[1], 10);
    if (min >= 16 && min <= 100) {
      return {
        min,
        max: 99,
        key: `${min}+`,
        label: `${min}+`,
        displayLabel: `Dob: ${min}+`,
        raw: rawAge
      };
    }
  }

  // 3. Fallback: find any two 2-digit numbers
  const twoDigitMatches = normalized.match(/\b\d{2}\b/g);
  if (twoDigitMatches && twoDigitMatches.length >= 2) {
    const n1 = parseInt(twoDigitMatches[0], 10);
    const n2 = parseInt(twoDigitMatches[1], 10);
    const min = Math.min(n1, n2);
    const max = Math.max(n1, n2);

    if (min >= 16 && max <= 100) {
      return {
        min,
        max,
        key: `${min}-${max}`,
        label: `${min}-${max}`,
        displayLabel: `Dob: ${min}-${max}`,
        raw: rawAge
      };
    }
  }

  return null;
}

/**
 * Checks if an event's age group matches the selected filter key.
 *
 * @param eventAgeGroup Raw age group string from the event (e.g., "20 - 26 godina", "41-59")
 * @param filterKey Filter identifier (e.g. "Sve", "20-26", "24-30", "41-59")
 */
export function matchesAgeFilter(
  eventAgeGroup: string | null | undefined,
  filterKey: string
): boolean {
  if (!filterKey || filterKey === 'Sve') return true;
  if (!eventAgeGroup) return false;

  const parsedEvent = parseAgeRange(eventAgeGroup);
  const parsedFilter = parseAgeRange(filterKey);

  if (parsedEvent && parsedFilter) {
    // 1. Exact match of normalized key (e.g. "20-26" === "20-26")
    if (parsedEvent.key === parsedFilter.key) {
      return true;
    }

    // 2. Exact match of numerical bounds
    if (parsedEvent.min === parsedFilter.min && parsedEvent.max === parsedFilter.max) {
      return true;
    }

    // 3. Filter is a broader range that completely envelopes the event range
    if (parsedEvent.min >= parsedFilter.min && parsedEvent.max <= parsedFilter.max) {
      return true;
    }

    return false;
  }

  // Fallback for non-parseable entries: substring check
  const normEvent = normalizeAgeString(eventAgeGroup).toLowerCase();
  const normFilter = normalizeAgeString(filterKey).toLowerCase();
  return normEvent.includes(normFilter) || normFilter.includes(normEvent);
}

/**
 * Generates sorted, unique age category filter options from a list of events.
 */
export function getAvailableAgeCategories(
  events: Array<{ ageGroup?: string | null }>
): AgeCategoryOption[] {
  const categoryMap = new Map<string, { key: string; label: string; min: number; count: number }>();

  events.forEach(evt => {
    if (!evt.ageGroup) return;
    const parsed = parseAgeRange(evt.ageGroup);

    if (parsed) {
      const existing = categoryMap.get(parsed.key);
      if (existing) {
        existing.count += 1;
      } else {
        categoryMap.set(parsed.key, {
          key: parsed.key,
          label: parsed.displayLabel,
          min: parsed.min,
          count: 1
        });
      }
    } else {
      const raw = evt.ageGroup.trim();
      if (raw) {
        const existing = categoryMap.get(raw);
        if (existing) {
          existing.count += 1;
        } else {
          categoryMap.set(raw, {
            key: raw,
            label: raw.startsWith('Dob') ? raw : `Dob: ${raw}`,
            min: 999,
            count: 1
          });
        }
      }
    }
  });

  const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => a.min - b.min);

  return [
    { key: 'Sve', label: 'Svi događaji', count: events.length },
    ...sortedCategories.map(cat => ({
      key: cat.key,
      label: cat.label,
      count: cat.count
    }))
  ];
}
