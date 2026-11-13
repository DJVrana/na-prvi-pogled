import React from 'react';
import { Link } from 'react-router';
import type { FaqItem } from '../components/FaqAccordion';

export interface FaqQuestionAnswer {
  question: string;
  answer: string;
}

export const FAQ_SCHEMA_ITEMS: FaqQuestionAnswer[] = [
  {
    question: 'Kako se prijaviti na nadolazeći event?',
    answer:
      'Prijaviti se možete putem naše stranice Eventi ili na početnoj stranici klikom na termin eventa koji vam odgovara. Nakon odabira termina potrebno je ispuniti prijavnicu s traženim podacima. Po završetku prijave prikazat će vam se poveznica na CoreEvent, putem kojeg možete kupiti ulaznicu za odabrani event. VAŽNO: Ispunjavanje prijavnice samo po sebi ne osigurava mjesto na eventu. Vaša prijava smatra se potvrđenom tek nakon uspješne kupnje ulaznice putem CoreEventa i zaprimanja ulaznice. Tek tada imate osigurano mjesto na odabranom događaju.'
  },
  {
    question: 'Postoji li dress code?',
    answer:
      'Preporučujemo da na event dođete uredno i pristojno odjeveni, u odjeći u kojoj se osjećate ugodno i samopouzdano. Ne postoji strogi dress code niti je potrebno posebno svečano odijevanje – najvažnije je da odaberete odjeću primjerenu prigodi i u kojoj se osjećate najbolje.'
  },
  {
    question: 'Kako funkcionira matching sustav?',
    answer:
      'Matching sustav funkcionira na principu diskretnog dijeljenja kontaktnih podataka. Tijekom eventa, na svom profilu na našoj stranici možete označiti sudionike koji su vam se svidjeli. Ako je interes obostran, putem e-maila šaljemo vam međusobne kontaktne podatke kako biste mogli nastaviti komunikaciju. Na ovaj način osiguravamo da vaše kontaktne podatke dobije isključivo osoba kojoj ste ih i sami željeli podijeliti, uz obostrani interes.'
  },
  {
    question: 'Kakvo piće imam u izboru?',
    answer:
      'Na našim eventima očekuje vas širok izbor pića kako bi svatko mogao pronaći nešto po svom ukusu. U ponudi su gazirani i negazirani sokovi, pivo, vino i druga pića, tako da ćete bez problema pronaći nešto za sebe. Želimo da se tijekom cijelog druženja osjećate ugodno i opušteno!'
  },
  {
    question: 'Mogu li povesti nekoga kao podršku?',
    answer:
      'Naši eventi zamišljeni su kao druženja namijenjena isključivo prijavljenim sudionicima. Zbog ograničenog broja mjesta i želje da svima osiguramo ugodno iskustvo, nažalost nije moguće povesti dodatnu pratnju koja nije prijavljena na event. Želimo izbjeći nepotrebnu gužvu i osigurati dovoljno prostora za sve sudionike.'
  },
  {
    question: 'Što ako ne znam o čemu razgovarati s drugom osobom?',
    answer:
      'Nema problema. Tijekom eventa na ekranima se vrte dvije prezentacije s pitanjima i prijedlozima tema za razgovor koje vam mogu pomoći da lakše započnete razgovor i razbijete početnu tremu.'
  }
];

/**
 * Returns Google Rich Results compliant Schema.org FAQPage structured data JSON-LD.
 */
export function getFaqStructuredData(pageUrl = 'https://naprvipogled.com/eventi#faq') {
  return {
    "@type": "FAQPage",
    "@id": pageUrl,
    "mainEntity": FAQ_SCHEMA_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * FAQ items formatted for the FaqAccordion component on EventsPage.
 */
export function getEventsPageFaqItems(): FaqItem[] {
  return [
    {
      question: 'Kako se prijaviti na nadolazeći event?',
      answer: (
        <span>
          Prijaviti se možete odabirom željenog termina na ovoj stranici (iznad) ili na početnoj stranici klikom na termin eventa koji vam odgovara. Nakon odabira termina potrebno je ispuniti prijavnicu s traženim podacima. Po završetku prijave prikazat će vam se poveznica na CoreEvent, putem kojeg možete kupiti ulaznicu za odabrani event.
          <span className="block mt-2 font-medium">
            <strong className="text-brand font-bold">VAŽNO:</strong> Ispunjavanje prijavnice samo po sebi ne osigurava mjesto na eventu. Vaša prijava smatra se potvrđenom tek nakon uspješne kupnje ulaznice putem CoreEventa i zaprimanja ulaznice. Tek tada imate osigurano mjesto na odabranom događaju.
          </span>
        </span>
      )
    },
    {
      question: 'Postoji li dress code?',
      answer: FAQ_SCHEMA_ITEMS[1].answer
    },
    {
      question: 'Kako funkcionira matching sustav?',
      answer: FAQ_SCHEMA_ITEMS[2].answer
    },
    {
      question: 'Kakvo piće imam u izboru?',
      answer: FAQ_SCHEMA_ITEMS[3].answer
    },
    {
      question: 'Mogu li povesti nekoga kao podršku?',
      answer: FAQ_SCHEMA_ITEMS[4].answer
    },
    {
      question: 'Što ako ne znam o čemu razgovarati s drugom osobom?',
      answer: FAQ_SCHEMA_ITEMS[5].answer
    }
  ];
}

/**
 * FAQ items formatted for the FaqAccordion component on HomePage.
 */
export function getHomePageFaqItems(): FaqItem[] {
  return [
    {
      question: 'Kako se prijaviti na nadolazeći event?',
      answer: (
        <span>
          Prijaviti se možete putem naše stranice{' '}
          <Link to="/eventi" className="font-semibold underline text-brand hover:text-brand-light">
            Eventi
          </Link>{' '}
          ili na početnoj stranici klikom na termin eventa koji vam odgovara. Nakon odabira termina potrebno je ispuniti prijavnicu s traženim podacima. Po završetku prijave prikazat će vam se poveznica na CoreEvent, putem kojeg možete kupiti ulaznicu za odabrani event.
          <span className="block mt-2 font-medium">
            <strong className="text-brand font-bold">VAŽNO:</strong> Ispunjavanje prijavnice samo po sebi ne osigurava mjesto na eventu. Vaša prijava smatra se potvrđenom tek nakon uspješne kupnje ulaznice putem CoreEventa i zaprimanja ulaznice. Tek tada imate osigurano mjesto na odabranom događaju.
          </span>
        </span>
      )
    },
    {
      question: 'Postoji li dress code?',
      answer: FAQ_SCHEMA_ITEMS[1].answer
    },
    {
      question: 'Kako funkcionira matching sustav?',
      answer: FAQ_SCHEMA_ITEMS[2].answer
    },
    {
      question: 'Kakvo piće imam u izboru?',
      answer: FAQ_SCHEMA_ITEMS[3].answer
    },
    {
      question: 'Mogu li povesti nekoga kao podršku?',
      answer: FAQ_SCHEMA_ITEMS[4].answer
    },
    {
      question: 'Što ako ne znam o čemu razgovarati s drugom osobom?',
      answer: FAQ_SCHEMA_ITEMS[5].answer
    }
  ];
}

