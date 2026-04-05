export const animesmetadata = {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Catalogul Complet de Conținut pentru Hentai 18+`,
    description: `Explorează catalogul vast de conținut hentai subtitrat în română pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Doar pentru persoane de peste 18 ani. Filtrează după gen și descoperă conținut explicit pentru hentai. Streaming gratuit în calitate HD.`,
    keywords: [
        'hentai romania',
        'hentai hd',
        'hentai online',
        'hentai subtitrat in romana',
        'hentai uncensored',
        'hentai subtitrat romana',
        'lista hentai romania', 
        'colectie hentai romania',
        'hentai online romania',
        'hentai streaming romania',
        'hentai hd romana',
        'adult content 18+',
        `${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra').toLowerCase()} romania`
    ],
    openGraph: {
        title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Catalogul Complet de Conținut pentru Hentai`,
        description: `Descoperă conținut hentai subtitrat în română pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Doar pentru persoane de peste 18 ani. Filtrează după genuri și găsește conținut explicit pentru hentai. Streaming gratuit, calitate HD.`,
        type: 'website',
        url: `${process.env.SITE_URL}/hentais`,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
        locale: 'ro_RO',
        images: [
            {
                url: process.env.NEXT_PUBLIC_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Catalogul Complet de Conținut pentru Hentai`
            }
        ]
    },
    alternates: {
        canonical: `${process.env.SITE_URL}/hentais`,
        languages: {
            'ro-RO': `${process.env.SITE_URL}/hentais`,
        },
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    }
};