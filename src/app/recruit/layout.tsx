import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Alătură-te Echipei ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} | Recrutări pentru Traducători și Editori`,
  description: `Devino parte din echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}! Căutăm traducători și editori pasionați de hentai și manga. Aplică acum pentru a contribui la comunitatea hentai din România.`,
  keywords: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}, recrutare, traducători hentai, editori manga, comunitate hentai, România`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/recruit` 
  },
  openGraph: {
    title: `Alătură-te Echipei ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Devino parte din echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}! Aplică acum pentru rolurile disponibile.`,
    url: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/recruit`,
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
  return children;
}