import React from 'react';
import { Award, ShieldCheck, Terminal, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface AchievementsSceneProps {
  onOpenVault: () => void;
}

export const AchievementsScene: React.FC<AchievementsSceneProps> = ({
  onOpenVault,
}) => {
  const { certifications } = PORTFOLIO_DATA;

  const milestones = [
    {
      title: 'FIRST PROJECT',
      sub: 'Shipped File Integrity Checker (Python & MD5 digests)',
      icon: Terminal,
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30'
    },
    {
      title: 'POLICE CYBER CELL',
      sub: 'Digital evidence handling & cybercrime investigation forensics',
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
    },
    {
      title: 'VIRAL SOC BUILDER',
      sub: 'Splunk SIEM enterprise log forwarding & brute-force alerting',
      icon: Star,
      color: 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-500/30'
    },
    {
      title: 'DEDICATION // ADCD v3',
      sub: 'Advanced Diploma in Cyber Defence — Red Team Hacker Academy',
      icon: Award,
      color: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30'
    },
  ];

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic matching Photo 3 (GTA Neon Alley at Night) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 pointer-events-none"
        style={{ backgroundImage: "url('/gta/gta_neon_alley.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl text-left w-full">
        
        {/* Title & Subtitle (GTA Style - Photo 3) */}
        <div className="mb-2 sm:mb-3">
          <h2 className="gta-heading text-4xl sm:text-6xl font-black text-white tracking-wider leading-none">
            ACHIEVEMENTS
          </h2>
          <span className="gta-script text-2xl sm:text-3xl text-pink-400 block -mt-1 transform -rotate-1">
            Unlocked
          </span>
        </div>

        {/* Tactical Glass Card matching Photo 3 layout */}
        <div className="gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl space-y-3">
          
          <div className="space-y-2">
            {milestones.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-pink-500/40 transition-colors"
                >
                  <div className={`p-2 rounded-lg border flex-shrink-0 ${item.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-pink-400 uppercase block">
                      {item.title}
                    </span>
                    <p className="text-xs text-slate-200 font-sans truncate">
                      {item.sub}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Quick Certifications Count */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="text-slate-400">
              {certifications.length} OFFICIALLY VERIFIED CREDENTIALS
            </span>
            <span className="text-yellow-400 font-bold">100% AUDITED</span>
          </div>

          {/* Action Button matching Photo 3 ("VIEW CERTIFICATE >") */}
          <div className="pt-1">
            <button
              onClick={() => {
                gtaAudio.playMissionSuccess();
                onOpenVault();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-sans font-extrabold text-xs sm:text-sm tracking-wider shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>VIEW CERTIFICATES VAULT</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
