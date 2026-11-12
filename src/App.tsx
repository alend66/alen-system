import React, { useState, useEffect } from 'react';
import { BootSequence } from './components/BootSequence';
import { BuildingPortfolio } from './components/BuildingPortfolio';
import { CinematicCity } from './components/CinematicCity';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Terminal } from './components/Terminal';
import { NetworkMap } from './components/NetworkMap';
import { ProjectsIncidents } from './components/ProjectsIncidents';
import { HowIThink } from './components/HowIThink';
import { SystemDiagnostic } from './components/SystemDiagnostic';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { CredentialsVault } from './components/CredentialsVault';
import { TechStack } from './components/TechStack';
import { CommandPalette } from './components/CommandPalette';
import { ResumeModal } from './components/ResumeModal';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Building2, Navigation, X } from 'lucide-react';

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'building' | 'city3d' | 'classic'>('building');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState<boolean>(false);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset scroll to top when switching view modes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [viewMode]);

  const handleExploreSystem = () => {
    const termEl = document.getElementById('terminal');
    if (termEl) {
      termEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 scanlines relative overflow-x-hidden">
      {/* Boot Sequence Overlay */}
      {isBooting && (
        <BootSequence onComplete={() => setIsBooting(false)} />
      )}

      {/* 1. 3D INTERACTIVE BUILDING PORTFOLIO WITH SLIDING DOORS INTO EACH ROOM (Default) */}
      {viewMode === 'building' ? (
        <BuildingPortfolio
          onOpenResume={() => setIsResumeModalOpen(true)}
          onOpenTerminalModal={() => setIsTerminalModalOpen(true)}
          onSwitchToClassicView={() => setViewMode('classic')}
        />
      ) : viewMode === 'city3d' ? (
        /* 2. 3D CYBER CITY MODE */
        <>
          <div className="fixed bottom-4 left-4 z-40">
            <button
              onClick={() => setViewMode('building')}
              className="px-3.5 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-xl"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enter HQ Building</span>
            </button>
          </div>
          <CinematicCity
            onOpenResume={() => setIsResumeModalOpen(true)}
            onOpenTerminalModal={() => setIsTerminalModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onSwitchToClassicView={() => setViewMode('classic')}
          />
        </>
      ) : (
        /* 3. CLASSIC FULL-PAGE OS SCROLL VIEW */
        <div className={`transition-opacity duration-700 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
          <Navbar
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenResume={() => setIsResumeModalOpen(true)}
          />

          {/* Floating Buttons to Return to 3D Building Tour */}
          <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setViewMode('building')}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-mono font-extrabold text-xs shadow-xl shadow-cyan-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>ENTER HQ BUILDING</span>
            </button>
            <button
              onClick={() => setViewMode('city3d')}
              className="px-3.5 py-2.5 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs shadow-xl flex items-center gap-1.5 hover:bg-slate-800 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D CITY</span>
            </button>
          </div>

          <main className="relative z-10 space-y-2 sm:space-y-8">
            <Hero
              onOpenResume={() => setIsResumeModalOpen(true)}
              onExploreSystem={handleExploreSystem}
            />

            <Terminal
              onOpenResume={() => setIsResumeModalOpen(true)}
              onReboot={() => setIsBooting(true)}
            />

            <NetworkMap />

            <ProjectsIncidents />

            <HowIThink />

            <SystemDiagnostic />

            <ExperienceTimeline />

            <CredentialsVault />

            <TechStack />

            <ContactSection />
          </main>

          <Footer />
        </div>
      )}

      {/* Interactive Terminal Modal when triggered from 3D Building HUD */}
      {isTerminalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setIsTerminalModalOpen(false)} />
          <div className="relative w-full max-w-4xl z-10 my-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsTerminalModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
                <span>Close Terminal</span>
              </button>
            </div>
            <div className="bg-[#07090e] rounded-2xl border border-cyan-500/40 overflow-hidden max-h-[85dvh] overflow-y-auto">
              <Terminal
                onOpenResume={() => {
                  setIsTerminalModalOpen(false);
                  setIsResumeModalOpen(true);
                }}
                onReboot={() => {
                  setIsTerminalModalOpen(false);
                  setIsBooting(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenResume={() => setIsResumeModalOpen(true)}
      />

      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
    </div>
  );
};

export default App;
