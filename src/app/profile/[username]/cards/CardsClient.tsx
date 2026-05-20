'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toggleShowcaseCard, quickSellCard } from '@/actions/economy.actions';
import { createListing, cancelListing } from '@/actions/marketplace.actions';
import toast from 'react-hot-toast';
import { Star, Tag, Coins, Trash } from 'lucide-react';

export default function CardsClient({ initialCards, isOwner }: { initialCards: any[], isOwner: boolean }) {
  const [cards, setCards] = useState<any[]>(initialCards);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Marketplace states
  const [sellCardId, setSellCardId] = useState<string | null>(null);
  const [pricePoints, setPricePoints] = useState<string>('');
  const [listing, setListing] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('recent');

  const showcasedCount = cards.filter(c => c.isShowcased).length;

  const raritiesWeight: Record<string, number> = {
    simple: 1,
    bune: 2,
    epic: 3,
    legendar: 4
  };

  const sortedCards = [...cards].sort((a, b) => {
    if (sortBy === 'rarity-desc') {
      const wA = raritiesWeight[a.cardId.rarity] || 0;
      const wB = raritiesWeight[b.cardId.rarity] || 0;
      if (wB !== wA) return wB - wA;
      return a.cardId.name.localeCompare(b.cardId.name);
    }
    if (sortBy === 'rarity-asc') {
      const wA = raritiesWeight[a.cardId.rarity] || 0;
      const wB = raritiesWeight[b.cardId.rarity] || 0;
      if (wB !== wA) return wA - wB;
      return a.cardId.name.localeCompare(b.cardId.name);
    }
    if (sortBy === 'name-asc') {
      return a.cardId.name.localeCompare(b.cardId.name);
    }
    if (sortBy === 'name-desc') {
      return b.cardId.name.localeCompare(a.cardId.name);
    }
    // 'recent' - default order
    return 0; 
  });

  const handleToggleShowcase = async (cardId: string, currentStatus: boolean) => {
    if (!currentStatus && showcasedCount >= 5) {
      toast.error('Poți expune maxim 5 cartonașe pe profil.');
      return;
    }

    setLoadingId(cardId);
    try {
      const res = await toggleShowcaseCard(cardId, !currentStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(currentStatus ? 'Înlăturat din showcase' : 'Adăugat în showcase');
        setCards(cards.map(c => c._id === cardId ? { ...c, isShowcased: !currentStatus } : c));
      }
    } catch (e) {
      toast.error('Eroare');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSellCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCardId) return;
    const price = parseInt(pricePoints);
    if (isNaN(price) || price <= 0) {
      toast.error('Prețul trebuie să fie un număr pozitiv.');
      return;
    }

    setListing(true);
    try {
      const res = await createListing(sellCardId, price);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Cartonaș pus la vânzare!');
        setCards(cards.map(c => c._id === sellCardId ? { ...c, isListed: true, listedPrice: price } : c));
        setSellCardId(null);
        setPricePoints('');
      }
    } catch (err) {
      toast.error('Eroare la punerea la vânzare.');
    } finally {
      setListing(false);
    }
  };

  const handleCancelListing = async (cardId: string, listingId: string) => {
    setLoadingId(cardId);
    try {
      const res = await cancelListing(listingId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Vânzarea a fost anulată!');
        setCards(cards.map(c => c._id === cardId ? { ...c, isListed: false, listedPrice: null, listingId: null } : c));
      }
    } catch (err) {
      toast.error('Eroare la anularea vânzării.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleQuickSell = async (cardId: string, price: number) => {
    if (!confirm(`Ești sigur că vrei să vinzi acest cartonaș pentru ${price} puncte?`)) return;
    
    setLoadingId(cardId);
    try {
      const res = await quickSellCard(cardId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Cartonaș vândut pentru ${price} puncte!`);
        window.dispatchEvent(new CustomEvent('points-updated', { detail: res.newPoints }));
        setCards(prev => prev.filter(c => c._id !== cardId));
      }
    } catch (e) {
      toast.error('Eroare la vânzarea rapidă.');
    } finally {
      setLoadingId(null);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-12 text-center border border-slate-800">
        <h2 className="text-xl text-slate-400 mb-2">Colecție goală</h2>
        <p className="text-slate-500">Nu deține niciun cartonaș momentan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-wrap gap-4 backdrop-blur-sm">
        {isOwner ? (
          <div className="text-xs text-blue-300 font-medium">
            Alege până la 5 cartonașe pe care să le expui pe profilul tău principal apăsând pe steluță. 
            ({showcasedCount}/5 selectate)
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            Colecția completă de cartonașe a utilizatorului.
          </div>
        )}

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
            <option value="name-asc">Nume (A-Z)</option>
            <option value="name-desc">Nume (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
        {sortedCards.map(c => {
          const card = c.cardId;
          const isShowcased = c.isShowcased;
          const isListed = c.isListed;
          const listedPrice = c.listedPrice;
          const isUpdating = loadingId === c._id;

          return (
            <div key={c._id} className="relative aspect-[3/4] rounded-xl overflow-hidden group shadow-lg flex flex-col justify-end border border-white/5 bg-slate-900">
              <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => setSelectedCard(card)}>
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover transition-transform group-hover:scale-105" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 z-1 pointer-events-none" />
              
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded text-[10px] font-bold uppercase border border-white/10 text-white backdrop-blur-sm z-2 pointer-events-none">
                {card.rarity}
              </div>

              {isOwner && (
                <button 
                  onClick={() => handleToggleShowcase(c._id, isShowcased)}
                  disabled={isUpdating}
                  className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
                    isShowcased ? 'bg-yellow-500 text-white' : 'bg-black/50 text-white/50 hover:bg-black/80 hover:text-white'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isShowcased ? "Înlătură din showcase" : "Adaugă în showcase"}
                >
                  <Star size={14} className={isShowcased ? "fill-current" : ""} />
                </button>
              )}

              {/* Status & Actions overlay */}
              <div className="relative z-2 w-full p-3 text-center flex flex-col gap-2">
                <h3 className="font-bold text-white text-sm leading-tight drop-shadow-lg truncate">{card.name}</h3>
                
                {isListed ? (
                  <div className="flex flex-col gap-1.5 items-center">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Tag size={10} /> La vânzare: {listedPrice} <Coins size={10} />
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleCancelListing(c._id, c.listingId)}
                        disabled={isUpdating}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1 mt-1 transition-colors"
                      >
                        <Trash size={10} /> Anulează vânzarea
                      </button>
                    )}
                  </div>
                ) : (
                  isOwner && (
                    <div className="flex gap-1.5 w-full mt-1">
                      <button
                        onClick={() => card.sellPricePoints && handleQuickSell(c._id, card.sellPricePoints)}
                        disabled={isUpdating || !card.sellPricePoints}
                        className={`flex-1 py-1.5 rounded text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          card.sellPricePoints 
                            ? 'bg-green-600/35 hover:bg-green-600/60 text-green-200 border border-green-500/30'
                            : 'bg-slate-700/35 text-slate-500 border border-slate-600/30 cursor-not-allowed'
                        }`}
                        title="Vinde direct la sistem"
                      >
                        {card.sellPricePoints ? <><Coins size={12} /> {card.sellPricePoints}</> : 'N/A'}
                      </button>
                      <button
                        onClick={() => setSellCardId(c._id)}
                        disabled={isUpdating}
                        className="flex-1 py-1.5 rounded bg-purple-600/35 hover:bg-purple-600/60 text-purple-200 border border-purple-500/30 text-[10px] md:text-xs font-bold transition-all"
                        title="Vinde pe Marketplace către alți jucători"
                      >
                        Market
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selling Modal */}
      {sellCardId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSellCard} className="bg-[#1E1A2E]/95 border border-purple-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="font-heading text-lg text-white font-bold tracking-wider">VINDE CARTONAȘUL</h3>
              <p className="text-xs text-gray-400 mt-1">Introdu prețul în puncte pentru marketplace</p>
            </div>

            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
              <input
                type="number"
                required
                value={pricePoints}
                onChange={e => setPricePoints(e.target.value)}
                placeholder="Preț în puncte (ex: 150)"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setSellCardId(null); setPricePoints(''); }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={listing}
                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                {listing ? 'Se listează...' : 'Pune la Vânzare'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Details Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="relative w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:h-[500px]">
              <Image src={selectedCard.imageUrl} alt={selectedCard.name} fill className="object-cover" />
            </div>
            <div className="p-6 md:w-1/2 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="text-xs uppercase tracking-wider font-bold mb-2 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit" style={{
                color: selectedCard.rarity === 'legendar' ? '#f59e0b' : 
                       selectedCard.rarity === 'epic' ? '#a855f7' : 
                       selectedCard.rarity === 'bune' ? '#22c55e' : '#94a3b8'
              }}>
                {selectedCard.rarity}
              </div>
              <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">{selectedCard.name}</h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedCard.description || 'Acest cartonaș nu are o descriere momentan.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <button 
                  onClick={() => setSelectedCard(null)} 
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-bold text-sm border border-white/10"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
