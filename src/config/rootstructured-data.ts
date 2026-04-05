export const getHomeStructuredData = () => ({
    "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Hentai Online Subtitrat în Română`,
                        "description": `Platformă premium de streaming hentai cu subtitrare în română. Vizionează gratuit hentai online subtitrat în română, în calitate HD.`,
                        "url": process.env.SITE_URL || 'https://hentaiterra.ro',    
                        "publisher": {
                            "@type": "Organization",
                            "name": process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
                            "url": process.env.SITE_URL || 'https://hentaiterra.ro',
                            "logo": {
                                "@type": "ImageObject",
                                "url": process.env.NEXT_PUBLIC_OG_IMAGE || '/placeholder.jpg'
                            }
                        },
                        "mainEntity": {
                            "@type": "ItemList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Hentaiuri Populare",
                                    "description": "Seriile hentai cele mai vizionate și apreciate de fani"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Ultimele Hentaiuri",
                                    "description": "Cele mai recente serii hentai adăugate pe HentaiTerra"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": "Ultimele Episoade",
                                    "description": "Episoade noi din seriile hentai favorite, actualizate zilnic"
                                }
                            ]
                        },
                        "inLanguage": "ro-RO",
                        "audience": {
                            "@type": "Audience",
                            "audienceType": "Fani anime din România",
                            "geographicArea": "Romania",
                            "ageRange": "18+"
                        },
                        "isAccessibleForFree": "True",
                        "keywords": `hentai, streaming, subtitrat romana, episoade noi, filme hentai, HD`
});