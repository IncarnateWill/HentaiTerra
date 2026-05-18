'use client';

import { useState, useEffect } from 'react';
import { getLootboxesAdmin, createLootbox, updateLootbox, deleteLootbox } from '@/actions/admin.economy.actions';
import toast from 'react-hot-toast';
import { Save, Plus, Trash, Edit, Check, X, Coins, Percent, Image as ImageIcon, Box } from 'lucide-react';
import Image from 'next/image';

interface ILootbox {
  _id?: string;
  name: string;
  iconUrl: string;
  pricePoints?: number;
  priceMoney?: number;
  cardsCount: number;
  active: boolean;
  rarities: { rarity: 'simple' | 'bune' | 'epic' | 'legendar'; chance: number }[];
}

const DEFAULT_LOOTBOX: ILootbox = {
  name: '',
  iconUrl: '',
  pricePoints: 100,
  priceMoney: undefined,
  cardsCount: 1,
  active: true,
  rarities: [
    { rarity: 'simple', chance: 70 },
    { rarity: 'bune', chance: 20 },
    { rarity: 'epic', chance: 8 },
    { rarity: 'legendar', chance: 2 },
  ]
};

export default function AdminShopConfigPage() {
  const [lootboxes, setLootboxes] = useState<ILootbox[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [form, setForm] = useState<ILootbox>(DEFAULT_LOOTBOX);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLootboxes();
  }, []);

  async function loadLootboxes() {
    try {
      const data = await getLootboxesAdmin();
      setLootboxes(data);
    } catch (e) {
      toast.error('Eroare la încărcarea cutiilor.');
    } finally {
      setLoading(false);
    }
  }

  const handleRarityChanceChange = (rarity: string, chanceVal: string) => {
    const val = parseInt(chanceVal) || 0;
    setForm({
      ...form,
      rarities: form.rarities.map(r => r.rarity === rarity ? { ...r, chance: val } : r)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rarity chances sum to 100
    const totalChance = form.rarities.reduce((sum, r) => sum + r.chance, 0);
    if (totalChance !== 100) {
      toast.error(`Suma procentelor trebuie să fie fix 100%. În prezent este ${totalChance}%.`);
      return;
    }

    if (!form.pricePoints && !form.priceMoney) {
      toast.error('Trebuie să specificați cel puțin un cost în puncte sau bani.');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await updateLootbox(editId, form);
        toast.success('Cutie actualizată cu succes!');
        setLootboxes(lootboxes.map(l => l._id === editId ? res : l));
      } else {
        const res = await createLootbox(form);
        toast.success('Cutie creată cu succes!');
        setLootboxes([res, ...lootboxes]);
      }
      resetForm();
    } catch (err) {
      toast.error('Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lootbox: ILootbox) => {
    setEditId(lootbox._id || null);
    // Align rarities list in case of missing rarities in schema
    const alignedRarities = DEFAULT_LOOTBOX.rarities.map(dr => {
      const existing = lootbox.rarities.find(r => r.rarity === dr.rarity);
      return existing ? { rarity: dr.rarity, chance: existing.chance } : { rarity: dr.rarity, chance: 0 };
    });

    setForm({
      name: lootbox.name,
      iconUrl: lootbox.iconUrl,
      pricePoints: lootbox.pricePoints,
      priceMoney: lootbox.priceMoney,
      cardsCount: lootbox.cardsCount || 1,
      active: lootbox.active !== undefined ? lootbox.active : true,
      rarities: alignedRarities as any
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această cutie?')) return;
    try {
      await deleteLootbox(id);
      toast.success('Cutie ștearsă.');
      setLootboxes(lootboxes.filter(l => l._id !== id));
    } catch (err) {
      toast.error('Eroare la ștergere.');
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_LOOTBOX);
    setEditId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center text-white">Se încarcă...</div>;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto mt-20">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="text-purple-500" />
            Configurare Chest-uri și Lootbox-uri
          </h1>
          <p className="text-xs text-slate-400 mt-1">Creează și configurează cuferele de cartonașe disponibile în shop.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors text-xs"
          >
            <Plus size={16} /> Adaugă Lootbox Nou
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-900/60 p-6 rounded-2xl border border-purple-500/20 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white tracking-wider">
              {editId ? 'EDITEAZĂ LOOTBOX' : 'CREEAZĂ LOOTBOX NOU'}
            </h2>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nume Chest</label>
                <input 
                  type="text" 
                  required
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" 
                  placeholder="ex: Cufăr Epopeic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">URL Iconiță Chest</label>
                <div className="flex gap-3">
                  <input 
                    type="url" 
                    required
                    value={form.iconUrl} 
                    onChange={e => setForm({ ...form, iconUrl: e.target.value })} 
                    className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" 
                    placeholder="https://exemplu.com/imagine.png"
                  />
                  {form.iconUrl && (
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-slate-700 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.iconUrl} alt="Lootbox preview" className="object-contain w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Cost Puncte</label>
                  <input 
                    type="number" 
                    value={form.pricePoints || ''} 
                    onChange={e => setForm({ ...form, pricePoints: parseInt(e.target.value) || undefined })} 
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" 
                    placeholder="ex: 150"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Cost Bani (Lei)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.priceMoney || ''} 
                    onChange={e => setForm({ ...form, priceMoney: parseFloat(e.target.value) || undefined })} 
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" 
                    placeholder="ex: 9.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Număr Cartonașe Extrase</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={form.cardsCount} 
                    onChange={e => setForm({ ...form, cardsCount: parseInt(e.target.value) || 1 })} 
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Stare Cutie</label>
                  <select 
                    value={form.active ? "true" : "false"}
                    onChange={e => setForm({ ...form, active: e.target.value === "true" })}
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="true">Activă în Magazin</option>
                    <option value="false">Inactivă / Ascunsă</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rarities drop distribution */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Percent size={16} className="text-purple-400" />
                Distribuție Șanse Rarități (Total: 100%)
              </h3>

              <div className="space-y-3">
                {form.rarities.map(r => (
                  <div key={r.rarity} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold capitalize">
                      <span className={
                        r.rarity === 'simple' ? 'text-gray-400' :
                        r.rarity === 'bune' ? 'text-green-400' :
                        r.rarity === 'epic' ? 'text-purple-400' : 'text-amber-400'
                      }>{r.rarity}</span>
                      <span className="text-slate-300">{r.chance}%</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={r.chance} 
                        onChange={e => handleRarityChanceChange(r.rarity, e.target.value)}
                        className="flex-1 accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1.5"
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={r.chance} 
                        onChange={e => handleRarityChanceChange(r.rarity, e.target.value)}
                        className="w-16 bg-slate-800 text-center text-xs font-bold text-white rounded p-1 border border-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Badge */}
              <div className="pt-2">
                {(() => {
                  const total = form.rarities.reduce((sum, r) => sum + r.chance, 0);
                  const isPerfect = total === 100;
                  return (
                    <div className={`p-2 rounded-lg text-center text-xs font-bold ${isPerfect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {isPerfect ? '✓ Distribuție Validă (Suma este 100%)' : `✗ Distribuție Invalidă! Suma este ${total}% (Trebuie să fie 100%)`}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-800 pt-4 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-900/30 flex items-center gap-1.5"
            >
              <Save size={14} />
              {saving ? 'Se salvează...' : 'Salvează Setările'}
            </button>
          </div>
        </form>
      )}

      {/* List of Lootboxes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-1.5">
          Lista Lootbox-uri Curente ({lootboxes.length})
        </h2>

        {lootboxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lootboxes.map(l => {
              const totalChance = l.rarities.reduce((sum, r) => sum + r.chance, 0);
              return (
                <div key={l._id} className={`bg-slate-900/40 border ${l.active ? 'border-slate-800/80' : 'border-red-900/20 opacity-60'} rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/20 transition-all`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                          {l.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={l.iconUrl} alt={l.name} className="object-contain w-full h-full" />
                          ) : (
                            <span className="text-2xl">🎁</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm tracking-wide">{l.name}</h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${l.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {l.active ? 'Activă' : 'Dezactivată'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {l.cardsCount}x Card
                      </span>
                    </div>

                    {/* Cost Badge */}
                    <div className="flex items-center gap-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-slate-400 font-medium">Preț:</span>
                      <div className="flex gap-2 flex-wrap text-[11px] font-bold">
                        {l.pricePoints && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Coins size={12} /> {l.pricePoints} pct
                          </span>
                        )}
                        {l.priceMoney && (
                          <span className="text-green-400">
                            {l.priceMoney} Lei
                          </span>
                        )}
                        {!l.pricePoints && !l.priceMoney && (
                          <span className="text-slate-500">Gratis / Incomplet</span>
                        )}
                      </div>
                    </div>

                    {/* Rarity distributions list */}
                    <div className="space-y-1 bg-black/30 p-2.5 rounded-lg text-[10px] border border-white/5">
                      <span className="font-bold text-slate-400 block mb-1">Drop Rates:</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {l.rarities.map(r => (
                          <div key={r.rarity} className="flex justify-between items-center capitalize">
                            <span className={
                              r.rarity === 'simple' ? 'text-gray-400' :
                              r.rarity === 'bune' ? 'text-green-400' :
                              r.rarity === 'epic' ? 'text-purple-400' : 'text-amber-400'
                            }>{r.rarity}:</span>
                            <span className="text-slate-200 font-bold">{r.chance}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 border-t border-slate-800/80 pt-3 mt-3">
                    <button
                      onClick={() => handleEdit(l)}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <Edit size={12} /> Editează
                    </button>
                    <button
                      onClick={() => handleDelete(l._id!)}
                      className="flex-1 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/10"
                    >
                      <Trash size={12} /> Șterge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/20 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 font-medium">Nu există cufere create încă.</p>
          </div>
        )}
      </div>
    </div>
  );
}
