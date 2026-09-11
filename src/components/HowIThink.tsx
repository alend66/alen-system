import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  GitCommit, 
  Eye, 
  Search, 
  Shield, 
  Terminal, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Workflow
} from 'lucide-react';

export const HowIThink: React.FC = () => {
  const steps = PORTFOLIO_DATA.howIThinkSteps;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = steps[activeStepIndex];

  const handleSelectStep = (idx: number) => {
    sound.playTone(550 + idx * 60, 0.03, 'sine', 0.03);
    setActiveStepIndex(idx);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Search': return <Search className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Workflow className="w-5 h-5" />;
    }
  };

  return (
    <section id="how-i-think" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
          FEATURE 04 // ROOT CAUSE ARCHITECTURE
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          HOW I THINK
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-xl mx-auto">
          System administration and security are not about guessing patches. They are about systematic root-cause diagnosis.
        </p>
      </div>

      {/* Core Philosophy Banner */}
      <div className="max-w-4xl mx-auto mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0d121c] via-[#0f172a] to-[#0d121c] border border-cyan-500/30 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4" /> CORE ENGINEERING PHILOSOPHY
        </div>
        <blockquote className="text-xl sm:text-3xl font-extrabold text-white font-sans leading-snug tracking-tight">
          &ldquo;I enjoy understanding the <span className="text-cyan-400 underline decoration-cyan-500/40">root cause</span> of technical problems rather than simply treating the symptoms.&rdquo;
        </blockquote>
        <p className="text-xs font-mono text-slate-400 mt-4">
          From Alen Davis K&apos;s Engineering Profile & Professional Summary
        </p>
      </div>

      {/* 6-Stage Troubleshooting Pipeline Visual */}
      <div className="bg-[#090d14]/90 border border-cyan-500/30 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Step Progression Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {steps.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => handleSelectStep(idx)}
                className={`p-3 rounded-lg border font-mono text-left transition-all relative ${
                  isCurrent
                    ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-102 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-bold ${isCurrent ? 'text-cyan-300' : 'text-slate-500'}`}>
                    STEP {step.step}
                  </span>
                  <span className={isCurrent ? 'text-cyan-400' : 'text-slate-500'}>
                    {getStepIcon(step.icon)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold tracking-wider font-sans">
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Breakdown of Active Step */}
        <div className="p-6 rounded-xl bg-[#0e131d] border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                PHASE 0{activeStepIndex + 1}
              </span>
              <h3 className="text-2xl font-extrabold text-white font-sans tracking-tight">
                {activeStep.title} // METHODOLOGY
              </h3>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {activeStep.description}
            </p>

            <div className="pt-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-1">
                ILLUSTRATIVE TERMINAL COMMAND HOOK:
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-black/80 border border-slate-700 font-mono text-xs text-emerald-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>$ {activeStep.command}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[11px]">
              ENGINEERING OUTCOME:
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero superficial guesswork</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Repeatable deterministic proof</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Documented incident remediation</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
