
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Eye, Target, Shield, Search, AlertCircle, Fingerprint, Database, Activity } from 'lucide-react';

interface TargetProfile {
  id: string;
  name: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  lastSeen: string;
  location: string;
  tags: string[];
}

const MOCK_TARGETS: TargetProfile[] = [
  { id: 'TGT-8842', name: 'Unknown_Subject_Alpha', threatLevel: 'HIGH', status: 'WANTED', lastSeen: 'Sector 4 Metro', location: '40.7128°N, 74.0060°W', tags: ['SIGINT', 'CYBER', 'RADIO'] },
  { id: 'TGT-1102', name: 'Agent_Specter_Actual', threatLevel: 'CRITICAL', status: 'ACTIVE', lastSeen: 'Embassy Block', location: '51.5074°N, 0.1278°W', tags: ['STEALTH', 'OFFSITE', 'ELITE'] },
  { id: 'TGT-0492', name: 'Network_Node_42', threatLevel: 'MEDIUM', status: 'STABLE', lastSeen: 'Cloud Data Center', location: '35.6762°N, 139.6503°E', tags: ['INFRA', 'BACKBONE'] }
];

export const BiometricScanner: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTarget, setActiveTarget] = useState<TargetProfile | null>(null);
  const [scanStep, setScanStep] = useState('');

  const performScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setActiveTarget(null);
    setScanStep('Initializing Optical Sensors...');
    if (addMissionLog) {
      addMissionLog("BIO_SCAN: Initiating wide-spectrum biometric survey.", "active");
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const steps = [
      { p: 10, s: 'Calibrating Iris Sensors...' },
      { p: 40, s: 'Extracting Facial Vector Map...' },
      { p: 70, s: 'Querying Global Interpol Database...' },
      { p: 90, s: 'Confirming Biometric Identity...' }
    ];

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + (Math.random() * 2 + 1);
        return next >= 100 ? 100 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (!isScanning) return;
    
    const steps = [
      { p: 10, s: 'Calibrating Iris Sensors...' },
      { p: 40, s: 'Extracting Facial Vector Map...' },
      { p: 70, s: 'Querying Global Interpol Database...' },
      { p: 90, s: 'Confirming Biometric Identity...' }
    ];

    const currentStep = steps.find(s => scanProgress >= s.p && scanProgress < s.p + 5);
    if (currentStep) {
      setScanStep(currentStep.s);
    }

    if (scanProgress >= 100) {
      completeScan();
    }
  }, [scanProgress, isScanning]);

  const completeScan = () => {
    const target = MOCK_TARGETS[Math.floor(Math.random() * MOCK_TARGETS.length)];
    setActiveTarget(target);
    setIsScanning(false);
    setScanStep('');
    if (addMissionLog) {
      addMissionLog(`BIO_CONFIRM: Identity verified: ${target.name} (Threat: ${target.threatLevel})`, "info");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Search & Feed Area */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="glass rounded-[40px] border-slate-800 bg-black relative overflow-hidden h-[500px] shadow-2xl">
           {/* Mock Video Feed */}
           <div className="absolute inset-0 bg-[#05080a] opacity-80 pointer-events-none">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#22d3ee 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }} />
              
              {/* Target Bounding Box Animation */}
              <AnimatePresence>
                {isScanning && !activeTarget && (
                  <motion.div 
                    animate={{ 
                      x: [100, 400, 200, 500, 300], 
                      y: [100, 250, 400, 150, 300],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute w-40 h-48 border-2 border-cyan-500/50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  >
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-500" />
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-500" />
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-500" />
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-500" />
                     <Search className="w-10 h-10 text-cyan-500/20" />
                  </motion.div>
                )}
                {activeTarget && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-4 border-red-500 transition-all flex flex-col items-center justify-center bg-red-500/5 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                  >
                     <div className="p-8 rounded-full bg-slate-900/80 border-2 border-red-500 mb-6 relative">
                        <User className="w-24 h-24 text-red-500" />
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="absolute -inset-2 border-t-2 border-red-500 rounded-full"
                        />
                     </div>
                     <div className="text-center">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Target_Acquired</div>
                        <div className="text-lg font-black text-white uppercase">{activeTarget.name}</div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Scan Overlay UI */}
           <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1 font-mono">Live_Optical_Node_07</span>
                    <span className="text-[8px] text-slate-500 uppercase">Status: SEARCHING_GRID...</span>
                 </div>
                 <div className="flex items-center space-x-6">
                    <div className="text-right">
                       <div className="text-[8px] text-slate-500 uppercase">Detection_Rate</div>
                       <div className="text-[12px] font-black text-white mono">42.2 fps</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center overflow-hidden bg-slate-950">
                       <div className="h-1/2 w-full bg-cyan-500/20 animate-pulse" />
                    </div>
                 </div>
              </div>

              {isScanning && (
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{scanStep}</span>
                      <span className="text-[12px] font-black text-white mono">{scanProgress.toFixed(0)}%</span>
                   </div>
                   <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" initial={{ width: 0 }} animate={{ width: `${scanProgress}%` }} />
                   </div>
                </div>
              )}
           </div>

           {!isScanning && !activeTarget && (
             <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={performScan}
                  className="group relative h-24 w-24 rounded-full bg-cyan-600 flex items-center justify-center transition-all hover:bg-cyan-500 active:scale-95 shadow-2xl shadow-cyan-600/40 pointer-events-auto"
                >
                   <Eye className="w-10 h-10 text-slate-950" />
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="absolute -inset-4 border-2 border-cyan-500 rounded-full"
                   />
                </button>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-2">
                 <Fingerprint className="w-4 h-4 text-cyan-500" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biometric_Telemetry</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Ocular_Match', val: isScanning ? '98.2%' : '0.0%' },
                   { label: 'Voice_Print', val: isScanning ? '84.5%' : '0.0%' },
                   { label: 'Gait_Analysis', val: isScanning ? '72.1%' : '0.0%' },
                   { label: 'Bio_Resync', val: isScanning ? 'Active' : 'Idle' }
                 ].map(s => (
                   <div key={s.label}>
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-1">{s.label}</div>
                      <div className="text-[12px] font-black text-white mono">{s.val}</div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-2">
                 <Shield className="w-4 h-4 text-emerald-500" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity_Sanitizer</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Anonymity_Layer</span>
                    <span className="text-[9px] font-black text-emerald-400">ENABLED</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Traffic_Relay</span>
                    <span className="text-[9px] font-black text-cyan-400">TOR_ENABLED</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Target Details Panel */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
         <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 flex-grow flex flex-col h-0">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-slate-800 pb-4">Target_Dossier_Alpha</h3>
            
            <div className="flex-grow overflow-y-auto space-y-8 pr-2 custom-scrollbar">
               {activeTarget ? (
                 <>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-black">Threat_Vector</span>
                            <span className={`text-[11px] font-black ${activeTarget.threatLevel === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{activeTarget.threatLevel}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-500 uppercase font-black">Designation</span>
                            <span className="text-[11px] font-black text-white">{activeTarget.id}</span>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="text-[9px] text-slate-500 uppercase font-black">Last_Known_Location</div>
                         <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-medium">
                            {activeTarget.lastSeen}
                            <div className="text-[8px] text-cyan-500 mt-1 font-mono uppercase tracking-tighter">{activeTarget.location}</div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="text-[9px] text-slate-500 uppercase font-black">Known_Associations</div>
                         <div className="flex flex-wrap gap-2">
                            {activeTarget.tags.map(t => (
                              <span key={t} className="px-2 py-1 rounded bg-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">{t}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button className="w-full py-4 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                      Mark_For_Surveillance
                   </button>
                 </>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center px-4">
                    <Database className="w-12 h-12 mb-4 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Active Target Identified</span>
                    <p className="text-[9px] mt-2 leading-relaxed">Initiate optical sweep to populate biometric database with real-time subject telemetry.</p>
                 </div>
               )}
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <div className="flex items-center space-x-2 text-amber-500 mb-4">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">System_Calibration</span>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-[8px] text-slate-500 uppercase">Model_Parity</span>
                  <span className="text-[10px] font-black text-emerald-400 mono">99.99%</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-[8px] text-slate-500 uppercase">GPU_Load</span>
                  <span className="text-[10px] font-black text-amber-500 mono">{isScanning ? '88%' : '4%'}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
