import React, { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Send, Cpu, ShieldAlert, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
      { role: 'model', content: "SYSTEM_ONLINE. I am Sentinel, your tactical AI assistant. How can I augment your operations today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
        const historyContents = messages.slice(1).map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n');
        const fullPrompt = `${historyContents}\n\n[USER]: ${userMessage}`;

        const response = await fetch('/api/gemini/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'chatWithAIAssistant',
                payload: { prompt: fullPrompt }
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        const newResponseText = data.result || "NO_RESPONSE.";
        setMessages(prev => [...prev, { role: 'model', content: newResponseText }]);

    } catch (err: any) {
        setMessages(prev => [...prev, { role: 'model', content: `CRITICAL ERROR: ${err.message}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-cyan-600 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center z-[9000] hover:scale-110 hover:bg-cyan-500 transition-all duration-300 animate-pulse group"
        >
            <Cpu className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-slate-950/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900/80 border-b border-cyan-500/30 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-[12px] font-black text-cyan-400 uppercase tracking-widest">Sentinel_AI_Link</h3>
                <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">Encrypted Neural Bridge</p>
              </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'model' && (
                  <span className="text-[9px] text-cyan-500/60 font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                     <Zap className="w-3 h-3" /> Sentinel
                  </span>
                )}
                {msg.role === 'user' && (
                  <span className="text-[9px] text-emerald-500/60 font-black tracking-widest uppercase mb-1">
                     Operator
                  </span>
                )}
                <div 
                    className={`max-w-[85%] p-3 rounded-xl border font-mono text-xs shadow-lg whitespace-pre-wrap
                        ${msg.role === 'user' 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100 rounded-tr-none' 
                        : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-50 rounded-tl-none'}
                    `}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start">
                 <span className="text-[9px] text-cyan-500/60 font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                     <Zap className="w-3 h-3" /> Sentinel
                  </span>
                 <div className="max-w-[85%] p-3 rounded-xl rounded-tl-none border bg-cyan-950/20 border-cyan-500/30 text-cyan-400 font-mono text-xs flex space-x-2 items-center">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800">
            <div className="flex bg-slate-950 border border-slate-700 focus-within:border-cyan-500 rounded-xl overflow-hidden transition-colors">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="INPUT COMMAND QUERY..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-cyan-400 font-mono text-xs placeholder:text-slate-600"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="px-4 bg-slate-900 hover:bg-cyan-900 text-cyan-500 transition-colors disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center p-2"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
