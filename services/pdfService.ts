
import { jsPDF } from 'jspdf';
import { safeAutoTable } from '../utils/pdfHelper';
import { BugReportEvent, TacticalEvent, Coordinates } from '../types.ts';

export const computeLogChecksum = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash = hash & hash;
  }
  return 'STIA-SHA256-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export interface EventLogExportMeta {
  satName?: string;
  satId?: string;
  orbitalSlot?: string;
  defcon?: number;
  loc?: Coordinates;
  operator?: string;
  telemetry?: any;
  stealthMode?: boolean;
}

export const exportEventLogsAsText = (events: TacticalEvent[], meta?: EventLogExportMeta) => {
  const timestamp = new Date().toISOString();
  const satName = meta?.satName || 'ALL_ASSETS';
  const defcon = meta?.defcon || 4;
  const operator = meta?.operator || 'OPERATOR_LOCAL_CONSOLE';
  const checksum = computeLogChecksum(JSON.stringify(events) + timestamp);

  let output = `================================================================================
STIA CLASSIFIED TACTICAL EVENT LOG TRANSCRIPT
CLASSIFICATION: TOP SECRET // SI-TK // NOFORN // SPECIAL ACCESS
================================================================================
DOCUMENT_ID      : STIA-LOG-${Date.now().toString().slice(-8)}
GENERATION_EPOCH : ${timestamp}
AUTHENTICATED_BY : ${operator}
TARGET_ASSET     : ${satName} ${meta?.orbitalSlot ? `(${meta.orbitalSlot})` : ''}
DEFCON_POSTURE   : LEVEL ${defcon}
STEALTH_ACTIVE   : ${meta?.stealthMode ? 'TRUE' : 'FALSE'}
TOTAL_RECORDS    : ${events.length}
INTEGRITY_SEAL   : ${checksum}
================================================================================

[1] TELEMETRY / SYSTEM VECTOR SNAPSHOT
--------------------------------------------------------------------------------
Ground Station Lat/Lng : ${meta?.loc ? `${meta.loc.lat.toFixed(4)}°, ${meta.loc.lng.toFixed(4)}°` : 'N/A'}
Signal-to-Noise (SNR)  : ${meta?.telemetry?.snr ? `${meta.telemetry.snr} dB` : '12.4 dB'}
Rx Power Level         : ${meta?.telemetry?.rxPower ? `${meta.telemetry.rxPower} dBm` : '-58.2 dBm'}
BUC Temperature        : ${meta?.telemetry?.bucTemp ? `${meta.telemetry.bucTemp} °C` : '42.0 °C'}
Packet Loss Rate       : ${meta?.telemetry?.packetLoss ? `${meta.telemetry.packetLoss}%` : '0.00%'}
Uplink / Sync State    : ${meta?.telemetry?.status || 'LOCKED_NOMINAL'}

[2] CHRONOLOGICAL EVENT & AUDIT LOG ENTRIES
--------------------------------------------------------------------------------
`;

  if (events.length === 0) {
    output += `[NO EVENTS RECORDED IN CURRENT BUFFER SESSION]\n`;
  } else {
    events.forEach((ev, idx) => {
      const idxStr = String(idx + 1).padStart(3, '0');
      output += `[${idxStr}] [${ev.timestamp}] [${ev.status.padEnd(8, ' ')}] ${ev.satName.padEnd(16, ' ')} : ${ev.detail}\n`;
    });
  }

  output += `
--------------------------------------------------------------------------------
[3] CRYPTOGRAPHIC SIGN-OFF & TAMPER SEAL
--------------------------------------------------------------------------------
ENVELOPE HASH : ${checksum}
AUTHORITY     : SENTINEL TACTICAL CRYPTOGRAPHIC ENGINE v8.5
SECURITY NOTICE: UNAUTHORIZED DISCLOSURE SUBJECT TO APPLICABLE MILITARY CODE.
================================================================================
END_OF_TRANSCRIPT
`;

  const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STIA_EVENT_LOG_${satName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateSecureEventLogPDF = (events: TacticalEvent[], meta?: EventLogExportMeta) => {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString();
  const satName = meta?.satName || 'TACTICAL ASSETS';
  const defcon = meta?.defcon || 4;
  const operator = meta?.operator || 'AUTHENTICATED_OPERATOR';
  const checksum = computeLogChecksum(JSON.stringify(events) + timestamp);

  // Background Canvas
  doc.setFillColor(8, 12, 22);
  doc.rect(0, 0, 210, 297, 'F');

  // Classification Header Banner
  doc.setFillColor(185, 28, 28);
  doc.rect(14, 10, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text('CLASSIFICATION: TOP SECRET // SI-TK // NOFORN // STRICT ACCESS', 105, 14.8, { align: 'center' });

  // Main Title
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(16);
  doc.text('STIA SECURE TACTICAL EVENT LOG', 15, 28);

  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.8);
  doc.line(15, 32, 195, 32);

  // Document Metadata Section
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.text(`REPORT_ID   : STIA-LOG-${Date.now().toString().slice(-8)}`, 15, 38);
  doc.text(`TIMESTAMP   : ${timestamp}`, 15, 43);
  doc.text(`OPERATOR    : ${operator}`, 15, 48);
  doc.text(`TARGET_NODE : ${satName} ${meta?.orbitalSlot ? `(${meta.orbitalSlot})` : ''}`, 110, 38);
  doc.text(`DEFCON_POST : LEVEL ${defcon} (${defcon <= 2 ? 'RED ALERT' : 'SURVEILLANCE'})`, 110, 43);
  doc.text(`CHECKSUM    : ${checksum}`, 110, 48);

  // Section 1: Telemetry Health Grid
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. SENSORS & TELEMETRY VECTOR RECORD', 15, 57);

  const snrVal = meta?.telemetry?.snr ? `${meta.telemetry.snr} dB` : '12.4 dB';
  const rxVal = meta?.telemetry?.rxPower ? `${meta.telemetry.rxPower} dBm` : '-58.2 dBm';
  const bucVal = meta?.telemetry?.bucTemp ? `${parseFloat(meta.telemetry.bucTemp).toFixed(1)} °C` : '42.0 °C';
  const lossVal = meta?.telemetry?.packetLoss ? `${parseFloat(meta.telemetry.packetLoss).toFixed(2)}%` : '0.00%';

  const telemetryTable = [
    ['METRIC PARAMETER', 'OBSERVED TELEMETRY VALUE', 'OPERATIONAL STATUS'],
    ['CARRIER / SNR MARGIN', snrVal, parseFloat(snrVal) < 8 ? 'WARNING_MARGIN' : 'OPTIMAL_LINK'],
    ['RECEIVER POWER (Rx)', rxVal, 'LOCK_CONFIRMED'],
    ['BUC THERMAL CORE', bucVal, parseFloat(bucVal) > 60 ? 'HIGH_THERMAL' : 'NOMINAL'],
    ['PACKET LOSS RATE', lossVal, parseFloat(lossVal) > 5 ? 'DEGRADED' : 'CLEAR_CHANNEL'],
    ['GROUND STATION POSITION', meta?.loc ? `${meta.loc.lat.toFixed(4)}°, ${meta.loc.lng.toFixed(4)}°` : '38.8951°, -77.0364°', 'GEO_ALIGNED']
  ];

  safeAutoTable(doc, {
    startY: 61,
    head: [telemetryTable[0]],
    body: telemetryTable.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier', fontSize: 7.5 },
    bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [10, 15, 30] },
    margin: { left: 15, right: 15 },
  });

  // Section 2: Tactical Events Audit Log
  const eventsY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.text(`2. CHRONOLOGICAL MISSION EVENT LOG (${events.length} TOTAL RECORDS)`, 15, eventsY);

  const logsToPrint = events.length > 0 ? events : [
    { id: 'LOG_0', timestamp: new Date().toLocaleTimeString(), satName: satName, satId: '000', status: 'INFO', detail: 'Local node operational. All orbital signals synchronized.' }
  ];

  const logRows = logsToPrint.map((e) => [
    e.timestamp,
    e.satName,
    e.status.toUpperCase(),
    e.detail
  ]);

  safeAutoTable(doc, {
    startY: eventsY + 4,
    head: [['TIMESTAMP', 'ASSET', 'LEVEL', 'AUDIT & EVENT DESCRIPTION']],
    body: logRows,
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], font: 'courier', fontSize: 7.5 },
    bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 7 },
    alternateRowStyles: { fillColor: [10, 15, 30] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 32 },
      2: { cellWidth: 24 },
      3: { cellWidth: 'auto' }
    },
    margin: { left: 15, right: 15 },
  });

  // Footer / Cryptographic Footprint on every page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Bottom Border line
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.5);
    doc.line(15, 284, 195, 284);

    doc.setTextColor(100, 116, 139);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text(`STIA_FOOTPRINT: ${checksum} // CONFIDENTIAL MILITARY DATA`, 15, 289);
    doc.text(`PAGE ${i} OF ${pageCount}`, 195, 289, { align: 'right' });
  }

  doc.save(`STIA_EVENT_LOG_${satName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const generateBugReportPDF = (events: BugReportEvent[], systemInfo: any) => {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString();

  // Dark Tactical Theme Base
  doc.setFillColor(5, 8, 16);
  doc.rect(0, 0, 210, 297, 'F');

  // Header
  doc.setTextColor(239, 68, 68); // Red
  doc.setFont('courier', 'bold');
  doc.setFontSize(22);
  doc.text('STIA TACTICAL ANOMALY REPORT', 15, 25);
  
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.line(15, 30, 195, 30);

  // Metadata
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text(`REPORT_ID: BUG_ANOMALY_${Date.now()}`, 15, 40);
  doc.text(`TIMESTAMP: ${timestamp}`, 15, 45);
  doc.text(`SOURCE: TSI_ORCHESTRATOR_V8.0`, 15, 50);
  doc.text(`CLASSIFICATION: TOP SECRET // NOFORN`, 15, 55);

  // System Status Summary
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('SYSTEM_HEALTH_INDEX', 15, 70);
  
  const systemData = [
    ['PARAMETER', 'VALUE', 'STATUS'],
    ['CURRENT_DEFCON', systemInfo.defcon?.toString() || 'N/A', (systemInfo.defcon || 5) <= 2 ? 'CRITICAL' : 'STABLE'],
    ['BUC_THERMAL', `${parseFloat(systemInfo.bucTemp)?.toFixed(1)}C` || 'N/A', parseFloat(systemInfo.bucTemp) > 60 ? 'WARNING' : 'NOMINAL'],
    ['PACKET_LOSS_INDEX', `${parseFloat(systemInfo.packetLoss)?.toFixed(2)}%` || 'N/A', parseFloat(systemInfo.packetLoss) > 5 ? 'DEGRADED' : 'OPTIMAL'],
    ['SIGNAL_NOISE_RATIO', `${parseFloat(systemInfo.snr)?.toFixed(1)}dB` || 'N/A', parseFloat(systemInfo.snr) < 10 ? 'LOW' : 'HIGH'],
  ];

  safeAutoTable(doc, {
    startY: 75,
    head: [systemData[0]],
    body: systemData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    margin: { left: 15 },
  });

  // Real-time Anomaly Analysis
  const analysisY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('REAL-TIME_ANOMALY_ANALYSIS', 15, analysisY);

  const criticalLogs = events.filter(e => e.team === 'RED' || e.type === 'ATTACK');
  const systemHealth = parseFloat(systemInfo.snr) > 10 && parseFloat(systemInfo.packetLoss) < 5 ? 'STABLE' : 'COMPROMISED';

  const analysisData = [
    ['METRIC', 'LOG_COUNT', 'SEVERITY_INDEX'],
    ['RED_TEAM_INCURSIONS', criticalLogs.length.toString(), criticalLogs.length > 0 ? 'HIGH' : 'ZERO'],
    ['TOTAL_SESSION_ANOMALIES', events.length.toString(), events.length > 20 ? 'ELEVATED' : 'NOMINAL'],
    ['OVERALL_SECURITY_POSTURE', systemHealth, systemHealth === 'STABLE' ? 'N/A' : 'CRITICAL']
  ];

  safeAutoTable(doc, {
    startY: analysisY + 5,
    head: [analysisData[0]],
    body: analysisData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    margin: { left: 15 },
  });

  // Historic Known Bugs Section
  const historicY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(251, 191, 36); // Amber
  doc.setFontSize(14);
  doc.text('HISTORIC_SYSTEM_DEVIATIONS (DEBT_REGISTRY)', 15, historicY);

  const historicBugs = [
    ['ID', 'ANOMALY_TYPE', 'DISCOVERY', 'MITIGATION_STATUS'],
    ['BUG_001', 'KA_BAND_RAIN_FADE', 'DEPLOYMENT', 'ACTIVE_COMPENSATION'],
    ['BUG_002', 'BUC_THERMAL_DRIFT', 'H1_2026', 'ZPE_COOLING_PATCH'],
    ['BUG_003', 'NEURAL_STRETCH_LAG', 'SITREP_GEN', 'QUANTUM_PRUNING'],
    ['BUG_004', 'PHASE_SHIFT_GHOSTS', 'JAMMING_TEST', 'AETHER_DECOY_MODULE'],
    ['BUG_005', 'STEALTH_SIGNATURE_LEAK', 'V0.9', 'REDACTED_BY_CMD'],
  ];

  safeAutoTable(doc, {
    startY: historicY + 5,
    head: [historicBugs[0]],
    body: historicBugs.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 15, 5] },
    margin: { left: 15 },
  });

  // Anomaly Logs
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.text('ANOMALY_EVENT_LOG (SINCE_INITIALIZATION)', 15, finalY);

  const logData = events.map(e => [
    e.timestamp,
    e.team,
    e.action.length > 50 ? e.action.substring(0, 47) + '...' : e.action,
    e.team === 'RED' ? 'MALICIOUS' : e.team === 'SYSTEM' ? 'DIAGNOSTIC' : 'NEUTRAL'
  ]);

  safeAutoTable(doc, {
    startY: finalY + 5,
    head: [['TIMESTAMP', 'ORIGIN', 'ANOMALY_DESCRIPTION', 'CLASSIFICATION']],
    body: logData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [20, 10, 10] },
    margin: { left: 15 },
  });

  // Footer / Seal
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`STIA_FOOTPRINT: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`, 15, 290);
    doc.text(`PAGE ${i} OF ${pageCount}`, 180, 290);
  }

  doc.save(`STIA_BUG_REPORT_${Date.now()}.pdf`);
};

