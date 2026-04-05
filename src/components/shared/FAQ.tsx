'use client';

import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  items: FAQItem[];
  className?: string;
}

export default function FAQ({ title, items, className = '' }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-purple-700/20 shadow-lg p-4 md:p-6 w-full ${className}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border border-purple-700/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 py-3 text-left bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 hover:from-neutral-700/50 hover:to-neutral-600/50 transition-all duration-200 flex items-center justify-between"
            >
              <span className="font-medium text-white">{item.question}</span>
              {openItems.has(index) ? (
                <HiChevronUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
              ) : (
                <HiChevronDown className="h-5 w-5 text-purple-400 flex-shrink-0" />
              )}
            </button>
            {openItems.has(index) && (
              <div className="px-4 py-3 bg-neutral-900/30 border-t border-purple-700/20">
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Predefined FAQ data for different page types
export const watchPageFAQ: FAQItem[] = [
  {
    question: "Cum pot viziona episodul hentai?",
    answer: "Apăsați pe butonul de play din player-ul video. Dacă întâmpinați probleme, încercați să reîmprospătați pagina sau să folosiți un alt browser. Asigurați-vă că aveți vârsta legală pentru a viziona conținut adult."
  },
  {
    question: "De ce nu se încarcă videoul hentai?",
    answer: "Verificați conexiunea la internet și încercați să reîmprospătați pagina. Dacă problema persistă, încercați să dezactivați ad-blockerul sau să folosiți un alt browser. Unele browsere pot restricționa conținutul adult."
  },
  {
    question: "Cum pot naviga între episoadele hentai?",
    answer: "Folosiți butoanele 'Episodul anterior' și 'Episodul următor' de sub player sau selectați un episod din lista de episoade. Episoadele sunt organizate în ordine cronologică."
  },
  {
    question: "Pot să-mi salvez progresul la hentai?",
    answer: "Da, progresul se salvează automat dacă sunteți conectat cu contul. Puteți continua vizionarea de unde ați rămas. Contul trebuie să fie validat pentru vârstă."
  },
  {
    question: "Cum pot raporta o problemă cu videoul hentai?",
    answer: "Dacă întâmpinați probleme tehnice cu videoul, vă rugăm să ne contactați prin secțiunea de contact sau să lăsați un comentariu. Includeți detalii despre problema întâmpinată."
  },
  {
    question: "Sunt episoadele hentai subtitrate în română?",
    answer: "Da, toate episoadele hentai sunt subtitrate în română de către echipa noastră de traducători. Subtitrările sunt sincronizate și verificate pentru calitate."
  }
];

export const animePageFAQ: FAQItem[] = [
  {
    question: "Cum pot adăuga acest hentai la lista mea?",
    answer: "Apăsați pe butonul 'Adaugă la Watchlist' pentru a salva hentai-ul în lista dvs. personală. Trebuie să fiți conectat cu contul și să aveți vârsta legală."
  },
  {
    question: "Când apar episoade noi de hentai?",
    answer: "Episoadele noi de hentai sunt adăugate imediat ce sunt disponibile și traduse. Verificați pagina hentai-ului pentru ultimele episoade."
  },
  {
    question: "Cum pot vedea toate episoadele hentai?",
    answer: "Toate episoadele disponibile sunt listate în secțiunea 'Episoade'. Dacă sunt multe episoade, folosiți paginarea pentru a naviga prin seria hentai."
  },
  {
    question: "Ce înseamnă 'Censored' și 'Uncensored' la hentai?",
    answer: "'Censored' înseamnă că hentai-ul conține scene cu blur-uri sau pixelări conform reglementărilor, în timp ce 'Uncensored' înseamnă versiunea completă, fără cenzură."
  },
  {
    question: "Cum pot găsi hentai-uri similare?",
    answer: "Verificați secțiunea 'Hentai-uri Recomandate' de pe această pagină pentru conținut similar bazat pe gen, personaje și preferințe comune."
  },
  {
    question: "Pot să descarc episoadele hentai?",
    answer: "Nu oferim opțiuni de descărcare. Toate episoadele hentai sunt disponibile pentru streaming online pe site-ul nostru, exclusiv pentru vizionare legală."
  }
];

// HentaiTerra specific FAQ data
export const hentaiTerraFAQ: FAQItem[] = [
  {
    question: "Ce este HentaiTerra?",
    answer: "HentaiTerra este o platformă dedicată pentru vizionarea de hentai tradus în română. Oferim conținut hentai subtitrat pentru publicul adult din România."
  },
  {
    question: "Este legal să vizionez hentai în România?",
    answer: "Da, vizionarea de hentai este legală în România pentru persoanele cu vârsta peste 18 ani. Conținutul nostru este artistic și animat, nu implică persoane reale."
  },
  {
    question: "Ce vârstă trebuie să am pentru a viziona conținut pe HentaiTerra?",
    answer: "Trebuie să aveți cel puțin 18 ani pentru a accesa și viziona conținutul de pe HentaiTerra. Prin accesarea site-ului, confirmați că îndepliniți această cerință."
  },
  {
    question: "Cum sunt traduse episoadele de hentai?",
    answer: "Episoadele sunt traduse de echipa noastră de traducători români. Subtitrările sunt sincronizate cu audio japonez original și verificate pentru acuratețe."
  },
  {
    question: "Ce genuri de hentai sunt disponibile?",
    answer: "Oferim o varietate de genuri hentai incluzând romantic, școală, fantezie, demon, și multe altele. Fiecare hentai este etichetat corespunzător pentru preferințele dvs."
  },
  {
    question: "Este conținutul HentaiTerra gratuit?",
    answer: "Da, conținutul nostru este gratuit pentru vizionare. Trebuie doar să creați un cont gratuit pentru a accesa toate episoadele și funcțiile site-ului."
  }
];
