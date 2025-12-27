import React, { useState } from 'react';
import { Booking } from '../types';

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
  actionColorClass = "bg-blue-600 hover:bg-blue-700 text-white",
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">{title} <span className="text-sm font-normal text-gray-500 ml-2">({filtered.length} records)</span></h2>
        <div className="relative w-full md:w-64">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
           <input 
            type="text" 
            placeholder="Search bookings..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Organization</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dates</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kits</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map((booking) => (
                <React.Fragment key={booking.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer relative" onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {booking.customer.organization}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{booking.customer.name}</div>
                      <div className="text-xs">{booking.customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">OUT</span>
                        <span>{booking.dateOut}</span>
                        <span className="text-xs text-gray-400 mt-1">RET</span>
                        <span className={new Date(booking.dateReturn) < new Date() && booking.status !== 'RETURNED' ? 'text-red-600 font-bold' : ''}>
                          {booking.dateReturn}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                        ${booking.type === 'IMMEDIATE' ? 'bg-green-100 text-green-800' : 
                          booking.type === 'DELIVERY' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {booking.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="max-w-[150px] truncate" title={booking.kitIds.join(', ')}>
                        {booking.kitIds.length} kits
                        {booking.extraSamples && <span className="text-blue-600 ml-1 text-xs">(+extras)</span>}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                       <div className="flex justify-end items-center gap-2 relative z-10">
                         {/* Print Button */}
                         {onPrint && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPrint(booking);
                              }}
                              className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                              title="Print Booking Sheet"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                         )}
                         
                         {onAction && (
                           <button 
                             type="button"
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               onAction(booking.id);
                             }}
                             className={`rounded px-3 py-1.5 text-xs font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-transform active:scale-95 ${actionColorClass}`}
                           >
                             {actionLabel}
                           </button>
                         )}
                         <button 
                          type="button"
                          className="text-gray-400 p-1 hover:text-gray-600"
                          onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             setExpandedId(expandedId === booking.id ? null : booking.id);
                          }}
                         >
                           {expandedId === booking.id ? '▲' : '▼'}
                         </button>
                       </div>
                    </td>
                  </tr>
                  {expandedId === booking.id && (
                    <tr className="bg-gray-50 cursor-default" onClick={(e) => e.stopPropagation()}>
                      <td colSpan={6} className="px-4 py-4 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div>
                              <h4 className="font-bold text-gray-900 mb-2">Kits Included:</h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.kitIds.map(id => (
                                  <span key={id} className="inline-flex items-center rounded-md bg-white border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                                    {/* Display only kit number for compactness in admin view, detailed in print */}
                                    {/* We need to parse kit ID to get kit number if possible, or just show ID */}
                                    {id.split('-')[1] || id} 
                                  </span>
                                ))}
                              </div>
                              {booking.extraSamples && (
                                <div className="mt-3">
                                  <h4 className="font-bold text-gray-900">Extra Samples:</h4>
                                  <p className="text-gray-600 italic">{booking.extraSamples}</p>
                                </div>
                              )}
                           </div>
                           <div className="border-l pl-4 border-gray-200">
                              <div className="mb-2">
                                <span className="font-bold text-gray-900">Sales Person: </span>
                                <span className="text-gray-600">{booking.salesPerson}</span>
                              </div>
                              <div className="mb-2">
                                <span className="font-bold text-gray-900">Phone: </span>
                                <span className="text-gray-600">{booking.customer.phone}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">Notes:</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{booking.notes || 'No notes.'}</p>
                              </div>
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