
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Terminal, Shield, Wifi, Zap, Lock, Globe, Database, Activity, Cpu } from 'lucide-react';

interface RemoteNode {
  id: string;
  ip: string;
  dist: string;
  latency: number;
  os: string;
  access: 'LOCKED' | 'ROOT' | 'GUEST';
}

const NODES: RemoteNode[] = [
  { id: 'ALPHA-7', ip: '192.168.0.12', dist: 'Local', latency: 4, os: 'Tactical_OS v2.4', access: 'LOCKED' },
  { id: 'SAT-HUB-01', ip: '10.0.4.11', dist: 'Orbital', latency: 450, os: 'Satex_RTOS', access: 'LOCKED' },
  { id: 'VPN-GATE-EU', ip: '45.12.8.201', dist: 'Frankfurt', latency: 32, os: 'Debian-T12', access: 'LOCKED' },
  { id: 'UNKNOWN-NODE', ip: '172.16.254.1', dist: 'Stealth', latency: 120, os: 'Unknown', access: 'LOCKED' }
];

export const RemoteAccessTerminal: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [activeNode, setActiveNode] = useState<RemoteNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<{ id: string, text: string, type: 'in' | 'out' | 'err' | 'sys' }[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const addOutput = (text: string, type: 'in' | 'out' | 'err' | 'sys' = 'out') => {
    setTerminalOutput(prev => [...prev, { id: Math.random().toString(36), text, type }].slice(-50));
  };

  const connectToNode = (node: RemoteNode) => {
    if (isConnecting) return;
    setIsConnecting(true);
    setActiveNode(node);
    setTerminalOutput([]);
    addOutput(`>>> INITIATING ENCRYPTED TUNNEL TO ${node.ip}...`, 'sys');
    
    if (addMissionLog) addMissionLog(`REMOTE_TRY: Tunneling to ${node.ip}`, 'active');

    setTimeout(() => {
      addOutput(`[DEBUG] Handshaking via 2048-bit RSA...`, 'sys');
    }, 1000);

    setTimeout(() => {
      const success = Math.random() > 0.3;
      setIsConnecting(false);
      if (success) {
        addOutput(`[SUCCESS] Access Granted. Mode: GUEST`, 'sys');
        addOutput(`Welcome to ${node.os} @ ${node.id}`, 'out');
        addOutput(`Last login: Sat May 02 12:04:12 on tty1`, 'out');
        if (addMissionLog) addMissionLog(`REMOTE_ESTABLISHED: Access secured on ${node.id}`, 'BREACH');
      } else {
        addOutput(`[ERROR] Authentication Failed. Target closed connection.`, 'err');
        setActiveNode(null);
        if (addMissionLog) addMissionLog(`REMOTE_FAIL: Auth rejected by ${node.id}`, 'CRITICAL');
      }
    }, 3000);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || !activeNode || isConnecting) return;
    
    const cmd = terminalInput.trim();
    addOutput(`${activeNode.id}@remote:~$ ${cmd}`, 'in');
    setTerminalInput('');

    // Command responses
    setTimeout(() => {
      if (cmd === 'ls') {
        addOutput('bin/  etc/  home/  root/  sys/  var/  secret.vault', 'out');
      } else if (cmd === 'whoami') {
        addOutput('operator_ghost', 'out');
      } else if (cmd === 'uname -a') {
        addOutput(`Linux ${activeNode.id} 5.15.0-generic #1 SAT_TACTICAL`, 'out');
      } else if (cmd === 'cat secret.vault') {
        addOutput('PERMISSION DENIED: Entry requires ROOT privileges.', 'err');
      } else if (cmd === 'help') {
        addOutput('Available: ls, whoami, uname, help, exit, netstat', 'sys');
      } else if (cmd === 'exit') {
        addOutput('Closing connection...', 'sys');
        setActiveNode(null);
      } else {
        addOutput(`bash: ${cmd}: command not found`, 'err');
      }
    }, 400);
  };

  const handleExportSession = () => {
    const sessionData = {
        metadata: {
            timestamp: new Date().toISOString(),
            targetNode: activeNode,
            totalCommands: terminalOutput.filter(o => o.type === 'in').length
        },
        logs: terminalOutput
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAT_SESSION_${activeNode ? activeNode.id : 'GENERAL'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 h-full">
      {/* Node List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Intercepted_Nodes</h3>
           <div className="space-y-3">
              {NODES.map(n => (
                <button
                  key={n.id}
                  onClick={() => connectToNode(n)}
                  disabled={isConnecting || (activeNode?.id === n.id)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col space-y-2 group ${activeNode?.id === n.id ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                   <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase ${activeNode?.id === n.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`}>{n.id}</span>
                      <div className="flex items-center space-x-1.5">
                         <div className={`w-1 h-1 rounded-full ${n.latency < 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                         <span className="text-[7px] mono">{n.latency}ms</span>
                      </div>
                   </div>
                   <div className="text-[8px] font-mono text-slate-600 truncate">{n.ip} @ {n.dist}</div>
                </button>
              ))}
           </div>
        </div>

        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center space-x-2 mb-4 text-emerald-400">
              <Shield className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Proxy_Chains</span>
           </div>
           <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[8px] text-slate-500">
                 <Globe className="w-3 h-3" />
                 <span>Jump_Node: 104.22.4.1 (Iceland)</span>
              </div>
              <div className="flex items-center space-x-2 text-[8px] text-slate-500">
                 <Wifi className="w-3 h-3" />
                 <span>Encryption: AES-PFS-4096</span>
              </div>
           </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="lg:col-span-9 flex flex-col space-y-6">
         <div className="glass rounded-[40px] border-slate-800 bg-black flex flex-col h-[520px] overflow-hidden shadow-2xl relative">
            <div className="bg-slate-900/90 px-8 py-4 border-b border-slate-800 flex items-center justify-between z-10">
               <div className="flex items-center space-x-6">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Remote_Shell_v4.2</span>
                     <span className="text-[8px] text-slate-500 uppercase">{activeNode ? `ACTIVE_SESSION: ${activeNode.ip}` : 'NO_SESSION_ACTIVE'}</span>
                  </div>
               </div>
               {activeNode && (
                 <div className="flex items-center space-x-4">
                    <button 
                         onClick={handleExportSession}
                         className="text-[9px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors"
                    >
                         Export_Session
                    </button>
                    <div className="flex flex-col items-end">
                       <span className="text-[7px] text-slate-600 uppercase">Packet_Loss</span>
                       <span className="text-[9px] font-black text-emerald-400 mono">0.02%</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-800" />
                    <button onClick={() => { setTerminalOutput([]); setActiveNode(null); }} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">Terminate</button>
                 </div>
               )}
            </div>

            <div 
              ref={termRef}
              className="flex-grow p-8 overflow-y-auto font-mono text-[11px] space-y-2 selection:bg-cyan-500/30 custom-scrollbar relative"
            >
               {!activeNode && !isConnecting && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-4 opacity-50">
                    <Database className="w-16 h-16" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Select target node to initiate tunnel</span>
                 </div>
               )}

               {isConnecting && (
                 <div className="space-y-2">
                    {terminalOutput.map(o => (
                      <div key={o.id} className="text-cyan-500 animate-pulse">{o.text}</div>
                    ))}
                 </div>
               )}

               {activeNode && !isConnecting && (
                 <>
                   {terminalOutput.map(out => (
                     <div key={out.id} className={`flex space-x-3 ${out.type === 'err' ? 'text-red-500' : out.type === 'sys' ? 'text-amber-500' : out.type === 'in' ? 'text-white font-bold' : 'text-slate-400'}`}>
                        {out.type === 'in' && <span className="text-cyan-500 shrink-0">{"\u003E\u003E\u003E"}</span>}
                        <span className="leading-relaxed">{out.text}</span>
                     </div>
                   ))}
                 </>
               )}
            </div>

            {activeNode && !isConnecting && (
              <form onSubmit={handleCommand} className="p-6 bg-slate-900/60 border-t border-slate-800 flex items-center space-x-4">
                <span className="text-cyan-500 font-mono text-xs cursor-default">{"\u003E\u003E\u003E"}</span>
                <input 
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Enter command (ls, whoami, cat secret.vault, help)..."
                  autoFocus
                  className="flex-grow bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-slate-700"
                />
                <div className="flex items-center space-x-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                   <Activity className="w-3 h-3 mr-1" />
                   LINK_ACTIVE
                </div>
              </form>
            )}

            {/* Scanline / Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
         </div>
      </div>
    </div>
  );
};
