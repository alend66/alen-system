import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ShieldAlert, Cpu, Terminal, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectIncident } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface ProjectsSceneProps {
  onOpenProjectDetail: (project: ProjectIncident) => void;
  onOpenTerminal: () => void;
}

export const ProjectsScene: React.FC<ProjectsSceneProps> = ({
  onOpenProjectDetail,
  onOpenTerminal,
}) => {
  const { projects } = PORTFOLIO_DATA;
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);

  const currentProject = projects[activeProjectIdx];

  const handlePrev = () => {
    gtaAudio.playClick();
    setActiveProjectIdx(prev => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    gtaAudio.playClick();
    setActiveProjectIdx(prev => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const getStatusColorBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400';
      case 'DEPLOYED':
        return 'bg-cyan-500/15 border-cyan-400/40 text-cyan-400';
      case 'MONITORING':
        return 'bg-amber-500/15 border-amber-400/40 text-amber-400';
      default:
        return 'bg-slate-500/15 border-slate-400/40 text-slate-300';
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic matching Photo 5 (GTA Beach Laptop on Ocean Drive) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 pointer-events-none"
        style={{ backgroundImage: "url('/gta/gta_beach_laptop.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl text-left w-full">
        
        {/* Title & Subtitle (GTA Style - Photo 5) */}
        <div className="mb-2 sm:mb-3">
          <h2 className="gta-heading text-4xl sm:text-6xl font-black text-white tracking-wider leading-none">
            PROJECTS
          </h2>
          <span className="gta-script text-2xl sm:text-3xl text-cyan-300 block -mt-1 transform -rotate-1">
            Showcase
          </span>
        </div>

        {/* Project Selector Pills (Quick Tabs) */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5 overflow-x-auto pb-1 scrollbar-none">
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => {
                gtaAudio.playClick();
                setActiveProjectIdx(idx);
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap border ${
                idx === activeProjectIdx
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-black/60 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              0{idx + 1} // {proj.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Interactive Tactical Card */}
        <div className="gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl relative overflow-hidden">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400 tracking-wider block font-bold">
                {currentProject.incidentNumber}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-sans text-white tracking-wide">
                {currentProject.title}
              </h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border uppercase tracking-wider ${getStatusColorBadge(currentProject.status)}`}>
              {currentProject.status}
            </span>
          </div>

          {/* Technology pill */}
          <div className="mb-2 text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">STACK:</span>
            <span className="text-emerald-400 font-semibold">{currentProject.technology}</span>
          </div>

          {/* Problem & Approach */}
          <div className="space-y-1.5 mb-2.5 text-xs sm:text-sm text-slate-300">
            <p className="bg-black/40 p-2 sm:p-2.5 rounded-lg border border-white/5 leading-relaxed">
              <strong className="text-slate-200 block text-[10px] font-mono text-cyan-400 uppercase mb-0.5">Problem Statement:</strong>
              {currentProject.problem}
            </p>
            <p className="bg-black/40 p-2 sm:p-2.5 rounded-lg border border-white/5 leading-relaxed">
              <strong className="text-slate-200 block text-[10px] font-mono text-emerald-400 uppercase mb-0.5">Defensive Approach:</strong>
              {currentProject.approach}
            </p>
          </div>

          {/* Key tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {currentProject.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-300">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Row & Carousel Navigation Arrows */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  gtaAudio.playMissionSuccess();
                  onOpenProjectDetail(currentProject);
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>VIEW INCIDENT DOSSIER</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  gtaAudio.playClick();
                  onOpenTerminal();
                }}
                onMouseEnter={() => gtaAudio.playHover()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>CLI LOG</span>
              </button>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                onMouseEnter={() => gtaAudio.playHover()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:bg-cyan-300 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Previous Project"
                aria-label="Previous Project"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNext}
                onMouseEnter={() => gtaAudio.playHover()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:bg-cyan-300 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Next Project"
                aria-label="Next Project"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
