
import { Booking, Kit, KitAvailability, BookingStatus } from '../types';

const API_BASE = '/api';
const LS_KEYS = {
  KITS: 'os_kits_v1',
  BOOKINGS: 'os_bookings_v1'
};

// Track connection status
let isUsingCloud = false;
let lastError = "";

export const getStorageStatus = () => isUsingCloud;
export const getConnectionError = () => lastError;

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

export const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return 'id-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// --- Kit Management ---

export const getKits = async (): Promise<Kit[]> => {
  let localData = getFromLocal<Kit>(LS_KEYS.KITS);
  
  try {
    const res = await fetch(`${API_BASE}/kits`);
    const contentType = res.headers.get("content-type");

    // Check if we got a valid JSON response from the API
    if (res.ok && contentType && contentType.includes("application/json")) {
      const cloudData = await res.json();
      
      // SUCCESS: We are connected to the cloud
      isUsingCloud = true;
      lastError = "";
      
      // Update local cache with fresh cloud data
      saveToLocal(LS_KEYS.KITS, cloudData);
      return cloudData;
    } else {
      throw new Error("API not reachable");
    }
  } catch (e) {
    // FAIL: Switch to offline mode
    console.warn("Cloud Sync Failed:", e);
    isUsingCloud = false;
    lastError = "Backend unreachable";
    return localData;
  }
};

export const addKit = async (kit: Kit): Promise<void> => {
  // 1. Optimistic UI Update (Save to local immediately)
  const kits = getFromLocal<Kit>(LS_KEYS.KITS);
  kits.push(kit);
  saveToLocal(LS_KEYS.KITS, kits);

  // 2. Try to Sync to Cloud
  try {
    const res = await fetch(`${API_BASE}/kits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kit)
    });
    if (res.ok) isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
    console.warn("Saved locally, upload failed.");
  }
};

export const updateKit = async (updatedKit: Kit): Promise<void> => {
  const kits = getFromLocal<Kit>(LS_KEYS.KITS);
  const index = kits.findIndex(k => k.id === updatedKit.id);
  if (index !== -1) {
    kits[index] = updatedKit;
    saveToLocal(LS_KEYS.KITS, kits);
  }

  try {
    await fetch(`${API_BASE}/kits/${updatedKit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedKit)
    });
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
  }
};

export const deleteKit = async (id: string): Promise<void> => {
  const kits = getFromLocal<Kit>(LS_KEYS.KITS);
  const filtered = kits.filter(k => k.id !== id);
  saveToLocal(LS_KEYS.KITS, filtered);

  try {
    await fetch(`${API_BASE}/kits/${id}`, { method: 'DELETE' });
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
  }
};

export const importData = async (jsonData: any[]): Promise<number> => {
  let count = 0;
  for (const item of jsonData) {
    let kit: Kit;
    // Handle various CSV/JSON formats if needed
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
    
    // Save to local
    const kits = getFromLocal<Kit>(LS_KEYS.KITS);
    kits.push(kit);
    saveToLocal(LS_KEYS.KITS, kits);
    count++;

    // Try to push to cloud one by one (basic implementation)
    try {
       await fetch(`${API_BASE}/kits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kit)
      });
    } catch(e) {}
  }
  return count;
};

// --- Booking Management ---

export const getBookings = async (): Promise<Booking[]> => {
  let localData = getFromLocal<Booking>(LS_KEYS.BOOKINGS);

  try {
    const res = await fetch(`${API_BASE}/bookings`);
    const contentType = res.headers.get("content-type");

    if (res.ok && contentType && contentType.includes("application/json")) {
      const cloudData = await res.json();
      isUsingCloud = true;
      saveToLocal(LS_KEYS.BOOKINGS, cloudData);
      return cloudData;
    } else {
      throw new Error("API unreachable");
    }
  } catch (e) {
    isUsingCloud = false;
    return localData;
  }
};

export const saveBooking = async (booking: Booking): Promise<void> => {
  const bookings = getFromLocal<Booking>(LS_KEYS.BOOKINGS);
  bookings.push(booking);
  saveToLocal(LS_KEYS.BOOKINGS, bookings);

  try {
    await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
  }
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
  const bookings = getFromLocal<Booking>(LS_KEYS.BOOKINGS);
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    saveToLocal(LS_KEYS.BOOKINGS, bookings);
  }

  try {
    await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    isUsingCloud = true;
  } catch (e) {
    isUsingCloud = false;
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
