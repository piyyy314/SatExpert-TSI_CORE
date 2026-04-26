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
    },
    {
      id: 'TR-1031',
      name: 'VSAT Firmware Implant',
      target: 'STIA_ORBITAL_V5',
      risk: 'CRITICAL',
      description: 'Backdoor identified in VSAT firmware via YARA heuristic analysis. Triggers include "Tr1gg3r", "backdoor_vsat", and "debug_shell". Potential remote kernel access.',
      timestamp: new Date().toISOString(),
      artifacts: ['YARA: VSAT_Firmware_Backdoor', 'Tr1gg3r Signature', 'Debug Shell Access'],
      status: 'TRACKING',
      mitigations: [
        'Perform system-wide memory wipe and re-image firmware.',
        'Disable UART bridge at 0x82 physically or via BIOS lock.',
        'Rotate all cryptographic keys associated with this node.'
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12 relative">
      {/* Hardening Overlay */}
      <AnimatePresence>
        {isHardening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full glass border-2 border-cyan-500/50 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(34,211,238,0.2)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5">
                  <ShieldCheck className="w-56 h-56 text-cyan-500" />
               </div>
               
               <div className="flex items-center space-x-6 mb-12 relative z-10">
                  <div className="p-5 bg-cyan-500 rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                     <Lock className="w-10 h-10 text-slate-950" />
                  </div>
                  <div>
                     <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Strategic <span className="text-cyan-500">Hardening</span></h4>
                     <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.3em] italic">Applying Countermeasures // {selectedRecord.id}</p>
                  </div>
               </div>

               <div className="space-y-4 font-mono bg-[#050810] p-10 rounded-[2.5rem] border-2 border-slate-900 min-h-[350px] shadow-inner relative z-10">
                  {hardenedSteps.map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[12px] text-cyan-400 flex items-center group"
                    >
                       <span className="text-cyan-900 mr-5 font-black shrink-0 tracking-tighter italic">[{i+1}]</span>
                       <span className="group-hover:text-cyan-300 transition-colors uppercase tracking-tight">{step}</span>
                    </motion.div>
                  ))}
                  {hardenedSteps.length < 5 && (
                    <div className="flex items-center space-x-3 mt-4 ml-12">
                       <div className="w-3 h-5 bg-cyan-500 animate-pulse" />
                       <span className="text-[10px] text-cyan-900 font-black uppercase tracking-widest animate-pulse italic">PROCESS_STREAMING...</span>
                    </div>
                  )}
               </div>

               <div className="mt-10 flex items-center justify-between px-4 relative z-10">
                  <div className="flex items-center space-x-4">
                     <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
                     <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic">STIA_AUTO_MITIGATION_v5.4</span>
                  </div>
                  <span className="text-[11px] font-black text-cyan-500 uppercase italic tracking-widest animate-bounce">Awaiting final validation...</span>
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
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full glass border-2 border-red-500/50 p-12 rounded-[3.5rem] shadow-[0_0_80px_rgba(239,68,68,0.3)] relative overflow-hidden">
               <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center space-x-6">
                     <div className="p-5 bg-red-600 rounded-[2rem] shadow-[0_20px_40px_rgba(239,68,68,0.4)] animate-pulse">
                        <AlertOctagon className="w-10 h-10 text-white" />
                     </div>
                     <div>
                        <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Target <span className="text-red-500">Strike</span></h4>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.3em] italic">Takedown Sequence // Active Engagement // {selectedRecord.id}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-black text-red-500/50 uppercase tracking-widest mb-1 italic">STRIKE_POWER</div>
                     <span className="text-5xl font-black text-red-500 tracking-tighter text-glow italic">{strikeProgress}%</span>
                  </div>
               </div>

               <div className="w-full h-3 bg-black rounded-full mb-10 overflow-hidden border border-slate-900 shadow-inner relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${strikeProgress}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)] relative"
                  >
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
                  </motion.div>
               </div>

               <div className="bg-[#050810] rounded-[2.5rem] p-10 h-80 overflow-y-auto border-2 border-slate-900 space-y-4 font-mono scrollbar-hide shadow-inner relative group">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,rgba(239,68,68,1),transparent)]" />
                  {engagementLog.map((log, i) => (
                    <div key={i} className="text-[12px] text-red-400/80 hover:text-red-400 transition-colors flex items-start space-x-4">
                       <span className="text-red-900/40 font-black italic shrink-0">STRIKE_{i+1}_LOG:</span>
                       <span className="uppercase tracking-tight">{log}</span>
                    </div>
                  ))}
                  {strikeProgress < 100 && (
                    <div className="flex items-center space-x-2 mt-4">
                       <div className="w-3 h-4 bg-red-600 animate-pulse" />
                       <span className="text-[10px] text-red-900 font-black uppercase tracking-[0.2em] animate-pulse">Streaming_Ops_Data...</span>
                    </div>
                  )}
               </div>

               <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center space-x-3 px-6 py-2 bg-red-600/10 rounded-full border border-red-600/20">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Warning: Level-1 Clearance Required for Abort</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between border-b border-slate-800 pb-10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        </div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-red-600/10 rounded-[2rem] border-2 border-red-600/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Threat <span className="text-red-500">Dossier</span></h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 pl-1 italic">Target Intelligence & Ops Management // STIA_STRIKE_DB_v5.4</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="flex items-center bg-[#050810] p-2 rounded-2xl border-2 border-slate-900 shadow-inner">
             <button 
               onClick={() => setActiveTab('intel')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'intel' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Intel_Stream
             </button>
             <button 
               onClick={() => setActiveTab('visual')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Sight_Visual
             </button>
          </div>
          <button className="px-6 py-4 bg-slate-900/60 hover:bg-slate-800 rounded-2xl border-2 border-slate-800 hover:border-slate-700 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center space-x-2 shadow-xl active:scale-95">
             <Plus className="w-4 h-4" />
             <span>Log_New_Entry</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Search Database..." 
                className="w-full bg-[#050810] border-2 border-slate-800 rounded-2xl px-12 py-4 text-sm font-bold text-slate-400 focus:outline-none focus:border-red-500 shadow-inner transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-red-500 transition-colors" />
           </div>

           <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] block ml-2">Active_Combat_Targets</span>
              {records.map((record) => (
                <button 
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full text-left p-5 rounded-[2rem] border-2 transition-all relative overflow-hidden group shadow-lg ${
                    selectedRecord.id === record.id 
                    ? 'bg-red-500/10 border-red-500/40 shadow-[0_10px_30px_rgba(239,68,68,0.1)]' 
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                   {selectedRecord.id === record.id && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 animate-pulse" />
                   )}
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-500 mono tracking-widest">{record.id}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase border ${
                        record.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      }`}>
                         {record.risk}
                      </span>
                   </div>
                   <h4 className="text-lg font-black text-white uppercase truncate group-hover:text-red-400 transition-colors">{record.name}</h4>
                   <div className="flex items-center space-x-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                      <p className="text-[11px] font-mono text-slate-500 tracking-tight">{record.target}</p>
                   </div>
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
                  className="space-y-8"
                >
                   {/* Main Header */}
                   <div className="glass p-10 rounded-[3rem] border-2 border-slate-800 bg-slate-950/40 relative overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                         <Target className="w-64 h-64 text-red-500/10 rotate-12" />
                      </div>
                      
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10 relative z-10">
                         <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                               <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                               <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.3em] italic">{selectedRecord.status}</span>
                            </div>
                            <h3 className="text-5xl font-black text-white uppercase leading-none tracking-tighter italic">{selectedRecord.name}</h3>
                            <p className="text-xl font-mono text-slate-400 tracking-tighter flex items-center">
                               <MapPin className="w-4 h-4 mr-2 text-red-500/50" />
                               {selectedRecord.target}
                            </p>
                         </div>
                         
                         <div className="flex flex-wrap items-center gap-3">
                            {selectedRecord.status !== 'NEUTRALIZED' && (
                              <button 
                                onClick={runAiAnalysis}
                                disabled={isAnalyzing}
                                className="px-8 py-4 bg-cyan-600/10 border-2 border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center space-x-3 disabled:opacity-50"
                              >
                                 <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                                 <span>{isAnalyzing ? 'Analyzing_Engine...' : 'AI Deep Scan'}</span>
                              </button>
                            )}
                            {selectedRecord.status === 'NEUTRALIZED' && (
                              <button 
                                onClick={applyHardening}
                                className="px-8 py-4 bg-cyan-600/10 border-2 border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center space-x-3"
                              >
                                 <Lock className="w-4 h-4" />
                                 <span>Strategic Hardening</span>
                              </button>
                            )}
                            {selectedRecord.status !== 'NEUTRALIZED' ? (
                              <button 
                                onClick={initiateTakedown}
                                className="px-8 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(239,68,68,0.3)] transition-all active:scale-95 flex items-center space-x-3"
                              >
                                 <Target className="w-4 h-4" />
                                 <span>Initiate Takedown</span>
                              </button>
                            ) : (
                              <div className="px-8 py-4 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 opacity-60">
                                 <ShieldCheck className="w-4 h-4" />
                                 <span>Target Neutralized</span>
                              </div>
                            )}
                            <button className="p-4 bg-slate-900/60 border-2 border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-xl active:scale-90">
                               <Share2 className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
  
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                         <div className="p-5 bg-black/40 rounded-[1.8rem] border border-slate-900 group hover:border-red-500/20 transition-colors shadow-inner">
                            <div className="flex items-center space-x-2 mb-3 text-slate-600">
                               <History className="w-3.5 h-3.5" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Initial_Acquisition</span>
                            </div>
                            <p className="text-[13px] font-mono text-slate-300">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
                         </div>
                         <div className="p-5 bg-black/40 rounded-[1.8rem] border border-slate-900 group hover:border-red-500/20 transition-colors shadow-inner">
                            <div className="flex items-center space-x-2 mb-3 text-slate-600">
                               <MapPin className="w-3.5 h-3.5" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Orbital_Grid_Pos</span>
                            </div>
                            <p className="text-[13px] font-mono text-slate-300">GEO_LOCATION_PENDING</p>
                         </div>
                         <div className="p-5 bg-black/40 rounded-[1.8rem] border border-slate-900 group hover:border-red-500/20 transition-colors shadow-inner">
                            <div className="flex items-center space-x-2 mb-3 text-slate-600">
                               <AlertOctagon className="w-3.5 h-3.5" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Threat_Profile</span>
                            </div>
                            <p className="text-[13px] font-mono text-slate-300 italic">APT_CORE_INFILTRATOR</p>
                         </div>
                      </div>
                   </div>

                   {/* Analysis & Artifacts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {selectedRecord.vulnerabilities ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass p-10 rounded-[3rem] border-2 border-cyan-500/30 bg-cyan-500/5 space-y-6 md:col-span-2 shadow-2xl relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                              <Cpu className="w-64 h-64 text-cyan-500" />
                           </div>
                           <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center space-x-5">
                                 <div className="p-4 bg-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                    <Terminal className="w-5 h-5 text-slate-950" />
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.3em] leading-none italic">STIA_AI_Technical_Insight</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Deep Analysis Result // {selectedRecord.vulnerabilities.suspectedOS}</p>
                                 </div>
                              </div>
                              <div className="px-5 py-2 bg-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase border-2 border-red-500/30 shadow-lg">
                                 Risk_Level: {selectedRecord.vulnerabilities.riskLevel}
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
                              <div className="space-y-6">
                                 <div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-3 pl-1">Vulnerability_Summary</span>
                                    <p className="text-[13px] text-slate-300 leading-relaxed font-mono bg-black/40 p-5 rounded-2xl border border-slate-900 shadow-inner italic">{selectedRecord.vulnerabilities.summary}</p>
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-3 pl-1">Technical_Maneuvers</span>
                                    <div className="space-y-3">
                                       {selectedRecord.vulnerabilities.vulnerabilities.map((v, i) => (
                                         <div key={i} className="flex items-start space-x-4 text-[12px] text-cyan-400 font-mono bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                                            <span className="text-cyan-900 font-black tracking-tighter">[{i+1}]</span>
                                            <span className="tracking-tighter">{v}</span>
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-6">
                                 <div className="p-8 bg-slate-950/60 rounded-[2.5rem] border-2 border-slate-900 border-dashed relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                       <Activity className="w-32 h-32 text-amber-500" />
                                    </div>
                                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                                       <Activity className="w-4 h-4 text-amber-500" />
                                       <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Tactical_Doctrine</span>
                                    </div>
                                    <p className="text-[12px] text-slate-400 leading-relaxed italic relative z-10 border-l-2 border-amber-500/30 pl-6">
                                       "{selectedRecord.vulnerabilities.tacticalAdvice}"
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      ) : (
                        <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 space-y-6 shadow-xl h-full flex flex-col justify-center">
                           <div className="flex items-center space-x-3 pb-4 border-b border-slate-900">
                              <div className="p-2 bg-red-500/10 rounded-lg">
                                 <ShieldAlert className="w-5 h-5 text-red-500" />
                              </div>
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Tactical_Audit_Vitals</span>
                           </div>
                           <p className="text-[13px] text-slate-300 leading-relaxed font-bold italic border-l-3 border-red-500/40 pl-6 py-2">
                               "{selectedRecord.description}"
                           </p>
                        </div>
                      )}
   
                      <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 space-y-6 shadow-xl">
                         <div className="flex items-center space-x-3 pb-4 border-b border-slate-900">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                               <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Mitigation_Protocol</span>
                         </div>
                         <div className="space-y-3">
                            {selectedRecord.mitigations.map((step, i) => (
                               <div key={i} className="flex items-start space-x-4 p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/10 hover:border-emerald-500/30 transition-all group shadow-inner">
                                  <span className="text-[11px] font-black text-emerald-500 shrink-0 bg-emerald-500/10 w-8 h-8 flex items-center justify-center rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform tracking-tighter">0{i+1}</span>
                                  <p className="text-[11px] font-black text-slate-300 uppercase leading-snug tracking-[0.05em] pt-1">{step}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
   
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                       <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 space-y-6 shadow-xl">
                          <div className="flex items-center space-x-3 pb-4 border-b border-slate-900">
                             <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <Database className="w-5 h-5 text-cyan-500" />
                             </div>
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Digital_Forensic_Artifacts</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {selectedRecord.artifacts.map((art, i) => (
                                <div key={i} className="flex items-center space-x-3 p-4 bg-black/40 rounded-2xl border-2 border-slate-900 shadow-inner group hover:border-cyan-500/30 transition-all">
                                   <span className="text-[10px] font-mono text-cyan-700 font-black">STRIKE_{i+1}</span>
                                   <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight truncate">{art}</span>
                                </div>
                             ))}
                          </div>
                       </div>

                       <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 space-y-6 shadow-xl relative overflow-hidden">
                          <div className="flex items-center space-x-3 pb-4 border-b border-slate-900 relative z-10">
                             <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Cpu className="w-5 h-5 text-amber-500" />
                             </div>
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational_Flow_Telemetry</span>
                          </div>
                          <div className="space-y-2 relative z-10 pr-2 max-h-[250px] overflow-y-auto scrollbar-hide">
                             {[
                                { time: "04:32:11", msg: `Signal triangulation started for ${selectedRecord.target}`, type: 'normal' },
                                { time: "05:12:44", msg: "Vulnerability scan completed. High risk identified in protocol stack.", type: 'normal' },
                                { time: "05:35:58", msg: "Target flagged for manual active monitoring. Agent assigned.", type: 'alert' }
                             ].map((log, i) => (
                                <div key={i} className="flex items-start space-x-5 p-4 border-l-2 border-slate-800 relative group hover:border-red-500 transition-all bg-black/20 rounded-r-2xl m-1">
                                   <div className={`absolute top-1/2 -translate-y-1/2 -left-[5px] w-2 h-2 rounded-full border border-slate-950 transition-colors ${log.type === 'alert' ? 'bg-red-500' : 'bg-slate-700'}`} />
                                   <div className="shrink-0 text-[11px] font-mono text-slate-600 font-bold tracking-tighter">{log.time}</div>
                                   <div className={`text-[11px] font-black uppercase tracking-tight leading-snug ${log.type === 'alert' ? 'text-red-400' : 'text-slate-400'}`}>{log.msg}</div>
                                </div>
                             ))}
                          </div>
                          <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                             <Activity className="w-48 h-48 text-white" />
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
                  className="space-y-8"
                >
                   <div className="glass p-3 rounded-[3.5rem] border-4 border-slate-800 overflow-hidden relative shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                      <div className="aspect-video bg-[#050810] relative overflow-hidden rounded-[3.2rem]">
                         {/* CRT Scanline Effect */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
                         
                         {/* Infrared Overlay */}
                         <div className="absolute inset-0 bg-red-900/15 mix-blend-color pointer-events-none" />
   
                         {/* Animated Scan Line */}
                         <motion.div 
                           animate={{ y: ['-10%', '110%'] }}
                           transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                           className="absolute top-0 left-0 w-full h-[1px] bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.4)] z-20"
                         />
   
                         {/* Target HUD elements */}
                         <div className="absolute inset-0 flex items-center justify-center p-16">
                            <div className="relative w-full h-full border-2 border-red-500/10 rounded-3xl">
                               {/* Compass Rose */}
                               <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                  <div className="w-[2px] h-6 bg-red-500/50" />
                                  <span className="text-[11px] font-mono font-black text-red-500 mt-2 tracking-widest">000°_N_HEADING</span>
                                </div>
  
                               {/* Corners */}
                               <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-xl" />
                               <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/40 rounded-tr-xl" />
                               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/40 rounded-bl-xl" />
                               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/40 rounded-br-xl" />
  
                               {/* Grid of thermal anomalies */}
                               <div className="grid grid-cols-6 gap-10 p-16 w-full h-full opacity-20 pointer-events-none">
                                  {[...Array(24)].map((_, i) => (
                                    <motion.div 
                                      key={i}
                                      animate={{ 
                                        opacity: [0.05, 0.2, 0.05],
                                        scale: [0.98, 1.02, 0.98],
                                        backgroundColor: i % 5 === 0 ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                                      }}
                                      transition={{ duration: 5 + Math.random() * 3, repeat: Infinity }}
                                      className="border border-white/5 rounded-xl shadow-inner"
                                    />
                                  ))}
                                </div>
   
                                {/* Central Reticle */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="w-64 h-64 border-2 border-red-500/20 rounded-full animate-pulse flex items-center justify-center">
                                      <div className="w-32 h-32 border border-cyan-500/5 rounded-full animate-spin-slow" />
                                      <div className="absolute w-1 h-24 bg-red-600/30" />
                                      <div className="absolute h-1 w-24 bg-red-600/30" />
                                   </div>
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                      <motion.div 
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]" 
                                      />
                                   </div>
                                   <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2">
                                      <span className="text-[10px] font-mono text-red-500/40 font-black tracking-[0.5em] animate-pulse uppercase">LOCK_ENGAGED</span>
                                   </div>
                                </div>
   
                                {/* Telemetry labels */}
                                <div className="absolute top-8 left-10 space-y-6 relative z-30">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Thermal_Signature</span>
                                      <span className="text-xl font-mono text-red-500 font-black italic tracking-tighter shadow-red-500/20 text-glow">1042.8 K</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Cryo_Buffer_Load</span>
                                      <span className="text-xl font-mono text-cyan-400 font-black italic tracking-tighter">89.2%</span>
                                   </div>
                                </div>

                                <div className="absolute bottom-8 left-10 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] italic z-30">
                                   STIA_OPTICAL_GRID_v5.4 // ACTIVE_RECOGNITION
                                </div>
   
                                <div className="absolute bottom-10 right-12 z-30">
                                   <div className="bg-red-600/90 text-white px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] animate-pulse shadow-2xl border-2 border-red-400/50 flex items-center space-x-3 italic">
                                      <Activity className="w-5 h-5" />
                                      <span>Live_Orbital_Feed // IR_PASS</span>
                                   </div>
                                </div>
                            </div>
                         </div>
                      </div>
                   </div>
   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-900/40 shadow-xl group hover:border-red-500/20 transition-all">
                         <span className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest italic pl-1">Target_Coordinates_Grid</span>
                         <span className="text-lg font-mono text-white font-black tracking-tighter">78.22°_N, 15.62°_E</span>
                      </div>
                      <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-900/40 shadow-xl group hover:border-red-500/20 transition-all">
                         <span className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest italic pl-1">Infrastructure_Legacy_Age</span>
                         <span className="text-lg font-mono text-white font-black tracking-tighter uppercase italic">GEN_4_HYPER_STIA_CORE</span>
                      </div>
                      <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-900/40 shadow-xl group hover:border-red-500/20 transition-all">
                         <span className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest italic pl-1">Quantum_Node_Integrity</span>
                         <span className="text-lg font-mono text-emerald-500 font-black tracking-widest shadow-emerald-500/20 text-glow">OPTIMAL_v5.4</span>
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
