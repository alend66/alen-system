import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PORTFOLIO_CONTENT } from '../content';
import {
  ArrowUpRight,
  Check,
  Command,
  Copy,
  Crosshair,
  ExternalLink,
  FileText,
  Flame,
  Mail,
  MapPin,
  Medal,
  Phone,
  Shield,
  Skull,
  Target,
  Trophy,
  Wifi,
} from 'lucide-react';

interface FreeFirePortfolioProps {
  onOpenResume: () => void;
  onOpenCommandPalette: () => void;
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

const ORANGE = '#FF7A00';
const YELLOW = '#FFC21A';
const CYAN = '#22D3EE';
const RED = '#FF3B3B';
const GREEN = '#3DDC84';
const PURPLE = '#B06BFF';
const BLUE = '#4DA3FF';

const RARITY = [
  { label: 'LEGENDARY', color: ORANGE },
  { label: 'EPIC', color: PURPLE },
  { label: 'RARE', color: BLUE },
  { label: 'COMMON', color: '#9AA3AE' },
];

const NAV = [
  { id: 'profile', label: 'Profile' },
  { id: 'missions', label: 'Missions' },
  { id: 'loadout', label: 'Loadout' },
  { id: 'training', label: 'Training' },
  { id: 'matches', label: 'Match History' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Squad Up' },
];

const KILL_FEED_EVENTS = [
  { actor: 'SPL Rule #4625', verb: 'eliminated', target: 'Brute-Force Burst', tag: 'SIEM' },
  { actor: 'Sysmon', verb: 'spotted', target: 'Privilege Escalation', tag: 'SIEM' },
  { actor: 'SHA-256 Baseline', verb: 'caught', target: '/etc/passwd drift', tag: 'FIM' },
  { actor: 'ESP32 Gate', verb: 'blocked', target: 'Unknown RFID UID', tag: 'HW' },
  { actor: 'OSINT Scan', verb: 'traced', target: 'Phishing Domain', tag: 'DFIR' },
  { actor: 'SSH Hardening', verb: 'denied', target: 'Root Login Attempt', tag: 'LINUX' },
  { actor: 'Cron Job', verb: 'rotated', target: 'Bloated Auth Logs', tag: 'OPS' },
  { actor: 'Wireshark', verb: 'flagged', target: 'Suspicious Packet', tag: 'NET' },
  { actor: 'Nmap Recon', verb: 'revealed', target: 'Open Port 23', tag: 'VAPT' },
];

const MATCH_PHASES = [
  'DROP',
  'LOOT',
  'RECON',
  'PLAN',
  'BUILD',
  'ENGAGE',
  'TUNE',
  'CLUTCH',
  'BOOYAH',
];

const SLOT_NAMES = [
  'PRIMARY · SIEM & SOC',
  'SECONDARY · LINUX & SERVERS',
  'GADGETS · SCRIPTING & CRYPTO',
  'UTILITY · NETWORK, VAPT & HARDWARE',
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const useInView = <T extends HTMLElement>(threshold = 0.2) => {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
};

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [ref, seen] = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const CountUp: React.FC<{ target: number; suffix: string; color: string }> = ({
  target,
  suffix,
  color,
}) => {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1200);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]);
  return (
    <span ref={ref} className="ff-display" style={{ color }}>
      {val}
      {suffix}
    </span>
  );
};

const SectionTitle: React.FC<{ kicker: string; title: string; sub?: string }> = ({
  kicker,
  title,
  sub,
}) => (
  <Reveal className="mb-10 sm:mb-14">
    <div className="flex items-center gap-3 mb-2">
      <span className="h-[3px] w-10" style={{ background: ORANGE }} />
      <span className="ff-body text-xs sm:text-sm tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
        {kicker}
      </span>
    </div>
    <h2 className="ff-display text-5xl sm:text-7xl text-white leading-[0.95]">{title}</h2>
    {sub && <p className="ff-body mt-3 max-w-2xl text-slate-400 text-base sm:text-lg">{sub}</p>}
  </Reveal>
);

