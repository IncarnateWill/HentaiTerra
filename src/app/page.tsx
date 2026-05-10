
import { getPopularAnime } from '@/lib/db-utils';
import { getCachedData, setCachedData } from '@/lib/redis';
import { homeMetadata } from "@/config/rootmetadata";
import { getHomeStructuredData } from "@/config/rootstructured-data";
import Script from "next/script";
import SearchBoxHome from "@/components/shared/search-box-home";
import React, { Suspense } from "react";
import { RxDoubleArrowRight } from "react-icons/rx";
import Image from "next/image";
import ErrorBoundary from '@/components/ui/error-boundary';

// Enable ISR for better performance
export const revalidate = 60; // 5 minutes
export const dynamic = 'force-static';

// Optimize metadata
export const metadata = {
  ...homeMetadata,
  alternates: {
    canonical: process.env.SITE_URL
  }
};


// Loading skeleton for popular anime section
const PopularAnimeSectionLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-dark-500 rounded w-64 mb-4"></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-dark-300 rounded-lg h-64"></div>
      ))}
    </div>
  </div>
);

// Error fallback for popular anime section
const PopularAnimeError = () => (
  <div className="text-center text-text-secondary py-4">
    <p className="text-semantic-error">Nu am putut încărca hentai-urile populare</p>
  </div>
);

// Separate component for popular anime links
const PopularAnimeLinks = async () => {
  const cacheKey = 'popular_anime_home';
  let popularAnime = await getCachedData<any[]>(cacheKey);

  if (!popularAnime) {
    popularAnime = await getPopularAnime(5); // Reduced from 20 to 5 for better performance
    await setCachedData(cacheKey, popularAnime, 3600); // Cache for 1 hour
  }
  
  return (
    <p className="text-sm sm:text-base text-text-secondary font-medium max-w-3xl overflow-hidden text-ellipsis whitespace-nowrap px-2">
      Căutări populare:{" "}
      {popularAnime.map((anime: { _id: string, name: string }, index: number) => (
        <React.Fragment key={anime._id}>
          <a href={`/hentai/${anime._id}`} className="hover:underline text-text-primary hover:text-primary-400 transition-colors">
            {anime.name}
          </a>
          {index < popularAnime.length - 1 && ", "}
        </React.Fragment>
      ))}
    </p>
  );
};

