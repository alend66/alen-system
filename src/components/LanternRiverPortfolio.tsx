import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PORTFOLIO_CONTENT } from '../content';
import { RiverScene } from '../utils/RiverScene';

interface LanternRiverPortfolioProps {
  onOpenResume: () => void;
  onOpenCommandPalette: () => void;
}

interface MarketCardItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  summary: string;
  problem: string;
  built: string;
  stack: string[];
  githubUrl?: string;
  accent: string;
  badge: string;
}

const MARKET_CARDS: MarketCardItem[] = [
  {
    id: 'splunk-siem',
    title: 'Splunk SIEM Lab',
    subtitle: 'SIEM · Threat Detection',
    meta: 'Project 01 · Splunk Enterprise & Sysmon',
    summary:
      'Real-time brute-force and privilege-escalation correlation across Windows & Linux endpoints.',
    problem:
      'Distributed authentication logs across Windows and Linux endpoints make it difficult to spot brute-force bursts, anomalous logons, and privilege escalations in real time.',
    built:
      'Configured Splunk Enterprise with Universal Forwarder and Sysmon to ingest Windows Event Logs (4625/4624) and Linux auth logs, writing custom SPL correlation searches, dashboards, and real-time SOC alerts.',
    stack: ['Splunk Enterprise', 'Universal Forwarder', 'Sysmon', 'SPL', 'Event IDs 4625/4624', 'Linux Auth Logs'],
    githubUrl: 'https://github.com/alend66/alen-system',
    accent: '#FFB300',
    badge: 'SIEM',
  },
  {
    id: 'python-fim',
    title: 'SHA-256 File Monitor',
    subtitle: 'Python · Cryptography',
    meta: 'Project 02 · Endpoint Integrity Engine',
    summary:
      'Cryptographic SHA-256 & MD5 baseline verification for critical Linux system directories.',
    problem:
      'Unauthorized file modifications, backdoors, or configuration tampering on Linux servers can go unnoticed without continuous cryptographic integrity verification.',
    built:
      'Developed a Python & Shell security utility using hashlib (SHA-256 and MD5) that records cryptographic baselines of target directories and triggers immediate alerts on file creation, modification, or deletion.',
    stack: ['Python 3', 'hashlib SHA-256 / MD5', 'Bash Scripting', 'Linux Filesystem', 'Tamper Alerts'],
    githubUrl: 'https://github.com/alend66/alen-system',
    accent: '#7CCFB0',
    badge: 'FIM',
  },
  {
    id: 'esp32-rfid',
    title: 'ESP32 RFID Gate',
    subtitle: 'Hardware · Embedded C++',
    meta: 'Project 03 · Physical Access Control',
    summary:
      'Hardware-level physical authentication using embedded SPI communication.',
    problem:
      'Sensitive server rooms and lab zones require fast, tamper-resistant physical credential verification at the door hardware layer.',
    built:
      'Built an embedded access control prototype interfacing an ESP32 microcontroller with an MFRC522 RFID reader over SPI in C/C++, validating authorized UIDs in real time and rejecting unknown tags.',
    stack: ['ESP32 MCU', 'MFRC522 RFID', 'Embedded C/C++', 'SPI Protocol', 'UID Verification'],
    githubUrl: 'https://github.com/alend66/alen-system',
    accent: '#E2553F',
    badge: 'IOT',
  },
  {
    id: 'cyber-cell-dfir',
    title: 'Forensic Triage & OSINT',
    subtitle: 'Police Cyber Cell · DFIR',
    meta: 'Field Ops 04 · Thrissur Cyber Cell',
    summary:
      'Digital evidence acquisition across 15+ seized devices and OSINT tracing of 40+ phishing campaigns.',
    problem:
      'Live cybercrime and financial fraud investigations require strict chain-of-custody evidence imaging and rapid tracing of malicious phishing infrastructure.',
    built:
      'Supported forensic triage on 15+ mobile/storage devices, analyzed 40+ phishing email headers and domains via OSINT, inspected IP logs across 10+ fraud cases, and prepared Section 65B IT Act compliant reports.',
    stack: ['Digital Forensics', 'OSINT', 'Phishing Header Analysis', 'Chain of Custody', 'Section 65B IT Act'],
    accent: '#FFE082',
    badge: 'DFIR',
  },
  {
    id: 'hashroot-linux',
    title: 'Linux Fleet Hardening',
    subtitle: 'HashRoot · Server Admin',
    meta: 'Field Ops 05 · Kochi Infrastructure',
    summary:
      'Administered 20+ Ubuntu, CentOS & Windows servers and cut manual maintenance toil by 60%.',
    problem:
      'Production multi-node server fleets suffer from repetitive maintenance overhead, unrotated logs, and SSH exposure without disciplined automation.',
    built:
      'Configured IAM, SSH hardening, and firewall policies across 20+ servers, monitored 15+ host nodes for resource bottlenecks, and wrote Bash & Cron automation that reduced manual tasks by 60%.',
    stack: ['Ubuntu & CentOS', 'Windows Server AD', 'SSH Hardening', 'Bash & Cron', 'Firewall Policies'],
    accent: '#FF8F00',
    badge: 'OPS',
  },
  {
    id: 'adcd-vapt',
    title: 'ADCD v3 & Network Lab',
    subtitle: 'Red Team · DNS Solutions',
    meta: 'Field Ops 06 · VAPT & IP Networks',
    summary:
      'Offensive/defensive cyber lab work and Layer 1–3 surveillance network engineering.',
    problem:
      'Securing enterprise perimeters requires both offensive packet/vulnerability visibility and rock-solid physical/IP network segmentation.',
    built:
      'Completed Advanced Diploma in Cyber Defence (ADCD v3) practicing Wireshark, Nmap, Burp Suite, and Metasploit, alongside deploying NVR/DVR IP networks, subnetting, and Layer 1–3 fault isolation at DNS Solutions.',
    stack: ['Wireshark & Nmap', 'Burp Suite', 'Metasploit', 'TCP/IP & Subnetting', 'Managed Switches'],
    accent: '#7CCFB0',
    badge: 'NET',
  },
];

const RIBS_DATA = [
  {
    num: '01',
    vt: 'SIEM & SOC',
    title: 'SIEM & Threat Hunting',
    desc: 'Ingesting Windows Sysmon (Event IDs 4625/4624) and Linux auth telemetry into Splunk Enterprise to catch brute-force bursts and privilege escalation in real time.',
    chips: ['Splunk Enterprise', 'SPL Queries', 'Sysmon', 'Universal Forwarder', 'Alert Triage'],
  },
  {
    num: '02',
    vt: 'Linux Ops',
    title: 'Linux & Server Engineering',
    desc: 'Administering 20+ Ubuntu, CentOS, and Windows Server instances—locking down SSH, tuning systemd services, and automating backups and log rotation.',
    chips: ['Ubuntu & CentOS', 'SSH Hardening', 'Active Directory', 'Systemd & Cron', 'Firewall ACLs'],
  },
  {
    num: '03',
    vt: 'Forensics',
    title: 'Digital Forensics & OSINT',
    desc: 'Acquiring and triaging digital evidence across 15+ seized devices at Police Cyber Cell while tracing 40+ malicious domains and preparing Section 65B documentation.',
    chips: ['Device Triage', 'Chain of Custody', 'OSINT Recon', 'Email Header Analysis', 'Section 65B'],
  },
  {
    num: '04',
    vt: 'Scripting',
    title: 'Python & Bash Automation',
    desc: 'Writing cryptographic SHA-256/MD5 file integrity scanners in Python and automated Bash maintenance daemons that cut repetitive server toil by 60%.',
    chips: ['Python 3', 'hashlib SHA-256', 'Bash Shell', 'Cron Automation', 'Log Parsing'],
  },
  {
    num: '05',
    vt: 'Hardware',
    title: 'Networks, VAPT & Embedded',
    desc: 'Combining Wireshark, Nmap, and Burp Suite offensive testing with ESP32 + MFRC522 SPI hardware access control and Layer 1–3 network administration.',
    chips: ['ESP32 & RFID', 'Embedded C/C++', 'Wireshark & Nmap', 'Burp Suite', 'TCP/IP & VLANs'],
  },
];

