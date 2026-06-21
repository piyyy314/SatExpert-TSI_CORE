
import * as React from 'react';
import { useRef } from 'react';
import { Coordinates, Satellite } from '../types';

interface Props {
  userLoc: Coordinates;
  satellite: Satellite;
  isTracking: boolean;
  isStealthMode: boolean;
  onLocChange?: (loc: Coordinates) => void;
  onTrackingChange?: (val: boolean) => void;
}

export const TacticalMap: React.FC<Props> = ({ userLoc, satellite, isTracking, isStealthMode, onLocChange, onTrackingChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Simple linear mapping for a tactical projection
  const getX = (lng: number) => ((lng + 180) / 360) * 100;
  const getY = (lat: number) => ((90 - lat) / 180) * 100;

  const userX = getX(userLoc.lng);
  const userY = getY(userLoc.lat);
  const satX = getX(satellite.longitude);
  const satY = getY(0); // Geostationary is at equator

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !onLocChange) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Inverse mapping
    const lng = (x / 100) * 360 - 180;
    const lat = 90 - (y / 100) * 180;

    // Disable tracking if user manually selects a point
    if (isTracking && onTrackingChange) {
      onTrackingChange(false);
    }

    onLocChange({ lat, lng });
  };

  const coverageColor = isStealthMode ? '#a855f7' : '#22d3ee';

  return (
    <div 
      ref={mapRef}
      onClick={handleMapClick}
      className={`glass rounded-[2.5rem] p-6 border-2 border-slate-800 bg-slate-950/50 overflow-hidden relative h-56 group cursor-crosshair hover:border-red-500/30 transition-all duration-1000 shadow-2xl ${isStealthMode ? 'border-purple-900/40 shadow-[0_0_40px_rgba(168,85,247,0.1)]' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:opacity-5 transition-opacity">
         <div className="w-16 h-16 border-t-2 border-r-2 border-red-500 rounded-tr-3xl" />
      </div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${isStealthMode ? '#6366f1' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isStealthMode ? '#6366f1' : '#1e293b'} 1px, transparent 1px)`,
          backgroundSize: '10% 10%'
        }}></div>
      </div>

      {/* Map Content */}
      <div className="relative w-full h-full pointer-events-none">
        {/* Connection Line & Heatmap */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <radialGradient id="coverageHeatmap" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={coverageColor} stopOpacity="0.3" />
              <stop offset="50%" stopColor={coverageColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={coverageColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={coverageColor} stopOpacity="0" />
              <stop offset="100%" stopColor={coverageColor} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Signal Beam Footprint (Large) */}
          <circle 
            cx={`${satX}%`} 
            cy={`${satY}%`} 
            r="40%" 
            fill="url(#coverageHeatmap)"
            className="animate-pulse"
            style={{ transition: 'cx 1s ease-in-out' }}
          />

          {/* Focal Signal Beam (Targeting Line) */}
          <path
            d={`M ${userX} ${userY} L ${satX} ${satY}`}
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth="8"
            className="opacity-20"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />

          <line 
            x1={`${userX}%`} y1={`${userY}%`} 
            x2={`${satX}%`} y2={`${satY}%`} 
            stroke={isStealthMode ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'} 
            strokeWidth={isTracking ? "1.5" : "0.5"} 
            strokeDasharray={isTracking ? "None" : "4 2"}
            filter="url(#glow)"
          />
        </svg>

        {/* Satellite Position (Target) */}
        <div 
          className="absolute w-4 h-4 -ml-2 -mt-2 transition-all duration-1000"
          style={{ left: `${satX}%`, top: `${satY}%` }}
        >
          <div className={`absolute inset-0 rounded-sm rotate-45 animate-pulse ${isStealthMode ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}></div>
          <div className={`absolute inset-1 border rounded-sm rotate-45 ${isStealthMode ? 'border-purple-500' : 'border-amber-500'}`}></div>
          <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isStealthMode ? 'text-purple-400' : 'text-amber-500'}`}>
            {satellite.orbitalSlot}
          </span>
        </div>

        {/* User Position (The Pulsing Dot) */}
        <div 
          className="absolute w-3 h-3 -ml-1.5 -mt-1.5 transition-all duration-700"
          style={{ left: `${userX}%`, top: `${userY}%` }}
        >
          {isTracking && (
            <>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isStealthMode ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>
              <div className={`absolute -inset-2 border rounded-full animate-pulse ${isStealthMode ? 'border-purple-500/30' : 'border-cyan-500/30'}`}></div>
            </>
          )}
          <div className={`absolute inset-0.5 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] border border-white/20 ${isStealthMode ? 'bg-purple-400 shadow-purple-500/80' : 'bg-cyan-400'}`}></div>
          <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase whitespace-nowrap ${isStealthMode ? 'text-purple-400' : 'text-cyan-400'}`}>
            {isTracking ? 'LIVE_FIX' : 'LOCAL_NODE'}
          </span>
        </div>
      </div>

      {/* Coordinate HUD */}
      <div className="absolute bottom-2 right-3 flex flex-col items-end pointer-events-none opacity-60">
        <span className="text-[8px] font-mono text-slate-500">USER: {userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}</span>
        <span className="text-[8px] font-mono text-slate-500">SAT: 0.0000, {satellite.longitude.toFixed(4)}</span>
      </div>
      
      <div className="absolute top-2 left-3 pointer-events-none flex items-center space-x-2">
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Global Tactical Projection</span>
        <div className="h-px w-8 bg-slate-800"></div>
        <span className={`text-[7px] font-bold uppercase ${isStealthMode ? 'text-purple-500/50' : 'text-cyan-500/50'}`}>ASSET_COVERAGE_HEATMAP</span>
      </div>
    </div>
  );
};
