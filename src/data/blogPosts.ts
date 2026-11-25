export interface BlogPostSection {
  heading?: string;
  text: string;
  bulletPoints?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  featured?: boolean;
  content: {
    intro: string;
    sections: BlogPostSection[];
    conclusion: string;
  };
}

export const CRO_MONTH_NAMES = [
  'siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja',
  'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'
];

/**
 * Formats ISO date string "2026-11-10" to Croatian format "10. studenoga 2026."
 */
export function formatBlogDate(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const monthName = CRO_MONTH_NAMES[month] || '';
    return `${day}. ${monthName} ${year}.`;
  }
  return dateStr;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'kako-je-nastala-ideja-za-naprvipogled',
    title: 'Kako je nastala ideja za Naprvipogled?',
    category: 'Naša priča',
    date: '2026-11-05',
    readTime: '3 min čitanja',
    image: `${import.meta.env.BASE_URL}images/blog/post-01.png`,
    excerpt: "Sve je počelo jedne sasvim obične večeri, uz razgovor dvojice prijatelja u McDonald'su o tome što danas ljudima u Hrvatskoj najviše nedostaje – upoznavanje novih ljudi i stvaranje iskrenih poznanstava.",
    content: {
      intro: "Sve je počelo jedne sasvim obične večeri, uz razgovor dvojice prijatelja u McDonald'su.",
      sections: [
        {
          heading: 'Što nam danas najviše nedostaje?',
          text: `Razmišljali smo o tome što danas ljudima u Hrvatskoj najviše nedostaje. U razgovoru smo došli do zaključka da nam, unatoč tome što smo povezaniji nego ikad, zapravo sve više nedostaje ono najvažnije – upoznavanje novih ljudi i stvaranje iskrenih poznanstava.

Čini se da je danas sve teže spontano upoznati nekoga novog. Svakodnevica se često svodi na posao, obveze i već poznati krug ljudi, dok aplikacije za upoznavanje ne pružaju uvijek iskustvo kakvo bismo željeli.`
        },
        {
          heading: 'Zašto ne bismo stvorili nešto stvarno?',
          text: `Tada smo se zapitali: zašto ne bismo stvorili nešto što će ljudima olakšati upoznavanje u stvarnom životu? Nešto što će ih potaknuti da izađu iz svakodnevne rutine, upoznaju nove ljude i možda dožive nešto lijepo i neočekivano.

Tako se rodila ideja o Naprvipogled – projektu čiji je cilj povezivati ljude, stvarati nova poznanstva, poticati druženje i, prije svega, unositi malo više radosti u svakodnevicu.`
        },
        {
          heading: 'Čar upoznavanja uživo',
          text: `Odlučili smo se za speed dating jer vjerujemo da upoznavanje uživo ima posebnu čar. Pogled, osmijeh, spontani razgovor i ona početna trema koju svi ponekad osjetimo teško se mogu usporediti s dopisivanjem preko ekrana. Željeli smo stvoriti opušteno okruženje u kojem svatko ima priliku upoznati nekoga novog, bez pritiska i velikih očekivanja.

No, ono što nam je od samog početka najvažnije nije samo organizacija evenata, već iskustvo koje ljudi ponesu sa sobom nakon njih.`
        },
        {
          heading: 'Osmijesi sudionika kao naša najveća motivacija',
          text: `Cijeli Naprvipogled tim najsretniji je kada vidimo osmijehe na licima naših sudionika. Posebno nas veseli kada nam nakon eventa priđu, zahvale se i kažu koliko im je bilo lijepo, koliko su uživali i koliko im je cijelo iskustvo značilo. Upravo su takvi trenuci naša najveća motivacija i potvrda da radimo nešto vrijedno.

Vjerujemo da jedno upoznavanje može biti početak lijepog prijateljstva, zanimljive priče ili možda čak nečega puno većeg. A ako nekome naš event uljepša dan, izmami osmijeh ili pomogne da upozna osobu koju inače nikada ne bi imao priliku upoznati, smatramo da smo ostvarili ono zbog čega smo sve ovo i pokrenuli.`
        }
      ],
      conclusion: 'Jer nikad ne znate što se može dogoditi – na prvi pogled. ❤️'
    }
  },
  {
    id: '2',
    slug: 'zasto-je-danas-toliko-tesko-upoznati-nekoga-uzivo',
    title: 'Zašto je danas toliko teško upoznati nekoga uživo?',
    category: 'Upoznavanje',
    date: '2026-11-13',
    readTime: '4 min čitanja',
    image: `${import.meta.env.BASE_URL}images/blog/post-02.png`,
    excerpt:
      'Čini se da nikada nije bilo jednostavnije stupiti u kontakt s nekim, a istovremeno nikada nije bilo teže nekoga zaista upoznati. Evo zašto nam upoznavanje uživo danas sve teže polazi za rukom.',
    content: {
      intro:
        'Čini se da nikada nije bilo jednostavnije stupiti u kontakt s nekim, a istovremeno nikada nije bilo teže nekoga zaista upoznati. Uz društvene mreže, aplikacije za upoznavanje i brojne načine komunikacije, mogućnosti za upoznavanje novih ljudi naizgled su beskonačne. Ipak, mnogi imaju osjećaj da im upravo onaj najjednostavniji dio – upoznavanje uživo – sve teže polazi za rukom.',
      sections: [
        {
          heading: '1. Svakodnevica nam ostavlja sve manje prostora za nova poznanstva',
          text: `Većina ljudi provodi dane između posla, fakulteta, obiteljskih obveza i svakodnevnih zadataka. Slobodno vrijeme često koristimo za odmor i druženje s ljudima koje već poznajemo. S vremenom se naš društveni krug počinje ponavljati, a prilike za upoznavanje nekoga novog postaju sve rjeđe.

Često želimo upoznati nekoga novog, ali se pitamo gdje i kako. Izlazimo na ista mjesta, družimo se s istim ljudima i čekamo da se nešto spontano dogodi.`
        },
        {
          heading: '2. Aplikacije za upoznavanje postale su dio svakodnevice',
          text: `Aplikacije za upoznavanje značajno su promijenile način na koji ljudi traže potencijalne partnere. Jedan od najpoznatijih primjera svakako je Tinder, koji je dostupan u brojnim državama svijeta.

Koliko je takav način upoznavanja raširen u Europi, pokazuje i službeni podatak Tindera: tijekom druge polovice 2025. aplikacija je imala manje od [15 milijuna](https://policies.tinder.com/community/additional-information/disclosures/intl/en) mjesečno aktivnih korisnika samo na području Europske unije.

Takve aplikacije omogućuju nam da u kratkom vremenu pregledamo velik broj profila, ali upoznavanje se često svodi na fotografije, kratke opise i nekoliko poruka. Nedostaju nam govor tijela, ton glasa, spontani osmijeh i ona energija koju možemo osjetiti tek kada smo s nekim u istoj prostoriji.

Ponekad osoba koja nam na fotografiji ne bi odmah privukla pažnju uživo ostavi potpuno drugačiji dojam.`
        },
        {
          heading: '3. Previše izbora ne znači nužno i lakši odabir',
          text: `Zanimljivo je da se ovom pojavom bave i znanstvenici. [Istraživanje](https://www.tandfonline.com/doi/full/10.1080/15213269.2025.2555430) objavljeno 2025. u časopisu Media Psychology proučavalo je kako broj profila na aplikacijama za upoznavanje utječe na donošenje odluka.

U eksperimentu je sudjelovao 401 student. Sudionici su u simuliranoj aplikaciji pregledavali 11, 31 ili 91 profil. Oni koji su vidjeli 91 profil izvijestili su o većem mentalnom opterećenju od onih s manje profila, a stopa prihvaćanja bila im je niža.

To ne znači da su imali manje opcija, nego da su postali probirljiviji. Ipak, veći izbor nije donio osjećaj da je odabir lakši, nego naprotiv, teži. Važno je i da je riječ o simuliranoj aplikaciji i studentima, pa se rezultati ne moraju izravno prenijeti na stvarno upoznavanje. Ipak, nalaz se uklapa u ideju da više izbora ne znači nužno i lakšu odluku.`
        },
        {
          heading: '4. Strah od odbijanja i neugodne situacije',
          text: `Pristupiti nepoznatoj osobi i započeti razgovor nije uvijek jednostavno. Često razmišljamo o tome što reći, kako će druga osoba reagirati i hoćemo li ispasti čudni ili nametljivi. Zbog straha od odbijanja mnogi radije odustanu od pokušaja nego da riskiraju neugodnu situaciju.

A zapravo, upoznavanje novih ljudi ne mora biti toliko komplicirano. Ponekad je dovoljan samo jedan jednostavan razgovor.`
        },
        {
          heading: '5. Zaboravljamo koliko spontana poznanstva mogu biti lijepa',
          text: `Nekada su se ljudi upoznavali preko prijatelja, na izlascima, fakultetu, poslu ili sasvim slučajno. Takve situacije i dalje postoje, ali mnogi imaju osjećaj da ih je sve manje.

Važno je stvarati nove prilike, izlaziti iz svakodnevne rutine i biti otvoren prema ljudima koje inače možda nikada ne bismo upoznali.`
        },
        {
          heading: 'Pa gdje onda upoznati nekoga novog?',
          text: `Možda odgovor nije u još jednoj aplikaciji, još jednoj poruci ili još jednom pregledavanju profila. Ponekad je dovoljno promijeniti način na koji pristupamo upoznavanju.

Speed dating pruža upravo takvu priliku – upoznavanje uživo, kroz kratke razgovore s različitim ljudima, u opuštenoj atmosferi i bez pritiska da svaki susret mora rezultirati nečim konkretnim.

Ne mora svaki susret završiti ljubavnom pričom. Možda upoznaš nekoga s kim ćeš ostati u kontaktu, možda stekneš novo prijateljstvo, a možda se dogodi i nešto više.

Na kraju, najvažnije je biti otvoren prema novim poznanstvima i ne dopustiti da nam svakodnevna rutina ograniči prilike za upoznavanje zanimljivih ljudi.`
        }
      ],
      conclusion: 'Jer nikada ne znamo kakva se priča može razviti iz jednog običnog upoznavanja. ❤️'
    }
  },
  {
    id: '3',
    slug: 'najvece-ljubavne-drame-grcke-mitologije',
    title: 'Najveće ljubavne drame grčke mitologije: od prevara do zabranjenih ljubavi',
    category: 'Zanimljivosti',
    date: '2026-11-25',
    readTime: '3 min čitanja',
    image: `${import.meta.env.BASE_URL}images/blog/post-03.png`,
    featured: true,
    excerpt:
      'Ljubavne priče iz mitologije nisu uvijek bile bajkovite. Među bogovima i smrtnicima bilo je prevara, ljubomore, neuzvraćenih osjećaja i tragedija. Neke od tih priča zvuče kao prave ljubavne drame, a neke su aktualne i danas.',
    content: {
      intro:
        'Ljubavne priče iz mitologije nisu uvijek bile bajkovite. Među bogovima i smrtnicima bilo je prevara, ljubomore, neuzvraćenih osjećaja i tragedija. Neke od tih priča zvuče kao prave ljubavne drame, a neke su aktualne i danas.',
      sections: [
        {
          heading: '[Afrodita, Ares i Hefest: ljubavni trokut na Olimpu](https://www.theoi.com/Olympios/AresLoves.html)',
          text: `Afrodita, božica ljubavi i ljepote, bila je udana za Hefesta, ali je ljubav pronašla u naručju Aresa, boga rata. Njihovu tajnu vezu otkrio je Helije, bog Sunca, i dojavio ju je Hefestu. On je ljubavnike uhvatio u nevidljivu mrežu i izložio ih pogledima ostalih bogova (Homer, *Odiseja*, 8. pjevanje).`
        },
        {
          heading: '[Orfej i Euridika: ljubav jača od smrti](https://www.theoi.com/articles/the-tragic-myth-about-orpheus-and-eurydice/)',
          text: `Orfej je toliko volio Euridiku da je nakon njezine smrti sišao u podzemni svijet kako bi je vratio. Dobio je priliku povesti je natrag, ali uz jedan uvjet: nije se smio okrenuti prema njoj dok ne izađu na svjetlo dana. Pred samim izlaskom nije izdržao, okrenuo se i Euridika je zauvijek nestala.`
        },
        {
          heading: '[Apolon i Dafne: kada ljubav nije uzvraćena](https://www.theoi.com/Nymphe/NympheDaphne.html)',
          text: `Prema Ovidiju, Eros je Apolona pogodio strijelom koja izaziva ljubav, a Dafne strijelom koja tjera ljubav. Apolon se tako strastveno zaljubio u nimfu Dafne, a ona je od njega bježala. Kad ju je gotovo sustigao, zamolila je oca, riječnog boga, za pomoć i pretvorila se u stablo lovora.`
        },
        {
          heading: '[Eho i Narcis: kada je netko zaljubljen samo u sebe](https://www.nationalgallery.org.uk/paintings/glossary/echo-and-narcissus)',
          text: `Nimfa Eho, koju je Hera kaznila tako da može ponavljati samo posljednje riječi koje čuje, zaljubila se u Narcisa, mladića opčinjenog vlastitom ljepotom. Narcis ju je odbio, a Eho je od tuge nestala, ostao je samo njezin glas, odjek. Narcis je, zaljubljen u vlastiti odraz, ostao uz vodu i na kraju umro (Ovidije, *Metamorfoze*).`
        },
        {
          heading: '[Eros i Psiha: ljubav puna prepreka](https://www.theoi.com/Ouranios/Psykhe.html)',
          text: `Psiha je bila toliko lijepa da je izazvala Afroditinu ljubomoru. Afrodita je poslala Erosa da je kazni, no on se sam zaljubio u nju. Njihova ljubav bila je puna iskušenja, a Psiha je morala proći niz teških zadataka koje joj je zadala Afrodita kako bi se ponovno sjedinila s Erosom (Apulej, *Metamorfoze*, 2. st.).`
        }
      ],
      conclusion:
        'Iako su nastale prije tisuća godina, ove priče i danas zvuče poznato. Ljubomora, neuzvraćena ljubav, povjerenje i strah od gubitka nisu nestali s Olimpa, samo su se preselili u naše svakodnevne živote. ❤️'
    }
  }
];

/**
 * Returns blog posts sorted by date descending (newest first).
 */
export function getSortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

