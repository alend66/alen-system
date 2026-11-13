import React, { useState, useRef, useEffect } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  Terminal as TerminalIcon, 
  CornerDownLeft, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Copy, 
  Check,
  Code
} from 'lucide-react';

interface TerminalProps {
  onOpenResume: () => void;
  onReboot?: () => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: string;
}

export const Terminal: React.FC<TerminalProps> = ({ onOpenResume, onReboot }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState<number>(-1);
  const [isCopied, setIsCopied] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested commands for quick clicks
  const quickCommands = ['help', 'about', 'skills', 'projects', 'experience', 'education', 'resume', 'contact', 'clear'];

  // Initialize with greeting & help command run
  useEffect(() => {
    const initialCmd = 'help';
    const initialOutput = renderOutput(initialCmd);
    setHistory([
      {
        id: 'init-0',
        command: 'systemctl status alen-engineer.service',
        output: (
          <div className="text-xs space-y-1 text-slate-300 break-words">
            <div className="text-emerald-400 font-bold">● alen-engineer.service - Linux System & Cybersecurity Operations</div>
            <div className="text-slate-400 break-all sm:break-normal">Loaded: loaded (/etc/systemd/system/alen-engineer.service; enabled)</div>
            <div className="text-slate-400">Active: <span className="text-emerald-400 font-semibold">active (running)</span> since boot</div>
            <div className="text-cyan-400">Engineer: ALEN DAVIS K | Target: Linux System Engineer</div>
          </div>
        ),
        timestamp: '16:00:00'
      },
      {
        id: 'init-1',
        command: initialCmd,
        output: initialOutput,
        timestamp: '16:00:01'
      }
    ]);
  }, []);

  useEffect(() => {
    if (terminalBodyRef.current && history.length > 2) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Sound feedback for typing
    sound.playKeypress();

    if (e.key === 'Enter') {
      executeCommand(inputVal.trim());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandLog.length === 0) return;
      const nextIndex = logIndex + 1 < commandLog.length ? logIndex + 1 : logIndex;
      setLogIndex(nextIndex);
      setInputVal(commandLog[commandLog.length - 1 - nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (logIndex > 0) {
        const nextIndex = logIndex - 1;
        setLogIndex(nextIndex);
        setInputVal(commandLog[commandLog.length - 1 - nextIndex] || '');
      } else {
        setLogIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto complete
      const current = inputVal.trim().toLowerCase();
      if (!current) return;
      const match = quickCommands.find(c => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    }
  };

  const executeCommand = (cmd: string) => {
    if (!cmd) return;

    sound.playExecute();
    const cleanCmd = cmd.trim();
    setCommandLog(prev => [...prev, cleanCmd]);
    setLogIndex(-1);
    setInputVal('');

    if (cleanCmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }

    if (cleanCmd.toLowerCase() === 'resume') {
      onOpenResume();
    }

    if (cleanCmd.toLowerCase() === 'reboot' || cleanCmd.toLowerCase() === 'boot') {
      onReboot?.();
      return;
    }

    const outputNode = renderOutput(cleanCmd);
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: cleanCmd,
        output: outputNode,
        timestamp: now
      }
    ]);
  };

  const renderOutput = (cmd: string): React.ReactNode => {
    const lower = cmd.toLowerCase().trim();

    switch (lower) {
      case 'help':
        return (
          <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              Available commands:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">about</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">About Alen</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">skills</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Technical capabilities</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">projects</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Engineering projects</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">experience</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Professional experience</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">education</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Education</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">resume</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">View resume</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">contact</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Contact Alen</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold w-20 shrink-0">clear</span><span className="text-slate-500 shrink-0">→</span><span className="truncate">Clear terminal</span></div>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
              💡 Tip: You can also try Unix builtins: <span className="text-cyan-300 font-mono">whoami</span>, <span className="text-cyan-300 font-mono">uname -a</span>, <span className="text-cyan-300 font-mono">status</span>.
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
              ALEN DAVIS K // PROFESSIONAL IDENTITY
            </div>
            <p className="text-slate-200 leading-relaxed">
              {PORTFOLIO_DATA.personal.professionalIdentity}
            </p>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
              <div><span className="text-slate-500">Location:</span> <span className="text-emerald-300">{PORTFOLIO_DATA.personal.location}</span></div>
              <div><span className="text-slate-500">Career Goal:</span> <span className="text-cyan-300 font-bold">{PORTFOLIO_DATA.personal.careerGoal}</span></div>
              <div><span className="text-slate-500">Philosophy:</span> <span className="text-slate-300 italic">&ldquo;{PORTFOLIO_DATA.personal.mindsetQuote}&rdquo;</span></div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-3 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              TECHNICAL CAPABILITIES MATRIX:
            </div>
            <div className="space-y-2">
              {PORTFOLIO_DATA.skillCategories.map(cat => (
                <div key={cat.category} className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <div className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider mb-1">
                    [{cat.category}]
                  </div>
                  <div className="text-slate-300 flex flex-wrap gap-x-2 gap-y-1">
                    {cat.skills.map((s, idx) => (
                      <span key={s} className="inline-flex items-center">
                        <span className="text-slate-400">{s}</span>
                        {idx < cat.skills.length - 1 && <span className="text-slate-600 ml-2">•</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-3 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              ENGINEERING INCIDENTS & PROJECTS:
            </div>
            <div className="space-y-2.5">
              {PORTFOLIO_DATA.projects.map(p => (
                <div key={p.id} className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{p.incidentNumber}: {p.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-cyan-300 text-xs mb-1.5">Tech: {p.technology}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{p.problem}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-500">
              Run <a href="#projects" className="text-cyan-400 underline">#projects</a> or view detailed incident dossiers below.
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-3 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              PROFESSIONAL EXPERIENCE LOG:
            </div>
            <div className="space-y-2">
              {PORTFOLIO_DATA.experience.map(exp => (
                <div key={exp.organization} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold text-xs">{exp.role}</div>
                  <div className="text-cyan-300 text-xs">{exp.organization} <span className="text-slate-500">|</span> <span className="text-slate-400">{exp.dateBadge}</span></div>
                  <ul className="list-disc list-inside text-slate-400 text-xs space-y-0.5 pt-1">
                    {exp.details.slice(0, 3).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              SYSTEM FOUNDATION // EDUCATION:
            </div>
            <div className="space-y-2">
              {PORTFOLIO_DATA.education.map(edu => (
                <div key={edu.degree} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-white font-bold text-xs">{edu.degree}</div>
                  <div className="text-cyan-400 text-xs">{edu.institution}, {edu.location}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{edu.focus}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'resume':
        return (
          <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-emerald-400 font-bold">Opening Digital Resume Viewer...</div>
            <p className="text-slate-400 text-xs">
              Complete authoritative resume details are rendered in the preview sheet.
            </p>
            <button
              onClick={onOpenResume}
              className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs rounded hover:bg-cyan-900/60"
            >
              [ CLICK TO INSPECT RESUME MODAL ]
            </button>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-300">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              COMMUNICATION ENDPOINTS // ALEN DAVIS K:
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
              <div><span className="text-slate-500">Email:</span> <a href={`mailto:${PORTFOLIO_DATA.personal.email}`} className="text-cyan-300 hover:underline">{PORTFOLIO_DATA.personal.email}</a></div>
              <div><span className="text-slate-500">Location:</span> <span className="text-slate-300">{PORTFOLIO_DATA.personal.location}</span></div>
            </div>
          </div>
        );

      case 'whoami':
        return <div className="text-xs font-mono text-emerald-400">guest@alen-system [recruiter-session-authorized]</div>;

      case 'uname':
      case 'uname -a':
        return <div className="text-xs font-mono text-slate-300">Linux alen-portfolio 6.8.0-syseng #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>;

      case 'status':
        return (
          <div className="text-xs font-mono space-y-1 text-slate-300">
            <div>HOST: ALEN-SYSTEM (Thrissur, Kerala)</div>
            <div>STATUS: <span className="text-emerald-400">ONLINE</span></div>
            <div>NETWORKING: <span className="text-cyan-400">STABLE</span></div>
            <div>SECURITY: <span className="text-emerald-400">ACTIVE</span></div>
          </div>
        );

      default:
        sound.playError();
        return (
          <div className="text-xs font-mono text-red-400">
            bash: {cmd}: command not found. Type <button onClick={() => executeCommand('help')} className="underline text-cyan-400 font-bold">help</button> to inspect available portfolio commands.
          </div>
        );
    }
  };

  const handleCopyHistory = () => {
    sound.playKeypress();
    const text = history.map(h => `$ ${h.command}`).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="terminal" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Title */}
      <div className="text-center mb-6 sm:mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] sm:text-xs font-mono text-cyan-300">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>FEATURE 01 // CLI COMMAND CONSOLE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Interactive Terminal
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-xl mx-auto">
          Type Unix commands directly into the terminal or click the quick command chips to interrogate system data.
        </p>
      </div>

      {/* Terminal Window Box */}
      <div className="rounded-xl bg-[#090d14] border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Terminal Titlebar */}
        <div className="bg-[#0f1420] px-3.5 sm:px-4 py-3 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shrink-0"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shrink-0"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shrink-0"></span>
            <span className="text-slate-400 font-bold ml-2 truncate">
              alen@portfolio:~
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 shrink-0">
            <button
              onClick={() => executeCommand('clear')}
              className="p-1 hover:text-cyan-400 transition-colors"
              title="Clear Terminal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyHistory}
              className="p-1 hover:text-cyan-400 transition-colors"
              title="Copy session commands"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Terminal Screen / Output Body */}
        <div 
          ref={terminalBodyRef}
          onClick={() => inputRef.current?.focus()}
          className="p-3.5 sm:p-6 min-h-[320px] sm:min-h-[360px] max-h-[460px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden space-y-4 font-mono text-xs sm:text-sm cursor-text selection:bg-cyan-500/30"
        >
          {history.map((item) => (
            <div key={item.id} className="space-y-2 animate-fadeIn">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-slate-400 font-mono">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0 flex-1">
                  <span className="text-emerald-400 font-bold shrink-0">alen@portfolio:~$</span>
                  <span className="text-white font-semibold break-all sm:break-normal">{item.command}</span>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0 ml-auto">{item.timestamp}</span>
              </div>
              <div className="pl-3 sm:pl-4 border-l border-slate-800 overflow-x-hidden">
                {item.output}
              </div>
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2 text-slate-300">
            <span className="text-emerald-400 font-bold shrink-0 text-[11px] sm:text-sm">alen@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-cyan-200 font-mono text-xs sm:text-sm p-0 m-0 focus:ring-0"
              placeholder="type 'help', 'skills'..."
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              onClick={() => executeCommand(inputVal.trim())}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 sm:hidden shrink-0"
              aria-label="Send command"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Command Toolbar Footer */}
        <div className="bg-[#0b0f17] border-t border-slate-800/80 px-3.5 sm:px-4 py-3 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider sm:mr-1">
            QUICK RUN:
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2 sm:px-2.5 py-1.5 sm:py-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all active:scale-95 text-center truncate"
              >
                $ {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
