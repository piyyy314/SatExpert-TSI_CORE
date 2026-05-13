import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  FileWarning, 
  Lock, 
  Key, 
  AlertOctagon, 
  Download,
  Terminal,
  ShieldOff
} from 'lucide-react';

interface EncryptedFile {
  id: string;
  name: string;
  type: string;
  size: string;
}

const TARGET_FILES = [
  { id: 'f1', name: 'financial_records_2025.xlsx', type: 'EXCEL', size: '14.2 MB' },
  { id: 'f2', name: 'employee_data_db.sql', type: 'SQL', size: '102.5 MB' },
  { id: 'f3', name: 'q4_board_presentation.pptx', type: 'PPT', size: '8.4 MB' },
  { id: 'f4', name: 'private_key.pem', type: 'KEY', size: '4 KB' },
  { id: 'f5', name: 'customer_pii_dump.csv', type: 'CSV', size: '204.1 MB' },
  { id: 'f6', name: 'ntds.dit', type: 'SYSTEM', size: '55.3 MB' },
  { id: 'f7', name: 'source_code_repo.zip', type: 'ZIP', size: '1.2 GB' }
];

export const RansomwareSim: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [showRansomNote, setShowRansomNote] = useState(false);
  
  const decryptionKey = "0x" + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase() + "-DECRYPT";

  useEffect(() => {
    if (isRunning) {
      if (encryptedFiles.length < TARGET_FILES.length) {
        const timer = setTimeout(() => {
          const nextFile = TARGET_FILES[encryptedFiles.length];
          setEncryptedFiles(prev => [...prev, nextFile]);
          setLogs(prev => [...prev, `[ENCRYPT] ${nextFile.name} -> ${nextFile.name}.locked`]);
        }, 800 + Math.random() * 1000);
        return () => clearTimeout(timer);
      } else {
        setIsRunning(false);
        setShowRansomNote(true);
        setLogs(prev => [...prev, `[!!!] CRITICAL: ALL TARGETS ENCRYPTED. DROPPING RANSOM_NOTE.txt`]);
      }
    }
  }, [isRunning, encryptedFiles]);

  const deployPayload = () => {
    setEncryptedFiles([]);
    setLogs(['[+] Initializing Cryptoworm Payload...', '[+] Injecting into explorer.exe', '[+] Disabling Volume Shadow Copies (vssadmin delete shadows /all /quiet)']);
    setShowRansomNote(false);
    setIsRunning(true);
  };

  const exportIRReport = () => {
    const reportStr = `INCIDENT RESPONSE REPORT - RANSOMWARE EVENT
-------------------------------------------
TIMESTAMP: ${new Date().toISOString()}

STATUS: COMPROMISED
INFECTED FILES: ${encryptedFiles.length}
DECRYPTION KEY (RECOVERED IN MEMORY): ${decryptionKey}

EVENT LOGS:
${logs.join('\n')}

ENCRYPTED ASSETS:
${encryptedFiles.map(f => `- ${f.name}.locked (${f.size})`).join('\n')}
`;
    const blob = new Blob([reportStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ir_ransomware_report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 pb-12">
      <header className="flex items-center justify-between pb-6 border-b border-red-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />
        <div>
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase flex items-center space-x-3">
            <Skull className="w-8 h-8 mr-2" />
            Cryptoworm Operation
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-wider">
            Ransomware Deployment & Extortion Mechanics
          </p>
        </div>
        <div className="flex space-x-4 relative z-10">
          {(showRansomNote || encryptedFiles.length > 0) && !isRunning && (
            <button onClick={exportIRReport} className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-500 rounded uppercase tracking-widest text-[10px] font-black flex items-center shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export IR Report
            </button>
          )}
          <button 
            onClick={deployPayload}
            disabled={isRunning}
            className={`px-6 py-2 rounded uppercase tracking-widest text-xs font-black flex items-center transition-all ${
              isRunning ? 'bg-red-950 text-red-500 cursor-not-allowed border border-red-900' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
            }`}
          >
            <AlertOctagon className="w-4 h-4 mr-2" />
            {isRunning ? 'Encrypting...' : 'Deploy Payload'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 h-[500px] flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Terminal className="w-4 h-4 mr-2" /> Encryption Engine Logs
            </h3>
            
            <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-4 font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <ShieldOff className="w-8 h-8 mb-4 opacity-50" />
                  <p>System secure. Awaiting payload.</p>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className={(log || '').includes('!!!') ? 'text-red-500 font-bold' : (log || '').includes('[ENCRYPT]') ? 'text-orange-400' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-mono border-t border-slate-800 pt-4">
              <div className="text-slate-500">Target Files: <span className="text-cyan-400">{TARGET_FILES.length}</span></div>
              <div className="text-slate-500">Encrypted: <span className="text-red-500 font-bold">{encryptedFiles.length}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative h-[500px]">
          {/* Target Files visualization */}
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Filesystem Access</h3>
            <div className="space-y-2">
              {TARGET_FILES.map(file => {
                const isEncrypted = encryptedFiles.find(f => f.id === file.id);
                return (
                  <div key={file.id} className={`p-3 rounded border flex justify-between items-center transition-all duration-500 ${
                    isEncrypted ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {isEncrypted ? <Lock className="w-4 h-4 text-red-500" /> : <FileWarning className="w-4 h-4 text-slate-500" />}
                      <div>
                        <div className={`text-[11px] font-mono ${isEncrypted ? 'text-red-400 line-through opacity-70' : 'text-slate-300'}`}>{file.name}</div>
                        {isEncrypted && <div className="text-[10px] font-mono text-red-500 mt-1">{file.name}.locked</div>}
                      </div>
                    </div>
                    <div className={`text-[9px] font-mono ${isEncrypted ? 'text-red-500' : 'text-slate-500'}`}>{file.size}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ransom Note Overlay */}
          <AnimatePresence>
            {showRansomNote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md rounded-2xl border-2 border-red-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                
                <div className="bg-red-950/80 border-2 border-red-500 rounded p-6 max-w-md w-full text-center relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                  <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">OOPS, YOUR FILES HAVE BEEN ENCRYPTED!</h2>
                  <p className="text-[10px] text-red-200 uppercase tracking-widest mb-6">Military-Grade Encryption (RSA-4096) Applied.</p>
                  
                  <div className="bg-black/50 border border-red-900 p-4 font-mono text-[10px] text-left text-red-400 space-y-4 mb-6">
                    <p>What Happened to My Computer?</p>
                    <p className="text-slate-400">All your important files, databases, and source code are encrypted. Nobody can recover your files without our decryption service.</p>
                    <p>How do I recover my files?</p>
                    <p className="text-slate-400">Send 2.5 BTC to the address below. Your unique Decryption ID is generated.</p>
                  </div>

                  <div className="bg-black/50 p-3 rounded font-mono text-center">
                    <div className="text-[8px] text-slate-500 mb-1 uppercase tracking-widest">Your Offline Decryption Key (Generated Artifact):</div>
                    <div className="text-xs text-emerald-400 font-bold break-all flex items-center justify-center">
                      <Key className="w-4 h-4 mr-2" />
                      {decryptionKey}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
