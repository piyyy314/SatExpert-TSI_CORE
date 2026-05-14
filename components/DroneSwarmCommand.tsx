
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Radio, Crosshair, Zap, Navigation, Power, Eye, AlertCircle } from 'lucide-react';

interface DroneUnit {
  id: string;
  status: 'ACTIVE' | 'DAMAGED' | 'RECOILING' | 'OFFLINE';
  battery: number;
  lat: number;
  lng: number;
  altitude: number;
  load: 'SIGINT' | 'KINETIC' | 'DECOY';
}

export const DroneSwarmCommand: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [swarmSize, setSwarmSize] = useState(24);
  const [missionType, setMissionType] = useState<'SURVEILLANCE' | 'JAMMING' | 'STRIKE'>('SURVEILLANCE');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentPhase, setDeploymentPhase] = useState(0);
  
  const initialDrones = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: `DRN-${1000 + i}`,
      status: 'ACTIVE' as const,
      battery: 100,
      lat: 51.5074 + (Math.random() - 0.5) * 0.1,
      lng: -0.1278 + (Math.random() - 0.5) * 0.1,
      altitude: 120 + Math.random() * 50,
      load: i % 3 === 0 ? 'SIGINT' : (i % 3 === 1 ? 'KINETIC' : 'DECOY') as any
    }));
  }, []);

  const [drones, setDrones] = useState<DroneUnit[]>(initialDrones);

  useEffect(() => {
    if (!isDeploying) return;
    
    const interval = setInterval(() => {
      setDrones(prev => prev.map(d => {
        if (d.status === 'OFFLINE') return d;
        const drain = missionType === 'STRIKE' ? 1.5 : 0.4;
        const newBattery = Math.max(0, d.battery - (Math.random() * drain));
        return {
          ...d,
          battery: newBattery,
          status: newBattery <= 0 ? 'OFFLINE' : d.status,
          lat: d.lat + (Math.random() - 0.5) * 0.001,
          lng: d.lng + (Math.random() - 0.5) * 0.001,
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDeploying, missionType]);

  const deploySwarm = () => {
    if (isDeploying) {
        setIsDeploying(false);
        if (addMissionLog) addMissionLog("SWARM_RTB: Recalling all units to base.", 'info');
        return;
    }
    
    setIsDeploying(true);
    setDeploymentPhase(0);
    if (addMissionLog) addMissionLog(`SWARM_LAUNCH: Deploying ${swarmSize} units for ${missionType} mission.`, 'active');
    
    const wait = setInterval(() => {
        setDeploymentPhase(p => {
            if (p >= 100) {
                clearInterval(wait);
                return 100;
            }
            return p + 10;
        });
    }, 400);
  };

  const handleExportSwarmLog = () => {
    const logData = {
        metadata: {
            timestamp: new Date().toISOString(),
            status: isDeploying ? 'IN_TENSION' : 'RTB',
            missionType,
            swarmSize
        },
        telemetry: drones
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SWARM_TELEMETRY_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = drones.filter(d => d.status === 'ACTIVE').length;
  const avgBattery = drones.length > 0 ? drones.reduce((acc, d) => acc + d.battery, 0) / drones.length : 0;

  return (
    <div className="flex flex-col space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 col-span-3">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
             <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">C4I_Dronespeak_Interface</h2>
             </div>
             <div className="flex items-center space-x-6">
                <button 
                   onClick={handleExportSwarmLog}
                   className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-900/20 px-3 py-1.5 rounded border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                   Export_JSON
                </button>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] text-slate-500 uppercase">Comm_Link</span>
                   <span className="text-[10px] font-black text-emerald-400 mono">SECURE_MESH [98%]</span>
                </div>
                <button 
                  onClick={deploySwarm}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                    isDeploying 
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95' 
                    : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 shadow-cyan-600/20 active:scale-95'
                  }`}
                >
                  {isDeploying ? 'Abort_Mission' : 'Launch_Swarm'}
                </button>
             </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-8 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {drones.map(drone => (
               <div key={drone.id} className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-2 relative transition-all ${drone.status === 'OFFLINE' ? 'bg-slate-900/20 border-slate-900 opacity-30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${drone.status === 'OFFLINE' ? 'bg-slate-800 text-slate-600' : 'bg-slate-950 text-cyan-500 shadow-lg'}`}>
                     {drone.load === 'SIGINT' ? <Radio className="w-4 h-4" /> : drone.load === 'KINETIC' ? <Crosshair className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div className="text-[7px] font-black text-slate-500 mono">{drone.id}</div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className={`h-full ${drone.battery < 20 ? 'bg-red-500' : drone.battery < 50 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${drone.battery}%` }} />
                  </div>
                  {isDeploying && drone.status === 'ACTIVE' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                  )}
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mission_Profile</label>
                <div className="grid grid-cols-1 gap-2">
                   {(['SURVEILLANCE', 'JAMMING', 'STRIKE'] as const).map(type => (
                     <button
                       key={type}
                       onClick={() => setMissionType(type)}
                       className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${missionType === type ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-900 text-slate-600 hover:text-slate-400'}`}
                     >
                        {type === 'SURVEILLANCE' ? <Eye className="w-4 h-4" /> : type === 'JAMMING' ? <Zap className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="md:col-span-2 glass bg-slate-950/20 p-4 rounded-2xl border border-slate-800/50 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2 text-slate-400">
                      <Navigation className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live_Tactical_Grid</span>
                   </div>
                   <div className="text-[9px] text-slate-600 font-mono tracking-tighter">51.5074° N, 0.1278° W</div>
                </div>
                <div className="flex-grow bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
                   {drones.map(d => (
                     <motion.div
                       key={d.id}
                       animate={{ 
                         x: 100 + (d.lng - (-0.1278)) * 2000, 
                         y: 100 + (d.lat - 51.5074) * 2000,
                         opacity: d.status === 'OFFLINE' ? 0.2 : 1
                       }}
                       className={`absolute w-1.5 h-1.5 rounded-full ${d.battery < 20 ? 'bg-red-500' : 'bg-cyan-500'} shadow-[0_0_5px_currentColor]`}
                     />
                   ))}
                   {isDeploying && (
                     <div className="absolute inset-0 bg-cyan-500/5 flex items-center justify-center">
                        <div className="text-[8px] font-black text-cyan-500/40 uppercase tracking-[0.5em] animate-pulse">Scanning_Operational_Layer...</div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Swarm_Telemetry</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between group">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400">UNITS_ACTIVE</span>
                       <span className="text-[8px] text-slate-600 uppercase">Operational_Status</span>
                    </div>
                    <div className="text-2xl font-black text-cyan-400 mono">{activeCount}</div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black text-slate-500 uppercase">Fleet_Battery</span>
                       <span className="text-[10px] font-black text-cyan-500 mono">{avgBattery.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <motion.div 
                          className={`h-full ${avgBattery < 30 ? 'bg-red-500' : 'bg-cyan-500'}`}
                          animate={{ width: `${avgBattery}%` }}
                       />
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-500">
                       <Zap className="w-3 h-3" />
                       <span className="text-[9px] font-black uppercase">Cons_Level</span>
                    </div>
                    <span className="text-[9px] font-black text-amber-500">MODERATE</span>
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Network_Health</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Latency', val: '14ms', status: 'GOOD' },
                   { label: 'Signal', val: '-64 dBm', status: 'GOOD' },
                   { label: 'Parity', val: '99.9%', status: 'GOOD' }
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                      <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-black text-slate-200 mono">{item.val}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                      </div>
                   </div>
                 ))}
                 
                 <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl mt-4">
                    <div className="flex items-center space-x-2 mb-2 text-amber-500">
                       <AlertCircle className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Protocol_Notice</span>
                    </div>
                    <p className="text-[8px] text-amber-400 leading-normal">Swarm units utilize local mesh networking. Disruption to central node will trigger automated autonomous failover (Level-4 Intelligence).</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
