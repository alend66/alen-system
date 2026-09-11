import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { ShieldCheck, Terminal, Cpu, Sparkles } from 'lucide-react';

interface EngineerPortraitProps {
  size?: 'sm' | 'md' | 'lg';
  showTelemetry?: boolean;
}

export const EngineerPortrait: React.FC<EngineerPortraitProps> = ({ 
  size = 'lg',
  showTelemetry = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size mapping
  const sizeClasses = {
    sm: 'w-32 h-32 sm:w-40 sm:h-40',
    md: 'w-48 h-48 sm:w-56 sm:h-56',
    lg: 'w-60 h-60 sm:w-72 sm:h-72',
  }[size];

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playTone(950, 0.03, 'sine', 0.02);
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none font-mono"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Lighting Glow Behind the Portrait */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-cyan-500/25 via-emerald-500/20 to-blue-500/20 rounded-full blur-2xl pointer-events-none scale-110" />

      {/* Main Reticle Container */}
      <div className={`relative ${sizeClasses} p-3 flex items-center justify-center group cursor-crosshair`}>
        
        {/* Outer Rotating Segmented HUD Ring */}
        <svg 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ${
            isHovered ? 'animate-spin-slow scale-105' : 'animate-spin-slow'
          }`}
          viewBox="0 0 100 100"
        >
          {/* Outer dashed ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="rgba(0, 240, 255, 0.35)" 
            strokeWidth="0.75" 
            strokeDasharray="6 3 2 3"
          />
          {/* Compass / Reticle tick marks */}
          <line x1="50" y1="0" x2="50" y2="4" stroke="#00f0ff" strokeWidth="1" />
          <line x1="50" y1="96" x2="50" y2="100" stroke="#00f0ff" strokeWidth="1" />
          <line x1="0" y1="50" x2="4" y2="50" stroke="#00f0ff" strokeWidth="1" />
          <line x1="96" y1="50" x2="100" y2="50" stroke="#00f0ff" strokeWidth="1" />
        </svg>

        {/* Counter-Rotating Accent Arcs */}
        <svg 
          className={`absolute inset-0 w-full h-full pointer-events-none ${
            isHovered ? 'animate-spin-reverse-slow' : 'animate-spin-reverse-slow'
          }`}
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="rgba(0, 255, 157, 0.4)" 
            strokeWidth="1.2" 
            strokeDasharray="25 60 15 40"
          />
        </svg>

        {/* Framing HUD Corner Brackets */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Photo Container with Cyber Border */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-[#090e17] transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]">
          <img 
            src="/alen-davis.jpg" 
            alt="Alen Davis K - Linux System & Cybersecurity Engineer" 
            className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.03] transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />

          {/* Sweeping Biometric Laser Scan Beam */}
          <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff] animate-laser-scan pointer-events-none z-10" />

          {/* High-Tech Vignette & Scanline Overlay */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Top Tag */}
        {showTelemetry && (
          <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-[#090d14]/90 border border-cyan-500/50 text-[10px] text-cyan-300 shadow-md flex items-center gap-1.5 backdrop-blur-md">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>OPERATOR // ADK-01</span>
          </div>
        )}

        {/* Bottom Tag */}
        {showTelemetry && (
          <div className="absolute -bottom-3 px-2.5 py-0.5 rounded-full bg-[#090d14]/90 border border-emerald-500/50 text-[10px] text-emerald-400 shadow-md flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="font-bold">IDENTITY: VERIFIED</span>
          </div>
        )}

      </div>

      {/* Floating Micro-Telemetry on Hover */}
      {showTelemetry && (
        <div className={`mt-5 transition-all duration-300 text-center ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-0.5'}`}>
          <div className="text-xs text-white font-sans font-extrabold tracking-wide flex items-center justify-center gap-1.5">
            ALEN DAVIS K
          </div>
          <div className="text-[10px] text-cyan-400 font-mono tracking-widest mt-0.5">
            [ ROOT PRIVILEGES GRANTED ]
          </div>
        </div>
      )}
    </div>
  );
};