import { connectToDatabase } from "@/lib/mongodb";
import { User, UserCard, MarketplaceListing } from "@/models";
import { auth } from "@clerk/nextjs/server";
import { logToDiscordWebhook } from "@/lib/discord-webhook";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import CardsClient from "./CardsClient";

export const dynamic = 'force-dynamic';

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

    return (
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
    );
  } catch (error) {
    await logToDiscordWebhook(`Error loading cards page: ${error}`);
    return <div className="text-center p-8 text-red-500">Eroare la încărcarea colecției.</div>;
  }
}
