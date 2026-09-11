import React from 'react';
import { sound } from '../utils/sound';
import { Terminal, ArrowUp, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sound.playTone(800, 0.03, 'sine', 0.03);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#05070a] border-t border-cyan-500/20 py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-extrabold font-sans text-base">
            <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span>ALEN <span className="text-cyan-400">//</span> SYSTEM</span>
          </div>

          <p className="text-xs text-slate-400">
            Linux <span className="text-slate-600">•</span> Networking <span className="text-slate-600">•</span> Cybersecurity <span className="text-slate-600">•</span> Infrastructure
          </p>

          <p className="text-[11px] text-slate-500 italic pt-1">
            &ldquo;Built with curiosity, troubleshooting and too many terminal commands.&rdquo;
          </p>
        </div>

        {/* Copyright & Back to Top */}
        <div className="flex flex-col items-center sm:items-end gap-3 text-xs text-slate-500">
          <div>
            &copy; 2026 Alen Davis K. All systems operational.
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all text-[11px]"
          >
            <span>RETURN TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
