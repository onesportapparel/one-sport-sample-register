
import { Booking } from '../types';
import { getKits } from './storage';

export const printBooking = async (booking: Booking) => {
  const allKits = await getKits();
  const bookingKits = allKits.filter(k => booking.kitIds.includes(k.id));

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to print the booking sheet.');
    return;
  }

  const companyColor = '#f2223e'; 

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Booking Sheet - ${booking.customer.organization}</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; font-size: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid ${companyColor}; padding-bottom: 10px; margin-bottom: 15px; }
        h1 { color: ${companyColor}; margin: 0; font-size: 20px; text-transform: uppercase; }
        .section-title { background: #f0f0f0; padding: 5px 10px; font-weight: bold; margin: 15px 0 5px; border-left: 4px solid ${companyColor}; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .big-client { font-size: 20px; font-weight: 800; color: ${companyColor}; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; border-bottom: 2px solid #ddd; padding: 5px; font-size: 10px; color: #666; }
        td { border-bottom: 1px solid #eee; padding: 5px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; }
        .signature-line { border-bottom: 1px solid #333; height: 30px; margin-top: 10px; }
        .staff-name { font-size: 16px; margin-top: 10px; font-weight: bold; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div><h1>One Sport</h1><p>Sample Register</p></div>
        <div style="text-align:right"><h2>Booking Sheet</h2><p>Ref: ${booking.id.substring(0,8)}</p></div>
      </div>
      <div class="grid">
        <div>
          <div class="section-title">Client</div>
          <div class="big-client">${booking.customer.organization}</div>
          <p>${booking.customer.name}<br>${booking.customer.email}<br>${booking.customer.phone}</p>
        </div>
        <div>
          <div class="section-title">Details</div>
          <p><strong>Out:</strong> ${booking.dateOut}<br><strong>Due:</strong> ${booking.dateReturn}<br><strong>Staff:</strong> ${booking.salesPerson}</p>
        </div>
      </div>
      <div class="section-title">Items</div>
      <table>
        <thead><tr><th>Kit #</th><th>Supplier/Cat</th><th>Description</th><th>Sizes</th><th style="text-align:center">Check</th></tr></thead>
        <tbody>
          ${bookingKits.map(kit => `
            <tr>
              <td style="font-family:monospace">${kit.kitNumber}</td>
              <td>${kit.supplier} ${kit.category}</td>
              <td>${kit.description}</td>
              <td>${kit.sizes}</td>
              <td style="border:1px solid #ddd; width:30px"></td>
            </tr>
          `).join('')}
          ${booking.extraSamples ? `<tr><td>-</td><td>EXTRA</td><td colspan="2">${booking.extraSamples}</td><td style="border:1px solid #ddd"></td></tr>` : ''}
        </tbody>
      </table>
      <div class="footer">
        <div class="signature-box"><p><strong>Prepared By</strong></p><div class="staff-name">${booking.salesPerson}</div></div>
        <div class="signature-box"><p><strong>Received By</strong></p><div class="signature-line"></div></div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
