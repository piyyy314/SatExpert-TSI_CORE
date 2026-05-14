import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Terminal, 
  Code, 
  Cpu, 
  Settings, 
  ShieldAlert, 
  Zap, 
  Download,
  Flame
} from 'lucide-react';

interface ExploitConfig {
  targetOS: 'windows' | 'linux' | 'macos' | 'ios' | 'android';
  vulnClass: 'uaf' | 'heap' | 'desal' | 'type_confusion' | 'logical';
  evasion: 'polymorphic' | 'sleep' | 'env_keying' | 'syscalls';
  payload: 'reverse_tcp' | 'bind_tcp' | 'exec' | 'stager';
}

const OS_OPTIONS = [
  { value: 'windows', label: 'Windows (NT 10.0+)' },
  { value: 'linux', label: 'Linux (Kernel 5.x+)' },
  { value: 'macos', label: 'macOS (Darwin 22+)' },
  { value: 'ios', label: 'iOS / iPadOS (XNU)' },
  { value: 'android', label: 'Android (AOSP)' }
];

const VULN_CLASSES = [
  { value: 'uaf', label: 'Use-After-Free (UAF)' },
  { value: 'heap', label: 'Heap Out-of-Bounds' },
  { value: 'desal', label: 'Insecure Deserialization' },
  { value: 'type_confusion', label: 'Type Confusion' },
  { value: 'logical', label: 'Logical LPE' }
];

const EVASION_TECHS = [
  { value: 'polymorphic', label: 'Polymorphic Encoding' },
  { value: 'sleep', label: 'Sleep Obfuscation (Ekko)' },
  { value: 'env_keying', label: 'Environmental Keying' },
  { value: 'syscalls', label: "Direct Syscalls (Hell's Gate)" }
];

const PAYLOAD_TYPES = [
  { value: 'reverse_tcp', label: 'Reverse Shell (TCP)' },
  { value: 'bind_tcp', label: 'Bind Shell (TCP)' },
  { value: 'exec', label: 'Blind RCE / Exec' },
  { value: 'stager', label: 'Memory-only Stager' }
];

