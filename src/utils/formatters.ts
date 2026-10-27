/**
 * Formats price string with Euro currency symbol (€) if not already present.
 * Examples:
 * - "15" -> "15 €"
 * - "15e" -> "15 €"
 * - "15 €" -> "15 €"
 * - "15 EUR" -> "15 EUR"
 * - "Besplatno" -> "Besplatno"
 */
export function formatPrice(price?: string | number | null): string {
  if (price === undefined || price === null) return '';
  const pStr = String(price).trim();
  if (!pStr) return '';

  // If already has € or EUR or Eur
  if (/€|eur/i.test(pStr)) {
    return pStr;
  }

  // If ends with 'e' (like "15e" or "10 e")
  if (/^\d+\s*e$/i.test(pStr)) {
    return pStr.replace(/e$/i, '').trim() + ' €';
  }

  // If it's a numeric string or contains digits at the end
  if (/^\d+([.,]\d+)?$/.test(pStr)) {
    return `${pStr} €`;
  }

  // If it ends with digits like "Kotizacija 15"
  if (/\d+$/.test(pStr)) {
    return `${pStr} €`;
  }

  return pStr;
}
