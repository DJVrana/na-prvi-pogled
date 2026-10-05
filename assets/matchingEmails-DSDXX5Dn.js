import{r as e}from"./heart-Dy6_V1Ek.js";var t=e(`search`,[[`path`,{d:`m21 21-4.34-4.34`,key:`14j7rj`}],[`circle`,{cx:`11`,cy:`11`,r:`8`,key:`4ej97u`}]]),n=e(`x`,[[`path`,{d:`M18 6 6 18`,key:`1bl5f8`}],[`path`,{d:`m6 6 12 12`,key:`d8bk6v`}]]),r=class{constructor(e=0,t=`Network Error`){this.status=e,this.text=t}},i={origin:`https://api.emailjs.com`,blockHeadless:!1,storageProvider:(()=>{if(!(typeof localStorage>`u`))return{get:e=>Promise.resolve(localStorage.getItem(e)),set:(e,t)=>Promise.resolve(localStorage.setItem(e,t)),remove:e=>Promise.resolve(localStorage.removeItem(e))}})()},a=e=>e?typeof e==`string`?{publicKey:e}:e.toString()===`[object Object]`?e:{}:{},o=(e,t=`https://api.emailjs.com`)=>{if(!e)return;let n=a(e);i.publicKey=n.publicKey,i.blockHeadless=n.blockHeadless,i.storageProvider=n.storageProvider,i.blockList=n.blockList,i.limitRate=n.limitRate,i.origin=n.origin||t},s=async(e,t,n={})=>{let a=await fetch(i.origin+e,{method:`POST`,headers:n,body:t}),o=await a.text(),s=new r(a.status,o);if(a.ok)return s;throw s},c=(e,t,n)=>{if(!e||typeof e!=`string`)throw`The public key is required. Visit https://dashboard.emailjs.com/admin/account`;if(!t||typeof t!=`string`)throw`The service ID is required. Visit https://dashboard.emailjs.com/admin`;if(!n||typeof n!=`string`)throw`The template ID is required. Visit https://dashboard.emailjs.com/admin/templates`},l=e=>{if(e&&e.toString()!==`[object Object]`)throw`The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/`},u=e=>e.webdriver||!e.languages||e.languages.length===0,d=()=>new r(451,`Unavailable For Headless Browser`),f=(e,t)=>{if(!Array.isArray(e))throw`The BlockList list has to be an array`;if(typeof t!=`string`)throw`The BlockList watchVariable has to be a string`},p=e=>!e.list?.length||!e.watchVariable,m=(e,t)=>e instanceof FormData?e.get(t):e[t],h=(e,t)=>{if(p(e))return!1;f(e.list,e.watchVariable);let n=m(t,e.watchVariable);return typeof n==`string`&&e.list.includes(n)},g=()=>new r(403,`Forbidden`),_=(e,t)=>{if(typeof e!=`number`||e<0)throw`The LimitRate throttle has to be a positive number`;if(t&&typeof t!=`string`)throw`The LimitRate ID has to be a non-empty string`},v=async(e,t,n)=>{let r=Number(await n.get(e)||0);return t-Date.now()+r},y=async(e,t,n)=>{if(!t.throttle||!n)return!1;_(t.throttle,t.id);let r=t.id||e;return await v(r,t.throttle,n)>0||(await n.set(r,Date.now().toString()),!1)},b=()=>new r(429,`Too Many Requests`),x=async(e,t,n,r)=>{let o=a(r),f=o.publicKey||i.publicKey,p=o.blockHeadless||i.blockHeadless,m=o.storageProvider||i.storageProvider,_={...i.blockList,...o.blockList},v={...i.limitRate,...o.limitRate};return p&&u(navigator)?Promise.reject(d()):(c(f,e,t),l(n),n&&h(_,n)?Promise.reject(g()):await y(location.pathname,v,m)?Promise.reject(b()):s(`/api/v1.0/email/send`,JSON.stringify({lib_version:`4.4.1`,user_id:f,service_id:e,template_id:t,template_params:n}),{"Content-type":`application/json`}))},S=e=>{if(!e||e.nodeName!==`FORM`)throw`The 3rd parameter is expected to be the HTML form element or the style selector of the form`},C=e=>typeof e==`string`?document.querySelector(e):e,w={init:o,send:x,sendForm:async(e,t,n,r)=>{let o=a(r),l=o.publicKey||i.publicKey,f=o.blockHeadless||i.blockHeadless,p=i.storageProvider||o.storageProvider,m={...i.blockList,...o.blockList},_={...i.limitRate,...o.limitRate};if(f&&u(navigator))return Promise.reject(d());let v=C(n);c(l,e,t),S(v);let x=new FormData(v);return h(m,x)?Promise.reject(g()):await y(location.pathname,_,p)?Promise.reject(b()):(x.append(`lib_version`,`4.4.1`),x.append(`service_id`,e),x.append(`template_id`,t),x.append(`user_id`,l),s(`/api/v1.0/email/send-form`,x))},EmailJSResponseStatus:r};async function T(e){let{eventTitle:t,maleName:n,femaleName:r,maleEmail:i,femaleEmail:a,femaleInstagram:o,femalePhone:s,maleInstagram:c,malePhone:l,recipient:u=`male`}=e,d=(n||`Sudionik`).trim().split(` `)[0],f=(r||`Sudionica`).trim().split(` `)[0],p=u===`female`,m=p?f:d,h=p?a:i;if(!h)throw Error(`Email adresa za primatelja (${u}) nije definirana.`);let g=p?`
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Draga <strong>${f}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${t}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${d} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${n}</p>
    ${c?`<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${c.replace(`@`,``)}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${c.startsWith(`@`)?c:`@`+c}</a></p>`:``}
    ${l?`<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${l}" style="color: #333333; font-weight: bold;">${l}</a></p>`:``}
    ${i?`<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${i}" style="color: #666666;">${i}</a></p>`:``}
  </div>

  <p style="font-size: 15px;">Uskoro ti se može javiti, a slobodno i ti napravi prvi korak, pošalji poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">Srdačan pozdrav,<br/><strong style="color: #333333;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.</p>
  </div>
</div>
    `:`
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
    <h1 style="color: #E85D75; margin: 0; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Na prvi pogled</h1>
    <p style="color: #888888; font-size: 14px; margin-top: 5px;">Pronađen je obostrani Match! 💖</p>
  </div>
  
  <p style="font-size: 16px;">Dragi <strong>${d}</strong>,</p>
  
  <p style="font-size: 16px;">Imamo sjajne vijesti s našeg Speed Dating susreta <strong>"${t}"</strong>!</p>
  
  <div style="background-color: #FFF0F2; border-left: 4px solid #E85D75; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 16px; color: #E85D75; font-weight: bold;">
      I ti i ${f} ste označili da se jedno drugom sviđate! ✨
    </p>
  </div>
  
  <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border: 1px dashed #cccccc; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333333; font-size: 16px; text-transform: uppercase;">Kontakt podaci za javljanje:</h3>
    <p style="margin: 6px 0; font-size: 15px;"><strong>Ime:</strong> ${r}</p>
    ${o?`<p style="margin: 6px 0; font-size: 15px;"><strong>Instagram:</strong> <a href="https://instagram.com/${o.replace(`@`,``)}" style="color: #E85D75; font-weight: bold; text-decoration: underline;">${o.startsWith(`@`)?o:`@`+o}</a></p>`:``}
    ${s?`<p style="margin: 6px 0; font-size: 15px;"><strong>Broj mobitela / WhatsApp:</strong> <a href="tel:${s}" style="color: #333333; font-weight: bold;">${s}</a></p>`:``}
    ${a?`<p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${a}" style="color: #666666;">${a}</a></p>`:``}
  </div>

  <p style="font-size: 15px;">Vrijeme je da napraviš prvi korak, pošalješ poruku i dogovorite kavu ili piće! 😉</p>
  <p style="font-size: 13px; color: #777777;">Sve svoje matcheve također možeš u svakom trenutku pregledati i na svom korisničkom profilu na našoj web stranici.</p>

  <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">Srdačan pozdrav,<br/><strong style="color: #333333;">Ivan</strong><br/>Na prvi pogled<br/>Upoznaj nekoga, kao nekad.</p>
  </div>
</div>
    `;return w.send(`default_service`,`template_uuvkcp3`,{name:m,email:h,subject:`Pronađen je novi Match! 💖 | Na prvi pogled`,html_message:g},`u1xSiCheIxgLpWexO`)}async function E(e){return T({...e,recipient:`female`})}export{t as a,n as i,T as n,w as r,E as t};