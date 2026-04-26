
import * as React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { LookAngleCard } from './components/LookAngleCard.tsx';
import { AITechnician } from './components/AITechnician.tsx';
import { SecurityTools } from './components/SecurityTools.tsx';
import { LinkBudgetCalculator } from './components/LinkBudgetCalculator.tsx';
import { SignalVisualizer } from './components/SignalVisualizer.tsx';
import { TacticalHUD } from './components/TacticalHUD.tsx';
import { TacticalMap } from './components/TacticalMap.tsx';
import { RSSReader } from './components/RSSReader.tsx';
import { TelemetryPulse } from './components/TelemetryPulse.tsx';
import { SignalInterceptor } from './components/SignalInterceptor.tsx';
import { MediaForge } from './components/MediaForge.tsx';
import { LiveComms } from './components/LiveComms.tsx';
import { TerrainObstruction } from './components/TerrainObstruction.tsx';
import { QuantumDefense } from './components/QuantumDefense.tsx';
import { WarGamesSimulator } from './components/WarGamesSimulator.tsx';
import { ConstellationView } from './components/ConstellationView.tsx';
import { SatelliteDetail } from './components/SatelliteDetail.tsx';
import { ElectronicWarfare } from './components/ElectronicWarfare.tsx';
import { NeuralProcessor } from './components/NeuralProcessor.tsx';
import { MissionPlanner } from './components/MissionPlanner.tsx';
import { TrapManagement } from './components/TrapManagement.tsx';
import { TrafficSniffer } from './components/TrafficSniffer.tsx';
import { AegisC2 } from './components/AegisC2.tsx';
import { GroverVisualizer } from './components/GroverVisualizer.tsx';
import { ShieldCheck } from 'lucide-react';
import { VSATConfig } from './components/VSATConfig.tsx';
import { QuantumEntropy } from './components/QuantumEntropy.tsx';
import { SitrepBoard } from './components/SitrepBoard.tsx';
import { SpectralCanary } from './components/SpectralCanary.tsx';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer.tsx';
import { ConnectivityMesh } from './components/ConnectivityMesh.tsx';
import { WeatherDashboard } from './components/WeatherDashboard.tsx';
import { IPGeolocator } from './components/IPGeolocator.tsx';
import { AdvancedTacticalSuite } from './components/AdvancedTacticalSuite.tsx';
import { USBDeviceManager } from './components/USBDeviceManager.tsx';
import { NodeScanner } from './components/NodeScanner.tsx';
import { SpoofTracer } from './components/SpoofTracer.tsx';
import { ThreatDossier } from './components/ThreatDossier.tsx';
import { YARAScanner } from './components/YARAScanner.tsx';
import { audioController } from './services/audioService.ts';
import { Coordinates, Satellite, LookAngles, WeatherCondition, MainView, SatelliteStatus } from './types.ts';
import { COMMON_SATELLITES } from './constants.ts';
import { calculateLookAngles } from './utils/geoUtils.ts';

const STORAGE_KEY = 'satexpert_tactical_v5';
const STEALTH_STORAGE_KEY = 'satexpert_stealth_mode';
const EVENT_LOG_STORAGE_KEY = 'satexpert_event_logs';

interface TacticalEvent {
  id: string;
  timestamp: string;
  satName: string;
  satId: string;
  status: SatelliteStatus | 'CRITICAL' | 'BREACH';
  detail: string;
}

