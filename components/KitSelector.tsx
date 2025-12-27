
import React, { useEffect, useState } from 'react';
import { getKits, checkAvailability } from '../services/storage';
import { Kit, KitAvailability } from '../types';
import { Search, Package, MapPin, Check, AlertCircle } from 'lucide-react';

interface KitSelectorProps {
  selectedKitIds: string[];
  onChange: (ids: string[]) => void;
  dateOut: string;
  dateReturn: string;
}

export const KitSelector: React.FC<KitSelectorProps> = ({ 
  selectedKitIds, 
  onChange,
  dateOut,
  dateReturn
}) => {
  const [filter, setFilter] = useState('');
  const [allKits, setAllKits] = useState<Kit[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, KitAvailability>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const kits = await getKits();
      setAllKits(kits);
      
      if (dateOut && dateReturn) {
        const availability = await checkAvailability(dateOut, dateReturn);
        setAvailabilityMap(availability);
      }
      setLoading(false);
    };
    fetchData();
  }, [dateOut, dateReturn]);

  const toggleKit = (id: string) => {
    if (selectedKitIds.includes(id)) {
      onChange(selectedKitIds.filter(k => k !== id));
    } else {
      onChange([...selectedKitIds, id]);
    }
  };

  const filteredKits = allKits.filter(k => 
    k.kitNumber.toLowerCase().includes(filter.toLowerCase()) || 
    k.category.toLowerCase().includes(filter.toLowerCase()) ||
    k.description.toLowerCase().includes(filter.toLowerCase()) ||
    k.supplier.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <Package className="w-4 h-4 text-indigo-500" />
           Deploying {selectedKitIds.length} Assets
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Catalog..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 transition-all outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2">
        {filteredKits.map(kit => {
          const status = availabilityMap[kit.id];
          const isSelected = selectedKitIds.includes(kit.id);
          const isBooked = !status?.isAvailable;
          const isDisabled = isBooked && !isSelected;

          return (
            <div 
              key={kit.id}
              onClick={() => !isDisabled && toggleKit(kit.id)}
              className={`
                relative p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer select-none overflow-hidden flex flex-col min-h-[180px]
                ${isSelected 
                  ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 translate-y-[-2px]' 
                  : isBooked 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed' 
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xl font-black leading-none tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{kit.kitNumber}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {kit.supplier}
                </span>
              </div>
              
              <div className="flex-grow">
                 <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`}>{kit.category}</p>
                 <p className={`text-sm leading-tight font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{kit.description}</p>
              </div>

              <div className={`mt-4 pt-4 border-t flex justify-between items-end ${isSelected ? 'border-white/10' : 'border-slate-50'}`}>
                <div className="flex flex-col gap-1">
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>Configuration</span>
                   <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{kit.sizes}</span>
                </div>
                {kit.bay && kit.bay !== '-' && (
                  <div className={`flex items-center gap-1 text-[10px] font-black ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    <MapPin className="w-3 h-3" />
                    {kit.bay}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="absolute bottom-4 right-4 bg-white p-1 rounded-lg shadow-lg">
                   <Check className="w-4 h-4 text-indigo-600" />
                </div>
              )}

              {isBooked && !isSelected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/40 backdrop-blur-[2px]">
                   <div className="bg-rose-600 text-white p-2 rounded-xl shadow-xl mb-2 rotate-12">
                      <AlertCircle className="w-5 h-5" />
                   </div>
                   <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full shadow-sm">Deployed until {dateReturn}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
