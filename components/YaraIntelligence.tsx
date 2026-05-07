
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, FileSearch, Code, Terminal, Boxes, Zap, Fingerprint, Search } from 'lucide-react';

interface YaraRule {
  name: string;
  description: string;
  strings: { id: string; pattern: string; type: string }[];
  condition: string;
}

const YARA_DATABASE: YaraRule[] = [
  {
    name: 'VSAT_Firmware_Backdoor',
    description: 'Detects known backdoor triggers and debug shells in satellite terminal firmware.',
    strings: [
      { id: '$s1', pattern: '"Tr1gg3r"', type: 'ascii' },
      { id: '$s2', pattern: '"backdoor_vsat"', type: 'ascii' },
      { id: '$s3', pattern: '"debug_shell"', type: 'ascii' }
    ],
    condition: 'any of them'
  },
  {
    name: 'CVE_2024_6199_RCE',
    description: 'Identifies command injection patterns targeting modern satellite gateway vulnerabilities.',
    strings: [
      { id: '$c1', pattern: '"; exec"', type: 'nocase' },
      { id: '$c2', pattern: '"| sh"', type: 'nocase' },
      { id: '$c3', pattern: '"$(whoami)"', type: 'ascii' }
    ],
    condition: 'any of them'
  },
  {
    name: 'VSAT_Hardcoded_Credentials',
    description: 'Flags binaries containing multiple hardcoded administrative credentials.',
    strings: [
      { id: '$p1', pattern: '"admin"', type: 'nocase' },
      { id: '$p2', pattern: '"password"', type: 'nocase' },
      { id: '$p3', pattern: '"secret"', type: 'nocase' }
    ],
    condition: '2 of ($p*)'
  }
];

