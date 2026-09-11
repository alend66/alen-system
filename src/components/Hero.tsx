import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { EngineerPortrait } from './EngineerPortrait';
import { 
  Terminal, 
  FileText, 
  Shield, 
  Cpu, 
  Network, 
  MapPin, 
  ChevronDown, 
  Radio, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface HeroProps {
  onOpenResume: () => void;
  onExploreSystem: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume, onExploreSystem }) => {
  const { personal } = PORTFOLIO_DATA;

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden cyber-grid">
      {/* Cinematic Lighting Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-cyan-600/10 via-emerald-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Hero Narrative */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wider uppercase font-semibold">ALEN // SYSTEM KERNEL</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> {personal.location}
            </span>
          </div>

          {/* Headline Name */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans">
              ALEN DAVIS K
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-mono text-cyan-400">
              <span className="text-emerald-400 font-bold">&gt;</span>
              <span className="font-semibold text-slate-200">CAREER GOAL:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold">
                {personal.careerGoal}
              </span>
            </div>
          </div>

          {/* Engineer Motto Quote */}
          <blockquote className="border-l-2 border-cyan-500/60 pl-4 py-1 space-y-1">
            <p className="text-lg sm:text-xl font-mono text-slate-200 font-medium leading-snug">
              &ldquo;Building reliable systems.<br />
              <span className="text-cyan-400">Understanding how they break.</span><br />
              Making them stronger.&rdquo;
            </p>
          </blockquote>

          {/* Supporting Bio */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            {personal.professionalIdentity}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                sound.playExecute();
                onExploreSystem();
              }}
              className="px-6 py-3.5 rounded bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-mono font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <Terminal className="w-4 h-4" />
              <span>ENTER THE SYSTEM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                sound.playKeypress();
                onOpenResume();
              }}
              className="px-6 py-3.5 rounded bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 font-mono font-semibold text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center gap-2 hover:bg-slate-800/80"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>VIEW RESUME</span>
            </button>
          </div>

          {/* Quick Command Suggestion */}
          <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Try typing</span>
            <a 
              href="#terminal" 
              onClick={() => sound.playKeypress()}
              className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 hover:border-cyan-400/50"
            >
              $ help
            </a>
            <span>in the terminal below</span>
          </div>

        </div>

        {/* Right Column: Operator Command Deck (Biometric Portrait + Live Telemetry HUD) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Biometric Operator Identity Card with Animated Portrait */}
          <div className="relative rounded-2xl bg-[#0d1117]/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
            
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-5 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>OPERATOR BIOMETRIC TELEMETRY</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                ROOT AUTH
              </span>
            </div>

            <EngineerPortrait size="md" showTelemetry={true} />
          </div>

          {/* Live System Status Panel (Telemetry HUD) */}
          <div className="relative rounded-xl bg-[#0d1117]/90 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
            
            {/* Header / Telemetry Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                  TELEMETRY HUD // DIAGNOSTIC MATRIX
                </span>
              </div>
              <span className="text-[10px] text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                LIVE INTERFACE
              </span>
            </div>

            {/* Telemetry Status Grid */}
            <div className="space-y-2.5 font-mono">
              {personal.statusPanel.map((item) => {
                let badgeClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
                let indicator = 'bg-emerald-400';
                
                if (item.status === 'info') {
                  badgeClass = 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
                  indicator = 'bg-cyan-400';
                } else if (item.status === 'warning') {
                  badgeClass = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
                  indicator = 'bg-amber-400';
                }

                return (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${indicator} animate-pulse`} />
                      <span className="text-xs text-slate-400 tracking-wider">
                        {item.label}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold tracking-widest ${badgeClass}`}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* System Specs Footer inside HUD */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60">
                <div className="text-slate-500 text-[10px]">CORE ARCH</div>
                <div className="text-slate-200 font-semibold mt-0.5">POSIX / LINUX</div>
              </div>
              <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60">
                <div className="text-slate-500 text-[10px]">NET STACK</div>
                <div className="text-slate-200 font-semibold mt-0.5">TCP/IP • CIDR</div>
              </div>
              <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60">
                <div className="text-slate-500 text-[10px]">SIEM PIPELINE</div>
                <div className="text-slate-200 font-semibold mt-0.5">SPLUNK SOC</div>
              </div>
            </div>

            {/* Note to visitor */}
            <div className="mt-3 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                [ Note: Simulated operational telemetry interface ]
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Downward indicator */}
      <div className="mt-16 text-center">
        <a
          href="#terminal"
          onClick={() => sound.playKeypress()}
          className="inline-flex flex-col items-center text-slate-500 hover:text-cyan-400 transition-colors font-mono text-xs gap-1"
        >
          <span>PROCEED TO CLI</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
};