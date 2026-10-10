import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Activity, 
  Eye, 
  Terminal, 
  Network, 
  Lock, 
  Radio, 
  Target,
  RefreshCw,
  AlertTriangle,
  Database,
  BrainCircuit,
  Workflow,
  Flame,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Gauge,
  Sliders,
  Crosshair,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Download,
  Sparkles,
  AlertOctagon,
  RotateCcw,
  Compass
} from 'lucide-react';
import { Coordinates, Satellite, WeatherCondition, TacticalEvent } from '../types';
import { audioController } from '../services/audioService';

export interface SentinelAIControlProps {
  telemetry?: {
    snr?: number | string;
    rxPower?: number | string;
    packetLoss?: number | string;
    bucTemp?: number | string;
    status?: string;
    isThermalDecoyActive?: boolean;
    thermalDecoySecondsRemaining?: number;
  };
  isThermalDecoyActive?: boolean;
  thermalDecoySecondsRemaining?: number;
  onDeployThermalDecoy?: (duration?: number) => void;
  onCancelThermalDecoy?: () => void;
  selectedSat?: Satellite;
  isJamming?: boolean;
  jammingPower?: number;
  weather?: WeatherCondition;
  addMissionLog?: (detail: string, status?: TacticalEvent['status']) => void;
  orbitalDrift?: number;
  isDriftAlert?: boolean;
  onResyncTracking?: () => void;
  onSimulateDrift?: (delta?: number) => void;
  calibratedLongitude?: number;
  onNavigateToTacticalHUD?: () => void;
}

interface TelemetryPoint {
  time: string;
  bucTemp: number;
  snr: number;
  rxPower: number;
  packetLoss: number;
}

// Robust numeric parser for telemetry values that can arrive as strings or numbers
const toNum = (val: number | string | undefined | null, fallback: number): number => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
};

