import React, { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_CONTENT, CollectiveProject } from '../content';
import { CursorEngine, HeroPieceRect } from '../utils/CursorEngine';
import { createTransparentPortraitCutout } from '../utils/cutoutPortrait';
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CollectivePortfolioProps {
  onOpenResume: () => void;
}

/**
 * Per-character typing heading that animates letter-by-letter when `built` becomes true.
 */
const PerCharHeading: React.FC<{
  text: string;
  built: boolean;
  className?: string;
}> = ({ text, built, className = '' }) => {
  return (
    <h2 aria-label={text} className={className}>
      {Array.from(text).map((ch, idx) => (
        <span
          key={idx}
          style={{
            display: ch === ' ' ? 'inline' : 'inline-block',
            opacity: built ? 1 : 0,
            transform: built ? 'translateY(0px)' : 'translateY(10px)',
            transition: `opacity 0.32s ease ${idx * 18}ms, transform 0.32s ease ${idx * 18}ms`,
          }}
        >
          {ch}
        </span>
      ))}
    </h2>
  );
};

/**
 * Count-up stat number that animates from 0 to `target` when `built` becomes true.
 */
const CountUpNumber: React.FC<{
  target: number;
  suffix: string;
  built: boolean;
  color: string;
}> = ({ target, suffix, built, color }) => {
  const [val, setVal] = useState<number>(0);

  useEffect(() => {
    if (!built) {
      setVal(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [built, target]);

  return (
    <span style={{ color }} className="font-geist font-extrabold tracking-tight">
      {val}
      {suffix}
    </span>
  );
};

/**
 * CSS-drawn technical illustration marked "illustration" for each of Alen's 3 real projects.
 */
const ProjectCssIllustration: React.FC<{
  type: CollectiveProject['illustrationType'];
  accentColor: string;
}> = ({ type, accentColor }) => {
  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl bg-[#F3F2EE] border border-[#E8E7E2] overflow-hidden p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-geist-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-white border border-[#E8E7E2] text-[#777777]">
          illustration
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {type === 'siem' && (
        <div className="my-auto space-y-2">
          <div className="flex items-end gap-1.5 h-20 px-2">
            {[35, 52, 44, 88, 96, 64, 40, 78, 92, 48, 60, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${h}%`,
                  backgroundColor: h > 80 ? '#FF5A70' : accentColor,
                  opacity: h > 80 ? 0.9 : 0.45,
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between font-geist-mono text-[10px] text-[#777777] border-t border-[#E8E7E2] pt-1.5">
            <span>index=main EventCode=4625 | stats count by src_ip</span>
            <span className="text-[#FF5A70] font-semibold">ALERT: BRUTE_FORCE</span>
          </div>
        </div>
      )}

      {type === 'fim' && (
        <div className="my-auto space-y-2 font-geist-mono text-[11px]">
          <div className="p-2 rounded-lg bg-white border border-[#E8E7E2] flex items-center justify-between">
            <span className="text-[#151515]">/etc/ssh/sshd_config</span>
            <span className="text-[#13B89A] font-semibold">SHA256 · MATCH</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-[#FF5A70]/40 flex items-center justify-between">
            <span className="text-[#151515]">/etc/passwd</span>
            <span className="text-[#FF5A70] font-semibold">HASH DRIFT · ALERT</span>
          </div>
          <div className="text-[10px] text-[#777777] truncate">
            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
        </div>
      )}

      {type === 'rfid' && (
        <div className="my-auto flex items-center justify-around py-2">
          <div className="w-24 h-24 rounded-xl bg-white border-2 border-[#8758FF]/40 flex flex-col items-center justify-center p-2 shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#8758FF] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#8758FF]" />
            </div>
            <span className="font-geist-mono text-[9px] text-[#151515] mt-1.5 font-semibold">
              MFRC522 · 13.56MHz
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 sm:w-16 h-[2px] bg-[#8758FF]" />
            <span className="font-geist-mono text-[9px] text-[#777777]">
              SPI · MOSI/MISO
            </span>
            <div className="w-12 sm:w-16 h-[2px] bg-[#13B89A]" />
          </div>
          <div className="w-24 h-24 rounded-xl bg-[#151515] text-white flex flex-col items-center justify-center p-2">
            <span className="font-geist-mono text-[10px] text-[#13B89A] font-bold">
              ESP32 MCU
            </span>
            <span className="font-geist-mono text-[9px] text-white/70 mt-1">
              UID VERIFIED
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between font-geist-mono text-[10px] text-[#777777]">
        <span>SIMULATED BLUEPRINT</span>
        <span>100% CSS VECTOR</span>
      </div>
    </div>
  );
};

export const CollectivePortfolio: React.FC<CollectivePortfolioProps> = ({
  onOpenResume,
}) => {
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CursorEngine | null>(null);

  const heroTrackRef = useRef<HTMLDivElement | null>(null);
  const aboutStatementRef = useRef<HTMLParagraphElement | null>(null);
  const projectsTrackRef = useRef<HTMLDivElement | null>(null);
  const processTrackRef = useRef<HTMLDivElement | null>(null);
  const experienceTrackRef = useRef<HTMLDivElement | null>(null);
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const copyBtnRef = useRef<HTMLButtonElement | null>(null);

  // Refs for the 8 hero pieces constructed by the 8 named builders
  const hpHeaderRef = useRef<HTMLDivElement | null>(null);
  const hpMonoNameRef = useRef<HTMLDivElement | null>(null);
  const hpHeadlineRef = useRef<HTMLDivElement | null>(null);
  const hpDescRef = useRef<HTMLDivElement | null>(null);
  const hpStudyingRef = useRef<HTMLDivElement | null>(null);
  const hpStandingRef = useRef<HTMLDivElement | null>(null);
  const hpButtonsRef = useRef<HTMLDivElement | null>(null);
  const hpFuturePillRef = useRef<HTMLDivElement | null>(null);

  const [cutoutUrl, setCutoutUrl] = useState<string>(PORTFOLIO_CONTENT.identity.photoUrl);
  const [heroProgress, setHeroProgress] = useState<number>(0);
  const [agentCounter, setAgentCounter] = useState<{ online: number; total: number }>({
    online: 14,
    total: 300,
  });
  const [aboutWordProgress, setAboutWordProgress] = useState<number>(0);
  const [projectsHorizProgress, setProjectsHorizProgress] = useState<number>(0);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [expRailProgress, setExpRailProgress] = useState<number>(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [builtBlocks, setBuiltBlocks] = useState<Record<string, boolean>>({});
  const [buildEpoch, setBuildEpoch] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Generate transparent cutout of Alen's portrait (never altering his face)
  useEffect(() => {
    createTransparentPortraitCutout(PORTFOLIO_CONTENT.identity.photoUrl).then(url => {
      setCutoutUrl(url);
    });
  }, []);

  // Initialize CursorEngine on the two fixed full-screen canvases
  useEffect(() => {
    if (!backCanvasRef.current || !frontCanvasRef.current) return;
    const engine = new CursorEngine(backCanvasRef.current, frontCanvasRef.current);
    engineRef.current = engine;

    const pieces: HeroPieceRect[] = [
      {
        id: 'header',
        jsxLabel: '<HeroHeader />',
        builderIndex: 0,
        startP: 0.6,
        endP: 0.69,
        getRect: () => hpHeaderRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'mononame',
        jsxLabel: '<IdentityLabel />',
        builderIndex: 1,
        startP: 0.63,
        endP: 0.72,
        getRect: () => hpMonoNameRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'headline',
        jsxLabel: '<Headline />',
        builderIndex: 2,
        startP: 0.66,
        endP: 0.75,
        getRect: () => hpHeadlineRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'desc',
        jsxLabel: '<Description />',
        builderIndex: 3,
        startP: 0.69,
        endP: 0.78,
        getRect: () => hpDescRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'studying',
        jsxLabel: '<StudyingRow />',
        builderIndex: 4,
        startP: 0.72,
        endP: 0.81,
        getRect: () => hpStudyingRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'standing',
        jsxLabel: '<StandingRow />',
        builderIndex: 5,
        startP: 0.75,
        endP: 0.84,
        getRect: () => hpStandingRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'buttons',
        jsxLabel: '<ActionButtons />',
        builderIndex: 6,
        startP: 0.78,
        endP: 0.89,
        getRect: () => hpButtonsRef.current?.getBoundingClientRect() || null,
      },
      {
        id: 'futurepill',
        jsxLabel: '<FutureStatusPill />',
        builderIndex: 7,
        startP: 0.82,
        endP: 0.94,
        getRect: () => hpFuturePillRef.current?.getBoundingClientRect() || null,
      },
    ];
    engine.setHeroPieces(pieces);
    engine.start();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      engine.resize();
      setAgentCounter(engine.getOnlineAgentCount());
    };

    const handleMouseMove = (e: MouseEvent) => {
      engine.setMousePosition(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    setAgentCounter(engine.getOnlineAgentCount());

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Scroll scrubbing for Hero (2.4 screens), About darkening words, Desktop horizontal Projects, Sticky Process, Experience rail, and Contact ring
  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      const vh = Math.max(1, window.innerHeight);

      // 1. Hero progress (pinned for 2.4 screens inside a 340vh track)
      let hp = 0;
      if (heroTrackRef.current) {
        const rect = heroTrackRef.current.getBoundingClientRect();
        const totalScrollable = Math.max(1, rect.height - vh);
        hp = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      }
      setHeroProgress(hp);

      if (engineRef.current) {
        engineRef.current.scrollY = sy;
        engineRef.current.heroProgress = hp;
        engineRef.current.isInHero = hp < 0.99;
        setAgentCounter(engineRef.current.getOnlineAgentCount());
      }

      // 2. About statement word-by-word darkening on scroll
      if (aboutStatementRef.current) {
        const r = aboutStatementRef.current.getBoundingClientRect();
        const wp = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (vh * 0.55 + r.height * 0.5)));
        setAboutWordProgress(wp);
      }

      // 3. Projects horizontal scroll on desktop
      if (projectsTrackRef.current && window.innerWidth >= 768) {
        const r = projectsTrackRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, r.height - vh);
        const pp = Math.max(0, Math.min(1, -r.top / scrollable));
        setProjectsHorizProgress(pp);
      } else {
        setProjectsHorizProgress(0);
      }

      // 4. Process sticky 300vh section progress
      if (processTrackRef.current) {
        const r = processTrackRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, r.height - vh);
        const procP = Math.max(0, Math.min(1, -r.top / scrollable));
        setProcessProgress(procP);
      }

      // 5. Experience vertical rail fill
      if (experienceTrackRef.current) {
        const r = experienceTrackRef.current.getBoundingClientRect();
        const railP = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / Math.max(1, r.height * 0.85)));
        setExpRailProgress(railP);
      }

      // 6. Contact section ring of 54 cursors + Creative Director click
      if (contactSectionRef.current && engineRef.current) {
        const r = contactSectionRef.current.getBoundingClientRect();
        const inView = r.top < vh * 0.75 && r.bottom > vh * 0.2;
        engineRef.current.setContactCopyTarget(
          () => copyBtnRef.current?.getBoundingClientRect() || null,
          inView,
          () => {
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2600);
          }
        );
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for every below-the-hero `data-block`
  useEffect(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>('.data-block')
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const blockId = el.dataset.blockId;
          if (!blockId) return;

          if (engineRef.current) {
            engineRef.current.queueBlockBuild(el, () => {
              setBuiltBlocks(prev => ({ ...prev, [blockId]: true }));
            });
          } else {
            setBuiltBlocks(prev => ({ ...prev, [blockId]: true }));
          }
        });
      },
      { threshold: 0.16 }
    );

    blocks.forEach(b => observer.observe(b));
    return () => observer.disconnect();
  }, [buildEpoch]);

  // "Watch it build again" handler in Footer
  const handleWatchBuildAgain = () => {
    setBuiltBlocks({});
    if (engineRef.current) {
      engineRef.current.clearCompletedBuilds();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setBuildEpoch(prev => prev + 1);
    }, 650);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(PORTFOLIO_CONTENT.identity.email).catch(() => {});
    setEmailCopied(true);
    if (copyBtnRef.current && engineRef.current) {
      const r = copyBtnRef.current.getBoundingClientRect();
      engineRef.current.spawnRipple(r.left + r.width / 2, r.top + r.height / 2, '#3478F6');
    }
    setTimeout(() => setEmailCopied(false), 2400);
  };

  // Helper for hero piece visibility scrubbed by scroll (reverses cleanly when scrolling back up!)
  const getHeroPieceStyle = (revealAtP: number): React.CSSProperties => {
    const built = heroProgress >= revealAtP;
    return {
      opacity: built ? 1 : 0,
      filter: built ? 'blur(0px)' : 'blur(6px)',
      transform: built ? 'translateY(0px)' : 'translateY(10px)',
      transition: 'opacity 0.28s ease, filter 0.28s ease, transform 0.28s ease',
      pointerEvents: built ? 'auto' : 'none',
    };
  };

  // Hero derived scroll states
  const showInitPrompt = heroProgress < 0.26;
  const showMidTagline = heroProgress >= 0.26 && heroProgress <= 0.58;
  const realH1Opacity = Math.max(0, Math.min(1, (heroProgress - 0.5) / 0.14));
  const archScale = Math.max(0, Math.min(1, (heroProgress - 0.6) / 0.26));
  const portraitRise = Math.max(0, Math.min(1, (heroProgress - 0.6) / 0.26));

  const aboutWords = PORTFOLIO_CONTENT.about.statement.split(' ');
  const activeProcessIdx = Math.min(
    PORTFOLIO_CONTENT.processStages.length - 1,
    Math.floor(processProgress * PORTFOLIO_CONTENT.processStages.length)
  );

  // Skill hover project lookup
  const highlightedProjectsForSkill = (() => {
    if (!hoveredSkill) return [];
    for (const grp of PORTFOLIO_CONTENT.stack) {
      const found = grp.skills.find(s => s.name === hoveredSkill);
      if (found) return found.usedIn;
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#151515] font-geist relative overflow-x-clip">
      {/* FIXED FULL-SCREEN CANVASES (One behind content, one in front, pointer-events: none) */}
      <canvas
        ref={backCanvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
      />
      <canvas
        ref={frontCanvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-50"
      />

      {/* ============================================================
          HERO SECTION (Pinned 100vh stage for 2.4 screens = 340vh total)
          Nothing automatic — everything scrubbed by scroll!
          ============================================================ */}
      <section
        ref={heroTrackRef}
        className="relative w-full h-[340vh] z-10"
      >
        <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between px-4 sm:px-8 md:px-14 py-4 sm:py-6">
          {/* 1. HERO HEADER (Not sticky — lives inside the hero and scrolls away; built at p >= 0.67) */}
          <div
            ref={hpHeaderRef}
            style={getHeroPieceStyle(0.67)}
            className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3 py-2 border-b border-[#E8E7E2] z-30"
          >
            <a
              href="#"
              className="font-geist font-extrabold text-sm sm:text-base tracking-tight text-[#151515]"
            >
              {PORTFOLIO_CONTENT.identity.logo}
            </a>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#777777]">
              <a href="#about" className="hover:text-[#151515] transition-colors">
                About
              </a>
              <a href="#projects" className="hover:text-[#151515] transition-colors">
                Projects
              </a>
              <a href="#stack" className="hover:text-[#151515] transition-colors">
                Stack
              </a>
              <a href="#process" className="hover:text-[#151515] transition-colors">
                Process
              </a>
              <a href="#experience" className="hover:text-[#151515] transition-colors">
                Experience
              </a>
              <a href="#contact" className="hover:text-[#151515] transition-colors">
                Contact
              </a>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E7E2] text-[11px] font-geist-mono text-[#151515]">
              <span className="w-2 h-2 rounded-full bg-[#13B89A]" />
              <span>{PORTFOLIO_CONTENT.identity.statusPill}</span>
            </div>
          </div>

          {/* INITIAL MONO PROMPT AT START (p: 0 -> 0.25) */}
          {showInitPrompt && (
            <div
              style={{
                opacity: Math.max(0, 1 - heroProgress / 0.24),
              }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center z-20"
            >
              <p className="font-geist-mono text-xs sm:text-sm text-[#151515] tracking-tight mb-2">
                Initializing the collective… agents online{' '}
                <span className="font-bold text-[#3478F6]">
                  {String(agentCounter.online).padStart(3, '0')} / {agentCounter.total}
                </span>
              </p>
              <p className="font-geist-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#777777]">
                scroll to assemble the collective
              </p>
            </div>
          )}

          {/* MID-WAY TAGLINE ("100+ minds. One digital identity.") AT p: 0.26 -> 0.58 */}
          {showMidTagline && (
            <div
              style={{
                opacity:
                  heroProgress < 0.34
                    ? (heroProgress - 0.26) / 0.08
                    : heroProgress > 0.5
                    ? 1 - (heroProgress - 0.5) / 0.08
                    : 1,
              }}
              className="absolute inset-x-0 top-[48vh] flex justify-center pointer-events-none px-4 text-center z-20"
            >
              <p className="font-instrument italic text-2xl sm:text-4xl md:text-5xl text-[#151515] bg-[#FAFAF8]/85 px-5 py-1.5 rounded-full border border-[#E8E7E2] shadow-sm">
                {PORTFOLIO_CONTENT.identity.tagline}
              </p>
            </div>
          )}

          {/* GIANT DOM H1 OF FIRST NAME IN CAPITALS ("ALEN")
              weight 780, letter-spacing -0.035em, fitted to 90% width, at most 34% viewport height, top 11vh */}
          <div className="absolute inset-x-0 top-[11vh] flex justify-center pointer-events-none select-none z-10">
            <h1
              style={{
                opacity: realH1Opacity,
                letterSpacing: '-0.035em',
                fontWeight: 800,
                fontSize: 'clamp(4.4rem, 22vw, 31vh)',
                lineHeight: 0.92,
              }}
              className="w-[90vw] max-h-[34vh] text-center uppercase collective-gradient-text"
            >
              {PORTFOLIO_CONTENT.identity.firstNameCaps}
            </h1>
          </div>

          {/* SOFT BLUE-VIOLET ARCH BANNER + CUTOUT PORTRAIT (78vh tall on desktop, bottom-anchored, centred, head overlaps ALEN letters) */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-20">
            {/* Blue-violet arch banner growing from bottom centre (p: 0.60 -> 0.86) */}
            <div
              style={{
                opacity: archScale > 0.01 ? 1 : 0,
                transform: `scaleY(${archScale.toFixed(3)})`,
                transformOrigin: 'bottom center',
              }}
              className="w-[240px] sm:w-[320px] md:w-[390px] h-[40vh] sm:h-[54vh] md:h-[64vh] rounded-t-full collective-arch-banner"
            />

            {/* Cutout Portrait rising into the arch in front of the "ALEN" letters */}
            <img
              src={cutoutUrl}
              alt={PORTFOLIO_CONTENT.identity.fullName}
              style={{
                opacity: portraitRise > 0.02 ? 1 : 0,
                transform: `translate3d(0, ${((1 - portraitRise) * 120).toFixed(1)}px, 0)`,
              }}
              className="absolute bottom-0 h-[44vh] sm:h-[60vh] md:h-[76vh] w-auto object-contain object-bottom select-none drop-shadow-[0_16px_36px_rgba(21,21,21,0.14)]"
            />
          </div>

          {/* HERO FOREGROUND PIECES BUILT BY THE 8 NAMED BUILDERS (p: 0.60 -> 0.95) */}
          <div className="relative z-30 w-full max-w-7xl mx-auto mt-auto pb-2 sm:pb-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Left Column Hero Pieces */}
            <div className="md:col-span-5 space-y-2.5 bg-[#FAFAF8]/85 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-3 md:p-0 rounded-2xl border border-[#E8E7E2] md:border-none">
              {/* Piece 2: Full Name in small mono caps */}
              <div ref={hpMonoNameRef} style={getHeroPieceStyle(0.7)}>
                <span className="font-geist-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-[#777777] block">
                  {PORTFOLIO_CONTENT.identity.fullNameMono}
                </span>
              </div>

              {/* Piece 3: Headline "I build products that think." */}
              <div ref={hpHeadlineRef} style={getHeroPieceStyle(0.73)}>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] text-[#151515]">
                  {PORTFOLIO_CONTENT.identity.headlinePrefix}
                  <span className="font-instrument italic font-normal text-[#3478F6]">
                    {PORTFOLIO_CONTENT.identity.headlineAccent}
                  </span>
                </h2>
              </div>

              {/* Piece 4: One-line description from real projects */}
              <div ref={hpDescRef} style={getHeroPieceStyle(0.76)}>
                <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                  {PORTFOLIO_CONTENT.identity.heroDescription}
                </p>
              </div>

              {/* Piece 7: Magnetic "Explore my work" and "Resume" buttons */}
              <div
                ref={hpButtonsRef}
                style={getHeroPieceStyle(0.87)}
                className="flex flex-wrap items-center gap-2.5 pt-1"
              >
                <a
                  href="#projects"
                  className="px-4 py-2.5 rounded-full bg-[#151515] text-white font-geist text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 hover:bg-[#3478F6] transition-colors"
                >
                  <span>Explore my work</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <button
                  onClick={onOpenResume}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#E8E7E2] text-[#151515] font-geist text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 hover:border-[#3478F6] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#3478F6]" />
                  <span>Resume</span>
                </button>
              </div>
            </div>

            {/* Center Spacer for Cutout Portrait */}
            <div className="hidden md:block md:col-span-2" />

            {/* Right Column Hero Pieces: Studying, Standing, and Floating Future Pill */}
            <div className="md:col-span-5 space-y-2.5 flex flex-col md:items-end text-left md:text-right bg-[#FAFAF8]/85 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-3 md:p-0 rounded-2xl border border-[#E8E7E2] md:border-none">
              {/* Piece 8: Floating "CURRENTLY BUILDING THE FUTURE" pill with live green dot */}
              <div ref={hpFuturePillRef} style={getHeroPieceStyle(0.92)}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E7E2] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#13B89A] animate-ping" />
                  <span className="font-geist-mono text-[10px] tracking-[0.14em] uppercase text-[#151515] font-semibold">
                    {PORTFOLIO_CONTENT.identity.futurePill}
                  </span>
                </div>
              </div>

              {/* Piece 5: Studying row */}
              <div
                ref={hpStudyingRef}
                style={getHeroPieceStyle(0.79)}
                className="w-full max-w-md p-2.5 rounded-xl bg-white/90 border border-[#E8E7E2]"
              >
                <div className="font-geist-mono text-[10px] uppercase tracking-widest text-[#3478F6] mb-0.5">
                  Studying & Credentialed
                </div>
                <div className="text-xs text-[#151515] leading-snug">
                  {PORTFOLIO_CONTENT.identity.studyingRow}
                </div>
              </div>

              {/* Piece 6: Standing row */}
              <div
                ref={hpStandingRef}
                style={getHeroPieceStyle(0.82)}
                className="w-full max-w-md p-2.5 rounded-xl bg-white/90 border border-[#E8E7E2]"
              >
                <div className="font-geist-mono text-[10px] uppercase tracking-widest text-[#8758FF] mb-0.5">
                  Standing & Experience
                </div>
                <div className="text-xs text-[#151515] leading-snug">
                  {PORTFOLIO_CONTENT.identity.standingRow}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BELOW THE HERO — CALM SECTIONS, ONE IDEA EACH
          Every block is a .data-block with a .fill child built by idle cursors!
          ============================================================ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-14 space-y-24 sm:space-y-32 py-16 sm:py-24">
        {/* 1. ABOUT SECTION ("/about", "The human in the loop.", darkening serif statement, 3 columns) */}
        <section id="about" className="space-y-10">
          <div
            data-block-id="about-header"
            data-jsx-label="<AboutHeader />"
            data-built={builtBlocks['about-header'] ? 'true' : 'false'}
            className="data-block"
          >
            <div className="fill space-y-2">
              <span className="font-geist-mono text-xs text-[#3478F6] tracking-widest">
                {PORTFOLIO_CONTENT.about.label}
              </span>
              <PerCharHeading
                text={PORTFOLIO_CONTENT.about.heading}
                built={!!builtBlocks['about-header']}
                className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#151515]"
              />
            </div>
          </div>

          <div
            data-block-id="about-statement"
            data-jsx-label="<HumanStatement />"
            data-built={builtBlocks['about-statement'] ? 'true' : 'false'}
            className="data-block"
          >
            <div className="fill">
              <p
                ref={aboutStatementRef}
                className="font-instrument text-2xl sm:text-4xl md:text-5xl leading-[1.25] tracking-tight"
              >
                {aboutWords.map((word, wIdx) => {
                  const threshold = wIdx / Math.max(1, aboutWords.length);
                  const isDark = aboutWordProgress >= threshold;
                  return (
                    <span
                      key={wIdx}
                      style={{
                        color: isDark ? '#151515' : '#C9C7C1',
                        transition: 'color 0.25s ease',
                      }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E8E7E2]">
            {PORTFOLIO_CONTENT.about.columns.map((col, idx) => {
              const bId = `about-col-${idx}`;
              return (
                <div
                  key={col.title}
                  data-block-id={bId}
                  data-jsx-label={`<${col.title}Column />`}
                  data-built={builtBlocks[bId] ? 'true' : 'false'}
                  className="data-block"
                >
                  <div className="fill bg-white rounded-2xl p-6 border border-[#E8E7E2] h-full space-y-3">
                    <div className="font-geist-mono text-xs uppercase tracking-widest text-[#3478F6]">
                      0{idx + 1} · {col.title}
                    </div>
                    <ul className="space-y-2.5 text-sm text-[#151515] leading-relaxed">
                      {col.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#777777] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. NUMBERS SECTION (Four big count-up stats from Alen's resume) */}
        <section id="numbers" className="space-y-8">
          <div
            data-block-id="numbers-header"
            data-jsx-label="<MetricsHeader />"
            data-built={builtBlocks['numbers-header'] ? 'true' : 'false'}
            className="data-block"
          >
            <div className="fill flex items-baseline justify-between border-b border-[#E8E7E2] pb-4">
              <div>
                <span className="font-geist-mono text-xs text-[#8758FF] tracking-widest block mb-1">
                  /numbers
                </span>
                <PerCharHeading
                  text="Verified impact in numbers."
                  built={!!builtBlocks['numbers-header']}
                  className="text-2xl sm:text-4xl font-bold tracking-tight"
                />
              </div>
              <span className="font-geist-mono text-xs text-[#777777] hidden sm:inline">
                FROM ALEN DAVIS K RESUME
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTFOLIO_CONTENT.numbers.map((stat, idx) => {
              const bId = `stat-card-${idx}`;
              const isBuilt = !!builtBlocks[bId];
              return (
                <div
                  key={idx}
                  data-block-id={bId}
                  data-jsx-label={`<StatCounter index={${idx}} />`}
                  data-built={isBuilt ? 'true' : 'false'}
                  className="data-block"
                >
                  <div className="fill bg-white rounded-2xl p-6 border border-[#E8E7E2] h-full flex flex-col justify-between">
                    <div className="text-5xl sm:text-6xl mb-4">
                      <CountUpNumber
                        target={stat.value}
                        suffix={stat.suffix}
                        built={isBuilt}
                        color={stat.color}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================
          3. PROJECTS SECTION
          Pinned horizontal scroll on desktop (>= 768px) with intro panel + 1 card per project;
          Stacked vertically on phones (< 768px) so there is zero horizontal overflow!
          ============================================================ */}
      <section
        id="projects"
        ref={projectsTrackRef}
        className={`relative z-10 ${isMobile ? 'py-12 px-4' : 'h-[320vh]'}`}
      >
        <div
          className={
            isMobile
              ? 'max-w-7xl mx-auto space-y-6'
              : 'sticky top-0 h-screen overflow-hidden flex items-center px-8 md:px-14'
          }
        >
          <div
            style={
              isMobile
                ? undefined
                : {
                    transform: `translate3d(-${(projectsHorizProgress * 58).toFixed(2)}%, 0, 0)`,
                  }
            }
            className={
              isMobile
                ? 'flex flex-col gap-6'
                : 'flex items-stretch gap-8 will-change-transform'
            }
          >
            {/* Intro Panel */}
            <div
              data-block-id="projects-intro"
              data-jsx-label="<ProjectsIntro />"
              data-built={builtBlocks['projects-intro'] ? 'true' : 'false'}
              className={`data-block ${
                isMobile ? 'w-full' : 'w-[380px] lg:w-[440px] shrink-0'
              }`}
            >
              <div className="fill h-full bg-white rounded-3xl p-7 sm:p-9 border border-[#E8E7E2] flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="font-geist-mono text-xs text-[#3478F6] tracking-widest">
                    /projects
                  </span>
                  <PerCharHeading
                    text="Built to detect, verify & defend."
                    built={!!builtBlocks['projects-intro']}
                    className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08]"
                  />
                  <p className="font-instrument italic text-xl sm:text-2xl text-[#777777]">
                    Three hands-on security & hardware engineering labs from my resume.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E8E7E2] flex items-center justify-between text-xs font-geist-mono text-[#777777]">
                  <span>03 VERIFIED LABS</span>
                  <span>{isMobile ? 'STACKED VIEW' : 'SCROLL HORIZONTALLY →'}</span>
                </div>
              </div>
            </div>

            {/* One Full Card Per Project */}
            {PORTFOLIO_CONTENT.projects.map(proj => {
              const bId = `project-card-${proj.id}`;
              const isBuilt = !!builtBlocks[bId];
              return (
                <div
                  key={proj.id}
                  data-block-id={bId}
                  data-jsx-label={`<ProjectCard id="${proj.id}" />`}
                  data-built={isBuilt ? 'true' : 'false'}
                  onMouseEnter={e =>
                    engineRef.current?.setHoveredElement(e.currentTarget)
                  }
                  onMouseLeave={() => engineRef.current?.setHoveredElement(null)}
                  className={`data-block ${
                    isMobile ? 'w-full' : 'w-[500px] lg:w-[580px] shrink-0'
                  }`}
                >
                  <div className="fill relative h-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E7E2] hover:border-[#3478F6] transition-colors flex flex-col justify-between overflow-hidden">
                    {/* Subtle coloured pixel-grid top accent strip */}
                    <div
                      className="h-1.5 w-full rounded-full mb-4"
                      style={{
                        backgroundImage: `radial-gradient(${proj.accentColor} 1.5px, transparent 1.5px)`,
                        backgroundSize: '6px 6px',
                      }}
                    />

                    <div className="space-y-4">
                      {/* CSS-Drawn Illustration */}
                      <ProjectCssIllustration
                        type={proj.illustrationType}
                        accentColor={proj.accentColor}
                      />

                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          style={{ color: proj.accentColor }}
                          className="font-geist-mono text-xs font-bold"
                        >
                          PROJECT {proj.index}
                        </span>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-geist-mono text-xs text-[#151515] hover:text-[#3478F6] transition-colors"
                        >
                          <span>GitHub</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151515]">
                        {proj.name}
                      </h3>

                      <p className="font-instrument italic text-lg sm:text-xl text-[#3478F6]">
                        “{proj.hook}”
                      </p>

                      <div className="grid grid-cols-1 gap-3 pt-2 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E7E2]">
                          <span className="font-geist-mono text-[10px] uppercase tracking-widest text-[#FF5A70] block mb-1">
                            Problem
                          </span>
                          <p className="text-[#151515] leading-relaxed">{proj.problem}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E7E2]">
                          <span className="font-geist-mono text-[10px] uppercase tracking-widest text-[#13B89A] block mb-1">
                            Built
                          </span>
                          <p className="text-[#151515] leading-relaxed">{proj.built}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-[#E8E7E2]">
                      {proj.stack.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] font-geist-mono text-[11px] text-[#151515]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. STACK SECTION (One row per skill group; hovering a skill shows which projects used it)
          ============================================================ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-14 space-y-24 sm:space-y-32 py-12 sm:py-20">
        <section id="stack" className="space-y-8">
          <div
            data-block-id="stack-header"
            data-jsx-label="<TechStackHeader />"
            data-built={builtBlocks['stack-header'] ? 'true' : 'false'}
            className="data-block"
          >
            <div className="fill flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E7E2] pb-4">
              <div>
                <span className="font-geist-mono text-xs text-[#13B89A] tracking-widest block mb-1">
                  /stack
                </span>
                <PerCharHeading
                  text="Tools, protocols & operating systems."
                  built={!!builtBlocks['stack-header']}
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                />
              </div>

              <div className="font-geist-mono text-xs text-[#777777]">
                {hoveredSkill ? (
                  <span className="text-[#3478F6] font-semibold">
                    Used in: {highlightedProjectsForSkill.join(' · ')}
                  </span>
                ) : (
                  <span>Hover or tap any skill to inspect project usage</span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#E8E7E2] border-y border-[#E8E7E2] bg-white rounded-2xl overflow-hidden">
            {PORTFOLIO_CONTENT.stack.map((row, rIdx) => {
              const bId = `stack-row-${rIdx}`;
              return (
                <div
                  key={row.group}
                  data-block-id={bId}
                  data-jsx-label={`<StackRow group="${row.group}" />`}
                  data-built={builtBlocks[bId] ? 'true' : 'false'}
                  className="data-block"
                >
                  <div className="fill p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="md:w-64 shrink-0">
                      <span className="font-geist-mono text-xs uppercase tracking-wider text-[#777777]">
                        0{rIdx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#151515]">
                        {row.group}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 flex-1">
                      {row.skills.map(sk => {
                        const isHovered = hoveredSkill === sk.name;
                        return (
                          <button
                            key={sk.name}
                            type="button"
                            onMouseEnter={() => setHoveredSkill(sk.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                            onClick={() =>
                              setHoveredSkill(prev =>
                                prev === sk.name ? null : sk.name
                              )
                            }
                            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left ${
                              isHovered
                                ? 'bg-[#3478F6] text-white border-[#3478F6] shadow-sm'
                                : 'bg-[#FAFAF8] text-[#151515] border-[#E8E7E2] hover:border-[#3478F6]'
                            }`}
                          >
                            <div>{sk.name}</div>
                            {isHovered && (
                              <div className="font-geist-mono text-[10px] text-white/90 mt-0.5">
                                → {sk.usedIn.join(', ')}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================
          5. PROCESS SECTION (Sticky 300vh section where scroll moves a pointer through
             Idea, Research, Architecture, UI Design, Frontend, Backend, AI Engineering, Quality, Deployment,
             labelled "a visual demo, not a running system")
          ============================================================ */}
      <section
        id="process"
        ref={processTrackRef}
        className="relative z-10 h-[300vh]"
      >
        <div className="sticky top-0 h-screen flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-8 md:px-14 py-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E7E2] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E7E2] pb-4">
              <div>
                <span className="font-geist-mono text-xs text-[#FF5A70] tracking-widest block mb-1">
                  /process
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#151515]">
                  How the collective ships a system.
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] font-geist-mono text-[11px] text-[#777777]">
                a visual demo, not a running system
              </span>
            </div>

            {/* 9 Agent Stages Grid with Moving Simulated Agent Pointer */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {PORTFOLIO_CONTENT.processStages.map((stg, idx) => {
                const isActive = idx === activeProcessIdx;
                const isPassed = idx < activeProcessIdx;
                return (
                  <div
                    key={stg.step}
                    style={{
                      borderColor: isActive ? stg.color : '#E8E7E2',
                      backgroundColor: isActive ? '#FAFAF8' : '#FFFFFF',
                    }}
                    className="relative p-3.5 sm:p-4 rounded-2xl border transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        style={{ color: stg.color }}
                        className="font-geist-mono text-xs font-bold"
                      >
                        {stg.step} · {stg.agent}
                      </span>
                      <span
                        style={{
                          backgroundColor: isActive || isPassed ? stg.color : '#E8E7E2',
                          color: isActive || isPassed ? '#FFFFFF' : '#777777',
                        }}
                        className="px-2 py-0.5 rounded-full font-geist-mono text-[10px]"
                      >
                        {stg.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#777777] leading-snug">
                      {stg.detail}
                    </p>

                    {isActive && (
                      <div className="mt-2 inline-flex items-center gap-1.5 font-geist-mono text-[10px] text-[#151515]">
                        <Sparkles className="w-3 h-3" style={{ color: stg.color }} />
                        <span>Active pointer stage ({Math.round(processProgress * 100)}%)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. EXPERIENCE & CERTIFICATIONS SECTION (Timeline with scroll-filled rail)
          ============================================================ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-14 space-y-24 sm:space-y-32 py-16 sm:py-24">
        <section
          id="experience"
          ref={experienceTrackRef}
          className="space-y-12"
        >
          <div
            data-block-id="exp-header"
            data-jsx-label="<ExperienceHeader />"
            data-built={builtBlocks['exp-header'] ? 'true' : 'false'}
            className="data-block"
          >
            <div className="fill space-y-2">
              <span className="font-geist-mono text-xs text-[#FF963B] tracking-widest">
                /experience
              </span>
              <PerCharHeading
                text="Field internships & verified credentials."
                built={!!builtBlocks['exp-header']}
                className="text-3xl sm:text-5xl font-bold tracking-tight"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 7 Cols: Timeline with Scroll-Filled Rail */}
            <div className="lg:col-span-7 relative pl-6 sm:pl-8 space-y-8">
              {/* Background Track Rail */}
              <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-[#E8E7E2]" />
              {/* Scroll-Filled Active Rail */}
              <div
                style={{ height: `${(expRailProgress * 100).toFixed(1)}%` }}
                className="absolute left-2 top-2 w-[2px] bg-[#3478F6] transition-all duration-150"
              />

              {PORTFOLIO_CONTENT.experience.map((exp, idx) => {
                const bId = `exp-item-${idx}`;
                return (
                  <div
                    key={exp.company}
                    data-block-id={bId}
                    data-jsx-label={`<TimelineMilestone company="${exp.company}" />`}
                    data-built={builtBlocks[bId] ? 'true' : 'false'}
                    onMouseEnter={e =>
                      engineRef.current?.setHoveredElement(e.currentTarget)
                    }
                    onMouseLeave={() => engineRef.current?.setHoveredElement(null)}
                    className="data-block relative"
                  >
                    <span className="absolute -left-[22px] sm:-left-[30px] top-6 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3478F6]" />
                    <div className="fill bg-white rounded-2xl p-6 border border-[#E8E7E2] hover:border-[#3478F6] transition-colors space-y-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-[#151515]">
                          {exp.role} ·{' '}
                          <span className="font-instrument italic font-normal text-2xl text-[#3478F6]">
                            {exp.company}
                          </span>
                        </h3>
                        <span className="font-geist-mono text-xs text-[#777777]">
                          {exp.location}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#777777]">
                        {exp.summary}
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#151515]">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#3478F6] mt-1">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 5 Cols: Certifications List */}
            <div className="lg:col-span-5 space-y-4">
              <div
                data-block-id="certs-card"
                data-jsx-label="<CertificationsList />"
                data-built={builtBlocks['certs-card'] ? 'true' : 'false'}
                className="data-block"
              >
                <div className="fill bg-white rounded-2xl p-6 border border-[#E8E7E2] space-y-4">
                  <div className="font-geist-mono text-xs uppercase tracking-widest text-[#13B89A]">
                    Certifications & Conferences
                  </div>
                  <div className="divide-y divide-[#E8E7E2]">
                    {PORTFOLIO_CONTENT.certifications.map((cert, i) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0">
                        <div className="font-semibold text-sm text-[#151515]">
                          {cert.name}
                        </div>
                        <div className="font-geist-mono text-xs text-[#777777] mt-0.5">
                          {cert.issuer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            7. CONTACT SECTION & FOOTER
            Giant "Have an idea? Let's build it.", round photo avatar card, email with copy button
            (54 cursors form a ring around Copy button & Creative Director clicks it!)
            ============================================================ */}
        <section
          id="contact"
          ref={contactSectionRef}
          className="space-y-10 pt-8 border-t border-[#E8E7E2]"
        >
          <div
            data-block-id="contact-heading"
            data-jsx-label="<ContactHero />"
            data-built={builtBlocks['contact-heading'] ? 'true' : 'false'}
            className="data-block text-center"
          >
            <div className="fill space-y-3">
              <span className="font-geist-mono text-xs text-[#3478F6] tracking-widest">
                /contact
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#151515]">
                Have an idea?{' '}
                <span className="font-instrument italic font-normal text-[#3478F6]">
                  Let’s build it.
                </span>
              </h2>
            </div>
          </div>

          <div
            data-block-id="contact-card"
            data-jsx-label="<IdentityContactCard />"
            data-built={builtBlocks['contact-card'] ? 'true' : 'false'}
            className="data-block max-w-2xl mx-auto"
          >
            <div className="fill bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E7E2] shadow-sm flex flex-col items-center text-center space-y-6">
              <img
                src={PORTFOLIO_CONTENT.identity.photoUrl}
                alt={PORTFOLIO_CONTENT.identity.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#E8E7E2]"
              />

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#151515]">
                  {PORTFOLIO_CONTENT.identity.fullName}
                </h3>
                <p className="font-geist-mono text-xs text-[#777777] mt-1">
                  {PORTFOLIO_CONTENT.identity.location} · {PORTFOLIO_CONTENT.identity.phone}
                </p>
              </div>

              {/* Email with Copy Button (Targeted by Creative Director & 54-cursor ring!) */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                <a
                  href={`mailto:${PORTFOLIO_CONTENT.identity.email}`}
                  className="px-4 py-2.5 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] font-geist-mono text-xs sm:text-sm text-[#151515] hover:border-[#3478F6] transition-colors"
                >
                  {PORTFOLIO_CONTENT.identity.email}
                </a>
                <button
                  ref={copyBtnRef}
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-4 py-2.5 rounded-full bg-[#3478F6] text-white font-geist text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy email</span>
                    </>
                  )}
                </button>
              </div>

              {/* GitHub, Phone & Resume Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={PORTFOLIO_CONTENT.identity.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] text-xs font-geist-mono text-[#151515] hover:border-[#151515] inline-flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`tel:${PORTFOLIO_CONTENT.identity.phone.replace(/\s+/g, '')}`}
                  className="px-4 py-2 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] text-xs font-geist-mono text-[#151515] hover:border-[#151515]"
                >
                  {PORTFOLIO_CONTENT.identity.phone}
                </a>

                <a
                  href={PORTFOLIO_CONTENT.identity.resumePdfUrl}
                  download="Alen_Davis_K_Resume.pdf"
                  className="px-4 py-2 rounded-full bg-[#151515] text-white text-xs font-geist-mono hover:bg-[#3478F6] transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume PDF</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenResume}
                  className="px-4 py-2 rounded-full bg-[#FAFAF8] border border-[#E8E7E2] text-xs font-geist-mono text-[#151515] hover:border-[#3478F6]"
                >
                  Interactive Resume
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-12 pb-16 border-t border-[#E8E7E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-geist-mono text-xs text-[#777777]">
            Built by a collective of simulated agent cursors. The agents are choreography; the code is real.
          </p>

          <button
            type="button"
            onClick={handleWatchBuildAgain}
            className="px-4 py-2 rounded-full bg-white border border-[#E8E7E2] text-xs font-geist-mono text-[#151515] hover:border-[#3478F6] inline-flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#3478F6]" />
            <span>Watch it build again</span>
          </button>
        </footer>
      </main>
    </div>
  );
};

