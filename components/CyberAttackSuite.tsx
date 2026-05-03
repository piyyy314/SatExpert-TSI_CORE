
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Activity, Globe, ShieldAlert, Cpu, Terminal, AlertTriangle, Play, Square, RefreshCcw } from 'lucide-react';

interface AttackModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}

const ATTACK_MODULES: AttackModule[] = [
  { id: 'syn_flood', name: 'SYN Flood', icon: <RefreshCcw className="w-4 h-4" />, color: 'text-blue-500', desc: 'Overwhelms the 3-way handshake process by keeping connections half-open.' },
  { id: 'udp_flood', name: 'UDP Flood', icon: <Zap className="w-4 h-4" />, color: 'text-amber-500', desc: 'Sends large numbers of UDP packets to random ports on the target host.' },
  { id: 'http_flood', name: 'HTTP Slowloris', icon: <Activity className="w-4 h-4" />, color: 'text-purple-500', desc: 'Keeps many connections open by sending partial HTTP requests.' },
  { id: 'dns_amp', name: 'DNS Amplification', icon: <Globe className="w-4 h-4" />, color: 'text-emerald-500', desc: 'Uses open DNS resolvers to overwhelm a target with large response traffic.' }
];

export const CyberAttackSuite: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [target, setTarget] = useState('192.168.1.104');
  const [activeModule, setActiveModule] = useState(ATTACK_MODULES[0]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [intensity, setIntensity] = useState(45);
  const [logs, setLogs] = useState<{ id: string, msg: string, type: 'info' | 'warn' | 'crit' }[]>([]);
  const [trafficData, setTrafficData] = useState<number[]>(Array(40).fill(0));
  
  const addLog = (msg: string, type: 'info' | 'warn' | 'crit' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(36), msg, type }, ...prev].slice(0, 8));
  };

  const toggleAttack = () => {
    if (!isAttacking) {
      setIsAttacking(true);
      addLog(`INITIATING_ATTACK: Target [${target}] via ${activeModule.name}`, 'warn');
      if (addMissionLog) addMissionLog(`CYBER_ATTACK: Launched ${activeModule.name} against ${target}`, 'active');
    } else {
      setIsAttacking(false);
      addLog(`HALTING_ATTACK: Pulse synchronization collapsed.`, 'info');
      if (addMissionLog) addMissionLog(`CYBER_ATTACK: Ceased engagement with ${target}`, 'info');
    }
  };

  useEffect(() => {
    if (!isAttacking) {
        const interval = setInterval(() => {
            setTrafficData(prev => [...prev.slice(1), Math.random() * 20]);
        }, 500);
        return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setTrafficData(prev => [...prev.slice(1), intensity + (Math.random() * 30)]);
      
      if (Math.random() > 0.8) {
        const events = [
            `SYN_ACK timeout on ${target}:80`,
            `Reflection factor x${(Math.random() * 50 + 10).toFixed(1)} achieved`,
            `Target latency spiking: ${Math.floor(Math.random() * 2000 + 500)}ms`,
            `Botnet nodes synchronized: ${Math.floor(Math.random() * 5000 + 1000)} active`
        ];
        addLog(events[Math.floor(Math.random() * events.length)], 'warn');
      }

      if (Math.random() > 0.95) {
        addLog(`CRITICAL: Target node unresponsive. Bandwidth saturation 100%.`, 'crit');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isAttacking, intensity, target]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Target & Control */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Operations_Control</h3>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Target_IP_Address</label>
                 <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      disabled={isAttacking}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-cyan-400 placeholder:text-slate-700 outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="e.g. 192.168.1.1"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Attack_Vector</label>
                 <div className="grid grid-cols-1 gap-2">
                    {ATTACK_MODULES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setActiveModule(m)}
                        disabled={isAttacking}
                        className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all text-left ${activeModule.id === m.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'}`}
                      >
                         <div className={`p-1.5 rounded-lg bg-slate-900 ${activeModule.id === m.id ? m.color : 'text-slate-600'}`}>{m.icon}</div>
                         <div>
                            <div className="text-[10px] font-black uppercase">{m.name}</div>
                            <div className="text-[8px] opacity-60 leading-tight mt-0.5">{m.desc}</div>
                         </div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                 <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Traffic_Intensity</label>
                    <span className="text-[10px] font-black text-cyan-400 mono">{intensity} Gbps</span>
                 </div>
                 <input 
                   type="range" 
                   min="1" 
                   max="100" 
                   value={intensity}
                   onChange={(e) => setIntensity(parseInt(e.target.value))}
                   className="w-full accent-cyan-500"
                 />
              </div>

              <button 
                onClick={toggleAttack}
                className={`w-full py-4 rounded-xl flex items-center justify-center space-x-3 transition-all font-black uppercase tracking-widest text-xs ${
                  isAttacking 
                  ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950' 
                  : 'bg-red-600 border-2 border-red-500 text-white hover:bg-red-500 shadow-lg shadow-red-600/20'
                }`}
              >
                {isAttacking ? (
                  <><Square className="w-4 h-4 fill-current" /> <span>Halt_Execution</span></>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> <span>Deploy_Payload</span></>
                )}
              </button>
           </div>
        </div>
      </div>

      {/* Monitoring & Visualization */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
               <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Traffic_Flux_Monitoring</h3>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] text-slate-500 uppercase">Target_Status</span>
                     <span className={`text-[10px] font-black mono ${isAttacking ? (intensity > 80 ? 'text-red-500' : 'text-amber-500') : 'text-emerald-400'}`}>
                        {isAttacking ? (intensity > 80 ? 'SATURATED' : 'STRESSING') : 'NOMINAL'}
                     </span>
                  </div>
                  {isAttacking && (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  )}
               </div>
            </div>

            <div className="flex-grow flex items-end space-x-1.5 h-[240px] px-2 mb-8">
               {trafficData.map((d, i) => (
                 <motion.div 
                   key={i}
                   initial={false}
                   animate={{ height: `${d}%` }}
                   className={`flex-grow rounded-t-sm transition-colors duration-300 ${isAttacking ? (d > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500') : 'bg-slate-800'}`}
                 />
               ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Latency', value: isAttacking ? `${Math.floor(Math.random() * 500 + 200)}ms` : '12ms', color: isAttacking ? 'text-amber-500' : 'text-emerald-400' },
                 { label: 'Packet_Loss', value: isAttacking ? `${(Math.random() * 40 + 2).toFixed(1)}%` : '0.01%', color: isAttacking ? 'text-red-500' : 'text-emerald-400' },
                 { label: 'Auth_Failures', value: isAttacking ? Math.floor(Math.random() * 1000 + 50) : '0', color: isAttacking ? 'text-red-400' : 'text-slate-500' },
                 { label: 'CPU_Usage', value: isAttacking ? '99%' : '2%', color: isAttacking ? 'text-red-500' : 'text-emerald-400' }
               ].map(stat => (
                 <div key={stat.label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className={`text-[14px] font-black mono ${stat.color}`}>{stat.value}</div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Execution_Trace</h3>
            <div className="space-y-2 h-[120px] overflow-y-auto pr-2 custom-scrollbar font-mono">
               {logs.length === 0 ? (
                 <div className="text-[9px] text-slate-700 italic">No operational data recorded.</div>
               ) : (
                 logs.map(log => (
                   <div key={log.id} className="text-[9px] flex space-x-3 transition-all animate-in slide-in-from-left-2">
                      <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                      <span className={`font-medium ${log.type === 'crit' ? 'text-red-500 font-black' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {log.msg}
                      </span>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
