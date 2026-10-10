import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Key, 
  Orbit, 
  Radio, 
  RotateCw, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Sliders, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Download, 
  Lock, 
  Zap, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { audioController } from '../services/audioService';

interface QuantumQubitMeasurement {
  id: number;
  time: string;
  aliceBasis: '+' | '×';
  bobBasis: '+' | '×';
  aliceBit: 0 | 1;
  bobBit: 0 | 1;
  isMatched: boolean;
  bellCorrelated: boolean;
  qberError: boolean;
}

interface SatelliteOption {
  id: string;
  name: string;
  orbitType: string;
  altitudeKm: number;
  quantumPayload: string;
  fsoLossDb: number;
}

const SATELLITE_NODES: SatelliteOption[] = [
  { id: 'micius', name: 'Micius (QUESS-1)', orbitType: 'LEO 500km', altitudeKm: 500, quantumPayload: 'Entangled Photon Source (810nm)', fsoLossDb: 18.4 },
  { id: 'skynet5c', name: 'Skynet 5C', orbitType: 'GEO 35,786km', altitudeKm: 35786, quantumPayload: 'Military Lasercom QKD Terminal', fsoLossDb: 42.1 },
  { id: 'eutelsat-q', name: 'Eutelsat Quantum', orbitType: 'GEO 35,786km', altitudeKm: 35786, quantumPayload: 'Reconfigurable Phased-Array QKD', fsoLossDb: 39.8 },
  { id: 'usa-326', name: 'USA-326 (Classified)', orbitType: 'SSO 512km', altitudeKm: 512, quantumPayload: 'Quantum Key Distribution Relay', fsoLossDb: 16.9 },
];

