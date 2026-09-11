import React, { useState } from 'react';
import { PORTFOLIO_DATA, ProjectIncident } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Send, 
  Cpu, 
  Search, 
  Terminal, 
  AlertTriangle, 
  Lock, 
  Play, 
  Layers, 
  Flame,
  Radio
} from 'lucide-react';

export const ProjectsIncidents: React.FC = () => {
  const projects = PORTFOLIO_DATA.projects;
  const [activeSocStep, setActiveSocStep] = useState<number>(0);
  const [isSimulatingSoc, setIsSimulatingSoc] = useState<boolean>(false);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);

  // Splunk pipeline simulation
  const handleSimulateSoc = () => {
    if (isSimulatingSoc) return;
    sound.playExecute();
    setIsSimulatingSoc(true);
    setAlertTriggered(false);
    setActiveSocStep(0);

    const stepsCount = 5;
    for (let i = 1; i <= stepsCount; i++) {
      setTimeout(() => {
        setActiveSocStep(i);
        sound.playTone(500 + i * 100, 0.04, 'sine', 0.03);
        if (i === stepsCount) {
          setIsSimulatingSoc(false);
          setAlertTriggered(true);
          sound.playTone(880, 0.1, 'sawtooth', 0.04);
        }
      }, i * 650);
    }
  };

  return (
    <section id="projects" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          FEATURE 03 // INCIDENT DOSSIERS & INVESTIGATIONS
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Projects as Technical Incidents
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl mx-auto">
          Engineering challenges framed as technical investigations. From filesystem integrity validation to hardware access control and enterprise SOC log ingestion.
        </p>
      </div>

      <div className="space-y-10">
        {projects.map((project, index) => {
          const isSplunk = project.id === 'splunk-siem-monitoring';

          return (
            <div
              key={project.id}
              className="bg-[#090d14]/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300"
            >
              {/* Incident Header Ribbon */}
              <div className="bg-[#0e131d] px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-bold uppercase tracking-wider">
                    {project.incidentNumber}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 font-semibold">{project.technology}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">INCIDENT STATE:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-widest ${
                      project.status === 'RESOLVED'
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                        : project.status === 'DEPLOYED'
                        ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/40'
                        : 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Incident Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Title & Tags */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 font-mono">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Problem vs Approach Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      PROBLEM STATEMENT
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {project.problem}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                      ENGINEERING APPROACH
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {project.approach}
                    </p>
                  </div>
                </div>

                {/* Splunk SIEM Mini SOC Dashboard Visualization */}
                {isSplunk && project.socVisualization && (
                  <div className="mt-4 p-5 rounded-xl bg-[#070a10] border border-cyan-500/30 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-white font-bold uppercase tracking-wider">
                          SOC INGESTION TELEMETRY // BRUTE-FORCE DETECTOR
                        </span>
                      </div>

                      <button
                        onClick={handleSimulateSoc}
                        disabled={isSimulatingSoc}
                        className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all ${
                          isSimulatingSoc
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 shadow-lg shadow-cyan-500/20'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isSimulatingSoc ? 'Streaming Logs...' : 'Simulate Log Pipeline'}</span>
                      </button>
                    </div>

                    {/* Visual SOC Pipeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                      {project.socVisualization.steps.map((step, idx) => {
                        const isCurrent = activeSocStep === idx + 1;
                        const isPassed = activeSocStep > idx + 1;

                        return (
                          <div
                            key={step.name}
                            className={`p-3 rounded-lg border font-mono transition-all text-center relative ${
                              isCurrent
                                ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/30 scale-105 z-10'
                                : isPassed
                                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="text-[10px] text-slate-500 mb-1">NODE 0{idx + 1}</div>
                            <div className="font-bold text-xs text-slate-200">{step.name}</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-tight">{step.detail}</div>

                            {idx < 4 && (
                              <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                                →
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Alert Banner */}
                    {alertTriggered && (
                      <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/60 text-red-300 font-mono text-xs flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-400 animate-bounce" />
                          <span>
                            <strong>[CRITICAL ALERT]</strong> Event ID 4625 anomaly: 10 failed logon attempts detected from 192.168.1.105 within 30s!
                          </span>
                        </div>
                        <span className="text-[10px] bg-red-900/60 px-2 py-0.5 rounded border border-red-500/30">
                          CORRELATION FIRED
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Implementation Points */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    TECHNICAL IMPLEMENTATION SPECIFICATION:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {project.implementation.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded bg-[#0b0e14] border border-slate-800/80 text-xs font-mono text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What I Learned */}
                <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                      ENGINEERING TAKEAWAYS // LESSONS LEARNED
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 font-sans">
                      {project.whatILearned}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