export default async function Home() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getHomeStructuredData())
        }}
        strategy="afterInteractive"
      />

      {/* Main Page Content */}
      <main className="container mx-auto py-4 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-8xl flex flex-col gap-4 sm:gap-8 items-center justify-center">
          <section className="w-full flex flex-col gap-4 sm:gap-8 items-center justify-center">
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-primary-500/30 shadow-xl sm:shadow-2xl p-4 sm:p-8 md:p-12 lg:p-16 w-full text-center relative overflow-hidden">
              {/* Optimized background image */}
              <div className="absolute inset-0 opacity-20 sm:opacity-30">
                <Image
                  src="/homebanner.webp"
                  alt="HentaiUnited Background"
                  fill
                  className="object-cover"
                  priority={true}
                  quality={85}
                  sizes="100vw"
                />
              </div>
              <div className="relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-8 bg-gradient-to-r from-primary-300 via-text-primary to-primary-300 bg-clip-text text-transparent">
                  {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}
                </h1>
                <p className="text-lg sm:text-xl text-text-secondary mb-4 sm:mb-6 max-w-3xl mx-auto px-2">
                  Descoperă o lume vastă de hentaiuri în română. De la cele mai noi lansări la clasice atemporale, {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')} îți oferă acces nelimitat la divertismentul tău preferat, cu o interfață modernă și ușor de utilizat.
                </p>
                <p className="text-base sm:text-lg text-text-muted mb-6 sm:mb-10 max-w-3xl mx-auto px-2">
                  Vizionează acum episoade complete, de înaltă calitate fără reclame intruzive. Cu actualizări zilnice și o comunitate dedicată, {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')} este destinația ta numărul unu pentru a viziona hentai online, oriunde și oricând.
                </p>
                <div className="flex justify-center mb-6 sm:mb-10 px-2">
                  <SearchBoxHome />
                </div>
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  <a
                    href="/home"
                    className="inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-bold rounded-full text-text-primary bg-primary-600 hover:bg-primary-700 md:py-5 md:text-xl md:px-12 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                    >
                    Vizionează hentai
                    <RxDoubleArrowRight className="ml-2 sm:ml-3 -mr-1 h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                  <ErrorBoundary fallback={<PopularAnimeError />}>
                    <Suspense fallback={<PopularAnimeSectionLoader />}>
                      <PopularAnimeLinks />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Informational Sections */}
<section className="container mx-auto py-8 sm:py-16 px-4 max-w-8xl text-text-secondary">
        <div className="space-y-8 sm:space-y-16">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-text-primary mb-4 sm:mb-8 bg-gradient-to-r from-primary-300 via-text-primary to-primary-300 bg-clip-text text-transparent text-center">{(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')} - Destinația #1 pentru hentai online GRATUIT în România</h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">Știați că peste 1 MILIARD de căutări legate de hentai sunt efectuate lunar pe Google? Fenomenul hentai a cucerit lumea întreagă, iar România nu face excepție!</p>
            <p className="text-base sm:text-lg leading-relaxed">Însă nu toate site-urile sunt create la fel! Majoritatea sunt pline de reclame deranjante, linkuri false și conținut de calitate proastă. De aceea am creat {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro - pentru a fi CEL MAI BUN site de hentai gratuit din România pentru toți pasionații!</p>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">1/ Ce face {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro special?</h3>
            <p className="text-base sm:text-lg leading-relaxed">{(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro este site-ul GRATUIT de streaming hentai unde poți viziona hentai, fără înregistrare, fără taxe ascunse, fără bătăi de cap!</p>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">2/ Este {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro 100% sigur?</h3>
            <p className="text-base sm:text-lg leading-relaxed">ABSOLUT DA!Spre deosebire de multe alte site-uri pline de reclame enervante și pop-up-uri dubioase, noi ne limităm la o singură reclamă discretă – suficientă cât să acoperim costurile serverului.În plus, monitorizăm constant platforma pentru a ține departe orice conținut periculos. Dacă vezi ceva care nu-ți pare în regulă, dă-ne un semn – intervenim rapid!</p>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">3/ De ce {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro este CEL MAI BUN site pentru hentai online gratuit?</h3>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">Am analizat la sânge toate site-urile similare, din România și din afară!Am păstrat doar funcțiile cu adevărat utile și am eliminat tot ce enervează utilizatorii. Rezultatul? Un site creat special pentru fanii hentai din România - rapid, curat și ușor de folosit. Iată de ce suntem liderii:</p>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1">SIGURANȚĂ MAXIMĂ:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">ZERO reclame periculoase, ZERO pop-up-uri enervante! {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro este cel mai sigur site de hentai din România.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1">CALITATE SUPREMĂ:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Full HD 1080p pentru o experiență cinematografică! Internetul lent? Nu-i problemă - alege între 360p, 720p sau 1080p. {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro se adaptează perfect la conexiunea ta!</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1"> VITEZĂ INCREDIBILĂ:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Uită de încărcarea lentă! Pe {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro, hentai-ul tău favorit pornește INSTANT! Plus, poți descărca episoadele pentru vizionare offline!</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1">ACTUALIZĂRI ZILNICE:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Noi episoade în fiecare zi!</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1">DESIGN MODERN:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Interfață ultra-prietenoasă făcută special pentru utilizatorii români! Găsești orice hentai în 3 click-uri. </p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1"> FUNCȚIONEAZĂ ORIUNDE:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Pe telefon, tabletă sau computer - {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro merge perfect pe TOATE dispozitivele! Poți continua episodul de pe telefon direct pe laptop!</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-secondary-400 mt-1">•</span>
                <div>
                  <strong className="text-text-primary text-base sm:text-lg block mb-1"> SUPORT 24/7:</strong>
                  <p className="text-text-secondary text-sm sm:text-base">Echipa noastră românească răspunde IMEDIAT! Link stricat? Hentai lipsă? Îl rezolvăm cât mai rapid cu putință!</p>
                </div>
              </li>
            </ul>
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-lg sm:text-xl mb-4">Dacă vrei cel mai bun site de hentai din România, {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited')}.ro este alegerea PERFECTĂ! Încearcă ACUM și vei înțelege de ce suntem #1! Salvează site-ul în favorite și spune-le și prietenilor!</p>
              <p className="text-base sm:text-lg text-primary-400 font-medium">Hai să urmărim hentai împreună! </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
