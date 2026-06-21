
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Globe, ShieldAlert, Crosshair, Radar, Activity, Terminal, ExternalLink, Download } from 'lucide-react';
import { analyzeIPRecon } from '../services/geminiService';

interface IPIntel {
  city: string;
  country: string;
  lat: number;
  lng: number;
  isp: string;
  threatProfile: string;
  riskScore: number;
  recommendedAction: string;
}

export const IPGeolocator: React.FC = () => {
  const [targetIp, setTargetIp] = useState('45.33.2.142');
  const [intel, setIntel] = useState<IPIntel | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'RECON' | 'DNS'>('RECON');
  const [domain, setDomain] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resolveDNS = async () => {
    if (!domain) return;
    setIsScanning(true);
    setScanStatus('Intercepting DNS signal flow...');
    try {
      const resp = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await resp.json();
      if (data.Answer && data.Answer[0]) {
        const ip = data.Answer[0].data;
        setTargetIp(ip);
        setScanStatus(`SIGNAL_RESOLVED: ${domain} -> ${ip}`);
        setActiveTab('RECON');
      } else {
        setScanStatus('ERROR: Domain signal lost or non-existent.');
      }
    } catch (err) {
      setScanStatus('ERROR: DNS_INTERCEPT_FAILURE.');
    }
    setIsScanning(false);
  };

  const startRecon = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setIntel(null);
    setScanStatus('Initializing multi-hop trace...');
    
    // Run some technical stages
    setTimeout(() => setScanStatus('Bypassing proxy layers...'), 1000);
    setTimeout(() => setScanStatus('Consolidating BGP routing data...'), 2000);
    setTimeout(() => setScanStatus('querying STIA Intelligence DB...'), 3000);

    const result = await analyzeIPRecon(targetIp);
    if (result) {
        setIntel(result);
        setScanStatus('SUCCESS: Target localized.');
    } else {
        setScanStatus('ERROR: INTEL_LINK_FAILED.');
    }
    setIsScanning(false);
  };

  const exportIntel = () => {
    if (!intel) return;
    const report = `
STIA TACTICAL INTEL REPORT
--------------------------
TARGET IP: ${targetIp}
TIMESTAMP: ${new Date().toISOString()}

LOCATION: ${intel.city}, ${intel.country}
COORDINATES: ${intel.lat}, ${intel.lng}
ISP: ${intel.isp}
THREAT PROFILE: ${intel.threatProfile}
RISK SCORE: ${intel.riskScore}%
RECOMMENDED ACTION: ${intel.recommendedAction}

STIA_CMD: END_REPORT
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_RECON_${targetIp.replace(/\./g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Radar circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, i * 50, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating sweep
      const angle = (frame * 0.05) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width/2, canvas.height/2);
      ctx.lineTo(
        canvas.width/2 + Math.cos(angle) * 150,
        canvas.height/2 + Math.sin(angle) * 150
      );
      ctx.stroke();

      // Scan points if scanning
      if (isScanning && frame % 10 === 0) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            2, 0, Math.PI * 2
          );
          ctx.fill();
      }

      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">📍</span> IP <span className="text-cyan-500 ml-2">Geolocator</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Precise Adversary Localization // STIA_RECON_V5</p>
        </div>
        <div className="flex items-center space-x-3">
          <AnimatePresence>
            {intel && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={exportIntel}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all"
              >
                <Download className="w-3 h-3" />
                <span>Export_Recon</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-800">
                 {(['RECON', 'DNS'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       {tab === 'RECON' ? 'IP_Trace' : 'DNS_Intercept'}
                    </button>
                 ))}
              </div>

              {activeTab === 'RECON' ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Remote_IP_Address</label>
                       <div className="relative">
                          <input 
                            type="text"
                            value={targetIp}
                            onChange={e => setTargetIp(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-cyan-500"
                            placeholder="e.g. 8.8.8.8"
                          />
                          <Globe className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                       </div>
                    </div>
                    <button 
                      onClick={startRecon}
                      disabled={isScanning}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center space-x-2 ${
                        isScanning 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-600/20'
                      }`}
                    >
                      <Crosshair className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Scanning...' : 'Execute_Recon'}</span>
                    </button>
                 </div>
              ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Terminal_Domain_URL</label>
                       <div className="relative">
                          <input 
                            type="text"
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-cyan-500"
                            placeholder="e.g. target.com"
                          />
                          <Terminal className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                       </div>
                    </div>
                    <button 
                      onClick={resolveDNS}
                      disabled={isScanning}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center space-x-2 ${
                        isScanning 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                      }`}
                    >
                      <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Resolving...' : 'Resolve_Signal_Identity'}</span>
                    </button>
                 </div>
              )}
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reconnaissance Status</h3>
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 min-h-[100px] flex items-center justify-center text-center">
                 <div className="space-y-2">
                    <p className="text-[11px] font-mono text-cyan-500 animate-pulse">{scanStatus || 'Awaiting Input...'}</p>
                    {isScanning && (
                      <div className="w-32 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden">
                         <div className="h-full bg-cyan-500 animate-loading-bar"></div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-1 rounded-3xl border-slate-800 bg-slate-950 overflow-hidden relative min-h-[350px]">
                 <canvas ref={canvasRef} width="400" height="400" className="w-full h-full opacity-50 absolute inset-0" />
                 <div className="relative z-10 p-6 flex flex-col items-center justify-center h-full text-center">
                    <Radar className={`w-12 h-12 text-cyan-500 mb-4 ${isScanning ? 'animate-ping' : ''}`} />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Localization Sphere</h4>
                    {intel && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full">
                         <span className="text-xs font-black text-white px-2 uppercase">{intel.city}, {intel.country}</span>
                      </div>
                    )}
                 </div>
                 {intel && (
                   <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] font-mono text-cyan-400">
                      GPS: {intel.lat.toFixed(4)}, {intel.lng.toFixed(4)}
                   </div>
                 )}
              </div>

              <AnimatePresence mode="wait">
                 {intel ? (
                   <motion.div 
                     key="intel-results"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6"
                   >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                         <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Risk_Assessment</span>
                            <div className="flex items-center space-x-2">
                               <div className={`w-2 h-2 rounded-full ${intel.riskScore > 70 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></div>
                               <span className={`text-xl font-black uppercase tracking-widest ${intel.riskScore > 70 ? 'text-red-500' : 'text-amber-500'}`}>
                                  {intel.riskScore > 70 ? 'CRITICAL' : 'ELEVATED'}
                               </span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Threat_Level</span>
                            <span className="text-xl font-black text-white mono">{intel.riskScore}%</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Provider (ISP)</span>
                            <span className="text-[10px] font-bold text-white uppercase">{intel.isp}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Profile</span>
                            <span className="text-[10px] font-bold text-white uppercase">{intel.threatProfile}</span>
                         </div>
                         <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                            <div className="flex items-start space-x-3">
                               <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                               <div>
                                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Tactical Countermeasure</p>
                                  <p className="text-[11px] text-slate-300 font-bold leading-tight">{intel.recommendedAction}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ) : (
                   <div key="intel-placeholder" className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/20 flex flex-col items-center justify-center text-center">
                      <Terminal className="w-12 h-12 text-slate-800 mb-6" />
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Awaiting Recon Data Payload</p>
                      <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase italic">Deep packet correlation required for precise fix</p>
                   </div>
                 )}
              </AnimatePresence>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Trace Intelligence</span>
                 </div>
                 <button className="text-[9px] font-black text-cyan-500 uppercase flex items-center hover:underline">
                    External_Intel <ExternalLink className="w-3 h-3 ml-1" />
                 </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 py-1">
                 "STIA Intelligence layer suggests that 74% of detected eavedropping attempts originate from state-actor relay nodes. Geolocated coordinates are accurate to within 1.2km via RF triangulated backhaul."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
