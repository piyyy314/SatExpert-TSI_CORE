
import * as React from 'react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, reconnectFirestore } from '../services/firebaseService';

interface LayoutProps {
  children: React.ReactNode;
  isStealthMode: boolean;
  setIsStealthMode: (val: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, isStealthMode, setIsStealthMode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Connectivity state tracking
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [reconnectSuccess, setReconnectSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setReconnectSuccess(null);
    try {
      const success = await reconnectFirestore();
      setReconnectSuccess(success);
      setTimeout(() => {
        setReconnectSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Manual reconnection error:", err);
      setReconnectSuccess(false);
    } finally {
      setIsReconnecting(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn("Authentication process was not completed:", err);
      if (err?.code === 'auth/popup-closed-by-user') {
        const msg = "Sign-in popup closed by user.";
        setAuthError(msg);
      } else if (err?.code === 'auth/popup-blocked') {
        const msg = "Sign-in popup blocked. Enable popups and try again.";
        setAuthError(msg);
      } else if (err?.code === 'auth/cancelled-popup-request') {
        const msg = "Sign-in process cancelled.";
        setAuthError(msg);
      } else {
        const msg = err?.message || "Authentication failed. Try again.";
        setAuthError(msg);
      }
      
      // Auto-clear auth error after 5 seconds
      setTimeout(() => {
        setAuthError(null);
      }, 5000);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    setInstallPrompt(null);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#030712] selection:bg-cyan-500/30 transition-colors duration-1000 ${isStealthMode ? 'stealth-active' : ''} relative`}>
      {/* Tactical Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      
      <header className={`border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-[60] transition-all duration-1000 ${isStealthMode ? 'bg-purple-950/40 border-purple-900/60 shadow-[0_4px_30px_rgba(168,85,247,0.15)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'}`}>
        <div className="max-w-7xl mx-auto px-6 h-auto min-h-[5rem] py-4 flex flex-wrap gap-4 items-center justify-between relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          </div>
          <div className="flex items-center space-x-5 group cursor-pointer">
            <div className={`w-12 h-12 bg-slate-900 border rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 ${isStealthMode ? 'border-purple-500 shadow-purple-500/20 bg-purple-950/40' : 'border-cyan-500/30 shadow-cyan-500/10 group-hover:border-cyan-500'}`}>
              <svg className={`w-7 h-7 transition-colors duration-700 ${isStealthMode ? 'text-purple-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">SatExpert <span className={isStealthMode ? 'text-purple-400' : 'text-cyan-400'}>TSI_CORE</span></h1>
              <div className="flex items-center space-x-2 mt-0.5">
                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${isStealthMode ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Link: {isStealthMode ? 'Ghost_Encrypted' : 'Operational'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Network Connectivity Status Indicator */}
            <div className="flex items-center space-x-3 bg-slate-900/50 pl-3 pr-2 py-1.5 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono font-black uppercase tracking-wider text-slate-500">Uplink</span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border transition-all duration-300 flex items-center space-x-1 cursor-pointer ${
                  isReconnecting
                    ? 'bg-slate-800 text-slate-500 border-slate-800/30 cursor-not-allowed'
                    : reconnectSuccess === true
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                    : reconnectSuccess === false
                    ? 'bg-red-950/40 text-red-500 border-red-900/50'
                    : 'bg-slate-950 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-slate-900'
                }`}
                title="Force Firestore Reconnection"
              >
                <svg className={`w-2.5 h-2.5 ${isReconnecting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isReconnecting ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  ) : reconnectSuccess === true ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  ) : reconnectSuccess === false ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                  )}
                </svg>
                <span>{isReconnecting ? 'Sync' : reconnectSuccess === true ? 'Ready' : reconnectSuccess === false ? 'Fail' : 'Reconnect'}</span>
              </button>
            </div>

            {/* Stealth Mode Toggle */}
            <div className="flex items-center space-x-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 transition-colors ${isStealthMode ? 'text-purple-400' : 'text-slate-600'}`}>Ghost_Proto</span>
              <button 
                onClick={() => setIsStealthMode(!isStealthMode)}
                className={`relative w-11 h-6 rounded-full transition-all duration-500 ${isStealthMode ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-500 transform ${isStealthMode ? 'translate-x-5' : 'translate-x-0'} shadow-md`}></div>
              </button>
            </div>

            {installPrompt && (
              <button 
                onClick={handleInstallClick} 
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-cyan-400 px-4 py-2 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Deploy</span>
              </button>
            )}

            {isStealthMode && (
              <div className="flex items-center space-x-3 bg-purple-500/20 border border-purple-400 px-5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-pulse-stealth">
                <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-purple-100 uppercase tracking-[0.2em] leading-none">Ghost_Protocol</span>
                  <span className="text-[7px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">Active_Masking</span>
                </div>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-900/60 pl-3 pr-2 py-1.5 rounded-2xl border border-slate-800">
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || "Operator"} className="w-6 h-6 rounded-full border border-cyan-500/40" referrerPolicy="no-referrer" />
                )}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap">{currentUser.displayName || 'SECURE_OP'}</span>
                  <span className="text-[7px] text-emerald-500 font-mono font-black uppercase tracking-wider animate-pulse">● CLOUD_SYNCED</span>
                </div>
                <button 
                  onClick={logOut}
                  className="ml-2 text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 bg-red-950/20 px-2.5 py-1.5 rounded-xl border border-red-900/30 transition-colors cursor-pointer"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-950/40 to-slate-950/40 hover:from-cyan-900/50 px-4 py-2.5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all uppercase tracking-widest text-[9px] font-black text-cyan-400 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                  <span>SYNC TO CLOUD (LOGIN)</span>
                </button>
                {authError && (
                  <div className="absolute top-12 left-0 right-0 mx-auto w-max max-w-[240px] text-center bg-slate-950 border border-amber-500/40 px-2.5 py-1 rounded-xl shadow-2xl z-[100] animate-pulse">
                    <p className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest leading-normal">
                      {authError}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="hidden lg:flex flex-col items-end border-l-2 border-slate-900 pl-6">
               <span className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Auth_Level</span>
               <span className={`text-[11px] mono font-black italic tracking-tighter ${isStealthMode ? 'text-purple-400' : 'text-red-500'}`}>{currentUser ? 'SECURE_ADMIN' : 'GUEST_OPERATOR'}</span>
            </div>
            
            <span className="text-[11px] bg-black border-2 border-slate-900 px-5 py-2.5 rounded-2xl text-slate-500 mono font-black shadow-inner italic">v6.0.0_SENTINEL</span>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-8 relative">
        {children}
      </main>
      
      {/* Tactical Comms Ticker */}
      <div className={`border-t h-auto min-h-[2.5rem] py-1 flex items-center overflow-hidden whitespace-nowrap z-[70] fixed bottom-0 left-0 right-0 transition-colors duration-1000 ${isStealthMode ? 'bg-black border-purple-900/50' : 'bg-slate-950 border-slate-800/50'}`}>
        <div className={`flex items-center px-6 h-10 border-r text-[9px] font-black uppercase tracking-widest shrink-0 transition-colors duration-1000 ${isStealthMode ? 'bg-purple-950/20 text-purple-400 border-purple-900/50' : 'bg-cyan-500/10 text-cyan-500 border-slate-800/50'}`}>
          {isStealthMode ? 'Ghost_Stream' : 'Mission_Stream'}
        </div>
        <div className="flex animate-marquee space-x-12 items-center">
          {[1,2,3].map(i => (
            <div key={i} className="flex space-x-12">
              <span className={`text-[10px] mono uppercase ${isStealthMode ? 'text-purple-900' : 'text-slate-500'}`}>{isStealthMode ? 'SIG_SUPPRESSION: ACTIVE' : 'SAT_LOCK: ESTABLISHED'}</span>
              <span className="text-[10px] mono text-slate-800 uppercase">|</span>
              <span className={`text-[10px] mono uppercase ${isStealthMode ? 'text-purple-900' : 'text-slate-500'}`}>{isStealthMode ? 'GEOLOC_MUD: ENABLED' : `GPS_FIX: ${new Date().toLocaleTimeString()}`}</span>
              <span className="text-[10px] mono text-slate-800 uppercase">|</span>
              <span className={`text-[10px] mono uppercase ${isStealthMode ? 'text-purple-900' : 'text-slate-500'}`}>COMMS_CHANNEL: ENCRYPTED_GHOST_PARITY</span>
              <span className="text-[10px] mono text-slate-800 uppercase">|</span>
              <span className={`text-[10px] mono uppercase ${isStealthMode ? 'text-purple-700/50' : 'text-amber-500'}`}>INTEL: {isStealthMode ? 'PASSIVE_RECON_ONLY' : 'MONITORING_LOCAL_INTERFERENCE'}</span>
              <span className="text-[10px] mono text-slate-800 uppercase">|</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-slate-800/30 py-10 px-6 text-center bg-slate-950/20 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] mb-4">Sentinel Tactical SatCom Intelligence // © 2026 SatExpert Global</p>
          <div className="flex justify-center space-x-4">
             <div className="w-2 h-0.5 bg-slate-800"></div>
             <div className={`w-2 h-0.5 transition-colors duration-700 ${isStealthMode ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>
             <div className="w-2 h-0.5 bg-slate-800"></div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes pulse-stealth {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.7; filter: brightness(1.3); }
        }
        .animate-pulse-stealth {
          animation: pulse-stealth 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};
