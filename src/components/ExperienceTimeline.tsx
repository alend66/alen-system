import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { 
  Briefcase, 
  ShieldAlert, 
  Server, 
  CheckCircle2, 
  Calendar, 
  MapPin,
  Building,
  Terminal
} from 'lucide-react';

export const ExperienceTimeline: React.FC = () => {
  const experiences = PORTFOLIO_DATA.experience;

  return (
    <section id="experience" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-14 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          OPERATIONAL LOGS // FIELD EXPERIENCE
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Professional Experience
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-xl mx-auto">
          Practical track record across physical surveillance infrastructure, network deployment, and law-enforcement cyber investigations.
        </p>
      </div>

      {/* Timeline Wrapper */}
      <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-32 space-y-12">
        {experiences.map((exp, idx) => {
          const isCyberCell = exp.organization.includes('Police');

          return (
            <div key={exp.organization} className="relative pl-6 sm:pl-10 group">
              
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#080a0f] border-2 border-cyan-400 group-hover:bg-cyan-400 group-hover:scale-125 transition-all shadow-md shadow-cyan-500/50" />

              {/* Organization Type Pill (Visible on Left on Desktop) */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right font-mono text-xs w-28">
                <span className="text-cyan-400 font-bold block">{exp.dateBadge}</span>
                <span className="text-slate-500 text-[10px] uppercase">{exp.type}</span>
              </div>

              {/* Experience Card */}
              <div className="bg-[#090d14]/90 border border-slate-800 group-hover:border-cyan-500/40 rounded-xl p-6 sm:p-7 shadow-2xl backdrop-blur-md transition-all duration-300">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-extrabold text-white font-sans tracking-tight">
                      {exp.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-cyan-300">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-slate-200">{exp.organization}</span>
                      <span className="text-slate-600">•</span>
                      <span className="sm:hidden text-cyan-400">{exp.dateBadge}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    {isCyberCell ? 'FORENSIC INVESTIGATION' : 'NETWORK INFRASTRUCTURE'}
                  </span>
                </div>

                {/* Highlight */}
                <p className="text-xs sm:text-sm text-slate-300 font-mono mb-4 bg-slate-900/50 p-3 rounded border border-slate-800/80">
                  {exp.highlight}
                </p>

                {/* Specific Responsibilities / Bullets from Resume */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                    VERIFIED RESPONSIBILITIES:
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                    {exp.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 bg-[#06090e] p-2 rounded border border-slate-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
