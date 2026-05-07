
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Lock, Unlock, Zap, RefreshCcw, Terminal, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const QuantumDecryptor: React.FC<{ addMissionLog?: (detail: string, status?: any) => void }> = ({ addMissionLog }) => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundKeys, setFoundKeys] = useState<string[]>([]);
  const [currentCipher, setCurrentCipher] = useState('AES-256_GCM_0x7F2A');
  const [qubits, setQubits] = useState<number[]>(Array(16).fill(0).map(() => Math.random()));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDecryption = () => {
    if (isDecrypting) return;
    setIsDecrypting(true);
    setProgress(0);
    if (addMissionLog) {
      addMissionLog(`QUANTUM_INIT: Aligning qubits to cipher ${currentCipher}...`, 'active');
    }
  };

  useEffect(() => {
    if (!isDecrypting) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 0.8);
        return next >= 100 ? 100 : next;
      });

      setQubits(prev => prev.map(q => Math.random() > 0.5 ? Math.random() : q));
    }, 100);

    return () => clearInterval(interval);
  }, [isDecrypting]);

  useEffect(() => {
    if (progress >= 100 && isDecrypting) {
      handleSuccess();
    }
  }, [progress, isDecrypting]);

  const handleSuccess = () => {
    const key = `0x${Math.random().toString(16).substr(2, 16).toUpperCase()}`;
    setFoundKeys(prev => [key, ...prev].slice(0, 5));
    setIsDecrypting(false);
    if (addMissionLog) {
      addMissionLog(`CRYPTO_SUCCESS: Cipher broken. Key retrieved: ${key}`, 'BREACH');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() / 1000;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw Entanglement Lines
      if (isDecrypting) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
          const x1 = Math.sin(time + i) * 150 + centerX;
          const y1 = Math.cos(time * 0.8 + i) * 100 + centerY;
          const x2 = Math.cos(time + i * 2) * 200 + centerX;
          const y2 = Math.sin(time * 1.2 + i * 0.5) * 150 + centerY;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }

      // Draw core
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [isDecrypting]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      <div className="lg:col-span-8 space-y-6">
        <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 relative overflow-hidden min-h-[400px]">
          <div className="absolute top-6 left-6 flex items-center space-x-3 z-10">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Quantum_Compute_Core_V4</h3>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <canvas ref={canvasRef} width={600} height={400} className="w-full h-full opacity-60" />
            <div className="absolute flex flex-col items-center">
              <div className={`p-6 rounded-full border-4 shadow-2xl transition-all duration-1000 ${isDecrypting ? 'bg-cyan-500/10 border-cyan-500 scale-110' : 'bg-slate-900 border-slate-800'}`}>
                {isDecrypting ? <Unlock className="w-12 h-12 text-cyan-400 animate-pulse" /> : <Lock className="w-12 h-12 text-slate-600" />}
              </div>
              {isDecrypting && (
                <div className="mt-8 text-2xl font-black text-cyan-400 mono">
                  {progress.toFixed(1)}% <span className="text-xs text-cyan-700">STABILIZED</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 grid grid-cols-4 md:grid-cols-8 gap-4">
            {qubits.map((q, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className={`w-full h-8 rounded-lg border flex items-end justify-center overflow-hidden bg-slate-900/50 ${isDecrypting ? 'border-cyan-500/30' : 'border-slate-800'}`}>
                  <motion.div 
                    animate={{ height: `${q * 100}%` }}
                    className={`w-full ${isDecrypting ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  />
                </div>
                <span className="text-[7px] font-mono text-slate-600">Q-{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 col-span-2">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Cipher_Configuration</h4>
            <div className="flex items-center space-x-6">
              <div className="flex-grow">
                <label className="text-[8px] font-black text-slate-600 uppercase block mb-2">Target_Vector</label>
                <select 
                  value={currentCipher}
                  onChange={(e) => setCurrentCipher(e.target.value)}
                  disabled={isDecrypting}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-500/50"
                >
                  <option>AES-256_GCM_0x7F2A</option>
                  <option>RSA-4096_PKCS1_0x1B89</option>
                  <option>ED25519_SIGN_0xEE42</option>
                  <option>SSL_HANDSHAKE_0xC001</option>
                </select>
              </div>
              <button 
                onClick={startDecryption}
                disabled={isDecrypting}
                className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center space-x-3 ${isDecrypting ? 'bg-slate-900 text-slate-500' : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 active:scale-95'}`}
              >
                <Zap className="w-4 h-4" />
                <span>Initialize</span>
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Thermal_Status</h4>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-white">0.015 K</span>
                <span className="text-[8px] text-slate-600 uppercase">Sub-Zero Core</span>
              </div>
              <Activity className="w-8 h-8 text-emerald-500/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 flex-grow h-0 overflow-hidden flex flex-col">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Recovered_Keys</h3>
             <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {foundKeys.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-800 italic text-[10px] text-center px-4">
                    Decrypting active ciphers will yield hex-encoded raw keys here.
                  </div>
                ) : (
                  foundKeys.map(key => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50 group hover:border-cyan-500/30 transition-all"
                    >
                       <div className="flex items-center justify-between mb-2">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span className="text-[8px] text-slate-600 mono">SHA-256 VERIFIED</span>
                       </div>
                       <div className="text-[11px] font-black text-cyan-400 break-all mono tracking-tighter">
                          {key}
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <div className="flex items-center space-x-3 mb-4 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol_Dose</span>
             </div>
             <p className="text-[9px] text-slate-500 leading-normal">
                Quantum computing resources are pooled. Extensive use of the decryptor core may trigger automated audit logging on the backbone mesh. Use with strategic discretion.
             </p>
          </div>
      </div>
    </div>
  );
};
