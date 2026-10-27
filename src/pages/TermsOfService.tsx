import { useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Users, 
  Heart, 
  Wine, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Mail, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export function meta() {
  return [
    { title: "Uvjeti korištenja | Na prvi pogled 💞 Speed Dating" },
    { name: "description", content: "Opći uvjeti korištenja i pravila sudjelovanja na speed dating događajima „Na prvi pogled”. Saznajte sve o prijavama, kotizaciji, ponašanju i matchingu." }
  ];
}

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Uvjeti korištenja | Na prvi pogled 💞 Speed Dating";
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Uvjeti korištenja - Na prvi pogled",
    "description": "Opći uvjeti korištenja i pravila sudjelovanja na speed dating susretima platforme Na prvi pogled.",
    "url": "https://naprvipogled.com/uvjeti-koristenja"
  };

  return (
    <div className="min-h-screen bg-peach text-brand font-sans relative overflow-x-hidden selection:bg-brand selection:text-white flex flex-col">
      <SEO 
        title="Uvjeti korištenja | Na prvi pogled 💞 Speed Dating"
        description="Opći uvjeti korištenja i pravila sudjelovanja na speed dating susretima Na prvi pogled. Saznajte sve o prijavama, kotizacijama, pravilima ponašanja i diskreciji matchinga."
        canonical="https://naprvipogled.com/uvjeti-koristenja"
        structuredData={structuredData}
        keywords="uvjeti korištenja na prvi pogled, pravila speed dating zagreb, kotizacija uvjeti, speed dating pravila"
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
            <FileText size={14} className="text-brand-light" />
            <span>Uvjeti poslovanja i sudjelovanja</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand mb-4 leading-tight tracking-tight">
            Uvjeti korištenja
          </h1>
          <p className="text-brand/80 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Dobrodošli na <strong>Na prvi pogled</strong>. Ovdje su navedena pravila i uvjeti koji se primjenjuju na korištenje naše web stranice i sudjelovanje na našim speed dating susretima.
          </p>
          <p className="text-xs text-brand/60 mt-3 font-medium">
            Zadnje ažuriranje: {new Date().toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* 3 Core Principles Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Users size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Ravnoteža sudionika</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Prijave pažljivo odobravamo radi osiguravanja jednakog omjera žena i muškaraca sličnih dobnih skupina.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Wine size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Ugodan ambijent</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Biramo intimne, kvalitetne barove i njegujemo kulturu poštovanja, ugode i opuštenog upoznavanja.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-brand-light" />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">100% Diskretan match</h3>
            <p className="text-xs text-brand/75 leading-relaxed font-light">
              Kontakti se razmjenjuju isključivo kada oboje sudionika označe jedno drugo (uzajamni like).
            </p>
          </div>
        </div>

        {/* Detailed Sections Container */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand/5 border border-white space-y-10 text-brand/90 leading-relaxed text-sm sm:text-base">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">1.</span> O platformi i općim odredbama
            </h2>
            <p className="mb-3">
              Ovi Uvjeti korištenja (u daljnjem tekstu: „Uvjeti”) uređuju prava i obveze korisnika i organizatora platforme <strong>„Na prvi pogled”</strong> (u daljnjem tekstu: „Organizator”), sa sjedištem u Zagrebu, Hrvatska.
            </p>
            <p>
              Platforma pruža usluge organizacije susreta uživo za samce (speed dating događaji), tematskih večeri te digitalnog sustava za diskretno označavanje simpatija i razmjenu kontakata u slučaju uzajamnog sviđanja.
            </p>
          </section>

          {/* Section 2 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">2.</span> Uvjeti za sudjelovanje (Punoljetnost i točnost podataka)
            </h2>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Punoljetnost:</strong> Sudjelovanje na događajima dopušteno je isključivo punoljetnim osobama (18+ godina).
              </li>
              <li>
                <strong>Istinitost podataka:</strong> Korisnik jamči da su svi uneseni podaci u prijavnici (ime i prezime, dob, spol i kontakt) točni, istiniti i pripadaju njemu osobno.
              </li>
              <li>
                <strong>Pojedinačna prijava:</strong> Svaki sudionik prijavljuje se osobno putem svog Google korisničkog računa radi provjere vjerodostojnosti i sprječavanja lažnih prijava.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">3.</span> Postupak prijave, potvrde i selekcija
            </h2>
            <p className="mb-3">
              Ispunjavanje obrasca za prijavu na web stranici predstavlja iskaz interesa za sudjelovanje na odabranom događaju.
            </p>
            <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10 space-y-2 text-xs sm:text-sm">
              <p>
                <strong>Balans sudionika:</strong> Kako bismo osigurali uspješan događaj, Organizator vodi računa o približno jednakom broju žena i muškaraca te usklađenosti s definiranom dobnom skupinom susreta.
              </p>
              <p>
                <strong>Obavijest o statusu:</strong> Organizator pregledava prijave te u roku od 24 sata šalje obavijest na e-mail o potvrdi prijave ili stavljanju na listu čekanja. Prijava je pravovaljana tek nakon što Organizator pošalje potvrdu.
              </p>
              <p>
                <strong>Lista čekanja:</strong> Ako se kapacitet popuni, korisnik se postavlja na listu čekanja te se kontaktira ako se oslobodi mjesto.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">4.</span> Kotizacija i uvjeti plaćanja
            </h2>
            <p className="mb-3">
              Za sudjelovanje na događaju plaća se kotizacija čiji je točan iznos jasno istaknut uz svaki pojedinačni događaj na stranici <Link to="/eventi" className="text-brand font-bold underline hover:text-brand-light">Eventi</Link>.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Što uključuje kotizacija:</strong> Organizaciju susreta, rezervirano mjesto, moderiranje večeri, materijale/aplikaciju za matching te <strong>dva pića po izboru</strong> (ili ponudu specifičnu za pojedini događaj, npr. vino, pivo, bezalkoholna pića).
              </li>
              <li>
                <strong>Način plaćanja:</strong> Kotizacija se plaća prema uputama navedenim u potvrdi prijave (gotovinom/karticom na ulazu ili uplatom prije događaja).
              </li>
              <li>
                <strong>Transparentnost:</strong> Nema skrivenih troškova niti obveznih dodatnih pretplata.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">5.</span> Pravila otkazivanja i nedolaska (No-show politika)
            </h2>
            <p className="mb-3">
              Budući da je ravnoteža broja sudionika ključna za to da nitko na večeri ne ostane bez sugovornika, molimo za maksimalnu odgovornost:
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl text-xs sm:text-sm space-y-2">
              <p>
                <strong>Pravovremeno otkazivanje:</strong> Ako ste spriječeni doći, obvezni ste obavijestiti Organizatora najkasnije <strong>24 do 48 sati prije početka susreta</strong> (putem e-maila ili Instagram poruke), kako bismo mogli ponuditi mjesto osobi s liste čekanja.
              </p>
              <p>
                <strong>Neopravdani nedolazak:</strong> Osobe koje potvrde dolazak, a ne pojave se na događaju bez prethodne najave, gube mogućnost sudjelovanja na budućim susretima Organizatora.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">6.</span> Kodeks ponašanja i kućni red
            </h2>
            <p className="mb-3">
              Cilj svakog našeg susreta je stvoriti sigurno, opušteno i dostojanstveno okruženje za sve prisutne:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Poštovanje i kultura:</strong> Od svih sudionika očekuje se pristojno ponašanje, poštovanje osobnih granica i uvažavanje sugovornika.
              </li>
              <li>
                <strong>Zabrana uznemiravanja:</strong> Strogo je zabranjeno bilo kakvo verbalno, fizičko ili seksualno uznemiravanje, uvredljivi ili diskriminirajući komentari, navalentnost te neprimjeren govor.
              </li>
              <li>
                <strong>Zabrana pritiska na licu mjesta:</strong> Zabranjeno je tijekom samih spojeva tražiti broj mobitela ili privatni kontakt ako druga strana to jasno ne inicira – tome služi naš diskretni matching sustav.
              </li>
              <li>
                <strong>Pravo udaljavanja:</strong> Organizator zadržava puno pravo odmah udaljiti s događaja svakog sudionika koji krši kodeks ponašanja, bez prava na povrat uplaćene kotizacije.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">7.</span> Pravila speed dating razgovora i Matching sustav
            </h2>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                <strong>Format razgovora:</strong> Svaki pojedinačni razgovor traje okvirno između 4 i 6 minuta, nakon čega zvučni signal označava rotaciju.
              </li>
              <li>
                <strong>Oznaka simpatija:</strong> Tijekom ili neposredno nakon završetka susreta, sudionici putem obrasca ili web aplikacije unose svoje odabire (označavaju osobe s kojima bi željeli ostati u kontaktu).
              </li>
              <li>
                <strong>Uzajamni match (100% obostrano):</strong> Razmjena kontakata odvija se <em>isključivo ako obje osobe označe jedna drugu</em>. Ako je simpatija jednostrana, vaš odabir ostaje strogo tajan.
              </li>
              <li>
                <strong>Dostava rezultata:</strong> Rezultati spajanja dostavljaju se na e-mail adresu sudionika u pravilu unutar 24 sata od završetka susreta.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">8.</span> Snimanje, promotivni materijali i intelektualno vlasništvo
            </h2>
            <p className="mb-3">
              U svrhu promocije susreta i dočaravanja opuštene atmosfere, prijavom na događaj sudionici potvrđuju suglasnost za snimanje:
            </p>
            <div className="bg-rose-50/70 border-l-4 border-brand p-5 rounded-r-2xl text-xs sm:text-sm leading-relaxed text-brand italic mb-3">
              „Dolaskom na susret »Na prvi pogled« sudionik daje suglasnost za snimanje kratkih promotivnih audiovizualnih isječaka (story i reel formata) za službeni Instagram profil »Na prvi pogled«. Snimke se izrađuju s pažnjom prema dostojanstvu svih prisutnih te prikazuju pozitivnu i društvenu atmosferu susreta.”
            </div>
            <p className="text-xs sm:text-sm text-brand/80">
              Svi tekstovi, logotip, grafička rješenja i dizajn platforme „Na prvi pogled” zaštićeni su autorskim pravom te se ne smiju neovlašteno reproducirati bez izričite dozvole Organizatora.
            </p>
          </section>

          {/* Section 9 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">9.</span> Ograničenje odgovornosti
            </h2>
            <ul className="list-disc list-inside space-y-2 mb-3 text-sm sm:text-base ml-1">
              <li>
                Organizator osigurava ambijent, koordinaciju, raspored i platformu za upoznavanje, no ne jamči broj ostvarenih spojeva (matcheva) niti ljubavni ishod susreta.
              </li>
              <li>
                Organizator ne snosi odgovornost za ponašanje, postupke ili komunikaciju sudionika izvan organiziranog prostora i vremena trajanja susreta.
              </li>
              <li>
                Organizator zadržava pravo otkazivanja ili promjene termina susreta u slučaju više sile, premalog broja prijava ili nepredviđenih okolnosti, uz pravodobnu obavijest i puni povrat eventualno uplaćenih sredstava.
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">10.</span> Zaštita privatnosti i mjerodavno pravo
            </h2>
            <p className="mb-3">
              Prikupljanje i obrada vaših osobnih podataka detaljno su uređeni našim{' '}
              <Link to="/pravila-privatnosti" className="font-bold underline text-brand hover:text-brand-light">
                Pravilima privatnosti
              </Link>, koja su u cijelosti usklađena s Općom uredbom o zaštiti podataka (GDPR).
            </p>
            <p className="mb-4">
              Na ove Uvjete primjenjuje se pravo Republike Hrvatske. U slučaju bilo kakvih sporova, strane će nastojati spor riješiti mirnim putem, a u suprotnom je nadležan stvarno nadležni sud u Zagrebu.
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
