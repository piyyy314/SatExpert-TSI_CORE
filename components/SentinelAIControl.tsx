import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Activity, 
  Eye, 
  Terminal, 
  Network, 
  Lock, 
  Radio, 
  Target,
  RefreshCw,
  AlertTriangle,
  Database,
  BrainCircuit,
  Workflow
} from 'lucide-react';

export const SentinelAIControl: React.FC = () => {
  const [systemLoad, setSystemLoad] = useState(32);
  const [activeThreads, setActiveThreads] = useState(128);
  const [scannedNodes, setScannedNodes] = useState(0);
  const [integrityScale, setIntegrityScale] = useState(99.98);
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] Sentinel Core v6.0.4 initialized...',
    '[AUTH] Biometric handshake confirmed.',
    '[LINK] Establishing mesh connection to Orbital Stack...'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(30 + Math.random() * 15);
      setActiveThreads(120 + Math.floor(Math.random() * 20));
      setIntegrityScale(99.9 + Math.random() * 0.09);
      
      if (Math.random() > 0.8) {
        const newLogs = [
          `[SCAN] Auditing node 0x${Math.floor(Math.random()*0x1000).toString(16)}...`,
          `[INFO] Neural cache synchronized.`,
          `[Z-DAY] Pattern matching complete for XNU_KERNEL_OBJ.`
        ];
        setLogs(prev => [...prev.slice(-8), newLogs[Math.floor(Math.random() * newLogs.length)]]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const initiateSync = () => {
    setIsSyncing(true);
    setLogs(prev => [...prev, '[SYNC] Handshake with Orbital_Mesh_01 successful...', '[SYNC] Downloading latest CVE definitions...']);
    setTimeout(() => {
      setIsSyncing(false);
      setLogs(prev => [...prev, '[SYNC] Database hot-swapped. Intelligence mesh current.']);
    }, 3000);
  };

  const recalibrateNeural = () => {
    setIsRecalibrating(true);
    setLogs(prev => [...prev, '[CALIB] Purging neural cache...', '[CALIB] Resetting weights for V8_JIT_Sandbox...']);
    setTimeout(() => {
      setIsRecalibrating(false);
      setLogs(prev => [...prev, '[CALIB] Recalibration successful. Logic gates aligned.']);
    }, 4000);
  };

  const handleExportSyslog = () => {
    const logData = {
        metadata: {
            timestamp: new Date().toISOString(),
            systemLoad,
            activeThreads,
            integrityScale,
            isSyncing,
            isRecalibrating
        },
        logs: logs
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_SYSLOG_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGlobalMesh = () => {
    const logData = {
        metadata: { timestamp: new Date().toISOString() },
        nodes: [
            { region: 'North America', status: 'SYNCHRONIZED', val: 100 },
            { region: 'Eurasia', status: 'DEPLOYING', val: 84 },
            { region: 'Pacific Rim', status: 'DEPLOYING', val: 72 },
            { region: 'Orbital Mesh', status: 'ACTIVE', val: 99 },
        ]
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GLOBAL_MESH_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportInterception = () => {
    const logData = {
        metadata: { timestamp: new Date().toISOString() },
        networks: [
            { name: 'Starlink_G3', strength: '88', status: 'ACTIVE' },
            { name: 'Iridium_Next', strength: '42', status: 'LOCKED' },
            { name: 'Inmarsat_GX', strength: '95', status: 'ACTIVE' },
        ]
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INTERCEPTION_MESH_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className={`absolute inset-0 bg-cyan-500 blur-2xl opacity-20 ${isSyncing || isRecalibrating ? 'animate-ping' : 'animate-pulse'}`}></div>
            <div className={`p-4 bg-slate-900 rounded-3xl border relative z-10 transition-colors ${isRecalibrating ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-cyan-500/30'}`}>
              <BrainCircuit className={`w-10 h-10 ${isRecalibrating ? 'text-rose-500' : 'text-cyan-400'}`} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
              Sentinel <span className="text-cyan-500">Core v6</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 flex items-center">
              <Activity className="w-3 h-3 mr-2 text-rose-500 animate-pulse" />
              {isSyncing ? 'Synchronizing Intelligence Mesh...' : isRecalibrating ? 'Recalibrating Neural Weights...' : 'Autonomous Threat Mitigation Network // Active State'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'System Load', value: `${Math.floor(systemLoad)}%`, color: 'text-cyan-400' },
             { label: 'Neural Threads', value: activeThreads, color: 'text-white' },
             { label: 'Integrity', value: `${integrityScale.toFixed(2)}%`, color: 'text-emerald-400' },
             { label: 'Uptime', value: '42d 12h', color: 'text-amber-400' },
           ].map((stat, i) => (
             <div key={i} className="glass px-4 py-2 rounded-xl bg-slate-900/40 border-slate-800 flex flex-col justify-center">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                <span className={`text-sm font-black font-mono tracking-tighter ${stat.color}`}>{stat.value}</span>
             </div>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Strategic Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40 flex-grow relative overflow-hidden flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="flex items-center space-x-3">
                    <Network className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Intelligence Mesh</h3>
                 </div>
                <div className="flex space-x-2">
                    <button 
                      onClick={handleExportGlobalMesh}
                      className="px-3 py-1 bg-cyan-900/20 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                    >
                      Export_JSON
                    </button>
                    <button 
                      onClick={() => setLogs(prev => [...prev, '[INFO] Refreshing global intelligence vectors...'])}
                      className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-500/20"
                    >
                      LIVE_FEED
                    </button>
                    <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700">WORLD_WIDE_MAP</button>
                 </div>
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="relative flex items-center justify-center">
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px]"></div>
                    
                    <div className="relative scale-110">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                          className="w-48 h-48 rounded-full border border-cyan-500/20 border-dashed relative"
                        >
                          {/* Orbits */}
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="absolute inset-4 rounded-full border border-white/5" style={{ transform: `scale(${1 - i*0.2})` }}></div>
                          ))}
                          
                          {/* Scanner Line */}
                          <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                              className="absolute top-1/2 left-1/2 w-[96px] h-[1px] bg-gradient-to-r from-transparent to-cyan-500 origin-left"
                          />
                        </motion.div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-slate-950 rounded-2xl border border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                              <Target className="w-5 h-5 text-cyan-400" />
                          </div>
                        </div>

                        {/* Active Targets */}
                        <AnimatePresence>
                          {Array.from({ length: 4 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              style={{ 
                                left: `${50 + Math.cos(i * 90) * 40}%`, 
                                top: `${50 + Math.sin(i * 90) * 40}%` 
                              }}
                              className="absolute w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"
                            />
                          ))}
                        </AnimatePresence>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">World-Wide Deployment Status</h4>
                       <div className="grid grid-cols-2 gap-4">
                          {[
                            { region: 'North America', status: 'SYNCHRONIZED', val: 100 },
                            { region: 'Eurasia', status: 'DEPLOYING', val: 84 },
                            { region: 'Pacific Rim', status: 'DEPLOYING', val: 72 },
                            { region: 'Orbital Mesh', status: 'ACTIVE', val: 99 },
                          ].map((region, i) => (
                            <div key={i} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                               <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">{region.region}</span>
                               <div className="flex items-center justify-between">
                                  <span className={`text-[9px] font-black ${region.val === 100 ? 'text-emerald-500' : 'text-cyan-400'} italic`}>{region.status}</span>
                                  <span className="text-[9px] font-mono text-slate-400">{region.val}%</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                       <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                          <Shield className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">Production Build Verified</span>
                       </div>
                       <p className="text-[8px] text-slate-500 font-bold leading-tight">
                          ENGINE: Vite v6.4.2 / ENVIRONMENT: Production-Hardened. Deployment integrity hash: 8f2a...1e9c
                       </p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                 {[
                   { label: 'Interceptions', value: '1,242', icon: <Radio className="w-4 h-4 text-cyan-500" /> },
                   { label: 'Deflected Attacks', value: '89', icon: <Shield className="w-4 h-4 text-emerald-500" /> },
                   { label: 'Threats Detected', value: '04', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
                   { label: 'Nodes Syncing', value: '18', icon: <RefreshCw className="w-4 h-4 text-amber-500" /> },
                 ].map((item, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex items-center space-x-2">
                         {item.icon}
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <p className="text-lg font-black text-white italic pl-6">{item.value}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                       <Workflow className="w-4 h-4 mr-2 text-cyan-500" /> Logic Flow Audit
                    </h3>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded text-[8px] font-black uppercase">Active</span>
                 </div>
                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black font-mono">
                       <span className="text-slate-500">Mojo_Serialization_Audit</span>
                       <span className="text-emerald-500">PASSED</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <motion.div className="h-full bg-emerald-500 w-full" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black font-mono">
                       <span className="text-slate-500">V8_JIT_Sandbox_Verifier</span>
                       <span className="text-rose-500 animate-pulse">FIXING...</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-rose-500" 
                          animate={{ width: ['20%', '80%', '20%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                       />
                    </div>
                 </div>
              </div>

              <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                       <Lock className="w-4 h-4 mr-2 text-rose-500" /> Crypto Integrity
                    </h3>
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[8px] font-black uppercase">Monitored</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                       <span className="block text-[8px] font-black text-slate-600 uppercase mb-1">Kyber_1024</span>
                       <span className="text-[10px] font-black text-white italic tracking-tighter">SECURE</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-rose-500 border-rose-500/30">
                       <span className="block text-[8px] font-black text-rose-700 uppercase mb-1">RSA_2048</span>
                       <span className="text-[10px] font-black italic tracking-tighter">DEPRECATED</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Console & Action Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40 flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                     <Terminal className="w-5 h-5 text-cyan-500" />
                     <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Core Syslog</h3>
                  </div>
                  {logs.length > 0 && (
                     <button 
                         onClick={handleExportSyslog}
                         className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-900/20 px-2 py-1.5 rounded border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                     >
                         Export_Log
                     </button>
                  )}
              </div>
              <div className="flex-grow bg-slate-950 rounded-3xl border border-slate-900 p-6 font-mono text-[10px] text-slate-500 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                 {logs.map((log, i) => (
                   <div key={i} className="flex space-x-3">
                      <span className="text-slate-800">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                      <span className={(log || '').includes('[Z-DAY]') ? 'text-rose-500 font-bold' : (log || '').includes('[SCAN]') ? 'text-cyan-400' : ''}>{log}</span>
                   </div>
                 ))}
                 <div className="animate-pulse flex items-center space-x-1">
                    <div className="w-2 h-3 bg-cyan-500"></div>
                 </div>
              </div>
              <div className="mt-6 space-y-3">
                 <button 
                  onClick={initiateSync}
                  disabled={isSyncing}
                  className={`w-full py-4 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] ${
                    isSyncing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400'
                  }`}
                 >
                    {isSyncing ? 'Synchronizing...' : 'Initiate System Sync'}
                 </button>
                 <button 
                  onClick={recalibrateNeural}
                  disabled={isRecalibrating}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border ${
                    isRecalibrating ? 'bg-rose-900/20 border-rose-500 text-rose-500' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                 >
                    {isRecalibrating ? 'Recalibrating...' : 'Neural Recalibration'}
                 </button>
              </div>
           </div>

           <div className="glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
                 <div className="flex items-center space-x-3 text-rose-500">
                    <Radio className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-widest italic">Interception Mesh</h3>
                 </div>
                 <button 
                     onClick={handleExportInterception}
                     className="text-[8px] font-black uppercase text-rose-400 bg-rose-900/20 px-2 py-1.5 rounded border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors"
                 >
                     Export_Mesh
                 </button>
              </div>
              <div className="space-y-4">
                 {[
                   { name: 'Starlink_G3', strength: '88', status: 'ACTIVE' },
                   { name: 'Iridium_Next', strength: '42', status: 'LOCKED' },
                   { name: 'Inmarsat_GX', strength: '95', status: 'ACTIVE' },
                 ].map((net, i) => (
                   <div key={i} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                         <span className="block text-[11px] font-black text-white italic uppercase tracking-tighter">{net.name}</span>
                         <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Signal: {net.strength}%</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                        net.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                         {net.status}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      
      <footer className="pt-4 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
         <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <Database className="w-3 h-3 mr-2" /> Central Records: SYNCHRONIZED
            </span>
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-2" /> Human Oversight: BYPASSED
            </span>
         </div>
         <div className="text-cyan-500 italic">
            v6 Deployment Cycle: OMEGA-01
         </div>
      </footer>
    </div>
  );
};
