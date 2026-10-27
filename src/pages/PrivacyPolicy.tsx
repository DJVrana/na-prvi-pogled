import { useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  Camera, 
  Heart, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  FileText,
  UserCheck,
  Server
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export function meta() {
  return [
    { title: "Pravila privatnosti | Na prvi pogled 💞 Speed Dating" },
    { name: "description", content: "Pravila privatnosti i zaštite osobnih podataka platforme Na prvi pogled. Saznajte kako štitimo vaše podatke – 100% GDPR usklađeno, bez vanjske analitike i praćenja." }
  ];
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Pravila privatnosti | Na prvi pogled 💞 Speed Dating";
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pravila privatnosti - Na prvi pogled",
    "description": "Pravila privatnosti i zaštite osobnih podataka platforme Na prvi pogled u skladu s GDPR uredbom.",
    "url": "https://naprvipogled.com/pravila-privatnosti"
  };

  return (
    <div className="min-h-screen bg-peach text-brand font-sans relative overflow-x-hidden selection:bg-brand selection:text-white flex flex-col">
      <SEO 
        title="Pravila privatnosti | Na prvi pogled 💞 Speed Dating"
        description="Pravila privatnosti i zaštite osobnih podataka platforme Na prvi pogled. Saznajte kako štitimo vaše podatke u skladu s GDPR-om – bez vanjske analitike i praćenja."
        canonical="https://naprvipogled.com/pravila-privatnosti"
        structuredData={structuredData}
        keywords="pravila privatnosti na prvi pogled, zaštita podataka speed dating zagreb, gdpr na prvi pogled, privatnost podataka"
      />

      <Navbar />

      {/* Decorative ambient blobs */}
      <div className="absolute top-20 left-[-5%] w-80 h-80 rounded-full bg-rose-300/20 blur-[100px] animate-ambient-drift pointer-events-none" />
      <div className="absolute bottom-40 right-[-5%] w-96 h-96 rounded-full bg-brand/10 blur-[120px] animate-ambient-drift pointer-events-none" />

      {/* Main Content Container */}
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand/70 hover:text-brand transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Natrag na početnu</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Zaštita privatnosti i transparentnost</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand mb-4 leading-tight tracking-tight">
            Pravila privatnosti
          </h1>
          <p className="text-brand/80 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Vaša privatnost, sigurnost i povjerenje naš su apsolutni prioritet. Ovdje transparentno objašnjavamo kako rukujemo vašim podacima – jednostavno, iskreno, u potpunosti usklađeno s GDPR uredbom i bez skrivenih uvjeta.
          </p>
          <p className="text-xs text-brand/60 mt-3 font-medium">
            Zadnje ažuriranje: {new Date().toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Highlight Banner: ZERO EXTERNAL ANALYTICS */}
        <section className="mb-10 bg-gradient-to-br from-emerald-500/10 via-white/85 to-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-300/60 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300/50 shadow-inner">
              <EyeOff size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Važno jamstvo
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Na ovoj stranici nema vanjske analitike
                </h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                Naša web platforma <strong>ne koristi Google Analytics, Meta (Facebook) Pixel, TikTok Pixel, Hotjar</strong> niti bilo koje druge vanjske alate za praćenje, profiliranje ili bihevioralno oglašavanje. Vaše posjete ne bilježimo, ne pratimo vaše navike po internetu i ne plasiramo vam oglase trećih strana.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Lock size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Sigurna pohrana</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Podaci se čuvaju na zaštićenoj Google Cloud Firebase infrastrukturi sa strogim pravilima pristupa i enkripcijom.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Heart size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Diskrecija kontakta</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Vaš kontakt dijeli se isključivo s osobom s kojom ostvarite obostrani match (uzajamni like). U suprotnom ostaje tajan.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Camera size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Transparentno snimanje</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Promotivni isječci za Instagram snimaju se uz vaše znanje radi dočaravanja atmosfere susreta, uz puno uvažavanje dostojanstva.
            </p>
          </div>
        </div>

        {/* Detailed Sections Container */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand/5 border border-white space-y-10 text-brand/90 leading-relaxed text-sm sm:text-base">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">1.</span> O voditelju obrade osobnih podataka
            </h2>
            <p className="mb-3">
              Voditelj obrade osobnih podataka u smislu Opće uredbe o zaštiti podataka (GDPR - Uredba (EU) 2016/679) je projekt <strong>„Na prvi pogled”</strong> koji organizira speed dating događaje i tematska druženja na području grada Zagreba i Republike Hrvatske.
            </p>
            <p>
              Za sva pitanja, zahtjeve za uvidom, ispravkom ili trajnim brisanjem vaših osobnih podataka možete nam se u svakom trenutku obratiti putem našeg službenog kontakta:
            </p>
            <div className="mt-3 bg-brand/5 p-4 rounded-2xl border border-brand/10 text-xs sm:text-sm space-y-1.5">
              <p><strong>E-mail adresa:</strong> <a href="mailto:naprvipogled.events@gmail.com" className="font-semibold underline text-brand hover:text-brand-light">naprvipogled.events@gmail.com</a></p>
              <p><strong>Instagram profil:</strong> <a href="https://instagram.com/na.prvi.pogled" target="_blank" rel="noreferrer" className="font-semibold underline text-brand hover:text-brand-light">@na.prvi.pogled</a></p>
              <p><strong>TikTok profil:</strong> <a href="https://www.tiktok.com/@na.prvi.pogled" target="_blank" rel="noreferrer" className="font-semibold underline text-brand hover:text-brand-light">@na.prvi.pogled</a></p>
              <p><strong>Facebook stranica:</strong> <a href="https://web.facebook.com/profile.php?id=61594619954084" target="_blank" rel="noreferrer" className="font-semibold underline text-brand hover:text-brand-light">Na prvi pogled</a></p>
              <p><strong>Lokacija djelovanja:</strong> Zagreb, Republika Hrvatska</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">2.</span> Potpuna odsutnost vanjskih alata za praćenje i kolačića
            </h2>
            <p className="mb-3">
              Za razliku od većine komercijalnih portala, <strong>Na prvi pogled NE koristi:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mb-3 text-sm sm:text-base">
              <li>Google Analytics, Adobe Analytics ili slične platforme za analitiku posjeta</li>
              <li>Meta / Facebook Pixel ili društvene mrežne trackere</li>
              <li>Sustave za praćenje ponašanja miša i snimanje ekrana (Hotjar, CrazyEgg i sl.)</li>
              <li>Marketinške kolačiće trećih strana ili alate za profiliranje korisnika</li>
            </ul>
            <div className="text-xs sm:text-sm bg-brand/5 p-4 rounded-2xl border border-brand/10 leading-relaxed">
              💡 <strong>Tehnički nužni kolačići (Strictly Necessary Cookies):</strong> Koriste se isključivo za osnovno funkcioniranje web aplikacije – konkretno za održavanje sigurne sesije prijave putem Google računa (Firebase Auth token). Ovi elementi ne prate vaše kretanje po drugim stranicama i brišu se odjavom ili istekom sesije. Zbog toga na našoj stranici nema napornih bannera za pristanak na marketinške kolačiće.
            </div>
          </section>

          {/* Section 3 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">3.</span> Osobni podaci koje prikupljamo i svrha obrade
            </h2>
            <p className="mb-4">
              Prikupljamo isključivo one podatke koji su strogo nužni za kvalitetnu i sigurnu organizaciju susreta, koordinaciju prijava i rad matching sustava:
            </p>
            
            <div className="space-y-3.5">
              
              {/* Google Auth */}
              <div className="bg-white/85 p-4 sm:p-5 rounded-2xl border border-white shadow-xs">
                <div className="flex items-center gap-2 font-bold text-brand text-sm sm:text-base mb-1">
                  <UserCheck size={18} className="text-brand-light" />
                  <h4>Podaci Google računa (E-mail i ime)</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand/80 leading-relaxed">
                  Preuzimaju se prilikom autentifikacije putem Googlea. Svrha je sprječavanje lažnih i automatiziranih (bot) prijava te slanje obavijesti o statusu prijave, točnom terminu i lokaciji susreta te rezultatima matchinga.
                </p>
              </div>

              {/* Form Data */}
              <div className="bg-white/85 p-4 sm:p-5 rounded-2xl border border-white shadow-xs">
                <div className="flex items-center gap-2 font-bold text-brand text-sm sm:text-base mb-1">
                  <FileText size={18} className="text-brand-light" />
                  <h4>Ime i prezime, dob i spol</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand/80 leading-relaxed">
                  Podaci koji se unose u prijavnicu za događaj. Nužni su za provjeru punoljetnosti, kreiranje optimalnog rasporeda rotacija te osiguravanje uravnoteženog omjera žena i muškaraca sličnih dobnih skupina.
                </p>
              </div>

              {/* Matching */}
              <div className="bg-white/85 p-4 sm:p-5 rounded-2xl border border-white shadow-xs">
                <div className="flex items-center gap-2 font-bold text-brand text-sm sm:text-base mb-1">
                  <Heart size={18} className="text-brand-light" />
                  <h4>Podaci za Matching sustav (Kontakt: Instagram ili mobitel)</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand/80 leading-relaxed">
                  Kontakt koji sudionik unosi za potrebe spajanja. <strong>Strogo pravilo diskrecije:</strong> vaš kontakt dostavlja se <em>isključivo i samo</em> osobi s kojom ostvarite obostrani match (obje osobe su označile 'Like'). Ako nema uzajamnog sviđanja, vaš odabir i kontakt ostaju 100% povjerljivi i nikada se ne otkrivaju drugoj strani.
                </p>
              </div>

              {/* Contact Form */}
              <div id="kontakt-obrada" className="bg-white/85 p-4 sm:p-5 rounded-2xl border border-white shadow-xs scroll-mt-28">
                <div className="flex items-center gap-2 font-bold text-brand text-sm sm:text-base mb-1">
                  <Mail size={18} className="text-brand-light" />
                  <h4>Podaci iz kontakt obrasca (Ime, e-mail, telefon i poruka)</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand/80 leading-relaxed">
                  Podaci koje dobrovoljno unesete u kontakt obrazac na stranici <Link to="/kontakt" className="font-bold underline text-brand hover:text-brand-light">Kontakt</Link> obrađuju se isključivo u svrhu pružanja odgovora na vaš upit ili rješavanja vašeg pitanja. Ti se podaci ne koriste za marketinške promocije i brišu se nakon što je komunikacija uspješno zaključena.
                </p>
              </div>

            </div>
          </section>

          {/* Section 4 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">4.</span> Pravne osnove za obradu podataka (GDPR čl. 6)
            </h2>
            <p className="mb-3">
              Obrada vaših osobnih podataka temelji se na sljedećim pravnim osnovama:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Izvršenje ugovora / usluge (čl. 6. st. 1. t. b GDPR-a):</strong> Obrada podataka nužna je kako bismo zaprimili prijavu, organizirali događaj, osigurali vaše mjesto i proveli postupak matchinga.
              </li>
              <li>
                <strong>Privola ispitanika (čl. 6. st. 1. t. a GDPR-a):</strong> Za slanje kontakt upita te za suglasnost vezanu uz promotivno snimanje i fotografiranje na susretu. Privolu možete opozvati u svakom trenutku.
              </li>
              <li>
                <strong>Legitimni interes (čl. 6. st. 1. t. f GDPR-a):</strong> Osiguravanje tehničke stabilnosti sustava, sprječavanje zlouporaba (spama i lažnih profila) te zaštita sigurnosti i dostojanstva svih sudionika susreta.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">5.</span> Suglasnost za snimanje i fotografiranje na susretima
            </h2>
            <p className="mb-4">
              U svrhu promocije susreta i dočaravanja ugodne i opuštene atmosfere na društvenim mrežama, sudionici prijavom na događaj prihvaćaju sljedeću suglasnost:
            </p>

            <div className="bg-rose-50/70 border-l-4 border-brand p-5 rounded-r-2xl text-xs sm:text-sm leading-relaxed text-brand italic">
              „Dolaskom na susret »Na prvi pogled« dajem suglasnost za sudjelovanje u snimanju te za prikazivanje snimki, fotografija i drugih materijala na društvenoj mreži Instagram na profilu »Na prvi pogled«. Organizator će u svrhu promocije objaviti kratke audiovizualne isječke na društvenim mrežama (story i reel videozapise). Potvrđujem da su sve snimke, fotografije i ostali materijali izrađeni uz moje znanje od strane organizatora »Na prvi pogled« te ovime dajem svoju izričitu suglasnost i pristanak za korištenje svojega lika i njihovo objavljivanje u promotivne svrhe.
              <br /><br />
              Suglasan/suglasna sam da sva autorska, vlasnička te bilo koja druga materijalna i nematerijalna prava na svim promotivnim materijalima neograničeno i isključivo pripadaju organizatoru »Na prvi pogled«.”
            </div>
            <p className="mt-3 text-xs sm:text-sm text-brand/80">
              Organizator uvijek pazi na dostojanstvo sudionika te se materijali kreiraju s ciljem prikazivanja lijepe, kulturne i vedre atmosfere događaja. Ukoliko iz opravdanih privatnih razloga želite da se određeni kadar u kojem ste prepoznatljivi ukloni ili zamuti, dovoljno je poslati poruku organizatoru i zahtjevu će se odmah udovoljiti.
            </p>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">6.</span> Sigurnost, infrastruktura i dijeljenje podataka
            </h2>
            <p className="mb-3">
              Vaši podaci pohranjuju se na Google Firebase infrastrukturi (Google Cloud Platform) unutar Europske unije, koja primjenjuje najviše međunarodne standarde sigurnosti i enkripcije (ISO 27001, SOC 2, SOC 3, GDPR).
            </p>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Nema prodaje podataka:</strong> Vaši osobni podaci <strong>nikada se ne prodaju, ne ustupaju niti iznajmljuju</strong> oglašivačima, marketinškim agencijama ili trećim stranama.
              </li>
              <li>
                <strong>Tehnički posrednici:</strong> Za slanje e-mail obavijesti koristimo pouzdani servis EmailJS koji funkcionira isključivo kao tehnički posrednik za isporuku e-maila bez trajnog zadržavanja sadržaja poruka.
              </li>
              <li>
                <strong>Stroga prava pristupa:</strong> Uvid u pristigle prijave i bazu podataka ima isključivo ovlašteni organizacijski tim „Na prvi pogled”.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">7.</span> Rokovi čuvanja podataka
            </h2>
            <p className="mb-3">
              Osobne podatke čuvamo samo onoliko dugo koliko je nužno za ispunjenje svrhe u koju su prikupljeni:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Podaci o prijavama i matching glasovima:</strong> Čuvaju se do provedbe i zaključenja susreta i razmjene kontakata, odnosno do trenutka kada korisnik zatraži brisanje profila.
              </li>
              <li>
                <strong>Kontakt upiti:</strong> Čuvaju se najviše 12 mjeseci od zaprimanja radi eventualne naknadne komunikacije, nakon čega se trajno brišu.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">8.</span> Vaša prava prema GDPR uredbi
            </h2>
            <p className="mb-3">
              Kao ispitanik, u svakom trenutku imate pravo ostvariti sljedeća zakonska prava bez ikakve naknade:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 bg-white/70 p-3.5 rounded-2xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Pravo na pristup i uvid:</strong> saznati koje sve podatke o vama posjedujemo i zatražiti kopiju.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3.5 rounded-2xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Pravo na ispravak:</strong> zatražiti trenutno ažuriranje netočnih ili nepotpunih podataka.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3.5 rounded-2xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Pravo na brisanje („pravo na zaborav”):</strong> trajno uklanjanje vašeg profila, prijava i svih povezanih podataka.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3.5 rounded-2xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Pravo na povlačenje privole:</strong> u bilo kojem trenutku možete opozvati prethodno danu suglasnost.</span>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed">
              Za ostvarivanje bilo kojeg prava dovoljno je poslati e-mail na{' '}
              <a href="mailto:naprvipogled.events@gmail.com" className="font-bold underline text-brand hover:text-brand-light">
                naprvipogled.events@gmail.com
              </a>. Na vaš zahtjev odgovorit ćemo u najkraćem roku, a najkasnije u roku od 30 dana. Također, imate pravo podnijeti pritužbu nadzornom tijelu – <strong>Agenciji za zaštitu osobnih podataka (AZOP)</strong>, Selska cesta 136, Zagreb (<a href="https://azop.hr" target="_blank" rel="noreferrer" className="underline font-semibold">azop.hr</a>).
            </p>
          </section>

          {/* Section 9 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">9.</span> Kontakt i izmjene ovih pravila
            </h2>
            <p className="mb-4">
              Organizator zadržava pravo ažuriranja ovih pravila privatnosti u slučaju izmjene zakonskih propisa ili tehničkog unapređenja platforme. Svaka izmjena stupa na snagu trenutkom objave na ovoj stranici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="mailto:naprvipogled.events@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm hover:bg-brand-light transition-all shadow-sm"
              >
                <Mail size={16} /> naprvipogled.events@gmail.com
              </a>
              <a
                href="https://instagram.com/na.prvi.pogled"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand border border-brand/20 px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all shadow-xs"
              >
                <FaInstagram size={16} className="text-brand-light" /> @na.prvi.pogled
              </a>
            </div>
          </section>

        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-brand font-bold text-sm px-7 py-3 rounded-full border border-white shadow-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={16} /> Povratak na naslovnicu
          </Link>
          <p className="text-xs text-brand/60 mt-6">
            © {new Date().getFullYear()} Na prvi pogled. Sva prava pridržana. • Zagreb, Hrvatska
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
