
import * as React from 'react';
import { useEffect, useRef } from 'react';

export const Orbital3D: React.FC<{ longitude: number }> = ({ longitude }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      // Draw Earth (3D sphere projection)
      const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 10, centerX, centerY, radius);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Grid lines (Longitude/Latitude)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < Math.PI; i += Math.PI / 8) {
        ctx.beginPath();
        const rx = Math.max(0.1, Math.abs(radius * Math.sin(i + frame * 0.01)));
        const ry = Math.max(0.1, Math.abs(radius));
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Satellite Orbit
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      const orbitRx = Math.max(0.1, radius * 2.5);
      const orbitRy = Math.max(0.1, radius * 0.8);
      ctx.ellipse(centerX, centerY, orbitRx, orbitRy, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Satellite position
      const satAngle = (frame * 0.02) % (Math.PI * 2);
      const satX = centerX + Math.cos(satAngle) * radius * 2.5;
      const satY = centerY + Math.sin(satAngle) * radius * 0.8;
      
      // Rotate sat position by orbit inclination
      const rotatedX = centerX + (satX - centerX) * Math.cos(Math.PI / 6) - (satY - centerY) * Math.sin(Math.PI / 6);
      const rotatedY = centerY + (satX - centerX) * Math.sin(Math.PI / 6) + (satY - centerY) * Math.cos(Math.PI / 6);

      ctx.fillStyle = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(rotatedX, rotatedY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px JetBrains Mono';
      ctx.fillText("TARGET_ASSET", rotatedX + 8, rotatedY + 4);

      requestAnimationFrame(animate);
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [longitude]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width="400" height="300" className="w-full h-auto" />
      <div className="absolute top-4 left-4">
         <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Orbital_Projection_v4</p>
         <p className="text-[8px] text-slate-500 font-bold uppercase">Real-Time TLE Propagation</p>
      </div>
    </div>
  );
};
