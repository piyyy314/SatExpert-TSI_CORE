
import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Trash2, Plus } from 'lucide-react';

interface Objective {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const MissionPlanner: React.FC = () => {
  const [objectives, setObjectives] = useState<Objective[]>([
    { id: '1', title: 'Establish stable link with Telstar 12V', status: 'COMPLETED', priority: 'HIGH' },
    { id: '2', title: 'Analyze anomalous signal in Sector 7', status: 'IN_PROGRESS', priority: 'CRITICAL' },
    { id: '3', title: 'Deploy Quantum Key Distribution (QKD) layer', status: 'PENDING', priority: 'MEDIUM' },
  ]);

  const [newObjective, setNewObjective] = useState('');

  const addObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives([...objectives, {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newObjective,
      status: 'PENDING',
      priority: 'LOW'
    }]);
    setNewObjective('');
  };

  const exportMissionData = () => {
    if (objectives.length === 0) return;
    const report = `
STIA MISSION STRATEGY REPORT
----------------------------
TIMESTAMP: ${new Date().toISOString()}

DIRECTIVES:
${objectives.map(o => `[${o.status}] Priority: ${o.priority} | ${o.title}`).join('\n')}

STIA_CMD: END_PLAN
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_Mission_Plan_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = (id: string) => {
    setObjectives(prev => prev.map(o => {
      if (o.id === id) {
        const nextStatus: Record<Objective['status'], Objective['status']> = {
          'PENDING': 'IN_PROGRESS',
          'IN_PROGRESS': 'COMPLETED',
          'COMPLETED': 'FAILED',
          'FAILED': 'PENDING'
        };
        return { ...o, status: nextStatus[o.status] };
      }
      return o;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">📋</span> Mission <span className="text-amber-500 ml-2">Planner</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Strategic Objective Management // Sector X</p>
        </div>
        <button 
          onClick={exportMissionData}
          disabled={objectives.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-widest transition-all disabled:opacity-30"
        >
          <Download className="w-3 h-3" />
          <span>Export_Plan</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">New Directive</h3>
            <div className="space-y-4">
               <textarea 
                 value={newObjective}
                 onChange={e => setNewObjective(e.target.value)}
                 placeholder="Enter mission objective..."
                 className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-amber-500 min-h-[100px] resize-none"
               />
               <button 
                 onClick={addObjective}
                 className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-amber-600/20 transition-all active:scale-95"
               >
                 Authorize_Directive
               </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mission Statistics</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-slate-500 font-bold uppercase">Success Rate</span>
                   <span className="text-xs font-black text-green-500 mono">66.7%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500" style={{ width: '66.7%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <p className="text-[7px] text-slate-500 font-bold uppercase">Active</p>
                      <p className="text-sm font-black text-white mono">{objectives.filter(o => o.status === 'IN_PROGRESS').length}</p>
                   </div>
                   <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <p className="text-[7px] text-slate-500 font-bold uppercase">Pending</p>
                      <p className="text-sm font-black text-white mono">{objectives.filter(o => o.status === 'PENDING').length}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[400px]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Active Directives</h3>
              <div className="space-y-4">
                 <AnimatePresence mode="popLayout">
                    {objectives.map((o) => (
                      <motion.div 
                        key={o.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center space-x-4">
                           <button 
                             onClick={() => toggleStatus(o.id)}
                             className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                               o.status === 'COMPLETED' ? 'bg-green-500 border-green-400' : 
                               o.status === 'IN_PROGRESS' ? 'bg-cyan-500 border-cyan-400 animate-pulse' :
                               o.status === 'FAILED' ? 'bg-red-500 border-red-400' :
                               'border-slate-700 hover:border-slate-500'
                             }`}
                           >
                             {o.status === 'COMPLETED' && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                           </button>
                           <div>
                              <p className={`text-xs font-bold uppercase tracking-wide ${o.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-white'}`}>{o.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                   o.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                                   o.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                   'bg-slate-800 text-slate-500'
                                 }`}>
                                   {o.priority}
                                 </span>
                                 <span className="text-[8px] text-slate-600 font-bold uppercase">{o.status}</span>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => setObjectives(prev => prev.filter(item => item.id !== o.id))}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