export const QuantumKeyVisualizer: React.FC = () => {
  // Key Generation State
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteOption>(SATELLITE_NODES[0]);
  const [protocol, setProtocol] = useState<'E91' | 'BBM92' | 'DECOY_BB84'>('E91');
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [isEveIntercepting, setIsEveIntercepting] = useState(false);
  const [autoRotateKey, setAutoRotateKey] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  
  // Simulation Metrics
  const [generatedKeyHex, setGeneratedKeyHex] = useState('');
  const [keyBitLength, setKeyBitLength] = useState(256);
  const [siftedBitCount, setSiftedBitCount] = useState(256);
  const [pairCount, setPairCount] = useState(14820);
  const [keyRateKbps, setKeyRateKbps] = useState(3.48);
  const [qber, setQber] = useState(1.24); // %
  const [bellParameterS, setBellParameterS] = useState(2.82); // S = 2*sqrt(2) ~ 2.828
  const [recentMeasurements, setRecentMeasurements] = useState<QuantumQubitMeasurement[]>([]);
  const [keyRotationCountdown, setKeyRotationCountdown] = useState(15);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // 3D Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rotationAngleRef = useRef({ yaw: 0, pitch: 0.35, roll: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Generate initial cryptographic hex key
  const generateNewKey = useCallback(() => {
    setIsGeneratingKey(true);
    try {
      audioController.playChirp();
    } catch (e) {}

    // Generate 32 bytes (256 bits) or 64 bytes (512 bits) of hex
    const byteCount = keyBitLength / 8;
    const array = new Uint8Array(byteCount);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    
    setGeneratedKeyHex(hex);
    setSiftedBitCount(0);
    setKeyRotationCountdown(15);

    // Fast animation filling sifted bits
    let currentBits = 0;
    const fillInterval = setInterval(() => {
      currentBits += Math.floor(Math.random() * 32) + 16;
      if (currentBits >= keyBitLength) {
        setSiftedBitCount(keyBitLength);
        setIsGeneratingKey(false);
        clearInterval(fillInterval);
      } else {
        setSiftedBitCount(currentBits);
      }
    }, 40);
  }, [keyBitLength]);

  // Initial key generation
  useEffect(() => {
    generateNewKey();
  }, [generateNewKey]);

  // Countdown timer for auto key rotation
  useEffect(() => {
    if (!autoRotateKey) return;
    const timer = setInterval(() => {
      setKeyRotationCountdown(prev => {
        if (prev <= 1) {
          generateNewKey();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRotateKey, generateNewKey]);

  // Real-time quantum simulation ticker
  useEffect(() => {
    const simInterval = setInterval(() => {
      setPairCount(prev => prev + Math.floor(Math.random() * 45) + 30);

      // Compute dynamic QBER & Bell parameter based on Eve interception
      if (isEveIntercepting) {
        // Intercept-resend attack induces 25% minimum error rate and collapses Bell parameter
        setQber(prev => +(24.5 + Math.random() * 3.5).toFixed(2));
        setBellParameterS(prev => +(1.38 + Math.random() * 0.15).toFixed(3)); // S < 2 (Classical local realism bound)
        setKeyRateKbps(0.00); // Transmission aborted
      } else {
        // Pristine quantum channel with slight atmospheric scintillation
        const baseQber = selectedSatellite.orbitType.includes('GEO') ? 1.85 : 1.15;
        setQber(+(baseQber + (Math.sin(Date.now() / 3000) * 0.25) + (Math.random() * 0.1)).toFixed(2));
        setBellParameterS(+(2.81 + (Math.sin(Date.now() / 4000) * 0.02) + (Math.random() * 0.01)).toFixed(3));
        setKeyRateKbps(+(3.2 + Math.random() * 0.6).toFixed(2));
      }

      // Generate real-time qubit measurement pair
      const bases: ('+' | '×')[] = ['+', '×'];
      const aliceBasis = bases[Math.floor(Math.random() * 2)];
      const bobBasis = bases[Math.floor(Math.random() * 2)];
      const aliceBit = (Math.random() > 0.5 ? 1 : 0) as 0 | 1;
      const isBasisMatch = aliceBasis === bobBasis;
      
      let bobBit = aliceBit;
      let qberErr = false;
      if (isEveIntercepting) {
        // Measurement collapse
        bobBit = (Math.random() > 0.5 ? 1 : 0) as 0 | 1;
        qberErr = isBasisMatch && bobBit !== aliceBit;
      } else if (isBasisMatch && Math.random() < 0.012) {
        // 1.2% channel error
        bobBit = (1 - aliceBit) as 0 | 1;
        qberErr = true;
      }

      const newMeasurement: QuantumQubitMeasurement = {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 } as any),
        aliceBasis,
        bobBasis,
        aliceBit,
        bobBit,
        isMatched: isBasisMatch,
        bellCorrelated: isBasisMatch && !qberErr,
        qberError: qberErr
      };

      setRecentMeasurements(prev => [newMeasurement, ...prev.slice(0, 11)]);
    }, 280);

    return () => clearInterval(simInterval);
  }, [isEveIntercepting, selectedSatellite]);

  // Canvas 3D Rendering of the Rotating Quantum Key
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 640);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    // 3D Point projection helper
    const project3D = (x: number, y: number, z: number, yaw: number, pitch: number, roll: number) => {
      // Rotation around Y (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotation around X (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Perspective projection
      const cameraDist = 480;
      const fov = 320;
      const scale = fov / (cameraDist + z2);
      const projX = width / 2 + x1 * scale;
      const projY = height / 2 + y2 * scale;

      return { x: projX, y: projY, z: z2, scale };
    };

    let animationTime = 0;

    const render = () => {
      animationTime += 0.016 * rotationSpeed;
      if (isRotating) {
        rotationAngleRef.current.yaw += 0.012 * rotationSpeed;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep space backdrop
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width / 1.5);
      bgGrad.addColorStop(0, 'rgba(8, 20, 42, 0.9)');
      bgGrad.addColorStop(0.5, 'rgba(4, 10, 24, 0.95)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 18, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid guidelines
      ctx.strokeStyle = 'rgba(30, 58, 110, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      const yaw = rotationAngleRef.current.yaw;
      const pitch = rotationAngleRef.current.pitch;
      const roll = rotationAngleRef.current.roll;

      // Draw Entanglement Ring 1 (Outer Hexadecimal Quantum Key Ring)
      const ringRadius = 145;
      const ringSegments = 32;
      const ringPoints = [];

      for (let i = 0; i < ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        const x = ringRadius * Math.cos(theta);
        const y = 0;
        const z = ringRadius * Math.sin(theta);
        ringPoints.push(project3D(x, y, z, yaw, pitch, roll));
      }

      // Draw Outer Ring Path
      ctx.beginPath();
      ringPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = isEveIntercepting ? 'rgba(239, 68, 68, 0.6)' : 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isEveIntercepting ? '#ef4444' : '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Rotating Key Hex Glyphs on Outer Ring
      const hexChars = generatedKeyHex || '9F4A7C12E3B8D650';
      ringPoints.forEach((p, idx) => {
        if (idx % 2 === 0) {
          const char = hexChars[idx % hexChars.length] || '0';
          const isPulse = (idx + Math.floor(animationTime * 4)) % ringSegments === 0;

          ctx.fillStyle = isEveIntercepting 
            ? (isPulse ? '#f87171' : 'rgba(239, 68, 68, 0.6)')
            : (isPulse ? '#ffffff' : 'rgba(34, 211, 238, 0.85)');
          ctx.font = `${Math.max(8, Math.floor(10 * p.scale))}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`0x${char}`, p.x, p.y);

          // Small radial tick
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.5, 2.5 * p.scale), 0, Math.PI * 2);
          ctx.fillStyle = isPulse ? '#38bdf8' : 'rgba(14, 165, 233, 0.5)';
          ctx.fill();
        }
      });

      // Draw Secondary Tilted Bloch Sphere Rings (Latitudinal & Longitudinal)
      const innerRadius = 90;
      const drawTiltedCircle = (radius: number, tiltAngle: number, color: string, lineWidth = 1) => {
        const pts = [];
        const numPts = 36;
        for (let i = 0; i <= numPts; i++) {
          const theta = (i / numPts) * Math.PI * 2;
          const rawX = radius * Math.cos(theta);
          const rawY = radius * Math.sin(theta) * Math.sin(tiltAngle);
          const rawZ = radius * Math.sin(theta) * Math.cos(tiltAngle);
          pts.push(project3D(rawX, rawY, rawZ, yaw, pitch, roll));
        }
        ctx.beginPath();
        pts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };

      // Concentric Bloch spheres representing Alice (|0>, |1>) and Bob superposition
      drawTiltedCircle(innerRadius, 0, 'rgba(147, 51, 234, 0.35)', 1.5);
      drawTiltedCircle(innerRadius, Math.PI / 3, 'rgba(59, 130, 246, 0.35)', 1.5);
      drawTiltedCircle(innerRadius, -Math.PI / 3, 'rgba(16, 185, 129, 0.35)', 1.5);

      // Entangled Bell Photon Core: Qubit Vector Alice (|ψA>) & Bob (|ψB>)
      const photonPhase = animationTime * 2.2;
      const aliceX = innerRadius * Math.cos(photonPhase);
      const aliceY = innerRadius * 0.4 * Math.sin(photonPhase);
      const aliceZ = innerRadius * Math.sin(photonPhase);

      // In entangled Bell state |Ψ+>, Bob's photon is correlated in opposite phase
      const bobX = -aliceX;
      const bobY = -aliceY;
      const bobZ = -aliceZ;

      const pAlice = project3D(aliceX, aliceY, aliceZ, yaw, pitch, roll);
      const pBob = project3D(bobX, bobY, bobZ, yaw, pitch, roll);
      const pCenter = project3D(0, 0, 0, yaw, pitch, roll);

      // Laser Entanglement Line connecting Alice and Bob through center source
      ctx.beginPath();
      ctx.moveTo(pAlice.x, pAlice.y);
      ctx.lineTo(pCenter.x, pCenter.y);
      ctx.lineTo(pBob.x, pBob.y);
      ctx.strokeStyle = isEveIntercepting ? 'rgba(239, 68, 68, 0.8)' : 'rgba(217, 70, 239, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isEveIntercepting ? '#ef4444' : '#d946ef';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Central Spontaneous Parametric Down-Conversion (SPDC) Crystal Emitter
      ctx.beginPath();
      ctx.arc(pCenter.x, pCenter.y, 8 * pCenter.scale, 0, Math.PI * 2);
      ctx.fillStyle = isEveIntercepting ? '#ef4444' : '#06b6d4';
      ctx.shadowColor = isEveIntercepting ? '#ef4444' : '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Central Pulse Ring
      const pulseRadius = (8 + (Math.sin(animationTime * 5) + 1) * 6) * pCenter.scale;
      ctx.beginPath();
      ctx.arc(pCenter.x, pCenter.y, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isEveIntercepting ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 211, 238, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Alice Photon Node (Ground Optical Receiver)
      ctx.beginPath();
      ctx.arc(pAlice.x, pAlice.y, 6 * pAlice.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#bae6fd';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('|γ_Alice⟩', pAlice.x + 12, pAlice.y - 6);

      // Bob Photon Node (Satellite Payload Receiver)
      ctx.beginPath();
      ctx.arc(pBob.x, pBob.y, 6 * pBob.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#e9d5ff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('|γ_Bob (Sat)⟩', pBob.x + 12, pBob.y - 6);

      // Eavesdropper (Eve) Interceptor Indicator if active
      if (isEveIntercepting) {
        const eveX = innerRadius * 0.5 * Math.cos(animationTime * 1.5);
        const eveY = innerRadius * 0.7;
        const eveZ = innerRadius * 0.5 * Math.sin(animationTime * 1.5);
        const pEve = project3D(eveX, eveY, eveZ, yaw, pitch, roll);

        ctx.beginPath();
        ctx.arc(pEve.x, pEve.y, 9 * pEve.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eve probe beam to channel
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(pEve.x, pEve.y);
        ctx.lineTo(pCenter.x, pCenter.y);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('⚡ EVE INTERCEPTION (DECOHERENCE)', pEve.x + 14, pEve.y + 4);
      }

      // Orbital Coordinates HUD overlay on canvas
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ENTANGLEMENT MATRIX: BELL_STATE |Φ+⟩`, 20, 25);
      ctx.fillText(`ROTATION_YAW: ${(yaw * 180 / Math.PI % 360).toFixed(1)}° // PITCH: ${(pitch * 180 / Math.PI).toFixed(1)}°`, 20, 40);
      ctx.fillText(`OPTICAL WAVELENGTH: 810 nm // BASIS: RECTILINEAR/DIAGONAL`, 20, 55);

      ctx.textAlign = 'right';
      ctx.fillStyle = isEveIntercepting ? '#ef4444' : '#10b981';
      ctx.fillText(isEveIntercepting ? 'BELL TEST VIOLATED: EAVESDROPPER DETECTED' : 'CHSH TEST PASSED: S = 2.82 > 2 (QUANTUM SECURE)', width - 20, 25);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(`SATELLITE DOWNLINK: ${selectedSatellite.name.toUpperCase()}`, width - 20, 40);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [rotationSpeed, isRotating, isEveIntercepting, generatedKeyHex, selectedSatellite]);

  // Mouse Drag interaction for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    rotationAngleRef.current.yaw += dx * 0.008;
    rotationAngleRef.current.pitch = Math.max(-1.2, Math.min(1.2, rotationAngleRef.current.pitch + dy * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const copyKeyToClipboard = () => {
    navigator.clipboard.writeText(generatedKeyHex);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadKeyFile = () => {
    const keyData = {
      format: "QUANTUM_KEY_DISTRIBUTION_TOKEN_v8",
      protocol: protocol,
      satellite_node: selectedSatellite,
      timestamp: new Date().toISOString(),
      key_length_bits: keyBitLength,
      key_hex: generatedKeyHex,
      bell_parameter_s: bellParameterS,
      qber_rate: `${qber}%`,
      verification_hash: `SHA3-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QKD_KEY_${selectedSatellite.id.toUpperCase()}_${Date.now()}.tacticalkey`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Formatted Key Stream Chunks
  const formattedKeyChunks = useMemo(() => {
    if (!generatedKeyHex) return [];
    const chunks = [];
    for (let i = 0; i < generatedKeyHex.length; i += 8) {
      chunks.push(generatedKeyHex.slice(i, i + 8));
    }
    return chunks;
  }, [generatedKeyHex]);

  return (
    <div className="space-y-6">
      {/* Top Protocol Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">QKD Link Status</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isEveIntercepting ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span className={`text-xs font-black uppercase tracking-wider ${isEveIntercepting ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isEveIntercepting ? 'DECOHERENCE_ALERT' : 'ENTANGLED_SECURE'}
              </span>
            </div>
          </div>
          <Orbit className={`w-7 h-7 ${isEveIntercepting ? 'text-rose-500' : 'text-cyan-400'} animate-spin-slow`} />
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quantum BER (QBER)</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${qber > 11 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              Limit &lt; 11%
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-xl font-black font-mono tracking-tight ${qber > 11 ? 'text-rose-400' : 'text-cyan-300'}`}>
              {qber}%
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase">
              {qber > 11 ? 'COMPROMISED' : 'NOMINAL'}
            </span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Bell CHSH Inequality</span>
            <span className="text-[9px] font-black text-cyan-400">Classical ≤ 2.0</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-xl font-black font-mono tracking-tight ${bellParameterS > 2 ? 'text-emerald-400' : 'text-rose-400'}`}>
              S = {bellParameterS}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase">
              {bellParameterS > 2 ? 'NON-LOCAL' : 'LOCAL (EVE)'}
            </span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Key Gen Rate</span>
            <span className="text-[9px] font-black text-slate-400">Next in {keyRotationCountdown}s</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-black font-mono text-white tracking-tight">
              {keyRateKbps} <span className="text-xs font-normal text-slate-400">kbps</span>
            </span>
            <span className="text-[9px] text-slate-500 font-bold">
              ({pairCount.toLocaleString()} pairs)
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Quantum Key Canvas Stage */}
      <div className="relative glass rounded-[32px] border-2 border-slate-800 bg-slate-950/70 overflow-hidden shadow-2xl">
        {/* Canvas Toolbar overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Rotating Quantum Key Core [3D]
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-black">
              {protocol} PROTOCOL
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center space-x-1.5 ${
                isRotating 
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isRotating ? "Pause 3D rotation" : "Resume 3D rotation"}
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-black uppercase tracking-wider">{isRotating ? 'Pause' : 'Rotate'}</span>
            </button>

            <button
              onClick={() => setIsEveIntercepting(!isEveIntercepting)}
              className={`px-3 py-2 rounded-xl border transition-all text-xs flex items-center space-x-1.5 font-black uppercase tracking-widest ${
                isEveIntercepting
                  ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
              }`}
            >
              {isEveIntercepting ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[9px]">{isEveIntercepting ? 'Eve Eavesdropping: ACTIVE' : 'Inject Eve Intercept'}</span>
            </button>

            <button
              onClick={generateNewKey}
              disabled={isGeneratingKey}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl border border-cyan-400/40 transition-all text-[9px] font-black uppercase tracking-widest flex items-center space-x-1.5 shadow-lg shadow-cyan-900/30 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKey ? 'animate-spin' : ''}`} />
              <span>Generate New Key</span>
            </button>
          </div>
        </div>

        {/* 3D Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[420px] block cursor-grab active:cursor-grabbing select-none"
        />

        {/* Canvas Bottom Legend / Instructions */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between text-[9px] text-slate-400 font-mono pointer-events-none">
          <div className="flex items-center space-x-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
              <span>Alice (Ground Station)</span>
            </span>
            <span className="flex items-center space-x-1 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
              <span>Bob (Satellite Downlink)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-500">
              <span>Drag to tilt/rotate 3D perspective</span>
            </span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            SPEED: {rotationSpeed.toFixed(1)}x // KEY_ROTATION: {autoRotateKey ? 'AUTO (15s)' : 'MANUAL'}
          </div>
        </div>
      </div>

      {/* Live Generated Key Stream & Actions */}
      <div className="glass p-6 rounded-[28px] border-2 border-slate-800 bg-slate-950/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Active Entangled Quantum Key ({keyBitLength}-Bit Raw Entropy)
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Deterministic Bell-basis parity matched // Sifted: {siftedBitCount}/{keyBitLength} bits
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyKeyToClipboard}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Key Copied!' : 'Copy Hex Key'}</span>
            </button>

            <button
              onClick={downloadKeyFile}
              className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Key Token</span>
            </button>
          </div>
        </div>

        {/* Hex Key Display Grid */}
        <div className="bg-[#030712] p-4 rounded-2xl border border-slate-800/80 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {formattedKeyChunks.map((chunk, i) => (
              <div 
                key={i} 
                className={`p-2 rounded-lg border text-center transition-all ${
                  isEveIntercepting
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                    : 'bg-slate-900/60 border-slate-800/60 text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20'
                }`}
              >
                <span className="text-[9px] text-slate-600 block mb-0.5">[{i * 4}]</span>
                <span className="font-bold tracking-wider">{chunk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar of Key Sifting */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
            <span>Sifting & Privacy Amplification Progress</span>
            <span className="text-cyan-400">{Math.round((siftedBitCount / keyBitLength) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                isEveIntercepting ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${(siftedBitCount / keyBitLength) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Protocol Configuration & Real-Time Qubit Measurement Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Link Controls & Downlink Satellite Selector */}
        <div className="lg:col-span-5 glass p-6 rounded-[28px] border-2 border-slate-800 bg-slate-950/60 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Quantum Terminal Parameters
            </h4>
          </div>

          {/* Satellite Selection */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Target Optical Satellite Link
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SATELLITE_NODES.map(satNode => (
                <button
                  key={satNode.id}
                  onClick={() => setSelectedSatellite(satNode)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedSatellite.id === satNode.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-white block">{satNode.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{satNode.quantumPayload}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 block">{satNode.orbitType}</span>
                    <span className="text-[8px] text-slate-500">Loss: {satNode.fsoLossDb} dB</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Protocol Switcher */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Entanglement Protocol
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['E91', 'BBM92', 'DECOY_BB84'] as const).map(prot => (
                <button
                  key={prot}
                  onClick={() => setProtocol(prot)}
                  className={`py-2 px-3 rounded-xl border text-center text-[9px] font-black uppercase tracking-wider transition-all ${
                    protocol === prot
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {prot}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation Speed & Auto-Key */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Auto-Rotate Key Period (15s)
              </span>
              <button
                onClick={() => setAutoRotateKey(!autoRotateKey)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${autoRotateKey ? 'bg-cyan-600' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoRotateKey ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                <span>3D Rotation Speed</span>
                <span>{rotationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.2"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Sifted Qubit Measurements Log */}
        <div className="lg:col-span-7 glass p-6 rounded-[28px] border-2 border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">
                Real-Time Qubit Measurement Stream
              </h4>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE OPTICAL CHANNEL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500">
                  <th className="py-2 px-2 uppercase tracking-wider">Timestamp</th>
                  <th className="py-2 px-2 uppercase tracking-wider">Alice Basis</th>
                  <th className="py-2 px-2 uppercase tracking-wider">Bob Basis</th>
                  <th className="py-2 px-2 uppercase tracking-wider">Bit Output</th>
                  <th className="py-2 px-2 uppercase tracking-wider">Basis Match</th>
                  <th className="py-2 px-2 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {recentMeasurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-2 px-2 text-slate-400">{m.time}</td>
                    <td className="py-2 px-2 font-bold text-cyan-400">{m.aliceBasis} ({m.aliceBit})</td>
                    <td className="py-2 px-2 font-bold text-purple-400">{m.bobBasis} ({m.bobBit})</td>
                    <td className="py-2 px-2 font-bold text-white">
                      {m.isMatched ? (m.qberError ? <span className="text-rose-400">ERROR</span> : `${m.aliceBit}`) : '—'}
                    </td>
                    <td className="py-2 px-2">
                      {m.isMatched ? (
                        <span className="text-emerald-400 font-bold">MATCH</span>
                      ) : (
                        <span className="text-slate-600">DISCARD</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {m.qberError ? (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[8px] font-black">
                          DECOHERENCE
                        </span>
                      ) : m.isMatched ? (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black">
                          SIFTED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded text-[8px]">
                          SIFT_DROP
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>E91 NON-LOCALITY THEOREM: CHSH |E(a,b) - E(a,b') + E(a',b) + E(a',b')| ≤ 2</span>
            <span className="text-cyan-400">S = {bellParameterS}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
