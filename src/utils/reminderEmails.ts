import emailjs from '@emailjs/browser';

export interface ReminderRecipient {
  id: string;
  imePrezime: string;
  email: string;
  spol: string; // 'M' | 'Ž' | 'muško' | 'žensko' itd.
  status?: string;
}

export interface ReminderEventInfo {
  id?: string;
  title: string;
  dateStr: string;
  timeStr: string;
  location?: string;
  ageGroup?: string;
}

export interface ReminderTemplate {
  id: string;
  title: string;
  badge: string;
  subject: string;
  body: string;
}

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'default_prekosutra',
    title: 'Zadani podsjetnik (Prekosutra)',
    badge: 'Zadano',
    subject: 'Podsjetnik: Vidimo se uskoro na Speed datingu! 💖 | Na prvi pogled',
    body: `Dragi/a [ime],

samo kratki podsjetnik da je prekosutra, u četvrtak u 19:00, naš „Prvi pogled“ speed dating event na koji si prijavljen/a.

Ovaj e-mail služi samo kao podsjetnik i ne moraš odgovarati na njega. Ako ipak nisi u mogućnosti doći, a još nam nisi javio/la, molimo te da nam to javiš čim prije putem elektroničke pošte ili najjednostavnije putem platforme opcijom otkazivanja dolaska, kako bismo mogli osloboditi tvoje mjesto.

Vidimo se! 👋

Ivan
Na prvi pogled`
  },
  {
    id: 'dan_prije_sutra',
    title: 'Dan prije eventa (Sutra)',
    badge: '1 dan prije',
    subject: 'Podsjetnik: Vidimo se sutra na speed datingu! ✨ | Na prvi pogled',
    body: `Dragi/a [ime],

samo kratki podsjetnik da se sutra u [vrijeme] održava naš „Prvi pogled“ speed dating event na koji si prijavljen/a.

Ovaj e-mail služi samo kao podsjetnik i ne moraš odgovarati na njega. Ako ipak nisi u mogućnosti doći, a još nam nisi javio/la, molimo te da nam to javiš čim prije putem elektroničke pošte ili najjednostavnije putem platforme opcijom otkazivanja dolaska, kako bismo mogli osloboditi tvoje mjesto.

Vidimo se sutra! 👋

Ivan
Na prvi pogled`
  },
  {
    id: 'danas_veceras',
    title: 'Na dan eventa (Danas)',
    badge: 'Danas',
    subject: 'Danas je dan za „Prvi pogled“! 🕖 | Vidimo se večeras',
    body: `Dragi/a [ime],

samo kratki podsjetnik da se večeras u [vrijeme] održava naš „Prvi pogled“ speed dating event na koji si prijavljen/a!

Molimo te da dođeš 10-ak minuta ranije na lokaciju ([lokacija]) kako bismo se svi ugodno smjestili i započeli na vrijeme. Ako ipak nisi u mogućnosti doći, a još nam nisi javio/la, molimo te da nam hitno javiš kako bismo znali raspored.

Vidimo se večeras! 👋

Ivan
Na prvi pogled`
  },
  {
    id: 'opceniti_podsjetnik',
    title: 'Općeniti podsjetnik (S datumom i vremenom)',
    badge: 'Općenito',
    subject: 'Podsjetnik na nadolazeći „Prvi pogled“ speed dating susret 📅',
    body: `Dragi/a [ime],

samo kratki podsjetnik na naš nadolazeći „Prvi pogled“ speed dating event koji se održava dana [datum] u [vrijeme] ([lokacija]), na koji si prijavljen/a.

Ovaj e-mail služi samo kao podsjetnik i ne moraš odgovarati na njega. Ako ipak nisi u mogućnosti doći, a još nam nisi javio/la, molimo te da nam to javiš čim prije putem elektroničke pošte ili najjednostavnije putem platforme opcijom otkazivanja dolaska, kako bismo mogli osloboditi tvoje mjesto.

Vidimo se! 👋

Ivan
Na prvi pogled`
  },
  {
    id: 'custom_blank',
    title: 'Prilagođena poruka (Slobodan unos)',
    badge: 'Prilagođeno',
    subject: 'Obavijest vezana uz Speed dating event | Na prvi pogled',
    body: `Dragi/a [ime],

obraćamo ti se s kratkom obavijesti vezanom uz naš nadolazeći speed dating event „[naziv_eventa]“ na koji si prijavljen/a.

[Ovdje upišite vašu poruku...]

Vidimo se! 👋

Ivan
Na prvi pogled`
  }
];

/**
 * Provjera je li sudionik muškog spola
 */
export function isMaleGender(spol?: string): boolean {
  if (!spol) return false;
  const s = spol.trim().toLowerCase();
  return s === 'm' || s === 'muško' || s === 'musko';
}