export const ZeroDayForge: React.FC = () => {
  const [config, setConfig] = useState<ExploitConfig>({
    targetOS: 'windows',
    vulnClass: 'uaf',
    evasion: 'syscalls',
    payload: 'reverse_tcp'
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [generatedExploit, setGeneratedExploit] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compileLogs]);

  const generateExploit = () => {
    setIsCompiling(true);
    setCompileLogs([]);
    setGeneratedExploit(null);

    const osTarget = OS_OPTIONS.find(o => o.value === config.targetOS)?.label || config.targetOS;
    const vulnDesc = VULN_CLASSES.find(v => v.value === config.vulnClass)?.label || config.vulnClass;
    const evasionTech = EVASION_TECHS.find(e => e.value === config.evasion)?.label || config.evasion;
    const payloadType = PAYLOAD_TYPES.find(p => p.value === config.payload)?.label || config.payload;

    const steps = [
      `[+] Initializing Zero-Day Forge Engine...`,
      `[~] Target OS: ${osTarget}`,
      `[~] Vulnerability Class: ${vulnDesc}`,
      `[~] Evasion Strategy: ${evasionTech}`,
      `[+] Building payload primitive: ${payloadType}`,
      `[+] Searching for suitable ROP gadgets...`,
      `[~] Found 347 gadgets across ntdll/libc`,
      `[+] Constructing fake object for ${config.vulnClass}...`,
      `[+] Applying ${config.evasion} obfuscation layer...`,
      `[+] Generating shellcode (x64 / ARM64 multi-arch block)...`,
      `[+] Baking payload into wrapper artifact...`,
      `[+] Verification check passing (0/64 engine detections).`,
      `[=] EXPLOIT COMPILED SUCCESSFULLY.`
    ];

    let currentStep = 0;
    const logInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setCompileLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(logInterval);
        setIsCompiling(false);
        setGeneratedExploit(createMockExploitCode());
      }
    }, 400);
  };

  const createMockExploitCode = () => {
    const osTarget = OS_OPTIONS.find(o => o.value === config.targetOS)?.label || config.targetOS;
    const vulnDesc = VULN_CLASSES.find(v => v.value === config.vulnClass)?.label || config.vulnClass;
    const evasionTech = EVASION_TECHS.find(e => e.value === config.evasion)?.label || config.evasion;
    const payloadType = PAYLOAD_TYPES.find(p => p.value === config.payload)?.label || config.payload;

    return `#!/usr/bin/env python3
# AUTO-GENERATED 0-DAY ARTIFACT
# Target: ${osTarget}
# Vulnerability: ${vulnDesc}
# Payload Primitive: ${payloadType}
# Evasion Strategy: ${evasionTech}

import struct
import socket
import sys
import time

def build_rop_chain():
    # ROP chain using dynamically resolved gadgets
    rop = b""
    rop += struct.pack("<Q", 0xDEADBEEFCAFEBABE) # pop rdi; ret
    rop += struct.pack("<Q", 0x1337133713371337) # system() ptr
    return rop

def trigger_vuln():
    print("[*] Allocating fake object structure for ${config.vulnClass}...")
    fake_obj = b"A" * 64
    fake_obj += build_rop_chain()
    
    # Applying Evasion Layer: ${config.evasion}
    time.sleep(2) # Delay bypass
    print("[+] Heap feng shui complete. Triggering...")
    
    payload = b"PAYLOAD_START_" + fake_obj + b"_PAYLOAD_END"
    return payload

def exploit(target_ip, target_port):
    print(f"[*] Attacking {target_ip}:{target_port}...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((target_ip, target_port))
        
        print(f"[*] Sending malicious packet with {config.payload}...")
        s.send(trigger_vuln())
        
        print("[+] Exploit sent. Awaiting connection/execution...")
        s.close()
    except Exception as e:
        print(f"[-] Exploit failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: ./exploit.py <IP> <PORT>")
        sys.exit(1)
    exploit(sys.argv[1], int(sys.argv[2]))
`;
  };

  const downloadExploit = () => {
    if (!generatedExploit) return;
    const blob = new Blob([generatedExploit], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `0day_${config.targetOS}_${config.vulnClass}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 pb-12">
      <header className="flex items-center justify-between pb-6 border-b border-red-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />
        <div>
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase flex items-center space-x-3">
            <Skull className="w-8 h-8 mr-2" />
            Zero-Day Forge
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-wider">
            Advanced Exploit Weaponization & Payload Generation
          </p>
        </div>
        <div className="p-4 bg-red-900/20 border-2 border-red-900/50 rounded-2xl relative z-10">
          <Flame className="w-8 h-8 text-red-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Config Panel */}
          <div className="bg-[#050810] border border-red-900/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-red-500 to-transparent h-full" />
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-slate-400" /> Weapon Parameters
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Target Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {OS_OPTIONS.map(os => (
                    <button
                      key={os.value}
                      onClick={() => setConfig({ ...config, targetOS: os.value as any })}
                      className={`p-2 text-[10px] font-bold tracking-wider uppercase rounded border transition-all ${
                        config.targetOS === os.value ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {os.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Vulnerability Class</label>
                <select
                  value={config.vulnClass}
                  onChange={e => setConfig({ ...config, vulnClass: e.target.value as any })}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:border-red-500/50 focus:outline-none uppercase tracking-wider"
                >
                  {VULN_CLASSES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Evasion Strategy</label>
                <select
                  value={config.evasion}
                  onChange={e => setConfig({ ...config, evasion: e.target.value as any })}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:border-red-500/50 focus:outline-none uppercase tracking-wider"
                >
                  {EVASION_TECHS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Payload Primitive</label>
                <select
                  value={config.payload}
                  onChange={e => setConfig({ ...config, payload: e.target.value as any })}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:border-red-500/50 focus:outline-none uppercase tracking-wider"
                >
                  {PAYLOAD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <button
                onClick={generateExploit}
                disabled={isCompiling}
                className={`w-full mt-4 py-3 rounded uppercase tracking-widest font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                  isCompiling ? 'bg-red-950 text-red-500 border border-red-900/50' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                }`}
              >
                {isCompiling ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse mr-2" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 mr-2" />
                    Generate Exploit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Output Terminal */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[400px] shadow-2xl relative">
            <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-950/50">
               <Terminal className="w-4 h-4 text-slate-500 mr-2" />
               <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Compiler_Console_tty0</h3>
            </div>
            
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto bg-[#0a0d14] custom-scrollbar space-y-1">
              {compileLogs.length === 0 && !isCompiling && !generatedExploit && (
                <div className="text-slate-600 italic flex flex-col items-center justify-center h-full space-y-4">
                   <ShieldAlert className="w-12 h-12 text-slate-800" />
                   <span>Awaiting build configuration...</span>
                </div>
              )}
              {compileLogs.map((log, i) => (
                <div key={i} className={`${
                  log?.includes?.('[-]') ? 'text-red-500' :
                  log?.includes?.('[+]') ? 'text-emerald-500' :
                  log?.includes?.('[=]') ? 'text-cyan-400 font-bold' :
                  'text-slate-400'
                }`}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Generated Code Panel */}
          <AnimatePresence>
            {generatedExploit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#050810] border-2 border-red-900/50 rounded-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-red-900/50 bg-red-950/20">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-mono text-red-400 uppercase tracking-widest">Compiled_Artifact</h3>
                  </div>
                  <button 
                    onClick={downloadExploit}
                    title="Download Payload"
                    className="flex items-center px-3 py-1 bg-red-900/40 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-800/50 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </button>
                </div>
                <div className="p-4 bg-[#0a0d14] max-h-[300px] overflow-y-auto custom-scrollbar">
                  <pre className="text-[10px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {generatedExploit}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