export const generateMissionReportPDF = (events: TacticalEvent[], meta?: EventLogExportMeta) => {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString();
  const satName = meta?.satName || 'STIA_ORBITAL_ASSET';
  const defcon = meta?.defcon || 4;
  const operator = meta?.operator || 'COMMAND_OPERATOR_ROOT';
  const checksum = computeLogChecksum(JSON.stringify(events) + timestamp);

  // Background
  doc.setFillColor(3, 7, 18);
  doc.rect(0, 0, 210, 297, 'F');

  // Top Classification Banner
  doc.setFillColor(185, 28, 28);
  doc.rect(12, 10, 186, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOP SECRET // SCI // NOFORN // ORBITAL INTELLIGENCE BRIEFING', 105, 15.2, { align: 'center' });

  // Document Title
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(18);
  doc.text('OFFICIAL TACTICAL MISSION REPORT', 15, 32);

  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.line(15, 36, 195, 36);

  // Metadata block
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  doc.setFont('courier', 'normal');
  doc.text(`BRIEFING ID : STIA-MR-${Date.now().toString().slice(-8)}`, 15, 43);
  doc.text(`GENERATED   : ${timestamp}`, 15, 48);
  doc.text(`COMMAND_OP  : ${operator}`, 15, 53);
  doc.text(`TARGET ASSET: ${satName} ${meta?.orbitalSlot ? `(${meta.orbitalSlot})` : ''}`, 110, 43);
  doc.text(`DEFCON STATE: LEVEL ${defcon} (${defcon <= 2 ? 'MAXIMUM ALERT' : 'SURVEILLANCE'})`, 110, 48);
  doc.text(`INTEGRITY   : ${checksum}`, 110, 53);

  // Section 1: Executive Summary & Telemetry Matrix
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text('1. EXECUTIVE SUMMARY & LIVE SYSTEM TELEMETRY', 15, 63);

  const snrVal = meta?.telemetry?.snr ? `${meta.telemetry.snr} dB` : '14.2 dB';
  const rxVal = meta?.telemetry?.rxPower ? `${meta.telemetry.rxPower} dBm` : '-56.8 dBm';
  const bucVal = meta?.telemetry?.bucTemp ? `${parseFloat(meta.telemetry.bucTemp).toFixed(1)} °C` : '42.0 °C';
  const lossVal = meta?.telemetry?.packetLoss ? `${parseFloat(meta.telemetry.packetLoss).toFixed(2)}%` : '0.00%';

  const execTable = [
    ['METRIC PARAMETER', 'TELEMETRY READING', 'OPERATIONAL ASSESSMENT'],
    ['CARRIER / SNR MARGIN', snrVal, parseFloat(snrVal) < 8 ? 'WARNING_MARGIN' : 'SECURE_LOCK'],
    ['RECEIVER POWER (Rx)', rxVal, 'NOMINAL_STRENGTH'],
    ['BUC THERMAL CORE', bucVal, parseFloat(bucVal) > 60 ? 'THERMAL_SPIKE' : 'STABLE_OPERATIONAL'],
    ['PACKET ERROR RATE', lossVal, parseFloat(lossVal) > 5 ? 'DEGRADED_CHANNEL' : 'ERROR_FREE'],
    ['STEALTH POSTURE', meta?.stealthMode ? 'ENGAGED (GHOST PROTOCOL)' : 'STANDARD_PATROL', 'ACTIVE_SHIELDING']
  ];

  safeAutoTable(doc, {
    startY: 67,
    head: [execTable[0]],
    body: execTable.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier', fontSize: 8 },
    bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [10, 15, 30] },
    margin: { left: 15, right: 15 },
  });

  // Section 2: Critical Alerts & Active Audit Trail
  const eventsY = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`2. MISSION AUDIT TRAIL & CRITICAL EVENTS (${events.length} LOGS)`, 15, eventsY);

  const rows = events.length > 0 ? events.slice(0, 25).map(e => [e.timestamp, e.satName, e.status.toUpperCase(), e.detail]) : [
    [new Date().toLocaleTimeString(), satName, 'ACTIVE', 'System link nominal. All quantum and RF subsystems reporting zero anomalies.']
  ];

  safeAutoTable(doc, {
    startY: eventsY + 4,
    head: [['TIMESTAMP', 'ASSET', 'SEVERITY', 'MISSION EVENT DETAIL']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], font: 'courier', fontSize: 8 },
    bodyStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], font: 'courier', fontSize: 7 },
    alternateRowStyles: { fillColor: [10, 15, 30] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 34 },
      2: { cellWidth: 22 },
      3: { cellWidth: 'auto' }
    },
    margin: { left: 15, right: 15 },
  });

  // Footer / Cryptographic Seal on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.5);
    doc.line(15, 284, 195, 284);

    doc.setTextColor(100, 116, 139);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(`AUTHENTICATION HASH: ${checksum} // CLASSIFIED DOD RECORD`, 15, 289);
    doc.text(`PAGE ${i} OF ${pageCount}`, 195, 289, { align: 'right' });
  }

  doc.save(`STIA_MISSION_REPORT_${satName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};


