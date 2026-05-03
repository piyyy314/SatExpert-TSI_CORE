
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Waves, Crosshair, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface StrikeResult {
  id: string;
  type: string;
  coordinates: string;
  damage: number;
  time: string;
}

export const OrbitalStriker: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [selectedVector, setSelectedVector] = useState<'KINETIC' | 'EMP' | 'LASER'>('KINETIC');
  const [targetCoord, setTargetCoord] = useState({ x: 50, y: 50 });
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [history, setHistory] = useState<StrikeResult[]>([]);
  const [showImpact, setShowImpact] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const vectors = {
    KINETIC: { name: 'Kinetic Slug (Rod from God)', icon: <Waves className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-500', desc: 'High-density tungsten rods. Pure kinetic devastation.' },
    EMP: { name: 'E-Pulse Burst', icon: <Zap className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-500', desc: 'High-altitude electromagnetic pulse. Disables all electronics.' },
    LASER: { name: 'Directed Energy Beam', icon: <Target className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500', desc: 'Precision thermal beam. Surgical structural removal.' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw crosshair
      const px = (targetCoord.x / 100) * canvas.width;
      const py = (targetCoord.y / 100) * canvas.height;
      
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, 40, 0, Math.PI * 2); ctx.stroke();
      
      ctx.beginPath(); ctx.moveTo(px - 60, py); ctx.lineTo(px + 60, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py - 60); ctx.lineTo(px, py + 60); ctx.stroke();

      // Scan animation
      const scanY = (Date.now() / 20) % canvas.height;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY); ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [targetCoord]);

  const executeStrike = () => {
    if (isCharging) return;
    setIsCharging(true);
    setChargeProgress(0);
    
    if (addMissionLog) {
      addMissionLog(`ORBITAL_INIT: Vector ${selectedVector} authorized. Charging capacitors...`, 'active');
    }

    const interval = setInterval(() => {
      setChargeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleImpact();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleImpact = () => {
    setShowImpact(true);
    const newStrike = {
      id: Math.random().toString(36).substr(2, 6),
      type: selectedVector,
      coordinates: `${targetCoord.x.toFixed(1)}°N, ${targetCoord.y.toFixed(1)}°E`,
      damage: Math.floor(Math.random() * 40) + 60,
      time: new Date().toLocaleTimeString()
    };
    setHistory(prev => [newStrike, ...prev].slice(0, 5));
    
    if (addMissionLog) {
      addMissionLog(`IMPACT_CONFIRMED: Target area at ${newStrike.coordinates} suffered ${newStrike.damage}% structural loss.`, 'STRIKE');
    }

    setTimeout(() => {
      setShowImpact(false);
      setIsCharging(false);
      setChargeProgress(0);
    }, 2000);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCharging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTargetCoord({ x, y });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="glass rounded-[32px] border-2 border-slate-800 overflow-hidden relative shadow-2xl bg-black">
          <div className="absolute top-4 left-4 z-10 font-black text-[10px] text-cyan-500 uppercase tracking-widest bg-slate-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            Satellite_Feed: ION_CANNON_01 // ACTIVE
          </div>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={500} 
            onClick={handleCanvasClick}
            className="w-full h-[500px] cursor-crosshair opacity-80"
          />
          
          <AnimatePresence>
            {showImpact && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 3] }}
                transition={{ duration: 1.5 }}
                className={`absolute pointer-events-none rounded-full blur-3xl ${vectors[selectedVector].bg}`}
                style={{ 
                  left: `${targetCoord.x}%`, 
                  top: `${targetCoord.y}%`, 
                  width: '200px', 
                  height: '200px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 right-6 flex items-end justify-end space-x-6">
             <div className="text-right">
                <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Target_Acquired</div>
                <div className="text-xl font-black text-cyan-400 mono">
                   {targetCoord.x.toFixed(1)}°N / {targetCoord.y.toFixed(1)}°E
                </div>
             </div>
             <button 
               onClick={executeStrike}
               disabled={isCharging}
               className={`h-20 w-20 rounded-full border-4 flex items-center justify-center transition-all active:scale-90 shadow-2xl ${
                 isCharging 
                 ? 'bg-slate-900 border-red-500/50 cursor-not-allowed text-red-500' 
                 : 'bg-red-600 border-red-400 hover:bg-red-500 text-white shadow-red-600/40'
               }`}
             >
               {isCharging ? (
                 <div className="text-[10px] font-black">{chargeProgress}%</div>
               ) : (
                 <AlertTriangle className="w-8 h-8" />
               )}
             </button>
          </div>

          <AnimatePresence>
            {isCharging && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${chargeProgress}%` }}
                className="absolute bottom-0 left-0 h-1 bg-red-500 shadow-[0_0_10px_#ef4444]"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {(Object.keys(vectors) as Array<keyof typeof vectors>).map(v => (
             <button
               key={v}
               onClick={() => setSelectedVector(v)}
               disabled={isCharging}
               className={`p-4 rounded-2xl border-2 transition-all text-left ${
                 selectedVector === v 
                 ? `bg-slate-900 border-2 ${v === 'KINETIC' ? 'border-amber-500' : v === 'EMP' ? 'border-blue-500' : 'border-red-500'}` 
                 : 'bg-slate-950 border-slate-800 opacity-50 hover:opacity-80'
               }`}
             >
               <div className={`mb-3 p-2 rounded-lg bg-slate-900 w-fit ${vectors[v].color}`}>
                 {vectors[v].icon}
               </div>
               <div className="text-[10px] font-black text-white uppercase tracking-wider mb-1">{vectors[v].name}</div>
               <div className="text-[9px] text-slate-500 leading-tight">{vectors[v].desc}</div>
             </button>
           ))}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Mission_Parameters</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 uppercase">Authorization_Code</span>
                  <span className="text-[9px] font-mono text-cyan-400">#ALPHA-9-KINETIC</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 uppercase">Weapon_Status</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${isCharging ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isCharging ? 'PRIMING' : 'READY'}
                  </span>
               </div>
               <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-[9px] text-slate-400 uppercase">Collateral_Risk</span>
                  <span className="text-[9px] font-black text-amber-500">SIGNIFICANT</span>
               </div>
            </div>

            <div className="mt-8 space-y-3">
               <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex space-x-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[9px] text-red-400 leading-normal">Striking civilian infrastructure or non-combatant targets is a breach of protocol. Vector authorization required for every engagement.</p>
               </div>
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Strike_Log</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {history.length === 0 ? (
                 <div className="text-[9px] text-slate-700 italic py-4 text-center">No successful engagements in current session.</div>
               ) : (
                 history.map(log => (
                   <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${vectors[log.type as keyof typeof vectors].bg} text-slate-950`}>{log.type}</span>
                         <span className="text-[8px] text-slate-600 mono">{log.time}</span>
                      </div>
                      <div className="text-[9px] text-slate-300 font-bold">{log.coordinates}</div>
                      <div className="flex items-center justify-between overflow-hidden">
                         <div className="text-[8px] text-slate-500 uppercase">Damage_Radius</div>
                         <div className="h-1 flex-grow mx-4 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${log.damage}%` }} />
                         </div>
                         <div className="text-[8px] font-black text-red-400">{log.damage}%</div>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
