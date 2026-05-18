'use client';

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import LootboxCard from "@/components/shop/LootboxCard";
import ChestOpenAnimation from "@/components/shop/ChestOpenAnimation";
import { getShopData, getUserPoints, buyLootbox } from "@/actions/economy.actions";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function ShopPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [lootboxes, setLootboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wonCards, setWonCards] = useState<any[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isLoaded) return;
      
      if (isSignedIn) {
        const pointsRes = await getUserPoints();
        if (pointsRes.points !== undefined) {
          setUserPoints(pointsRes.points);
        }
      }

      const shopData = await getShopData();
      if (shopData.lootboxes) {
        setLootboxes(shopData.lootboxes);
      }
      
      setLoading(false);
    }
    load();
  }, [isLoaded, isSignedIn]);

  const handleBuy = async (lootbox: any) => {
    if (!isSignedIn) {
      toast.error('Trebuie să fii autentificat pentru a cumpăra!');
      return;
    }

    if (lootbox.pricePoints) {
      if (userPoints < lootbox.pricePoints) {
        toast.error(`Nu ai suficiente puncte! Ai nevoie de ${lootbox.pricePoints} puncte.`);
        return;
      }
      
      setBuying(lootbox._id);
      const res = await buyLootbox(lootbox._id);
      if (res.success && res.wonCards) {
        setUserPoints(res.newPoints!);
        setWonCards(res.wonCards);
        window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: res.newPoints } }));
      } else {
        toast.error(res.error || 'Eroare la cumpărare');
      }
      setBuying(null);
    } else {
      toast.error('Plata cu bani reali nu este implementată încă!');
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl text-foreground tracking-wider">CARD SHOP</h1>
          <p className="text-muted-foreground mt-1">Cumpără pachete de cartonașe și completează-ți colecția</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Coins size={18} className="text-amber-400" />
          <span className="text-amber-400 font-bold text-lg">{userPoints}</span>
          <span className="text-amber-400/70 text-sm">puncte</span>
        </div>
      </div>

      {/* Lootbox sections */}
      {lootboxes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lootboxes.map((lootbox) => (
            <LootboxCard
              key={lootbox._id}
              lootbox={lootbox}
              userPoints={userPoints}
              buying={buying === lootbox._id}
              onBuy={() => handleBuy(lootbox)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900/40 rounded-2xl p-12 text-center border border-white/5">
          <p className="text-gray-400 font-medium">Nu există cutii disponibile în magazin momentan.</p>
        </div>
      )}

      {wonCards && wonCards.length > 0 && (
        <ChestOpenAnimation
          cards={wonCards}
          onClose={() => setWonCards(null)}
        />
      )}
    </div>
  );
}
