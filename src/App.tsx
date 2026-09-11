import React, { useState, useEffect } from 'react';
import { BootSequence } from './components/BootSequence';
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

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);

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

  const handleExploreSystem = () => {
    const termEl = document.getElementById('terminal');
    if (termEl) {
      termEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 scanlines relative overflow-x-hidden">
      
      {/* Boot Sequence Overlay */}
      {isBooting && (
        <BootSequence onComplete={() => setIsBooting(false)} />
      )}

      {/* Main Operating Environment */}
      <div className={`transition-opacity duration-700 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
        {/* Navigation Bar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenResume={() => setIsResumeModalOpen(true)}
        />

        {/* Main Content Sections */}
        <main className="relative z-10 space-y-8">
          <Hero
            onOpenResume={() => setIsResumeModalOpen(true)}
            onExploreSystem={handleExploreSystem}
          />

          <Terminal
            onOpenResume={() => setIsResumeModalOpen(true)}
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

        {/* System Footer */}
        <Footer />
      </div>

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
