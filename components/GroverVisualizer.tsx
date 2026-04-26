
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StateProbability {
  state: string;
  probability: number;
  amplitude: number;
}

export const GroverVisualizer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [targetState, setTargetState] = useState('11');
  const [states, setStates] = useState<StateProbability[]>([
    { state: '00', probability: 0.25, amplitude: 0.5 },
    { state: '01', probability: 0.25, amplitude: 0.5 },
    { state: '10', probability: 0.25, amplitude: 0.5 },
    { state: '11', probability: 0.25, amplitude: 0.5 },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`, ...prev].slice(0, 5));

  const reset = () => {
    setStep(0);
    setStates([
      { state: '00', probability: 0.25, amplitude: 0.5 },
      { state: '01', probability: 0.25, amplitude: 0.5 },
      { state: '10', probability: 0.25, amplitude: 0.5 },
      { state: '11', probability: 0.25, amplitude: 0.5 },
    ]);
    setLogs([]);
    addLog("Quantum system initialized in ground state |00>.");
  };

  const applyHadamard = () => {
    setStep(1);
    addLog("Applying Hadamard gates. System in equal superposition.");
    setStates(states.map(s => ({ ...s, probability: 0.25, amplitude: 0.5 })));
  };

  const applyOracle = () => {
    setStep(2);
    addLog(`Oracle engaged. Marking target state |${targetState}> with phase flip.`);
    setStates(states.map(s => ({
      ...s,
      amplitude: s.state === targetState ? -s.amplitude : s.amplitude
    })));
  };

  const applyDiffuser = () => {
    setStep(3);
    addLog("Applying Grover Diffuser. Amplifying target amplitude relative to mean.");
    
    // Calculate mean amplitude
    const meanAmplitude = states.reduce((acc, s) => acc + s.amplitude, 0) / states.length;
    
    // Inversion about the mean: a_i' = 2*mean - a_i
    const newStates = states.map(s => {
      const newAmp = 2 * meanAmplitude - s.amplitude;
      return {
        ...s,
        amplitude: newAmp,
        probability: Math.pow(newAmp, 2)
      };
    });
    
    setStates(newStates);
  };

  const runFullGrover = async () => {
    setIsRunning(true);
    reset();
    await new Promise(r => setTimeout(r, 1000));
    applyHadamard();
    await new Promise(r => setTimeout(r, 1500));
    applyOracle();
    await new Promise(r => setTimeout(r, 1500));
    applyDiffuser();
    await new Promise(r => setTimeout(r, 1500));
    addLog(`Grover Search Complete. Target |${targetState}> identified with high probability.`);
    setIsRunning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">⚛️</span> Quantum <span className="text-indigo-400 ml-2">Grover Search</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Amplitude Amplification Engine // Qiskit Aer Emulation</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isRunning ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
             {isRunning ? 'COHERENCE_MAINTAINED' : 'QUBIT_STABLE'}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Circuit Configuration</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Target_State_Search</label>
                  <select 
                    value={targetState}
                    onChange={e => setTargetState(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="00">|00&gt;</option>
                    <option value="01">|01&gt;</option>
                    <option value="10">|10&gt;</option>
                    <option value="11">|11&gt;</option>
                  </select>
               </div>
               <button 
                 onClick={runFullGrover}
                 disabled={isRunning}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
               >
                 {isRunning ? 'Running_Algorithm...' : 'Execute_Grover_Search'}
               </button>
               <button 
                 onClick={reset}
                 disabled={isRunning}
                 className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest transition-all"
               >
                 Reset_Qubits
               </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Quantum Log</h3>
             <div className="space-y-2">
                {logs.map((log, i) => (
                  <p key={i} className="text-[9px] mono text-indigo-300/70 leading-relaxed">
                    {log}
                  </p>
                ))}
                {logs.length === 0 && <p className="text-[9px] text-slate-700 mono italic">System idle...</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">State Probability Distribution</h3>
                  <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">Step {step}: {step === 0 ? 'Initialization' : step === 1 ? 'Superposition' : step === 2 ? 'Oracle' : 'Diffuser'}</p>
                </div>
                <div className="flex space-x-2">
                   <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                   <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                   <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                </div>
              </div>
              
              <div className="flex-grow flex items-end justify-around px-4 pb-8">
                 {states.map((s) => (
                   <div key={s.state} className="flex flex-col items-center group w-full max-w-[120px]">
                      <div className="relative w-full flex flex-col items-center">
                         {/* Probability Bar */}
                         <motion.div 
                           className={`w-16 rounded-t-xl relative z-10 ${s.state === targetState ? 'bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)]' : 'bg-slate-800'}`}
                           initial={{ height: 0 }}
                           animate={{ height: s.probability * 300 }}
                           transition={{ type: 'spring', damping: 15 }}
                         >
                            <div className="absolute -top-6 left-0 w-full text-center">
                               <span className="text-[10px] font-black text-white mono">{(s.probability * 100).toFixed(0)}%</span>
                            </div>
                         </motion.div>

                         {/* Amplitude Indicator (Negative Phase) */}
                         <AnimatePresence>
                            {s.amplitude < 0 && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -bottom-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                                title="Negative Phase"
                              >
                                -
                              </motion.div>
                            )}
                         </AnimatePresence>
                      </div>
                      
                      <div className="mt-8 text-center">
                         <p className={`text-xs font-black mono ${s.state === targetState ? 'text-indigo-400' : 'text-slate-500'}`}>|{s.state}&gt;</p>
                         <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">Amp: {s.amplitude.toFixed(2)}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                 <div className="flex items-start space-x-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 text-sm">ℹ️</div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Algorithm Insight</p>
                       <p className="text-[9px] text-slate-500 leading-relaxed italic">
                         Grover's algorithm provides a quadratic speedup for searching unstructured databases. By iteratively applying the Oracle and Diffuser, we "rotate" the state vector towards the target, increasing its probability amplitude until measurement.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
