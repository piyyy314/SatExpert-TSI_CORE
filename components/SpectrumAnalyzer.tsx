
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Activity, Radio, Zap, ShieldCheck, Crosshair, Waves } from 'lucide-react';

export const SpectrumAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [centerFreq, setCenterFreq] = useState(14.5); // GHz
  const [span, setSpan] = useState(500); // MHz
  const [noiseFloor, setNoiseFloor] = useState(-110); // dBm
  const [peakFreq, setPeakFreq] = useState(14.525);
  const [peakPower, setPeakPower] = useState(-42);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const dataPoints = 200;
    const spectrum = new Array(dataPoints).fill(-110);
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update Spectrum Data
      for (let i = 0; i < dataPoints; i++) {
        // Base Noise
        let val = noiseFloor + (Math.random() - 0.5) * 5;
        
        // Signal Peak 1 (Primary Uplink)
        const dist1 = Math.abs(i - dataPoints * 0.55);
        val += 65 * Math.exp(-(dist1 * dist1) / 15);
        
        // Signal Peak 2 (Interference/Secondary)
        const dist2 = Math.abs(i - (dataPoints * 0.3 + Math.sin(Date.now() / 2000) * 10));
        val += 40 * Math.exp(-(dist2 * dist2) / 8);

        // Smoothing
        spectrum[i] = spectrum[i] * 0.7 + val * 0.3;
      }

      // Draw Gradient Spectrum
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.05)');
      gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 211, 238, 0.8)');

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let i = 0; i < dataPoints; i++) {
        const x = (canvas.width / (dataPoints - 1)) * i;
        const normalizedVal = (spectrum[i] - (-120)) / ((-20) - (-120));
        const y = canvas.height - (normalizedVal * canvas.height);
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Outline
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < dataPoints; i++) {
        const x = (canvas.width / (dataPoints - 1)) * i;
        const normalizedVal = (spectrum[i] - (-120)) / ((-20) - (-120));
        const y = canvas.height - (normalizedVal * canvas.height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Peak Marker
      const maxIdx = spectrum.indexOf(Math.max(...spectrum));
      const peakX = (canvas.width / (dataPoints - 1)) * maxIdx;
      const peakY = canvas.height - ((Math.max(...spectrum) - (-120)) / ((-20) - (-120)) * canvas.height);
      
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      
      setPeakFreq(centerFreq + (maxIdx / dataPoints - 0.5) * (span / 1000));
      setPeakPower(spectrum[maxIdx]);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [centerFreq, span, noiseFloor]);

  const exportSpectrumReport = () => {
    const report = `
STIA SPECTRUM ANALYSIS REPORT
-----------------------------
TIMESTAMP: ${new Date().toISOString()}

CENTER_FREQ: ${centerFreq.toFixed(3)} GHz
SPAN: ${span} MHz
SQUELCH: ${noiseFloor} dBm
PEAK_DETECTED: ${peakFreq.toFixed(4)} GHz at ${peakPower.toFixed(2)} dBm

STIA_CMD: END_SPECTRUM_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_Spectrum_Report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
               <Waves className="w-6 h-6 text-cyan-500" />
            </span> 
            SIGINT <span className="text-cyan-500 ml-2">Spectrum Analyzer</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Terminal Node: KA-BAND-ALPHA // Real-Time FFT Capture</p>
        </div>
        <button 
          onClick={exportSpectrumReport}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all"
        >
          <Download className="w-3 h-3" />
          <span>Export_FFT_Data</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
           <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-950/60 relative overflow-hidden group">
              <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                 <span className="text-[9px] font-black text-white uppercase tracking-widest">Live_Feed_Active</span>
              </div>
              
              <div className="relative aspect-[21/9] w-full bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden mb-8">
                 <canvas ref={canvasRef} className="w-full h-full" width="1200" height="500" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Center_Freq</span>
                    <span className="text-xl font-black text-cyan-400 mono">{centerFreq.toFixed(3)} GHz</span>
                 </div>
                 <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Span_Bandwidth</span>
                    <span className="text-xl font-black text-white mono">{span} MHz</span>
                 </div>
                 <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Peak_Marker</span>
                    <span className="text-xl font-black text-red-500 mono">{peakFreq.toFixed(4)} GHz</span>
                 </div>
                 <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Peak_Power</span>
                    <span className="text-xl font-black text-emerald-400 mono">{peakPower.toFixed(2)} dBm</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Analysis Parameters</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-3">Center Frequency Control</label>
                    <input 
                      type="range" 
                      min="12" 
                      max="18" 
                      step="0.01"
                      value={centerFreq} 
                      onChange={(e) => setCenterFreq(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500" 
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-3">Span Bandwidth (MHz)</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[100, 250, 500, 1000].map(s => (
                         <button 
                           key={s} 
                           onClick={() => setSpan(s)}
                           className={`py-2 rounded-lg text-[10px] font-black transition-all ${span === s ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                         >
                           {s}M
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-3">Manual Squelch (dBm)</label>
                    <input 
                      type="range" 
                      min="-120" 
                      max="-80" 
                      value={noiseFloor} 
                      onChange={(e) => setNoiseFloor(parseInt(e.target.value))}
                      className="w-full accent-emerald-500" 
                    />
                 </div>
              </div>
           </div>

           <div className="bg-cyan-500/5 p-6 rounded-3xl border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                 <ShieldCheck className="w-5 h-5 text-cyan-500" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Signature Validation</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-4">
                 Spectral pattern matches verified SATCOM uplink protocol. No unauthorized harmonics detected in current span.
              </p>
              <div className="flex items-center justify-between text-[9px] font-black text-cyan-400 uppercase mono">
                 <span>Confidence</span>
                 <span>99.98%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
