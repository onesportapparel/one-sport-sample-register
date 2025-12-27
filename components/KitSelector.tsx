
import React, { useEffect, useState } from 'react';
import { getKits, checkAvailability } from '../services/storage';
import { Kit, KitAvailability } from '../types';

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

  const getStatusClasses = (kitId: string) => {
    if (!dateOut || !dateReturn) return 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
    
    const status = availabilityMap[kitId];
    if (selectedKitIds.includes(kitId)) {
      return 'bg-blue-600 text-white ring-2 ring-blue-300 border-blue-600 shadow-lg transform scale-[1.02] z-10';
    }
    if (!status?.isAvailable) {
      return 'bg-red-50 text-gray-400 cursor-not-allowed border-red-100 opacity-90';
    }
    return 'bg-white text-gray-900 hover:border-blue-500 cursor-pointer border-gray-300 shadow-sm hover:shadow-md';
  };

  if (loading && allKits.length === 0) {
    return <div className="py-20 text-center text-gray-500">Loading catalog...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <label className="block text-sm font-medium text-gray-900">Select Kits ({filteredKits.length} found)</label>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search catalog..." 
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 w-full"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-slate-50">
        {filteredKits.map(kit => {
          const status = availabilityMap[kit.id];
          const isSelected = selectedKitIds.includes(kit.id);
          const isDisabled = !status?.isAvailable && !isSelected;

          return (
            <div 
              key={kit.id}
              onClick={() => !isDisabled && toggleKit(kit.id)}
              className={`
                relative p-4 rounded-lg border text-sm transition-all select-none flex flex-col min-h-[160px]
                ${getStatusClasses(kit.id)}
              `}
              title={!status?.isAvailable ? status?.conflictReason : 'Available'}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-extrabold text-lg leading-none">{kit.kitNumber}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {kit.supplier}
                </span>
              </div>
              
              <div className="flex-grow">
                 <p className={`text-xs font-bold mb-1 uppercase ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>{kit.category}</p>
                 <p className={`text-sm leading-snug font-medium ${isSelected ? 'text-white' : 'text-gray-800'}`}>{kit.description}</p>
              </div>

              <div className={`mt-3 pt-3 border-t flex justify-between items-end text-xs ${isSelected ? 'border-blue-500' : 'border-gray-100'}`}>
                <div className="flex flex-col max-w-[70%]">
                  <span className={`text-[10px] uppercase ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>Sizes</span>
                  <span className="font-semibold break-words">{kit.sizes}</span>
                </div>
                {kit.bay && kit.bay !== '-' && (
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] uppercase ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>Bay</span>
                    <span className="font-mono font-bold">{kit.bay}</span>
                  </div>
                )}
              </div>
              
              {!status?.isAvailable && dateOut && dateReturn && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg border border-red-100 z-20">
                   <span className="text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded shadow-sm text-xs font-bold uppercase tracking-wider mb-1">BOOKED</span>
                   <span className="text-[10px] text-red-600 font-medium px-4 text-center truncate w-full">{status?.conflictReason}</span>
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
