import React, { useState, useEffect } from 'react';
import { BootSequence } from './components/BootSequence';
import { GtaSceneContainer } from './components/GtaSceneContainer';
import { GtaTerminalModal } from './components/GtaTerminalModal';
import { GtaProjectDetailModal } from './components/GtaProjectDetailModal';
import { GtaCredentialsModal } from './components/GtaCredentialsModal';
import { GtaTechStackModal } from './components/GtaTechStackModal';
import { GtaTransmissionModal } from './components/GtaTransmissionModal';
import { ResumeModal } from './components/ResumeModal';
import { CommandPalette } from './components/CommandPalette';
import { ProjectIncident } from './data/portfolioData';

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [currentScene, setCurrentScene] = useState<number>(0);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState<boolean>(false);
  const [isTransmissionModalOpen, setIsTransmissionModalOpen] = useState<boolean>(false);
  const [activeProjectDetail, setActiveProjectDetail] = useState<ProjectIncident | null>(null);

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

  return (
    <div className="min-h-screen bg-black text-slate-100 relative overflow-x-hidden">
      
      {/* Boot Sequence Overlay */}
      {isBooting && (
        <BootSequence onComplete={() => setIsBooting(false)} />
      )}

      {/* Main Display: GTA Scene Experience */}
      <GtaSceneContainer
        currentScene={currentScene}
        onSelectScene={setCurrentScene}
        onOpenTerminal={() => setIsTerminalModalOpen(true)}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenTechStack={() => setIsTechStackModalOpen(true)}
        onOpenProjectDetail={project => setActiveProjectDetail(project)}
        onOpenTransmissionModal={() => setIsTransmissionModalOpen(true)}
      />

      {/* Overlays & Interactive Modals */}
      <GtaTerminalModal
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        onOpenResume={() => {
          setIsTerminalModalOpen(false);
          setIsResumeModalOpen(true);
        }}
      />

      <GtaProjectDetailModal
        project={activeProjectDetail}
        onClose={() => setActiveProjectDetail(null)}
      />

      <GtaCredentialsModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />

      <GtaTechStackModal
        isOpen={isTechStackModalOpen}
        onClose={() => setIsTechStackModalOpen(false)}
      />

      <GtaTransmissionModal
        isOpen={isTransmissionModalOpen}
        onClose={() => setIsTransmissionModalOpen(false)}
      />

      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenTerminal={() => setIsTerminalModalOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenTechStack={() => setIsTechStackModalOpen(true)}
        onOpenProjectDetail={project => setActiveProjectDetail(project)}
        onOpenTransmissionModal={() => setIsTransmissionModalOpen(true)}
        onSelectScene={idx => setCurrentScene(idx)}
      />

    </div>
  );
};

export default App;
