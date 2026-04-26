
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getWarGamesTurn, generateWarGamesReport } from '../services/geminiService.ts';
import { playSystemVoice } from '../services/audioService.ts';

type SimulationState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETE';
type ThreatLevel = 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
type Team = 'RED' | 'BLUE' | 'SYSTEM';

interface SimulationEvent {
  id: string;
  timestamp: string;
  team: Team;
  action: string;
  rationale?: string;
}

const OBJECTIVE_PRESETS = [
    "Degrade signal link integrity below 30%.",
    "Achieve persistent unauthorized access to the terminal.",
    "Execute a successful Denial-of-Service (DoS) attack.",
    "Exfiltrate simulated sensitive data packet."
];

export const WarGamesSimulator: React.FC<{ satName: string }> = ({ satName }) => {
    const [simState, setSimState] = useState<SimulationState>('IDLE');
    const [objective, setObjective] = useState(OBJECTIVE_PRESETS[0]);
    const [eventLog, setEventLog] = useState<SimulationEvent[]>([]);
    const [linkIntegrity, setLinkIntegrity] = useState(100);
    const [threatLevel, setThreatLevel] = useState<ThreatLevel>('LOW');
    const [postActionReport, setPostActionReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const turnCounter = useRef(0);
    const simInterval = useRef<number | null>(null);
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [eventLog]);
    
    useEffect(() => {
      return () => { // Cleanup on unmount
        if (simInterval.current) clearInterval(simInterval.current);
      }
    }, []);

    const addEvent = (team: Team, action: string, rationale?: string) => {
        setEventLog(prev => [...prev, {
            id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            team,
            action,
            rationale
        }]);
    };

    const runSimulationTurn = async () => {
        if (isLoading) return;
        setIsLoading(true);
        turnCounter.current += 1;
        
        const turnData = await getWarGamesTurn(eventLog, objective);
        
        if (turnData) {
            addEvent('RED', turnData.redTeamAction.action, turnData.redTeamAction.rationale);
            addEvent('BLUE', turnData.blueTeamAction.action, turnData.blueTeamAction.rationale);
            addEvent('SYSTEM', turnData.systemStateChange.narrative);

            setLinkIntegrity(prev => Math.max(0, Math.min(100, prev + turnData.systemStateChange.link_integrity_delta)));
            setThreatLevel(turnData.systemStateChange.threat_level as ThreatLevel);

            if (turnData.isObjectiveMet || turnCounter.current >= 10 || linkIntegrity <= 0) {
                endSimulation(turnData.isObjectiveMet ? 'RED' : 'BLUE');
            }
        } else {
            addEvent('SYSTEM', "Simulation error: AI Orchestrator failed to respond.");
            endSimulation('BLUE'); // End on error
        }

        setIsLoading(false);
    };

    const startSimulation = () => {
        setSimState('RUNNING');
        setEventLog([]);
        setLinkIntegrity(100);
        setThreatLevel('LOW');
        setPostActionReport(null);
        turnCounter.current = 0;
        playSystemVoice('War Games simulation initiated.');
        addEvent('SYSTEM', `SCENARIO START: Red Team objective is to "${objective}"`);
        
        // Initial turn
        runSimulationTurn();

        simInterval.current = window.setInterval(runSimulationTurn, 6000);
    };

    const endSimulation = async (winner: 'RED' | 'BLUE') => {
        if (simInterval.current) clearInterval(simInterval.current);
        simInterval.current = null;
        setSimState('COMPLETE');
        playSystemVoice(`Simulation complete. Winner: ${winner} Team.`);
        addEvent('SYSTEM', `SIMULATION END: ${winner} TEAM WINS. Generating Post-Action Report...`);
        
        setIsLoading(true);
        const report = await generateWarGamesReport(eventLog, objective);
        setPostActionReport(report);
        setIsLoading(false);
    };

    const handleReset = () => {
        if (simInterval.current) clearInterval(simInterval.current);
        simInterval.current = null;
        setSimState('IDLE');
        setEventLog([]);
        setPostActionReport(null);
    };

    const exportCombatLog = () => {
      if (eventLog.length === 0) return;
      const report = `
STIA WAR GAMES COMBAT LOG
-------------------------
SAT_NAME: ${satName}
OBJECTIVE: ${objective}
TIMESTAMP: ${new Date().toISOString()}

FEED DATA:
${eventLog.map(e => `[${e.timestamp}] ${e.team}: ${e.action}${e.rationale ? ` (Rationale: ${e.rationale})` : ''}`).join('\n')}

POST-ACTION REPORT:
${postActionReport || 'N/A'}

STIA_CMD: END_LOG
      `.trim();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Combat_Log_${satName.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    const getThreatColor = (level: ThreatLevel) => {
      switch(level) {
        case 'LOW': return 'text-cyan-400';
        case 'ELEVATED': return 'text-yellow-400';
        case 'HIGH': return 'text-orange-500';
        case 'CRITICAL': return 'text-red-500';
      }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-1000">
            {/* Control & Status */}
            <div className="lg:col-span-1 space-y-8">
                <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/60 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                       <svg className="w-40 h-40 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-8 italic border-b-2 border-slate-900 pb-4">Simulation_Control</h3>
                    {simState === 'IDLE' && (
                        <div className="space-y-6 relative z-10">
                             <div className="space-y-3">
                               <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Red_Team_Objective</label>
                               <select value={objective} onChange={e => setObjective(e.target.value)} className="w-full bg-[#050810] border-2 border-slate-900 rounded-2xl p-4 text-[12px] text-white font-black italic tracking-tighter mono outline-none focus:border-red-500/50 cursor-pointer shadow-inner">
                                  {OBJECTIVE_PRESETS.map(op => <option key={op} value={op}>{op}</option>)}
                               </select>
                             </div>
                            <button onClick={startSimulation} className="w-full bg-red-600 hover:bg-white text-slate-950 hover:text-red-600 font-black py-5 rounded-[2rem] border-2 border-transparent hover:border-white uppercase tracking-[0.3em] text-[11px] italic transition-all duration-300 shadow-2xl active:scale-95 group/btn overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
                                <span className="relative z-10">Initiate_Simulation</span>
                            </button>
                        </div>
                    )}
                    {simState !== 'IDLE' && (
                         <div className="space-y-6 relative z-10">
                            <div className="text-center p-8 bg-black rounded-[2rem] border-2 border-slate-900 shadow-inner group/status">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mb-2 group-hover:text-red-500 transition-colors">Current_State</p>
                                <p className={`text-3xl font-black italic tracking-tighter mono ${simState === 'RUNNING' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>{simState}</p>
                            </div>
                            <button onClick={handleReset} className="w-full bg-slate-900 hover:bg-red-600 border-2 border-slate-800 hover:border-white text-slate-500 hover:text-white font-black py-5 rounded-[2rem] uppercase tracking-[0.3em] text-[11px] italic transition-all duration-300 shadow-xl active:scale-95">
                                Terminate_&_Reset
                            </button>
                        </div>
                    )}
                </div>

                <div className="glass p-8 rounded-[2.5rem] border-2 border-slate-800 bg-slate-950/60 shadow-[0_32px_64px_rgba(0,0,0,0.6)] group">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-8 italic border-b-2 border-slate-900 pb-4">Link_Status: <span className="text-red-500">{satName}</span></h3>
                    <div className="space-y-8">
                        <div className="group/integrity">
                            <div className="flex justify-between text-[11px] font-black italic mono text-slate-600 mb-3 uppercase tracking-widest group-hover:text-slate-400 transition-colors"><span>Link_Integrity</span><span>{linkIntegrity.toFixed(1)}%</span></div>
                            <div className="w-full h-4 bg-black rounded-full overflow-hidden border-2 border-slate-900 shadow-inner p-0.5">
                                <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.3)] ${linkIntegrity < 30 ? 'bg-red-600' : linkIntegrity < 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${linkIntegrity}%` }}></div>
                            </div>
                        </div>
                         <div className="group/threat">
                            <div className="flex justify-between text-[11px] font-black italic mono text-slate-600 mb-3 uppercase tracking-widest group-hover:text-slate-400 transition-colors"><span>Threat_Level</span><span className={getThreatColor(threatLevel)}>{threatLevel}</span></div>
                            <div className="w-full h-4 bg-black rounded-full overflow-hidden border-2 border-slate-900 shadow-inner p-0.5 flex">
                                <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(239,68,68,0.3)] ${(getThreatColor(threatLevel) || '').replace('text-','bg-')}`} style={{ width: `${threatLevel === 'LOW' ? 25 : threatLevel === 'ELEVATED' ? 50 : threatLevel === 'HIGH' ? 75 : 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Feed / Report */}
            <div className="lg:col-span-2 glass p-8 rounded-[3rem] border-2 border-slate-800 bg-slate-950/60 shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex flex-col min-h-[600px] relative overflow-hidden group/feed">
                <div className="absolute top-0 left-0 w-1/2 h-1 bg-gradient-to-r from-red-600/30 to-transparent" />
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-900">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                        {simState !== 'COMPLETE' ? 'Live_Combat_Feed' : 'Post-Action_Report'}
                    </h3>
                    {eventLog.length > 0 && (
                      <button 
                        onClick={exportCombatLog}
                        className="group flex items-center space-x-3 px-5 py-2.5 bg-slate-900 hover:bg-white text-slate-500 hover:text-red-600 border-2 border-slate-800 hover:border-white rounded-2xl transition-all shadow-xl active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Transfer_Log</span>
                      </button>
                    )}
                </div>
                {simState !== 'COMPLETE' ? (
                  <div ref={logRef} className="flex-grow overflow-y-auto h-[500px] scrollbar-hide bg-black/60 rounded-[2.5rem] p-8 space-y-5 border-2 border-slate-900 shadow-inner relative">
                        {eventLog.map(log => (
                            <div key={log.id} className="text-[13px] font-black italic mono uppercase tracking-tighter animate-in fade-in slide-in-from-left-4 duration-500">
                               <div className={`flex items-start space-x-4 p-4 rounded-2xl border-2 transition-all ${log.team === 'SYSTEM' ? 'border-transparent' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'}`}>
                                  <span className="text-slate-700 shrink-0 select-none">[{log.timestamp}]</span>
                                  <div className="flex-grow">
                                    <span className={`font-black ${log.team === 'RED' ? 'text-red-500' : log.team === 'BLUE' ? 'text-cyan-400' : 'text-slate-600'}`}>
                                       {log.team}:
                                    </span>
                                    <span className="text-slate-400 ml-2 leading-relaxed">{log.action}</span>
                                    {log.rationale && <p className="text-[11px] text-slate-600 italic mt-3 pl-5 border-l-4 border-slate-900 uppercase">
                                        Rationale: {log.rationale}
                                    </p>}
                                  </div>
                               </div>
                            </div>
                        ))}
                        {isLoading && simState === 'RUNNING' && <div className="text-red-500 text-[11px] font-black italic mono animate-pulse uppercase tracking-[0.4em] p-4 bg-red-600/10 border-2 border-red-500/20 rounded-2xl">Orchestrator_Computing_Next_Vector...</div>}
                    </div>
                ) : (
                  <div className="flex flex-col flex-grow">
                    <div className="flex-grow overflow-y-auto scrollbar-hide bg-black/60 rounded-[2.5rem] p-8 border-2 border-slate-900 shadow-inner">
                        {isLoading ? (
                            <div className="text-red-500 text-[11px] font-black italic mono animate-pulse uppercase tracking-[0.4em]">Compiling_Intelligence_Report...</div>
                        ) : (
                           <div className="markdown-body">
                             <pre className="text-[13px] text-slate-300 font-black italic mono tracking-tighter leading-relaxed whitespace-pre-wrap uppercase">{postActionReport}</pre>
                           </div>
                        )}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-gradient-to-r from-transparent via-slate-900 to-transparent" />
            </div>
        </div>
    );
};
