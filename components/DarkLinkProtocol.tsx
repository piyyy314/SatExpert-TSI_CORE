import React, { useState } from 'react';
import { Network, Terminal, Activity, Unlock, Wifi, Lock } from 'lucide-react';

export const DarkLinkProtocol: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [deviceSelected, setDeviceSelected] = useState(true);

  const initDarkLink = () => {
    setIsInitializing(true);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] INITIATING DARK-LINK PROTOCOL..`]);

    setTimeout(() => {
      if (!deviceSelected) {
        setLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] ERROR: DEVICE_SELECTION_CANCELLED`
        ]);
        setIsInitializing(false);
        return;
      }

      setLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] INITIATING VIRTUAL DARK-LINK...`,
        `[${new Date().toLocaleTimeString()}] VIRTUAL MESH INITIALIZED. BYPASS ACTIVE.`,
        `[${new Date().toLocaleTimeString()}] GATEWAY: VIRTUAL_NODE_LOGIC.ALPHA`
      ]);

      setTimeout(() => {
        setIsConnected(true);
        setIsInitializing(false);
        setLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] DARK-LINK ESTABLISHED.`
        ]);
      }, 1500);

    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-full h-[600px] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
        <Network className="w-6 h-6 text-rose-500" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Dark-Link Protocol</h2>
        <span className="ml-auto text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">MESH_BYPASS_V4</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden">
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isConnected ? 'bg-emerald-950 border-emerald-900/50' : 'bg-slate-950 border-slate-800/50'}`}>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center">
                   <Activity className="w-3 h-3 mr-1"/> Status
                 </span>
                 <div className="flex items-center">
                   {isConnected ? (
                     <Unlock className="w-4 h-4 text-emerald-500" />
                   ) : (
                     <Lock className="w-4 h-4 text-rose-500" />
                   )}
                 </div>
               </div>
               <div className={`text-sm font-black uppercase ${isConnected ? 'text-emerald-400' : 'text-rose-500'}`}>
                 {isConnected ? 'LINK ACTIVE' : 'DISCONNECTED'}
               </div>
            </div>

            <div className="p-4 rounded-xl border bg-slate-950 border-slate-800/50 space-y-3">
              <label className="flex items-center space-x-2 text-xs">
                <input 
                  type="checkbox" 
                  checked={deviceSelected} 
                  onChange={() => setDeviceSelected(!deviceSelected)}
                  disabled={isInitializing || isConnected}
                  className="bg-slate-900 border-slate-700 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                />
                <span className="text-slate-400 uppercase tracking-widest text-[10px]">Verify Device Gateway</span>
              </label>
            </div>
          </div>

          <button
            onClick={isConnected ? () => { setIsConnected(false); setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] DARK-LINK TERMINATED.`]) } : initDarkLink}
            disabled={isInitializing}
            className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] ${
              isInitializing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isConnected 
                  ? 'bg-rose-950 text-rose-500 border border-rose-900 hover:bg-rose-900 hover:text-rose-400'
                  : 'bg-cyan-950 text-cyan-500 border border-cyan-900 hover:bg-cyan-900 hover:text-cyan-400'
            }`}
          >
            {isInitializing ? 'INITIATING...' : isConnected ? 'TERMINATE LINK' : 'ESTABLISH LINK'}
          </button>
          
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
             <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center"><Wifi className="w-3 h-3 mr-1"/> Vector Graph</span>
             </div>
             <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-[9px] mb-1 text-slate-400"><span>VNode.Alpha </span><span>{isConnected ? '98ms' : '--- '}</span></div>
                 <div className="w-full bg-slate-900 rounded-full h-1"><div className={`bg-cyan-500 h-1 rounded-full ${isConnected ? 'w-[80%] animate-pulse' : 'w-[0%]'}`}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[9px] mb-1 text-slate-400"><span>Ext.Routing </span><span>{isConnected ? 'SECURE' : 'IDLE'}</span></div>
                 <div className="w-full bg-slate-900 rounded-full h-1"><div className={`bg-emerald-500 h-1 rounded-full ${isConnected ? 'w-[100%]' : 'w-[0%]'}`}></div></div>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-900/50">
             <Terminal className="w-3 h-3 mr-2 text-slate-500"/>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest">Protocol Readout</span>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-1.5 custom-scrollbar font-mono">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 italic text-sm">
                 <Network className="w-8 h-8 mb-3 opacity-20" />
                 Standby. Awaiting Dark-Link execution.
              </div>
            ) : (
              logs.map((log, i) => {
                const isError = (log || '').includes('ERROR');
                const isSuccess = (log || '').includes('ESTABLISHED');
                return (
                  <div key={i} className={`text-xs break-all leading-relaxed ${isError ? 'text-rose-500 drop-shadow-[0_0_2px_rgba(244,63,94,0.3)]' : isSuccess ? 'text-emerald-400 font-bold' : 'text-cyan-500/80'}`}>
                    {log}
                  </div>
                )
              })
            )}
            
            {isInitializing && (
              <div className="flex items-center space-x-2 mt-2">
                 <span className="w-2 h-3 bg-cyan-400 animate-ping"></span>
                 <span className="text-[10px] text-slate-500 animate-pulse">NEGOTIATING HANDSHAKE...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
