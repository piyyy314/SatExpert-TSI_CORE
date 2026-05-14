import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity, Zap, Play, Square, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DaemonManager: React.FC = () => {
  const [daemons, setDaemons] = useState([
    { id: 'scada_link', name: 'scada_link.daemon', status: 'stopped', cpu: 0, ram: 0, uptime: 0 },
    { id: 'net_sniffer', name: 'network_sniffer.daemon', status: 'running', cpu: 12.4, ram: 450, uptime: 120400 },
    { id: 'crypto_miner', name: 'bgtask_crypto01.daemon', status: 'stopped', cpu: 0, ram: 0, uptime: 0 },
    { id: 'keylogger', name: 'sys_input_log.daemon', status: 'stopped', cpu: 0, ram: 0, uptime: 0 },
    { id: 'pqc_tunnel', name: 'pqc_secure_tunnel.daemon', status: 'running', cpu: 4.2, ram: 128, uptime: 560000 },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "[SYS] Daemon Controller Initialized.",
    "[SYS] Awaiting command..."
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDaemons(prev => prev.map(d => {
        if (d.status === 'running') {
          return {
            ...d,
            uptime: d.uptime + 1,
            cpu: Math.max(0, Math.min(100, d.cpu + (Math.random() * 4 - 2))),
            ram: Math.max(0, d.ram + (Math.random() * 10 - 5))
          };
        }
        return d;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const toggleDaemon = (id: string) => {
    const daemon = daemons.find(d => d.id === id);
    if (!daemon) return;

    if (daemon.status === 'running') {
      setDaemons(prev => prev.map(d => d.id === id ? { ...d, status: 'stopping', cpu: 0 } : d));
      setLogs(prev => [...prev.slice(-10), `[SYS] Terminating ${daemon.name}...`]);
      setTimeout(() => {
        setDaemons(prev => prev.map(d => d.id === id ? { ...d, status: 'stopped', uptime: 0, ram: 0 } : d));
        setLogs(prev => [...prev.slice(-10), `[OK] ${daemon.name} stopped.`]);
      }, 1500);
    } else if (daemon.status === 'stopped') {
      setDaemons(prev => prev.map(d => d.id === id ? { ...d, status: 'starting' } : d));
      setLogs(prev => [...prev.slice(-10), `[SYS] Activating ${daemon.name}...`]);
      setTimeout(() => {
        setDaemons(prev => prev.map(d => d.id === id ? { ...d, status: 'running', cpu: Math.random() * 10, ram: Math.random() * 100 + 50 } : d));
        setLogs(prev => [...prev.slice(-10), `[OK] ${daemon.name} is now ACTIVE.`]);
      }, 2000);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4 relative z-10">
        <Activity className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">System Daemon Control</h2>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">SERVICE_MGR_V2</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-hidden relative z-10">
        {/* Daemon List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-y-auto custom-scrollbar space-y-3">
          {daemons.map(daemon => (
            <div key={daemon.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 transition-all hover:border-slate-700">
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                     <Cpu className="w-4 h-4 text-slate-500" />
                     <span className="text-sm font-black text-white">{daemon.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${daemon.status === 'running' ? 'text-emerald-500' : daemon.status === 'stopped' ? 'text-slate-500' : 'text-amber-500'}`}>
                        {daemon.status}
                     </span>
                     <button
                       onClick={() => toggleDaemon(daemon.id)}
                       disabled={daemon.status === 'starting' || daemon.status === 'stopping'}
                       className={`p-1.5 rounded bg-slate-900 border transition-all ${
                         daemon.status === 'running' ? 'border-rose-500/50 hover:bg-rose-500/20 text-rose-500' : 
                         daemon.status === 'stopped' ? 'border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-500' : 
                         'border-amber-500/50 text-amber-500 cursor-not-allowed opacity-50'
                       }`}
                     >
                       {daemon.status === 'running' ? <Square className="w-4 h-4" /> : daemon.status === 'stopped' ? <Play className="w-4 h-4" /> : <Loader className="w-4 h-4 animate-spin" />}
                     </button>
                  </div>
               </div>
               
               {daemon.status === 'running' && (
                 <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800">
                    <div>
                       <div className="text-[9px] text-slate-500 uppercase font-bold">CPU Load</div>
                       <div className="text-xs text-cyan-400">{daemon.cpu.toFixed(1)}%</div>
                    </div>
                    <div>
                       <div className="text-[9px] text-slate-500 uppercase font-bold">Memory</div>
                       <div className="text-xs text-cyan-400">{daemon.ram.toFixed(0)} MB</div>
                    </div>
                    <div>
                       <div className="text-[9px] text-slate-500 uppercase font-bold">Uptime</div>
                       <div className="text-xs text-cyan-400">{formatUptime(daemon.uptime)}</div>
                    </div>
                 </div>
               )}
            </div>
          ))}
        </div>

        {/* Terminal Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-xs">
          <div className="flex items-center space-x-2 mb-4 text-emerald-500 border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Daemon Execution Logs</span>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1">
             {logs.map((log, i) => (
                <div key={i} className={`${log.includes('[OK]') ? 'text-emerald-400' : log.includes('error') ? 'text-rose-400' : 'text-slate-400'}`}>
                   {log}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
