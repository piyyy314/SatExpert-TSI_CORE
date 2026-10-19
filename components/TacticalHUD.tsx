
import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Coordinates, Satellite, SatelliteStatus, WeatherCondition, TacticalEvent, BugReportEvent } from '../types';
import { fetchSatelliteStatusUpdates } from '../services/satelliteService';
import { audioController } from '../services/audioService';
import { generateBugReportPDF, generateSecureEventLogPDF, exportEventLogsAsText } from '../services/pdfService';
import { Flame, AlertTriangle, RefreshCw, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  loc: Coordinates;
  sat: Satellite;
  satellites: Satellite[];
  onLocChange: (loc: Coordinates) => void;
  onSatChange: (sat: Satellite) => void;
  onSatellitesUpdate: (sats: Satellite[]) => void;
  isTracking?: boolean;
  onTrackingChange?: (val: boolean) => void;
  isJamming: boolean;
  setIsJamming: (val: boolean) => void;
  isDecoyActive: boolean;
  setIsDecoyActive: (val: boolean) => void;
  isZPEActive: boolean;
  setIsZPEActive: (val: boolean) => void;
  jammingPower: number;
  setJammingPower: (val: number) => void;
  weather: WeatherCondition;
  setWeather: (val: WeatherCondition) => void;
  isStealthMode: boolean;
  telemetry: any;
  eventLogs: TacticalEvent[];
  setEventLogs: React.Dispatch<React.SetStateAction<TacticalEvent[]>>;
  hasNewLogs: boolean;
  setHasNewLogs: (val: boolean) => void;
  isThermalDecoyActive?: boolean;
  thermalDecoySecondsRemaining?: number;
  onDeployThermalDecoy?: () => void;
  onCancelThermalDecoy?: () => void;
  orbitalDrift?: number;
  isDriftAlert?: boolean;
  onResyncTracking?: () => void;
  onSimulateDrift?: (delta?: number) => void;
  syncedLongitude?: number;
  defcon?: number;
}

