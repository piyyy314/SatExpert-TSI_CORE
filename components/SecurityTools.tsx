
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { playSystemVoice } from '../services/audioService.ts';
import { QuantumDefense } from './QuantumDefense.tsx';
import { WarGamesSimulator } from './WarGamesSimulator.tsx';
import { SecurityTab } from '../types.ts';
import { YaraIntelligence } from './YaraIntelligence.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  FileSearch, 
  Code, 
  Terminal, 
  Boxes, 
  Zap, 
  Fingerprint, 
  Search,
  Target,
  Activity,
  Terminal as TerminalIcon,
  ShieldAlert as SecurityIcon
} from 'lucide-react';

interface Props {
  userLoc: { lat: number, lng: number };
  selectedSatName: string;
  isJamming: boolean;
  setIsJamming: (val: boolean) => void;
  jammingPower: number;
  setJammingPower: (val: number) => void;
  signalQuality: number;
  onBack?: () => void;
  isStealthMode: boolean;
  setIsStealthMode: (val: boolean) => void;
  addMissionLog: (detail: string, status: any) => void;
}

interface IPLogEntry {
  time: string;
  msg: string;
  type: 'INFO' | 'WARN' | 'SUCCESS' | 'FAIL' | 'ALERT';
}

const TACTICAL_SCRIPTS = [
  {
    id: 'aether_decoy',
    category: 'Advanced',
    name: 'Aetheric Decoy Gen.',
    lang: 'python',
    code: `import random

def deploy_aether_decoy(target_freq, num_ghosts=5):
    """Generates ghost signals in sub-space to mask true carrier."""
    decoys = []
    for _ in range(num_ghosts):
        offset = random.uniform(-50.0, 50.0) # MHz
        ghost_freq = target_freq + (offset / 1000.0)
        decoys.append({
            "freq": ghost_freq,
            "power": random.randint(-45, -30),
            "phase": random.randint(0, 359)
        })
    return decoys

# GHOST_UPLINK: ACTIVE
print(f"[!] DEPLOYING {len(deploy_aether_decoy(14.25))} SUB-SPACE DECOYS")`
  },
  {
    id: 'aether_mod',
    category: 'Advanced',
    name: 'Aetheric Flux Shielding',
    lang: 'python',
    code: `import numpy as np

def modulate_aether_shield(carrier_freq, resonance_point=1.618):
    """Encapsulates RF frames in high-frequency aetheric harmonics."""
    t = np.linspace(0, 1, 1024)
    aether_flux = np.sin(2 * np.pi * resonance_point * t)
    carrier = np.sin(2 * np.pi * carrier_freq * t)
    
    # Non-linear coupling for sub-space propagation
    shielded_signal = carrier * (1 + 0.1 * aether_flux)
    return shielded_signal

print("[!] AETHERIC_SHIELD: STABILIZED")`
  },
  {
    id: 'zero_point',
    category: 'Advanced',
    name: 'Zero-Point Extraction',
    lang: 'shell',
    code: `# Initiates quantum vacuum energy harvest for BUC cooling
# WARNING: Potential decoherence risk in Ka-band
echo "STIA_ZPE_INIT: Requesting Vacuum Grid Access..."
modprobe q-vacuum-driver
echo 1 > /proc/sys/quantum/zpe_drain
echo "[OK] THERMAL_DELTA: -42C (Vacuum Grounding Active)"`
  },
  {
    id: 'tachyon_sync',
    category: 'Advanced',
    name: 'Tachyon Drift Corr.',
    lang: 'cpp',
    code: `// Relativistic clock synchronization for high-velocity orbits
double calculate_tachyon_drift(double local_clock, double sat_clock) {
    const double C = 299792458.0;
    const double V = 3070.0; // Mean velocity
    double gamma = 1 / sqrt(1 - pow(V/C, 2));
    
    // Reverse time dilation via tachyon bursts
    return (sat_clock - local_clock) * gamma;
}`
  },
  {
    id: 'rf_entropy',
    category: 'Defensive',
    name: 'RF Entropy Monitor',
    lang: 'python',
    code: `import math
def calculate_entropy(data):
    if not data: return 0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(chr(x)))/len(data)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return entropy`
  },
  {
    id: 'header_spoof',
    category: 'Offensive',
    name: 'DVB-S2 Header Injector',
    lang: 'python',
    code: `import binascii
def craft_dvb_s2_frame(data_payload):
    MATYPE = "f0"
    UPL = "0000"
    DFL = binascii.hexlify(len(data_payload).to_bytes(2, 'big')).decode()
    return f"{MATYPE}{UPL}{DFL}" + binascii.hexlify(data_payload).decode()`
  }
];

