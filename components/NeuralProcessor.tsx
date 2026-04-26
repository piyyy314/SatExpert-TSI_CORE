
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const NeuralProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [reconstructedData, setReconstructedData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw "noisy" signal
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height / 2 + Math.sin(i / 10 + frame / 5) * 20 + (Math.random() - 0.5) * 40;
        if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Draw "reconstructed" signal if processing or done
      if (isProcessing || reconstructedData) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const limit = isProcessing ? (progress / 100) * canvas.width : canvas.width;
        for (let i = 0; i < limit; i++) {
          const y = canvas.height / 2 + Math.sin(i / 10 + frame / 5) * 20;
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [isProcessing, progress, reconstructedData]);

  const startReconstruction = () => {
    setIsProcessing(true);
    setProgress(0);
    setLogs(["[SYSTEM] Initializing Neural Engine...", "[SYSTEM] Sampling noisy spectrum...", "[SYSTEM] Loading pre-trained weights (SatNet-v4)..."]);
    setReconstructedData(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setReconstructedData("DECRYPTED_PAYLOAD_V3: MISSION_SUCCESS // COORDS_LOCKED");
          setLogs(prevLogs => [...prevLogs, "[SUCCESS] Reconstruction complete.", "[INFO] Signal-to-Noise ratio improved by 14.2dB."]);
          return 100;
        }
        
        if (prev === 20) setLogs(prevLogs => [...prevLogs, "[INFO] Phase alignment in progress..."]);
        if (prev === 50) setLogs(prevLogs => [...prevLogs, "[INFO] Error correction (LDPC) applied."]);
        if (prev === 80) setLogs(prevLogs => [...prevLogs, "[INFO] Finalizing waveform synthesis..."]);
        
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">🧠</span> Neural <span className="text-cyan-500 ml-2">Signal Processor</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">AI-Driven Waveform Reconstruction // Sector X</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Waveform Analysis</h3>
               <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                     <span className="text-[8px] text-slate-500 font-bold uppercase">Raw_Noisy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                     <span className="text-[8px] text-slate-500 font-bold uppercase">Neural_Clean</span>
                  </div>
               </div>
            </div>
            
            <canvas ref={canvasRef} width="600" height="200" className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-900" />
            
            <div className="mt-6 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Processing_Progress</span>
                  <span className="text-xs font-black text-cyan-400 mono">{progress}%</span>
               </div>
               <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div 
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
               </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reconstructed Payload</h3>
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 min-h-[80px] flex items-center justify-center">
                {reconstructedData ? (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-black text-white mono"
                  >
                    {reconstructedData}
                  </motion.span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Awaiting neural synthesis...</span>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 h-full flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Engine Logs</h3>
            <div className="flex-grow bg-slate-950/50 rounded-xl p-4 border border-slate-900 space-y-2 overflow-y-auto h-64 scrollbar-hide">
               {logs.map((log, i) => (
                 <div key={i} className="text-[10px] mono text-slate-400 leading-relaxed">
                   <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                   {log}
                 </div>
               ))}
               {isProcessing && <div className="text-cyan-500 text-[10px] mono animate-pulse">SYNTHESIZING...</div>}
            </div>
            
            <button 
              onClick={startReconstruction}
              disabled={isProcessing}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 text-[10px] font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              {isProcessing ? 'Processing...' : 'Start_Reconstruction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
