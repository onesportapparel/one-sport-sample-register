
import React, { useState, useEffect } from 'react';
import { Booking, BookingType } from '../types';
import { saveBooking, generateId } from '../services/storage';
import { sendEmailNotification } from '../services/email';
import { KitSelector } from './KitSelector';
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, // Added missing import
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export const NewBookingForm: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [type, setType] = useState<BookingType>('IMMEDIATE');
  const [dateOut, setDateOut] = useState(new Date().toISOString().split('T')[0]);
  const [dateReturn, setDateReturn] = useState('');
  
  const [customer, setCustomer] = useState({
    organization: '',
    name: '',
    email: '',
    phone: ''
  });
  
  const [salesPerson, setSalesPerson] = useState<'Darryn Shannon' | 'Toby Keen'>('Darryn Shannon');
  const [notes, setNotes] = useState('');
  const [extraSamples, setExtraSamples] = useState('');
  const [selectedKitIds, setSelectedKitIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === 'IMMEDIATE') {
      setDateOut(new Date().toISOString().split('T')[0]);
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];

    if (!dateOut) newErrors.push("Deployment date is required");
    if (!dateReturn) newErrors.push("Return expectation is required");
    if (!customer.organization) newErrors.push("Entity name is required");
    if (!customer.name) newErrors.push("Primary contact is required");
    if (selectedKitIds.length === 0 && !extraSamples) newErrors.push("Selection required (Kit or Extras)");
    
    if (new Date(dateReturn) < new Date(dateOut)) {
        newErrors.push("Return date must succeed deployment date");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const newBooking: Booking = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      type,
      status: type === 'IMMEDIATE' ? 'ACTIVE' : 'PENDING',
      dateOut,
      dateReturn,
      customer,
      salesPerson,
      notes,
      extraSamples,
      kitIds: selectedKitIds
    };

    saveBooking(newBooking);
    await sendEmailNotification(newBooking, 'CREATED');

    setIsSubmitting(false);
    onComplete();
  };

  const inputClass = "w-full border-2 border-slate-100 rounded-2xl p-3.5 bg-slate-50 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-400 text-sm font-medium";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2";

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden max-w-6xl mx-auto my-6">
      <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter italic">Create Booking</h2>
          <p className="text-slate-400 mt-2 font-medium">Provision sizing kits for field deployment.</p>
        </div>
        <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all relative z-10">
          <X className="w-6 h-6" />
        </button>
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="p-10">
        {errors.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-6 rounded-3xl mb-10 flex gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="bg-rose-600 text-white p-2 rounded-xl h-fit shadow-lg shadow-rose-200">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest mb-2">Review Required</p>
              <ul className="list-disc pl-5 text-sm space-y-1 font-medium">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-14">
          {/* Section 1: Logistics Mode */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">01. Logistics Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'IMMEDIATE', title: 'On-Site', desc: 'Direct showroom handover' },
                { id: 'COLLECTION', title: 'Pickup', desc: 'Client collect scheduled' },
                { id: 'DELIVERY', title: 'Courier', desc: 'External freight required' }
              ].map((m) => (
                <label key={m.id} className={`
                  cursor-pointer border-2 rounded-3xl p-6 transition-all relative flex flex-col gap-1
                  ${type === m.id ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100 translate-y-[-4px]' : 'border-slate-100 hover:border-slate-200'}
                `}>
                  <input type="radio" name="type" value={m.id} checked={type === m.id} onChange={() => setType(m.id as BookingType)} className="hidden" />
                  <span className={`text-sm font-black uppercase tracking-widest ${type === m.id ? 'text-indigo-700' : 'text-slate-400'}`}>{m.title}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{m.desc}</span>
                  {type === m.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-indigo-600" />}
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Scheduling & Responsibility */}
          <div className="space-y-6">
             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">02. Schedule & Staff</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                 <label className={labelClass}><Calendar className="w-3 h-3" /> Start Date</label>
                 <input type="date" readOnly={type === 'IMMEDIATE'} value={dateOut} onChange={(e) => setDateOut(e.target.value)} className={`${inputClass} ${type === 'IMMEDIATE' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`} />
               </div>
               <div className="space-y-2">
                 <label className={labelClass}><Clock className="w-3 h-3" /> Return Expectation</label>
                 <input type="date" value={dateReturn} onChange={(e) => setDateReturn(e.target.value)} className={inputClass} />
               </div>
               <div className="space-y-2">
                 <label className={labelClass}><User className="w-3 h-3" /> Lead Representative</label>
                 <select value={salesPerson} onChange={(e) => setSalesPerson(e.target.value as any)} className={inputClass}>
                   <option value="Darryn Shannon">Darryn Shannon</option>
                   <option value="Toby Keen">Toby Keen</option>
                 </select>
               </div>
             </div>
          </div>

          {/* Section 3: Entity Details */}
          <div className="bg-slate-50 rounded-[2rem] p-10 space-y-8 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">03. Entity Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClass}><Building2 className="w-3 h-3" /> Organization</label>
                <input type="text" value={customer.organization} onChange={(e) => setCustomer({...customer, organization: e.target.value})} className={inputClass} placeholder="Club, School or Corporate Name" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><User className="w-3 h-3" /> Contact Name</label>
                <input type="text" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className={inputClass} placeholder="Primary Stakeholder" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><Mail className="w-3 h-3" /> Email Address</label>
                <input type="email" value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} className={inputClass} placeholder="official@email.com" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><Phone className="w-3 h-3" /> Secure Phone</label>
                <input type="tel" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className={inputClass} placeholder="0400 000 000" />
              </div>
            </div>
          </div>

          {/* Section 4: Kit Selection */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">04. Kit Configuration</h3>
            <KitSelector 
              selectedKitIds={selectedKitIds}
              onChange={setSelectedKitIds}
              dateOut={dateOut}
              dateReturn={dateReturn}
            />
          </div>

          {/* Section 5: Metadata & Overlays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClass}><FileText className="w-3 h-3" /> Non-Register Overlays</label>
              <textarea rows={3} value={extraSamples} onChange={(e) => setExtraSamples(e.target.value)} className={inputClass} placeholder="Describe any loose samples or one-off items..." />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><FileText className="w-3 h-3" /> Internal Operational Notes</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Add any specific instructions for this deployment..." />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : 'Finalize Booking'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
