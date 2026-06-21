
import * as React from 'react';
import { useState, useEffect } from 'react';
import { LinkBudgetParams, LinkBudgetResults } from '../types';
import { calculateLinkBudget } from '../utils/geoUtils';

interface Props {
  distance: number;
  externalRainFade?: number;
  isStealthMode: boolean;
}

export const LinkBudgetCalculator: React.FC<Props> = ({ distance, externalRainFade, isStealthMode }) => {
  const [params, setParams] = useState<LinkBudgetParams>({
    uplinkFreq: 14.25, downlinkFreq: 11.75, txPower: 5, antSize: 1.2, efficiency: 65, lnbNoiseTemp: 75, rainFade: externalRainFade || 2.5
  });
  const [results, setResults] = useState<LinkBudgetResults | null>(null);

  useEffect(() => {
    const activeRainFade = isStealthMode ? 0.0 : (externalRainFade !== undefined ? externalRainFade : params.rainFade);
    setResults(calculateLinkBudget({...params, rainFade: activeRainFade}, distance));
  }, [params, distance, externalRainFade, isStealthMode]);

  const handleExport = () => {
    const data = `--- LINK BUDGET SITREP ---\n` +
      `TIMESTAMP: ${new Date().toLocaleString()}\n` +
      `STATUS: ${isStealthMode ? 'GHOST_PROTOCOL_ACTIVE' : 'NOMINAL'}\n` +
      `--------------------------\n` +
      `INPUT PARAMETERS:\n` +
      `- Frequency: ${params.uplinkFreq} GHz\n` +
      `- TX Power: ${params.txPower} dBW\n` +
      `- Antenna: ${params.antSize}m (${params.efficiency}% Eff)\n` +
      `- Path Distance: ${distance?.toLocaleString() ?? 'UNKNOWN'} km\n` +
      `- Rain Fade: ${isStealthMode ? '0.0 (Masked)' : (params.rainFade ?? 0) + ' dB'}\n` +
      `--------------------------\n` +
      `CALCULATED RESULTS:\n` +
      `- FSPL: ${results?.fspl?.toFixed(2) ?? '---'} dB\n` +
      `- Eb/No: ${results?.ebNo?.toFixed(2) ?? '---'} dB\n` +
      `- Estimated BER: ${results?.ber ?? '---'}\n` +
      `- G/T: ${results?.gt?.toFixed(2) ?? '---'} dB/K\n` +
      `--------------------------\n` +
      `STIA_TECHNICAL_ADVISORY: Link meets mission criteria.`;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LINK_BUDGET_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl border-slate-700 overflow-hidden flex flex-col md:flex-row">
      <div className="p-6 bg-slate-800 md:w-64 border-r border-slate-700 space-y-3">
        <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">RF Config</h3>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase">TX Power (dBW)</label>
          <input type="number" value={params.txPower ?? 0} onChange={e => setParams({...params, txPower: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-cyan-400" />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase">Dish Size (m)</label>
          <input type="number" value={params.antSize ?? 0} onChange={e => setParams({...params, antSize: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-cyan-400" />
        </div>
        {externalRainFade === undefined && (
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Rain Fade (dB)</label>
            <input 
              type="number" 
              value={isStealthMode ? 0.0 : (params.rainFade ?? 0)} 
              onChange={e => setParams({...params, rainFade: parseFloat(e.target.value)})} 
              disabled={isStealthMode} 
              className={`w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-cyan-400 ${isStealthMode ? 'opacity-50' : ''}`} 
            />
             {isStealthMode && <span className="block text-[7px] text-purple-400 mt-1">STEALTH_OVERRIDE: 0.0dB</span>}
          </div>
        )}
      </div>
      <div className="flex-grow p-6 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Performance Metrics</span>
           <div className="flex items-center space-x-3">
             <button 
                onClick={handleExport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[8px] font-black text-white uppercase tracking-widest transition-all"
             >
               Download_SITREP
             </button>
             {isStealthMode && (
                <span className="text-[8px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">STEALTH_PROTO_ACTIVE</span>
             )}
           </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
             <p className="text-[9px] font-bold text-slate-500 uppercase">Eb/No (Margin)</p>
             <p className={`text-2xl font-bold mono ${results && (results.ebNo ?? 0) < 5 && !isStealthMode ? 'text-red-500' : 'text-cyan-400'} ${isStealthMode ? 'text-purple-400' : ''}`}>
               {results?.ebNo?.toFixed(2) ?? '---'} dB
             </p>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
             <p className="text-[9px] font-bold text-slate-500 uppercase">BER Estimate</p>
             <p className="text-2xl font-bold mono text-white">{results?.ber ?? '---'}</p>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
             <p className="text-[9px] font-bold text-slate-500 uppercase">FSPL Loss</p>
             <p className="text-2xl font-bold mono text-slate-400">{results?.fspl?.toFixed(1) ?? '---'} dB</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Dynamic Link Summary</span>
              <span className="text-[7px] text-slate-700 mono">Ka-BAND_PROF_V4</span>
           </div>
           <p className="text-[11px] text-slate-400 leading-relaxed italic">
             Based on a distance of {distance?.toLocaleString() ?? '---'}km, the carrier EIRP is estimated at {(params.txPower + (results?.antGain || 0)).toFixed(1)} dBW. 
             {isStealthMode ? " STEALTH_PROTOCOL_ACTIVE: All link parameters nominal and masked for external detection." : (results && results.ebNo < 6 ? " CAUTION: Link is approaching rain fade threshold. Modulation fallback recommended." : " Link stability is optimal for current environmental profile.")}
           </p>
        </div>
      </div>
    </div>
  );
};
