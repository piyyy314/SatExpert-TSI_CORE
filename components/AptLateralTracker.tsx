import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Target, 
  Terminal, 
  ChevronRight, 
  Lock, 
  Activity, 
  Play, 
  Server, 
  Laptop, 
  Database,
  Download
} from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'workstation' | 'server' | 'dc' | 'database';
  name: string;
  ip: string;
  compromised: boolean;
  active: boolean;
}

const INITIAL_NETWORK: NetworkNode[] = [
  { id: 'n1', type: 'workstation', name: 'HR-LAPTOP-01', ip: '10.0.4.15', compromised: false, active: false },
  { id: 'n2', type: 'workstation', name: 'DEV-WKST-04', ip: '10.0.5.22', compromised: false, active: false },
  { id: 'n3', type: 'server', name: 'WEB-SRV-01', ip: '10.0.10.5', compromised: false, active: false },
  { id: 'n4', type: 'server', name: 'FILE-SRV-02', ip: '10.0.10.12', compromised: false, active: false },
  { id: 'n5', type: 'dc', name: 'DC-PRIMARY', ip: '10.0.20.2', compromised: false, active: false },
  { id: 'n6', type: 'database', name: 'SQL-CUSTOMER-DB', ip: '10.0.30.50', compromised: false, active: false },
];

const APT_PHASES = [
  { id: 'recon', name: 'Initial Access (Phishing)', target: 'n1' },
  { id: 'discovery', name: 'Network Discovery', target: 'n1' },
  { id: 'cred', name: 'Credential Dumping (LSASS)', target: 'n1' },
  { id: 'lateral1', name: 'Lateral Movement (Pass-the-Hash)', target: 'n3' },
  { id: 'privesc', name: 'Privilege Escalation (PrintNightmare)', target: 'n3' },
  { id: 'lateral2', name: 'Domain Controller Compromise (DCSync)', target: 'n5' },
  { id: 'collection', name: 'Database Collection', target: 'n6' },
  { id: 'exfil', name: 'Exfiltration (DNS Tunneling)', target: 'n6' },
];

export const AptLateralTracker: React.FC = () => {
  const [network, setNetwork] = useState<NetworkNode[]>(INITIAL_NETWORK);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(-1);
  const [logs, setLogs] = useState<{ time: string, msg: string, phase: string }[]>([]);

  useEffect(() => {
    if (isRunning && currentPhaseIdx < APT_PHASES.length) {
      const timer = setTimeout(() => {
        executePhase(currentPhaseIdx);
        setCurrentPhaseIdx(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (currentPhaseIdx >= APT_PHASES.length) {
      setIsRunning(false);
    }
  }, [isRunning, currentPhaseIdx]);

  const executePhase = (idx: number) => {
    if (idx < 0) return;
    const phase = APT_PHASES[idx];
    
    const newLog = {
      time: new Date().toISOString().split('T')[1].slice(0, 8),
      msg: `[+] Executing: ${phase.name} against ${network.find(n => n.id === phase.target)?.name || 'Network'}`,
      phase: phase.name
    };
    
    setLogs(prev => [...prev, newLog]);

    setNetwork(prev => prev.map(node => {
      if (node.id === phase.target) {
        return { ...node, compromised: true, active: true };
      }
      return { ...node, active: false };
    }));
  };

  const startOperation = () => {
    setNetwork(INITIAL_NETWORK);
    setLogs([]);
    setCurrentPhaseIdx(0);
    setIsRunning(true);
  };

  const downloadReport = () => {
    if (logs.length === 0) return;
    const reportStr = `APT LATERAL MOVEMENT REPORT\n-------------------------------\n${logs.map(l => `[${l.time}] ${l.msg}`).join('\n')}\n\nFINAL COMPROMISED HOSTS:\n${network.filter(n => n.compromised).map(n => `- ${n.name} (${n.ip})`).join('\n')}`;
    const blob = new Blob([reportStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apt_operation_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 pb-12">
      <header className="flex items-center justify-between pb-6 border-b border-red-900/50">
        <div>
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase flex items-center space-x-3">
            <Network className="w-8 h-8 mr-2" />
            APT Lateral Tracker
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-wider">
            Advanced Persistent Threat Multi-Stage Operation
          </p>
        </div>
        <div className="flex space-x-4">
          {logs.length > 0 && !isRunning && (
            <button onClick={downloadReport} className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-500 rounded uppercase tracking-widest text-[10px] font-black flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Pcap/Logs
            </button>
          )}
          <button 
            onClick={startOperation}
            disabled={isRunning}
            className={`px-6 py-2 rounded uppercase tracking-widest text-xs font-black flex items-center transition-all ${
              isRunning ? 'bg-red-950 text-red-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
            }`}
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Executing...' : 'Launch Campaign'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Network Visualization */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Target Environment Topology</h3>
            
            <div className="grid grid-cols-3 gap-8 relative z-10">
              {network.map((node) => (
                <div key={node.id} className={`p-4 rounded-xl border relative transition-all duration-500 ${
                  node.compromised ? 'bg-red-950/30 border-red-900/50' : 'bg-slate-900/50 border-slate-800'
                } ${node.active ? 'shadow-[0_0_30px_rgba(220,38,38,0.3)] scale-105' : ''}`}>
                   
                   {node.active && (
                     <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                     </span>
                   )}

                   <div className="flex flex-col items-center text-center space-y-3">
                     <div className={`p-3 rounded-full ${node.compromised ? 'bg-red-900/50 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                       {node.type === 'workstation' && <Laptop className="w-6 h-6" />}
                       {node.type === 'server' && <Server className="w-6 h-6" />}
                       {node.type === 'dc' && <Lock className="w-6 h-6" />}
                       {node.type === 'database' && <Database className="w-6 h-6" />}
                     </div>
                     <div>
                       <div className={`font-mono text-[10px] font-bold tracking-wider ${node.compromised ? 'text-red-400' : 'text-slate-300'}`}>{node.name}</div>
                       <div className="text-[9px] font-mono text-slate-500">{node.ip}</div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Phases */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2 text-slate-400" /> Attack Chain
            </h3>
            
            <div className="space-y-3">
              {APT_PHASES.map((phase, idx) => (
                <div key={phase.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 flex-shrink-0 w-3 h-3 rounded-full border-2 ${
                    currentPhaseIdx > idx ? 'bg-red-500 border-red-500' :
                    currentPhaseIdx === idx ? 'bg-cyan-500 border-cyan-500 animate-pulse' :
                    'bg-transparent border-slate-700'
                  }`} />
                  <div className={`text-[10px] uppercase tracking-wider font-mono ${
                    currentPhaseIdx > idx ? 'text-red-400 font-bold' :
                    currentPhaseIdx === idx ? 'text-cyan-400 font-bold' :
                    'text-slate-500'
                  }`}>
                    {phase.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Logs */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-4 flex flex-col h-[250px]">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Terminal className="w-4 h-4 mr-2" /> Operation Log
            </h3>
            <div className="flex-1 bg-[#0a0d14] rounded border border-slate-800 p-3 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1">
              {logs.length === 0 && (
                <div className="text-slate-600 italic h-full flex items-center justify-center">Awaiting execution...</div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="text-red-400">
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  {log.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
