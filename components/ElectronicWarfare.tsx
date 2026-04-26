
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';
import { CyberThreatMap } from './CyberThreatMap.tsx';

interface Props {
  isStealthMode: boolean;
  isJamming: boolean;
  jammingPower: number;
  onToggleJamming: (val: boolean) => void;
  onSetJammingPower: (val: number) => void;
}

export const ElectronicWarfare: React.FC<Props> = ({ 
  isStealthMode, 
  isJamming, 
  jammingPower,
  onToggleJamming,
  onSetJammingPower
}) => {
  const [frequency, setFrequency] = useState(12.45);
  const [hoppingActive, setHoppingActive] = useState(false);
  const [maskingActive, setMaskingActive] = useState(false);
  const [spectrumData, setSpectrumData] = useState<number[]>([]);
  const waterfallRef = useRef<HTMLCanvasElement>(null);
  const waterfallData = useRef<number[][]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = Array.from({ length: 100 }, () => Math.random() * 20 + (isJamming ? Math.random() * jammingPower : 0));
      if (hoppingActive) {
        const hopIdx = Math.floor(Math.random() * 100);
        newData[hopIdx] += 60;
      }
      setSpectrumData(newData);
      
      waterfallData.current.unshift(newData);
      if (waterfallData.current.length > 100) waterfallData.current.pop();
      
      drawWaterfall();
    }, 100);
    return () => clearInterval(interval);
  }, [isJamming, jammingPower, hoppingActive]);

  const exportEWReport = () => {
    const report = `
STIA ELECTRONIC WARFARE MISSION REPORT
--------------------------------------
TIMESTAMP: ${new Date().toISOString()}

EW_STATUS: ${isJamming ? 'ACTIVE' : 'IDLE'}
TRANSMISSION_POWER: ${jammingPower}%
FREQ_HOPPING: ${hoppingActive ? 'ENABLED' : 'DISABLED'}
SIGNAL_MASKING: ${maskingActive ? 'ENABLED' : 'DISABLED'}
FREQ_CENTROID: ${frequency} GHz

STIA_CMD: END_EW_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_EW_Report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const drawWaterfall = () => {
    const canvas = waterfallRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / 100;
    const cellHeight = height / 100;

    ctx.clearRect(0, 0, width, height);
    waterfallData.current.forEach((row, y) => {
      row.forEach((val, x) => {
        const intensity = Math.min(255, val * 3);
        ctx.fillStyle = isStealthMode 
          ? `rgba(168, 85, 247, ${intensity / 255})` 
          : `rgba(34, 211, 238, ${intensity / 255})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      });
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">⚡</span> Electronic <span className="text-red-500 ml-2">Warfare Suite</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Signal Denial & Spectrum Dominance // Sector X</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={exportEWReport}
             className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-all"
           >
             <Download className="w-3 h-3" />
             <span>Export_EW_Log</span>
           </button>
           <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isJamming ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
             {isJamming ? 'EW_ACTIVE' : 'EW_STANDBY'}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Jamming Control</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">Main Transmitter</span>
                  <button 
                    onClick={() => onToggleJamming(!isJamming)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isJamming ? 'bg-red-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isJamming ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                     <span>Power Output</span>
                     <span className="text-red-500">{jammingPower}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={jammingPower} 
                    onChange={(e) => onSetJammingPower(parseInt(e.target.value))}
                    className="w-full accent-red-600 bg-slate-900 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
               </div>

               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={() => setHoppingActive(!hoppingActive)}
                    className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${hoppingActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    Freq_Hopping
                  </button>
                  <button 
                    onClick={() => setMaskingActive(!maskingActive)}
                    className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${maskingActive ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    Signal_Mask
                  </button>
               </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Tactical Presets</h3>
            <div className="space-y-2">
               {['DENIAL_OF_SERVICE', 'GPS_SPOOFING', 'LINK_HIJACK', 'NOISE_FLOOR_RAISE'].map(p => (
                 <button key={p} className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] font-black text-slate-400 hover:text-white text-left uppercase tracking-widest transition-all">
                   {p}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <CyberThreatMap />
          
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Advanced Spectrum Analysis</h3>
              <div className="flex space-x-4">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Signal</span>
                 </div>
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Jamming</span>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="h-48 bg-slate-950 rounded-2xl border border-slate-900 relative overflow-hidden flex items-end p-4">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="w-full h-full grid grid-cols-10 grid-rows-5">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-slate-500"></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end justify-between w-full h-full space-x-0.5">
                    {spectrumData.map((v, i) => (
                      <div 
                        key={i} 
                        className={`w-full transition-all duration-100 ${v > 50 ? 'bg-red-500' : 'bg-cyan-400'}`} 
                        style={{ height: `${v}%`, opacity: 0.6 }}
                      ></div>
                    ))}
                  </div>
               </div>

               <div className="relative">
                  <canvas ref={waterfallRef} width="800" height="200" className="w-full h-40 bg-slate-950 rounded-2xl border border-slate-900" />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded border border-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">Waterfall_Trace</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass p-4 rounded-2xl border-slate-800 bg-slate-950/40 flex items-center space-x-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                   <span className="text-cyan-400 font-black text-xs">FH</span>
                </div>
                <div>
                   <p className="text-[8px] text-slate-500 font-bold uppercase">Hopping Pattern</p>
                   <p className="text-xs font-black text-white mono">RANDOM_GAUSSIAN_7</p>
                </div>
             </div>
             <div className="glass p-4 rounded-2xl border-slate-800 bg-slate-950/40 flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                   <span className="text-red-500 font-black text-xs">BW</span>
                </div>
                <div>
                   <p className="text-[8px] text-slate-500 font-bold uppercase">Jamming Bandwidth</p>
                   <p className="text-xs font-black text-white mono">36.00 MHz</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
