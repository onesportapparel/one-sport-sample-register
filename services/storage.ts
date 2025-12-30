
import { Booking, Kit, KitAvailability, BookingStatus } from '../types';

const API_BASE = '/api';
const LS_KEYS = {
  KITS: 'os_kits_v1',
  BOOKINGS: 'os_bookings_v1'
};

// Track connection status
let isUsingCloud = false;

export const getStorageStatus = () => isUsingCloud;

// --- SEED DATA ---
const RAW_KITS = [
  { no: "001", sup: "TDP", cat: "Hoodies", desc: "001 Mixed ST PETERS Hoodies", bay: "BAY 8", size: "4-16, S-3XL" },
  { no: "002", sup: "TDP*", cat: "Hoodies", desc: "002 - ST PETERS MIXED", bay: "BAY 7", size: "6-16, XS-3XL" },
  // ... (Full list kept for fallback) ...
  { no: "96", sup: "TDP", cat: "Trackpants", desc: "96 MELBA Copeland", bay: "BAY 9", size: "G12,14 Ladies 6-20 and Mens 10-3XL" }
];

export const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return 'id-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// --- HELPER: Hybrid Cloud/Local Storage ---
const getFromLocal = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
};

const saveToLocal = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Kit Management ---

export const getKits = async (): Promise<Kit[]> => {
  try {
    const res = await fetch(`${API_BASE}/kits`);
    if (!res.ok) {
       console.error(`API Error: ${res.status} ${res.statusText}`);
       const contentType = res.headers.get("content-type");
       // If it's HTML, we hit the 404 fallback (API not deployed or wrong URL)
       if (contentType && contentType.indexOf("application/json") === -1) {
         throw new Error(`API Route Not Found (Received HTML)`);
       }
       throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();
    
    // API is working
    isUsingCloud = true;
    
    // Update local cache
    if (data.length > 0) {
      saveToLocal(LS_KEYS.KITS, data);
    }
    
    return data;
  } catch (e) {
    console.warn("Using LocalStorage for Kits due to:", e);
    isUsingCloud = false;
    let localData = getFromLocal<Kit>(LS_KEYS.KITS);
    
    // Auto-Seeding for LocalStorage
    if (localData.length === 0) {
      await importData(RAW_KITS);
      localData = getFromLocal<Kit>(LS_KEYS.KITS);
    }
    return localData;
  }
};

export const addKit = async (kit: Kit): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/kits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kit)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    isUsingCloud = true;
  } catch (e) {
    console.warn("API Write Failed - Saving Locally", e);
    isUsingCloud = false;
    const kits = getFromLocal<Kit>(LS_KEYS.KITS);
    kits.push(kit);
    saveToLocal(LS_KEYS.KITS, kits);
  }
};

export const importData = async (jsonData: any[]): Promise<number> => {
  let count = 0;
  for (const item of jsonData) {
    let kit: Kit;

    if (item.no || item.sup || item.cat) {
       kit = {
         id: generateId(),
         kitNumber: item.no || item.kitNumber || '?',
         supplier: item.sup || item.supplier || '',
         category: item.cat || item.category || '',
         description: item.desc || item.description || '',
         bay: item.bay || '',
         sizes: item.size || item.sizes || ''
       };
    } else {
       kit = { ...item, id: item.id || generateId() };
    }
    
    await addKit(kit);
    count++;
  }
  return count;
};

export const updateKit = async (updatedKit: Kit): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/kits/${updatedKit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedKit)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
    const kits = getFromLocal<Kit>(LS_KEYS.KITS);
    const index = kits.findIndex(k => k.id === updatedKit.id);
    if (index !== -1) {
      kits[index] = updatedKit;
      saveToLocal(LS_KEYS.KITS, kits);
    }
  }
};

export const deleteKit = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/kits/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
    const kits = getFromLocal<Kit>(LS_KEYS.KITS);
    const filtered = kits.filter(k => k.id !== id);
    saveToLocal(LS_KEYS.KITS, filtered);
  }
};

// --- Booking Management ---

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const res = await fetch(`${API_BASE}/bookings`);
    if (!res.ok) {
       console.error(`API Error: ${res.status} ${res.statusText}`);
       const contentType = res.headers.get("content-type");
       if (contentType && contentType.indexOf("application/json") === -1) throw new Error("API Route Not Found (Received HTML)");
       throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();
    isUsingCloud = true;
    if (data.length > 0) {
      saveToLocal(LS_KEYS.BOOKINGS, data);
    }
    return data;
  } catch (e) {
    console.warn("Using LocalStorage for Bookings:", e);
    isUsingCloud = false;
    return getFromLocal<Booking>(LS_KEYS.BOOKINGS);
  }
};

export const saveBooking = async (booking: Booking): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    isUsingCloud = true;
  } catch (e) {
    console.warn("API Write Failed - Saving Locally", e);
    isUsingCloud = false;
    const bookings = getFromLocal<Booking>(LS_KEYS.BOOKINGS);
    bookings.push(booking);
    saveToLocal(LS_KEYS.BOOKINGS, bookings);
  }
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
    const bookings = getFromLocal<Booking>(LS_KEYS.BOOKINGS);
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      saveToLocal(LS_KEYS.BOOKINGS, bookings);
    }
  }
};

export const checkAvailability = async (
  dateOut: string, 
  dateReturn: string
): Promise<Record<string, KitAvailability>> => {
  const [bookings, allKits] = await Promise.all([getBookings(), getKits()]);
  const availability: Record<string, KitAvailability> = {};
  
  const requestedStart = new Date(dateOut).getTime();
  const requestedEnd = new Date(dateReturn).getTime();

  allKits.forEach(kit => {
    availability[kit.id] = { kitId: kit.id, isAvailable: true };
  });

  bookings.forEach(booking => {
    if (booking.status === 'RETURNED') return;

    const existingStart = new Date(booking.dateOut).getTime();
    const existingEnd = new Date(booking.dateReturn).getTime();

    const isOverlapping = (requestedStart <= existingEnd) && (requestedEnd >= existingStart);

    if (isOverlapping) {
      booking.kitIds.forEach(bookedKitId => {
        if (availability[bookedKitId]) {
          availability[bookedKitId].isAvailable = false;
          availability[bookedKitId].conflictReason = `Booked until ${booking.dateReturn} (${booking.customer.organization})`;
        }
      });
    }
  });

  return availability;
};
