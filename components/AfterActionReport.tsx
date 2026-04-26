import * as React from 'react';
import { useState } from 'react';
import { FileText, Download, Shield, Zap, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ActionRecord {
  timestamp: string;
  category: 'VULNERABILITY' | 'SIGINT' | 'C2' | 'SYSTEM';
  description: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  details?: string;
}

const INITIAL_ACTIONS: ActionRecord[] = [
  {
    timestamp: '2026-04-26 08:34:26',
    category: 'SIGINT',
    description: 'Hardware entry point discovered at Endpoint 0x82.',
    status: 'SUCCESS',
    details: 'Serial debugging console localized. Raw bitstream access enabled.'
  },
  {
    timestamp: '2026-04-26 05:12:44',
    category: 'SIGINT',
    description: 'Signal triangulation started for 0x403for.github.io',
    status: 'SUCCESS',
    details: 'Geospatial coordinates locked within 5m radius.'
  },
  {
    timestamp: '2026-04-26 05:35:58',
    category: 'VULNERABILITY',
    description: 'Vulnerability scan completed. High risk identified in protocol stack.',
    status: 'CRITICAL',
    details: 'CVE-2021-25216 (BIND GSS-TSIG), CVE-2020-8622 (SIG Query DoS).'
  },
  {
    timestamp: '2026-04-26 06:10:12',
    category: 'VULNERABILITY',
    description: 'Squid Proxy Assessment',
    status: 'WARNING',
    details: 'Vulnerable to CVE-2020-15049 and CVE-2020-25097.'
  },
  {
    timestamp: '2026-04-26 07:15:22',
    category: 'SYSTEM',
    description: 'Aegis C2 Remote Shell Expansion',
    status: 'SUCCESS',
    details: 'Deployed persistent shell uplink and session manager.'
  },
  {
    timestamp: '2026-04-26 07:42:17',
    category: 'C2',
    description: 'Target flagged for manual active monitoring. Agent assigned.',
    status: 'SUCCESS',
    details: 'Active monitoring node established on port 2000.'
  }
];

export const AfterActionReport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TACTICAL AFTER ACTION REPORT', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: ${new Date().toLocaleDateString()} | CLASSIFICATION: TOP SECRET`, 14, 34);

    // Summary Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text('EXECUTIVE SUMMARY', 14, 55);
    doc.line(14, 57, 200, 57);

    doc.setFontSize(11);
    doc.text('Operational assessment of current mission state and active threat vectors.', 14, 65);
    
    // Table
    const tableData = INITIAL_ACTIONS.map(action => [
      action.timestamp,
      action.category,
      action.description,
      action.status
    ]);

    doc.autoTable({
      startY: 75,
      head: [['Timestamp', 'Category', 'Description', 'Severity']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
          if (data.cell.raw === 'WARNING') data.cell.styles.textColor = [234, 179, 8];
          if (data.cell.raw === 'SUCCESS') data.cell.styles.textColor = [22, 163, 74];
        }
      }
    });

    // Mitigation Recommendations
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('MITIGATION STRATEGY', 14, finalY);
    doc.line(14, finalY + 2, 200, finalY + 2);

    doc.setFontSize(10);
    const mitigations = [
      '• Upgrade ISC BIND to 9.18.x+ to resolve GSS-TSIG overflow.',
      '• Patch Squid Proxy to version 4.13 or higher.',
      '• Restrict Port 2000 via hardware firewall; implement mTLS.',
      '• Deploy active monitoring on all flagged shell uplinks.',
      '• Rotate all credentials discovered in VFS layer exploration.'
    ];
    mitigations.forEach((text, i) => {
      doc.text(text, 14, finalY + 12 + (i * 7));
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`CONFIDENTIAL - TSI AGENT COMMAND - PAGE ${i} OF ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save('TSI_AAR_REPORT.pdf');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
      >
        <FileText className="w-4 h-4 text-cyan-500" />
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Generate_AAR</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] glass bg-slate-950 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
                    <Shield className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Mission Status: Completed</h2>
                    <p className="text-xs font-mono text-slate-500">Operation: GHOST_PROTOCOL // ID: 0xFF-42-AAR</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={generatePDF}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download_PDF</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <Activity className="w-5 h-5 text-emerald-500 mb-3" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Threats_Neutralized</h4>
                    <p className="text-2xl font-black text-white mono">14</p>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <Target className="w-5 h-5 text-red-500 mb-3" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vulnerabilities</h4>
                    <p className="text-2xl font-black text-white mono">04</p>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <Zap className="w-5 h-5 text-cyan-500 mb-3" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success_Rate</h4>
                    <p className="text-2xl font-black text-white mono">98.2%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[12px] font-black text-white uppercase tracking-widest flex items-center space-x-2">
                    <ChevronRight className="w-4 h-4 text-cyan-500" />
                    <span>Action_Logs</span>
                  </h3>
                  <div className="space-y-3">
                    {INITIAL_ACTIONS.map((action, i) => (
                      <div key={i} className="group glass-card p-5 rounded-2xl border border-slate-800/60 bg-slate-900/20 hover:border-cyan-500/30 transition-all flex items-start space-x-4">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          action.status === 'CRITICAL' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                          action.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">{action.timestamp}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                              action.status === 'CRITICAL' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                              action.status === 'WARNING' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                              'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                            }`}>{action.status}</span>
                          </div>
                          <p className="text-[11px] font-black text-slate-200 mb-1">{action.description}</p>
                          {action.details && <p className="text-[10px] font-medium text-slate-400 italic font-mono">{action.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
