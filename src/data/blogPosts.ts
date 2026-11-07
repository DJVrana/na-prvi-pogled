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

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'kako-je-nastala-ideja-za-naprvipogled',
    title: 'Kako je nastala ideja za Naprvipogled?',
    category: 'Naša priča',
    date: 'Ožujak 2026.',
    readTime: '3 min čitanja',
    image: `${import.meta.env.BASE_URL}images/hero-speed-dating.jpg`,
    featured: true,
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
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

