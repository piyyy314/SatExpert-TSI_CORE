import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Radio, 
  Activity, 
  Lock, 
  Unlock, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Download, 
  Sliders, 
  ShieldCheck, 
  Play, 
  Pause, 
  Terminal, 
  Layers,
  Cpu,
  Waves,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { audioController } from '../services/audioService';
import { Satellite } from '../types';

interface QuantumSignalAnalysisProps {
  selectedSat?: Satellite;
  defcon?: number;
  isJamming?: boolean;
  isStealthMode?: boolean;
  addMissionLog?: (log: string, category?: string) => void;
}

interface WaveformPoint {
  index: number;
  frequency: number; // GHz
  amplitude: number; // Normalized -1 to 1
  entropy: number;   // 0 to 8 bits
  noise: number;
  quantumPerturbation: number;
}

interface InterceptedSignalPacket {
  id: string;
  timestamp: string;
  frequencyGhz: number;
  band: 'Ku-Band' | 'Ka-Band' | 'X-Band' | 'EHF' | 'UHF';
  modulation: 'QPSK' | '8PSK' | '16APSK' | 'BPSK-DSSS';
  entropyBits: number;
  rawCipherHex: string;
  decryptedPayload: string;
  decryptionStatus: 'DECRYPTED' | 'ANALYZING' | 'PENDING';
  confidence: number;
}

const SAMPLE_INTERCEPTS: InterceptedSignalPacket[] = [
  {
    id: 'PKT-9401-KU',
    timestamp: '18:59:12.408',
    frequencyGhz: 14.250,
    band: 'Ku-Band',
    modulation: '16APSK',
    entropyBits: 7.942,
    rawCipherHex: '7A F3 C1 90 2D 8B 4E 11 CC 39 AA 77 FE 05 91 62 D8 40',
    decryptedPayload: '{"subsystem":"TT&C_PAYLOAD","bus_voltage_v":28.4,"reaction_wheel_rpm":4250,"uplink_routing":"GATEWAY_FOXTROT_02","command":"EXECUTE_ATTITUDE_ALIGNMENT_PITCH_+0.42"}',
    decryptionStatus: 'DECRYPTED',
    confidence: 99.4
  },
  {
    id: 'PKT-9402-KA',
    timestamp: '18:59:13.912',
    frequencyGhz: 29.840,
    band: 'Ka-Band',
    modulation: '8PSK',
    entropyBits: 7.891,
    rawCipherHex: '4D 18 EF 02 9A 6C 33 B7 C0 54 8E 21 00 F9 DA 7C 12 A3',
    decryptedPayload: '{"target_asset":"MILSTAR-TRANSIT","downlink_beacon_snr_db":14.8,"transponder_power_w":120,"telemetry_status":"CARRIER_LOCK_ACTIVE","authorization":"ALPHA_CLEARANCE"}',
    decryptionStatus: 'DECRYPTED',
    confidence: 98.7
  },
  {
    id: 'PKT-9403-EHF',
    timestamp: '18:59:15.220',
    frequencyGhz: 44.510,
    band: 'EHF',
    modulation: 'BPSK-DSSS',
    entropyBits: 7.985,
    rawCipherHex: '9C 2F 77 A1 04 6B DD 38 12 F0 85 E4 37 99 21 BA CD 08',
    decryptedPayload: '{"priority":"FLASH_OPERATIONAL","tactical_comms":"STATION_BRAVO TO AIRBORNE_ASSET: SECURE CARRIER RE-ROUTING TO ENCLAVE 09. JAMMING RESILIENT."}',
    decryptionStatus: 'DECRYPTED',
    confidence: 99.1
  },
  {
    id: 'PKT-9404-X',
    timestamp: '18:59:16.840',
    frequencyGhz: 8.420,
    band: 'X-Band',
    modulation: 'QPSK',
    entropyBits: 7.915,
    rawCipherHex: '19 B8 4F 3E A2 70 C5 91 84 2E 67 0F D3 BC 52 1A F6 8D',
    decryptedPayload: '{"orbit_ephemeris":{"semi_major_axis_km":42164.2,"inclination_deg":0.04,"eccentricity":0.00018},"tracking_mode":"AUTONOMOUS_PROPULSION_STATION_KEEPING"}',
    decryptionStatus: 'DECRYPTED',
    confidence: 97.9
  }
];

