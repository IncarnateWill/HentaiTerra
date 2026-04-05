import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Donații | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Susține Comunitatea Hentai`,
  description: `Ajută-ne să menținem ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} și să continuăm să oferim conținut de calitate. Donațiile tale susțin direct dezvoltarea platformei și comunitatea hentai din România.`,
  keywords: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}, donații, susține hentai, comunitate hentai, România, fansub, donație`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/donate`
  },
  openGraph: {
    title: `Susține ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} prin Donații`,
    description: `Ajută-ne să creștem și să îmbunătățim platforma ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} prin donațiile tale.`,
    url: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/donate`,
    type: 'website',
    images: [{
      url: 'https://i.imgur.com/BhTbL9B.png',
      width: 1200,
      height: 630,
      alt: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Susține prin donații`
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
  return children;
}
