import { Metadata } from 'next';

const siteConfig = {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Conținut Hentai în Română`,
    description: 'Platformă pentru hentai cu conținut subtitrat în română. Doar pentru persoane de peste 18 ani. ' + (process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra') + ' oferă streaming gratuit în calitate HD și conținut explicit pentru hentai.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiTerra.ro',
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || 'https://images2.alphacoders.com/913/913209.jpg',
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@HentaiTerra',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
};

export const homeMetadata: Metadata = {
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.description,
    keywords: [
        'hentai online',
        'hentai subtitrat',
        'hentai rosub',
        'hentai uncensored',
        'hentai 18+',
        'conținut explicit',
        'HentaiTerra',
    ],
    metadataBase: new URL(siteConfig.url as string),
    alternates: {
        canonical: `${siteConfig.url}/home`,
        languages: {
            'ro-RO': `${siteConfig.url}/home`,
        },
    },
    robots: {
        index: true,
        follow: true,
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
        type: 'website',
        locale: 'ro_RO',
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        images: [
            {
                url: siteConfig.ogImage as string,
                width: 1200,
                height: 630,
                alt: `Banner for ${siteConfig.title}`,
            },
        ],
        siteName: siteConfig.siteName,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage as string],
        creator: siteConfig.twitterHandle,
        site: siteConfig.twitterHandle,
    },
    appleWebApp: {
        capable: true,
        title: "HentaiTerra",
        statusBarStyle: "black-translucent",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/favicon-32x32.png", sizes: "32x32" },
            { url: "/favicon-16x16.png", sizes: "16x16" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon.ico",
    },
    other: {
        "geo.region": "RO",
        "geo.placename": "Romania",
        "copyright": `Copyright (C) ${new Date().getFullYear()} IncarnateWill / HentaiTerra`,
    }
};