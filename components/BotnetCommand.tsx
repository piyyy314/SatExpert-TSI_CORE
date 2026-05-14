import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Shield, Server, Box, Terminal, Play, Pause, Power, Cpu, Database, Activity, Zap } from 'lucide-react';

interface BotNode {
  id: string;
  ip: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  location: string;
  load: number;
}

export const BotnetCommand: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [nodes, setNodes] = useState<BotNode[]>([]);
  const [isC2Active, setIsC2Active] = useState(false);
  const [targetUrl, setTargetUrl] = useState('news-stream-live.cdn.alpha');
  const [activeTask, setActiveTask] = useState<'IDLE' | 'STRESS' | 'INFECT' | 'SCRAPE'>('IDLE');

  useEffect(() => {
    // Generate initial botnet nodes
    const initialNodes = Array.from({ length: 48 }).map((_, i) => ({
      id: `NODE-${(i + 1).toString().padStart(3, '0')}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status: Math.random() > 0.1 ? 'ONLINE' : 'OFFLINE' as any,
      location: ['London', 'Moscow', 'Tokyo', 'Vegas', 'Berlin'][Math.floor(Math.random() * 5)],
      load: Math.random() * 10
    }));
    setNodes(initialNodes);
  }, []);

  const toggleC2 = () => {
    setIsC2Active(!isC2Active);
    if (!isC2Active) {
      if (addMissionLog) addMissionLog("C2_ESTABLISHED: Global botnet backbone synchronized.", 'active');
    } else {
      setActiveTask('IDLE');
      if (addMissionLog) addMissionLog("C2_DORMANT: Command channel encrypted and stashed.", 'info');
    }
  };

  const startTask = (task: typeof activeTask) => {
    if (!isC2Active) return;
    setActiveTask(task);
    if (addMissionLog) {
      if (task === 'STRESS') addMissionLog(`BOTNET_TASK: Stressing ${targetUrl} with all available nodes.`, 'BREACH');
      if (task === 'INFECT') addMissionLog("BOTNET_TASK: Propagating worm vector via Node-001.", 'active');
      if (task === 'SCRAPE') addMissionLog(`BOTNET_TASK: Harvesting data fragments from ${targetUrl}`, 'info');
    }
  };

  const handleExportBotnetConfig = () => {
    const configData = {
        metadata: {
            timestamp: new Date().toISOString(),
            status: isC2Active ? 'ACTIVE' : 'DORMANT',
            activeTask: activeTask,
            targetUrl: targetUrl
        },
        nodes: nodes
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOTNET_REPORT_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!isC2Active || activeTask === 'IDLE') {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(n => ({ ...n, load: Math.random() * 5 })));
        }, 3000);
        return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.status === 'OFFLINE') return n;
        return {
          ...n,
          status: Math.random() > 0.95 ? 'OFFLINE' : (Math.random() > 0.9 ? 'BUSY' : 'ONLINE'),
          load: activeTask === 'STRESS' ? 80 + Math.random() * 20 : 30 + Math.random() * 40
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isC2Active, activeTask]);

  return (
    <div className="flex flex-col space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                 <Server className="w-5 h-5 text-cyan-400" />
                 <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Hades_C2_Dashboard</h2>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] text-slate-500 uppercase">Backbone_Capacity</span>
                    <span className="text-[10px] font-black text-cyan-400 mono">1.2 Tbps [RESERVED]</span>
                 </div>
                 <button 
                   onClick={toggleC2}
                   className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg ${isC2Active ? 'bg-red-500/10 border-red-500 text-red-500 shadow-red-500/20' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                 >
                    <Power className={`w-6 h-6 ${isC2Active ? 'animate-pulse' : ''}`} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 mb-8 h-[240px] overflow-y-auto pr-2 custom-scrollbar">
              {nodes.map(node => (
                <div key={node.id} className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative group transition-all duration-500 ${node.status === 'OFFLINE' ? 'bg-slate-900/20 border-slate-900 opacity-20' : node.status === 'BUSY' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'ONLINE' ? 'bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.8)]' : node.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-700'}`} />
                   <div className="text-[6px] text-slate-600 mt-1 font-mono">{node.id.split('-')[1]}</div>
                   
                   {/* Tooltip-ish popover on hover */}
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-[80px] shadow-2xl">
                      <div className="text-[7px] font-black text-cyan-400">{node.ip}</div>
                      <div className="text-[6px] text-slate-500 uppercase">{node.location}</div>
                      <div className="text-[6px] text-white mt-1">Load: {node.load.toFixed(1)}%</div>
                   </div>

                   {activeTask !== 'IDLE' && node.status !== 'OFFLINE' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className={`w-full h-full rounded-lg ${activeTask === 'STRESS' ? 'bg-red-500' : 'bg-cyan-500'}`}
                        />
                     </div>
                   )}
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-4">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Command_Target</label>
                 <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      disabled={activeTask !== 'IDLE'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-500/50"
                    />
                 </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-4 gap-3">
                 {[
                   { id: 'STRESS', name: 'Stress_Target', icon: <Zap className="w-4 h-4" /> },
                   { id: 'INFECT', name: 'Deploy_Worm', icon: <Box className="w-4 h-4" /> },
                   { id: 'SCRAPE', name: 'Data_Harvest', icon: <Database className="w-4 h-4" /> },
                   { id: 'IDLE', name: 'Idle_System', icon: <Pause className="w-4 h-4" /> }
                 ].map(task => (
                   <button
                     key={task.id}
                     onClick={() => startTask(task.id as any)}
                     disabled={!isC2Active || activeTask === task.id}
                     className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${activeTask === task.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-900 text-slate-600 hover:text-slate-400 disabled:opacity-30'}`}
                   >
                      <div className="mb-2">{task.icon}</div>
                      <span className="text-[8px] font-black uppercase tracking-tighter">{task.name}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Botnet_Stats</h3>
                 <button 
                    onClick={handleExportBotnetConfig}
                    className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-900/20 px-2 py-1.5 rounded border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                 >
                    Export_Stats
                 </button>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400">NODES_AVAIL</span>
                       <span className="text-[8px] text-slate-600 uppercase">Operational Status</span>
                    </div>
                    <div className="text-2xl font-black text-cyan-400 mono">{nodes.filter(n => n.status !== 'OFFLINE').length}</div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black text-slate-500 uppercase">Current_Load</span>
                       <span className="text-[10px] font-black text-red-500 mono">{(nodes.length > 0 ? (nodes.reduce((acc, n) => acc + n.load, 0) / nodes.length) : 0).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-red-500"
                          animate={{ width: `${nodes.length > 0 ? (nodes.reduce((acc, n) => acc + n.load, 0) / nodes.length) : 0}%` }}
                       />
                    </div>
                 </div>
                 <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl mt-4">
                    <div className="flex items-center space-x-2 mb-1 text-cyan-400">
                       <Shield className="w-3 h-3" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Protocol: HADES_V4</span>
                    </div>
                    <p className="text-[7px] text-cyan-500/60 leading-tight">Botnet utilizes peer-to-peer gossip protocol. No single point of failure. Encryption: ChaCha20-Poly1305.</p>
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex-grow h-[200px] overflow-hidden flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">C2_Activity_Feed</h3>
              <div className="flex-grow space-y-2 overflow-y-auto font-mono text-[8px] pr-2 custom-scrollbar">
                 {isC2Active ? (
                   <>
                     <div className="text-cyan-500 animate-pulse">{"\u003E\u003E\u003E"} HEARTBEAT: ALL SYSTEMS NOMINAL</div>
                     <div className="text-slate-500">[{new Date().toLocaleTimeString()}] SYNCHRONIZED 48 NODES</div>
                     {activeTask === 'STRESS' && (
                       <div className="text-red-500">[{new Date().toLocaleTimeString()}] LAUNCHING PACKET-STORM: {targetUrl}</div>
                     )}
                     {activeTask === 'IDLE' && nodes.map((n, i) => i % 10 === 0 && (
                       <div key={n.id} className="text-slate-600">[{new Date().toLocaleTimeString()}] PING {n.ip} ... 24ms</div>
                     ))}
                   </>
                 ) : (
                   <div className="text-slate-800 h-full flex items-center justify-center italic">Waiting for Command Channel...</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
