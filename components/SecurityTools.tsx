
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { playSystemVoice } from '../services/audioService.ts';
import { QuantumDefense } from './QuantumDefense.tsx';
import { WarGamesSimulator } from './WarGamesSimulator.tsx';
import { SecurityTab } from '../types.ts';
import { YaraIntelligence } from './YaraIntelligence.tsx';

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
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 20) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();

        if (frame % 15 === 0) {
          packets.push({
            x: 0, y: Math.random() * canvas.height,
            speed: 2 + Math.random() * 4,
            type: Math.random() > 0.9 ? 'malicious' : 'nominal',
            size: 2 + Math.random() * 5
          });
        }

        packets.forEach((p, i) => {
          p.x += p.speed;
          ctx.fillStyle = p.type === 'malicious' ? '#ef4444' : '#22d3ee';
          ctx.fillRect(p.x, p.y, p.size, p.size);
          if (p.x > canvas.width) packets.splice(i, 1);
        });

        requestAnimationFrame(animate);
      };
      const h = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(h);
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
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isIpAttacking && frame % 10 === 0) {
                bursts.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    r: 0,
                    alpha: 1,
                    v: 4 + Math.random() * 4
                });
            }

            bursts.forEach((b, i) => {
                b.r += b.v;
                b.alpha -= 0.02;
                ctx.strokeStyle = `rgba(239, 68, 68, ${b.alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
                if (b.alpha <= 0) bursts.splice(i, 1);
            });

            ctx.fillStyle = isIpAttacking ? '#ef4444' : '#1e293b';
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 10, 0, Math.PI*2);
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
    addIpLog(`Initiating scan on ${targetIp}...`, 'INFO');
    setTimeout(() => addIpLog(`Enumerating Sat-Gateways...`, 'INFO'), 1000);
    setTimeout(() => addIpLog(`FOUND: Open Port 8080 (Admin WebUI)`, 'ALERT'), 2500);
    setTimeout(() => {
        addIpLog(`BUFFER_OVERFLOW: Remote service crashed.`, 'SUCCESS');
        setIsIpAttacking(false);
        addMissionLog(`CRITICAL: Offensive strike against ${targetIp} completed.`, 'active');
    }, 4500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
             <span className="mr-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">🛡️</span> 
             Sentinel <span className="text-cyan-500 ml-2">Intelligence</span>
           </h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Active Defense Node // Protocol v5.1.0</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-300 px-5 py-2.5 rounded-xl border border-slate-700 transition-all uppercase tracking-widest active:scale-95">
            Mission Dashboard
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50">
        {[
          { id: 'overview', label: 'Monitor' },
          { id: 'intel', label: 'YARA Intel' },
          { id: 'scripts', label: 'Cipher Library' },
          { id: 'attack', label: 'Strike' },
          { id: 'quantum', label: 'Physics' },
          { id: 'wargames', label: 'Simulate' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as SecurityTab)} 
            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
              activeTab === tab.id 
                ? 'bg-cyan-500 text-slate-950 shadow-lg' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
             <div className="lg:col-span-2 glass p-6 rounded-3xl border-slate-800 h-[500px]">
                <canvas ref={sentinelCanvasRef} width="800" height="400" className="w-full h-full bg-slate-950 rounded-2xl border border-slate-900" />
             </div>
             <div className="lg:col-span-1 space-y-6">
                <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Threat Detection Engine</h3>
                       <div className="space-y-3">
                          {[
                            { label: 'Port Scan', status: 'NEGATIVE', confidence: 99 },
                            { label: 'Sync Collision', status: 'NEGATIVE', confidence: 97 },
                            { label: 'Side-Channel Leak', status: 'NEGATIVE', confidence: 84 },
                            { label: 'OS Fingerprint', status: 'INDETERMINATE', confidence: 32 }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 group hover:border-cyan-500/30 transition-all">
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-white uppercase">{item.label}</span>
                                  <div className="flex items-center space-x-2 mt-1">
                                     <div className={`w-1 h-1 rounded-full ${item.status === 'NEGATIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     <span className={`text-[8px] font-black tracking-widest ${item.status === 'NEGATIVE' ? 'text-green-500' : 'text-red-500'}`}>
                                       {item.status}
                                     </span>
                                  </div>
                               </div>
                               <div className="flex flex-col items-end shrink-0">
                                  <span className="text-[7px] text-slate-600 font-black uppercase mb-1">Confidence</span>
                                  <div className="flex items-center space-x-1">
                                     <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.confidence > 90 ? 'bg-emerald-500' : item.confidence > 70 ? 'bg-cyan-500' : 'bg-amber-500'}`} style={{ width: `${item.confidence}%` }}></div>
                                     </div>
                                     <span className="text-[8px] font-mono text-slate-400">{item.confidence}%</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                   <button onClick={() => playSystemVoice("Deep packet scan in progress.")} className="w-full mt-6 py-3 bg-cyan-600/10 border border-cyan-600/30 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-600/20 transition-all">
                      Run Deep Scan
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2">
            <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
              {TACTICAL_SCRIPTS.map(script => (
                <button 
                  key={script.id}
                  onClick={() => setSelectedScript(script)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedScript.id === script.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">{script.category}</span>
                    <span className="text-[8px] font-mono text-slate-600">{script.lang}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white uppercase">{script.name}</h4>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3 glass rounded-2xl border-slate-800 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{selectedScript.name}</h3>
                 <button onClick={handleCopyCode} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] font-black text-cyan-400 uppercase tracking-widest transition-all">
                   {copyStatus ? 'COPIED' : 'COPY_CIPHER'}
                 </button>
               </div>
               <div className="flex-grow bg-slate-950 p-6 overflow-auto">
                 <pre className="text-[13px] text-cyan-100/80 font-mono leading-relaxed">{selectedScript.code}</pre>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'attack' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
             <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 flex flex-col space-y-6">
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 mb-4">
                    <canvas ref={strikeCanvasRef} width="400" height="200" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Offensive Strike Terminal</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Execute targeted RF frame injections</p>
                </div>
                <div className="space-y-4">
                  <input type="text" value={targetIp} onChange={e => setTargetIp(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white mono outline-none focus:border-red-500" />
                  <button onClick={triggerAttack} disabled={isIpAttacking} className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                    {isIpAttacking ? 'STRIKE_IN_PROGRESS...' : 'COMMENCE_RF_STRIKE'}
                  </button>
                </div>
             </div>
             <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/60 flex flex-col h-full min-h-[400px]">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Offensive Output Log</h3>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {ipAttackLog.map((log, i) => (
                    <div key={i} className="text-[11px] mono flex items-start space-x-2">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className={log.type === 'ALERT' ? 'text-red-500 font-bold' : log.type === 'SUCCESS' ? 'text-green-500' : 'text-slate-400'}>{log.msg}</span>
                    </div>
                  ))}
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
