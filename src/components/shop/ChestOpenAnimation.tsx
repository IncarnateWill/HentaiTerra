'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Image from 'next/image';

const GLOW_STYLES: Record<string, { shadow: string; bg: string; border: string; glow: string; particles: string[]; label: string; ringColor: string }> = {
  gray: {
    shadow: "shadow-[0_0_60px_20px_rgba(148,163,184,0.4)]",
    bg: "bg-slate-500/10",
    border: "border-slate-400/40",
    glow: "rgba(148,163,184,0.6)",
    particles: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#64748b"],
    label: "Orba Comună / Bună",
    ringColor: "rgba(148,163,184,0.4)"
  },
  blue: {
    shadow: "shadow-[0_0_80px_25px_rgba(59,130,246,0.6)]",
    bg: "bg-blue-500/15",
    border: "border-blue-400/40",
    glow: "rgba(59,130,246,0.8)",
    particles: ["#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#60a5fa"],
    label: "Orba Epică",
    ringColor: "rgba(59,130,246,0.5)"
  },
  orange: {
    shadow: "shadow-[0_0_100px_35px_rgba(249,115,22,0.8)]",
    bg: "bg-orange-500/20",
    border: "border-orange-400/60",
    glow: "rgba(249,115,22,0.9)",
    particles: ["#f97316", "#fb923c", "#fdba74", "#ea580c", "#ffffff", "#ffedd5"],
    label: "Orba Legendară",
    ringColor: "rgba(249,115,22,0.6)"
  },
};

function Particle({ color, delay }: { color: string; delay: number }) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 100 + Math.random() * 150;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none z-10"
      style={{ background: color, left: "50%", top: "45%" }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        scale: 0,
        opacity: 0,
      }}
      transition={{ duration: 1.0 + Math.random() * 0.5, delay, ease: "easeOut" }}
    />
  );
}

interface ChestOpenAnimationProps {
  cards: any[];
  onClose: () => void;
}

