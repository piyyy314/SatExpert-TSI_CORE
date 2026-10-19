
import * as React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback, useTransition } from 'react';
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
import { ShieldCheck, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
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
import { calculateSimulatedOrbitalDrift, hasMeaningfulOrbitalDrift, debounce } from './utils/orbitalScheduler';
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
  const [, startOrbitalTransition] = useTransition();
  const [view, setView] = useState<MainView>('sentinel_core');
  const [activeCategory, setActiveCategory] = useState<string>('SENTINEL_AI');
  const [isBridgeExpanded, setIsBridgeExpanded] = useState<boolean>(true);
  const [defcon, setDefcon] = useState<number>(5);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherCondition>('CLEAR');
  const [isJamming, setIsJamming] = useState<boolean>(false);
  const [jammingPower, setJammingPower] = useState<number>(50);
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);
  const [isNeuralCleaning, setIsNeuralCleaning] = useState(false);
  const [isDecoyActive, setIsDecoyActive] = useState(false);
  const [isZPEActive, setIsZPEActive] = useState(false);
  const [isThermalDecoyActive, setIsThermalDecoyActive] = useState(false);
  const [thermalDecoySecondsRemaining, setThermalDecoySecondsRemaining] = useState(0);
  
  // Real-time ticking heartbeat state
  const [tick, setTick] = useState<number>(0);

  // Debounced satellite orbital parameter updater
  const debouncedSetSatellites = useMemo(() => {
    return debounce((newSats: Satellite[] | ((prev: Satellite[]) => Satellite[])) => {
      startOrbitalTransition(() => {
        setSatellites(newSats);
      });
    }, 1500);
  }, []);

  // Cleanup debouncer on unmount
  useEffect(() => {
    return () => {
      debouncedSetSatellites.cancel();
    };
  }, [debouncedSetSatellites]);

  // Handler for external / HUD satellite updates with debounced batching
  const handleSatellitesUpdate = useCallback((newSats: Satellite[]) => {
    debouncedSetSatellites((prevSats) => {
      let hasChanges = false;
      const merged = prevSats.map((sat) => {
        const incoming = newSats.find((s) => s.id === sat.id);
        if (incoming && (incoming.status !== sat.status || hasMeaningfulOrbitalDrift(sat, incoming))) {
          hasChanges = true;
          return { ...sat, ...incoming };
        }
        return sat;
      });
      return hasChanges ? merged : prevSats;
    });
  }, [debouncedSetSatellites]);

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
    let tickCount = 0;
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
      tickCount += 1;

      // Scheduled debounced orbital parameter drift every 3 ticks
      if (tickCount % 3 === 0) {
        startOrbitalTransition(() => {
          setSatellites(prevSats => calculateSimulatedOrbitalDrift(prevSats));
        });
      }

      // Atmospheric/Meteorological Drift: slow weather fluctuation (realistic rain-fade simulation)
      if (Math.random() < 0.04) {
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

  // Sync selectedSat references with real-time updates from satellites array when meaningful drift occurs
  useEffect(() => {
    const freshSelected = satellites.find(s => s.id === selectedSat.id);
    if (freshSelected && hasMeaningfulOrbitalDrift(selectedSat, freshSelected)) {
      startOrbitalTransition(() => {
        setSelectedSat(freshSelected);
      });
    }
  }, [satellites, selectedSat]);

  // Calibrated tracking ephemeris slot map: satId -> locked longitude
  const [calibratedEphemeris, setCalibratedEphemeris] = useState<{ [satId: string]: number }>(() => {
    const map: { [id: string]: number } = {};
    COMMON_SATELLITES.forEach(s => {
      map[s.id] = s.longitude;
    });
    return map;
  });

  // Calculate current orbital drift of selected satellite relative to its calibrated ephemeris lock
  const calibratedLongitude = calibratedEphemeris[selectedSat.id] ?? selectedSat.longitude;
  const rawDrift = Math.abs(selectedSat.longitude - calibratedLongitude);
  const orbitalDrift = Math.round(rawDrift * 1000) / 1000;
  const isOrbitalDriftAlert = orbitalDrift > 0.05;

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

  // Audio warning sound trigger upon crossing 0.05 units orbital drift threshold
  const prevDriftAlertRef = useRef(false);
  useEffect(() => {
    if (isOrbitalDriftAlert && !prevDriftAlertRef.current) {
      try {
        audioController.playAlert();
      } catch (e) {}
    }
    prevDriftAlertRef.current = isOrbitalDriftAlert;
  }, [isOrbitalDriftAlert]);

  // Re-sync satellite tracking coordinates via Tactical HUD
  const handleResyncTrackingCoordinates = useCallback(() => {
    setCalibratedEphemeris(prev => ({
      ...prev,
      [selectedSat.id]: selectedSat.longitude
    }));
    setIsTracking(true);
    try {
      audioController.playChirp();
    } catch (e) {}
    addMissionLog(
      `ORBITAL_EPHEMERIS_RESYNC: Antenna pointing & satellite tracking coordinates re-synchronized with ${selectedSat.name}. Ephemeris drift cleared from ${orbitalDrift.toFixed(3)} units to 0.000 units.`,
      'active'
    );
  }, [selectedSat, orbitalDrift, addMissionLog]);

  // Simulate/inject orbital drift perturbation exceeding threshold (> 0.05 units)
  const handleSimulateOrbitalDrift = useCallback((delta: number = 0.064) => {
    const nextLong = Math.round((selectedSat.longitude + delta) * 10000) / 10000;
    setSatellites(prevSats => prevSats.map(s => {
      if (s.id === selectedSat.id) {
        return { ...s, longitude: nextLong };
      }
      return s;
    }));
    setSelectedSat(prev => ({
      ...prev,
      longitude: nextLong
    }));
    try {
      audioController.playAlert();
    } catch (e) {}
    addMissionLog(
      `ORBITAL_DRIFT_EXCEEDED: Sentinel AI detected orbital drift perturbation on ${selectedSat.name}. Ephemeris drift +${delta.toFixed(3)} units exceeds 0.050 tolerance. Operator prompted to re-sync coordinates.`,
      'CRITICAL'
    );
  }, [selectedSat, addMissionLog]);

  // 30-Second Thermal Decoy Heat Signature Spoof Timer
  useEffect(() => {
    if (!isThermalDecoyActive) return;
    const timer = setInterval(() => {
      setThermalDecoySecondsRemaining(prev => {
        if (prev <= 1) {
          setIsThermalDecoyActive(false);
          addMissionLog("THERMAL DECOY DISENGAGED: 30s Heat Signature Spoof cycle completed. BUC temperature telemetry normalized. Hostile ISR satellite departed.", "active");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isThermalDecoyActive, addMissionLog]);

  const handleDeployThermalDecoy = useCallback((customDuration: number = 30) => {
    setIsThermalDecoyActive(true);
    setThermalDecoySecondsRemaining(customDuration);
    try {
      audioController.playAlert();
    } catch (e) {}
    addMissionLog(`THERMAL DECOY DEPLOYED: BUC Heat Signature Spoof active [${customDuration}s]. Hostile ISR infrared sensors blinded with phantom thermal bloom on ${selectedSat.name}.`, "STRIKE");
  }, [selectedSat.name, addMissionLog]);

  const handleCancelThermalDecoy = useCallback(() => {
    setIsThermalDecoyActive(false);
    setThermalDecoySecondsRemaining(0);
    try {
      audioController.playChirp();
    } catch (e) {}
    addMissionLog("THERMAL DECOY ABORTED: Operator cancelled Heat Signature Spoof. Telemetry returned to nominal.", "active");
  }, [addMissionLog]);

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

    // Thermal Decoy overrides BUC temperature telemetry during 30-second Heat Signature Spoof mode
    if (isThermalDecoyActive) {
      // Injects high-temperature decoy bloom (186°C - 198°C) to confuse hostile ISR satellites
      bucTemp = 188.5 + (Math.sin(tick * 1.5) * 6.5) + (Math.cos(tick * 0.8) * 3.2);
    }

    return {
      snr: Math.max(0, snr + (Math.random() - 0.5)).toFixed(2),
      rxPower: (rxPower + (Math.random() - 0.5)).toFixed(1),
      bucTemp: (bucTemp + (Math.random() - 0.5)).toFixed(1),
      packetLoss: Math.min(100, packetLoss + (Math.random() * 0.2)).toFixed(2),
      status: isThermalDecoyActive ? "SPOOF_ACTIVE" : (snr > 10 ? "NOMINAL" : (snr > 4 ? "DEGRADED" : "CRITICAL")),
      isThermalDecoyActive,
      thermalDecoySecondsRemaining
    };
  }, [weather, isJamming, jammingPower, defcon, isStealthMode, isNeuralCleaning, isZPEActive, isThermalDecoyActive, thermalDecoySecondsRemaining, tick]);

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
    if (isFirstMount.current) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ loc: userLoc, satId: selectedSat.id, defcon }));
    localStorage.setItem(STEALTH_STORAGE_KEY, JSON.stringify(isStealthMode));
    
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
  }, [userLoc.lat, userLoc.lng, selectedSat.id, defcon, isStealthMode, currentUser, isLoadingCloud]);

  useEffect(() => {
    if (isFirstMount.current) return;
    localStorage.setItem(EVENT_LOG_STORAGE_KEY, JSON.stringify(eventLogs));
  }, [eventLogs]);

  // Memoized look angles calculation with smooth fractional tracking drift
  const lookAngles: LookAngles = useMemo(() => {
    const computed = calculateLookAngles(userLoc, selectedSat.longitude);
    return {
      ...computed,
      azimuth: computed.azimuth + (Math.sin(tick * 0.5) * 0.015),
      elevation: computed.elevation + (Math.cos(tick * 0.5) * 0.015),
      skew: computed.skew + (Math.sin(tick * 0.3) * 0.005),
      distance: computed.distance + (Math.sin(tick * 0.2) * 0.2)
    };
  }, [userLoc.lat, userLoc.lng, selectedSat.longitude, tick]);

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
        <div className="flex flex-col space-y-3.5 sm:space-y-4 max-w-[1600px] mx-auto pb-6 transition-all duration-700">
          
          {/* TSI Tactical Command Bridge (Compact & Ergonomic for Laptop/Desktop Displays) */}
          <div className={`glass p-3 sm:p-3.5 rounded-2xl border border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group ${defcon === 1 || isJamming ? 'defcon-alert' : ''}`}>
             <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <span className="text-[28px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap overflow-hidden">TSI_TACTICAL_BRIDGE</span>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent"></div>
             
             {/* Bridge Top Control Strip: Category Tabs + Quick Defcon + Telemetry + Expand/Collapse */}
             <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 relative z-20">
               {/* Left: Bridge Title & Category Filter Tabs */}
               <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center space-x-2 mr-1">
                   <div className="flex space-x-1">
                     {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></div>)}
                   </div>
                   <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.25em] whitespace-nowrap">BRIDGE_C2</span>
                 </div>

                 {/* Active View Badge */}
                 <div className="bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-lg flex items-center space-x-1.5 shrink-0">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                   <span className="text-[8px] font-mono font-black uppercase text-cyan-200">{view.replace(/_/g, ' ')}</span>
                 </div>

                 {/* Category Tabs */}
                 <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-hide max-w-full">
                   {VIEW_CATEGORIES.map(cat => {
                     const isCurrent = activeCategory === cat.name;
                     return (
                       <button
                         key={cat.name}
                         onClick={() => {
                           setActiveCategory(cat.name);
                           if (!isBridgeExpanded) setIsBridgeExpanded(true);
                         }}
                         className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                           isCurrent
                             ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                             : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 border border-transparent'
                         }`}
                       >
                         {cat.name.replace('_', ' ')} <span className="opacity-50 text-[7px]">({cat.views.length})</span>
                       </button>
                     );
                   })}
                   <button
                     onClick={() => {
                       setActiveCategory('ALL');
                       if (!isBridgeExpanded) setIsBridgeExpanded(true);
                     }}
                     className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                       activeCategory === 'ALL'
                         ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                         : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 border border-transparent'
                     }`}
                   >
                     ALL (64)
                   </button>
                 </div>
               </div>

               {/* Right: Defcon Strip + Telemetry + Toggle Button */}
               <div className="flex items-center justify-between xl:justify-end gap-2.5 shrink-0">
                 {/* Compact DEFCON Selector */}
                 <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                   <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider px-1.5 hidden sm:inline">DEFCON</span>
                   {[1, 2, 3, 4, 5].map(lvl => (
                     <button
                       key={lvl}
                       onClick={() => setDefcon(lvl)}
                       className={`w-5.5 h-5.5 rounded-lg text-[8.5px] font-mono font-black transition-all flex items-center justify-center border cursor-pointer ${
                         defcon === lvl
                           ? (lvl <= 2 ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]')
                           : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                       }`}
                     >
                       {lvl}
                     </button>
                   ))}
                 </div>

                 {/* Telemetry Pulse */}
                 <div className="hidden lg:flex items-center pl-2 border-l border-slate-800/70">
                   <TelemetryPulse telemetry={telemetry} isStealthMode={isStealthMode} />
                 </div>

                 {/* Expand / Collapse Button */}
                 <button
                   onClick={() => setIsBridgeExpanded(!isBridgeExpanded)}
                   className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                   title={isBridgeExpanded ? "Collapse View Selector" : "Expand View Selector"}
                 >
                   {isBridgeExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                 </button>
               </div>
             </div>

             {/* Expanded View Selector Row (Sleek, Compact Pills) */}
             {isBridgeExpanded && (
               <div className="mt-2 pt-2 border-t border-slate-800/60 relative z-20 animate-in fade-in duration-200">
                 {activeCategory === 'ALL' ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
                     {VIEW_CATEGORIES.map(cat => (
                       <div key={cat.name} className="space-y-1">
                         <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">{cat.name}</span>
                         <div className="flex flex-col gap-1">
                           {cat.views.map(v => (
                             <button
                               key={v}
                               onClick={() => setView(v as MainView)}
                               className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all border text-left truncate cursor-pointer ${
                                 view === v
                                   ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                                   : 'text-slate-400 border-slate-900 hover:border-slate-700 hover:text-cyan-400 hover:bg-slate-900/50'
                               }`}
                             >
                               {v.replace(/_/g, ' ')}
                             </button>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-wrap gap-1.5 items-center">
                     {VIEW_CATEGORIES.find(c => c.name === activeCategory)?.views.map(v => (
                       <button
                         key={v}
                         onClick={() => setView(v as MainView)}
                         className={`px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                           view === v
                             ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.35)] font-bold'
                             : 'text-slate-400 border-slate-900/60 hover:border-slate-700 hover:text-cyan-400 hover:bg-slate-900/80 active:scale-95'
                         }`}
                       >
                         {v.replace(/_/g, ' ')}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             )}
          </div>

          {/* Global AI Visual Alert Mechanism for Significant Orbital Drift (> 0.05 units) */}
          {isOrbitalDriftAlert && (
            <div className="rounded-xl border border-red-500 bg-gradient-to-r from-red-950/95 via-[#130306] to-amber-950/90 p-2.5 sm:p-3 shadow-[0_0_25px_rgba(239,68,68,0.35)] animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-600/30 border border-red-500 rounded-lg text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-600">
                      AI SENTINEL ALERT // ORBITAL DRIFT
                    </span>
                    <span className="text-[11px] font-mono font-black text-amber-300">
                      +{orbitalDrift.toFixed(3)} u &gt; 0.050 TOLERANCE
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-200 font-mono mt-0.5 line-clamp-1 sm:line-clamp-none">
                    Ephemeris drift detected on <strong className="text-white">{selectedSat.name}</strong>. Re-sync tracking coordinates via Tactical HUD.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleResyncTrackingCoordinates}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-white hover:to-white text-white hover:text-red-950 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>RE-SYNC</span>
                </button>
                {view !== 'tactical' && (
                  <button
                    onClick={() => setView('tactical')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    TACTICAL HUD
                  </button>
                )}
              </div>
            </div>
          )}

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
                    onSatellitesUpdate={handleSatellitesUpdate} 
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
                    isThermalDecoyActive={isThermalDecoyActive}
                    thermalDecoySecondsRemaining={thermalDecoySecondsRemaining}
                    onDeployThermalDecoy={handleDeployThermalDecoy}
                    onCancelThermalDecoy={handleCancelThermalDecoy}
                    orbitalDrift={orbitalDrift}
                    isDriftAlert={isOrbitalDriftAlert}
                    onResyncTracking={handleResyncTrackingCoordinates}
                    onSimulateDrift={handleSimulateOrbitalDrift}
                    syncedLongitude={calibratedLongitude}
                    weather={weather} 
                    setWeather={setWeather} 
                    isStealthMode={isStealthMode}
                    telemetry={telemetry} 
                    defcon={defcon}
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
              <SentinelAIControl 
                telemetry={telemetry}
                isThermalDecoyActive={isThermalDecoyActive}
                thermalDecoySecondsRemaining={thermalDecoySecondsRemaining}
                onDeployThermalDecoy={handleDeployThermalDecoy}
                onCancelThermalDecoy={handleCancelThermalDecoy}
                selectedSat={selectedSat}
                isJamming={isJamming}
                jammingPower={jammingPower}
                weather={weather}
                addMissionLog={addMissionLog}
                orbitalDrift={orbitalDrift}
                isDriftAlert={isOrbitalDriftAlert}
                onResyncTracking={handleResyncTrackingCoordinates}
                onSimulateDrift={handleSimulateOrbitalDrift}
                calibratedLongitude={calibratedLongitude}
                onNavigateToTacticalHUD={() => setView('tactical')}
              />
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
