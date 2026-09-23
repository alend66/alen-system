import React, { useState } from 'react';
import { Shield, Eye, Search, Lock, Activity, Wrench, CheckCircle2, Terminal } from 'lucide-react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface ArsenalSceneProps {
  onOpenTerminal: () => void;
  onOpenTechStack: () => void;
}

export const ArsenalScene: React.FC<ArsenalSceneProps> = ({
  onOpenTerminal,
  onOpenTechStack,
}) => {
  const { howIThinkSteps } = PORTFOLIO_DATA;
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'Search': return <Search className="w-4 h-4 text-emerald-400" />;
      case 'Shield': return <Lock className="w-4 h-4 text-fuchsia-400" />;
      case 'Terminal': return <Terminal className="w-4 h-4 text-yellow-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-blue-400" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const currentStep = howIThinkSteps[selectedStep];

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic matching Photo 2 (GTA Academy HQ Building) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 pointer-events-none"
        style={{ backgroundImage: "url('/gta/gta_hq_building.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl text-left w-full">
        
        {/* Title & Subtitle (GTA Style - Photo 2) */}
        <div className="mb-2 sm:mb-3">
          <h2 className="gta-heading text-4xl sm:text-6xl font-black text-white tracking-wider leading-none">
            SECURITY ARSENAL
          </h2>
          <span className="gta-script text-2xl sm:text-3xl text-amber-300 block -mt-1 transform -rotate-1">
            Operations & Labs
          </span>
        </div>

        {/* Tactical Glass Card */}
        <div className="gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl space-y-3">
          
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Defensive cybersecurity operations, Linux systems administration, and telemetry diagnostics. Building reliable infrastructures and understanding vulnerabilities down to the root cause.
          </p>

          {/* 3 Metric Cards Matching Photo 2 */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-center hover:border-cyan-400/40 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400 block tracking-tight">
                120+
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                THREATS LOGGED
              </span>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-center hover:border-emerald-400/40 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block tracking-tight">
                25+
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                TOOLS MASTERED
              </span>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-center hover:border-fuchsia-400/40 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono text-fuchsia-400 block tracking-tight">
                50+
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                SECURITY LABS
              </span>
            </div>
          </div>

          {/* Root Cause Analysis 6-Phase Pipeline */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              HOW I THINK // 6-PHASE ROOT CAUSE METHODOLOGY
            </span>

            {/* Step Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2.5">
              {howIThinkSteps.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => {
                    gtaAudio.playClick();
                    setSelectedStep(idx);
                  }}
                  onMouseEnter={() => gtaAudio.playHover()}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                    idx === selectedStep
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-black/50 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{step.step}.</span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>

            {/* Active Step Details */}
            {currentStep && (
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStepIcon(currentStep.icon)}
                    <span className="font-bold text-white font-mono tracking-wide">
                      {currentStep.title} PROTOCOL
                    </span>
                  </div>
                  <code className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    $ {currentStep.command}
                  </code>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  {currentStep.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                gtaAudio.playClick();
                onOpenTechStack();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>INSPECT TOOLING ARSENAL</span>
            </button>

            <button
              onClick={() => {
                gtaAudio.playClick();
                onOpenTerminal();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>TERMINAL</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
