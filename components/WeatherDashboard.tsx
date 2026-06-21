
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, CloudLightning, Sun, Cloud, Thermometer, Wind, AlertTriangle, Info, Activity, ShieldCheck } from 'lucide-react';
import { generateWeatherImpactAssessment } from '../services/geminiService';
import { Coordinates } from '../types';

interface Props {
  weather: string;
  loc: Coordinates;
  satName: string;
}

const RAIN_FADE_MATRIX = {
  'KU_12': { name: 'Ku-Band (12 GHz)', light: 0.8, heavy: 4.2, peak: 6.5 },
  'KU_14': { name: 'Ku-Band (14 GHz)', light: 1.1, heavy: 5.8, peak: 8.4 },
  'KA_20': { name: 'Ka-Band (20 GHz)', light: 2.8, heavy: 12.5, peak: 18.2 },
  'KA_30': { name: 'Ka-Band (30 GHz)', light: 4.9, heavy: 19.4, peak: 27.6 },
};

export const WeatherDashboard: React.FC<Props> = ({ weather, loc, satName }) => {
  const [assessment, setAssessment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchAssessment();
  }, [weather, satName]);

  const fetchAssessment = async () => {
    setIsLoading(true);
    const text = await generateWeatherImpactAssessment(weather, loc, satName);
    setAssessment(text);
    setLastUpdated(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  const currentConditionKey = weather === 'HEAVY_STORM' ? 'heavy' : weather === 'LIGHT_RAIN' ? 'light' : 'light'; // Default to light if overcast

  const getFadeEstimate = () => {
    if (weather === 'CLEAR') return '0.5 dB';
    if (weather === 'OVERCAST') return '1.2 dB';
    // For Ka-Band (20 GHz) as the default estimate in the small widget
    const data = RAIN_FADE_MATRIX['KA_20'];
    if (weather === 'LIGHT_RAIN') return `${data.light} dB`;
    if (weather === 'HEAVY_STORM') return `${data.heavy} dB`;
    return '---';
  };

  const statusColor = weather === 'HEAVY_STORM' ? 'text-red-500' : weather === 'LIGHT_RAIN' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
      <header className="flex items-center justify-between">
         <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
               <span className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 mr-3">
                  <Wind className="w-4 h-4 text-cyan-400" />
               </span>
               Atmospheric <span className="text-cyan-500 ml-2">Intelligence</span>
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-1">Terminal Lat: {loc.lat.toFixed(4)} | Lng: {loc.lng.toFixed(4)}</p>
         </div>
         <div className="flex items-center space-x-3">
            <div className="text-right mr-2">
               <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Band_Priority</span>
               <span className="text-[10px] text-white font-black uppercase">{weather === 'HEAVY_STORM' ? 'Ku-Band (Shielded)' : 'Ka-Band (Primary)'}</span>
            </div>
            <button 
              onClick={fetchAssessment}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700 transition-all"
            >
              {isLoading ? 'SYNCING...' : 'REFRESH_MET'}
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                     <div className="flex items-center space-x-4">
                        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                           {weather === 'CLEAR' && <Sun className="w-8 h-8 text-amber-400" />}
                           {weather === 'OVERCAST' && <Cloud className="w-8 h-8 text-slate-400" />}
                           {weather === 'LIGHT_RAIN' && <CloudRain className="w-8 h-8 text-blue-400" />}
                           {weather === 'HEAVY_STORM' && <CloudLightning className="w-8 h-8 text-red-500" />}
                        </div>
                        <div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Local Environment</span>
                           <span className={`text-xl font-black uppercase tracking-widest ${statusColor}`}>{weather.replace('_', ' ')}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Link Confidence</span>
                        <span className={`text-xl font-black mono ${statusColor}`}>{weather === 'HEAVY_STORM' ? '32%' : weather === 'LIGHT_RAIN' ? '74%' : '98%'}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center space-x-2 mb-2">
                           <Thermometer className="w-3.3 h-3.3 text-orange-400" />
                           <span className="text-[8px] font-black text-slate-500 uppercase">Amb_Temp</span>
                        </div>
                        <span className="text-lg font-black text-white mono">{weather === 'HEAVY_STORM' ? '18' : '24'}°C</span>
                     </div>
                     <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center space-x-2 mb-2">
                           <Activity className="w-3.3 h-3.3 text-cyan-400" />
                           <span className="text-[8px] font-black text-slate-500 uppercase">Ka_Fade_Est</span>
                        </div>
                        <span className="text-lg font-black text-cyan-400 mono">{getFadeEstimate()}</span>
                     </div>
                  </div>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start space-x-3">
                     <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                        Atmospheric attenuation updated with frequency-specific NIST-800 matrices. Cross-link relay is recommended if fade exceeds 6.0 dB.
                     </p>
                  </div>
               </div>

               <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmospheric Loss Matrix</span>
                     <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Loss In dB</span>
                  </div>
                  <div className="space-y-2">
                     <div className="grid grid-cols-4 gap-2 px-2 py-1 text-[7px] font-black text-slate-600 uppercase tracking-tighter">
                        <div className="col-span-1">Band_Freq</div>
                        <div className="text-center">Light</div>
                        <div className="text-center">Heavy</div>
                        <div className="text-center text-red-500/80">Peak</div>
                     </div>
                     {Object.entries(RAIN_FADE_MATRIX).map(([key, data]) => (
                        <div key={key} className={`grid grid-cols-4 gap-2 p-2 rounded-lg border transition-all ${weather !== 'CLEAR' && weather !== 'OVERCAST' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/20 border-slate-900 opacity-60'}`}>
                           <div className="text-[9px] font-black text-slate-300 uppercase tracking-tight">{data.name.split(' ')[0]}</div>
                           <div className={`text-[10px] font-black mono text-center ${weather === 'LIGHT_RAIN' ? 'text-amber-400' : 'text-slate-500'}`}>{data.light}</div>
                           <div className={`text-[10px] font-black mono text-center ${weather === 'HEAVY_STORM' ? 'text-red-500' : 'text-slate-500'}`}>{data.heavy}</div>
                           <div className="text-[10px] font-black mono text-center text-slate-500/50">{data.peak}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex items-center justify-between mb-4 z-10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STIA_MET_ASSESSMENT</span>
               <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 pulse"></div>
                  <span className="text-[7px] text-cyan-500 mono font-black">STIA_V.03</span>
               </div>
            </div>
            
            <div className="flex-grow scrollbar-hide overflow-y-auto bg-slate-950/80 rounded-2xl border border-slate-900 p-5 z-10">
               {isLoading ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Processing_MET_Data</span>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[9px] font-black text-cyan-500 border-b border-slate-800 pb-2">
                       <ShieldCheck className="w-3 h-3" />
                       <span>STRATIGIC SUMMARY // {lastUpdated}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mono leading-relaxed tracking-tight whitespace-pre-wrap">
                       {assessment}
                    </p>
                 </div>
               )}
            </div>
            
            {!isLoading && assessment && (
              <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase text-slate-600 tracking-widest z-10 px-1">
                 <span>Source: Gemini 3 Flash</span>
                 <span>Ref: STIA-MET-7742</span>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
