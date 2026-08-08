import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, Compass, Cpu, Target, Eye, Sliders, Play, RotateCcw, Shield, Activity, RefreshCw } from 'lucide-react';

interface SARImagingSuiteProps {
  addMissionLog?: (detail: string, status?: any) => void;
}

export const SARImagingSuite: React.FC<SARImagingSuiteProps> = ({ addMissionLog }) => {
  const [sector, setSector] = useState<'silo' | 'fleet' | 'hangar'>('silo');
  const [prf, setPrf] = useState<number>(1800); // Pulse Repetition Frequency
  const [squintAngle, setSquintAngle] = useState<number>(12); // Degrees
  const [algorithm, setAlgorithm] = useState<'rangedoppler' | 'chirpscaling' | 'backprojection'>('rangedoppler');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [processStage, setProcessStage] = useState<string>('IDLE');
  const [identifiedTargets, setIdentifiedTargets] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sectors = {
    silo: {
      name: 'Sector Alpha-7 (Siberian Silos)',
      coords: '56.1284° N, 93.1842° E',
      description: 'Hardened underground intermediate ballistic missile silos with sliding hatch covers.',
      nativeScatter: [
        { type: 'Launch Hatch A-1', text: 'REINFORCED SILO TOP', size: 18, x: 200, y: 150, confidence: 97.4, status: 'LOCKED' },
        { type: 'Support Bunker', text: 'REINFORCED CONCRETE', size: 25, x: 120, y: 220, confidence: 89.2, status: 'PASSIVE' },
        { type: 'Radar Dome Mast', text: 'EARLY WARNING ANTENNA', size: 14, x: 380, y: 180, confidence: 94.8, status: 'EMITTING_X_BAND' },
        { type: 'Aux Supply Vehicle', text: 'SUPPORT TRANSPORT', size: 12, x: 260, y: 280, confidence: 73.5, status: 'MOBILE' }
      ]
    },
    fleet: {
      name: 'Sector Gamma-3 (Hormuz Maritime Terminal)',
      coords: '27.1895° N, 56.4012° E',
      description: 'Naval replenishment and fast-attack missile vessels arrayed at concrete finger piers.',
      nativeScatter: [
        { type: 'Guided Missile Corvette', text: 'CORVETTE CLASS hull', size: 30, x: 150, y: 240, confidence: 96.1, status: 'IDLING_REACTOR' },
        { type: 'Fast Patrol Cutter', text: 'FAST EXCLUSION CRAFT', size: 15, x: 140, y: 110, confidence: 84.4, status: 'STATIONARY' },
        { type: 'Finger Pier Bravo', text: 'CONCRETE OFFSHORE PIER', size: 40, x: 260, y: 180, confidence: 99.1, status: 'STRUCTURAL' },
        { type: 'Anti-Ship Battery', text: 'TEL SHORE DEFENSE', size: 10, x: 340, y: 290, confidence: 92.3, status: 'DEPLOYED' }
      ]
    },
    hangar: {
      name: 'Sector Omega-9 (Groom Dry Lake West)',
      coords: '37.2351° N, -115.8111° W',
      description: 'Next-generation stealth airframe fabrication and telemetry verification hangars.',
      nativeScatter: [
        { type: 'Strategic Hangar H-4', text: 'REINFORCED STEALTH VAULT', size: 35, x: 280, y: 140, confidence: 95.7, status: 'SHIELDED' },
        { type: 'Experimental Delta Airframe', text: 'AV-X9 HIGH ASPECT WING', size: 22, x: 180, y: 260, confidence: 91.5, status: 'THERMAL_SPIKE' },
        { type: 'Cryo Logistics Tank', text: 'SUPERCOOLED FUEL VESS', size: 16, x: 360, y: 250, confidence: 88.9, status: 'STABLE' },
        { type: 'HF Array Field', text: 'TELEMETRY RECEPTOR', size: 20, x: 110, y: 155, confidence: 93.6, status: 'RECEIVING_K_BAND' }
      ]
    }
  };

  const startReconScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setIdentifiedTargets([]);
    setProcessStage('ACQUIRING_RAW_PHASE');

    if (addMissionLog) {
      addMissionLog(`SAR_INIT: Orbital SAR beam sweeping target ${sectors[sector].name}. Freq: X-Band, PRF: ${prf}Hz, Squint: ${squintAngle}°`, 'active');
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + (Math.random() * 4 + 2);
        if (next >= 100) {
          clearInterval(interval);
          handleExtractionComplete();
          return 100;
        }

        // Set stages based on progress
        if (next < 25) {
          setProcessStage('ACQUIRING_RAW_PHASE');
        } else if (next < 50) {
          setProcessStage('AZIMUTH_MATCHED_FILTER');
        } else if (next < 75) {
          setProcessStage('INVERSE_FFT_RANGE_MIGRATION');
        } else {
          setProcessStage('EXTRACTING_TARGET_CONTURES');
        }

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isScanning, sector]);

  const handleExtractionComplete = () => {
    setIsScanning(false);
    setProcessStage('IMAGE_STABILIZED');
    setIdentifiedTargets(sectors[sector].nativeScatter);

    if (addMissionLog) {
      addMissionLog(`SAR_IMAGE: Target reconstruction verified with high confidence in ${sectors[sector].name}. Using algorithm: ${algorithm.toUpperCase()}`, 'info');
    }
  };

  // Canvas Live Render for Phase-History Simulation and Reconstructed Radar Echo Target Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let pulseWave = 0;

    const draw = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() / 1000;

      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }

      // Draw Range & Azimuth Reference Rings
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath(); ctx.arc(centerX, centerY, 100, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, centerY, 180, 0, Math.PI * 2); ctx.stroke();

      // Sweeping Beam line
      if (isScanning) {
        const sweepAngle = (time * 1.5) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(sweepAngle) * 240, centerY + Math.sin(sweepAngle) * 240);
        ctx.stroke();

        // Draw dynamic sweep glowing arc
        const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 245);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.02)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.12)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 240, sweepAngle - 0.4, sweepAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Phase Noise Flutter (Simulating Raw Radar echoes prior to reconstruction)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
        for (let i = 0; i < 45; i++) {
          const r = Math.random() * 200;
          const theta = Math.random() * Math.PI * 2;
          const size = Math.random() * 2.5;
          ctx.fillRect(centerX + Math.cos(theta) * r, centerY + Math.sin(theta) * r, size, size);
        }
      }

      // Render Reconstructed High-fidelity Radar Returns (after scanning ends or dynamically emerging)
      if (scanProgress > 20) {
        const opacityRatio = scanProgress / 100;
        const targetList = sectors[sector].nativeScatter;

        targetList.forEach((tgt) => {
          // Add fluctuating micro-Doppler clutter to targets to make it feel extremely realistic
          const jitterX = (Math.random() - 0.5) * 1.8;
          const jitterY = (Math.random() - 0.5) * 1.8;
          const targetX = tgt.x + jitterX;
          const targetY = tgt.y + jitterY;

          // Target Base Echo glow ring
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * opacityRatio})`;
          ctx.fillStyle = `rgba(16, 185, 129, ${0.05 * opacityRatio})`;
          ctx.beginPath();
          ctx.arc(targetX, targetY, tgt.size + Math.sin(time * 3) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Target reticle
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.8 * opacityRatio})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
          ctx.stroke();

          // Outer bracket marks
          ctx.beginPath();
          ctx.moveTo(targetX - tgt.size / 2, targetY - tgt.size / 2 + 5);
          ctx.lineTo(targetX - tgt.size / 2, targetY - tgt.size / 2);
          ctx.lineTo(targetX - tgt.size / 2 + 5, targetY - tgt.size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX + tgt.size / 2, targetY - tgt.size / 2 + 5);
          ctx.lineTo(targetX + tgt.size / 2, targetY - tgt.size / 2);
          ctx.lineTo(targetX + tgt.size / 2 - 5, targetY - tgt.size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX - tgt.size / 2, targetY + tgt.size / 2 - 5);
          ctx.lineTo(targetX - tgt.size / 2, targetY + tgt.size / 2);
          ctx.lineTo(targetX - tgt.size / 2 + 5, targetY + tgt.size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX + tgt.size / 2, targetY + tgt.size / 2 - 5);
          ctx.lineTo(targetX + tgt.size / 2, targetY + tgt.size / 2);
          ctx.lineTo(targetX + tgt.size / 2 - 5, targetY + tgt.size / 2);
          ctx.stroke();

          // Radar flight echo trail lines (Vector wireframe representation)
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * opacityRatio})`;
          ctx.beginPath();
          ctx.moveTo(targetX - tgt.size, targetY);
          ctx.lineTo(targetX + tgt.size, targetY);
          ctx.moveTo(targetX, targetY - tgt.size);
          ctx.lineTo(targetX, targetY + tgt.size);
          ctx.stroke();

          // Target tag
          if (scanProgress > 60) {
            ctx.fillStyle = `rgba(16, 215, 129, ${0.9 * opacityRatio})`;
            ctx.font = 'bold 8px monospace font-mono';
            ctx.fillText(tgt.type.toUpperCase(), targetX + tgt.size / 2 + 4, targetY - 4);
            ctx.fillStyle = `rgba(16, 185, 129, ${0.5 * opacityRatio})`;
            ctx.font = '7px monospace font-mono';
            ctx.fillText(`${tgt.confidence}% ACC | ${tgt.status}`, targetX + tgt.size / 2 + 4, targetY + 6);
          }
        });
      }

      // Calibration sweep bar
      pulseWave = (pulseWave + 1.2) % canvas.height;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, pulseWave);
      ctx.lineTo(canvas.width, pulseWave);
      ctx.stroke();

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [isScanning, scanProgress, sector]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Configuration column (Left) */}
      <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.255em]">SAR_Radar_Telemetry</h3>
          </div>

          {/* Sector selection */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Reconnaissance Sector</label>
            <div className="grid grid-cols-3 gap-2">
              {(['silo', 'fleet', 'hangar'] as const).map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    setSector(sec);
                    setScanProgress(0);
                    setIdentifiedTargets([]);
                    setProcessStage('IDLE');
                  }}
                  disabled={isScanning}
                  className={`py-2 px-1 text-[8px] font-mono font-black uppercase rounded-lg border transition-all ${
                    sector === sec
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 font-black'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Sector Details Brief */}
            <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-990/10 text-emerald-400/90 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-tight">
                <span className="truncate">{sectors[sector].name}</span>
                <Compass className="w-3.5 h-3.5 shrink-0 ml-1" />
              </div>
              <p className="text-[7.5px] font-mono text-slate-500 leading-normal">{sectors[sector].coords}</p>
              <p className="text-[9px] text-slate-300 leading-relaxed font-sans">{sectors[sector].description}</p>
            </div>

            {/* Pulse Repetition controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pulse Rep Freq (PRF)</label>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{prf} Hz</span>
              </div>
              <input
                type="range"
                min="800"
                max="3200"
                step="100"
                value={prf}
                onChange={(e) => setPrf(Number(e.target.value))}
                disabled={isScanning}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Squint angle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Squint Sweep Angle</label>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{squintAngle}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={squintAngle}
                onChange={(e) => setSquintAngle(Number(e.target.value))}
                disabled={isScanning}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Processing Algorithm */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Doppler Focusing Algorithm</label>
              <select
                value={algorithm}
                onChange={(e: any) => setAlgorithm(e.target.value)}
                disabled={isScanning}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-emerald-400 outline-none focus:border-emerald-500/50"
              >
                <option value="rangedoppler">Range Doppler Algorithm (RDA)</option>
                <option value="chirpscaling">Chirp Scaling Algorithm (CSA)</option>
                <option value="backprojection">Time-Domain Backprojection (TDBP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-950/40">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScanProgress(0);
                setIdentifiedTargets([]);
                setProcessStage('IDLE');
              }}
              disabled={isScanning}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center transition-all disabled:opacity-50"
              title="Reset Calibration"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={startReconScan}
              disabled={isScanning}
              className={`flex-grow py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${
                isScanning
                  ? 'bg-emerald-950 text-emerald-500 cursor-not-allowed border border-emerald-900/40'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 border-2 border-emerald-300'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isScanning ? 'Imaging Target...' : 'Engage Space Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Radar Screen (Center-Right) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="glass rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 flex flex-col relative overflow-hidden h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <Radar className={`w-4.5 h-4.5 ${isScanning ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
              <div>
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">SYNTHETIC_APERTURE_COPROCESSOR</h4>
                <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Focus: {algorithm.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-2.5 py-1 rounded text-[8px] font-mono font-black border uppercase tracking-wider transition-all duration-300 ${
                processStage === 'IMAGE_STABILIZED' 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : (isScanning ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-600')
              }`}>
                STAGE: {processStage}
              </span>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className="flex-grow w-full relative bg-[#060a12] rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
            <canvas ref={canvasRef} width={580} height={350} className="w-full h-full block" />

            {/* Custom Overlay Stats */}
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 max-w-[200px] pointer-events-none space-y-2.5 font-mono text-[8px]">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 border-b border-slate-900 pb-1 uppercase tracking-wider">
                <span>SAR_STATS</span>
                <Activity className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Clutter Ratio:</span>
                <span className="text-emerald-400 font-bold">-24.5 dB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Doppler Shift:</span>
                <span className="text-emerald-400 font-bold">{isScanning ? (Math.random() * 5 + 4).toFixed(3) : '6.421'} kHz</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Echo Intensity:</span>
                <span className="text-emerald-400 font-bold">{isScanning ? Math.round(Math.random() * 20 + 80) : '92'}%</span>
              </div>
            </div>

            {/* Scanning Progress bar overlay */}
            {isScanning && (
              <div className="absolute top-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 w-[200px] pointer-events-none space-y-2">
                <div className="flex justify-between text-[8px] font-black text-slate-400 font-mono tracking-wider">
                  <span>RF RECON PROGRESS</span>
                  <span className="text-emerald-400">{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Identified Targets Inventory Panel */}
        <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-4">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Terrain Classified Targets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {identifiedTargets.length === 0 ? (
                <div className="col-span-2 text-center text-slate-500 py-3 italic text-[10px] font-mono">
                  No scan files initialized. Trigger "Engage Space Scan" to process phase intelligence.
                </div>
              ) : (
                identifiedTargets.map((tgt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/20 rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white">{tgt.type.toUpperCase()}</p>
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">{tgt.text}</p>
                    </div>
                    <div className="text-right space-y-1 font-mono">
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tgt.confidence}% CONF
                      </span>
                      <p className="text-[7.5px] text-slate-600 uppercase tracking-tight">{tgt.status}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SARImagingSuite;
