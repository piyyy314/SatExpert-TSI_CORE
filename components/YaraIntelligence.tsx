
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scanLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
           <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
              <ShieldAlert className="w-6 h-6 text-red-500" />
           </div>
           <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Deep Malware <span className="text-red-500">Intelligence</span></h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">YARA Heuristic Scanner // v4.2.0-STIA</p>
           </div>
        </div>
        {!isScanning && (
          <button 
            onClick={startScan}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center space-x-2"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Commence Scan</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                 <Terminal className="w-3 h-3 mr-2" />
                 Signatures_Library
              </h3>
              <div className="space-y-2">
                 {YARA_DATABASE.map(rule => (
                   <button 
                     key={rule.name}
                     onClick={() => setSelectedRule(rule)}
                     disabled={isScanning}
                     className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedRule.name === rule.name ? 'bg-red-600/10 border-red-600/30' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                   >
                      <h4 className="text-[11px] font-black text-white uppercase mb-1">{rule.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold leading-tight">{rule.description}</p>
                   </button>
                 ))}
              </div>
           </div>

           {isScanning && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass p-6 rounded-3xl border-red-600/30 bg-red-600/5"
             >
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black text-red-500 uppercase">Scanning_Active</span>
                   <span className="text-[10px] font-mono text-red-500 font-black">{scanProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-red-500"
                     initial={{ width: 0 }}
                     animate={{ width: `${scanProgress}%` }}
                   />
                </div>
             </motion.div>
           )}
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/60 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rule_Definition</span>
                 </div>
                 <span className="text-[9px] font-mono text-slate-700">YARA_LANG</span>
              </div>
              <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-900 p-6 overflow-auto custom-scrollbar">
                 <pre className="text-[12px] font-mono text-red-100/80 leading-relaxed">
{`rule ${selectedRule.name} {
    strings:
${selectedRule.strings.map(s => `        ${s.id} = ${s.pattern} ${s.type}`).join('\n')}
    condition:
        ${selectedRule.condition}
}`}
                 </pre>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex flex-col flex-grow min-h-[250px]">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aether_Scope Log</span>
                 </div>
                 <div className="flex space-x-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-800"></div>)}
                 </div>
              </div>
              <div ref={scrollRef} className="flex-grow scrollbar-hide space-y-2 overflow-y-auto">
                 <AnimatePresence>
                    {scanLogs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] mono flex items-start space-x-3"
                      >
                         <span className="text-slate-700">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                         <span className={`
                           ${log.type === 'match' ? 'text-red-500 font-black flex items-center' : ''}
                           ${log.type === 'warn' ? 'text-amber-500 italic' : ''}
                           ${log.type === 'info' ? 'text-slate-400' : ''}
                         `}>
                           {log.type === 'match' && <Fingerprint className="w-3 h-3 mr-2" />}
                           {log.msg}
                         </span>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {scanLogs.length === 0 && !isScanning && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Scanner_Idle</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
