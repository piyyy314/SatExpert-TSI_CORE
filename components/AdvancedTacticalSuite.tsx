
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  Waves, 
  Zap, 
  Target, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Globe, 
  ArrowRight,
  Crosshair,
  Lock,
  Unlock,
  Fingerprint,
  Download,
  Copy,
  Terminal as TerminalIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for ionospheric scintillation
const generateFluxData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    intensity: 40 + Math.random() * 40 + (i > 10 ? 20 : 0),
    variance: Math.random() * 10
  }));
};

interface RFFingerprint {
  id: string;
  hardware: string;
  jitter: string;
  phaseDrift: string;
  confidence: number;
}

const KNOWN_FINGERPRINTS: RFFingerprint[] = [
  { id: 'FP-882', hardware: 'iDirect Evolution X7', jitter: '1.2ns', phaseDrift: '0.04°/s', confidence: 99 },
  { id: 'FP-104', hardware: 'Comtech CDM-625', jitter: '0.8ns', phaseDrift: '0.01°/s', confidence: 97 },
  { id: 'FP-422', hardware: 'Gilat SkyEdge II', jitter: '2.4ns', phaseDrift: '0.12°/s', confidence: 84 },
  { id: 'FP-UNKNOWN', hardware: 'Non-Standard FPGA', jitter: '5.6ns', phaseDrift: '0.45°/s', confidence: 32 }
];

