
import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Coordinates, Satellite, SatelliteStatus, WeatherCondition, TacticalEvent, BugReportEvent } from '../types';
import { fetchSatelliteStatusUpdates } from '../services/satelliteService';
import { audioController } from '../services/audioService';
import { generateBugReportPDF } from '../services/pdfService';

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
  eventLogs, setEventLogs, hasNewLogs, setHasNewLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [animateLabel, setAnimateLabel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    const pollInterval = setInterval(async () => {
      const updatedSatellites = await fetchSatelliteStatusUpdates();
      onSatellitesUpdate(updatedSatellites);
    }, 5000);
    return () => clearInterval(pollInterval);
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
    <div className="glass rounded-[3rem] p-8 border-2 border-slate-800 relative z-50 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] group/hud">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/hud:opacity-10 transition-opacity">
         <div className="w-24 h-24 border-t-4 border-r-4 border-red-600/40 rounded-tr-[3.5rem]"></div>
      </div>
      <div className="absolute bottom-0 left-0 p-4 opacity-5 pointer-events-none group-hover/hud:opacity-10 transition-opacity">
         <div className="w-24 h-24 border-b-4 border-l-4 border-red-600/40 rounded-bl-[3.5rem]"></div>
      </div>
      
      <div className="space-y-8 relative z-10">
        <div className="relative" ref={dropdownRef}>
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-6">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
                 <label className="block text-[12px] font-black uppercase tracking-[0.4em] text-white italic">Target_Acquisition</label>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5 italic opacity-60">Orbital_Asset_Lock_v8.0 // ACTIVE_TRACKING</p>
            </div>
            
            <button 
              onClick={() => { setShowEventLog(true); setHasNewLogs(false); }}
              className={`group flex items-center space-x-4 px-7 py-4 rounded-2xl border-2 transition-all duration-500 uppercase tracking-[0.3em] text-[11px] font-black italic shadow-2xl active:scale-95 ${
                hasNewLogs 
                  ? 'bg-red-600 border-white text-white shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/50'
              }`}
            >
              <div className="relative flex items-center justify-center">
                 <svg className={`w-5 h-5 transition-transform ${hasNewLogs ? 'scale-110' : 'group-hover:scale-125'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 {hasNewLogs && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-red-600 animate-ping"></div>}
              </div>
              <span>Sitrep_Console</span>
            </button>
          </div>
          
          <div className="relative group/search">
            <input
              type="text"
              placeholder={isOpen ? "Scan_Asset_Registry..." : sat.name}
              className={`w-full bg-[#050810] border-2 ${isOpen ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-slate-800'} rounded-[2rem] p-6 pl-14 text-lg font-black text-white outline-none transition-all tracking-tighter italic placeholder:text-slate-800 group-hover/search:border-slate-700 shadow-inner`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <svg className={`w-6 h-6 ${isOpen ? 'text-red-500' : 'text-slate-700 group-hover/search:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center bg-black/40 px-4 py-2 rounded-xl border border-slate-900 shadow-xl">
               {!isOpen && <StatusBadge status={sat.status} />}
            </div>
          </div>

          {isOpen && (
            <div className="absolute mt-3 w-full glass bg-[#050810] border-2 border-red-500 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-[350px] flex flex-col z-[100] animate-in slide-in-from-top-4 duration-300">
              <div className="bg-red-500/10 px-6 py-3 border-b border-slate-900 flex items-center justify-between">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] italic">Authorized_Asset_Registry</span>
                <div className="flex space-x-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-red-500/40 animate-pulse" />)}
                </div>
              </div>
              <div className="overflow-y-auto py-2 scrollbar-hide">
                {filteredSatellites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-6 py-4 hover:bg-white/5 transition-all flex items-center justify-between border-b border-slate-900/50 last:border-none group/item ${s.id === sat.id ? 'bg-red-500/5' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-black uppercase italic tracking-tight transition-colors ${s.id === sat.id ? 'text-red-400' : 'text-slate-200 group-hover/item:text-red-400'}`}>{s.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{s.operator}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[11px] text-red-500 font-mono font-black italic tracking-tighter">{s.orbitalSlot}</span>
                       <div className={`w-1.5 h-1.5 rounded-full mt-1 ${s.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-[1.8rem] border-2 border-slate-900 p-5 flex flex-col shadow-inner group hover:border-red-500/20 transition-colors">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 italic">Authority_ID</span>
            <span className="text-[12px] font-black text-slate-200 uppercase tracking-tight italic truncate">{sat.operator || 'UNSPECIFIED'}</span>
          </div>
          <div className="bg-black/40 rounded-[1.8rem] border-2 border-slate-900 p-5 flex flex-col items-end text-right shadow-inner group hover:border-red-500/20 transition-colors">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 italic">Position_Node</span>
            <span className="text-[12px] font-black text-red-500 font-mono tracking-tighter italic shadow-red-500/10 text-glow">{sat.orbitalSlot}</span>
          </div>
        </div>

        <div className="bg-black/40 rounded-[2.5rem] border-2 border-slate-900 p-6 space-y-6 shadow-inner">
          <div className="flex items-center justify-between px-2">
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Atmospheric_Interference_Sim</span>
             <div className="flex items-center space-x-2">
                <div className="w-1 h-3 bg-red-500/20 rounded-full" />
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">Ka-Band_v8.0</span>
             </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(['CLEAR', 'OVERCAST', 'LIGHT_RAIN', 'HEAVY_STORM'] as WeatherCondition[]).map((cond) => (
              <button 
                key={cond}
                onClick={() => setWeather(cond)}
                disabled={isStealthMode}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 shadow-lg ${
                  isStealthMode ? 'opacity-30 cursor-not-allowed' : ''
                } ${
                  weather === cond 
                    ? 'bg-red-500/10 border-red-500/60 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                    : 'bg-slate-950/80 border-slate-900 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                }`}
              >
                <span className="text-2xl mb-2 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">{weatherIcons[cond]}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none">{(cond || '').replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-[2.5rem] border-2 p-6 space-y-6 transition-all duration-700 shadow-2xl relative overflow-hidden group/ew ${isStealthMode ? 'bg-cyan-900/10 border-cyan-500/30' : (isJamming || isDecoyActive ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'bg-slate-950/60 border-slate-900')}`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/ew:opacity-20 transition-opacity">
             <div className="w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-2xl" />
          </div>
          <div className="flex items-center justify-between relative z-10 px-2">
            <div className="flex flex-col space-y-1">
              <span className={`text-[12px] font-black uppercase tracking-[0.4em] italic ${isStealthMode ? 'text-cyan-400' : (isJamming || isDecoyActive ? 'text-red-500' : 'text-white')}`}>Electronic_Warfare</span>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-none">Protocol: Aether_Strike_v8.0</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsJamming(!isJamming)}
                disabled={isStealthMode}
                className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 italic border-2 ${
                  isStealthMode 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-800 cursor-not-allowed' 
                    : (isJamming 
                        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
                      )
                }`}
              >
                Jamming
              </button>
              <button 
                onClick={toggleDecoy}
                disabled={isStealthMode}
                className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 italic border-2 ${
                  isStealthMode 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-800 cursor-not-allowed' 
                    : (isDecoyActive 
                        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
                      )
                }`}
              >
                Aether_Decoy
              </button>
            </div>
          </div>
          
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
        
        <div className="pt-2 grid grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full flex items-center justify-center space-x-3 py-6 rounded-[2rem] border-2 transition-all duration-500 active:scale-95 shadow-2xl relative overflow-hidden group/btn ${isExporting ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-red-600 border-red-400 text-white hover:bg-white hover:text-red-600 hover:shadow-[0_20px_50px_rgba(239,68,68,0.3)]'}`}
          >
            <div className={`relative z-10 ${isExporting ? 'animate-spin' : 'group-hover/btn:scale-110 transition-transform'}`}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10 italic">{isExporting ? 'Syncing...' : 'Brief_Brief'}</span>
          </button>

          <button 
            onClick={handleBugReport}
            disabled={isExporting}
            className={`w-full flex items-center justify-center space-x-3 py-6 rounded-[2rem] border-2 transition-all duration-500 active:scale-95 shadow-2xl relative overflow-hidden group/bug ${isExporting ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-white hover:text-amber-600 hover:border-white'}`}
          >
            <div className={`relative z-10 ${isExporting ? 'animate-ping' : 'group-hover/bug:rotate-180 transition-transform duration-500'}`}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10 italic">Anomaly_PDF</span>
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
            <div className="p-10 border-b-2 border-slate-900 flex items-center justify-between bg-black/40 relative">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-transparent"></div>
               <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center italic">
                    <span className="w-4 h-4 bg-red-600 rounded-full mr-5 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"></span>
                    Sitrep <span className="text-red-500 ml-3">Registry</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold tracking-[0.3em] mt-2 italic pl-9">Secure Node // Terminal_ID: STIA-ACT-v8.0</p>
               </div>
               
               <button 
                onClick={() => setShowEventLog(false)}
                className="flex items-center space-x-3 px-6 py-3 bg-slate-900 hover:bg-red-600 text-slate-500 hover:text-white border-2 border-slate-800 hover:border-red-400 rounded-2xl transition-all duration-300 active:scale-90 group"
               >
                 <span className="text-[10px] font-black tracking-widest">DISMISS</span>
                 <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
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
