
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Play, Save, Trash2, Terminal, AlertTriangle, CheckCircle, Cpu, Zap, Activity } from 'lucide-react';

interface Script {
  id: string;
  name: string;
  code: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
}

const DEFAULT_SCRIPTS: Script[] = [
  { 
    id: '1', 
    name: 'packet_injection.tjs', 
    code: `// Tactical Packet Injection Script\nconst target = "192.168.1.100";\nconst port = 443;\n\nfunction inject() {\n  log("Injecting malformed SYN pulse...");\n  transmit(target, port, { flags: ["SYN", "ACK"], payload: randHex(64) });\n}\n\ninject();`,
    status: 'IDLE'
  },
  { 
    id: '2', 
    name: 'brute_force_sat.tjs', 
    code: `// Satellite Auth Bypass\nasync function crack() {\n  const combo = generatePossibilities();\n  for(let pair of combo) {\n    if (tryAuth(pair)) break;\n  }\n}`,
    status: 'IDLE'
  }
];

export const TacticalScriptEnv: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [scripts, setScripts] = useState<Script[]>(DEFAULT_SCRIPTS);
  const [activeScriptId, setActiveScriptId] = useState(scripts[0].id);
  const [consoleLogs, setConsoleLogs] = useState<{ id: string, msg: string, type: 'info' | 'err' | 'warn' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0];

  const addConsoleLog = (msg: string, type: 'info' | 'err' | 'warn' = 'info') => {
    setConsoleLogs(prev => [...prev, { id: Math.random().toString(36), msg, type }].slice(-20));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const runScript = () => {
    setScripts(prev => prev.map(s => s.id === activeScriptId ? { ...s, status: 'RUNNING' } : s));
    addConsoleLog(`>>> EXECUTING ${activeScript.name}...`, 'info');
    
    if (addMissionLog) {
      addMissionLog(`SCRIPT_EXEC: Started ${activeScript.name}`, 'active');
    }

    // Execute
    setTimeout(() => {
        addConsoleLog(`[${new Date().toLocaleTimeString()}] Initializing buffers...`, 'info');
    }, 500);

    setTimeout(() => {
        addConsoleLog(`[${new Date().toLocaleTimeString()}] Memory mapped to 0x7F20A...`, 'info');
        if (Math.random() > 0.3) {
            addConsoleLog(`[${new Date().toLocaleTimeString()}] Connection established to node.`, 'info');
        } else {
            addConsoleLog(`[${new Date().toLocaleTimeString()}] WARNING: Latency jitter detected.`, 'warn');
        }
    }, 1200);

    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        addConsoleLog(`>>> SUCCESS: ${activeScript.name} completed.`, 'info');
        setScripts(prev => prev.map(s => s.id === activeScriptId ? { ...s, status: 'SUCCESS' } : s));
        if (addMissionLog) addMissionLog(`SCRIPT_END: ${activeScript.name} succeeded.`, 'info');
      } else {
        addConsoleLog(`>>> CRITICAL_ERROR: Memory leak at 0x002FB. Overflow prevented.`, 'err');
        setScripts(prev => prev.map(s => s.id === activeScriptId ? { ...s, status: 'ERROR' } : s));
        if (addMissionLog) addMissionLog(`SCRIPT_FAIL: ${activeScript.name} crashed.`, 'CRITICAL');
      }
    }, 3000);
  };

  const handleExportConsole = () => {
    const logData = {
        scriptName: activeScript.name,
        timestamp: new Date().toISOString(),
        logs: consoleLogs
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SCRIPT_LOG_${activeScript.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 h-full">
      {/* Sidebar: Files */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                 <Code className="w-5 h-5 text-cyan-400" />
                 <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Script_Manager</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
           </div>

           <div className="space-y-2">
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScriptId(s.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between group ${activeScriptId === s.id ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                >
                   <div className="flex items-center space-x-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' : s.status === 'SUCCESS' ? 'bg-emerald-500' : s.status === 'ERROR' ? 'bg-red-500' : 'bg-slate-700'}`} />
                      <span className="text-[10px] font-black uppercase">{s.name}</span>
                   </div>
                   <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all" />
                </button>
              ))}
              <button className="w-full p-3 rounded-xl border border-dashed border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500 transition-all text-[9px] font-black uppercase tracking-widest text-center mt-4">
                + New_Script
              </button>
           </div>
        </div>

        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Compiler_Status</h4>
           <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-[8px] text-slate-600 uppercase">Engine</span>
                 <span className="text-[9px] font-black text-cyan-400 mono">V8_Tactical</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[8px] text-slate-600 uppercase">Safe_Mode</span>
                 <span className="text-[9px] font-black text-emerald-400 mono">ENABLED</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[8px] text-slate-600 uppercase">Mem_Limit</span>
                 <span className="text-[9px] font-black text-white mono">128MB</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Editor & Console */}
      <div className="lg:col-span-9 flex flex-col space-y-6">
         <div className="glass rounded-3xl border-slate-800 bg-slate-950 flex flex-col h-[400px] overflow-hidden shadow-2xl">
            <div className="bg-slate-900/80 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="flex space-x-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">~/tactical_os/scripts/<span className="text-cyan-400">{activeScript.name}</span></span>
               </div>
               <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"><Save className="w-4 h-4" /></button>
                  <button 
                    onClick={runScript}
                    disabled={activeScript.status === 'RUNNING'}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-black uppercase text-[10px] transition-all ${activeScript.status === 'RUNNING' ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                  >
                     <Play className="w-3.5 h-3.5 fill-current" />
                     <span>Execute</span>
                  </button>
               </div>
            </div>
            
            <textarea 
              value={activeScript.code}
              onChange={(e) => {
                const newScripts = scripts.map(s => s.id === activeScriptId ? { ...s, code: e.target.value } : s);
                setScripts(newScripts);
              }}
              className="flex-grow p-8 bg-black/40 text-cyan-500/90 font-mono text-[11px] outline-none caret-cyan-400 resize-none selection:bg-cyan-500/20"
              spellCheck={false}
            />

            <div className="bg-slate-900/40 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
               <span>Line: {activeScript.code.split('\n').length} // Col: 1</span>
               <span>Encoding: UTF-8 // Lang: Tactical_JS</span>
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex flex-col h-[180px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
               <div className="flex items-center space-x-3">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiler_Output</h4>
               </div>
               {consoleLogs.length > 0 && (
                  <button 
                     onClick={handleExportConsole}
                     className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                     Export_Log
                  </button>
               )}
            </div>
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto space-y-1 font-mono text-[10px] pr-2 custom-scrollbar"
            >
               {consoleLogs.length === 0 ? (
                 <div className="text-slate-800">Waiting for execution trigger...</div>
               ) : (
                 consoleLogs.map(log => (
                   <div key={log.id} className={`${log.type === 'err' ? 'text-red-500' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {log.msg}
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
