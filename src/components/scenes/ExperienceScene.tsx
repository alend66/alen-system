import React, { useState } from 'react';
import { Briefcase, Shield, Server, FileText, ChevronRight } from 'lucide-react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface ExperienceSceneProps {
  onOpenResume: () => void;
}

export const ExperienceScene: React.FC<ExperienceSceneProps> = ({
  onOpenResume,
}) => {
  const { experience, education } = PORTFOLIO_DATA;
  const [activeExpIdx, setActiveExpIdx] = useState<number>(0);

  const currentExp = experience[activeExpIdx];

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic matching Photo 4 (GTA Twilight City from Penthouse Balcony) + Ambient Drift */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 animate-bg-drift pointer-events-none"
        style={{ backgroundImage: "url('/gta/gta_twilight_city.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60"></div>
      </div>

      {/* Ambient Neon Atmosphere Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl text-left w-full">
        
        {/* Title & Subtitle (GTA Style - Photo 4) */}
        <div className="mb-2 sm:mb-3">
          <h2 className="gta-heading text-4xl sm:text-6xl font-black text-white tracking-wider leading-none animate-entrance-left delay-100">
            EXPERIENCE
          </h2>
          <span className="gta-script text-2xl sm:text-3xl text-fuchsia-400 block -mt-1 transform -rotate-1 animate-entrance-left delay-200">
            Journey
          </span>
        </div>

        {/* Tactical Glass Card */}
        <div className="relative gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl space-y-3 overflow-hidden animate-entrance-up delay-300 hover:border-white/25 transition-colors duration-300">
          
          {/* Timeline Nodes Tab Selector */}
          <div className="space-y-2">
            {experience.map((exp, idx) => {
              const isCyber = exp.role.toLowerCase().includes('cyber') || exp.role.toLowerCase().includes('security');
              return (
                <button
                  key={idx}
                  onClick={() => {
                    gtaAudio.playClick();
                    setActiveExpIdx(idx);
                  }}
                  onMouseEnter={() => gtaAudio.playHover()}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${
                    idx === activeExpIdx
                      ? 'bg-fuchsia-950/40 border-fuchsia-400/60 shadow-[0_0_20px_rgba(232,121,249,0.2)]'
                      : 'bg-black/50 border-white/5 hover:border-white/20 text-slate-400 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      idx === activeExpIdx
                        ? 'bg-gradient-to-br from-fuchsia-400 to-pink-500 text-black font-bold shadow-md shadow-fuchsia-500/30'
                        : 'bg-white/10 text-slate-300 group-hover:bg-white/15'
                    }`}>
                      {isCyber ? <Shield className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-fuchsia-400 uppercase font-bold block">
                        {exp.period || (idx === 0 ? '2023 — 2024' : '2024 — PRESENT')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-sans group-hover:text-fuchsia-300 transition-colors">
                        {exp.role}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {exp.organization}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 transition-transform ${idx === activeExpIdx ? 'text-fuchsia-400 rotate-90 sm:rotate-0' : 'text-slate-600 group-hover:text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Active Experience Deep Dive */}
          {currentExp && (
            <div className="bg-black/60 p-4 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                OPERATIONAL HIGHLIGHT // {currentExp.type}
              </span>
              <p className="text-slate-200 font-sans italic text-xs leading-relaxed border-l-2 border-cyan-400 pl-2.5">
                {currentExp.highlight}
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-[11px] text-slate-300 font-mono">
                {currentExp.details.slice(0, 4).map((bullet, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-fuchsia-400">▹</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education Snippet */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-mono text-slate-400">
              <span className="text-white font-bold">{education[0].degree}</span> — {education[0].institution}
            </div>

            <button
              onClick={() => {
                gtaAudio.playClick();
                onOpenResume();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition-all ml-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>FULL CAREER RESUME</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
