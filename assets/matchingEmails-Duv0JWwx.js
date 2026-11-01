import{i as e}from"./formatters-B7vUsS2c.js";import{t}from"./es-DDI4gkcl.js";async function n(n){let{eventTitle:r,maleName:i,femaleName:a,maleEmail:o,femaleEmail:s,femaleInstagram:c,femalePhone:l,maleInstagram:u,malePhone:d,recipient:f=`male`}=n,p=(i||`Sudionik`).trim().split(` `)[0],m=(a||`Sudionica`).trim().split(` `)[0],h=f===`female`,g=h?m:p,_=h?s:o;if(!_)throw Error(`Email adresa za primatelja (${f}) nije definirana.`);let v=h?`
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Draga <strong>${m}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${r}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${p} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${i}</p>
    ${u?`<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${u.replace(`@`,``)}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${u.startsWith(`@`)?u:`@`+u}</a></p>`:``}
    ${d?`<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${d}" style="color: #333333; font-weight: bold;">${d}</a></p>`:``}
    ${o?`<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${o}" style="color: #666666;">${o}</a></p>`:``}
  </div>

  <p style="font-size: 15px;">Uskoro ti se može javiti, a slobodno i ti napravi prvi korak, pošalji poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  ${e()}
</div>
    `:`
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Dragi <strong>${p}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${r}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${m} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${a}</p>
    ${c?`<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${c.replace(`@`,``)}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${c.startsWith(`@`)?c:`@`+c}</a></p>`:``}
    ${l?`<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${l}" style="color: #333333; font-weight: bold;">${l}</a></p>`:``}
    ${s?`<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${s}" style="color: #666666;">${s}</a></p>`:``}
  </div>

  <p style="font-size: 15px;">Vrijeme je da napraviš prvi korak, pošalješ poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  ${e()}
</div>
    `;return t.send(`default_service`,`template_uuvkcp3`,{name:g,email:_,subject:`Pronađen je novi Match! 💖 | Na prvi pogled`,html_message:v},`u1xSiCheIxgLpWexO`)}async function r(e){return n({...e,recipient:`female`})}export{n,r as t};