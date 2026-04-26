
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';

export const CyberThreatMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [threats, setThreats] = useState<{id: number, x: number, y: number, type: string, intensity: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw world map (simplified)
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw "threats"
      setThreats(prev => {
        if (frame % 60 === 0 && prev.length < 10) {
          return [...prev, {
            id: Date.now() + Math.random(),
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            type: ['DDOS', 'INTRUSION', 'SPOOFING', 'MALWARE'][Math.floor(Math.random() * 4)],
            intensity: Math.random() * 100
          }];
        }
        return prev.filter(t => Math.random() > 0.01);
      });

      threats.forEach(t => {
        const pulse = (Math.sin(frame / 10) + 1) / 2;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10 + pulse * 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.fillText(`${t.type}_${t.intensity.toFixed(0)}%`, t.x + 10, t.y + 4);
      });

      requestAnimationFrame(animate);
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [threats]);

  const exportThreatReport = () => {
    if (threats.length === 0) return;
    const report = `
STIA GLOBAL THREAT MATRIX REPORT
--------------------------------
TIMESTAMP: ${new Date().toISOString()}

ACTIVE THREATS:
${threats.map(t => `- [${t.type}] Intensity: ${t.intensity.toFixed(1)}% at COORDS(${t.x.toFixed(0)}, ${t.y.toFixed(0)})`).join('\n')}

STIA_CMD: END_THREAT_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_Threat_Report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Cyber Threat Matrix</h3>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-Time Network Attack Visualization</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={exportThreatReport}
             disabled={threats.length === 0}
             className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest transition-all disabled:opacity-20"
           >
             <Download className="w-3 h-3" />
             <span>Export_Matrix</span>
           </button>
           <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[8px] text-red-500 font-bold uppercase">Active_Threats: {threats.length}</span>
           </div>
        </div>
      </div>
      <canvas ref={canvasRef} width="800" height="400" className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-900" />
      <div className="mt-4 grid grid-cols-4 gap-4">
         {['DDOS', 'INTRUSION', 'SPOOFING', 'MALWARE'].map(type => (
           <div key={type} className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex flex-col items-center">
              <span className="text-[7px] text-slate-500 font-bold uppercase">{type}</span>
              <span className="text-xs font-black text-white mono">{threats.filter(t => t.type === type).length}</span>
           </div>
         ))}
      </div>
    </div>
  );
};