export default function ChestOpenAnimation({ cards, onClose }: ChestOpenAnimationProps) {
  const [phase, setPhase] = useState("idle"); // idle → shaking → opening → reveal
  const [particles, setParticles] = useState<any[]>([]);

  // Find the highest rarity card to determine glow color
  const raritiesPriority: Record<string, number> = {
    simple: 1,
    bune: 2,
    epic: 3,
    legendar: 4
  };
  
  let maxRarity = 'simple';
  let maxPriority = 0;
  for (const c of cards) {
    const priority = raritiesPriority[c.rarity] || 1;
    if (priority > maxPriority) {
      maxPriority = priority;
      maxRarity = c.rarity;
    }
  }

  let glowKey = 'gray';
  if (maxRarity === 'epic') glowKey = 'blue';
  else if (maxRarity === 'legendar') glowKey = 'orange';

  const style = GLOW_STYLES[glowKey];

  useEffect(() => {
    // Auto-start animation
    setPhase("shaking");
    const t1 = setTimeout(() => setPhase("opening"), 1200);
    const t2 = setTimeout(() => {
      const p = Array.from({ length: maxRarity === "legendar" ? 40 : maxRarity === "epic" ? 30 : 20 }, (_, i) => ({
        id: i,
        color: style.particles[i % style.particles.length],
        delay: Math.random() * 0.4,
      }));
      setParticles(p);
    }, 1400);
    const t3 = setTimeout(() => setPhase("reveal"), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [maxRarity, style]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden">
      {/* Close button */}
      {phase === "reveal" && (
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white z-50 transition-colors p-2 bg-slate-900/60 rounded-full border border-white/10">
          <X size={24} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase !== "reveal" ? (
          <motion.div key="chest" className="relative flex flex-col items-center select-none w-64 h-64 justify-center">
            {/* Ambient background glow pulsing */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl opacity-30"
              style={{ background: style.glow }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Exploding particles */}
            {particles.map((p) => (
              <Particle key={p.id} color={p.color} delay={p.delay} />
            ))}

            {/* Glowing magic orb replacing the chest */}
            <motion.div
              className={`w-32 h-32 rounded-full border-2 ${style.border} ${style.bg} ${style.shadow} relative overflow-hidden backdrop-blur-md flex items-center justify-center`}
              animate={
                phase === "shaking"
                  ? { 
                      scale: [1, 1.08, 0.96, 1.08, 1], 
                      rotate: [-5, 5, -5, 5, 0],
                    }
                  : phase === "opening"
                  ? { 
                      scale: [1, 1.5, 0], 
                      opacity: [1, 1, 0], 
                      filter: "brightness(2.5)" 
                    }
                  : {}
              }
              style={{ transformOrigin: "center center" }}
              transition={
                phase === "shaking" 
                  ? { duration: 1.0, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.8, ease: "easeInOut" }
              }
            >
              {/* Inner magic swirl rings */}
              <div className="absolute inset-2 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-4 rounded-full border border-white/5 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
              
              {/* Pulsing core glow */}
              <div className="w-14 h-14 rounded-full bg-white/20 blur-md animate-ping" />
              <div className="w-8 h-8 rounded-full bg-white/40 blur-sm" />
            </motion.div>

            <motion.p 
              className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-300 font-heading text-center"
              animate={phase === "shaking" ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.0, repeat: Infinity }}
            >
              {phase === "shaking" ? "Se deschide orba..." : "Explozie de energie!"}
            </motion.p>
          </motion.div>
        ) : (
          /* REVEAL PHASE */
          <motion.div
            key="reveal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 max-w-5xl w-full px-6 text-center select-none"
          >
            {/* Title / Header */}
            <div className="space-y-1">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 flex items-center justify-center gap-2">
                <Sparkles className="text-amber-400 animate-pulse" />
                FELICITĂRI!
                <Sparkles className="text-amber-400 animate-pulse" />
              </h2>
              <p className="text-slate-400 text-xs tracking-wide">
                Ai obținut {cards.length} {cards.length === 1 ? 'cartonaș nou' : 'cartonașe noi'} din cufăr!
              </p>
            </div>

            {/* Cards container grid */}
            <div className="flex flex-wrap justify-center gap-6 max-h-[60vh] overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-black/40">
              {cards.map((card, idx) => {
                const cardGlow = GLOW_STYLES[card.rarity === 'legendar' ? 'orange' : card.rarity === 'epic' ? 'blue' : 'gray'];
                
                return (
                  <motion.div
                    key={card._id + '-' + idx}
                    initial={{ scale: 0.3, opacity: 0, y: 50, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15, ease: "backOut" }}
                    className={`relative ${cards.length === 1 ? 'w-64 h-80' : 'w-44 h-60'} flex-shrink-0 group rounded-2xl overflow-hidden border border-white/10 bg-slate-900 transition-all duration-300 hover:scale-[1.04] z-10 shadow-2xl`}
                  >
                    {/* Ring glow background behind the card */}
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl scale-105 opacity-40 group-hover:opacity-75 transition-opacity z-0"
                      style={{ background: cardGlow?.glow }}
                    />
                    
                    {/* Image */}
                    {card.imageUrl ? (
                      <Image 
                        src={card.imageUrl} 
                        alt={card.name} 
                        fill 
                        className="object-cover z-1" 
                        unoptimized 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-950 z-1">
                        <span className="text-4xl">🃏</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-2" />

                    {/* Rarity label */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/85 rounded text-[8px] font-bold uppercase border border-white/15 text-white z-3 backdrop-blur-sm">
                      {card.rarity}
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 pt-6 z-3 text-left">
                      <p className="font-bold text-white text-xs lg:text-sm drop-shadow-md truncate">{card.name}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Single Card description if exactly 1 card won */}
            {cards.length === 1 && cards[0].description && (
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed -mt-2">
                {cards[0].description}
              </p>
            )}

            {/* Close / Confirm button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cards.length * 0.15 + 0.3 }}
              onClick={onClose}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-900/40 transition-all duration-200 active:scale-95 z-20 border border-purple-500/30"
            >
              Adaugă în Colecție
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
