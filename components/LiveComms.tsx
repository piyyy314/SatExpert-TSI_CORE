
import * as React from 'react';
import { useState, useRef } from 'react';

export const LiveComms: React.FC<{ isStealthMode: boolean; addMissionLog?: (detail: string, status?: any) => void }> = ({ isStealthMode, addMissionLog }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MICROPHONE_HARDWARE_NOT_FOUND");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
          }
      };

      mediaRecorder.onstop = async () => {
          setIsRecording(false);
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          try {
              // Convert webm blob to base64
              const arrayBuffer = await audioBlob.arrayBuffer();
              
              // We need PCM. The backend expects PCM rate=16000. 
              // Wait, decodeAudioData in browser can decode WebM to RAW PCM!
              const actx = new AudioContext({ sampleRate: 16000 });
              const audioBuffer = await actx.decodeAudioData(arrayBuffer);
              const pcmData = audioBuffer.getChannelData(0);
              
              const int16 = new Int16Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) {
                  int16[i] = pcmData[i] * 32768;
              }
              const base64Audio = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              
              const response = await fetch('/api/gemini/action', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      action: 'processLiveCommsAudio',
                      payload: { base64Audio }
                  })
              });
              
              if (!response.ok) throw new Error("Backend processing failed.");
              const data = await response.json();
              if (data.error) throw new Error(data.error);
              
              const { transcription, audioBase64, textReply } = data.result;
              
              if (transcription) {
                  setTranscriptions(prev => [...prev, {role: 'USER', text: transcription}]);
              }
              if (textReply) {
                  setTranscriptions(prev => [...prev, {role: 'STIA', text: textReply}]);
              }
              if (audioBase64) {
                 const playbackCtx = new AudioContext({ sampleRate: 24000 });
                 const bs = atob(audioBase64);
                 const ba = new Uint8Array(bs.length);
                 for (let i = 0; i < bs.length; i++) ba[i] = bs.charCodeAt(i);
                 
                 // audioBase64 from Gemini is 24000 PCM
                 const dataInt16 = new Int16Array(ba.buffer);
                 const pcmBuf = playbackCtx.createBuffer(1, dataInt16.length, 24000);
                 const channelData = pcmBuf.getChannelData(0);
                 for (let i = 0; i < dataInt16.length; i++) {
                     channelData[i] = dataInt16[i] / 32768.0;
                 }
                 const source = playbackCtx.createBufferSource();
                 source.buffer = pcmBuf;
                 source.connect(playbackCtx.destination);
                 source.start();
              }
              
          } catch (err: any) {
              console.error("Failed to process comms", err);
              setError(`COMMS_ERROR: ${err.message}`);
          } finally {
              setIsProcessing(false);
          }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("LIVE_INIT_ERROR", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setError("PERMISSION_DENIED: Microphone access is required for voice uplink.");
      } else if (err.message === "MICROPHONE_HARDWARE_NOT_FOUND") {
        setError("HARDWARE_ERROR: No microphone detected on this terminal.");
      } else {
        setError("UPLINK_FAILURE: Could not establish live connection.");
      }
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center min-h-[500px] text-center">
       <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 transition-all duration-500 ${isRecording ? 'bg-red-500/20 border-red-400 shadow-[0_0_40px_rgba(220,38,38,0.4)] scale-110' : (isProcessing ? 'bg-cyan-500/20 border-cyan-400 animate-pulse' : 'bg-slate-900 border-slate-800')}`}>
          <div className={`flex space-x-1 ${isRecording || isProcessing ? '' : 'opacity-20'}`}>
             {[1,2,3,4,5].map(i => <div key={i} className={`w-1 ${isRecording ? 'bg-red-400' : 'bg-cyan-400'} rounded-full animate-pulse`} style={{height: `${12 + Math.random()*20}px`, animationDelay: `${i*0.1}s`}}></div>)}
          </div>
       </div>
       
       <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-4">PTT_Live_Comms</h3>
       <p className="text-slate-500 text-xs font-bold mb-10 uppercase tracking-widest max-w-md">Push-to-Talk voice synchronization with STIA Core. Awaiting transmission.</p>
       
       {error && (
         <div className="mb-8 p-4 bg-red-900/20 border border-red-500/40 rounded-xl">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</p>
         </div>
       )}

       <button 
         onMouseDown={startRecording} 
         onMouseUp={stopRecording}
         onMouseLeave={isRecording ? stopRecording : undefined}
         onTouchStart={startRecording}
         onTouchEnd={stopRecording}
         disabled={isProcessing}
         className={`px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all select-none ${isRecording ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : (isProcessing ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 shadow-lg shadow-cyan-600/20')}`}
       >
          {isProcessing ? 'Processing...' : (isRecording ? 'Release to Transmit' : 'Hold to Speak')}
       </button>

       {transcriptions.length > 0 && (
         <div className="mt-12 w-full max-w-lg bg-slate-950/80 rounded-2xl p-6 border border-slate-800 h-48 overflow-y-auto scrollbar-hide text-left space-y-3">
           {transcriptions.slice(-10).map((t, i) => (
             <div key={i} className="text-[10px] mono">
               <span className={`font-black ${t.role === 'USER' ? 'text-slate-500' : 'text-cyan-500'}`}>{t.role}:</span>
               <span className="text-slate-300 ml-2"> {t.text}</span>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};
