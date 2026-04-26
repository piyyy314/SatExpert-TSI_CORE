
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
    <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[220px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Brain className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">STIA Intel Situation Report</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={exportSitrep}
              disabled={isLoading}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-blue-400 hover:text-white transition-all disabled:opacity-20"
              title="Export SITREP"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[9px] font-mono text-slate-400">
              TS/SCI // NOFORN
            </div>
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="h-3 w-3/4 bg-slate-800/50 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-slate-800/50 rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-slate-800/50 rounded animate-pulse"></div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold text-slate-300 leading-relaxed font-mono"
              >
                <span className="text-blue-400 mr-2 opacity-50">&gt;&gt;</span>
                {sitrep}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Source: STIA_FLASH</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Integrity: VERIFIED</span>
        </div>
        <div className="flex items-center space-x-1.5 ml-auto">
          <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>
    </div>
  );
};
