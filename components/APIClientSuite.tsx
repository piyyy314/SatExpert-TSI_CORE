import React, { useState } from 'react';
import { Terminal, Shield, Search, Activity, Cpu, Globe, Send, Play, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export const APIClientSuite: React.FC = () => {
  const [url, setUrl] = useState('https://api.internal.target/v1/health');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer <TOKEN>",\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "query": "status"\n}');
  const [isRequesting, setIsRequesting] = useState(false);
  const [responseLog, setResponseLog] = useState<{timestamp: string, type: 'req' | 'res' | 'sys', text: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  const [responseStatus, setResponseStatus] = useState<{code: number, time: number, size: string} | null>(null);

  const executeRequest = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setResponseStatus(null);
    setResponseLog(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), type: 'sys', text: `Init ${method} ${url}` }
    ]);

    setTimeout(() => {
      setResponseLog(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), type: 'req', text: `${method} ${url} HTTP/2.0\n${headers}` }
      ]);
    }, 400);

    // Mock response after delay
    setTimeout(() => {
      setIsRequesting(false);
      const isSuccess = Math.random() > 0.2;
      const statusCode = isSuccess ? 200 : (Math.random() > 0.5 ? 401 : 403);
      const timeMs = Math.floor(Math.random() * 800) + 40;
      
      setResponseStatus({
        code: statusCode,
        time: timeMs,
        size: `${(Math.random() * 5 + 0.1).toFixed(2)} KB`
      });

      const responseBody = isSuccess 
        ? `{\n  "status": "operational",\n  "version": "1.0.4",\n  "uptime": "92d 14h",\n  "data": []\n}` 
        : `{\n  "error": "Unauthorized access",\n  "code": "E_AUTH_FAILED"\n}`;

      setResponseLog(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), type: 'res', text: `HTTP/2.0 ${statusCode} ${isSuccess ? 'OK' : 'Error'}\nServer: nginx/1.22.1\n\n${responseBody}` }
      ]);
    }, 1200 + Math.random() * 1000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-cyan-500 font-mono flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
        <Globe className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">API Client Suite</h2>
        <span className="ml-auto text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">REST_HTTP_CURL</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
        {/* Left Column: Request Builder */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-full">
          <div className="flex space-x-2">
             <select
               className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-500 font-bold focus:outline-none focus:border-cyan-500 appearance-none outline-none w-1/3 text-center"
               value={method}
               onChange={(e) => setMethod(e.target.value as HttpMethod)}
               disabled={isRequesting}
             >
               <option value="GET">GET</option>
               <option value="POST">POST</option>
               <option value="PUT">PUT</option>
               <option value="DELETE">DELETE</option>
               <option value="PATCH">PATCH</option>
             </select>
             <input
               type="text"
               className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               disabled={isRequesting}
               placeholder="https://"
             />
          </div>

          <div className="flex space-x-2">
            <button
               onClick={() => setActiveTab('headers')}
               className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                 activeTab === 'headers' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
               }`}
            >Headers</button>
            <button
               onClick={() => setActiveTab('body')}
               className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                 activeTab === 'body' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
               }`}
            >Payload Body</button>
          </div>

          <div className="flex-grow flex flex-col bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-hidden">
             <textarea 
               className="w-full h-full bg-slate-950 text-emerald-400 text-xs font-mono outline-none resize-none custom-scrollbar p-2"
               value={activeTab === 'headers' ? headers : body}
               onChange={(e) => activeTab === 'headers' ? setHeaders(e.target.value) : setBody(e.target.value)}
               disabled={isRequesting}
               spellCheck="false"
             />
          </div>

          <button
            onClick={executeRequest}
            disabled={isRequesting}
            className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest flex justify-center items-center space-x-2 transition-all ${
              isRequesting
                ? 'bg-slate-800 text-slate-500 cursor-wait'
                : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
            }`}
          >
            {isRequesting ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isRequesting ? 'TRANSMITTING...' : 'SEND REQUEST'}</span>
          </button>
        </div>

        {/* Right Column: Terminal Emulator */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-900/50">
             <div className="flex items-center">
                <Terminal className="w-3 h-3 mr-2 text-slate-500"/>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">HTTP Terminal Emulator</span>
             </div>
             {responseStatus && (
               <div className="flex space-x-3 text-[10px] uppercase font-black tracking-widest">
                  <span className={responseStatus.code === 200 ? 'text-emerald-500' : 'text-rose-500'}>
                     Status: {responseStatus.code}
                  </span>
                  <span className="text-amber-500">Time: {responseStatus.time}ms</span>
                  <span className="text-cyan-500">Size: {responseStatus.size}</span>
               </div>
             )}
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs leading-relaxed">
            {responseLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-sm">
                 root@proxy:~# Awaiting request parameters...
              </div>
            ) : (
              <div className="space-y-4">
                 {responseLog.map((log, i) => (
                   <div key={i} className="flex flex-col">
                      <span className="text-slate-600 font-bold mb-1">[{log.timestamp}] {log.type.toUpperCase()}:</span>
                      <pre className={`whitespace-pre-wrap ml-4 ${
                         log.type === 'req' ? 'text-cyan-400 opacity-80' : 
                         log.type === 'res' ? (log.text.includes('200 OK') ? 'text-emerald-400' : 'text-rose-400') : 
                         'text-slate-400 italic'
                      }`}>
                         {log.text}
                      </pre>
                   </div>
                 ))}
                 {isRequesting && (
                    <div className="flex items-center space-x-2 text-cyan-500 ml-4">
                       <span className="w-2 h-3 bg-cyan-400 animate-ping"></span>
                       <span>Awaiting response...</span>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
