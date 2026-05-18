import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Alătură-te Echipei ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} | Recrutări pentru Traducători și Editori`,
  description: `Devino parte din echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}! Căutăm traducători și editori pasionați de hentai și manga. Aplică acum pentru a contribui la comunitatea hentai din România.`,
  keywords: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}, recrutare, traducători hentai, editori manga, comunitate hentai, România`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/recruit` 
  },
  openGraph: {
    title: `Alătură-te Echipei ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}`,
    description: `Devino parte din echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}! Aplică acum pentru rolurile disponibile.`,
    url: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/recruit`,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';
  const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
  const pageUrl = `${siteUrl}/recruit`;

  const recruitSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Alătură-te Echipei ${siteName} | Recrutări pentru Traducători și Editori`,
    "description": `Devino parte din echipa ${siteName}! Căutăm traducători și editori pasionați de hentai. Aplică acum pentru a contribui la comunitatea hentai din România.`,
    "url": pageUrl,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Roluri Disponibile pentru Recrutare",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Traducător Hentai",
          "description": "Responsabil pentru traducerea hentai-urilor din engleză în română, asigurând acuratețea și fluența traducerii."
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Verificator Hentai",
          "description": "Verifică acuratețea și calitatea traducerilor, asigurând coerența și corectitudinea gramaticală."
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Encoder Hentai",
          "description": "Se ocupă cu procesarea tehnică, incluzând subtitrările și încărcarea episoadelor pe platformă."
        }
      ]
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
        "name": "Recrutare",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="recruit-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recruitSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="recruit-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}