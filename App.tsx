
import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus } from './services/storage';
import { Booking } from './types';
import { NewBookingForm } from './components/NewBookingForm';
import { BookingList } from './components/BookingList';
import { InventoryManager } from './components/InventoryManager';
import { initEmailService, sendEmailNotification } from './services/email';
import { printBooking } from './services/print';

type View = 'DASHBOARD' | 'NEW_BOOKING';
type Tab = 'SAMPLES_OUT' | 'BOOKINGS' | 'HISTORY' | 'INVENTORY';

const App: React.FC = () => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [activeTab, setActiveTab] = useState<Tab>('SAMPLES_OUT');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getBookings();
        setBookings(data);
        initEmailService();
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [lastUpdated]);

  const handleCreateBooking = () => {
    setView('DASHBOARD');
    setActiveTab('SAMPLES_OUT');
    setLastUpdated(Date.now());
  };

  const handleReturn = async (id: string) => {
    if (window.confirm('Are you sure you want to mark these samples as returned?')) {
      await updateBookingStatus(id, 'RETURNED');
      setLastUpdated(Date.now());
      setActiveTab('HISTORY');

      const booking = bookings.find(b => b.id === id);
      if (booking) {
        sendEmailNotification(booking, 'RETURNED').catch(err => console.error(err));
      }
    }
  };

  const handleActivate = async (id: string) => {
    if (window.confirm('Are you sure you want to move this booking to "Samples Out"?')) {
      await updateBookingStatus(id, 'ACTIVE');
      setLastUpdated(Date.now());
      setActiveTab('SAMPLES_OUT');

      const booking = bookings.find(b => b.id === id);
      if (booking) {
        sendEmailNotification(booking, 'COLLECTED').catch(err => console.error(err));
      }
    }
  };

  const handlePrint = (booking: Booking) => {
    printBooking(booking);
  };

  const samplesOut = bookings.filter(b => b.status === 'ACTIVE').sort((a,b) => new Date(a.dateReturn).getTime() - new Date(b.dateReturn).getTime());
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').sort((a,b) => new Date(a.dateOut).getTime() - new Date(b.dateOut).getTime());
  const history = bookings.filter(b => b.status === 'RETURNED').sort((a,b) => new Date(b.dateReturn).getTime() - new Date(a.dateReturn).getTime());

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <div className="bg-white text-slate-900 font-bold p-1 rounded text-xs">ONE</div>
            <h1 className="text-xl font-bold tracking-tight">SPORT SAMPLE REGISTER</h1>
          </div>
          {view === 'DASHBOARD' && activeTab !== 'INVENTORY' && (
            <button 
              onClick={() => setView('NEW_BOOKING')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Booking
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'NEW_BOOKING' ? (
          <NewBookingForm 
            onComplete={handleCreateBooking} 
            onCancel={() => setView('DASHBOARD')} 
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab('SAMPLES_OUT')}
                className={`p-6 rounded-lg shadow-sm border cursor-pointer transition-all ${activeTab === 'SAMPLES_OUT' ? 'bg-white border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Samples Out</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{isLoading ? '...' : samplesOut.length}</div>
                <div className="text-xs text-gray-400 mt-1">Currently with clients</div>
              </div>
              <div 
                onClick={() => setActiveTab('BOOKINGS')}
                className={`p-6 rounded-lg shadow-sm border cursor-pointer transition-all ${activeTab === 'BOOKINGS' ? 'bg-white border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Upcoming Bookings</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{isLoading ? '...' : pendingBookings.length}</div>
                <div className="text-xs text-gray-400 mt-1">Reserved for future dates</div>
              </div>
              <div 
                onClick={() => setActiveTab('HISTORY')}
                className={`p-6 rounded-lg shadow-sm border cursor-pointer transition-all ${activeTab === 'HISTORY' ? 'bg-white border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Return History</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{isLoading ? '...' : history.length}</div>
                <div className="text-xs text-gray-400 mt-1">Completed jobs</div>
              </div>
              <div 
                onClick={() => setActiveTab('INVENTORY')}
                className={`p-6 rounded-lg shadow-sm border cursor-pointer transition-all ${activeTab === 'INVENTORY' ? 'bg-white border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inventory</div>
                <div className="mt-2 text-xl font-bold text-slate-900 flex items-center gap-2">Manage Kits</div>
                <div className="text-xs text-gray-400 mt-1">Edit / Add / Remove</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow min-h-[500px] p-6 border border-gray-200 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-slate-600">Syncing with Azure...</span>
                  </div>
                </div>
              )}

              {activeTab === 'SAMPLES_OUT' && (
                <BookingList 
                  title="Samples Out (Active)" 
                  bookings={samplesOut} 
                  onAction={handleReturn}
                  onPrint={handlePrint}
                  actionLabel="Mark Returned"
                  actionColorClass="bg-green-600 hover:bg-green-700 text-white"
                  emptyMessage="No samples are currently out with clients."
                />
              )}
              {activeTab === 'BOOKINGS' && (
                <BookingList 
                  title="Forward Bookings" 
                  bookings={pendingBookings} 
                  onAction={handleActivate}
                  onPrint={handlePrint}
                  actionLabel="Move to Samples Out"
                  actionColorClass="bg-blue-600 hover:bg-blue-700 text-white"
                  emptyMessage="No upcoming bookings found."
                />
              )}
              {activeTab === 'HISTORY' && (
                <BookingList 
                  title="Return History" 
                  bookings={history} 
                  onPrint={handlePrint}
                  emptyMessage="No history found."
                />
              )}
               {activeTab === 'INVENTORY' && (
                <InventoryManager />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
