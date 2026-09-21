import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Inmate, InmatePropertyItem } from '../../types';

export interface PropertyPdfOptions {
  officerName?: string;
  officerRank?: string;
  officerBadge?: string;
  notes?: string;
  includeThumbprintBox?: boolean;
}

/**
 * Generates a formal, timestamped property inventory report for an inmate,
 * formatted specifically for legal discharge clearance and physical sign-off.
 */
export async function generatePropertyDischargePdf(
  inmate: Inmate,
  options: PropertyPdfOptions = {}
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const officerName = options.officerName || 'Chief Insp. P. Kilonzo';
  const officerRank = options.officerRank || 'Senior Property Vault Custodian';
  const officerBadge = options.officerBadge || 'SVC-9942-PR';

  // Formal timestamp (current date and time)
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' (EAT)';
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const docSerial = `DOC-PV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${inmate.bookingNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Generate QR verification string
  const qrPayload = JSON.stringify({
    docType: 'PROPERTY_DISCHARGE_HANDOVER',
    serial: docSerial,
    booking: inmate.bookingNumber,
    nationalId: inmate.nationalIdNumber,
    name: `${inmate.firstName} ${inmate.lastName}`,
    facility: inmate.facilityName,
    itemsCount: inmate.propertyItems.length,
    timestamp: timestampStr,
    status: 'OFFICIAL_AUDITED'
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 120,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
  } catch (e) {
    console.warn('QR Code generation fallback:', e);
  }

  // --- PAGE SETUP & COLORS ---
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Primary Header Bar
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, margin, contentWidth, 24, 'F');

  // Official Gold Accent Stripe
  doc.setFillColor(217, 119, 6); // Amber-600
  doc.rect(margin, margin + 24, contentWidth, 2, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('STATE DEPARTMENT FOR CORRECTIONAL SERVICES', margin + 6, margin + 8);
  
  doc.setFontSize(13);
  doc.text('NATIONAL PRISON SERVICE — PROPERTY VAULT REGISTRY', margin + 6, margin + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('FORM NPS-PR-7B: INMATE PERSONAL PROPERTY INVENTORY & DISCHARGE RESTITUTION DOCKET', margin + 6, margin + 20);

  // Right Header Document Serial
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(253, 224, 71);
  doc.text(docSerial, pageWidth - margin - 6, margin + 9, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`ISSUED: ${dateFormatted} ${timeFormatted}`, pageWidth - margin - 6, margin + 16, { align: 'right' });
  doc.text('RETENTION: STATUTORY 10 YRS', pageWidth - margin - 6, margin + 21, { align: 'right' });

  // Add QR Code in Header Box if available
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 22, margin + 28, 20, 20);
    } catch (err) {
      console.warn('QR placement failed', err);
    }
  }

  // --- INMATE & FACILITY DOSSIER PANEL ---
  let cursorY = margin + 30;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.rect(margin, cursorY, contentWidth - 25, 30, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('SUBJECT CUSTODY IDENTIFIERS & DISCHARGE DETAILS', margin + 4, cursorY + 5.5);

  // Grid of inmate metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  // Column 1
  doc.text('Inmate Full Name:', margin + 4, cursorY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${inmate.firstName} ${inmate.lastName}`.toUpperCase(), margin + 32, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Booking Ref. No:', margin + 4, cursorY + 17);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.bookingNumber, margin + 32, cursorY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('National ID / Pass:', margin + 4, cursorY + 23);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.nationalIdNumber, margin + 32, cursorY + 23);

  // Column 2
  const col2X = margin + 78;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Holding Facility:', col2X, cursorY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.facilityName.slice(0, 24), col2X + 25, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Security Rating:', col2X, cursorY + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.securityCategory, col2X + 25, cursorY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Housing Cell Loc:', col2X, cursorY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.cellLocation, col2X + 25, cursorY + 23);

  // Column 3
  const col3X = margin + 130;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Intake Date:', col3X, cursorY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inmate.admissionDate, col3X + 24, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Exit Gate Pass #:', col3X, cursorY + 17);
  doc.setFont('courier', 'bold');
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(inmate.dischargeRecord?.gatePassNumber || 'GP-VERIFIED-2026', col3X + 24, cursorY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Discharge Reason:', col3X, cursorY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text((inmate.dischargeRecord?.dischargeType || 'Sentence Expiry').replace(/_/g, ' '), col3X + 24, cursorY + 23);

  cursorY += 34;

  // --- ITEM COUNT & VAULT STATUS SUMMARY STRIP ---
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('VERIFIED PROPERTY INVENTORY DEPOSITED IN VAULT LOCKER', margin + 4, cursorY + 4.8);

  // Calculate totals
  const totalItemsCount = inmate.propertyItems.reduce((acc, p) => acc + (p.category === 'cash' ? 1 : p.quantity), 0);
  const totalCashDeposited = inmate.propertyItems
    .filter(p => p.category === 'cash')
    .reduce((acc, p) => acc + p.quantity, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Bags: ${inmate.propertyItems.length} | Items: ${totalItemsCount} | Vault Cash: KES ${totalCashDeposited.toLocaleString()} | Gratuity: $${inmate.gratuityBalance.toFixed(2)}`,
    pageWidth - margin - 4,
    cursorY + 4.8,
    { align: 'right' }
  );

  cursorY += 9;

  // --- ITEMIZED INVENTORY TABLE ---
  const tableHeaders = [
    { text: 'NO.', width: 10, align: 'center' },
    { text: 'SEAL BAG NO.', width: 32, align: 'left' },
    { text: 'CATEGORY', width: 22, align: 'left' },
    { text: 'DESCRIPTION & SERIAL / IMEI', width: 64, align: 'left' },
    { text: 'INTAKE CONDITION', width: 28, align: 'left' },
    { text: 'QTY', width: 10, align: 'center' },
    { text: 'STATUS', width: 16, align: 'center' }
  ];

  // Draw Table Header
  doc.setFillColor(51, 65, 85); // Slate-700
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let currentX = margin;
  tableHeaders.forEach(col => {
    if (col.align === 'center') {
      doc.text(col.text, currentX + col.width / 2, cursorY + 4.8, { align: 'center' });
    } else {
      doc.text(col.text, currentX + 2, cursorY + 4.8);
    }
    currentX += col.width;
  });

  cursorY += 7;

  // Draw Table Rows
  if (inmate.propertyItems.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, cursorY, contentWidth, 12, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NO PERSONAL VALUABLES OR CASH RECORDED IN FACILITY VAULT AT ADMISSION.', pageWidth / 2, cursorY + 7.5, { align: 'center' });
    cursorY += 14;
  } else {
    inmate.propertyItems.forEach((item: InmatePropertyItem, index: number) => {
      const isZebra = index % 2 === 1;
      const rowHeight = 9;

      doc.setFillColor(isZebra ? 248 : 255, isZebra ? 250 : 255, isZebra ? 252 : 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, cursorY, contentWidth, rowHeight, 'FD');

      let rowX = margin;

      // Col 1: Index
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(String(index + 1), rowX + 5, cursorY + 5.5, { align: 'center' });
      rowX += 10;

      // Col 2: Seal Bag No.
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.sealBagNumber, rowX + 2, cursorY + 5.5);
      rowX += 32;

      // Col 3: Category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(item.category.toUpperCase(), rowX + 2, cursorY + 5.5);
      rowX += 22;

      // Col 4: Description & Details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const descLine = item.serialOrDetail ? `${item.description} (${item.serialOrDetail})` : item.description;
      doc.text(descLine.slice(0, 42), rowX + 2, cursorY + 5.5);
      rowX += 64;

      // Col 5: Intake Condition
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text((item.condition || 'Good').slice(0, 18), rowX + 2, cursorY + 5.5);
      rowX += 28;

      // Col 6: Quantity / Amount
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const qtyStr = item.category === 'cash' ? `KES ${item.quantity}` : String(item.quantity);
      doc.text(qtyStr, rowX + 5, cursorY + 5.5, { align: 'center' });
      rowX += 10;

      // Col 7: Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(item.status === 'held_in_vault' ? 'HELD' : 'EXIT', rowX + 8, cursorY + 5.5, { align: 'center' });

      cursorY += rowHeight;
    });
  }

  // --- RECONCILIATION SUMMARY BOX ---
  cursorY += 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, contentWidth, 15, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('FINANCIAL LIQUIDATION & VALUABLE DISCHARGE AUDIT:', margin + 4, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`1. Vault Cash Total: KES ${totalCashDeposited.toLocaleString()} (Voucher / Legal Tender Handed Over)`, margin + 4, cursorY + 10);
  doc.text(`2. Inmate Prison Labor Gratuity Balance: $${inmate.gratuityBalance.toFixed(2)} (Disbursed via Gate Warrant)`, margin + 95, cursorY + 10);

  cursorY += 18;

  // --- LEGAL STATUTORY DECLARATION (PRISONS ACT CAP 90) ---
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.rect(margin, cursorY, contentWidth, 17, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // Amber-900
  doc.text('LEGAL DECLARATION & DISCHARGE INDEMNITY (PRISONS ACT CAP 90 SECTION 48):', margin + 4, cursorY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 53, 15);
  const declarationText = 
    `I, ${inmate.firstName} ${inmate.lastName}, hereby acknowledge and confirm that I have personally inspected and received in full condition all articles of personal property, cash monies, documents, and effects surrendered by me upon intake and catalogued in this vault docket. I certify that all tamper-evident seals were broken in my presence and that I have no further claims whatsoever against the National Prison Service or the Superintendent regarding my property.`;
  
  const splitDeclaration = doc.splitTextToSize(declarationText, contentWidth - 8);
  doc.text(splitDeclaration, margin + 4, cursorY + 8.5);

  cursorY += 21;

  // --- THREE FORMAL SIGN-OFF & STAMP BLOCKS ---
  const blockWidth = (contentWidth - 6) / 3;
  const blockHeight = 44;

  // BLOCK 1: INMATE RECIPIENT SIGN-OFF & THUMBPRINT
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, cursorY, blockWidth, blockHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. INMATE ACKNOWLEDGMENT', margin + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Confirmed received in good order:', margin + 3, cursorY + 9);

  // Inmate Signature Line
  doc.line(margin + 4, cursorY + 22, margin + blockWidth - 4, cursorY + 22);
  doc.text('Signature of Inmate / Confirmatory Mark', margin + 4, cursorY + 25);

  // Right Thumb Biometric Ink Box
  doc.setDrawColor(148, 163, 184);
  doc.rect(margin + 4, cursorY + 28, blockWidth - 8, 13);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('[ RIGHT THUMB BIOMETRIC INK PRINT ]', margin + blockWidth / 2, cursorY + 36, { align: 'center' });

  // BLOCK 2: RELEASING PROPERTY OFFICER
  const b2X = margin + blockWidth + 3;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.rect(b2X, cursorY, blockWidth, blockHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. RELEASING VAULT OFFICER', b2X + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Officer Name:', b2X + 3, cursorY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(officerName, b2X + 22, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Service Rank:', b2X + 3, cursorY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(officerRank, b2X + 22, cursorY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Badge / Serial:', b2X + 3, cursorY + 21);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(officerBadge, b2X + 22, cursorY + 21);

  // Officer Signature Line
  doc.line(b2X + 4, cursorY + 32, b2X + blockWidth - 4, cursorY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Officer Physical Counter-Signature', b2X + 4, cursorY + 35);
  doc.text(`Date & Time: ${dateFormatted} ${timeFormatted}`, b2X + 4, cursorY + 40);

  // BLOCK 3: GATE SUPERINTENDENT & EMBOSSED STAMP
  const b3X = b2X + blockWidth + 3;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.rect(b3X, cursorY, blockWidth, blockHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. DISCHARGE SUPERINTENDENT', b3X + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Final Gate Clearance Verified:', b3X + 3, cursorY + 9);

  // Official Stamp Box
  doc.setDrawColor(180, 83, 9); // Amber
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(b3X + 5, cursorY + 12, blockWidth - 10, 20);
  doc.setLineDashPattern([], 0); // Reset

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL PRISONS', b3X + blockWidth / 2, cursorY + 18, { align: 'center' });
  doc.text('EMBOSSED STAMP', b3X + blockWidth / 2, cursorY + 23, { align: 'center' });
  doc.text('& SECURITY SEAL', b3X + blockWidth / 2, cursorY + 28, { align: 'center' });

  // Superintendent Signature Line
  doc.line(b3X + 4, cursorY + 36, b3X + blockWidth - 4, cursorY + 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Superintendent on Duty Approval', b3X + 4, cursorY + 40);

  cursorY += blockHeight + 4;

  // --- BOTTOM WATERMARK / AUDIT FOOTER ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, pageHeight - 12, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `CONFIDENTIAL LAW ENFORCEMENT RECORD • GENERATED VIA ODOO 19 PRISON VAULT ENGINE • DOC REF: ${docSerial}`,
    margin + 3,
    pageHeight - 7.5
  );
  doc.text(
    `PAGE 1 OF 1 • VERIFIED AUDIT TIMESTAMP: ${timestampStr}`,
    pageWidth - margin - 3,
    pageHeight - 7.5,
    { align: 'right' }
  );

  return doc;
}

/**
 * Convenience helper to export and trigger immediate browser download of the PDF file.
 */
export async function downloadPropertyDischargePdf(
  inmate: Inmate,
  options: PropertyPdfOptions = {}
): Promise<string> {
  const doc = await generatePropertyDischargePdf(inmate, options);
  const cleanBooking = inmate.bookingNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanName = `${inmate.firstName}_${inmate.lastName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `PRISON_PROPERTY_DISCHARGE_REPORT_${cleanBooking}_${cleanName}_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}
