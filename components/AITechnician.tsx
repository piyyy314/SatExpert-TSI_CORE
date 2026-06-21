
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { getTroubleshootingAdvice, transcribeAudio } from '../services/geminiService';
import { TroubleshootingLog } from '../types';

interface TelemetryData {
  snr: string;
  rxPower: string;
  bucTemp: string;
  packetLoss: string;
  status: string;
}

interface Props {
  context: any;
  telemetry: TelemetryData;
  isStealthMode: boolean;
  isNeuralCleaning: boolean;
  onToggleNeuralCleaning: () => void;
  isDecoyActive: boolean;
  isZPEActive: boolean;
}

interface Overrides {
  snr: string | null;
  rxPower: string | null;
  bucTemp: string | null;
  packetLoss: string | null;
}

export const AITechnician: React.FC<Props> = ({ context, telemetry, isStealthMode, isNeuralCleaning, onToggleNeuralCleaning, isDecoyActive, isZPEActive }) => {
  const [messages, setMessages] = useState<(TroubleshootingLog & { grounding?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{data: string, mimeType: string, url: string}[]>([]);
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrides, setOverrides] = useState<Overrides>({
    snr: null,
    rxPower: null,
    bucTemp: null,
    packetLoss: null
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Int16Array[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = { 
        role: 'assistant' as const, 
        content: `[SYSTEM_READY] STIA-Agent Active.\n${isStealthMode ? 'PROTOCOL: STEALTH_MODE_ACTIVE\n' : ''}INTELLIGENCE_POSTURE: ${isThinking ? 'MAX_THINK' : 'FAST_RESPONSE'}\nDEFCON: ${context.defcon || 5}\n\nAwaiting tactical directives. Grounding: ${useSearch ? 'LIVE_SEARCH_ACTIVE' : 'LOCAL_CACHE_ONLY'}.`, 
        timestamp: new Date() 
      };
      setMessages([initialGreeting]);
    }
  }, []); // Only on mount

  // Watch for state changes and add a system notice instead of resetting
  const lastState = useRef({ isStealthMode, isThinking, useSearch, isDecoyActive, isZPEActive });
  useEffect(() => {
    if (messages.length > 0) {
      let changes = [];
      if (lastState.current.isStealthMode !== isStealthMode) changes.push(`STEALTH_PROTOCOL=${isStealthMode ? 'ACTIVE' : 'INACTIVE'}`);
      if (lastState.current.isThinking !== isThinking) changes.push(`INTEL_POSTURE=${isThinking ? 'MAX_THINK' : 'FAST_RESPONSE'}`);
      if (lastState.current.useSearch !== useSearch) changes.push(`GROUNDING=${useSearch ? 'LIVE_SEARCH' : 'LOCAL_CACHE'}`);
      
      if (lastState.current.isDecoyActive !== isDecoyActive) {
        changes.push(`GHOST_UPLINK=${isDecoyActive ? 'DEPLOYED' : 'OFFLINE'}`);
        if (isDecoyActive) addSystemNotice(`[!] DEPLOYING SUB-SPACE DECOYS. GHOST_CLUSTER: ACTIVE.`);
      }
      
      if (lastState.current.isZPEActive !== isZPEActive) {
        changes.push(`ZPE_COOLING=${isZPEActive ? 'ENGAGED' : 'STANDBY'}`);
        if (isZPEActive) addSystemNotice(`STIA_ZPE_INIT: Requesting Vacuum Grid Access... [OK]\nTHERMAL_DELTA: -42C (Vacuum Grounding Active)`);
      }
      
      if (changes.length > 0) {
        addSystemNotice(`[STATE_CHANGE] ${changes.join(' | ')}`);
        lastState.current = { isStealthMode, isThinking, useSearch, isDecoyActive, isZPEActive };
      }
    }
  }, [isStealthMode, isThinking, useSearch, isDecoyActive, isZPEActive]);

  const addSystemNotice = (msg: string) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: msg,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleDownloadLog = () => {
    const header = `--- STIA SESSION LOG | ${new Date().toLocaleString()} ---\n` +
      `ASSET: ${context.satName || 'Unknown'}\n` +
      `ENVIRONMENT: ${JSON.stringify({ ...context, telemetry }, null, 2)}\n` +
      `--------------------------------------------------\n\n`;
    
    const body = messages.map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    
    const blob = new Blob([header + body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `STIA_SESSION_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onload = (rev) => {
        const base64 = (rev.target?.result as string).split(',')[1];
        setAttachedFiles(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      audioChunksRef.current = [];
      scriptProcessorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }
        audioChunksRef.current.push(pcm16);
      };

      source.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("MIC_ERROR", err);
    }
  };

  const stopRecording = async () => {
    if (!scriptProcessorRef.current) return;
    scriptProcessorRef.current.disconnect();
    setIsRecording(false);

    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Int16Array(totalLength);
    let offset = 0;
    audioChunksRef.current.forEach(chunk => {
      result.set(chunk, offset);
      offset += chunk.length;
    });

    // Safer conversion to base64 using a chunked approach
    const uint8 = new Uint8Array(result.buffer);
    let binary = '';
    const CHUNK_SIZE = 0x8000;
    for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
      binary += String.fromCharCode.apply(null, uint8.subarray(i, i + CHUNK_SIZE) as any);
    }
    const base64 = btoa(binary);
    
    setIsLoading(true);
    const transcription = await transcribeAudio(base64);
    setInput(prev => (prev ? prev + " " : "") + transcription);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    const userMessage: TroubleshootingLog = { 
      role: 'user', 
      content: input, 
      timestamp: new Date(),
      imageUrl: attachedFiles[0]?.url 
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = attachedFiles;
    
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    const activeTelemetry = {
      ...telemetry,
      snr: overrides.snr ?? telemetry.snr,
      rxPower: overrides.rxPower ?? telemetry.rxPower,
      bucTemp: overrides.bucTemp ?? telemetry.bucTemp,
      packetLoss: overrides.packetLoss ?? telemetry.packetLoss,
      isManualOverride: Object.values(overrides).some(v => v !== null)
    };

    const result = await getTroubleshootingAdvice(currentInput, { ...context, isStealthMode }, activeTelemetry, {
      thinking: isThinking,
      useSearch: useSearch,
      useMaps: false,
      mediaData: currentFiles.map(f => ({ data: f.data, mimeType: f.mimeType }))
    });

    if (result.error === "KEY_AUTH_FAILURE") {
       (window as any).aistudio?.openSelectKey();
    }

    const assistantMessage = { 
      role: 'assistant' as const, 
      content: result.text || 'COMM_FAILURE: Satellite link timed out.', 
      timestamp: new Date(),
      isCode: result.text?.includes('```'),
      grounding: result.grounding
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const updateOverride = (key: keyof Overrides, value: string) => {
    setOverrides(prev => ({
      ...prev,
      [key]: value === '' ? null : value
    }));
  };

  const isOverrideActive = Object.values(overrides).some(v => v !== null);

  return (
    <div className="glass rounded-[3rem] border-2 border-slate-800 flex flex-col h-full overflow-hidden bg-slate-950/40 relative shadow-[0_32px_80px_rgba(0,0,0,0.8)] group/tech">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover/tech:opacity-10 transition-opacity">
         <div className="w-32 h-32 border-t-4 border-r-4 border-red-600 rounded-tr-[3.5rem]" />
      </div>

      <div className="p-8 border-b-2 border-slate-900 bg-black/40 z-20 flex flex-col space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex items-center space-x-5">
             <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border-2 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.1)]">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
             <div>
                <h3 className="text-[14px] font-black text-white uppercase tracking-[0.4em] italic leading-tight">STIA_Sentinel_v8.0</h3>
                <div className="flex items-center space-x-3 mt-1.5">
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Multi-Modal_Processor</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  {isOverrideActive && <span className="text-[9px] px-2 py-0.5 bg-red-600 border border-white text-white rounded font-black animate-pulse italic tracking-widest">OVERRIDE</span>}
                </div>
             </div>
          </div>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
             <button 
                onClick={onToggleNeuralCleaning}
                className={`flex items-center space-x-3 px-5 py-2.5 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap shadow-xl ${isNeuralCleaning ? 'bg-red-600 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>{isNeuralCleaning ? 'NEURAL_PURGE_ENGAGED' : 'DEEP_CLEAN'}</span>
             </button>
             <button 
                onClick={handleDownloadLog}
                className="group flex items-center space-x-3 px-5 py-2.5 rounded-2xl border-2 border-slate-800 bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest italic hover:bg-white hover:text-red-600 hover:border-white transition-all shadow-xl active:scale-95"
              >
                <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden md:inline">Transfer_Logs</span>
             </button>
             <button 
                onClick={() => setShowOverrides(!showOverrides)} 
                className={`p-3 rounded-2xl border-2 transition-all shadow-xl active:scale-95 ${showOverrides ? 'bg-red-600 border-white text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
              >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </button>
             <div className="h-8 w-px bg-slate-900 mx-2 hidden xl:block" />
             <div className="flex bg-black p-1 rounded-2xl border-2 border-slate-900 shadow-inner">
                <button onClick={() => setIsThinking(!isThinking)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap italic tracking-widest ${isThinking ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-slate-700 hover:text-slate-400'}`}>Deep_Think</button>
                <button onClick={() => setUseSearch(!useSearch)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap italic tracking-widest ${useSearch ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-slate-700 hover:text-slate-400'}`}>Grounding</button>
             </div>
          </div>
        </div>
        
        {showOverrides && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-black border-2 border-red-600/30 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none italic font-black text-red-500 text-2xl uppercase">Override_Console</div>
            <div className="space-y-2 relative z-10">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Injected_SNR</label>
              <input 
                type="text" 
                placeholder={telemetry.snr}
                value={overrides.snr ?? ''}
                onChange={e => updateOverride('snr', e.target.value)}
                className="w-full bg-[#050810] border-2 border-slate-900 rounded-xl p-3 text-[11px] text-red-500 italic font-black tracking-tighter mono outline-none focus:border-red-500/50 shadow-inner"
              />
            </div>
            <div className="space-y-2 relative z-10">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Injected_Power</label>
              <input 
                type="text" 
                placeholder={telemetry.rxPower}
                value={overrides.rxPower ?? ''}
                onChange={e => updateOverride('rxPower', e.target.value)}
                className="w-full bg-[#050810] border-2 border-slate-900 rounded-xl p-3 text-[11px] text-red-500 italic font-black tracking-tighter mono outline-none focus:border-red-500/50 shadow-inner"
              />
            </div>
            <div className="space-y-2 relative z-10">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Injected_Temp</label>
              <input 
                type="text" 
                placeholder={telemetry.bucTemp}
                value={overrides.bucTemp ?? ''}
                onChange={e => updateOverride('bucTemp', e.target.value)}
                className="w-full bg-[#050810] border-2 border-slate-900 rounded-xl p-3 text-[11px] text-red-500 italic font-black tracking-tighter mono outline-none focus:border-red-500/50 shadow-inner"
              />
            </div>
            <div className="space-y-2 relative z-10">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Injected_Loss</label>
              <input 
                type="text" 
                placeholder={telemetry.packetLoss}
                value={overrides.packetLoss ?? ''}
                onChange={e => updateOverride('packetLoss', e.target.value)}
                className="w-full bg-[#050810] border-2 border-slate-900 rounded-xl p-3 text-[11px] text-red-500 italic font-black tracking-tighter mono outline-none focus:border-red-500/50 shadow-inner"
              />
            </div>
            <div className="col-span-full flex justify-end">
              <button 
                onClick={() => setOverrides({ snr: null, rxPower: null, bucTemp: null, packetLoss: null })}
                className="text-[10px] font-black text-slate-700 hover:text-red-500 uppercase tracking-[0.3em] italic underline underline-offset-8 decoration-slate-900 decoration-4 transition-colors"
              >
                Clear_Telemetry_Overrides
              </button>
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide bg-[#050810]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-7 rounded-[2.5rem] border-2 relative group overflow-hidden ${m.role === 'user' ? 'bg-red-950/20 border-red-500/30 rounded-br-none shadow-[0_15px_30px_rgba(239,68,68,0.05)]' : 'bg-slate-950/80 border-slate-900 rounded-bl-none shadow-[0_15px_30px_rgba(0,0,0,0.5)]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600/20 to-transparent" />
              {m.imageUrl && <img src={m.imageUrl} className="max-w-md rounded-2xl mb-5 border-2 border-slate-900 shadow-2xl active:scale-[1.02] transition-transform" />}
              <div className="text-[15px] text-slate-300 font-black italic tracking-tighter leading-relaxed whitespace-pre-wrap mono uppercase">{m.content}</div>
              
              {m.grounding && m.grounding.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-slate-900 space-y-3">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 italic">Intel_Grounding_Streams:</p>
                  {m.grounding.map((chunk, idx) => (
                    <div key={idx} className="flex flex-col space-y-2">
                      {chunk.web && (
                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] text-red-400 font-black hover:text-white uppercase tracking-widest italic flex items-center bg-black/40 p-3 rounded-xl border border-slate-900 hover:border-red-500/50 transition-all shadow-xl">
                          <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {chunk.web.title}
                        </a>
                      )}
                      {chunk.maps && (
                        <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] text-amber-500 font-black hover:text-white uppercase tracking-widest italic flex items-center bg-black/40 p-3 rounded-xl border border-slate-900 hover:border-amber-500/50 transition-all shadow-xl">
                          <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {chunk.maps.title || "Target Localization"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[9px] text-slate-700 font-black mt-6 uppercase tracking-[0.3em] flex justify-between italic border-t border-slate-900 pt-3">
                 <span className={m.role === 'user' ? 'text-red-900' : 'text-slate-800'}>{m.role === 'user' ? 'UPLINK_TERMINAL' : 'SENTINEL_AI_RECON'}</span>
                 <span>{m.timestamp.toLocaleTimeString([], { hour12: false })}_Z</span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-black p-6 rounded-[2rem] rounded-bl-none border-2 border-red-600/30 text-[11px] text-red-500 font-black uppercase tracking-[0.4em] italic animate-pulse shadow-2xl">Decrypting_Target_Intel_Matrix...</div></div>}
      </div>

      <div className="p-8 bg-black/60 border-t-2 border-slate-900 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
        {attachedFiles.length > 0 && (
          <div className="flex space-x-3 mb-6 animate-in slide-in-from-bottom-2 duration-300">
            {attachedFiles.map((f, i) => (
              <div key={i} className="relative group">
                <img src={f.url} className="w-16 h-16 rounded-2xl border-2 border-red-500/40 object-cover shadow-2xl" />
                <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg active:scale-90 transition-transform">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex space-x-4 items-center">
          <button onClick={() => fileInputRef.current?.click()} className="group p-4 bg-slate-950 hover:bg-white text-slate-700 hover:text-red-600 rounded-2xl border-2 border-slate-900 hover:border-white transition-all shadow-xl active:scale-90">
            <svg className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} accept="image/*,video/*" />
          
          <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`group p-4 rounded-2xl border-2 transition-all shadow-xl active:scale-90 ${isRecording ? 'bg-red-600 text-white border-white animate-pulse' : 'bg-slate-950 border-slate-900 text-slate-700 hover:text-red-500 hover:border-red-500/50'}`}>
            <svg className="w-6 h-6 transition-all group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>

          <div className="flex-grow relative group/input">
             <input 
               value={input} 
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="TARGET_INIT_STREAM_0x54 >" 
               className="w-full bg-[#050810] border-2 border-slate-900 rounded-2xl p-5 text-sm font-black text-white italic tracking-tighter mono outline-none focus:border-red-500/50 shadow-inner" 
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                <div className="w-1 h-4 bg-red-600/20 rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-red-600/10 rounded-full animate-pulse delay-75" />
             </div>
          </div>
          <button onClick={handleSend} disabled={isLoading} className="bg-red-600 hover:bg-white p-5 rounded-2xl border-2 border-red-500 shadow-2xl shadow-red-600/30 active:scale-95 transition-all text-slate-950 hover:text-red-600 group">
             <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