export const App: React.FC = () => {
  const [satellites, setSatellites] = useState<Satellite[]>(COMMON_SATELLITES);
  const [userLoc, setUserLoc] = useState<Coordinates>({ lat: 51.5074, lng: -0.1278 });
  const [selectedSat, setSelectedSat] = useState<Satellite>(satellites[0]);
  const [lookAngles, setLookAngles] = useState<LookAngles | null>(null);
  const [view, setView] = useState<MainView>('tactical');
  const [defcon, setDefcon] = useState<number>(5);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherCondition>('CLEAR');
  const [isJamming, setIsJamming] = useState<boolean>(false);
  const [jammingPower, setJammingPower] = useState<number>(50);
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);
  const [isNeuralCleaning, setIsNeuralCleaning] = useState(false);
  
  // Global Event Log State
  const [eventLogs, setEventLogs] = useState<TacticalEvent[]>([]);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  const isFirstMount = useRef(true);

  const addMissionLog = useCallback((detail: string, status: TacticalEvent['status'] = 'active') => {
    const newEvent: TacticalEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      satName: selectedSat.name,
      satId: selectedSat.id,
      status: status,
      detail: detail
    };
    setEventLogs(prev => [newEvent, ...prev].slice(0, 50));
    setHasNewLogs(true);
  }, [selectedSat]);

  // Source of Truth Telemetry logic
  const telemetry = useMemo(() => {
    let snr = 16.0;
    let rxPower = -42.0;
    let packetLoss = 0.00;
    let bucTemp = 45.0;

    if (weather === 'OVERCAST') { snr -= 2.0; rxPower -= 1.5; }
    else if (weather === 'LIGHT_RAIN') { snr -= 5.0; rxPower -= 3.5; packetLoss += 0.8; }
    else if (weather === 'HEAVY_STORM') { snr -= 14.0; rxPower -= 12.0; packetLoss += 12.5; }

    if (isJamming) {
      snr -= (jammingPower / 5); 
      packetLoss += (jammingPower / 2);
      rxPower += (jammingPower / 10);
      bucTemp += (jammingPower / 15);
    }

    if (isNeuralCleaning) {
      snr += 4.5;
      packetLoss *= 0.2;
    }
    
    if (defcon <= 2) bucTemp += 8.0;

    if (isStealthMode) {
      snr = 20.0; rxPower = -30.0; packetLoss = 0.00; bucTemp = 35.0;
    }

    return {
      snr: Math.max(0, snr + (Math.random() - 0.5)).toFixed(2),
      rxPower: (rxPower + (Math.random() - 0.5)).toFixed(1),
      bucTemp: (bucTemp + (Math.random() - 0.5)).toFixed(1),
      packetLoss: Math.min(100, packetLoss + (Math.random() * 0.2)).toFixed(2),
      status: snr > 10 ? "NOMINAL" : (snr > 4 ? "DEGRADED" : "CRITICAL")
    };
  }, [weather, isJamming, jammingPower, defcon, isStealthMode, isNeuralCleaning]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.loc) setUserLoc(parsed.loc);
      if (parsed.satId) {
        const sat = satellites.find(s => s.id === parsed.satId);
        if (sat) setSelectedSat(sat);
      }
      setDefcon(parsed.defcon || 5);
    }
    const savedStealth = localStorage.getItem(STEALTH_STORAGE_KEY);
    if (savedStealth !== null) setIsStealthMode(JSON.parse(savedStealth));

    const savedLogs = localStorage.getItem(EVENT_LOG_STORAGE_KEY);
    if (savedLogs) setEventLogs(JSON.parse(savedLogs));

    isFirstMount.current = false;

    // Start audio on first user interaction (browser restriction)
    const startAudio = () => {
      audioController.startAmbientDrone();
      window.removeEventListener('mousedown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('mousedown', startAudio);
    window.addEventListener('keydown', startAudio);

    const handleNavView = (e: Event) => {
      const customEvent = e as CustomEvent<MainView>;
      if (customEvent.detail) setView(customEvent.detail);
    };
    window.addEventListener('nav-view', handleNavView);
    return () => {
      window.removeEventListener('mousedown', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('nav-view', handleNavView);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ loc: userLoc, satId: selectedSat.id, defcon }));
  }, [userLoc, selectedSat, defcon]);

  useEffect(() => {
    if (!isFirstMount.current) localStorage.setItem(STEALTH_STORAGE_KEY, JSON.stringify(isStealthMode));
  }, [isStealthMode]);

  useEffect(() => {
    localStorage.setItem(EVENT_LOG_STORAGE_KEY, JSON.stringify(eventLogs));
  }, [eventLogs]);

  useEffect(() => {
    setLookAngles(calculateLookAngles(userLoc, selectedSat.longitude));
  }, [userLoc, selectedSat]);

  const VIEW_CATEGORIES = [
    { name: 'TACTICAL_BASE', views: ['tactical', 'constellation', 'satellite_detail', 'mesh', 'weather', 'geolocator'] },
    { name: 'SIGINT_SUITE', views: ['intelligence', 'interception', 'node_scanner', 'spoof_tracer', 'threat_dossier', 'yara_scanner', 'sniffer', 'analyzer', 'specter', 'traps'] },
    { name: 'ACTIVE_OPS', views: ['tactical_suite', 'warfare', 'planner', 'neural'] },
    { name: 'CYBER_CMD', views: ['defense', 'simulation', 'aegis', 'usb_manager', 'vsat_config', 'grover'] },
    { name: 'AUX_DATA', views: ['media', 'live', 'calculations', 'terrain', 'news'] }
  ];

  return (
    <div className={`crt-screen min-h-screen ${(!isStealthMode && (isJamming || defcon === 1)) ? 'crt-distorted' : ''}`}>
      <Layout isStealthMode={isStealthMode} setIsStealthMode={setIsStealthMode}>
        <div className="flex flex-col space-y-8 max-w-7xl mx-auto pb-12 transition-all duration-1000">
          
          <div className={`flex flex-col xl:flex-row items-stretch justify-between gap-6 glass p-6 rounded-[32px] border-slate-800/80 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden group ${defcon === 1 || isJamming ? 'defcon-alert' : ''}`}>
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="text-[40px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap overflow-hidden">TSI_CORE_V5</span>
             </div>
             
             <div className="flex flex-row items-stretch gap-8 z-20 w-full">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></div>
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Operational_Interface_Portal</span>
                   </div>
                   <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">{new Date().toISOString()}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {VIEW_CATEGORIES.map(cat => (
                    <div key={cat.name} className="space-y-3">
                       <div className="flex items-center space-x-2 border-b border-slate-800/60 pb-1 mx-1">
                          <div className="w-1 h-3 bg-slate-700 rounded-full"></div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cat.name}</span>
                       </div>
                       <div className="flex flex-wrap gap-1.5 p-1">
                          {cat.views.map((v) => (
                            <button
                              key={v}
                              onClick={() => setView(v as MainView)}
                              className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all duration-300 border ${
                                view === v 
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105 z-10' 
                                  : 'text-slate-500 border-transparent hover:border-slate-800 hover:text-cyan-400 hover:bg-slate-900/60'
                              }`}
                            >
                              {v.replace('_', ' ')}
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-px bg-slate-800/60 hidden xl:block self-stretch mx-2"></div>

              <div className="flex flex-col justify-center min-w-[120px]">
                <div className="flex items-center space-x-2 mb-4 px-1">
                   <ShieldCheck className="w-4 h-4 text-slate-600" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Defcon</span>
                </div>
                <div className="flex flex-col space-y-1.5 bg-slate-950/40 p-2 rounded-2xl border border-slate-800/30">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button 
                      key={lvl} 
                      onClick={() => setDefcon(lvl)} 
                      className={`h-8 rounded-xl flex items-center px-4 space-x-3 text-[10px] font-black transition-all border ${
                        defcon === lvl 
                          ? (lvl <= 2 ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40') 
                          : 'bg-slate-900/60 border-slate-800/40 text-slate-600 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-4">{lvl}</span>
                      <div className={`h-1 flex-grow rounded-full ${defcon === lvl ? (lvl <= 2 ? 'bg-white' : 'bg-cyan-400') : 'bg-slate-800'}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center xl:justify-end flex-grow z-20 xl:min-w-[300px]">
               <TelemetryPulse telemetry={telemetry} isStealthMode={isStealthMode} />
            </div>
          </div>

          <div className="min-h-[70vh]">
            {view === 'tactical' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  <TacticalHUD 
                    loc={userLoc} 
                    sat={selectedSat} 
                    satellites={satellites} 
                    onLocChange={setUserLoc} 
                    onSatChange={setSelectedSat} 
                    onSatellitesUpdate={setSatellites} 
                    isTracking={isTracking} 
                    onTrackingChange={setIsTracking} 
                    isJamming={isJamming} 
                    setIsJamming={setIsJamming} 
                    jammingPower={jammingPower} 
                    setJammingPower={setJammingPower} 
                    weather={weather} 
                    setWeather={setWeather} 
                    isStealthMode={isStealthMode}
                    telemetry={telemetry} 
                    eventLogs={eventLogs}
                    setEventLogs={setEventLogs}
                    hasNewLogs={hasNewLogs}
                    setHasNewLogs={setHasNewLogs}
                  />
                  <TacticalMap userLoc={userLoc} satellite={selectedSat} isTracking={isTracking} isStealthMode={isStealthMode} onLocChange={setUserLoc} />
                  <div className="grid grid-cols-1 gap-6">
                    <WeatherDashboard weather={weather} loc={userLoc} satName={selectedSat.name} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                      <SitrepBoard selectedSatellite={selectedSat} defcon={defcon} />
                      <QuantumEntropy />
                    </div>
                  </div>
                  {lookAngles && <LookAngleCard angles={lookAngles} satellite={selectedSat} />}
                  <SignalVisualizer quality={lookAngles?.elevation && lookAngles.elevation > 0 ? 85 : 0} isJamming={isJamming} jammingPower={jammingPower} rainFade={weather === 'CLEAR' ? 0.5 : 5.0} isStealthMode={isStealthMode} />
                </div>
                <div className="lg:col-span-7 xl:col-span-8">
                  <AITechnician 
                    context={{ lat: userLoc.lat, lng: userLoc.lng, satName: selectedSat.name, defcon, weather, isJamming }} 
                    telemetry={telemetry} 
                    isStealthMode={isStealthMode}
                    isNeuralCleaning={isNeuralCleaning}
                    onToggleNeuralCleaning={() => setIsNeuralCleaning(!isNeuralCleaning)}
                  />
                </div>
              </div>
            )}

            {view === 'constellation' && (
              <ConstellationView 
                satellites={satellites} 
                selectedSat={selectedSat} 
                onSatSelect={(sat) => {
                  setSelectedSat(sat);
                  setView('satellite_detail');
                }} 
                isStealthMode={isStealthMode} 
              />
            )}

            {view === 'satellite_detail' && (
              <SatelliteDetail 
                satellite={selectedSat} 
                lookAngles={lookAngles} 
                isStealthMode={isStealthMode} 
                isJamming={isJamming} 
                jammingPower={jammingPower}
                weather={weather}
              />
            )}

            {view === 'intelligence' && (
              <SecurityTools 
                userLoc={userLoc} 
                selectedSatName={selectedSat.name} 
                isJamming={isJamming} 
                setIsJamming={setIsJamming} 
                jammingPower={jammingPower} 
                setJammingPower={setJammingPower} 
                signalQuality={88} 
                onBack={() => setView('tactical')} 
                isStealthMode={isStealthMode} 
                setIsStealthMode={setIsStealthMode} 
                addMissionLog={addMissionLog}
              />
            )}
            
            {view === 'interception' && (
              <SignalInterceptor isJamming={isJamming} jammingPower={jammingPower} isStealthMode={isStealthMode} />
            )}

            {view === 'warfare' && (
              <ElectronicWarfare 
                isStealthMode={isStealthMode} 
                isJamming={isJamming} 
                jammingPower={jammingPower} 
                onToggleJamming={setIsJamming} 
                onSetJammingPower={setJammingPower} 
              />
            )}

            {view === 'neural' && (
              <NeuralProcessor />
            )}

            {view === 'planner' && (
              <MissionPlanner />
            )}

            {view === 'traps' && (
              <TrapManagement />
            )}

            {view === 'sniffer' && (
              <TrafficSniffer isStealthMode={isStealthMode} />
            )}

            {view === 'aegis' && (
              <AegisC2 />
            )}

            {view === 'grover' && (
              <GroverVisualizer />
            )}

            {view === 'vsat_config' && (
              <VSATConfig />
            )}

            {view === 'specter' && (
              <SpectralCanary />
            )}

            {view === 'analyzer' && (
              <SpectrumAnalyzer />
            )}

            {view === 'mesh' && (
              <ConnectivityMesh satellites={satellites} selectedSat={selectedSat} />
            )}

            {view === 'weather' && (
              <WeatherDashboard weather={weather} loc={userLoc} satName={selectedSat.name} />
            )}

            {view === 'media' && <MediaForge />}
            {view === 'live' && <LiveComms isStealthMode={isStealthMode} />}

            {view === 'geolocator' && (
              <IPGeolocator />
            )}

            {view === 'tactical_suite' && (
              <AdvancedTacticalSuite />
            )}

            {view === 'usb_manager' && (
              <USBDeviceManager />
            )}

            {view === 'node_scanner' && (
              <NodeScanner />
            )}

            {view === 'spoof_tracer' && (
              <SpoofTracer />
            )}

            {view === 'threat_dossier' && (
              <ThreatDossier />
            )}

            {view === 'yara_scanner' && (
              <YARAScanner />
            )}

            {view === 'defense' && (
              <div className="max-w-6xl mx-auto">
                <QuantumDefense isStealthMode={isStealthMode} addMissionLog={addMissionLog} />
              </div>
            )}

            {view === 'simulation' && (
              <div className="max-w-6xl mx-auto">
                <WarGamesSimulator satName={selectedSat.name} />
              </div>
            )}

            {view === 'terrain' && lookAngles && (
              <div className="max-w-4xl mx-auto">
                <TerrainObstruction angles={lookAngles} />
              </div>
            )}

            {view === 'calculations' && lookAngles && (
              <div className="max-w-4xl mx-auto space-y-6">
                <TerrainObstruction angles={lookAngles} />
                <LinkBudgetCalculator distance={lookAngles.distance} isStealthMode={isStealthMode} />
              </div>
            )}

            {view === 'news' && (
              <div className="max-w-4xl mx-auto">
                <RSSReader />
              </div>
            )}
          </div>
          <div className="mt-auto pt-8 border-t border-slate-800/30 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600 px-4">
             <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                   <span>System_Status: Optimal</span>
                </span>
                <span className="text-slate-800">|</span>
                <span>Authorized_Access_Only</span>
             </div>
             
             <div className="text-center md:text-right max-w-md opacity-40 hover:opacity-100 transition-opacity cursor-help">
                <p>This software is a technical simulation for authorized cybersecurity research and training. Unauthorized use against external networks is strictly prohibited by federal law.</p>
             </div>
             
             <div className="flex items-center space-x-6">
                <span>V5.4.2-STABLE</span>
                <div className="flex space-x-1">
                   {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-slate-800 rounded-full"></div>)}
                </div>
             </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default App;
