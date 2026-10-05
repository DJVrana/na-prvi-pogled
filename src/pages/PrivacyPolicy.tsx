import { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, EyeOff, Lock, Camera, Heart, Mail, CheckCircle2 } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: "Pravila privatnosti | Na prvi pogled 💞" },
    { name: "description", content: "Pravila privatnosti i zaštite osobnih podataka platforme Na prvi pogled. Saznajte kako štitimo vaše podatke – bez vanjske analitike i praćenja." }
  ];
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Pravila privatnosti | Na prvi pogled 💞";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-peach text-brand font-sans relative overflow-x-hidden selection:bg-brand selection:text-white">

      {/* Decorative ambient blobs */}
      <div className="absolute top-10 left-[-5%] w-80 h-80 rounded-full bg-rose-300/20 blur-[100px] animate-ambient-drift pointer-events-none" />
      <div className="absolute bottom-20 right-[-5%] w-96 h-96 rounded-full bg-brand/10 blur-[120px] animate-ambient-drift pointer-events-none" />

      {/* Navigation Header */}
      <nav className="w-full max-w-4xl mx-auto pt-8 px-6 sm:px-8 flex items-center justify-between z-10 relative">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand/80 hover:text-brand font-medium text-sm transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-xs"
        >
          <ArrowLeft size={16} /> Natrag na početnu
        </Link>
        <span className="font-serif italic text-lg sm:text-xl font-bold tracking-tight text-brand">
          Na prvi pogled 💞
        </span>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Hero Header */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white text-xs font-bold text-brand uppercase tracking-wider mb-4 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            Zaštita privatnosti i transparentnost
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand mb-4 leading-tight">
            Pravila privatnosti
          </h1>
          <p className="text-brand/80 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Vaša privatnost, sigurnost i povjerenje naš su apsolutni prioritet. Ovdje transparentno objašnjavamo kako rukujemo vašim podacima – jednostavno, iskreno i bez skrivenih uvjeta.
          </p>
        </header>

        {/* Highlight Banner: ZERO EXTERNAL ANALYTICS */}
        <section className="mb-10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-200/60 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300/50 shadow-inner">
              <EyeOff size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Važno jamstvo
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Na ovoj stranici nema vanjske analitike
                </h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                Naša web stranica <strong>ne koristi Google Analytics, Meta Pixel, Hotjar</strong> niti bilo koje druge vanjske alate za praćenje, profiliranje ili bihevioralno oglašavanje. Vaše posjete ne bilježimo, ne pratimo vaše navike po internetu i ne plasiramo vam oglase trećih strana.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Sigurna pohrana</h3>
            <p className="text-xs text-brand/75 leading-relaxed">
              Podaci se čuvaju na zaštićenoj Google Cloud infrastrukturi sa strogim pravilima pristupa.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Heart size={20} />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Diskrecija kontakta</h3>
            <p className="text-xs text-brand/75 leading-relaxed">
              Vaš kontakt dijeli se isključivo s osobom s kojom ostvarite obostrani match (uzajamni like).
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-sm text-brand mb-1">Transparentno snimanje</h3>
            <p className="text-xs text-brand/75 leading-relaxed">
              Promotivni isječci za Instagram snimaju se uz vaše znanje radi dočaravanja atmosfere susreta.
            </p>
          </div>
        </div>

        {/* Detailed Sections Container */}
        <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand/5 border border-white space-y-10 text-brand/90 leading-relaxed text-sm sm:text-base">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">1.</span> O voditelju obrade podataka
            </h2>
            <p className="mb-3">
              Voditelj obrade osobnih podataka je projekt <strong>„Na prvi pogled”</strong> koji organizira speed dating događaje i tematska druženja na području grada Zagreba.
            </p>
            <p>
              Za sva pitanja, zahtjeve za uvidom, izmjenom ili trajnim brisanjem vaših osobnih podataka možete nam se u svakom trenutku javiti na naš službeni e-mail:{' '}
              <a href="mailto:naprvipogled.events@gmail.com" className="font-semibold text-brand underline hover:text-brand-light">
                naprvipogled.events@gmail.com
              </a>{' '}
              ili putem Instagram profila{' '}
              <a href="https://instagram.com/na.prvi.pogled" target="_blank" rel="noreferrer" className="font-semibold text-brand underline hover:text-brand-light">
                @na.prvi.pogled
              </a>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">2.</span> Potpuna odsutnost vanjske analitike i praćenja
            </h2>
            <p className="mb-3">
              Za razliku od većine komercijalnih web stranica, <strong>Na prvi pogled NE koristi:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mb-3 text-sm sm:text-base">
              <li>Google Analytics ili srodne analitičke platforme</li>
              <li>Meta / Facebook Pixel</li>
              <li>Sustave za praćenje klikova i snimanje ekrana (Hotjar, CrazyEgg i sl.)</li>
              <li>Marketinške kolačiće trećih strana ili alate za bihevioralno profiliranje</li>
            </ul>
            <p className="text-sm bg-brand/5 p-4 rounded-xl border border-brand/10">
              💡 <strong>Kolačići (Cookies):</strong> Koriste se isključivo tehnički nužni elementi (poput lokalne sesije za Google prijavu) koji omogućuju siguran rad aplikacije. Zbog toga na našoj stranici nema napornih skočnih prozora (cookie bannera) za prihvaćanje marketinških kolačića – jer ih jednostavno nemamo!
            </p>
          </section>

          {/* Section 3 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">3.</span> Podaci koje prikupljamo i svrha obrade
            </h2>
            <p className="mb-4">
              Prikupljamo isključivo podatke koji su nužni za organizaciju kvalitetnog, sigurnog i ugodnog speed dating susreta:
            </p>
            
            <div className="space-y-3">
              <div className="bg-white/80 p-4 rounded-xl border border-white/90">
                <h4 className="font-bold text-brand mb-1">E-mail adresa</h4>
                <p className="text-xs sm:text-sm text-brand/80">
                  Preuzima se automatski putem Google prijave. Koristi se isključivo za sprječavanje automatiziranih (lažnih) prijava te slanje obavijesti o statusu prijave, točnoj lokaciji i vremenu susreta.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-white/90">
                <h4 className="font-bold text-brand mb-1">Ime i prezime, dob i spol</h4>
                <p className="text-xs sm:text-sm text-brand/80">
                  Nužni podaci za raspored i osiguravanje ravnomjernog omjera sudionika te formiranje dobnih skupina na događajima.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-white/90">
                <h4 className="font-bold text-brand mb-1">Kontakt podatak za Matching (Instagram korisničko ime ili telefon)</h4>
                <p className="text-xs sm:text-sm text-brand/80">
                  Kontakt koji sudionik unosi za potrebe spajanja nakon susreta. <strong>Važno:</strong> vaš kontakt podatak prosljeđuje se <em>isključivo i samo</em> osobi s kojom ostvarite obostrani match (obje osobe su označile 'Like'). Ako nema obostranog matcha, kontakt ostaje u potpunosti povjerljiv i nikome se ne prosljeđuje.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-white/90">
                <h4 className="font-bold text-brand mb-1">Napomena i specifična pitanja</h4>
                <p className="text-xs sm:text-sm text-brand/80">
                  Informacije koje sudionik svojevoljno unese u prijavnicu (npr. prehrambene preferencije, napomene organizatoru).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">4.</span> Suglasnost za snimanje i fotografiranje na susretima
            </h2>
            <p className="mb-4">
              U svrhu promocije susreta i dočaravanja opuštene, pozitivne atmosfere, prijavom na događaj sudionici prihvaćaju sljedeću suglasnost:
            </p>

            <div className="bg-rose-50/70 border-l-4 border-brand p-5 rounded-r-2xl text-xs sm:text-sm leading-relaxed text-brand italic">
              „Dolaskom na susret "Na prvi pogled" dajem suglasnost za sudjelovanje u snimanju/prikazivanja snimki/fotografija i dr. na društvenoj mreži Instagram pod nazivom "Na prvi pogled". Organizator će za potrebe promocije objaviti kratke audiovizualne isječke na društvenim mrežama (story i reel video). Potvrđujem da su sve snimke, fotografije i ostalo napravljene uz moje zanje, od strane organizatora Na prvi pogled., te ovime dajem svoju izričitu suglasnost i pristanak za korištenje mog lika te objavljivanje istih na svim poznatim medijima (poput Interneta, radija, telefonskih mobilnih aparata,itd.) kao i na medijima koji ce tek postati poznati. Suglasan/suglasna sam da ukupna autorska, vlasnička i bilo koja druga materijalna i nematerijalna prava na svim materijalima pripadaju neograničeno i isključivo organizatoru Na prvi pogled.”
            </div>
            <p className="mt-3 text-xs sm:text-sm text-brand/80">
              Organizator uvijek pazi na dostojanstvo sudionika te se materijali kreiraju s ciljem prikazivanja lijepe i kulturne atmosfere događaja.
            </p>
          </section>

          {/* Section 5 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">5.</span> Čuvanje, zaštita i dijeljenje podataka
            </h2>
            <p className="mb-3">
              Vaši podaci pohranjuju se u sigurnoj bazi podataka platforme Google Firebase smještenoj u Europskoj uniji / u skladu s međunarodnim sigurnosnim certifikatima (ISO 27001, SOC 2, GDPR compliance).
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm sm:text-base">
              <li>Pristup prijavama ima isključivo organizacijski tim „Na prvi pogled”.</li>
              <li>Vaši osobni podaci <strong>nikada se ne prodaju</strong>, ne ustupaju marketinškim agencijama niti dijele s trećim stranama.</li>
              <li>Prijave i podaci čuvaju se onoliko koliko je nužno za provedbu događaja i evidenciju posjećenosti.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">6.</span> Vaša prava (GDPR)
            </h2>
            <p className="mb-3">
              Kao sudionik i vlasnik svojih osobnih podataka, u svakom trenutku imate pravo na:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pravo na pristup i uvid:</strong> saznati koje sve podatke o vama posjedujemo.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pravo na ispravak:</strong> zatražiti ažuriranje netočnih ili nepotpunih podataka.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pravo na brisanje („pravo na zaborav”):</strong> trajno uklanjanje vašeg profila i prijava.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pravo na opoziv:</strong> u bilo kojem trenutku možete povući prethodno danu privolu.</span>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm">
              Za ostvarivanje bilo kojeg od navedenih prava dovoljno je poslati kratku poruku na e-mail{' '}
              <a href="mailto:naprvipogled.events@gmail.com" className="font-semibold underline">naprvipogled.events@gmail.com</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="pt-6 border-t border-brand/10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand mb-3 flex items-center gap-2">
              <span className="text-brand-light">7.</span> Kontakt i izmjene pravila
            </h2>
            <p className="mb-4">
              Zadržavamo pravo ažuriranja ovih pravila privatnosti u slučaju izmjene zakonskih propisa ili načina funkcioniranja platforme. Svaka izmjena bit će pravodobno objavljena na ovoj stranici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="mailto:naprvipogled.events@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm hover:bg-brand-light transition-all shadow-sm"
              >
                <Mail size={16} /> naprvipogled.events@gmail.com
              </a>
              <a
                href="https://instagram.com/na.prvi.pogled"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand border border-brand/20 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all shadow-xs"
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
            className="inline-flex items-center gap-2 bg-white/70 hover:bg-white text-brand font-semibold text-sm px-6 py-3 rounded-full border border-white shadow-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={16} /> Povratak na naslovnicu
          </Link>
          <p className="text-xs text-brand/60 mt-6">
            © {new Date().getFullYear()} Na prvi pogled. Sva prava pridržana. • Zagreb, Hrvatska
          </p>
        </div>

      </main>
    </div>
  );
}
