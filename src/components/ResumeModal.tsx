import React, { useEffect } from 'react';
import { PORTFOLIO_CONTENT } from '../content';
import { sound } from '../utils/sound';
import {
  X,
  Printer,
  Download,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TECHNICAL_SKILL_ROWS = [
  {
    label: 'SIEM & Log Monitoring',
    value:
      'Splunk Enterprise, Universal Forwarder, SPL, Sysmon, Windows Security Event Logs (4625/4624), Alert Tuning',
  },
  {
    label: 'Network & Traffic Analysis',
    value:
      'Wireshark, TCP/IP, Nmap, Packet Inspection, DNS/DHCP, Subnetting, Basic Firewall Rules',
  },
  {
    label: 'Vulnerability Assessment',
    value:
      'Nessus, Port Scanning, Service Enumeration, Burp Suite, Metasploit, OWASP Top 10 Fundamentals',
  },
  {
    label: 'Systems & Scripting',
    value:
      'Linux (Ubuntu/CentOS/Kali, Bash Shell Scripting), Windows Server, Python (hashlib, Automation), Embedded C/C++',
  },
  {
    label: 'Security Frameworks',
    value:
      'MITRE ATT&CK Framework, Cyber Kill Chain, Incident Response Lifecycle, Access Control, Cryptographic Hashing',
  },
];

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { identity, experience, projects, certifications } = PORTFOLIO_CONTENT;

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('resume-modal-open');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.classList.remove('resume-modal-open');
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playExecute();
    window.print();
  };

  return (
    <div
      className="resume-modal-root fixed inset-0 z-[10000] bg-black/82 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain print:static print:inset-auto print:bg-white print:p-0 print:block print:overflow-visible"
      role="dialog"
      aria-modal="true"
      aria-label="Resume of Alen Davis K"
    >
      {/* Click backdrop to close */}
      <div className="no-print fixed inset-0" onClick={onClose} />

      {/* Studio PDF Viewer Frame */}
      <div className="relative w-full max-w-[920px] bg-[#16151c] border border-white/15 rounded-xl shadow-[0_28px_90px_rgba(0,0,0,0.8)] overflow-hidden z-10 my-1 sm:my-4 flex flex-col max-h-[95svh] print:max-h-none print:shadow-none print:border-0 print:rounded-none print:bg-white print:my-0">
        {/* Top Viewer Toolbar */}
        <div className="no-print bg-[#100f15] px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-2 text-xs text-zinc-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-[#a479f5] shrink-0" />
            <span className="font-semibold text-white tracking-wide truncate">
              Alen_Davis_K_Resume.pdf
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
              A4 DOCUMENT
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={identity.resumePdfUrl}
              download="Alen_Davis_K_Resume.pdf"
              onClick={() => sound.playExecute()}
              className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[#4c0aaf] hover:bg-[#5c16c9] text-white text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download Original PDF"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-100 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Resume Viewer"
              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Desk Surface Containing Realistic A4 Paper Sheet */}
        <div className="overflow-y-auto overscroll-contain bg-[#201f27] p-2 sm:p-6 md:p-8 print:p-0 print:bg-white print:overflow-visible">
          <article className="bg-white text-[#18181b] max-w-[820px] mx-auto px-4 py-6 sm:px-10 sm:py-10 md:px-12 md:py-11 shadow-[0_18px_50px_rgba(0,0,0,0.45)] rounded-[2px] font-sans leading-snug print:shadow-none print:max-w-none print:p-0">
            {/* Document Header */}
            <header className="text-center border-b-2 border-[#1e293b] pb-4 mb-5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
                <img
                  src={identity.photoUrl}
                  alt={identity.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
                />
                <div className="sm:text-left text-center">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a] uppercase">
                    {identity.fullName}
                  </h1>
                  <p className="text-xs sm:text-[13px] font-semibold text-[#4c0aaf] mt-0.5 tracking-wide">
                    SOC Analyst (L1) &amp; Linux System Engineer
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  {identity.location}
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <a
                  href={`mailto:${identity.email}`}
                  className="inline-flex items-center gap-1 text-[#1d4ed8] hover:underline break-all"
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  {identity.email}
                </a>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <a
                  href={identity.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1d4ed8] hover:underline font-medium"
                >
                  github.com/alend66
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </header>

            {/* Professional Summary */}
            <section className="mb-5">
              <h2 className="text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase text-[#0f172a] border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                Computer Science graduate with an Advanced Diploma in Cyber Defence, seeking an
                entry-level{' '}
                <strong className="font-semibold text-slate-900">
                  SOC Analyst (L1) / Cybersecurity &amp; Linux System Engineer
                </strong>{' '}
                role. Hands-on capability in{' '}
                <strong className="font-semibold text-slate-900">
                  Splunk SIEM log monitoring (Sysmon, Windows Event IDs 4625/4624)
                </strong>
                , Linux server administration, network traffic inspection (Wireshark, TCP/IP), and
                incident triage backed by Police Cyber Cell digital forensics and HashRoot server
                operations experience.
              </p>
            </section>

            {/* Technical Skills (Clean Tabular Rows) */}
            <section className="mb-5">
              <h2 className="text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase text-[#0f172a] border-b border-slate-300 pb-1 mb-2.5">
                Technical Skills
              </h2>
              <div className="space-y-1.5 text-xs sm:text-[13px]">
                {TECHNICAL_SKILL_ROWS.map(row => (
                  <div
                    key={row.label}
                    className="flex flex-col sm:grid sm:grid-cols-[195px_1fr] sm:gap-3 border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <div className="font-semibold text-slate-900">{row.label}:</div>
                    <div className="text-slate-700 leading-snug">{row.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Practical Experience */}
            <section className="mb-5">
              <h2 className="text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase text-[#0f172a] border-b border-slate-300 pb-1 mb-3">
                Practical Experience
              </h2>
              <div className="space-y-4">
                {experience.map(exp => (
                  <div key={exp.company} className="text-xs sm:text-[13px]">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                      <h3 className="font-bold text-slate-900">
                        {exp.role}{' '}
                        <span className="font-medium text-slate-400 mx-1">|</span>{' '}
                        <span className="font-semibold text-slate-800">{exp.company}</span>
                      </h3>
                      <span className="text-[11px] sm:text-xs text-slate-500 font-medium shrink-0">
                        {exp.location}
                      </span>
                    </div>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-700 leading-relaxed">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Cybersecurity Projects & Labs */}
            <section className="mb-5">
              <h2 className="text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase text-[#0f172a] border-b border-slate-300 pb-1 mb-3">
                Cybersecurity Projects &amp; Labs
              </h2>
              <div className="space-y-3.5 text-xs sm:text-[13px]">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className="font-bold text-slate-900">{proj.name}</h3>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-[#1d4ed8] hover:underline no-print"
                        >
                          [GitHub Repo ↗]
                        </a>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium shrink-0 uppercase tracking-wide">
                        {proj.illustrationType === 'siem'
                          ? 'Security Lab Project'
                          : proj.illustrationType === 'fim'
                            ? 'Independent Security Tool'
                            : 'Embedded IoT Security'}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-[#1d4ed8] mt-0.5">
                      {proj.stack.join(' • ')}
                    </div>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-700 leading-relaxed">
                      <li>{proj.hook}</li>
                      <li>{proj.built}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Credentials */}
            <section>
              <h2 className="text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase text-[#0f172a] border-b border-slate-300 pb-1 mb-3">
                Education &amp; Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-[13px] mb-3.5">
                <div className="border-l-2 border-[#1e293b] pl-3">
                  <div className="font-bold text-slate-900">
                    Bachelor of Science in Computer Science
                  </div>
                  <div className="text-slate-700">
                    Sahrdaya College of Advanced Studies, Kodakara
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Kerala, India</div>
                </div>
                <div className="border-l-2 border-[#4c0aaf] pl-3">
                  <div className="font-bold text-slate-900">
                    Advanced Diploma in Cyber Defence (ADCD v3)
                  </div>
                  <div className="text-slate-700">Red Team Hackers Academy, Thrissur</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Kerala, India • Defensive Security &amp; SIEM Operations
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
                {certifications.slice(2).map(cert => (
                  <div
                    key={cert.name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <span className="font-semibold text-slate-900">{cert.name}</span>
                    <span className="text-slate-500 text-[11px]">{cert.issuer}</span>
                  </div>
                ))}
                {certifications.slice(1, 2).map(cert => (
                  <div
                    key={cert.name}
                    className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <span className="font-semibold text-slate-900">{cert.name}</span>
                    <span className="text-slate-500 text-[11px]">{cert.issuer}</span>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>

        {/* Bottom Status Bar */}
        <div className="no-print bg-[#100f15] px-3 sm:px-5 py-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 shrink-0">
          <span className="truncate">Alen Davis K · Thrissur, Kerala · Authoritative CV</span>
          <div className="flex items-center gap-2">
            <a
              href={identity.resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-[11px]"
            >
              Open Raw PDF ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
