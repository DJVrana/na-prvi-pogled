import emailjs from '@emailjs/browser';

export interface SendMatchEmailParams {
  eventTitle: string;
  maleName: string;
  femaleName: string;
  maleEmail: string;
  femaleEmail: string;
  femaleInstagram?: string;
  femalePhone?: string;
}

export async function sendMatchEmail(params: SendMatchEmailParams): Promise<any> {
  const { eventTitle, maleName, femaleName, maleEmail, femaleEmail, femaleInstagram, femalePhone } = params;

  const matchHtmlMessage = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Dragi <strong>${maleName.split(' ')[0]}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${eventTitle}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${femaleName.split(' ')[0]} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${femaleName}</p>
    ${femaleInstagram ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${femaleInstagram.replace('@', '')}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${femaleInstagram.startsWith('@') ? femaleInstagram : '@' + femaleInstagram}</a></p>` : ''}
    ${femalePhone ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${femalePhone}" style="color: #333333; font-weight: bold;">${femalePhone}</a></p>` : ''}
    ${femaleEmail ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${femaleEmail}" style="color: #666666;">${femaleEmail}</a></p>` : ''}
  </div>

  <p style="font-size: 15px;">Vrijeme je da napraviš prvi korak, pošalješ poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">Srdačan pozdrav,<br/><strong style="color: #333333;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.</p>
  </div>
</div>
  `;

  return emailjs.send(
    'default_service',
    'template_uuvkcp3',
    {
      name: maleName.split(' ')[0],
      email: maleEmail,
      subject: "Pronađen je novi Match! 💖 | Na prvi pogled",
      html_message: matchHtmlMessage
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}
