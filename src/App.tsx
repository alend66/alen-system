import React, { useState, useEffect } from 'react';
import { AegisCyberPortfolio } from './components/AegisCyberPortfolio';
import { FreeFirePortfolio } from './components/FreeFirePortfolio';
import { LanternRiverPortfolio } from './components/LanternRiverPortfolio';
import { HackPortfolio } from './components/GruboPortfolio';
import { CommandPalette } from './components/CommandPalette';
import { ResumeModal } from './components/ResumeModal';

export const App: React.FC = () => {
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

  // HACK style is the default. Optional ?theme=lantern, ?theme=freefire, or ?theme=aegis
  const theme = new URLSearchParams(window.location.search).get('theme');
  const Portfolio =
    theme === 'aegis'
      ? AegisCyberPortfolio
      : theme === 'freefire'
      ? FreeFirePortfolio
      : theme === 'lantern'
      ? LanternRiverPortfolio
      : HackPortfolio;

  return (
    <>
      <Portfolio
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

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
    </>
  );
};

export default App;
