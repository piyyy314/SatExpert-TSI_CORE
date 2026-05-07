import React, { useState } from 'react';
import { Terminal, Shield, Search, Activity, Cpu } from 'lucide-react';

export const NmapScanner: React.FC = () => {
  const [targetIp, setTargetIp] = useState('192.168.1.100');
  const [scanType, setScanType] = useState('SYN Stealth');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setProgress(0);
    setScanLog([`[${new Date().toLocaleTimeString()}] Initializing Nmap 8.00 ( https://nmap.org )`]);
    setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting ${scanType} scan on ${targetIp}`]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          setIsScanning(false);
          setScanLog(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Discovered open port 22/tcp (ssh)`,
            `[${new Date().toLocaleTimeString()}] Discovered open port 80/tcp (http)`,
            `[${new Date().toLocaleTimeString()}] Discovered open port 443/tcp (https)`,
            `[${new Date().toLocaleTimeString()}] Nmap done: 1 IP address (1 host up) scanned in 3.42 seconds`
          ]);
        }, 500);
      }
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress < 100 && Math.random() > 0.6) {
        const ports = [21, 23, 25, 53, 110, 143, 3306, 3389];
        const randomPort = ports[Math.floor(Math.random() * ports.length)];
        setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scanning port ${randomPort}...`]);
      }
      
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-full h-[600px] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
        <Terminal className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Nmap Advanced Scanner</h2>
        <span className="ml-auto text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">NSE_AUTO_LOAD</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden">
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Search className="w-3 h-3 mr-1" />
                Target IP / Hostnet
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                disabled={isScanning}
              />
            </div>
            
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Scan Type
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 appearance-none"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                disabled={isScanning}
              >
                <option value="SYN Stealth">SYN Stealth (-sS)</option>
                <option value="Connect">TCP Connect (-sT)</option>
                <option value="UDP">UDP Scan (-sU)</option>
                <option value="Aggressive">Aggressive (-A)</option>
                <option value="Deep Scan">Deep Scan (-p- -A)</option>
                <option value="Version Detection">Version Detection (-sV)</option>
              </select>
            </div>
          </div>

          <button
            onClick={startScan}
            disabled={isScanning}
            className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
            }`}
          >
            {isScanning ? 'Scanning...' : 'Execute Scan'}
          </button>
          
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
             <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center"><Activity className="w-3 h-3 mr-1"/> Resource Usage</span>
             </div>
             <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-[9px] mb-1 text-slate-400"><span>CPU </span><span>{isScanning ? '78%' : '12%'}</span></div>
                 <div className="w-full bg-slate-900 rounded-full h-1"><div className={`bg-cyan-500 h-1 rounded-full ${isScanning ? 'w-[78%] animate-pulse' : 'w-[12%]'}`}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[9px] mb-1 text-slate-400"><span>MEM </span><span>{isScanning ? '42%' : '18%'}</span></div>
                 <div className="w-full bg-slate-900 rounded-full h-1"><div className={`bg-emerald-500 h-1 rounded-full ${isScanning ? 'w-[42%]' : 'w-[18%]'}`}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[9px] mb-1 text-slate-400"><span>NET </span><span>{isScanning ? '12.4 Mbps' : '0.1 Mbps'}</span></div>
                 <div className="w-full bg-slate-900 rounded-full h-1"><div className={`bg-rose-500 h-1 rounded-full ${isScanning ? 'w-[65%]' : 'w-[5%]'}`}></div></div>
               </div>
             </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
             <div className="bg-slate-900 border border-slate-800 rounded p-2">
                 <div className="text-[9px] text-slate-500 uppercase mb-1">OS Stack Fingerprint</div>
                 <div className="text-amber-500 text-xs font-black tracking-widest">INDETERMINATE</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded p-2">
                 <div className="text-[9px] text-slate-500 uppercase mb-1">Conf. Score</div>
                 <div className="text-cyan-500 text-xs font-black tracking-widest">32.</div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-900/50">
             <Cpu className="w-3 h-3 mr-2 text-slate-500"/>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest">Execution Terminal</span>
             {isScanning && (
               <div className="ml-auto flex items-center space-x-2">
                 <span className="text-[9px] text-cyan-500">{Math.round(progress)}%</span>
                 <div className="w-24 bg-slate-800 rounded-full h-1"><div className="bg-cyan-500 h-1 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div></div>
               </div>
             )}
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-1.5 custom-scrollbar">
            {scanLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-sm">
                 root@kali:~# Awaiting execution parameters...
              </div>
            ) : (
              scanLog.map((log, i) => (
                <div key={i} className="text-xs break-all leading-relaxed text-emerald-400/90 drop-shadow-[0_0_2px_rgba(52,211,153,0.3)] hover:text-emerald-300">
                  {log}
                </div>
              ))
            )}
            
            {isScanning && (
              <div className="flex items-center space-x-2 mt-2">
                 <span className="w-2 h-3 bg-cyan-400 animate-ping"></span>
                 <span className="text-[10px] text-slate-500">nmap -sS -O -A {targetIp}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
