
import { Booking, Kit, KitAvailability, BookingStatus } from '../types';

const API_BASE = '/api';
const LS_KEYS = {
  KITS: 'os_kits_v1',
  BOOKINGS: 'os_bookings_v1'
};

// --- SEED DATA ---
const RAW_KITS = [
  { no: "001", sup: "TDP", cat: "Hoodies", desc: "001 Mixed ST PETERS Hoodies", bay: "BAY 8", size: "4-16, S-3XL" },
  { no: "002", sup: "TDP*", cat: "Hoodies", desc: "002 - ST PETERS MIXED", bay: "BAY 7", size: "6-16, XS-3XL" },
  { no: "1", sup: "MAXAM", cat: "Polo shirts", desc: "1 (mixed sub polo set)", bay: "BAY 4", size: "8-16 / XS-2XL+4XL" },
  { no: "10", sup: "AP/MAXAM", cat: "Polos", desc: "10 Botany - Royal(m) Gold(k)", bay: "BAY 1", size: "12 (8-16/S-3XL+5XL)" },
  { no: "103", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "104", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "105", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "106", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "107", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "108", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "4-16,XS-2XL" },
  { no: "109", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "6-16,XS-3XL" },
  { no: "11", sup: "AP", cat: "Tracksuit", desc: "11 Eureka Pants", bay: "TS", size: "13 (6-16/S-3XL+5XL)" },
  { no: "110", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "6-16,XS-3XL" },
  { no: "111", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "6-16,XS-3XL" },
  { no: "112", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "6-16,XS-3XL" },
  { no: "113", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "8-16,XS-3XL" },
  { no: "114", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "8-16,XS-3XL" },
  { no: "115", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "8-16,XS-3XL" },
  { no: "116", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "8-16,XS-3XL" },
  { no: "117", sup: "PM", cat: "Polo Shirts", desc: "Mixed Polos", bay: "BS", size: "8-16,XS-2XL" },
  { no: "12", sup: "AP", cat: "Shorts", desc: "12 Shorts", bay: "-", size: "13 (6-16/S-3XL+5XL)" },
  { no: "13", sup: "AP/MAXAM", cat: "Polos", desc: "13 Paterson Plus", bay: "BAY 1", size: "15 (6-26) + 2 x 8,10,12,14" },
  { no: "14", sup: "AS", cat: "Polos", desc: "14 Olympikool", bay: "BAY 1", size: "12 (6-16/S-3XL)" },
  { no: "15", sup: "AS", cat: "Polos", desc: "15 Olympikool", bay: "BAY 1", size: "10 (8-26)" },
  { no: "16", sup: "BIZ", cat: "Hoodies", desc: "16 Crew", bay: "BAY 5", size: "10 (6-14/XS-XL)" },
  { no: "17", sup: "BIZ", cat: "Hoodies", desc: "17 Crew", bay: "BAY 5", size: "5 (XS-XL)" },
  { no: "19", sup: "BIZ", cat: "Tracksuit", desc: "19 pant", bay: "TS", size: "8 (6-14,XS-3XL+5XL)" },
  { no: "2", sup: "MAXAM", cat: "Tee Shirts / Polos", desc: "2 (tees - boomerang/ilum)", bay: "BAY 4", size: "6-16k / Xs-3XL (boom) / 6L-20L (illum)" },
  { no: "201", sup: "TDP", cat: "Hoodies", desc: "Mixed", bay: "BW", size: "8-14,XS-2XL" },
  { no: "202", sup: "TDP", cat: "Hoodies", desc: "Barton-Yass", bay: "BW", size: "8-14,XS-5XL" },
  { no: "203", sup: "TDP", cat: "Hoodies", desc: "Barton-Mixed", bay: "BW", size: "8-14,XS-3XL" },
  { no: "204", sup: "TDP", cat: "Hoodies", desc: "Barton-Mixed", bay: "BW", size: "8-14,XS-3XL+5XL" },
  { no: "205", sup: "TDP", cat: "Hoodies", desc: "Erindale-Mixed", bay: "BW", size: "8-14,XS-2XL" },
  { no: "206", sup: "TDP", cat: "Hoodies", desc: "Mixed", bay: "BW", size: "8-14,XS-5XL" },
  { no: "207", sup: "TDP-CUSTOM", cat: "HOODIES", desc: "Tuggeranong Valley HOODIES", bay: "-", size: "Unisex 6-3XL+5XL" },
  { no: "22", sup: "BOC", cat: "SOCCER SHORT", desc: "22 CK706/CK708", bay: "TS", size: "12 (6-16/S-3XL)" },
  { no: "23", sup: "BOC", cat: "Hoodies", desc: "23 1060", bay: "BAY 2", size: "8 (XS-3XL+5XL)" },
  { no: "24", sup: "BOC", cat: "Hoodies", desc: "24 1061", bay: "BAY 5", size: "6 (6-16)" },
  { no: "3", sup: "AP/MAXAM", cat: "Polos", desc: "3 - Paterson", bay: "BAY 1", size: "14 (4-16/S-3XL+5XL)" },
  { no: "301", sup: "SUNCHASER", cat: "Adult Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "2XS-5XL" },
  { no: "302", sup: "SUNCHASER", cat: "Adult Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "3XS-4XL" },
  { no: "303", sup: "SUNCHASER", cat: "Adult/Youth Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "4XS-4XL" },
  { no: "304", sup: "SUNCHASER", cat: "Adult Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "3XS-4XL" },
  { no: "305", sup: "SUNCHASER", cat: "Youth Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "5XS-2XL" },
  { no: "306", sup: "SUNCHASER", cat: "Adult/Youth Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "4XS-3XL" },
  { no: "307", sup: "SUNCHASER", cat: "Adult Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "3XS-3XL" },
  { no: "308", sup: "SUNCHASER", cat: "Adult Sizing Kit", desc: "RUGBY JERSEYS", bay: "-", size: "3XS-3XL" },
  { no: "32", sup: "JB's", cat: "Skort", desc: "32 Skort", bay: "TS", size: "??" },
  { no: "33", sup: "JB's", cat: "Shorts", desc: "33 Shorts", bay: "TS", size: "21 (4-14k/6-22L /S-3XL)" },
  { no: "34", sup: "MAXAM", cat: "Long Sleeve Tee", desc: "34 Maddies", bay: "TS", size: "7" },
  { no: "35", sup: "MAXAM", cat: "BASKETBALL SHORT", desc: "35 Woden Dodgers", bay: "-", size: "11" },
  { no: "36", sup: "MAXAM", cat: "Tee", desc: "36 Tigers FC Sub Tees", bay: "BS", size: "9" },
  { no: "37", sup: "MAXAM", cat: "Soccer Short", desc: "37 Tigers FC", bay: "-", size: "10" },
  { no: "38", sup: "MAXAM", cat: "Polo shirts", desc: "38 Short Sleeve Polo DVA", bay: "-", size: "10 (8-26)" },
  { no: "39", sup: "MAXAM", cat: "Polo shirts", desc: "39 Long Sleeve DVA", bay: "BAY 1", size: "10 (8-26)" },
  { no: "4", sup: "AP/MAXAM", cat: "Polos", desc: "4 Botany - Navy(m) / Sky(k)", bay: "BAY 1", size: "12 (8-16/S-3XL+5XL)" },
  { no: "401", sup: "TDP-CUSTOM", cat: "Puffer Vest", desc: "LaTrobe Financial PUFFER VEST", bay: "-", size: "Unisex XS-3XL" },
  { no: "402", sup: "TDP-CUSTOM", cat: "Trackpants", desc: "Melba TAA TRACKPANTS", bay: "-", size: "Girls 12G, 14G, Ladies 6-20" },
  { no: "403", sup: "TDP-CUSTOM", cat: "Track Jackets & Pants", desc: "Melba Copeland", bay: "-", size: "Unisex Jackets 4-4XL, Pants 4-3XL" },
  { no: "404", sup: "TDP-CUSTOM", cat: "Shorts", desc: "Valley Travel Short Unisex", bay: "-", size: "Unisex 4-14 & XS-5XL" },
  { no: "405", sup: "PM-CUSTOM", cat: "Shorts", desc: "Act Rowing Design Ladies Gym Short", bay: "-", size: "Ladies 4-20" },
  { no: "406", sup: "PM-CUSTOM", cat: "Shorts", desc: "Act Rowing Design Unisex Gym Short", bay: "-", size: "Unisex 2XS-5XL" },
  { no: "407", sup: "TDP-CUSTOM", cat: "Shorts", desc: "Valley Lyca Short BOYLEG SHORTS", bay: "-", size: "Ladies 4-24" },
  { no: "408", sup: "PM-CUSTOM", cat: "Singlets", desc: "School Sport ACT Singlets", bay: "-", size: "Ladies 4-20" },
  { no: "409", sup: "TDP-CUSTOM", cat: "Shorts", desc: "ACT SRU Short Travel Short", bay: "-", size: "Unisex 14-3XL" },
  { no: "41", sup: "SUNCHASER", cat: "RUGBY JERSEY", desc: "41 ST PETERS/MONARO", bay: "Bay 3", size: "3XS-4XL - 10 jerseys" },
  { no: "410", sup: "TDP-CUSTOM", cat: "Trackpant", desc: "Valley Trackpant Unisex", bay: "-", size: "Unisex 6-14 & XS-3XL+5XL" },
  { no: "411", sup: "TDP-CUSTOM", cat: "Jacket", desc: "Valley Travel Jacket Unisex", bay: "-", size: "Unisex 6-14 & XS-3XL+5XL" },
  { no: "42", sup: "ONE SPORT#", cat: "RUGBY JERSEY", desc: "42 SET 2", bay: "-", size: "8 (14,XS-3XL)" },
  { no: "43", sup: "ONE SPORT#", cat: "RUGBY JERSEY", desc: "43 SET 3", bay: "-", size: "8 (14,XS-3XL)" },
  { no: "44", sup: "Ramo", cat: "Hoodies", desc: "44 TP212H", bay: "BAY 2", size: "11 (8-16/S-3XL)" },
  { no: "46", sup: "SUNCHASER", cat: "RUGBY JERSEY", desc: "46 KATZ NETBALL", bay: "BAY 3", size: "10 (3XS-4XL)" },
  { no: "47", sup: "TDP", cat: "VARSITY JKT", desc: "47 Bonython Jacket", bay: "TS", size: "8 (12,14,2XS,16,S,M,L,2XL)" },
  { no: "48", sup: "TDP", cat: "Tracksuit", desc: "48 Tigers Jkt/pnt", bay: "BAY 9", size: "12 (8-16/S-4XL)" },
  { no: "49", sup: "TDP", cat: "Dragon Boat", desc: "49 ONE SPORT", bay: "-", size: "12" },
  { no: "5", sup: "*AP", cat: "Softshell", desc: "5 SELWYN 1512/2512", bay: "TS", size: "15" },
  { no: "50", sup: "TDP", cat: "Shorts", desc: "50 7' Short", bay: "TS", size: "6 (14-XL)" },
  { no: "51", sup: "TDP", cat: "Tracksuit", desc: "51 Tapered Pant", bay: "TS", size: "7 (12-XL)" },
  { no: "52", sup: "TDP", cat: "Polos", desc: "52 Polo", bay: "-", size: "11 (10-16/S-4XL)" },
  { no: "53", sup: "TDP", cat: "Netball", desc: "53 606 Pattern", bay: "TS", size: "7 (8,12,14,16,18,20,22)" },
  { no: "54", sup: "TDP", cat: "Netball", desc: "54 Sing/Skort", bay: "-", size: "12 (8-14/XS-4XL)" },
  { no: "55", sup: "TDP", cat: "Polo", desc: "55 Custom Deaf ACT", bay: "-", size: "10 (6-24)" },
  { no: "56", sup: "TDP", cat: "SInglet", desc: "56 Deaf ACT Sub", bay: "-", size: "6 (6-16)" },
  { no: "57", sup: "TDP", cat: "Rugby - Sub", desc: "57 Brumbies Jerseys", bay: "-", size: "10 (10-14/XS-3XL)" },
  { no: "58", sup: "TDP", cat: "Rugby Short", desc: "58 School Sport RL", bay: "-", size: "8 (10-14/XS-XL)" },
  { no: "59", sup: "TDP", cat: "Puffer Jkts", desc: "59 Plain Puffer (sub)", bay: "-", size: "10 (3XS-4XL)" },
  { no: "6", sup: "AP", cat: "HOODIES", desc: "6 Paterson Hoodies XS-3XL+5XL", bay: "BAY 6", size: "XS-3XL+5XL" },
  { no: "60", sup: "TDP", cat: "Boyleg Short", desc: "60 DeafACT", bay: "TS", size: "10 (6-24)" },
  { no: "61", sup: "TDP", cat: "Crop Top", desc: "61 Bears", bay: "-", size: "9 (8-14/XS-XL)" },
  { no: "62", sup: "AP", cat: "HUXLEY HOODIES", desc: "62 Huxley Hoodies 12,14,16 S-3XL", bay: "BAY 6", size: "12-3XL" },
  { no: "64", sup: "TDP", cat: "Hoodies", desc: "64 MIXED SET PRINTED SIZES", bay: "BAY 7", size: "6-14, XS-3XL" },
  { no: "65", sup: "WS", cat: "Polos", desc: "65 PS61/K", bay: "BS", size: "12 (6-14/XS-3XL)" },
  { no: "66", sup: "WS", cat: "Polos", desc: "66 PS31/32A", bay: "-", size: "14 (8-18/XS-3XL+5XL)" },
  { no: "67", sup: "WS", cat: "Polos", desc: "67 PS53/54", bay: "BS", size: "15 (8-24/XS-2XL)" },
  { no: "68", sup: "WS", cat: "Polos", desc: "68 PS19", bay: "BS", size: "6 (8-18)" },
  { no: "69", sup: "WS", cat: "Polos", desc: "69 PS20/24", bay: "BS", size: "13 (6-16/S-3XL+5XL)" },
  { no: "7", sup: "AP", cat: "HOODIES", desc: "7 Paterson Kids 6-16 Hoodies", bay: "BAY 6", size: "6-16" },
  { no: "70", sup: "WS", cat: "Tees", desc: "70 TS37/TS38", bay: "TS", size: "??" },
  { no: "71", sup: "WS", cat: "Hoodies", desc: "71 FL08", bay: "BAY 5", size: "6 (8-18)" },
  { no: "72", sup: "WS", cat: "Hoodies", desc: "72 FL07/FL07K", bay: "-", size: "11 (8-16/S-3XL)" },
  { no: "73", sup: "AP", cat: "Softshell", desc: "73 - Selwyn", bay: "TS", size: "6-16k" },
  { no: "74", sup: "TDP", cat: "Netball", desc: "74 - NETBALL DRESS 4001", bay: "TS", size: "2-24" },
  { no: "75", sup: "TDP-CUSTOM", cat: "Trackpants", desc: "Bruce Hall Fleece TRACKPANTS", bay: "-", size: "Unisex 14-4XL" },
  { no: "75", sup: "TDP", cat: "Trackpants", desc: "75 TAPERED TRACKPANT (FLEECE) - BRUCE", bay: "-", size: "14-4XL" },
  { no: "76", sup: "TDP", cat: "Trackpants", desc: "76 TAPERED TRACKPANT (FLEECE) - BRUCE", bay: "BAY 9", size: "12-14G & 6-20L" },
  { no: "77", sup: "MAXAM", cat: "Soccer Shirts", desc: "77 - TIGERS SOCCER SHIRTS", bay: "TS", size: "6-14 - S-2XL" },
  { no: "79", sup: "TDP", cat: "Hoodies", desc: "79 - Hoodies (green set)", bay: "-", size: "8-14 XS - 4XL" },
  { no: "8", sup: "AP", cat: "HOODIES", desc: "8 Paterson Ladies Hoodie 8-14L", bay: "BAY 6", size: "8-14" },
  { no: "80", sup: "MAXAM", cat: "Tees", desc: "80 - Maxam Sub Tees", bay: "BAY 4", size: "8K-2XL (ILLUMINOUS) / 6-26Ladies" },
  { no: "81", sup: "TDP", cat: "Hoodies", desc: "81 GREEN SET", bay: "BAY 8", size: "8-16 S-4Xl" },
  { no: "82", sup: "SUNCHASER", cat: "RUGBY JERSEY", desc: "82 - VARIOUS", bay: "-", size: "TOTAL 14 / 3XS - 3XL" },
  { no: "83", sup: "PLAYMORE", cat: "Sub Polo", desc: "83 Mixed Polo", bay: "BAY 4", size: "8-16 and XS-2XL" },
  { no: "84", sup: "Playmore", cat: "Sub Polos", desc: "84", bay: "BAY 4", size: "8-16 and XS-5XL" },
  { no: "85", sup: "PLAYMORE", cat: "Sub Tees", desc: "85 (schoolsport ACT)", bay: "BAY 1", size: "4-16 S-3XL" },
  { no: "86", sup: "Playmore", cat: "Sub Ladies Polo", desc: "86 Dales BV-neck polo", bay: "BAY 1", size: "10-18" },
  { no: "87", sup: "PLAYMORE", cat: "Sub Polos", desc: "87 Mixed Polos", bay: "BAY 4", size: "8-16k XS-3XL" },
  { no: "88", sup: "PLAYMORE", cat: "Singlet", desc: "88 School sport ACT Singlets", bay: "TS", size: "6-16k S-3XL" },
  { no: "88", sup: "PM-CUSTOM", cat: "Singlets", desc: "School Sport ACT Singlets", bay: "-", size: "Unisex 6-16 & 2XS-3XL" },
  { no: "89", sup: "TDP", cat: "Womens Soccer Shorts", desc: "89 Plain navy mesh", bay: "TS", size: "12-22L" },
  { no: "89", sup: "TDP-CUSTOM", cat: "Shorts", desc: "Valley Travel Short Women", bay: "-", size: "Ladies 4-20" },
  { no: "9", sup: "AP", cat: "Hoodies", desc: "9 Huxley", bay: "BAY 6", size: "14 (6-16/XS-3XL+5XL)" },
  { no: "90", sup: "TDP", cat: "Womens AFL Short", desc: "90 Masters AFL", bay: "TS", size: "8-22" },
  { no: "91", sup: "TDP", cat: "Softshell Jacket", desc: "91 - Googong Samples", bay: "-", size: "8-14K" },
  { no: "92", sup: "SUNCHASER", cat: "Rugby Jersey", desc: "92 Mixed Jerseys", bay: "BAY 3", size: "3XS-3XL" },
  { no: "93", sup: "PLAYMORE", cat: "Leggings", desc: "93 - West Belconnen", bay: "-", size: "4-24" },
  { no: "94", sup: "PLAYMORE", cat: "Sub Polos", desc: "94 Mixed Polos", bay: "BAY 4", size: "4-16K XS-2XL" },
  { no: "95", sup: "TDP", cat: "Trackjackets", desc: "95 MELBA Copeland", bay: "BAY 9", size: "4-4XL" },
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
// This ensures the app works even if the API backend is not running (Development/Demo mode)

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
       // Check if it's returning HTML (SPA Fallback for 404) instead of JSON
       const contentType = res.headers.get("content-type");
       if (contentType && contentType.indexOf("application/json") === -1) {
         throw new Error("API Route Not Found");
       }
       throw new Error("API Error");
    }
    const data = await res.json();
    
    // Safety check: If API returns empty list but we have local data,
    // don't overwrite local data immediately unless we are sure.
    // However, for simplicity in this hybrid model: 
    // If API works, it is the source of truth.
    // If user just imported to LocalStorage because API was down, 
    // and now API is up but empty, we have a sync problem.
    // Ideally, we'd push Local to API here, but let's just cache what we get
    // ONLY if it's not empty, OR if we don't have local data.
    
    if (data.length > 0) {
      saveToLocal(LS_KEYS.KITS, data);
    }
    
    return data;
  } catch (e) {
    console.warn("Using LocalStorage for Kits (Offline/Dev Mode/API Error)");
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
    if (!res.ok) throw new Error("API Error");
  } catch (e) {
    // Fallback to local storage
    const kits = getFromLocal<Kit>(LS_KEYS.KITS);
    kits.push(kit);
    saveToLocal(LS_KEYS.KITS, kits);
  }
};

export const importData = async (jsonData: any[]): Promise<number> => {
  let count = 0;
  for (const item of jsonData) {
    let kit: Kit;

    // Handle legacy format (from RAW_KITS style or old exports)
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
       // Assume standard Kit format
       kit = {
         ...item,
         id: item.id || generateId()
       };
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
    if (!res.ok) throw new Error("API Error");
  } catch (e) {
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
    if (!res.ok) throw new Error("API Error");
  } catch (e) {
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
       const contentType = res.headers.get("content-type");
       if (contentType && contentType.indexOf("application/json") === -1) throw new Error("API Route Not Found");
       throw new Error("API Error");
    }
    const data = await res.json();
    if (data.length > 0) {
      saveToLocal(LS_KEYS.BOOKINGS, data);
    }
    return data;
  } catch (e) {
    console.warn("Using LocalStorage for Bookings");
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
    if (!res.ok) throw new Error("API Error");
  } catch (e) {
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
    if (!res.ok) throw new Error("API Error");
  } catch (e) {
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
