import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  VolumeX, 
  Volume2, 
  Waves, 
  Upload, 
  Play, 
  Cpu,
  RefreshCw,
  PhoneCall,
  Download,
  AlertTriangle,
  Radio
} from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  role: string;
  trainingSamples: number;
  confidence: number;
}

const VOICE_MODELS: VoiceModel[] = [
  { id: 'v1', name: 'General R. Sterling', role: 'Joint Chiefs', trainingSamples: 450, confidence: 98.4 },
  { id: 'v2', name: 'CEO M. Chen', role: 'Nexus Corp', trainingSamples: 120, confidence: 89.2 },
  { id: 'v3', name: 'Dr. A. Volkov', role: 'Chief Scientist', trainingSamples: 65, confidence: 76.5 },
  { id: 'v4', name: 'Director S. Vance', role: 'Operations Cmd', trainingSamples: 890, confidence: 99.8 }
];

export const DeepfakeComms: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>(VOICE_MODELS[0].id);
  const [inputText, setInputText] = useState('Initiate immediate override of Sector 4 containment protocols. Authorization code: Sierra-Tango-9. Acknowledge.');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isExecutingCall, setIsExecutingCall] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [logs, setLogs] = useState<{ time: string, msg: string }[]>([]);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(40).fill(10));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSynthesizing || isExecutingCall || isPlayingAudio) {
      interval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => 10 + Math.random() * 80));
      }, 100);
    } else {
      setWaveformBars(Array(40).fill(10));
    }
    return () => clearInterval(interval);
  }, [isSynthesizing, isExecutingCall, isPlayingAudio]);

  const activeModel = VOICE_MODELS.find(m => m.id === selectedModel);

  const synthesizeAudio = () => {
    if (!inputText.trim()) return;
    
    setIsSynthesizing(true);
    setIsAudioReady(false);
    setLogs([]);
    
    const steps = [
      `[+] Loading latent diffusion model for ${activeModel?.name}...`,
      `[+] Analyzing speech prosody and inflection parameters...`,
      `[+] Generating spectrogram...`,
      `[+] Applying neural vocoder (HiFi-GAN)...`,
      `[+] Artifact removal and background noise injection (Military Radio Preset)...`,
      `[=] SYNTHESIS COMPLETE. Audio buffer ready.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: steps[step] }]);
        step++;
      } else {
        clearInterval(interval);
        setIsSynthesizing(false);
        setIsAudioReady(true);
      }
    }, 800);
  };

  const listenLive = () => {
    setIsPlayingAudio(true);
    // Simple Web Speech API fallback
    const msg = new SpeechSynthesisUtterance(inputText);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
       msg.voice = voices[activeModel?.id === 'v2' ? 1 : 0] || voices[0];
    }
    msg.pitch = activeModel?.id === 'v4' ? 0.8 : activeModel?.id === 'v1' ? 0.6 : 1;
    msg.rate = 0.9;
    
    msg.onend = () => setIsPlayingAudio(false);
    msg.onerror = () => setIsPlayingAudio(false);
    
    window.speechSynthesis.speak(msg);
  };

  const deployCall = () => {
    setIsExecutingCall(true);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[+] Initiating secure VoIP SIP trunk hijacking...` }]);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[+] Spoofing caller ID: ${activeModel?.role} (${activeModel?.name})` }]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[!] Call connected. Injecting synthetic audio payload...` }]);
      setTimeout(() => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[+] Payload delivered. Disconnecting and wiping CDR logs.` }]);
        setIsExecutingCall(false);
      }, 4000);
    }, 2000);
  };

  const exportTranscript = () => {
    const reportStr = `SYNTHETIC VOICE OPERATIONS - TRANSCRIPT LOG\n--------------------------------------------\nTIMESTAMP: ${new Date().toISOString()}\nTARGET MODEL: ${activeModel?.name} (${activeModel?.role})\nCONFIDENCE SCORE: ${activeModel?.confidence}%\n\nSYNTHESIZED PAYLOAD (RAW TEXT):\n"${inputText}"\n\nEXECUTION LOGS:\n${logs.map(l => `[${l.time}] ${l.msg}`).join('\n')}`;
    const blob = new Blob([reportStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake_transcript_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 pb-12">
      <header className="flex items-center justify-between pb-6 border-b border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
        <div>
          <h2 className="text-2xl font-black text-indigo-500 tracking-widest uppercase flex items-center space-x-3">
            <Mic className="w-8 h-8 mr-2" />
            Neural Voice Synthesis
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-wider">
            Deepfake Comms Spoofing & Audio Injector
          </p>
        </div>
        <div className="flex space-x-4 relative z-10">
          {logs.length > 0 && !isSynthesizing && !isExecutingCall && (
            <button onClick={exportTranscript} className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-500 rounded uppercase tracking-widest text-[10px] font-black flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Transcript
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          {/* Target Selection */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent h-full" />
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Voice Model Selection</h3>
             
             <div className="space-y-3">
                {VOICE_MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => { setSelectedModel(model.id); setIsAudioReady(false); setLogs([]); }}
                    disabled={isSynthesizing || isExecutingCall}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedModel === model.id ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                     <div className="flex justify-between items-center mb-1">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${selectedModel === model.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                           {model.name}
                        </span>
                        <div className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                           model.confidence > 95 ? 'bg-emerald-900/50 text-emerald-400' :
                           model.confidence > 80 ? 'bg-yellow-900/50 text-yellow-500' : 'bg-red-900/50 text-red-500'
                        }`}>
                           {model.confidence}% Match
                        </div>
                     </div>
                     <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between">
                        <span>{model.role}</span>
                        <span>{model.trainingSamples} samples</span>
                     </div>
                  </button>
                ))}
             </div>
             
             <button className="w-full mt-4 flex items-center justify-center py-2 px-4 bg-slate-900 border border-slate-800 border-dashed rounded text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Upload className="w-4 h-4 mr-2" />
                Train New Model (10+ min audio req)
             </button>
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col space-y-6">
          {/* Payload Configuration */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                 <Waves className="w-4 h-4 mr-2" /> Audio Payload Construction
             </h3>
             <textarea 
               value={inputText}
               onChange={(e) => { setInputText(e.target.value); setIsAudioReady(false); }}
               disabled={isSynthesizing || isExecutingCall}
               className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-[13px] font-mono text-slate-300 focus:border-indigo-500/50 focus:outline-none resize-none custom-scrollbar disabled:opacity-50"
               placeholder="Enter text to synthesize in target's voice..."
             />

             <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                   <Cpu className="w-4 h-4" />
                   <span>Neural Engine: Advanced V-GAN v4.2</span>
                </div>
                
                <button 
                  onClick={synthesizeAudio}
                  disabled={isSynthesizing || isExecutingCall || !inputText.trim()}
                  className={`px-6 py-2 rounded uppercase tracking-widest text-xs font-black flex items-center transition-all ${
                    isSynthesizing ? 'bg-indigo-950 text-indigo-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                  }`}
                >
                  {isSynthesizing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isSynthesizing ? 'Rendering...' : 'Synthesize Audio'}
                </button>
             </div>
          </div>

          {/* Deployment & Visualization */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 flex flex-col flex-1">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Output Buffer</h3>
             </div>

             <div className="flex items-center justify-between mb-8 space-x-1">
               {waveformBars.map((height, i) => (
                 <motion.div 
                   key={i}
                   animate={{ height: `${height}px` }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   className={`w-full rounded-t ${isExecutingCall ? 'bg-red-500/80' : isSynthesizing ? 'bg-indigo-500/80' : 'bg-slate-800'}`}
                 />
               ))}
             </div>

             <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-4 font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar min-h-[150px]">
                {logs.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                     <VolumeX className="w-8 h-8 mb-2" />
                     <span>No audio synthesized yet.</span>
                   </div>
                )}
                {logs.map((log, i) => (
                  <div key={i} className={
                    (log?.msg || '').includes('[!]') || (log?.msg || '').includes('Delivered') ? 'text-emerald-400 font-bold' : 
                    (log?.msg || '').includes('[=]') ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }>
                    <span className="text-slate-600 mr-2">[{log?.time}]</span>
                    {log?.msg}
                  </div>
                ))}
             </div>

             <AnimatePresence>
               {isAudioReady && !isExecutingCall && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-red-950/20 border border-red-900/50 rounded-xl space-y-4 sm:space-y-0"
                 >
                    <div className="flex items-center text-red-500 w-full sm:w-auto">
                      <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
                      <div>
                         <div className="text-[11px] font-bold uppercase tracking-widest leading-none mb-1">Payload Ready for Deployment</div>
                         <div className="text-[9px] font-mono text-red-400">Injecting via Secure SIP Trunk (Auto-spoof Caller ID)</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 w-full sm:w-auto">
                      <button 
                        onClick={listenLive}
                        disabled={isPlayingAudio}
                        className={`flex-1 sm:flex-none px-4 py-2 border rounded uppercase tracking-widest text-[10px] font-black flex items-center justify-center transition-all ${
                           isPlayingAudio ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-900 border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-300'
                        }`}
                      >
                        {isPlayingAudio ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Listen Live
                      </button>

                      <button 
                        onClick={deployCall}
                        className="flex-1 sm:flex-none px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded uppercase tracking-widest text-[10px] font-black flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                      >
                        <PhoneCall className="w-4 h-4 mr-2 shrink-0" />
                        Initiate Call
                      </button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
