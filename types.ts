export type BookingType = 'IMMEDIATE' | 'COLLECTION' | 'DELIVERY';
export type BookingStatus = 'PENDING' | 'ACTIVE' | 'RETURNED';

export interface Kit {
  id: string; // Unique internal identifier
  kitNumber: string; // Display number (e.g. "001")
  supplier: string;
  category: string;
  description: string;
  bay: string;
  sizes: string;
}

export interface CustomerDetails {
  organization: string;
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  createdAt: string;
  type: BookingType;
  status: BookingStatus;
  
  // Dates
  dateOut: string; // ISO Date string YYYY-MM-DD
  dateReturn: string; // ISO Date string YYYY-MM-DD
  
  // Who
  salesPerson: 'Darryn Shannon' | 'Toby Keen';
  customer: CustomerDetails;
  
  // What
  kitIds: string[];
  extraSamples: string; // Text field for loose samples
  notes: string;
}

export interface KitAvailability {
  kitId: string;
  isAvailable: boolean;
  conflictReason?: string; // e.g., "Booked until 2023-10-10"
}