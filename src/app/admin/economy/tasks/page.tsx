'use client';

import { useState, useEffect } from 'react';
import { getTasksAdmin, createTask, updateTask, deleteTask } from '@/actions/admin.economy.actions';
import toast from 'react-hot-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', description: '', points: '', taskType: 'watch_episodes', 
    requiredEpisodes: '', difficulty: 'easy', premium: false, active: true, recurrence: 'none'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getTasksAdmin();
      setTasks(data);
    } catch (e) {
      toast.error('Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        points: parseInt(formData.points),
        taskType: formData.taskType,
        requiredEpisodes: formData.taskType === 'watch_episodes' ? parseInt(formData.requiredEpisodes) : null,
        difficulty: formData.difficulty,
        premium: formData.premium,
        active: formData.active,
        recurrence: formData.recurrence
      };

      if (editingTask) {
        await updateTask(editingTask._id, payload);
        toast.success('Misiune actualizată!');
      } else {
        await createTask(payload);
        toast.success('Misiune creată!');
      }
      setEditingTask(null);
      setFormData({ title: '', description: '', points: '', taskType: 'watch_episodes', requiredEpisodes: '', difficulty: 'easy', premium: false, active: true, recurrence: 'none' });
      loadTasks();
    } catch (e) {
      toast.error('Eroare la salvare');
    }
  };

  const handleEdit = (t: any) => {
    setEditingTask(t);
    setFormData({ 
      title: t.title, 
      description: t.description || '', 
      points: t.points?.toString() || '', 
      taskType: t.taskType, 
      requiredEpisodes: t.requiredEpisodes?.toString() || '', 
      difficulty: t.difficulty, 
      premium: t.premium || false, 
      active: t.active !== false,
      recurrence: t.recurrence || 'none'
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur?')) return;
    try {
      await deleteTask(id);
      toast.success('Misiune ștearsă');
      loadTasks();
    } catch {
      toast.error('Eroare la ștergere');
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Se încarcă...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestionare Misiuni (Tasks)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
          <h2 className="text-xl text-white mb-4">{editingTask ? 'Editează' : 'Creează'} Misiune</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Titlu Misiune</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Descriere</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" rows={2}></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Puncte Câștigate</label>
                <input required type="number" value={formData.points} onChange={e => setFormData({...formData, points: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tip Misiune</label>
                <select value={formData.taskType} onChange={e => setFormData({...formData, taskType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="watch_episodes">Urmărește Episoade</option>
                  <option value="custom">Personalizat</option>
                </select>
              </div>
            </div>

            {formData.taskType === 'watch_episodes' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nr. Episoade Necesare</label>
                <input required type="number" value={formData.requiredEpisodes} onChange={e => setFormData({...formData, requiredEpisodes: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Dificultate</label>
                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="easy">Ușor</option>
                  <option value="medium">Mediu</option>
                  <option value="hard">Greu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Recurență (Loop)</label>
                <select value={formData.recurrence} onChange={e => setFormData({...formData, recurrence: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="none">Niciuna (O singură dată)</option>
                  <option value="daily">Zilnic (Reset la 00:00)</option>
                  <option value="weekly">Săptămânal (Luni 00:00)</option>
                  <option value="monthly">Lunar (1 ale lunii)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                <input type="checkbox" checked={formData.premium} onChange={e => setFormData({...formData, premium: e.target.checked})} className="rounded bg-slate-800 border-slate-700" />
                Doar Premium?
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded bg-slate-800 border-slate-700" />
                Activă
              </label>
            </div>

            <div className="pt-4 flex gap-2">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                {editingTask ? <Edit size={16} /> : <Plus size={16} />} Salvează
              </button>
              {editingTask && (
                <button type="button" onClick={() => { setEditingTask(null); setFormData({title: '', description: '', points: '', taskType: 'watch_episodes', requiredEpisodes: '', difficulty: 'easy', premium: false, active: true, recurrence: 'none'}); }} className="px-4 bg-slate-700 text-white rounded-lg">Anulează</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          {tasks.map(t => (
            <div key={t._id} className={`bg-slate-900/50 p-4 rounded-xl border ${t.active ? 'border-slate-800' : 'border-red-900/50 opacity-75'} flex items-center justify-between`}>
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  {t.title} 
                  {t.premium && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] rounded uppercase">Premium</span>}
                  {t.recurrence !== 'none' && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded uppercase">{t.recurrence}</span>}
                </h3>
                <div className="text-sm text-slate-400 flex gap-4 mt-1">
                  <span>{t.points} Puncte</span>
                  <span>{t.taskType === 'watch_episodes' ? `Watch ${t.requiredEpisodes} Eps` : 'Custom'}</span>
                  <span className="capitalize">Dificultate: {t.difficulty}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(t)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Edit size={18} /></button>
                <button onClick={() => handleDelete(t._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
