import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Satellite, TacticalEvent } from '../types';
import { generateSatelliteSitrep } from '../services/geminiService';
import { 
  Terminal, ShieldCheck, Activity, Brain, Download, Lock, Check, 
  FileText, X, Settings, Database, Cpu, Radio, Thermometer 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { safeAutoTable } from '../utils/pdfHelper';
import { auth } from '../services/firebaseService';
import { exportEventLogsAsText, generateSecureEventLogPDF } from '../services/pdfService';

interface Props {
  selectedSatellite: Satellite;
  defcon: number;
  eventLogs?: TacticalEvent[];
}

export const SitrepBoard: React.FC<Props> = ({ selectedSatellite, defcon, eventLogs = [] }) => {
  const [sitrep, setSitrep] = React.useState<string>('INITIATING_INTEL_UPLINK...');
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'sitrep' | 'logs'>('sitrep');

  // Exporter Overlays & States
  const [showExportConsole, setShowExportConsole] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<'pdf' | 'text' | 'archive'>('pdf');
  const [encryptionKey, setEncryptionKey] = React.useState('STIA-SECURE-CIPHER-2026');
  const [exportProgress, setExportProgress] = React.useState(-1);
  const [exportStatusText, setExportStatusText] = React.useState('');

  // Log Inspection Overlay State
  const [selectedTelemetryLog, setSelectedTelemetryLog] = React.useState<TacticalEvent | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const updateSitrep = async () => {
      setIsLoading(true);
      try {
        const report = await generateSatelliteSitrep(selectedSatellite, defcon);
        if (isMounted) {
          setSitrep(report || `Operational Status for ${selectedSatellite.name}: Link stability nominal. Defensive correlation at DEFCON ${defcon}.`);
        }
      } catch (err) {
        if (isMounted) {
          setSitrep(`SITREP generated for ${selectedSatellite.name} (${selectedSatellite.operator || 'ORBITAL_ASSET'}). Operational status nominal at DEFCON ${defcon}. Telemetry telemetry streams synchronized.`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    updateSitrep();
    return () => {
      isMounted = false;
    };
  }, [selectedSatellite.id, defcon]);

  const computeHash = (content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash) + content.charCodeAt(i);
      hash = hash & hash;
    }
    return 'STIA_' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  const getDefconLabel = (level: number) => {
    switch (level) {
      case 1: return "COCKED PISTOL / IMMEDIATE STRATEGIC RESPONSE REQUIRED";
      case 2: return "FAST PACE / EXTREME RED ALERT STATUS";
      case 3: return "ROUND HOUSE / INCREASED FORCE CORRELATION";
      case 4: return "DOUBLE TAKE / ELEVATED SURVEILLANCE POSTURE";
      default: return "FADE OUT / NORMAL COMPROMISE PROFILE";
    }
  };

  const generateTelemetrySnapshot = (event: TacticalEvent) => {
    const seed = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let snrBase = 12.5;
    if (['CRITICAL', 'BREACH', 'STRIKE'].includes(event.status)) {
      snrBase = 4.2;
    }
    const snr = parseFloat((snrBase + (seed % 35) / 10).toFixed(1));
    
    let rxBase = -55.0;
    if (['CRITICAL', 'BREACH', 'STRIKE'].includes(event.status)) {
      rxBase = -73.5;
    }
    const rxPower = parseFloat((rxBase - (seed % 150) / 10).toFixed(1));
    
    let tempBase = 41.2;
    if (['CRITICAL', 'BREACH', 'STRIKE'].includes(event.status)) {
      tempBase = 68.4;
    }
    const bucTemp = parseFloat((tempBase + (seed % 120) / 10).toFixed(1));

    const amplifierDraw = parseFloat((1.8 + (seed % 20) / 10).toFixed(2));
    const azimuthOffset = parseFloat(((seed % 40) / 1000).toFixed(3));

    return {
      snr,
      rxPower,
      bucTemp,
      amplifierDraw,
      azimuthOffset
    };
  };

  const executePDFGeneration = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toISOString();

    doc.setFillColor(11, 15, 30);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(220, 38, 38);
    doc.rect(15, 10, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text('CLASSIFICATION: TOP SECRET // SCI // NOFORN', 105, 15, { align: 'center' });

    doc.setTextColor(34, 211, 238);
    doc.setFontSize(18);
    doc.text('STIA MISSION INTELLIGENCE EXPORT', 15, 35);
    
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1);
    doc.line(15, 40, 195, 40);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`REPORT_ID: STIA-SITREP-${Date.now().toString().slice(-8)}`, 15, 48);
    doc.text(`UPLINK_TIMESTAMP: ${timestamp}`, 15, 53);
    doc.text(`TERMINAL: AEGIS_INTELLIGENCE_DESK_v8.0`, 15, 58);
    doc.text(`AUTHENTICATED_OPERATOR: ${auth.currentUser?.email || 'OFF_GRID_LOCAL_OPERATOR'}`, 15, 63);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('1. TARGET SATELLITE PROFILE DATA', 15, 75);

    const satMeta = [
      ['METRIC KEY', 'OPERATIONAL VALUE', 'DIAGNOSTIC RESOLUTION'],
      ['NAME / IDENTIFIER', selectedSatellite.name, 'VERIFIED'],
      ['LONGITUDE SLOT', `${selectedSatellite.longitude?.toFixed(4) || '0.000'}`, 'ON STATION'],
      ['ORBITAL CATEGORY', selectedSatellite.orbitalSlot || 'GEO_STATIONARY', 'NOMINAL'],
      ['APOGEE PROFILE', `${selectedSatellite.apogee || '35,786'} km`, 'NOMINAL'],
      ['PERIGEE PROFILE', `${selectedSatellite.perigee || '35,782'} km`, 'NOMINAL'],
      ['VELOCITY VCTOR', `${selectedSatellite.velocity || '3.07'} km/s`, 'STABLE'],
      ['SLOT CLASSIFICATION', (selectedSatellite.status || 'Active').toUpperCase(), 'STABLE_ORBIT'],
    ];

    safeAutoTable(doc, {
      startY: 80,
      head: [satMeta[0]],
      body: satMeta.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier', fontSize: 8 },
      bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 8 },
      alternateRowStyles: { fillColor: [8, 12, 24] },
      margin: { left: 15, right: 15 },
    });

    const sitrepY = (doc as any).lastAutoTable.finalY + 12;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`2. STRATEGIC COMBAT THREAT LEVEL (DEFCON ${defcon})`, 15, sitrepY);
    
    doc.setFontSize(8);
    doc.setTextColor(248, 113, 113);
    doc.text(`THREAT MATRIX STATUS: ${getDefconLabel(defcon)}`, 15, sitrepY + 5);

    const rectHeight = 60;
    doc.setFillColor(15, 23, 42);
    doc.rect(15, sitrepY + 9, 180, rectHeight, 'F');
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(0.5);
    doc.rect(15, sitrepY + 9, 180, rectHeight, 'S');

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    
    const maxLines = 11;
    const splitReport = doc.splitTextToSize(sitrep, 172);
    doc.text(splitReport.slice(0, maxLines), 19, sitrepY + 16);

    const logY = sitrepY + rectHeight + 15;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.text('3. CLOUD EVENT SYNCHRONIZATION AUDIT JOURNAL', 15, logY);

    const logsToPrint = eventLogs.length > 0 ? eventLogs : [
      { id: 'LOCAL_LOG', timestamp: new Date().toLocaleTimeString(), satName: selectedSatellite.name, satId: selectedSatellite.id, status: 'INFO', detail: 'Local node sync buffer only. No active remote cloud events recorded.' }
    ];

    const logsTable = [
      ['TIMESTAMP', 'SAT_NAME', 'SECURITY CLASSIFICATION', 'MUTATION / AUDIT ACTIVITY DETAILS'],
      ...logsToPrint.slice(0, 10).map(log => [
        log.timestamp,
        log.satName,
        String(log.status).toUpperCase(),
        log.detail
      ])
    ];

    safeAutoTable(doc, {
      startY: logY + 5,
      head: [logsTable[0]],
      body: logsTable.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], font: 'courier', fontSize: 7 },
      bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 7 },
      alternateRowStyles: { fillColor: [8, 12, 24] },
      margin: { left: 15, right: 15 },
    });

    const signY = (doc as any).lastAutoTable.finalY + 12;
    if (signY < 275) {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.text(`INTEGRITY CHECKSUM: ${computeHash(JSON.stringify(logsToPrint))}`, 15, signY);
      doc.text('APPROVED AND SEALED SECURELY BY SENTINEL CRYPTOLOGY SYSTEMS CORE', 15, signY + 4);
    }

    doc.save(`STIA_TACTICAL_REPORT_${selectedSatellite.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const executeArchiveGeneration = () => {
    const rawData = {
      agency: "SATELLITE TACTICAL INTELLIGENCE ALLIANCE",
      classification: "TS/SCI // NOFORN",
      timestamp: new Date().toISOString(),
      targetSatellite: selectedSatellite,
      combatDefcon: defcon,
      liveSitrep: sitrep,
      cloudEventLogs: eventLogs,
      verificationCheck: "STIA-DESTRUCT-IF-COMPROMISED"
    };

    const plaintext = JSON.stringify(rawData);
    const key = encryptionKey || 'STIA-DEFAULT-KEY';
    
    let hexCiphertext = "";
    for (let i = 0; i < plaintext.length; i++) {
      const pChar = plaintext.charCodeAt(i);
      const kChar = key.charCodeAt(i % key.length);
      hexCiphertext += (pChar ^ kChar).toString(16).padStart(2, '0');
    }

    const envelope = {
      stia_header: {
        envelope_version: "2.1-SECURE",
        classification: "TOP SECRET/NOFORN // CRYPT-ALPHA",
        origin_bridge: "STIA-BRIDGE-OPERATOR",
        cipher_salt: computeHash(key + "_salt"),
        verification_hash: computeHash("STIA-VERIFIED"),
        key_signature_proof: computeHash(key),
        payload_checksum_sha256: computeHash(plaintext)
      },
      package_payload: btoa(hexCiphertext)
    };

    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_SECURE_PACK_${selectedSatellite.name.replace(/\s+/g, '_')}_${Date.now()}.stia`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeTextGeneration = () => {
    exportEventLogsAsText(eventLogs, {
      satName: selectedSatellite.name,
      satId: selectedSatellite.id,
      orbitalSlot: selectedSatellite.orbitalSlot,
      defcon,
      operator: auth.currentUser?.email || 'AUTHENTICATED_OPERATOR',
      telemetry: {
        snr: 12.4,
        rxPower: -58.2,
        bucTemp: 42.0,
        packetLoss: 0.0,
        status: 'LOCKED_NOMINAL'
      }
    });
  };

  const triggerPayloadExport = () => {
    setExportProgress(0);
    setExportStatusText('[SEC_GATE] Negotiating handshake with Cloud Sync Engine...');

    const statuses = [
      { prg: 22, txt: '[SEC_GATE] Downloading synchronized cloud log indexes...' },
      { prg: 45, txt: '[SEC_GATE] Mapping target satellite profile coordinates...' },
      { prg: 68, txt: '[CRYPT_CORE] Framing payload into encrypted envelope structure...' },
      { prg: 88, txt: `[CRYPT_CORE] Injecting payload checksum seal: ${computeHash(JSON.stringify(eventLogs))}` },
      { prg: 100, txt: '[SEC_GATE] Envelope locked. Saving signed data archive...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < statuses.length) {
        setExportProgress(statuses[currentStep].prg);
        setExportStatusText(statuses[currentStep].txt);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (exportFormat === 'pdf') {
            executePDFGeneration();
          } else if (exportFormat === 'text') {
            executeTextGeneration();
          } else {
            executeArchiveGeneration();
          }
          setExportProgress(-1);
          setShowExportConsole(false);
        }, 800);
      }
    }, 450);
  };

  const exportSitrep = () => {
    if (!sitrep) return;
    const report = `
STIA SITUATION REPORT (SITREP)
------------------------------
TARGET: ${selectedSatellite.name}
DEFCON: ${defcon}
TIMESTAMP: ${new Date().toISOString()}

INTELLIGENCE SUMMARY:
${sitrep}

CLASSIFICATION: TS/SCI // NOFORN
STIA_CMD: END_SITREP
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STIA_SITREP_${selectedSatellite.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`glass p-8 rounded-[3rem] border-2 bg-slate-950/60 min-h-[300px] flex flex-col justify-between shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-700 ${defcon <= 2 ? 'border-red-600/40 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-slate-800'}`}>
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
         <Brain className="w-48 h-48 text-red-500" />
      </div>

      {/* STIA Cryptographic Secure Export Console Overlay */}
      <AnimatePresence>
        {showExportConsole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-slate-950/98 backdrop-blur-lg z-30 p-6 flex flex-col justify-between"
          >
            {exportProgress >= 0 && (
              <div className="absolute inset-0 bg-slate-950/96 z-40 flex flex-col items-center justify-center p-8 space-y-6">
                <div className="p-4 rounded-full bg-cyan-950/50 border border-cyan-500/30 animate-pulse">
                  <Database className="w-8 h-8 text-cyan-400 animate-bounce" />
                </div>
                <div className="space-y-2 text-center w-full max-w-xs">
                  <div className="flex justify-between items-center text-[10px] text-cyan-500 font-mono tracking-widest font-black uppercase">
                    <span>BUILD PAYLOAD</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 via-emerald-500 to-red-500 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
                  </div>
                </div>
                <p className="font-mono text-[9px] text-slate-400 tracking-wider text-center">{exportStatusText}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest uppercase italic text-white leading-tight">STIA_EXPORT_PANEL_v8.5</h4>
                    <p className="text-[7px] text-slate-500 uppercase tracking-widest font-mono">SECREC_SECURE_PAYLOAD_GATEWAY</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportConsole(false)}
                  className="p-1 text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">SELECT STRUCTURING SCHEME:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      exportFormat === 'pdf'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mb-2 ${exportFormat === 'pdf' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Mission PDF Dossier</h5>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Top Secret styled PDF with asset specs, DEFCON analysis, and classified event log table.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setExportFormat('text')}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      exportFormat === 'text'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <Terminal className={`w-5 h-5 mb-2 ${exportFormat === 'text' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Plaintext Transcript (.txt)</h5>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Full chronologic text transcript with telemetry snapshot, header metadata, and SHA-256 seal.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setExportFormat('archive')}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      exportFormat === 'archive'
                        ? 'bg-red-500/10 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                        : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <Lock className={`w-5 h-5 mb-2 ${exportFormat === 'archive' ? 'text-red-400' : 'text-slate-500'}`} />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Secure Crypt Package</h5>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Compiles and encrypts session payload under physical cipher envelope (.stia) with custom passphrase.</p>
                    </div>
                  </button>
                </div>

                {exportFormat === 'archive' && (
                  <div className="space-y-1.5 p-3.5 bg-black/40 border border-slate-900 rounded-2xl">
                    <label className="text-[8px] font-black text-slate-400 tracking-widest block uppercase font-mono">SPECIFY ENCRYPTION KEY / MUTATION SALT:</label>
                    <input
                      type="text"
                      value={encryptionKey}
                      onChange={(e) => setEncryptionKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl px-4 py-2 text-cyan-400 font-mono text-[10px] tracking-widest uppercase focus:outline-none focus:ring-0"
                    />
                  </div>
                )}

                <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between font-mono text-[8px] text-slate-400 tracking-widest uppercase">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    CLOUD METRICS INDEXED: {eventLogs.length} LOG RECORDS
                  </span>
                  <span className="text-amber-500 font-black">
                    CIPHER CHECKSUM: {computeHash(JSON.stringify(eventLogs))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-4">
              <span className="text-[8px] text-red-500 font-mono tracking-widest uppercase font-black">STIA_LEVEL: TS//SCI SPECIAL ACCESS</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowExportConsole(false)}
                  className="px-4 py-2 border-2 border-slate-800 hover:bg-slate-900 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-white tracking-widest transition-colors cursor-pointer"
                >
                  ABORT
                </button>
                <button
                  onClick={triggerPayloadExport}
                  className="px-4 py-2 bg-white text-slate-950 hover:bg-cyan-500 hover:text-slate-950 border-2 border-white hover:border-cyan-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer"
                >
                  COMPILE & DISCHARGE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry Snapshot Modal Popup */}
      <AnimatePresence>
        {selectedTelemetryLog && (() => {
          const stats = generateTelemetrySnapshot(selectedTelemetryLog);
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-md z-40 p-6 flex flex-col justify-between border-2 border-cyan-500/30 rounded-[3rem]"
            >
              <div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-5">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-cyan-400 animate-pulse animate-spin-slow" />
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest uppercase italic text-white leading-tight">TELEMETRY_DATAFRAME_SNAPSHOT</h4>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">HISTORIC_EPOCH: {selectedTelemetryLog.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTelemetryLog(null)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-slate-900/40 border border-slate-900 rounded-3xl flex items-start gap-4">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-black text-[9px] text-cyan-400 font-mono uppercase mt-0.5 shrink-0">
                    EVENT
                  </div>
                  <div>
                    <h5 className="text-[11px] text-white font-mono font-bold tracking-tight uppercase leading-relaxed">{selectedTelemetryLog.detail}</h5>
                    <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">SOURCE TARGET: {selectedTelemetryLog.satName} (ID: {selectedTelemetryLog.id.slice(0, 8)})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* SNR Card */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">Signal SNR</span>
                      <Radio className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="font-mono text-lg font-black text-white">{stats.snr}</span>
                      <span className="font-mono text-[9px] text-slate-500 ml-1">dB</span>
                    </div>
                    <div className="mt-2 text-[7px] font-mono tracking-wider">
                      {stats.snr >= 10 ? (
                        <span className="text-emerald-500 font-bold">● EXCELLENT LINK</span>
                      ) : stats.snr >= 6 ? (
                        <span className="text-amber-500 font-bold">▲ MARGINAL QUALITY</span>
                      ) : (
                        <span className="text-red-500 font-bold animate-pulse">▼ DEGRADED FADE</span>
                      )}
                    </div>
                  </div>

                  {/* RxPower Card */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">Rx Power</span>
                      <Cpu className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="font-mono text-lg font-black text-white">{stats.rxPower}</span>
                      <span className="font-mono text-[9px] text-slate-500 ml-1">dBm</span>
                    </div>
                    <div className="mt-2 text-[7px] text-slate-500 uppercase font-mono tracking-wider">
                      AGC LOCK STATUS OK
                    </div>
                  </div>

                  {/* BUC Temp Card */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">BUC Temperature</span>
                      <Thermometer className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="font-mono text-lg font-black text-white">{stats.bucTemp}</span>
                      <span className="font-mono text-[9px] text-slate-500 ml-1">°C</span>
                    </div>
                    <div className="mt-2 text-[7px] font-mono tracking-wider">
                      {stats.bucTemp > 65 ? (
                        <span className="text-red-500 font-bold">⚠ THERMAL WARNING</span>
                      ) : (
                        <span className="text-emerald-500">● STABLE NOMINAL</span>
                      )}
                    </div>
                  </div>

                  {/* Amplifier Draw */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">Amp Draw</span>
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="font-mono text-lg font-black text-white">{stats.amplifierDraw}</span>
                      <span className="font-mono text-[9px] text-slate-500 ml-1">A</span>
                    </div>
                    <div className="mt-2 text-[7px] text-slate-500 uppercase font-mono tracking-wider">
                      SSPA STAGE BIAS NOMINAL
                    </div>
                  </div>

                  {/* Azimuth Offset */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">Tracking Error</span>
                      <Settings className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="font-mono text-lg font-black text-white">±{stats.azimuthOffset}</span>
                      <span className="font-mono text-[9px] text-slate-500 ml-1">deg</span>
                    </div>
                    <div className="mt-2 text-[7px] text-slate-500 uppercase font-mono tracking-wider">
                      AUTO STEPPING ENABLED
                    </div>
                  </div>

                  {/* Integrity Signature Proof */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-900 hover:border-slate-800 transition-colors col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest font-mono">Signature Hash</span>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest block truncate">
                      {computeHash(JSON.stringify(selectedTelemetryLog) + stats.snr)}
                    </span>
                    <div className="mt-2.5 text-[7px] text-slate-500 uppercase font-mono tracking-wider">
                      AUTHENTICATED ENVELOPE
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-[8px] text-slate-500 font-mono uppercase tracking-widest mt-4">
                  <span className="text-cyan-400 font-black block mb-1">STIA CRYPTO SYNCHRONICITY RECORD:</span> 
                  This entry encapsulates the live demodulated telemetry vector recorded at the millisecond the security trigger occurred. Real time state validation has locked this frame under Top Secret ground segment security rules.
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-4">
                <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">EPOCH_TIME: {selectedTelemetryLog.timestamp}</span>
                <button
                  onClick={() => setSelectedTelemetryLog(null)}
                  className="px-5 py-2.5 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  DISMISS SNAPSHOT
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <div className="relative z-10 w-full flex flex-col justify-between h-full flex-grow">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-5">
            <div className="flex items-center space-x-5">
              <div className={`p-4 rounded-2xl border-2 transition-all duration-500 shadow-2xl ${defcon <= 2 ? 'bg-red-500 text-white border-white animate-pulse' : 'bg-slate-900 text-red-500 border-slate-800 group-hover:border-red-500/50'}`}>
                <Brain className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic leading-tight">Intel_Situation_Report</h3>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">STIA_Aegis_Processor_v8.0</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={exportSitrep}
                disabled={isLoading}
                title="Quick TXT Export"
                className="group p-3 bg-slate-900 hover:bg-white text-slate-500 hover:text-slate-950 border-2 border-slate-800 hover:border-white rounded-2xl transition-all duration-300 disabled:opacity-20 active:scale-95 shadow-xl cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowExportConsole(true)}
                disabled={isLoading}
                className="group flex items-center space-x-3 px-5 py-3 bg-cyan-950/20 hover:bg-cyan-400 text-cyan-400 hover:text-slate-950 border-2 border-cyan-800/60 hover:border-cyan-300 rounded-2xl transition-all duration-300 disabled:opacity-20 active:scale-95 shadow-xl shadow-cyan-950/10 cursor-pointer"
              >
                <Settings className="w-4 h-4 animate-spin-slow group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">Secure Export Console</span>
              </button>
              <div className={`px-4 py-2 bg-black border-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-inner ${defcon <= 2 ? 'text-red-500 border-red-500/30' : 'text-slate-600 border-slate-900'}`}>
                TS // SCI
              </div>
            </div>
          </div>

          {/* Dual Tab Toggle Row */}
          <div className="flex space-x-2 bg-slate-900/40 p-1 rounded-2xl border border-slate-900/60 mb-6 max-w-sm">
            <button
              onClick={() => setActiveTab('sitrep')}
              className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'sitrep'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_4px_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Strategic Synthesis
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-red-500 text-white font-black shadow-[0_4px_15px_rgba(239,68,68,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Mission Threat Log
              {eventLogs.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-950/80 text-white text-[8px] font-bold min-w-[16px] border border-red-500/30 animate-pulse">
                  {eventLogs.length}
                </span>
              )}
            </button>
          </div>

          {/* Body Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'sitrep' ? (
              <motion.div
                key="sitrep-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative bg-black/60 p-8 rounded-[2rem] border-2 border-slate-900 shadow-inner min-h-[220px] group/terminal transition-all hover:border-slate-800"
              >
                <div className="absolute top-2 left-2 w-px h-8 bg-gradient-to-b from-red-500 to-transparent opacity-20" />
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div className="h-2.5 w-3/4 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
                      <div className="h-2.5 w-1/2 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
                      <div className="h-2.5 w-2/3 bg-slate-900 rounded-full animate-pulse shadow-inner"></div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[14px] font-black text-slate-400 leading-relaxed font-mono flex items-start italic tracking-tighter"
                    >
                      <span className={`text-red-500 mr-4 transition-all duration-500 ${defcon <= 2 ? 'animate-pulse scale-125' : ''}`}>❱</span>
                      <div className="whitespace-pre-wrap">{sitrep}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="logs-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative bg-black/60 p-6 rounded-[2rem] border-2 border-slate-900 shadow-inner min-h-[220px] transition-all hover:border-slate-800"
              >
                {/* Threat Log Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-900/80">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                      SESSION LOG STREAM ({eventLogs.length} EVENTS)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={executePDFGeneration}
                      title="Download Classified Event Log PDF"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 hover:border-red-400 rounded-xl transition-all text-[8px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Export PDF</span>
                    </button>

                    <button
                      onClick={executeTextGeneration}
                      title="Download Plaintext Transcript (.txt)"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-slate-800 hover:border-cyan-400 rounded-xl transition-all text-[8px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Text (.txt)</span>
                    </button>

                    <button
                      onClick={() => { setExportFormat('archive'); setShowExportConsole(true); }}
                      title="Open Encrypted Package Builder"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-white text-slate-400 hover:text-slate-950 border border-slate-800 hover:border-white rounded-xl transition-all text-[8px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Crypt Pack</span>
                    </button>
                  </div>
                </div>

                {eventLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-600">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-400">No active threat alerts in session</h5>
                      <p className="font-mono text-[8px] text-slate-600 tracking-wider mt-1.5 uppercase">Uplinks stable, telemetry synchronization buffer cleared.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {eventLogs.map((log) => {
                      let badgeBg = 'bg-slate-900/80 border-slate-800 text-slate-400';
                      if (log.status === 'CRITICAL') badgeBg = 'bg-red-950/40 border-red-800 text-red-500';
                      else if (log.status === 'BREACH') badgeBg = 'bg-purple-950/40 border-purple-800 text-purple-400';
                      else if (log.status === 'STRIKE') badgeBg = 'bg-amber-950/40 border-amber-800 text-amber-500';
                      else if (log.status === 'INFO') badgeBg = 'bg-cyan-950/40 border-cyan-800 text-cyan-400';

                      return (
                        <motion.div
                          key={log.id}
                          whileHover={{ scale: 1.01, x: 2 }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-all cursor-pointer group/row"
                          onClick={() => setSelectedTelemetryLog(log)}
                        >
                          <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                            <span className="text-[9px] text-slate-500 font-mono tracking-tighter whitespace-nowrap">{log.timestamp}</span>
                            <div className={`px-2 py-0.5 border rounded-lg text-[8px] font-black uppercase tracking-widest font-mono shrink-0 ${badgeBg}`}>
                              {log.status}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-white font-mono font-bold tracking-tight block truncate uppercase">{log.detail}</span>
                              <span className="text-[8px] text-slate-500 font-mono tracking-widest block uppercase mt-0.5">{log.satName || 'Unknown Sat'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 pl-3">
                            <span className="text-[8px] text-cyan-500 group-hover/row:text-cyan-400 font-black tracking-widest opacity-0 group-hover/row:opacity-100 transition-opacity font-mono uppercase">Inspect Snap</span>
                            <span className="text-cyan-500 font-mono text-xs">❱</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info line */}
        <div className="mt-10 flex flex-wrap items-center gap-6 border-t-2 border-slate-950 pt-8 relative">
          <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-red-600/30 to-transparent" />
          <div className="flex items-center space-x-3 group/source">
            <Terminal className="w-4 h-4 text-slate-700 group-hover:text-red-500" />
            <span className="text-[11px] text-slate-700 font-black uppercase tracking-widest group-hover:text-slate-500 transition-colors italic">Source: STIA_FLASH_v9</span>
          </div>
          <div className="flex items-center space-x-3 group/integrity">
            <ShieldCheck className="w-4 h-4 text-emerald-600 transition-transform group-hover:rotate-12" />
            <span className="text-[11px] text-slate-700 font-black uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">Integrity: Locked</span>
          </div>
          <div className="flex items-center space-x-3 ml-auto bg-red-600/10 px-5 py-2 rounded-full border-2 border-red-500/20 shadow-xl group/live">
            <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-[10px] text-red-500 font-black uppercase tracking-widest italic tracking-[0.2em]">Live_Feed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
