import React, { useState } from 'react';
import { X, Play, ShieldAlert, Cpu, Terminal, CheckCircle2, FileText, Send, Search } from 'lucide-react';
import { ProjectIncident } from '../data/portfolioData';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaProjectDetailModalProps {
  project: ProjectIncident | null;
  onClose: () => void;
}

export const GtaProjectDetailModal: React.FC<GtaProjectDetailModalProps> = ({
  project,
  onClose,
}) => {
  const [activeSocStep, setActiveSocStep] = useState<number>(0);
  const [isSimulatingSoc, setIsSimulatingSoc] = useState<boolean>(false);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);

  if (!project) return null;

  const isSplunk = project.id === 'splunk-siem-monitoring';

  const handleSimulateSoc = () => {
    if (isSimulatingSoc) return;
    gtaAudio.playClick();
    setIsSimulatingSoc(true);
    setAlertTriggered(false);
    setActiveSocStep(0);

    const stepsCount = 5;
    for (let i = 1; i <= stepsCount; i++) {
      setTimeout(() => {
        setActiveSocStep(i);
        gtaAudio.playStarSound(i);
        if (i === stepsCount) {
          setIsSimulatingSoc(false);
          setAlertTriggered(true);
          gtaAudio.playMissionSuccess();
        }
      }, i * 650);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(56,189,248,0.25)] space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {project.incidentNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                {project.status}
              </span>
            </div>
            <h3 className="gta-heading text-3xl sm:text-4xl text-white tracking-wide">
              {project.title}
            </h3>
          </div>

          <button
            onClick={() => {
              gtaAudio.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stack */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">STACK:</span>
          <span className="text-emerald-400 font-bold">{project.technology}</span>
        </div>

        {/* Splunk Simulation Pipeline if splunk project */}
        {isSplunk && project.socVisualization && (
          <div className="bg-black/60 p-4 rounded-xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                SPLUNK SIEM TELEMETRY SIMULATOR
              </span>

              <button
                onClick={handleSimulateSoc}
                disabled={isSimulatingSoc}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs shadow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulatingSoc ? 'SIMULATING...' : 'TRIGGER ATTACK'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
              {project.socVisualization.steps.map((step, idx) => {
                const isPassed = activeSocStep >= idx + 1;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isPassed
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'bg-black/40 border-white/10 text-slate-500'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400">0{idx + 1}</span>
                    <strong className="block text-white mt-1">{step.name}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{step.detail}</span>
                  </div>
                );
              })}
            </div>

            {alertTriggered && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>CRITICAL CORRELATION: BRUTE-FORCE LOGON PATTERN INTERCEPTED & CONTAINED!</span>
              </div>
            )}
          </div>
        )}

        {/* Problem and Approach */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase block mb-1">
              THE VULNERABILITY / PROBLEM
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">{project.problem}</p>
          </div>
          <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block mb-1">
              DEFENSIVE ARCHITECTURE
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">{project.approach}</p>
          </div>
        </div>

        {/* Implementation steps */}
        <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
            IMPLEMENTATION ARTIFACTS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            {project.implementation.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What I Learned */}
        <div className="border-l-2 border-fuchsia-400 pl-3 py-1 bg-fuchsia-950/20 rounded-r text-xs text-slate-300 font-mono">
          <strong className="text-fuchsia-300 block mb-0.5 font-bold">OPERATIONAL TAKEAWAY:</strong>
          {project.whatILearned}
        </div>

      </div>
    </div>
  );
};