export const AdvancedTacticalSuite: React.FC = () => {
  const [fluxData, setFluxData] = useState(generateFluxData());
  const [selectedFingerprint, setSelectedFingerprint] = useState<RFFingerprint | null>(null);
  const [isTriangulating, setIsTriangulating] = useState(false);
  const [triangulationProgress, setTriangulationProgress] = useState(0);
  const [triangulatedPos, setTriangulatedPos] = useState<{ x: number, y: number } | null>(null);
  
  // DVB-S2 Crafter State
  const [dvbPayload, setDvbPayload] = useState('STIA_COMMAND_SECURE_UPLINK');
  const [craftedFrame, setCraftedFrame] = useState('');

  // Aether Decoy State
  const [decoyTargetFreq, setDecoyTargetFreq] = useState(14.25);
  const [numGhosts, setNumGhosts] = useState(5);
  const [activeDecoys, setActiveDecoys] = useState<{ freq: number, power: number, phase: number }[]>([]);

  // YARA Threat Scanner State
  const [yaraLogs, setYaraLogs] = useState<string[]>([]);
  const [isYaraScanning, setIsYaraScanning] = useState(false);
  const [yaraMatch, setYaraMatch] = useState<{ signature: string, offset: string } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFluxData(prev => {
        const newData = [...prev.slice(1), { 
          time: prev[prev.length - 1].time + 1, 
          intensity: 40 + Math.random() * 40 + (Math.sin(Date.now()/5000) * 20),
          variance: Math.random() * 10
        }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const runTriangulation = () => {
    if (isTriangulating) return;
    setIsTriangulating(true);
    setTriangulationProgress(0);
    setTriangulatedPos(null);

    const step = 2;
    const interval = setInterval(() => {
      setTriangulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTriangulating(false);
          setTriangulatedPos({ 
            x: 30 + Math.random() * 40, 
            y: 30 + Math.random() * 40 
          });
          return 100;
        }
        return prev + step;
      });
    }, 50);
  };

  const craftDVBS2Frame = () => {
    const MATYPE = "f0";
    const UPL = "0000";
    const encoder = new TextEncoder();
    const bytes = encoder.encode(dvbPayload);
    const dflHex = bytes.length.toString(16).padStart(4, '0');
    const payloadHex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const frame = `${MATYPE}${UPL}${dflHex}${payloadHex}`;
    setCraftedFrame(frame);
  };

  const exportFrameData = () => {
    if (!craftedFrame) return;
    const report = `
STIA DVB-S2 PROTOCOL EXFILTRATION REPORT
----------------------------------------
TIMESTAMP: ${new Date().toISOString()}
PAYLOAD_RAW: ${dvbPayload}
HEX_FRAME: ${craftedFrame}

HEADER_DECOMPOSITION:
- MATYPE: f0 (Generic Stream, High Efficiency)
- UPL: 0000 (User Private Link)
- DFL: ${craftedFrame.slice(8, 12)} (Data Field Length)

STIA_CMD: END_FRAME_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_DVB_S2_Frame_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deployAetherDecoy = () => {
    const decoys = [];
    for (let i = 0; i < numGhosts; i++) {
      const offset = (Math.random() * 100) - 50; // -50.0 to 50.0 MHz
      const ghostFreq = decoyTargetFreq + (offset / 1000.0);
      decoys.push({
        freq: ghostFreq,
        power: Math.floor(Math.random() * (-30 - (-45) + 1)) + (-45), // -45 to -30
        phase: Math.floor(Math.random() * 360)
      });
    }
    setActiveDecoys(decoys);
  };

  const exportDecoyReport = () => {
    if (activeDecoys.length === 0) return;
    const report = `
STIA AETHER DECOY DEPLOYMENT REPORT
-----------------------------------
TIMESTAMP: ${new Date().toISOString()}
TARGET_FREQ_CENTROID: ${decoyTargetFreq} GHz
GHOST_COUNT: ${activeDecoys.length}

DECOY_ARRAY_DETAILS:
${activeDecoys.map((d, i) => `[DECOY_${i}] Freq: ${d.freq.toFixed(4)} GHz | Power: ${d.power} dBm | Phase: ${d.phase}°`).join('\n')}

STIA_CMD: SUB-SPACE_MASK_ACTIVE
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_Aether_Decoys_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runYaraScan = async () => {
    setIsYaraScanning(true);
    setYaraLogs([]);
    setYaraMatch(null);

    const steps = [
      "STIA_YARA_INIT: Loading signature database...",
      "Mapping virtual memory segments...",
      "Applying: VSAT_Firmware_Backdoor signature matrix...",
      "Applying: VSAT_Firmware_Backdoor signature matrix...",
      "Applying: VSAT_Firmware_Backdoor signature matrix...",
      "ALERT: Match detected for VSAT_Firmware_Backdoor",
      "OFFSET: 0x1DAFE3"
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      setYaraLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${steps[i]}`]);
    }

    setYaraMatch({
      signature: "VSAT_Firmware_Backdoor",
      offset: "0x1DAFE3"
    });
    setIsYaraScanning(false);
  };

  const exportYaraLog = () => {
    if (yaraLogs.length === 0) return;
    const report = `
STIA YARA THREAT INTELLIGENCE LOG
---------------------------------
TIMESTAMP: ${new Date().toISOString()}
TARGET: VSAT_VIRTUAL_MEMORY_SEGMENT

SCAN_LOG_HISTORY:
${yaraLogs.join('\n')}

ANALYSIS_RESULT:
MATCH_TYPE: CRITICAL_BACKDOOR
SIGNATURE_ID: VSAT_Firmware_Backdoor
LINEAR_OFFSET: 0x1DAFE3

STIA_CMD: QUARANTINE_REQUESTED
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_YARA_Threat_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    craftDVBS2Frame();
  }, [dvbPayload]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath(); ctx.moveTo(i * 40, 0); ctx.lineTo(i * 40, 400); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 40); ctx.lineTo(400, i * 40); ctx.stroke();
      }

      // Radar Concentric Circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Sweep
      const sweepAngle = (frame * 0.02) % (Math.PI * 2);
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 180);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 180, sweepAngle, sweepAngle + 0.5);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Detection Lines if Triangulating
      if (isTriangulating) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        const pulse = (Math.sin(frame * 0.1) + 1) / 2;
        
        // Emulating 3 stations
        const stations = [{x: 50, y: 50}, {x: 350, y: 50}, {x: 200, y: 350}];
        stations.forEach((s, idx) => {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          // Animate line reaching for center area
          const targetX = 200 + (Math.random() - 0.5) * 20;
          const targetY = 200 + (Math.random() - 0.5) * 20;
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          
          ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI*2); ctx.fill();
        });
      }

      // Final Triangulated Point
      if (triangulatedPos && !isTriangulating) {
        const tx = (triangulatedPos.x / 100) * canvas.width;
        const ty = (triangulatedPos.y / 100) * canvas.height;
        
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(tx, ty, 15 + Math.sin(frame * 0.1) * 5, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
        
        ctx.font = '10px monospace';
        ctx.fillText("TARGET_LOCKED", tx + 10, ty - 10);
      }

      requestAnimationFrame(draw);
    };
    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isTriangulating, triangulatedPos]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Advanced Tactical <span className="text-cyan-500">Suite</span></h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">STIA_ELINT_TOOLS // Level 4 Clearance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
             <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">System_Entropy</span>
             <span className="text-[10px] text-emerald-500 font-black tracking-widest font-mono">STABLE // 0.042</span>
          </div>
           <div className="w-px h-8 bg-slate-800 mx-2"></div>
           <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
             <Activity className="w-4 h-4 text-slate-500" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Row 1: TDOA Localizer & Scintillation */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 z-10 relative">
                 <div className="flex items-center space-x-3">
                    <Radar className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TDOA Passive Triangulation</h3>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                       <span className="text-[8px] text-slate-600 font-black uppercase">Stations_Active</span>
                       <span className="text-[10px] text-white font-black mono text-cyan-500">03 / 03</span>
                    </div>
                    <button 
                      onClick={runTriangulation}
                      disabled={isTriangulating}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                        isTriangulating 
                        ? 'bg-slate-800 text-slate-600' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-600/20'
                      }`}
                    >
                      {isTriangulating ? `Triangulating ${triangulationProgress}%` : 'Begin Fix'}
                    </button>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                 <div className="relative w-full max-w-[400px] aspect-square bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex-shrink-0">
                    <canvas ref={canvasRef} width="400" height="400" className="w-full h-full" />
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-950/20 rounded-3xl shadow-inner"></div>
                    <div className="absolute top-4 left-4 flex space-x-2">
                       <span className="px-2 py-0.5 bg-slate-900/80 rounded border border-slate-700 text-[8px] font-mono text-slate-500 uppercase">SEC: 14.42 GHz</span>
                       <span className="px-2 py-0.5 bg-slate-900/80 rounded border border-slate-700 text-[8px] font-mono text-slate-500 uppercase">BW: 250 kHz</span>
                    </div>
                 </div>

                 <div className="flex-grow space-y-6 w-full">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Signal Nodes Intelligence</h4>
                       <div className="space-y-2">
                          {[
                            { id: 'ALPHA', delay: '14.2ms', strength: -62, status: 'LOCKED' },
                            { id: 'BRAVO', delay: '22.8ms', strength: -68, status: 'LOCKED' },
                            { id: 'CHARLIE', delay: '18.4ms', strength: -64, status: 'PENDING' },
                          ].map(node => (
                            <div key={node.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                               <div className="flex items-center space-x-3">
                                  <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'LOCKED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                  <span className="text-[10px] font-black text-white px-2">NODE_{node.id}</span>
                               </div>
                               <div className="flex space-x-4 items-center">
                                  <div className="flex flex-col items-end">
                                     <span className="text-[7px] text-slate-600 uppercase font-black">Delay</span>
                                     <span className="text-[9px] font-mono text-slate-400">{node.delay}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                     <span className="text-[7px] text-slate-600 uppercase font-black">RSSI</span>
                                     <span className="text-[9px] font-mono text-slate-400">{node.strength} dBm</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    {triangulatedPos && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start space-x-3"
                      >
                         <Target className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                         <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Fix Acquired</p>
                            <p className="text-[11px] text-slate-300 font-bold leading-tight">Adversary terminal localized at 42.42°N, 14.12°E. Accuracy delta: ±140m.</p>
                         </div>
                      </motion.div>
                    )}
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Waves className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ionospheric Scintillation Intensity</h3>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-cyan-500/30"></div>
                       <span className="text-[8px] text-slate-600 font-black uppercase">Normal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                       <span className="text-[8px] text-slate-600 font-black uppercase">Measured</span>
                    </div>
                 </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fluxData}>
                    <defs>
                      <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      hide={true}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={8} 
                      tickFormatter={(val) => `${val}sf`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4', fontSize: '10px', textTransform: 'uppercase', fontStyle: 'bold' }}
                      labelStyle={{ color: '#475569', fontSize: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorFlux)" 
                      strokeWidth={2}
                      animationDuration={300}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                       <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">S4 Index</span>
                       <span className="text-[12px] text-white font-black mono text-cyan-400">0.24 (NOM)</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                       <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">TEC Units</span>
                       <span className="text-[12px] text-white font-black mono text-cyan-400">14.2 TECU</span>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 italic max-w-xs text-right">
                   Current ionospheric conditions indicate nominal scintillation. Ka-band links are maintaining 99.8% lock stability.
                 </p>
              </div>
           </div>
        </div>

        {/* Column 2: Threat Analysis & Intelligence */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">YARA Threat Analysis (VSAT)</h3>
                 </div>
                 <div className="flex items-center space-x-2">
                    {yaraLogs.length > 0 && (
                       <button 
                         onClick={exportYaraLog}
                         className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                         title="Export Threat Log"
                       >
                         <Download className="w-3.5 h-3.5" />
                       </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${isYaraScanning ? 'bg-rose-500 animate-pulse' : yaraMatch ? 'bg-rose-600' : 'bg-slate-700'}`}></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 h-[200px] flex flex-col font-mono">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Analysis_Terminal</span>
                       <span className="text-[8px] font-black text-rose-500 tracking-tighter">SECURE_VT_STREAM</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide text-[9px]">
                       {yaraLogs.length === 0 && !isYaraScanning && (
                          <p className="text-slate-700 italic">SYSTEM_IDLE: Awaiting signature scan mission...</p>
                       )}
                       {yaraLogs.map((log, i) => (
                          <p key={i} className={`${(log || '').includes('ALERT') || (log || '').includes('OFFSET') ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                             {log}
                          </p>
                       ))}
                       {isYaraScanning && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="text-cyan-500"
                          >
                             &gt; SCANNING_SEGMENTS...
                          </motion.div>
                       )}
                    </div>
                 </div>

                 {yaraMatch ? (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3"
                   >
                      <div className="flex items-center space-x-2 text-rose-500">
                         <ShieldAlert className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-black uppercase tracking-tighter italic">Threat Detected</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-white">{yaraMatch.signature}</p>
                         <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Linear Offset</span>
                            <span className="text-[10px] font-mono text-rose-400 font-bold">{yaraMatch.offset}</span>
                         </div>
                      </div>
                      <button className="w-full py-1.5 bg-rose-600/20 border border-rose-500/30 rounded-lg text-[8px] font-black text-rose-500 uppercase hover:bg-rose-600/30 transition-colors">
                         Isolate Memory Block
                      </button>
                   </motion.div>
                 ) : (
                   <button 
                     onClick={runYaraScan}
                     disabled={isYaraScanning}
                     className={`w-full py-3 ${isYaraScanning ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white'} border border-rose-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-900/20`}
                   >
                      {isYaraScanning ? 'Heuristic Analysis in Progress...' : 'Execute YARA Signature Scan'}
                   </button>
                 )}
              </div>
           </div>
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Fingerprint className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RF Hardware Fingerprinting</h3>
                 </div>
              </div>
              <div className="space-y-3">
                 {KNOWN_FINGERPRINTS.map(fp => (
                   <button 
                     key={fp.id}
                     onClick={() => setSelectedFingerprint(fp)}
                     className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedFingerprint?.id === fp.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-black text-white uppercase">{fp.id}</span>
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                           fp.confidence > 90 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                         }`}>CONF: {fp.confidence}%</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-400 block mb-1">{fp.hardware}</span>
                      <div className="flex space-x-4">
                         <div className="flex flex-col">
                            <span className="text-[7px] text-slate-600 uppercase font-black">Jitter</span>
                            <span className="text-[9px] font-mono text-slate-500">{fp.jitter}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[7px] text-slate-600 uppercase font-black">Drift</span>
                            <span className="text-[9px] font-mono text-slate-500">{fp.phaseDrift}</span>
                         </div>
                      </div>
                   </button>
                 ))}
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Box className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Aether Decoy</h3>
                 </div>
                 <div className="flex items-center space-x-2">
                    {activeDecoys.length > 0 && (
                       <button 
                         onClick={exportDecoyReport}
                         className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                       >
                         <Download className="w-3.5 h-3.5" />
                       </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${activeDecoys.length > 0 ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[8px] font-black text-slate-600 uppercase block mb-1 ml-1">Centroid Freq (GHz)</label>
                       <input 
                         type="number" 
                         step="0.01"
                         value={decoyTargetFreq}
                         onChange={(e) => setDecoyTargetFreq(parseFloat(e.target.value))}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-cyan-400"
                       />
                    </div>
                    <div>
                       <label className="text-[8px] font-black text-slate-600 uppercase block mb-1 ml-1">Ghost Limit</label>
                       <input 
                         type="number" 
                         min="1"
                         max="20"
                         value={numGhosts}
                         onChange={(e) => setNumGhosts(parseInt(e.target.value))}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-white"
                       />
                    </div>
                 </div>

                 {activeDecoys.length > 0 ? (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hide">
                       {activeDecoys.map((d, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800/50">
                             <span className="text-[9px] font-black text-slate-400">GHOST_{i}</span>
                             <div className="flex space-x-3 text-[8px] font-mono">
                                <span className="text-cyan-500">{d.freq.toFixed(4)} G</span>
                                <span className="text-emerald-500">{d.power} dBm</span>
                                <span className="text-amber-500">{d.phase}°</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {[
                         { label: 'Carrier Masking Intensity', value: 85, icon: <Waves className="w-3 h-3" /> },
                         { label: 'Phase Randomization Arc', value: 94, icon: <Activity className="w-3 h-3" /> },
                         { label: 'Spectrum Entropy Saturation', value: 72, icon: <Zap className="w-3 h-3" /> },
                       ].map((item, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-2">
                                  <span className="text-slate-600">{item.icon}</span>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                               </div>
                               <span className="text-[10px] font-black text-white mono">{item.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                               <motion.div 
                                 className="h-full bg-cyan-700"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${item.value}%` }}
                                 transition={{ duration: 1, delay: i * 0.2 }}
                               />
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
                 <button 
                   onClick={deployAetherDecoy}
                   className="w-full py-3 bg-cyan-600 border border-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 transition-all active:scale-95 shadow-lg shadow-cyan-600/20"
                 >
                    Deploy Aether_Decoys
                 </button>
                 <p className="text-[9px] text-slate-500 text-center font-bold tracking-tight"> Generates {numGhosts} subspace ghost carriers centered at {decoyTargetFreq} GHz to mask true uplink signature.</p>
              </div>
           </div>

           <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start space-x-3 mt-auto mb-6">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                 <span className="text-amber-500">PROXIMITY WARNING:</span> Side-channel leak detected in Power Supply harmonic (120Hz). Recommend enabling quantum grounding to prevent remote power analysis.
              </p>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <TerminalIcon className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DVB-S2 Frame Crafter</h3>
                 </div>
                 <button 
                   onClick={exportFrameData}
                   className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                   title="Export Frame"
                 >
                   <Download className="w-3.5 h-3.5" />
                 </button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[8px] font-black text-slate-600 uppercase block mb-1.5 ml-1">Payload Directive</label>
                    <input 
                      type="text"
                      value={dvbPayload}
                      onChange={(e) => setDvbPayload(e.target.value)}
                      placeholder="Enter command payload..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold"
                    />
                 </div>
                 <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2 group relative">
                    <div className="flex justify-between items-center">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Generated_X-Frame</span>
                       <button 
                         onClick={() => navigator.clipboard.writeText(craftedFrame)}
                         className="text-[8px] font-black text-slate-500 hover:text-cyan-500 flex items-center space-x-1"
                       >
                          <Copy className="w-2.5 h-2.5" />
                          <span>COPY_HEX</span>
                       </button>
                    </div>
                    <p className="text-[10px] font-mono text-cyan-500 break-all leading-relaxed pointer-events-none select-none">
                       {craftedFrame}
                    </p>
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                       <span className="text-[7px] text-slate-600 uppercase font-black">MATYPE</span>
                       <span className="text-[9px] font-mono text-cyan-400">f0</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                       <span className="text-[7px] text-slate-600 uppercase font-black">UPL</span>
                       <span className="text-[9px] font-mono text-cyan-400">0000</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                       <span className="text-[7px] text-slate-600 uppercase font-black">DFL</span>
                       <span className="text-[9px] font-mono text-cyan-400">{(craftedFrame.length - 12) / 2} B</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Simple helper component because Box isn't auto-imported
const Box = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
