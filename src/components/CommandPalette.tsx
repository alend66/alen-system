import React, { useState, useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  Search, 
  Terminal, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Cpu, 
  Mail, 
  X, 
  CornerDownLeft,
  ArrowRight,
  Shield
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  meta?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenResume }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navigateToSection = (primaryHash: string, fallbackHash: string) => {
    const target = document.querySelector(primaryHash) || document.querySelector(fallbackHash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = primaryHash;
    }
    onClose();
  };

  const searchItems: SearchItem[] = [
    // Projects
    {
      id: 'proj-fic',
      title: 'Project 01: File Integrity Checker',
      category: 'PROJECT',
      meta: 'Python + Shell • MD5 Hashing',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToSection('#projects', '#insights')
    },
    {
      id: 'proj-rfid',
      title: 'Project 02: RFID Access Control System',
      category: 'PROJECT',
      meta: 'ESP32 + RFID • Microcontroller Access',
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      action: () => navigateToSection('#projects', '#insights')
    },
    {
      id: 'proj-splunk',
      title: 'Project 03: Splunk SIEM Log Monitoring System',
      category: 'PROJECT',
      meta: 'Splunk + Linux • Universal Forwarder',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      action: () => navigateToSection('#projects', '#insights')
    },

    // Navigation & Capabilities
    {
      id: 'nav-term',
      title: 'Interactive 3D Security Domains / Terminal',
      category: 'DOMAIN',
      meta: 'Explore HACK 3D chapters or live console',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToSection('#terminal', '#work')
    },
    {
      id: 'nav-map',
      title: 'Infrastructure & Capabilities Matrix',
      category: 'CAPABILITIES',
      meta: 'Inspect core security engineering nodes',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      action: () => navigateToSection('#network-map', '#about')
    },
    {
      id: 'nav-mindset',
      title: 'How I Think // Root-Cause Philosophy',
      category: 'MINDSET',
      meta: 'OBSERVE → IDENTIFY → ISOLATE → TEST → FIX → VERIFY',
      icon: <Terminal className="w-4 h-4 text-purple-400" />,
      action: () => navigateToSection('#how-i-think', '#about')
    },
    {
      id: 'nav-diag',
      title: 'Live System Diagnostic Console',
      category: 'SYSTEM',
      meta: 'Simulated candidate profile evaluation',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToSection('#diagnostics', '#about')
    },

    // Experience
    {
      id: 'exp-dns',
      title: 'CCTV & Networking Administrator @ DNS Solutions',
      category: 'EXPERIENCE',
      meta: 'CCTV, DVR/NVR, router config, IP subnets',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      action: () => navigateToSection('#experience', '#team')
    },
    {
      id: 'exp-police',
      title: 'Cyber Security Intern @ Police Cyber Cell',
      category: 'EXPERIENCE',
      meta: 'Cybercrime investigation, forensics evidence',
      icon: <Shield className="w-4 h-4 text-red-400" />,
      action: () => navigateToSection('#experience', '#team')
    },

    // Education & Certs
    {
      id: 'edu-bsc',
      title: 'BSc in Computer Science (Sahrdaya CAS)',
      category: 'EDUCATION',
      meta: 'Computer Science degree foundation',
      icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
      action: () => navigateToSection('#credentials', '#team')
    },
    {
      id: 'edu-adcd',
      title: 'Advanced Diploma in Cyber Defence (ADCD v3)',
      category: 'CREDENTIAL',
      meta: 'Red Team Hackers Academy, June 2026',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToSection('#credentials', '#team')
    },

    // Direct Actions
    {
      id: 'act-resume',
      title: 'Open Digital Resume Viewer & Download',
      category: 'ACTION',
      meta: 'Authoritative candidate sheet',
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onClose();
        onOpenResume();
      }
    },
    {
      id: 'act-contact',
      title: 'Establish Connection // Contact Alen',
      category: 'CONTACT',
      meta: 'alend6622@gmail.com • +91 9745775346',
      icon: <Mail className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToSection('#connect', '#contact')
    }
  ];

  const filteredItems = searchItems.filter(item => {
    const text = `${item.title} ${item.category} ${item.meta || ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    sound.playKeypress();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        sound.playExecute();
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 font-mono">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#090d14] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md z-10 animate-fadeIn">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#0c111a]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="SEARCH SYSTEM... (type project, skill, cert, role)"
            className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching system node found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playExecute();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-white'
                      : 'hover:bg-slate-900/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {item.title}
                      </div>
                      {item.meta && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.meta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase font-mono">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#0c111a] px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between gap-2">
          <span className="hidden sm:inline">Navigate with <kbd className="px-1 bg-slate-800 rounded">↑</kbd> <kbd className="px-1 bg-slate-800 rounded">↓</kbd>, <kbd className="px-1 bg-slate-800 rounded">Enter</kbd> to select</span>
          <span className="sm:hidden">Tap any node to navigate</span>
          <span><kbd className="px-1 bg-slate-800 rounded">Esc</kbd> to close</span>
        </div>

      </div>
    </div>
  );
};
