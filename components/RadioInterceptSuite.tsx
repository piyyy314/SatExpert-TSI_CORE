
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, Mic, Volume2, Shield, Settings, Search, Wifi, Zap, Terminal, Headphones, AlertTriangle } from 'lucide-react';

interface InterceptedMessage {
  id: string;
  time: string;
  freq: string;
  mode: string;
  content: string;
  confidence: number;
}

export const RadioInterceptSuite: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [freq, setFreq] = useState(144.800);
  const [mode, setMode] = useState<'AM' | 'FM' | 'LSB' | 'USB' | 'DMR' | 'P25'>('FM');
  const [isScanning, setIsScanning] = useState(false);
  const [messages, setMessages] = useState<InterceptedMessage[]>([]);
  const [signalStrength, setSignalStrength] = useState(0);
  const waterfallCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  const bands = [
    { name: 'AIRBANK', range: '108-137 MHz' },
    { name: 'HAM_2M', range: '144-148 MHz' },
    { name: 'POLICE', range: '450-470 MHz' },
    { name: 'SATCOM', range: '240-270 MHz' }
  ];

  // Waterfall Effect
  useEffect(() => {
    const canvas = waterfallCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const width = canvas.width;
    const height = canvas.height;
    
    // Create offscreen buffer for scrolling
    const buffer = ctx.createImageData(width, height);
    const data = buffer.data;

    const draw = () => {
      // Shift data up
      const rowSize = width * 4;
      for (let i = 0; i < (height - 1) * rowSize; i++) {
        data[i] = data[i + rowSize];
      }

      // Generate new bottom row
      const lastRowOffset = (height - 1) * rowSize;
      for (let x = 0; x < width; x++) {
        const i = lastRowOffset + x * 4;
        let power = Math.random() * 50;
        
        // Simulate a few signals
        const signals = [width * 0.3, width * 0.65, width * 0.8];
        signals.forEach(s => {
          const d = Math.abs(x - s);
          power += Math.max(0, (50 - d) * 4);
        });

        // Coloring
        data[i] = power > 150 ? 255 : power; // R
        data[i + 1] = power > 100 ? (power > 200 ? 255 : power) : 0; // G
        data[i + 2] = power > 200 ? 255 : 40; // B
        data[i + 3] = 255; // A
      }

      ctx.putImageData(buffer, 0, 0);
      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Waveform Effect
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const centerY = canvas.height / 2;
      const points = 100;
      const step = canvas.width / points;

      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const noise = (Math.random() - 0.5) * 10;
        const s1 = Math.sin(i * 0.2 + t) * 30;
        const s2 = Math.cos(i * 0.1 - t * 0.5) * 15;
        const y = centerY + s1 + s2 + noise;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.2;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (!isScanning) {
        setSignalStrength(0);
        return;
    }

    const interval = setInterval(() => {
      const newFreq = (freq + 0.025) % 500;
      setFreq(newFreq);
      setSignalStrength(Math.floor(Math.random() * 100));

      if (Math.random() > 0.95) {
        const newMsg = {
          id: Math.random().toString(36).substr(2, 6),
          time: new Date().toLocaleTimeString(),
          freq: newFreq.toFixed(3) + ' MHz',
          mode: mode,
          content: [
            "ALPHA_ONE: Requesting clearance for approach.",
            "UNCERTAIN_SIGNAL: [DIGITAL_P25_SYNC_LOSS]",
            "BASE: Wind velocity 14kts at 220 degrees.",
            "ENCRYPTED: [AES-256_HANDSHAKE_DETECTED]",
            "TRAFFIC: Congestion at Sector 7 perimeter."
          ][Math.floor(Math.random() * 5)],
          confidence: Math.floor(Math.random() * 20) + 80
        };
        setMessages(prev => [newMsg, ...prev].slice(0, 10));
        if (addMissionLog) addMissionLog(`RADIO_INTERCEPT: Message decoded on ${newMsg.freq}`, 'info');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isScanning, freq, mode]);

  const toggleScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      if (addMissionLog) addMissionLog(`RADIO_SCAN: Initiating wide-band intercept on ${mode} mode.`, 'active');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 h-full">
      {/* Left Panel: Tuning & Modes */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
              <Headphones className="w-5 h-5 text-cyan-400" />
              <h2 className="text-[12px] font-black text-white uppercase tracking-widest">RF_Comms_Receiver</h2>
           </div>

           <div className="space-y-6">
              <div className="bg-black/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">VFO_Frequency</span>
                 <div className="text-3xl font-black text-cyan-400 mono tracking-tighter">
                    {freq.toFixed(3)} <span className="text-xs text-cyan-700 ml-1">MHz</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[9px] font-black text-slate-500 uppercase">Input_Mode</label>
                 <div className="grid grid-cols-3 gap-2">
                    {(['AM', 'FM', 'LSB', 'USB', 'DMR', 'P25'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`py-2 rounded-lg text-[9px] font-black transition-all ${mode === m ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
                      >
                        {m}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={toggleScan}
                   className={`py-3 rounded-xl flex items-center justify-center space-x-2 transition-all font-black uppercase tracking-widest text-[10px] ${
                     isScanning 
                     ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                     : 'bg-emerald-600 text-white hover:bg-emerald-500'
                   }`}
                 >
                   {isScanning ? <Search className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                   <span>{isScanning ? 'Scanning...' : 'Start_Scan'}</span>
                 </button>
                 <button className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all">
                    <Settings className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Quick_Bands</h3>
           <div className="space-y-2">
              {bands.map(b => (
                <button 
                  key={b.name}
                  onClick={() => setFreq(parseFloat(b.range.split('-')[0]))}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all text-left group"
                >
                   <span className="text-[10px] font-black text-slate-400 group-hover:text-cyan-400 transition-colors uppercase">{b.name}</span>
                   <span className="text-[9px] text-slate-600 font-mono italic">{b.range}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Center Panel: Visuals */}
      <div className="lg:col-span-6 flex flex-col space-y-6">
         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex-grow flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">RF_Waterfall_Display</h3>
               </div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Span: 2.0 MHz // Gain: 45dB</div>
            </div>
            
            <div className="flex-grow bg-black rounded-2xl border border-slate-900 overflow-hidden relative shadow-inner">
               <canvas ref={waterfallCanvasRef} className="w-full h-full opacity-80" width={600} height={400} />
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/40 shadow-[0_0_10px_#22d3ee] z-10" />
               
               <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 96%, rgba(255,255,255,0.02) 96%)', backgroundSize: '100% 20px' }} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 h-[100px]">
               <div className="md:col-span-3 bg-black/40 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
                  <div className="absolute top-2 left-3 text-[7px] font-black text-cyan-500 uppercase">Demodulated_Audio_Sig</div>
                  <canvas ref={waveformCanvasRef} className="w-full h-full" width={400} height={100} />
               </div>
               <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase mb-2">Sig_Strength</span>
                  <div className={`text-xl font-black mono transition-colors ${signalStrength > 70 ? 'text-red-500' : signalStrength > 40 ? 'text-cyan-400' : 'text-slate-600'}`}>{signalStrength} S-u</div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Panel: Intercepts */}
      <div className="lg:col-span-3 space-y-6">
         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
               <div className="flex items-center space-x-2 text-amber-500">
                  <Terminal className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Intercept_Log</span>
               </div>
               <span className="text-[10px] font-bold text-slate-600">{messages.length} Captures</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
               {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-30">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Signals Intercepted</span>
                 </div>
               ) : (
                 messages.map(msg => (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-cyan-500/30 transition-all group"
                   >
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-cyan-400 group-hover:text-cyan-300">{msg.freq}</span>
                         <span className="text-[8px] text-slate-600 mono">{msg.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-200 leading-relaxed italic bg-black/40 p-2 rounded-lg border border-slate-800/50">
                         {msg.content}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                         <div className="flex items-center space-x-2">
                            <span className="text-[8px] font-black text-slate-500 uppercase">{msg.mode}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500" style={{ width: `${msg.confidence}%` }} />
                            </div>
                            <span className="text-[8px] font-black text-emerald-500">{msg.confidence}%</span>
                         </div>
                      </div>
                   </motion.div>
                 ))
               )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
               <button className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all">
                  Clear_Cache
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
