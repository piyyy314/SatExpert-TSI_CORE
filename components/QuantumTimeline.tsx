
import * as React from 'react';
import { motion } from 'motion/react';
import { Calendar, Cpu, ShieldCheck, TrendingUp, History, Info } from 'lucide-react';

interface TimelineEvent {
  label: string;
  year: number;
  endYear?: number;
  status: 'done' | 'current' | 'future' | 'ongoing';
  details?: string;
}

interface TimelineSection {
  title: string;
  icon: React.ReactNode;
  events: TimelineEvent[];
}

const TIMELINE_DATA: TimelineSection[] = [
  {
    title: "Quantum Hardware Evolution",
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    events: [
      { label: "Google Sycamore (53 qubit)", year: 2019, status: 'done', details: "Quantum Supremacy Milestone" },
      { label: "IBM Eagle (127 qubit)", year: 2021, status: 'done' },
      { label: "IBM Osprey (433 qubit)", year: 2022, status: 'done' },
      { label: "IBM Condor (1121 qubit)", year: 2023, status: 'done' },
      { label: "Google Willow (105 qubit, QEC)", year: 2024, status: 'done', details: "Quantum Error Correction focus" },
    ]
  },
  {
    title: "PQC Standardization (NIST)",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    events: [
      { label: "NIST PQC Finalists selected", year: 2020, status: 'done', details: "Kyber/Dilithium chosen" },
      { label: "NIST Standards Published", year: 2024, status: 'done', details: "ML-KEM (Kyber), ML-DSA (Dilithium), SLH-DSA (SPHINCS+)" },
      { label: "NIST selects Falcon/HQC", year: 2025, status: 'future' },
    ]
  },
  {
    title: "Industry & Government Migration",
    icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
    events: [
      { label: "Google PQC Migration Goal", year: 2024, endYear: 2029, status: 'ongoing', details: "Targeting full transition by 2029" },
      { label: "UK NCSC Advisory Deadline", year: 2028, endYear: 2031, status: 'future', details: "PQC transition plans required" },
    ]
  }
];

export const QuantumTimeline: React.FC = () => {
  const startYear = 2018;
  const endYear = 2032;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const getLeft = (year: number) => {
    return ((year - startYear) / (endYear - startYear)) * 100;
  };

  const getWidth = (start: number, end?: number) => {
    if (!end) return "4px";
    return `${((end - start) / (endYear - startYear)) * 100}%`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Calendar className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Quantum Risk & <span className="text-cyan-500">PQC Migration</span></h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Strategic Intelligence Timeline // NIST-2024-STD</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
             <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">Operation_Time</span>
             <span className="text-[10px] text-cyan-500 font-black tracking-widest font-mono">MAY 2026</span>
          </div>
           <div className="w-px h-8 bg-slate-800 mx-2"></div>
           <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
             <History className="w-4 h-4 text-slate-500" />
           </div>
        </div>
      </header>

      <div className="glass p-8 rounded-[32px] border-slate-800 bg-slate-950/40 relative overflow-hidden">
        {/* Timeline Backdrop Grid */}
        <div className="absolute inset-0 pointer-events-none px-8 py-12">
          <div className="h-full w-full flex justify-between relative">
            {years.map(year => (
              <div key={year} className="h-full w-px bg-slate-800/30 relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-600 tracking-tighter">{year}</span>
                {year === 2026 && (
                   <div className="absolute top-0 bottom-0 -left-px w-[2px] bg-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.5)] z-20">
                      <div className="absolute top-0 -left-[3px] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-4 space-y-12">
          {TIMELINE_DATA.map((section, sIdx) => (
            <div key={section.title} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  {section.icon}
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{section.title}</h3>
                <div className="flex-grow h-px bg-slate-800/50 ml-4"></div>
              </div>

              <div className="space-y-4">
                {section.events.map((event, eIdx) => (
                  <div key={event.label} className="relative h-12 flex items-center group">
                    <div className="absolute left-0 right-0 h-8 bg-slate-900/20 rounded-lg -mx-2 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-800/0 group-hover:border-slate-800/50"></div>
                    
                    <div className="w-1/4 pr-8 text-right z-10">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{event.label}</span>
                      {event.details && <span className="block text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{event.details}</span>}
                    </div>

                    <div className="flex-grow relative h-1.5 flex items-center">
                       {/* Line for point events */}
                       <div className="absolute h-full bg-slate-900/50 rounded-full w-full"></div>
                       
                       <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: getWidth(event.year, event.endYear), opacity: 1 }}
                          transition={{ duration: 1, delay: (sIdx * 0.2) + (eIdx * 0.1) }}
                          className={`absolute h-full rounded-full ${
                            event.status === 'done' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 
                            event.status === 'ongoing' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                            'bg-slate-700 border border-slate-600'
                          }`}
                          style={{
                            left: `${getLeft(event.year)}%`,
                            minWidth: !event.endYear ? "8px" : "auto"
                          }}
                       >
                          {!event.endYear && (
                             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-slate-950 ${
                               event.status === 'done' ? 'bg-cyan-400' : 'bg-slate-800'
                             }`}></div>
                          )}
                       </motion.div>
                    </div>

                    <div className="w-24 pl-8 z-10">
                       <span className={`text-[9px] font-black mono ${
                         event.status === 'done' ? 'text-emerald-500' : 
                         event.status === 'ongoing' ? 'text-amber-500 animate-pulse' : 
                         'text-slate-600'
                       }`}>
                          {event.status === 'done' ? '[COMPLETED]' : 
                           event.status === 'ongoing' ? '[ACTIVE]' : 
                           event.status === 'future' ? '[PLANNED]' : '[N/A]'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass p-6 rounded-2xl border-slate-800 bg-slate-950/40 space-y-4">
            <div className="flex items-center space-x-3">
               <Info className="w-4 h-4 text-cyan-500" />
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Threat Window</h4>
            </div>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
               As Quantum Volume (QV) scales towards fault-tolerance, the <span className="text-rose-500">SNDL</span> (Store Now, Decrypt Later) window narrows. 1024-bit RSA is projected to be vulnerable within the next 4-7 years.
            </p>
         </div>
         <div className="glass p-6 rounded-2xl border-slate-800 bg-slate-950/40 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-500">
               <ShieldCheck className="w-4 h-4" />
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NIST Compliance Status</h4>
            </div>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
               FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) are now the mandatory standards for all federal data-at-rest and transit security protocols.
            </p>
         </div>
         <div className="glass p-6 rounded-2xl border-slate-800 bg-slate-950/40 space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
               <TrendingUp className="w-4 h-4" />
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Migration Velocity</h4>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-[9px] font-black uppercase text-slate-600">
                  <span>Industry Adoption</span>
                  <span>42%</span>
               </div>
               <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 w-[42%]"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
