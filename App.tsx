
import * as React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LookAngleCard } from './components/LookAngleCard';
import { AITechnician } from './components/AITechnician';
import { SecurityTools } from './components/SecurityTools';
import { LinkBudgetCalculator } from './components/LinkBudgetCalculator';
import { SignalVisualizer } from './components/SignalVisualizer';
import { TacticalHUD } from './components/TacticalHUD';
import { TacticalMap } from './components/TacticalMap';
import { RSSReader } from './components/RSSReader';
import { TelemetryPulse } from './components/TelemetryPulse';
import { SignalInterceptor } from './components/SignalInterceptor';
import { MediaForge } from './components/MediaForge';
import { LiveComms } from './components/LiveComms';
import { TerrainObstruction } from './components/TerrainObstruction';
import { QuantumDefense } from './components/QuantumDefense';
import { WarGamesSimulator } from './components/WarGamesSimulator';
import { ConstellationView } from './components/ConstellationView';
import { SatelliteDetail } from './components/SatelliteDetail';
import { ElectronicWarfare } from './components/ElectronicWarfare';
import { NeuralProcessor } from './components/NeuralProcessor';
import { MissionPlanner } from './components/MissionPlanner';
import { TrapManagement } from './components/TrapManagement';
import { TrafficSniffer } from './components/TrafficSniffer';
import { AegisC2 } from './components/AegisC2';
import { GroverVisualizer } from './components/GroverVisualizer';
import { ShieldCheck } from 'lucide-react';
import { VSATConfig } from './components/VSATConfig';
import { QuantumEntropy } from './components/QuantumEntropy';
import { SitrepBoard } from './components/SitrepBoard';
import { SpectralCanary } from './components/SpectralCanary';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer';
import { ConnectivityMesh } from './components/ConnectivityMesh';
import { WeatherDashboard } from './components/WeatherDashboard';
import { IPGeolocator } from './components/IPGeolocator';
import { AdvancedTacticalSuite } from './components/AdvancedTacticalSuite';
import { USBDeviceManager } from './components/USBDeviceManager';
import { NodeScanner } from './components/NodeScanner';
import { SpoofTracer } from './components/SpoofTracer';
import { ThreatDossier } from './components/ThreatDossier';
import { YARAScanner } from './components/YARAScanner';
import { OrbitalStriker } from './components/OrbitalStriker';
import { DroneSwarmCommand } from './components/DroneSwarmCommand';
import { CyberKillChain } from './components/CyberKillChain';
import { CyberAttackSuite } from './components/CyberAttackSuite';
import { SignalJammer } from './components/SignalJammer';
import { BotnetCommand } from './components/BotnetCommand';
import { RadioInterceptSuite } from './components/RadioInterceptSuite';
import { QuantumDecryptor } from './components/QuantumDecryptor';
import { BiometricScanner } from './components/BiometricScanner';
import { TacticalScriptEnv } from './components/TacticalScriptEnv';
import { RemoteAccessTerminal } from './components/RemoteAccessTerminal';
import { PQCMigrationTimeline } from './components/PQCMigrationTimeline';
import { PalantirAuditSuite } from './components/PalantirAuditSuite';
import { QuantumIntelligenceHub } from './components/QuantumIntelligenceHub';
import { PurpleTeamArsenal } from './components/PurpleTeamArsenal';
import { BugBountyLab } from './components/BugBountyLab';
import { SentinelAIControl } from './components/SentinelAIControl';
import { ZeroDayForge } from './components/ZeroDayForge';
import { AptLateralTracker } from './components/AptLateralTracker';
import { PhishingCampaignManager } from './components/PhishingCampaignManager';
import { RansomwareSim } from './components/RansomwareSim';
import { SCADAExploit } from './components/SCADAExploit';
import { NmapScanner } from './components/NmapScanner';
import { DeepfakeComms } from './components/DeepfakeComms';
import { DarkLinkProtocol } from './components/DarkLinkProtocol';
import { WifiCountermeasures } from './components/WifiCountermeasures';
import { ElectromagneticPulse } from './components/ElectromagneticPulse';
import { AIAutomatedExploit } from './components/AIAutomatedExploit';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { QuantumEntanglementComms } from './components/QuantumEntanglementComms';
import { SwarmIntelligenceDashboard } from './components/SwarmIntelligenceDashboard';
import { audioController } from './services/audioService';
import { Coordinates, Satellite, LookAngles, WeatherCondition, MainView, SatelliteStatus, TacticalEvent } from './types';
import { COMMON_SATELLITES } from './constants';
import { calculateLookAngles } from './utils/geoUtils';

