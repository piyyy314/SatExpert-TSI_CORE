
import * as React from 'react';
import { Satellite, SatelliteStatus } from '../types';

interface Props {
  satellites: Satellite[];
  selectedSat: Satellite;
  onSatSelect: (sat: Satellite) => void;
  isStealthMode: boolean;
}

const StatusBadge: React.FC<{ status?: SatelliteStatus }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-500', label: 'ONLINE', pulse: true },
    offline: { color: 'bg-red-500', label: 'OFFLINE', pulse: false },
    maintenance: { color: 'bg-amber-500', label: 'MAINT', pulse: true },
    decommissioned: { color: 'bg-slate-600', label: 'EOL', pulse: false },
  }[status || 'active'] || { color: 'bg-slate-500', label: 'UNKNOWN', pulse: false };

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}></div>
      <span className={`text-[8px] font-black tracking-widest ${(config.color || '').replace('bg-', 'text-')}`}>
        {config.label}
      </span>
    </div>
  );
};

export const ConstellationView: React.FC<Props> = ({ satellites, selectedSat, onSatSelect, isStealthMode }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Constellation <span className="text-cyan-500">Registry</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Global Asset Monitoring // {satellites.length} Active Nodes</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-600 font-bold uppercase">Network_Health</span>
              <span className="text-xs font-black text-green-500 uppercase tracking-widest">Optimal</span>
           </div>
           <div className="w-px h-8 bg-slate-800"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-600 font-bold uppercase">Active_Links</span>
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{satellites.filter(s => s.status === 'active').length}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {satellites.map((sat) => (
          <button
            key={sat.id}
            onClick={() => onSatSelect(sat)}
            className={`glass p-5 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden ${
              selectedSat.id === sat.id 
                ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                : 'border-slate-800 hover:border-slate-600 hover:bg-white/5'
            }`}
          >
            {selectedSat.id === sat.id && (
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-widest ${selectedSat.id === sat.id ? 'text-cyan-400' : 'text-white'}`}>
                  {sat.name}
                </span>
                <span className="text-[9px] text-slate-500 mono font-bold">{sat.operator}</span>
              </div>
              <StatusBadge status={sat.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                <span className="text-[7px] text-slate-600 font-bold uppercase block mb-0.5">Orbital Slot</span>
                <span className="text-[10px] text-slate-300 mono font-bold">{sat.orbitalSlot}</span>
              </div>
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                <span className="text-[7px] text-slate-600 font-bold uppercase block mb-0.5">Velocity</span>
                <span className="text-[10px] text-slate-300 mono font-bold">{sat.velocity} km/s</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
               <div className="flex flex-col">
                  <span className="text-[7px] text-slate-600 font-bold uppercase">Apogee</span>
                  <span className="text-[9px] text-slate-400 mono">{sat.apogee?.toLocaleString() ?? '---'} km</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[7px] text-slate-600 font-bold uppercase">Perigee</span>
                  <span className="text-[9px] text-slate-400 mono">{sat.perigee?.toLocaleString() ?? '---'} km</span>
               </div>
            </div>

            {selectedSat.id === sat.id && (
              <div className="mt-4 pt-3 border-t border-cyan-500/20 flex justify-center">
                 <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Target_Acquired</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
