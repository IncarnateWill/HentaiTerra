export const animesstructuredata = () => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Catalogul Complet de Conținut pentru Hentai`,
        "description": `Explorează colecția vastă de conținut hentai subtitrat în română pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Doar pentru persoane de peste 18 ani. Streaming gratuit, calitate HD.`,
        "url": `${process.env.SITE_URL}/hentais`,
        "inLanguage": "ro-RO",
        "isPartOf": {
            "@type": "WebSite",
            "name": process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
            "url": process.env.SITE_URL
        }
});