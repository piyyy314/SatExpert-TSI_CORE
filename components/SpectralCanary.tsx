
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, ShieldAlert, Wifi, Zap, Lock, Eye, Terminal } from 'lucide-react';
import { audioController } from '../services/audioService.ts';

interface CanaryEvent {
  id: string;
  timestamp: string;
  type: 'RF_PROBE' | 'WIFI_EAVESDROP' | 'MAC_SPOOF' | 'UNAUTHORIZED_PING';
  source: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
}

export const SpectralCanary: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [events, setEvents] = useState<CanaryEvent[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setScanProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setScanProgress(prev => (prev + 1) % 101);
      
      // Simulate unauthorized listening / probing
      if (Math.random() > 0.96) {
        triggerCanaryEvent();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const triggerCanaryEvent = () => {
    const types: CanaryEvent['type'][] = ['RF_PROBE', 'WIFI_EAVESDROP', 'MAC_SPOOF', 'UNAUTHORIZED_PING'];
    const type = types[Math.floor(Math.random() * types.length)];
    const severities: CanaryEvent['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    const newEvent: CanaryEvent = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 }),
      type,
      severity,
      source: `NODE_${Math.floor(Math.random() * 9999).toString(16).toUpperCase()}`,
      details: type === 'WIFI_EAVESDROP' ? 'Promiscuous mode detected on nearby asset.' :
               type === 'RF_PROBE' ? 'Narrow-band spectral sweep detected on 14.5GHz.' :
               'Unauthorized handshake attempt intercepted.'
    };

    setEvents(prev => [newEvent, ...prev].slice(0, 30));
    
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      setIsTriggered(true);
      audioController.playAlert();
      audioController.playSystemVoice(`Caution. ${type.replace('_', ' ')} detected.`);
      setTimeout(() => setIsTriggered(false), 2000);
    } else {
      audioController.playChirp();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
               <Radio className="w-6 h-6 text-orange-500" />
            </span> 
            Spectral <span className="text-orange-500 ml-2">Canary Listener</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Advanced Passive Eavesdropping Detection // JS-SOC-010</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => setIsActive(!isActive)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
               isActive 
               ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
               : 'bg-orange-600 hover:bg-orange-500 text-slate-950 shadow-orange-600/20'
             }`}
           >
             {isActive ? 'SHUT_DOWN_LISTENER' : 'INITIATE_CANARY_WATCH'}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 relative overflow-hidden">
            {isActive && (
              <motion.div 
                className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Detection Sub-Systems</h3>
            <div className="space-y-4">
               {[
                 { label: 'WiFi Handshake Trap', icon: Wifi, color: 'text-blue-400' },
                 { label: 'RF Sweep Monitor', icon: Radio, color: 'text-orange-400' },
                 { label: 'MAC Entropy Guard', icon: Lock, color: 'text-emerald-400' },
                 { label: 'Promiscuous Probe', icon: Eye, color: 'text-purple-400' }
               ].map((sys, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-3">
                       <sys.icon className={`w-4 h-4 ${sys.color}`} />
                       <span className="text-[10px] font-bold text-slate-300 uppercase">{sys.label}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 </div>
               ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Buffer Saturation</span>
                  <span className="text-[9px] font-mono text-orange-500">{scanProgress}%</span>
               </div>
               <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    animate={{ width: `${scanProgress}%` }}
                  />
               </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <div className="flex items-center space-x-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Alerts</h3>
             </div>
             <div className="space-y-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                   <p className="text-[8px] text-slate-500 font-black uppercase mb-2">Protocol: L-BAND_CANARY</p>
                   <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                      Eavesdropping on high-side ports creates a spectral echo that the STIA system picks up via sub-space harmonic analysis.
                   </p>
                </div>
                <button 
                  onClick={triggerCanaryEvent}
                  className="w-full py-3 border border-orange-500/30 hover:bg-orange-500/10 text-orange-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Simulate_Intrusion_Event
                </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className={`glass p-6 rounded-3xl border transition-all duration-300 min-h-[500px] flex flex-col ${isTriggered ? 'border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                   <Terminal className="w-4 h-4 text-slate-500" />
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canary Trigger Log</h3>
                </div>
                <div className="flex items-center space-x-4">
                   <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{events.length} Detections</span>
                   <button onClick={() => setEvents([])} className="text-[9px] text-red-500 font-black uppercase hover:underline">Purge_Log</button>
                </div>
              </div>
              
              <div className="flex-grow space-y-4 overflow-y-auto max-h-[550px] scrollbar-hide pr-2" ref={scrollRef}>
                 <AnimatePresence mode="popLayout">
                    {events.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-24">
                         <Zap className="w-16 h-16 text-slate-600 mb-4 animate-pulse" />
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Specter_Net_Clean</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <motion.div 
                          key={event.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-5 rounded-2xl border transition-all ${
                            event.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40' : 
                            event.severity === 'HIGH' ? 'bg-orange-500/10 border-orange-500/40' :
                            'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center space-x-3">
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  event.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                  event.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                   {event.severity}
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{event.type}</span>
                             </div>
                             <span className="text-[9px] text-slate-500 font-mono italic">{event.timestamp}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                             <div className="md:col-span-1">
                                <label className="text-[7px] font-black text-slate-600 uppercase block mb-1">Source_ID</label>
                                <span className="text-[10px] text-orange-400 font-mono">{event.source}</span>
                             </div>
                             <div className="md:col-span-3">
                                <label className="text-[7px] font-black text-slate-600 uppercase block mb-1">Intel_Trace</label>
                                <span className="text-[10px] text-slate-400 font-bold">{event.details}</span>
                             </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
