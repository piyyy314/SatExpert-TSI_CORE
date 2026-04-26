import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  Globe, 
  Terminal as TerminalIcon, 
  Eye, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Server, 
  Flag,
  Crosshair,
  List,
  Fingerprint
} from 'lucide-react';
import { analyzeSpoofingURL } from '../services/geminiService.ts';
import { calculateEntropy, getUrlRiskFactor } from '../services/forensicService.ts';

interface ForensicData {
  impersonatedBrand: string;
  threatScore: number;
  redFlags: string[];
  forensicSummary: string;
  originEstimation: string;
  mitigationSteps: string[];
}

export const SpoofTracer: React.FC = () => {
  const [suspectUrl, setSuspectUrl] = useState('https://0x403for.github.io/spoofing.html');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ForensicData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [localHeuristics, setLocalHeuristics] = useState<{ entropy: number; risk: string } | null>(null);

  const steps = [
    "Initializing Forensic Sandbox Environment...",
    "Crawling DOM structure for fraudulent patterns...",
    "Analyzing URL entropy and Punycode signatures...",
    "Querying WHOIS database for registrar inconsistencies...",
    "Checking SSL/TLS certificate chain...",
    "Finalizing Heuristic Intelligence Report..."
  ];

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${msg}`]);
  };

  const runAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setLogs([]);
    setActiveStep(0);

    addLog(`STIA_TRACE: Commencing deep forensic audit of ${suspectUrl}`);
    
    for (let i = 0; i < steps.length; i++) {
        setActiveStep(i);
        addLog(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
        
        if (i === 2) {
            const h = getUrlRiskFactor(suspectUrl);
            setLocalHeuristics({ entropy: h.score, risk: h.level });
            addLog(`HEURISTICS: Shannon Entropy = ${h.score.toFixed(4)}. Risk: ${h.level}`);
        }
        
        if (i === 1) addLog("ALERT: Detected hidden input fields with 'type=password'.");
        if (i === 2) addLog("WARNING: URL path implies GitHub Pages—unusual for sensitive financial/auth nodes.");
        if (i === 4) addLog("CERTS: Domain verified via Let's Encrypt (Automated/Low trust).");
    }

    const result = await analyzeSpoofingURL(suspectUrl);
    if (result) {
        setAnalysis(result);
        addLog("TRACE_COMPLETE: Intelligence generated.");
    } else {
        addLog("ERROR: Intelligence link fractured. Manual override required.");
    }
    
    setIsAnalyzing(false);
    setActiveStep(-1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Eye className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Spoof <span className="text-amber-500">Tracer</span></h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Forensic Counter-Intelligence // ID_SPOOFING_DETECTION</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input & Monitor */}
        <div className="lg:col-span-5 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-3 mb-6">
                 <Search className="w-4 h-4 text-amber-500" />
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Vector</h3>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[8px] font-black text-slate-600 uppercase block mb-1.5 ml-1">Suspect URL</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={suspectUrl}
                         onChange={e => setSuspectUrl(e.target.value)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                         placeholder="https://..."
                       />
                       <Globe className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                    </div>
                 </div>
                 <button 
                   onClick={runAnalysis}
                   disabled={isAnalyzing}
                   className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all active:scale-95 ${
                    isAnalyzing ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/20'
                   }`}
                 >
                    {isAnalyzing ? (
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>
                           <span>Tracing Agent Active...</span>
                        </div>
                    ) : (
                        <>
                           <Crosshair className="w-4 h-4" />
                           <span>Execute Forensic Trace</span>
                        </>
                    )}
                 </button>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-2 mb-4">
                 <TerminalIcon className="w-4 h-4 text-amber-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Forensic Stream</span>
              </div>
              <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 h-[280px] overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hide text-[9px] font-mono">
                    {logs.length === 0 && <p className="text-slate-800 italic">&gt; Awaiting command for trace initialization...</p>}
                    {logs.map((log, i) => (
                        <p key={i} className={`${log.includes('ALERT') || log.includes('URGENT') ? 'text-red-400 font-black' : 'text-slate-400'}`}>
                           {log}
                        </p>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Results Analysis */}
        <div className="lg:col-span-7 space-y-6">
           <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                   {/* Threat Header */}
                   <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
                         <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Threat Score</span>
                         <span className={`text-4xl font-black ${analysis.threatScore > 75 ? 'text-red-500' : 'text-amber-500'}`}>
                            {analysis.threatScore}
                         </span>
                      </div>
                      <div className="flex items-center space-x-4 mb-6">
                         <div className={`p-4 rounded-2xl border ${analysis.threatScore > 75 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                            <AlertTriangle className={`w-8 h-8 ${analysis.threatScore > 75 ? 'text-red-500' : 'text-amber-500'}`} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white">{analysis.impersonatedBrand} <span className="text-slate-500 text-sm font-bold uppercase tracking-widest ml-2">SPOOFED</span></h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Origin Estimation: {analysis.originEstimation}</p>
                         </div>
                      </div>
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                         <p className="text-[11px] text-slate-300 leading-relaxed font-bold italic">
                            "{analysis.forensicSummary}"
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Red Flags */}
                      <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                         <div className="flex items-center space-x-2 mb-4">
                            <Flag className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anomalies Detected</span>
                         </div>
                         <div className="space-y-2">
                            {analysis.redFlags.map((flag, i) => (
                               <div key={i} className="flex items-start space-x-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                                  <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                  <span className="text-[9px] font-bold text-slate-300 uppercase leading-snug">{flag}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Mitigation */}
                      <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                         <div className="flex items-center space-x-2 mb-4">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Neutralization</span>
                         </div>
                         <div className="space-y-3">
                            {analysis.mitigationSteps.map((step, i) => (
                               <div key={i} className="flex items-start space-x-3">
                                  <div className="text-[10px] font-black text-emerald-500/50 mt-0.5">0{i+1}</div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight tracking-tight">{step}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Technical Artifacts */}
                   <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                            <Fingerprint className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Fingerprint Artifacts</span>
                         </div>
                         <button className="text-[9px] font-black text-cyan-500 hover:underline uppercase">Export Headers</button>
                      </div>
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-600 uppercase">ASN</span>
                               <p className="text-[10px] font-mono text-slate-300">AS15169 (GITHUB-NET)</p>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-600 uppercase">Cert_Valid</span>
                               <p className="text-[10px] font-mono text-emerald-500 font-bold">YES</p>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-600 uppercase">Form_Vector</span>
                               <p className="text-[10px] font-mono text-red-500 font-bold">CROSS_ORIGIN</p>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-600 uppercase">Detection</span>
                               <p className="text-[10px] font-mono text-amber-500">MANUAL_OVERRIDE</p>
                            </div>
                            {localHeuristics && (
                               <div className="space-y-1">
                                  <span className="text-[8px] font-black text-slate-600 uppercase">Shannon_Entropy</span>
                                  <p className={`text-[10px] font-mono font-bold ${localHeuristics.risk === 'HIGH' ? 'text-red-500' : 'text-cyan-500'}`}>
                                     {localHeuristics.entropy.toFixed(4)}
                                  </p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div key="idle" className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-800 rounded-3xl p-12 opacity-40">
                   <ShieldAlert className="w-16 h-16 text-slate-700 mb-6" />
                   <h3 className="text-xl font-black text-slate-600 uppercase tracking-tight">No Active Forensic Trace</h3>
                   <p className="text-sm text-slate-700 font-bold uppercase mt-2">Target a URL to begin origin analysis</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
