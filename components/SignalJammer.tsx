import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radio, Zap, Volume2, ShieldX, WifiOff, AlertTriangle, Activity } from 'lucide-react';

export const SignalJammer: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [frequency, setFrequency] = useState(2.4);
  const [power, setPower] = useState(40);
  const [isJamming, setIsJamming] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState<number[]>(Array(50).fill(10));
  const [selectedBand, setSelectedBand] = useState<'VHF' | 'UHF' | 'SHF'>('UHF');
  const [sessionData, setSessionData] = useState<{ timestamp: string, frequency: number, power: number, noise: number }[]>([]);

  const handleExportJammingReport = () => {
    const reportData = {
        metadata: {
            timestamp: new Date().toISOString(),
            targetBand: selectedBand,
            baseFrequency: frequency,
            maxPowerDb: power
        },
        tacticalSummary: {
            avgSnr: isJamming ? "-12.4dB" : "-0.1dB",
            estimatedEffectiveness: `${(power * frequency / 5).toFixed(1)}%`,
            engagementDuration: sessionData.length * 150 // approximate ms
        },
        telemetry: sessionData,
        analysis: "Signal effectively saturated the target band."
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JAMMER_AAR_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bands = {
    VHF: { range: '30-300 MHz', target: 'Tactical Comms', color: 'text-emerald-400' },
    UHF: { range: '300-3000 MHz', target: 'Satellite/LTE', color: 'text-cyan-400' },
    SHF: { range: '3-30 GHz', target: 'Datalinks/Ka-Band', color: 'text-amber-400' }
  };

  const toggleJamming = () => {
    if (!isJamming) {
      setIsJamming(true);
      if (addMissionLog) addMissionLog(`JAM_INIT: Pulse authorized on ${frequency}GHz (${selectedBand}). News feeds disrupted.`, 'active');
    } else {
      setIsJamming(false);
      if (addMissionLog) addMissionLog(`JAM_CEASED: Clearing RF noise floor.`, 'info');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNoiseLevel(prev => {
        const next = [...prev.slice(1)];
        let currentNoise = 5 + (Math.random() * 5);
        if (isJamming) {
          currentNoise = power + (Math.random() * 20);
          next.push(currentNoise);
        } else {
          next.push(currentNoise);
        }
        
        if (isJamming) {
            setSessionData(sd => [...sd, { timestamp: new Date().toISOString(), frequency, power, noise: currentNoise }]);
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isJamming, power, frequency]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      <div className="lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <h3 className="text-[12px] font-black text-white uppercase tracking-widest">RF_Interference_Core</h3>
              </div>
              {sessionData.length > 0 && (
                 <button 
                    onClick={handleExportJammingReport}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[8px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                 >
                    Export_AAR
                 </button>
              )}
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                 {(Object.keys(bands) as Array<keyof typeof bands>).map(b => (
                   <button
                     key={b}
                     onClick={() => setSelectedBand(b)}
                     disabled={isJamming}
                     className={`p-3 rounded-xl border-2 transition-all text-center ${selectedBand === b ? 'bg-slate-900 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-900 text-slate-600'}`}
                   >
                      <div className="text-[10px] font-black">{b}</div>
                      <div className="text-[7px] opacity-60 font-mono">{bands[b].range.split(' ')[0]}</div>
                   </button>
                 ))}
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Frequency_Offset</label>
                    <span className="text-[11px] font-black text-cyan-400 mono">{frequency.toFixed(3)} GHz</span>
                 </div>
                 <input 
                   type="range" min="0.1" max="10" step="0.001" 
                   value={frequency} onChange={e => setFrequency(parseFloat(e.target.value))}
                   className="w-full accent-cyan-500"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Input_Power (Watt/Hz)</label>
                    <span className="text-[11px] font-black text-amber-500 mono">{power} dBm</span>
                 </div>
                 <input 
                   type="range" min="10" max="100" 
                   value={power} onChange={e => setPower(parseInt(e.target.value))}
                   className="w-full accent-amber-500"
                 />
              </div>

              <button 
                onClick={toggleJamming}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 ${
                  isJamming 
                  ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-red-600 border-2 border-red-500 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 animate-pulse'
                }`}
              >
                {isJamming ? <Zap className="w-4 h-4 fill-current" /> : <Radio className="w-4 h-4" />}
                <span>{isJamming ? 'Halt_Jamming' : 'Broadcast_Noise'}</span>
              </button>
           </div>
        </div>

        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center space-x-2 mb-4 text-emerald-400">
              <ShieldX className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">ECCM_Countermeasures</span>
           </div>
           <p className="text-[9px] text-slate-500 leading-tight">Adaptive frequency hopping is detected. Suggest engaging PDR (Periodic Digital Resynchronization) at 30ms intervals to maintain feed blackout.</p>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Spectral_Density_Analysis</h3>
               </div>
               <div className="flex items-center space-x-4">
                  <div className={`p-1.5 rounded-lg font-black text-[9px] ${isJamming ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {isJamming ? 'COLLISION_DETECTED' : 'CLEAR_CHANNEL'}
                  </div>
               </div>
            </div>

            <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-900 relative overflow-hidden flex items-end px-4 py-8 space-x-1">
               <div className="absolute inset-x-0 bottom-1/4 h-px bg-slate-800 pointer-events-none" />
               <div className="absolute inset-x-0 bottom-2/4 h-px bg-slate-800/50 pointer-events-none" />
               <div className="absolute inset-x-0 bottom-3/4 h-px bg-slate-800/20 pointer-events-none" />
               
               {noiseLevel.map((v, i) => (
                 <motion.div 
                   key={i}
                   animate={{ height: `${v}%` }}
                   transition={{ duration: 0.1 }}
                   className={`flex-grow rounded-sm ${isJamming ? 'bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-emerald-500/20'}`}
                 />
               ))}

               {isJamming && (
                 <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className="text-[8px] font-mono text-red-400 bg-black/50 px-2 py-1 rounded">SNR: -12.4dB</div>
                    <div className="text-[8px] font-mono text-red-400 bg-black/50 px-2 py-1 rounded">EFFECTIVENESS: 94%</div>
                 </div>
               )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
               <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Carrier_Freq</span>
                  <span className="text-xl font-black text-white mono">{frequency.toFixed(2)}G</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Pulse_Width</span>
                  <span className="text-xl font-black text-white mono">240ms</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Rep_Rate</span>
                  <span className="text-xl font-black text-white mono">15kHz</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <Volume2 className="w-12 h-12 text-slate-500" />
               </div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4">Aural_Feedback</h4>
               <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                     <div className={`w-1.5 h-1.5 rounded-full ${isJamming ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium">Demodulating noise floor... {isJamming ? 'Static Detected.' : 'Silent.'}</div>
               </div>
            </div>

            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden">
               <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4">Tactical_Success_Prob</h4>
               <div className="flex items-center space-x-6">
                  <div className="text-3xl font-black text-cyan-400">{(power * frequency / 5).toFixed(1)}%</div>
                  <div className="flex-grow h-2 bg-slate-900 rounded-full overflow-hidden">
                     <motion.div 
                        className="h-full bg-cyan-500"
                        animate={{ width: `${(power * frequency / 5)}%` }}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
