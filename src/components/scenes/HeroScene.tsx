import React from 'react';
import { Terminal, FileText, ArrowRight, ShieldCheck, MapPin, Cpu, Shield, Star, Radio } from 'lucide-react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface HeroSceneProps {
  onOpenTerminal: () => void;
  onOpenResume: () => void;
  onNextScene: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  onOpenTerminal,
  onOpenResume,
  onNextScene,
}) => {
  const { personal } = PORTFOLIO_DATA;

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-12 lg:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic - Crisp 1080p GTA Vice City Art with Alen by the Supercar + Cinematic Drift */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 animate-bg-drift pointer-events-none"
        style={{ 
          backgroundImage: "url('/gta/gta_alen_hero.jpg')",
          filter: "contrast(1.05) saturate(1.1) brightness(0.95)"
        }}
      >
        {/* Directional gradient so text is readable while character on right stays vivid and crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
      </div>

      {/* Ambient Cyber Neon Floating Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Grid Container: Left Content + Right High-Clarity Portrait Badge */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        
        {/* Left: Main Content & GTA Title */}
        <div className="max-w-2xl text-left space-y-3 sm:space-y-4">
          
          {/* Title & Cursive Subtitle */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-300 mb-1.5 shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-entrance-left delay-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              VICE CITY CYBER DEFENSE // OPERATIVE 01
            </div>

            <h1 className="gta-heading text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-wider leading-none animate-entrance-left delay-200">
              {personal.name}
            </h1>
            <span className="gta-script text-3xl sm:text-4xl md:text-5xl text-fuchsia-400 block -mt-2 sm:-mt-3 transform -rotate-1 animate-entrance-left delay-300">
              Vice City Security Protocol
            </span>
          </div>

          {/* Tactical Glass Card */}
          <div className="relative gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl space-y-3 sm:space-y-4 overflow-hidden animate-entrance-up delay-300 hover:border-white/25 transition-colors duration-300">

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 hover:bg-cyan-500/25 hover:scale-105">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                {personal.careerGoal}
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 hover:bg-emerald-500/25 hover:scale-105">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Cybersecurity
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all duration-300 hover:bg-white/15">
                <MapPin className="w-3 h-3 text-slate-400" />
                {personal.location}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              {personal.professionalIdentity}
            </p>

            <blockquote className="border-l-2 border-fuchsia-400 pl-3 py-1 text-xs text-slate-300 italic font-mono bg-fuchsia-950/20 rounded-r">
              &ldquo;{personal.headlineQuote}&rdquo;
            </blockquote>

            {/* Quick Telemetry Indicators */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
              <div className="bg-black/60 p-2 rounded border border-white/10 hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 block">SYSTEM STATUS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  ONLINE
                </span>
              </div>
              <div className="bg-black/60 p-2 rounded border border-white/10 hover:border-cyan-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 block">SECURITY ENGINE</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3 animate-spin-slow" /> ACTIVE
                </span>
              </div>
              <div className="bg-black/60 p-2 rounded border border-white/10 hover:border-green-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 block">BOUNTY LEVEL</span>
                <span className="text-[#38e47b] font-bold text-glow-green">$3,000,000</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  gtaAudio.playClick();
                  onNextScene();
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className="group btn-shimmer flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>EXPLORE HEISTS & PROJECTS</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <button
                onClick={() => {
                  gtaAudio.playClick();
                  onOpenTerminal();
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-mono font-bold text-xs tracking-wide shadow-sm hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>TERMINAL CLI</span>
              </button>

              <button
                onClick={() => {
                  gtaAudio.playClick();
                  onOpenResume();
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-cyan-400/40 text-slate-200 font-mono font-medium text-xs tracking-wide transition-all transform hover:-translate-y-0.5"
              >
                <FileText className="w-4 h-4 text-slate-300" />
                <span>RESUME</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right: High-Clarity Authentic Portrait Dossier Card */}
        <div className="hidden lg:flex flex-col items-center select-none animate-entrance-right delay-300 animate-float">
          <div className="relative gta-glass-card p-4 sm:p-5 rounded-2xl border border-white/15 shadow-2xl transition-shadow duration-500 w-64 sm:w-72 text-center space-y-3 sm:space-y-3.5">
            
            {/* Top Operative Ribbon */}
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-white/10 pb-2">
              <span className="text-cyan-400">OPERATIVE ID: ADK-06</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            {/* Circular High-Clarity Photo */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              {/* Subtle Border Ring */}
              <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none"></div>

              {/* The Authentic Photo - Crystal Clear 1024x1024 */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/80 shadow-xl">
                <img
                  src="/alen-davis.jpg"
                  alt="Alen Davis K"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Identity Badge */}
              <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-slate-200 shadow-md">
                ALEN DAVIS K
              </div>
            </div>

            {/* Operative Stats */}
            <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-xs font-mono text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">CALL-SIGN:</span>
                <span className="text-white font-bold">ALEN // ROOT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SPECIALTY:</span>
                <span className="text-cyan-300 font-bold">LINUX & DEFENSE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">WANTED LEVEL:</span>
                <div className="flex items-center gap-0.5 text-yellow-400 font-bold text-sm">
                  <span className="star-glimmer-1">★</span>
                  <span className="star-glimmer-2">★</span>
                  <span className="star-glimmer-3">★</span>
                  <span className="star-glimmer-4">★</span>
                  <span className="star-glimmer-5">★</span>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <button
              onClick={() => {
                gtaAudio.playClick();
                onOpenResume();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/40 text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL DOSSIER / CV</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
