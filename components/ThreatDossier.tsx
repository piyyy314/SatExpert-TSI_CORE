import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Target, 
  ShieldAlert, 
  User, 
  MapPin, 
  History, 
  AlertOctagon,
  Cpu,
  Database,
  Search,
  Plus,
  Trash2,
  Share2,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Lock
} from 'lucide-react';
import { analyzePortScan } from '../services/geminiService.ts';

interface ThreatRecord {
  id: string;
  name: string;
  target: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  artifacts: string[];
  status: 'TRACKING' | 'NEUTRALIZED' | 'ESCAPED';
  mitigations: string[];
  vulnerabilities?: {
    summary: string;
    riskLevel: string;
    vulnerabilities: string[];
    suspectedOS: string;
    tacticalAdvice: string;
  };
}

export const ThreatDossier: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'visual'>('intel');
  const [records, setRecords] = useState<ThreatRecord[]>([
    {
      id: 'TR-1029',
      name: 'Adversary Primary Node',
      target: '192.168.1.1',
      risk: 'CRITICAL',
      description: 'Insecure management via Telnet (cleartext credentials). Outdated Apache 2.4.41 (susceptible to CVE-2021-41773/42013). FTP 3.0.3 risk of misconfiguration or brute-force.',
      timestamp: new Date().toISOString(),
      artifacts: ['Telnet Cleartext', 'CVE-2021-41773', 'Apache 2.4.41', 'FTP 3.0.3'],
      status: 'TRACKING',
      mitigations: [
        'Terminate Telnet service immediately; replace with SSH.',
        'Update Apache httpd to latest stable release (Patch CVE-2021-41773/42013).',
        'Enforce TLS for FTP or transition to SFTP.'
      ]
    },
    {
      id: 'TR-1030',
      name: 'Spoofing Originator',
      target: '0x403for.github.io',
      risk: 'HIGH',
      description: 'Phishing node impersonating Google Accounts. Uses GitHub Pages for infrastructure obfuscation.',
      timestamp: new Date().toISOString(),
      artifacts: ['High Entropy Path', 'Form Hijacking Scaffolding'],
      status: 'TRACKING',
      mitigations: [
        'Blacklist domain at firewall/DNS level.',
        'Report URL to GitHub abuse team.',
        'Enable MFA for all accounts accessed through this vector.'
      ]
    }
  ]);

  const selectedRecord = records.find(r => r.id === selectedId) || records[0];

  const [isEngaging, setIsEngaging] = useState(false);
  const [engagementLog, setEngagementLog] = useState<string[]>([]);
  const [strikeProgress, setStrikeProgress] = useState(0);

  const runAiAnalysis = async () => {
    if (selectedRecord.vulnerabilities) return;
    setIsAnalyzing(true);
    const result = await analyzePortScan(selectedRecord.target, [
      { port: 23, service: 'telnet' },
      { port: 80, service: 'http', version: 'Apache 2.4.41' },
      { port: 21, service: 'ftp', version: 'vsftpd 3.0.3' }
    ]);
    if (result) {
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, vulnerabilities: result } : r));
    }
    setIsAnalyzing(false);
  };

  const initiateTakedown = async () => {
    setIsEngaging(true);
    setEngagementLog(["[INIT] AUTHENTICATING STIA_STRIKE_AUTHORIZATION...", "[OK] CREDENTIALS VERIFIED."]);
    setStrikeProgress(5);

    const phases = [
      { msg: "[STRIKE] Injecting Telnet Null-Payload to force service hang...", p: 25 },
      { msg: "[STRIKE] Remote Apache process termination signal sent...", p: 50 },
      { msg: "[STRIKE] Overloading FTP auth buffer... Socket closed.", p: 75 },
      { msg: "[OK] Target internal routing tables purged.", p: 90 },
      { msg: "[SUCCESS] TARGET_NODE_DOWN. LOGGING NEUTRALIZATION.", p: 100 },
    ];

    for (const phase of phases) {
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 500));
      setEngagementLog(prev => [...prev, phase.msg]);
      setStrikeProgress(phase.p);
    }

    setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: 'NEUTRALIZED' } : r));
    setTimeout(() => setIsEngaging(false), 2000);
  };

  const [isHardening, setIsHardening] = useState(false);
  const [hardenedSteps, setHardenedSteps] = useState<string[]>([]);
  
  const applyHardening = async () => {
    setIsHardening(true);
    const steps = [
      "TERMINATING_TELNET_DAEMON... [OK]",
      "INITIALIZING_OPENSSH_v9.3p1... [OK]",
      "PATCHING_APACHE_HTTPD_CVE_2021... [PATCHED]",
      "ENFORCING_TLS_v1.3_ON_FTP_PORT... [OK]",
      "SEALING_NODE_CERTIFICATES... [VERIFIED]"
    ];

    for (const step of steps) {
       await new Promise(r => setTimeout(r, 900));
       setHardenedSteps(prev => [...prev, step]);
    }
    
    setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: 'NEUTRALIZED', mitigations: [...r.mitigations, "SSH Migration", "Apache Patching", "TLS Enforcement"] } : r));
    setIsHardening(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Hardening Overlay */}
      <AnimatePresence>
        {isHardening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full glass border-cyan-500/50 p-10 rounded-[3rem] shadow-[0_0_80px_rgba(34,211,238,0.15)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="w-48 h-48 text-cyan-500" />
               </div>
               
               <div className="flex items-center space-x-5 mb-10">
                  <div className="p-4 bg-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                     <Lock className="w-10 h-10 text-slate-950" />
                  </div>
                  <div>
                     <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Strategic <span className="text-cyan-500">Hardening</span></h4>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Applying Countermeasures // {selectedRecord.id}</p>
                  </div>
               </div>

               <div className="space-y-3 font-mono bg-slate-900/50 p-8 rounded-3xl border border-slate-800 min-h-[300px]">
                  {hardenedSteps.map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] text-cyan-400 flex items-center"
                    >
                       <span className="text-cyan-900 mr-4 font-black">[{i+1}]</span>
                       {step}
                    </motion.div>
                  ))}
                  {hardenedSteps.length < 5 && <div className="w-2 h-4 bg-cyan-500 animate-pulse mt-1 ml-10" />}
               </div>

               <div className="mt-8 flex items-center justify-between px-2">
                  <div className="flex items-center space-x-3">
                     <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STIA_AUTO_MITIGATION_IN_PROGRESS</span>
                  </div>
                  <span className="text-[10px] font-black text-cyan-500 uppercase italic">Verifying integrity...</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Active Engagement Modal overlay */}
      <AnimatePresence>
        {isEngaging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full glass border-red-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.2)]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                     <div className="p-4 bg-red-500 rounded-2xl animate-pulse">
                        <AlertOctagon className="w-8 h-8 text-white" />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Engagement <span className="text-red-500">Active</span></h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Takedown Sequence // {selectedRecord.id}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-4xl font-black text-red-500 mono">{strikeProgress}%</span>
                  </div>
               </div>

               <div className="w-full h-1.5 bg-slate-900 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${strikeProgress}%` }}
                    className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  />
               </div>

               <div className="bg-slate-950/80 rounded-2xl p-6 h-64 overflow-y-auto border border-slate-800 space-y-2 font-mono scrollbar-hide">
                  {engagementLog.map((log, i) => (
                    <div key={i} className="text-[10px] text-red-400">
                       <span className="text-red-900/50 mr-2">{i+1} //</span>
                       {log}
                    </div>
                  ))}
                  {strikeProgress < 100 && <div className="w-2 h-3 bg-red-500 animate-pulse inline-block" />}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Threat <span className="text-red-500">Dossier</span></h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Target Intelligence & Ops Management // STIA_STRIKE_DB</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
             <button 
               onClick={() => setActiveTab('intel')}
               className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'intel' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Intel
             </button>
             <button 
               onClick={() => setActiveTab('visual')}
               className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Visual
             </button>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-[10px] font-black uppercase text-slate-300 transition-all flex items-center space-x-2">
             <Plus className="w-3 h-3" />
             <span>Log New</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search Database..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-3 text-xs font-bold text-slate-400 focus:outline-none focus:border-red-500/50 transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
           </div>

           <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2">Active Targets</span>
              {records.map((record) => (
                <button 
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                    selectedRecord.id === record.id 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                   {selectedRecord.id === record.id && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                   )}
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-500 mono">{record.id}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        record.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                         {record.risk}
                      </span>
                   </div>
                   <h4 className="text-sm font-black text-white uppercase truncate">{record.name}</h4>
                   <p className="text-[10px] font-mono text-slate-500 mt-1">{record.target}</p>
                </button>
              ))}
           </div>
        </div>

        {/* Detailed Dossier View */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
              {activeTab === 'intel' ? (
                <motion.div 
                  key="intel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   {/* Main Header */}
                   <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8">
                         <Target className="w-48 h-48 text-red-500/5 rotate-12" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                         <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedRecord.status}</span>
                            </div>
                            <h3 className="text-4xl font-black text-white uppercase leading-none">{selectedRecord.name}</h3>
                            <p className="text-lg font-mono text-slate-400 tracking-tighter">{selectedRecord.target}</p>
                         </div>
                         
                         <div className="flex items-center space-x-3">
                            {selectedRecord.status !== 'NEUTRALIZED' && (
                              <button 
                                onClick={runAiAnalysis}
                                disabled={isAnalyzing}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-600/20 transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
                              >
                                 <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                                 <span>{isAnalyzing ? 'Analyzing...' : 'AI Deep Scan'}</span>
                              </button>
                            )}
                            {selectedRecord.status === 'NEUTRALIZED' && (
                              <button 
                                onClick={applyHardening}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-600/20 transition-all active:scale-95 flex items-center space-x-2"
                              >
                                 <Lock className="w-3.5 h-3.5" />
                                 <span>Strategic Hardening</span>
                              </button>
                            )}
                            {selectedRecord.status !== 'NEUTRALIZED' ? (
                              <button 
                                onClick={initiateTakedown}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center space-x-2"
                              >
                                 <Target className="w-3.5 h-3.5" />
                                 <span>Initiate Takedown</span>
                              </button>
                            ) : (
                              <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                                 <ShieldCheck className="w-3.5 h-3.5" />
                                 <span>Terminated</span>
                              </div>
                            )}
                            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                               <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
  
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                         <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                            <div className="flex items-center space-x-2 mb-2 text-slate-500">
                               <History className="w-3 h-3" />
                               <span className="text-[8px] font-black uppercase">Initial Acquisition</span>
                            </div>
                            <p className="text-xs font-mono text-slate-300">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
                         </div>
                         <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                            <div className="flex items-center space-x-2 mb-2 text-slate-500">
                               <MapPin className="w-3 h-3" />
                               <span className="text-[8px] font-black uppercase">Estimated Loc</span>
                            </div>
                            <p className="text-xs font-mono text-slate-300">GEO_LOCATION_PENDING</p>
                         </div>
                         <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                            <div className="flex items-center space-x-2 mb-2 text-slate-500">
                               <AlertOctagon className="w-3 h-3" />
                               <span className="text-[8px] font-black uppercase">Threat Classification</span>
                            </div>
                            <p className="text-xs font-mono text-slate-300">APT_GROUP_FOLLOWER</p>
                         </div>
                      </div>
                   </div>

                   {/* Analysis & Artifacts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedRecord.vulnerabilities ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass p-6 rounded-3xl border-cyan-500/30 bg-cyan-500/5 space-y-4 md:col-span-2"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 <div className="p-2 bg-cyan-500 rounded-lg">
                                    <Terminal className="w-4 h-4 text-slate-950" />
                                 </div>
                                 <div>
                                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none">STIA_AI_Technical_Insight</h4>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Deep Analysis Result // {selectedRecord.vulnerabilities.suspectedOS}</p>
                                 </div>
                              </div>
                              <div className="px-3 py-1 bg-red-500/20 rounded-full text-[8px] font-black text-red-500 uppercase border border-red-500/30">
                                 Risk: {selectedRecord.vulnerabilities.riskLevel}
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Vulnerability Summary</span>
                                    <p className="text-[10px] text-slate-300 leading-relaxed font-mono">{selectedRecord.vulnerabilities.summary}</p>
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Technical Maneuvers</span>
                                    <div className="space-y-2">
                                       {selectedRecord.vulnerabilities.vulnerabilities.map((v, i) => (
                                         <div key={i} className="flex items-start space-x-3 text-[10px] text-cyan-400 font-mono">
                                            <span className="text-cyan-900">—</span>
                                            <span>{v}</span>
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 border-dashed">
                                    <div className="flex items-center space-x-2 mb-3">
                                       <Activity className="w-3 h-3 text-amber-500" />
                                       <span className="text-[8px] font-black text-amber-500 uppercase">Tactical Doctrine</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">{selectedRecord.vulnerabilities.tacticalAdvice}</p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      ) : (
                        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
                           <div className="flex items-center space-x-2">
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Audit</span>
                           </div>
                           <p className="text-xs text-slate-400 leading-relaxed font-bold italic border-l-2 border-red-500/30 pl-4 py-1">
                              "{selectedRecord.description}"
                           </p>
                        </div>
                      )}
  
                      <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
                         <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mitigation Strategy</span>
                         </div>
                         <div className="space-y-2">
                            {selectedRecord.mitigations.map((step, i) => (
                               <div key={i} className="flex items-start space-x-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                  <span className="text-[10px] font-black text-emerald-500 shrink-0">0{i+1}</span>
                                  <p className="text-[10px] font-bold text-slate-300 uppercase leading-snug tracking-tight">{step}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
  
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
                         <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Artifacts</span>
                         </div>
                         <div className="space-y-2">
                            {selectedRecord.artifacts.map((art, i) => (
                               <div key={i} className="flex items-center space-x-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                                  <span className="text-[10px] font-mono text-cyan-500">#{i+1}</span>
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{art}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
  
                   {/* System Logs */}
                   <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
                      <div className="flex items-center space-x-2">
                         <Cpu className="w-4 h-4 text-amber-500" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Timeline</span>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-start space-x-4 p-3 border-l border-slate-800 relative">
                            <div className="absolute top-4 -left-1 w-2 h-2 rounded-full bg-slate-800 border border-slate-950" />
                            <div className="shrink-0 text-[10px] font-mono text-slate-600">04:32:11</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Signal triangulation started for {selectedRecord.target}</div>
                         </div>
                         <div className="flex items-start space-x-4 p-3 border-l border-slate-800 relative">
                            <div className="absolute top-4 -left-1 w-2 h-2 rounded-full bg-slate-800 border border-slate-950" />
                            <div className="shrink-0 text-[10px] font-mono text-slate-600">05:12:44</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Vulnerability scan completed. High risk identified in protocol stack.</div>
                         </div>
                         <div className="flex items-start space-x-4 p-3 border-l border-slate-800 relative">
                            <div className="absolute top-4 -left-1 w-2 h-2 rounded-full bg-red-500 border border-slate-950" />
                            <div className="shrink-0 text-[10px] font-mono text-red-500">05:35:58</div>
                            <div className="text-[10px] font-black text-red-400 uppercase tracking-tight">Target flagged for manual active monitoring. Agent assigned.</div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="visual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="glass p-2 rounded-[3rem] border-slate-800 overflow-hidden relative">
                      <div className="aspect-video bg-slate-950 relative overflow-hidden rounded-[2.8rem]">
                         {/* CRT Scanline Effect */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
                         
                         {/* Infrared Overlay */}
                         <div className="absolute inset-0 bg-red-900/10 mix-blend-color pointer-events-none" />
  
                         {/* Animated Scan Line */}
                         <motion.div 
                           animate={{ y: ['-10%', '110%'] }}
                           transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                           className="absolute top-0 left-0 w-full h-[2px] bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20"
                         />
  
                         {/* Target HUD elements */}
                         <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="relative w-full h-full border border-red-500/20 rounded-2xl">
                               {/* Compass Rose */}
                               <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                  <div className="w-[1px] h-4 bg-red-500" />
                                  <span className="text-[10px] font-mono text-red-500 mt-1">000° N</span>
                               </div>
  
                               {/* Grid of thermal anomalies */}
                               <div className="grid grid-cols-4 gap-8 p-12 w-full h-full opacity-30">
                                  {[...Array(12)].map((_, i) => (
                                    <motion.div 
                                      key={i}
                                      animate={{ 
                                        opacity: [0.1, 0.4, 0.1],
                                        scale: [0.95, 1.05, 0.95],
                                        backgroundColor: i % 3 === 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                      }}
                                      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity }}
                                      className="border border-white/5 rounded-lg"
                                    />
                                  ))}
                                </div>
  
                                {/* Central Reticle */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="w-48 h-48 border border-red-500/30 rounded-full animate-pulse flex items-center justify-center">
                                      <div className="w-24 h-24 border border-cyan-500/10 rounded-full animate-spin-slow" />
                                      <div className="absolute w-1 h-16 bg-red-500/50" />
                                      <div className="absolute h-1 w-16 bg-red-500/50" />
                                   </div>
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                      <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]" 
                                      />
                                   </div>
                                </div>
  
                                {/* Telemetry labels */}
                                <div className="absolute top-4 left-6 space-y-4">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-500 uppercase">Thermal_Lux</span>
                                      <span className="text-sm font-mono text-red-400">1042.8 K</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-500 uppercase">Cryo_Load</span>
                                      <span className="text-sm font-mono text-cyan-400">89.2%</span>
                                   </div>
                                </div>
  
                                <div className="absolute bottom-6 right-8">
                                   <div className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                      Live Orbital Feed // IR_PASS
                                   </div>
                                </div>
                            </div>
                         </div>
                      </div>
                   </div>
  
                   <div className="grid grid-cols-3 gap-6">
                      <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-900/40">
                         <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Target Coordinates</span>
                         <span className="text-xs font-mono text-white">78.22° N, 15.62° E</span>
                      </div>
                      <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-900/40">
                         <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Infrastructure Age</span>
                         <span className="text-xs font-mono text-white">GEN_4_HYPER_CORE</span>
                      </div>
                      <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-900/40">
                         <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Node Integrity</span>
                         <span className="text-xs font-mono text-emerald-500">OPTIMAL</span>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