const StatusBadge: React.FC<{ status?: SatelliteStatus | string }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-500', label: 'ONLINE', pulse: true },
    offline: { color: 'bg-red-500', label: 'OFFLINE', pulse: false },
    maintenance: { color: 'bg-amber-500', label: 'MAINT', pulse: true },
    decommissioned: { color: 'bg-slate-600', label: 'EOL', pulse: false },
    CRITICAL: { color: 'bg-red-600', label: 'ALERT', pulse: true },
    BREACH: { color: 'bg-red-800', label: 'BREACH', pulse: true },
  }[status || 'active'] || { color: 'bg-slate-500', label: 'UNKNOWN', pulse: false };

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'status-pulse' : ''}`}></div>
      <span className={`text-[9px] font-bold tracking-widest ${(config.color || '').replace('bg-', 'text-')}`}>
        {config.label}
      </span>
    </div>
  );
};

export const TacticalHUD: React.FC<Props> = ({ 
  loc, sat, satellites, onLocChange, onSatChange, onSatellitesUpdate, isTracking, onTrackingChange,
  isJamming, setIsJamming, isDecoyActive, setIsDecoyActive, isZPEActive, setIsZPEActive,
  jammingPower, setJammingPower,
  weather, setWeather, isStealthMode, telemetry,
  eventLogs, setEventLogs, hasNewLogs, setHasNewLogs,
  isThermalDecoyActive, thermalDecoySecondsRemaining,
  onDeployThermalDecoy, onCancelThermalDecoy,
  orbitalDrift, isDriftAlert, onResyncTracking, onSimulateDrift, syncedLongitude,
  defcon = 5
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [animateLabel, setAnimateLabel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // DEFCON state change micro-animation & sound trigger
  const [isDefconFlashing, setIsDefconFlashing] = useState<boolean>(false);
  const prevDefconRef = useRef<number>(defcon);

  useEffect(() => {
    if (prevDefconRef.current !== defcon) {
      setIsDefconFlashing(true);
      try {
        if (defcon <= 2) {
          audioController.playAlert();
        } else {
          audioController.playChirp();
        }
      } catch (e) {}
      const timer = setTimeout(() => setIsDefconFlashing(false), 850);
      prevDefconRef.current = defcon;
      return () => clearTimeout(timer);
    }
  }, [defcon]);

  const defconTheme = useMemo(() => {
    switch (defcon) {
      case 1:
        return {
          level: 1,
          label: 'DEFCON 1 // COCKED PISTOL',
          subtext: 'MAXIMUM READINESS // NUCLEAR & ORBITAL THREAT IMMINENT',
          border: 'border-red-500/80',
          glow: 'shadow-[0_0_50px_rgba(239,68,68,0.35)]',
          accentBg: 'bg-red-950/60',
          accentText: 'text-red-400',
          accentBorder: 'border-red-500/60',
          glowColorVar: 'rgba(239, 68, 68, 0.55)',
          badgeColor: 'bg-red-600 text-white',
          pulse: true,
        };
      case 2:
        return {
          level: 2,
          label: 'DEFCON 2 // FAST PACE',
          subtext: 'ARMED FORCES DEPLOYMENT ARMED // TACTICAL STRIKE POSTURE',
          border: 'border-amber-500/70',
          glow: 'shadow-[0_0_40px_rgba(245,158,11,0.25)]',
          accentBg: 'bg-amber-950/50',
          accentText: 'text-amber-400',
          accentBorder: 'border-amber-500/50',
          glowColorVar: 'rgba(245, 158, 11, 0.45)',
          badgeColor: 'bg-amber-500 text-slate-950',
          pulse: true,
        };
      case 3:
        return {
          level: 3,
          label: 'DEFCON 3 // ROUND HOUSE',
          subtext: 'AIR FORCE READY TO MOBILIZE IN 15 MINUTES',
          border: 'border-yellow-500/50',
          glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
          accentBg: 'bg-yellow-950/40',
          accentText: 'text-yellow-400',
          accentBorder: 'border-yellow-500/40',
          glowColorVar: 'rgba(234, 179, 8, 0.35)',
          badgeColor: 'bg-yellow-500 text-slate-950',
          pulse: false,
        };
      case 4:
        return {
          level: 4,
          label: 'DEFCON 4 // DOUBLE TAKE',
          subtext: 'INTELLIGENCE WATCH & ENHANCED SURVEILLANCE',
          border: 'border-cyan-500/40',
          glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
          accentBg: 'bg-cyan-950/40',
          accentText: 'text-cyan-400',
          accentBorder: 'border-cyan-500/30',
          glowColorVar: 'rgba(6, 182, 212, 0.35)',
          badgeColor: 'bg-cyan-600 text-white',
          pulse: false,
        };
      case 5:
      default:
        return {
          level: 5,
          label: 'DEFCON 5 // FADE OUT',
          subtext: 'NORMAL PEACETIME READINESS // NOMINAL PATROL',
          border: 'border-slate-800',
          glow: 'shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
          accentBg: 'bg-black/40',
          accentText: 'text-emerald-400',
          accentBorder: 'border-slate-900',
          glowColorVar: 'rgba(16, 185, 129, 0.25)',
          badgeColor: 'bg-emerald-600 text-white',
          pulse: false,
        };
    }
  }, [defcon]);

  // Thermal Decoy local fallback state
  const [internalThermalDecoy, setInternalThermalDecoy] = useState(false);
  const [internalCountdown, setInternalCountdown] = useState(0);

  // Orbital Drift Tracking State & Local Fallbacks
  const [internalSyncedLongitude, setInternalSyncedLongitude] = useState<number>(sat.longitude);
  const [internalDriftOffset, setInternalDriftOffset] = useState<number>(0);
  const [isSyncingCoordinates, setIsSyncingCoordinates] = useState<boolean>(false);
  const [syncConfirmation, setSyncConfirmation] = useState<string | null>(null);

  // Keep internal synced slot in sync if sat changes
  useEffect(() => {
    setInternalSyncedLongitude(sat.longitude);
    setInternalDriftOffset(0);
  }, [sat.id]);

  const activeSyncedLongitude = syncedLongitude ?? internalSyncedLongitude;
  const currentDriftValue = orbitalDrift !== undefined 
    ? orbitalDrift 
    : Math.round(Math.abs(sat.longitude + internalDriftOffset - activeSyncedLongitude) * 1000) / 1000;
  
  const isDriftExceeded = isDriftAlert !== undefined 
    ? isDriftAlert 
    : currentDriftValue > 0.05;

  const handleResyncTracking = () => {
    setIsSyncingCoordinates(true);
    try {
      audioController.playChirp();
    } catch (e) {}

    setTimeout(() => {
      if (onResyncTracking) {
        onResyncTracking();
      } else {
        setInternalSyncedLongitude(sat.longitude);
        setInternalDriftOffset(0);
        if (onTrackingChange) onTrackingChange(true);
      }

      setIsSyncingCoordinates(false);
      setSyncConfirmation(`COORDINATES RE-SYNCHRONIZED // DRIFT CALIBRATED: 0.000 u`);
      setTimeout(() => setSyncConfirmation(null), 4000);

      // Log SITREP event
      setEventLogs(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        satName: sat.name,
        satId: sat.id,
        status: 'active',
        detail: `ORBITAL_EPHEMERIS_RESYNC: Antenna tracking coordinates calibrated to ${sat.name} (${sat.orbitalSlot}). Ephemeris drift cleared from ${currentDriftValue.toFixed(3)} units to 0.000 units.`
      }, ...prev].slice(0, 50));
      setHasNewLogs(true);
    }, 600);
  };

  const handleTriggerSimulateDrift = (delta: number = 0.065) => {
    if (onSimulateDrift) {
      onSimulateDrift(delta);
    } else {
      setInternalDriftOffset(prev => prev + delta);
      try {
        audioController.playAlert();
      } catch (e) {}
    }
    setEventLogs(prev => [{
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      satName: sat.name,
      satId: sat.id,
      status: 'CRITICAL',
      detail: `DRIFT_PERTURBATION: Simulated orbital drift (+${delta.toFixed(3)} units) applied to ${sat.name}. Tolerance exceeded (>0.05 units).`
    }, ...prev].slice(0, 50));
    setHasNewLogs(true);
  };

  const activeThermalDecoy = isThermalDecoyActive ?? internalThermalDecoy;
  const activeCountdown = thermalDecoySecondsRemaining ?? internalCountdown;

  useEffect(() => {
    if (isThermalDecoyActive !== undefined) return;
    if (!internalThermalDecoy) return;
    const interval = setInterval(() => {
      setInternalCountdown(prev => {
        if (prev <= 1) {
          setInternalThermalDecoy(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [internalThermalDecoy, isThermalDecoyActive]);

  const toggleThermalDecoy = () => {
    if (activeThermalDecoy) {
      if (onCancelThermalDecoy) {
        onCancelThermalDecoy();
      } else {
        setInternalThermalDecoy(false);
        setInternalCountdown(0);
      }
    } else {
      if (onDeployThermalDecoy) {
        onDeployThermalDecoy();
      } else {
        setInternalThermalDecoy(true);
        setInternalCountdown(30);
        try {
          audioController.playAlert();
        } catch (e) {}
        setEventLogs(prev => [{
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          satName: sat.name,
          satId: sat.id,
          status: 'STRIKE',
          detail: 'THERMAL DECOY DEPLOYED: BUC Heat Signature Spoof active for 30s. Hostile ISR blinded with phantom thermal bloom.'
        }, ...prev]);
        setHasNewLogs(true);
      }
    }
  };

  const toggleDecoy = () => {
    setIsDecoyActive(!isDecoyActive);
    if (!isDecoyActive) {
      console.log(`[!] DEPLOYING SUB-SPACE DECOYS FOR ${sat.name}`);
      audioController.playAlert();
    }
  };

  const toggleZPE = () => {
    setIsZPEActive(!isZPEActive);
    if (!isZPEActive) {
      audioController.playChirp();
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevSatRef = useRef<{id: string, status?: SatelliteStatus} | null>(null);

  const filteredSatellites = useMemo(() => {
    return satellites.filter(s => 
      (s.name || '')?.toLowerCase()?.includes(searchQuery.toLowerCase()) || 
      (s.orbitalSlot || '')?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, satellites]);

  useEffect(() => {
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const updatedSatellites = await fetchSatelliteStatusUpdates();
        if (isMounted) {
          onSatellitesUpdate(updatedSatellites);
        }
      } catch (err) {
        console.warn("Satellite status poll error:", err);
      }
    }, 6000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [onSatellitesUpdate]);

  useEffect(() => {
    setAnimateLabel(true);
    const timer = setTimeout(() => setAnimateLabel(false), 600);

    if (prevSatRef.current === null) {
      prevSatRef.current = { id: sat.id, status: sat.status };
      return;
    }

    const isSameSat = prevSatRef.current?.id === sat.id;
    const isStatusChanged = prevSatRef.current?.status !== sat.status;

    if (!isSameSat || (isSameSat && isStatusChanged)) {
      audioController.playChirp();
      const newEvent: TacticalEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        satName: sat.name,
        satId: sat.id,
        status: sat.status || 'active',
        detail: !isSameSat 
          ? `ASSET_ACQUISITION: Targeted ${sat.name} (${sat.orbitalSlot})`
          : `STATUS_CHANGE: Asset ${sat.name} transitioned to ${sat.status?.toUpperCase()}`
      };
      setEventLogs(prev => [newEvent, ...prev].slice(0, 50));
      if (!showEventLog) setHasNewLogs(true);
    }

    prevSatRef.current = { id: sat.id, status: sat.status };
    return () => clearTimeout(timer);
  }, [sat.id, sat.status, showEventLog, setEventLogs, setHasNewLogs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (s: Satellite) => {
    onSatChange(s);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleAcknowledge = () => {
    setIsAcknowledging(true);
    setTimeout(() => {
      setShowEventLog(false);
      setIsAcknowledging(false);
    }, 800);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Ensure we take only the latest 10 logs relevant to THIS satellite
    const relevantLogs = eventLogs
      .filter(log => log.satId === sat.id)
      .slice(0, 10);

    const exportData = {
      mission_timestamp: new Date().toISOString(),
      mission_context: {
        stealth_mode_active: isStealthMode,
        electronic_warfare: {
          jamming_active: isJamming,
          jamming_intensity: `${jammingPower}%`,
          protocol: "Continuous Wave Overlay"
        },
        environment: {
          weather_condition: weather,
          rain_fade_estimate: weather === 'CLEAR' ? '0.5dB' : weather === 'OVERCAST' ? '2.0dB' : '8.0dB+'
        }
      },
      asset_specifications: {
        id: sat.id,
        name: sat.name,
        orbital_slot: sat.orbitalSlot,
        operator: sat.operator,
        current_status: sat.status
      },
      live_telemetry: {
        snr_margin: `${telemetry.snr} dB`,
        rx_power: `${telemetry.rxPower} dBm`,
        buc_temp: `${telemetry.bucTemp} °C`,
        packet_loss_rate: `${telemetry.packetLoss}%`,
        link_state: telemetry.status
      },
      ground_station: {
        coordinates: loc,
        datum: "WGS84"
      },
      tactical_event_log: relevantLogs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TSI_MISSION_BRIEF_${(sat.name || 'ASSET').replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleExportSecurePDF = () => {
    setIsExporting(true);
    audioController.playChirp();
    const meta = {
      satName: sat.name,
      satId: sat.id,
      orbitalSlot: sat.orbitalSlot,
      defcon: satellites.some(s => s.status === 'offline') ? 2 : 4,
      loc,
      operator: 'SENTINEL_OPERATOR',
      telemetry,
      stealthMode: isStealthMode
    };
    generateSecureEventLogPDF(eventLogs, meta);
    setTimeout(() => setIsExporting(false), 1500);
  };

  const handleExportTXT = () => {
    setIsExporting(true);
    audioController.playChirp();
    const meta = {
      satName: sat.name,
      satId: sat.id,
      orbitalSlot: sat.orbitalSlot,
      defcon: satellites.some(s => s.status === 'offline') ? 2 : 4,
      loc,
      operator: 'SENTINEL_OPERATOR',
      telemetry,
      stealthMode: isStealthMode
    };
    exportEventLogsAsText(eventLogs, meta);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleBugReport = () => {
    setIsExporting(true);
    
    // Map tactical events to the format expected by the PDF generator
    const mappedEvents: BugReportEvent[] = eventLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      team: (e.status === 'CRITICAL' || e.status === 'BREACH' || e.status === 'STRIKE' ? 'RED' : 'SYSTEM') as 'RED' | 'SYSTEM',
      action: `${e.satName}: ${e.detail}`,
      type: (e.status === 'BREACH' || e.status === 'STRIKE') ? 'ATTACK' : 'ANOMALY'
    }));

    const systemInfo = {
      defcon: satellites.some(s => s.status === 'offline') ? 2 : 4, // Pseudo logic for doc
      bucTemp: telemetry.bucTemp,
      packetLoss: telemetry.packetLoss,
      snr: telemetry.snr
    };

    generateBugReportPDF(mappedEvents, systemInfo);
    
    setTimeout(() => setIsExporting(false), 1500);
  };

  const weatherIcons = {
    CLEAR: '☀️',
    OVERCAST: '☁️',
    LIGHT_RAIN: '🌧️',
    HEAVY_STORM: '⛈️'
  };

  return (
    <div 
      className={`glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border relative z-50 overflow-hidden group/hud hud-panel transition-all duration-700 ease-out ${
        isDefconFlashing ? 'animate-defcon-shift' : ''
      } ${
        isDriftExceeded 
          ? 'border-red-500/90 shadow-[0_0_40px_rgba(239,68,68,0.35)]' 
          : activeThermalDecoy
          ? 'border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
          : `${defconTheme.border} ${defconTheme.glow}`
      }`}
      style={{
        '--defcon-glow-color': defconTheme.glowColorVar,
      } as React.CSSProperties}
    >
      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover/hud:opacity-10 transition-opacity">
         <div className="w-16 h-16 border-t-2 border-r-2 border-red-600/40 rounded-tr-2xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 p-3 opacity-5 pointer-events-none group-hover/hud:opacity-10 transition-opacity">
         <div className="w-16 h-16 border-b-2 border-l-2 border-red-600/40 rounded-bl-2xl"></div>
      </div>
      
      {/* Dynamic DEFCON Status Strip & Micro-Animation Pip Bar */}
      <div className={`-mt-1 mb-3.5 p-2 px-3 rounded-xl border flex items-center justify-between text-[9px] font-mono hud-panel transition-all duration-500 ${defconTheme.accentBg} ${defconTheme.accentBorder}`}>
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${defcon <= 2 ? 'bg-red-500 animate-ping' : defconTheme.badgeColor.split(' ')[0]}`} />
            {defconTheme.pulse && (
              <div className="absolute w-4 h-4 rounded-full border border-red-500/60 animate-ping pointer-events-none" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-black uppercase tracking-wider ${defconTheme.accentText} flex items-center gap-1.5`}>
              <span>{defconTheme.label}</span>
              {isDefconFlashing && (
                <span className="text-[7.5px] px-1.5 py-0.2 bg-white/20 rounded font-black text-white animate-pulse">
                  SHIFT TRIGGERED
                </span>
              )}
            </span>
            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest leading-none hidden sm:inline">
              {defconTheme.subtext}
            </span>
          </div>
        </div>

        {/* DEFCON Level Pips with smooth transitions */}
        <div className="flex items-center space-x-1 pl-2">
          {[5, 4, 3, 2, 1].map((lvl) => {
            const isActive = defcon <= lvl;
            const isCurrent = defcon === lvl;
            const pipColors: Record<number, string> = {
              5: 'bg-emerald-500 border-emerald-400',
              4: 'bg-cyan-500 border-cyan-400',
              3: 'bg-yellow-500 border-yellow-400',
              2: 'bg-amber-500 border-amber-400',
              1: 'bg-red-600 border-red-400',
            };
            return (
              <div
                key={lvl}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isCurrent ? 'scale-110' : 'scale-100'
                }`}
                title={`DEFCON ${lvl}`}
              >
                <div
                  className={`w-2.5 sm:w-3.5 h-1.5 rounded-sm border transition-all duration-500 ${
                    isActive
                      ? `${pipColors[lvl]} shadow-[0_0_8px_rgba(255,255,255,0.3)]`
                      : 'bg-slate-900/80 border-slate-800 opacity-40'
                  }`}
                />
                <span className={`text-[6.5px] font-black mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-700'}`}>
                  {lvl}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-3.5 sm:space-y-4 relative z-10">
        <div className="relative" ref={dropdownRef}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse"></div>
                 <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Target_Acquisition</label>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-4 italic opacity-60">Orbital_Asset_Lock_v8.0 // ACTIVE</p>
            </div>
            
            <button 
              onClick={() => { setShowEventLog(true); setHasNewLogs(false); }}
              className={`group flex items-center space-x-2.5 px-4 py-2 rounded-xl border transition-all duration-300 uppercase tracking-[0.2em] text-[9.5px] font-black italic shadow-lg active:scale-95 cursor-pointer ${
                hasNewLogs 
                  ? 'bg-red-600 border-white text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50'
              }`}
            >
              <div className="relative flex items-center justify-center">
                 <svg className={`w-4 h-4 transition-transform ${hasNewLogs ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 {hasNewLogs && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-red-600 animate-ping"></div>}
              </div>
              <span>Sitrep_Console</span>
            </button>
          </div>
          
          <div className="relative group/search">
            <input
              type="text"
              placeholder={isOpen ? "Scan_Asset_Registry..." : sat.name}
              className={`w-full bg-[#050810] border-2 ${isOpen ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-slate-800'} rounded-xl p-3 sm:p-3.5 pl-11 text-sm sm:text-base font-black text-white outline-none transition-all tracking-tight italic placeholder:text-slate-800 group-hover/search:border-slate-700 shadow-inner`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <svg className={`w-5 h-5 ${isOpen ? 'text-red-500' : 'text-slate-700 group-hover/search:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center bg-black/40 px-3 py-1 rounded-lg border border-slate-900 shadow-md">
               {!isOpen && <StatusBadge status={sat.status} />}
            </div>
          </div>

          {isOpen && (
            <div className="absolute mt-2 w-full glass bg-[#050810] border-2 border-red-500 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[260px] flex flex-col z-[100] animate-in slide-in-from-top-3 duration-200">
              <div className="bg-red-500/10 px-4 py-2 border-b border-slate-900 flex items-center justify-between">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.25em] italic">Authorized_Asset_Registry</span>
                <div className="flex space-x-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-red-500/40 animate-pulse" />)}
                </div>
              </div>
              <div className="overflow-y-auto py-1.5 scrollbar-hide">
                {filteredSatellites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-white/5 transition-all flex items-center justify-between border-b border-slate-900/50 last:border-none group/item cursor-pointer ${s.id === sat.id ? 'bg-red-500/5' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase italic tracking-tight transition-colors ${s.id === sat.id ? 'text-red-400' : 'text-slate-200 group-hover/item:text-red-400'}`}>{s.name}</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{s.operator}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] text-red-500 font-mono font-black italic tracking-tight">{s.orbitalSlot}</span>
                       <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${s.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 rounded-xl border border-slate-900 p-3 sm:p-3.5 flex flex-col shadow-inner group hover:border-red-500/20 transition-colors">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-1 italic">Authority_ID</span>
            <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight italic truncate">{sat.operator || 'UNSPECIFIED'}</span>
          </div>
          <div className="bg-black/40 rounded-xl border border-slate-900 p-3 sm:p-3.5 flex flex-col items-end text-right shadow-inner group hover:border-red-500/20 transition-colors">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-1 italic">Position_Node</span>
            <span className="text-[11px] font-black text-red-500 font-mono tracking-tight italic">{sat.orbitalSlot}</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VISUAL ALERT MECHANISM: AI DETECTED ORBITAL DRIFT (> 0.05)     */}
        {/* ============================================================== */}
        {isDriftExceeded && (
          <div className="relative overflow-hidden rounded-2xl border border-red-500 bg-gradient-to-br from-red-950/90 via-[#0d0407] to-amber-950/70 p-3.5 sm:p-4 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-in fade-in slide-in-from-top-3 zoom-in-[0.98] duration-500 ease-out hud-panel">
            {/* Top animated hazard stripes */}
            <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripes-animated" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 relative z-10 pt-1">
              <div className="flex items-start space-x-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-red-600/30 border border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] shrink-0 animate-critical-beacon">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[8px] uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                      AI CRITICAL ALERT // ORBITAL DRIFT DETECTED
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/60 border border-red-500/60 font-mono text-[9.5px] font-black text-amber-300">
                      DRIFT: +{currentDriftValue.toFixed(4)} u &gt; 0.050 LIMIT
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tight flex items-center gap-1.5">
                    <span>Ephemeris Desync on {sat.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                  </h4>
                  <p className="text-[10px] text-red-200/90 font-mono leading-relaxed max-w-2xl">
                    <strong className="text-white">AI SENTINEL DIRECTIVE:</strong> Tracking gimbal pointing error exceeds allowable 0.05 tolerance (+{currentDriftValue.toFixed(4)} units). Prompting operator to re-sync tracking coordinates immediately.
                  </p>
                </div>
              </div>

              {/* Operator Action Re-Sync Button with micro-interaction */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
                <button
                  onClick={handleResyncTracking}
                  disabled={isSyncingCoordinates}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-white hover:to-white text-white hover:text-red-950 font-black text-[9.5px] uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-400/80 transition-all duration-300 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer group/sync"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white group-hover/sync:text-red-950 ${isSyncingCoordinates ? 'animate-spin' : 'group-hover/sync:rotate-180 transition-transform duration-500'}`} />
                  <span className="italic">{isSyncingCoordinates ? 'CALIBRATING GIMBAL...' : 'RE-SYNC COORDINATES'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Metrics Matrix */}
            <div className="mt-3 pt-2.5 border-t border-red-900/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono">
              <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-red-900/60 transition-colors duration-300 hover:border-red-500/80">
                <span className="text-slate-400 block text-[7.5px] uppercase tracking-wider">Ephemeris Lock</span>
                <span className="text-slate-200 font-bold text-xs">{activeSyncedLongitude.toFixed(3)}°</span>
              </div>
              <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-red-900/60 transition-colors duration-300 hover:border-red-500/80">
                <span className="text-slate-400 block text-[7.5px] uppercase tracking-wider">Detected Position</span>
                <span className="text-amber-400 font-bold text-xs">{(sat.longitude + internalDriftOffset).toFixed(3)}°</span>
              </div>
              <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-red-900/60 transition-colors duration-300 hover:border-red-500/80">
                <span className="text-slate-400 block text-[7.5px] uppercase tracking-wider">Pointing Offset Skew</span>
                <span className="text-red-400 font-black text-xs">+{currentDriftValue.toFixed(4)} u</span>
              </div>
              <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-red-900/60 transition-colors duration-300 hover:border-red-500/80">
                <span className="text-slate-400 block text-[7.5px] uppercase tracking-wider">Attenuation</span>
                <span className="text-red-400 font-black text-xs">-{ (currentDriftValue * 36).toFixed(1) } dB</span>
              </div>
            </div>
          </div>
        )}

        {/* Temporary Re-sync confirmation banner */}
        {syncConfirmation && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-in fade-in duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider font-mono">{syncConfirmation}</span>
            </div>
            <span className="text-[8px] font-mono text-emerald-400/80 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/40">LOCK: 100%</span>
          </div>
        )}

        {/* Satellite Tracking Coordinates & Ephemeris Telemetry Console */}
        <div className="bg-black/40 rounded-xl border border-slate-900 p-3 sm:p-3.5 space-y-2.5 shadow-inner group hover:border-slate-800 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className={`p-1.5 rounded-lg border ${isDriftExceeded ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-cyan-400'}`}>
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500 block italic">Satellite_Tracking_Coordinates</span>
                <span className="text-[10px] font-mono font-bold text-white">
                  Ground: {loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E // Ephemeris Slot: {sat.orbitalSlot}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-wider border font-mono ${
                isDriftExceeded 
                  ? 'bg-red-600/20 text-red-400 border-red-500 animate-pulse' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
              }`}>
                {isDriftExceeded ? `⚠️ DRIFT ALERT (+${currentDriftValue.toFixed(3)} u)` : `✓ LOCK NOMINAL (Drift: ${currentDriftValue.toFixed(3)} u)`}
              </span>
            </div>
          </div>

          {/* Drift Tolerance Gauge Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[8px] font-mono uppercase text-slate-500">
              <span>Orbital Drift: <strong className={isDriftExceeded ? 'text-red-400' : 'text-slate-300'}>{currentDriftValue.toFixed(4)} units</strong></span>
              <span className="text-amber-500 font-bold">Alert Threshold: 0.050 units</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isDriftExceeded 
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]' 
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (currentDriftValue / 0.08) * 100)}%` }}
              />
            </div>
          </div>

          {/* Controls: Re-Sync Coordinates & Simulate Drift Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900/60">
            <span className="text-[8px] text-slate-600 font-mono">
              Calibrated Lock: {activeSyncedLongitude.toFixed(3)}° | Live: {(sat.longitude + internalDriftOffset).toFixed(3)}°
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTriggerSimulateDrift(0.065)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/60 text-slate-400 hover:text-amber-300 text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Induce simulated orbital drift perturbation of +0.065 units to test the > 0.05 threshold alert"
              >
                Simulate Drift (+0.065u)
              </button>
              <button
                onClick={handleResyncTracking}
                disabled={isSyncingCoordinates}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-500 border border-cyan-500/40 text-cyan-300 hover:text-slate-950 text-[8px] font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingCoordinates ? 'animate-spin' : ''}`} />
                <span>{isSyncingCoordinates ? 'Syncing...' : 'Re-Sync Coordinates'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time BUC Temperature Sensor Telemetry Monitor */}
        <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-between shadow-inner ${
          activeThermalDecoy 
            ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
            : 'bg-black/40 border-slate-900 group hover:border-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg border transition-colors ${activeThermalDecoy ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <Flame className={`w-3.5 h-3.5 ${activeThermalDecoy ? 'animate-bounce text-amber-400' : ''}`} />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500 block italic">BUC_Transponder_Temp</span>
              <span className={`text-[11px] font-mono font-black italic tracking-tight ${activeThermalDecoy ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                {telemetry.bucTemp} °C {activeThermalDecoy ? '⚡ [SPOOF BLOOM]' : '[NOMINAL]'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all ${
              activeThermalDecoy 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {activeThermalDecoy ? 'ISR_DECOY_SPOOF' : 'TELEMETRY_LOCK'}
            </span>
          </div>
        </div>

        <div className="bg-black/40 rounded-xl border border-slate-900 p-3.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between px-1">
             <span className="text-[9px] font-black text-white uppercase tracking-[0.25em] italic">Atmospheric_Interference_Sim</span>
             <div className="flex items-center space-x-1.5">
                <div className="w-1 h-2 bg-red-500/20 rounded-full" />
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-wider italic">Ka-Band_v8.0</span>
             </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['CLEAR', 'OVERCAST', 'LIGHT_RAIN', 'HEAVY_STORM'] as WeatherCondition[]).map((cond) => (
              <button 
                key={cond}
                onClick={() => setWeather(cond)}
                disabled={isStealthMode}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-md cursor-pointer ${
                  isStealthMode ? 'opacity-30 cursor-not-allowed' : ''
                } ${
                  weather === cond 
                    ? 'bg-red-500/10 border-red-500/60 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                    : 'bg-slate-950/80 border-slate-900 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                }`}
              >
                <span className="text-lg mb-1">{weatherIcons[cond]}</span>
                <span className="text-[7.5px] font-black uppercase tracking-wider text-center leading-none">{(cond || '').replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-xl border p-3.5 space-y-3 transition-all duration-500 shadow-xl relative overflow-hidden group/ew ${isStealthMode ? 'bg-cyan-900/10 border-cyan-500/30' : (isJamming || isDecoyActive || activeThermalDecoy ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-950/60 border-slate-900')}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 px-1 gap-2.5">
            <div className="flex flex-col space-y-0.5">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${isStealthMode ? 'text-cyan-400' : (isJamming || isDecoyActive || activeThermalDecoy ? 'text-amber-500' : 'text-white')}`}>Electronic_Warfare</span>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider italic leading-none">Protocol: Aether_Strike // EW-DECOY</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <button 
                onClick={() => setIsJamming(!isJamming)}
                disabled={isStealthMode}
                className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 italic border cursor-pointer ${
                  isStealthMode 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-800 cursor-not-allowed' 
                    : (isJamming 
                        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
                      )
                }`}
              >
                Jamming
              </button>
              <button 
                onClick={toggleDecoy}
                disabled={isStealthMode}
                className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 italic border cursor-pointer ${
                  isStealthMode 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-800 cursor-not-allowed' 
                    : (isDecoyActive 
                        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
                      )
                }`}
              >
                Aether_Decoy
              </button>
              <button 
                onClick={toggleThermalDecoy}
                disabled={isStealthMode}
                className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 italic border flex items-center space-x-1 cursor-pointer ${
                  isStealthMode 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-800 cursor-not-allowed' 
                    : (activeThermalDecoy 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-300 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse' 
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-400 hover:bg-amber-600 hover:text-white hover:border-amber-400'
                      )
                }`}
                title={activeThermalDecoy ? "Click to abort Thermal Decoy" : "Deploy Thermal Decoy"}
              >
                <Flame className={`w-3 h-3 ${activeThermalDecoy ? 'text-white animate-bounce' : 'text-amber-400'}`} />
                <span>{activeThermalDecoy ? `Spoof [${activeCountdown}s]` : 'Thermal_Decoy'}</span>
              </button>
            </div>
          </div>

          {/* 30-Second Heat Signature Spoof Active Mode Telemetry Banner */}
          {activeThermalDecoy && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-3 zoom-in-[0.98] duration-500 ease-out relative z-10 space-y-3 hud-panel">
              <div className="bg-gradient-to-r from-amber-950/70 to-orange-950/70 border-2 border-amber-500/60 p-5 rounded-[2rem] space-y-3.5 shadow-[0_0_35px_rgba(245,158,11,0.3)] relative overflow-hidden">
                {/* Top animated amber hazard stripes */}
                <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripes-amber" />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                    <div>
                      <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest italic block leading-tight">
                        HEAT SIGNATURE SPOOF ACTIVE // 30-SEC ISR DECEPTION
                      </span>
                      <span className="text-[8px] text-amber-200/70 font-mono uppercase font-bold">
                        HOSTILE SATELLITE INFRARED SENSORS BLINDED BY SYNTHETIC THERMAL FLARE
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black text-white bg-black/60 px-3 py-1 rounded-xl border border-amber-500/40">
                      T-{activeCountdown}s
                    </span>
                    <button
                      onClick={toggleThermalDecoy}
                      className="px-2.5 py-1 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-700 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      ABORT
                    </button>
                  </div>
                </div>

                {/* Animated 30-second countdown bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-amber-900/60">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                      style={{ width: `${Math.max(0, (activeCountdown / 30) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[7.5px] font-mono text-amber-400/80 uppercase">
                    <span>THERMAL FLARE BLOOM INJECTED</span>
                    <span>AUTO-EXPIRY IN {activeCountdown} SECONDS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-[9px] font-mono">
                  <div className="bg-black/50 p-2.5 rounded-2xl border border-amber-900/50">
                    <span className="text-slate-500 block text-[8px] uppercase font-sans font-bold">Overridden BUC Telemetry</span>
                    <span className="text-amber-300 font-black text-sm font-mono tracking-tight">{telemetry.bucTemp} °C</span>
                    <span className="text-[7.5px] text-amber-400/90 block uppercase font-bold mt-0.5">+143.5°C SYNTHETIC DELTA</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-2xl border border-amber-900/50">
                    <span className="text-slate-500 block text-[8px] uppercase font-sans font-bold">Hostile ISR Systems</span>
                    <span className="text-emerald-400 font-black text-sm block">MISDIRECTED</span>
                    <span className="text-[7.5px] text-slate-400 block uppercase font-bold mt-0.5">TRACKING DECOY PHANTOM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-900 flex items-center justify-between px-2 relative z-10">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Vacuum_Grounding</span>
              <span className="text-[8px] text-slate-700 font-bold uppercase mono">ZPE_Harvest_Module</span>
            </div>
            <button 
               onClick={toggleZPE}
               className={`w-14 h-7 rounded-full p-1 transition-colors duration-500 relative flex items-center ${isZPEActive ? 'bg-red-600' : 'bg-slate-900 group-hover:bg-slate-800'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-xl ${isZPEActive ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
          
          {isZPEActive && (
            <div className="pt-4 animate-in slide-in-from-top-2 duration-500 relative z-10">
               <div className="bg-red-600/10 border-2 border-red-500/20 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">ZPE_UPLINK: ACTIVE</span>
                  </div>
                  <span className="text-[12px] font-mono font-black text-red-500 italic tracking-tighter">DELTA: -42°C</span>
               </div>
            </div>
          )}
        </div>
        
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={handleExportSecurePDF}
            disabled={isExporting}
            title="Export Secure PDF Log"
            className={`w-full flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-4 px-3 rounded-2xl border-2 transition-all duration-300 active:scale-95 shadow-xl relative overflow-hidden group/pdf cursor-pointer ${isExporting ? 'bg-red-950/30 border-red-800 text-red-400' : 'bg-red-600/90 border-red-500 text-white hover:bg-white hover:text-red-600 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]'}`}
          >
            <svg className="w-4 h-4 shrink-0 group-hover/pdf:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider italic truncate">Secure_PDF</span>
          </button>

          <button 
            onClick={handleExportTXT}
            disabled={isExporting}
            title="Export Plaintext Transcript (.txt)"
            className={`w-full flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-4 px-3 rounded-2xl border-2 transition-all duration-300 active:scale-95 shadow-xl relative overflow-hidden group/txt cursor-pointer ${isExporting ? 'bg-cyan-950/30 border-cyan-800 text-cyan-400' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'}`}
          >
            <svg className="w-4 h-4 shrink-0 group-hover/txt:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider italic truncate">Text_Log</span>
          </button>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            title="Export Full JSON Brief"
            className={`w-full flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-4 px-3 rounded-2xl border-2 transition-all duration-300 active:scale-95 shadow-xl relative overflow-hidden group/btn cursor-pointer ${isExporting ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-white hover:text-slate-950 hover:border-white'}`}
          >
            <svg className="w-4 h-4 shrink-0 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider italic truncate">JSON_Brief</span>
          </button>

          <button 
            onClick={handleBugReport}
            disabled={isExporting}
            title="Export Anomaly PDF Report"
            className={`w-full flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-4 px-3 rounded-2xl border-2 transition-all duration-300 active:scale-95 shadow-xl relative overflow-hidden group/bug cursor-pointer ${isExporting ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-amber-500/80 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400'}`}
          >
            <svg className="w-4 h-4 shrink-0 group-hover/bug:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider italic truncate">Anomaly_PDF</span>
          </button>
        </div>
      </div>

      {showEventLog && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500"
          onClick={() => !isAcknowledging && setShowEventLog(false)}
        >
          <div 
            className="glass w-full max-w-2xl rounded-[3.5rem] border-2 border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden scale-100 animate-in zoom-in-95 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b-2 border-slate-900 flex flex-wrap items-center justify-between bg-black/40 relative gap-4">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-transparent"></div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center italic">
                    <span className="w-3.5 h-3.5 bg-red-600 rounded-full mr-4 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"></span>
                    Sitrep <span className="text-red-500 ml-2.5">Registry</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] mt-1.5 italic pl-7">Secure Node // Terminal_ID: STIA-ACT-v8.0</p>
               </div>
               
               <div className="flex items-center space-x-2">
                 <button
                   onClick={handleExportSecurePDF}
                   title="Export Secure PDF Log"
                   className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 hover:border-red-400 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer"
                 >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                   </svg>
                   <span>Export PDF</span>
                 </button>

                 <button
                   onClick={handleExportTXT}
                   title="Export Plaintext Log"
                   className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-slate-800 hover:border-cyan-400 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer"
                 >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <span>Text (.txt)</span>
                 </button>

                 <button 
                  onClick={() => setShowEventLog(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all text-[9px] font-black tracking-widest cursor-pointer"
                 >
                   <span>CLOSE</span>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-10 space-y-6 bg-[#050810] scrollbar-hide">
              {eventLogs.length > 0 ? (
                eventLogs.map((log, i) => (
                  <div key={log.id} className="p-6 bg-slate-950/40 rounded-[2rem] border-2 border-slate-900 flex items-start space-x-6 group hover:border-red-500/20 transition-all shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                       <span className="text-4xl font-black italic">0{i+1}</span>
                    </div>
                    <div className="mt-1.5"><StatusBadge status={log.status} /></div>
                    <div className="flex-grow space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[14px] font-black text-white italic tracking-tight uppercase group-hover:text-red-400 transition-colors">{log.satName}</span>
                          <span className="text-[10px] text-slate-600 font-black italic tracking-widest px-3 py-1 bg-black rounded-lg border border-slate-900">{log.timestamp}</span>
                       </div>
                       <p className={`text-[14px] leading-relaxed font-mono italic tracking-tighter ${log.status === 'CRITICAL' || log.status === 'BREACH' ? 'text-red-400 font-black' : 'text-slate-500 group-hover:text-slate-400'}`}>{log.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
                   <div className="w-24 h-24 border-2 border-slate-800 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                   </div>
                   <p className="text-[12px] font-black text-slate-700 uppercase tracking-[0.5em] italic">No Situational Intel Data Streams Found</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t-2 border-slate-900 bg-black/60 flex flex-col space-y-6">
               {isAcknowledging && (
                 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-900">
                    <div className="h-full bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-progress-fill"></div>
                 </div>
               )}
               <div className="flex justify-between items-center px-4">
                  <div className="flex items-center space-x-3 text-slate-600">
                     <div className="w-2 h-2 rounded-full bg-slate-800" />
                     <span className="text-[10px] font-black uppercase tracking-widest italic">Awaiting_Operator_Confirmation...</span>
                  </div>
                  <button 
                    onClick={handleAcknowledge} 
                    disabled={isAcknowledging}
                    className={`min-w-[240px] py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 shadow-2xl italic ${
                      isAcknowledging 
                        ? 'bg-slate-900 text-red-500 border-2 border-red-500/30' 
                        : 'bg-red-600 hover:bg-white text-white hover:text-red-600 shadow-red-500/30'
                    }`}
                  >
                    {isAcknowledging ? 'SYNCHRONIZING_CORE...' : 'Acknowledge Mission Sitrep'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-fill {
          animation: progress-fill 0.8s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
