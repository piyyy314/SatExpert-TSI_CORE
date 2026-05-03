
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, Cpu, Download, Terminal, Flag, CheckCircle2, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'recon', name: 'Reconnaissance', icon: <Search className="w-4 h-4" />, desc: 'Harvesting email addresses, conference information, etc.' },
  { id: 'weapon', name: 'Weaponization', icon: <Package className="w-4 h-4" />, desc: 'Coupling exploit with backdoor into deliverable payload.' },
  { id: 'deliver', name: 'Delivery', icon: <Truck className="w-4 h-4" />, desc: 'Delivering weaponized bundle to the victim via email, web, USB, etc.' },
  { id: 'exploit', name: 'Exploitation', icon: <Cpu className="w-4 h-4" />, desc: 'Exploiting a vulnerability to execute code on victim’s system.' },
  { id: 'install', name: 'Installation', icon: <Download className="w-4 h-4" />, desc: 'Installing malware on the asset.' },
  { id: 'c2', name: 'Command & Control', icon: <Terminal className="w-4 h-4" />, desc: 'Command channel for remote manipulation of victim.' },
  { id: 'actions', name: 'Actions on Objectives', icon: <Flag className="w-4 h-4" />, desc: 'With hands on keyboard access, intruders accomplish their original goals.' }
];

export const CyberKillChain: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{ id: string, msg: string, time: string }[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Math.random().toString(36), msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStageIdx(0);
    addLog("CKC_INIT: Initiating full-spectrum attack simulation.");
    if (addMissionLog) addMissionLog("CYBER_KILL_CHAIN: Simulation started.", "active");
  };

  useEffect(() => {
    if (!isRunning || activeStageIdx === -1) return;

    if (activeStageIdx < STAGES.length) {
      const timer = setTimeout(() => {
        addLog(`STAGE_SUCCESS: ${STAGES[activeStageIdx].name} phase complete.`);
        if (addMissionLog) addMissionLog(`CKC_UPDATE: Phase ${STAGES[activeStageIdx].name} achieved.`, 'info');
        
        if (activeStageIdx === STAGES.length - 1) {
          setIsRunning(false);
          addLog("CKC_COMPLETE: Objectives achieved. Target environment compromised.");
          if (addMissionLog) addMissionLog("CKC_SUCCESS: Mission objectives finalized.", "BREACH");
        } else {
          setActiveStageIdx(prev => prev + 1);
        }
      }, 3000 + Math.random() * 2000);
      return () => clearTimeout(timer);
    }
  }, [isRunning, activeStageIdx]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
           <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Cyber_Kill_Chain_Analyzer</h3>
           </div>
           <button 
             onClick={startSimulation}
             disabled={isRunning}
             className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               isRunning 
               ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
               : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-95'
             }`}
           >
             {isRunning ? 'Operation_In_Progress' : 'Simulate_Attack'}
           </button>
        </div>

        <div className="relative">
           {/* Connection Line */}
           <div className="absolute top-8 left-8 right-8 h-1 bg-slate-800 z-0" />
           <motion.div 
             className="absolute top-8 left-8 h-1 bg-red-600 z-0 shadow-[0_0_10px_#ef4444]" 
             animate={{ width: `${(Math.max(0, activeStageIdx) / (STAGES.length - 1)) * 100}%` }}
           />

           <div className="grid grid-cols-7 gap-4 relative z-10">
              {STAGES.map((stage, idx) => (
                <div key={stage.id} className="flex flex-col items-center group">
                   <motion.div 
                     className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                       activeStageIdx >= idx 
                       ? 'bg-red-600 border-red-400 text-white shadow-2xl' 
                       : 'bg-slate-950 border-slate-800 text-slate-600'
                     }`}
                     animate={activeStageIdx === idx ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0px #ef4444", "0 0 20px #ef4444", "0 0 0px #ef4444"] } : {}}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   >
                     {activeStageIdx > idx ? <CheckCircle2 className="w-8 h-8" /> : stage.icon}
                   </motion.div>
                   <div className="mt-4 text-center">
                      <div className={`text-[8px] font-black uppercase tracking-widest ${activeStageIdx >= idx ? 'text-white' : 'text-slate-600'}`}>
                         {stage.name}
                      </div>
                      <div className="text-[7px] text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity max-w-[100px] mx-auto leading-tight italic">
                         {stage.desc}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phase_Intelligence</h4>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[140px]">
                 {activeStageIdx === -1 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-700">
                      <AlertCircle className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Simulation</span>
                   </div>
                 ) : (
                   <motion.div 
                     key={activeStageIdx}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-4"
                   >
                      <div className="flex items-center space-x-3">
                         <div className="p-2 bg-red-500/20 rounded-lg text-red-500">{STAGES[activeStageIdx].icon}</div>
                         <h5 className="text-[14px] font-black text-white">{STAGES[activeStageIdx].name}</h5>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{STAGES[activeStageIdx].desc}</p>
                      <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                         <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Executing Vector_A99</span>
                      </div>
                   </motion.div>
                 )}
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational_Log</h4>
              <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-4 h-[140px] overflow-y-auto space-y-2 font-mono">
                 {logs.length === 0 ? (
                   <div className="text-[9px] text-slate-800 italic">No events recorded.</div>
                 ) : (
                   logs.map(log => (
                     <div key={log.id} className="text-[9px] flex space-x-3 border-b border-slate-900 pb-1">
                        <span className="text-slate-600">[{log.time}]</span>
                        <span className="text-slate-400">{log.msg}</span>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
