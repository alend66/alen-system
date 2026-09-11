import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { 
  Activity, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ShieldCheck, 
  RotateCcw,
  Cpu
} from 'lucide-react';

const DIAGNOSTIC_CHECKS = [
  { id: 'linux', label: 'Checking Linux', detail: 'POSIX environment, systemd, bash scripting, file permissions' },
  { id: 'network', label: 'Checking Network', detail: 'IP routing, CIDR subnetting, switch/router setup, packet analysis' },
  { id: 'security', label: 'Checking Security', detail: 'VAPT concepts, Splunk SIEM ingestion, digital forensics, hardening' },
  { id: 'projects', label: 'Checking Projects', detail: 'File Integrity Checker, RFID Access Control, Splunk SIEM' },
  { id: 'experience', label: 'Checking Experience', detail: 'DNS Solutions admin duties & Police Cyber Cell investigative exposure' },
];

export const SystemDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleRunDiagnostic = () => {
    if (isRunning) return;
    sound.playExecute();
    setIsRunning(true);
    setIsFinished(false);
    setCompletedSteps([]);

    DIAGNOSTIC_CHECKS.forEach((_, idx) => {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, idx]);
        sound.playScanTick((idx + 1) * 20);

        if (idx === DIAGNOSTIC_CHECKS.length - 1) {
          setIsRunning(false);
          setIsFinished(true);
          sound.playSuccess();
        }
      }, (idx + 1) * 600);
    });
  };

  const handleReset = () => {
    sound.playKeypress();
    setCompletedSteps([]);
    setIsFinished(false);
    setIsRunning(false);
  };

  return (
    <section id="diagnostics" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-mono">
      {/* Section Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          FEATURE 05 // SYSTEM BENCHMARK
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Live System Diagnostic
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Execute a simulated system benchmark to verify candidate capability domains and operational readiness.
        </p>
      </div>

      {/* Diagnostic Console Box */}
      <div className="bg-[#090d14] border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Header Bar */}
        <div className="bg-[#0f1420] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              DIAGNOSTIC TEST HARNESS // PORTFOLIO EVALUATOR
            </span>
          </div>

          <span className="text-[10px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded">
            SIMULATION ONLY
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Action Trigger Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wide">
                Candidate Competency Verification
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Run automated sequence against Alen Davis K&apos;s technical scope.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunDiagnostic}
                disabled={isRunning}
                className={`px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                  isRunning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:from-cyan-400 hover:to-emerald-400 shadow-cyan-500/20 active:scale-95'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Auditing Nodes...' : 'RUN DIAGNOSTIC'}</span>
              </button>

              {isFinished && (
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  title="Reset benchmark"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress checks list */}
          <div className="p-4 rounded-lg bg-[#06080d] border border-slate-800/80 space-y-2.5 text-xs">
            {DIAGNOSTIC_CHECKS.map((item, idx) => {
              const isDone = completedSteps.includes(idx);
              const isCurrent = isRunning && completedSteps.length === idx;

              return (
                <div
                  key={item.id}
                  className={`flex items-start sm:items-center justify-between gap-2 p-2 rounded transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-300'
                      : isCurrent
                      ? 'bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 animate-pulse'
                      : 'text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <span className="text-emerald-400 font-bold">[✓]</span>
                    ) : isCurrent ? (
                      <span className="text-cyan-400 font-bold animate-spin">◒</span>
                    ) : (
                      <span className="text-slate-600">[ ]</span>
                    )}
                    <span className="font-bold text-slate-200">{item.label}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {item.detail}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Generated System Profile Output */}
          {isFinished && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-[#0c121c] to-[#080b12] border border-cyan-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SYSTEM PROFILE SUMMARY // VERIFIED CANDIDATE
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  STATUS: OPTIMAL
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {['Linux', 'Networking', 'Cybersecurity', 'Infrastructure', 'Troubleshooting'].map((pill) => (
                  <div
                    key={pill}
                    className="p-2.5 rounded bg-slate-900/80 border border-slate-700 text-slate-200 font-bold hover:border-cyan-400 transition-colors"
                  >
                    <div className="text-[10px] text-emerald-400 mb-0.5">● READY</div>
                    <div>{pill}</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                Engineer profile matches core system administration, network troubleshooting, and SOC defense specifications.
              </div>
            </div>
          )}

          {/* Disclaimer Note */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
              PORTFOLIO INTERACTION NOTICE:
            </span>
            <span>This is a UI portfolio benchmark simulation. No visitor machine data is accessed.</span>
          </div>

        </div>
      </div>
    </section>
  );
};
