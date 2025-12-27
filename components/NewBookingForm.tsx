import React, { useState, useEffect } from 'react';
import { Booking, BookingType } from '../types';
import { saveBooking, generateId } from '../services/storage';
import { sendEmailNotification } from '../services/email';
import { KitSelector } from './KitSelector';

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

  // When type changes to IMMEDIATE, force dateOut to today
  useEffect(() => {
    if (type === 'IMMEDIATE') {
      setDateOut(new Date().toISOString().split('T')[0]);
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];

    if (!dateOut) newErrors.push("Start date is required");
    if (!dateReturn) newErrors.push("Return date is required");
    if (!customer.organization) newErrors.push("Organization is required");
    if (!customer.name) newErrors.push("Contact name is required");
    if (selectedKitIds.length === 0 && !extraSamples) newErrors.push("Please select at least one kit or add extra samples");
    
    if (new Date(dateReturn) < new Date(dateOut)) {
        newErrors.push("Return date cannot be before date out");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
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
    
    // Send email notification
    await sendEmailNotification(newBooking, 'CREATED');

    setIsSubmitting(false);
    onComplete();
  };

  const inputClass = "w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-800 mb-1";

  // Dynamic Label for Date Out
  const getDateOutLabel = () => {
    if (type === 'COLLECTION') return 'Date for Collection';
    if (type === 'DELIVERY') return 'Date for Delivery';
    return 'Date Out';
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-6xl mx-auto my-6 text-gray-900">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">New Sample Booking</h2>
          <p className="text-gray-600 mt-1">Fill in the details below to create a new reservation.</p>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8 shadow-sm">
          <p className="font-bold mb-1">Please fix the following errors:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Booking Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`
            cursor-pointer border-2 rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 h-24
            ${type === 'IMMEDIATE' ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}
          `}>
            <input type="radio" name="type" value="IMMEDIATE" checked={type === 'IMMEDIATE'} onChange={() => setType('IMMEDIATE')} className="hidden" />
            <span className="text-lg">Taken Immediately</span>
            <span className="text-xs font-normal opacity-75">Client is in showroom</span>
          </label>
          <label className={`
            cursor-pointer border-2 rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 h-24
            ${type === 'COLLECTION' ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}
          `}>
            <input type="radio" name="type" value="COLLECTION" checked={type === 'COLLECTION'} onChange={() => setType('COLLECTION')} className="hidden" />
            <span className="text-lg">Book for Collection</span>
            <span className="text-xs font-normal opacity-75">Client will pickup later</span>
          </label>
          <label className={`
            cursor-pointer border-2 rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 h-24
            ${type === 'DELIVERY' ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}
          `}>
            <input type="radio" name="type" value="DELIVERY" checked={type === 'DELIVERY'} onChange={() => setType('DELIVERY')} className="hidden" />
            <span className="text-lg">Book for Delivery</span>
            <span className="text-xs font-normal opacity-75">We need to ship it</span>
          </label>
        </div>

        {/* Dates & Sales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
            <label className={labelClass}>{getDateOutLabel()}</label>
            <input 
              type="date" 
              required
              readOnly={type === 'IMMEDIATE'}
              value={dateOut}
              onChange={(e) => setDateOut(e.target.value)}
              onClick={(e) => !e.currentTarget.readOnly && e.currentTarget.showPicker()}
              style={{ colorScheme: 'light' }}
              className={`${inputClass} ${type === 'IMMEDIATE' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
            />
          </div>
          <div>
            <label className={labelClass}>Date to Return</label>
            <input 
              type="date" 
              required
              value={dateReturn}
              onChange={(e) => setDateReturn(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker()}
              style={{ colorScheme: 'light' }}
              className={`${inputClass} cursor-pointer hover:bg-gray-50`}
            />
          </div>
          <div>
            <label className={labelClass}>Sales Person</label>
            <div className="relative">
              <select 
                value={salesPerson} 
                onChange={(e) => setSalesPerson(e.target.value as any)}
                className={inputClass}
              >
                <option value="Darryn Shannon">Darryn Shannon</option>
                <option value="Toby Keen">Toby Keen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Organization Name</label>
              <input 
                type="text" 
                required
                value={customer.organization}
                onChange={(e) => setCustomer({...customer, organization: e.target.value})}
                className={inputClass}
                placeholder="e.g. Western Bulldogs"
              />
            </div>
            <div>
              <label className={labelClass}>Contact Name</label>
              <input 
                type="text" 
                required
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input 
                type="email" 
                required
                value={customer.email}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
                className={inputClass}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input 
                type="tel" 
                required
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                className={inputClass}
                placeholder="04..."
              />
            </div>
          </div>
        </div>

        {/* Kit Selection */}
        <div className="bg-white">
          <KitSelector 
            selectedKitIds={selectedKitIds}
            onChange={setSelectedKitIds}
            dateOut={dateOut}
            dateReturn={dateReturn}
          />
        </div>

        {/* Extras & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Extra Samples (Non-Register)</label>
            <textarea 
              rows={3}
              value={extraSamples}
              onChange={(e) => setExtraSamples(e.target.value)}
              className={inputClass}
              placeholder="Describe items taken from showroom rack..."
            />
          </div>
          <div>
            <label className={labelClass}>Notes / Comments</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="General comments about this booking..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};