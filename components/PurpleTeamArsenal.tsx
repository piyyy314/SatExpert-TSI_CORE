import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  Shield, 
  Terminal as TerminalIcon, 
  Bug, 
  Flame, 
  Crosshair, 
  Activity, 
  Search, 
  Cpu, 
  Layers, 
  Lock,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface FuzzingSession {
  id: string;
  target: string;
  crashes: number;
  speed: number;
  coverage: number;
  logs: string[];
}

export const PurpleTeamArsenal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'0day' | 'forge' | 'ops'>('0day');
  const [fuzzing, setFuzzing] = useState<FuzzingSession | null>(null);
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);

  const startFuzzing = (target: string) => {
    setFuzzing({
      id: Math.random().toString(36).substr(2, 9),
      target,
      crashes: 0,
      speed: 1240,
      coverage: 0,
      logs: [`[INIT] Spawning AFL++ instance for ${target}...`, `[PIPE] Hooking instrumentation for llvm-mode...`]
    });
  };

  useEffect(() => {
    if (!fuzzing) return;
    const interval = setInterval(() => {
      setFuzzing(prev => {
        if (!prev) return null;
        const newCoverage = Math.min(100, prev.coverage + Math.random() * 0.5);
        const newCrash = Math.random() > 0.98 ? prev.crashes + 1 : prev.crashes;
        const newLogs = [...prev.logs];
        if (newCrash > prev.crashes) newLogs.push(`[CRASH] Found unique SIGSEGV at 0x${Math.floor(Math.random()*0x10000000).toString(16)}`);
        if (newLogs.length > 5) newLogs.shift();
        
        return {
          ...prev,
          coverage: newCoverage,
          crashes: newCrash,
          speed: prev.speed + (Math.random() - 0.5) * 50,
          logs: newLogs
        };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [fuzzing]);

  const runForge = () => {
    setIsForging(true);
    setForgeProgress(0);
  };

  useEffect(() => {
    if (!isForging) return;
    const interval = setInterval(() => {
      setForgeProgress(p => {
        if (p >= 100) {
          setIsForging(false);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isForging]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.1)]">
            <Flame className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Purple Team <span className="text-rose-500">Arsenal</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 italic">
              Advanced 0-Day Research & Exploit Forge // Operation "ULTRAVIOLET"
            </p>
          </div>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
          {[
            { id: '0day', label: '0-Day Lab', icon: <Search className="w-4 h-4" /> },
            { id: 'forge', label: 'Exploit Forge', icon: <Zap className="w-4 h-4" /> },
            { id: 'ops', label: 'Ops Dashboard', icon: <Layers className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[9px] ${
                activeTab === tab.id 
                  ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-[650px]">
        <AnimatePresence mode="wait">
          {activeTab === '0day' && (
            <motion.div
              key="0day"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Target Selection */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-rose-500" /> Vulnerability Research
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'XNU Kernel (macOS/iOS)', icon: <Cpu className="w-4 h-4" />, risk: 'CRITICAL' },
                      { name: 'Chromium Mojo IPC', icon: <Layers className="w-4 h-4" />, risk: 'HIGH' },
                      { name: 'Linux Netfilter', icon: <Shield className="w-4 h-4" />, risk: 'HIGH' },
                      { name: 'Webkit JIT Engine', icon: <Zap className="w-4 h-4" />, risk: 'CRITICAL' },
                    ].map(target => (
                      <button
                        key={target.name}
                        onClick={() => startFuzzing(target.name)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left group flex items-center justify-between ${
                          fuzzing?.target === target.name 
                            ? 'bg-rose-500/10 border-rose-500/30' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                           <div className={`p-2 rounded-lg ${fuzzing?.target === target.name ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                             {target.icon}
                           </div>
                           <div>
                              <span className="block text-[11px] font-black text-white uppercase tracking-tighter">{target.name}</span>
                              <span className={`text-[8px] font-bold ${
                                target.risk === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                              }`}>{target.risk} SEVERITY</span>
                           </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${fuzzing?.target === target.name ? 'rotate-90 text-rose-500' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40">
                   <div className="flex items-center space-x-2 mb-4">
                      <Bug className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Research Methodology</h4>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                      Using coverage-guided evolutionary fuzzing combined with static symbolic execution to identify unreachable code paths in privileged processes.
                   </p>
                </div>
              </div>

              {/* Fuzzing Cockpit */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden h-full flex flex-col">
                  {fuzzing ? (
                    <>
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin flex items-center justify-center">
                               <RefreshCw className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-white uppercase tracking-tight">{fuzzing.target} <span className="text-slate-500">_RESEARCH</span></h3>
                               <span className="text-[9px] font-mono text-rose-500 animate-pulse">FUZZING_ACTIVE // INSTANCE_{fuzzing.id}</span>
                            </div>
                         </div>
                         <div className="flex space-x-4">
                            <div className="text-right">
                               <span className="text-[8px] font-black text-slate-600 block uppercase">Crashes</span>
                               <span className="text-lg font-black text-rose-500 font-mono">{fuzzing.crashes}</span>
                            </div>
                            <div className="text-right">
                               <span className="text-[8px] font-black text-slate-600 block uppercase">Exec/s</span>
                               <span className="text-lg font-black text-white font-mono">{Math.floor(fuzzing.speed)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coverage</span>
                               <span className="text-[10px] font-mono text-cyan-400">{fuzzing.coverage.toFixed(2)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 className="h-full bg-cyan-500" 
                                 animate={{ width: `${fuzzing.coverage}%` }}
                               />
                            </div>
                         </div>
                         <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entropy</span>
                               <span className="text-[10px] font-mono text-rose-400">HIGH</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 className="h-full bg-rose-500" 
                                 animate={{ width: `${60 + Math.random() * 20}%` }}
                               />
                            </div>
                         </div>
                      </div>

                      <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-900 p-6 font-mono text-[10px] text-slate-500 overflow-hidden relative">
                         <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                         <div className="space-y-1">
                            {fuzzing.logs.map((log, i) => (
                              <div key={i} className="flex space-x-4">
                                <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                                <span className={(log || '').includes('[CRASH]') ? 'text-rose-500 font-bold bg-rose-500/10 px-1 rounded' : ''}>{log}</span>
                              </div>
                            ))}
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-6 opacity-30">
                       <Search className="w-16 h-16 text-slate-600" />
                       <div className="text-center">
                          <p className="text-lg font-black text-white uppercase tracking-widest">Select Target to Begin Analysis</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 italic">Awaiting high-fidelity fuzzing input</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'forge' && (
            <motion.div
              key="forge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="glass p-10 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                     <Zap className="w-64 h-64 text-rose-500" />
                  </div>

                  <div className="max-w-2xl space-y-8 relative z-10">
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Exploit <span className="text-rose-500">Forge</span></h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em]">Integrated Payload Construction Environment</p>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Environment Selection</label>
                           <div className="flex flex-wrap gap-2">
                              {['LINUX_X64', 'WINDOWS_X64', 'ARM_IOS', 'WASM'].map(env => (
                                <button key={env} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                                   {env}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Primitive Selection</label>
                           <div className="flex flex-wrap gap-2">
                              {['UAF', 'HEAP_OVERFLOW', 'TYPE_CONFUSION', 'OOB_READ'].map(priv => (
                                <button key={priv} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                                   {priv}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 space-y-6">
                        <button 
                          onClick={runForge}
                          disabled={isForging}
                          className="w-full py-6 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center space-x-4"
                        >
                           {isForging ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                           <span>{isForging ? 'CONSTRUCTING_PAYLOAD...' : 'ASSEMBLE_EXPLOIT_POC'}</span>
                        </button>

                        <AnimatePresence>
                           {isForging && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               className="space-y-4"
                             >
                                <div className="flex justify-between items-center text-[10px] font-black px-2">
                                   <span className="text-slate-500 uppercase tracking-widest italic">Forging Alpha Version...</span>
                                   <span className="text-rose-500 font-mono tracking-widest">{forgeProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                   <motion.div 
                                     className="h-full bg-gradient-to-r from-rose-600 to-rose-400"
                                     animate={{ width: `${forgeProgress}%` }}
                                   />
                                </div>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 font-mono text-[9px] text-slate-600 space-y-1">
                                   <p className="text-emerald-500">[MSG] Stage 1: Controlling PC at 0xdeadbeef...</p>
                                   <p className="text-cyan-500">[MSG] Stage 2: Initializing ROP chain (34 gadgets mapped)...</p>
                                   {forgeProgress > 80 && <p className="text-rose-500 font-bold">[WARN] ASLR slide detected. Recalculating offsets...</p>}
                                </div>
                             </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'ops' && (
            <motion.div
              key="ops"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Active Hunts', value: '42', icon: <Search className="text-cyan-500" />, trend: '+12%' },
                    { label: 'Blocked Zero-Days', value: '08', icon: <Shield className="text-emerald-500" />, trend: 'Stable' },
                    { label: 'Threat Intelligence', value: 'Alpha-9', icon: <Eye className="text-amber-500" />, trend: 'HIGH_ALERT' },
                    { label: 'Network Integrity', value: '99.9%', icon: <Activity className="text-rose-500" />, trend: 'Optimal' },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 relative overflow-hidden">
                       <div className="flex items-center justify-between mb-4">
                          <div className="p-2 rounded-lg bg-slate-900">
                             {stat.icon}
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                             (stat?.trend || '').includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 
                             (stat?.trend || '').includes('ALERT') ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 
                             'bg-slate-800 text-slate-500'
                          }`}>
                             {stat.trend}
                          </span>
                       </div>
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</h4>
                       <p className="text-2xl font-black text-white mt-1 italic tracking-tighter">{stat.value}</p>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Purple Team <span className="text-rose-500">Correlation</span></h3>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-Domain Attack & Defense Synchronization</p>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                           <Activity className="w-5 h-5 text-cyan-500" />
                        </div>
                     </div>
                     
                     <div className="relative h-64 border border-slate-800 rounded-3xl bg-slate-950/50 overflow-hidden">
                        {/* Active Waveform */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                           <div className="flex space-x-1 items-end">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ height: 20 }}
                                  animate={{ height: [20, 80, 40, 100, 20] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                                  className="w-2 bg-rose-500 rounded-t-full"
                                />
                              ))}
                           </div>
                        </div>
                        
                        <div className="relative z-10 p-6 flex items-center justify-center h-full">
                           <div className="flex space-x-12">
                              <div className="text-center group">
                                 <div className="w-20 h-20 rounded-full border-4 border-rose-500/30 flex items-center justify-center bg-rose-500/10 group-hover:bg-rose-500/20 transition-all cursor-pointer">
                                    <Crosshair className="w-10 h-10 text-rose-500" />
                                 </div>
                                 <span className="block mt-4 text-[10px] font-black text-white uppercase tracking-widest">Offense (Red)</span>
                              </div>
                              <div className="flex flex-col items-center justify-center">
                                 <div className="w-16 h-px bg-slate-800 relative">
                                    <motion.div 
                                      animate={{ left: ['0%', '100%'] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                      className="absolute top-0 -translate-y-1/2 w-4 h-[2px] bg-cyan-500 shadow-[0_0_10px_cyan]"
                                    />
                                 </div>
                                 <span className="text-[8px] font-black text-slate-700 uppercase mt-2">Correlation</span>
                              </div>
                              <div className="text-center group">
                                 <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all cursor-pointer">
                                    <Shield className="w-10 h-10 text-cyan-500" />
                                 </div>
                                 <span className="block mt-4 text-[10px] font-black text-white uppercase tracking-widest">Defense (Blue)</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 flex flex-col">
                     <div className="flex items-center space-x-3 mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Incident Triage</h3>
                     </div>
                     <div className="space-y-4 flex-grow">
                        {[
                          { title: 'Lateral Movement', type: 'RED', status: 'ACTIVE', time: '2m ago' },
                          { title: 'YARA Detection', type: 'BLUE', status: 'MITIGATED', time: '12m ago' },
                          { title: 'SSH Brute Force', type: 'RED', status: 'BLOCKING', time: '14m ago' },
                          { title: 'Credential Leak', type: 'RED', status: 'TRIAGE', time: '1h ago' },
                        ].map((incident, i) => (
                           <div key={i} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all cursor-pointer">
                              <div className="flex items-center space-x-3">
                                 <div className={`w-1.5 h-1.5 rounded-full ${incident.type === 'RED' ? 'bg-rose-500 shadow-[0_0_5px_rose]' : 'bg-cyan-500 shadow-[0_0_5px_cyan]'}`}></div>
                                 <div>
                                    <span className="block text-[10px] font-black text-white uppercase tracking-tighter">{incident.title}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{incident.time}</span>
                                 </div>
                              </div>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                                incident.status === 'ACTIVE' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                              }`}>{incident.status}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                 <Lock className="w-3 h-3 text-slate-500" />
              </div>
            ))}
          </div>
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Active Operatives: 03 (Classified)</span>
        </div>
        <div className="flex items-center space-x-3">
           <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic animate-pulse">Critical Research In Progress</span>
           <div className="w-px h-3 bg-slate-800"></div>
           <span className="text-[9px] font-black text-slate-400 font-mono tracking-widest">UTC 2026-05-02</span>
        </div>
      </footer>
    </div>
  );
};
