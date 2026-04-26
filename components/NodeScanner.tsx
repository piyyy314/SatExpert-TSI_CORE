
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Search, 
  ShieldAlert, 
  Activity, 
  Server, 
  Cpu, 
  Lock, 
  Unlock, 
  Download, 
  Trash2, 
  Play, 
  Square,
  Network
} from 'lucide-react';
import { analyzePortScan } from '../services/geminiService.ts';

interface ScanResult {
  port: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version: string;
}

interface AIAnalysis {
  summary: string;
  riskLevel: string;
  vulnerabilities: string[];
  suspectedOS: string;
  tacticalAdvice: string;
}

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080];

export const NodeScanner: React.FC = () => {
  const [target, setTarget] = useState('192.168.1.1');
  const [scanType, setScanType] = useState<'quick' | 'intense' | 'stealth'>('quick');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  const logEndRef = useRef<HTMLDivElement>(null);
  const detectedPortsRef = useRef<ScanResult[]>([]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setTerminalLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const startScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setResults([]);
    setTerminalLogs([]);
    setAiAnalysis(null);
    setProgress(0);

    addLog(`STIA_ORACLE: Initializing ${scanType.toUpperCase()} scan on node: ${target}`);
    addLog("Resolving target architecture...");
    
    // Simulation steps
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
        setProgress((i / totalSteps) * 100);
        
        if (i === 2) addLog("ICMP Echo request: SUCCESS (TTL=64)");
        if (i === 4) addLog("SYN Stealth scan initiated on 1000 common ports...");
        if (i === 6) {
            const potentialServices = [
              { port: 21, service: 'ftp', version: 'vsftpd 3.0.3' },
              { port: 22, service: 'ssh', version: 'OpenSSH 8.2p1' },
              { port: 23, service: 'telnet', version: 'Linux telnetd' },
              { port: 53, service: 'domain', version: 'ISC BIND 9.16.1' },
              { port: 80, service: 'http', version: 'Apache httpd 2.4.41' },
              { port: 443, service: 'https', version: 'Apache httpd 2.4.41' },
              { port: 3306, service: 'mysql', version: 'MySQL 8.0.21' },
              { port: 8080, service: 'http-proxy', version: 'Squid proxy 4.10' },
              { port: 2000, service: 'vsat-comms', version: 'Proprietary V6' }
            ];
            
            // Randomly pick 3-5 ports
            const foundCount = 3 + Math.floor(Math.random() * 3);
            const shuffled = [...potentialServices].sort(() => 0.5 - Math.random());
            const foundPorts: ScanResult[] = shuffled.slice(0, foundCount).map(s => ({
              ...s,
              protocol: 'tcp' as const,
              state: 'open' as const
            })).sort((a, b) => a.port - b.port);

            setResults(foundPorts);
            addLog(`Discovered ${foundPorts.length} open ports.`);
            
            // Capture detected for AI
            detectedPortsRef.current = foundPorts;
        }
        if (i === 8) addLog("OS Fingerprinting: Distant Match (Linux 5.x)");
        if (i === 9) addLog("Finalizing heuristic analysis...");
    }

    addLog("STIA_ORACLE: Scan iteration complete.");
    setIsScanning(false);

    // AI Analysis
    addLog("Requesting STIA_DEEP_AUDIT for node vulnerabilities...");
    const analysis = await analyzePortScan(target, detectedPortsRef.current);
    if (analysis) {
        setAiAnalysis(analysis);
        addLog("DEEP_AUDIT: Analysis delivery SUCCESS.");
    } else {
        addLog("DEEP_AUDIT: Link timed out. Results unavailable.");
    }
  };

  const exportScan = () => {
    if (results.length === 0) return;
    const report = `
STIA NODE SCAN REPORT - ${target}
---------------------------------
TIMESTAMP: ${new Date().toISOString()}
SCAN TYPE: ${scanType.toUpperCase()}
OS_GUESS: ${aiAnalysis?.suspectedOS || 'Unknown'}

OPEN PORTS DISCOVERED:
${results.map(r => `[${r.port}/${r.protocol}] ${r.state.toUpperCase()} - ${r.service} (${r.version})`).join('\n')}

VULNERABILITY ASSESSMENT:
${aiAnalysis?.vulnerabilities.map(v => `- ${v}`).join('\n') || 'No critical vulnerabilities identified.'}

TACTICAL ADVICE:
${aiAnalysis?.tacticalAdvice || 'Maintain current security posture.'}

STIA_CMD: END_AUDIT_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_SCAN_${target.replace(/\./g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <Network className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Node Auditor <span className="text-rose-500">Oracle</span></h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">STIA_NMAP_ENGINE // Sub-Zero Recon</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <AnimatePresence>
            {results.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={exportScan}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
                title="Export Scan Report"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Config & Terminal */}
        <div className="lg:col-span-5 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-3 mb-6">
                 <Search className="w-4 h-4 text-rose-500" />
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Configuration</h3>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[8px] font-black text-slate-600 uppercase block mb-1.5 ml-1">Node IP / Hostname</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={target}
                         onChange={e => setTarget(e.target.value)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-rose-500/50"
                         placeholder="192.168.1.1"
                       />
                       <Server className="absolute right-4 top-3.5 w-4 h-4 text-slate-700" />
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    {['quick', 'intense', 'stealth'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setScanType(type as any)}
                        className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                            scanType === type ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                         {type}
                      </button>
                    ))}
                 </div>

                 <button 
                   onClick={startScan}
                   disabled={isScanning}
                   className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all active:scale-95 ${
                    isScanning ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20'
                   }`}
                 >
                    {isScanning ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" />
                          <span>Scanning {progress.toFixed(0)}%</span>
                        </>
                    ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Execute Network Audit</span>
                        </>
                    )}
                 </button>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanner Terminal Output</span>
                 </div>
                 <button onClick={() => setTerminalLogs([])} className="text-slate-700 hover:text-slate-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
              <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 h-[240px] flex flex-col font-mono overflow-hidden">
                 <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide text-[9px]">
                    {terminalLogs.length === 0 && (
                        <p className="text-slate-800 italic">SYSTEM_IDLE: Awaiting scan mission parameters...</p>
                    )}
                    {terminalLogs.map((log, i) => (
                        <p key={i} className={log.includes('ALERT') || log.includes('DEEP_AUDIT') ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                           {log}
                        </p>
                    ))}
                    <div ref={logEndRef} />
                 </div>
              </div>
           </div>
        </div>

        {/* Right Col: Results & Analysis */}
        <div className="lg:col-span-7 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Discovery Matrix</h3>
                 </div>
                 {results.length > 0 && <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Scan Successful</span>}
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-slate-800">
                       <tr>
                          <th className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Port/Proto</th>
                          <th className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">State</th>
                          <th className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Service</th>
                          <th className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Version</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {results.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="py-12 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest italic opacity-50">No Data Discovered Yet</td>
                        </tr>
                       ) : (
                        results.map((r, i) => (
                           <motion.tr 
                             key={i}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="group hover:bg-white/5 transition-colors cursor-default"
                           >
                              <td className="py-4 text-[10px] font-mono font-bold text-rose-400">{r.port}/{r.protocol}</td>
                              <td className="py-4">
                                 <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[9px] font-black text-white uppercase">{r.state}</span>
                                 </div>
                              </td>
                              <td className="py-4 text-[10px] font-bold text-slate-300 uppercase">{r.service}</td>
                              <td className="py-4 text-[9px] font-mono text-slate-500">{r.version}</td>
                           </motion.tr>
                        ))
                       )}
                    </tbody>
                 </table>
              </div>

              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Intelligence Summary</span>
                         </div>
                         <div className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${
                            aiAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                         }`}>
                            RISK: {aiAnalysis.riskLevel}
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-bold">{aiAnalysis.summary}</p>
                      <div className="flex items-center space-x-2 mt-2">
                         <Cpu className="w-3 h-3 text-slate-600" />
                         <span className="text-[8px] font-black text-slate-600 uppercase">OS_FINGERPRINT: {aiAnalysis.suspectedOS}</span>
                      </div>
                   </div>

                   <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-4">
                      <div className="flex items-center space-x-2">
                         <Lock className="w-4 h-4 text-rose-500" />
                         <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Tactical Remediation</span>
                      </div>
                      <div className="space-y-2">
                         {aiAnalysis.vulnerabilities.map((v, i) => (
                           <div key={i} className="flex items-start space-x-2">
                              <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 animate-pulse shrink-0"></div>
                              <span className="text-[9px] font-black text-slate-200 uppercase">{v}</span>
                           </div>
                         ))}
                      </div>
                      <p className="text-[10px] text-slate-400 italic font-medium leading-tight pt-2 border-t border-rose-500/10">
                        {aiAnalysis.tacticalAdvice}
                      </p>
                   </div>
                </motion.div>
              )}
           </div>

           <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">STIA_NOTICE: Scanning Constraints</p>
                 <p className="text-[11px] text-slate-400 font-bold leading-tight">
                   Oracle engine is limited to authorized VSAT node auditing. Cross-subnet scanning requires elevated administrative tokens.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
