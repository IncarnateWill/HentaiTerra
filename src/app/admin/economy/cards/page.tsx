'use client';

import { useState, useEffect } from 'react';
import { getCards, createCard, updateCard, deleteCard } from '@/actions/admin.economy.actions';
import toast from 'react-hot-toast';
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function AdminCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', imageUrl: '', rarity: 'simple', description: '', sellPricePoints: 0
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Poți încărca doar fișiere de tip imagine!');
      return;
    }

    setUploading(true);
    const uploaderFormData = new FormData();
    uploaderFormData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploaderFormData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast.success('Imagine încărcată cu succes!');
      } else {
        toast.error(data.error || 'Eroare la încărcarea imaginii');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Eroare de rețea la încărcare');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    try {
      const data = await getCards();
      setCards(data);
    } catch (e) {
      toast.error('Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await updateCard(editingCard._id, formData);
        toast.success('Cartonaș actualizat!');
      } else {
        await createCard(formData);
        toast.success('Cartonaș creat!');
      }
      setEditingCard(null);
      setFormData({ name: '', imageUrl: '', rarity: 'simple', description: '', sellPricePoints: 0 });
      loadCards();
    } catch (e) {
      toast.error('Eroare la salvare');
    }
  };

  const handleEdit = (c: any) => {
    setEditingCard(c);
    setFormData({ name: c.name, imageUrl: c.imageUrl, rarity: c.rarity, description: c.description || '', sellPricePoints: c.sellPricePoints || 0 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur?')) return;
    try {
      await deleteCard(id);
      toast.success('Cartonaș șters');
      loadCards();
    } catch {
      toast.error('Eroare la ștergere');
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Se încarcă...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestionare Cartonașe</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
          <h2 className="text-xl text-white mb-4">{editingCard ? 'Editează' : 'Creează'} Cartonaș</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nume</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Încarcă Imagine</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-lg p-4 text-center cursor-pointer bg-slate-800/40 hover:bg-purple-900/10 transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[120px] overflow-hidden"
                onClick={() => document.getElementById('card-image-file')?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-slate-400">Se încarcă...</span>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="flex flex-col items-center gap-2 w-full h-full relative">
                    <div className="relative w-16 h-20 rounded border border-slate-700 overflow-hidden shadow">
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-xs text-green-400 font-medium truncate max-w-[200px]">Imagine pregătită</span>
                    <span className="text-[10px] text-slate-500">Apasă pentru a schimba</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-slate-400 group-hover:text-purple-400 transition-colors" size={28} />
                    <span className="text-xs text-slate-300 font-medium">Apasă sau trage imaginea aici</span>
                    <span className="text-[10px] text-slate-500">Acceptă PNG, JPG, WebP</span>
                  </div>
                )}
                <input
                  id="card-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sau introduceți URL-ul imaginii</label>
              <input required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Raritate</label>
              <select value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                <option value="simple">Simple</option>
                <option value="bune">Bune (Verde)</option>
                <option value="epic">Epic</option>
                <option value="legendar">Legendar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Descriere</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Preț de Vânzare către Sistem (Puncte)</label>
              <input type="number" min="0" value={formData.sellPricePoints} onChange={e => setFormData({...formData, sellPricePoints: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div className="pt-4 flex gap-2">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                {editingCard ? <Edit size={16} /> : <Plus size={16} />} Salvează
              </button>
              {editingCard && (
                <button type="button" onClick={() => { setEditingCard(null); setFormData({name:'', imageUrl:'', rarity:'simple', description:'', sellPricePoints:0}); }} className="px-4 bg-slate-700 text-white rounded-lg">Anulează</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(c => (
            <div key={c._id} className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex flex-col group">
              <div className="aspect-[3/4] bg-slate-800 relative">
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-600" size={32} /></div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded text-[10px] font-bold uppercase border border-white/10 text-white">
                  {c.rarity}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-white text-sm line-clamp-1">{c.name}</h3>
                <div className="mt-auto pt-3 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(c)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 bg-red-500/20 text-red-400 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