export const QuantumSignalAnalysis: React.FC<QuantumSignalAnalysisProps> = ({
  selectedSat,
  defcon = 5,
  isJamming = false,
  isStealthMode = false,
  addMissionLog
}) => {
  // D3 Visualization Container Ref
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Live Analysis States
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [carrierFrequency, setCarrierFrequency] = useState<number>(14.250);
  const [selectedBand, setSelectedBand] = useState<'Ku-Band' | 'Ka-Band' | 'X-Band' | 'EHF'>('Ku-Band');
  const [noiseThreshold, setNoiseThreshold] = useState<number>(0.25);
  const [quantumFilterOrder, setQuantumFilterOrder] = useState<number>(8);
  const [overallEntropy, setOverallEntropy] = useState<number>(7.924);
  const [quantumCoherence, setQuantumCoherence] = useState<number>(98.6);

  // Live Packet Stream & Decryption State
  const [packets, setPackets] = useState<InterceptedSignalPacket[]>(SAMPLE_INTERCEPTS);
  const [selectedPacket, setSelectedPacket] = useState<InterceptedSignalPacket>(SAMPLE_INTERCEPTS[0]);
  const [isDecryptingLive, setIsDecryptingLive] = useState<boolean>(false);
  const [decryptionStep, setDecryptionStep] = useState<string>('ENCLAVE_READY');

  // Animation cycle counter
  const [animTime, setAnimTime] = useState<number>(0);

  // Update loop for real-time waveform data & entropy fluctuations
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setAnimTime(t => t + 0.1);
      
      // Dynamic entropy fluctuation
      setOverallEntropy(prev => {
        const delta = (Math.random() - 0.48) * 0.03;
        return Math.max(7.2, Math.min(7.998, Math.round((prev + delta) * 1000) / 1000));
      });

      // Quantum coherence fluctuations
      setQuantumCoherence(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Math.max(92, Math.min(99.9, Math.round((prev + delta) * 10) / 10));
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Generate real-time waveform data points for D3
  const waveformData = useMemo<WaveformPoint[]>(() => {
    const pointsCount = 120;
    const data: WaveformPoint[] = [];
    const baseFreq = carrierFrequency;
    const jammingFactor = isJamming ? 0.35 : 0.05;

    for (let i = 0; i < pointsCount; i++) {
      const x = i / pointsCount;
      // Multi-carrier superposition with quantum noise
      const carrier1 = Math.sin(x * Math.PI * 12 + animTime * 4);
      const carrier2 = 0.5 * Math.sin(x * Math.PI * 24 - animTime * 6);
      const quantumPerturbation = (Math.sin(x * Math.PI * 60 + animTime * 15) * 0.2) * (overallEntropy / 8);
      const noise = (Math.random() - 0.5) * jammingFactor * (1 - noiseThreshold * 0.5);

      const amplitude = Math.max(-1, Math.min(1, carrier1 + carrier2 + quantumPerturbation + noise));
      
      // Shannon & quantum Von Neumann entropy estimation per frequency bin
      const p = Math.abs(amplitude);
      const pointEntropy = p > 0.01 ? -p * Math.log2(p + 0.001) * 4 + 5.5 : 5.5;

      data.push({
        index: i,
        frequency: baseFreq + (i - pointsCount / 2) * 0.015,
        amplitude,
        entropy: Math.min(8.0, Math.max(4.0, pointEntropy + (Math.random() * 0.4 - 0.2))),
        noise,
        quantumPerturbation
      });
    }
    return data;
  }, [carrierFrequency, animTime, overallEntropy, isJamming, noiseThreshold]);

  // =========================================================================
  // D3.JS RENDERING ENGINE: Real-time Waveform Entropy Visualization
  // =========================================================================
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous elements
    svg.selectAll('*').remove();

    // Defs: Gradients and Glow Filters
    const defs = svg.append('defs');

    // Gradient for waveform area
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'quantumAreaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.5);

    areaGradient.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.2);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#020617')
      .attr('stop-opacity', 0.0);

    // Gradient for waveform line stroke
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'quantumLineGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4');
    lineGradient.append('stop').attr('offset', '50%').attr('stop-color', '#38bdf8');
    lineGradient.append('stop').attr('offset', '80%').attr('stop-color', '#a855f7');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e');

    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'quantumGlow')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main Chart Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3.scaleLinear()
      .domain([0, waveformData.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([-1.2, 1.2])
      .range([innerHeight, 0]);

    const entropyColorScale = d3.scaleSequential()
      .domain([5.0, 8.0])
      .interpolator(d3.interpolateTurbo);

    // Gridlines
    const yGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7);

    // Center Baseline (0 Amplitude)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#0ea5e9')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-opacity', 0.4);

    // Area Generator (Waveform fill)
    const areaGen = d3.area<WaveformPoint>()
      .x(d => xScale(d.index))
      .y0(innerHeight)
      .y1(d => yScale(d.amplitude))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(waveformData)
      .attr('fill', 'url(#quantumAreaGradient)')
      .attr('d', areaGen);

    // Line Generator (Waveform stroke)
    const lineGen = d3.line<WaveformPoint>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.amplitude))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(waveformData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#quantumLineGradient)')
      .attr('stroke-width', 2.2)
      .attr('filter', 'url(#quantumGlow)')
      .attr('d', lineGen);

    // Secondary Entropy Envelope (Upper boundary)
    const entropyLineGen = d3.line<WaveformPoint>()
      .x(d => xScale(d.index))
      .y(d => yScale(Math.sin(d.index * 0.1 + animTime) * 0.2 + (d.entropy / 8) * 0.9))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(waveformData)
      .attr('fill', 'none')
      .attr('stroke', '#ec4899')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.8)
      .attr('d', entropyLineGen);

    // High Entropy Spectral Centroid Peaks (Scatter markers)
    const peakPoints = waveformData.filter((d, i) => i % 8 === 0 && d.entropy > 7.4);

    g.selectAll('.entropy-peak')
      .data(peakPoints)
      .enter()
      .append('circle')
      .attr('class', 'entropy-peak')
      .attr('cx', (d: WaveformPoint) => xScale(d.index))
      .attr('cy', (d: WaveformPoint) => yScale(d.amplitude))
      .attr('r', (d: WaveformPoint) => (d.entropy - 7) * 4)
      .attr('fill', (d: WaveformPoint) => entropyColorScale(d.entropy))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.85);

    // X-Axis (Frequency)
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(i => {
        const p = waveformData[Number(i)];
        return p ? `${p.frequency.toFixed(3)} GHz` : '';
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    // Y-Axis (Amplitude)
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d} A`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    // Legend & HUD Overlays
    g.append('text')
      .attr('x', 10)
      .attr('y', 15)
      .attr('fill', '#38bdf8')
      .attr('font-size', '9.5px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`CARRIER: ${carrierFrequency.toFixed(3)} GHz // ENTROPY: ${overallEntropy.toFixed(3)} BITS/SAMPLE`);

    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', 15)
      .attr('text-anchor', 'end')
      .attr('fill', '#ec4899')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text(`-- QUANTUM VON NEUMANN BOUNDARY (99.2% COHERENCE)`);

  }, [waveformData, carrierFrequency, overallEntropy, animTime]);

  // Execute Quantum Decryption Sequence on Selected Packet
  const triggerDecryptionSequence = () => {
    setIsDecryptingLive(true);
    setDecryptionStep('INITIALIZING_QUANTUM_ORACLE');
    try {
      audioController.playPulse();
    } catch (e) {}

    const steps = [
      'ORACLE: Sampling quantum entropy distribution (H=7.942 bits)...',
      'LATTICE: Applying ML-KEM-768 polynomial ring reduction...',
      'ENTANGLEMENT: Neutralizing post-quantum side-channel phase variance...',
      'DESERIALIZING: Decoding 16APSK carrier frame at 14.250 GHz...',
      'SUCCESS: Plaintext payload extracted and verified (AES-GCM tag OK).'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setDecryptionStep(steps[current]);
        current++;
      } else {
        clearInterval(interval);
        setIsDecryptingLive(false);
        try {
          audioController.playChirp();
        } catch (e) {}
        if (addMissionLog) {
          addMissionLog(`QUANTUM DECRYPTOR: Successfully deciphered carrier payload from ${selectedPacket.id} (${selectedPacket.band})`, 'active');
        }
      }
    }, 450);
  };

  // Intercept Next Random Packet Simulation
  const handleCaptureNewCarrier = () => {
    try {
      audioController.playChirp();
    } catch (e) {}
    const newId = `PKT-${Math.floor(1000 + Math.random() * 9000)}-${selectedBand.split('-')[0]}`;
    const newFreq = Number((carrierFrequency + (Math.random() - 0.5) * 0.1).toFixed(3));
    const newPkt: InterceptedSignalPacket = {
      id: newId,
      timestamp: new Date().toLocaleTimeString(),
      frequencyGhz: newFreq,
      band: selectedBand,
      modulation: '16APSK',
      entropyBits: Number((7.85 + Math.random() * 0.14).toFixed(3)),
      rawCipherHex: Array.from({ length: 18 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' '),
      decryptedPayload: JSON.stringify({
        source_beacon: selectedSat?.name || 'ORBITAL_TRANSCEIVER',
        carrier_ghz: newFreq,
        azimuth_deg: Number((180 + Math.random() * 30).toFixed(1)),
        elevation_deg: Number((42 + Math.random() * 15).toFixed(1)),
        signal_quality: "QUANTUM_LOCK_NOMINAL",
        timestamp_utc: new Date().toISOString()
      }),
      decryptionStatus: 'DECRYPTED',
      confidence: Number((98.5 + Math.random() * 1.4).toFixed(1))
    };

    setPackets(prev => [newPkt, ...prev.slice(0, 5)]);
    setSelectedPacket(newPkt);
    setCarrierFrequency(newFreq);
  };

  // Export Decrypted Intelligence
  const handleExportIntel = () => {
    const report = {
      timestamp: new Date().toISOString(),
      quantumAnalysisEngine: 'TSI Quantum Signal Analysis v6 (D3 Powered)',
      carrierFrequencyGhz: carrierFrequency,
      overallEntropyBits: overallEntropy,
      quantumCoherencePct: quantumCoherence,
      selectedPacket
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QUANTUM_SIGNAL_INTEL_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 rounded-2xl border border-cyan-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                Quantum Signal Analysis <span className="text-cyan-400">// D3 Waveform Entropy</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                POST-QUANTUM D3 ENGINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Real-time RF waveform entropy mapping, quantum side-channel detection, and live telemetry deciphering
            </p>
          </div>
        </div>

        {/* Global Key Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
          <div className="px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <span className="block text-[7.5px] font-black text-slate-500 uppercase tracking-widest">SHANNON ENTROPY</span>
            <span className="text-xs sm:text-sm font-black font-mono text-cyan-400">
              {overallEntropy.toFixed(3)} <span className="text-[8px] text-slate-500">bits/byte</span>
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <span className="block text-[7.5px] font-black text-slate-500 uppercase tracking-widest">QUANTUM COHERENCE</span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
              {quantumCoherence.toFixed(1)}%
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <span className="block text-[7.5px] font-black text-slate-500 uppercase tracking-widest">CARRIER BAND</span>
            <span className="text-xs sm:text-sm font-black font-mono text-purple-400">
              {carrierFrequency.toFixed(3)} GHz
            </span>
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-xl border font-mono font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors ${
              isRunning ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Streaming' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: D3 Waveform Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: D3.JS Waveform Entropy Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Live D3 Waveform & Spectral Entropy Canvas
                </h4>
              </div>
              <div className="flex items-center space-x-2 text-[8px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Waveform Amplitude
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-pink-500 inline-block" /> Entropy Envelope
                </span>
              </div>
            </div>

            {/* D3 Canvas Container */}
            <div className="w-full bg-[#030712] rounded-xl border border-slate-900 p-2 overflow-hidden shadow-inner relative">
              <svg
                ref={svgRef}
                viewBox="0 0 800 300"
                className="w-full h-[260px] sm:h-[300px]"
                preserveAspectRatio="xMidYMid meet"
              />
            </div>

            {/* Interactive DSP Sliders Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[9px] font-mono text-slate-400">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Carrier Tuning:</span>
                  <span className="text-cyan-400 font-bold">{carrierFrequency.toFixed(3)} GHz</span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="45.0"
                  step="0.025"
                  value={carrierFrequency}
                  onChange={e => setCarrierFrequency(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Noise Suppression Threshold:</span>
                  <span className="text-purple-400 font-bold">{(noiseThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={noiseThreshold}
                  onChange={e => setNoiseThreshold(Number(e.target.value))}
                  className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Quantum Filter Polynomial:</span>
                  <span className="text-emerald-400 font-bold">N={quantumFilterOrder}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="2"
                  value={quantumFilterOrder}
                  onChange={e => setQuantumFilterOrder(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Frequency Bands Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Select Intercept Band:
            </span>
            <div className="flex space-x-1.5">
              {[
                { band: 'Ku-Band', freq: 14.250 },
                { band: 'Ka-Band', freq: 29.840 },
                { band: 'X-Band', freq: 8.420 },
                { band: 'EHF', freq: 44.510 },
              ].map(b => (
                <button
                  key={b.band}
                  onClick={() => {
                    setSelectedBand(b.band as any);
                    setCarrierFrequency(b.freq);
                    handleCaptureNewCarrier();
                  }}
                  className={`px-2.5 py-1 rounded text-[8.5px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                    selectedBand === b.band
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b.band} ({b.freq} GHz)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Intercepted Packets & Quantum Decryption Engine */}
        <div className="lg:col-span-4 space-y-4">
          {/* Packet Intercept Feed */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Captured Carrier Packets
                </h4>
              </div>
              <button
                onClick={handleCaptureNewCarrier}
                className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 cursor-pointer transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Intercept Next
              </button>
            </div>

            <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar">
              {packets.map(pkt => (
                <div
                  key={pkt.id}
                  onClick={() => setSelectedPacket(pkt)}
                  className={`p-2.5 rounded-xl border text-[9px] font-mono cursor-pointer transition-all ${
                    selectedPacket.id === pkt.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-white font-bold">
                    <span>{pkt.id}</span>
                    <span className="text-cyan-400">{pkt.frequencyGhz.toFixed(3)} GHz</span>
                  </div>
                  <div className="flex justify-between items-center text-[7.5px] text-slate-400 mt-1">
                    <span>{pkt.band} // {pkt.modulation}</span>
                    <span className="text-emerald-400 font-bold">{pkt.entropyBits} bits/byte</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Decryption Enclave Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 rounded-2xl border border-purple-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Quantum Decryption Enclave
                </h4>
              </div>
              <span className="text-[8px] px-2 py-0.5 rounded font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                ML-KEM-768
              </span>
            </div>

            {/* Ciphertext Hex Dump */}
            <div className="space-y-1">
              <span className="text-[7.5px] font-mono uppercase tracking-wider text-slate-500 block">
                Raw Carrier Ciphertext (Frame Buffer):
              </span>
              <div className="p-2 bg-black/60 rounded-lg border border-slate-800 font-mono text-[9px] text-rose-400 tracking-wider break-all">
                {selectedPacket.rawCipherHex}
              </div>
            </div>

            {/* Decryption Status Stepper */}
            {isDecryptingLive && (
              <div className="p-2.5 bg-purple-950/60 rounded-xl border border-purple-500/50 text-[9px] font-mono text-purple-200 animate-pulse">
                {decryptionStep}
              </div>
            )}

            {/* Decrypted Plaintext Result */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Decrypted Plaintext Payload:
                </span>
                <span className="text-[8px] font-mono text-slate-500">
                  Confidence: {selectedPacket.confidence}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30 font-mono text-[9.5px] text-emerald-300 max-h-[110px] overflow-y-auto custom-scrollbar leading-relaxed">
                {selectedPacket.decryptedPayload}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={triggerDecryptionSequence}
                disabled={isDecryptingLive}
                className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[9px] font-mono font-bold uppercase transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isDecryptingLive ? 'Deciphering...' : 'Trigger Decrypt'}</span>
              </button>
              <button
                onClick={handleExportIntel}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Intel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
