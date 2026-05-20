import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Despre Noi | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Echipa și Misiunea Noastră`,
  description: `Descoperă povestea ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} și echipa noastră dedicată. Află despre misiunea noastră de a aduce conținut hentai de calitate în română pentru comunitatea din România.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/about`.toLowerCase()
  },
  openGraph: {
    title: `Despre Noi | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Descoperă povestea ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} și echipa noastră dedicată. Misiunea noastră de a aduce hentai de calitate în română.`,
    url: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/about`.toLowerCase(),
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

const AboutUsPage: React.FC = () => {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
  const siteUrl = process.env.SITE_URL || 'https://hentaiterra.ro';
  const pageUrl = `${siteUrl}/about`.toLowerCase();

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": `Despre Noi | ${siteName}`,
    "description": `Descoperă povestea ${siteName} și echipa noastră dedicată. Misiunea noastră de a aduce hentai de calitate în română.`,
    "url": pageUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": `${siteUrl}/favicon.ico`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Acasă",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Despre Noi",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="about-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>About HentaiTerra / Despre HentaiTerra</h1>
        {/* Romanian Version */}
        <section>
          <h2>Cine Suntem</h2>
          <p>
            Bine ați venit la <strong>HentaiTerra</strong> - destinația dedicată unde pasiunea noastră pentru hentai și divertisment pentru adulți se îmbină cu traduceri de înaltă calitate. Creat de o echipă de fani dedicați, HentaiTerra este dedicat împărtășirii conținutului subtitrat în limba română pentru comunitatea din România.
          </p>

          <h2>Misiunea și Viziunea Noastră</h2>
          <p>
            Misiunea noastră este simplă: să aducem la îndemâna publicului adult din România conținut hentai de calitate, subtitrat corect și accesibil. Ne străduim să oferim traduceri care surprind tonul și intenția materialelor originale, păstrând claritatea și fluența în limba română. Viziunea noastră este să construim o comunitate matură, în care utilizatorii pot explora, discuta și descoperi conținut fără bariere lingvistice.
          </p>

          <h2>Povestea Noastră</h2>
          <p>
            HentaiTerra s-a născut din pasiunea comună pentru hentai și din dorința de a face disponibile titluri de calitate în limba română. Frustrați de lipsa traducerilor bune și a unei experiențe curate, fondatorii noștri – adevărați entuziaști – au decis să preia inițiativa. Ce a început ca un mic proiect de fani a crescut într-o platformă unde creativitatea, pasiunea și comunitatea se îmbină armonios.
          </p>

          <h2>Procesul de Traducere</h2>
          <p>
            Pentru a asigura cea mai bună calitate, urmăm un proces în mai mulți pași:
          </p>
          <ul>
            <li>
              <strong>Traducerea Inițială:</strong> Traducătorii noștri experimentați transformă materialul sursă din engleză, japoneză sau chineză în limba română, păstrând tonul și stilul original.
            </li>
            <li>
              <strong>Editarea și Corectarea:</strong> O echipă dedicată revizuiește fiecare traducere pentru a asigura claritatea și coerența textului.
            </li>
            <li>
              <strong>Feedback-ul Comunității:</strong> Apreciem sugestiile fanilor și îmbunătățim continuu traducerile pe baza discuțiilor și a feedback-ului primit.
            </li>
          </ul>
          <p>
            Fiecare traducere este realizată cu multă pasiune, pentru a vă aduce mai aproape de titlurile preferate.
          </p>

          <h2>Angajamentul Nostru</h2>
          <p>
            La HentaiTerra, punem accent pe calitate și respect față de publicul adult. Ne străduim să realizăm traduceri care să rezoneze cu comunitatea noastră și să ofere o experiență plăcută tuturor utilizatorilor. Toate proiectele noastre sunt revizuite constant pentru a ne asigura că servesc cel mai bine interesele comunității.
          </p>

          <h2>Echipa Noastră</h2>
          <p>
            Inima HentaiTerra este echipa noastră diversificată și talentată:
          </p>
          <ul>
            <li>Traducători dedicați, fluent în engleză, japoneză și chineză.</li>
            <li>Editori și corectori care asigură coerența și calitatea fiecărei traduceri.</li>
            <li>Manageri de comunitate care mențin legătura cu fanii și încurajează discuțiile.</li>
            <li>Specialiști IT care se ocupă de întreținerea și îmbunătățirea platformei noastre.</li>
          </ul>
          <p>
            Împreună, lucrăm pentru a transforma pasiunea pentru hentai într-o experiență sigură și de calitate pentru publicul român.
          </p>

          <h2>Dezvoltări Viitoare</h2>
          <p>
            HentaiTerra este în continuă evoluție și planurile noastre pentru viitor includ:
          </p>
          <ul>
            <li>Implementarea unor instrumente avansate pentru a optimiza procesul de traducere.</li>
            <li>Extinderea catalogului pentru a acoperi și alte titluri și genuri.</li>
            <li>Lansarea unor funcționalități interactive care să stimuleze colaborarea și discuțiile între fani.</li>
            <li>Colaborarea cu alți fani și creatori pentru a oferi conținut exclusiv și interviuri detaliate.</li>
          </ul>
          <p>
            Ne angajăm să rămânem lideri în domeniul traducerilor de hentai și să îmbunătățim constant experiența utilizatorilor noștri.
          </p>

          <h2>Avertisment</h2>
          <p>
            Toate traducerile realizate pe HentaiTerra sunt produse de echipa noastră din pasiune pentru hentai și sunt oferite pentru a fi apreciate de comunitate. Acestea sunt realizate în spiritul divertismentului personal și al schimbului cultural și pot conține ocazional mici discrepanțe. HentaiTerra este un proiect al fanilor și nu reprezintă traduceri oficiale.
          </p>
        </section>
        {/* English Version */}
        <hr style={{ margin: '40px 0' }} />

        <section style={{ marginBottom: '40px' }}>
          <h2>Who We Are</h2>
          <p>
            Welcome to <strong>HentaiTerra</strong> – the destination where our love for hentai and adult animation meets high-quality Romanian subtitles. Created by a team of dedicated fans, HentaiTerra is all about delivering curated, localized content for the Romanian adult audience.
          </p>

          <h2>Our Mission & Vision</h2>
          <p>
            Our mission is simple: to bring high-quality hentai content to Romanian viewers with accurate, readable subtitles. We work hard to deliver translations that capture the tone and intent of the original works while keeping the experience clean and accessible. Our vision is to build a mature community where users can explore and discuss content without language barriers.
          </p>

          <h2>Our Story</h2>
          <p>
            HentaiTerra was born out of a shared passion for hentai and a desire to make quality content available in Romanian. Frustrated by the scarcity of good translations and clean viewing experiences, our founders—true enthusiasts—decided to take matters into their own hands. What began as a small fan project has grown into a thriving platform where creativity, passion, and community come together.
          </p>

          <h2>Our Translation Process</h2>
          <p>
            We follow a dedicated, multi-step process to ensure that our translations are engaging and true to the original:
          </p>
          <ul>
            <li>
              <strong>Initial Translation:</strong> Our experienced translators carefully convert the source material from English, Japanese, or Chinese into Romanian, preserving the original tone and style.
            </li>
            <li>
              <strong>Editing & Proofreading:</strong> An in-house editorial team reviews each translation to ensure clarity, accuracy, and a smooth reading experience.
            </li>
            <li>
              <strong>Community Feedback:</strong> We value our community’s input and continuously refine our translations based on reader suggestions and discussions.
            </li>
          </ul>
          <p>
            Every translation is a labor of love, designed to bring you closer to the worlds you adore.
          </p>

          <h2>Our Team</h2>
          <p>
            The spirit of HentaiTerra comes from our passionate and diverse team:
          </p>
          <ul>
            <li>Dedicated translators who are fluent in English, Japanese, and Chinese.</li>
            <li>Editors and proofreaders ensuring a high-quality, engaging final text.</li>
            <li>Community managers who keep our vibrant fan base connected.</li>
            <li>Tech enthusiasts who maintain and improve our platform.</li>
          </ul>
          <p>
            Together, we work to create a respectful space for adults to discover, enjoy, and discuss their favorite hentai content.
          </p>

          <h2>Future Developments</h2>
          <p>
            HentaiTerra is always evolving. Our future plans include:
          </p>
          <ul>
            <li>Integrating advanced translation tools to streamline our workflow.</li>
            <li>Expanding our library to cover a broader range of titles and genres.</li>
            <li>Introducing interactive community features to encourage fan discussions and collaborations.</li>
            <li>Partnering with fellow fans and creators to bring exclusive insights and behind-the-scenes content.</li>
          </ul>
          <p>
            We are committed to growing our platform and enhancing the experience for every hentai fan in Romania.
          </p>

          <h2>Disclaimer</h2>
          <p>
            All translations on HentaiTerra are produced by our dedicated team out of pure passion for hentai. These translations are provided as a service to our community for personal enjoyment and cultural sharing. Please note that our work is fan-driven and unofficial, and while we strive for the highest quality, occasional discrepancies may occur.
          </p>
        </section>

      </div>
    </>
  );
};

export default AboutUsPage;
