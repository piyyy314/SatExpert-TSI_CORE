import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Users, 
  ShieldAlert, 
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Activity
} from 'lucide-react';

interface CampaignTarget {
  id: string;
  email: string;
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'harvested';
  time?: string;
}

const TEMPLATES = [
  { id: 'o365', name: 'O365 Password Expiry', spoof: 'it-support@corp-login.com' },
  { id: 'gws', name: 'Google Workspace Alert', spoof: 'security@google-workspace-admin.com' },
  { id: 'hr', name: 'HR Bonus Policy 2026', spoof: 'hr-dept@internal-portal.net' },
  { id: 'vpn', name: 'Urgent: VPN Client Update', spoof: 'net-ops@vpn-gateway.io' }
];

const MOCK_TARGETS: CampaignTarget[] = [
  { id: 't1', email: 'j.smith@target.local', status: 'pending' },
  { id: 't2', email: 'director.operations@target.local', status: 'pending' },
  { id: 't3', email: 'a.jones@target.local', status: 'pending' },
  { id: 't4', email: 'finance.dept@target.local', status: 'pending' },
  { id: 't5', email: 'sysadmin@target.local', status: 'pending' }
];

export const PhishingCampaignManager: React.FC = () => {
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [targets, setTargets] = useState<CampaignTarget[]>(MOCK_TARGETS);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isRunning) {
      if (progress < 100) {
        const timer = setTimeout(() => {
          setProgress(p => Math.min(100, p + 5));
          
          setTargets(prev => prev.map(t => {
            if (t.status === 'pending' && Math.random() > 0.6) return { ...t, status: 'sent', time: new Date().toLocaleTimeString() };
            if (t.status === 'sent' && Math.random() > 0.7) return { ...t, status: 'opened', time: new Date().toLocaleTimeString() };
            if (t.status === 'opened' && Math.random() > 0.8) return { ...t, status: 'clicked', time: new Date().toLocaleTimeString() };
            if (t.status === 'clicked' && Math.random() > 0.85) return { ...t, status: 'harvested', time: new Date().toLocaleTimeString() };
            return t;
          }));

        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setIsRunning(false);
      }
    }
  }, [isRunning, progress, targets]);

  const launchCampaign = () => {
    setTargets(MOCK_TARGETS);
    setProgress(0);
    setIsRunning(true);
  };

  const downloadReport = () => {
    const reportStr = `PHISHING CAMPAIGN RESULTS\n-------------------------------\nTEMPLATE: ${TEMPLATES.find(t => t.id === template)?.name}\nSPOOF DOMAIN: ${TEMPLATES.find(t => t.id === template)?.spoof}\n\nTARGET STATUS:\n${targets.map(t => `${t.email} - ${t.status.toUpperCase()} (${t.time || 'N/A'})`).join('\n')}`;
    const blob = new Blob([reportStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phish_campaign_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-cyan-400';
      case 'opened': return 'text-yellow-400';
      case 'clicked': return 'text-orange-500';
      case 'harvested': return 'text-red-500 font-bold';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 pb-12">
      <header className="flex items-center justify-between pb-6 border-b border-red-900/50">
        <div>
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase flex items-center space-x-3">
            <Mail className="w-8 h-8 mr-2" />
            Social Engineering Toolkit
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-wider">
            Phishing Campaign Deployment & Harvesting
          </p>
        </div>
        <div className="flex space-x-4">
          <button onClick={downloadReport} className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-500 rounded uppercase tracking-widest text-[10px] font-black flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Targets
          </button>
          <button 
            onClick={launchCampaign}
            disabled={isRunning}
            className={`px-6 py-2 rounded uppercase tracking-widest text-xs font-black flex items-center transition-all ${
              isRunning ? 'bg-red-950 text-red-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            {isRunning ? 'Deploying...' : 'Fire Campaign'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Campaign Config</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Pretext Template</label>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`w-full text-left p-3 text-[10px] font-bold tracking-wider uppercase rounded border transition-all ${
                        template === t.id ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                         <span>{t.name}</span>
                         {template === t.id && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="text-[8px] text-slate-500 lowercase mt-1 tracking-normal">{t.spoof}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded space-y-2 mt-4">
                 <div className="flex items-center text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <Fingerprint className="w-4 h-4 mr-2" /> Evasion Active
                 </div>
                 <p className="text-[9px] text-slate-400 font-mono">
                   Bypassing SPF/DKIM via SMTP smuggling. DMARC alignments forged.
                 </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#050810] border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                 <Users className="w-4 h-4 mr-2" /> Target Acquisition List
               </h3>
               {isRunning && (
                 <div className="flex items-center space-x-2 text-[10px] text-cyan-500 font-mono">
                    <Activity className="w-3 h-3 animate-pulse" />
                    <span>MONITORING {progress}%</span>
                 </div>
               )}
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 mb-6 overflow-hidden">
               <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-2">
               {targets.map((target) => (
                 <div key={target.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center space-x-3">
                       <div className={`w-2 h-2 rounded-full ${
                          target.status === 'pending' ? 'bg-slate-700' :
                          target.status === 'sent' ? 'bg-cyan-500 shrink-0' :
                          target.status === 'opened' ? 'bg-yellow-500' :
                          target.status === 'clicked' ? 'bg-orange-500' :
                          'bg-red-500 animate-pulse box-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                       }`} />
                       <span className="text-[11px] font-mono text-slate-300">{target.email}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       {target.time && <span className="text-[9px] text-slate-600 font-mono">{target.time}</span>}
                       <span className={`text-[10px] uppercase font-black tracking-widest w-24 text-right ${getStatusColor(target.status)}`}>
                         {target.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-center">
               <div>
                  <div className="text-2xl font-black text-slate-300">{targets.length}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Total Targets</div>
               </div>
               <div>
                  <div className="text-2xl font-black text-cyan-400">{targets.filter(t => t.status !== 'pending').length}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Sent</div>
               </div>
               <div>
                  <div className="text-2xl font-black text-orange-500">{targets.filter(t => t.status === 'clicked' || t.status === 'harvested').length}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Clicked</div>
               </div>
               <div>
                  <div className="text-2xl font-black text-red-500">{targets.filter(t => t.status === 'harvested').length}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Credentials</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
