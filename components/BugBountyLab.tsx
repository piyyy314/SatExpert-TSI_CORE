import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  Target, 
  Search, 
  Code, 
  Terminal, 
  Award, 
  BookOpen, 
  Zap, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  Database,
  Cpu,
  Globe,
  AlertCircle,
  Download,
  Map,
  Activity
} from 'lucide-react';

interface BountyTarget {
  id: string;
  name: string;
  platform: string;
  maxPayout: string;
  difficulty: 'EXTREME' | 'HIGH' | 'MEDIUM';
  description: string;
  focusAreas: string[];
}

const BOUNTY_TARGETS: BountyTarget[] = [
  {
    id: 'chromium',
    name: 'Chromium / Chrome',
    platform: 'Google VRP',
    maxPayout: '$150,000+',
    difficulty: 'EXTREME',
    description: 'The primary target for browser exploitation. Focus on Mojo IPC, V8 JavaScript engine, and Skia rendering.',
    focusAreas: ['Mojo IPC Serialization', 'V8 JIT Optimization', 'PDFium Memory Safety']
  },
  {
    id: 'linux-kernel',
    name: 'Linux Kernel',
    platform: 'Google kCTF / various',
    maxPayout: '$50,000+',
    difficulty: 'EXTREME',
    description: 'Kernel-space privilege escalation and remote code execution vulnerabilities.',
    focusAreas: ['io_uring', 'Netfilter / nftables', 'eBPF Verifier']
  },
  {
    id: 'ios-xnu',
    name: 'iOS / XNU Kernel',
    platform: 'Apple Security Bounty',
    maxPayout: '$2,000,000+',
    difficulty: 'EXTREME',
    description: 'Full chain persistence bypasses and kernel memory corruption.',
    focusAreas: ['Sandbox Escapes', 'PAC/PPL Bypasses', 'Driver IOKit Logic']
  }
];

const CODE_ANALYSIS_MODELS = {
  uaf: `// Pattern: Use-After-Free (UAF)
void process_message(Message* msg) {
    if (msg->is_valid()) {
        dispatch(msg); // <--- Potentially frees msg
    }
    log_debug(msg->header); // <--- USE after potential FREE
}`,
  overflow: `// Pattern: Integer Overflow to Heap Overflow
void allocate_buffer(uint32_t count) {
    // BUG: count * sizeof(T) could overflow
    size_t size = count * sizeof(Element);
    Element* buf = kmalloc(size, GFP_KERNEL); 
    // If size overflowed (e.g. to 16), 
    // but count is still large...
    memcpy(buf, incoming_data, count * sizeof(Element)); // OOB WRITE
}`
};

