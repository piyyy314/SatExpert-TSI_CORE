import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Search, 
  Terminal, 
  ShieldCheck, 
  Code, 
  AlertCircle, 
  Activity,
  Server,
  Key,
  Layers,
  ChevronRight,
  Clipboard,
  CheckCircle2,
  Download,
  Wrench,
  Globe
} from 'lucide-react';

interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  affected: string;
  remediation: string;
}

const PALANTIR_CVES: Vulnerability[] = [
  {
    id: '1',
    cve: 'CVE-2022-27891',
    title: 'Session Info Leak',
    severity: 'MEDIUM',
    description: 'Improper access control allows authenticated users to expose session usernames through internal metadata endpoints.',
    affected: 'Foundry / Gotham v2.x',
    remediation: 'Update to v3.0+ or apply patch P-8821.'
  },
  {
    id: '2',
    cve: 'CVE-2023-XXXX1',
    title: 'Path Traversal',
    severity: 'HIGH',
    description: 'Maliciously crafted requests to the ontology export service could leak sensitive configuration files from the backend.',
    affected: 'Palantir Apollo (Legacy)',
    remediation: 'Enforce strict URI normalization at the reverse proxy layer.'
  },
  {
    id: '3',
    cve: 'MISCONFIG-Z-01',
    title: 'Insecure RBAC Labels',
    severity: 'MEDIUM',
    description: 'Default granular labels on some foundry datasets allow unintended lateral data movement between organizations.',
    affected: 'Foundry SaaS Deployments',
    remediation: 'Review and audit all multi-tenant labels using the AIP auditor.'
  },
  {
    id: '4',
    cve: 'CVE-2024-YZ9A',
    title: 'AIP LLM Prompt Injection',
    severity: 'CRITICAL',
    description: 'AIP Copilot is vulnerable to crafted input that allows raw data plane execution without proper ontology masking.',
    affected: 'AIP Core Services v1.2',
    remediation: 'Enforce Semantic Firewalls'
  }
];

const CODE_SNIPPETS = {
  api_fuzz: `import requests

# Palantir API Fuzzing Script (Conceptual)
def test_ontology_endpoint(base_url, token):
    headers = {"Authorization": f"Bearer {token}"}
    payloads = ["../../etc/passwd", "' OR 1=1 --", "<script>alert(1)</script>"]
    
    for p in payloads:
        r = requests.get(f"{base_url}/api/v1/ontology/objectTypes/{p}", headers=headers)
        if r.status_code == 200:
            print(f"[!] Potential vulnerability with payload: {p}")
`,
  session_audit: `# Session analysis for CVE-2022-27891
curl -X GET "https://palantir.internal/api/session/metadata" \\
     -H "X-Palantir-Auth: <USER_TOKEN>" | jq .session_owners
`,
  semantic_firewall: `# Apply semantic firewall rules
from aip_core import OntologyMasking

def apply_mask(prompt_context):
    mask = OntologyMasking.load_policy('strict')
    return mask.sanitize(prompt_context)
`
};

