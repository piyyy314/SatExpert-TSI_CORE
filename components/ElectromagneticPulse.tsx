import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface ElectromagneticPulseProps {
  addMissionLog?: (detail: string, status?: any) => void;
}

export const ElectromagneticPulse: React.FC<ElectromagneticPulseProps> = ({ addMissionLog }) => {
  const [chargeLevel, setChargeLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [hasFired, setHasFired] = useState(false);
  const [targetCoords, setTargetCoords] = useState({ lat: '0.000', lng: '0.000' });
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging && chargeLevel < 100) {
      interval = setInterval(() => {
        setChargeLevel(prev => {
          if (prev >= 100) {
            setIsCharging(false);
            return 100;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isCharging, chargeLevel]);

  const handleCharge = () => {
    setIsCharging(true);
    setHasFired(false);
    setChargeLevel(0);
    if (addMissionLog) {
      addMissionLog('EMP Capacitors Charging...', 'INFO');
    }
  };

  const handleFire = () => {
    if (chargeLevel === 100) {
      setHasFired(true);
      setChargeLevel(0);
      if (addMissionLog) {
        addMissionLog(`EMP Detonated at ${targetCoords.lat}, ${targetCoords.lng}. Local grid offline.`, 'CRITICAL');
      }
    }
  };

  return (
    <div className="glass p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
      {hasFired && (
        <motion.div 
          className="absolute inset-0 bg-white z-50 mix-blend-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
      
      <div className="flex items-center space-x-4 mb-8 border-b border-cyan-500/20 pb-4">
        <Zap className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-xl font-black text-cyan-400 tracking-[0.2em] uppercase">Electromagnetic Pulse (EMP)</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Tactical Disruptor Control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Target Parameters</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Latitude</label>
                <input 
                  type="text" 
                  value={targetCoords.lat}
                  onChange={(e) => setTargetCoords(prev => ({...prev, lat: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-cyan-400 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Longitude</label>
                <input 
                  type="text" 
                  value={targetCoords.lng}
                  onChange={(e) => setTargetCoords(prev => ({...prev, lng: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-cyan-400 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <button 
                onClick={handleCharge}
                disabled={isCharging || chargeLevel === 100}
                className={`w-full py-3 rounded uppercase tracking-widest font-bold text-xs transition-colors ${isCharging || chargeLevel === 100 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50'}`}
              >
                {isCharging ? 'Charging Capacitors...' : (chargeLevel === 100 ? 'Fully Charged' : 'Initiate Charge')}
              </button>
              
              <button 
                onClick={handleFire}
                disabled={chargeLevel < 100}
                className={`w-full py-4 rounded uppercase tracking-[0.2em] font-black text-sm transition-all ${chargeLevel < 100 ? 'bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse'}`}
              >
                Detonate EMP
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>Yield Estimates</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-500">Effective Radius</span>
                <span className="text-cyan-400 font-mono">150.0 km</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-500">Grid Disruption</span>
                <span className="text-cyan-400 font-mono">98.5%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Recovery Time</span>
                <span className="text-cyan-400 font-mono">72-96 hrs</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="absolute inset-4 border border-cyan-500/10 rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-3/4 border border-cyan-500/20 rounded-full flex items-center justify-center">
              <div className="w-1/2 h-1/2 border border-cyan-500/30 rounded-full flex items-center justify-center animate-spin-slow">
              </div>
            </div>
          </div>
          
          <div className={`text-6xl font-black mb-4 ${chargeLevel === 100 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-cyan-500'}`}>
            {chargeLevel}%
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-[0.3em] z-10 text-center">
            Capacitor Bank Charge Level
          </div>
          
          <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-full mt-8 overflow-hidden relative">
            <motion.div 
              className={`absolute top-0 left-0 h-full ${chargeLevel === 100 ? 'bg-red-500' : 'bg-cyan-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${chargeLevel}%` }}
              transition={{ ease: "linear" }}
            />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIG9wYWNpdHk9IjAuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwbDQwIDQwSDBWMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] mix-blend-overlay"></div>
          </div>
          
          {chargeLevel === 100 && (
            <motion.div 
              className="absolute bottom-8 left-0 w-full text-center text-red-500 text-sm font-black uppercase tracking-[0.2em]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <ShieldAlert className="inline-block w-5 h-5 mr-2" />
              Armed and Ready
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