const HANGING_TIERS = [
  {
    id: 0,
    shortLabel: 'Cyber\nCell',
    metric: '15+ Devices',
    sub: 'Police Cyber Cell · Thrissur',
    color: '#FFE082',
    cordHeight: 30,
    w: 82,
    h: 96,
    role: 'Cyber Security Intern — Police Cyber Cell',
    items: [
      'Forensically imaged & triaged 15+ seized mobile and storage devices',
      'Analyzed 40+ phishing email headers & domains via OSINT',
      'Investigated IP logs across 10+ financial fraud cases',
      'Prepared Section 65B IT Act compliant evidentiary reports',
    ],
  },
  {
    id: 1,
    shortLabel: 'HashRoot\nServers',
    metric: '20+ Servers',
    sub: 'HashRoot · Kochi, Kerala',
    color: '#FFB300',
    cordHeight: 52,
    w: 98,
    h: 114,
    role: 'Server Administrator Intern — HashRoot',
    items: [
      'Administered 20+ Ubuntu, CentOS & Windows Server instances',
      'Implemented SSH hardening, IAM user/group policies & firewalls',
      'Monitored 15+ host nodes for CPU, RAM, disk & service uptime',
      'Cut manual maintenance tasks by 60% with Bash & Cron scripts',
    ],
  },
  {
    id: 2,
    shortLabel: 'Credentials\n& Net',
    metric: 'ADCD v3',
    sub: 'Red Team Academy & DNS Solutions',
    color: '#E2553F',
    cordHeight: 20,
    w: 88,
    h: 104,
    role: 'Certifications & Network Administration',
    items: [
      'B.Sc. Computer Science — Sahrdaya College of Advanced Studies',
      'Advanced Diploma in Cyber Defence (ADCD v3) — Red Team Hackers Academy',
      'Trazada Cyber Forensic Workshop & Seasides Conference Delegate (Goa)',
      'CCTV & Networking Admin — DNS Solutions (Routers, Switches, Layer 1–3)',
    ],
  },
];

const LANTERN_CHOICES = [
  { id: 0, name: 'Lotus', speed: 3, gold: false, fast: false },
  { id: 1, name: 'Peony', speed: 3, gold: false, fast: false },
  { id: 2, name: 'Star', speed: 4, gold: false, fast: false },
  { id: 3, name: 'Bud', speed: 3, gold: false, fast: false },
  { id: 4, name: 'Paper box', speed: 2, gold: false, fast: false },
  { id: 5, name: 'Golden', speed: 5, gold: true, fast: true },
  { id: 6, name: 'Chain', speed: 4, gold: true, fast: false },
];

const ROUTE_ZONES = [
  { id: 'launch', num: '01', label: 'Launch steps', navLabel: 'Launch', side: 0 },
  { id: 'bridge', num: '02', label: 'Covered bridge', navLabel: 'About', side: -1 },
  { id: 'market', num: '03', label: 'Lantern market', navLabel: 'Projects', side: 1 },
  { id: 'pier', num: '04', label: 'Sampan pier', navLabel: 'Skills', side: -1 },
  { id: 'lanterns', num: '05', label: 'Fireworks bend', navLabel: 'Experience', side: 1 },
  { id: 'wish', num: '06', label: 'Wishing pier', navLabel: 'Contact', side: -1 },
];

