
import React, { useState } from 'react';
import { Booking } from '../types';
import { 
  Search, 
  ChevronRight, 
  Printer, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Layers,
  ArrowRightCircle,
  Clock,
  ExternalLink,
  Package // Added missing import
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  title: string;
  onAction?: (bookingId: string) => void;
  onPrint?: (booking: Booking) => void;
  actionLabel?: string;
  actionColorClass?: string;
  emptyMessage: string;
}

export const BookingList: React.FC<Props> = ({ 
  bookings, 
  title, 
  onAction, 
  onPrint,
  actionLabel, 
  actionColorClass = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
  emptyMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = bookings.filter(b => {
    const s = searchTerm.toLowerCase();
    return (
      b.customer.organization.toLowerCase().includes(s) ||
      b.customer.name.toLowerCase().includes(s) ||
      b.id.includes(s) ||
      b.kitIds.some(k => k.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{title}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{filtered.length} Sequential Records</p>
        </div>
        <div className="relative w-full md:w-80 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
           <input 
            type="text" 
            placeholder="Search Records..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 transition-all outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-4 pl-8 pr-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity / Client</th>
                <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Status</th>
                <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</th>
                <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assets</th>
                <th scope="col" className="relative py-4 pl-3 pr-8">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filtered.map((booking) => (
                <React.Fragment key={booking.id}>
                  <tr className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedId === booking.id ? 'bg-indigo-50/30' : ''}`} onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}>
                    <td className="whitespace-nowrap py-6 pl-8 pr-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                            {booking.customer.organization.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-900 tracking-tight">{booking.customer.organization}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{booking.customer.name}</div>
                         </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                           <Clock className="w-3 h-3 text-emerald-500" />
                           <span className="uppercase tracking-widest">Dep:</span> {booking.dateOut}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                           <ArrowRightCircle className="w-3 h-3 text-rose-500" />
                           <span className="uppercase tracking-widest">Ret:</span> 
                           <span className={new Date(booking.dateReturn) < new Date() && booking.status !== 'RETURNED' ? 'text-rose-600 font-black' : ''}>
                             {booking.dateReturn}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-6">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest
                        ${booking.type === 'IMMEDIATE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          booking.type === 'DELIVERY' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                        {booking.type}
                      </span>
                    </td>
                    <td className="px-3 py-6">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        {booking.kitIds.length} Sizing Kits
                        {booking.extraSamples && <span className="text-indigo-600 bg-indigo-50 px-1.5 rounded-md font-black">+EXT</span>}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-6 pl-3 pr-8 text-right">
                       <div className="flex justify-end items-center gap-3">
                         {onPrint && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onPrint(booking); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm"
                              title="Print Provisioning Sheet"
                            >
                              <Printer className="w-5 h-5" />
                            </button>
                         )}
                         
                         {onAction && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); onAction(booking.id); }}
                             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${actionColorClass}`}
                           >
                             {actionLabel}
                           </button>
                         )}
                         <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${expandedId === booking.id ? 'rotate-90 text-indigo-400' : ''}`} />
                       </div>
                    </td>
                  </tr>
                  {expandedId === booking.id && (
                    <tr className="bg-slate-50/50 cursor-default animate-in fade-in duration-300">
                      <td colSpan={5} className="px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 flex items-center gap-2">
                                <Package className="w-3 h-3" /> Asset Inventory
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.kitIds.map(id => (
                                  <span key={id} className="bg-white border-2 border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-700 shadow-sm">
                                    KIT {id.split('-')[1] || id} 
                                  </span>
                                ))}
                              </div>
                              {booking.extraSamples && (
                                <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-slate-100 text-xs italic text-slate-600 leading-relaxed shadow-sm">
                                  <span className="not-italic font-black block mb-1 uppercase text-[9px] text-indigo-600 tracking-widest">Loose Items:</span>
                                  {booking.extraSamples}
                                </div>
                              )}
                           </div>
                           
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 flex items-center gap-2">
                                <User className="w-3 h-3" /> Contact Information
                              </h4>
                              <div className="space-y-3">
                                 <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {booking.customer.email}
                                 </div>
                                 <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {booking.customer.phone}
                                 </div>
                                 <div className="flex items-center gap-3 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full">
                                    <User className="w-3 h-3" />
                                    REP: {booking.salesPerson}
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 flex items-center gap-2">
                                <ExternalLink className="w-3 h-3" /> Operational Context
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm min-h-[80px]">
                                {booking.notes || 'No specific operational notes provided.'}
                              </p>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
