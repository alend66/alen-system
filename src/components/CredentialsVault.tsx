import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const CredentialsVault: React.FC = () => {
  const { education, certifications } = PORTFOLIO_DATA;

  return (
    <section id="credentials" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-mono">
      
      {/* Section Header */}
      <div className="text-center mb-14 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          FOUNDATIONS & ACCREDITATIONS
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          System Foundation & Credentials Vault
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Formal academic computer science degree paired with specialized cyber defense training, workshops, and conference engagements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Education (System Foundation) Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-extrabold text-white font-sans uppercase tracking-wider">
              System Foundation // Education
            </h3>
          </div>

          <div className="space-y-4">
            {education.map((item, index) => (
              <div
                key={item.degree}
                className="bg-[#090d14]/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-bold uppercase">
                    DEGREE {index === 0 ? '01' : '02'}
                  </span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                    ACCREDITED
                  </span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white font-sans">
                    {item.degree}
                  </h4>
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {item.institution}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed font-sans">
                  {item.focus}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications (Credentials Vault) Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-extrabold text-white font-sans uppercase tracking-wider">
              Credentials Vault // Certifications
            </h3>
          </div>

          <div className="space-y-4">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="bg-[#090d14]/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold">
                    {cert.type}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>{cert.date}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-sans leading-snug">
                    {cert.title}
                  </h4>
                  <div className="text-xs text-cyan-300 font-medium mt-1">
                    {cert.issuer}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Qualification</span>
                  </span>
                  <span className="text-slate-600">ID: AUTHORITATIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
