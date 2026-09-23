import React, { useEffect } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from './Terminal';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
}

export const GtaTerminalModal: React.FC<GtaTerminalModalProps> = ({
  isOpen,
  onClose,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative z-10 w-full max-w-5xl h-[88vh] flex flex-col bg-slate-950/95 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)]">
        
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d121b] border-b border-emerald-500/20 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5" />
              alen@vice-city-soc:~ (bash)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              Type 'help' for commands • Press [ESC] to exit
            </span>
            <button
              onClick={() => {
                gtaAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Terminal body */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          <Terminal onOpenResume={onOpenResume} />
        </div>

      </div>
    </div>
  );
};
