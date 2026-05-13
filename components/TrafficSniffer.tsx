
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Download, Trash2, ShieldAlert } from 'lucide-react';

interface Packet {
  id: string;
  timestamp: string;
  src: string;
  dst: string;
  protocol: string;
  payload: string;
  isInteresting: boolean;
}

const KEYWORDS = ['user', 'pass', 'login', 'post', 'admin', 'root', 'secret', 'key'];
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'FTP', 'SSH'];
const IPS = ['192.168.1.105', '10.0.0.42', '172.16.0.15', '45.79.12.3', '8.8.8.8', '1.1.1.1'];

export const TrafficSniffer: React.FC<{ isStealthMode: boolean }> = ({ isStealthMode }) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isSniffing, setIsSniffing] = useState(false);
  const [filter, setFilter] = useState('tcp port 80');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSniffing) return;

    const interval = setInterval(() => {
      const src = IPS[Math.floor(Math.random() * IPS.length)];
      const dst = IPS[Math.floor(Math.random() * IPS.length)];
      const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
      
      const payloads = [
        "GET /index.html HTTP/1.1",
        "POST /login.php HTTP/1.1",
        "USER admin",
        "PASS **********",
        "SSH-2.0-OpenSSH_8.2p1",
        "HELO relay.example.com",
        "DATA secret_key=4f2e9a1b",
        "CONNECT 10.0.0.1:443 HTTP/1.1"
      ];
      const payload = payloads[Math.floor(Math.random() * payloads.length)];
      const isInteresting = KEYWORDS.some(word => payload?.toLowerCase()?.includes(word));

      const newPacket: Packet = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 }),
        src,
        dst,
        protocol,
        payload,
        isInteresting
      };

      setPackets(prev => [newPacket, ...prev].slice(0, 50));
    }, 800);

    return () => clearInterval(interval);
  }, [isSniffing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [packets]);

  const handleExport = () => {
    if (packets.length === 0) return;
    const data = packets.map(p => `[${p.timestamp}] ${p.protocol} ${p.src} -> ${p.dst} | ${p.payload}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRAFFIC_CAPTURE_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="mr-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">📡</span> Stealth <span className="text-cyan-500 ml-2">Sniffer</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Passive Traffic Analysis // NIST-800-115 Compliant</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isSniffing ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
             {isSniffing ? 'SNIFFING_ACTIVE' : 'SNIFFER_STANDBY'}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Sniffer Configuration</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">BPF_Filter</label>
                  <input 
                    type="text"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white mono outline-none focus:border-cyan-500"
                    placeholder="e.g. tcp port 80"
                  />
               </div>
               <button 
                 onClick={() => setIsSniffing(!isSniffing)}
                 className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                   isSniffing 
                   ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
                   : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-600/20'
                 }`}
               >
                 {isSniffing ? 'Stop_Capture' : 'Start_Stealth_Sniff'}
               </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Detection Keywords</h3>
             <div className="flex flex-wrap gap-2">
                {KEYWORDS.map(word => (
                  <span key={word} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[8px] font-black text-slate-400 uppercase mono">
                    {word}
                  </span>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Traffic Stream</h3>
                <div className="flex items-center space-x-3">
                   <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mr-2">{packets.length} Packets Captured</span>
                   <button 
                     onClick={handleExport} 
                     disabled={packets.length === 0} 
                     className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] font-black text-cyan-500 uppercase tracking-widest transition-all disabled:opacity-30"
                   >
                     <Download className="w-3 h-3" />
                     <span>Pcap_Dump</span>
                   </button>
                   <button 
                     onClick={() => setPackets([])} 
                     className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/30 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest transition-all"
                   >
                     <Trash2 className="w-3 h-3" />
                     <span>Clear_Buffer</span>
                   </button>
                </div>
              </div>
              
              <div className="flex-grow bg-slate-950/50 rounded-2xl border border-slate-900 overflow-hidden flex flex-col">
                 <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-slate-900 bg-slate-900/50 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-3">Source</div>
                    <div className="col-span-3">Destination</div>
                    <div className="col-span-1">Proto</div>
                    <div className="col-span-3">Payload_Snippet</div>
                 </div>
                 <div ref={scrollRef} className="flex-grow overflow-y-auto scrollbar-hide p-2 space-y-1">
                    <AnimatePresence initial={false}>
                       {packets.map((p) => (
                         <motion.div 
                           key={p.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           className={`grid grid-cols-12 gap-2 px-2 py-1.5 rounded-lg text-[9px] mono transition-colors ${
                             p.isInteresting 
                             ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                             : 'hover:bg-white/5 text-slate-400'
                           }`}
                         >
                            <div className="col-span-2 opacity-50">{p.timestamp}</div>
                            <div className="col-span-3 truncate">{p.src}</div>
                            <div className="col-span-3 truncate">{p.dst}</div>
                            <div className="col-span-1 font-black">{p.protocol}</div>
                            <div className="col-span-3 truncate italic">
                               {p.isInteresting && <span className="mr-1">⚠️</span>}
                               {p.payload}
                            </div>
                         </motion.div>
                       ))}
                    </AnimatePresence>
                    {packets.length === 0 && !isSniffing && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Capture Initiation</p>
                      </div>
                    )}
                 </div>
              </div>

              {packets.some(p => p.isInteresting) && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-pulse">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-black">!</div>
                      <div>
                         <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Interesting Traffic Detected</p>
                         <p className="text-[8px] text-red-400/70 font-bold uppercase tracking-widest">Potential credential leak or sensitive command intercepted.</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
