import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Radio, 
  Shield, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleCopyEmail = () => {
    sound.playKeypress();
    navigator.clipboard.writeText(personal.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    sound.playKeypress();
    navigator.clipboard.writeText(personal.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playExecute();
    setIsSent(true);
    setTimeout(() => {
      sound.playSuccess();
    }, 400);
  };

  return (
    <section id="connect" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-mono">
      {/* Header */}
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          CONNECTION PROTOCOL // INGESTION SOCKET
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          ESTABLISH CONNECTION
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold tracking-wider pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          STATUS: OPEN TO OPPORTUNITIES
        </div>
      </div>

      <div className="bg-[#090d14]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
        
        {/* Terminal Handshake Message */}
        <div className="p-4 rounded-xl bg-[#06090e] border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-emerald-400 font-bold">&gt;</span>
            <span className="text-cyan-300 font-bold">$ connect --with=alen</span>
          </div>
          <div className="text-emerald-400 font-semibold pl-4">
            Connection channel ready. Socket listening on port 443 / TLS 1.3 verified.
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Email Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <Mail className="w-5 h-5 text-cyan-400" />
              <button
                onClick={handleCopyEmail}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded"
                title="Copy email"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">PRIMARY EMAIL</div>
              <a
                href={`mailto:${personal.email}`}
                className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors break-all"
              >
                {personal.email}
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <Phone className="w-5 h-5 text-emerald-400" />
              <button
                onClick={handleCopyPhone}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded"
                title="Copy phone"
              >
                {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">DIRECT LINE</div>
              <a
                href={`tel:${personal.phone}`}
                className="text-xs sm:text-sm font-bold text-white hover:text-emerald-300 transition-colors"
              >
                {personal.phone}
              </a>
            </div>
          </div>

          {/* Location Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                RESIDENCE
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">LOCATION</div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {personal.location}
              </div>
            </div>
          </div>

        </div>

        {/* Dispatch Message Console */}
        <div className="p-6 rounded-xl bg-[#06090e] border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>DISPATCH TELEMETRY PACKET // SEND MESSAGE</span>
            </div>
            <span className="text-[10px] text-slate-500">DIRECT PIPE</span>
          </div>

          {isSent ? (
            <div className="p-6 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">
                Packet Dispatched Successfully
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you. You can also connect directly via email at <a href={`mailto:${personal.email}`} className="text-cyan-400 underline">{personal.email}</a>.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-2 text-xs text-cyan-400 hover:underline"
              >
                [ Send another transmission ]
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[11px]">IDENTIFIER (NAME):</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Tech Recruiter)"
                    className="w-full bg-[#0d121c] border border-slate-800 focus:border-cyan-500 rounded p-2.5 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[11px]">RETURN ADDRESS (EMAIL):</label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. s.jenkins@enterprise.com"
                    className="w-full bg-[#0d121c] border border-slate-800 focus:border-cyan-500 rounded p-2.5 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block text-[11px]">TRANSMISSION PAYLOAD (MESSAGE):</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inquire about Linux System Engineer openings, schedule an interview, or discuss system architecture..."
                  className="w-full bg-[#0d121c] border border-slate-800 focus:border-cyan-500 rounded p-2.5 text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Direct routing to {personal.email}
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT PACKET</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
