
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Satellite } from '../types.ts';
import { generateSatelliteSitrep } from '../services/geminiService.ts';
import { Terminal, ShieldCheck, Activity, Brain, Download } from 'lucide-react';

interface Props {
  selectedSatellite: Satellite;
  defcon: number;
}

export const SitrepBoard: React.FC<Props> = ({ selectedSatellite, defcon }) => {
  const [sitrep, setSitrep] = React.useState<string>('INITIATING_INTEL_UPLINK...');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const updateSitrep = async () => {
      setIsLoading(true);
      const report = await generateSatelliteSitrep(selectedSatellite, defcon);
      setSitrep(report);
      setIsLoading(false);
    };
    updateSitrep();
  }, [selectedSatellite, defcon]);

  const exportSitrep = () => {
    if (!sitrep) return;
    const report = `
STIA SITUATION REPORT (SITREP)
------------------------------
TARGET: ${selectedSatellite.name}
DEFCON: ${defcon}
TIMESTAMP: ${new Date().toISOString()}

INTELLIGENCE SUMMARY:
${sitrep}

CLASSIFICATION: TS/SCI // NOFORN
STIA_CMD: END_SITREP
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_SITREP_${selectedSatellite.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`glass p-8 rounded-[3rem] border-2 bg-slate-950/60 min-h-[300px] flex flex-col justify-between shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-700 ${defcon <= 2 ? 'border-red-600/40 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-slate-800'}`}>
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
         <Brain className="w-48 h-48 text-red-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-5">
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-2xl border-2 transition-all duration-500 shadow-2xl ${defcon <= 2 ? 'bg-red-500 text-white border-white animate-pulse' : 'bg-slate-900 text-red-500 border-slate-800 group-hover:border-red-500/50'}`}>
              <Brain className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic leading-tight">Intel_Situation_Report</h3>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">STIA_Aegis_Processor_v5.4</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={exportSitrep}
              disabled={isLoading}
              className="group flex items-center space-x-3 px-5 py-3 bg-slate-900 hover:bg-white text-slate-500 hover:text-red-600 border-2 border-slate-800 hover:border-white rounded-2xl transition-all duration-300 disabled:opacity-20 active:scale-95 shadow-xl"
            >
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">Export</span>
            </button>
            <div className={`px-4 py-2 bg-black border-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-inner ${defcon <= 2 ? 'text-red-500 border-red-500/30' : 'text-slate-600 border-slate-900'}`}>
              TS // SCI
            </div>
          </div>
        </div>

        <div className="relative bg-black/60 p-8 rounded-[2rem] border-2 border-slate-900 shadow-inner min-h-[160px] group/terminal transition-all hover:border-slate-800">
          <div className="absolute top-2 left-2 w-px h-8 bg-gradient-to-b from-red-500 to-transparent opacity-20" />
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="h-2.5 w-3/4 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
                <div className="h-2.5 w-1/2 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
                <div className="h-2.5 w-2/3 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] font-black text-slate-400 leading-relaxed font-mono flex items-start italic tracking-tighter"
              >
                <span className={`text-red-500 mr-4 transition-all duration-500 ${defcon <= 2 ? 'animate-pulse scale-125' : ''}`}>❱</span>
                <div className="whitespace-pre-wrap">{sitrep}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-6 border-t-2 border-slate-950 pt-8 relative">
        <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-red-600/30 to-transparent" />
        <div className="flex items-center space-x-3 group/source">
          <Terminal className="w-4 h-4 text-slate-700 group-hover:text-red-500" />
          <span className="text-[11px] text-slate-700 font-black uppercase tracking-widest group-hover:text-slate-500 transition-colors italic">Source: STIA_FLASH_v9</span>
        </div>
        <div className="flex items-center space-x-3 group/integrity">
          <ShieldCheck className="w-4 h-4 text-emerald-600 transition-transform group-hover:rotate-12" />
          <span className="text-[11px] text-slate-700 font-black uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">Integrity: Locked</span>
        </div>
        <div className="flex items-center space-x-3 ml-auto bg-red-600/10 px-5 py-2 rounded-full border-2 border-red-500/20 shadow-xl group/live">
          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[10px] text-red-500 font-black uppercase tracking-widest italic tracking-[0.2em]">Live_Feed</span>
        </div>
      </div>
    </div>
  );
};
