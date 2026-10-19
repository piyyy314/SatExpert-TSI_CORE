import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Cloud, RefreshCw, Wifi, UserCheck, Server, Database, 
  Cpu, Settings2, Activity, HardDrive, Lock, AlertTriangle, Shield, Check, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  testFirebaseConnection, 
  loadUserSettingsFromCloud, 
  saveUserSettingsToCloud, 
  fetchEventsFromCloud 
} from '../services/firebaseService';
import { firebaseConfig, maskSecretKey } from '../services/firebaseConfig';
import { TacticalEvent } from '../types';

interface CloudSyncPortalProps {
  userLoc: { lat: number; lng: number };
  selectedSatId: string;
  defcon: number;
  isStealthMode: boolean;
  addMissionLog?: (detail: string, status?: 'active' | 'offline' | 'maintenance' | 'decommissioned' | 'CRITICAL' | 'BREACH' | 'INFO' | 'STRIKE') => void;
  onRefreshSettings?: () => void;
}

export const CloudSyncPortal: React.FC<CloudSyncPortalProps> = ({
  userLoc,
  selectedSatId,
  defcon,
  isStealthMode,
  addMissionLog,
  onRefreshSettings
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isTestingConn, setIsTestingConn] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'ONLINE' | 'OFFLINE' | 'UNKNOWN'>('UNKNOWN');
  const [recentCloudLogs, setRecentCloudLogs] = useState<TacticalEvent[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [activeSyncing, setActiveSyncing] = useState<boolean>(false);
  const [syncMetric, setSyncMetric] = useState<{ reads: number; writes: number; payloadSize: number }>({
    reads: 4,
    writes: 2,
    payloadSize: 256
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadLogs(user.uid);
      } else {
        setRecentCloudLogs([]);
      }
    });

    handleTestDiagnostics();

    return () => unsubscribe();
  }, []);

  const handleTestDiagnostics = async () => {
    setIsTestingConn(true);
    const start = performance.now();
    try {
      const isConnected = await testFirebaseConnection();
      const end = performance.now();
      if (isConnected) {
        setLatency(Math.round(end - start));
        setDbStatus('ONLINE');
      } else {
        setLatency(null);
        setDbStatus('OFFLINE');
      }
    } catch {
      setLatency(null);
      setDbStatus('OFFLINE');
    } finally {
      setIsTestingConn(false);
    }
  };

  const loadLogs = async (uid: string) => {
    setIsLoadingLogs(true);
    try {
      const events = await fetchEventsFromCloud(uid);
      setRecentCloudLogs(events);
    } catch (err) {
      console.error("Failed to load cloud portal logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const forceTriggerManualSync = async () => {
    if (!currentUser) return;
    setActiveSyncing(true);
    try {
      await saveUserSettingsToCloud(currentUser.uid, {
        lat: userLoc.lat,
        lng: userLoc.lng,
        selectedSatId: selectedSatId,
        defcon: defcon,
        isStealthMode: isStealthMode,
        updatedAt: new Date().toISOString()
      });
      setSyncMetric(prev => ({
        reads: prev.reads + 1,
        writes: prev.writes + 1,
        payloadSize: prev.payloadSize + 312
      }));
      await loadLogs(currentUser.uid);
      if (addMissionLog) {
        addMissionLog("Manual cloud user preset synchronization completed.", "INFO");
      }
    } catch (error) {
      console.error("Manual sync fail:", error);
    } finally {
      setTimeout(() => setActiveSyncing(false), 800);
    }
  };

  const forceSyncFromCloud = async () => {
    if (!currentUser) return;
    setActiveSyncing(true);
    try {
      const remote = await loadUserSettingsFromCloud(currentUser.uid);
      if (remote) {
        if (onRefreshSettings) {
          onRefreshSettings();
        }
        setSyncMetric(prev => ({
          ...prev,
          reads: prev.reads + 1
        }));
        if (addMissionLog) {
          addMissionLog(`Synced database params down from Cloud: DEFCON ${remote.defcon}, Satellite Slot ${remote.selectedSatId}`, "INFO");
        }
      }
    } catch (error) {
      console.error("Sync down failure:", error);
    } finally {
      setTimeout(() => setActiveSyncing(false), 800);
    }
  };

  return (
    <div className="glass p-8 rounded-[32px] border-2 border-cyan-500/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Server className="w-48 h-48 text-cyan-400" />
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
            <Cloud className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Tactical Cloud Sync Command</h2>
            <p className="text-xs font-mono text-slate-500">FIREBASE INTEGRATION PORTAL // LIVE DATA PORTABILITY GATEWAY</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestDiagnostics}
            disabled={isTestingConn}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-cyan-500/40 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isTestingConn ? 'animate-spin' : ''}`} />
            <span>Diagnose_Core</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Diagnostics Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/60 flex flex-col space-y-4">
            <h3 className="text-[11px] font-black text-cyan-500 uppercase tracking-widest flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Database_Diagnostics</span>
            </h3>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">PROJECT ID:</span>
                <span className="text-cyan-400 font-bold">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">DATABASE ID:</span>
                <span className="text-slate-400 font-semibold">{firebaseConfig.firestoreDatabaseId || '(default)'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">SERVER CLOUD:</span>
                <span className="text-emerald-500 font-semibold">FIRESTORE_NATIVE</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">LATENCY:</span>
                <span className={latency !== null && latency < 150 ? 'text-green-400' : 'text-amber-500'}>
                  {latency !== null ? `${latency.toFixed(0)} ms` : 'STALE_LINK'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">API KEY SHIELD:</span>
                <span className="text-cyan-400 font-mono text-[11px] font-bold">
                  {maskSecretKey(firebaseConfig.apiKey)}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">LINK SECURITY:</span>
                <span className="text-purple-400 flex items-center space-x-1">
                  <Lock className="w-3 h-3 inline mr-1" />
                  <span>mTLS // ENCRYPT</span>
                </span>
              </div>
            </div>

            <div className="pt-3">
              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                <Wifi className={`w-4 h-4 ${dbStatus === 'ONLINE' ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`} />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-black tracking-wider uppercase">CONNECTION STATE:</span>
                  <span className={`text-[10px] font-black tracking-widest ${dbStatus === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dbStatus === 'ONLINE' ? '● LINK_ESTABLISHED' : '● SECURE_DISCONNECTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication metrics card */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/60 flex flex-col space-y-4">
            <h3 className="text-[11px] font-black text-cyan-500 uppercase tracking-widest flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Operator_Authentication</span>
            </h3>

            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                  {currentUser.photoURL && (
                    <img src={currentUser.photoURL} alt={currentUser.displayName || "Operator"} className="w-8 h-8 rounded-full border border-cyan-500/40" referrerPolicy="no-referrer" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap">{currentUser.displayName || "SECURE_OP_VAL"}</span>
                    <span className="text-[8px] font-mono text-emerald-400">{currentUser.email}</span>
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">OPERATOR ID (UID):</span>
                    <span className="text-slate-400 text-right select-all max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{currentUser.uid}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">VERIFIED FLAG:</span>
                    <span className={currentUser.emailVerified ? 'text-emerald-400' : 'text-amber-500'}>
                      {currentUser.emailVerified ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">AUTH PROVIDER ID:</span>
                    <span className="text-cyan-400 font-bold">{currentUser.providerId}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">SESSION AUTH:</span>
                    <span className="text-emerald-400 font-bold">MUTUAL_SESSION_ACTIVE</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <Shield className="w-10 h-10 text-amber-500/40 mb-3 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GUEST OPERATION MODE</span>
                <span className="text-[8px] text-slate-500 max-w-[190px] leading-relaxed">Sign in to cloud synchronization from the top-right console to deploy automated live cloud storage operations and mission trace backups.</span>
              </div>
            )}
          </div>
        </div>

        {/* Sync Controls & Sandbox */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-6">
            <div className="flex sm:items-center justify-between border-b border-slate-800/80 pb-4 flex-col sm:flex-row gap-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-cyan-400" />
                <span>Synchronize_Parameters_Sandbox</span>
              </h3>
              <div className="flex items-center space-x-1.5 text-[8px] font-mono text-slate-500">
                <span>LAST_SYNC_TUT_ID:</span>
                <span className="text-emerald-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded">0xFC-01</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block mb-1">ACTIVE LATITUDE</span>
                  <p className="text-base font-black text-white font-mono">{userLoc.lat.toFixed(6)} °N</p>
                </div>
                <div className="h-px bg-slate-900 my-2"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block mb-1">ACTIVE LONGITUDE</span>
                  <p className="text-base font-black text-white font-mono">{userLoc.lng.toFixed(6)} °E</p>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block mb-1">DEFCON LEVEL</span>
                  <p className="text-base font-black text-red-500 font-mono">LEVEL {defcon}</p>
                </div>
                <div className="h-px bg-slate-900 my-2"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block mb-1">STEALTH OPTION</span>
                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${isStealthMode ? 'bg-purple-950 text-purple-400 border border-purple-800/40 animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800/40'}`}>
                    {isStealthMode ? 'ACTIVE_MASK' : 'NOMINAL_UPLINK'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between space-y-3">
                <span className="text-[8px] text-slate-500 font-bold tracking-wider uppercase">SIMULATED TRANS. QUOTA</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>TRANSACTIONS:</span>
                    <span>{syncMetric.reads + syncMetric.writes} / 1000</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500" 
                      style={{ width: `${Math.min(100, ((syncMetric.reads + syncMetric.writes) / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-400">
                  <span>STORAGE EXP:</span>
                  <span>{(syncMetric.payloadSize / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={forceTriggerManualSync}
                disabled={!currentUser || activeSyncing}
                className={`flex-grow md:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl uppercase tracking-widest text-[9px] font-black cursor-pointer transition-all ${
                  !currentUser 
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${activeSyncing ? 'animate-bounce' : ''}`} />
                <span>{activeSyncing ? 'Synchronizing...' : 'UPLOAD_SETTINGS_TO_CLOUD'}</span>
              </button>

              <button
                onClick={forceSyncFromCloud}
                disabled={!currentUser || activeSyncing}
                className={`flex-grow md:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl uppercase tracking-widest text-[9px] font-black cursor-pointer transition-all ${
                  !currentUser 
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    : 'bg-slate-950 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-slate-900/60'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>PULL_SETTINGS_FROM_CLOUD</span>
              </button>

              {!currentUser && (
                <div className="w-full bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl flex items-start space-x-3.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-amber-400/80 leading-relaxed uppercase tracking-wider font-mono">
                    CRITICAL: OPERATOR NOT LOGGED IN. SYNC SYSTEM IS CURRENTLY OFFLINE. BACKUP SAVED ONLY LOCALLY TO WINDOWS_REG VFS.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cloud Logs */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex-grow flex flex-col min-h-[250px]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2 border-b border-slate-800/80 pb-4 mb-4">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Cloud_Synced_Audit_Logs</span>
            </h3>

            <div className="flex-grow overflow-y-auto max-h-[220px] space-y-2.5 custom-scrollbar pr-1">
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center h-44 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-[9px] uppercase tracking-widest font-mono">Querying Firestore documents...</span>
                </div>
              ) : recentCloudLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                  <Globe className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                  <span className="text-[9px] uppercase tracking-widest font-mono">No operational logs synced to cloud storage.</span>
                </div>
              ) : (
                recentCloudLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-4 font-mono">
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 border rounded uppercase ${
                          log.status === 'CRITICAL' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                          log.status === 'BREACH' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                          'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-200 uppercase leading-normal font-bold">{log.detail}</p>
                      <p className="text-[7px] text-slate-600 font-semibold tracking-wider">SATID: {log.satId} // SATNAME: {log.satName}</p>
                    </div>
                    <span className="text-[7.5px] bg-slate-900 border border-slate-800 px-1.5 py-1 text-slate-500 rounded font-black shrink-0">
                      ID: {log.id}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
