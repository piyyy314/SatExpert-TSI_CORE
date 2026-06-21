
import * as React from 'react';
import { Satellite, LookAngles } from '../types';
import { SignalVisualizer } from './SignalVisualizer.tsx';
import { LookAngleCard } from './LookAngleCard.tsx';
import { LinkBudgetCalculator } from './LinkBudgetCalculator.tsx';
import { Orbital3D } from './Orbital3D.tsx';

interface Props {
  satellite: Satellite;
  lookAngles: LookAngles | null;
  isStealthMode: boolean;
  isJamming: boolean;
  jammingPower: number;
  weather: string;
}

export const SatelliteDetail: React.FC<Props> = ({ 
  satellite, 
  lookAngles, 
  isStealthMode, 
  isJamming, 
  jammingPower,
  weather
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{satellite.name}</h2>
            <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              {satellite.operator}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
            Orbital Slot: {satellite.orbitalSlot} // ID: {satellite.id.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-600 font-bold uppercase">Inclination</span>
              <span className="text-sm font-black text-white mono">{satellite.inclination}°</span>
           </div>
           <div className="w-px h-10 bg-slate-800"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-600 font-bold uppercase">Launch_Date</span>
              <span className="text-sm font-black text-white mono">{satellite.launchDate}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Orbital Dynamics</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Apogee</span>
                  <span className="text-xs font-black text-white mono">{satellite.apogee?.toLocaleString() ?? '---'} km</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Perigee</span>
                  <span className="text-xs font-black text-white mono">{satellite.perigee?.toLocaleString() ?? '---'} km</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Velocity</span>
                  <span className="text-xs font-black text-white mono">{satellite.velocity} km/s</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Period</span>
                  <span className="text-xs font-black text-white mono">{satellite.period} min</span>
               </div>
            </div>
          </div>

          {lookAngles && <LookAngleCard angles={lookAngles} satellite={satellite} />}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl border-slate-800 bg-slate-950/40 overflow-hidden">
             <Orbital3D longitude={satellite.longitude} />
          </div>
          
          <SignalVisualizer 
            quality={lookAngles?.elevation && lookAngles.elevation > 0 ? 85 : 0} 
            isJamming={isJamming} 
            jammingPower={jammingPower}
            rainFade={weather === 'CLEAR' ? 0.5 : weather === 'OVERCAST' ? 2.0 : 8.0}
            isStealthMode={isStealthMode}
          />
          
          <LinkBudgetCalculator 
            distance={lookAngles?.distance || 0} 
            isStealthMode={isStealthMode} 
          />
        </div>
      </div>
    </div>
  );
};
