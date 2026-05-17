import React, { useState, useEffect } from 'react';
import { Share2, Users, Crosshair, Hexagon } from 'lucide-react';

export const SwarmIntelligenceDashboard: React.FC = () => {
    const [drones, setDrones] = useState<{ id: string; target: string; status: string; alt: number }[]>([]);

    useEffect(() => {
        const initialDrones = Array.from({ length: 6 }).map((_, i) => ({
            id: `UAV-${100 + i}`,
            target: 'AUTO-PATROL',
            status: 'AIRBORNE',
            alt: Math.floor(1000 + Math.random() * 500)
        }));
        setDrones(initialDrones);

        const int = setInterval(() => {
            setDrones(prev => prev.map(d => ({
                ...d,
                alt: d.alt + (Math.random() * 50 - 25),
                status: Math.random() > 0.95 ? 'RE-ROUTING' : 'AIRBORNE'
            })));
        }, 3000);

        return () => clearInterval(int);
    }, []);

    return (
        <div className="glass p-6 rounded-2xl border border-teal-900/50 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Hexagon className="w-48 h-48 text-teal-500 animate-spin-slow" />
            </div>

            <div className="flex items-center justify-between border-b border-teal-900/50 pb-4 relative z-10">
                <div className="flex items-center space-x-3">
                    <Share2 className="w-5 h-5 text-teal-400" />
                    <h2 className="text-sm font-black text-teal-400 tracking-[0.2em] uppercase">Swarm Intelligence Core</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-300 bg-teal-900/30 px-3 py-1 rounded border border-teal-500/20">
                    <Users className="w-3 h-3" />
                    <span>HIVE MIND ACTIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {drones.map((drone, i) => (
                    <div key={drone.id} className="bg-slate-900/80 border border-slate-700/50 p-3 rounded-xl hover:border-teal-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black text-slate-300">{drone.id}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                drone.status === 'AIRBORNE' ? 'text-teal-400 border-teal-500/30 bg-teal-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            }`}>
                                {drone.status}
                            </span>
                        </div>
                        <div className="space-y-1 mt-3">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                <span>TARGET:</span>
                                <span className="text-slate-400">{drone.target}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                <span>ALTITUDE:</span>
                                <span className="text-slate-400">{Math.floor(drone.alt)} M</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 relative z-10">
                <button className="flex-1 flex items-center justify-center space-x-2 bg-teal-600/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-300 py-2 rounded uppercase text-[10px] font-bold tracking-widest transition-colors">
                    <Crosshair className="w-4 h-4" />
                    <span>Synchronize Attack Vector</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2 rounded uppercase text-[10px] font-bold tracking-widest transition-colors">
                    <Hexagon className="w-4 h-4" />
                    <span>Deploy Reserves</span>
                </button>
            </div>
        </div>
    );
};
