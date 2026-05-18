import { connectToDatabase } from "@/lib/mongodb";
import { User, UserCard, MarketplaceListing } from "@/models";
import { auth } from "@clerk/nextjs/server";
import { logToDiscordWebhook } from "@/lib/discord-webhook";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import CardsClient from "./CardsClient";
import { Metadata } from "next";
import Script from "next/script";

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  try {
    await connectToDatabase();
    const { username } = await params;
    const user = await User.findOne({ username }).select('username imageUrl').lean() as any;

    if (!user) {
      return {
        title: "Colecție Negăsită",
        description: "Colecția de cartonașe solicitată nu a putut fi găsită",
      };
    }

    const baseUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
    const canonicalUrl = `${baseUrl}/profile/${username}/cards`;
    const title = `Colecția de cartonașe a lui ${user.username} | HentaiUnited`;
    const description = `Vezi toate cartonașele colecționate de ${user.username} pe HentaiUnited. Cartonașe de la simple la legendare!`;
    const imageUrl = user.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTQBUvIrjWFCT_r4FhlT2T3vJLLdCRRV5WFA&s';

    return {
      title,
      description,
      metadataBase: new URL(baseUrl as string),
      alternates: {
        canonical: `/profile/${username}/cards`,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `Colecția de cartonașe a lui ${user.username}`,
          },
        ],
        type: 'website',
        locale: 'ro_RO',
        siteName: 'HentaiUnited',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@HentaiUnited',
        site: '@HentaiUnited',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Colecție de Cartonașe | HentaiUnited",
      description: "Vezi colecția de cartonașe pe HentaiUnited.",
    };
  }
}

export default async function ProfileCardsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const sanitizedUsername = username
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  try {
    await connectToDatabase();

    const user = await User.findOne({ username: sanitizedUsername }).select('username clerkId imageUrl').lean() as any;

    if (!user) {
      return <div className="text-center p-8 text-red-500">Profil negăsit.</div>;
    }

    const { userId } = await auth();
    const isOwner = !!(userId && user.clerkId === userId);

    const userCards = await UserCard.find({ userId: user._id })
      .populate('cardId')
      .sort({ createdAt: -1 })
      .lean();

    const activeListings = await MarketplaceListing.find({ sellerId: user._id, active: true }).lean();
    const enrichedCards = userCards.map((c: any) => {
      const listing = activeListings.find((l: any) => l.userCardId.toString() === c._id.toString());
      return {
        ...c,
        isListed: !!listing,
        listedPrice: listing?.pricePoints || null,
        listingId: listing?._id?.toString() || null
      };
    });

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';
    const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
    const pageUrl = `${siteUrl}/profile/${sanitizedUsername}/cards`;

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `Colecția de cartonașe a lui ${user.username}`,
      "description": `Colecția completă de cartonașe a lui ${user.username} pe ${siteName}. Conține ${enrichedCards.length} cartonașe.`,
      "url": pageUrl,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": enrichedCards.length,
        "itemListElement": enrichedCards.slice(0, 10).map((c: any, idx: number) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": c.cardId?.name || "Cartonaș Hentai"
        }))
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
          "name": `Profil ${user.username}`,
          "item": `${siteUrl}/profile/${sanitizedUsername}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Cartonașe",
          "item": pageUrl
        }
      ]
    };

    return (
      <>
        <Script
          id={`profile-${user.username}-cards-structured-data`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
          strategy="afterInteractive"
        />
        <Script
          id={`profile-${user.username}-cards-breadcrumb`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          strategy="afterInteractive"
        />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${sanitizedUsername}`} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors">
                <FaArrowLeft />
              </Link>
              <div className="flex items-center gap-3">
                <Image src={user.imageUrl || '/default-pfp.png'} alt={user.username} width={40} height={40} className="rounded-full border border-purple-500" />
                <h1 className="text-2xl font-bold text-white">Colecția lui {user.username}</h1>
              </div>
            </div>
            <div className="bg-purple-900/40 border border-purple-500/30 px-4 py-2 rounded-lg text-purple-300 font-medium">
              {userCards.length} Cartonașe
            </div>
          </div>

          <CardsClient initialCards={JSON.parse(JSON.stringify(enrichedCards))} isOwner={isOwner} />
        </div>
      </>
    );
  } catch (error) {
    await logToDiscordWebhook(`Error loading cards page: ${error}`);
    return <div className="text-center p-8 text-red-500">Eroare la încărcarea colecției.</div>;
  }
}
