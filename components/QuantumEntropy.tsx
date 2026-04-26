
import * as React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Lock, ScanLine } from 'lucide-react';

export const QuantumEntropy: React.FC = () => {
  const [entropy, setEntropy] = React.useState(Array(24).fill(0).map(() => Math.random()));
  const [isQuantumSecured, setIsQuantumSecured] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEntropy(prev => prev.map(v => 
        Math.max(0.1, Math.min(0.9, v + (Math.random() - 0.5) * 0.1))
      ));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Quantum Entropy Matrix</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isQuantumSecured ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isQuantumSecured ? 'ML-DSA-65 Active' : 'Fallback RSA'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {entropy.map((val, i) => (
          <div key={i} className="h-12 bg-slate-900/50 rounded-lg border border-slate-800 relative overflow-hidden group">
            <motion.div 
              className={`absolute bottom-0 left-0 right-0 ${isQuantumSecured ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
              animate={{ height: `${val * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] font-mono text-emerald-400">{(val * 1024).toFixed(0)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md">
           <div className="flex items-start space-x-3">
             <div className="mt-1 p-1 bg-blue-500/10 rounded border border-blue-500/30">
               <ScanLine className="w-3 h-3 text-blue-400" />
             </div>
             <div>
               <p className="text-[10px] font-black text-white uppercase mb-1">Cripto-Analysis vs Shor's Algorithm</p>
               <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Legacy RSA-2048</span>
                     <span className="text-xs font-bold text-red-500">VULNERABLE (T-3s)</span>
                  </div>
                  <div className="w-px h-6 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">ML-DSA-65 (TSI)</span>
                     <span className="text-xs font-bold text-emerald-400">RESISTANT (∞)</span>
                  </div>
               </div>
             </div>
           </div>
        </div>

        <button 
          onClick={() => setIsQuantumSecured(!isQuantumSecured)}
          className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
        >
          {isQuantumSecured ? (
            <>
              <Lock className="w-3 h-3" />
              <span>Rotate Quantum Keys</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-red-600" />
              <span>Restore PQC Security</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
