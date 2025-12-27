
import { Booking } from '../types';
import { getKits } from './storage';

export const MAKE_WEBHOOK_URL = "https://hook.us1.make.com/drjk6tlntuq6pkxrv61fq7dpbmvupl1g"; 

export type EmailAction = 'CREATED' | 'COLLECTED' | 'RETURNED';

export const initEmailService = () => {
  // no-op
};

export const sendEmailNotification = async (booking: Booking, action: EmailAction) => {
  if (!MAKE_WEBHOOK_URL) return;

  const allKits = await getKits();
  
  const formattedKitList = booking.kitIds.map(bookedId => {
    const kit = allKits.find(k => k.id === bookedId);
    if (!kit) return null;
    return `<div style="margin-bottom: 4px;">• <strong>${kit.category}</strong>: ${kit.description} <span style="color: #555; font-size: 0.9em;">(${kit.sizes})</span></div>`;
  }).filter(Boolean).join('');

  const payload = {
    action_type: action,
    booking_id: booking.id,
    booking_type: booking.type,
    date_out: booking.dateOut,
    date_return: booking.dateReturn,
    customer_name: booking.customer.name,
    customer_email: booking.customer.email,
    customer_org: booking.customer.organization,
    customer_phone: booking.customer.phone,
    sales_person: booking.salesPerson,
    notes: booking.notes || '',
    kits_list: formattedKitList || 'No specific kits selected.',
    other_samples: booking.extraSamples ? `<strong>Extra Samples:</strong><br>${booking.extraSamples}` : '',
    app_link: window.location.origin
  };

  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Email trigger failed:', error);
  }
};
