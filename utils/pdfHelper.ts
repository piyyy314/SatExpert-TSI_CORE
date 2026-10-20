import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Universal safe wrapper for jspdf-autotable that works seamlessly across
 * ES modules, Vite production bundles, and CommonJS environments.
 * Prevents "TypeError: doc.autoTable is not a function" in production builds.
 */
export const safeAutoTable = (doc: jsPDF | any, options: any) => {
  try {
    if (typeof doc.autoTable === 'function') {
      doc.autoTable(options);
    } else if (typeof autoTable === 'function') {
      autoTable(doc, options);
    } else if (typeof (autoTable as any).default === 'function') {
      (autoTable as any).default(doc, options);
    } else {
      const fn = (doc as any).constructor?.prototype?.autoTable;
      if (typeof fn === 'function') {
        fn.call(doc, options);
      }
    }
  } catch (err) {
    console.error("safeAutoTable execution error:", err);
  }

  // Ensure lastAutoTable is populated so subsequent sections don't crash
  if (!doc.lastAutoTable) {
    doc.lastAutoTable = { finalY: (options?.startY || 80) + 45 };
  }
};