export const SecurityTools: React.FC<Props> = ({ 
  userLoc, selectedSatName, isJamming, setIsJamming, jammingPower, setJammingPower, signalQuality, onBack, isStealthMode, setIsStealthMode, addMissionLog
}) => {
  const [activeTab, setActiveTab] = useState<SecurityTab>('overview');
  const [ipAttackLog, setIpAttackLog] = useState<IPLogEntry[]>([]);
  const [dnsLogs, setDnsLogs] = useState<IPLogEntry[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [domainToResolve, setDomainToResolve] = useState('satcom-mesh.mil');
  const [isIpAttacking, setIsIpAttacking] = useState(false);
  const [targetIp, setTargetIp] = useState('10.254.1.42');
  const [selectedScript, setSelectedScript] = useState(TACTICAL_SCRIPTS[0]);
  const [copyStatus, setCopyStatus] = useState(false);

  const sentinelCanvasRef = useRef<HTMLCanvasElement>(null);
  const strikeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      const canvas = sentinelCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frame = 0;
      const packets: any[] = [];

      const animate = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 30) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 30) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();

        if (frame % 20 === 0) {
          packets.push({
            x: 0, y: Math.random() * canvas.height,
            speed: 1.5 + Math.random() * 3,
            type: Math.random() > 0.92 ? 'malicious' : 'nominal',
            size: 3 + Math.random() * 4
          });
        }

        packets.forEach((p, i) => {
          p.x += p.speed;
          if (p.type === 'malicious') {
             ctx.shadowBlur = 10;
             ctx.shadowColor = '#ef4444';
             ctx.fillStyle = '#ef4444';
          } else {
             ctx.shadowBlur = 0;
             ctx.fillStyle = '#22d3ee';
          }
          ctx.fillRect(p.x, p.y, p.size, p.size);
          if (p.x > canvas.width) packets.splice(i, 1);
        });

        requestAnimationFrame(animate);
      };
      const h = requestAnimationFrame(animate);
      return () => {
        cancelAnimationFrame(h);
        ctx.shadowBlur = 0;
      };
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'attack') {
        const canvas = strikeCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        const bursts: any[] = [];

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#050810';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isIpAttacking && frame % 12 === 0) {
                bursts.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    r: 0,
                    alpha: 1,
                    v: 3 + Math.random() * 3
                });
            }

            bursts.forEach((b, i) => {
                b.r += b.v;
                b.alpha -= 0.025;
                ctx.strokeStyle = `rgba(239, 68, 68, ${b.alpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
                if (b.alpha <= 0) bursts.splice(i, 1);
            });

            ctx.fillStyle = isIpAttacking ? '#ef4444' : '#1e293b';
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 8, 0, Math.PI*2);
            ctx.fill();

            requestAnimationFrame(animate);
        };
        const h = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(h);
    }
  }, [activeTab, isIpAttacking]);

  const addIpLog = (msg: string, type: IPLogEntry['type'] = 'INFO') => {
    setIpAttackLog(prev => [{ time: new Date().toLocaleTimeString([], { hour12: false }), msg, type }, ...prev].slice(0, 50));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedScript.code);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const triggerAttack = () => {
    if (isIpAttacking) return;
    setIsIpAttacking(true);
    addIpLog(`INIT: RF Frame Injection Vector localizing...`, 'INFO');
    setTimeout(() => addIpLog(`Syncing with ${targetIp} over DVB-S2 link...`, 'INFO'), 1000);
    setTimeout(() => addIpLog(`ALERT: Gateway hardware ID spoof target found.`, 'ALERT'), 2500);
    setTimeout(() => {
        addIpLog(`SUCCESS: Injection confirmed. Remote BUC disabled.`, 'SUCCESS');
        setIsIpAttacking(false);
        addMissionLog(`Offensive strike against ${targetIp} completed.`, 'STRIKE');
    }, 4500);
  };

  const handleResolveDomain = async () => {
    if (!domainToResolve || isResolving) return;
    setIsResolving(true);
    const timeNow = new Date().toLocaleTimeString([], { hour12: false });
    const addDnsLog = (msg: string, type: IPLogEntry['type'] = 'INFO') => {
      setDnsLogs(prev => [{ time: timeNow, msg, type }, ...prev].slice(0, 50));
    };

    addDnsLog(`INIT: Intercepting DNS signal for [${domainToResolve}]`, 'INFO');
    playSystemVoice("Initiating orbital DNS intercept.");

    try {
      const response = await fetch(`https://dns.google/resolve?name=${domainToResolve}&type=A`);
      const data = await response.json();
      
      setTimeout(() => {
        if (data.Answer && data.Answer.length > 0) {
          data.Answer.forEach((ans: any) => {
            if (ans.type === 1) { // A Record
              addDnsLog(`SUCCESS: Resolved IP -> ${ans.data}`, 'SUCCESS');
              addMissionLog(`DNS Intercept: ${domainToResolve} resolved to ${ans.data}`, 'INFO');
            }
          });
        } else {
          addDnsLog(`WARN: No A-records found for ${domainToResolve}`, 'WARN');
        }
        setIsResolving(false);
      }, 1500);
    } catch (err) {
      addDnsLog(`FAIL: Signal interference blocked resolution.`, 'FAIL');
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
           <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="relative z-10 flex items-center space-x-4">
           <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <SecurityIcon className="w-8 h-8 text-cyan-400" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Sentinel <span className="text-cyan-500">Intelligence</span></h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 pl-1">Quantum-Hardened Active Defense Node // v5.4</p>
           </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="bg-slate-900/60 hover:bg-slate-800 text-[10px] font-black text-slate-400 hover:text-white px-6 py-3 rounded-2xl border-2 border-slate-800 hover:border-slate-700 transition-all uppercase tracking-widest active:scale-95 shadow-xl">
            Retract to Mission_Comms
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2.5 bg-[#050810] p-2 rounded-[2rem] border-2 border-slate-900 shadow-inner">
        {[
          { id: 'overview', label: 'Tactical Monitor', icon: '📡' },
          { id: 'dns', label: 'DNS Signal Intercept', icon: '🌐' },
          { id: 'intel', label: 'YARA Intelligence', icon: '🔍' },
          { id: 'scripts', label: 'Cipher Repository', icon: '🔐' },
          { id: 'attack', label: 'RF Offensive Strike', icon: '⚡' },
          { id: 'quantum', label: 'Quantum Physics', icon: '⚛️' },
          { id: 'wargames', label: 'Global Simulation', icon: '🌎' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as SecurityTab)} 
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center space-x-2 border-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.3)] scale-105 z-10' 
                : 'text-slate-600 border-transparent hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <span className="text-sm opacity-60">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-6 duration-700">
             <div className="lg:col-span-8 glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/40 h-[600px] shadow-[0_24px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-20 flex space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/20"></div>)}
                </div>
                <canvas ref={sentinelCanvasRef} width="1200" height="800" className="w-full h-full bg-[#020617] rounded-3xl border border-slate-900 shadow-inner" />
                <div className="absolute bottom-6 left-8 z-20 bg-black/60 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md">
                   <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Real-time_Threat_Visualizer</p>
                </div>
             </div>
             <div className="lg:col-span-4 space-y-8">
                <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/60 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <Target className="w-32 h-32 text-cyan-500" />
                   </div>
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Threat Detection Engine_V4</h3>
                       <div className="space-y-4">
                          {[
                            { label: 'Uplink Port Scan', status: 'NEGATIVE', confidence: 99.8, color: 'emerald' },
                            { label: 'Sync Collision Det.', status: 'NEGATIVE', confidence: 97.4, color: 'emerald' },
                            { label: 'Protocol Side-Channel', status: 'NEGATIVE', confidence: 84.1, color: 'cyan' },
                            { label: 'OS Stack Fingerprint', status: 'INDETERMINATE', confidence: 32.5, color: 'amber' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-slate-900 group hover:border-cyan-500/30 transition-all shadow-inner">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.label}</span>
                                  <div className="flex items-center space-x-2 mt-1.5">
                                     <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'NEGATIVE' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                     <span className={`text-[9px] font-black tracking-widest ${item.status === 'NEGATIVE' ? 'text-emerald-500' : 'text-red-500'}`}>
                                       {item.status}
                                     </span>
                                  </div>
                               </div>
                               <div className="flex flex-col items-end shrink-0">
                                  <span className="text-[8px] text-slate-600 font-black uppercase mb-1">Conf. Score</span>
                                  <div className="flex items-center space-x-2">
                                     <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                        <div className={`h-full ${item.confidence > 90 ? 'bg-emerald-500' : item.confidence > 70 ? 'bg-cyan-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(34,211,238,0.4)]`} style={{ width: `${item.confidence}%` }}></div>
                                     </div>
                                     <span className="text-[9px] font-mono text-slate-500">{item.confidence}%</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                   <button 
                     onClick={() => {
                        playSystemVoice("Deep packet scan in progress.");
                        addMissionLog("Deep packet inspection triggered on SAT_" + selectedSatName, "INFO");
                     }} 
                     className="w-full mt-8 py-4 bg-cyan-600/10 border-2 border-cyan-500/20 text-cyan-400 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg active:scale-95"
                   >
                      Commence_Deep_Scan
                   </button>
                </div>
                
                <div className="p-6 bg-amber-500/5 rounded-[2rem] border-2 border-amber-500/10 flex items-center space-x-5">
                   <div className="p-3 bg-amber-500/10 rounded-xl">
                      <ShieldAlert className="w-6 h-6 text-amber-500" />
                   </div>
                   <div>
                      <p className="text-[10px] text-amber-500/80 font-black uppercase leading-tight italic">Warning: Level-4 Protocol Breach Detected in Perimeter Beta-9</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'dns' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
             <div className="lg:col-span-5 glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/60 flex flex-col space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500 animate-pulse opacity-20"></div>
                <div className="h-48 rounded-3xl overflow-hidden border-2 border-slate-900 bg-[#050810] mb-2 flex items-center justify-center p-8">
                    <Search className={`w-24 h-24 text-cyan-500/20 ${isResolving ? 'animate-pulse scale-110' : ''} transition-all`} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">DNS Signal_Intercept</h3>
                   <p className="text-[11px] text-cyan-500 font-bold uppercase tracking-[0.2em] mt-1">Satellite Transponder Resolution Alpha</p>
                </div>
                <div className="space-y-6">
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                         type="text" 
                         value={domainToResolve} 
                         onChange={e => setDomainToResolve(e.target.value)} 
                         className="w-full bg-[#050810] border-2 border-slate-800 rounded-2xl p-4 pl-12 text-sm text-white mono outline-none focus:border-cyan-500 shadow-inner transition-all" 
                         placeholder="Target_Domain..."
                      />
                   </div>
                   <button 
                     onClick={handleResolveDomain} 
                     disabled={isResolving} 
                     className="w-full bg-cyan-600 hover:bg-white hover:text-cyan-600 text-white text-[12px] font-black py-5 rounded-2xl uppercase tracking-[0.3em] shadow-[0_15px_35px_rgba(34,211,238,0.3)] transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group/btn"
                   >
                     <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                     <span className="relative z-10">{isResolving ? 'INTERCEPTING_SIGNAL...' : 'RESOLVE_SIGNAL_IDENTITY'}</span>
                   </button>
                </div>
             </div>
             <div className="lg:col-span-7 glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-[#0c0e14] flex flex-col h-full min-h-[500px] shadow-2xl font-mono relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg"></div>
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                   <div className="flex items-center space-x-3">
                      <Terminal className="w-4 h-4 text-cyan-500" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">DNS_RESOLUTION_TELEMETRY</span>
                   </div>
                   <div className="flex space-x-1">
                      {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-cyan-500/10 border border-slate-800"></div>)}
                   </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-hide relative z-10">
                  {dnsLogs.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                        <Activity className="w-16 h-16" />
                        <p className="text-[12px] font-black uppercase tracking-[0.6em]">Awaiting_Signal</p>
                     </div>
                  )}
                  {dnsLogs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[12px] mono flex items-start space-x-4 bg-slate-950/40 p-2 rounded-lg border border-slate-900/50"
                    >
                       <span className="text-slate-800 font-bold shrink-0">[{log.time}]</span>
                       <span className={log.type === 'ALERT' ? 'text-red-500 font-black' : log.type === 'SUCCESS' ? 'text-emerald-500' : log.type === 'FAIL' ? 'text-red-400' : 'text-slate-400'}>{log.msg}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-700 italic">
                   <span>ORBITAL_DNS_LINK: GOOGLE_DOH_V2</span>
                   <span className="animate-pulse">CONNECTED</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto scrollbar-hide pr-2">
               <div className="px-4 pb-2 mb-4 border-b border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Algorithm_Index</span>
               </div>
              {TACTICAL_SCRIPTS.map(script => (
                <button 
                  key={script.id}
                  onClick={() => setSelectedScript(script)}
                  className={`w-full text-left p-5 rounded-[1.5rem] border-2 transition-all relative overflow-hidden group ${selectedScript.id === script.id ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${selectedScript.id === script.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-600'}`}>{script.category}</span>
                    <span className="text-[9px] font-mono text-slate-700">{script.lang}</span>
                  </div>
                  <h4 className="text-[12px] font-black text-white uppercase group-hover:text-cyan-400 transition-colors">{script.name}</h4>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3 glass rounded-[2.5rem] border-2 border-slate-800 flex flex-col overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{selectedScript.name}</h3>
                 </div>
                 <button onClick={handleCopyCode} className="px-6 py-2.5 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 border-2 border-slate-800 hover:border-cyan-400 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all shadow-xl active:scale-95">
                   {copyStatus ? 'UPLINK_COPIED' : 'TRANSFER_CODE'}
                 </button>
               </div>
               <div className="flex-grow bg-[#0c0e14] p-8 overflow-auto custom-scrollbar relative">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <TerminalIcon className="w-64 h-64 text-white" />
                 </div>
                 <pre className="text-[14px] text-cyan-100/90 font-mono leading-loose relative z-10">{selectedScript.code}</pre>
               </div>
               <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex space-x-1">
                     {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>)}
                  </div>
                  <span className="text-[8px] font-mono text-slate-700">SHA_256_VERIFIED_FIRMWARE</span>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'attack' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
             <div className="lg:col-span-5 glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/60 flex flex-col space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-pulse opacity-20"></div>
                <div className="h-56 rounded-3xl overflow-hidden border-2 border-slate-900 bg-[#050810] mb-2 shadow-inner group-hover:border-red-500/20 transition-colors">
                    <canvas ref={strikeCanvasRef} width="600" height="300" className="w-full h-full" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">RF Offensive_Strike</h3>
                   <p className="text-[11px] text-red-500 font-bold uppercase tracking-[0.2em] mt-1">Remote Microwave Payload Injection</p>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                     <TerminalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                     <input 
                        type="text" 
                        value={targetIp} 
                        onChange={e => setTargetIp(e.target.value)} 
                        className="w-full bg-[#050810] border-2 border-slate-800 rounded-2xl p-4 pl-12 text-sm text-white mono outline-none focus:border-red-500 shadow-inner transition-all" 
                        placeholder="Target_IP_Endpoint..."
                     />
                  </div>
                  <button 
                    onClick={triggerAttack} 
                    disabled={isIpAttacking} 
                    className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white text-[12px] font-black py-5 rounded-2xl uppercase tracking-[0.3em] shadow-[0_15px_35px_rgba(239,68,68,0.3)] transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-red-500 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                    <span className="relative z-10">{isIpAttacking ? 'STRIKE_PHASE_ACTIVE...' : 'EXECUTE_PAYLOAD_TRANSFER'}</span>
                  </button>
                </div>
             </div>
             <div className="lg:col-span-7 glass p-10 rounded-[2.5rem] border-2 border-slate-800 bg-[#0c0e14] flex flex-col h-full min-h-[500px] shadow-2xl font-mono relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg"></div>
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                   <div className="flex items-center space-x-3">
                      <Terminal className="w-4 h-4 text-red-500" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">STIA_STRIKE_TELEMETRY</span>
                   </div>
                   <div className="flex space-x-1">
                      {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800"></div>)}
                   </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-hide relative z-10">
                  {ipAttackLog.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                        <Activity className="w-16 h-16" />
                        <p className="text-[12px] font-black uppercase tracking-[0.6em]">System_Idle</p>
                     </div>
                  )}
                  {ipAttackLog.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[12px] mono flex items-start space-x-4 bg-slate-950/40 p-2 rounded-lg border border-slate-900/50"
                    >
                       <span className="text-slate-800 font-bold shrink-0">[{log.time}]</span>
                       <span className={log.type === 'ALERT' ? 'text-red-500 font-black' : log.type === 'SUCCESS' ? 'text-emerald-500' : 'text-slate-400'}>{log.msg}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-700 italic">
                   <span>DATA_LINK_ENCRYPTED: CHACHA20-POLY1305</span>
                   <span className="animate-pulse">CONNECTED</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'intel' && <YaraIntelligence />}
        {activeTab === 'quantum' && <QuantumDefense isStealthMode={isStealthMode} addMissionLog={addMissionLog} />}
        {activeTab === 'wargames' && <WarGamesSimulator satName={selectedSatName} />}
      </div>
    </div>
  );
};
