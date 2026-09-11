import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { 
  Terminal, 
  Volume2, 
  VolumeX, 
  Command, 
  Menu, 
  X, 
  FileText, 
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenResume: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette, onOpenResume }) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // System clock update
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const navLinks = [
    { name: 'Terminal', href: '#terminal' },
    { name: 'Network Map', href: '#network-map' },
    { name: 'Incidents', href: '#projects' },
    { name: 'Mindset', href: '#how-i-think' },
    { name: 'Diagnostics', href: '#diagnostics' },
    { name: 'Experience', href: '#experience' },
    { name: 'Credentials', href: '#credentials' },
    { name: 'Stack', href: '#stack' },
    { name: 'Connect', href: '#connect' },
  ];

  const handleNavClick = () => {
    sound.playTone(800, 0.02, 'sine', 0.02);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-mono ${
        scrolled 
          ? 'bg-[#07090e]/90 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-black/40' 
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / OS Status */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              onClick={() => sound.playKeypress()}
              className="flex items-center gap-2 text-white font-bold tracking-wider hover:text-cyan-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-sans font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  ALEN <span className="text-cyan-400">//</span> SYSTEM
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  KERNEL READY
                </span>
              </div>
            </a>

            {/* Time Telemetry (Desktop only) */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 text-xs">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={handleNavClick}
                className="px-2.5 py-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-all font-mono"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                sound.playKeypress();
                onOpenCommandPalette();
              }}
              aria-label="Open Command Palette"
              className="px-2.5 py-1.5 rounded bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1.5 transition-all shadow-inner"
              title="Press Ctrl+K to search system"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700 text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Resume Trigger */}
            <button
              onClick={() => {
                sound.playKeypress();
                onOpenResume();
              }}
              className="px-3 py-1.5 rounded bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-900/40 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              aria-label={isMuted ? 'Unmute system audio' : 'Mute system audio'}
              className={`p-2 rounded border transition-colors ${
                isMuted 
                  ? 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700' 
                  : 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
              }`}
              title={isMuted ? 'Audio Muted (Click to enable)' : 'Audio Active (Click to mute)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              aria-label="Toggle sound"
              className={`p-2 rounded border ${
                isMuted ? 'border-slate-800 text-slate-500' : 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                sound.playKeypress();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0a0d14] border-b border-cyan-500/30 px-4 pt-3 pb-6 space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={handleNavClick}
                className="px-3 py-2 rounded bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40"
              >
                &gt; {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={() => {
                sound.playKeypress();
                setMobileMenuOpen(false);
                onOpenCommandPalette();
              }}
              className="flex-1 py-2 px-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search (Ctrl+K)</span>
            </button>
            <button
              onClick={() => {
                sound.playKeypress();
                setMobileMenuOpen(false);
                onOpenResume();
              }}
              className="flex-1 py-2 px-3 rounded bg-cyan-950 border border-cyan-500/40 text-xs text-cyan-300 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Resume</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