export const PalantirAuditSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'scripts' | 'ontology' | 'topology' | 'threat_intel'>('vulnerabilities');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [remediated, setRemediated] = useState<string[]>([]);
  
  const [showAIPAuditor, setShowAIPAuditor] = useState(false);
  const [aipLabels, setAipLabels] = useState([
    { id: 1, dataset: 'comms_intercepts_raw', tenant: 'tenant_omega', label: 'GLOBAL_READ', safe: false },
    { id: 2, dataset: 'drone_telemetry', tenant: 'tenant_delta', label: 'CROSS_TENANT_SHARE', safe: false },
    { id: 3, dataset: 'financial_tx_log', tenant: 'tenant_alpha', label: 'RESTRICTED', safe: true },
  ]);

  const [showSessionAuditor, setShowSessionAuditor] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: '1',  owner: 'sysadmin', tokenPrefix: 'pt_live_9f8a', ip: '10.0.4.15', risk: 'HIGH', safe: false },
    { id: '2',  owner: 'analyst_03', tokenPrefix: 'pt_live_2b4c', ip: '192.168.1.112', risk: 'MEDIUM', safe: false },
    { id: '3',  owner: 'svc_c2_bridge', tokenPrefix: 'pt_live_xx99', ip: '10.0.1.5', risk: 'LOW', safe: true },
  ]);

  const [showApiAuditor, setShowApiAuditor] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState([
    { id: '1', route: '/api/v1/ontology/objectTypes/{id}', validation: 'None', status: 'VULNERABLE', safe: false },
    { id: '2', route: '/api/v1/auth/session', validation: 'Strict URI', status: 'SECURE', safe: true },
    { id: '3', route: '/api/v2/stream/telemetry', validation: 'Regex whitelist', status: 'SECURE', safe: true },
  ]);

  const [activeNodes, setActiveNodes] = useState<{id: string, x: number, y: number, connectedTo: string[], status: 'SECURE' | 'AT_RISK' | 'BREACHED'}[]>([]);

  useEffect(() => {
     if (activeTab === 'topology' && activeNodes.length === 0) {
        // Generate mock topology
        const nodes = Array.from({length: 12}).map((_, i) => ({
           id: `NODE_0x${(i+1).toString(16).toUpperCase()}`,
           x: 20 + Math.random() * 60,
           y: 20 + Math.random() * 60,
           connectedTo: [ `NODE_0x${Math.ceil((i > 0 ? i : 1) * Math.random()).toString(16).toUpperCase()}` ],
           status: Math.random() > 0.8 ? 'BREACHED' : Math.random() > 0.5 ? 'AT_RISK' : 'SECURE' as any
        }));
        setActiveNodes(nodes);
     }
  }, [activeTab]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLog(['[INIT] Starting Palantir Audit Suite...', '[CONN] Connecting to Foundry Metadata API...']);
  };

  const handleRemediate = (vulnId: string, remediationDetail: string) => {
    if (vulnId === '4') {
        setScanLog(prev => [
            ...prev,
            `[ACTION] Initiating Semantic Firewall Enforcement for AIP...`,
            `[SYS] Loading guardrails for LLM prompts to prevent ontology bleeding.`,
            `[COMP] Semantic Firewalls verified. Payload injection mitigated.`
        ]);
        setRemediated(prev => [...prev, vulnId]);
        return;
    }
    if (vulnId === '3') {
      setShowAIPAuditor(true);
      return;
    }
    if (vulnId === '1') {
      setShowSessionAuditor(true);
      return;
    }
    if (vulnId === '2') {
      setShowApiAuditor(true);
      return;
    }
    
    setScanLog(prev => [
      ...prev, 
      `[ACTION] Applying remediation for ${vulnId}...`,
      `[SYS] ${remediationDetail}...`,
      `[COMP] Remediation applied successfully for ${vulnId}.`
    ]);
    setRemediated(prev => [...prev, vulnId]);
  };

  const fixAipLabel = (id: number) => {
     setAipLabels(prev => prev.map(l => l.id === id ? { ...l, label: 'RESTRICTED', safe: true } : l));
     setScanLog(prev => [...prev, `[AUDIT] Remediated label for dataset ID ${id}.`]);
  };

  const completeAipReview = () => {
    const allSafe = aipLabels.every(l => l.safe);
    if (allSafe) {
        setScanLog(prev => [...prev, '[COMP] AIP Audit complete. All labels secured.']);
        setRemediated(prev => [...prev, '3']);
    } else {
        setScanLog(prev => [...prev, '[WARN] AIP Audit closed with insecure labels remaining.']);
    }
    setShowAIPAuditor(false);
  };

  const revokeSession = (id: string) => {
    setActiveSessions(prev => prev.map(s => s.id === id ? { ...s, safe: true, risk: 'REVOKED' } : s));
    setScanLog(prev => [...prev, `[AUDIT] Revoked suspicious session token for ID ${id}.`]);
  };

  const completeSessionAudit = () => {
    const allSafe = activeSessions.every(s => s.safe);
    if (allSafe) {
        setScanLog(prev => [...prev, '[COMP] Session Audit complete. All tokens secured.']);
        setRemediated(prev => [...prev, '1']);
    } else {
        setScanLog(prev => [...prev, '[WARN] Session Audit closed with open sessions remaining.']);
    }
    setShowSessionAuditor(false);
  };

  const applyWafRule = (id: string) => {
    setApiEndpoints(prev => prev.map(e => e.id === id ? { ...e, validation: 'Strict URI normalization', status: 'SECURED', safe: true } : e));
    setScanLog(prev => [...prev, `[AUDIT] Applied strict URI routing rule for proxy endpoint ID ${id}.`]);
  };

  const completeApiAudit = () => {
    const allSafe = apiEndpoints.every(e => e.safe);
    if (allSafe) {
        setScanLog(prev => [...prev, '[COMP] API Audit complete. Proxy validation enforced.']);
        setRemediated(prev => [...prev, '2']);
    } else {
        setScanLog(prev => [...prev, '[WARN] API Audit closed with insecure proxy rules remaining.']);
    }
    setShowApiAuditor(false);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanLog(prev => [...prev, '[COMP] Full audit complete. 3 findings recorded.']);
          return 100;
        }
        const next = p + Math.random() * 5;
        if (next > 20 && p <= 20) setScanLog(prev => [...prev, '[SCAN] Checking CVE-2022-27891...']);
        if (next > 50 && p <= 50) setScanLog(prev => [...prev, '[SCAN] Auditing Ontology Access Labels...']);
        if (next > 80 && p <= 80) setScanLog(prev => [...prev, '[SCAN] Analyzing API Endpoint Hardening...']);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isScanning]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportAuditLog = () => {
    if (scanLog.length === 0) return;
    const report = `
PALANTIR AUDIT REPORT
---------------------------------
TIMESTAMP: ${new Date().toISOString()}

LOGS:
${scanLog.join('\n')}

VULNERABILITIES (if complete):
${scanProgress >= 100 ? PALANTIR_CVES.map(v => `[${v.severity}] ${v.cve}: ${v.title}\n  Affected: ${v.affected}\n  Remediation: ${v.remediation}\n  Status: ${remediated.includes(v.id) ? 'REMEDIATED' : 'OPEN'}`).join('\n\n') : 'Scan incomplete.'}
    `.trim();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palantir_audit_report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Database className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Palantir <span className="text-cyan-500">Audit Suite</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              Foundry / Gotham Security Intelligence Toolset // Version 3.0.0
            </p>
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2">
          {['vulnerabilities', 'scripts', 'ontology', 'topology', 'threat_intel'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Control Panel */}
        <div className="space-y-6 lg:col-span-1">

        {/* Session Auditor Modal */}
        <AnimatePresence>
            {showSessionAuditor && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl"
                 >
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-cyan-400">
                          <Terminal className="w-5 h-5" />
                          <h3 className="text-sm font-black uppercase tracking-widest">Session Vulnerability Audit</h3>
                       </div>
                       <button onClick={completeSessionAudit} className="text-slate-500 hover:text-white transition-colors">
                           <span className="sr-only">Close</span>
                           <ShieldCheck className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-xs text-slate-400 font-bold mb-4">
                            CVE-2022-27891: Analyze and revoke leaked session tokens to prevent active unauthorized access.
                        </div>
                        <div className="space-y-3">
                           {activeSessions.map(session => (
                               <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                   <div className="space-y-1 mb-3 sm:mb-0">
                                       <div className="flex items-center space-x-2">
                                           <Server className="w-3 h-3 text-slate-500" />
                                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{session.owner}</span>
                                       </div>
                                       <div className="text-[9px] font-mono text-slate-500">IP: {session.ip} | Token: {session.tokenPrefix}***</div>
                                   </div>
                                   <div className="flex items-center space-x-4 w-full sm:w-auto">
                                       <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${session.safe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                           {session.risk}
                                       </span>
                                       {!session.safe ? (
                                           <button onClick={() => revokeSession(session.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg transition-colors text-[9px] font-black w-full sm:w-auto">
                                               Revoke Session
                                           </button>
                                       ) : (
                                           <span className="w-20 sm:w-auto text-center sm:text-right text-[10px] text-emerald-500 font-black flex items-center justify-center space-x-1"><CheckCircle2 className="w-3 h-3"/> <span>OK</span></span>
                                       )}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                        <button onClick={completeSessionAudit} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                            Complete Audit
                        </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* API Fuzzer / Reverse Proxy WAF Modal */}
        <AnimatePresence>
            {showApiAuditor && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl"
                 >
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-amber-400">
                          <Code className="w-5 h-5" />
                          <h3 className="text-sm font-black uppercase tracking-widest">API Proxy WAF Auditor</h3>
                       </div>
                       <button onClick={completeApiAudit} className="text-slate-500 hover:text-white transition-colors">
                           <span className="sr-only">Close</span>
                           <ShieldCheck className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-xs text-slate-400 font-bold mb-4">
                            CVE-2023-4552: Identify and secure vulnerable endpoints by enforcing strict URI normalization proxy rules.
                        </div>
                        <div className="space-y-3">
                           {apiEndpoints.map(endpoint => (
                               <div key={endpoint.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                   <div className="space-y-1 mb-3 sm:mb-0">
                                       <div className="flex items-center space-x-2">
                                           <Globe className="w-3 h-3 text-slate-500" />
                                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{endpoint.route}</span>
                                       </div>
                                       <div className="text-[9px] font-mono text-slate-500">Validation: {endpoint.validation}</div>
                                   </div>
                                   <div className="flex items-center space-x-4 w-full sm:w-auto">
                                       <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${endpoint.safe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                           {endpoint.status}
                                       </span>
                                       {!endpoint.safe ? (
                                           <button onClick={() => applyWafRule(endpoint.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg transition-colors text-[9px] font-black w-full sm:w-auto">
                                               Apply WAF Rule
                                           </button>
                                       ) : (
                                           <span className="w-20 sm:w-auto text-center sm:text-right text-[10px] text-emerald-500 font-black flex items-center justify-center space-x-1"><CheckCircle2 className="w-3 h-3"/> <span>OK</span></span>
                                       )}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                        <button onClick={completeApiAudit} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                            Complete Audit
                        </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* AIP Auditor Modal */}
        <AnimatePresence>
            {showAIPAuditor && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl"
                 >
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-cyan-400">
                          <Layers className="w-5 h-5" />
                          <h3 className="text-sm font-black uppercase tracking-widest">AIP Label Auditor</h3>
                       </div>
                       <button onClick={completeAipReview} className="text-slate-500 hover:text-white transition-colors">
                           <span className="sr-only">Close</span>
                           <ShieldCheck className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-xs text-slate-400 font-bold mb-4">
                            Review cross-tenant dataset labels for potential data leakage. Apply strict RESTRICTED labels where applicable.
                        </div>
                        <div className="space-y-3">
                           {aipLabels.map(label => (
                               <div key={label.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                   <div className="space-y-1 mb-3 sm:mb-0">
                                       <div className="flex items-center space-x-2">
                                           <Database className="w-3 h-3 text-slate-500" />
                                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label.dataset}</span>
                                       </div>
                                       <div className="text-[9px] font-mono text-slate-500">Tenant: {label.tenant}</div>
                                   </div>
                                   <div className="flex items-center space-x-4 w-full sm:w-auto">
                                       <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${label.safe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                           {label.label}
                                       </span>
                                       {!label.safe ? (
                                           <button onClick={() => fixAipLabel(label.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg transition-colors text-[9px] font-black w-full sm:w-auto">
                                               Secure Label
                                           </button>
                                       ) : (
                                           <span className="w-20 sm:w-auto text-center sm:text-right text-[10px] text-emerald-500 font-black flex items-center justify-center space-x-1"><CheckCircle2 className="w-3 h-3"/> <span>OK</span></span>
                                       )}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                        <button onClick={completeAipReview} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                            Complete Audit
                        </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
          <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                <Activity className="w-3 h-3 mr-2" /> Scanner Status
              </h3>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400">Progress</span>
                  <span className="text-[10px] font-mono text-cyan-400">{Math.floor(scanProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500" 
                    animate={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={startScan}
              disabled={isScanning}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center space-x-3 ${
                isScanning ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.2)]'
              }`}
            >
              {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isScanning ? 'Scanning...' : 'Start Audit'}</span>
            </button>

            <AnimatePresence>
               {scanLog.length > 0 && !isScanning && (
                 <motion.button
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   onClick={exportAuditLog}
                   className="w-full py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-cyan-500 border border-slate-700"
                 >
                   <Download className="w-3 h-3" />
                   <span>Export Report</span>
                 </motion.button>
               )}
            </AnimatePresence>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Logs</h3>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 h-48 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1 custom-scrollbar">
                {scanLog.map((log, i) => (
                  <div key={i} className="flex space-x-2">
                    <span className="text-cyan-800">[{new Date().toLocaleTimeString()}]</span>
                    <span className={(log || '').includes('[COMP]') ? 'text-emerald-500' : ''}>{log}</span>
                  </div>
                ))}
                {scanLog.length === 0 && <p className="italic opacity-50">Awaiting user input...</p>}
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 space-y-4">
             <div className="flex items-center space-x-3 text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Compliance Advisory</h4>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                Deployments involving <span className="text-white">AIP</span> (AI Platform) must undergo monthly ontology integrity scans to prevent semantic injections.
             </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'vulnerabilities' && (
              <motion.div
                key="vulns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {PALANTIR_CVES.map((vuln) => {
                  const isRemediated = remediated.includes(vuln.id);
                  return (
                  <div key={vuln.id} className={`glass group p-6 rounded-[32px] border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all flex items-start space-x-6 relative overflow-hidden ${isRemediated ? 'opacity-70 border-emerald-500/30' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      isRemediated ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      vuln.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      vuln.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                    }`}>
                      {isRemediated ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      <span className="block text-[8px] font-black text-center mt-1">{isRemediated ? 'SECURE' : vuln.severity}</span>
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className={`text-lg font-black uppercase italic tracking-tighter ${isRemediated ? 'text-emerald-400' : 'text-white'}`}>{vuln.title}</h4>
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-mono text-slate-400">{vuln.cve}</span>
                          {isRemediated && <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-black text-emerald-400 uppercase">Patched</span>}
                        </div>
                        <div className="flex items-center space-x-2 text-[9px] font-black text-slate-500 uppercase">
                          <Server className="w-3 h-3" />
                          <span className={isRemediated && vuln.id === '1' ? 'line-through opacity-50' : ''}>{vuln.affected}</span>
                          {isRemediated && vuln.id === '1' && <span className="text-emerald-400 ml-1">v3.0.1</span>}
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {vuln.description}
                      </p>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-800/50">
                        <div className="flex items-center space-x-2">
                           <ShieldCheck className={`w-3 h-3 ${isRemediated ? 'text-emerald-500' : 'text-slate-500'}`} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Remediation:</span>
                           <span className={`text-[10px] font-bold ${isRemediated ? 'text-emerald-500' : 'text-cyan-400'}`}>{vuln.remediation}</span>
                        </div>
                        {!isRemediated ? (
                          <button 
                            onClick={() => handleRemediate(vuln.id, vuln.remediation)}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-500 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>{vuln.id === '3' ? 'Review Labels' : vuln.id === '1' ? 'Audit Sessions' : vuln.id === '2' ? 'Apply Proxy Rules' : 'Apply Fix'}</span>
                          </button>
                        ) : (
                          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-600">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </motion.div>
            )}

            {activeTab === 'scripts' && (
              <motion.div
                key="scripts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Terminal className="w-5 h-5 text-cyan-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Ethical Pentest Scripts</h3>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Script 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ontology_API_Fuzzer.py</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(CODE_SNIPPETS.api_fuzz, 'fuzz')}
                          className="flex items-center space-x-2 text-[9px] font-black text-slate-600 hover:text-white transition-colors"
                        >
                          {copiedCode === 'fuzz' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                          <span>{copiedCode === 'fuzz' ? 'COPIED' : 'COPY CODE'}</span>
                        </button>
                      </div>
                      <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 font-mono text-xs text-slate-300 relative overflow-hidden">
                        <pre className="custom-scrollbar overflow-x-auto whitespace-pre">
                          {CODE_SNIPPETS.api_fuzz}
                        </pre>
                      </div>
                    </div>

                    {/* Script 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session_Audit.sh</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(CODE_SNIPPETS.session_audit, 'session')}
                          className="flex items-center space-x-2 text-[9px] font-black text-slate-600 hover:text-white transition-colors"
                        >
                          {copiedCode === 'session' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                          <span>{copiedCode === 'session' ? 'COPIED' : 'COPY CODE'}</span>
                        </button>
                      </div>
                      <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 font-mono text-xs text-slate-300">
                        <pre className="custom-scrollbar overflow-x-auto whitespace-pre">
                          {CODE_SNIPPETS.session_audit}
                        </pre>
                      </div>
                    </div>

                    {/* Script 3 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-cyan-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Semantic_Firewall.py</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(CODE_SNIPPETS.semantic_firewall, 'semantic')}
                          className="flex items-center space-x-2 text-[9px] font-black text-slate-600 hover:text-white transition-colors"
                        >
                          {copiedCode === 'semantic' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                          <span>{copiedCode === 'semantic' ? 'COPIED' : 'COPY CODE'}</span>
                        </button>
                      </div>
                      <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 font-mono text-xs text-slate-300 relative overflow-hidden">
                        <pre className="custom-scrollbar overflow-x-auto whitespace-pre">
                          {CODE_SNIPPETS.semantic_firewall}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ontology' && (
              <motion.div
                key="ontology"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl w-fit">
                      <Key className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">AIP Security</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Artificial Intelligence Platform (AIP) requires strict input sanitization on LLM-prompted tool calls to prevent direct ontology manipulation.
                    </p>
                  </div>
                  <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl w-fit">
                      <Layers className="w-5 h-5 text-amber-400" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Object Type Audit</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Mapping of restricted object types against user roles. Ensure that "Hidden" properties are truly excluded from the metadata response.
                    </p>
                  </div>
                  <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl w-fit">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Zero-Trust Apollo</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Continuous delivery pipeline (Apollo) must be isolated from the data plane. Scan for orphaned deployment containers weekly.
                    </p>
                  </div>
                </div>

                <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40">
                  <div className="flex items-center space-x-3 mb-6">
                    <Database className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Integrated Intelligence Ontology</h3>
                  </div>
                  <div className="p-8 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-600 animate-pulse" />
                     </div>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Scan Required to Map Local Topology</p>
                     <button 
                        onClick={startScan} 
                        disabled={isScanning}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-mono relative overflow-hidden flex items-center justify-center ${isScanning ? 'bg-cyan-900/50 text-cyan-400 cursor-wait border border-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white border border-transparent'}`}
                     >
                        <span className="relative z-10">
                          {isScanning ? `SCAN IN PROGRESS (${Math.round(scanProgress)}%)` : 'DEEP SCAN ONTOLOGY'}
                        </span>
                        {isScanning && (
                           <div className="absolute left-0 top-0 bottom-0 bg-cyan-500/20" style={{ width: `${scanProgress}%` }} />
                        )}
                     </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'topology' && (
              <motion.div
                key="topology"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 h-full"
              >
                 <div className="glass p-6 rounded-[32px] border-slate-800 bg-slate-950/40 relative h-[600px] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 z-10 relative">
                       <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-cyan-500" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Macro-level Network Topology</h3>
                       </div>
                       <div className="flex items-center space-x-3 text-[9px] font-black uppercase text-slate-500">
                          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_#10b981]"></span> SECURE</span>
                          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shadow-[0_0_5px_#f59e0b]"></span> AT_RISK</span>
                          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-[0_0_5px_#f43f5e]"></span> BREACHED</span>
                       </div>
                    </div>
                    
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

                    <div className="flex-grow w-full h-full relative z-10 origin-center scale-90">
                       {/* Draw lines first */}
                       <svg className="absolute inset-0 w-full h-full pointer-events-none">
                           {activeNodes.map(node => node.connectedTo.map(targetId => {
                              const tgt = activeNodes.find(n => n.id === targetId);
                              if(!tgt) return null;
                              return (
                                 <line 
                                    key={`${node.id}-${tgt.id}`} 
                                    x1={`${node.x}%`} y1={`${node.y}%`} 
                                    x2={`${tgt.x}%`} y2={`${tgt.y}%`}
                                    stroke={node.status === 'BREACHED' || tgt.status === 'BREACHED' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(34, 211, 238, 0.2)'}
                                    strokeWidth="1"
                                 />
                              )
                           }))}
                       </svg>

                       {/* Nodes */}
                       {activeNodes.map((node, i) => (
                          <motion.div
                             key={node.id}
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: i * 0.05 }}
                             className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full z-20 cursor-crosshair group ${node.status === 'SECURE' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : node.status === 'AT_RISK' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse' : 'bg-rose-500 shadow-[0_0_15px_#f43f5e]'}`}
                             style={{ left: `${node.x}%`, top: `${node.y}%` }}
                          >
                             <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2 bg-slate-950/90 border border-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[120px] shadow-2xl backdrop-blur-sm z-30">
                                <div className="text-[10px] font-black text-white uppercase mb-1">{node.id}</div>
                                <div className="text-[8px] font-mono text-slate-400">STATUS: <span className={node.status === 'SECURE' ? 'text-emerald-500' : node.status === 'AT_RISK' ? 'text-amber-500' : 'text-rose-500'}>{node.status}</span></div>
                                <div className="text-[8px] font-mono text-slate-500 mt-1">CONN: {node.connectedTo.length} peer(s)</div>
                             </div>
                          </motion.div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'threat_intel' && (
              <motion.div
                key="threat_intel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                  <div className="glass p-8 rounded-[40px] border-slate-800 bg-slate-950/40 space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Active Threat Intelligence</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Ongoing Exploit Attempts</h4>
                          <div className="text-3xl font-black text-rose-500 mono">1,482</div>
                          <p className="text-[9px] text-slate-500 uppercase mt-2">Blocked in last 24h</p>
                       </div>
                       <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Zero-Day Anomalies</h4>
                          <div className="text-3xl font-black text-amber-500 mono">03</div>
                          <p className="text-[9px] text-slate-500 uppercase mt-2">Requires immediate analysis</p>
                       </div>
                    </div>

                    <div className="space-y-2 mt-8">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Latest Indicators of Compromise (IoC)</h4>
                       
                       <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <div className="flex items-center space-x-3">
                             <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                             <span className="text-[10px] font-mono text-slate-300">IPv4</span>
                          </div>
                          <span className="text-xs font-mono text-cyan-400">185.12.XXX.XXX</span>
                          <span className="text-[9px] font-black uppercase text-slate-500">C2 Server (QakBot)</span>
                       </div>
                       
                       <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <div className="flex items-center space-x-3">
                             <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                             <span className="text-[10px] font-mono text-slate-300">SHA-256</span>
                          </div>
                          <span className="text-[10px] font-mono text-rose-400 max-w-[200px] truncate">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                          <span className="text-[9px] font-black uppercase text-slate-500">Payload Config</span>
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
