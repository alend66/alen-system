import React from 'react';
import { X, Award, GraduationCap, ShieldCheck, CheckCircle2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GtaCredentialsModal: React.FC<GtaCredentialsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { certifications, education } = PORTFOLIO_DATA;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-pink-500/40 rounded-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(244,114,182,0.25)] space-y-6 text-slate-200 font-mono">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">
                VERIFIED CREDENTIALS ARCHIVE
              </span>
            </div>
            <h3 className="gta-heading text-3xl sm:text-4xl text-white tracking-wide">
              CREDENTIALS & DEGREES
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

        {/* Academic Foundations */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            ACADEMIC FOUNDATION
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {education.map((item, idx) => (
              <div key={idx} className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold block">DEGREE 0{idx + 1}</span>
                <h4 className="text-sm font-bold text-white font-sans">{item.degree}</h4>
                <p className="text-slate-400">{item.institution}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{item.location}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans border-t border-white/5 pt-2">
                  {item.focus}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Vault */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            OFFICIAL ACCREDITATIONS & CONFERENCES
          </span>

          <div className="space-y-2.5">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-pink-500/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <h5 className="text-xs sm:text-sm font-bold text-white font-sans">
                      {cert.title}
                    </h5>
                  </div>
                  <div className="text-[11px] text-slate-400 ml-6">
                    {cert.issuer}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6 sm:ml-0 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-pink-950/40 border border-pink-500/30 text-pink-300 text-[10px]">
                    {cert.badgeCode}
                  </span>
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {cert.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
