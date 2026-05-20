'use client';

import { Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface LootboxCardProps {
  lootbox: {
    _id: string;
    name: string;
    iconUrl: string;
    pricePoints?: number;
    priceMoney?: number;
    cardsCount: number;
    rarities: { rarity: string; chance: number }[];
  };
  userPoints: number;
  buying: boolean;
  onBuy: () => void;
}

export default function LootboxCard({ lootbox, userPoints, buying, onBuy }: LootboxCardProps) {
  const price = lootbox.pricePoints || 0;
  const isPointsPrice = !!lootbox.pricePoints;
  const canAfford = !isPointsPrice || userPoints >= price;

  // Sort rarities to determine visual theme
  const sortedRarities = [...lootbox.rarities].sort((a,b) => b.chance - a.chance);
  const mainRarity = sortedRarities[0]?.rarity || 'simple';

  const visualConfig: Record<string, any> = {
    simple: { border: "border-slate-500/20", glow: "shadow-slate-500/10", text: "text-slate-300", bg: "bg-slate-500/5" },
    bune: { border: "border-green-500/20", glow: "shadow-green-500/15", text: "text-green-400", bg: "bg-green-500/5" },
    epic: { border: "border-purple-500/20", glow: "shadow-purple-500/25", text: "text-purple-400", bg: "bg-purple-500/5" },
    legendar: { border: "border-amber-500/30", glow: "shadow-amber-500/35", text: "text-amber-400", bg: "bg-amber-500/5", glowBg: "bg-amber-500/10" }
  };

  const v = visualConfig[mainRarity] || visualConfig.simple;

  return (
    <div className={`relative flex flex-col items-center gap-4 p-5 rounded-2xl border ${v.border} bg-neutral-900/60 shadow-xl backdrop-blur-sm ${v.glow} hover:scale-[1.02] transition-transform duration-200 h-full`}>
      {/* Lootbox image */}
      <div className="relative w-48 h-48 select-none flex items-center justify-center -mt-2 mb-2">
        {lootbox.iconUrl ? (
          <Image
            src={lootbox.iconUrl}
            alt={lootbox.name}
            width={192}
            height={192}
            className="object-contain drop-shadow-2xl animate-pulse-glow"
          />
        ) : (
          <div className="text-7xl">🎁</div>
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-2 w-full">
        <h3 className="font-heading text-base font-bold tracking-wider text-white truncate">{lootbox.name}</h3>
        
        {/* Draw count */}
        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">
          {lootbox.cardsCount}x {lootbox.cardsCount === 1 ? 'Cartonaș' : 'Cartonașe'}
        </p>

        {/* Rarities chances list */}
        <div className="bg-black/40 rounded-xl p-2.5 text-[10px] text-left space-y-1 border border-white/5">
          <span className="font-semibold text-gray-400 block mb-1 text-center">Șanse Drop:</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {lootbox.rarities.map(r => (
              <div key={r.rarity} className="flex justify-between items-center capitalize">
                <span className={`font-medium ${
                  r.rarity === 'simple' ? 'text-gray-400' :
                  r.rarity === 'bune' ? 'text-green-400' :
                  r.rarity === 'epic' ? 'text-purple-400' : 'text-amber-400'
                }`}>{r.rarity}:</span>
                <span className="text-gray-200 font-bold">{r.chance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy button */}
      <div className="mt-auto w-full pt-2">
        <button
          onClick={onBuy}
          disabled={buying || (!isPointsPrice && !lootbox.priceMoney) || (isPointsPrice && !canAfford)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${(canAfford && !buying)
              ? "bg-purple-600 hover:bg-purple-500 text-white active:scale-95 shadow-md shadow-purple-500/20"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60 border border-white/5"
            }`}
        >
          {buying ? <Loader2 size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
          {buying ? "Se cumpără..." : (isPointsPrice ? `${price} puncte` : (lootbox.priceMoney ? `${lootbox.priceMoney} Lei` : "Disponibil în curând"))}
        </button>
        {!canAfford && isPointsPrice && (
          <p className="text-[10px] text-red-400 text-center mt-1.5 font-bold">Puncte insuficiente</p>
        )}
      </div>
    </div>
  );
}