export const SentinelAIControl: React.FC<SentinelAIControlProps> = ({
  telemetry: externalTelemetry,
  isThermalDecoyActive = false,
  thermalDecoySecondsRemaining = 0,
  onDeployThermalDecoy,
  onCancelThermalDecoy,
  selectedSat,
  isJamming = false,
  jammingPower = 0,
  weather = 'CLEAR',
  addMissionLog,
  orbitalDrift,
  isDriftAlert,
  onResyncTracking,
  onSimulateDrift,
  calibratedLongitude,
  onNavigateToTacticalHUD
}) => {
  // Navigation sub-tab within Sentinel AI Control
  const [activeTab, setActiveTab] = useState<'decision_matrix' | 'overwatch' | 'syslog'>('decision_matrix');

  // Internal drift state fallback if not supplied externally
  const [internalDriftOffset, setInternalDriftOffset] = useState(0);
  const [internalSyncedLong, setInternalSyncedLong] = useState(selectedSat?.longitude ?? 0);
  const [internalResyncNotice, setInternalResyncNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSat?.longitude !== undefined) {
      setInternalSyncedLong(selectedSat.longitude);
      setInternalDriftOffset(0);
    }
  }, [selectedSat?.id]);

  const activeSynced = calibratedLongitude ?? internalSyncedLong;
  const currentSatLong = (selectedSat?.longitude ?? 0) + internalDriftOffset;
  const currentDrift = orbitalDrift !== undefined 
    ? orbitalDrift 
    : Math.round(Math.abs(currentSatLong - activeSynced) * 1000) / 1000;
  const isDriftExceeded = isDriftAlert !== undefined ? isDriftAlert : currentDrift > 0.05;

  const handleResyncFromAI = () => {
    try {
      audioController.playChirp();
    } catch (e) {}

    if (onResyncTracking) {
      onResyncTracking();
    } else {
      setInternalSyncedLong(selectedSat?.longitude ?? 0);
      setInternalDriftOffset(0);
    }

    setInternalResyncNotice("ORBITAL TRACKING COORDINATES RE-SYNCHRONIZED VIA SENTINEL AI");
    setTimeout(() => setInternalResyncNotice(null), 4000);

    if (addMissionLog) {
      addMissionLog(
        `AI_RESYNC_DIRECTIVE: Orbital tracking ephemeris re-synchronized for ${selectedSat?.name || 'satellite'}. Drift restored to 0.000 units.`,
        'active'
      );
    }
  };

  const handleSimulateDriftFromAI = (delta: number = 0.065) => {
    if (onSimulateDrift) {
      onSimulateDrift(delta);
    } else {
      setInternalDriftOffset(prev => prev + delta);
      try {
        audioController.playAlert();
      } catch (e) {}
    }
    if (addMissionLog) {
      addMissionLog(
        `AI_DRIFT_SIMULATE: Injected orbital drift perturbation (+${delta.toFixed(3)} units) on ${selectedSat?.name || 'satellite'}. Alert threshold (>0.05 units) triggered.`,
        'CRITICAL'
      );
    }
  };

  // Baseline system metric states
  const [systemLoad, setSystemLoad] = useState(39);
  const [activeThreads, setActiveThreads] = useState(125);
  const [integrityScale, setIntegrityScale] = useState(99.97);
  const [uptimeSeconds, setUptimeSeconds] = useState(42 * 24 * 3600 + 12 * 3600);
  const [interceptions, setInterceptions] = useState(1242);
  const [deflectedAttacks, setDeflectedAttacks] = useState(89);
  const [threatsDetected, setThreatsDetected] = useState(4);
  const [nodesSyncing, setNodesSyncing] = useState(18);

  // Core system logs
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] Sentinel Core v6.0.4 initialized...',
    '[AUTH] Biometric handshake confirmed.',
    '[LINK] Establishing mesh connection to Orbital Stack...',
    '[AI-MATRIX] Telemetry trends analysis engine initialized.',
    '[DECOY-OPT] Thermal signature prediction pipeline calibrated.'
  ]);

  // Rolling Telemetry History for Decision Matrix (15 samples)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const initialTemp = toNum(externalTelemetry?.bucTemp, 45.0);
    const initialSnr = toNum(externalTelemetry?.snr, 16.0);
    const initialRx = toNum(externalTelemetry?.rxPower, -42.0);
    const initialLoss = toNum(externalTelemetry?.packetLoss, 0.0);
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}s`,
      bucTemp: Math.round((initialTemp + (Math.random() - 0.5) * 1.5) * 10) / 10,
      snr: Math.round((initialSnr + (Math.random() - 0.5) * 0.4) * 10) / 10,
      rxPower: Math.round((initialRx + (Math.random() - 0.5) * 0.8) * 10) / 10,
      packetLoss: initialLoss
    }));
  });

  // Operator selected duration state (custom or preset)
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [matrixLogNotice, setMatrixLogNotice] = useState<string | null>(null);

  // Fallback internal decoy timer if standalone
  const [internalDecoyActive, setInternalDecoyActive] = useState(false);
  const [internalCountdown, setInternalCountdown] = useState(0);

  const activeDecoy = onDeployThermalDecoy ? isThermalDecoyActive : internalDecoyActive;
  const activeCountdown = onDeployThermalDecoy ? thermalDecoySecondsRemaining : internalCountdown;

  // Real-time ticking interval for system metrics and telemetry recording
  useEffect(() => {
    const interval = setInterval(() => {
      // System Load
      setSystemLoad(prev => {
        const diff = (Math.random() - 0.5) * 4;
        return Math.max(30, Math.min(48, Math.round((prev + diff) * 10) / 10));
      });

      // Neural Threads
      setActiveThreads(prev => {
        const diff = Math.random() < 0.5 ? -1 : 1;
        return Math.max(120, Math.min(132, prev + (Math.random() < 0.3 ? diff : 0)));
      });

      // Integrity scale
      setIntegrityScale(prev => {
        const diff = (Math.random() - 0.5) * 0.004;
        const next = Math.max(99.91, Math.min(100.00, prev + diff));
        return Math.round(next * 1000) / 1000;
      });

      setUptimeSeconds(prev => prev + 1);

      if (Math.random() < 0.25) {
        setInterceptions(prev => prev + 1);
        if (Math.random() < 0.85) setDeflectedAttacks(prev => prev + 1);
      }

      if (Math.random() < 0.08) {
        setThreatsDetected(prev => Math.max(2, Math.min(9, prev + (Math.random() < 0.5 ? -1 : 1))));
      }

      if (Math.random() < 0.12) {
        setNodesSyncing(prev => Math.max(12, Math.min(22, prev + (Math.random() < 0.5 ? -1 : 1))));
      }

      // Record current telemetry into trend buffer
      const currentBuc = toNum(externalTelemetry?.bucTemp, 45.0);
      const currentSnr = toNum(externalTelemetry?.snr, 16.0);
      const currentRx = toNum(externalTelemetry?.rxPower, -42.0);
      const currentLoss = toNum(externalTelemetry?.packetLoss, 0.0);

      setTelemetryHistory(prev => {
        const updated = [
          ...prev.slice(-14),
          {
            time: new Date().toLocaleTimeString([], { second: '2-digit' }),
            bucTemp: currentBuc,
            snr: currentSnr,
            rxPower: currentRx,
            packetLoss: currentLoss
          }
        ];
        return updated;
      });

      // Periodic logs
      if (Math.random() > 0.82) {
        const matrixLogs = [
          `[MATRIX] Telemetry vectors sampled: BUC=${currentBuc.toFixed(1)}°C, SNR=${currentSnr.toFixed(1)}dB`,
          `[ISR-PASS] Space-based infrared reconnaissance satellite pass detected.`,
          `[DECOY-AI] Spoof trajectory duration recalculated based on RF thermal envelope.`,
          `[DEFENSE] Hostile thermal signature scanner locked onto synthetic flare matrix.`
        ];
        setLogs(prev => [...prev.slice(-8), matrixLogs[Math.floor(Math.random() * matrixLogs.length)]]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [externalTelemetry]);

  // Internal fallback countdown timer if external handler not provided
  useEffect(() => {
    if (onDeployThermalDecoy || !internalDecoyActive) return;
    const timer = setInterval(() => {
      setInternalCountdown(prev => {
        if (prev <= 1) {
          setInternalDecoyActive(false);
          setLogs(prevLogs => [...prevLogs, '[THERMAL] Fallback 30s Spoof timer expired. Signature nominal.']);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [internalDecoyActive, onDeployThermalDecoy]);

  // ==========================================
  // AI DECISION MATRIX CALCULATION ENGINE
  // ==========================================
  const matrixAnalysis = useMemo(() => {
    const currentTemp = toNum(externalTelemetry?.bucTemp, 45.0);
    const currentSnr = toNum(externalTelemetry?.snr, 16.0);

    // 1. Calculate Telemetry Derivatives & Slopes
    let tempSlope = 0;
    let snrSlope = 0;
    if (telemetryHistory.length >= 2) {
      const recent = telemetryHistory[telemetryHistory.length - 1];
      const oldest = telemetryHistory[0];
      const timeDelta = Math.max(1, telemetryHistory.length - 1);
      tempSlope = (recent.bucTemp - oldest.bucTemp) / timeDelta;
      snrSlope = (recent.snr - oldest.snr) / timeDelta;
    }

    // 2. Hostile ISR Threat Modeling
    // Hostile space-based sensor attributes
    const hostileSatName = isJamming ? 'COSMOS-2558 (Optical-IR Tracking Cluster)' : 'KH-12 / USA-326 (Cryo-Staring Array)';
    const hostileFocalBand = 'MWIR 3.4-5.2 µm & LWIR 8-12 µm';
    
    // Hostile dwell window based on weather & satellite orbital height
    let baseDwellWindow = 32; // seconds
    if (weather === 'CLEAR') baseDwellWindow = 36;
    else if (weather === 'OVERCAST') baseDwellWindow = 30;
    else if (weather === 'LIGHT_RAIN') baseDwellWindow = 26;
    else if (weather === 'HEAVY_STORM') baseDwellWindow = 22;

    if (isJamming) baseDwellWindow += Math.min(15, Math.round(jammingPower / 6));

    // 3. AI Optimized Spoof Duration Calculation
    // Base duration matches hostile dwell window with safety delta
    let calculatedDuration = baseDwellWindow;

    // Atmospheric adjustment
    let weatherPenalty = 0;
    if (weather === 'HEAVY_STORM') {
      weatherPenalty = -4; // Moisture scatters IR rapidly, shorter burst is more efficient
    } else if (weather === 'CLEAR') {
      weatherPenalty = +3; // Clear skies allow prolonged hostile dwell
    }

    // Jamming noise adjustment
    let jammingBonus = isJamming ? Math.round(jammingPower / 10) : 0;

    // Hardware thermal constraint (BUC Temperature protection)
    let tempConstraint = 0;
    if (currentTemp > 65) {
      tempConstraint = -Math.round((currentTemp - 65) * 0.8); // Shorter spoof to prevent thermal runaway
    } else if (currentTemp < 48) {
      tempConstraint = +2; // Safe headroom
    }

    calculatedDuration = Math.max(15, Math.min(60, calculatedDuration + weatherPenalty + jammingBonus + tempConstraint));

    // Confidence & Strain metrics
    const confidenceScore = Math.min(99.4, Math.max(88.0, 94.6 + (isJamming ? 2.4 : 0) - (weather === 'HEAVY_STORM' ? 3.2 : 0) + (tempSlope < 0.1 ? 1.5 : -1.0)));
    const deceptionProbability = Math.min(99.8, 96.2 + (calculatedDuration >= 30 ? 2.8 : 0));
    const thermalStress = Math.min(98, Math.max(12, Math.round((currentTemp / 85) * 65 + (calculatedDuration / 60) * 25)));

    // Rationale generation
    const rationaleBullets = [
      `Hostile ISR platform [${hostileSatName}] orbital pass aperture estimated at ${baseDwellWindow}s dwell window.`,
      `BUC junction temperature at ${currentTemp.toFixed(1)}°C allows up to ${calculatedDuration}s spoof burst without exceeding 85°C critical limit.`,
      weather === 'HEAVY_STORM' 
        ? `Atmospheric precipitation induces 3.4 dB/km moisture scattering; dynamic flare saturation achieved in ${calculatedDuration}s.`
        : `Atmospheric transmission index is nominal (${weather}); sustained thermal pulse prevents seeker re-acquisition.`,
      isJamming 
        ? `Active EW jamming (${Number(jammingPower || 0).toFixed(0)} dBm) induces receiver gain pumping; +${jammingBonus}s duration buffer recommended.`
        : `Electronic background is clear; standard decoy envelope sufficient.`
    ];

    // Presets with specific matrix metrics
    const profiles = [
      {
        id: 'sprint',
        name: 'Sprint Pulse',
        duration: 15,
        targetTemp: '168.0°C',
        strain: 'LOW (18%)',
        recoveryTime: '12s',
        deceptionRating: '86.4%',
        description: 'Rapid flare burst. Minimal thermal wear on BUC. Ideal for quick LEO flyovers.'
      },
      {
        id: 'tactical',
        name: 'Tactical Mask',
        duration: 30,
        targetTemp: '192.5°C',
        strain: 'MODERATE (42%)',
        recoveryTime: '26s',
        deceptionRating: '97.2%',
        description: 'Standard military countermeasure envelope. Completely blinds mid-wave IR focal arrays.'
      },
      {
        id: 'extended',
        name: 'Extended Spoof',
        duration: 45,
        targetTemp: '215.0°C',
        strain: 'ELEVATED (68%)',
        recoveryTime: '44s',
        deceptionRating: '98.9%',
        description: 'Extended phantom signature for high-jamming environments or dual-satellite passes.'
      },
      {
        id: 'constellation',
        name: 'Constellation Break',
        duration: 60,
        targetTemp: '232.0°C',
        strain: 'HIGH (88%)',
        recoveryTime: '68s',
        deceptionRating: '99.6%',
        description: 'Maximum duration flare burn. Blinds multi-satellite tandem stare during critical transmissions.'
      }
    ];

    return {
      currentTemp,
      currentSnr,
      tempSlope,
      snrSlope,
      hostileSatName,
      hostileFocalBand,
      baseDwellWindow,
      calculatedDuration,
      confidenceScore,
      deceptionProbability,
      thermalStress,
      rationaleBullets,
      profiles
    };
  }, [externalTelemetry, telemetryHistory, isJamming, jammingPower, weather]);

  // Synchronize initial selected duration with AI optimal duration
  useEffect(() => {
    setSelectedDuration(matrixAnalysis.calculatedDuration);
  }, [matrixAnalysis.calculatedDuration]);

  // Format uptime
  const formatUptime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Trigger Spoof from AI Decision Matrix
  const handleDeploySpoofWithDuration = (durationToDeploy: number) => {
    try {
      audioController.playAlert();
    } catch (e) {}

    if (onDeployThermalDecoy) {
      onDeployThermalDecoy(durationToDeploy);
    } else {
      setInternalDecoyActive(true);
      setInternalCountdown(durationToDeploy);
    }

    const logEntry = `[AI-MATRIX] Operator activated optimized Heat Signature Spoof for ${durationToDeploy}s. BUC telemetry overridden with synthetic thermal bloom. Hostile ISR confused.`;
    setLogs(prev => [...prev, logEntry]);
    if (addMissionLog) {
      addMissionLog(`AI DECISION MATRIX TRIGGER: Deployed ${durationToDeploy}s Heat Signature Spoof based on telemetry trend analysis.`, 'STRIKE');
    }

    setMatrixLogNotice(`DEPLOYED: ${durationToDeploy}s Heat Signature Spoof active!`);
    setTimeout(() => setMatrixLogNotice(null), 5000);
  };

  // Cancel active spoof
  const handleCancelSpoof = () => {
    try {
      audioController.playChirp();
    } catch (e) {}

    if (onCancelThermalDecoy) {
      onCancelThermalDecoy();
    } else {
      setInternalDecoyActive(false);
      setInternalCountdown(0);
    }

    const logEntry = '[AI-MATRIX] Operator aborted Heat Signature Spoof. Telemetry returned to nominal.';
    setLogs(prev => [...prev, logEntry]);
    if (addMissionLog) {
      addMissionLog('AI DECISION MATRIX: Heat Signature Spoof cancelled early by operator.', 'active');
    }
  };

  // Export Syslog
  const handleExportSyslog = () => {
    const logData = {
      metadata: {
        timestamp: new Date().toISOString(),
        systemLoad,
        activeThreads,
        integrityScale,
        uptimeSeconds
      },
      logs
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_SYSLOG_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Decision Matrix Analysis Report
  const handleExportDecisionMatrix = () => {
    const matrixReport = {
      timestamp: new Date().toISOString(),
      satellite: selectedSat?.name ?? 'UNKNOWN_NODE',
      weatherCondition: weather,
      jammingActive: isJamming,
      jammingPowerDbm: jammingPower,
      telemetryCurrent: {
        bucTemp: matrixAnalysis.currentTemp,
        snr: matrixAnalysis.currentSnr,
        tempSlope: `${matrixAnalysis.tempSlope.toFixed(3)} °C/s`,
        snrSlope: `${matrixAnalysis.snrSlope.toFixed(3)} dB/s`
      },
      telemetryHistory,
      aiDecisionMatrix: {
        recommendedDuration: matrixAnalysis.calculatedDuration,
        confidence: `${matrixAnalysis.confidenceScore.toFixed(1)}%`,
        deceptionProbability: `${matrixAnalysis.deceptionProbability.toFixed(1)}%`,
        thermalStressLevel: `${matrixAnalysis.thermalStress}%`,
        hostileISRTarget: matrixAnalysis.hostileSatName,
        hostileSensorBand: matrixAnalysis.hostileFocalBand,
        estimatedDwellWindow: `${matrixAnalysis.baseDwellWindow}s`,
        rationale: matrixAnalysis.rationaleBullets
      },
      tacticalProfiles: matrixAnalysis.profiles
    };

    const blob = new Blob([JSON.stringify(matrixReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_AI_DECISION_MATRIX_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-700">
      {/* Sentinel Core Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="relative">
            <div className={`absolute inset-0 bg-cyan-500 blur-xl opacity-20 ${activeDecoy ? 'bg-amber-500 animate-ping' : 'animate-pulse'}`}></div>
            <div className={`p-2.5 sm:p-3 bg-slate-900 rounded-2xl border relative z-10 transition-colors ${activeDecoy ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-cyan-500/30'}`}>
              {activeDecoy ? (
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 animate-bounce" />
              ) : (
                <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                Sentinel <span className="text-cyan-500">Core v6</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                AI DECISION ENGINE
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] mt-1.5 flex items-center">
              <Activity className="w-2.5 h-2.5 mr-1.5 text-rose-500 animate-pulse" />
              {activeDecoy 
                ? `HEAT SIGNATURE SPOOF ACTIVE [${activeCountdown}s] // BUC OVERRIDE ACTIVE` 
                : 'Autonomous Threat Mitigation & Telemetry Decision Matrix'}
            </p>
          </div>
        </div>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {[
            { label: 'System Load', value: `${systemLoad.toFixed(1)}%`, color: 'text-cyan-400' },
            { label: 'Neural Threads', value: activeThreads, color: 'text-white' },
            { label: 'Integrity', value: `${integrityScale.toFixed(2)}%`, color: 'text-emerald-400' },
            { label: 'Uptime', value: formatUptime(uptimeSeconds), color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="glass px-3 py-1.5 rounded-xl bg-slate-900/40 border-slate-800 flex flex-col justify-center">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className={`text-xs sm:text-sm font-black font-mono tracking-tight ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ============================================================== */}
      {/* VISUAL ALERT MECHANISM: AI DETECTED ORBITAL DRIFT (> 0.05 u)   */}
      {/* ============================================================== */}
      {isDriftExceeded && (
        <div className="rounded-2xl border border-red-500 bg-gradient-to-r from-red-950/90 via-[#0e0307] to-amber-950/80 p-3 sm:p-4 shadow-[0_0_30px_rgba(239,68,68,0.35)] animate-in slide-in-from-top-2 duration-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-600 animate-pulse" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start space-x-3">
              <div className="p-2 sm:p-2.5 bg-red-600/30 border border-red-500 rounded-xl text-red-400 shrink-0">
                <AlertOctagon className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[8px] uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse">
                    AI ORBITAL DRIFT ALERT // EXCEEDS 0.050 TOLERANCE
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/60 border border-red-500/60 font-mono text-[9.5px] font-black text-amber-300">
                    DETECTED DRIFT: +{currentDrift.toFixed(4)} UNITS
                  </span>
                </div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-tight">
                  Ephemeris Divergence Flagged on {selectedSat?.name || 'Target Asset'}
                </h4>
                <p className="text-[10.5px] text-red-200/90 font-mono leading-relaxed max-w-3xl">
                  <strong className="text-white">SENTINEL AI DIRECTIVE:</strong> Drift of +{currentDrift.toFixed(4)} units exceeds 0.050 mission boundary. Operator prompted to re-sync satellite tracking coordinates via Tactical HUD.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full lg:w-auto">
              <button
                onClick={handleResyncFromAI}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-white hover:to-white text-white hover:text-red-950 font-black text-[9px] uppercase tracking-[0.15em] shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 border border-white/20"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RE-SYNC COORDINATES NOW</span>
              </button>
              {onNavigateToTacticalHUD && (
                <button
                  onClick={onNavigateToTacticalHUD}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-black text-[9px] uppercase tracking-[0.15em] border border-cyan-500/40 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>OPEN TACTICAL HUD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Internal Resync Confirmation */}
      {internalResyncNotice && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-in fade-in duration-300 font-mono text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{internalResyncNotice}</span>
          </div>
          <span className="bg-black/50 px-2 py-0.5 rounded border border-emerald-500/40 text-[8.5px]">DRIFT: 0.000 u</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('decision_matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'decision_matrix'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            <span>AI Decision Matrix</span>
            <span className="text-[7.5px] px-1 py-0.2 bg-slate-950/40 rounded ml-1 font-mono">
              OPT {matrixAnalysis.calculatedDuration}s
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overwatch')}
            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'overwatch'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Autonomous Overwatch</span>
          </button>

          <button
            onClick={() => setActiveTab('syslog')}
            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'syslog'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Core Syslog</span>
          </button>
        </div>

        {/* Global Spoof Status Badge & Quick Action */}
        <div className="flex items-center space-x-3">
          {activeDecoy ? (
            <div className="flex items-center space-x-3 bg-amber-950/40 border border-amber-500/50 px-4 py-2 rounded-2xl animate-pulse">
              <Flame className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="block text-[8px] font-black text-amber-500 uppercase tracking-widest">SPOOF IN PROGRESS</span>
                <span className="text-xs font-black font-mono text-white">{activeCountdown}s REMAINING</span>
              </div>
              <button
                onClick={handleCancelSpoof}
                className="ml-2 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
              >
                ABORT
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-2xl">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                BUC Baseline: <span className="text-cyan-400 font-mono">{matrixAnalysis.currentTemp.toFixed(1)}°C</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                AI Suggested: <span className="text-amber-400 font-mono">{matrixAnalysis.calculatedDuration}s</span>
              </span>
            </div>
          )}

          <button
            onClick={handleExportDecisionMatrix}
            className="px-3.5 py-2 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3 h-3" />
            <span>Export Matrix</span>
          </button>
        </div>
      </div>

      {matrixLogNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono font-bold flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{matrixLogNotice}</span>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* VIEW 1: AI DECISION MATRIX (HEAT SPOOF OPTIMIZER) */}
      {/* ============================================================ */}
      {activeTab === 'decision_matrix' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top Banner: Real-time Telemetry Trend Analysis & Optimal Duration Recommendation */}
          <div className="glass p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border-slate-800 bg-slate-950/60 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase italic tracking-tight">
                      AI Decision Matrix <span className="text-amber-400">// Heat Signature Spoof Optimizer</span>
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Real-time telemetry trend derivative modeling vs. hostile satellite infrared dwell windows
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence & Target Stats */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest">CONFIDENCE</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                    {matrixAnalysis.confidenceScore.toFixed(1)}%
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest">DECEPTION RATING</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-cyan-400">
                    {matrixAnalysis.deceptionProbability.toFixed(1)}%
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest">THERMAL STRESS</span>
                  <span className={`text-xs sm:text-sm font-black font-mono ${matrixAnalysis.thermalStress > 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {matrixAnalysis.thermalStress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Main Interactive Optimization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
              {/* Left Column: Live Recommendation Card & Trigger */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-2xl border border-amber-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.12)]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1.5" /> AI Recommended Duration
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[7.5px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      OPTIMAL ENVELOPE
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2.5 mb-2.5">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                      {matrixAnalysis.calculatedDuration}
                    </span>
                    <span className="text-base font-black text-amber-400 font-mono uppercase">SECONDS</span>
                  </div>

                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed mb-4">
                    Matches hostile <span className="text-white font-mono">{matrixAnalysis.hostileSatName}</span> pass dwell window ({matrixAnalysis.baseDwellWindow}s) adjusted for ambient dissipation velocity.
                  </p>

                  {/* Manual Duration Slider / Preset Fine-Tuning */}
                  <div className="space-y-2 pt-3 border-t border-white/10 mb-4">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <span>Operator Selected Duration:</span>
                      <span className="text-amber-400 font-mono text-xs">{selectedDuration}s</span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="1"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[7.5px] font-mono text-slate-500">
                      <span>10s (Burst)</span>
                      <span className="text-amber-400 font-bold">AI Opt: {matrixAnalysis.calculatedDuration}s</span>
                      <span>60s (Deep Mask)</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedDuration(matrixAnalysis.calculatedDuration)}
                        className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        Reset to AI Optimal ({matrixAnalysis.calculatedDuration}s)
                      </button>
                    </div>
                  </div>

                  {/* Operator Execution Trigger */}
                  {activeDecoy ? (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-500/60 text-center animate-pulse">
                        <span className="block text-[9px] font-black text-amber-400 uppercase tracking-widest mb-0.5">
                          HEAT SIGNATURE SPOOF ACTIVE
                        </span>
                        <span className="text-2xl font-black font-mono text-white">
                          {activeCountdown}s REMAINING
                        </span>
                      </div>
                      <button
                        onClick={handleCancelSpoof}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-wider text-[10px] transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>ABORT SPOOF // REVERT NOMINAL</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeploySpoofWithDuration(selectedDuration)}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black uppercase tracking-wider text-[11px] transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center space-x-2 group cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                      <span>DEPLOY HEAT SIGNATURE SPOOF [{selectedDuration}s]</span>
                    </button>
                  )}
                </div>

                {/* Hostile Threat Assessment Badge */}
                <div className="p-3.5 sm:p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center text-rose-400">
                      <Target className="w-3 h-3 mr-1" /> Target Hostile Recon Platform
                    </span>
                    <span className="font-mono text-slate-400">RECON PASS ACTIVE</span>
                  </div>
                  <div className="text-[11px] font-black text-white font-mono">
                    {matrixAnalysis.hostileSatName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800 text-[8.5px]">
                    <div>
                      <span className="block text-slate-500 font-bold uppercase">Seeker Focal Band</span>
                      <span className="text-slate-300 font-mono font-bold">{matrixAnalysis.hostileFocalBand}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-bold uppercase">Estimated Dwell</span>
                      <span className="text-amber-400 font-mono font-bold">{matrixAnalysis.baseDwellWindow}s pass window</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry Trend Graphs, Decision Profiles & AI Rationale */}
              <div className="lg:col-span-7 space-y-4">
                {/* Telemetry Trends Monitor */}
                <div className="p-4 sm:p-5 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                        Real-Time Telemetry Trend Buffer
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2.5 text-[8.5px] font-mono">
                      <span className="text-amber-400">
                        BUC dTemp/dt: {matrixAnalysis.tempSlope >= 0 ? '+' : ''}{matrixAnalysis.tempSlope.toFixed(2)}°C/s
                      </span>
                      <span className="text-cyan-400">
                        SNR: {matrixAnalysis.currentSnr.toFixed(1)} dB
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Visualizer */}
                  <div className="h-24 w-full bg-slate-950/80 rounded-xl border border-slate-900 p-2.5 relative flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-600">
                      <span>JUNCTION LIMIT: 85°C</span>
                      <span className="text-amber-500">TARGET SPOOF: 190°C</span>
                      <span>TIME (T-12s - NOW)</span>
                    </div>

                    {/* Bars visualizer */}
                    <div className="flex items-end justify-between gap-1 h-12 pt-1">
                      {telemetryHistory.map((pt, idx) => {
                        const tempHeight = Math.min(100, Math.max(15, (pt.bucTemp / 90) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-6 opacity-0 group-hover:opacity-100 bg-slate-900 text-white border border-slate-700 text-[7.5px] px-1 py-0.5 rounded font-mono pointer-events-none transition-opacity whitespace-nowrap z-20">
                              {pt.bucTemp.toFixed(1)}°C | {pt.snr.toFixed(1)}dB
                            </div>
                            <div
                              style={{ height: `${tempHeight}%` }}
                              className={`w-full rounded-t-sm transition-all duration-300 ${
                                activeDecoy
                                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                                  : pt.bucTemp > 65
                                  ? 'bg-rose-500'
                                  : 'bg-cyan-500/80'
                              }`}
                            />
                            <span className="text-[6.5px] text-slate-600 font-mono hidden md:block">{pt.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Rationale Engine */}
                <div className="p-3.5 sm:p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-400">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Decision Matrix Inference Rationale</span>
                  </div>
                  <div className="space-y-1.5">
                    {matrixAnalysis.rationaleBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[10px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selectable Tactical Spoof Profiles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                      <Sliders className="w-3 h-3 mr-1 text-amber-400" /> Tactical Spoof Profiles
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">Click to load profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matrixAnalysis.profiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => setSelectedDuration(profile.duration)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedDuration === profile.duration
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black uppercase tracking-wider">{profile.name}</span>
                          <span className="text-[11px] font-mono font-black text-amber-400">{profile.duration}s</span>
                        </div>
                        <p className="text-[8.5px] text-slate-400 leading-snug mb-2">
                          {profile.description}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 text-[7.5px] font-mono border-t border-white/5 pt-1.5">
                          <div>
                            <span className="text-slate-500 block">STRAIN:</span>
                            <span className="text-slate-300">{profile.strain}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">DECEPTION:</span>
                            <span className="text-emerald-400">{profile.deceptionRating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orbital Drift & Ephemeris Matrix Analysis Card */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-500 space-y-3 ${
                  isDriftExceeded 
                    ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : 'bg-slate-900/50 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2">
                      <Compass className={`w-3.5 h-3.5 ${isDriftExceeded ? 'text-red-400 animate-spin' : 'text-cyan-400'}`} />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                        AI Orbital Drift & Ephemeris Vector Matrix
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[7.5px] font-black font-mono border ${
                      isDriftExceeded 
                        ? 'bg-red-600/30 text-red-300 border-red-500 animate-pulse' 
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isDriftExceeded ? 'DRIFT EXCEEDED (> 0.05 u)' : 'EPHEMERIS NOMINAL (< 0.05 u)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[7.5px] uppercase">Measured Drift</span>
                      <span className={`font-black text-xs ${isDriftExceeded ? 'text-red-400' : 'text-cyan-300'}`}>
                        +{currentDrift.toFixed(4)} u
                      </span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[7.5px] uppercase">Threshold</span>
                      <span className="font-bold text-amber-400 text-xs">0.050 u</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[7.5px] uppercase">Pointing Skew</span>
                      <span className="font-bold text-slate-200 text-xs">+{ (currentDrift * 0.95).toFixed(3) }°</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[7.5px] uppercase">Attenuation</span>
                      <span className={`font-bold text-xs ${isDriftExceeded ? 'text-rose-400' : 'text-slate-400'}`}>
                        -{ (currentDrift * 36).toFixed(1) } dB
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                    <span className="text-[8.5px] text-slate-400 font-mono">
                      {isDriftExceeded 
                        ? '⚠️ Sentinel AI Directive: Orbital drift exceeds 0.05 units. Prompting operator to re-sync tracking coordinates via Tactical HUD.'
                        : '✓ Tracking lock verified. Antenna gimbal coordinates align with orbital ephemeris.'}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleSimulateDriftFromAI(0.065)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-[7.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        title="Simulate orbital drift exceeding 0.05 units"
                      >
                        Simulate Drift (+0.065u)
                      </button>
                      <button
                        onClick={handleResyncFromAI}
                        className="px-3 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 text-[7.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Re-Sync Ephemeris
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: AUTONOMOUS OVERWATCH (GLOBAL MESH & CRYPTO) */}
      {/* ============================================================ */}
      {activeTab === 'overwatch' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40 relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-3">
                <Network className="w-5 h-5 text-cyan-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Intelligence Mesh</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setLogs(prev => [...prev, '[INFO] Refreshing global intelligence vectors...'])}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-500/20"
                >
                  LIVE_FEED
                </button>
                <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700">
                  WORLD_WIDE_MAP
                </button>
              </div>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px]"></div>
                
                <div className="relative scale-110">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="w-48 h-48 rounded-full border border-cyan-500/20 border-dashed relative"
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="absolute inset-4 rounded-full border border-white/5" style={{ transform: `scale(${1 - i*0.2})` }}></div>
                    ))}
                    
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-1/2 left-1/2 w-[96px] h-[1px] bg-gradient-to-r from-transparent to-cyan-500 origin-left"
                    />
                  </motion.div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-slate-950 rounded-2xl border border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                      <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{ 
                          left: `${50 + Math.cos(i * 90) * 40}%`, 
                          top: `${50 + Math.sin(i * 90) * 40}%` 
                        }}
                        className="absolute w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">World-Wide Deployment Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { region: 'North America', status: 'SYNCHRONIZED', val: 100 },
                      { region: 'Eurasia', status: 'DEPLOYING', val: 84 },
                      { region: 'Pacific Rim', status: 'DEPLOYING', val: 72 },
                      { region: 'Orbital Mesh', status: 'ACTIVE', val: 99 },
                    ].map((region, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">{region.region}</span>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black ${region.val === 100 ? 'text-emerald-500' : 'text-cyan-400'} italic`}>{region.status}</span>
                          <span className="text-[9px] font-mono text-slate-400">{region.val}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                    <Shield className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Production Build Verified</span>
                  </div>
                  <p className="text-[8px] text-slate-500 font-bold leading-tight">
                    ENGINE: Vite v6.2.0 / ENVIRONMENT: Production-Hardened. Deployment integrity hash: 8f2a...1e9c
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5">
              {[
                { label: 'Interceptions', value: interceptions.toLocaleString(), icon: <Radio className="w-4 h-4 text-cyan-500" /> },
                { label: 'Deflected Attacks', value: deflectedAttacks.toLocaleString(), icon: <Shield className="w-4 h-4 text-emerald-500" /> },
                { label: 'Threats Detected', value: threatsDetected.toString().padStart(2, '0'), icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
                { label: 'Nodes Syncing', value: nodesSyncing.toString(), icon: <RefreshCw className="w-4 h-4 text-amber-500" /> },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-lg font-black text-white italic pl-6">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Workflow className="w-4 h-4 mr-2 text-cyan-500" /> Logic Flow Audit
                </h3>
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded text-[8px] font-black uppercase">Active</span>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black font-mono">
                  <span className="text-slate-500">Mojo_Serialization_Audit</span>
                  <span className="text-emerald-500">PASSED</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-emerald-500 w-full" />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black font-mono">
                  <span className="text-slate-500">V8_JIT_Sandbox_Verifier</span>
                  <span className="text-emerald-500">OPTIMIZED</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-rose-500" /> Crypto Integrity
                </h3>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[8px] font-black uppercase">Monitored</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                  <span className="block text-[8px] font-black text-slate-600 uppercase mb-1">Kyber_1024</span>
                  <span className="text-[10px] font-black text-white italic tracking-tighter">SECURE</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-rose-500 border-rose-500/30">
                  <span className="block text-[8px] font-black text-rose-700 uppercase mb-1">RSA_2048</span>
                  <span className="text-[10px] font-black italic tracking-tighter">DEPRECATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: CORE SYSLOG & INTERCEPTION MESH */}
      {/* ============================================================ */}
      {activeTab === 'syslog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-8 glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Terminal className="w-5 h-5 text-cyan-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Core Syslog & Decision Inferences</h3>
              </div>
              {logs.length > 0 && (
                <button 
                  onClick={handleExportSyslog}
                  className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  Export_Syslog
                </button>
              )}
            </div>

            <div className="flex-grow bg-slate-950 rounded-3xl border border-slate-900 p-6 font-mono text-[10px] text-slate-500 space-y-2 overflow-y-auto max-h-[460px] custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3">
                  <span className="text-slate-800">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={
                    (log || '').includes('[AI-MATRIX]') || (log || '').includes('[DECOY-AI]')
                      ? 'text-amber-400 font-bold'
                      : (log || '').includes('[Z-DAY]') || (log || '').includes('[ISR-PASS]')
                      ? 'text-rose-500 font-bold'
                      : (log || '').includes('[SCAN]')
                      ? 'text-cyan-400'
                      : ''
                  }>
                    {log}
                  </span>
                </div>
              ))}
              <div className="animate-pulse flex items-center space-x-1">
                <div className="w-2 h-3 bg-cyan-500"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 glass p-8 rounded-[48px] border-slate-800 bg-slate-950/40 space-y-4">
            <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3 text-rose-500">
                <Radio className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Interception Mesh</h3>
              </div>
              <span className="text-[8px] font-black text-emerald-400 uppercase">3 ACTIVE</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Starlink_G3', strength: '88', status: 'ACTIVE' },
                { name: 'Iridium_Next', strength: '42', status: 'LOCKED' },
                { name: 'Inmarsat_GX', strength: '95', status: 'ACTIVE' },
              ].map((net, i) => (
                <div key={i} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] font-black text-white italic uppercase tracking-tighter">{net.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Signal: {net.strength}%</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                    net.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {net.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer System Status */}
      <footer className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <Database className="w-3 h-3 mr-2" /> Central Records: SYNCHRONIZED
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-2" /> AI Decision Matrix: READY
          </span>
        </div>
        <div className="text-cyan-500 italic">
          Sentinel Core v6.0.4 // Autonomous Decoy & Defense Protocol
        </div>
      </footer>
    </div>
  );
};
