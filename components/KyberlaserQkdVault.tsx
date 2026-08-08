import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ShieldCheck, ShieldAlert, Zap, Radio, Sliders, RefreshCw, Key, Info, Ban, Send } from 'lucide-react';

interface KyberlaserQkdVaultProps {
  addMissionLog?: (detail: string, status?: any) => void;
}

export const KyberlaserQkdVault: React.FC<KyberlaserQkdVaultProps> = ({ addMissionLog }) => {
  const [laserPower, setLaserPower] = useState<number>(35); // milliwatts
  const [divergence, setDivergence] = useState<number>(8); // microradians
  const [isEavesdropping, setIsEavesdropping] = useState<boolean>(false);
  const [clockSyncOffset, setClockSyncOffset] = useState<number>(0.12); // nanoseconds
  
  // Alice & Bob BB84 state
  const [aliceBases, setAliceBases] = useState<('+' | 'x')[]>(['+', 'x', 'x', '+', '+', 'x', '+', 'x', '+', '+']);
  const [aliceBits, setAliceBits] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1, 0, 1, 0]);
  const [bobBases, setBobBases] = useState<('+' | 'x')[]>(['+', '+', 'x', 'x', '+', 'x', 'x', 'x', '+', '+']);
  const [bobMeasuredBits, setBobMeasuredBits] = useState<(0 | 1 | null)[]>([]);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [qber, setQber] = useState<number>(0); // Quantum Bit Error Rate
  const [siftedKey, setSiftedKey] = useState<string>('');
  const [linkStatus, setLinkStatus] = useState<'DISCONNECTED' | 'SYNCHRONIZING' | 'SECURE_QKD' | 'COMPROMISED_EVE'>('DISCONNECTED');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a random sequence of bases and bits for BB84 transmission
  const randomizePulses = () => {
    const basesList: ('+' | 'x')[] = [];
    const bitsList: (0 | 1)[] = [];
    const bobBasesList: ('+' | 'x')[] = [];
    
    for (let i = 0; i < 12; i++) {
      basesList.push(Math.random() > 0.5 ? '+' : 'x');
      bitsList.push(Math.random() > 0.5 ? 1 : 0);
      bobBasesList.push(Math.random() > 0.5 ? '+' : 'x');
    }
    
    setAliceBases(basesList);
    setAliceBits(bitsList);
    setBobBases(bobBasesList);
    setBobMeasuredBits([]);
    setQber(0);
    setSiftedKey('');
    setLinkStatus('DISCONNECTED');
  };

  const transmitQuantumSecret = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setLinkStatus('SYNCHRONIZING');
    setBobMeasuredBits([]);

    if (addMissionLog) {
      addMissionLog(`QKD_INIT: Initiating coherent optical laser alignment. Power: ${laserPower}mW, Divergence: ${divergence}μrad. Syncing rubidium clocks...`, 'active');
    }

    setTimeout(() => {
      // Bob measures bases
      const measured: (0 | 1 | null)[] = [];
      let errors = 0;
      let matchedCount = 0;

      aliceBits.forEach((bit, idx) => {
        const aliceBase = aliceBases[idx];
        const bobBase = bobBases[idx];

        if (isEavesdropping) {
          // Eve eavesdrops: measures with a random base
          const eveBase = Math.random() > 0.5 ? '+' : 'x';
          const eveMeasured = (eveBase === aliceBase) ? bit : (Math.random() > 0.5 ? 1 : 0);
          
          // Then Bob receives a modified state
          if (bobBase === eveBase) {
            measured.push(eveMeasured);
            if (eveMeasured !== bit) errors++;
          } else {
            const randomVal = Math.random() > 0.5 ? 1 : 0;
            measured.push(randomVal);
            if (randomVal !== bit) errors++;
          }
        } else {
          // Normal case: no Eve
          if (aliceBase === bobBase) {
            measured.push(bit);
          } else {
            // Bob chooses the wrong base and gets a random collapse
            measured.push(Math.random() > 0.5 ? 1 : 0);
          }
        }
      });

      setBobMeasuredBits(measured);

      // Sift keys: filter items where Alice base matches Bob base
      let keyBits = '';
      let correctMatchList = 0;
      let erroneousMatchList = 0;

      aliceBases.forEach((aliceBase, idx) => {
        const bobBase = bobBases[idx];
        if (aliceBase === bobBase) {
          matchedCount++;
          const bitVal = measured[idx];
          if (bitVal !== null) {
            keyBits += bitVal;
            if (bitVal !== aliceBits[idx]) {
              erroneousMatchList++;
            } else {
              correctMatchList++;
            }
          }
        }
      });

      // Calculate QBER on matching bases
      const computedQber = matchedCount > 0 ? (erroneousMatchList / matchedCount) * 100 : 0;
      setQber(parseFloat(computedQber.toFixed(1)));

      // Generate a sifted cryptographic hash/key (Kyber-1024 safe seed)
      if (keyBits.length > 0 && computedQber < 11) {
        setSiftedKey('K1024_' + Math.random().toString(16).substring(2, 10).toUpperCase());
        setLinkStatus('SECURE_QKD');
        if (addMissionLog) {
          addMissionLog(`QKD_SUCCESS: Cryogenic laser terminal secure key established. Sifted key generated. QBER: ${computedQber.toFixed(1)}% < 11%`, 'active');
        }
      } else {
        setLinkStatus(computedQber >= 11 ? 'COMPROMISED_EVE' : 'DISCONNECTED');
        if (addMissionLog) {
          addMissionLog(`QKD_CRITICAL: High error rates. Quantum channel compromised or heavily degraded. QBER: ${computedQber.toFixed(1)}% >= 11%`, 'CRITICAL');
        }
      }

      setIsTransmitting(false);
    }, 2000);
  };

  // Canvas Link Tunnel Wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let waveOffset = 0;

    const draw = () => {
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }

      // Draw Space Station Emitter & Receiver Earth Station hubs
      ctx.fillStyle = '#0e172a';
      ctx.fillRect(10, centerY - 30, 45, 60);
      ctx.fillRect(width - 55, centerY - 30, 45, 60);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, centerY - 30, 45, 60);
      ctx.strokeRect(width - 55, centerY - 30, 45, 60);

      // Labels on elements
      ctx.fillStyle = '#22d3ee';
      ctx.font = '6.5px monospace font-mono';
      ctx.fillText('ALICE_SAT', 14, centerY - 35);
      ctx.fillText('BOB_GROUND', width - 54, centerY - 35);

      // Active Photon pulses flying inside the Laser Tunnel
      if (isTransmitting) {
        waveOffset += 3.5;
        
        // Coherent Laser Tunnel beam
        const laserGrad = ctx.createLinearGradient(55, centerY, width - 55, centerY);
        laserGrad.addColorStop(0, 'rgba(34, 211, 238, 0.03)');
        laserGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.18)');
        laserGrad.addColorStop(1, 'rgba(34, 211, 238, 0.03)');
        
        ctx.fillStyle = laserGrad;
        ctx.fillRect(55, centerY - (divergence / 2), width - 110, divergence);

        // Sinusoidal light polarization phase curves
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 55; x < width - 55; x++) {
          const y = centerY + Math.sin((x + waveOffset) * 0.08) * (divergence * 0.4);
          if (x === 55) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Photons spinning inside the laser tunnel
        ctx.fillStyle = '#67e8f9';
        for (let i = 0; i < 6; i++) {
          const pX = 55 + ((waveOffset + i * 80) % (width - 110));
          const pY = centerY + Math.sin((pX + waveOffset) * 0.05) * (divergence * 0.25);
          ctx.beginPath();
          ctx.arc(pX, pY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // polarization angle wire overlays
          ctx.strokeStyle = '#22d3ee';
          ctx.beginPath();
          ctx.moveTo(pX - 4, pY - 4);
          ctx.lineTo(pX + 4, pY + 4);
          ctx.stroke();
        }

        // Eve interception indicator (Middle)
        if (isEavesdropping) {
          const eveX = width / 2;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.beginPath();
          ctx.arc(eveX, centerY, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 7px monospace font-mono';
          ctx.fillText('EVE_INTERCEPT_ZONE', eveX - 35, centerY - 42);

          // Eavesdropping extraction signal splits
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.moveTo(eveX, centerY);
          ctx.lineTo(eveX - 15, centerY - 60);
          ctx.stroke();
        }
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [isTransmitting, divergence, isEavesdropping]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Configuration Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.255em]">QKD_Laser_Aligner</h3>
          </div>

          <div className="space-y-4">
            {/* Laser Power Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span>Transceiver Laser Power</span>
                <span className="text-cyan-400 font-mono font-bold">{laserPower} mW</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={laserPower}
                onChange={(e) => setLaserPower(Number(e.target.value))}
                disabled={isTransmitting}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Beam Divergence slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span>Aperture Beam Divergence</span>
                <span className="text-cyan-400 font-mono font-bold">{divergence} μrad</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={divergence}
                onChange={(e) => setDivergence(Number(e.target.value))}
                disabled={isTransmitting}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Clock sync offset */}
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span>Atomic Clock Sync Precision</span>
                <span className="text-cyan-400 font-mono font-bold">{clockSyncOffset} ns</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="1.50"
                step="0.05"
                value={clockSyncOffset}
                onChange={(e) => setClockSyncOffset(Number(e.target.value))}
                disabled={isTransmitting}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Eavesdropper presence switcher */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Eve Interception Zone</span>
                <p className="text-[8px] text-slate-500 font-mono">Simulate quantum wiretap attacks</p>
              </div>
              <button
                onClick={() => setIsEavesdropping(!isEavesdropping)}
                disabled={isTransmitting}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors ${isEavesdropping ? 'bg-red-500' : 'bg-slate-800'}`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform duration-300 ${isEavesdropping ? 'translate-x-5.5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls panel */}
        <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={randomizePulses}
              disabled={isTransmitting}
              className="py-3 px-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Randomize Bitstream</span>
            </button>
            <button
              onClick={transmitQuantumSecret}
              disabled={isTransmitting}
              className={`py-3 px-2 text-[9px] font-black uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center justify-center space-x-1.5 ${
                isTransmitting
                  ? 'bg-cyan-950 text-cyan-500 border border-cyan-900'
                  : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 border-2 border-cyan-400 active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Initialize QKD Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* BB84 Protocol Sifting Interactive Monitor (Center-Right) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="glass rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 flex flex-col relative h-[360px]">
          {/* Tunnel Canvas */}
          <div className="flex-grow w-full relative bg-[#060a12] rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
            <canvas ref={canvasRef} width={580} height={200} className="w-full h-full block" />

            {/* Top-Right QBER & Link state indicators */}
            <div className="absolute top-4 right-4 flex items-center space-x-3 bg-slate-950/80 backdrop-blur border border-slate-800/80 rounded-xl py-1.5 px-3 pointer-events-none">
              <div className="flex flex-col items-end">
                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-mono">Quantum Error (QBER)</span>
                <span className={`text-[12px] font-black font-mono ${qber > 11 ? 'text-red-500' : 'text-cyan-400'}`}>
                  {qber}%
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div>
                {linkStatus === 'SECURE_QKD' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : linkStatus === 'COMPROMISED_EVE' ? (
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
                ) : (
                  <Radio className={`w-5 h-5 ${isTransmitting ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quantized Bit state and base-sifting chart */}
        <div className="glass p-5 rounded-3xl border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BB84 Base Alignment Verification</span>
            </div>
            
            {siftedKey && (
              <span className="text-[9px] font-mono select-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                Kyber Seed: {siftedKey}
              </span>
            )}
          </div>

          {/* Sifting Matrix */}
          <div className="overflow-x-auto custom-scrollbar-horizontal py-2">
            <div className="flex gap-2 min-w-[500px]">
              {aliceBits.map((bit, idx) => {
                const basisAlice = aliceBases[idx];
                const basisBob = bobBases[idx];
                const basisMatch = basisAlice === basisBob;
                const measured = bobMeasuredBits[idx];

                return (
                  <div key={idx} className={`flex-1 flex flex-col items-center p-2 rounded-lg border text-center font-mono text-[9px] ${
                    basisMatch && bobMeasuredBits.length > 0
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-950/20 border-slate-900 text-slate-500'
                  }`}>
                    <span className="text-[7.5px] text-slate-700">INDEX {idx + 1}</span>
                    
                    {/* Alice emission parameters */}
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-cyan-400 font-bold">{bit}</span>
                      <span className="text-slate-500">[{basisAlice}]</span>
                    </div>

                    <div className="w-full h-px bg-slate-800/80 my-1.5" />

                    {/* Bob measurement parameters */}
                    <div className="flex flex-col items-center">
                      <span className="text-slate-500">[{basisBob}]</span>
                      <span className={`font-bold ${
                        basisMatch && bobMeasuredBits.length > 0 
                          ? (measured === bit ? 'text-emerald-400' : 'text-red-400')
                          : 'text-slate-600'
                      }`}>
                        {measured !== undefined ? measured : '-'}
                      </span>
                    </div>

                    <div className="w-full h-px bg-slate-800/80 my-1.5" />

                    {/* Sifting Result */}
                    <div className="flex items-center justify-center">
                      {bobMeasuredBits.length > 0 ? (
                        basisMatch ? (
                          <span className="text-[7.5px] text-emerald-400 font-bold">MATCH</span>
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-slate-800" />
                        )
                      ) : (
                        <span className="text-slate-800 text-[6.5px]">WAIT</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default KyberlaserQkdVault;
