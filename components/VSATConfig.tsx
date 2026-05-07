
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfigLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'NETWORK' | 'ALIGNMENT' | 'SECURITY';
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
}

interface VSATSettings {
  ip: string;
  subnet: string;
  gateway: string;
  dns1: string;
  dns2: string;
  azimuth: number;
  elevation: number;
  skew: number;
}

export const VSATConfig: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [settings, setSettings] = useState<VSATSettings>({
    ip: '10.0.42.15',
    subnet: '255.255.255.0',
    gateway: '10.0.42.1',
    dns1: '8.8.8.8',
    dns2: '1.1.1.1',
    azimuth: 142.5,
    elevation: 32.8,
    skew: -15.2,
  });
  const [logs, setLogs] = useState<ConfigLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addLog = (action: string, category: ConfigLog['category'], status: ConfigLog['status'] = 'SUCCESS') => {
    const newLog: ConfigLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      action,
      category,
      status,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleAuthorize = () => {
    // Auth: any 6-digit code starting with '7'
    if (authCode === '777888' || authCode === 'TSA_ADMIN') {
      setIsAuthorized(true);
      addLog('Authorized Access Granted', 'SECURITY', 'SUCCESS');
    } else {
      addLog('Unauthorized Access Attempt', 'SECURITY', 'FAILURE');
      alert('INVALID AUTHORIZATION CRYPTO-KEY');
    }
  };

  const saveSettings = async (category: ConfigLog['category']) => {
    setIsSaving(true);
    // API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    addLog(`Updated ${category} parameters remotely`, category, 'SUCCESS');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">📡</span> VSAT <span className="text-emerald-400 ml-2">Remote Config</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Terminal Node Override // Secure Layer IV</p>
        </div>
        <div className="flex items-center space-x-4">
           {isAuthorized ? (
             <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SECURE_LINK_ACTIVE</span>
             </div>
           ) : (
             <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-red-500">
               <span className="text-[9px] font-black uppercase tracking-widest">ENCRYPTED_LOCK</span>
             </div>
           )}
        </div>
      </header>

      {!isAuthorized ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="glass p-10 rounded-3xl border-slate-800 bg-slate-950/40 w-full max-w-md text-center space-y-8">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
               <span className="text-3xl text-emerald-500">🔒</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Authentication Required</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter RSA-4096 Secure Access Token</p>
            </div>
            <div className="space-y-4">
               <input 
                 type="password"
                 value={authCode}
                 onChange={(e) => setAuthCode(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-emerald-400 mono tracking-[0.5em] outline-none focus:border-emerald-500"
                 placeholder="••••••••"
               />
               <button 
                 onClick={handleAuthorize}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40"
               >
                 Verify_Identity
               </button>
               <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Hint: Try TSA_ADMIN for demo access</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Network Config */}
            <section className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Network_Architecture</h3>
                 <span className="text-[8px] text-slate-500 font-bold uppercase mono">IP_V4_STACK</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal_IP</label>
                    <input 
                      type="text" 
                      value={settings.ip} 
                      onChange={e => setSettings({...settings, ip: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Subnet_Mask</label>
                    <input 
                      type="text" 
                      value={settings.subnet} 
                      onChange={e => setSettings({...settings, subnet: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gateway_Entry</label>
                    <input 
                      type="text" 
                      value={settings.gateway} 
                      onChange={e => setSettings({...settings, gateway: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary_DNS</label>
                    <input 
                      type="text" 
                      value={settings.dns1} 
                      onChange={e => setSettings({...settings, dns1: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Secondary_DNS</label>
                    <input 
                      type="text" 
                      value={settings.dns2} 
                      onChange={e => setSettings({...settings, dns2: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                    />
                 </div>
              </div>
              <button 
                onClick={() => saveSettings('NETWORK')}
                disabled={isSaving}
                className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-[10px] font-black py-4 rounded-xl uppercase tracking-widest transition-all"
              >
                {isSaving ? 'Processing_Packet...' : 'Apply_Network_Changes'}
              </button>
            </section>

            {/* Alignment Config */}
            <section className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Pointing_Parameters</h3>
                 <span className="text-[8px] text-slate-500 font-bold uppercase mono">RF_ALIGNMENT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Azimuth_Deg</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={settings.azimuth} 
                        onChange={e => setSettings({...settings, azimuth: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-emerald-500/50 font-bold">AZ_REF</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Elevation_Deg</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={settings.elevation} 
                        onChange={e => setSettings({...settings, elevation: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-emerald-500/50 font-bold">EL_REF</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Skew_Pol</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={settings.skew} 
                        onChange={e => setSettings({...settings, skew: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-emerald-400 mono outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-emerald-500/50 font-bold">PL_REF</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => saveSettings('ALIGNMENT')}
                  disabled={isSaving}
                  className="flex-grow md:flex-none md:px-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-[10px] font-black py-4 rounded-xl uppercase tracking-widest transition-all"
                >
                  {isSaving ? 'Synchronizing...' : 'Slew_And_Adjust'}
                </button>
                <div className="hidden md:block flex-grow px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                   <p className="text-[8px] text-emerald-500/70 font-bold leading-relaxed italic uppercase tracking-wider">
                     Warning: Remote alignment adjustments may cause signal loss if parameters exceed beam tolerance.
                   </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-emerald-500/50 underline-offset-4">Audit_Log_SITREP</h3>
                <div className="flex items-center space-x-3">
                   <button 
                     onClick={() => {
                        if (logs.length === 0) return;
                        const data = logs.map(l => `[${l.timestamp}] [${l.category}] [${l.status}] ${l.action}`).join('\n');
                        const blob = new Blob([data], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `VSAT_AUDIT_${new Date().getTime()}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                     }}
                     disabled={logs.length === 0}
                     className="text-[8px] text-emerald-500/50 hover:text-emerald-500 font-bold uppercase tracking-widest disabled:opacity-20 transition-colors"
                   >
                     Export
                   </button>
                   <span className="text-[7px] text-slate-600 font-bold uppercase mono">READ_ONLY_X1</span>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[500px]">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                          log.category === 'NETWORK' ? 'text-blue-400 border-blue-400/20' : 
                          log.category === 'ALIGNMENT' ? 'text-purple-400 border-purple-400/20' : 
                          'text-emerald-400 border-emerald-400/20'
                        }`}>
                          {log.category}
                        </span>
                        <span className="text-[8px] text-slate-600 mono font-bold">{log.timestamp}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{log.action}</p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-1 h-1 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-[7px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-700 opacity-40">
                    <span className="text-2xl mb-2">📜</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">No Events Recorded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware_Status</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-[8px] font-bold text-slate-600 uppercase">Temp</p>
                    <p className="text-xs font-black text-white">42.4°C</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-[8px] font-bold text-slate-600 uppercase">Uptime</p>
                    <p className="text-xs font-black text-white">124h 12m</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
