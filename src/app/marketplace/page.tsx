'use client';

import { useState, useEffect, useCallback } from "react";
import { Coins, Tag, Store } from "lucide-react";
import { getMarketplaceListings, buyListing } from "@/actions/marketplace.actions";
import { getUserPoints } from "@/actions/economy.actions";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";

export default function MarketplacePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('recent');

  const loadData = useCallback(async () => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      const pointsRes = await getUserPoints();
      if (pointsRes.points !== undefined) {
        setUserPoints(pointsRes.points);
      }
    }

    const data = await getMarketplaceListings();
    if (data.listings) {
      setListings(data.listings);
    }
    setLoading(false);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const raritiesWeight: Record<string, number> = {
    simple: 1,
    bune: 2,
    epic: 3,
    legendar: 4
  };

  const sortedListings = [...listings].sort((a, b) => {
    const cardA = a.userCardId?.cardId;
    const cardB = b.userCardId?.cardId;
    if (!cardA || !cardB) return 0;

    if (sortBy === 'rarity-desc') {
      const wA = raritiesWeight[cardA.rarity] || 0;
      const wB = raritiesWeight[cardB.rarity] || 0;
      if (wB !== wA) return wB - wA;
      return cardA.name.localeCompare(cardB.name);
    }
    if (sortBy === 'rarity-asc') {
      const wA = raritiesWeight[cardA.rarity] || 0;
      const wB = raritiesWeight[cardB.rarity] || 0;
      if (wB !== wA) return wA - wB;
      return cardA.name.localeCompare(cardB.name);
    }
    if (sortBy === 'price-desc') {
      return b.pricePoints - a.pricePoints;
    }
    if (sortBy === 'price-asc') {
      return a.pricePoints - b.pricePoints;
    }
    if (sortBy === 'name-asc') {
      return cardA.name.localeCompare(cardB.name);
    }
    if (sortBy === 'name-desc') {
      return cardB.name.localeCompare(cardA.name);
    }
    // 'recent'
    return 0;
  });

  async function handleBuy(listing: any) {
    if (!isSignedIn) {
      toast.error('Trebuie să fii autentificat!');
      return;
    }

    if (user?.id === listing.sellerId?.clerkId) {
       toast.error('Nu poți cumpăra propriul cartonaș!');
       return;
    }

    if (userPoints < listing.pricePoints) {
      toast.error(`Nu ai suficiente puncte! Ai nevoie de ${listing.pricePoints} puncte.`);
      return;
    }

    setBuying(listing._id);
    const res = await buyListing(listing._id);
    if (res.success) {
      toast.success('Cartonaș cumpărat cu succes!');
      setUserPoints(res.newPoints!);
      window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: res.newPoints } }));
      await loadData();
    } else {
      toast.error(res.error || 'Eroare la cumpărare');
    }
    setBuying(null);
  }

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="text-primary" size={28} />
            <h1 className="font-heading text-2xl lg:text-3xl text-foreground tracking-wider">MARKETPLACE</h1>
          </div>
          <p className="text-muted-foreground mt-1">Cumpără cartonașe de la alți jucători</p>
        </div>
        
        {isSignedIn && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Coins size={18} className="text-amber-400" />
            <span className="text-amber-400 font-bold text-lg">{userPoints}</span>
            <span className="text-amber-400/70 text-sm">puncte</span>
          </div>
        )}
      </div>

      {/* Sorting Control Panel */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-wrap gap-4 backdrop-blur-sm">
        <div className="text-xs text-slate-400 font-medium">
          Răsfoiește ofertele active de cartonașe listate de jucători.
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Sortează după:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1E1A2E]/80 border border-purple-500/20 text-white rounded-xl py-1.5 px-3 focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer text-xs font-bold"
          >
            <option value="recent">Cele mai recente</option>
            <option value="rarity-desc">Raritate (Descrescător)</option>
            <option value="rarity-asc">Raritate (Crescător)</option>
            <option value="price-desc">Preț (Descrescător)</option>
            <option value="price-asc">Preț (Crescător)</option>
            <option value="name-asc">Nume (A-Z)</option>
            <option value="name-desc">Nume (Z-A)</option>
          </select>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          Nu există cartonașe la vânzare momentan.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedListings.map(listing => {
            const card = listing.userCardId?.cardId;
            if (!card) return null;

            return (
              <div key={listing._id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full group">
                <div className="aspect-[3/4] bg-muted relative p-2">
                   {card.imageUrl ? (
                     <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                       <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                     </div>
                   ) : (
                     <div className="w-full h-full rounded-lg bg-black/20 flex items-center justify-center border border-white/10">
                       <span className="text-4xl">🃏</span>
                     </div>
                   )}
                   <div className="absolute top-4 left-4">
                     <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white rounded shadow border border-white/10">
                        {card.rarity}
                     </span>
                   </div>
                </div>
                
                <div className="p-3 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="font-heading text-sm text-foreground line-clamp-1" title={card.name}>{card.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                       {listing.sellerId?.imageUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={listing.sellerId.imageUrl} width={16} height={16} className="w-4 h-4 rounded-full" alt="Seller" />
                       ) : (
                         <div className="w-4 h-4 rounded-full bg-primary/20" />
                       )}
                       <span className="truncate">{listing.sellerId?.username || listing.sellerId?.email?.split('@')[0]}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border">
                    {isSignedIn && user?.id === listing.sellerId?.clerkId ? (
                      <div className="w-full text-center py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
                        Cartonașul tău
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy(listing)}
                        disabled={buying === listing._id}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Cumpără</span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">{listing.pricePoints}</span>
                          <Coins size={14} className="text-amber-400" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
