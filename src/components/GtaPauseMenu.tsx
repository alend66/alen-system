import React, { useEffect } from 'react';
import { X, Play, Terminal, FileText, Shield, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaPauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScene: (idx: number) => void;
  onOpenTerminal: () => void;
  onOpenResume: () => void;
}

export const GtaPauseMenu: React.FC<GtaPauseMenuProps> = ({
  isOpen,
  onClose,
  onSelectScene,
  onOpenTerminal,
  onOpenResume,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { title: '01. MISSION OVERVIEW', sub: 'Profile, System Status & Role', scene: 0 },
    { title: '02. HEISTS & PROJECTS', sub: 'File Integrity, RFID, Splunk SIEM', scene: 1 },
    { title: '03. SECURITY ARSENAL', sub: 'How I Think & Defensive Labs', scene: 2 },
    { title: '04. EXPERIENCE JOURNEY', sub: 'DNS Solutions & Police Cyber Cell', scene: 3 },
    { title: '05. UNLOCKED ACHIEVEMENTS', sub: 'ADCD v3, Forensics, C0C0N XVII', scene: 4 },
    { title: '06. SECURE TRANSMISSION', sub: 'Encrypted Contact & Links', scene: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: "url('/gta/gta_ocean_drive.jpg')" }}
      ></div>

      <div className="relative z-10 w-full max-w-xl bg-slate-950/90 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="gta-heading text-4xl sm:text-5xl text-white tracking-widest leading-none">
              MISSION PAUSE
            </h3>
            <span className="gta-script text-xl sm:text-2xl text-cyan-400 block -mt-1">
              Vice City Cyber Operations
            </span>
          </div>

          <button
            onClick={() => {
              gtaAudio.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Resume Mission (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Select List */}
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                gtaAudio.playMissionSuccess();
                onSelectScene(item.scene);
                onClose();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="w-full text-left p-3 rounded-xl bg-black/50 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-400/50 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-white group-hover:text-cyan-300 block">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  {item.sub}
                </span>
              </div>

              <Play className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>

        {/* Global Action Shortcuts */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              gtaAudio.playClick();
              onClose();
              onOpenTerminal();
            }}
            onMouseEnter={() => gtaAudio.playHover()}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-950/40 transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>DROP TO SHELL [~]</span>
          </button>

          <button
            onClick={() => {
              gtaAudio.playClick();
              onClose();
              onOpenResume();
            }}
            onMouseEnter={() => gtaAudio.playHover()}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-950/40 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>VIEW RESUME</span>
          </button>
        </div>

        {/* Footer Hint */}
        <div className="text-center text-[10px] font-mono text-slate-500">
          PRESS <span className="text-white font-bold">[ESC]</span> TO RESUME MISSION • USE <span className="text-white font-bold">[← / →]</span> TO CYCLE SCENES
        </div>

      </div>

    </div>
  );
};
