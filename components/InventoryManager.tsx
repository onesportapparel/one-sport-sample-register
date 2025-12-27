
import React, { useState, useEffect } from 'react';
import { getKits, addKit, deleteKit, updateKit, checkAvailability, generateId } from '../services/storage';
import { Kit, KitAvailability } from '../types';

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
    if (window.confirm(`Are you sure you want to remove this kit from the register?`)) {
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

  const inputClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg shadow border transition-colors ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-blue-100'}`}>
        <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${editingId ? 'text-yellow-800' : 'text-gray-900'}`}>
          {editingId ? 'Edit Kit' : 'Add New Kit'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
          <div className="col-span-1">
            <label className={labelClass}>Kit #</label>
            <input type="text" required value={formKit.kitNumber} onChange={(e) => setFormKit({...formKit, kitNumber: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-1">
            <label className={labelClass}>Supplier</label>
            <input type="text" value={formKit.supplier} onChange={(e) => setFormKit({...formKit, supplier: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-1 md:col-span-2">
             <label className={labelClass}>Category</label>
             <input type="text" required value={formKit.category} onChange={(e) => setFormKit({...formKit, category: e.target.value})} className={inputClass} />
          </div>
           <div className="col-span-1 md:col-span-2 lg:col-span-3">
             <label className={labelClass}>Description</label>
             <input type="text" value={formKit.description} onChange={(e) => setFormKit({...formKit, description: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-1 md:col-span-2">
             <label className={labelClass}>Sizes</label>
             <input type="text" value={formKit.sizes} onChange={(e) => setFormKit({...formKit, sizes: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-1">
             <label className={labelClass}>Bay</label>
             <input type="text" value={formKit.bay} onChange={(e) => setFormKit({...formKit, bay: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <button type="submit" disabled={isLoading} className={`w-full text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-slate-900 hover:bg-slate-800'} disabled:opacity-50`}>
              {editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
          <h3 className="text-lg font-bold text-gray-900">Inventory Catalog</h3>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm w-full md:w-64" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category / Desc</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {filteredKits.map(kit => (
                <tr key={kit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{kit.kitNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{kit.category}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{kit.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {availability[kit.id]?.isAvailable ? (
                      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">Available</span>
                    ) : (
                      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">Out</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <button onClick={() => handleEdit(kit)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(kit.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
