const siteConfig = {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Hentai Online Subtitrat în Română`,
    description: `Descoperă și vizionează cele mai noi hentai-uri subtitrate în română. ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} oferă streaming gratuit în calitate HD, actualizări zilnice și o comunitate activă.`,
    url: process.env.SITE_URL || 'https://hentaiterra.ro',
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/placeholder.jpg',
  };
  
  export const getHomeStructuredData = () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteConfig.title,
      "description": siteConfig.description,
      "url": `${siteConfig.url}/home`,
      "publisher": {
          "@type": "Organization",
          "name": process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
          "url": siteConfig.url,
          "logo": {
              "@type": "ImageObject",
              "url": siteConfig.ogImage
          }
      },
      "inLanguage": "ro-RO",
      "isAccessibleForFree": "True",
      "keywords": "hentai, streaming, subtitrat romana, episoade noi, filme hentai, HD"
  });