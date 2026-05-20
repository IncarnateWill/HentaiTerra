import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Puncte și Misiuni | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Câștigă Recompense Hentai`,
  description: `Completează misiunile zilnice și acumulează puncte pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Folosește punctele pentru a cumpăra cartonașe rare în magazinul oficial.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/points`
  },
  openGraph: {
    title: `Puncte și Misiuni | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Rezolvă misiunile de vizionare și alte activități pentru a câștiga puncte bonus. Cumpără pachete de cartonașe pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}.`,
    url: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/points`,
    type: 'website'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function PointsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
  const siteUrl = process.env.SITE_URL || 'https://HentaiTerra.ro';
  const pageUrl = `${siteUrl}/points`;

  const pointsSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Puncte și Misiuni | ${siteName}`,
    "description": `Misiunile zilnice și sistemul de recompense în puncte de pe ${siteName}.`,
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
        "name": "Puncte Misiuni",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="points-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pointsSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="points-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
