
import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, getStorageStatus } from './services/storage';
import { Booking } from './types';
import { NewBookingForm } from './components/NewBookingForm';
import { BookingList } from './components/BookingList';
import { InventoryManager } from './components/InventoryManager';
import { initEmailService, sendEmailNotification } from './services/email';
import { printBooking } from './services/print';
import { 
  Plus, 
  Package, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Archive,
  Layers,
  Activity,
  WifiOff
} from 'lucide-react';

type View = 'DASHBOARD' | 'NEW_BOOKING';
type Tab = 'SAMPLES_OUT' | 'BOOKINGS' | 'HISTORY' | 'INVENTORY';

const App: React.FC = () => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [activeTab, setActiveTab] = useState<Tab>('SAMPLES_OUT');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getBookings();
        setBookings(data);
        setIsCloudConnected(getStorageStatus());
        initEmailService();
      } catch (error) {
        console.error("Failed to load bookings", error);
        setIsCloudConnected(false);
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
    if (window.confirm('Mark these samples as returned to inventory?')) {
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
    if (window.confirm('Move this booking to active "Samples Out"?')) {
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
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      {/* Dynamic Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 px-6 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('DASHBOARD')}>
            <div className={`w-2 h-8 rounded-sm -skew-x-12 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)] ${isCloudConnected ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-rose-500 group-hover:bg-rose-400'}`}></div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              One Sport <span className="text-slate-500">Kit Register</span>
            </h1>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
             {isCloudConnected ? (
               <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-white/10">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Cloud Synced
               </div>
             ) : (
               <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-white/10" title="Data is saving to this browser only">
                  <ShieldAlert className="w-3 h-3 text-rose-500" />
                  <span className="text-rose-400">Local Only (Unsynced)</span>
               </div>
             )}
             <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Activity className="w-3 h-3 text-indigo-400" />
                Ops v2.4
             </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLastUpdated(Date.now())}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Refresh Registry"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {view === 'DASHBOARD' && (
            <button 
              onClick={() => setView('NEW_BOOKING')}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!isCloudConnected && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
               <WifiOff className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-sm font-black text-rose-700 uppercase tracking-wide">Sync Issue Detected</h4>
               <p className="text-xs text-rose-600 font-medium">The application is running in local fallback mode. Changes made on this device will NOT be visible to other users until the cloud connection is restored.</p>
             </div>
          </div>
        )}

        {view === 'NEW_BOOKING' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <NewBookingForm 
              onComplete={handleCreateBooking} 
              onCancel={() => setView('DASHBOARD')} 
            />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'SAMPLES_OUT', label: 'Samples Out', count: samplesOut.length, icon: Package, color: 'indigo', desc: 'Active in Field' },
                { id: 'BOOKINGS', label: 'Reservations', count: pendingBookings.length, icon: Clock, color: 'amber', desc: 'Upcoming Queue' },
                { id: 'HISTORY', label: 'Registry', count: history.length, icon: Archive, color: 'emerald', desc: 'Past Returns' },
                { id: 'INVENTORY', label: 'Catalog', count: 'v1.0', icon: Layers, color: 'slate', desc: 'Sizing Kits' }
              ].map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setActiveTab(card.id as Tab)}
                  className={`
                    p-6 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden group
                    ${activeTab === card.id 
                      ? 'bg-white border-indigo-600 shadow-2xl -translate-y-1' 
                      : 'bg-white border-transparent hover:border-slate-200 shadow-sm hover:shadow-md'}
                  `}
                >
                  <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</div>
                  <div className="mt-1 text-3xl font-black text-slate-900 tracking-tighter">{isLoading ? '...' : card.count}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{card.desc}</div>
                  
                  {activeTab === card.id && (
                    <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-indigo-50 rounded-full opacity-50 blur-xl"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 min-h-[600px] p-10 relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Records</span>
                </div>
              )}

              {activeTab === 'SAMPLES_OUT' && (
                <BookingList 
                  title="Field Operations" 
                  bookings={samplesOut} 
                  onAction={handleReturn}
                  onPrint={handlePrint}
                  actionLabel="Confirm Return"
                  actionColorClass="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                  emptyMessage="No samples currently in field operations."
                />
              )}
              {activeTab === 'BOOKINGS' && (
                <BookingList 
                  title="Forward Queue" 
                  bookings={pendingBookings} 
                  onAction={handleActivate}
                  onPrint={handlePrint}
                  actionLabel="Mark as Out"
                  actionColorClass="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                  emptyMessage="The forward booking queue is empty."
                />
              )}
              {activeTab === 'HISTORY' && (
                <BookingList 
                  title="Archives" 
                  bookings={history} 
                  onPrint={handlePrint}
                  emptyMessage="Historical archive is currently empty."
                />
              )}
               {activeTab === 'INVENTORY' && (
                <InventoryManager />
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto px-6 pb-12">
        <div className="border-t border-slate-200 pt-8 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div>&copy; {new Date().getFullYear()} One Sport Internal Operations</div>
           <div className="flex gap-4">
              <span className="hover:text-indigo-600 cursor-pointer">Security Policy</span>
              <span className="hover:text-indigo-600 cursor-pointer">Audit Logs</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