/**
 * Formatira ime za oslovljavanje: uzima prvo ime
 */
export function extractFirstName(fullName?: string): string {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0] || '';
}

/**
 * Zamjenjuje rodne oblike i varijable u tekstu poruke ili naslovu
 */
export function formatReminderText(
  rawText: string,
  recipient: { imePrezime?: string; spol?: string },
  eventInfo?: Partial<ReminderEventInfo>
): string {
  if (!rawText) return '';

  const isMale = isMaleGender(recipient.spol);
  const firstName = extractFirstName(recipient.imePrezime) || 'sudionik';

  let text = rawText;

  // 1. Specifični izrazi za rod prema zahtjevu korisnika:
  // - Dragi/a [ime] -> Dragi Marko / Draga Ana
  // - Dragi/a -> Dragi / Draga
  // - prijavljen/a -> prijavljen / prijavljena
  // - javio/la (i javio/javilala) -> javio / javila
  
  // Dragi/a s opcionalnim [ime] ili bez njega
  text = text.replace(/Dragi\/a\s+\[ime\]/gi, isMale ? `Dragi ${firstName}` : `Draga ${firstName}`);
  text = text.replace(/Dragi\/a\s+\{ime\}/gi, isMale ? `Dragi ${firstName}` : `Draga ${firstName}`);
  text = text.replace(/Dragi\/a/gi, isMale ? 'Dragi' : 'Draga');
  text = text.replace(/dragi\/a/gi, isMale ? 'dragi' : 'draga');
  text = text.replace(/Dragi\/Draga/gi, isMale ? 'Dragi' : 'Draga');
  text = text.replace(/dragi\/draga/gi, isMale ? 'dragi' : 'draga');
  text = text.replace(/\{dragi\/draga\}/gi, isMale ? 'Dragi' : 'Draga');

  // prijavljen/a
  text = text.replace(/prijavljen\/a/gi, isMale ? 'prijavljen' : 'prijavljena');
  text = text.replace(/prijavljen\/prijavljena/gi, isMale ? 'prijavljen' : 'prijavljena');
  text = text.replace(/\{prijavljen\/prijavljena\}/gi, isMale ? 'prijavljen' : 'prijavljena');

  // javio/la i tipfelere poput javio/javilala
  text = text.replace(/javio\/javilala/gi, isMale ? 'javio' : 'javila');
  text = text.replace(/javio\/javila/gi, isMale ? 'javio' : 'javila');
  text = text.replace(/javio\/la/gi, isMale ? 'javio' : 'javila');
  text = text.replace(/\{javio\/javila\}/gi, isMale ? 'javio' : 'javila');

  // Opcionalna sintaksa {M: tekst za muškarce | Ž: tekst za žene}
  text = text.replace(/\{M:\s*(.*?)\s*\|\s*Ž:\s*(.*?)\s*\}/gis, (_, malePart, femalePart) => {
    return isMale ? malePart : femalePart;
  });

  // 2. Zamjena dinamičkih varijabli
  text = text.replace(/\[ime\]|\{ime\}/gi, firstName);
  text = text.replace(/\[puno_ime\]|\{puno_ime\}/gi, recipient.imePrezime || firstName);

  if (eventInfo) {
    if (eventInfo.title) {
      text = text.replace(/\[naziv_eventa\]|\[naziv\]|\[event\]|\{naziv_eventa\}|\{event\}/gi, eventInfo.title);
    }
    if (eventInfo.dateStr) {
      text = text.replace(/\[datum\]|\{datum\}/gi, eventInfo.dateStr);
    }
    if (eventInfo.timeStr) {
      text = text.replace(/\[vrijeme\]|\{vrijeme\}/gi, eventInfo.timeStr);
    }
    if (eventInfo.location) {
      text = text.replace(/\[lokacija\]|\{lokacija\}/gi, eventInfo.location);
    }
  }

  return text;
}

/**
 * Prebacuje obični tekst u stilizirani HTML predložak za e-mail
 */
