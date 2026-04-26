
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, FileSearch, Code, Terminal, Boxes, Zap, Fingerprint, Search, Target, Binary, Cpu, Lock } from 'lucide-react';

interface ScanResult {
  offset: string;
  match: string;
  value: string;
}

export const YARAScanner: React.FC = () => {
  const [rule, setRule] = useState(`rule VSAT_Firmware_Backdoor {
    strings:
        $s1 = "Tr1gg3r" ascii
        $s2 = "backdoor_vsat" ascii
        $s3 = "debug_shell" ascii
    condition:
        any of them
}`);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'success' | 'alert' | 'sec' }[]>([]);
  const [matches, setMatches] = useState<ScanResult[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const templates = [
    { name: 'VSAT Backdoor', rule: `rule VSAT_Firmware_Backdoor {
    strings:
        $s1 = "Tr1gg3r" ascii
        $s2 = "backdoor_vsat" ascii
        $s3 = "debug_shell" ascii
    condition:
        any of them
}` },
    { name: 'Telnet Exploit', rule: `rule Telnet_Cleartext_Auth {
    strings:
        $p1 = "login:" ascii
        $p2 = "password:" ascii
        $p3 = "User Access Verified" ascii
    condition:
        all of them
}` },
    { name: 'Apache CVE-2021', rule: `rule Apache_Path_Traversal {
    strings:
        $c1 = "/cgi-bin/.%2e/%2e%2e/" ascii
        $c2 = "%%32%65%%32%65/" ascii
    condition:
        any of them
}` }
  ];

  const addLog = (msg: string, type: 'info' | 'success' | 'alert' | 'sec' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runCompiledScan = async () => {
    setIsScanning(true);
    setMatches([]);
    setLogs([]);
    setProgress(0);

    addLog("STIA_COMPILER: Validating YARA syntax...", "info");
    await new Promise(r => setTimeout(r, 600));
    
    if (!rule.includes("rule")) {
       addLog("COMPILATION_ERROR: Missing 'rule' identifier.", "alert");
       setIsScanning(false);
       return;
    }

    addLog("STIA_COMPILER: Rule compiled successfully.", "success");
    addLog("STIA_ENGINE: Initializing memory-map scan on STIA_TARGET_ALPHA...", "info");

    const phases = [
      { msg: "Scanning ELF section .text...", p: 20 },
      { msg: "Analyzing strings in .rodata...", p: 45 },
      { msg: "Applying signature mapping to heap segments...", p: 70 },
      { msg: "Correlating condition logic: 'any of them'...", p: 90 },
    ];

    for (const phase of phases) {
       await new Promise(r => setTimeout(r, 800));
       addLog(phase.msg, "info");
       setProgress(phase.p);
    }

    await new Promise(r => setTimeout(r, 1000));
    setProgress(100);

    const foundMatches: ScanResult[] = [];
    if (rule.includes("Tr1gg3r")) {
       foundMatches.push({ offset: "0x00401A2F", match: "$s1", value: "Tr1gg3r" });
    }
    if (rule.includes("backdoor_vsat")) {
       foundMatches.push({ offset: "0x00405B12", match: "$s2", value: "backdoor_vsat" });
    }
    if (rule.includes("debug_shell")) {
       foundMatches.push({ offset: "0x00407C44", match: "$s3", value: "debug_shell" });
    }

    if (foundMatches.length > 0) {
       addLog(`CRITICAL: ${foundMatches.length} match(es) found! Target compromised.`, "sec");
       setMatches(foundMatches);
    } else {
       addLog("SCAN_COMPLETE: No signatures matched in provided buffer.", "success");
    }

    setIsScanning(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
             <Binary className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
             <h2 className="text-3xl font-black text-white px-1 tracking-tighter uppercase italic">YARA <span className="text-cyan-500">Heuristic Lab</span></h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 pl-1">Quantum-Accelerated Logic Scanner // STIA_CORE_v5</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
           <div className="flex flex-col items-end pr-3 border-r border-slate-800">
              <span className="text-[8px] text-slate-600 font-black uppercase">Engine_Status</span>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Idle_Standby</span>
           </div>
           <Lock className="w-4 h-4 text-slate-700 mx-2" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rule Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
           <div className="glass p-6 rounded-[2rem] border-slate-800 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center space-x-3">
                    <Code className="w-4 h-4 text-cyan-500" />
                    <select 
                      onChange={(e) => setRule(e.target.value)}
                      className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:text-cyan-400 transition-colors"
                    >
                       <option value={rule}>Custom Rule</option>
                       {templates.map(t => (
                         <option key={t.name} value={t.rule}>{t.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="flex space-x-2">
                    <span className="px-2 py-0.5 bg-slate-900 rounded text-[8px] font-mono text-cyan-600">STIA_YARA_v4</span>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[8px] font-mono">UTF-8</span>
                 </div>
              </div>
              
              <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-900 border-dashed p-6 relative group">
                 <textarea 
                   value={rule}
                   onChange={(e) => setRule(e.target.value)}
                   disabled={isScanning}
                   className="w-full h-full bg-transparent text-cyan-100 font-mono text-[13px] leading-relaxed resize-none outline-none custom-scrollbar placeholder:text-slate-800"
                   spellCheck={false}
                 />
                 <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-40 transition-opacity">
                    <Terminal className="w-12 h-12 text-cyan-500" />
                 </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                 <button 
                   onClick={runCompiledScan}
                   disabled={isScanning}
                   className="flex-grow py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
                 >
                    {isScanning ? (
                       <Zap className="w-4 h-4 animate-spin" />
                    ) : (
                       <Target className="w-4 h-4" />
                    )}
                    <span>Compile & Execute Scan</span>
                 </button>
                 <button className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                    <Boxes className="w-6 h-6" />
                 </button>
              </div>
           </div>

           {/* Progress bar if scanning */}
           <AnimatePresence>
             {isScanning && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10 }}
                 className="glass p-6 rounded-3xl border-cyan-500/30 bg-cyan-500/5"
               >
                 <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center space-x-3">
                       <Cpu className="w-4 h-4 text-cyan-500 animate-pulse" />
                       <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">Core_Process: Heuristic_Analysis</span>
                    </div>
                    <span className="text-xl font-black text-cyan-500 italic">{progress}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-0.5">
                    <motion.div 
                      className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Console & Results */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
           <div className="glass p-8 rounded-[2rem] border-slate-800 bg-slate-950/40 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">STIA_Console_Stream</span>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              </div>
              
              <div className="flex-grow overflow-auto custom-scrollbar space-y-3 font-mono pr-2">
                 {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                       <Terminal className="w-20 h-20 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting_Input</p>
                    </div>
                 )}
                 {logs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[11px] leading-relaxed flex items-start space-x-3 ${
                        log.type === 'alert' ? 'text-red-500 font-bold' :
                        log.type === 'success' ? 'text-emerald-500' :
                        log.type === 'sec' ? 'text-cyan-400 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20' :
                        'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-700 select-none">{i + 1}</span>
                      <span>{log.msg}</span>
                    </motion.div>
                 ))}
                 <div ref={logEndRef} />
              </div>

              {matches.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in slide-in-from-top-4">
                   <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center">
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Detected_Signatures
                   </h4>
                   <div className="space-y-2">
                      {matches.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-white">{m.match}</span>
                              <span className="text-[8px] font-mono text-red-400/80 tracking-tighter">Hex_Match: {m.value}</span>
                           </div>
                           <span className="text-[9px] font-mono text-slate-500 uppercase">{m.offset}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           <div className="glass p-6 rounded-[2rem] border-slate-800 bg-slate-900/40 relative overflow-hidden group">
              <div className="flex items-center space-x-4 mb-4">
                 <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-white uppercase italic">Authorizing_Scan_Protocol</h4>
                    <p className="text-[9px] text-slate-500 font-bold tracking-tight">Requires Level-3 RSA Cipher Authorization</p>
                 </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                 "By executing this scan, you authorize the STIA system to perform deep memory introspection on target assets. All detections will be logged in the Global Threat Index."
              </p>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Binary className="w-24 h-24 text-white" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
