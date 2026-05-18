'use client';

import { useState, useEffect } from 'react';
import { getRanks, createRank, updateRank, deleteRank } from '@/actions/admin.economy.actions';
import toast from 'react-hot-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminRanksPage() {
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRank, setEditingRank] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', color: '#ffffff', requiredPoints: '', priceMoney: '', isPremium: false
  });

  useEffect(() => {
    loadRanks();
  }, []);

  async function loadRanks() {
    try {
      const data = await getRanks();
      setRanks(data);
    } catch (e) {
      toast.error('Eroare la încărcarea rankurilor');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        color: formData.color,
        requiredPoints: formData.requiredPoints ? parseInt(formData.requiredPoints) : null,
        priceMoney: formData.priceMoney ? parseFloat(formData.priceMoney) : null,
        isPremium: formData.isPremium
      };

      if (editingRank) {
        await updateRank(editingRank._id, payload);
        toast.success('Rank actualizat!');
      } else {
        await createRank(payload);
        toast.success('Rank creat!');
      }
      setEditingRank(null);
      setFormData({ name: '', color: '#ffffff', requiredPoints: '', priceMoney: '', isPremium: false });
      loadRanks();
    } catch (e) {
      toast.error('Eroare la salvare');
    }
  };

  const handleEdit = (r: any) => {
    setEditingRank(r);
    setFormData({
      name: r.name,
      color: r.color,
      requiredPoints: r.requiredPoints?.toString() || '',
      priceMoney: r.priceMoney?.toString() || '',
      isPremium: r.isPremium || false
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur?')) return;
    try {
      await deleteRank(id);
      toast.success('Rank șters');
      loadRanks();
    } catch {
      toast.error('Eroare la ștergere');
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Se încarcă...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestionare Ranks</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
          <h2 className="text-xl text-white mb-4">{editingRank ? 'Editează' : 'Creează'} Rank</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nume Rank</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Culoare (HEX/Tailwind)</label>
              <input required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} className="rounded bg-slate-800 border-slate-700" />
              <label htmlFor="isPremium" className="text-sm text-slate-400">Este Premium? (Plătit)</label>
            </div>
            {!formData.isPremium ? (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Puncte Necesare (Auto-Atingere)</label>
                <input type="number" value={formData.requiredPoints} onChange={e => setFormData({...formData, requiredPoints: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Preț în Bani (Ex: 5 Euro)</label>
                <input type="number" step="0.01" value={formData.priceMoney} onChange={e => setFormData({...formData, priceMoney: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
            )}
            <div className="pt-4 flex gap-2">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                {editingRank ? <Edit size={16} /> : <Plus size={16} />} Salvează
              </button>
              {editingRank && (
                <button type="button" onClick={() => { setEditingRank(null); setFormData({name:'', color:'#ffffff', requiredPoints:'', priceMoney:'', isPremium:false}); }} className="px-4 bg-slate-700 text-white rounded-lg">Anulează</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          {ranks.map(r => (
            <div key={r._id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg" style={{ color: r.color }}>{r.name}</h3>
                <div className="text-sm text-slate-400 flex gap-4 mt-1">
                  <span>Tip: {r.isPremium ? 'Premium' : 'Gratuit'}</span>
                  {!r.isPremium && <span>Puncte Necesare: {r.requiredPoints || 0}</span>}
                  {r.isPremium && <span>Preț: {r.priceMoney} €</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(r)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Edit size={18} /></button>
                <button onClick={() => handleDelete(r._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