const STORAGE_KEY = 'satexpert_tactical_v6';
const STEALTH_STORAGE_KEY = 'satexpert_stealth_mode';
const EVENT_LOG_STORAGE_KEY = 'satexpert_event_logs';

export const App: React.FC = () => {
  const [satellites, setSatellites] = useState<Satellite[]>(COMMON_SATELLITES);
  const [userLoc, setUserLoc] = useState<Coordinates>({ lat: 51.5074, lng: -0.1278 });
  const [selectedSat, setSelectedSat] = useState<Satellite>(satellites[0]);
  const [lookAngles, setLookAngles] = useState<LookAngles | null>(null);
  const [view, setView] = useState<MainView>('sentinel_core');
  const [defcon, setDefcon] = useState<number>(5);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherCondition>('CLEAR');
  const [isJamming, setIsJamming] = useState<boolean>(false);
  const [jammingPower, setJammingPower] = useState<number>(50);
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);
  const [isNeuralCleaning, setIsNeuralCleaning] = useState(false);
  const [isDecoyActive, setIsDecoyActive] = useState(false);
  const [isZPEActive, setIsZPEActive] = useState(false);
  
  // Global Event Log State
  const [eventLogs, setEventLogs] = useState<TacticalEvent[]>([]);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  const isFirstMount = useRef(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

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
    
    if (isZPEActive) {
      bucTemp -= 42.0;
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
    { name: 'SENTINEL_AI', views: ['sentinel_core', 'quantum_intel_hub', 'palantir_audit', 'bug_bounty_lab'] },
    { name: 'SIGINT_SUITE', views: ['intelligence', 'interception', 'node_scanner', 'spoof_tracer', 'threat_dossier', 'yara_scanner', 'sniffer', 'analyzer', 'specter', 'traps', 'radio_intercept', 'quantum_decryptor', 'biometric_scanner', 'quantum_timeline', 'nmap_scan'] },
    { name: 'ACTIVE_OPS', views: ['tactical_suite', 'warfare', 'planner', 'neural', 'orbital_strike', 'drone_swarm', 'swarm_intelligence', 'kill_chain', 'cyber_attack', 'signal_jamming', 'botnet_command', 'script_env', 'remote_access', 'purple_team', 'zero_day_forge', 'apt_simulator', 'social_toolkit', 'ransomware_sim', 'scada_sc', 'deepfake_comms', 'dark_link', 'wifi_countermeasures', 'electromagnetic_pulse', 'ai_automated_exploit'] },
    { name: 'CYBER_CMD', views: ['defense', 'simulation', 'aegis', 'usb_manager', 'vsat_config', 'grover', 'quantum_entanglement'] },
    { name: 'AUX_DATA', views: ['media', 'live', 'calculations', 'terrain', 'news'] }
  ];

  return (
    <div className={`crt-screen min-h-screen ${(!isStealthMode && (isJamming || defcon === 1)) ? 'crt-distorted' : ''}`}>
      {apiKeyError && (
        <div className="bg-red-600 text-white py-2 px-4 text-center font-black text-[10px] tracking-[0.5em] uppercase animate-pulse z-[9999] relative">
          [VOICE_UPLINK_FAILURE] {apiKeyError}
        </div>
      )}
      <Layout isStealthMode={isStealthMode} setIsStealthMode={setIsStealthMode}>
        <div className="flex flex-col space-y-8 max-w-7xl mx-auto pb-12 transition-all duration-1000">
          
          <div className={`flex flex-col xl:flex-row items-stretch justify-between gap-6 glass p-6 rounded-[32px] border-2 border-slate-800 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group ${defcon === 1 || isJamming ? 'defcon-alert' : ''}`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-[60px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap overflow-hidden">TSI_TACTICAL_BRIDGE</span>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
             
             <div className="flex flex-col xl:flex-row items-stretch gap-8 z-20 w-full">
              <div className="flex flex-col w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-slate-800 pb-3 px-2 gap-4">
                   <div className="flex items-center space-x-4">
                      <div className="flex space-x-1">
                         {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/40"></div>)}
                      </div>
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] break-all max-w-[200px] sm:max-w-none">BRIDGE_CONTROL_INTERFACE_V8.0</span>
                   </div>
                   <div className="flex items-center space-x-4 flex-wrap">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0">UPLINK: ACTIVE</span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest shrink-0">{new Date().toISOString()}</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                  {VIEW_CATEGORIES.map(cat => (
                    <div key={cat.name} className="space-y-4">
                       <div className="flex items-center justify-between mx-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat.name}</span>
                          <div className="w-8 h-[1px] bg-slate-800"></div>
                       </div>
                       <div className="flex flex-wrap gap-2 p-1">
                          {cat.views.map((v) => (
                            <button
                              key={v}
                              onClick={() => setView(v as MainView)}
                              className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border-2 flex-grow sm:flex-grow-0 sm:min-w-0 min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis ${
                                view === v 
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.3)] scale-105 z-10' 
                                  : 'text-slate-500 border-slate-900/50 hover:border-slate-700 hover:text-cyan-400 hover:bg-slate-900/80 active:scale-95'
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
              
              <div className="w-full h-px xl:w-px xl:h-auto bg-slate-800/60 self-stretch my-6 xl:mx-2 xl:my-0"></div>

              <div className="flex flex-col justify-center min-w-0 xl:min-w-[120px]">
                <div className="flex items-center space-x-2 mb-4 px-1">
                   <ShieldCheck className="w-4 h-4 text-slate-600" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Defcon</span>
                </div>
                <div className="flex flex-row xl:flex-col gap-1.5 flex-wrap bg-slate-950/40 p-2 rounded-2xl border border-slate-800/30">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button 
                      key={lvl} 
                      onClick={() => setDefcon(lvl)} 
                      className={`flex-grow xl:h-8 min-h-[32px] rounded-xl flex items-center justify-center xl:justify-start px-4 space-x-3 text-[10px] font-black transition-all border ${
                        defcon === lvl 
                          ? (lvl <= 2 ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40') 
                          : 'bg-slate-900/60 border-slate-800/40 text-slate-600 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-4">{lvl}</span>
                      <div className={`hidden xl:block h-1 flex-grow rounded-full ${defcon === lvl ? (lvl <= 2 ? 'bg-white' : 'bg-cyan-400') : 'bg-slate-800'}`}></div>
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
                    isDecoyActive={isDecoyActive}
                    setIsDecoyActive={setIsDecoyActive}
                    isZPEActive={isZPEActive}
                    setIsZPEActive={setIsZPEActive}
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
                    isDecoyActive={isDecoyActive}
                    isZPEActive={isZPEActive}
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

            {view === 'quantum_entanglement' && (
              <div className="max-w-4xl mx-auto">
                <QuantumEntanglementComms />
              </div>
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
            {view === 'live' && <LiveComms isStealthMode={isStealthMode} addMissionLog={addMissionLog} />}

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

            {view === 'nmap_scan' && (
              <NmapScanner />
            )}

            {view === 'orbital_strike' && (
              <OrbitalStriker addMissionLog={addMissionLog} />
            )}

            {view === 'drone_swarm' && (
              <DroneSwarmCommand addMissionLog={addMissionLog} />
            )}

            {view === 'swarm_intelligence' && (
              <div className="max-w-6xl mx-auto">
                <SwarmIntelligenceDashboard />
              </div>
            )}

            {view === 'kill_chain' && (
              <CyberKillChain addMissionLog={addMissionLog} />
            )}

            {view === 'cyber_attack' && (
              <CyberAttackSuite addMissionLog={addMissionLog} />
            )}

            {view === 'signal_jamming' && (
              <SignalJammer addMissionLog={addMissionLog} />
            )}

            {view === 'botnet_command' && (
              <BotnetCommand addMissionLog={addMissionLog} />
            )}

            {view === 'radio_intercept' && (
              <RadioInterceptSuite addMissionLog={addMissionLog} />
            )}
            
            {view === 'quantum_decryptor' && (
              <QuantumDecryptor addMissionLog={addMissionLog} />
            )}

            {view === 'biometric_scanner' && (
              <BiometricScanner addMissionLog={addMissionLog} />
            )}

            {view === 'quantum_timeline' && (
              <PQCMigrationTimeline />
            )}

            {view === 'quantum_intel_hub' && (
              <QuantumIntelligenceHub />
            )}

            {view === 'palantir_audit' && (
              <PalantirAuditSuite />
            )}

            {view === 'bug_bounty_lab' && (
              <BugBountyLab />
            )}

            {view === 'sentinel_core' && (
              <SentinelAIControl />
            )}

            {view === 'purple_team' && (
              <PurpleTeamArsenal />
            )}

            {view === 'script_env' && (
              <TacticalScriptEnv addMissionLog={addMissionLog} />
            )}

            {view === 'remote_access' && (
              <RemoteAccessTerminal addMissionLog={addMissionLog} />
            )}

            {view === 'zero_day_forge' && (
              <ZeroDayForge />
            )}

            {view === 'apt_simulator' && (
              <AptLateralTracker />
            )}

            {view === 'social_toolkit' && (
              <PhishingCampaignManager />
            )}

            {view === 'ransomware_sim' && (
              <RansomwareSim />
            )}

            {view === 'scada_sc' && (
              <SCADAExploit />
            )}

            {view === 'deepfake_comms' && (
              <DeepfakeComms />
            )}
            
            {view === 'wifi_countermeasures' && (
              <WifiCountermeasures />
            )}

            {view === 'electromagnetic_pulse' && (
              <ElectromagneticPulse addMissionLog={addMissionLog} />
            )}

            {view === 'ai_automated_exploit' && (
              <AIAutomatedExploit addMissionLog={addMissionLog} />
            )}

            {view === 'dark_link' && (
              <DarkLinkProtocol />
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
          <div className="mt-auto pt-10 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600 px-6 bg-slate-950/20 py-8 rounded-b-3xl flex-wrap pb-20 md:pb-8">
             <div className="flex items-center space-x-6 flex-wrap gap-y-2 justify-center">
                <span className="flex items-center space-x-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 relative group overflow-hidden">
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                   <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">System_Status: Optimal</span>
                </span>
                <span className="text-slate-800 hidden md:block">/</span>
                <span className="text-slate-500 italic opacity-60">Verified_Operator_Access_Only</span>
             </div>
             
             <div className="text-center md:text-right max-w-md opacity-30 hover:opacity-100 transition-all duration-700 cursor-help border-x border-slate-800/30 px-6 py-1">
                <p className="leading-relaxed">This software is a technical framework for authorized cybersecurity operations and training only. Unauthorized misuse is strictly prohibited by standard federal guidelines.</p>
             </div>
             
             <div className="flex items-center space-x-8">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] text-slate-700">KERNEL_CORE_BASE</span>
                   <span className="text-slate-400">V8.0.0-STABLE</span>
                </div>
                <div className="flex space-x-1.5 h-6 items-end">
                   {[1,2,3,4,5,6].map(i => <div key={i} className={`w-1 bg-slate-800 rounded-full ${i <= 3 ? 'h-3 bg-cyan-500/40' : 'h-1.5'}`}></div>)}
                </div>
             </div>
          </div>
        </div>
        <AIAssistantWidget />
      </Layout>
    </div>
  );
};

export default App;
