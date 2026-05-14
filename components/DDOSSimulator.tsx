import React, { useState, useEffect } from 'react';
import { Shield, Activity, Zap, Play, Square, Loader, Globe, Server, Crosshair, AlertTriangle, ShieldAlert, Terminal, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export const DDOSSimulator: React.FC = () => {
  const [targetIP, setTargetIP] = useState('192.168.1.100');
  const [attackType, setAttackType] = useState<'HTTP_FLOOD' | 'SYN_FLOOD' | 'UDP_FLOOD' | 'SLOWLORIS'>('HTTP_FLOOD');
  const [intensity, setIntensity] = useState(50);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'flood' | 'payload'>('flood');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [selectedPayload, setSelectedPayload] = useState('none');
  
  const [metrics, setMetrics] = useState({
    activeBots: 0,
    requestsPerSecond: 0,
    bandwidthGbps: 0,
    targetResponseTime: 45 // ms
  });

  const [logs, setLogs] = useState<string[]>([
    "[SYS] DDoS Simulation Module Initialized.",
    "[SYS] Awaiting target designation. THIS IS A SIMULATION ONLY."
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && activeTab === 'flood') {
      interval = setInterval(() => {
        setMetrics(prev => {
          const newBots = Math.min(15000, prev.activeBots + Math.floor(Math.random() * 500) + 100);
          const baseMultiplier = intensity / 50;
          return {
            activeBots: newBots,
            requestsPerSecond: Math.floor(newBots * Math.random() * 8 * baseMultiplier),
            bandwidthGbps: parseFloat(((newBots * Math.random() * 0.05 * baseMultiplier)).toFixed(2)),
            targetResponseTime: Math.min(5000, prev.targetResponseTime + Math.floor(Math.random() * 100 * baseMultiplier))
          };
        });

        if (Math.random() > 0.8) {
          setLogs(prevLogs => {
            const newLogs = [...prevLogs, `[${new Date().toLocaleTimeString()}] Target response time degrading...`];
            return newLogs.slice(-15);
          });
        }
      }, 1000);
    } else {
      setMetrics(prev => ({
        activeBots: Math.max(0, prev.activeBots - 500),
        requestsPerSecond: 0,
        bandwidthGbps: 0,
        targetResponseTime: 45
      }));
    }
    return () => clearInterval(interval);
  }, [isActive, intensity, activeTab]);

  const toggleAttack = () => {
    if (!isActive) {
      if (!targetIP) {
        setLogs(prev => [...prev.slice(-14), "[ERROR] Must specify a target IP."]);
        return;
      }
      setIsActive(true);
      setLogs(prev => [...prev.slice(-14), `[INIT] Commencing ${attackType} sequence against ${targetIP}...`]);
    } else {
      setIsActive(false);
      setLogs(prev => [...prev.slice(-14), `[STOP] Halting attack transmission.`]);
    }
  };

  const deployPayload = () => {
    if (!targetIP) {
        setLogs(prev => [...prev.slice(-14), "[ERROR] Must specify a target IP."]);
        return;
    }
    if (selectedPayload === 'none') {
        setLogs(prev => [...prev.slice(-14), "[ERROR] No payload selected."]);
        return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setLogs(prev => [...prev.slice(-14), `[UPLOAD] Initiating ${selectedPayload} delivery to ${targetIP}...`]);
    
    let simProgress = 0;
    const uploadInterval = setInterval(() => {
        simProgress += Math.random() * 15;
        if (simProgress >= 100) {
            simProgress = 100;
            clearInterval(uploadInterval);
            setIsUploading(false);
            setLogs(prev => [...prev.slice(-14), `[SUCCESS] Payload embedded successfully. Target compromised.`]);
        }
        setUploadPercent(Math.floor(simProgress));
    }, 500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,0,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4 relative z-10">
        <Globe className="w-6 h-6 text-rose-500" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Distributed Denial of Service (Sim)</h2>
        <span className="ml-auto text-xs text-rose-500 bg-rose-950 px-2 py-1 rounded border border-rose-900 font-bold">STRESS_TEST_MODE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden relative z-10">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="flex space-x-2 border-b border-slate-800 pb-2">
            <button
               onClick={() => setActiveTab('flood')}
               className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest rounded-t-lg transition-all ${
                 activeTab === 'flood' ? 'bg-rose-900/50 text-rose-400 border border-rose-800 border-b-0' : 'bg-slate-950 text-slate-500 hover:text-slate-300'
               }`}
            >Flood Attack</button>
            <button
               onClick={() => setActiveTab('payload')}
               className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest rounded-t-lg transition-all ${
                 activeTab === 'payload' ? 'bg-rose-900/50 text-rose-400 border border-rose-800 border-b-0' : 'bg-slate-950 text-slate-500 hover:text-slate-300'
               }`}
            >Payload Delivery</button>
          </div>

          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target IPv4/Url</label>
              <div className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <div className="px-3 flex items-center justify-center bg-slate-800">
                  <Crosshair className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={targetIP}
                  onChange={e => setTargetIP(e.target.value)}
                  disabled={isActive || isUploading}
                  className="flex-grow bg-transparent px-3 py-2 text-sm text-cyan-400 outline-none"
                  placeholder="e.g. 192.168.1.100"
                />
              </div>
            </div>

            {activeTab === 'flood' ? (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Attack Vector</label>
                  <select 
                    value={attackType}
                    onChange={(e) => setAttackType(e.target.value as any)}
                    disabled={isActive}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-500 outline-none focus:border-cyan-500"
                  >
                    <option value="HTTP_FLOOD">HTTP GET Flood (Layer 7)</option>
                    <option value="SYN_FLOOD">TCP SYN Flood (Layer 4)</option>
                    <option value="UDP_FLOOD">UDP Amplification</option>
                    <option value="SLOWLORIS">Slowloris</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Botnet Intensity</label>
                     <span className="text-[10px] text-cyan-400 font-bold">{intensity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="100" 
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </>
            ) : (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Select Payload/Malware</label>
                  <select 
                    value={selectedPayload}
                    onChange={(e) => setSelectedPayload(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-500 outline-none focus:border-cyan-500 mb-4"
                  >
                    <option value="none">-- select payload --</option>
                    <option value="RAT_DROPPER_V4">Remote Access Trojan (RAT v4)</option>
                    <option value="RANSOM_ENCRYPTOR">Ransomware Core Encryptor</option>
                    <option value="KEYLOGGER_SILENT">Silent Keylogger Kernel Mod</option>
                    <option value="CRYPTO_MINER_BG">Background Crypto Miner</option>
                    <option value="IMG_STEGO_PAYLOAD">Steganography Image Payload</option>
                  </select>

                  {isUploading && (
                     <div className="w-full h-2 bg-slate-800 rounded overflow-hidden mt-4">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300"
                          style={{ width: `${uploadPercent}%` }}
                        />
                     </div>
                  )}
                </div>
            )}
          </div>

          {activeTab === 'flood' ? (
            <button
              onClick={toggleAttack}
              className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${
                isActive 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isActive ? 'ABORT TRANSMISSION' : 'INITIATE SIMULATION'}</span>
            </button>
          ) : (
             <button
                onClick={deployPayload}
                disabled={isUploading || selectedPayload === 'none' || !targetIP}
                className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${
                   isUploading || selectedPayload === 'none' || !targetIP
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                }`}
             >
                {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploading ? 'UPLOADING...' : 'DEPLOY PAYLOAD'}</span>
             </button>
          )}
        </div>

        {/* Right Column: Telemetry & Visuals */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
               <Server className="w-5 h-5 text-slate-500 mb-2" />
               <span className="text-[10px] text-slate-400 uppercase tracking-widest">Active Bots</span>
               <span className="text-xl font-black text-cyan-400">{metrics.activeBots.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
               {isActive && <motion.div className="absolute bottom-0 left-0 right-0 bg-rose-500/20" initial={{height:0}} animate={{height: '100%'}} transition={{duration:0.2}} />}
               <Zap className="w-5 h-5 text-slate-500 mb-2 relative z-10" />
               <span className="text-[10px] text-slate-400 uppercase tracking-widest relative z-10">Reqs / Sec</span>
               <span className="text-xl font-black text-amber-500 relative z-10">{metrics.requestsPerSecond.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
               <Activity className="w-5 h-5 text-slate-500 mb-2" />
               <span className="text-[10px] text-slate-400 uppercase tracking-widest">Bandwidth</span>
               <span className="text-xl font-black text-purple-400">{metrics.bandwidthGbps.toFixed(2)} Gbps</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
               <AlertTriangle className="w-5 h-5 text-slate-500 mb-2" />
               <span className="text-[10px] text-slate-400 uppercase tracking-widest">Target Latency</span>
               <span className={`text-xl font-black ${metrics.targetResponseTime > 2000 ? 'text-rose-500' : 'text-emerald-500'}`}>{metrics.targetResponseTime} ms</span>
            </div>
          </div>

          {/* Execution Log */}
          <div className="flex-grow bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3 border-b border-slate-800 pb-2">Simulation Engagement Log</div>
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1 text-xs">
              {logs.map((L, i) => (
                <div key={i} className={L.includes('[INIT]') || L.includes('Commencing') ? 'text-rose-400' : L.includes('degrading') ? 'text-amber-400' : 'text-slate-400'}>
                  &gt; {L}
                </div>
              ))}
              {isActive && (
                <div className="flex items-center space-x-2 text-rose-500 mt-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="opacity-70 italic font-bold">FLOODING IN PROGRESS...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
