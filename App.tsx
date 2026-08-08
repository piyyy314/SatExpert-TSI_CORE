
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
import { CloudSyncPortal } from './components/CloudSyncPortal';
import { SARImagingSuite } from './components/SARImagingSuite';
import { KyberlaserQkdVault } from './components/KyberlaserQkdVault';
import { audioController } from './services/audioService';
import { Coordinates, Satellite, LookAngles, WeatherCondition, MainView, SatelliteStatus, TacticalEvent } from './types';
import { COMMON_SATELLITES } from './constants';
import { calculateLookAngles } from './utils/geoUtils';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, saveUserSettingsToCloud, loadUserSettingsFromCloud, saveEventToCloud, fetchEventsFromCloud, testFirebaseConnection } from './services/firebaseService';

const STORAGE_KEY = 'satexpert_tactical_v6';
const STEALTH_STORAGE_KEY = 'satexpert_stealth_mode';
const EVENT_LOG_STORAGE_KEY = 'satexpert_event_logs';

interface ViewWrapperProps {
  currentView: string;
  targetView: string;
  visitedViews: Record<string, boolean>;
  children: React.ReactNode;
}

const ViewWrapper: React.FC<ViewWrapperProps> = ({ currentView, targetView, visitedViews, children }) => {
  if (!visitedViews[targetView]) return null;
  return (
    <div className={currentView === targetView ? 'block' : 'hidden'} style={{ height: '100%' }}>
      {children}
    </div>
  );
};

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
  
  // Real-time ticking heartbeat state
  const [tick, setTick] = useState<number>(0);

  // Keep-alive tracker to preserve active tool states across view changes
  const [visitedViews, setVisitedViews] = useState<Record<string, boolean>>({
    sentinel_core: true
  });

  useEffect(() => {
    setVisitedViews(prev => {
      if (prev[view]) return prev;
      return { ...prev, [view]: true };
    });
  }, [view]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
      
      // Real-time fluctuating satellite orbital parameters dynamically so stats update live
      setSatellites(prevSats => {
        return prevSats.map(sat => {
          const apogeeDiff = (Math.random() - 0.5) * 4;
          const perigeeDiff = (Math.random() - 0.5) * 4;
          const velocityDiff = (Math.random() - 0.5) * 0.006;
          const longitudeDiff = (Math.random() - 0.5) * 0.003;
          return {
            ...sat,
            apogee: Math.max(30000, Math.min(41000, Math.round((sat.apogee + apogeeDiff) * 10) / 10)),
            perigee: Math.max(30000, Math.min(41000, Math.round((sat.perigee + perigeeDiff) * 10) / 10)),
            velocity: Math.max(1.5, Math.min(6.5, Math.round((sat.velocity + velocityDiff) * 1000) / 1000)),
            longitude: Math.max(-180, Math.min(180, Math.round((sat.longitude + longitudeDiff) * 10000) / 10000))
          };
        });
      });

      // Atmospheric/Meteorological Drift: 5% chance of slow weather fluctuation (realistic rain-fade simulation)
      if (Math.random() < 0.05) {
        const climateStates: WeatherCondition[] = ['CLEAR', 'OVERCAST', 'LIGHT_RAIN', 'HEAVY_STORM'];
        setWeather(current => {
          const currentIndex = climateStates.indexOf(current);
          const nextIndex = (currentIndex + (Math.random() < 0.5 ? -1 : 1) + climateStates.length) % climateStates.length;
          return climateStates[nextIndex];
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync selectedSat references with real-time updates from satellites array
  useEffect(() => {
    const freshSelected = satellites.find(s => s.id === selectedSat.id);
    if (freshSelected) {
      setSelectedSat(freshSelected);
    }
  }, [satellites, selectedSat.id]);

  // Global Event Log State
  const [eventLogs, setEventLogs] = useState<TacticalEvent[]>([]);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  const isFirstMount = useRef(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Authentication & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  const addMissionLog = useCallback((detail: string, status: TacticalEvent['status'] = 'active') => {
    const newEvent: TacticalEvent = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      satName: selectedSat.name,
      satId: selectedSat.id,
      status: status,
      detail: detail
    };
    
    // Log event to cloud Firestore asynchronously if operator is authenticated
    const uid = auth.currentUser?.uid;
    if (uid) {
      saveEventToCloud(uid, newEvent).catch(err => console.error("Cloud operation audit failure:", err));
    }

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
  }, [weather, isJamming, jammingPower, defcon, isStealthMode, isNeuralCleaning, isZPEActive, tick]);

  // Auth state listener and initial cloud-load effect
  useEffect(() => {
    testFirebaseConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingCloud(true);
        try {
          const cloudSettings = await loadUserSettingsFromCloud(user.uid);
          if (cloudSettings) {
            setUserLoc({ lat: cloudSettings.lat, lng: cloudSettings.lng });
            setDefcon(cloudSettings.defcon);
            setIsStealthMode(cloudSettings.isStealthMode);
            if (cloudSettings.selectedSatId) {
              const sat = COMMON_SATELLITES.find(s => s.id === cloudSettings.selectedSatId);
              if (sat) setSelectedSat(sat);
            }
          } else {
            // First time sync initialized with current client parameters
            await saveUserSettingsToCloud(user.uid, {
              lat: userLoc.lat,
              lng: userLoc.lng,
              selectedSatId: selectedSat.id,
              defcon: defcon,
              isStealthMode: isStealthMode,
              updatedAt: new Date().toISOString()
            });
          }

          const cloudLogs = await fetchEventsFromCloud(user.uid);
          if (cloudLogs && cloudLogs.length > 0) {
            setEventLogs(cloudLogs);
          }
        } catch (error) {
          console.error("Failed to fetch custom settings from Cloud:", error);
        } finally {
          setIsLoadingCloud(false);
        }
      } else {
        // Fallback to local storage if no user authenticated
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.loc) setUserLoc(parsed.loc);
          if (parsed.satId) {
            const sat = COMMON_SATELLITES.find(s => s.id === parsed.satId);
            if (sat) setSelectedSat(sat);
          }
          setDefcon(parsed.defcon || 5);
        }
        const savedStealth = localStorage.getItem(STEALTH_STORAGE_KEY);
        if (savedStealth !== null) setIsStealthMode(JSON.parse(savedStealth));

        const savedLogs = localStorage.getItem(EVENT_LOG_STORAGE_KEY);
        if (savedLogs) setEventLogs(JSON.parse(savedLogs));
      }
    });

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
      unsubscribe();
      window.removeEventListener('mousedown', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('nav-view', handleNavView);
    };
  }, []);

  const reloadAppCloudSettings = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const cloudConfig = await loadUserSettingsFromCloud(user.uid);
      if (cloudConfig) {
        setUserLoc({ lat: cloudConfig.lat, lng: cloudConfig.lng });
        setSelectedSat(satellites.find(s => s.id === cloudConfig.selectedSatId) || satellites[0]);
        setDefcon(cloudConfig.defcon);
        setIsStealthMode(cloudConfig.isStealthMode);
        const cloudEvents = await fetchEventsFromCloud(user.uid);
        if (cloudEvents && cloudEvents.length > 0) {
          setEventLogs(cloudEvents);
        }
      }
    } catch (error) {
      console.error("Refresh fail:", error);
    }
  }, [satellites]);

  // Sync to local storage & Cloud on settings mutation
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ loc: userLoc, satId: selectedSat.id, defcon }));
    
    if (currentUser && !isLoadingCloud) {
      saveUserSettingsToCloud(currentUser.uid, {
        lat: userLoc.lat,
        lng: userLoc.lng,
        selectedSatId: selectedSat.id,
        defcon: defcon,
        isStealthMode: isStealthMode,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Cloud synchronization mismatch:", err));
    }
  }, [userLoc, selectedSat, defcon, currentUser, isLoadingCloud]);

  useEffect(() => {
    if (!isFirstMount.current) {
      localStorage.setItem(STEALTH_STORAGE_KEY, JSON.stringify(isStealthMode));
      
      if (currentUser && !isLoadingCloud) {
        saveUserSettingsToCloud(currentUser.uid, {
          lat: userLoc.lat,
          lng: userLoc.lng,
          selectedSatId: selectedSat.id,
          defcon: defcon,
          isStealthMode: isStealthMode,
          updatedAt: new Date().toISOString()
        }).catch(err => console.error("Cloud synchronization mismatch (stealth):", err));
      }
    }
  }, [isStealthMode, currentUser, isLoadingCloud]);

  useEffect(() => {
    localStorage.setItem(EVENT_LOG_STORAGE_KEY, JSON.stringify(eventLogs));
  }, [eventLogs]);

  useEffect(() => {
    // Add micro-fractional jitter to simulate real-time Earth station active signal tracking
    const computed = calculateLookAngles(userLoc, selectedSat.longitude);
    setLookAngles({
      ...computed,
      azimuth: computed.azimuth + (Math.sin(Date.now() / 2000) * 0.015),
      elevation: computed.elevation + (Math.cos(Date.now() / 2000) * 0.015),
      skew: computed.skew + (Math.sin(Date.now() / 3000) * 0.005),
      distance: computed.distance + (Math.sin(Date.now() / 5000) * 0.2)
    });
  }, [userLoc, selectedSat, tick]);

  const VIEW_CATEGORIES = [
    { name: 'TACTICAL_BASE', views: ['tactical', 'constellation', 'satellite_detail', 'mesh', 'weather', 'geolocator', 'cloud_portal', 'sar_recon'] },
    { name: 'SENTINEL_AI', views: ['sentinel_core', 'quantum_intel_hub', 'palantir_audit', 'bug_bounty_lab'] },
    { name: 'SIGINT_SUITE', views: ['intelligence', 'interception', 'node_scanner', 'spoof_tracer', 'threat_dossier', 'yara_scanner', 'sniffer', 'analyzer', 'specter', 'traps', 'radio_intercept', 'quantum_decryptor', 'biometric_scanner', 'quantum_timeline', 'nmap_scan'] },
    { name: 'ACTIVE_OPS', views: ['tactical_suite', 'warfare', 'planner', 'neural', 'orbital_strike', 'drone_swarm', 'swarm_intelligence', 'kill_chain', 'cyber_attack', 'signal_jamming', 'botnet_command', 'script_env', 'remote_access', 'purple_team', 'zero_day_forge', 'apt_simulator', 'social_toolkit', 'ransomware_sim', 'scada_sc', 'deepfake_comms', 'dark_link', 'wifi_countermeasures', 'electromagnetic_pulse', 'ai_automated_exploit'] },
    { name: 'CYBER_CMD', views: ['defense', 'simulation', 'aegis', 'usb_manager', 'vsat_config', 'grover', 'quantum_entanglement', 'lasercom_qkd'] },
    { name: 'AUX_DATA', views: ['media', 'live', 'calculations', 'terrain', 'news'] }
  ];

  return (
    <div className={`crt-screen min-h-screen bg-[#030712] text-slate-200 ${(!isStealthMode && (isJamming || defcon === 1)) ? 'crt-distorted' : ''}`}>
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
                
                <div className="flex xl:grid xl:grid-cols-5 flex-wrap gap-4 xl:gap-8 max-h-[300px] xl:max-h-none overflow-y-auto w-full custom-scrollbar">
                  {VIEW_CATEGORIES.map(cat => (
                    <div key={cat.name} className="space-y-2 min-w-[200px] flex-1">
                       <div className="flex items-center justify-between mx-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat.name}</span>
                          <div className="w-8 h-[1px] bg-slate-800"></div>
                       </div>
                       <div className="flex flex-wrap gap-1.5 p-1">
                          {cat.views.map((v) => (
                            <button
                              key={v}
                              onClick={() => setView(v as MainView)}
                              className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap overflow-hidden text-ellipsis ${
                                view === v 
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105 z-10' 
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
            <ViewWrapper currentView={view} targetView="tactical" visitedViews={visitedViews}>
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
                      <SitrepBoard selectedSatellite={selectedSat} defcon={defcon} eventLogs={eventLogs} />
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
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="constellation" visitedViews={visitedViews}>
              <ConstellationView 
                satellites={satellites} 
                selectedSat={selectedSat} 
                onSatSelect={(sat) => {
                  setSelectedSat(sat);
                  setView('satellite_detail');
                }} 
                isStealthMode={isStealthMode} 
              />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="satellite_detail" visitedViews={visitedViews}>
              <SatelliteDetail 
                satellite={selectedSat} 
                lookAngles={lookAngles} 
                isStealthMode={isStealthMode} 
                isJamming={isJamming} 
                jammingPower={jammingPower}
                weather={weather}
              />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="intelligence" visitedViews={visitedViews}>
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
            </ViewWrapper>
            
            <ViewWrapper currentView={view} targetView="interception" visitedViews={visitedViews}>
              <SignalInterceptor isJamming={isJamming} jammingPower={jammingPower} isStealthMode={isStealthMode} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="warfare" visitedViews={visitedViews}>
              <ElectronicWarfare 
                isStealthMode={isStealthMode} 
                isJamming={isJamming} 
                jammingPower={jammingPower} 
                onToggleJamming={setIsJamming} 
                onSetJammingPower={setJammingPower} 
                currentUser={currentUser}
                selectedSat={selectedSat}
              />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="neural" visitedViews={visitedViews}>
              <NeuralProcessor />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="planner" visitedViews={visitedViews}>
              <MissionPlanner />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="traps" visitedViews={visitedViews}>
              <TrapManagement />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="sniffer" visitedViews={visitedViews}>
              <TrafficSniffer isStealthMode={isStealthMode} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="aegis" visitedViews={visitedViews}>
              <AegisC2 />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="grover" visitedViews={visitedViews}>
              <GroverVisualizer />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="quantum_entanglement" visitedViews={visitedViews}>
              <div className="max-w-4xl mx-auto">
                <QuantumEntanglementComms />
              </div>
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="vsat_config" visitedViews={visitedViews}>
              <VSATConfig />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="specter" visitedViews={visitedViews}>
              <SpectralCanary />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="analyzer" visitedViews={visitedViews}>
              <SpectrumAnalyzer />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="mesh" visitedViews={visitedViews}>
              <ConnectivityMesh satellites={satellites} selectedSat={selectedSat} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="weather" visitedViews={visitedViews}>
              <WeatherDashboard weather={weather} loc={userLoc} satName={selectedSat.name} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="media" visitedViews={visitedViews}>
              <MediaForge />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="live" visitedViews={visitedViews}>
              <LiveComms isStealthMode={isStealthMode} addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="geolocator" visitedViews={visitedViews}>
              <IPGeolocator />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="tactical_suite" visitedViews={visitedViews}>
              <AdvancedTacticalSuite />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="usb_manager" visitedViews={visitedViews}>
              <USBDeviceManager />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="node_scanner" visitedViews={visitedViews}>
              <NodeScanner />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="spoof_tracer" visitedViews={visitedViews}>
              <SpoofTracer />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="threat_dossier" visitedViews={visitedViews}>
              <ThreatDossier />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="yara_scanner" visitedViews={visitedViews}>
              <YARAScanner />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="nmap_scan" visitedViews={visitedViews}>
              <NmapScanner />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="orbital_strike" visitedViews={visitedViews}>
              <OrbitalStriker addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="drone_swarm" visitedViews={visitedViews}>
              <DroneSwarmCommand addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="swarm_intelligence" visitedViews={visitedViews}>
              <div className="max-w-6xl mx-auto">
                <SwarmIntelligenceDashboard />
              </div>
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="kill_chain" visitedViews={visitedViews}>
              <CyberKillChain addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="cyber_attack" visitedViews={visitedViews}>
              <CyberAttackSuite addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="signal_jamming" visitedViews={visitedViews}>
              <SignalJammer addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="botnet_command" visitedViews={visitedViews}>
              <BotnetCommand addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="radio_intercept" visitedViews={visitedViews}>
              <RadioInterceptSuite addMissionLog={addMissionLog} />
            </ViewWrapper>
            
            <ViewWrapper currentView={view} targetView="quantum_decryptor" visitedViews={visitedViews}>
              <QuantumDecryptor addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="biometric_scanner" visitedViews={visitedViews}>
              <BiometricScanner addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="quantum_timeline" visitedViews={visitedViews}>
              <PQCMigrationTimeline />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="quantum_intel_hub" visitedViews={visitedViews}>
              <QuantumIntelligenceHub />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="palantir_audit" visitedViews={visitedViews}>
              <PalantirAuditSuite />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="bug_bounty_lab" visitedViews={visitedViews}>
              <BugBountyLab />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="sentinel_core" visitedViews={visitedViews}>
              <SentinelAIControl />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="purple_team" visitedViews={visitedViews}>
              <PurpleTeamArsenal />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="script_env" visitedViews={visitedViews}>
              <TacticalScriptEnv addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="remote_access" visitedViews={visitedViews}>
              <RemoteAccessTerminal addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="zero_day_forge" visitedViews={visitedViews}>
              <ZeroDayForge />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="apt_simulator" visitedViews={visitedViews}>
              <AptLateralTracker />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="social_toolkit" visitedViews={visitedViews}>
              <PhishingCampaignManager />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="ransomware_sim" visitedViews={visitedViews}>
              <RansomwareSim />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="scada_sc" visitedViews={visitedViews}>
              <SCADAExploit />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="deepfake_comms" visitedViews={visitedViews}>
              <DeepfakeComms />
            </ViewWrapper>
            
            <ViewWrapper currentView={view} targetView="wifi_countermeasures" visitedViews={visitedViews}>
              <WifiCountermeasures />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="electromagnetic_pulse" visitedViews={visitedViews}>
              <ElectromagneticPulse addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="ai_automated_exploit" visitedViews={visitedViews}>
              <AIAutomatedExploit addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="sar_recon" visitedViews={visitedViews}>
              <SARImagingSuite addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="lasercom_qkd" visitedViews={visitedViews}>
              <KyberlaserQkdVault addMissionLog={addMissionLog} />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="dark_link" visitedViews={visitedViews}>
              <DarkLinkProtocol />
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="defense" visitedViews={visitedViews}>
              <div className="max-w-6xl mx-auto">
                <QuantumDefense isStealthMode={isStealthMode} addMissionLog={addMissionLog} />
              </div>
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="simulation" visitedViews={visitedViews}>
              <div className="max-w-6xl mx-auto">
                <WarGamesSimulator satName={selectedSat.name} />
              </div>
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="terrain" visitedViews={visitedViews}>
              {lookAngles && (
                <div className="max-w-4xl mx-auto">
                  <TerrainObstruction angles={lookAngles} />
                </div>
              )}
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="calculations" visitedViews={visitedViews}>
              {lookAngles && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <TerrainObstruction angles={lookAngles} />
                  <LinkBudgetCalculator distance={lookAngles.distance} isStealthMode={isStealthMode} />
                </div>
              )}
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="news" visitedViews={visitedViews}>
              <div className="max-w-4xl mx-auto">
                <RSSReader />
              </div>
            </ViewWrapper>

            <ViewWrapper currentView={view} targetView="cloud_portal" visitedViews={visitedViews}>
              <div className="max-w-6xl mx-auto">
                <CloudSyncPortal 
                  userLoc={userLoc} 
                  selectedSatId={selectedSat.id} 
                  defcon={defcon} 
                  isStealthMode={isStealthMode} 
                  addMissionLog={addMissionLog}
                  onRefreshSettings={reloadAppCloudSettings}
                />
              </div>
            </ViewWrapper>
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
