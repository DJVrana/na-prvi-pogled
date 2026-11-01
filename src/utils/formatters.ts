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
 * Calculates and formats the date 3 days before the given event date string.
 * Supports formats like:
 * - "13. studenoga (petak)", "12.studenoga (četvrtak)"
 * - "17. rujna 2026."
 * - "13.11.2026", "13. 11."
 * - "2026-11-13"
 * Returns e.g. "10. studenoga".
 */
export function calculateThreeDaysBefore(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim().toLowerCase();
  if (!str) return null;

  let day: number | undefined;
  let monthIndex: number | undefined;
  let year: number | undefined;

  // 1. ISO format YYYY-MM-DD
  const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    monthIndex = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else {
    const yearMatch = str.match(/\b(20\d\d)\b/);
    year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    // 2. Word month: e.g. '13. studenoga', '13.studenoga', '13. studeni', '12. studenoga (četvrtak)'
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

    // 3. Numeric format: e.g. '13.11.', '13. 11.', '13.11.2026'
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

  if (day === undefined || monthIndex === undefined || isNaN(day) || isNaN(monthIndex)) {
    return null;
  }

  const date = new Date(year, monthIndex, day);
  date.setDate(date.getDate() - 3);

  const resDay = date.getDate();
  const resMonth = CRO_MONTHS[date.getMonth()].name;
  return `${resDay}. ${resMonth}`;
}

/**
 * Returns default cancellation note formatted with the date 3 days before the event.
 */
export function getDefaultCancelNote(dateStr?: string | null): string {
  const threeDays = calculateThreeDaysBefore(dateStr);
  const formattedDate = threeDays || '3 dana prije eventa';
  return `Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do ${formattedDate}, kako bismo tvoje mjesto mogli ponuditi nekome drugome.`;
}

/**
 * Common HTML footer for all emails: website link on top, and Instagram, Facebook, and TikTok links in one row below.
 */
export function getEmailSocialFooterHtml(options?: { signOffText?: string }): string {
  const signOff = options?.signOffText ?? `Srdačan pozdrav,<br/><strong style="color: #333333; font-size: 15px;">Ivan</strong><br/><span style="color: #7B1D29; font-weight: 600;">Na prvi pogled</span><br/><span style="font-size: 12px; color: #888888; font-style: italic;">Upoznaj nekoga, kao nekad.</span>`;

  return `
  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; text-align: center;">
    ${signOff ? `<p style="font-size: 14px; margin: 0 0 12px 0; color: #555555; line-height: 1.5;">${signOff}</p>` : ''}
    <p style="margin: 0 0 10px 0;">
      <a href="https://naprvipogled.com" target="_blank" style="color: #7B1D29; text-decoration: underline; font-weight: bold; font-size: 14px;">naprvipogled.com</a>
    </p>
    <div style="text-align: center; margin: 10px 0 0 0; font-size: 13px;">
      <a href="https://instagram.com/na.prvi.pogled" target="_blank" style="display: inline-block; margin: 0 8px; color: #E1306C; text-decoration: none; font-weight: bold;">Instagram</a>
      <span style="color: #cccccc;">•</span>
      <a href="https://web.facebook.com/profile.php?id=61594619954084" target="_blank" style="display: inline-block; margin: 0 8px; color: #1877F2; text-decoration: none; font-weight: bold;">Facebook</a>
      <span style="color: #cccccc;">•</span>
      <a href="https://www.tiktok.com/@na.prvi.pogled" target="_blank" style="display: inline-block; margin: 0 8px; color: #111111; text-decoration: none; font-weight: bold;">TikTok</a>
    </div>
  </div>
  `.trim();
}
