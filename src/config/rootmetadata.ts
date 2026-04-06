export const homeMetadata = {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Hentai Online Subtitrat în Română | Conținut pentru Adulți 18+`,
    description: 'Platformă pentru adulți cu conținut hentai subtitrat în română. Doar pentru persoane de peste 18 ani. ' + (process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra') + ' oferă streaming gratuit de conținut pentru adulți în calitate HD cu subtitrare în limba română.',
    keywords: [
        'hentai romania',
        'hentai subtitrat',
        'conținut adulți',
        'hentai gratis',
        'hentai pentru adulți',
        'hentai română',
        'hentai subtitrat romana',
        'conținut pentru adulți romania',
        'hentai online romania',
        'hentai cu subtitrare',
        'adult content 18+'
    ],
    metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || 'https://hentaiterra.ro') as string),
    alternates: {
        canonical: "/",
        languages: {
            'ro-RO': '/',
        },
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Platformă de Conținut pentru Adulți în Română`,
        description: 'Platformă pentru adulți cu conținut hentai subtitrat în română. Doar pentru persoane de peste 18 ani. Streaming gratuit, calitate HD și conținut explicit pentru adulți.',
        type: 'website',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hentaiterra.ro',
        images: [
            {
                url: process.env.NEXT_PUBLIC_OG_IMAGE || 'https://images2.alphacoders.com/913/913209.jpg',
                width: 1200,
                height: 630,
                alt: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Platformă Premium de Conținut pentru Adulți în Română`
            },
        ],
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
        locale: 'ro_RO',
        // Added video capability for future use
        videos: []
    },
    twitter: {
        card: "summary_large_image",
        title: "HentaiTerra - Conținut pentru Adulți 18+ în Română",
        description: "Platformă pentru adulți cu conținut hentai subtitrat în română. Doar pentru persoane de peste 18 ani.",
        images: [
            "https://images2.alphacoders.com/913/913209.jpg",
        ],
        site: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@HentaiTerra",
        creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@HentaiTerra",
    },
    appleWebApp: {
        capable: true,
        title: "HentaiTerra",
        statusBarStyle: "black-translucent",
    },
    formatDetection: {
        telephone: false,
        date: false,
        address: false,
        email: false,
    },
    icons: {
        icon: [
            { url: "/favicon-32x32.png", sizes: "32x32" },
            { url: "/favicon-16x16.png", sizes: "16x16" },
            // Added Android-chrome icons
            { url: "/android-chrome-192x192.png", sizes: "192x192" },
            { url: "/android-chrome-512x512.png", sizes: "512x512" }
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180" },
        ],
        // Added shortcut icon
        shortcut: ["/favicon.ico"]
    },
    other: {
        "geo.region": "RO",
        "geo.placename": "Romania",
        "dc.language": "romanian",
        "dcterms.subject": "hentai, streaming, subtitrat romana",
        "revisit-after": "3 days", // More frequent revisit
        "rating": "general", // Changed to more accurate rating
        "copyright": `Copyright (C) ${new Date().getFullYear()} IncarnateWill / HentaiTerra`
    }
};
