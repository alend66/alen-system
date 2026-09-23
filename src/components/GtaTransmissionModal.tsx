import React, { useState } from 'react';
import { X, Send, CheckCircle2, Shield, Lock } from 'lucide-react';
import { gtaAudio } from '../utils/gtaAudio';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface GtaTransmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GtaTransmissionModal: React.FC<GtaTransmissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { personal } = PORTFOLIO_DATA;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    gtaAudio.playMissionSuccess();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative z-10 w-full max-w-lg bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(56,189,248,0.25)] space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>ENCRYPTED TRANSMISSION PROTOCOL</span>
            </div>
            <h3 className="gta-heading text-3xl sm:text-4xl text-white">
              DISPATCH MESSAGE
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

        {isSent ? (
          <div className="p-8 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold font-sans text-white">
              TRANSMISSION BROADCASTED!
            </h4>
            <p className="text-xs font-mono text-slate-300">
              Message securely dispatched to <span className="text-cyan-400">{personal.email}</span>. Alen will respond promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">
                CALL-SIGN / NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chief InfoSec Officer / Recruiter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">
                RETURN FREQUENCY / EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">
                MISSION BRIEF / MESSAGE
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Details regarding Linux administration, SOC engineering opportunities, or security investigations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={`mailto:${personal.email}?subject=Vice%20City%20Cyber%20Contact`}
                className="text-[11px] text-slate-400 hover:text-cyan-300 underline"
              >
                Or open default mail client
              </a>

              <button
                type="submit"
                onMouseEnter={() => gtaAudio.playHover()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <span>TRANSMIT</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
