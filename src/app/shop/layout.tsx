import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Magazin de Cartonașe | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Cumpără Pachete și Cufere`,
  description: `Vizitează magazinul oficial de cartonașe pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Cumpără cutii și pachete tematice cu punctele tale și completează-ți colecția cu cartonașe exclusive.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/shop`
  },
  openGraph: {
    title: `Magazin de Cartonașe | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Deschide cutii și pachete de cartonașe pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Folosește punctele acumulate pentru a colecta cartonașe hentai rare.`,
    url: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/shop`,
    type: 'website'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
  const siteUrl = process.env.SITE_URL || 'https://HentaiTerra.ro';
  const pageUrl = `${siteUrl}/shop`;

  const shopSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Magazin de Cartonașe | ${siteName}`,
    "description": `Magazinul oficial de pachete de cartonașe și cufere pe ${siteName}.`,
    "url": pageUrl
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
        "name": "Magazin",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="shop-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="shop-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