export const LanternRiverPortfolio: React.FC<LanternRiverPortfolioProps> = ({
  onOpenResume,
  onOpenCommandPalette,
}) => {
  const { identity, about, numbers } = PORTFOLIO_CONTENT;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<RiverScene | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadPct, setLoadPct] = useState(18);
  const [activeZone, setActiveZone] = useState(0);
  const [freeDrift, setFreeDrift] = useState(false);
  const [trayVisible, setTrayVisible] = useState(true);
  const [lanternDesign, setLanternDesign] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dockClosed, setDockClosed] = useState(false);

  // Market carousel state
  const [litCardIdx, setLitCardIdx] = useState(0);
  const [ignitingIdx, setIgnitingIdx] = useState<number | null>(null);
  const [lightboxCard, setLightboxCard] = useState<MarketCardItem | null>(null);

  // Pier accordion state
  const [openRib, setOpenRib] = useState(0);

  // Fireworks bend hanging lantern tier state
  const [activeTier, setActiveTier] = useState(1);

  // Free drift speedometer
  const [speedKmh, setSpeedKmh] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);

  // Wish / contact form
  const [wishName, setWishName] = useState('');
  const [wishEmail, setWishEmail] = useState('');
  const [wishTopic, setWishTopic] = useState('SOC Analyst / SIEM Role');
  const [wishMsg, setWishMsg] = useState('');
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const showToast = useCallback((text: string, bad = false) => {
    setToast({ text, bad });
    setTimeout(() => {
      setToast(prev => (prev?.text === text ? null : prev));
    }, 3800);
  }, []);

  // Gentle pentatonic chime synthesizer using Web Audio API
  const playChime = useCallback(
    (freq = 528, dur = 1.1) => {
      if (!soundOn) return;
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch {
        // Ignore audio errors
      }
    },
    [soundOn]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (next) {
        if (!ambientGainRef.current) {
          // Soft night-water pink noise + warm fifth drone
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + white * 0.029;
            b1 = 0.985 * b1 + white * 0.032;
            b2 = 0.950 * b2 + white * 0.048;
            data[i] = (b0 + b1 + b2) * 0.18;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 420;

          const gain = ctx.createGain();
          gain.gain.value = 0.06;

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          ambientGainRef.current = gain;
        } else {
          ambientGainRef.current.gain.setTargetAtTime(0.06, ctx.currentTime, 0.25);
        }
        showToast('Night river ambience awake');
      } else if (ambientGainRef.current) {
        ambientGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      }
    } catch {
      // ignore
    }
  };

  // Initialize Three.js RiverScene & loader
  useEffect(() => {
    const t1 = setTimeout(() => setLoadPct(68), 160);
    const t2 = setTimeout(() => setLoadPct(100), 420);
    const t3 = setTimeout(() => setLoading(false), 780);

    if (!canvasRef.current) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const scene = new RiverScene(canvasRef.current, reduced, (kmh, boost) => {
      setSpeedKmh(kmh);
      setIsBoosting(boost);
    });
    sceneRef.current = scene;
    scene.start();

    const onResize = () => scene.resize();
    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      scene.setMouse(nx, -ny);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Scroll -> river progress & active zone tracking
  useEffect(() => {
    const onScroll = () => {
      if (!sceneRef.current || freeDrift) return;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      sceneRef.current.setProgress(p);

      // Determine active zone
      const vh = window.innerHeight;
      let bestIdx = 0;
      let bestDist = Infinity;
      ROUTE_ZONES.forEach((z, idx) => {
        const el = document.getElementById(z.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const centerDist = Math.abs(r.top + r.height * 0.45 - vh * 0.5);
        if (centerDist < bestDist) {
          bestDist = centerDist;
          bestIdx = idx;
        }
      });
      setActiveZone(bestIdx);
      sceneRef.current.setZone(bestIdx, ROUTE_ZONES[bestIdx].side);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [freeDrift]);

  // Reveal observer for `.reveal` plates
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.lr-reveal'));
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.16 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Keyboard controls for Free Drift (WASD / Arrows / Space wish / 1-7 lantern choice / L tray / Esc)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (lightboxCard) setLightboxCard(null);
        else if (freeDrift) {
          setFreeDrift(false);
          sceneRef.current?.setFree(false);
        }
        return;
      }

      if (freeDrift && sceneRef.current) {
        sceneRef.current.setKey(e.code, true);
        if (e.code === 'Space') {
          e.preventDefault();
          sceneRef.current.releaseSkyWish('#FFB300');
          playChime(660, 1.3);
          showToast('Released a sky lantern down the river');
        }
        if (e.key.toLowerCase() === 'l') {
          setTrayVisible(v => !v);
        }
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 7) {
          const idx = num - 1;
          setLanternDesign(idx);
          sceneRef.current.setLanternDesign(idx);
          playChime(440 + idx * 55, 0.9);
          showToast(`Switched lantern to ${LANTERN_CHOICES[idx].name}`);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      sceneRef.current?.setKey(e.code, false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [freeDrift, lightboxCard, playChime, showToast]);

  const handleToggleFreeDrift = (next?: boolean) => {
    const target = typeof next === 'boolean' ? next : !freeDrift;
    setFreeDrift(target);
    sceneRef.current?.setFree(target);
    playChime(target ? 587 : 440, 1.0);
    if (target) {
      showToast('Free Drift: steer with WASD or Arrow keys · Space releases a wish');
    }
  };

  const handleSelectLantern = (idx: number) => {
    setLanternDesign(idx);
    sceneRef.current?.setLanternDesign(idx);
    playChime(440 + idx * 55, 0.9);
  };

  const handleCardClick = (idx: number) => {
    const item = MARKET_CARDS[idx];
    if (litCardIdx === idx) {
      setLightboxCard(item);
      playChime(659, 1.1);
    } else {
      setLitCardIdx(idx);
      setIgnitingIdx(idx);
      playChime(528, 0.9);
      sceneRef.current?.spawnRippleAt(0, -120, 0xffb300);
      setTimeout(() => setIgnitingIdx(prev => (prev === idx ? null : prev)), 1050);
    }
  };

  const handleSelectTier = (idx: number) => {
    setActiveTier(idx);
    const tier = HANGING_TIERS[idx];
    sceneRef.current?.burst(tier.color, true);
    playChime(493 + idx * 80, 1.2);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleScreenshot = () => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.captureScreenshot();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'alen-davis-lantern-river.png';
    a.click();
    showToast('Saved night-river postcard screenshot');
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishEmail.trim() || !wishMsg.trim()) {
      showToast('Please write your name, email, and message on the lantern', true);
      return;
    }
    sceneRef.current?.releaseSkyWish('#FFB300');
    sceneRef.current?.burst('#FFE082', true);
    playChime(784, 1.5);
    navigator.clipboard?.writeText(identity.email).catch(() => {});
    showToast(`Lantern released! Opening dispatch to ${identity.email}`);
    const subject = encodeURIComponent(`[Lantern River Portfolio] ${wishTopic} — from ${wishName}`);
    const body = encodeURIComponent(`${wishMsg}\n\n— ${wishName} (${wishEmail})`);
    setTimeout(() => {
      window.open(`mailto:${identity.email}?subject=${subject}&body=${body}`, '_blank');
    }, 650);
    setWishMsg('');
  };

  const currentTier = HANGING_TIERS[activeTier];
  const speedRatio = Math.min(1, speedKmh / 22);
  const needleAngle = -90 + speedRatio * 180;

  return (
    <div className={`lr-root ${freeDrift ? 'free' : ''} ${!trayVisible ? 'tray-off' : ''} ${mobileMenu ? 'menu' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

        .lr-root {
          --amber:#FFB300;
          --amber-soft:#FFE082;
          --amber-deep:#FF8F00;
          --moon:#FFF8E1;
          --ink:#3E2723;
          --red:#E2553F;
          --jade:#7CCFB0;
          --night:#071A1D;
          --night-2:#0C2428;
          --night-3:#123236;
          --pearl:#F2F6F5;
          --muted:color-mix(in srgb, var(--pearl) 68%, var(--night));
          --faint:color-mix(in srgb, var(--pearl) 42%, var(--night));
          --amber-text:color-mix(in srgb, var(--amber-soft) 86%, var(--pearl));
          --line:color-mix(in srgb, var(--amber) 26%, transparent);
          --line-soft:color-mix(in srgb, var(--pearl) 13%, transparent);
          --plate:color-mix(in srgb, var(--night) 74%, transparent);
          --plate-solid:color-mix(in srgb, var(--night) 94%, var(--amber) 6%);
          --glow:0 0 22px color-mix(in srgb, var(--amber) 45%, transparent);
          --bar:68px;
          --display:'Cormorant Garamond', Georgia, serif;
          --ui:'Albert Sans', system-ui, sans-serif;
          --ease:cubic-bezier(.19,.86,.22,1);
          --spring:cubic-bezier(.34,1.32,.52,1);
          background:var(--night);
          color:var(--pearl);
          font-family:var(--ui);
          font-weight:400;
          font-size:16px;
          line-height:1.6;
          min-height:100vh;
          overflow-x:clip;
        }

        .lr-scene {
          position:fixed;
          inset:0;
          width:100vw;
          height:100vh;
          display:block;
          z-index:0;
          cursor:pointer;
        }
        .lr-root.free .lr-scene { cursor:grab; }

        /* Loader */
        .lr-loader {
          position:fixed;inset:0;z-index:90;display:grid;place-items:center;
          background:var(--night);
          transition:opacity 0.9s var(--ease),visibility 0s linear 0.9s;
        }
        .lr-loader.done { opacity:0;visibility:hidden;pointer-events:none; }
        .lr-ld { display:grid;justify-items:center;gap:18px;text-align:center; }
        .lr-ld-lantern { width:46px;height:58px;position:relative; }
        .lr-ld-lantern::before {
          content:"";position:absolute;inset:8px 4px 6px;border-radius:50%;
          background:radial-gradient(circle at 50% 60%, var(--moon) 0%, var(--amber) 34%, var(--amber-deep) 70%, transparent 100%);
          box-shadow:0 0 34px color-mix(in srgb, var(--amber) 60%, transparent);
          animation:lrBob 2.4s ease-in-out infinite;
        }
        .lr-ld-lantern::after {
          content:"";position:absolute;left:50%;top:0;width:1px;height:10px;background:var(--amber-soft);opacity:.6;
        }
        .lr-ld p { font-family:var(--display);font-size:1.45rem;font-weight:300;color:var(--pearl); }
        .lr-ld small { font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--faint); }
        .lr-ld-bar { width:160px;height:2px;border-radius:2px;background:var(--line-soft);overflow:hidden; }
        .lr-ld-bar i { display:block;height:100%;background:linear-gradient(90deg,var(--amber-deep),var(--amber-soft));transition:width .35s var(--ease); }
        @keyframes lrBob { 50%{transform:translateY(-4px) scale(1.03)} }

        /* Top bar */
        .lr-bar {
          position:fixed;top:0;left:0;right:0;height:var(--bar);z-index:40;
          display:flex;align-items:center;gap:22px;padding:0 clamp(16px,3vw,40px);
          background:linear-gradient(180deg,color-mix(in srgb,var(--night) 78%,transparent),transparent);
        }
        .lr-brand { display:flex;align-items:center;gap:11px;flex:0 0 auto;text-decoration:none;color:inherit; }
        .lr-brand svg { width:22px;height:28px;filter:drop-shadow(0 0 8px color-mix(in srgb,var(--amber) 55%,transparent)); }
        .lr-brand b { font-family:var(--display);font-weight:400;font-size:1.42rem;line-height:1;display:block; }
        .lr-brand span { display:block;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:var(--faint);margin-top:3px; }
        .lr-nav { position:relative;display:flex;align-items:center;gap:4px;margin:0 auto;transition:opacity .5s var(--ease); }
        .lr-root.free .lr-nav { opacity:0;pointer-events:none; }
        .lr-nav a {
          position:relative;z-index:1;padding:8px 13px;font-size:.84rem;letter-spacing:.02em;
          color:var(--muted);transition:color .3s ease;border-radius:999px;
        }
        .lr-nav a:hover, .lr-nav a.on { color:var(--pearl); }
        .lr-nav a.on {
          background:radial-gradient(circle,color-mix(in srgb,var(--amber) 28%,transparent) 0%,transparent 75%);
        }
        .lr-tools { display:flex;align-items:center;gap:6px;margin-left:auto; }
        .lr-tool {
          height:34px;min-width:38px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;gap:6px;
          border-radius:8px;border:1px solid var(--line-soft);
          background:color-mix(in srgb,var(--night) 55%,transparent);color:var(--muted);
          font-size:.74rem;letter-spacing:.06em;transition:color .25s,border-color .25s,background .25s;cursor:pointer;
        }
        .lr-tool:hover, .lr-tool.on { color:var(--pearl);border-color:var(--line); }
        .lr-tool.on { color:var(--amber-soft);border-color:color-mix(in srgb,var(--amber) 45%,transparent); }
        .lr-tool svg { width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round; }

        /* Route HUD on right edge */
        .lr-route {
          position:fixed;right:clamp(14px,2vw,28px);top:50%;transform:translateY(-50%);
          z-index:30;display:flex;flex-direction:column;gap:6px;transition:opacity .5s ease;
        }
        .lr-root.free .lr-route { opacity:0;pointer-events:none; }
        .lr-route::before {
          content:"";position:absolute;right:14px;top:14px;bottom:14px;width:1px;
          background:linear-gradient(180deg,transparent,var(--line),var(--line),transparent);
        }
        .lr-rt {
          position:relative;display:flex;align-items:center;justify-content:flex-end;gap:12px;height:30px;
          color:var(--faint);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;
        }
        .lr-rt span { opacity:0;transform:translateX(6px);transition:opacity .3s ease,transform .4s var(--ease);white-space:nowrap; }
        .lr-rt i { position:relative;width:29px;height:29px;display:grid;place-items:center; }
        .lr-rt i::before {
          content:"";width:7px;height:9px;border-radius:50%;
          background:color-mix(in srgb,var(--pearl) 30%,transparent);
          transition:background .4s ease,box-shadow .4s ease,transform .5s var(--spring);
        }
        .lr-rt:hover span, .lr-rt.on span { opacity:1;transform:none; }
        .lr-rt.on { color:var(--amber-text); }
        .lr-rt.on i::before {
          background:radial-gradient(circle at 50% 60%,var(--moon),var(--amber) 60%,var(--amber-deep));
          box-shadow:0 0 14px color-mix(in srgb,var(--amber) 70%,transparent);
          transform:scale(1.35);
        }

        /* Content flow & Zones */
        .lr-main { position:relative;z-index:10;pointer-events:none;transition:opacity .6s var(--ease); }
        .lr-root.free .lr-main { opacity:0;visibility:hidden;pointer-events:none !important; }
        .lr-zone {
          position:relative;min-height:155vh;display:flex;align-items:center;
          padding:calc(var(--bar) + 24px) clamp(18px,5vw,84px) 40px;
        }
        .lr-zone.hero { min-height:100vh;justify-content:center;align-items:center;text-align:center;padding-bottom:16vh; }
        .lr-zone.left { justify-content:flex-start; }
        .lr-zone.right { justify-content:flex-end;padding-right:clamp(150px,13vw,210px); }

        .lr-plate {
          pointer-events:auto;position:relative;width:min(490px,100%);
          padding:clamp(24px,3vw,36px);border-radius:10px;
          background:linear-gradient(180deg,color-mix(in srgb,var(--night-2) 88%,transparent),color-mix(in srgb,var(--night) 94%,transparent));
          border:1px solid color-mix(in srgb,var(--pearl) 14%,transparent);
          backdrop-filter:blur(20px) saturate(115%);-webkit-backdrop-filter:blur(20px) saturate(115%);
          box-shadow:0 30px 60px -30px rgba(0,0,0,.75);
        }
        .lr-plate::before {
          content:"";position:absolute;left:22px;right:22px;top:-1px;height:1px;
          background:linear-gradient(90deg,transparent,var(--amber),transparent);opacity:.7;
        }
        .lr-plate::after {
          content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
          background:radial-gradient(90% 60% at 50% 0%,color-mix(in srgb,var(--amber) 9%,transparent),transparent 70%);
        }
        .lr-reveal { opacity:0;transform:translateY(22px);transition:opacity 0.9s var(--ease),transform 1s var(--ease); }
        .lr-reveal.in { opacity:1;transform:none; }

        .lr-tag {
          display:inline-flex;align-items:center;gap:10px;font-size:.7rem;letter-spacing:.22em;
          text-transform:uppercase;color:var(--amber-text);margin-bottom:14px;
        }
        .lr-tag::before { content:"";width:18px;height:1px;background:var(--amber);opacity:.8; }
        .lr-plate h2 {
          font-family:var(--display);font-weight:300;font-size:clamp(2.1rem,3.6vw,3.2rem);
          line-height:1.04;letter-spacing:-.01em;margin-bottom:16px;color:var(--pearl);
        }
        .lr-plate h2 em { font-style:italic;color:var(--amber-text); }
        .lr-plate p { color:var(--muted);font-size:.95rem; }
        .lr-plate p + p { margin-top:12px; }

        /* Hero */
        .lr-hero-copy { pointer-events:auto;display:grid;justify-items:center;gap:18px;max-width:780px; }
        .lr-eyebrow {
          font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--amber-text);
          display:flex;align-items:center;gap:14px;
        }
        .lr-eyebrow::before, .lr-eyebrow::after {
          content:"";width:28px;height:1px;background:linear-gradient(90deg,transparent,var(--amber));
        }
        .lr-eyebrow::after { transform:scaleX(-1); }
        .lr-hero h1 {
          font-family:var(--display);font-weight:300;font-size:clamp(3.3rem,8vw,7.2rem);
          line-height:.95;letter-spacing:-.02em;text-shadow:0 4px 40px rgba(0,0,0,.55);
        }
        .lr-hero h1 em {
          font-style:italic;font-weight:300;
          background:linear-gradient(180deg,var(--moon),var(--amber-soft) 60%,var(--amber));
          -webkit-background-clip:text;background-clip:text;color:transparent;
        }
        .lr-lede {
          font-size:clamp(1rem,1.35vw,1.14rem);
          color:color-mix(in srgb,var(--pearl) 84%,var(--night));
          max-width:52ch;text-shadow:0 2px 18px rgba(0,0,0,.6);
        }
        .lr-cta { display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:6px; }
        .lr-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          height:46px;padding:0 24px;border-radius:999px;font-size:.88rem;font-weight:500;
          letter-spacing:.02em;cursor:pointer;text-decoration:none;
          transition:transform .35s var(--spring),box-shadow .35s ease,border-color .3s ease;
        }
        .lr-btn.warm {
          background:linear-gradient(180deg,var(--amber-soft),var(--amber) 55%,var(--amber-deep));
          color:var(--ink);
          box-shadow:0 0 0 1px color-mix(in srgb,var(--moon) 40%,transparent) inset,0 8px 26px color-mix(in srgb,var(--amber-deep) 32%,transparent);
        }
        .lr-btn.warm:hover { transform:translateY(-2px); }
        .lr-btn.ghost {
          border:1px solid var(--line);color:var(--pearl);
          background:color-mix(in srgb,var(--night) 45%,transparent);
        }
        .lr-btn.ghost:hover { border-color:var(--amber);transform:translateY(-2px); }
        .lr-btn svg { width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round; }

        /* 02 About hanging stat tags */
        .lr-tags {
          display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px;padding-top:14px;position:relative;
        }
        .lr-tags::before {
          content:"";position:absolute;left:-4px;right:-4px;top:0;height:10px;
          border-top:1px solid var(--line);border-radius:50% 50% 0 0/100% 100% 0 0;
          transform:scaleY(-1);transform-origin:top;
        }
        .lr-stat {
          position:relative;padding:14px 8px 12px;border-radius:6px;text-align:center;
          background:linear-gradient(180deg,color-mix(in srgb,var(--amber) 10%,var(--night-2)),var(--night-2));
          border:1px solid var(--line-soft);margin-top:12px;
        }
        .lr-stat::before {
          content:"";position:absolute;left:50%;top:-13px;width:1px;height:13px;background:var(--line);
        }
        .lr-stat b { display:block;font-family:var(--display);font-weight:300;font-size:1.95rem;line-height:1;color:var(--pearl); }
        .lr-stat small { display:block;margin-top:5px;font-size:.66rem;letter-spacing:.04em;color:var(--muted);line-height:1.3; }

        /* 03 Market lantern rail */
        .lr-market-plate { width:min(620px,100%);padding-bottom:24px; }
        .lr-mk-head { display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap; }
        .lr-rail-nav { display:flex;align-items:center;gap:8px; }
        .lr-arrow {
          width:40px;height:40px;border-radius:50%;display:grid;place-items:center;
          border:1px solid var(--line);color:var(--pearl);cursor:pointer;
          transition:background .25s,border-color .25s,transform .35s var(--spring);
        }
        .lr-arrow:hover { background:color-mix(in srgb,var(--amber) 16%,transparent);border-color:var(--amber);transform:scale(1.06); }
        .lr-arrow svg { width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6; }
        .lr-rail { position:relative;margin-top:20px;padding-top:24px;overflow-x:auto;scrollbar-width:none; }
        .lr-rail::-webkit-scrollbar { display:none; }
        .lr-string-line {
          position:absolute;left:0;right:0;top:4px;height:14px;
          border-bottom:1px solid color-mix(in srgb,var(--amber-soft) 45%,transparent);
          border-radius:0 0 50% 50%;pointer-events:none;
        }
        .lr-lane { display:grid;grid-template-columns:repeat(3,minmax(165px,1fr));gap:16px; }
        .lr-card {
          position:relative;border-radius:8px;cursor:pointer;text-align:left;
          transition:transform .4s var(--spring);
        }
        .lr-card:hover { transform:translateY(-3px); }
        .lr-card::before {
          content:"";position:absolute;left:50%;top:-20px;width:1px;height:20px;
          background:color-mix(in srgb,var(--amber-soft) 50%,transparent);
        }
        .lr-card.on::before { background:var(--amber);box-shadow:0 0 6px var(--amber); }
        .lr-card .ph {
          position:relative;aspect-ratio:4/4.6;border-radius:8px;overflow:hidden;padding:14px;
          display:flex;flex-direction:column;justify-content:space-between;
          background:
            repeating-linear-gradient(35deg,color-mix(in srgb,var(--amber) 8%,transparent) 0 2px,transparent 2px 9px),
            radial-gradient(75% 65% at 30% 22%,color-mix(in srgb,var(--amber) 28%,transparent),transparent 70%),
            radial-gradient(70% 60% at 75% 80%,color-mix(in srgb,var(--red) 24%,transparent),transparent 70%),
            var(--night-3);
          box-shadow:0 16px 36px -16px rgba(0,0,0,.8),0 0 0 1px var(--line-soft);
          transition:box-shadow .4s ease,filter .4s ease;
          filter:saturate(.78) brightness(.78);
        }
        .lr-card.on .ph {
          filter:saturate(1.06) brightness(1.02);
          box-shadow:0 22px 48px -16px rgba(0,0,0,.9),0 0 0 1px color-mix(in srgb,var(--amber) 65%,transparent),0 0 32px -4px color-mix(in srgb,var(--amber) 45%,transparent);
        }
        .lr-card.ignite .ph::before {
          content:"";position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(120% 70% at 50% 0%,color-mix(in srgb,var(--amber-soft) 50%,transparent),transparent 65%);
          animation:lrWash 1s ease-out forwards;
        }
        @keyframes lrWash { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
        .lr-card .cap b { display:block;font-family:var(--display);font-weight:400;font-size:1.25rem;line-height:1.1;color:var(--pearl); }
        .lr-card .cap small { display:block;font-size:.68rem;letter-spacing:.08em;color:var(--amber-text);margin-top:3px; }
        .lr-rail-foot { display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;flex-wrap:wrap; }
        .lr-lights { display:flex;gap:7px; }
        .lr-lt {
          width:28px;height:14px;border-radius:7px;display:grid;place-items:center;
          border:1px solid var(--line-soft);background:color-mix(in srgb,var(--night) 60%,transparent);cursor:pointer;
        }
        .lr-lt i { width:6px;height:8px;border-radius:50%;background:color-mix(in srgb,var(--pearl) 28%,transparent);transition:all .35s; }
        .lr-lt.on { border-color:color-mix(in srgb,var(--amber) 55%,transparent);background:color-mix(in srgb,var(--amber) 12%,var(--night)); }
        .lr-lt.on i {
          background:radial-gradient(circle at 50% 60%,var(--moon),var(--amber) 60%,var(--amber-deep));
          box-shadow:0 0 10px var(--amber);transform:scale(1.25);
        }

        /* 04 Pier 5-rib lantern accordion */
        .lr-pier-plate { width:min(620px,100%); }
        .lr-ribs { display:flex;gap:6px;height:320px;margin-top:20px; }
        .lr-rib {
          position:relative;flex:1 1 0;min-width:0;border-radius:8px;overflow:hidden;cursor:pointer;
          background:repeating-linear-gradient(90deg,color-mix(in srgb,var(--amber) 10%,var(--night-2)) 0 3px,var(--night-2) 3px 11px);
          border:1px solid var(--line-soft);transition:flex-grow .6s var(--spring),border-color .4s ease;
        }
        .lr-rib:hover { border-color:var(--line); }
        .lr-rib.open {
          flex-grow:5.4;
          background:linear-gradient(180deg,color-mix(in srgb,var(--amber) 12%,var(--night-2)),var(--night-2) 70%);
          border-color:color-mix(in srgb,var(--amber) 50%,transparent);
        }
        .lr-rib .num {
          position:absolute;left:50%;top:16px;transform:translateX(-50%);
          font-size:.72rem;letter-spacing:.14em;color:var(--amber-text);transition:left .45s var(--ease),transform .45s var(--ease);
        }
        .lr-rib.open .num { left:20px;transform:none; }
        .lr-rib .vt {
          position:absolute;left:50%;bottom:18px;transform:translateX(-50%) rotate(180deg);
          writing-mode:vertical-rl;font-family:var(--display);font-size:1.22rem;white-space:nowrap;color:var(--pearl);
          transition:opacity .25s ease;
        }
        .lr-rib.open .vt { opacity:0; }
        .lr-rib .body {
          position:absolute;left:20px;right:20px;bottom:20px;top:44px;
          display:flex;flex-direction:column;justify-content:flex-end;
          opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .45s var(--ease);pointer-events:none;
        }
        .lr-rib.open .body { opacity:1;transform:none;transition-delay:.16s;pointer-events:auto; }
        .lr-rib h3 { font-family:var(--display);font-weight:400;font-size:1.68rem;line-height:1.1;margin-bottom:8px;color:var(--pearl); }
        .lr-rib p { font-size:.88rem;color:var(--muted); }
        .lr-chips { display:flex;flex-wrap:wrap;gap:6px;margin-top:12px; }
        .lr-chips span { font-size:.68rem;padding:4px 10px;border-radius:999px;border:1px solid var(--line);color:var(--amber-text); }

        /* 05 Fireworks bend hanging lanterns */
        .lr-price-plate { width:min(560px,100%); }
        .lr-tiers {
          display:flex;justify-content:space-around;align-items:flex-start;height:195px;margin:14px 0 8px;position:relative;
        }
        .lr-tiers::before {
          content:"";position:absolute;left:4%;right:4%;top:0;height:1px;
          background:linear-gradient(90deg,transparent,var(--line),var(--line),transparent);
        }
        .lr-tier { position:relative;display:grid;justify-items:center;cursor:pointer; }
        .lr-tier .cord { width:1px;background:color-mix(in srgb,var(--amber-soft) 45%,transparent); }
        .lr-tier .lamp {
          position:relative;border-radius:46% 46% 44% 44%/52% 52% 48% 48%;
          display:grid;place-items:center;text-align:center;
          background:repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 1px,transparent 1px 12%),
                     radial-gradient(circle at 50% 55%,color-mix(in srgb,var(--c) 55%,var(--night-3)) 0%,color-mix(in srgb,var(--c) 22%,var(--night-2)) 70%);
          border:1px solid color-mix(in srgb,var(--c) 40%,transparent);
          transition:box-shadow .5s ease,background .5s ease,transform .45s var(--spring);
        }
        .lr-tier:hover .lamp { transform:scale(1.05); }
        .lr-tier.on .lamp {
          background:repeating-linear-gradient(90deg,rgba(62,39,35,.16) 0 1px,transparent 1px 12%),
                     radial-gradient(circle at 50% 55%,var(--moon) 0%,var(--c) 46%,color-mix(in srgb,var(--c) 60%,#3a1a10) 100%);
          box-shadow:0 0 34px color-mix(in srgb,var(--c) 70%,transparent),0 0 80px color-mix(in srgb,var(--c) 30%,transparent);
        }
        .lr-tier .lamp b { font-family:var(--display);font-weight:400;font-size:1.02rem;line-height:1.05;color:var(--pearl);white-space:pre-line; }
        .lr-tier.on .lamp b { color:var(--ink);font-weight:600; }
        .lr-tier .tassel { width:2px;height:20px;background:linear-gradient(180deg,var(--c),transparent);margin-top:2px; }
        .lr-tier-detail { border-top:1px solid var(--line-soft);padding-top:14px; }
        .lr-tier-detail .pr { font-family:var(--display);font-size:2.3rem;font-weight:300;line-height:1;color:var(--pearl); }
        .lr-tier-detail .wk { font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:var(--amber-text);margin-left:12px; }
        .lr-tier-detail ul { list-style:none;display:grid;gap:7px;margin-top:12px; }
        .lr-tier-detail li { font-size:.86rem;color:var(--muted);display:flex;gap:9px;align-items:flex-start; }
        .lr-tier-detail li::before {
          content:"";width:5px;height:7px;border-radius:50%;background:var(--amber);
          box-shadow:0 0 8px var(--amber);margin-top:7px;flex:0 0 auto;
        }

        /* 06 Wishing pier form */
        .lr-wish-plate { width:min(510px,100%); }
        .lr-form { display:grid;gap:12px;margin-top:16px; }
        .lr-row2 { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .lr-field { display:grid;gap:5px; }
        .lr-field label { font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted); }
        .lr-field input, .lr-field textarea, .lr-field select {
          width:100%;padding:11px 13px;border-radius:8px;border:1px solid var(--line-soft);
          background:color-mix(in srgb,var(--night) 72%,transparent);color:var(--pearl);font-size:.92rem;
        }
        .lr-field input:focus, .lr-field textarea:focus, .lr-field select:focus {
          outline:none;border-color:var(--amber);box-shadow:0 0 0 3px color-mix(in srgb,var(--amber) 18%,transparent);
        }
        .lr-form-foot { display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:6px; }
        .lr-addr { font-size:.78rem;color:var(--faint);line-height:1.45; }
        .lr-addr b { color:var(--muted);font-weight:500; }

        /* Footer */
        .lr-foot {
          position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;
          gap:16px;flex-wrap:wrap;padding:18px clamp(18px,5vw,84px);padding-right:180px;
          border-top:1px solid var(--line-soft);
          background:linear-gradient(180deg,color-mix(in srgb,var(--night) 70%,transparent),var(--night));
          font-size:.8rem;color:var(--faint);
        }
        .lr-root.free .lr-foot { opacity:0;pointer-events:none; }

        /* Bottom Dock, Free Drift Switch, Speedometer & Lantern Tray */
        .lr-dock {
          position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:35;
          display:flex;align-items:center;gap:12px;padding:6px 8px 6px 14px;border-radius:16px;
          background:color-mix(in srgb,var(--night) 80%,transparent);border:1px solid var(--line-soft);
          backdrop-filter:blur(12px);font-size:.74rem;color:var(--muted);
        }
        .lr-dock kbd {
          display:inline-block;padding:1px 5px;border-radius:4px;border:1px solid var(--line-soft);
          font-size:.68rem;color:var(--pearl);background:color-mix(in srgb,var(--pearl) 6%,transparent);margin:0 2px;
        }
        .lr-free-btn {
          position:fixed;right:clamp(14px,2vw,26px);bottom:16px;z-index:36;height:36px;
          display:flex;align-items:center;gap:8px;padding:0 13px 0 8px;border-radius:999px;
          font-size:.76rem;color:var(--pearl);cursor:pointer;
          background:color-mix(in srgb,var(--night) 76%,transparent);border:1px solid var(--line-soft);
          backdrop-filter:blur(12px);
        }
        .lr-free-btn .knob {
          position:relative;width:28px;height:16px;border-radius:999px;
          background:color-mix(in srgb,var(--pearl) 14%,transparent);border:1px solid var(--line-soft);
        }
        .lr-free-btn .knob::after {
          content:"";position:absolute;left:2px;top:2px;width:10px;height:10px;border-radius:50%;
          background:var(--pearl);transition:transform .4s var(--spring),background .3s;
        }
        .lr-root.free .lr-free-btn { border-color:var(--amber);color:var(--amber-text); }
        .lr-root.free .lr-free-btn .knob { background:color-mix(in srgb,var(--amber) 30%,transparent);border-color:var(--amber); }
        .lr-root.free .lr-free-btn .knob::after { transform:translateX(12px);background:var(--amber-soft);box-shadow:0 0 8px var(--amber); }

        .lr-tray {
          position:fixed;left:50%;top:calc(var(--bar) + 10px);transform:translateX(-50%) translateY(-12px);
          z-index:35;display:flex;gap:4px;padding:6px;border-radius:16px;
          background:color-mix(in srgb,var(--night) 82%,transparent);border:1px solid var(--line-soft);
          backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;
          transition:opacity .4s var(--ease),transform .45s var(--ease);
        }
        .lr-root.free:not(.tray-off) .lr-tray { opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%); }
        .lr-ln {
          position:relative;width:68px;padding:7px 4px 6px;border-radius:11px;
          display:grid;justify-items:center;gap:3px;color:var(--muted);cursor:pointer;
        }
        .lr-ln:hover { background:color-mix(in srgb,var(--pearl) 6%,transparent);color:var(--pearl); }
        .lr-ln.on { background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber-soft); }
        .lr-ln .key { position:absolute;top:4px;left:6px;font-size:.55rem;color:var(--faint); }
        .lr-ln .nm { font-size:.65rem; }
        .lr-ln .pips { display:flex;gap:2px; }
        .lr-ln .pips i { width:6px;height:2px;border-radius:1px;background:color-mix(in srgb,var(--pearl) 18%,transparent); }
        .lr-ln .pips i.f { background:var(--amber); }

        .lr-speedo {
          position:fixed;left:clamp(14px,2vw,26px);bottom:16px;z-index:35;height:36px;
          display:flex;align-items:center;gap:7px;padding:0 13px 0 9px;border-radius:999px;
          background:color-mix(in srgb,var(--night) 80%,transparent);border:1px solid var(--line-soft);
          backdrop-filter:blur(12px);opacity:0;visibility:hidden;transition:opacity .35s;
        }
        .lr-root.free .lr-speedo { opacity:1;visibility:visible; }

        /* Lightbox */
        .lr-lb {
          position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:20px;
          background:color-mix(in srgb,var(--night) 84%,transparent);backdrop-filter:blur(10px);
        }
        .lr-lb-card {
          position:relative;width:min(760px,100%);max-height:calc(100vh - 40px);overflow-y:auto;
          border-radius:12px;background:var(--plate-solid);border:1px solid var(--line);padding:32px;
        }

        /* Toast */
        .lr-toast {
          position:fixed;left:50%;top:calc(var(--bar) + 12px);z-index:80;transform:translateX(-50%);
          display:flex;align-items:center;gap:12px;padding:11px 18px 11px 14px;border-radius:12px;
          background:var(--plate-solid);border:1px solid var(--line);font-size:.88rem;
          box-shadow:0 18px 40px -18px rgba(0,0,0,.85);
        }
        .lr-toast i {
          width:10px;height:13px;border-radius:50%;
          background:radial-gradient(circle at 50% 60%,var(--moon),var(--amber) 60%,var(--amber-deep));
          box-shadow:0 0 12px var(--amber);
        }

        @media (max-width:920px){
          .lr-nav, .lr-route { display:none; }
          .lr-zone.right { padding-right:clamp(18px,5vw,84px); }
          .lr-lane { grid-template-columns:repeat(2,minmax(150px,1fr)); }
        }
        @media (max-width:640px){
          .lr-tags { grid-template-columns:repeat(2,1fr); }
          .lr-lane { grid-template-columns:1fr; }
          .lr-row2 { grid-template-columns:1fr; }
          .lr-ribs { flex-direction:column;height:auto; }
          .lr-rib { min-height:54px; }
          .lr-rib.open { min-height:220px; }
          .lr-rib .vt { writing-mode:horizontal-tb;transform:none;left:54px;bottom:auto;top:14px; }
        }
      `}</style>

      {/* Loader */}
      <div className={`lr-loader ${loading ? '' : 'done'}`} role="status" aria-live="polite">
        <div className="lr-ld">
          <div className="lr-ld-lantern" aria-hidden="true" />
          <p>Lighting the lanterns</p>
          <div className="lr-ld-bar">
            <i style={{ width: `${loadPct}%` }} />
          </div>
          <small>Alen Davis K · Cyber Defense &amp; Linux River</small>
        </div>
      </div>

      {/* Fixed 3D River Canvas */}
      <canvas
        ref={canvasRef}
        className="lr-scene"
        aria-label="A paper lotus lantern floating down a festival river at night"
        onClick={e => {
          if (sceneRef.current?.clickWater(e.clientX, e.clientY)) {
            playChime(528 + Math.random() * 120, 0.7);
          }
        }}
      />

      {/* Top Bar */}
      <header className="lr-bar">
        <a className="lr-brand" href="#launch" onClick={() => setFreeDrift(false)}>
          <svg viewBox="0 0 22 28" aria-hidden="true">
            <line x1="11" y1="0" x2="11" y2="4" stroke="#FFE082" strokeWidth="1" />
            <rect x="6" y="4" width="10" height="2" rx="1" fill="#5C3B24" />
            <ellipse cx="11" cy="14" rx="9" ry="8.5" fill="#FFB300" />
            <ellipse cx="11" cy="14.5" rx="5" ry="6.5" fill="#FFE082" opacity=".75" />
            <path d="M4 14 Q11 9 18 14 M4 16 Q11 21 18 16" stroke="#FF8F00" strokeWidth=".7" fill="none" opacity=".7" />
            <rect x="6" y="22" width="10" height="2" rx="1" fill="#5C3B24" />
            <line x1="11" y1="24" x2="11" y2="28" stroke="#E2553F" strokeWidth="1.4" />
          </svg>
          <div>
            <b>Alen Davis K</b>
            <span>SOC Analyst · SIEM &amp; Linux</span>
          </div>
        </a>

        <nav className="lr-nav" aria-label="Main">
          {ROUTE_ZONES.map((z, idx) => (
            <a
              key={z.id}
              href={`#${z.id}`}
              className={activeZone === idx ? 'on' : ''}
            >
              {z.navLabel}
            </a>
          ))}
        </nav>

        <div className="lr-tools">
          {freeDrift && (
            <button
              type="button"
              className={`lr-tool ${trayVisible ? 'on' : ''}`}
              onClick={() => setTrayVisible(v => !v)}
              title="Lantern choices (L)"
            >
              Lanterns
            </button>
          )}
          <button
            type="button"
            className={`lr-tool ${soundOn ? 'on' : ''}`}
            onClick={toggleSound}
            title="Night river sound"
            aria-label="Toggle night river sound"
          >
            <svg viewBox="0 0 24 24">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {soundOn ? (
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              ) : (
                <path d="M22 9l-6 6M16 9l6 6" />
              )}
            </svg>
          </button>
          <button
            type="button"
            className="lr-tool"
            onClick={handleScreenshot}
            title="Save postcard screenshot"
            aria-label="Save screenshot"
          >
            <svg viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <button
            type="button"
            className="lr-tool"
            onClick={handleFullscreen}
            title="Full screen"
            aria-label="Full screen"
          >
            <svg viewBox="0 0 24 24">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <button
            type="button"
            className="lr-tool"
            onClick={onOpenCommandPalette}
            title="Command Palette (Ctrl+K)"
          >
            ⌘K
          </button>
          <button
            type="button"
            className="lr-tool on"
            onClick={onOpenResume}
            title="Open Resume Dossier"
          >
            Resume
          </button>
        </div>
      </header>

      {/* Right-Edge River Route HUD */}
      <aside className="lr-route" aria-label="River route">
        {ROUTE_ZONES.map((z, idx) => (
          <a
            key={z.id}
            href={`#${z.id}`}
            className={`lr-rt ${activeZone === idx ? 'on' : ''}`}
          >
            <span>{z.label}</span>
            <i />
          </a>
        ))}
      </aside>

      {/* Scrollable River Zones */}
      <main className="lr-main">
        {/* 01 Launch steps: Hero */}
        <section className="lr-zone hero lr-hero" id="launch">
          <div className="lr-hero-copy">
            <p className="lr-eyebrow">
              {identity.fullName} · {identity.location}
            </p>
            <h1>
              Let it <em>drift.</em>
            </h1>
            <p className="lr-lede">
              SOC Analyst L1, Digital Forensics &amp; Linux System Engineer. Follow the lotus
              lantern down the river—through Splunk SIEM threat detection labs, SHA-256 file
              integrity monitors, ESP32 hardware gates, and live cybercrime triage.
            </p>
            <div className="lr-cta">
              <a className="lr-btn warm" href="#bridge">
                Follow the lantern
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </a>
              <button
                className="lr-btn ghost"
                type="button"
                onClick={() => handleToggleFreeDrift(true)}
              >
                Free Drift
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
              <button className="lr-btn ghost" type="button" onClick={onOpenResume}>
                Resume Dossier
              </button>
            </div>
          </div>
        </section>

        {/* 02 Covered bridge: About & Career Stats */}
        <section className="lr-zone left" id="bridge">
          <div className="lr-plate lr-reveal">
            <p className="lr-tag">02 · The covered bridge</p>
            <h2>
              Built slowly, <em>lit by hand.</em>
            </h2>
            <p>{about.statement}</p>
            <p style={{ marginTop: 10, fontSize: '.84rem', color: 'var(--amber-text)' }}>
              {identity.studyingRow}
            </p>
            <div className="lr-tags" aria-label="Career in numbers">
              {numbers.map(n => (
                <div className="lr-stat" key={n.label}>
                  <b>
                    {n.value}
                    {n.suffix}
                  </b>
                  <small>{n.label.split(' ').slice(0, 5).join(' ')}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 Lantern market: Projects & Case Studies */}
        <section className="lr-zone right" id="market">
          <div className="lr-plate lr-market-plate lr-reveal">
            <div className="lr-mk-head">
              <div>
                <p className="lr-tag">03 · Lantern market</p>
                <h2>
                  Work that <em>holds its glow.</em>
                </h2>
                <p>
                  Six lanterns from my security lab and field internships. Click one to light it,
                  click again to read the full architecture.
                </p>
              </div>
              <div className="lr-rail-nav">
                <button
                  className="lr-arrow"
                  type="button"
                  aria-label="Previous project"
                  onClick={() => handleCardClick((litCardIdx - 1 + MARKET_CARDS.length) % MARKET_CARDS.length)}
                >
                  <svg viewBox="0 0 16 16">
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                </button>
                <span style={{ fontSize: '.8rem', color: 'var(--muted)', minWidth: 58, textAlign: 'center' }}>
                  <b style={{ color: 'var(--pearl)' }}>0{litCardIdx + 1}</b> / 0{MARKET_CARDS.length}
                </span>
                <button
                  className="lr-arrow"
                  type="button"
                  aria-label="Next project"
                  onClick={() => handleCardClick((litCardIdx + 1) % MARKET_CARDS.length)}
                >
                  <svg viewBox="0 0 16 16">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="lr-rail">
              <div className="lr-string-line" />
              <div className="lr-lane">
                {MARKET_CARDS.map((card, idx) => {
                  const isLit = litCardIdx === idx;
                  const isIgniting = ignitingIdx === idx;
                  return (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardClick(idx)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(idx);
                        }
                      }}
                      className={`lr-card ${isLit ? 'on' : ''} ${isIgniting ? 'ignite' : ''}`}
                    >
                      <div className="ph">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '.64rem',
                              letterSpacing: '.18em',
                              textTransform: 'uppercase',
                              padding: '3px 8px',
                              borderRadius: 999,
                              border: '1px solid var(--line)',
                              color: 'var(--amber-soft)',
                            }}
                          >
                            {card.badge}
                          </span>
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: card.accent,
                              boxShadow: isLit ? `0 0 12px ${card.accent}` : 'none',
                            }}
                          />
                        </div>

                        <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.4, margin: '10px 0' }}>
                          {card.summary}
                        </p>

                        <div className="cap">
                          <b>{card.title}</b>
                          <small>{card.subtitle}</small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lr-rail-foot">
              <div className="lr-lights" aria-label="Choose a project lantern">
                {MARKET_CARDS.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`lr-lt ${litCardIdx === idx ? 'on' : ''}`}
                    onClick={() => handleCardClick(idx)}
                    aria-label={`Light ${c.title}`}
                  >
                    <i />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLightboxCard(MARKET_CARDS[litCardIdx])}
                style={{
                  fontSize: '.74rem',
                  letterSpacing: '.08em',
                  color: 'var(--amber-soft)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Open “{MARKET_CARDS[litCardIdx].title}” story →
              </button>
            </div>
          </div>
        </section>

        {/* 04 Sampan pier: 5-Rib Lantern Accordion of Skills */}
        <section className="lr-zone left" id="pier">
          <div className="lr-plate lr-pier-plate lr-reveal">
            <p className="lr-tag">04 · Sampan pier</p>
            <h2>
              Five crafts, <em>one defender.</em>
            </h2>
            <p>Five security disciplines folded into one toolkit. Click a lantern rib to unfold it.</p>

            <div className="lr-ribs">
              {RIBS_DATA.map((rib, idx) => {
                const isOpen = openRib === idx;
                return (
                  <div
                    key={rib.num}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpenRib(idx);
                      playChime(480 + idx * 45, 0.8);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenRib(idx);
                      }
                    }}
                    className={`lr-rib ${isOpen ? 'open' : ''}`}
                  >
                    <span className="num">{rib.num}</span>
                    <span className="vt">{rib.vt}</span>
                    <div className="body">
                      <h3>{rib.title}</h3>
                      <p>{rib.desc}</p>
                      <div className="lr-chips">
                        {rib.chips.map(ch => (
                          <span key={ch}>{ch}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 05 Fireworks bend: Hanging Lanterns for Experience & Credentials */}
        <section className="lr-zone right" id="lanterns">
          <div className="lr-plate lr-price-plate lr-reveal">
            <p className="lr-tag">05 · Fireworks bend</p>
            <h2>
              Choose a <em>lantern.</em>
            </h2>
            <p>
              Three pillars of field experience &amp; credentials. Light one up to launch fireworks
              over the bend and inspect the record.
            </p>

            <div className="lr-tiers" role="radiogroup" aria-label="Experience & Credentials">
              {HANGING_TIERS.map((t, idx) => {
                const isOn = activeTier === idx;
                return (
                  <div
                    key={t.id}
                    role="radio"
                    tabIndex={0}
                    aria-checked={isOn}
                    onClick={() => handleSelectTier(idx)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectTier(idx);
                      }
                    }}
                    className={`lr-tier ${isOn ? 'on' : ''}`}
                    style={{ '--c': t.color } as React.CSSProperties}
                  >
                    <span className="cord" style={{ height: t.cordHeight }} />
                    <span className="lamp" style={{ width: t.w, height: t.h }}>
                      <b>{t.shortLabel}</b>
                    </span>
                    <span className="tassel" />
                  </div>
                );
              })}
            </div>

            <div className="lr-tier-detail" aria-live="polite">
              <div>
                <span className="pr">{currentTier.metric}</span>
                <span className="wk">{currentTier.sub}</span>
              </div>
              <p style={{ marginTop: 6, fontSize: '.9rem', color: 'var(--pearl)', fontWeight: 500 }}>
                {currentTier.role}
              </p>
              <ul>
                {currentTier.items.map(it => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button type="button" className="lr-btn ghost" onClick={onOpenResume}>
                  Inspect Full Resume
                </button>
                <a className="lr-btn ghost" href="#wish">
                  Send a wish downstream
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 06 Wishing pier: Contact */}
        <section className="lr-zone left" id="wish">
          <div className="lr-plate lr-wish-plate lr-reveal">
            <p className="lr-tag">06 · The wishing pier</p>
            <h2>
              Send a <em>wish.</em>
            </h2>
            <p>
              Write your message on a lantern and release it into the night sky. Open to SOC
              Analyst L1, Cybersecurity, and Linux System Engineer roles.
            </p>

            <form className="lr-form" onSubmit={handleWishSubmit} noValidate>
              <div className="lr-row2">
                <div className="lr-field">
                  <label htmlFor="lrName">Name</label>
                  <input
                    id="lrName"
                    value={wishName}
                    onChange={e => setWishName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="lr-field">
                  <label htmlFor="lrMail">Email</label>
                  <input
                    id="lrMail"
                    type="email"
                    value={wishEmail}
                    onChange={e => setWishEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="lr-field">
                <label htmlFor="lrTopic">Lantern Focus</label>
                <select
                  id="lrTopic"
                  value={wishTopic}
                  onChange={e => setWishTopic(e.target.value)}
                >
                  <option>SOC Analyst / SIEM Role</option>
                  <option>Linux Server Administration</option>
                  <option>Digital Forensics / Incident Response</option>
                  <option>General Collaboration</option>
                </select>
              </div>

              <div className="lr-field">
                <label htmlFor="lrMsg">Your wish / message</label>
                <textarea
                  id="lrMsg"
                  rows={3}
                  value={wishMsg}
                  onChange={e => setWishMsg(e.target.value)}
                  placeholder="Tell Alen about your team, role, or security project..."
                />
              </div>

              <div className="lr-form-foot">
                <p className="lr-addr">
                  <b>{identity.location}</b>
                  <br />
                  {identity.email}
                </p>
                <button className="lr-btn warm" type="submit">
                  Release lantern
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 13V3M4 7l4-4 4 4" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lr-foot">
        <span style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', color: 'var(--pearl)' }}>
          Alen Davis K · Lantern River Edition
        </span>
        <span>
          © {new Date().getFullYear()} {identity.fullName} ·{' '}
          <a href={identity.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </span>
      </footer>

      {/* Bottom Dock Hint */}
      {!dockClosed && (
        <div className="lr-dock" role="region" aria-label="Scene controls">
          {freeDrift ? (
            <span>
              Steer with <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> or <kbd>↑</kbd>
              <kbd>↓</kbd> · <kbd>Shift</kbd> boost · <kbd>Space</kbd> sky wish · <kbd>1–7</kbd> lantern
            </span>
          ) : (
            <span>Scroll to drift down the river · click the water to ripple it</span>
          )}
          <button
            type="button"
            onClick={() => setDockClosed(true)}
            aria-label="Hide controls"
            style={{ marginLeft: 6, color: 'var(--muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Free Drift 7-Lantern Selector Tray */}
      <div className="lr-tray" role="radiogroup" aria-label="Choose your lantern">
        {LANTERN_CHOICES.map((ln, idx) => (
          <button
            key={ln.id}
            type="button"
            role="radio"
            aria-checked={lanternDesign === idx}
            onClick={() => handleSelectLantern(idx)}
            className={`lr-ln ${lanternDesign === idx ? 'on' : ''}`}
            title={`${ln.name} (${idx + 1})`}
          >
            <span className="key">{idx + 1}</span>
            <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
              <ellipse cx="16" cy="24" rx="10" ry="2.4" fill="#7CCFB0" opacity=".55" />
              <path d="M16 7c2.4 4 2.8 8.6 0 13-2.8-4.4-2.4-9 0-13z" />
              <path d="M8 11.5c4.2 1.2 6.8 4.4 7.6 8.8-4.4-.8-7.3-3.8-7.6-8.8zM24 11.5c-4.2 1.2-6.8 4.4-7.6 8.8 4.4-.8 7.3-3.8 7.6-8.8z" opacity=".8" />
            </svg>
            <span className="nm">{ln.name}</span>
            <span className="pips" aria-hidden="true">
              {[1, 2, 3, 4, 5].map(pip => (
                <i key={pip} className={pip <= ln.speed ? 'f' : ''} />
              ))}
            </span>
          </button>
        ))}
      </div>

      {/* Free Drift Toggle Switch */}
      <button
        className="lr-free-btn"
        type="button"
        role="switch"
        aria-checked={freeDrift}
        onClick={() => handleToggleFreeDrift()}
      >
        <span className="knob" />
        <span>Free Drift</span>
      </button>

      {/* Free Drift Speedometer */}
      <div className={`lr-speedo ${isBoosting ? 'boost' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 32 20" width="30" height="19">
          <path
            d="M3 17a13 13 0 0 1 26 0"
            fill="none"
            stroke="rgba(242,246,245,0.18)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M3 17a13 13 0 0 1 26 0"
            fill="none"
            stroke="#FFE082"
            strokeWidth="2.6"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${Math.round(speedRatio * 100)} 100`}
          />
          <line
            x1="16"
            y1="17"
            x2="16"
            y2="6"
            stroke="#F2F6F5"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${needleAngle.toFixed(1)} 16 17)`}
          />
          <circle cx="16" cy="17" r="1.6" fill="#F2F6F5" />
        </svg>
        <b style={{ fontSize: '.9rem', minWidth: '2.4em', textAlign: 'right' }}>
          {speedKmh.toFixed(1)}
        </b>
        <small style={{ fontSize: '.66rem', color: 'var(--muted)' }}>km/h</small>
      </div>

      {/* Project Lightbox Modal */}
      {lightboxCard && (
        <div
          className="lr-lb"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxCard(null)}
        >
          <div className="lr-lb-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <span style={{ fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--amber-text)' }}>
                  {lightboxCard.meta}
                </span>
                <h3 style={{ fontFamily: 'var(--display)', fontWeight: 300, fontSize: '2.4rem', lineHeight: 1.05, marginTop: 4 }}>
                  {lightboxCard.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxCard(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid var(--line-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p style={{ marginTop: 14, color: 'var(--amber-soft)', fontSize: '1.02rem' }}>
              {lightboxCard.summary}
            </p>

            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(0,0,0,0.28)', border: '1px solid var(--line-soft)' }}>
                <div style={{ fontSize: '.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: '#E2553F', marginBottom: 4 }}>
                  Operational Challenge
                </div>
                <p style={{ fontSize: '.92rem', color: 'var(--muted)' }}>{lightboxCard.problem}</p>
              </div>
              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(0,0,0,0.28)', border: '1px solid var(--line-soft)' }}>
                <div style={{ fontSize: '.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: '#7CCFB0', marginBottom: 4 }}>
                  What I Engineered
                </div>
                <p style={{ fontSize: '.92rem', color: 'var(--muted)' }}>{lightboxCard.built}</p>
              </div>
            </div>

            <div className="lr-chips" style={{ marginTop: 16 }}>
              {lightboxCard.stack.map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
              {lightboxCard.githubUrl && (
                <a
                  className="lr-btn warm"
                  href={lightboxCard.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect Repository ↗
                </a>
              )}
              <a
                className="lr-btn ghost"
                href="#wish"
                onClick={() => setLightboxCard(null)}
              >
                Discuss this project
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="lr-toast" role="status" aria-live="polite">
          <i style={toast.bad ? { background: '#E2553F', boxShadow: '0 0 12px #E2553F' } : undefined} />
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default LanternRiverPortfolio;

