
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, FileSearch, Code, Terminal, Boxes, Zap, Fingerprint, Search, Target, Binary, Cpu, Lock, Download } from 'lucide-react';

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

  const exportResults = () => {
    if (logs.length === 0 && matches.length === 0) return;
    const report = `
YARA SCAN REPORT
---------------------------------
TIMESTAMP: ${new Date().toISOString()}

LOGS:
${logs.map((l, i) => `[${i + 1}] [${l.type.toUpperCase()}] ${l.msg}`).join('\n')}

MATCHES:
${matches.length === 0 ? 'No matches found.' : matches.map(m => `OFFSET: ${m.offset} | MATCH: ${m.match} | VALUE: ${m.value}`).join('\n')}
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yara_scan_results_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <header className="flex items-center justify-between border-b border-slate-800 pb-8 relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Binary className="w-48 h-48 text-cyan-500" />
        </div>
         <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-cyan-500/10 rounded-[2rem] border-2 border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
             <Binary className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
             <h2 className="text-4xl font-black text-white px-1 tracking-tighter uppercase italic">YARA <span className="text-cyan-500">Heuristic Lab</span></h2>
             <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 pl-1 italic">Quantum-Accelerated Logic Scanner // STIA_CORE_v8.0</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
           <AnimatePresence>
             {(logs.length > 0 || matches.length > 0) && (
               <motion.button
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 onClick={exportResults}
                 className="p-3 bg-[#050810] border-2 border-slate-900 rounded-[1.5rem] text-cyan-500 hover:text-cyan-400 hover:border-cyan-500/50 shadow-xl transition-all"
                 title="Export Scan Report"
               >
                 <Download className="w-5 h-5" />
               </motion.button>
             )}
           </AnimatePresence>
          <div className="flex items-center space-x-4 bg-[#050810] p-3 rounded-[1.5rem] border-2 border-slate-900 shadow-xl">
             <div className="flex flex-col items-end pr-4 border-r border-slate-800">
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Engine_Status</span>
                <span className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.2em] animate-pulse">Idle_Standby</span>
             </div>
             <div className="p-2 bg-slate-900 rounded-xl">
                <Lock className="w-5 h-5 text-slate-600" />
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rule Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 flex flex-col min-h-[550px] shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-6 px-2">
                 <div className="flex items-center space-x-4">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                       <Code className="w-4 h-4 text-cyan-400" />
                    </div>
                    <select 
                      onChange={(e) => setRule(e.target.value)}
                      className="bg-transparent text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] outline-none cursor-pointer hover:text-cyan-400 transition-colors py-1"
                    >
                       <option value={rule} className="bg-slate-950">Custom_Signature_Input</option>
                       {templates.map(t => (
                         <option key={t.name} value={t.rule} className="bg-slate-950 font-mono">{t.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-900 text-[9px] font-mono text-cyan-600 uppercase tracking-widest">STIA_YARA_v4.2</span>
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 text-[9px] font-mono">B-UTF8</span>
                 </div>
              </div>
              
              <div className="flex-grow bg-[#050810] rounded-3xl border-2 border-slate-900 border-dashed p-8 relative group shadow-inner">
                 <textarea 
                   value={rule}
                   onChange={(e) => setRule(e.target.value)}
                   disabled={isScanning}
                   className="w-full h-full bg-transparent text-cyan-100/90 font-mono text-[14px] leading-relaxed resize-none outline-none custom-scrollbar placeholder:text-slate-900"
                   spellCheck={false}
                 />
                 <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Terminal className="w-16 h-16 text-cyan-500" />
                 </div>
              </div>

              <div className="mt-8 flex items-center gap-6">
                 <button 
                   onClick={runCompiledScan}
                   disabled={isScanning}
                   className="flex-grow py-5 bg-cyan-500 hover:bg-white hover:text-cyan-600 text-slate-950 font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_35px_rgba(34,211,238,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4 group/run"
                 >
                    {isScanning ? (
                       <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                       <Target className="w-5 h-5 group-hover/run:rotate-90 transition-transform" />
                    )}
                    <span>{isScanning ? 'Processing_Memory...' : 'Execute_Heuristic_Scan'}</span>
                 </button>
                 <button className="p-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-xl active:scale-90">
                    <Boxes className="w-7 h-7" />
                 </button>
              </div>
           </div>

           {/* Progress bar if scanning */}
           <AnimatePresence>
             {isScanning && (
               <motion.div 
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 15 }}
                 className="glass p-8 rounded-[2.5rem] border-2 border-cyan-500/30 bg-cyan-500/5 shadow-[0_20px_40px_rgba(34,211,238,0.1)]"
               >
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                       <div className="p-2 bg-cyan-500 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                          <Cpu className="w-4 h-4 text-slate-950 animate-pulse" />
                       </div>
                       <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Kernel_Process: Signal_Introspection</span>
                    </div>
                    <span className="text-2xl font-black text-cyan-500 italic drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{progress}%</span>
                 </div>
                 <div className="w-full h-3 bg-[#050810] rounded-full overflow-hidden border-2 border-slate-900 p-0.5 shadow-inner">
                    <motion.div 
                      className="h-full bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Console & Results */}
        <div className="lg:col-span-5 flex flex-col space-y-8">
           <div className="glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-[#0c0e14] flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg"></div>
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                 <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-slate-600" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">STIA_LOG_STREAM_PIPE</span>
                 </div>
                 <div className="flex space-x-1.5">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800"></div>)}
                 </div>
              </div>
              
              <div className="flex-grow overflow-auto custom-scrollbar space-y-3 font-mono pr-2 relative z-10">
                 {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                       <Terminal className="w-24 h-24" />
                       <p className="text-[12px] font-black uppercase tracking-[0.6em]">Waiting_For_Cipher</p>
                    </div>
                 )}
                 {logs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[12px] leading-relaxed flex items-start space-x-4 p-3 rounded-xl border ${
                        log.type === 'alert' ? 'bg-red-500/5 border-red-500/20 text-red-500 font-bold' :
                        log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                        log.type === 'sec' ? 'text-cyan-400 bg-cyan-500/10 p-3 rounded-xl border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' :
                        'bg-slate-950/40 border-slate-900/50 text-slate-500'
                      }`}
                    >
                      <span className="text-slate-800 font-bold shrink-0 select-none">[{i + 1}]</span>
                      <span>{log.msg}</span>
                    </motion.div>
                 ))}
                 <div ref={logEndRef} />
              </div>

              {matches.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-red-500/20 animate-in fade-in slide-in-from-top-6 relative z-10">
                   <h4 className="text-[12px] font-black text-red-500 uppercase tracking-[0.2em] mb-6 flex items-center italic">
                      <Fingerprint className="w-5 h-5 mr-3 animate-pulse" />
                      CRITICAL_SIGNATURES_IDENTIFIED
                   </h4>
                   <div className="space-y-3">
                      {matches.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-red-500/5 border-2 border-red-500/20 rounded-2xl shadow-inner group hover:bg-red-500/10 transition-colors">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black text-red-100 uppercase">{m.match}</span>
                              <span className="text-sm font-mono text-red-500 font-black tracking-tight">{m.value}</span>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-600 block mb-1">DATA_OFFSET</span>
                              <span className="text-[11px] font-mono text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">{m.offset}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-[#0c0e14] relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-500 opacity-20"></div>
              <div className="flex items-center space-x-6 mb-6">
                 <div className="p-4 bg-amber-500/10 rounded-[1.5rem] border-2 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <ShieldAlert className="w-7 h-7 text-amber-500" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Cipher <span className="text-amber-500">Authorization</span></h4>
                    <p className="text-[10px] text-slate-600 font-black tracking-[0.2em] uppercase">Security Level-3 RSA Protocol Active</p>
                 </div>
              </div>
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic border-l-3 border-amber-500/40 pl-5 mb-0">
                    "Deep memory introspection protocol engaged. Signatures will be cross-referenced with Central Intelligence databases. Unauthorized exploitation of findings is prohibited."
                 </p>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                 <Binary className="w-48 h-48 text-white" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
