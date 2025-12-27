
import React, { useState, useEffect } from 'react';
import { getKits, addKit, deleteKit, updateKit, checkAvailability, generateId } from '../services/storage';
import { Kit, KitAvailability } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  MapPin, 
  Layers,
  Save,
  RotateCcw
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availability, setAvailability] = useState<Record<string, KitAvailability>>({});

  const [formKit, setFormKit] = useState<Partial<Kit>>({
    kitNumber: '',
    supplier: '',
    category: '',
    description: '',
    bay: '',
    sizes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getKits();
      setKits(data);
      const today = new Date().toISOString().split('T')[0];
      const avail = await checkAvailability(today, today);
      setAvailability(avail);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formKit.kitNumber && formKit.category) {
      setIsLoading(true);
      if (editingId) {
        const updated: Kit = {
          id: editingId,
          kitNumber: formKit.kitNumber || '',
          supplier: formKit.supplier || '',
          category: formKit.category || '',
          description: formKit.description || '',
          bay: formKit.bay || '',
          sizes: formKit.sizes || ''
        };
        await updateKit(updated);
        setEditingId(null);
      } else {
        const newKit: Kit = {
          id: generateId(),
          kitNumber: formKit.kitNumber || '',
          supplier: formKit.supplier || '',
          category: formKit.category || '',
          description: formKit.description || '',
          bay: formKit.bay || '',
          sizes: formKit.sizes || ''
        };
        await addKit(newKit);
      }

      setFormKit({ kitNumber: '', supplier: '', category: '', description: '', bay: '', sizes: '' });
      await loadData();
    }
  };

  const handleEdit = (kit: Kit) => {
    setEditingId(kit.id);
    setFormKit({ ...kit });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to remove this asset from the registry?`)) {
      setIsLoading(true);
      await deleteKit(id);
      await loadData();
    }
  };

  const filteredKits = kits.filter(k => 
    k.kitNumber.toLowerCase().includes(search.toLowerCase()) || 
    k.category.toLowerCase().includes(search.toLowerCase()) ||
    k.description.toLowerCase().includes(search.toLowerCase()) || 
    k.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "block w-full rounded-2xl border-2 border-slate-100 p-3 bg-slate-50 text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5";

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Dynamic CRUD Interface */}
      <div className={`p-10 rounded-[2.5rem] border-2 transition-all shadow-xl ${editingId ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex justify-between items-center mb-8">
           <h3 className={`text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 ${editingId ? 'text-indigo-900' : 'text-slate-900'}`}>
             {editingId ? <RotateCcw className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
             {editingId ? 'Modify Asset' : 'Register New Asset'}
           </h3>
           {editingId && (
             <button onClick={() => { setEditingId(null); setFormKit({ kitNumber: '', supplier: '', category: '', description: '', bay: '', sizes: '' }); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600">Cancel Override</button>
           )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 items-end">
          <div className="col-span-1">
            <label className={labelClass}><Tag className="w-3 h-3" /> Kit No.</label>
            <input type="text" required value={formKit.kitNumber} onChange={(e) => setFormKit({...formKit, kitNumber: e.target.value})} className={inputClass} placeholder="001" />
          </div>
          <div className="col-span-1">
            <label className={labelClass}><Layers className="w-3 h-3" /> Supplier</label>
            <input type="text" value={formKit.supplier} onChange={(e) => setFormKit({...formKit, supplier: e.target.value})} className={inputClass} placeholder="Brand" />
          </div>
          <div className="col-span-1 md:col-span-2">
             <label className={labelClass}><Layers className="w-3 h-3" /> Category</label>
             <input type="text" required value={formKit.category} onChange={(e) => setFormKit({...formKit, category: e.target.value})} className={inputClass} placeholder="e.g. Polos, Hoodies" />
          </div>
           <div className="col-span-1 md:col-span-2 lg:col-span-3">
             <label className={labelClass}>Description</label>
             <input type="text" value={formKit.description} onChange={(e) => setFormKit({...formKit, description: e.target.value})} className={inputClass} placeholder="Full product title" />
          </div>
          <div className="col-span-1 md:col-span-2">
             <label className={labelClass}>Configuration</label>
             <input type="text" value={formKit.sizes} onChange={(e) => setFormKit({...formKit, sizes: e.target.value})} className={inputClass} placeholder="Sizes included" />
          </div>
          <div className="col-span-1">
             <label className={labelClass}><MapPin className="w-3 h-3" /> Bay</label>
             <input type="text" value={formKit.bay} onChange={(e) => setFormKit({...formKit, bay: e.target.value})} className={inputClass} placeholder="Loc." />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <button type="submit" disabled={isLoading} className={`w-full h-[48px] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}>
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>

      {/* Inventory Registry Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-6">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Operational Catalog</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Asset Ledger</p>
          </div>
          <div className="relative w-full md:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
             <input type="text" placeholder="Filter Assets..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-indigo-600 transition-all outline-none" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset ID</th>
                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification / Title</th>
                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Controls</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredKits.map(kit => (
                <tr key={kit.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                     <span className="text-lg font-black text-slate-900 italic">#{kit.kitNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{kit.category}</div>
                    <div className="text-sm font-bold text-slate-700">{kit.description}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">Sizes: {kit.sizes}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {availability[kit.id]?.isAvailable ? (
                      <span className="px-3 py-1.5 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">Available</span>
                    ) : (
                      <span className="px-3 py-1.5 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full bg-rose-50 text-rose-700 border border-rose-100 shadow-sm">In-Field</span>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right font-medium">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(kit)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm" title="Modify Asset">
                         <Edit3 className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleDelete(kit.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm" title="Remove Asset">
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