export function buildReminderHtml(formattedBodyText: string, eventInfo?: Partial<ReminderEventInfo>): string {
  // Sigurna konverzija novih redaka u HTML odlomke i prijelome
  const paragraphs = formattedBodyText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const paragraphsHtml = paragraphs
    .map(p => {
      const formattedParagraph = p.replace(/\n/g, '<br/>');
      return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #333333;">${formattedParagraph}</p>`;
    })
    .join('');

  const eventDetailsBox = eventInfo && (eventInfo.dateStr || eventInfo.timeStr || eventInfo.location) ? `
  <div style="margin: 25px 0; padding: 18px 20px; background-color: #FFF5F7; border: 1px solid #FFE0E6; border-radius: 12px;">
    <h4 style="margin: 0 0 12px 0; color: #E85D75; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">
      📍 Podaci o susretu:
    </h4>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #444444;">
      ${eventInfo.title ? `<tr><td style="padding: 4px 0; width: 28px;">🏷️</td><td style="padding: 4px 0;"><strong>${eventInfo.title}</strong></td></tr>` : ''}
      ${eventInfo.dateStr ? `<tr><td style="padding: 4px 0; width: 28px;">📅</td><td style="padding: 4px 0;"><strong>${eventInfo.dateStr}</strong></td></tr>` : ''}
      ${eventInfo.timeStr ? `<tr><td style="padding: 4px 0; width: 28px;">🕖</td><td style="padding: 4px 0;"><strong>${eventInfo.timeStr}</strong></td></tr>` : ''}
      ${eventInfo.location ? `<tr><td style="padding: 4px 0; width: 28px;">📍</td><td style="padding: 4px 0;"><strong>${eventInfo.location}</strong></td></tr>` : ''}
    </table>
  </div>` : '';

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
  <!-- Zaglavlje -->
  <div style="background: linear-gradient(135deg, #E85D75 0%, #d4435b 100%); padding: 30px 24px 24px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #ffffff;">
      Na prvi pogled
    </h1>
    <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95; letter-spacing: 0.3px; color: #ffffff;">
      Speed Dating susreti u Zagrebu
    </p>
  </div>

  <!-- Tijelo e-maila -->
  <div style="padding: 30px 28px 24px 28px;">
    ${paragraphsHtml}

    ${eventDetailsBox}

    <!-- Odjava / Napomena -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eeeeee;">
      <p style="font-size: 14px; margin: 0; color: #666666; line-height: 1.6;">
        Srdačan pozdrav,<br/>
        <strong style="color: #333333; font-size: 16px;">Ivan</strong><br/>
        <span style="color: #E85D75; font-weight: 600;">Na prvi pogled</span><br/>
        <span style="font-size: 12px; color: #999999; font-style: italic;">Upoznaj nekoga, kao nekad.</span>
      </p>
    </div>
  </div>

  <!-- Podnožje -->
  <div style="background-color: #fcfcfc; border-top: 1px solid #f0f0f0; padding: 16px 24px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.4;">
      Ova poruka je automatski podsjetnik poslan prijavljenim sudionicima platforme Na prvi pogled.<br/>
      Za sva pitanja slobodno nas kontaktiraj putem web platforme ili na email.
    </p>
  </div>
</div>
  `.trim();
}

/**
 * Šalje jedan e-mail podsjetnik putem EmailJS-a
 */
export async function sendSingleReminder(
  recipient: ReminderRecipient,
  subjectTemplate: string,
  bodyTemplate: string,
  eventInfo?: Partial<ReminderEventInfo>
): Promise<any> {
  const finalSubject = formatReminderText(subjectTemplate, recipient, eventInfo);
  const formattedBody = formatReminderText(bodyTemplate, recipient, eventInfo);
  const htmlMessage = buildReminderHtml(formattedBody, eventInfo);

  return emailjs.send(
    'default_service',
    'template_uuvkcp3',
    {
      name: extractFirstName(recipient.imePrezime) || 'Sudionik',
      email: recipient.email,
      subject: finalSubject,
      html_message: htmlMessage
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}

export interface ReminderProgressState {
  current: number;
  total: number;
  success: number;
  failed: number;
  currentRecipientName?: string;
  errors?: { recipient: ReminderRecipient; error: any }[];
}

/**
 * Šalje e-mail podsjetnike u seriji (batch) s pauzom između slanja radi EmailJS stabilnosti
 */
export async function sendReminderBatch(
  recipients: ReminderRecipient[],
  subjectTemplate: string,
  bodyTemplate: string,
  eventInfo: Partial<ReminderEventInfo>,
  onProgress?: (progress: ReminderProgressState) => void,
  delayMs: number = 250
): Promise<{ success: number; failed: number; errors: { recipient: ReminderRecipient; error: any }[] }> {
  let success = 0;
  let failed = 0;
  const errors: { recipient: ReminderRecipient; error: any }[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: recipients.length,
        success,
        failed,
        currentRecipientName: recipient.imePrezime,
        errors
      });
    }

    try {
      await sendSingleReminder(recipient, subjectTemplate, bodyTemplate, eventInfo);
      success++;
    } catch (err) {
      console.error(`Greška pri slanju podsjetnika za ${recipient.email}:`, err);
      failed++;
      errors.push({ recipient, error: err });
    }

    // Izvještavanje o novom stanju nakon pojedinačnog slanja
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: recipients.length,
        success,
        failed,
        currentRecipientName: recipient.imePrezime,
        errors
      });
    }

    // Mala pauza između zahtjeva da EmailJS API ne odbije zahtjeve
    if (i < recipients.length - 1 && delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  return { success, failed, errors };
}
