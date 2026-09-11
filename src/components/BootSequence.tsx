import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { EngineerPortrait } from './EngineerPortrait';
import { Terminal, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  { text: 'INITIALIZING ALEN_SYSTEM v2.6.4...', delay: 120 },
  { text: 'Loading Linux environment [kernel 6.8.0-generic]...', delay: 350 },
  { text: 'Checking network interfaces: eth0 UP, wlan0 READY, lo OK...', delay: 650 },
  { text: 'Loading security modules: iptables, auditd, vapt_engine...', delay: 950 },
  { text: 'Mounting projects: [FIC-01] [RFID-02] [SPLUNK-03]...', delay: 1250 },
  { text: 'Verifying user credentials: ALEN DAVIS K [OK]...', delay: 1550 },
  { text: 'System ready. All operational layers nominal.', delay: 1800 },
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [bootDone, setBootDone] = useState<boolean>(false);

  useEffect(() => {
    sound.playBeep(440, 0.05, 'sine', 0.03);

    const timeouts = BOOT_LOGS.map((item, index) => {
      return setTimeout(() => {
        setCurrentLineIndex(index + 1);
        sound.playTone(480 + index * 40, 0.02, 'sine', 0.02);
        if (index === BOOT_LOGS.length - 1) {
          setBootDone(true);
          sound.playSuccess();
        }
      }, item.delay);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleEnter = () => {
    sound.playExecute();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col items-center justify-center p-4 scanlines select-none font-mono overflow-y-auto">
      {/* Background Matrix/Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-black pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-[#0b0e14]/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md overflow-hidden my-auto">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="text-xs text-slate-400 font-mono ml-2 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> alen@system-bootloader:~
            </span>
          </div>
          <button
            onClick={onComplete}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono uppercase tracking-wider py-1 px-2 rounded hover:bg-slate-800/60"
          >
            [ Skip Boot ]
          </button>
        </div>

        {/* Boot Messages */}
        <div className="space-y-1.5 text-xs text-slate-300 min-h-[140px]">
          {BOOT_LOGS.slice(0, currentLineIndex).map((log, i) => (
            <div key={i} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-emerald-400 font-bold">&gt;</span>
              <span className={i === BOOT_LOGS.length - 1 ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                {log.text}
              </span>
            </div>
          ))}
          {!bootDone && (
            <div className="flex items-center gap-2 text-cyan-400 pt-1">
              <span className="animate-cursor inline-block font-bold">█</span>
              <span className="text-xs text-slate-500 animate-pulse">mounting security daemons...</span>
            </div>
          )}
        </div>

        {/* Reveal Identity Card when Ready */}
        {bootDone && (
          <div className="mt-5 pt-5 border-t border-cyan-500/20 animate-fadeIn text-center space-y-4">
            
            {/* Portrait inside Bootloader */}
            <div className="flex justify-center scale-90 sm:scale-100">
              <EngineerPortrait size="sm" showTelemetry={false} />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> BIOMETRIC MATCH // IDENTITY VERIFIED
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                ALEN DAVIS K
              </h1>
              
              <p className="text-xs font-mono text-cyan-400 tracking-wider">
                Linux <span className="text-slate-600">•</span> Networking <span className="text-slate-600">•</span> Cybersecurity <span className="text-slate-600">•</span> Infrastructure
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleEnter}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-mono font-bold text-sm rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <span>[ ENTER SYSTEM ]</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* System telemetry footer */}
        <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> SECURE ROOT ACCESS
          </span>
          <span className="text-slate-600">ID: ADK-SYS-01</span>
        </div>
      </div>
    </div>
  );
};