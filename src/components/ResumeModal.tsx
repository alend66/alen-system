import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  X, 
  Printer, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  FileText, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { personal, experience, education, certifications, projects, skillCategories } = PORTFOLIO_DATA;

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playExecute();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0d1117] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="no-print bg-[#131924] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white tracking-wider uppercase">
              AUTHORITATIVE RESUME VIEWER // ALEN DAVIS K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Resume Sheet */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-[#0a0d14] text-slate-200 font-sans space-y-8 print:p-0 print:bg-white print:text-black">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/alen-davis.jpg" 
                  alt="Alen Davis K" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500/60 print:border-gray-800 shadow-md shrink-0"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight">
                    {personal.name}
                  </h1>
                  <p className="text-sm font-mono text-cyan-400 print:text-gray-800 font-semibold mt-1">
                    Target: {personal.careerGoal}
                  </p>
                </div>
              </div>

              <div className="font-mono text-xs space-y-1 text-slate-300 print:text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
                  <span>{personal.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
                  <a href={`mailto:${personal.email}`} className="hover:underline">{personal.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
                  <span>{personal.phone}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 print:border-gray-300">
              <p className="text-xs sm:text-sm text-slate-300 print:text-gray-800 leading-relaxed font-sans">
                {personal.professionalIdentity} &ldquo;{personal.headlineQuote}&rdquo; {personal.mindsetQuote}
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-black uppercase border-b border-slate-800 print:border-black pb-1">
              EDUCATION // SYSTEM FOUNDATION
            </h2>
            <div className="space-y-3 font-sans">
              {education.map((edu) => (
                <div key={edu.degree} className="text-xs">
                  <div className="flex justify-between font-bold text-white print:text-black text-sm">
                    <span>{edu.degree}</span>
                    <span className="font-mono text-slate-400 print:text-gray-600 text-xs">{edu.location}</span>
                  </div>
                  <div className="text-cyan-300 print:text-gray-700 font-semibold">{edu.institution}</div>
                  <div className="text-slate-400 print:text-gray-600 mt-0.5">{edu.focus}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Experience */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-black uppercase border-b border-slate-800 print:border-black pb-1">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4 font-sans">
              {experience.map((exp) => (
                <div key={exp.organization} className="text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-white print:text-black text-sm">
                    <span>{exp.role}</span>
                    <span className="font-mono text-cyan-400 print:text-black text-xs">{exp.dateBadge}</span>
                  </div>
                  <div className="text-slate-300 print:text-gray-700 font-semibold">{exp.organization}</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-gray-800 mt-1 pl-1">
                    {exp.details.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-black uppercase border-b border-slate-800 print:border-black pb-1">
              ENGINEERING PROJECTS // INCIDENT REPORTS
            </h2>
            <div className="space-y-4 font-sans">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white print:text-black text-sm">
                    <span>{proj.title}</span>
                    <span className="font-mono text-emerald-400 print:text-black text-xs font-bold">[{proj.status}]</span>
                  </div>
                  <div className="font-mono text-cyan-300 print:text-gray-700">Technology: {proj.technology}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-gray-800 pl-1">
                    {proj.implementation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-black uppercase border-b border-slate-800 print:border-black pb-1">
              CREDENTIALS & CERTIFICATIONS
            </h2>
            <div className="space-y-2 font-sans text-xs">
              {certifications.map((cert) => (
                <div key={cert.title} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-white print:text-black">{cert.title}</span>
                    <span className="text-slate-400 print:text-gray-600 ml-2">({cert.issuer})</span>
                  </div>
                  <span className="font-mono text-slate-400 print:text-gray-600 text-[11px]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-black uppercase border-b border-slate-800 print:border-black pb-1">
              TECHNICAL SKILLS & COMPETENCIES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {skillCategories.map((cat) => (
                <div key={cat.category} className="p-2 rounded bg-slate-900/50 print:bg-transparent border border-slate-800 print:border-none">
                  <div className="text-cyan-400 print:text-black font-bold text-[11px] uppercase">{cat.category}</div>
                  <div className="text-slate-300 print:text-gray-800 text-[11px] mt-0.5">{cat.skills.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer (Non-printable) */}
        <div className="no-print bg-[#131924] px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Source: Authoritative Resume of Alen Davis K</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Sheet
          </button>
        </div>

      </div>
    </div>
  );
};
