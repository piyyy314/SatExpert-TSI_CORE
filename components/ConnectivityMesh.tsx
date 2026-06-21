
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Link as LinkIcon, Zap, Shield, Cpu, Activity, Download } from 'lucide-react';
import { Satellite } from '../types';

interface MeshLink {
  fromIdx: number;
  toIdx: number;
  strength: number;
  active: boolean;
}

export const ConnectivityMesh: React.FC<{ satellites: Satellite[], selectedSat: Satellite }> = ({ satellites, selectedSat }) => {
  const [links, setLinks] = useState<MeshLink[]>([]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Generate some inter-satellite links
    const newLinks: MeshLink[] = [];
    for (let i = 0; i < satellites.length; i++) {
      // Connect to next 2 satellites to form a ring/mesh
      for (let j = 1; j <= 2; j++) {
        newLinks.push({
          fromIdx: i,
          toIdx: (i + j) % satellites.length,
          strength: 0.5 + Math.random() * 0.5,
          active: Math.random() > 0.1
        });
      }
    }
    setLinks(newLinks);

    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [satellites.length]);

  const exportMeshReport = () => {
    if (satellites.length === 0) return;
    const report = `
STIA CONSTELLATION MESH TOPOLOGY
-------------------------------
TIMESTAMP: ${new Date().toISOString()}

ACTIVE SATELLITES:
${satellites.map(s => `- ${s.name} (${s.operator}) | Latency: 142ms`).join('\n')}

TOPOLOGY LINKS:
${links.map(l => `- Link: ${satellites[l.fromIdx]?.name} <-> ${satellites[l.toIdx]?.name} (Active: ${l.active})`).join('\n')}

STIA_CMD: END_MESH_LOG
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_Mesh_Topology_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const centerX = 200;
  const centerY = 200;
  const radius = 140;

  const points = useMemo(() => {
    return satellites.map((sat, i) => {
      const angle = (i / satellites.length) * Math.PI * 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        sat
      };
    });
  }, [satellites, radius]);

  const selectedIdx = satellites.findIndex(s => s.id === selectedSat.id);

  return (
    <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-950/60 transition-all duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
         <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
               <span className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mr-4">
                  <Globe className="w-6 h-6 text-cyan-500" />
               </span>
               Global <span className="text-cyan-500 ml-2">Constellation Mesh</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Cross-Link Layer 2 Topology // Real-Time Routing</p>
         </div>
         <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
               <span className="text-[9px] text-slate-600 font-bold uppercase">Mesh_Integrity</span>
               <span className="text-sm font-black text-emerald-500 mono tracking-widest">99.999%</span>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] text-slate-600 font-bold uppercase">Average_Latency</span>
               <span className="text-sm font-black text-cyan-400 mono tracking-widest">142ms ISL</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
         <div className="lg:col-span-7 flex justify-center relative">
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] drop-shadow-[0_0_30px_rgba(34,211,238,0.1)]">
               {/* Earth Circle */}
               <circle cx={centerX} cy={centerY} r={radius * 0.6} className="fill-slate-900 stroke-slate-800" strokeWidth="2" strokeDasharray="4 4" />
               
               {/* Links */}
               {links.map((link, i) => {
                 const p1 = points[link.fromIdx];
                 const p2 = points[link.toIdx];
                 const isSelectedLink = link.fromIdx === selectedIdx || link.toIdx === selectedIdx;
                 
                 return (
                   <motion.line
                     key={i}
                     x1={p1.x}
                     y1={p1.y}
                     x2={p2.x}
                     y2={p2.y}
                     stroke={isSelectedLink ? '#22d3ee' : '#1e293b'}
                     strokeWidth={isSelectedLink ? 2 : 1}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: isSelectedLink ? [0.4, 0.8, 0.4] : 0.2 }}
                     transition={{ duration: 2, repeat: Infinity }}
                   />
                 );
               })}

               {/* Nodes */}
               {points.map((p, i) => {
                 const isSelected = i === selectedIdx;
                 return (
                   <g key={i}>
                      <motion.circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 6 : 3}
                        className={isSelected ? 'fill-cyan-500 shadow-xl' : 'fill-slate-700'}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.5 }}
                      />
                      {isSelected && (
                        <circle cx={p.x} cy={p.y} r={12} className="stroke-cyan-500 fill-none opacity-30 animate-ping" />
                      )}
                      {isSelected && (
                        <text x={p.x + 10} y={p.y + 4} className="fill-cyan-400 text-[8px] font-black uppercase mono">{p.sat.name}</text>
                      )}
                   </g>
                 );
               })}
            </svg>
         </div>

         <div className="lg:col-span-5 space-y-6">
            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
               <div className="flex items-center space-x-3 mb-6">
                  <Cpu className="w-4 h-4 text-cyan-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link Parameters</span>
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Uplink Power', val: '42.5 dBW', sub: 'Saturation Impending' },
                    { label: 'Beam Convergence', val: '0.04°', sub: 'High Precision' },
                    { label: 'Inter-Sat Bandwidth', val: '1.2 Tbps', sub: 'Optic Backbone' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col p-3 bg-slate-900/60 rounded-xl border border-slate-800/50 group hover:border-cyan-500/40 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase">{item.label}</span>
                          <span className="text-[11px] font-black text-cyan-400 mono">{item.val}</span>
                       </div>
                       <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{item.sub}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-cyan-500/20 transition-all"></div>
               <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Routing Analysis</span>
               </div>
               <p className="text-[11px] text-slate-300 font-bold leading-relaxed mb-4">
                  Multi-hop routing discovered for target {selectedSat.name}. Optimal path calculated through {satellites[Math.floor(Math.random() * satellites.length)].name}.
               </p>
               <button className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-cyan-500/30">
                  Execute_Relay_Handoff
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
