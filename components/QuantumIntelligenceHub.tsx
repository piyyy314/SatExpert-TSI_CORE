import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Lock, 
  Layers, 
  Target, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  Database,
  Radar
} from 'lucide-react';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] border-b-2 ${
      active 
        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const QuantumIntelligenceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'crypto' | 'platforms' | 'risk'>('hardware');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
            Strategic <span className="text-cyan-500">Quantum Intelligence</span> Hub
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 italic">
            Ref: Q-INTEL-EXE-SUM-2026 // Integrated Tactical Report
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tab 
            id="hardware" 
            label="Hardware Metrics" 
            icon={<Cpu className="w-4 h-4" />} 
            active={activeTab === 'hardware'} 
            onClick={() => setActiveTab('hardware')} 
          />
          <Tab 
            id="crypto" 
            label="Crypto Threats" 
            icon={<Lock className="w-4 h-4" />} 
            active={activeTab === 'crypto'} 
            onClick={() => setActiveTab('crypto')} 
          />
          <Tab 
            id="platforms" 
            label="Platform Intel" 
            icon={<Layers className="w-4 h-4" />} 
            active={activeTab === 'platforms'} 
            onClick={() => setActiveTab('platforms')} 
          />
          <Tab 
            id="risk" 
            label="Risk Matrix" 
            icon={<AlertTriangle className="w-4 h-4" />} 
            active={activeTab === 'risk'} 
            onClick={() => setActiveTab('risk')} 
          />
        </div>
      </header>

      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
          {activeTab === 'hardware' && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass overflow-hidden rounded-[32px] border-slate-800 bg-slate-950/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum System</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qubits</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fidelity / Error</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-medium text-slate-300">
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black text-white">IBM Condor (2023)</td>
                      <td className="px-6 py-4">Superconducting</td>
                      <td className="px-6 py-4 text-center font-mono text-cyan-400">1,121</td>
                      <td className="px-6 py-4 font-mono">Error ≲0.1%</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-black">RECORD SCALE</span></td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black text-white">Google Willow (2024)</td>
                      <td className="px-6 py-4">Superconducting</td>
                      <td className="px-6 py-4 text-center font-mono text-cyan-400">105</td>
                      <td className="px-6 py-4 font-mono">T1 ~100µs</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-black">QEC VALIDATED</span></td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black text-white">Quantinuum H2-1 (2024)</td>
                      <td className="px-6 py-4">Trapped-Ion</td>
                      <td className="px-6 py-4 text-center font-mono text-cyan-400">56</td>
                      <td className="px-6 py-4 font-mono">Fidelity ≥99.9%</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-[9px] font-black">HIGH PRECISION</span></td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black text-white">IonQ Aria (2025)</td>
                      <td className="px-6 py-4">Trapped-Ion</td>
                      <td className="px-6 py-4 text-center font-mono text-cyan-400">21</td>
                      <td className="px-6 py-4 font-mono">2-Q Error 0.4%</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[9px] font-black text-center">#AlgQubits=20</span></td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black text-white">IonQ Forte (2025)</td>
                      <td className="px-6 py-4">Trapped-Ion</td>
                      <td className="px-6 py-4 text-center font-mono text-cyan-400">~30</td>
                      <td className="px-6 py-4 font-mono">Commercial (TI)</td>
                      <td className="px-6 py-4 text-slate-500 italic uppercase font-black">PRE-COMMERCIAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl">
                 <div className="flex items-center space-x-3 mb-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">SNDL Analysis (Store Now Decrypt Later)</h4>
                 </div>
                 <p className="text-[11px] text-slate-400 font-medium">
                    The rapid increase in qubit fidelity (Quantinuum 99.9% milestone) accelerates the timeline for surface code efficacy. Current state intelligence indicates bulk encrypted captures are being archived globally for decryption in the CRQC window (est. 2030+).
                 </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'crypto' && (
            <motion.div
              key="crypto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  title: "RSA-2048 / ECC",
                  threat: "Broken by Shor's algorithm on fault-tolerant QC.",
                  time: "CRQC ~2030s-2040s",
                  status: "PQC Standards (FIPS 203) ready.",
                  color: "text-rose-500",
                  bg: "bg-rose-500/5",
                  border: "border-rose-500/20"
                },
                {
                  title: "Symmetric (AES-128)",
                  threat: "Grover's halves key strength (AES-128 -> AES-64).",
                  time: "Low (Quantum safe if 256-bit)",
                  status: "Transition to AES-256 for margin.",
                  color: "text-amber-500",
                  bg: "bg-amber-500/5",
                  border: "border-amber-500/20"
                },
                {
                  title: "Hash (SHA-2/3)",
                  threat: "Grover's halves collision resistance.",
                  time: "Low (Resilient)",
                  status: "No change needed short term.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/5",
                  border: "border-emerald-500/20"
                },
                {
                  title: "ECDSA / Signatures",
                  threat: "Shor's algorithm compromise of existing keys.",
                  time: "CRQC window identical to RSA",
                  status: "Plan PQC signature migration (Dilithium).",
                  color: "text-rose-500",
                  bg: "bg-rose-500/5",
                  border: "border-rose-500/20"
                }
              ].map((item, idx) => (
                <div key={idx} className={`glass p-6 rounded-[32px] border ${item.border} ${item.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-black uppercase ${item.color}`}>{item.title}</h3>
                    <Lock className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Threat Model</span>
                      <p className="text-xs text-slate-300 font-medium">{item.threat}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Timeframe</span>
                      <p className="text-xs text-slate-300 font-mono italic">{item.time}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-800/50">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-3 h-3 text-cyan-500" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{item.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'platforms' && (
            <motion.div
              key="platforms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Palantir */}
                <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Database className="w-32 h-32 text-white" />
                  </div>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                      <Database className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Palantir</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Foundry / Gotham / AIP</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecture</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        3-tier cloud/enterprise stack (Foundry, Gotham, Apollo). Zero-trust mesh with granular RBAC/labels.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Attack Surface (Known Vulnerabilities)</h4>
                      <ul className="text-xs text-slate-300 space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-rose-500 mt-1">•</span>
                          <span><span className="font-bold text-rose-400">CVE-2022-27891:</span> Session username exposure via info leak.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-rose-500 mt-1">•</span>
                          <span>Path traversal & UI-flaws reported in 2023 audits.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-rose-500 mt-1">•</span>
                          <span>API endpoint misconfigurations in standard cloud deployments.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Red Team Priority: API Fuzzing</span>
                      </div>
                      <button 
                        onClick={() => {
                          const event = new CustomEvent('nav-view', { detail: 'palantir_audit' });
                          window.dispatchEvent(event);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                      >
                        Launch Audit Suite
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aegis */}
                <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Radar className="w-32 h-32 text-white" />
                  </div>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <Radar className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Aegis</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Combat C2 / BMD / Radar</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecture</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        Embedded real-time ICS/OT system. SPY-7 radar integration, Link-16/CEC networks.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Attack Surface (Security Incidents)</h4>
                      <ul className="text-xs text-slate-300 space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span><span className="font-bold text-amber-400">2015 Hack:</span> Reported breach of South Korean Aegis data link.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>GAO alerts on "legacy IT" and supply chain firmware vulnerabilities.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Signal capture/injection vulnerabilities in Link-16 comms.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-6 border-t border-slate-800/50">
                      <div className="flex items-center space-x-2 text-amber-400">
                        <Target className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Red Team Priority: Signal Injection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass overflow-hidden rounded-[32px] border-slate-800 bg-slate-950/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vulnerability / Threat</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Likelihood</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mitigation Priority</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-medium text-slate-300">
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black">Quantum Breakdown of RSA/ECC</td>
                      <td className="px-6 py-4 text-amber-500 uppercase font-black">Medium (Emerging)</td>
                      <td className="px-6 py-4 text-rose-500 uppercase font-black underline">Catastrophic</td>
                      <td className="px-6 py-4">High (Hybrid PQC)</td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black">Palantir Web Vulnerabilities (XSS/SQLi)</td>
                      <td className="px-6 py-4 text-emerald-500 uppercase font-black">Medium (Common)</td>
                      <td className="px-6 py-4 text-amber-500 uppercase font-black">Medium</td>
                      <td className="px-6 py-4">Moderate (SAST/DAST)</td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black">Aegis Network Compromise</td>
                      <td className="px-6 py-4 text-slate-500 uppercase font-black">Low</td>
                      <td className="px-6 py-4 text-rose-500 uppercase font-black underline">Critical</td>
                      <td className="px-6 py-4">High (Segmentation)</td>
                    </tr>
                    <tr className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-black">Palantir Misconfiguration (RBAC Leak)</td>
                      <td className="px-6 py-4 text-amber-500 uppercase font-black">Medium</td>
                      <td className="px-6 py-4 text-rose-500 uppercase font-black">High</td>
                      <td className="px-6 py-4">High (Zero Trust)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border-slate-800 bg-slate-950/40">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Ethical Testing Recommendations</h3>
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    <li>• <span className="text-cyan-400 font-bold">Audit:</span> Identify all RSA/ECC dependencies in critical infrastructure.</li>
                    <li>• <span className="text-cyan-400 font-bold">Operation:</span> Use Grover protocols to test search-space reductions on symmetric keys.</li>
                    <li>• <span className="text-cyan-400 font-bold">Lab:</span> Experiment with <span className="text-white italic">Open Quantum Safe</span> (liboqs) libraries.</li>
                    <li>• <span className="text-cyan-400 font-bold">Isolate:</span> Never disrupt live missions (Aegis) or production analytics (Palantir).</li>
                  </ul>
                </div>
                <div className="glass p-6 rounded-2xl border-slate-800 bg-slate-950/40">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-rose-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Aegis ICS Defense</h3>
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    <li>• <span className="text-rose-400 font-bold">Segmentation:</span> Air-gap tactical links from administrative networks.</li>
                    <li>• <span className="text-rose-400 font-bold">Anomaly:</span> Implement ML-based pattern detection on sensor data streams.</li>
                    <li>• <span className="text-rose-400 font-bold">Supply Chain:</span> Rigid hardware-root-of-trust for firmware updates.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Intelligence_Level: LEVEL-5 (TOP SECRET)</span>
          <div className="w-px h-3 bg-slate-800"></div>
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Analyst_ID: UNKNOWN-2U</span>
        </div>
        <div className="flex space-x-2">
          {['NIST', 'NCSC', 'GAO', 'DoD'].map(source => (
            <span key={source} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-500 transition-colors cursor-help">
              {source}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};
