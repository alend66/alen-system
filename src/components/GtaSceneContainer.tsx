import React, { useState, useEffect, useRef } from 'react';
import { GtaHud } from './GtaHud';
import { HeroScene } from './scenes/HeroScene';
import { ProjectsScene } from './scenes/ProjectsScene';
import { ArsenalScene } from './scenes/ArsenalScene';
import { ExperienceScene } from './scenes/ExperienceScene';
import { AchievementsScene } from './scenes/AchievementsScene';
import { ContactScene } from './scenes/ContactScene';
import { GtaPauseMenu } from './GtaPauseMenu';
import { ProjectIncident } from '../data/portfolioData';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaSceneContainerProps {
  currentScene?: number;
  onSelectScene?: (index: number) => void;
  onOpenTerminal: () => void;
  onOpenResume: () => void;
  onOpenVault: () => void;
  onOpenTechStack: () => void;
  onOpenProjectDetail: (project: ProjectIncident) => void;
  onOpenTransmissionModal: () => void;
}

export const GtaSceneContainer: React.FC<GtaSceneContainerProps> = ({
  currentScene: controlledScene,
  onSelectScene,
  onOpenTerminal,
  onOpenResume,
  onOpenVault,
  onOpenTechStack,
  onOpenProjectDetail,
  onOpenTransmissionModal,
}) => {
  const [internalScene, setInternalScene] = useState<number>(0);
  const currentScene = controlledScene !== undefined ? controlledScene : internalScene;

  const setScene = (idx: number) => {
    if (onSelectScene) {
      onSelectScene(idx);
    } else {
      setInternalScene(idx);
    }
  };

  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  const TOTAL_SCENES = 6;

  const sceneObjectives = [
    'INITIALIZE VICE CITY CYBER COMMAND',
    'INSPECT COMPLETED BUILDS & ACTIVE INCIDENTS',
    'EXPLORE SECURITY LABS & DEFENSIVE ARSENAL',
    'TRACE THE FULL CAREER PATH & OPERATIONS',
    'COLLECT UNLOCKED TROPHIES & CREDENTIALS',
    'OPEN A SECURE LINE OF CONTACT',
  ];

  // Global Keyboard shortcuts for scene switching and Pause menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or textarea is active
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPauseMenuOpen(prev => !prev);
        gtaAudio.playClick();
      } else if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        onOpenTerminal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        gtaAudio.playClick();
        setScene(currentScene < TOTAL_SCENES - 1 ? currentScene + 1 : 0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        gtaAudio.playClick();
        setScene(currentScene > 0 ? currentScene - 1 : TOTAL_SCENES - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenTerminal, currentScene]);

  // Touch Swipe for Mobile Navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped Left -> Next Scene
        gtaAudio.playClick();
        setScene(currentScene < TOTAL_SCENES - 1 ? currentScene + 1 : 0);
      } else {
        // Swiped Right -> Prev Scene
        gtaAudio.playClick();
        setScene(currentScene > 0 ? currentScene - 1 : TOTAL_SCENES - 1);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Scanline CRT overlay for subtle retro game screen aesthetic */}
      <div className="absolute inset-0 scanlines pointer-events-none z-30"></div>

      {/* Main HUD Overlays (Fixed Top & Bottom) */}
      <GtaHud
        currentScene={currentScene}
        totalScenes={TOTAL_SCENES}
        sceneObjective={sceneObjectives[currentScene]}
        onSelectScene={idx => setScene(idx)}
        onOpenTerminal={onOpenTerminal}
        onOpenResume={onOpenResume}
        onOpenPauseMenu={() => setIsPauseMenuOpen(true)}
      />

      {/* Scene Slides Carousel */}
      <div className="relative w-full h-full">
        {currentScene === 0 && (
          <HeroScene
            onOpenTerminal={onOpenTerminal}
            onOpenResume={onOpenResume}
            onNextScene={() => setScene(1)}
          />
        )}

        {currentScene === 1 && (
          <ProjectsScene
            onOpenProjectDetail={onOpenProjectDetail}
            onOpenTerminal={onOpenTerminal}
          />
        )}

        {currentScene === 2 && (
          <ArsenalScene
            onOpenTerminal={onOpenTerminal}
            onOpenTechStack={onOpenTechStack}
          />
        )}

        {currentScene === 3 && (
          <ExperienceScene
            onOpenResume={onOpenResume}
          />
        )}

        {currentScene === 4 && (
          <AchievementsScene
            onOpenVault={onOpenVault}
          />
        )}

        {currentScene === 5 && (
          <ContactScene
            onOpenTransmissionModal={onOpenTransmissionModal}
          />
        )}
      </div>

      {/* Mission Pause Menu Modal */}
      <GtaPauseMenu
        isOpen={isPauseMenuOpen}
        onClose={() => setIsPauseMenuOpen(false)}
        onSelectScene={idx => setScene(idx)}
        onOpenTerminal={onOpenTerminal}
        onOpenResume={onOpenResume}
      />
    </div>
  );
};
