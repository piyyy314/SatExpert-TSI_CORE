
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BugReportEvent } from '../types.ts';

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

  (doc as any).autoTable({
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

  (doc as any).autoTable({
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

  (doc as any).autoTable({
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

  (doc as any).autoTable({
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
