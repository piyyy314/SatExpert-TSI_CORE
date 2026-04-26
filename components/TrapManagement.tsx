
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePQCKeyPair, signCanaryToken, verifyCanaryToken, bytesToHex } from '../services/pqcService.ts';

interface Trap {
  id: string;
  metadata: string;
  signature: string;
  status: 'ACTIVE' | 'TRIPPED' | 'DISARMED';
  timestamp: Date;
}

export const TrapManagement: React.FC = () => {
  const [publicKey, setPublicKey] = useState<Uint8Array | null>(null);
  const [secretKey, setSecretKey] = useState<Uint8Array | null>(null);
  const [traps, setTraps] = useState<Trap[]>([]);
  const [newTrapInfo, setNewTrapInfo] = useState('trap_id: kinetic_001 | location: /usr/local/bin/deploy_tool');
  const [isGenerating, setIsGenerating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ id: string, success: boolean } | null>(null);

  useEffect(() => {
    // Load keys from local storage if they exist
    const savedPk = localStorage.getItem('satexpert_pqc_pk');
    const savedSk = localStorage.getItem('satexpert_pqc_sk');
    if (savedPk && savedSk) {
      // For demo purposes, we'll just regenerate or assume they are there
      // In a real app, we'd parse hex back to bytes
    }
  }, []);

  const handleKeygen = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const keys = generatePQCKeyPair();
      setPublicKey(keys.publicKey);
      setSecretKey(keys.secretKey);
      setIsGenerating(false);
    }, 1000);
  };

  const handleDeployTrap = () => {
    if (!secretKey) return;
    
    const signature = signCanaryToken(newTrapInfo, secretKey);
    const newTrap: Trap = {
      id: `TRAP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      metadata: newTrapInfo,
      signature: bytesToHex(signature),
      status: 'ACTIVE',
      timestamp: new Date()
    };
    
    setTraps(prev => [newTrap, ...prev]);
    setNewTrapInfo('');
  };

  const verifyTrap = (trap: Trap) => {
    if (!publicKey) return;
    
    const sigBytes = new Uint8Array(trap.signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const isValid = verifyCanaryToken(publicKey, trap.metadata, sigBytes);
    
    setVerificationResult({ id: trap.id, success: isValid });
    if (isValid) {
        console.log(`Trap verification succeeded for ${trap.id} at ${trap.timestamp instanceof Date ? trap.timestamp.toLocaleString() : trap.timestamp}`);
    }
    setTimeout(() => setVerificationResult(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">🪤</span> PQC <span className="text-emerald-500 ml-2">Trap Management</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">ML-DSA-65 Canary Token System // NIST Standardized</p>
        </div>
        <div className="flex items-center space-x-4">
           {!publicKey ? (
             <button 
               onClick={handleKeygen}
               disabled={isGenerating}
               className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
             >
               {isGenerating ? 'Generating_Entropy...' : 'Initialize_PQC_Keys'}
             </button>
           ) : (
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Keys_Active</span>
             </div>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Deploy Canary Token</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Trap_Metadata</label>
                  <textarea 
                    value={newTrapInfo}
                    onChange={e => setNewTrapInfo(e.target.value)}
                    placeholder="trap_id: ... | location: ..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-emerald-500 min-h-[100px] resize-none"
                  />
               </div>
               <button 
                 onClick={handleDeployTrap}
                 disabled={!secretKey || !newTrapInfo.trim()}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-slate-950 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
               >
                 Sign_&_Deploy_Lure
               </button>
            </div>
          </div>

          {publicKey && (
            <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Public Key (ML-DSA-65)</h3>
               <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[8px] text-emerald-500 mono break-all leading-relaxed">
                    {bytesToHex(publicKey).substring(0, 256)}...
                  </p>
               </div>
               <p className="text-[7px] text-slate-600 font-bold uppercase mt-3 text-center tracking-widest">Bit-Packed Representation [NIST FIPS 204]</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Lures & Traps</h3>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{traps.length} Total</span>
              </div>
              
              <div className="flex-grow space-y-4 overflow-y-auto max-h-[600px] scrollbar-hide">
                 <AnimatePresence mode="popLayout">
                    {traps.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                         <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Traps Detected</p>
                      </div>
                    ) : (
                      traps.map((trap) => (
                        <motion.div 
                          key={trap.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:bg-slate-900 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                   <span className="text-emerald-500 font-black text-[10px]">{trap.id.split('-')[1]}</span>
                                </div>
                                <div>
                                   <p className="text-xs font-black text-white uppercase tracking-wide">{trap.id}</p>
                                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{trap.timestamp instanceof Date ? trap.timestamp.toLocaleString() : trap.timestamp}</p>
                                </div>
                             </div>
                             <div className="flex items-center space-x-2">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                                  trap.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'
                                }`}>
                                  {trap.status}
                                </span>
                                <button 
                                  onClick={() => verifyTrap(trap)}
                                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-400 hover:text-emerald-400 transition-all"
                                  title="Verify PQC Signature"
                                >
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                             </div>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <p className="text-[10px] text-slate-300 mono leading-relaxed">{trap.metadata}</p>
                             </div>
                             <div className="relative">
                                <p className="text-[7px] text-slate-600 font-bold uppercase mb-1 tracking-widest">ML-DSA-65 Signature Trace</p>
                                <p className="text-[7px] text-slate-700 mono break-all line-clamp-2">
                                  {trap.signature}
                                </p>
                             </div>
                          </div>

                          <AnimatePresence>
                            {verificationResult?.id === trap.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mt-4 p-2 rounded-lg text-center border ${
                                  verificationResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}
                              >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                  {verificationResult.success ? '✓ SIGNATURE_VERIFIED_PQC_SECURE' : '✗ SIGNATURE_INVALID_TAMPER_DETECTED'}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
