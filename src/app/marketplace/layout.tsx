import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Piața de Cartonașe | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Cumpără și Vinde Cartonașe Hentai`,
  description: `Vizitează piața oficială de cartonașe pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Schimbă, cumpără sau vinde cartonașe hentai de la simple la legendare cu alți utilizatori ai comunității.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/marketplace`
  },
  openGraph: {
    title: `Piața de Cartonașe | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Vizitează piața oficială de cartonașe pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Schimbă, cumpără sau vinde cartonașe cu alți utilizatori.`,
    url: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/marketplace`,
    type: 'website'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
  const siteUrl = process.env.SITE_URL || 'https://HentaiTerra.ro';
  const pageUrl = `${siteUrl}/marketplace`;

  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Piața de Cartonașe | ${siteName}`,
    "description": `Piața oficială de cartonașe pe ${siteName}. Schimbă, cumpără sau vinde cartonașe cu alți utilizatori.`,
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
        "name": "Marketplace",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="marketplace-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="marketplace-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
