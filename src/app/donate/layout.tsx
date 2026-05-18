import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `Donații | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} - Susține Comunitatea Hentai`,
  description: `Ajută-ne să menținem ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} și să continuăm să oferim conținut de calitate. Donațiile tale susțin direct dezvoltarea platformei și comunitatea hentai din România.`,
  keywords: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}, donații, susține hentai, comunitate hentai, România, fansub, donație`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/donate`
  },
  openGraph: {
    title: `Susține ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} prin Donații`,
    description: `Ajută-ne să creștem și să îmbunătățim platforma ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} prin donațiile tale.`,
    url: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/donate`,
    type: 'website',
    images: [{
      url: 'https://i.imgur.com/BhTbL9B.png',
      width: 1200,
      height: 630,
      alt: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} - Susține prin donații`
    }]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';
  const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
  const pageUrl = `${siteUrl}/donate`;

  const donateSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Donații | ${siteName}`,
    "description": `Ajută-ne să menținem ${siteName} și să continuăm să oferim conținut de calitate. Donațiile tale susțin direct dezvoltarea platformei și comunitatea hentai din România.`,
    "url": pageUrl,
    "potentialAction": {
      "@type": "DonateAction",
      "recipient": {
        "@type": "Organization",
        "name": siteName,
        "url": siteUrl
      }
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
        "name": "Donații",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="donate-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donateSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="donate-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
