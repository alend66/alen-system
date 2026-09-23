import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, Copy, Globe, Code2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { gtaAudio } from '../../utils/gtaAudio';

interface ContactSceneProps {
  onOpenTransmissionModal: () => void;
}

export const ContactScene: React.FC<ContactSceneProps> = ({
  onOpenTransmissionModal,
}) => {
  const { personal } = PORTFOLIO_DATA;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    gtaAudio.playMissionSuccess();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contactItems = [
    {
      label: 'EMAIL',
      value: personal.email,
      href: `mailto:${personal.email}`,
      icon: Mail,
      color: 'text-cyan-400'
    },
    {
      label: 'LOCATION',
      value: `${personal.location}, India`,
      href: null,
      icon: MapPin,
      color: 'text-emerald-400'
    },
    {
      label: 'PHONE',
      value: personal.phone,
      href: `tel:${personal.phone.replace(/\\s+/g, '')}`,
      icon: Phone,
      color: 'text-yellow-400'
    },
    {
      label: 'LINKEDIN',
      value: 'linkedin.com/in/alen-davis-k-69394a3bb',
      href: personal.linkedin || 'https://www.linkedin.com/in/alen-davis-k-69394a3bb',
      icon: Globe,
      color: 'text-blue-400'
    },
    {
      label: 'GITHUB',
      value: 'github.com/alend66',
      href: 'https://github.com/alend66',
      icon: Code2,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-none px-4 sm:px-8 md:px-16 pt-20 sm:pt-24 pb-28 sm:pb-32 flex flex-col items-center">
      
      {/* Background Graphic: Clean Vice City Coastal Highway at Night */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 animate-bg-drift pointer-events-none"
        style={{ 
          backgroundImage: "url('/gta/gta_contact_car.jpg')",
          filter: "contrast(1.05) saturate(1.1) brightness(0.95)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
      </div>

      {/* Ambient Neon Atmosphere Glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2.5s' }}></div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-xl text-left w-full">
        
        {/* Title & Subtitle (GTA Style - Photo 1) */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center gap-2.5 mb-1.5 animate-entrance-left delay-100">
            {/* Operative Avatar */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/70 shadow-md">
                <img
                  src="/alen-davis.jpg"
                  alt="Alen Davis K"
                  className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider block">
                  OPERATIVE DIRECT LINE // LIVE
                </span>
              </div>
              <span className="text-xs font-mono text-slate-300 font-semibold">
                Alen Davis K // Thrissur, Kerala
              </span>
            </div>
          </div>

          <h2 className="gta-heading text-4xl sm:text-6xl font-black text-white tracking-wider leading-none animate-entrance-left delay-200">
            CONTACT
          </h2>
          <span className="gta-script text-2xl sm:text-3xl text-cyan-300 block -mt-1 transform -rotate-1 animate-entrance-left delay-300">
            Let's Connect
          </span>
        </div>

        {/* Tactical Glass Card */}
        <div className="relative gta-glass-card rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl space-y-2.5 overflow-hidden animate-entrance-up delay-300 hover:border-white/25 transition-colors duration-300">

          {/* Comms Telemetry & Frequency Equalizer Bar */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[10px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              FREQ: 142.80 MHz // ENCRYPTED
            </span>
            {/* Live Audio Equalizer Waveform */}
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-cyan-400 rounded-t eq-bar" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }}></span>
              <span className="w-1 bg-emerald-400 rounded-t eq-bar" style={{ animationDelay: '0.3s', animationDuration: '1.1s' }}></span>
              <span className="w-1 bg-cyan-300 rounded-t eq-bar" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }}></span>
              <span className="w-1 bg-blue-400 rounded-t eq-bar" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}></span>
              <span className="w-1 bg-fuchsia-400 rounded-t eq-bar" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}></span>
            </div>
          </div>

          <div className="space-y-1.5">
            {contactItems.map((item, idx) => {
              const IconComp = item.icon;
              const delayClass = [
                'delay-100',
                'delay-200',
                'delay-300',
                'delay-400',
                'delay-500'
              ][idx] || 'delay-100';

              return (
                <div
                  key={idx}
                  className={`animate-entrance-left ${delayClass} flex items-center justify-between p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400/50 hover:bg-black/80 transition-all duration-200 group transform hover:translate-x-1`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-md bg-white/5 border border-white/10 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10 flex-shrink-0 transition-colors">
                      <IconComp className={`w-3.5 h-3.5 ${item.color} transform group-hover:scale-110 transition-transform duration-200`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 group-hover:text-cyan-300 uppercase block transition-colors">
                        {item.label}
                      </span>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-slate-200 hover:text-cyan-300 font-mono truncate block transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-200 font-mono truncate block">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(item.value, item.label)}
                    onMouseEnter={() => gtaAudio.playHover()}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors flex-shrink-0 active:scale-95"
                    title={`Copy ${item.label}`}
                  >
                    {copiedKey === item.label ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-1.5">
            <button
              onClick={() => {
                gtaAudio.playClick();
                onOpenTransmissionModal();
              }}
              onMouseEnter={() => gtaAudio.playHover()}
              className="btn-shimmer group w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans font-extrabold text-xs sm:text-sm tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>SEND MESSAGE</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