export const YaraIntelligence: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<YaraRule>(YARA_DATABASE[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<{ msg: string; type: 'info' | 'match' | 'warn' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info' | 'match' | 'warn' = 'info') => {
    setScanLogs(prev => [...prev, { msg, type }]);
  };

  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    addLog('STIA_YARA_INIT: Loading signature database...', 'info');
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 5;
      setScanProgress(Math.min(100, current));
      
      if (current > 20 && current < 25) addLog('Mapping virtual memory segments...', 'info');
      if (current > 50 && current < 55) addLog(`Applying: ${selectedRule.name} signature matrix...`, 'info');
      
      if (current >= 100) {
        clearInterval(interval);
        const match = Math.random() > 0.7;
        if (match) {
          addLog(`ALERT: Match detected for ${selectedRule.name}`, 'match');
          addLog(`OFFSET: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`, 'warn');
        } else {
          addLog('SCAN_COMPLETE: No threats detected in buffer.', 'info');
        }
        setIsScanning(false);
      }
    }, 100);
  };

  const handleExportYaraLog = () => {
    const logData = {
        metadata: {
            timestamp: new Date().toISOString(),
            status: isScanning ? 'IN_PROGRESS' : 'COMPLETED',
            rule: selectedRule.name
        },
        logs: scanLogs
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YARA_SCAN_${selectedRule.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scanLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        </div>
        <div className="flex items-center space-x-6 relative z-10">
           <div className="p-5 bg-red-600/10 rounded-[2rem] border-2 border-red-600/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <ShieldAlert className="w-10 h-10 text-red-500" />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Deep Malware <span className="text-red-500">Intelligence</span></h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 pl-1 italic">Quantum-Heuristic Signature Analysis // STIA_CORE_v8.0</p>
           </div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
            {scanLogs.length > 0 && !isScanning && (
               <button 
                 onClick={handleExportYaraLog}
                 className="px-6 py-4 bg-red-900/20 text-red-400 border-2 border-red-500/50 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
               >
                 Export_Logs
               </button>
            )}
            {!isScanning && (
              <button 
                onClick={startScan}
                className="px-8 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_15px_35px_rgba(239,68,68,0.3)] active:scale-95 flex items-center space-x-4 group/scan"
              >
                <Zap className="w-5 h-5 fill-current group-hover/scan:scale-125 transition-transform" />
                <span>Commence_Full_Scan</span>
              </button>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 shadow-2xl relative overflow-hidden">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center border-b border-slate-800 pb-2">
                 <Terminal className="w-4 h-4 mr-3" />
                 Signatures_Library
              </h3>
              <div className="space-y-3">
                 {YARA_DATABASE.map(rule => (
                   <button 
                     key={rule.name}
                     onClick={() => setSelectedRule(rule)}
                     disabled={isScanning}
                     className={`w-full text-left p-5 rounded-[1.8rem] border-2 transition-all relative overflow-hidden group ${selectedRule.name === rule.name ? 'bg-red-600/10 border-red-600/40 shadow-[0_10px_25px_rgba(239,68,68,0.1)]' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'}`}
                   >
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="text-[13px] font-black text-white uppercase group-hover:text-red-400 transition-colors tracking-tight">{rule.name}</h4>
                         {selectedRule.name === rule.name && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase tracking-tight">{rule.description}</p>
                   </button>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
                 <span className="text-[9px] font-mono text-slate-700">TOTAL_SIGNATURES: 0x03</span>
              </div>
           </div>

           {isScanning && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="glass p-8 rounded-[2.5rem] border-2 border-red-600/30 bg-red-600/5 shadow-[0_20px_40px_rgba(239,68,68,0.15)]"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                         <Zap className="w-3 h-3 text-white animate-pulse" />
                      </div>
                      <span className="text-[11px] font-black text-red-500 uppercase tracking-widest italic">Introspection_Active</span>
                   </div>
                   <span className="text-2xl font-black text-red-500 italic drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{scanProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-[#050810] rounded-full overflow-hidden border-2 border-slate-900 p-0.5 shadow-inner">
                   <motion.div 
                     className="h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${scanProgress}%` }}
                   />
                </div>
             </motion.div>
           )}
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-8">
           <div className="glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-[#0c0e14] flex flex-col h-[450px] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg"></div>
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                 <div className="flex items-center space-x-4">
                    <Code className="w-5 h-5 text-slate-600" />
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest italic">Rule_Definition: {selectedRule.name}</span>
                 </div>
                 <div className="flex space-x-1.5">
                    <span className="px-3 py-1 bg-slate-950 rounded border border-slate-900 text-[9px] font-mono text-red-600 uppercase">YARA_v4.2.0</span>
                 </div>
              </div>
              <div className="flex-grow bg-[#050810] rounded-3xl border-2 border-slate-900 p-10 overflow-auto custom-scrollbar shadow-inner relative z-10">
                 <pre className="text-[14px] font-mono text-red-100/90 leading-loose">
{`rule ${selectedRule.name} {
    meta:
        description = "${selectedRule.description}"
        stia_version = "8.0"

    strings:
${selectedRule.strings.map(s => `        ${s.id} = ${s.pattern} ${s.type}`).join('\n')}

    condition:
        ${selectedRule.condition}
}`}
                 </pre>
              </div>
              <div className="absolute top-10 right-10 opacity-[0.02] pointer-events-none">
                 <Fingerprint className="w-64 h-64 text-white" />
              </div>
           </div>

           <div className="glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 flex flex-col flex-grow min-h-[300px] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none noise-bg"></div>
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                 <div className="flex items-center space-x-4">
                    <Search className="w-5 h-5 text-slate-600" />
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest italic">STIA_AETHER_SCOPE_PIPE</span>
                 </div>
                 <div className="flex space-x-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>)}
                 </div>
              </div>
              <div ref={scrollRef} className="flex-grow scrollbar-hide space-y-4 overflow-y-auto relative z-10 pr-2">
                 <AnimatePresence>
                    {scanLogs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-[12px] mono flex items-start space-x-4 p-3 rounded-xl border border-transparent transition-all ${
                           log.type === 'match' ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''
                        }`}
                      >
                         <span className="text-slate-800 font-bold shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                         <span className={`
                           ${log.type === 'match' ? 'text-red-500 font-black flex items-center' : ''}
                           ${log.type === 'warn' ? 'text-amber-500 italic font-bold' : ''}
                           ${log.type === 'info' ? 'text-slate-400' : ''}
                         `}>
                           {log.type === 'match' && <ShieldAlert className="w-4 h-4 mr-3 animate-pulse" />}
                           {log.msg}
                         </span>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {scanLogs.length === 0 && !isScanning && (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 pt-10">
                      <Terminal className="w-20 h-20" />
                      <p className="text-[14px] font-black uppercase tracking-[0.6em]">System_Idle // Waiting_For_Cipher</p>
                   </div>
                 )}
              </div>
              <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-700 italic relative z-10">
                 <span>KERNEL_ISOLATION_ACTIVE</span>
                 <span className="animate-pulse">STREAM_STABLE</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
