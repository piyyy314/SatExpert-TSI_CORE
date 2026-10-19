import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, Compass, Cpu, Target, Eye, Sliders, Play, RotateCcw, Shield, Activity, RefreshCw, Plus, Globe, Download, FileText } from 'lucide-react';

interface SARImagingSuiteProps {
  addMissionLog?: (detail: string, status?: any) => void;
}

export const SARImagingSuite: React.FC<SARImagingSuiteProps> = ({ addMissionLog }) => {
  const [sectors, setSectors] = useState<Record<string, { name: string; coords: string; description: string; nativeScatter: any[] }>>({
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
        { type: 'Guided Missile Corvette', text: 'CORVETTE CLASS HULL', size: 30, x: 150, y: 240, confidence: 96.1, status: 'IDLING_REACTOR' },
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
    },
    arctic: {
      name: 'Sector Delta-1 (Novaya Zemlya Array)',
      coords: '73.2041° N, 54.1205° E',
      description: 'Sub-glacial radar surveillance and long-range early warning installations.',
      nativeScatter: [
        { type: 'Sub-Glacial Transceiver', text: 'DEEP ROCK RECEPTOR', size: 28, x: 210, y: 160, confidence: 98.2, status: 'ACTIVE' },
        { type: 'Icebreaker Support', text: 'NUCLEAR REFUEL DOCK', size: 24, x: 140, y: 270, confidence: 87.5, status: 'MOORED' },
        { type: 'Surface Phased Array', text: 'PECHORA-M RADAR', size: 32, x: 320, y: 120, confidence: 96.8, status: 'SCANNING' }
      ]
    },
    laser: {
      name: 'Sector Lambda-4 (Al-Shindagah Directed Energy)',
      coords: '25.2642° N, 55.3116° E',
      description: 'Counter-UAS high-energy laser directed energy weapon testbed.',
      nativeScatter: [
        { type: 'HELW Turret Unit', text: '50kW LASER EMITTER', size: 20, x: 220, y: 200, confidence: 94.1, status: 'CHARGING' },
        { type: 'Beam Director Dome', text: 'OPTICAL TRACKING OPTICS', size: 16, x: 180, y: 120, confidence: 91.4, status: 'TRACKING' },
        { type: 'Power Substation', text: 'MW GENERATOR BANK', size: 30, x: 330, y: 250, confidence: 99.0, status: 'NOMINAL' }
      ]
    },
    pacific: {
      name: 'Sector Zeta-6 (Atoll Deep Ocean Range)',
      coords: '16.7154° N, 169.5302° W',
      description: 'Mid-ocean telemetry splashdown and hypersonic glide vehicle tracking corridor.',
      nativeScatter: [
        { type: 'Telemetry Barge Poseidon', text: 'DOWNRANGE TRACKING SHIP', size: 35, x: 250, y: 190, confidence: 97.9, status: 'RECEIVING' },
        { type: 'Autonomous Buoy Grid', text: 'HYDROPHONE ARRAY NODE', size: 12, x: 110, y: 90, confidence: 89.4, status: 'ACTIVE' },
        { type: 'Re-entry Sensor Pod', text: 'OPTICAL SPLASHDOWN MARKER', size: 15, x: 340, y: 280, confidence: 92.1, status: 'STANDBY' }
      ]
    }
  });

  const [sectorKey, setSectorKey] = useState<string>('silo');
  const [prf, setPrf] = useState<number>(1800); // Pulse Repetition Frequency
  const [squintAngle, setSquintAngle] = useState<number>(12); // Degrees
  const [algorithm, setAlgorithm] = useState<'rangedoppler' | 'chirpscaling' | 'backprojection'>('rangedoppler');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [processStage, setProcessStage] = useState<string>('IDLE');
  const [identifiedTargets, setIdentifiedTargets] = useState<any[]>([]);
  
  // Custom Sector Builder State
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('Sector Custom-1');
  const [customCoords, setCustomCoords] = useState<string>('45.0000° N, 10.0000° E');
  const [customDesc, setCustomDesc] = useState<string>('Custom operator-defined reconnaissance zone for real-time phase intelligence.');
  const [customTargetType, setCustomTargetType] = useState<string>('Unknown Anomaly Target');
  const [customTargetDesc, setCustomTargetDesc] = useState<string>('SUSPECTED INSTALLATION');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startReconScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setIdentifiedTargets([]);
    setProcessStage('ACQUIRING_RAW_PHASE');

    if (addMissionLog) {
      addMissionLog(`SAR_INIT: Orbital SAR beam sweeping target ${sectors[sectorKey]?.name || sectorKey}. Freq: X-Band, PRF: ${prf}Hz, Squint: ${squintAngle}°`, 'active');
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + (Math.random() * 5 + 3);
        if (next >= 100) {
          clearInterval(interval);
          handleExtractionComplete();
          return 100;
        }

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
    }, 120);

    return () => clearInterval(interval);
  }, [isScanning, sectorKey]);

  const handleExtractionComplete = () => {
    setIsScanning(false);
    setProcessStage('IMAGE_STABILIZED');
    setIdentifiedTargets(sectors[sectorKey]?.nativeScatter || []);

    if (addMissionLog) {
      addMissionLog(`SAR_IMAGE: Target reconstruction verified with high confidence in ${sectors[sectorKey]?.name}. Algorithm: ${algorithm.toUpperCase()}`, 'info');
    }
  };

  const handleCreateCustomSector = (e: React.FormEvent) => {
    e.preventDefault();
    const newKey = `custom_${Date.now().toString().slice(-4)}`;
    const newSectorObj = {
      name: customName,
      coords: customCoords,
      description: customDesc,
      nativeScatter: [
        { type: customTargetType, text: customTargetDesc, size: 25, x: 220, y: 180, confidence: 95.2, status: 'DETECTED' },
        { type: 'Perimeter Radar Node', text: 'REMOTE SENSOR', size: 16, x: 120, y: 100, confidence: 88.4, status: 'ACTIVE' },
        { type: 'Support Infrastructure', text: 'LOGISTICS YARD', size: 30, x: 340, y: 240, confidence: 91.0, status: 'NORMAL' }
      ]
    };

    setSectors(prev => ({ ...prev, [newKey]: newSectorObj }));
    setSectorKey(newKey);
    setShowCustomModal(false);
    setScanProgress(0);
    setIdentifiedTargets([]);
    setProcessStage('IDLE');

    if (addMissionLog) {
      addMissionLog(`SAR_SECTOR_CREATED: Custom reconnaissance zone "${customName}" initialized at (${customCoords}).`, 'active');
    }
  };

  const exportSarReport = () => {
    const reportData = {
      sector: sectors[sectorKey]?.name,
      coordinates: sectors[sectorKey]?.coords,
      prf,
      squintAngle,
      algorithm: algorithm.toUpperCase(),
      timestamp: new Date().toISOString(),
      identifiedTargets: identifiedTargets.length > 0 ? identifiedTargets : sectors[sectorKey]?.nativeScatter
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR_RECON_REPORT_${sectorKey.toUpperCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (addMissionLog) {
      addMissionLog(`SAR_EXPORT: Reconnaissance intelligence packet exported for ${sectors[sectorKey]?.name}.`, 'info');
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
      ctx.fillStyle = '#060a12';
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
        ctx.lineTo(centerX + Math.cos(sweepAngle) * 260, centerY + Math.sin(sweepAngle) * 260);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 260);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.02)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.15)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 260, sweepAngle - 0.4, sweepAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Phase Noise Flutter
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
        for (let i = 0; i < 50; i++) {
          const r = Math.random() * 220;
          const theta = Math.random() * Math.PI * 2;
          const size = Math.random() * 2.5;
          ctx.fillRect(centerX + Math.cos(theta) * r, centerY + Math.sin(theta) * r, size, size);
        }
      }

      // Render Reconstructed High-fidelity Radar Returns
      if (scanProgress > 20) {
        const opacityRatio = scanProgress / 100;
        const currentSectorData = sectors[sectorKey] || sectors['silo'];
        const targetList = currentSectorData.nativeScatter || [];

        targetList.forEach((tgt) => {
          const jitterX = (Math.random() - 0.5) * 1.5;
          const jitterY = (Math.random() - 0.5) * 1.5;
          const targetX = (tgt.x || 200) + jitterX;
          const targetY = (tgt.y || 150) + jitterY;
          const size = tgt.size || 20;

          // Target Base Echo glow ring
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * opacityRatio})`;
          ctx.fillStyle = `rgba(16, 185, 129, ${0.05 * opacityRatio})`;
          ctx.beginPath();
          ctx.arc(targetX, targetY, size + Math.sin(time * 3) * 2, 0, Math.PI * 2);
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
          ctx.moveTo(targetX - size / 2, targetY - size / 2 + 5);
          ctx.lineTo(targetX - size / 2, targetY - size / 2);
          ctx.lineTo(targetX - size / 2 + 5, targetY - size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX + size / 2, targetY - size / 2 + 5);
          ctx.lineTo(targetX + size / 2, targetY - size / 2);
          ctx.lineTo(targetX + size / 2 - 5, targetY - size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX - size / 2, targetY + size / 2 - 5);
          ctx.lineTo(targetX - size / 2, targetY + size / 2);
          ctx.lineTo(targetX - size / 2 + 5, targetY + size / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX + size / 2, targetY + size / 2 - 5);
          ctx.lineTo(targetX + size / 2, targetY + size / 2);
          ctx.lineTo(targetX + size / 2 - 5, targetY + size / 2);
          ctx.stroke();

          // Vector wireframe lines
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * opacityRatio})`;
          ctx.beginPath();
          ctx.moveTo(targetX - size, targetY);
          ctx.lineTo(targetX + size, targetY);
          ctx.moveTo(targetX, targetY - size);
          ctx.lineTo(targetX, targetY + size);
          ctx.stroke();

          // Target tag
          if (scanProgress > 60) {
            ctx.fillStyle = `rgba(16, 215, 129, ${0.9 * opacityRatio})`;
            ctx.font = 'bold 8px monospace';
            ctx.fillText((tgt.type || 'ANOMALY').toUpperCase(), targetX + size / 2 + 4, targetY - 4);
            ctx.fillStyle = `rgba(16, 185, 129, ${0.5 * opacityRatio})`;
            ctx.font = '7px monospace';
            ctx.fillText(`${tgt.confidence || 90}% ACC | ${tgt.status || 'ACTIVE'}`, targetX + size / 2 + 4, targetY + 6);
          }
        });
      }

      // Calibration sweep bar
      pulseWave = (pulseWave + 1.5) % canvas.height;
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
  }, [isScanning, scanProgress, sectorKey, sectors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Configuration column (Left) */}
      <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.255em]">SAR_Radar_Telemetry</h3>
            </div>
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all"
              title="Add Custom Terrain Sector"
            >
              <Plus className="w-3 h-3" />
              <span>Scan Any Terrain</span>
            </button>
          </div>

          {/* Sector selection grid (Expanded with more sectors) */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Reconnaissance Sectors ({Object.keys(sectors).length})</label>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(sectors).map(([key, sec]: [string, any]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSectorKey(key);
                    setScanProgress(0);
                    setIdentifiedTargets([]);
                    setProcessStage('IDLE');
                  }}
                  disabled={isScanning}
                  className={`py-2 px-2.5 text-left text-[8px] font-mono font-black uppercase rounded-xl border transition-all truncate ${
                    sectorKey === key
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">{sec.name.split(' ')[0]} {sec.name.split(' ')[1]}</div>
                  <div className="text-[6.5px] font-normal text-slate-500 truncate">{sec.coords}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* Sector Details Brief */}
            <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-900/20 text-emerald-400/90 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-tight">
                <span className="truncate">{sectors[sectorKey]?.name || 'Custom Sector'}</span>
                <Compass className="w-3.5 h-3.5 shrink-0 ml-1 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-[7.5px] font-mono text-slate-400 leading-normal">{sectors[sectorKey]?.coords}</p>
              <p className="text-[9px] text-slate-300 leading-relaxed font-sans">{sectors[sectorKey]?.description}</p>
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

        {/* Action Button & Export */}
        <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex gap-3">
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

          <button
            onClick={exportSarReport}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-[9px] font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SAR Intelligence Report (.json)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Radar Screen (Center-Right) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="glass rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 flex flex-col relative overflow-hidden min-h-[520px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 border-b border-slate-800/80 pb-3 mb-4 gap-3">
            <div className="flex items-center space-x-2.5">
              <Radar className={`w-4.5 h-4.5 ${isScanning ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
              <div>
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">SYNTHETIC_APERTURE_COPROCESSOR</h4>
                <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Focus: {algorithm.toUpperCase()} // SECTOR: {sectors[sectorKey]?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded text-[8px] font-mono font-black border uppercase tracking-wider transition-all duration-300 ${
                processStage === 'IMAGE_STABILIZED' 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : (isScanning ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-600')
              }`}>
                STAGE: {processStage}
              </span>
            </div>
          </div>

          {/* Interactive Screen Container with 100% stable aspect ratio */}
          <div className="flex-grow w-full min-h-[380px] relative bg-[#060a12] rounded-2xl overflow-hidden border border-slate-900 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} width={650} height={400} className="w-full h-full block object-cover" />

            {/* Custom Overlay Stats */}
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 max-w-[210px] pointer-events-none space-y-2.5 font-mono text-[8px] shadow-xl">
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
              <div className="absolute top-4 right-4 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 w-[210px] pointer-events-none space-y-2 shadow-xl">
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Terrain Classified Targets ({sectors[sectorKey]?.name})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {identifiedTargets.length === 0 ? (
                <div className="col-span-2 text-center text-slate-500 py-6 italic text-[10px] font-mono">
                  No scan files initialized for {sectors[sectorKey]?.name}. Trigger "Engage Space Scan" to process phase intelligence.
                </div>
              ) : (
                identifiedTargets.map((tgt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/20 rounded-xl flex items-center justify-between"
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

      {/* Custom Terrain Sector Modal */}
      {showCustomModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setShowCustomModal(false)}
        >
          <div 
            className="glass w-full max-w-lg rounded-[2.5rem] border-2 border-emerald-500/40 p-8 space-y-6 shadow-2xl bg-[#070b14]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Scan Any Terrain // Custom Sector Builder</h3>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="text-slate-500 hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateCustomSector} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector Code & Name</label>
                <input 
                  type="text" 
                  value={customName} 
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target GPS Coordinates (Lat, Lng)</label>
                <input 
                  type="text" 
                  value={customCoords} 
                  onChange={(e) => setCustomCoords(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recon Brief / Terrain Description</label>
                <textarea 
                  value={customDesc} 
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-300 outline-none focus:border-emerald-500 h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Target Type</label>
                  <input 
                    type="text" 
                    value={customTargetType} 
                    onChange={(e) => setCustomTargetType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signature Label</label>
                  <input 
                    type="text" 
                    value={customTargetDesc} 
                    onChange={(e) => setCustomTargetDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Initialize Custom Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SARImagingSuite;
