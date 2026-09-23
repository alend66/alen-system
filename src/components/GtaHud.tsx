import React, { useState, useEffect } from 'react';
import { Radio, Volume2, VolumeX, Shield, Heart, Terminal, FileText, Menu, Compass } from 'lucide-react';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaHudProps {
  currentScene: number;
  totalScenes: number;
  sceneObjective: string;
  onSelectScene: (index: number) => void;
  onOpenTerminal: () => void;
  onOpenResume: () => void;
  onOpenPauseMenu: () => void;
}

export const GtaHud: React.FC<GtaHudProps> = ({
  currentScene,
  totalScenes,
  sceneObjective,
  onSelectScene,
  onOpenTerminal,
  onOpenResume,
  onOpenPauseMenu,
}) => {
  // Live Clock
  const [timeStr, setTimeStr] = useState<string>('16:14');
  
  // Wanted Level
  const [wantedLevel, setWantedLevel] = useState<number>(3);
  
  // Cash Counter & interactive reward
  const [cash, setCash] = useState<number>(3000000);
  const [cashBonus, setCashBonus] = useState<string | null>(null);

  // Audio / Radio
  const [isRadioOn, setIsRadioOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Countdown timer (e.g. Defcon / Zero-day target)
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 109,
    h: 18,
    m: 15,
    s: 53
  });

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: 59, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        if (prev.d > 0) return { ...prev, d: prev.d - 1, h: 23, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStarClick = (starIndex: number) => {
    const newLevel = starIndex === wantedLevel ? 0 : starIndex;
    setWantedLevel(newLevel);
    gtaAudio.playStarSound(newLevel);
  };

  const handleCashClick = () => {
    setCash(prev => prev + 50000);
    setCashBonus('+$50,000 BOUNTY');
    gtaAudio.playMissionSuccess();
    setTimeout(() => setCashBonus(null), 1800);
  };

  const handleRadioToggle = () => {
    const playing = gtaAudio.toggleRadio();
    setIsRadioOn(playing);
    gtaAudio.playClick();
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    gtaAudio.setMuted(nextMuted);
  };

  return (
    <>
      {/* ===================== TOP HUD ===================== */}
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 flex items-start justify-between pointer-events-none select-none text-slate-100">
        
        {/* Top Left: Quick Shortcuts & Audio Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => { gtaAudio.playClick(); onOpenPauseMenu(); }}
            onMouseEnter={() => gtaAudio.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider hover:bg-white/10 hover:border-cyan-400/50 transition-all text-slate-200"
            title="Press ESC or Click for Mission Menu"
          >
            <Menu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ESC — MENU</span>
          </button>

          <button
            onClick={() => { gtaAudio.playClick(); onOpenTerminal(); }}
            onMouseEnter={() => gtaAudio.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all text-emerald-400"
            title="Press ~ or Click for Linux Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">TERMINAL</span>
          </button>

          <button
            onClick={() => { gtaAudio.playClick(); onOpenResume(); }}
            onMouseEnter={() => gtaAudio.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all text-cyan-300"
            title="View Alen's Verified Resume"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">RESUME</span>
          </button>
        </div>

        {/* Top Center: Dynamic Island / Radio Station & Heist Countdown */}
        <div className="flex flex-col items-center pointer-events-auto">
          {/* Station Pill */}
          <button
            onClick={handleRadioToggle}
            onMouseEnter={() => gtaAudio.playHover()}
            className={`flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md border transition-all text-xs font-mono font-bold shadow-lg ${
              isRadioOn
                ? 'bg-fuchsia-950/80 border-fuchsia-400/60 text-fuchsia-300 shadow-fuchsia-500/20 animate-pulse'
                : 'bg-black/65 border-white/15 text-slate-300 hover:border-white/30'
            }`}
            title="Click to toggle 98.4 FM Vice City Radio"
          >
            <Radio className={`w-3.5 h-3.5 ${isRadioOn ? 'text-fuchsia-400 animate-spin' : 'text-slate-400'}`} />
            <span>98.4 FM</span>
            {isRadioOn && (
              <span className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-2 bg-fuchsia-400 animate-pulse"></span>
                <span className="w-0.5 h-3 bg-fuchsia-400 animate-pulse delay-75"></span>
                <span className="w-0.5 h-1.5 bg-fuchsia-400 animate-pulse delay-150"></span>
              </span>
            )}
          </button>

          {/* Countdown Banner */}
          <div className="mt-1 text-center font-mono">
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold block">
              DEFCON / ZERO-DAY TARGET
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wider">
              <span>{countdown.d}d</span>
              <span>:</span>
              <span>{String(countdown.h).padStart(2, '0')}h</span>
              <span>:</span>
              <span>{String(countdown.m).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="text-cyan-400">{String(countdown.s).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Top Right: Clock, Wanted Stars & Cash Counter */}
        <div className="flex flex-col items-end pointer-events-auto">
          {/* Clock & Sound Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteToggle}
              className="p-1 rounded bg-black/40 hover:bg-black/70 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-base sm:text-lg font-mono font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {timeStr}
            </span>
          </div>

          {/* Cash Balance Counter (GTA Style) */}
          <div 
            onClick={handleCashClick}
            onMouseEnter={() => gtaAudio.playHover()}
            className="cursor-pointer group flex items-baseline gap-1 mt-0.5 select-none"
            title="Click for Bug Bounty payout!"
          >
            <span className="text-lg sm:text-xl font-mono font-extrabold text-[#38e47b] drop-shadow-[0_0_8px_rgba(56,228,123,0.5)] tracking-tight">
              ${cash.toLocaleString()}
            </span>
            {cashBonus && (
              <span className="text-[11px] font-mono font-bold text-yellow-300 animate-bounce ml-1">
                {cashBonus}
              </span>
            )}
          </div>

          {/* Status Bars: Health + Armor */}
          <div className="flex items-center gap-2.5 mt-0.5 text-[11px] font-mono font-bold text-slate-300">
            <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>100</span>
            </div>
            <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
              <Shield className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span>100</span>
            </div>
          </div>

          {/* Wanted Stars (Interactive 5 Stars) */}
          <div className="flex items-center gap-1 mt-1.5" title="Click stars to alter wanted level">
            {[1, 2, 3, 4, 5].map(starNum => {
              const isActive = starNum <= wantedLevel;
              return (
                <button
                  key={starNum}
                  onClick={() => handleStarClick(starNum)}
                  onMouseEnter={() => gtaAudio.playHover()}
                  className={`text-base sm:text-lg transition-transform hover:scale-125 focus:outline-none ${
                    isActive 
                      ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] animate-pulse' 
                      : 'text-slate-600/70 hover:text-slate-400'
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

      </header>

      {/* ===================== BOTTOM HUD ===================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 flex items-end justify-between pointer-events-none select-none text-slate-100">
        
        {/* Bottom Left: GTA Radar / Minimap & Mission Objective */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {/* Radar Screen */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.15)_1px,transparent_1px)] bg-[size:12px_12px]"></div>
            
            {/* Range Rings */}
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/20"></div>
            <div className="absolute w-6 h-6 rounded-full border border-cyan-500/30"></div>
            
            {/* Radar Scanning Line */}
            <div className="gta-radar-sweep pointer-events-none"></div>

            {/* GPS Route Line */}
            <div className="absolute w-12 h-0.5 bg-fuchsia-400/70 rotate-45 transform -translate-x-1"></div>

            {/* Player Blip */}
            <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] border border-white"></div>

            {/* Compass indicator */}
            <div className="absolute top-1 left-1.5 text-[8px] font-mono text-cyan-400/80 font-bold">
              N
            </div>
            <Compass className="absolute bottom-1 right-1 w-2.5 h-2.5 text-cyan-400/40" />
          </div>

          {/* Current Objective Text (GTA Style) */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-cyan-400 uppercase">
              CURRENT OBJECTIVE
            </span>
            <span className="text-xs sm:text-sm font-sans font-bold text-white tracking-wide max-w-[200px] sm:max-w-xs drop-shadow-md">
              {sceneObjective}
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:block mt-0.5">
              Vice City Protocol • Build Different • Stay Legendary
            </span>
          </div>
        </div>

        {/* Bottom Center: Pagination Circles / Mission Selector */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
          {Array.from({ length: totalScenes }).map((_, idx) => {
            const isCurrent = idx === currentScene;
            return (
              <button
                key={idx}
                onClick={() => {
                  gtaAudio.playClick();
                  onSelectScene(idx);
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className={`transition-all duration-300 rounded-full focus:outline-none ${
                  isCurrent
                    ? 'w-7 sm:w-8 h-3.5 sm:h-4 bg-black border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    : 'w-3 sm:w-3.5 h-3 sm:h-3.5 bg-white/90 hover:bg-white hover:scale-125'
                }`}
                title={`Jump to Scene 0${idx + 1}`}
                aria-label={`Jump to Scene 0${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Bottom Right: Quote with cursive signature */}
        <div className="text-right hidden md:block pointer-events-auto">
          <p className="font-serif italic text-xs sm:text-sm text-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-[280px]">
            &ldquo;Code is my weapon. Cybersecurity is my shield.&rdquo;
          </p>
          <span className="text-base font-bold text-fuchsia-400 font-['Caveat',cursive] drop-shadow-[0_0_8px_rgba(232,121,249,0.7)] block mt-0.5">
            — Alen Davis
          </span>
        </div>

      </footer>
    </>
  );
};
