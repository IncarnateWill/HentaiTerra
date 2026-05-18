'use client';

import { Loader2, ShoppingBag } from "lucide-react";

const CHEST_VISUALS: Record<string, any> = {
  simple: {
    outerClass: "from-slate-500 to-slate-700 border-slate-400/40",
    lidClass: "from-slate-400 to-slate-600",
    glowClass: "shadow-slate-500/20",
    label: "Cufăr Simplu",
    emoji: "🪙",
  },
  bune: {
    outerClass: "from-green-600 to-green-900 border-green-400/40",
    lidClass: "from-green-400 to-green-700",
    glowClass: "shadow-green-500/30",
    label: "Cufăr Verde",
    emoji: "🟢",
  },
  epic: {
    outerClass: "from-purple-600 to-purple-950 border-purple-400/40",
    lidClass: "from-purple-400 to-purple-700",
    glowClass: "shadow-purple-500/40",
    label: "Cufăr Epic",
    emoji: "✨",
  },
  legendar: {
    outerClass: "from-amber-400 to-amber-700 border-amber-300/60",
    lidClass: "from-yellow-200 to-amber-500",
    glowClass: "shadow-amber-400/50",
    label: "Cufăr Legendar",
    emoji: "👑",
  },
};

interface ChestCardProps {
  rarity: string;
  config: { costType: string; cost: number | null };
  count: number;
  userPoints: number;
  buying: boolean;
  onBuy: () => void;
}

export default function ChestCard({ rarity, config, count, userPoints, buying, onBuy }: ChestCardProps) {
  const v = CHEST_VISUALS[rarity] || CHEST_VISUALS.simple;
  const canAfford = config.costType === "money" || userPoints >= (config.cost || 0);

  return (
    <div className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border bg-card shadow-xl ${v.glowClass} hover:scale-[1.02] transition-transform duration-200 h-full`}>
      {/* Chest visual */}
      <div className="relative select-none">
        {/* Lid */}
        <div className={`w-28 h-12 rounded-t-xl bg-gradient-to-b ${v.lidClass} border-t-2 border-x-2 border-white/20 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-4 rounded-sm bg-amber-400/80 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-700/60" />
          </div>
        </div>
        {/* Body */}
        <div className={`w-32 h-16 -ml-2 rounded-b-xl bg-gradient-to-b ${v.outerClass} border-b-2 border-x-2 border-white/10 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute top-1.5 left-0 right-0 h-1.5 bg-black/20" />
          <div className="absolute bottom-1.5 left-0 right-0 h-1.5 bg-black/20" />
        </div>
        {/* Rarity glow */}
        {rarity === "legendar" && (
          <div className="absolute -inset-2 rounded-xl blur-xl bg-amber-400/20 -z-10 animate-pulse-glow" />
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <span>{v.emoji}</span>
          <h3 className="font-heading text-sm tracking-wider text-foreground">{v.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{count} cartonașe disponibile</p>
      </div>

      {/* Buy button - aligned at bottom */}
      <div className="mt-auto w-full">
        <button
          onClick={onBuy}
          disabled={buying || count === 0 || (config.costType === "money" && !config.cost) || (config.costType !== "money" && !canAfford)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${(count > 0 && (config.costType === "money" ? config.cost : canAfford) && !buying)
              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
        >
          {buying ? <Loader2 size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
          {buying ? "Se cumpără..." : (config.costType === "money" ? (config.cost ? `${config.cost} Lei` : "Disponibil în curând") : `${config.cost} puncte`)}
        </button>
        {!canAfford && config.costType !== "money" && (
          <p className="text-xs text-destructive/80 text-center mt-1">Puncte insuficiente</p>
        )}
      </div>
    </div>
  );
}
