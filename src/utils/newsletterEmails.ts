import emailjs from '@emailjs/browser';
import { getEmailSocialFooterHtml } from './formatters';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
  ageGroups?: string[];
  ageGroup?: string;
  exactAge?: number | null;
  gender?: string | null;
  active?: boolean;
  createdAt?: any;
}

export interface NewsletterEventDetails {
  id?: string;
  title: string;
  dateStr: string;
  timeStr: string;
  location: string;
  ageGroup: string;
  price?: string;
  coreEventUrl?: string;
}

export interface NewsletterBatchProgress {
  current: number;
  total: number;
  success: number;
  failed: number;
  currentEmail?: string;
  errors?: { email: string; error: any }[];
}

/**
 * Provjerava odgovara li pretplatnik dobnoj skupini kreiranog eventa
 */
export function isSubscriberMatchingEvent(
  sub: NewsletterSubscriber,
  event: Partial<NewsletterEventDetails>
): boolean {
  if (sub.active === false) return false;

  const eventAge = (event.ageGroup || '').toLowerCase().trim();
  const subGroups = Array.isArray(sub.ageGroups)
    ? sub.ageGroups
    : sub.ageGroup
    ? [sub.ageGroup]
    : [];

  // Ako je pretplatnik označio "Sve dobne skupine", uvijek odgovara
  if (subGroups.some(g => g.toLowerCase().includes('sve'))) {
    return true;
  }

  // Ako neka od odabranih skupina pretplatnika odgovara dobnoj skupini eventa
  const directMatch = subGroups.some(g => {
    const cleanG = g.toLowerCase().replace(/\s+/g, '');
    const cleanEvt = eventAge.replace(/\s+/g, '');
    return cleanG.includes(cleanEvt) || cleanEvt.includes(cleanG);
  });
  if (directMatch) return true;

  // Provjera po točnim godinama (ako su unesene)
  if (sub.exactAge && typeof sub.exactAge === 'number') {
    // Ekstrahiraj brojeve iz dobne skupine eventa (npr. "25 – 35 godina" -> [25, 35])
    const numbers = eventAge.match(/\d+/g)?.map(Number);
    if (numbers && numbers.length >= 2) {
      const min = Math.min(numbers[0], numbers[1]);
      const max = Math.max(numbers[0], numbers[1]);
      if (sub.exactAge >= min && sub.exactAge <= max) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Gradi HTML predložak za e-mail obavijest o novom eventu
 */
export function buildNewsletterEventHtml(
  event: Partial<NewsletterEventDetails>,
  recipientName?: string
): string {
  const firstName = recipientName ? recipientName.trim().split(' ')[0] : 'Bok';
  const socialFooter = getEmailSocialFooterHtml();

  const registrationUrl = 'https://naprvipogled.com/prijava';

  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D3748; line-height: 1.6; padding: 0; background-color: #FAFAFA;">
  
  <!-- Gornje zaglavlje -->
  <div style="background-color: #7B1D29; padding: 28px 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, serif;">
      NA PRVI POGLED
    </h1>
    <p style="color: #F8D7DA; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">
      Obavijest o novom speed dating susretu
    </p>
  </div>

  <!-- Glavni sadržaj -->
  <div style="background-color: #ffffff; padding: 32px 28px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
    
    <p style="font-size: 16px; margin: 0 0 16px 0;">
      Dragi/a <strong>${firstName}</strong>,
    </p>

    <p style="font-size: 15px; margin: 0 0 20px 0; color: #4A5568;">
      Imamo odlične vijesti! Upravo smo otvorili prijave za novi speed dating susret u tvojoj dobnoj skupini.
    </p>

    <!-- Kartica detalja eventa -->
    <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FFFDF5 100%); border: 2px solid #FBD38D; border-radius: 16px; padding: 22px 24px; margin: 24px 0;">
      <h2 style="font-family: Georgia, serif; color: #7B1D29; font-size: 20px; margin: 0 0 16px 0; border-bottom: 1px solid rgba(123, 29, 41, 0.15); padding-bottom: 10px;">
        ${event.title || 'Speed Dating susret'}
      </h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #2D3748;">
        ${event.dateStr ? `
        <tr>
          <td style="padding: 7px 0; width: 32px; font-size: 18px;">📅</td>
          <td style="padding: 7px 0;"><strong>Datum:</strong> ${event.dateStr}</td>
        </tr>` : ''}
        ${event.timeStr ? `
        <tr>
          <td style="padding: 7px 0; font-size: 18px;">🕖</td>
          <td style="padding: 7px 0;"><strong>Vrijeme:</strong> ${event.timeStr}</td>
        </tr>` : ''}
        ${event.location ? `
        <tr>
          <td style="padding: 7px 0; font-size: 18px;">📍</td>
          <td style="padding: 7px 0;"><strong>Lokacija:</strong> ${event.location}</td>
        </tr>` : ''}
        ${event.ageGroup ? `
        <tr>
          <td style="padding: 7px 0; font-size: 18px;">🎂</td>
          <td style="padding: 7px 0;"><strong>Dobna skupina:</strong> ${event.ageGroup}</td>
        </tr>` : ''}
        ${event.price ? `
        <tr>
          <td style="padding: 7px 0; font-size: 18px;">💳</td>
          <td style="padding: 7px 0;"><strong>Kotizacija:</strong> ${event.price}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- CTA Gumb -->
    <div style="text-align: center; margin: 30px 0 24px 0;">
      <a href="${registrationUrl}" target="_blank" style="display: inline-block; background-color: #7B1D29; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 15px 36px; border-radius: 50px; box-shadow: 0 4px 14px rgba(123, 29, 41, 0.3);">
        Prijavi se na susret &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #718096; text-align: center; margin: 0 0 24px 0;">
      ⚡ <em>Broj mjesta je ograničen radi balansa sudionika – preporučujemo prijavu na vrijeme!</em>
    </p>

    <!-- Društvene mreže i kontakt -->
    ${socialFooter}

  </div>

  <!-- Podnožje za odjavu -->
  <div style="background-color: #EDF2F7; padding: 20px 24px; text-align: center; font-size: 12px; color: #718096; border-radius: 0 0 16px 16px; border: 1px solid #E2E8F0; border-top: none;">
    <p style="margin: 0 0 6px 0;">
      Ovu obavijest primaš jer si se prijavio/la na newsletter obavijesti za speed dating susrete na stranici <strong>Na prvi pogled</strong>.
    </p>
    <p style="margin: 0;">
      Ako više ne želiš primati ove obavijesti, možeš se odjaviti u bilo kojem trenutku na svom korisničkom profilu na <a href="https://naprvipogled.com/profil" style="color: #7B1D29; text-decoration: underline;">naprvipogled.com/profil</a>.
    </p>
  </div>

</div>
  `.trim();
}

/**
 * Gradi HTML za proizvoljni (custom) newsletter e-mail
 */
export function buildCustomNewsletterHtml(
  title: string,
  bodyContent: string,
  recipientName?: string
): string {
  const firstName = recipientName ? recipientName.trim().split(' ')[0] : 'Pozdrav';
  const socialFooter = getEmailSocialFooterHtml();

  // Pretvori nove redove u odlomke ako nema HTML tagova
  const formattedBody = bodyContent.includes('<p>')
    ? bodyContent
    : bodyContent
        .split('\n\n')
        .map(p => `<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; color: #2D3748;">${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');

  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D3748; line-height: 1.6; padding: 0; background-color: #FAFAFA;">
  
  <!-- Gornje zaglavlje -->
  <div style="background-color: #7B1D29; padding: 26px 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, serif;">
      NA PRVI POGLED
    </h1>
    <p style="color: #F8D7DA; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">
      Speed Dating obavijest
    </p>
  </div>

  <!-- Glavni sadržaj -->
  <div style="background-color: #ffffff; padding: 32px 28px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
    
    <h2 style="font-family: Georgia, serif; color: #7B1D29; font-size: 20px; margin: 0 0 18px 0;">
      ${title}
    </h2>

    <p style="font-size: 15px; margin: 0 0 16px 0;">
      Dragi/a <strong>${firstName}</strong>,
    </p>

    ${formattedBody}

    <!-- Društvene mreže i kontakt -->
    ${socialFooter}

  </div>

  <!-- Podnožje za odjavu -->
  <div style="background-color: #EDF2F7; padding: 20px 24px; text-align: center; font-size: 12px; color: #718096; border-radius: 0 0 16px 16px; border: 1px solid #E2E8F0; border-top: none;">
    <p style="margin: 0 0 6px 0;">
      Ovu obavijest primaš jer si se prijavio/la na newsletter obavijesti na stranici <strong>Na prvi pogled</strong>.
    </p>
    <p style="margin: 0;">
      Ako više ne želiš primati obavijesti, možeš se odjaviti u bilo kojem trenutku na svom korisničkom profilu: <a href="https://naprvipogled.com/profil" style="color: #7B1D29; text-decoration: underline;">naprvipogled.com/profil</a>.
    </p>
  </div>

</div>
  `.trim();
}

/**
 * Šalje newsletter serijski (batch) putem EmailJS-a s delayem
 */
export async function sendNewsletterBatch(
  subscribers: NewsletterSubscriber[],
  subject: string,
  buildHtmlFn: (sub: NewsletterSubscriber) => string,
  onProgress?: (progress: NewsletterBatchProgress) => void,
  delayMs: number = 300
): Promise<{ success: number; failed: number; errors: { email: string; error: any }[] }> {
  let success = 0;
  let failed = 0;
  const errors: { email: string; error: any }[] = [];

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: subscribers.length,
        success,
        failed,
        currentEmail: sub.email,
        errors
      });
    }

    try {
      const htmlMessage = buildHtmlFn(sub);
      await emailjs.send(
        'default_service',
        'template_uuvkcp3',
        {
          name: sub.name?.trim() || 'Pretplatnik',
          email: sub.email.trim(),
          subject: subject,
          html_message: htmlMessage
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      success++;
    } catch (err: any) {
      console.error(`[Newsletter Batch] Greška pri slanju na ${sub.email}:`, err);
      failed++;
      errors.push({ email: sub.email, error: err });
    }

    if (i < subscribers.length - 1 && delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  if (onProgress) {
    onProgress({
      current: subscribers.length,
      total: subscribers.length,
      success,
      failed,
      errors
    });
  }

  return { success, failed, errors };
}

