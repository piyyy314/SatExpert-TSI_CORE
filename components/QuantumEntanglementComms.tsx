import React, { useState, useEffect } from 'react';
import { Network, Orbit, ShieldAlert, Cpu, Radio, Zap } from 'lucide-react';

export const QuantumEntanglementComms: React.FC = () => {
    const [status, setStatus] = useState<'INITIALIZING' | 'ENTANGLING' | 'SECURE' | 'DECOHERENCE_WARNING'>('INITIALIZING');
    const [qubitCount, setQubitCount] = useState(0);
    const [entanglementRate, setEntanglementRate] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'INITIALIZING') {
            timer = setTimeout(() => setStatus('ENTANGLING'), 2000);
        } else if (status === 'ENTANGLING') {
            const int = setInterval(() => {
                setQubitCount(prev => {
                    const next = prev + Math.floor(Math.random() * 24);
                    if (next >= 1024) {
                        clearInterval(int);
                        setStatus('SECURE');
                        return 1024;
                    }
                    return next;
                });
            }, 100);
            return () => clearInterval(int);
        } else if (status === 'SECURE') {
            const int = setInterval(() => {
                setEntanglementRate(99.9 + (Math.random() * 0.09));
                if (Math.random() > 0.98) {
                    setStatus('DECOHERENCE_WARNING');
                }
            }, 1000);
            return () => clearInterval(int);
        } else if (status === 'DECOHERENCE_WARNING') {
            timer = setTimeout(() => {
                setStatus('ENTANGLING');
                setQubitCount(400);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [status]);

    return (
        <div className="glass p-6 rounded-2xl border border-indigo-900/50 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Network className="w-32 h-32 text-indigo-400 animate-spin-slow" />
            </div>
            
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-4 relative z-10">
                <div className="flex items-center space-x-3">
                    <Orbit className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-black text-indigo-400 tracking-[0.2em] uppercase">Quantum Entanglement Link</h2>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest border ${
                    status === 'SECURE' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' :
                    status === 'DECOHERENCE_WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                    {status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] text-slate-500 uppercase tracking-wider">Entangled Qubits</span>
                       <Cpu className="w-4 h-4 text-slate-400" />
                   </div>
                   <div className="flex items-end space-x-2">
                       <span className="text-2xl font-black text-white">{qubitCount}</span>
                       <span className="text-xs text-slate-500 mb-1">/ 1024</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(qubitCount / 1024) * 100}%` }}></div>
                   </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] text-slate-500 uppercase tracking-wider">Fidelity Rate</span>
                       <Zap className="w-4 h-4 text-slate-400" />
                   </div>
                   <div className="flex items-end space-x-2">
                       <span className="text-2xl font-black text-white">{status === 'SECURE' ? entanglementRate.toFixed(3) : '---'}</span>
                       <span className="text-xs text-slate-500 mb-1">%</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden flex">
                       <div className="h-full bg-indigo-400 animate-pulse" style={{ width: '100%' }}></div>
                   </div>
                </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl relative z-10">
                <div className="flex items-center space-x-3 mb-2 text-indigo-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">QKD Protocol Status</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    Quantum Key Distribution (QKD) utilizing BB84 protocol over entangled photons. 
                    Providing mathematically unbreakable transmission. Any eavesdropping attempt will trigger wave function collapse and immediate alert.
                </p>
                <div className="mt-4 flex gap-2">
                   <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded uppercase tracking-wider transition-colors">
                      Force Re-Entanglement
                   </button>
                   <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2 rounded uppercase tracking-wider transition-colors border border-slate-700 hover:border-slate-600">
                      Generate Q-Key
                   </button>
                </div>
            </div>
        </div>
    );
};