/* ------------------------------------------------------------------ */
/* Training ground mini-game                                           */
/* ------------------------------------------------------------------ */

interface ArenaTarget {
  id: number;
  x: number;
  y: number;
  label: string;
  decoy: boolean;
}

const THREATS = ['BRUTE-FORCE', 'PHISHING', 'MALWARE', 'ROGUE TAG', 'BACKDOOR', 'PORT SCAN'];
const DECOYS = ['AUTHORIZED UID', 'ADMIN LOGIN', 'TRUSTED HASH'];
const ROUND_SECONDS = 30;

const TrainingArena: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [neutralized, setNeutralized] = useState(0);
  const [falsePos, setFalsePos] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [targets, setTargets] = useState<ArenaTarget[]>([]);
  const [toast, setToast] = useState('');
  const idRef = useRef(0);

  const start = () => {
    setScore(0);
    setNeutralized(0);
    setFalsePos(0);
    setTimeLeft(ROUND_SECONDS);
    setTargets([]);
    setToast('');
    setPhase('running');
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const spawn = setInterval(() => {
      const decoy = Math.random() < 0.22;
      const list = decoy ? DECOYS : THREATS;
      const t: ArenaTarget = {
        id: ++idRef.current,
        x: 6 + Math.random() * 78,
        y: 10 + Math.random() * 72,
        label: list[Math.floor(Math.random() * list.length)],
        decoy,
      };
      setTargets(p => [...p, t]);
      setTimeout(() => setTargets(p => p.filter(x => x.id !== t.id)), 1700);
    }, 620);
    const tick = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && timeLeft <= 0) {
      setPhase('done');
      setTargets([]);
      setBest(b => Math.max(b, score));
    }
  }, [timeLeft, phase, score]);

  const hit = (e: React.MouseEvent, t: ArenaTarget) => {
    e.stopPropagation();
    setTargets(p => p.filter(x => x.id !== t.id));
    if (t.decoy) {
      setScore(s => Math.max(0, s - 15));
      setFalsePos(f => f + 1);
      setToast(`FALSE POSITIVE · ${t.label} was legitimate  −15`);
    } else {
      setScore(s => s + 10);
      setNeutralized(n => n + 1);
      setToast(`${t.label} NEUTRALIZED  +10`);
    }
  };

  const verdict =
    score >= 200
      ? 'BOOYAH! You are the last defender standing.'
      : score >= 120
      ? 'TOP 3 — solid SOC reflexes.'
      : 'Keep dropping — tune those detections.';

  return (
    <div className="ff-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 ff-body font-bold">
        <div className="flex items-center gap-4 text-sm sm:text-base">
          <span style={{ color: YELLOW }}>SCORE {score}</span>
          <span className="text-slate-300">TIME {Math.max(0, timeLeft)}s</span>
          <span className="text-slate-500 hidden sm:inline">BEST {best}</span>
        </div>
        <div className="text-xs sm:text-sm text-slate-400 tracking-wide">
          Click threats · avoid <span style={{ color: GREEN }}>green</span> legitimate events
        </div>
      </div>

      <div
        className="relative w-full h-[340px] sm:h-[420px] overflow-hidden select-none"
        style={{
          cursor: phase === 'running' ? 'crosshair' : 'default',
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,122,0,.10), transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, transparent 1px 40px), #0A0C0F',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      >
        {/* Safe-zone ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: phase === 'running' ? `${30 + (timeLeft / ROUND_SECONDS) * 60}%` : '90%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            border: `2px dashed ${CYAN}66`,
            transition: 'width 1s linear',
          }}
        />

        {phase === 'running' &&
          targets.map(t => (
            <button
              key={t.id}
              onMouseDown={e => hit(e, t)}
              className="ff-target absolute ff-body font-bold text-[11px] sm:text-xs px-2.5 py-1.5 flex items-center gap-1.5"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                background: t.decoy ? 'rgba(61,220,132,.15)' : 'rgba(255,59,59,.18)',
                border: `1.5px solid ${t.decoy ? GREEN : RED}`,
                color: t.decoy ? GREEN : '#FFB3B3',
                cursor: 'crosshair',
              }}
            >
              {t.decoy ? <Shield className="w-3.5 h-3.5" /> : <Skull className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          ))}

        {phase !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4 bg-black/50">
            {phase === 'idle' ? (
              <>
                <Crosshair className="w-12 h-12" style={{ color: ORANGE }} />
                <p className="ff-display text-4xl sm:text-5xl text-white">THREAT SHOOTER</p>
                <p className="ff-body text-slate-300 max-w-md">
                  A {ROUND_SECONDS}-second SOC drill. Neutralize attacks, but don't shoot legitimate
                  traffic. False positives cost points, just like on a real shift.
                </p>
              </>
            ) : (
              <>
                <Trophy className="w-12 h-12" style={{ color: YELLOW }} />
                <p className="ff-display text-5xl text-white">SCORE {score}</p>
                <p className="ff-body text-slate-300">
                  {neutralized} threats neutralized · {falsePos} false positives
                </p>
                <p className="ff-body font-bold" style={{ color: ORANGE }}>
                  {verdict}
                </p>
              </>
            )}
            <button onClick={start} className="ff-btn ff-btn-primary">
              {phase === 'idle' ? 'START DRILL' : 'PLAY AGAIN'}
            </button>
          </div>
        )}

        {phase === 'running' && toast && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 ff-body text-xs sm:text-sm font-bold px-3 py-1 bg-black/70 text-white whitespace-nowrap">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export const FreeFirePortfolio: React.FC<FreeFirePortfolioProps> = ({
  onOpenResume,
  onOpenCommandPalette,
}) => {
  const { identity, about, numbers, projects, stack, processStages, experience, certifications } =
    PORTFOLIO_CONTENT;

  const [ping, setPing] = useState(24);
  const [feed, setFeed] = useState<Array<{ id: number; ev: (typeof KILL_FEED_EVENTS)[number] }>>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const feedId = useRef(0);

  // Fluctuating ping like the in-game HUD
  useEffect(() => {
    const t = setInterval(() => setPing(18 + Math.floor(Math.random() * 26)), 2200);
    return () => clearInterval(t);
  }, []);

  // Kill feed of cyber events
  const pushFeed = useCallback(() => {
    const ev = KILL_FEED_EVENTS[Math.floor(Math.random() * KILL_FEED_EVENTS.length)];
    const id = ++feedId.current;
    setFeed(prev => [...prev.slice(-3), { id, ev }]);
    setTimeout(() => setFeed(prev => prev.filter(f => f.id !== id)), 6000);
  }, []);

  useEffect(() => {
    pushFeed();
    const t = setInterval(pushFeed, 2200);
    return () => clearInterval(t);
  }, [pushFeed]);

  const copyEmail = () => {
    navigator.clipboard?.writeText(identity.email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const slotGroup = stack[activeSlot];
  const hoveredUsedIn =
    hoveredSkill && slotGroup.skills.find(s => s.name === hoveredSkill)?.usedIn;

  return (
    <div className="ff-root relative min-h-screen text-white overflow-x-clip">
      <style>{`
        .ff-root { background:#0B0D10; font-family: 'Rajdhani','Inter',sans-serif; }
        .ff-display { font-family:'Teko','Rajdhani',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.01em; font-style:italic; }
        .ff-body { font-family:'Rajdhani','Inter',sans-serif; }
        .ff-panel { background:linear-gradient(160deg,#171B21,#101318); border:1px solid rgba(255,255,255,.07);
          clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px)); }
        .ff-panel-hover { transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
        .ff-panel-hover:hover { transform: translateY(-4px); }
        .ff-btn { font-family:'Teko',sans-serif; font-weight:700; font-style:italic; text-transform:uppercase; letter-spacing:.05em;
          font-size:1.35rem; padding:.45rem 2rem; transform:skewX(-10deg); display:inline-flex; align-items:center; gap:.5rem;
          transition: filter .2s ease, transform .2s ease; cursor:pointer; }
        .ff-btn > * { transform:skewX(10deg); }
        .ff-btn:hover { filter:brightness(1.12); transform:skewX(-10deg) translateY(-2px); }
        .ff-btn-primary { background:linear-gradient(180deg,${YELLOW},${ORANGE}); color:#1a1000; box-shadow:0 6px 24px rgba(255,122,0,.35); }
        .ff-btn-ghost { background:rgba(255,255,255,.06); color:#fff; border:1.5px solid rgba(255,255,255,.25); }
        .ff-target { clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
          animation: ffPop .25s ease-out; }
        @keyframes ffPop { from { transform:scale(.4); opacity:0 } to { transform:scale(1); opacity:1 } }
        @keyframes ffFeedIn { from { transform:translateX(40px); opacity:0 } to { transform:translateX(0); opacity:1 } }
        @keyframes ffScan { from { transform:translateY(-100%) } to { transform:translateY(100vh) } }
        @keyframes ffPulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
        .ff-grain { background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px); background-size: 4px 4px; }
        .ff-hero-text { -webkit-text-stroke: 2px ${ORANGE}; color: transparent; }
        html { scroll-behavior:smooth; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 ff-grain opacity-60 z-0" />
      <div
        className="pointer-events-none fixed left-0 right-0 h-24 z-0 opacity-[.05]"
        style={{
          background: `linear-gradient(180deg, transparent, ${ORANGE}, transparent)`,
          animation: 'ffScan 7s linear infinite',
        }}
      />

      {/* HUD NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0D10]/85 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <a href="#lobby" className="ff-display text-2xl flex items-center gap-2">
            <Flame className="w-6 h-6" style={{ color: ORANGE }} />
            <span>
              ALEN<span style={{ color: ORANGE }}>.K</span>
            </span>
          </a>
          <nav className="hidden lg:flex items-center gap-6 ff-body font-bold text-sm tracking-wider uppercase text-slate-300">
            {NAV.map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="hover:text-white transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 ff-body font-bold text-xs">
            <span className="hidden sm:flex items-center gap-1.5" style={{ color: GREEN }}>
              <Wifi className="w-4 h-4" /> {ping} ms
            </span>
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-1 px-2 py-1 border border-white/15 text-slate-300 hover:text-white"
            >
              <Command className="w-3.5 h-3.5" /> K
            </button>
            <button
              onClick={onOpenResume}
              className="px-3 py-1.5 text-[#1a1000]"
              style={{ background: ORANGE }}
            >
              RESUME
            </button>
          </div>
        </div>
      </header>

      {/* LOBBY / HERO */}
      <section id="lobby" className="relative z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 75% 40%, ${ORANGE}33, transparent 55%), radial-gradient(ellipse at 10% 90%, ${CYAN}14, transparent 50%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 mb-5 ff-body font-bold text-xs sm:text-sm tracking-widest">
              <span className="px-2.5 py-1 text-[#1a1000]" style={{ background: YELLOW }}>
                LOBBY
              </span>
              <span className="px-2.5 py-1 border border-white/20 text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {identity.location.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 border flex items-center gap-1.5" style={{ borderColor: GREEN, color: GREEN }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
                OPEN TO ROLES
              </span>
            </div>

            <h1 className="ff-display leading-[.85] text-[5.2rem] sm:text-[9rem] lg:text-[11rem]">
              <span className="block text-white">ALEN</span>
              <span className="block ff-hero-text">DAVIS K</span>
            </h1>

            <p className="ff-display text-2xl sm:text-4xl mt-4" style={{ color: YELLOW }}>
              SOC Analyst · Linux Engineer · Cyber Defender
            </p>
            <p className="ff-body text-lg sm:text-xl text-slate-300 mt-4 max-w-xl leading-snug">
              Drop in, secure the zone, survive the attack. {identity.heroDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button className="ff-btn ff-btn-primary" onClick={() => scrollTo('missions')}>
                <span className="flex items-center gap-2">
                  START MATCH <ArrowUpRight className="w-5 h-5" />
                </span>
              </button>
              <button className="ff-btn ff-btn-ghost" onClick={onOpenResume}>
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> RESUME
                </span>
              </button>
              <button className="ff-btn ff-btn-ghost" onClick={() => scrollTo('training')}>
                <span className="flex items-center gap-2">
                  <Crosshair className="w-5 h-5" /> TRAIN
                </span>
              </button>
            </div>
          </div>

          {/* Character card */}
          <div className="lg:col-span-5 relative">
            <div className="ff-panel relative p-3 sm:p-4 mx-auto max-w-md">
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW} 55%, ${ORANGE})`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      'repeating-linear-gradient(-45deg, rgba(0,0,0,.35) 0 10px, transparent 10px 20px)',
                  }}
                />
                <img
                  src={identity.photoUrl}
                  alt={identity.fullName}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  style={{ mixBlendMode: 'normal' }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="ff-display text-4xl leading-none">{identity.fullName}</p>
                  <p className="ff-body font-bold text-xs tracking-[.2em] text-slate-200">
                    CLASS · SOC ANALYST L1 / LINUX ENGINEER
                  </p>
                </div>
                <div className="absolute top-3 left-3 ff-body font-bold text-xs px-2 py-1 bg-black/70" style={{ color: YELLOW }}>
                  CHARACTER SELECT
                </div>
              </div>

              {/* HP / Armor bars */}
              <div className="mt-3 space-y-2 ff-body font-bold text-xs tracking-wider">
                {[
                  { l: 'HP · LINUX HARDENING', v: 92, c: GREEN },
                  { l: 'ARMOR · SIEM DETECTION', v: 85, c: BLUE },
                  { l: 'AMMO · AUTOMATION', v: 78, c: YELLOW },
                ].map(b => (
                  <div key={b.l}>
                    <div className="flex justify-between text-slate-300">
                      <span>{b.l}</span>
                    </div>
                    <div className="h-2 bg-white/10 mt-1">
                      <div className="h-full" style={{ width: `${b.v}%`, background: b.c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kill feed */}
            <div className="absolute -top-4 right-0 sm:-right-2 w-[19rem] max-w-full space-y-1.5 pointer-events-none z-10">
              {feed.map(f => (
                <div
                  key={f.id}
                  className="ff-body font-bold text-[11px] sm:text-xs px-2.5 py-1.5 bg-black/75 border-l-[3px] flex items-center gap-1.5 whitespace-nowrap overflow-hidden"
                  style={{ borderColor: ORANGE, animation: 'ffFeedIn .35s ease-out' }}
                >
                  <span style={{ color: CYAN }}>[{f.ev.tag}]</span>
                  <span className="text-white">{f.ev.actor}</span>
                  <Crosshair className="w-3 h-3 shrink-0" style={{ color: RED }} />
                  <span style={{ color: YELLOW }}>{f.ev.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative border-y border-white/10 bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap gap-x-8 gap-y-1 ff-body font-bold text-xs sm:text-sm tracking-widest text-slate-400">
            <span>STUDYING · <span className="text-slate-200">{identity.studyingRow}</span></span>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-24 sm:space-y-36 py-20 sm:py-28">
        {/* PROFILE */}
        <section id="profile">
          <SectionTitle
            kicker="/PLAYER PROFILE"
            title="Career Stats"
            sub="Real numbers from real shifts, shown the way a battle royale scoreboard would."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {numbers.map((n, i) => (
              <Reveal key={n.label} delay={i * 90}>
                <div className="ff-panel ff-panel-hover p-5 sm:p-6 h-full">
                  <div className="text-6xl sm:text-7xl leading-none">
                    <CountUp
                      target={n.value}
                      suffix={n.suffix}
                      color={[ORANGE, YELLOW, CYAN, GREEN][i % 4]}
                    />
                  </div>
                  <p className="ff-body text-slate-300 text-sm sm:text-base mt-3 leading-snug">
                    {n.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <p className="ff-body text-xl sm:text-3xl leading-snug text-slate-200 max-w-5xl">
              <span style={{ color: ORANGE }}>“</span>
              {about.statement}
              <span style={{ color: ORANGE }}>”</span>
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {about.columns.map((col, i) => (
              <Reveal key={col.title} delay={i * 100}>
                <div className="ff-panel p-6 h-full">
                  <p className="ff-display text-3xl mb-3" style={{ color: YELLOW }}>
                    0{i + 1} · {col.title}
                  </p>
                  <ul className="space-y-2.5 ff-body text-slate-300 text-base leading-snug">
                    {col.items.map(it => (
                      <li key={it} className="flex gap-2">
                        <span style={{ color: ORANGE }}>▸</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* MISSIONS */}
        <section id="missions">
          <SectionTitle
            kicker="/DROP ZONES"
            title="Missions"
            sub="Three projects, three drop zones. Each one is a real build with the loot (tech stack) it took to clear it."
          />
          <div className="space-y-8">
            {projects.map((p, i) => (
              <Reveal key={p.id}>
                <article className="ff-panel overflow-hidden grid md:grid-cols-12">
                  <div
                    className="md:col-span-4 p-6 sm:p-8 relative"
                    style={{ background: `linear-gradient(160deg, ${p.accentColor}33, transparent 70%)` }}
                  >
                    <p className="ff-body font-bold text-xs tracking-[.3em] text-slate-300">
                      MISSION {p.index}
                    </p>
                    <p className="ff-display text-[7rem] leading-none mt-2" style={{ color: p.accentColor }}>
                      {p.index}
                    </p>
                    <div className="flex items-center gap-2 mt-4 ff-body font-bold text-xs tracking-widest">
                      <span className="px-2 py-1 text-[#1a1000]" style={{ background: YELLOW }}>
                        {['SIEM', 'FIM', 'HARDWARE'][i] ?? 'OPS'}
                      </span>
                      <span className="px-2 py-1 border border-white/20 text-slate-300">
                        DIFFICULTY · {['HEROIC', 'ELITE', 'LEGEND'][i] ?? 'ELITE'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 p-6 sm:p-8 space-y-4">
                    <h3 className="ff-display text-3xl sm:text-5xl leading-none">{p.name}</h3>
                    <p className="ff-body text-lg font-semibold" style={{ color: YELLOW }}>
                      {p.hook}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 ff-body text-slate-300 leading-snug">
                      <div>
                        <p className="font-bold text-xs tracking-[.25em] mb-1" style={{ color: RED }}>
                          ENEMY (PROBLEM)
                        </p>
                        <p>{p.problem}</p>
                      </div>
                      <div>
                        <p className="font-bold text-xs tracking-[.25em] mb-1" style={{ color: GREEN }}>
                          STRATEGY (WHAT I BUILT)
                        </p>
                        <p>{p.built}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.stack.map((s, k) => {
                        const r = RARITY[k % RARITY.length];
                        return (
                          <span
                            key={s}
                            className="ff-body font-bold text-xs px-2.5 py-1"
                            style={{ border: `1.5px solid ${r.color}`, color: r.color, background: `${r.color}14` }}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 ff-body font-bold tracking-widest text-sm hover:underline"
                      style={{ color: ORANGE }}
                    >
                      VIEW SOURCE <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Match plan */}
          <Reveal className="mt-14">
            <div className="ff-panel p-6 sm:p-8">
              <p className="ff-display text-3xl sm:text-4xl mb-1">How I play a match</p>
              <p className="ff-body text-slate-400 mb-5">From the first drop to the Booyah, this is my workflow.</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {processStages.map((s, i) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStage(i)}
                    className="ff-body font-bold text-sm px-3 py-1.5 tracking-wider transition-colors"
                    style={{
                      background: i === activeStage ? ORANGE : 'rgba(255,255,255,.06)',
                      color: i === activeStage ? '#1a1000' : '#cbd5e1',
                    }}
                  >
                    {s.step} {MATCH_PHASES[i]}
                  </button>
                ))}
              </div>
              <div className="h-1.5 bg-white/10 mb-5">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${((activeStage + 1) / processStages.length) * 100}%`,
                    background: `linear-gradient(90deg, ${YELLOW}, ${ORANGE})`,
                  }}
                />
              </div>
              <p className="ff-display text-3xl" style={{ color: YELLOW }}>
                {MATCH_PHASES[activeStage]} · {processStages[activeStage].agent}
              </p>
              <p className="ff-body text-lg text-slate-200 mt-1 max-w-3xl">
                {processStages[activeStage].detail}
              </p>
            </div>
          </Reveal>
        </section>

        {/* LOADOUT */}
        <section id="loadout">
          <SectionTitle
            kicker="/LOADOUT"
            title="Weapons & Gear"
            sub="Pick a slot to see the skills equipped in it. Hover a skill to see where it was used."
          />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              {stack.map((g, i) => (
                <button
                  key={g.group}
                  onClick={() => {
                    setActiveSlot(i);
                    setHoveredSkill(null);
                  }}
                  className="w-full text-left ff-panel p-4 transition-all"
                  style={{
                    borderColor: i === activeSlot ? ORANGE : undefined,
                    boxShadow: i === activeSlot ? `inset 4px 0 0 ${ORANGE}` : undefined,
                  }}
                >
                  <p className="ff-body font-bold text-[11px] tracking-[.25em]" style={{ color: i === activeSlot ? ORANGE : '#64748b' }}>
                    SLOT {i + 1}
                  </p>
                  <p className="ff-display text-2xl leading-tight">{SLOT_NAMES[i]}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 ff-panel p-5 sm:p-7">
              <p className="ff-display text-3xl mb-4" style={{ color: YELLOW }}>
                {slotGroup.group}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {slotGroup.skills.map((s, k) => {
                  const r = RARITY[k % RARITY.length];
                  const active = hoveredSkill === s.name;
                  return (
                    <div
                      key={s.name}
                      onMouseEnter={() => setHoveredSkill(s.name)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      onFocus={() => setHoveredSkill(s.name)}
                      onBlur={() => setHoveredSkill(null)}
                      tabIndex={0}
                      className="p-3 transition-all cursor-default outline-none"
                      style={{
                        background: active ? `${r.color}26` : 'rgba(255,255,255,.04)',
                        border: `1.5px solid ${active ? r.color : 'rgba(255,255,255,.08)'}`,
                      }}
                    >
                      <p className="ff-body font-bold text-[10px] tracking-[.25em]" style={{ color: r.color }}>
                        {r.label}
                      </p>
                      <p className="ff-body font-semibold text-base leading-snug">{s.name}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 min-h-[3.5rem] ff-body text-slate-300 border-t border-white/10 pt-4">
                {hoveredUsedIn ? (
                  <>
                    <span className="font-bold text-xs tracking-[.25em]" style={{ color: ORANGE }}>
                      USED IN ·{' '}
                    </span>
                    {hoveredUsedIn.join('  /  ')}
                  </>
                ) : (
                  <span className="text-slate-500">Hover or focus a skill to inspect it.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TRAINING */}
        <section id="training">
          <SectionTitle
            kicker="/TRAINING GROUND"
            title="Threat Shooter"
            sub="A tiny SOC-themed aim trainer. Play it, then try to beat your own best."
          />
          <Reveal>
            <TrainingArena />
          </Reveal>
        </section>

        {/* MATCH HISTORY */}
        <section id="matches">
          <SectionTitle
            kicker="/MATCH HISTORY"
            title="Experience"
            sub="Every internship is a match I played. Every result is a real outcome."
          />
          <div className="space-y-6">
            {experience.map((e, i) => (
              <Reveal key={e.company}>
                <div className="ff-panel p-5 sm:p-8 grid md:grid-cols-12 gap-6">
                  <div className="md:col-span-4">
                    <p className="ff-body font-bold text-xs tracking-[.3em] text-slate-400">MATCH 0{i + 1}</p>
                    <p className="ff-display text-4xl leading-none mt-1" style={{ color: ORANGE }}>
                      {e.company}
                    </p>
                    <p className="ff-body font-bold text-lg mt-1">{e.role}</p>
                    <p className="ff-body text-slate-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {e.location}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 mt-4 ff-body font-bold text-xs tracking-widest px-2.5 py-1 text-[#1a1000]"
                      style={{ background: YELLOW }}
                    >
                      <Medal className="w-3.5 h-3.5" /> BOOYAH
                    </span>
                  </div>
                  <div className="md:col-span-8">
                    <p className="ff-body text-lg text-slate-200 mb-3 leading-snug">{e.summary}</p>
                    <ul className="space-y-2">
                      {e.bullets.map(b => (
                        <li
                          key={b}
                          className="ff-body text-slate-300 leading-snug flex gap-2 px-3 py-2 bg-black/30 border-l-[3px]"
                          style={{ borderColor: ORANGE }}
                        >
                          <Crosshair className="w-4 h-4 mt-1 shrink-0" style={{ color: RED }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section id="achievements">
          <SectionTitle kicker="/ACHIEVEMENTS" title="Badges Unlocked" />
          <div className="grid sm:grid-cols-2 gap-5">
            {certifications.map((c, i) => (
              <Reveal key={c.name} delay={i * 80}>
                <div className="ff-panel ff-panel-hover p-5 flex gap-4 items-start h-full">
                  <div
                    className="w-14 h-14 shrink-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${YELLOW}, ${ORANGE})`,
                      clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
                    }}
                  >
                    {i === 0 ? (
                      <Trophy className="w-6 h-6 text-[#1a1000]" />
                    ) : i === 1 ? (
                      <Target className="w-6 h-6 text-[#1a1000]" />
                    ) : i === 2 ? (
                      <Shield className="w-6 h-6 text-[#1a1000]" />
                    ) : (
                      <Medal className="w-6 h-6 text-[#1a1000]" />
                    )}
                  </div>
                  <div>
                    <p className="ff-body font-bold text-lg leading-snug">{c.name}</p>
                    <p className="ff-body text-slate-400 text-sm mt-1">{c.issuer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <Reveal>
            <div
              className="ff-panel p-8 sm:p-14 text-center relative overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${ORANGE}33, #101318 60%)` }}
            >
              <p className="ff-body font-bold text-xs sm:text-sm tracking-[.4em]" style={{ color: YELLOW }}>
                /SQUAD UP
              </p>
              <h2 className="ff-display text-6xl sm:text-9xl leading-[.9] mt-2">
                Ready for the <span style={{ color: ORANGE }}>Booyah?</span>
              </h2>
              <p className="ff-body text-lg sm:text-xl text-slate-300 mt-4 max-w-xl mx-auto">
                Looking for SOC, Linux, or security roles. Add me to your squad.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <button className="ff-btn ff-btn-primary" onClick={copyEmail}>
                  <span className="flex items-center gap-2">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'COPIED!' : identity.email}
                  </span>
                </button>
                <a className="ff-btn ff-btn-ghost" href={`mailto:${identity.email}`}>
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5" /> EMAIL
                  </span>
                </a>
                <a className="ff-btn ff-btn-ghost" href={`tel:${identity.phone.replace(/\s/g, '')}`}>
                  <span className="flex items-center gap-2">
                    <Phone className="w-5 h-5" /> {identity.phone}
                  </span>
                </a>
                <a className="ff-btn ff-btn-ghost" href={identity.githubUrl} target="_blank" rel="noreferrer">
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" /> GITHUB
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-3 ff-body font-bold text-xs tracking-widest text-slate-500">
          <span>© {new Date().getFullYear()} {identity.fullName.toUpperCase()} · {identity.location.toUpperCase()}</span>
          <button onClick={() => scrollTo('lobby')} className="hover:text-white" style={{ animation: 'ffPulse 2s infinite' }}>
            ↑ BACK TO LOBBY
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FreeFirePortfolio;

