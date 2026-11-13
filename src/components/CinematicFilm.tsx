import React, { useEffect, useRef, useState } from 'react';
import { FILM_PORTFOLIO_DATA } from '../data/portfolio';
import {
  FILM_CHAPTER_WINDOWS,
  computeCanvasDimAmount,
  computeSceneMotion,
  filmProgressToRawScroll,
  remapScrollWithDwell,
} from '../data/film';
import { ExternalLink, FileText, Code2, Mail, Sparkles, Compass, Terminal as TerminalIcon } from 'lucide-react';

interface CinematicFilmProps {
  onOpenResume: () => void;
  onSwitchToCity3D: () => void;
  onSwitchToClassicView: () => void;
}

/**
 * Renders a warm gold heading with letter-by-letter staggered rise as the scene enters.
 */
const GoldLetterHeading: React.FC<{
  text: string;
  localProgress: number;
  className?: string;
  singleLine?: boolean;
}> = ({ text, localProgress, className = '', singleLine = false }) => {
  // Entrance stagger completes in the first 28% of the scene window
  const entrance = Math.max(0, Math.min(1, localProgress / 0.28));
  const words = text.split(' ');
  let charCounter = 0;
  const totalChars = Math.max(1, text.length);

  return (
    <h2
      aria-label={text}
      className={`font-cinzel-dec font-bold tracking-wide film-gold-heading ${
        singleLine ? 'whitespace-nowrap' : ''
      } ${className}`}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0">
          {Array.from(word).map((ch, cIdx) => {
            const idx = charCounter++;
            const delayFrac = (idx / totalChars) * 0.55;
            const charProg = Math.max(
              0,
              Math.min(1, (entrance - delayFrac) / (1 - delayFrac))
            );
            const ease = 1 - Math.pow(1 - charProg, 3);
            const y = (1 - ease) * 18;
            return (
              <span
                key={cIdx}
                style={{
                  display: 'inline-block',
                  opacity: 0.15 + ease * 0.85,
                  transform: `translate3d(0, ${y.toFixed(1)}px, 0)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
};

export const CinematicFilm: React.FC<CinematicFilmProps> = ({
  onOpenResume,
  onSwitchToCity3D,
  onSwitchToClassicView,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const portraitImgRef = useRef<HTMLImageElement | null>(null);
  const bgImagesRef = useRef<Record<string, HTMLImageElement>>({});

  const [filmProgress, setFilmProgress] = useState<number>(0);
  const [rawScroll, setRawScroll] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);

  const targetRawScrollRef = useRef<number>(0);
  const smoothRawScrollRef = useRef<number>(0);

  // Preload Alen's portrait & atmospheric art layers for rich painterly compositing
  useEffect(() => {
    const portrait = new Image();
    portrait.src = '/alen-davis.jpg';
    portraitImgRef.current = portrait;

    const bgSources: Record<string, string> = {
      twilight: '/gta/gta_twilight_city.jpg',
      hero: '/gta/gta_alen_hero.jpg',
      ocean: '/gta/gta_ocean_drive.jpg',
      hq: '/gta/gta_hq_building.jpg',
      neon: '/gta/gta_neon_alley.jpg',
    };
    Object.entries(bgSources).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      bgImagesRef.current[key] = img;
    });
  }, []);

  // Track viewport size for mobile (<768px) layout & scroll height
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track window scroll and smoothly interpolate + apply DWELL remap
  useEffect(() => {
    const updateScrollTarget = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const frac = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      targetRawScrollRef.current = frac;
    };

    updateScrollTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollTarget);
  }, []);

  // Main 60fps animation & procedural 5-Clip Fairy-Tale Film renderer on fixed <canvas>
  useEffect(() => {
    let rafId = 0;
    const startTime = performance.now();

    // Deterministic particles (stars, fireflies, lanterns, sparkles)
    const stars = Array.from({ length: 140 }, (_, i) => ({
      x: ((i * 73 + 19) % 1000) / 1000,
      y: ((i * 41 + 7) % 620) / 1000,
      r: 0.7 + ((i * 13) % 18) / 10,
      phase: (i * 0.47) % (Math.PI * 2),
    }));

    const lanterns = Array.from({ length: 34 }, (_, i) => ({
      x: ((i * 97 + 31) % 1000) / 1000,
      yBase: 0.25 + ((i * 53) % 700) / 1000,
      speed: 0.12 + ((i * 17) % 25) / 100,
      size: 4 + (i % 6) * 1.6,
      hue: i % 3 === 0 ? '#f6b6d6' : '#f1cf86',
      sway: (i * 1.1) % (Math.PI * 2),
    }));

    const renderFrame = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // Smooth lerp toward target raw scroll
      const diff = targetRawScrollRef.current - smoothRawScrollRef.current;
      if (Math.abs(diff) > 0.00005) {
        smoothRawScrollRef.current += diff * 0.14;
      } else {
        smoothRawScrollRef.current = targetRawScrollRef.current;
      }

      const currentRaw = smoothRawScrollRef.current;
      const currentFilm = remapScrollWithDwell(currentRaw);

      setRawScroll(currentRaw);
      setFilmProgress(currentFilm);

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          drawFairyTaleFilmFrame(
            ctx,
            w,
            h,
            currentFilm,
            elapsed,
            stars,
            lanterns,
            portraitImgRef.current,
            bgImagesRef.current,
            w < 768
          );
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const jumpToFilmProgress = (targetFilm: number) => {
    const raw = filmProgressToRawScroll(targetFilm);
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    window.scrollTo({
      top: raw * maxScroll,
      behavior: 'smooth',
    });
    setIsChapterMenuOpen(false);
  };

  // Compute scene motions for all 12 windows
  const sIntro = computeSceneMotion(filmProgress, 0.0, 0.035);
  const sKingdom = computeSceneMotion(filmProgress, 0.04, 0.11);
  const sAbout = computeSceneMotion(filmProgress, 0.115, 0.205);
  const sStarring = computeSceneMotion(filmProgress, 0.209, 0.266);
  const sEducation = computeSceneMotion(filmProgress, 0.27, 0.395);
  const sSkillsTitle = computeSceneMotion(filmProgress, 0.397, 0.452);
  const sSkillsWave1 = computeSceneMotion(filmProgress, 0.448, 0.525);
  const sSkillsWave2 = computeSceneMotion(filmProgress, 0.492, 0.568);
  const sSkillsWave3 = computeSceneMotion(filmProgress, 0.535, 0.605);
  const sWorkTitle = computeSceneMotion(filmProgress, 0.6, 0.652);
  const sProj1 = computeSceneMotion(filmProgress, 0.648, 0.698);
  const sProj2 = computeSceneMotion(filmProgress, 0.699, 0.749);
  const sProj3 = computeSceneMotion(filmProgress, 0.75, 0.8);
  const sAchievements = computeSceneMotion(filmProgress, 0.803, 0.858);
  const sExperience = computeSceneMotion(filmProgress, 0.862, 0.922);
  const sEpilogue = computeSceneMotion(filmProgress, 0.93, 1.0, true);

  const canvasDim = computeCanvasDimAmount(filmProgress);

  const activeChapter =
    FILM_CHAPTER_WINDOWS.find(
      c => filmProgress >= c.start - 0.01 && filmProgress <= c.end + 0.01
    ) || FILM_CHAPTER_WINDOWS[0];

  const makeMotionStyle = (m: ReturnType<typeof computeSceneMotion>): React.CSSProperties => ({
    opacity: m.opacity,
    filter: m.blurPx > 0.15 ? `blur(${m.blurPx.toFixed(1)}px)` : 'none',
    transform: `translate3d(0, ${m.translateY.toFixed(1)}px, 0) scale(${m.scale.toFixed(3)})`,
    willChange: 'transform, opacity, filter',
  });

  return (
    <div
      className={`relative w-full select-none ${
        isMobile ? 'h-[4200vh]' : 'h-[5200vh]'
      }`}
    >
      {/* FIXED FULL-SCREEN CANVAS VIEWPORT */}
      <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-[#080a24]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block object-cover"
        />

        {/* Soft dynamic dim layer while chapter typography is on screen */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(8,10,36,0.35) 0%, rgba(5,7,26,0.75) 100%)',
            opacity: canvasDim,
          }}
        />

        {/* Subtle Top-Right Mode & Chapter Switcher Pill (Minimalist Film Chrome) */}
        <div className="fixed top-3.5 right-3.5 sm:top-5 sm:right-6 z-40 flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setIsChapterMenuOpen(prev => !prev)}
              className="film-frosted-pill px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-manrope font-medium text-[#fff3cf] flex items-center gap-1.5"
              title="Jump to Film Chapter"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f1cf86]" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {activeChapter.label}
              </span>
            </button>

            {isChapterMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl film-project-glass p-2 shadow-2xl z-50">
                <div className="px-2.5 py-1 text-[10px] font-cinzel tracking-widest uppercase text-[#f1cf86]/80 border-b border-[#f1cf86]/20 mb-1">
                  Film Chapters
                </div>
                <div className="max-h-64 overflow-y-auto no-scrollbar space-y-0.5">
                  {FILM_CHAPTER_WINDOWS.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => jumpToFilmProgress((ch.start + ch.end) * 0.5)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-manrope transition-colors flex items-center justify-between ${
                        activeChapter.id === ch.id
                          ? 'bg-[#f1cf86]/20 text-[#fff3cf] font-semibold'
                          : 'text-[#fff3cf]/75 hover:bg-white/10 hover:text-[#fff3cf]'
                      }`}
                    >
                      <span>{ch.label}</span>
                      <span className="text-[10px] text-[#f1cf86]/70">
                        {Math.round(ch.start * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#f1cf86]/20 mt-1.5 pt-1.5 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setIsChapterMenuOpen(false);
                      onSwitchToCity3D();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-manrope text-[#f6b6d6] hover:bg-white/10 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Switch to 3D Cyber City</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsChapterMenuOpen(false);
                      onSwitchToClassicView();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-manrope text-[#f1cf86] hover:bg-white/10 flex items-center gap-2"
                  >
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Switch to Classic OS View</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenResume}
            className="film-frosted-pill px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-manrope font-medium text-[#fff3cf] flex items-center gap-1.5"
            title="View / Download Résumé"
          >
            <FileText className="w-3.5 h-3.5 text-[#f6b6d6]" />
            <span className="hidden xs:inline">Résumé</span>
          </button>
        </div>

        {/* ============================================================
            SCENE OVERLAYS (Pointer-events: none container; interactive links have pointer-events: auto)
            ============================================================ */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* 1. 0.000 - 0.035 (Centre): 'An Alen Davis K Film' + 'Scroll to begin' */}
          {sIntro.visible && (
            <div
              style={makeMotionStyle(sIntro)}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="film-shadow-pool flex flex-col items-center">
                <p className="font-cinzel text-xs sm:text-sm md:text-base tracking-[0.34em] uppercase text-[#f6b6d6] mb-3">
                  A Scroll-Driven Picture
                </p>
                <GoldLetterHeading
                  text={FILM_PORTFOLIO_DATA.protagonist.filmCredit}
                  localProgress={sIntro.localProgress}
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
                />
                <div className="mt-8 flex flex-col items-center gap-2">
                  <span className="font-manrope text-[11px] sm:text-xs tracking-[0.28em] uppercase text-[#f1cf86]/90">
                    Scroll to begin
                  </span>
                  <div className="w-[1px] h-9 bg-gradient-to-b from-[#f1cf86] via-[#f6b6d6] to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* 2. 0.040 - 0.110 (Lower centre): 'The Kingdom of Alen', huge, in gold */}
          {sKingdom.visible && (
            <div
              style={makeMotionStyle(sKingdom)}
              className="absolute inset-x-0 bottom-14 sm:bottom-20 flex flex-col items-center justify-end px-4 sm:px-8 text-center"
            >
              <div className="film-shadow-pool max-w-4xl">
                <p className="font-cinzel text-[11px] sm:text-xs md:text-sm film-gold-label mb-2">
                  Prologue · Citadel of Systems & Cyber Defence
                </p>
                <GoldLetterHeading
                  text={FILM_PORTFOLIO_DATA.protagonist.kingdomTitle}
                  localProgress={sKingdom.localProgress}
                  className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.08]"
                />
                <p className="font-cormorant italic text-base sm:text-xl md:text-2xl film-body-text mt-3 text-[#fff3cf]/90">
                  Where resilient Linux architecture meets real-time security intelligence
                </p>
              </div>
            </div>
          )}

          {/* 3. 0.115 - 0.205 (Left on desktop, bottom full-width on phone): Chapter I + About Me */}
          {sAbout.visible && (
            <div
              style={makeMotionStyle(sAbout)}
              className="absolute inset-x-4 bottom-8 md:inset-x-auto md:left-12 lg:left-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-xl"
            >
              <div className="film-shadow-pool text-left">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1.5">
                  Chapter I
                </p>
                <GoldLetterHeading
                  text="About Me"
                  localProgress={sAbout.localProgress}
                  className="text-3xl sm:text-5xl md:text-6xl mb-3"
                />
                <p className="font-cormorant text-lg sm:text-xl md:text-2xl leading-relaxed film-body-text mb-5">
                  {FILM_PORTFOLIO_DATA.protagonist.tagline}
                </p>

                {/* Glowing row of 3 key stats */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-5 pt-3 border-t border-[#f1cf86]/30">
                  {FILM_PORTFOLIO_DATA.stats.map((st, idx) => (
                    <div key={idx} className="text-left">
                      <div className="font-cinzel-dec font-bold text-xl sm:text-3xl md:text-4xl film-gold-heading">
                        {st.value}
                      </div>
                      <div className="font-manrope text-[10px] sm:text-xs text-[#fff3cf]/85 leading-snug mt-0.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. 0.209 - 0.266 (Top-left on desktop, bottom full-width on phone): 'Starring Alen Davis K' */}
          {sStarring.visible && (
            <div
              style={makeMotionStyle(sStarring)}
              className="absolute inset-x-4 bottom-10 md:inset-x-auto md:top-16 md:bottom-auto md:left-12 lg:left-20 md:max-w-lg"
            >
              <div className="film-shadow-pool text-left">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1.5">
                  Featured Protagonist
                </p>
                <GoldLetterHeading
                  text={FILM_PORTFOLIO_DATA.protagonist.starringCredit}
                  localProgress={sStarring.localProgress}
                  className="text-2xl sm:text-4xl md:text-5xl"
                />
                <p className="font-cormorant italic text-base sm:text-xl text-[#f6b6d6] mt-2 film-body-text">
                  SOC Analyst L1 · Linux System Administrator · Digital Forensics Investigator
                </p>
              </div>
            </div>
          )}

          {/* 5. 0.270 - 0.395 (Right on desktop, bottom full-width on phone): Education + Frosted-glass pills */}
          {sEducation.visible && (
            <div
              style={makeMotionStyle(sEducation)}
              className="absolute inset-x-4 bottom-8 md:inset-x-auto md:right-12 lg:right-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-xl"
            >
              <div className="film-shadow-pool text-left md:text-right">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1.5">
                  Academic Foundation & Training
                </p>
                <GoldLetterHeading
                  text="Education"
                  localProgress={sEducation.localProgress}
                  className="text-3xl sm:text-5xl md:text-6xl mb-3"
                />
                <p className="font-cinzel font-semibold text-base sm:text-xl md:text-2xl text-[#fff3cf] film-body-text">
                  {FILM_PORTFOLIO_DATA.education.degree}
                </p>
                <p className="font-cormorant italic text-base sm:text-xl text-[#f1cf86] film-body-text mt-0.5">
                  {FILM_PORTFOLIO_DATA.education.institution}
                </p>
                <p className="font-manrope text-xs sm:text-sm text-[#fff3cf]/80 film-body-text mt-0.5 mb-4">
                  {FILM_PORTFOLIO_DATA.education.location}
                </p>

                {/* Small frosted-glass pills for credentials */}
                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                  {FILM_PORTFOLIO_DATA.education.credentials.map((cred, idx) => (
                    <span
                      key={idx}
                      className="film-frosted-pill px-3 py-1.5 rounded-full font-manrope text-[11px] sm:text-xs text-[#fff3cf]"
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. 0.397 - 0.452 (Centre): 'Chapter II' + 'My Skills', huge */}
          {sSkillsTitle.visible && (
            <div
              style={makeMotionStyle(sSkillsTitle)}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="film-shadow-pool">
                <p className="font-cinzel text-xs sm:text-sm md:text-base film-gold-label mb-2">
                  Chapter II
                </p>
                <GoldLetterHeading
                  text="My Skills"
                  localProgress={sSkillsTitle.localProgress}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                />
                <p className="font-cormorant italic text-base sm:text-xl md:text-2xl film-body-text mt-2 text-[#f6b6d6]">
                  Constellations of security operations, Linux engineering & network defence
                </p>
              </div>
            </div>
          )}

          {/* 7. 0.448 - 0.605: Skills as floating constellations of glowing words (no boxes) in 3 waves
                 On phones: evenly spaced zig-zag layout so words NEVER overlap! */}
          {sSkillsWave1.visible && (
            <SkillConstellationWave
              group={FILM_PORTFOLIO_DATA.skillConstellations[0]}
              motion={sSkillsWave1}
              isMobile={isMobile}
              waveIndex={0}
            />
          )}
          {sSkillsWave2.visible && (
            <SkillConstellationWave
              group={FILM_PORTFOLIO_DATA.skillConstellations[1]}
              motion={sSkillsWave2}
              isMobile={isMobile}
              waveIndex={1}
            />
          )}
          {sSkillsWave3.visible && (
            <SkillConstellationWave
              group={FILM_PORTFOLIO_DATA.skillConstellations[2]}
              motion={sSkillsWave3}
              isMobile={isMobile}
              waveIndex={2}
            />
          )}

          {/* 8. 0.600 - 0.652 (Centre): 'Chapter III' + 'My Work', huge */}
          {sWorkTitle.visible && (
            <div
              style={makeMotionStyle(sWorkTitle)}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="film-shadow-pool">
                <p className="font-cinzel text-xs sm:text-sm md:text-base film-gold-label mb-2">
                  Chapter III
                </p>
                <GoldLetterHeading
                  text="My Work"
                  localProgress={sWorkTitle.localProgress}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                />
                <p className="font-cormorant italic text-base sm:text-xl md:text-2xl film-body-text mt-2 text-[#fff3cf]/90">
                  Selected laboratories in SIEM detection, cryptographic integrity & hardware security
                </p>
              </div>
            </div>
          )}

          {/* 9. 0.648 - 0.800: Three projects one at a time (Ultra-transparent frosted glass cards) */}
          {sProj1.visible && (
            <ProjectGlassPanel
              project={FILM_PORTFOLIO_DATA.projects[0]}
              motion={sProj1}
              isMobile={isMobile}
            />
          )}
          {sProj2.visible && (
            <ProjectGlassPanel
              project={FILM_PORTFOLIO_DATA.projects[1]}
              motion={sProj2}
              isMobile={isMobile}
            />
          )}
          {sProj3.visible && (
            <ProjectGlassPanel
              project={FILM_PORTFOLIO_DATA.projects[2]}
              motion={sProj3}
              isMobile={isMobile}
            />
          )}

          {/* 10. 0.803 - 0.858 (Top-left on desktop, bottom full-width on phone): Chapter IV + Achievements */}
          {sAchievements.visible && (
            <div
              style={makeMotionStyle(sAchievements)}
              className="absolute inset-x-4 bottom-8 md:inset-x-auto md:top-16 md:bottom-auto md:left-12 lg:left-20 md:max-w-xl"
            >
              <div className="film-shadow-pool text-left">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1">
                  Chapter IV
                </p>
                {/* Keep 'Achievements' on a single line as required by the PDF spec */}
                <GoldLetterHeading
                  text="Achievements"
                  localProgress={sAchievements.localProgress}
                  singleLine
                  className="text-2xl sm:text-4xl md:text-5xl mb-3"
                />

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-cinzel-dec font-bold text-4xl sm:text-6xl md:text-7xl film-gold-heading">
                    {FILM_PORTFOLIO_DATA.achievements.featuredNumber}
                  </span>
                  <span className="font-cormorant italic text-base sm:text-xl text-[#f6b6d6] film-body-text">
                    {FILM_PORTFOLIO_DATA.achievements.featuredCaption}
                  </span>
                </div>

                <div className="space-y-2 border-t border-[#f1cf86]/30 pt-3">
                  {FILM_PORTFOLIO_DATA.achievements.list.map((ach, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                      <span className="font-cinzel font-semibold text-xs sm:text-sm text-[#fff3cf] film-body-text">
                        ✦ {ach.title}
                      </span>
                      <span className="font-cormorant italic text-xs sm:text-sm text-[#f1cf86]/90 film-body-text">
                        {ach.issuer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. 0.862 - 0.922 (Right on desktop, bottom full-width on phone): Chapter V + Experience */}
          {sExperience.visible && (
            <div
              style={makeMotionStyle(sExperience)}
              className="absolute inset-x-4 bottom-8 md:inset-x-auto md:right-12 lg:right-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-xl"
            >
              <div className="film-shadow-pool text-left">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1">
                  Chapter V
                </p>
                <GoldLetterHeading
                  text="Experience"
                  localProgress={sExperience.localProgress}
                  className="text-3xl sm:text-5xl md:text-6xl mb-3"
                />

                <div className="space-y-3">
                  {FILM_PORTFOLIO_DATA.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-[#f1cf86]/50 pl-3.5 py-0.5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="font-cinzel font-bold text-sm sm:text-base text-[#fff3cf] film-body-text">
                          {exp.role} — <span className="text-[#f1cf86]">{exp.organization}</span>
                        </span>
                        <span className="font-manrope text-[11px] text-[#f6b6d6]">
                          {exp.location}
                        </span>
                      </div>
                      <p className="font-cormorant text-sm sm:text-base md:text-lg text-[#fff8e8]/90 leading-snug film-body-text mt-0.5">
                        {exp.highlight}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Flowing certifications credits line */}
                <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.16em] uppercase text-[#f1cf86]/90 mt-4 pt-2.5 border-t border-[#f1cf86]/25 film-body-text">
                  {FILM_PORTFOLIO_DATA.certificationsCredits}
                </p>
              </div>
            </div>
          )}

          {/* 12. 0.930 - 1.000 (Centre, stays on screen): Epilogue + Contact Me */}
          {sEpilogue.visible && (
            <div
              style={makeMotionStyle(sEpilogue)}
              className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 text-center pointer-events-auto"
            >
              <div className="film-shadow-pool max-w-3xl w-full flex flex-col items-center">
                <p className="font-cinzel text-xs sm:text-sm film-gold-label mb-1.5">
                  Epilogue
                </p>
                <GoldLetterHeading
                  text="Contact Me"
                  localProgress={sEpilogue.localProgress}
                  className="text-3xl sm:text-6xl md:text-7xl mb-2.5"
                />
                <p className="font-cormorant italic text-base sm:text-xl md:text-2xl film-body-text max-w-xl mb-5 text-[#fff3cf]/95">
                  {FILM_PORTFOLIO_DATA.contact.invitation}
                </p>

                {/* Large glowing email link */}
                <a
                  href={`mailto:${FILM_PORTFOLIO_DATA.contact.email}`}
                  className="font-cinzel font-bold text-lg sm:text-2xl md:text-3xl film-gold-heading hover:text-[#f6b6d6] transition-colors underline decoration-[#f1cf86]/50 underline-offset-8 mb-6 flex items-center gap-2.5 break-all"
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#f1cf86] shrink-0" />
                  <span>{FILM_PORTFOLIO_DATA.contact.email}</span>
                </a>

                {/* Frosted-glass pills for GitHub and Résumé */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-6">
                  <a
                    href={FILM_PORTFOLIO_DATA.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="film-frosted-pill px-4 py-2.5 rounded-full font-manrope text-xs sm:text-sm text-[#fff3cf] flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4 text-[#f6b6d6]" />
                    <span>GitHub · @alend66</span>
                  </a>

                  <a
                    href={FILM_PORTFOLIO_DATA.contact.resumePdf}
                    download="Alen_Davis_K_Resume.pdf"
                    className="film-frosted-pill px-4 py-2.5 rounded-full font-manrope text-xs sm:text-sm text-[#fff3cf] flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#f1cf86]" />
                    <span>Download Résumé PDF</span>
                  </a>

                  <button
                    onClick={onOpenResume}
                    className="film-frosted-pill px-4 py-2.5 rounded-full font-manrope text-xs sm:text-sm text-[#f6b6d6] flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#f6b6d6]" />
                    <span>Interactive Résumé</span>
                  </button>
                </div>

                {/* Tiny AI credit line as specified in PDF 2 */}
                <p className="font-manrope text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#fff3cf]/55 mt-2">
                  {FILM_PORTFOLIO_DATA.contact.aiCredit}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            BOTTOM MINIMALIST ROSE-TO-GOLD PROGRESS LINE
            ============================================================ */}
        <div className="fixed bottom-0 left-0 right-0 h-[3px] bg-[#080a24]/80 z-40 pointer-events-none">
          <div
            className="h-full transition-none"
            style={{
              width: `${Math.min(100, Math.max(0, rawScroll * 100)).toFixed(2)}%`,
              background: 'linear-gradient(90deg, #f6b6d6 0%, #f1cf86 65%, #fff3cf 100%)',
              boxShadow: '0 0 14px rgba(241, 207, 134, 0.85)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Skill Constellation Wave (No boxes; words drift upward like lanterns;
 * on phones: evenly spaced zig-zag layout at the bottom so words NEVER overlap).
 */
const SkillConstellationWave: React.FC<{
  group: (typeof FILM_PORTFOLIO_DATA.skillConstellations)[number];
  motion: ReturnType<typeof computeSceneMotion>;
  isMobile: boolean;
  waveIndex: number;
}> = ({ group, motion, isMobile, waveIndex }) => {
  // Desktop desktop offsets for the 3 waves (left, right, lower)
  const desktopOffsets: Array<Array<{ x: number; y: number }>> = [
    [
      { x: 8, y: 22 },
      { x: 24, y: 16 },
      { x: 12, y: 36 },
      { x: 29, y: 31 },
      { x: 7, y: 52 },
      { x: 25, y: 48 },
      { x: 14, y: 66 },
      { x: 31, y: 62 },
    ],
    [
      { x: 64, y: 20 },
      { x: 80, y: 15 },
      { x: 60, y: 35 },
      { x: 77, y: 31 },
      { x: 65, y: 50 },
      { x: 82, y: 46 },
      { x: 61, y: 65 },
      { x: 78, y: 61 },
    ],
    [
      { x: 14, y: 58 },
      { x: 32, y: 52 },
      { x: 50, y: 57 },
      { x: 68, y: 52 },
      { x: 20, y: 73 },
      { x: 40, y: 69 },
      { x: 60, y: 74 },
      { x: 78, y: 68 },
    ],
  ];

  const driftY = (0.5 - motion.localProgress) * 34;

  if (isMobile) {
    // Evenly spaced zig-zag layout on phones so words NEVER overlap
    return (
      <div
        style={{
          opacity: motion.opacity,
          filter: motion.blurPx > 0.15 ? `blur(${motion.blurPx.toFixed(1)}px)` : 'none',
          transform: `translate3d(0, ${(motion.translateY + driftY * 0.5).toFixed(1)}px, 0)`,
        }}
        className="absolute inset-x-4 bottom-10 flex flex-col justify-end"
      >
        <div className="film-shadow-pool">
          <p className="font-cinzel text-xs film-gold-label text-center mb-3">
            ✦ {group.label} ✦
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {group.words.map((word, i) => {
              const isRight = i % 2 === 1;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 ${
                    isRight ? 'justify-end text-right translate-y-1.5' : 'justify-start text-left'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f1cf86] shadow-[0_0_8px_#f1cf86] shrink-0" />
                  <span className="font-Cormorant font-semibold text-base text-[#fff3cf] film-body-text">
                    {word}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop floating lantern constellation
  const coords = desktopOffsets[waveIndex] || desktopOffsets[0];
  const labelPos =
    waveIndex === 0
      ? 'left-16 top-12 text-left'
      : waveIndex === 1
      ? 'right-16 top-12 text-right'
      : 'left-1/2 -translate-x-1/2 bottom-12 text-center';

  return (
    <div
      style={{
        opacity: motion.opacity,
        filter: motion.blurPx > 0.15 ? `blur(${motion.blurPx.toFixed(1)}px)` : 'none',
      }}
      className="absolute inset-0"
    >
      <div className={`absolute ${labelPos} film-shadow-pool`}>
        <p className="font-cinzel text-sm film-gold-label">✦ {group.label} ✦</p>
      </div>

      {group.words.map((word, idx) => {
        const pt = coords[idx % coords.length];
        const wordDrift = driftY * (0.8 + (idx % 3) * 0.25);
        return (
          <div
            key={idx}
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              transform: `translate3d(0, ${wordDrift.toFixed(1)}px, 0)`,
            }}
            className="absolute film-shadow-pool flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#f1cf86] shadow-[0_0_12px_#f1cf86]" />
            <span className="font-cinzel font-semibold text-base lg:text-xl text-[#fff3cf] film-gold-heading whitespace-nowrap">
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Ultra-transparent frosted-glass Project Card (The ONLY card-like element in the film).
 * Features a sliding specular sheen and subtle 3D tilt, and moves to the bottom at full width on phones.
 */
const ProjectGlassPanel: React.FC<{
  project: (typeof FILM_PORTFOLIO_DATA.projects)[number];
  motion: ReturnType<typeof computeSceneMotion>;
  isMobile: boolean;
}> = ({ project, motion, isMobile }) => {
  // Position on desktop vs mobile (on phones: all move to bottom at full width)
  const desktopPosClass =
    project.placement === 'right-middle'
      ? 'md:right-14 lg:right-20 md:top-1/2 md:-translate-y-1/2 md:max-w-lg'
      : project.placement === 'top-right'
      ? 'md:right-14 lg:right-20 md:top-16 md:max-w-xl'
      : 'md:right-14 lg:right-20 md:bottom-14 md:max-w-xl';

  // Specular sheen slides across from -40% to 130% as localProgress moves 0 -> 1
  const sheenPos = -40 + motion.localProgress * 170;
  // Subtle 3D tilt based on scroll progress inside the window
  const tiltX = (0.5 - motion.localProgress) * 4;
  const tiltY = (motion.localProgress - 0.5) * 5;

  return (
    <div
      style={{
        opacity: motion.opacity,
        filter: motion.blurPx > 0.15 ? `blur(${motion.blurPx.toFixed(1)}px)` : 'none',
        transform: `translate3d(0, ${motion.translateY.toFixed(1)}px, 0) scale(${motion.scale.toFixed(
          3
        )})`,
      }}
      className={`absolute inset-x-4 bottom-8 md:inset-x-auto ${desktopPosClass} pointer-events-auto`}
    >
      <div
        style={{
          transform: isMobile
            ? 'none'
            : `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(
                2
              )}deg)`,
        }}
        className="film-project-glass rounded-2xl p-5 sm:p-7 text-left"
      >
        {/* Specular sheen sliding across as you scroll */}
        <div
          style={{
            left: `${sheenPos}%`,
          }}
          className="pointer-events-none absolute top-0 bottom-0 w-36 -skew-x-12 bg-gradient-to-r from-transparent via-[#fff3cf]/20 to-transparent"
        />

        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <p className="font-cormorant italic text-sm sm:text-base text-[#f6b6d6]">
              {project.kicker}
            </p>
            <h3 className="font-cinzel font-bold text-lg sm:text-2xl text-[#fff3cf] leading-snug mt-0.5">
              {project.title}
            </h3>
          </div>
          <span className="film-outlined-numeral text-3xl sm:text-5xl font-bold leading-none shrink-0">
            {project.numeral}
          </span>
        </div>

        <p className="font-cormorant text-base sm:text-lg text-[#fff8e8]/90 leading-relaxed mb-4">
          {project.summary}
        </p>

        {/* Tech list */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.map((t, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-manrope bg-[#080a24]/55 border border-[#f1cf86]/30 text-[#f1cf86]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* View on GitHub link */}
        <div className="flex items-center justify-between pt-2 border-t border-[#f1cf86]/25">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-cinzel text-xs sm:text-sm tracking-wider uppercase text-[#fff3cf] hover:text-[#f1cf86] transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#f1cf86]" />
          </a>
          <span className="font-manrope text-[10px] text-[#fff3cf]/60 uppercase tracking-widest">
            Chapter III · {project.numeral} / 03
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Draws the continuous 5-Clip Cinematic Fairy-Tale / Cyber-Kingdom Film onto the <canvas>
 * according to the DWELL-remapped filmProgress [0..1].
 */
function drawFairyTaleFilmFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  elapsed: number,
  stars: Array<{ x: number; y: number; r: number; phase: number }>,
  lanterns: Array<{
    x: number;
    yBase: number;
    speed: number;
    size: number;
    hue: string;
    sway: number;
  }>,
  portraitImg: HTMLImageElement | null,
  bgImages: Record<string, HTMLImageElement>,
  isMobile: boolean
) {
  // 1. Sky Palette transition across the 5 clips (Golden Sunset -> Twilight Rose/Indigo -> Starry Midnight Navy #080a24)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (t < 0.22) {
    // Clip 1: Golden/rose sunset over the Kingdom valley
    skyGrad.addColorStop(0, '#090b28');
    skyGrad.addColorStop(0.42, '#2d1c4e');
    skyGrad.addColorStop(0.75, '#7e3b64');
    skyGrad.addColorStop(1, '#e89c6c');
  } else if (t < 0.55) {
    // Clips 2 & 3: Deepening twilight over castle courtyard & lift-off
    skyGrad.addColorStop(0, '#06081e');
    skyGrad.addColorStop(0.5, '#191642');
    skyGrad.addColorStop(0.85, '#4c285c');
    skyGrad.addColorStop(1, '#9e5474');
  } else {
    // Clips 4 & 5: Starry midnight navy (#080a24) with violet/gold aurora glow
    skyGrad.addColorStop(0, '#040616');
    skyGrad.addColorStop(0.55, '#080a24');
    skyGrad.addColorStop(0.88, '#17163e');
    skyGrad.addColorStop(1, '#2b1e4a');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle blended atmospheric background texture from public/gta if loaded
  const activeBgKey =
    t < 0.14
      ? 'twilight'
      : t < 0.27
      ? 'hero'
      : t < 0.45
      ? 'ocean'
      : t < 0.8
      ? 'hq'
      : 'neon';
  const bgImg = bgImages[activeBgKey];
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    const scale = Math.max(w / bgImg.naturalWidth, h / bgImg.naturalHeight) * 1.06;
    const dw = bgImg.naturalWidth * scale;
    const dh = bgImg.naturalHeight * scale;
    const panX = (w - dw) * 0.5 + Math.sin(t * Math.PI * 2) * 18;
    const panY = (h - dh) * 0.5 - t * 24;
    ctx.drawImage(bgImg, panX, panY, dw, dh);
    ctx.restore();
  }

  // 2. Twinkling Starfield (brighter as sunset turns to night)
  const starVisibility = t < 0.15 ? 0.35 : t < 0.5 ? 0.7 : 1.0;
  ctx.save();
  for (const st of stars) {
    const twinkle = 0.45 + 0.55 * Math.sin(elapsed * 2.2 + st.phase);
    ctx.fillStyle = `rgba(255, 243, 207, ${(twinkle * starVisibility * 0.85).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Warm Golden Sun / Celestial Moon Orb
  const orbX = w * (isMobile ? 0.5 : 0.52 + Math.sin(t * Math.PI) * 0.12);
  const orbY = h * (0.28 + t * 0.12);
  const orbRadius = Math.min(w, h) * 0.16;
  const orbGrad = ctx.createRadialGradient(orbX, orbY, 2, orbX, orbY, orbRadius * 2.2);
  orbGrad.addColorStop(0, 'rgba(255, 243, 207, 0.75)');
  orbGrad.addColorStop(0.35, 'rgba(241, 207, 134, 0.32)');
  orbGrad.addColorStop(0.7, 'rgba(246, 182, 214, 0.12)');
  orbGrad.addColorStop(1, 'rgba(8, 10, 36, 0)');
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbRadius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // 4. Distant Mountain Silhouettes & Winding River Valley
  const parallax = t * 120;
  ctx.fillStyle = '#0c1033';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 40) {
    const mh =
      h * 0.66 -
      Math.sin((x + parallax * 0.4) * 0.004) * (h * 0.09) -
      Math.cos((x - parallax * 0.2) * 0.009) * (h * 0.04);
    ctx.lineTo(x, mh);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 5. Grand Citadel / Kingdom Castle Spires, Library Tower & Violet Crystal Dome
  const castleScale = t < 0.12 ? 0.88 + t * 1.1 : t < 0.4 ? 1.05 : 0.85;
  const castleCenterX = isMobile ? w * 0.5 : t > 0.11 && t < 0.27 ? w * 0.32 : w * 0.5;
  const castleBaseY = h * 0.74;
  drawKingdomCitadel(ctx, castleCenterX, castleBaseY, Math.min(w, h) * 0.42 * castleScale, elapsed);

  // 6. Clip-Specific Hero Action:
  // Clip 1 (0.00 - 0.115): Parting sunset clouds & aerial descent
  if (t < 0.12) {
    const cloudPart = Math.min(1, t / 0.09);
    drawPartingClouds(ctx, w, h, cloudPart);
  }

  // Clip 2 (0.115 - 0.270): Protagonist & Ornate Ivory-and-Gold Flying Carriage in Courtyard
  // Keep protagonist on right side on desktop and upper area on phone so text NEVER covers his face!
  if (t >= 0.105 && t < 0.28) {
    const localT = Math.max(0, Math.min(1, (t - 0.11) / 0.16));
    const charX = isMobile ? w * 0.5 : w * 0.73;
    const charY = isMobile ? h * 0.29 : h * 0.48;
    drawProtagonistAndCarriage(ctx, charX, charY, Math.min(w, h) * (isMobile ? 0.22 : 0.26), localT, elapsed, portraitImg);
  }

  // Clip 3 & 4 (0.270 - 0.805): Flying Ivory-and-Gold Carriage soaring through the Kingdom
  if (t >= 0.265 && t < 0.82) {
    const flightT = (t - 0.265) / (0.82 - 0.265);
    const carriageX = isMobile
      ? w * (0.35 + Math.sin(flightT * Math.PI * 2) * 0.18)
      : t < 0.4
      ? w * 0.28 // Left side during Education (right-aligned text)
      : t < 0.64
      ? w * 0.5 // Center during Skills Constellations
      : w * 0.28; // Left side during Projects (right-aligned glass cards)
    const carriageY = isMobile
      ? h * (0.26 + Math.cos(flightT * Math.PI * 2) * 0.05)
      : h * (0.46 - Math.sin(flightT * Math.PI) * 0.12);
    const bankAngle = Math.sin(flightT * Math.PI * 4) * 0.08;
    drawFlyingCarriage(ctx, carriageX, carriageY, Math.min(w, h) * (isMobile ? 0.16 : 0.19), bankAngle, elapsed);
  }

  // Clip 5 (0.800 - 1.000): High Stone Balcony + Rising White Origami Bird + Grand Finale Fireworks
  if (t >= 0.8) {
    const finaleT = Math.max(0, Math.min(1, (t - 0.8) / 0.2));
    drawFinaleBalconyAndOrigamiBird(ctx, w, h, finaleT, elapsed, isMobile);
  }

  // 7. Rising Golden & Rose Sky Lanterns / Fireflies across all scenes
  ctx.save();
  for (const l of lanterns) {
    const ly = ((l.yBase - elapsed * 0.025 * l.speed - t * 0.6) % 1 + 1) % 1;
    const lx = l.x + Math.sin(elapsed * 1.2 + l.sway) * 0.018;
    const px = lx * w;
    const py = ly * h;

    const glow = ctx.createRadialGradient(px, py, 0.5, px, py, l.size * 3.2);
    glow.addColorStop(0, '#fff3cf');
    glow.addColorStop(0.35, l.hue);
    glow.addColorStop(1, 'rgba(241, 207, 134, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, l.size * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 8. Celebratory Fireworks during Kingdom Reveal (0.04-0.11) and Grand Finale (0.82-1.0)
  if ((t >= 0.035 && t <= 0.12) || t >= 0.81) {
    drawKingdomFireworks(ctx, w, h, elapsed);
  }

  // 9. Cinematic Vignette around frame edges
  const vig = ctx.createRadialGradient(
    w * 0.5,
    h * 0.5,
    Math.min(w, h) * 0.3,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.78
  );
  vig.addColorStop(0, 'rgba(8, 10, 36, 0)');
  vig.addColorStop(1, 'rgba(4, 5, 20, 0.72)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function drawKingdomCitadel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  size: number,
  elapsed: number
) {
  ctx.save();
  ctx.translate(cx, baseY);

  // Citadel silhouette base
  ctx.fillStyle = '#0a0d2e';
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.lineTo(-size * 0.75, -size * 0.35);
  ctx.lineTo(size * 0.75, -size * 0.35);
  ctx.lineTo(size * 0.9, 0);
  ctx.closePath();
  ctx.fill();

  // Spires (Central Grand Spire, Library Tower on left, Violet Crystal Dome on right)
  const towers = [
    { x: -size * 0.46, w: size * 0.16, h: size * 0.62, roofH: size * 0.25, dome: false },
    { x: -size * 0.22, w: size * 0.18, h: size * 0.78, roofH: size * 0.32, dome: false },
    { x: 0, w: size * 0.24, h: size * 1.05, roofH: size * 0.42, dome: false },
    { x: size * 0.25, w: size * 0.17, h: size * 0.74, roofH: size * 0.28, dome: false },
    { x: size * 0.48, w: size * 0.2, h: size * 0.58, roofH: size * 0.22, dome: true },
  ];

  for (const tw of towers) {
    // Tower body
    ctx.fillStyle = '#111640';
    ctx.fillRect(tw.x - tw.w * 0.5, -tw.h, tw.w, tw.h);

    // Gold trim lines
    ctx.strokeStyle = 'rgba(241, 207, 134, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(tw.x - tw.w * 0.5, -tw.h, tw.w, tw.h);

    if (tw.dome) {
      // Wizard's Violet Crystal Dome
      const domeGrad = ctx.createRadialGradient(
        tw.x,
        -tw.h - tw.w * 0.2,
        2,
        tw.x,
        -tw.h,
        tw.w * 0.7
      );
      domeGrad.addColorStop(0, 'rgba(246, 182, 214, 0.9)');
      domeGrad.addColorStop(0.5, 'rgba(168, 118, 235, 0.65)');
      domeGrad.addColorStop(1, 'rgba(24, 20, 68, 0.9)');
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(tw.x, -tw.h, tw.w * 0.52, Math.PI, 0);
      ctx.fill();
    } else {
      // Turquoise-and-gold conical fairy-tale roof
      ctx.fillStyle = '#183b56';
      ctx.beginPath();
      ctx.moveTo(tw.x - tw.w * 0.58, -tw.h);
      ctx.lineTo(tw.x, -tw.h - tw.roofH);
      ctx.lineTo(tw.x + tw.w * 0.58, -tw.h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(241, 207, 134, 0.65)';
      ctx.beginPath();
      ctx.moveTo(tw.x, -tw.h - tw.roofH);
      ctx.lineTo(tw.x, -tw.h - tw.roofH - 12);
      ctx.stroke();
    }

    // Warm glowing arched windows
    const winRows = 3;
    for (let r = 0; r < winRows; r++) {
      const wy = -tw.h * (0.82 - r * 0.22);
      const pulse = 0.7 + 0.3 * Math.sin(elapsed * 2 + r + tw.x);
      ctx.fillStyle = `rgba(255, 225, 148, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(tw.x, wy, tw.w * 0.11, Math.PI, 0);
      ctx.rect(tw.x - tw.w * 0.11, wy, tw.w * 0.22, tw.w * 0.18);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawPartingClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  partProgress: number
) {
  ctx.save();
  const alpha = Math.max(0, (1 - partProgress) * 0.65);
  if (alpha <= 0.01) {
    ctx.restore();
    return;
  }
  const offset = partProgress * w * 0.45;

  const drawCloudBank = (cx: number, cy: number, rx: number, ry: number) => {
    const g = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
    g.addColorStop(0, `rgba(255, 232, 204, ${alpha})`);
    g.addColorStop(0.5, `rgba(214, 152, 188, ${alpha * 0.7})`);
    g.addColorStop(1, 'rgba(8, 10, 36, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  drawCloudBank(w * 0.25 - offset, h * 0.35, w * 0.45, h * 0.26);
  drawCloudBank(w * 0.75 + offset, h * 0.38, w * 0.45, h * 0.26);
  drawCloudBank(w * 0.5, h * 0.18 - offset * 0.3, w * 0.5, h * 0.22);
  ctx.restore();
}

function drawProtagonistAndCarriage(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  localT: number,
  elapsed: number,
  portraitImg: HTMLImageElement | null
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft golden aura around protagonist medallion
  const aura = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius * 1.45);
  aura.addColorStop(0, 'rgba(241, 207, 134, 0.42)');
  aura.addColorStop(0.55, 'rgba(246, 182, 214, 0.18)');
  aura.addColorStop(1, 'rgba(8, 10, 36, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // Ornate circular gold filigree frame
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (portraitImg && portraitImg.complete && portraitImg.naturalWidth > 0) {
    const scale = 1.04 + localT * 0.04;
    const d = radius * 1.46 * scale;
    ctx.drawImage(portraitImg, -d * 0.5, -d * 0.5, d, d);
  } else {
    ctx.fillStyle = '#161b48';
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  }
  ctx.restore();

  // Double gold ring border
  ctx.strokeStyle = '#f1cf86';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(246, 182, 214, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
  ctx.stroke();

  // Orbiting lantern sparkles
  for (let i = 0; i < 8; i++) {
    const ang = elapsed * 0.8 + (i * Math.PI) / 4;
    const sx = Math.cos(ang) * radius * 0.86;
    const sy = Math.sin(ang) * radius * 0.86;
    ctx.fillStyle = '#fff3cf';
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawFlyingCarriage(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  bankAngle: number,
  elapsed: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bankAngle);

  // Golden sparkle trail behind carriage
  for (let i = 1; i <= 10; i++) {
    const tx = -size * 0.55 - i * (size * 0.14);
    const ty = Math.sin(elapsed * 4 + i * 0.7) * 8;
    ctx.fillStyle = `rgba(241, 207, 134, ${(0.65 - i * 0.055).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(tx, ty, Math.max(1.5, 5 - i * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }

  // Ivory-and-gold carriage cabin
  ctx.fillStyle = '#fdf6e4';
  ctx.strokeStyle = '#f1cf86';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-size * 0.42, -size * 0.28, size * 0.84, size * 0.46, size * 0.16);
  ctx.fill();
  ctx.stroke();

  // Warm glowing carriage window
  ctx.fillStyle = '#ffe299';
  ctx.beginPath();
  ctx.roundRect(-size * 0.18, -size * 0.18, size * 0.36, size * 0.22, size * 0.06);
  ctx.fill();

  // Glowing gold wheels
  const wheelPositions = [-size * 0.28, size * 0.28];
  for (const wx of wheelPositions) {
    ctx.strokeStyle = '#f1cf86';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wx, size * 0.22, size * 0.14, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFinaleBalconyAndOrigamiBird(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  finaleT: number,
  elapsed: number,
  isMobile: boolean
) {
  ctx.save();

  // Stone balustrade silhouette at bottom
  const railY = h * 0.88;
  ctx.fillStyle = '#06081e';
  ctx.fillRect(0, railY, w, h - railY);
  ctx.strokeStyle = 'rgba(241, 207, 134, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, railY);
  ctx.lineTo(w, railY);
  ctx.stroke();

  // Rising white origami bird fluttering into the starry sky
  const birdX = w * (isMobile ? 0.5 : 0.24) + Math.sin(elapsed * 2) * 18;
  const birdY = h * (0.72 - finaleT * 0.48);
  const wingFlap = Math.sin(elapsed * 7) * 10;

  ctx.save();
  ctx.translate(birdX, birdY);
  ctx.fillStyle = '#fff9eb';
  ctx.shadowColor = '#f1cf86';
  ctx.shadowBlur = 16;

  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-22, -12 + wingFlap);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(22, -12 + wingFlap);
  ctx.lineTo(6, 8);
  ctx.closePath();
  ctx.fill();

  // Head/beak
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(14, -10);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawKingdomFireworks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number
) {
  const bursts = [
    { x: w * 0.22, y: h * 0.22, period: 3.4, offset: 0.0, color: '#f1cf86' },
    { x: w * 0.78, y: h * 0.20, period: 3.8, offset: 1.3, color: '#f6b6d6' },
    { x: w * 0.50, y: h * 0.16, period: 4.2, offset: 2.4, color: '#fff3cf' },
  ];

  ctx.save();
  for (const b of bursts) {
    const cycle = ((elapsed + b.offset) % b.period) / b.period;
    if (cycle > 0.75) continue;
    const p = cycle / 0.75;
    const radius = p * Math.min(w, h) * 0.11;
    const alpha = (1 - p) * 0.75;

    const rays = 18;
    for (let i = 0; i < rays; i++) {
      const ang = (i * Math.PI * 2) / rays;
      const rx = b.x + Math.cos(ang) * radius;
      const ry = b.y + Math.sin(ang) * radius;
      ctx.fillStyle = b.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