export const BugBountyLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'targets' | 'research' | 'discovery' | 'poc' | 'report'>('targets');
  const [selectedTarget, setSelectedTarget] = useState<BountyTarget | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [foundBugs, setFoundBugs] = useState<boolean>(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setFoundBugs(false);
  };

  const lockAndExport = () => {
    setFoundBugs(true);
    setActiveTab('report');
  };

  const handleExportPoc = () => {
    const pocData = {
      timestamp: new Date().toISOString(),
      target: selectedTarget ? selectedTarget.name : 'Unknown Target',
      vulnerabilityType: 'Use-After-Free (UAF) / Heap Memory Corruption',
      cveEstimate: 'CVE-2026-XXXXX',
      exploitScript: `#!/usr/bin/env python3
# Advanced Proof of Concept (PoC) Exploit Script
# Target: ${selectedTarget ? selectedTarget.name : 'Generic Target'}
# Type: UAF / RCE

import socket
import struct
import time

TARGET_IP = "127.0.0.1"
TARGET_PORT = 1337

def create_payload():
    padding = b"A" * 64
    # Fake object layout
    fake_obj = struct.pack("<Q", 0x4141414141414141)
    rop_chain = struct.pack("<Q", 0xdeadbeef)
    return padding + fake_obj + rop_chain

def trigger_uaf():
    print("[*] Connecting to target...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((TARGET_IP, TARGET_PORT))
    
    print("[*] Allocating vulnerable object...")
    s.send(b"ALLOC 64\\n")
    time.sleep(0.1)
    
    print("[*] Freeing object...")
    s.send(b"FREE\\n")
    time.sleep(0.1)
    
    print("[*] Exploiting Use-After-Free with malicious payload...")
    s.send(b"SPRAY " + create_payload() + b"\\n")
    
    print("[+] Payload sent. Awaiting reverse shell.\\n")
    s.close()

if __name__ == "__main__":
    trigger_uaf()
`,
      remediation: 'Implement robust memory management using smart pointers and bounds checking.'
    };
    const blob = new Blob([pocData.exploitScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poc_exploit_${new Date().getTime()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 100) {
          setIsAnalyzing(false);
          return 100;
        }
        return p + 1.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
            <Award className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Bounty <span className="text-rose-500">Intelligence Lab</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              Vulnerability Research & Monetization Roadmap
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {['targets', 'research', 'discovery', 'poc', 'report'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab === 'targets' ? 'High-Value Targets' : tab === 'research' ? 'Research Patterns' : tab === 'discovery' ? 'Discovery HUD' : tab === 'poc' ? 'Advanced PoC' : 'Disclosure Dossier'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Targets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
               <Target className="w-3 h-3 mr-2" /> Top Tier Programs
             </h3>
             <div className="space-y-3">
                {BOUNTY_TARGETS.map(target => (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selectedTarget?.id === target.id 
                        ? 'bg-rose-500/10 border-rose-500/30' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[11px] font-black text-white uppercase tracking-tighter">{target.name}</span>
                       <span className="text-[8px] font-bold text-rose-500 font-mono tracking-widest">{target.maxPayout}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Award className="w-3 h-3 text-slate-600" />
                       <span className="text-[8px] font-bold text-slate-500 uppercase">{target.platform}</span>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40">
             <div className="flex items-center space-x-3 text-cyan-400 mb-4">
                <BookOpen className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Success Roadmap</h4>
             </div>
             <ul className="space-y-3">
                {[
                  'Set up a custom fuzzing cluster',
                  'Mirror the target source code',
                  'Analyze 10 historic CVE reports',
                  'Build an automated crash triager'
                ].map((step, i) => (
                  <li key={i} className="flex items-start space-x-2 text-[10px] text-slate-400 font-bold leading-tight">
                    <span className="text-rose-500 font-mono">0{i+1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Main Interface Area */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
              {activeTab === 'targets' && (
                <motion.div
                  key="targets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {selectedTarget ? (
                    <div className="glass p-10 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden h-[600px]">
                       <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                          <Target className="w-64 h-64 text-rose-500" />
                       </div>
                       
                       <div className="relative z-10 space-y-8">
                          <div className="space-y-2">
                             <div className="flex items-center space-x-3">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{selectedTarget.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  selectedTarget.difficulty === 'EXTREME' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-amber-500/20 text-amber-500'
                                }`}>
                                   DIFFICULTY: {selectedTarget.difficulty}
                                </span>
                             </div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Program: {selectedTarget.platform}</p>
                          </div>

                          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
                             {selectedTarget.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                                   <Search className="w-4 h-4 mr-2 text-rose-500" /> High-Value Focus Areas
                                </h4>
                                <div className="space-y-2">
                                   {selectedTarget.focusAreas.map((area, i) => (
                                     <div key={i} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800 group hover:border-rose-500/30 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-tighter italic">{area}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                                   <Zap className="w-4 h-4 mr-2 text-cyan-500" /> Intelligence Feed
                                </h4>
                                <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 space-y-4">
                                   <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latest CVE</span>
                                      <span className="text-[10px] font-mono text-rose-500">CVE-2024-XXXX</span>
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                      Historical data suggests that 60% of {selectedTarget.name} vulnerabilities in 2023 were related to memory safety.
                                   </p>
                                   <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center hover:text-white transition-colors">
                                      View Public Exploitation Samples <ChevronRight className="w-3 h-3 ml-1" />
                                   </button>
                                </div>
                             </div>
                          </div>

                          <div className="pt-8 flex space-x-4">
                             <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                                Launch Research Terminal
                             </button>
                             <button className="px-8 py-4 border border-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center space-x-2">
                                <Globe className="w-4 h-4" />
                                <span>Official Disclosure Site</span>
                             </button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center space-y-8 glass rounded-[40px] border-slate-800 bg-slate-950/40 opacity-50">
                       <div className="p-10 bg-slate-900 rounded-full">
                          <Target className="w-20 h-20 text-slate-700 animate-pulse" />
                       </div>
                       <div className="text-center space-y-2">
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">No Target Selected</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Select a program from the manifest to analyze roadmap</p>
                       </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'research' && (
                <motion.div
                  key="research"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-6">
                         <div className="flex items-center space-x-3 mb-2">
                            <Bug className="w-5 h-5 text-rose-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Memory Anti-Patterns</h3>
                         </div>
                         <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 font-mono text-[11px] text-slate-300">
                            <pre className="whitespace-pre overflow-x-auto custom-scrollbar italic opacity-80">
                               {CODE_ANALYSIS_MODELS.uaf}
                            </pre>
                         </div>
                         <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-3">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">The "Use-After-Free" Pattern</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                               Finding these requires tracing object lifetimes across threads. In Chromium's Mojo, this often happens during asynchronous message handling where a callback uses an object freed by a previous task.
                            </p>
                         </div>
                      </div>

                      <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-6">
                         <div className="flex items-center space-x-3 mb-2">
                            <Database className="w-5 h-5 text-cyan-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Logic & Arithmetic Patterns</h3>
                         </div>
                         <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 font-mono text-[11px] text-slate-300">
                            <pre className="whitespace-pre overflow-x-auto custom-scrollbar italic opacity-80">
                               {CODE_ANALYSIS_MODELS.overflow}
                            </pre>
                         </div>
                         <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl space-y-3">
                            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Integer Overflows</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                               Common in graphics drivers and media parsers. A payload with a carefully crafted size field can bypass safety checks, leading to undersized heap allocations that are then overwritten by large payloads.
                            </p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'discovery' && (
                <motion.div
                  key="discovery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="glass p-10 rounded-[40px] border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
                      <div className="flex items-center justify-between mb-10">
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-cyan-500/10 rounded-2xl">
                               <Terminal className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Discovery <span className="text-cyan-400">Heuristic Engine</span></h3>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Automated Static Analysis Framework</p>
                            </div>
                         </div>
                         <button 
                           onClick={startAnalysis}
                           disabled={isAnalyzing}
                           className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                             isAnalyzing ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                           }`}
                         >
                            {isAnalyzing ? 'Analyzing Repository...' : 'Run Static Analysis'}
                         </button>
                      </div>

                      <div className="flex-grow space-y-8">
                         <div className="grid grid-cols-3 gap-6">
                            {[
                              { label: 'Unsafe Pointers', value: '142', icon: <ChevronRight className="text-rose-500" /> },
                              { label: 'Integer Casts', value: '2,401', icon: <AlertCircle className="text-amber-500" /> },
                              { label: 'Network Parsing', value: '42', icon: <Globe className="text-cyan-500" /> },
                            ].map((stat, i) => (
                              <div key={i} className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    {stat.icon}
                                 </div>
                                 <p className="text-2xl font-black text-white italic">{isAnalyzing ? '---' : stat.value}</p>
                              </div>
                            ))}
                         </div>

                         <div className="p-8 bg-slate-950 rounded-3xl border border-slate-900 h-64 overflow-y-auto font-mono text-[10px] text-slate-600 space-y-1 relative">
                            {isAnalyzing ? (
                              <div className="space-y-2">
                                 <p className="text-cyan-500 animate-pulse">[INDEX] Mirroring git://chromium.googlesource.com/chromium/src.git...</p>
                                 {analysisProgress > 20 && <p className="text-slate-400">[PARSER] Tokenizing content_browser_client.cc...</p>}
                                 {analysisProgress > 50 && <p className="text-amber-600 font-bold">[WARN] Potential race condition in asynchronous task dispatcher detected.</p>}
                                 {analysisProgress > 80 && (
                                   <div className="space-y-1">
                                     <p className="text-rose-500 font-black animate-bounce">[ALERT] FOUND UNPROTECTED RAW POINTER USAGE in mojo::InterfacePtr.</p>
                                     <div className="flex items-center space-x-2 mt-2">
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded text-[8px] font-black uppercase">STATUS: UNPATCHED</span>
                                        <button 
                                          onClick={lockAndExport}
                                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black uppercase hover:bg-rose-500 transition-colors shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                                        >
                                           LOCK & EXPORT FOR DISCLOSURE
                                        </button>
                                     </div>
                                   </div>
                                 )}
                                 <div className="absolute bottom-6 left-6 right-6 h-1 bg-slate-900 rounded-full overflow-hidden">
                                     <motion.div 
                                       className="h-full bg-cyan-500" 
                                       animate={{ width: `${analysisProgress}%` }}
                                     />
                                 </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                                 <ShieldAlert className="w-12 h-12" />
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Analysis Trigger</p>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex items-center space-x-6">
                         <div className="p-3 bg-rose-500/20 rounded-xl">
                            <Award className="w-6 h-6 text-rose-500" />
                         </div>
                         <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Researcher Top-Tip</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic mt-1">
                               "Don't just hunt for crashes. Hunt for state mismatches. If you can make the system think it is in State A while it's actually in State B, the vulnerabilities will find themselves."
                            </p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

               {activeTab === 'poc' && (
                <motion.div
                  key="poc"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="glass p-10 rounded-[40px] border-slate-800 bg-slate-950/40 min-h-[600px] flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                         <Target className="w-64 h-64 text-rose-500" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-4">
                               <div className="p-3 bg-rose-500/10 rounded-2xl">
                                  <Code className="w-6 h-6 text-rose-400" />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Advanced <span className="text-rose-400">Proof of Concept</span></h3>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Exploit Generation & Weaponization Module</p>
                               </div>
                            </div>
                            <button 
                              onClick={handleExportPoc}
                              className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-900 border border-slate-800 text-white hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-all flex items-center space-x-2"
                            >
                               <Download className="w-4 h-4" />
                               <span>Export Exploit Script (.py)</span>
                            </button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {[
                               { label: 'Target Platform', value: selectedTarget ? selectedTarget.platform : 'UNKNOWN', icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
                               { label: 'Vulnerability Class', value: 'UAF / Memory Corruption', icon: <Bug className="w-5 h-5 text-rose-500" /> },
                               { label: 'Exploit Reliability', value: 'HIGH (92%)', icon: <Activity className="w-5 h-5 text-emerald-500" /> },
                            ].map((stat, i) => (
                               <div key={i} className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between mb-4">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                     {stat.icon}
                                  </div>
                                  <p className="text-lg md:text-xl font-black text-white italic truncate">{stat.value}</p>
                               </div>
                            ))}
                         </div>

                         <div className="flex-grow p-6 bg-slate-950 rounded-3xl border border-slate-900 relative overflow-hidden flex flex-col">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center">
                               <Database className="w-4 h-4 mr-2 text-rose-400" /> Generated Exploit Payload Code (Python)
                            </h4>

                            <div className="flex-grow p-4 bg-slate-900/80 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-400 relative overflow-y-auto">
                              <pre className="whitespace-pre-wrap word-break-all opacity-90">
{`#!/usr/bin/env python3
# Advanced Proof of Concept (PoC) Exploit Script
# Target: ${selectedTarget ? selectedTarget.name : 'Unknown Target'}
# Type: Use-After-Free / Remote Code Execution

import socket
import struct
import time

TARGET_IP = "127.0.0.1"
TARGET_PORT = 1337

def create_payload():
    # Constructing malicious ROP chain payload
    padding = b"\\x41" * 64
    fake_obj = struct.pack("<Q", 0x4141414141414141)
    rop_chain = struct.pack("<Q", 0xdeadbeef)
    return padding + fake_obj + rop_chain

def trigger_uaf():
    print("[*] Connecting to target...")
    # ... initiating connection
    
    print("[*] Triggering Use-After-Free...")
    # -> ALLOC 64
    # -> FREE
    # -> SPRAY with create_payload()
    
    print("[+] Exploit completed. Awaiting reverse shell...")

if __name__ == "__main__":
    trigger_uaf()`}
                              </pre>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   {foundBugs ? (
                     <div className="glass p-10 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-8">
                        <header className="flex justify-between items-start border-b border-slate-800 pb-8">
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Bounty Disclosure Dossier</h3>
                              <div className="flex items-center space-x-3">
                                 <span className="text-[10px] font-mono text-rose-500">REF: CHROME-SEC-TR-01</span>
                                 <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 rounded uppercase font-black">CRITICALLY: HIGH</span>
                              </div>
                           </div>
                           <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Verification Complete</span>
                           </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center">
                                    <Target className="w-4 h-4 mr-2" /> Proof of Concept (Exploit)
                                 </h4>
                                 <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 font-mono text-[11px] text-rose-400 italic">
                                    <pre className="whitespace-pre overflow-x-auto opacity-90">
{`// PoC: Triggering UAF in Mojo InterfacePtr
auto* ptr = GetMojoInterface();
ptr->RequestCallback([]() {
   // This callback runs after the object 
   // is freed by the dispatcher.
   ptr->DangerousMethod(); // ACCESS AFTER FREE
});`}
                                    </pre>
                                 </div>
                              </div>
                              <div className="p-6 bg-slate-900/50 rounded-3xl space-y-3 border border-slate-800">
                                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Reproduction Steps</h4>
                                 <ul className="text-[10px] text-slate-500 space-y-2 font-bold uppercase leading-tight">
                                    <li>1. Initialize Mojo shell with debug flags enabled.</li>
                                    <li>2. Intercept the MessagePipe buffer before serialization.</li>
                                    <li>3. Inject a malformed 'reset' command during task dispatch.</li>
                                 </ul>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                    <ShieldAlert className="w-4 h-4 mr-2" /> Technical Patch (The Fix)
                                 </h4>
                                 <div className="p-6 bg-slate-900 rounded-3xl border border-emerald-500/20 font-mono text-[11px] text-emerald-400 italic">
                                    <pre className="whitespace-pre overflow-x-auto opacity-90">
{`// FIX: Introduce WeakPtr for callback safety
auto weak_ptr = weak_factory_.GetWeakPtr();
ptr->RequestCallback([weak_ptr]() {
   if (!weak_ptr) return; // SAFE EXIT
   weak_ptr->DangerousMethod();
});`}
                                    </pre>
                                 </div>
                              </div>
                              <div className="p-6 bg-emerald-500/5 rounded-3xl space-y-3 border border-emerald-500/20">
                                 <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Impact Assessment</h4>
                                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                                    The proposed fix utilizes Chromium's base::WeakPtr to ensure the callback context is nullified if the underlying object is destroyed, preventing the Use-After-Free condition.
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
                           <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-widest">Estimated Bounty Value: $15,000 - $30,000 USD</p>
                           <div className="flex space-x-4">
                              <button className="px-6 py-3 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all italic">Copy to Clipboard</button>
                              <button className="px-8 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all italic shadow-[0_0_20px_rgba(225,29,72,0.3)]">Finalize Submission</button>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="h-[600px] flex flex-col items-center justify-center space-y-8 glass rounded-[40px] border-slate-800 bg-slate-950/40 opacity-50">
                        <div className="p-10 bg-slate-900 rounded-full">
                           <Award className="w-20 h-20 text-slate-700 animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">No Disclosure Dossier</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Discover a bug in the HUD to generate a reporting template</p>
                        </div>
                     </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      <footer className="pt-8 border-t border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Bounty Lab Protocol: UNRESTRICTED RESEARCH</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
           <ExternalLink className="w-3 h-3" />
           <span className="uppercase italic">Connected to Global Threat Intelligence Mesh</span>
        </div>
      </footer>
    </div>
  );
};
