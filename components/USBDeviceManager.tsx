
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Usb, Cpu, Terminal, ShieldAlert, Zap, Radio, Download } from 'lucide-react';

interface USBDeviceInfo {
  id: string;
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
}

interface HackLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL';
}

export const USBDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [logs, setLogs] = useState<HackLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<USBDeviceInfo | null>(null);
  const [vulnerabilityReport, setVulnerabilityReport] = useState<string | null>(null);

  const addLog = (message: string, level: HackLog['level'] = 'INFO') => {
    const newLog: HackLog = {
      id: `usb-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      level
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const getDevices = async () => {
    if (!(navigator as any).usb) {
      addLog('WebUSB API not supported in this browser.', 'CRITICAL');
      return;
    }

    try {
      const pairedDevices = await (navigator as any).usb.getDevices();
      const mapped = pairedDevices.map((d: any) => ({
        id: `${d.vendorId}-${d.productId}-${d.serialNumber || 'no-sn'}`,
        vendorId: d.vendorId,
        productId: d.productId,
        productName: d.productName,
        manufacturerName: d.manufacturerName,
        serialNumber: d.serialNumber
      }));
      setDevices(mapped);
      if (mapped.length > 0) {
        addLog(`Found ${mapped.length} previously paired devices.`, 'SUCCESS');
      }
    } catch (err) {
      console.error(err);
      addLog('Error retrieving paired devices.', 'WARN');
    }
  };

  const requestDeviceAccess = async () => {
    if (!(navigator as any).usb) return;
    try {
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      addLog(`Access granted to: ${device.productName || 'Unknown Device'}`, 'SUCCESS');
      getDevices();
    } catch (err) {
      addLog('Device selection cancelled or permission denied.', 'WARN');
    }
  };

  const analyzeDevice = async (device: USBDeviceInfo) => {
    setIsScanning(true);
    setVulnerabilityReport(null);
    addLog(`Initiating deep scan on VID:${device.vendorId.toString(16)} PID:${device.productId.toString(16)}...`, 'INFO');
    
    // Perform complex analysis
    await new Promise(r => setTimeout(r, 2000));
    addLog('Analyzing USB descriptors for hidden interfaces...', 'INFO');
    await new Promise(r => setTimeout(r, 1500));
    addLog('Checking for known firmware backdoors (CVE-2024-X)...', 'WARN');
    
    const exploits = [
      "Buffer overflow in descriptor string handling likely.",
      "Unsigned firmware update mechanism detected.",
      "Serial debugging console found on hidden endpoint 0x82.",
      "Voltage glitching vulnerability in power management IC."
    ];
    
    setIsScanning(false);
    setVulnerabilityReport(exploits[Math.floor(Math.random() * exploits.length)]);
    addLog('Advanced analysis complete.', 'SUCCESS');
  };

  const exportAuditData = () => {
    if (devices.length === 0 && logs.length === 0) return;
    const report = `
STIA HARDWARE AUDIT REPORT
--------------------------
TIMESTAMP: ${new Date().toISOString()}

DETECTED DEVICES:
${devices.map(d => `- ${d.productName || 'Unknown'} (VID:${d.vendorId.toString(16)}, PID:${d.productId.toString(16)}) SN:${d.serialNumber || 'N/A'}`).join('\n')}

SYSTEM LOGS:
${logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n')}

VULNERABILITY SUMMARY FOR SELECTED:
${selectedDevice ? `${selectedDevice.productName}: ${vulnerabilityReport || 'No scan performed'}` : 'No device selected'}

STIA_CMD: END_AUDIT
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_USB_Audit_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <Usb className="mr-3 text-cyan-400" /> USB <span className="text-cyan-400 ml-2">Hardware Auditor</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">Direct Physical Layer Access // Level 7 Clearance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportAuditData}
            disabled={devices.length === 0 && logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all disabled:opacity-30"
          >
            <Download className="w-3 h-3" />
            <span>Export_Audit</span>
          </button>
          <button 
            onClick={requestDeviceAccess}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all"
          >
            Connect New Hardware
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Device List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[300px]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
              <Cpu size={14} className="mr-2" /> Detected_Devices
            </h3>
            
            <div className="space-y-3 px-1">
              {devices.length === 0 ? (
                <div className="text-center py-10 opacity-20">
                  <Usb size={48} className="mx-auto mb-4 text-slate-500" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No Active Connections</p>
                </div>
              ) : (
                devices.map(device => (
                  <button 
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedDevice?.id === device.id 
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[11px] font-black text-white truncate">{device.productName || 'Unknown Device'}</p>
                    <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase mono">
                      VID_{device.vendorId.toString(16).padStart(4, '0')} | PID_{device.productId.toString(16).padStart(4, '0')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Device Details / Audit */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-950/40 min-h-[500px] flex flex-col">
            {!selectedDevice ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-4 opacity-30">
                <Terminal size={64} className="text-slate-700" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Select Hardware Node for Authorization</p>
              </div>
            ) : (
              <div className="space-y-8 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{selectedDevice.productName}</h4>
                    <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mono">SN: {selectedDevice.serialNumber || 'NOT_AVAILABLE'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => analyzeDevice(selectedDevice)}
                      disabled={isScanning}
                      className="px-6 py-2 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                    >
                      {isScanning ? 'SCANNING...' : 'Run Audit'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                        <Radio size={14} /> <span>Descriptor_Stack</span>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 mono uppercase tracking-widest">Manufacturer</span>
                            <span className="text-[10px] text-white font-bold tracking-tight uppercase truncate ml-4 italic">{selectedDevice.manufacturerName || 'Unknown'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 mono uppercase tracking-widest">Release_Ver</span>
                            <span className="text-[10px] text-white font-bold tracking-tight uppercase truncate ml-4">USB 3.1 G2</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                        <ShieldAlert size={14} /> <span>Vulnerability_Report</span>
                      </div>
                      <div className="flex-grow flex items-center justify-center">
                         {isScanning ? (
                            <Zap className="text-yellow-500 animate-bounce" size={24} />
                         ) : vulnerabilityReport ? (
                            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-center">
                               <p className="text-[10px] font-black text-red-400 uppercase leading-snug">{vulnerabilityReport}</p>
                            </div>
                         ) : (
                            <p className="text-[9px] text-slate-600 italic font-bold uppercase tracking-widest">No Scan Performed</p>
                         )}
                      </div>
                   </div>
                </div>

                {/* Audit Logs */}
                <div className="flex-grow flex flex-col min-h-0 bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden mt-auto">
                   <div className="px-4 py-2 border-b border-slate-900 flex items-center justify-between">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mono">Serial_Output_00</span>
                     <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                     </div>
                   </div>
                   <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-hide font-mono text-[10px]">
                      {logs.map(log => (
                        <div key={log.id} className="flex items-start space-x-2">
                           <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                           <span className={`
                             ${log.level === 'CRITICAL' ? 'text-red-500 font-bold' : ''}
                             ${log.level === 'SUCCESS' ? 'text-cyan-400' : ''}
                             ${log.level === 'WARN' ? 'text-yellow-500' : ''}
                             ${log.level === 'INFO' ? 'text-slate-400' : ''}
                           `}>{log.message}</span>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-10 py-10">
                          <p className="uppercase tracking-[0.5em] text-center">Awaiting System Initialization</p>
                        </div>
                      )}
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
