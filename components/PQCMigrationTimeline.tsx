import * as React from 'react';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { motion } from 'motion/react';
import { Calendar, ShieldAlert } from 'lucide-react';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  gantt: {
    axisFormat: '%Y',
    topPadding: 50,
  }
});

export const PQCMigrationTimeline: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = `
gantt
    title Quantum Risk & PQC Migration Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %Y
    
    section Quantum Hardware
    Google Sycamore (53 qubit) :done, 2019-01-01, 365d
    IBM Eagle (127 qubit) :done, 2021-01-01, 365d
    IBM Osprey (433 qubit) :done, 2022-01-01, 365d
    IBM Condor (1121 qubit) :done, 2023-01-01, 365d
    Google Willow (105 qubit, QEC) :done, 2024-01-01, 365d
    
    section PQC Standardization
    NIST finalists (Kyber/Dilithium) :done, 2020-01-01, 730d
    NIST standards (Kyber/Dilithium/SPHINCS+) :done, 2024-01-01, 365d
    NIST selects Falcon/HQC :active, 2025-01-01, 365d
    
    section Industry Migration
    Google sets 2029 PQC migration goal :crit, active, 2024-01-01, 1825d
    UK NCSC advises PQC plans by 2028-2031 :active, 2024-01-01, 2555d
    Full PQC adoption (~AES-256, Kyber in apps) : 2030-01-01, 730d
    Cryptographically Relevant QC (CRQC) estimate :crit, 2030-01-01, 1825d
`;

  useEffect(() => {
    const renderChart = async () => {
      if (chartRef.current) {
        try {
          const id = `m-pqc-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chartData);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
        }
      }
    };
    renderChart();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[32px] border-2 border-slate-800 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="text-[80px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">QUANTUM_TIMELINE</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <Calendar className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase">PQ Migration Timeline</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase italic">Source: NIST / NCSC / Google Quantum AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">CRQC Threat Imminent</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar bg-slate-950/50 rounded-2xl border border-slate-800/50 p-4">
        <div ref={chartRef} className="mermaid-container min-w-[850px] flex justify-center py-4" />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
          <div className="flex items-center space-x-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover:animate-ping"></div>
             <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">NIST FIPS 203/204</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Official ratification of ML-KEM and ML-DSA standards for global implementation.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all group shadow-inner">
          <div className="flex items-center space-x-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:animate-ping"></div>
             <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Hybrid Guard</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Simultaneous use of classical and PQC algorithms to mitigate implementation risks.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group">
           <div className="flex items-center space-x-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping"></div>
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Cryptographic Agility</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Capability to swap algorithms rapidly as new quantum attacks are discovered.</p>
        </div>
        <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/30 hover:border-red-500/30 transition-all group">
           <div className="flex items-center space-x-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse"></div>
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">CRQC Threshold</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Point at which QC hardware reaches scale to break RSA-2048/ECC-256 via Shor's.</p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
         <div className="flex space-x-4">
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Scale: YYYY Linear</span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Ref ID: PQC-RM-091</span>
         </div>
         <div className="text-[8px] text-slate-700 font-mono">CONFIDENTIAL // QUANTUM INTEL</div>
      </div>
    </motion.div>
  );
};
