import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `DMCA Statement | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Declarație DMCA`,
  description: `Declarația DMCA pentru ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Informații despre drepturile de autor și procedura de notificare pentru încălcarea proprietății intelectuale.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/dmca`
  },
  openGraph: {
    title: `DMCA Statement | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Declarația DMCA pentru ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Informații despre drepturile de autor și procedura de notificare.`,
    url: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/dmca`,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

const DMCAAdvancedStatement: React.FC = () => {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
  const siteUrl = process.env.SITE_URL || 'https://HentaiTerra.ro';
  const pageUrl = `${siteUrl}/dmca`;

  const dmcaSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `DMCA Statement | ${siteName}`,
    "description": `Declarația DMCA pentru ${siteName}. Informații despre drepturile de autor și procedura de notificare pentru încălcarea proprietății intelectuale.`,
    "url": pageUrl,
    "mainEntity": {
      "@type": "WebPage",
      "name": "DMCA Copyright Infringement Policy",
      "url": pageUrl,
      "description": "Procedura de notificare și detalii despre respectarea drepturilor de autor pe site."
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
        "name": "DMCA",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="dmca-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dmcaSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="dmca-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>DMCA Statement / Declarație DMCA</h1>

        <section style={{ marginBottom: '40px' }}>
          <h2>English Version</h2>
          <p>
            This website complies with the Digital Millennium Copyright Act (DMCA) and is committed to respecting the intellectual property rights of content owners. If you believe that your copyrighted material has been used in a manner that constitutes copyright infringement, please be advised that all claims must be made in writing and forwarded to our designated copyright agent at <strong>{process.env.NEXT_PUBLIC_DMCA_EMAIL || `dmca@${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra').toLowerCase()}.ro`}</strong>.
          </p>
          <p>
            By submitting a notice or contacting us, you declare that you have a good faith belief that the use of the material in question is not authorized by the copyright owner, its agent, or the law. You also affirm under penalty of perjury that the information contained in your notice is accurate and that you are either the copyright owner or an agent authorized to act on the copyright owner’s behalf.
          </p>
          <p>
            This notice is provided solely for informational purposes and is not intended to substitute for legal advice. Users are advised to consult a legal professional regarding their rights and obligations under the DMCA.
          </p>
        </section>

        <hr style={{ margin: '40px 0' }} />

        <section>
          <h2>Versiunea în Română</h2>
          <p>
            Acest site respectă Legea Digital Millennium Copyright Act (DMCA) și se angajează să protejeze drepturile de proprietate intelectuală ale deținătorilor de conținut. Dacă considerați că lucrarea dumneavoastră protejată prin drepturi de autor a fost utilizată într-un mod care constituie o încălcare a drepturilor de autor, vă rugăm să știți că toate solicitările trebuie să fie transmise în scris și adresate agentului nostru desemnat de copyright la <strong>{process.env.NEXT_PUBLIC_DMCA_EMAIL || `dmca@${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra').toLowerCase()}.ro`}</strong>.
          </p>
          <p>
            Prin trimiterea unei notificări sau contactarea noastră, declarați că aveți o convingere sinceră că utilizarea materialului în cauză nu este autorizată de către deținătorul drepturilor de autor, agentul acestuia sau legea. De asemenea, afirmați sub jurământ, cu sancțiuni penale pentru declarații false, că informațiile conținute în notificare sunt exacte și că sunteți fie deținătorul drepturilor de autor, fie un agent autorizat să acționeze în numele acestuia.
          </p>
          <p>
            Această notificare este furnizată exclusiv în scop informativ și nu înlocuiește consultanța juridică. Utilizatorii sunt sfătuiți să consulte un specialist în drept pentru a înțelege drepturile și obligațiile lor în baza DMCA.
          </p>
        </section>
      </div>
    </>
  );
};

export default DMCAAdvancedStatement;
