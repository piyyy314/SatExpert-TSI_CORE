import React, { useState, useEffect } from 'react';
import { Wifi, SignalHigh, ShieldAlert, Shield, Zap, Search, Activity, Cpu } from 'lucide-react';

interface Network {
    ssid: string;
    bssid: string;
    signal: number;
    channel: number;
    encryption: string;
    isDeauthing: boolean;
}

export const WifiCountermeasures: React.FC = () => {
    const [networks, setNetworks] = useState<Network[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);
    const [selectedBssid, setSelectedBssid] = useState<string | null>(null);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
    };

    const startScan = () => {
        if (isScanning) return;
        setIsScanning(true);
        setNetworks([]);
        addLog("Initializing 802.11 spectrum sweep on all channels...");
        
        const possibleNetworks: Network[] = [
            { ssid: "Target_AP_1", bssid: "00:14:22:01:23:45", signal: -45, channel: 1, encryption: "WPA2-PSK", isDeauthing: false },
            { ssid: "Corporate_Guest", bssid: "00:1A:E2:01:21:40", signal: -60, channel: 6, encryption: "OPEN", isDeauthing: false },
            { ssid: 'Hidden_Network', bssid: 'A0:B1:C2:D3:E4:F5', signal: -75, channel: 11, encryption: 'WPA3', isDeauthing: false },
            { ssid: 'Rogue_Hotspot', bssid: 'FF:EE:DD:CC:BB:AA', signal: -30, channel: 6, encryption: 'WEP', isDeauthing: false },
        ];

        let index = 0;
        const scanInterval = setInterval(() => {
            if (index < possibleNetworks.length) {
                setNetworks(prev => [...prev, possibleNetworks[index]]);
                addLog(`Detected BSSID: ${possibleNetworks[index]?.bssid} (${possibleNetworks[index]?.ssid}) on Ch ${possibleNetworks[index]?.channel}`);
                index++;
            } else {
                clearInterval(scanInterval);
                setIsScanning(false);
                addLog("Spectrum sweep complete.");
            }
        }, 1000);
    };

    const toggleDeauth = (bssid: string) => {
        setNetworks(prev => prev.map(net => {
            if (net?.bssid === bssid) {
                const newDeauthState = !net.isDeauthing;
                if (newDeauthState) {
                    addLog(`Executing 802.11 Deauth frames against: ${bssid}`);
                } else {
                    addLog(`Ceasing Deauth frames for: ${bssid}`);
                }
                return { ...net, isDeauthing: newDeauthState };
            }
            return net;
        }));
    };
    
    const rogueAp = () => {
        addLog("Initializing KARMA Rogue AP. Simulating targeted SSID...");
        setTimeout(() => addLog("Rogue AP Broadcasting. Waiting for client associations..."), 1500);
    };

    return (
        <div className="h-full bg-slate-950 p-6 flex flex-col font-mono text-cyan-500 overflow-hidden">
             {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-800 pb-4 mb-4">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center">
                     <Wifi className="w-6 h-6 mr-3 text-cyan-400" />
                     WLAN Countermeasure Suite
                  </h2>
                  <p className="text-xs text-cyan-700 mt-1 uppercase tracking-wider">Tactical 802.11 Interdiction</p>
               </div>
               <div className="flex gap-2">
                   <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] font-black uppercase flex items-center">
                       <Activity className="w-3 h-3 mr-2 text-emerald-500" /> TX: Active
                   </div>
               </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Left Panel: Scan & Networks */}
                <div className="w-1/2 flex flex-col border border-cyan-900/50 bg-slate-900/40 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold uppercase">Spectrum Analysis</h3>
                       <button
                           onClick={startScan}
                           disabled={isScanning}
                           className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded border transition-colors flex items-center ${isScanning ? 'border-cyan-800 text-cyan-800 bg-transparent' : 'border-cyan-500 text-cyan-400 hover:bg-cyan-950'}`}
                       >
                           {isScanning ? <Cpu className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                           {isScanning ? 'Scanning...' : 'Sweep Area'}
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {networks.map((net, idx) => (
                             <div 
                                 key={net?.bssid || idx}
                                 onClick={() => net && setSelectedBssid(net?.bssid)}
                                 className={`p-3 border rounded cursor-pointer transition-all ${selectedBssid === net?.bssid ? 'bg-cyan-900/30 border-cyan-400' : 'bg-slate-950 border-slate-800 hover:border-cyan-700'} ${net?.isDeauthing ? 'border-red-500 bg-red-950/20' : ''}`}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <div>
                                         <div className="font-bold text-slate-200">{net?.ssid}</div>
                                         <div className="text-[10px] text-slate-500">{net?.bssid}</div>
                                     </div>
                                     <div className="flex items-center text-[10px]">
                                         <SignalHigh className={`w-3 h-3 mr-1 ${net?.signal > -50 ? 'text-emerald-500' : net?.signal > -70 ? 'text-yellow-500' : 'text-red-500'}`} />
                                         {net?.signal} dBm
                                     </div>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                                     <span>CH: {net?.channel}</span>
                                     <span>ENC: {net?.encryption}</span>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Right Panel: Operations & Logs */}
                <div className="w-1/2 flex flex-col gap-4">
                    {/* Operations */}
                    <div className="h-1/2 border border-cyan-900/50 bg-slate-900/40 rounded-lg p-4 flex flex-col">
                        <h3 className="text-sm font-bold uppercase mb-4 text-rose-500 flex justify-between items-center">
                            <span>Offensive Actions</span>
                             {selectedBssid && <span className="text-[10px] text-slate-400">Target: {selectedBssid}</span>}
                        </h3>
                        
                        <div className="flex flex-col gap-3">
                           <button
                               disabled={!selectedBssid}
                               onClick={() => selectedBssid && toggleDeauth(selectedBssid)}
                               className={`w-full py-3 border rounded text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all ${!selectedBssid ? 'opacity-50 cursor-not-allowed border-slate-800 text-slate-600' : networks.find(n => n?.bssid === selectedBssid)?.isDeauthing ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'hover:bg-red-950/50 border-red-900 text-red-500 hover:border-red-500'}`}
                           >
                               <Zap className="w-4 h-4 mr-2" />
                               {networks.find(n => n?.bssid === selectedBssid)?.isDeauthing ? 'Halt Deauth' : 'Launch Deauth Attack'}
                           </button>

                           <button
                               onClick={rogueAp}
                               className="w-full py-3 border border-orange-800 text-orange-500 hover:bg-orange-950/50 hover:border-orange-500 rounded text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all"
                           >
                               <ShieldAlert className="w-4 h-4 mr-2" />
                               Deploy KARMA Rogue AP
                           </button>
                           <button
                             className="w-full py-3 border border-purple-800 text-purple-500 hover:bg-purple-950/50 hover:border-purple-500 rounded text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all"
                             onClick={() => addLog("WPA2 Handshake capture initiated... listening on current channel.")}
                             disabled={!selectedBssid}
                           >
                              <Shield className="w-4 h-4 mr-2" />
                              Capture Handshake
                           </button>
                        </div>
                    </div>

                    {/* Terminal Logs */}
                    <div className="h-1/2 border border-slate-800 bg-black rounded-lg p-3 flex flex-col overflow-hidden">
                        <div className="text-[10px] text-slate-500 uppercase font-black mb-2 pb-2 border-b border-slate-800">Operation Log</div>
                        <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="text-slate-400">
                                    <span className="text-cyan-800 mr-2">[{log.time}]</span>
                                    <span>{log.msg}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-slate-700 italic text-center mt-4">Awaiting commands...</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
