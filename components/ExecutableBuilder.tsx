import React, { useState } from 'react';
import { Terminal, Shield, Cpu, Activity, Zap, Play, Download, Settings, Code, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExecutableBuilder: React.FC = () => {
  const [targetOS, setTargetOS] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [arch, setArch] = useState<'x64' | 'x86' | 'arm64'>('x64');
  const [format, setFormat] = useState<'exe' | 'dll' | 'elf' | 'macho'>('exe');
  
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadReady, setDownloadReady] = useState(false);

  const startBuild = () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setProgress(0);
    setDownloadReady(false);
    setLogs([
      `[INIT] Starting payload generation for ${targetOS}/${arch}...`,
      `[CONF] Output format set to .${format}`
    ]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      
      setProgress(currentProgress);

      if (currentProgress > 20 && currentProgress <= 40 && logs.length === 2) {
        setLogs(prev => [...prev, `[COMP] Obfuscating signatures...`]);
      } else if (currentProgress > 40 && currentProgress <= 60 && logs.length === 3) {
        setLogs(prev => [...prev, `[COMP] Compiling telemetry bypass hooks...`]);
      } else if (currentProgress > 60 && currentProgress <= 80 && logs.length === 4) {
        setLogs(prev => [...prev, `[COMP] Linking with encrypted shellcode...`]);
      } else if (currentProgress > 80 && currentProgress < 100 && logs.length === 5) {
        setLogs(prev => [...prev, `[LINK] Stripping symbols...`]);
      } else if (currentProgress === 100) {
        clearInterval(interval);
        setLogs(prev => [...prev, `[DONE] Payload successfully compiled.`]);
        setTimeout(() => {
           setIsBuilding(false);
           setDownloadReady(true);
        }, 500);
      }
    }, 400);
  };

  const downloadPayload = () => {
    setLogs(prev => [...prev, `[SYS] Downloading payload_${targetOS}_${arch}.${format}...`]);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4 relative z-10">
        <FileCode className="w-6 h-6 text-emerald-500" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Payload Generator</h2>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-emerald-900/50">BUILD_ENV</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden relative z-10">
        {/* Configuration */}
        <div className="space-y-6 flex flex-col">
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Architecture</label>
                <div className="grid grid-cols-3 gap-2">
                   {['x64', 'x86', 'arm64'].map(a => (
                     <button
                       key={a}
                       onClick={() => setArch(a as any)}
                       disabled={isBuilding}
                       className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${arch === a ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                     >
                       {a}
                     </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Operating System</label>
                <div className="grid grid-cols-3 gap-2">
                   {['windows', 'linux', 'macos'].map(os => (
                     <button
                       key={os}
                       onClick={() => setTargetOS(os as any)}
                       disabled={isBuilding}
                       className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${targetOS === os ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                     >
                       {os}
                     </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Output Format</label>
                <div className="grid grid-cols-4 gap-2">
                   {['exe', 'dll', 'elf', 'macho'].map(f => (
                     <button
                       key={f}
                       onClick={() => setFormat(f as any)}
                       disabled={isBuilding}
                       className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${format === f ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                     >
                       .{f}
                     </button>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="mt-auto pt-4 relative">
             <button
                onClick={startBuild}
                disabled={isBuilding}
                className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  isBuilding 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
             >
                {isBuilding ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                <span>{isBuilding ? 'COMPILING...' : 'GENERATE PAYLOAD'}</span>
             </button>
             
             {isBuilding && (
                <div className="absolute top-full left-0 w-full h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                   <motion.div 
                     className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                   />
                </div>
             )}
          </div>
        </div>

        {/* Console / Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
           <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Build Console</span>
           </div>
           
           <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-2 text-xs">
              {logs.length === 0 ? (
                 <div className="text-slate-600 italic">Ready to compile. Configure settings and initiate build...</div>
              ) : (
                 logs.map((log, i) => (
                    <div key={i} className={
                       log.includes('[DONE]') ? 'text-emerald-400 font-bold' : 
                       log.includes('[INIT]') ? 'text-cyan-400' : 'text-slate-400'
                    }>
                       {log}
                    </div>
                 ))
              )}
           </div>

           {downloadReady && (
              <div className="p-4 bg-slate-950 border-t border-emerald-900/50">
                 <button
                    onClick={downloadPayload}
                    className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-emerald-500/30 transition-all"
                 >
                    <Download className="w-4 h-4" />
                    <span>Download payload_{targetOS}_${arch}.{format}</span>
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
