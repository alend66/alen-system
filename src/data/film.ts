export interface FilmChapterWindow {
  id: string;
  start: number;
  end: number;
  label: string;
}

export const FILM_CHAPTER_WINDOWS: FilmChapterWindow[] = [
  { id: 'intro', start: 0.0, end: 0.035, label: 'Prologue' },
  { id: 'kingdom', start: 0.04, end: 0.11, label: 'The Kingdom' },
  { id: 'about', start: 0.115, end: 0.205, label: 'Chapter I · About' },
  { id: 'starring', start: 0.209, end: 0.266, label: 'Starring' },
  { id: 'education', start: 0.27, end: 0.395, label: 'Education' },
  { id: 'skills-title', start: 0.397, end: 0.452, label: 'Chapter II · Skills' },
  { id: 'skills-constellations', start: 0.448, end: 0.605, label: 'Skill Constellations' },
  { id: 'work-title', start: 0.6, end: 0.652, label: 'Chapter III · Work' },
  { id: 'projects', start: 0.648, end: 0.8, label: 'Selected Works' },
  { id: 'achievements', start: 0.803, end: 0.858, label: 'Chapter IV · Achievements' },
  { id: 'experience', start: 0.862, end: 0.922, label: 'Chapter V · Experience' },
  { id: 'epilogue', start: 0.93, end: 1.0, label: 'Epilogue · Contact' },
];

/**
 * DWELL intervals where text chapters are on screen and film progress slows by 3.2x
 * relative to inter-chapter transitions.
 */
const DWELL_SEGMENTS: Array<[number, number]> = [
  [0.0, 0.035],
  [0.04, 0.11],
  [0.115, 0.205],
  [0.209, 0.266],
  [0.27, 0.395],
  [0.397, 0.605],
  [0.6, 0.8],
  [0.803, 0.858],
  [0.862, 0.922],
  [0.93, 1.0],
];

const DWELL_FACTOR = 3.2;

// Precompute piecewise linear table for fast, monotonic rawScroll -> filmProgress remap
interface PiecewisePoint {
  raw: number;
  film: number;
}

const PIECEWISE_TABLE: PiecewisePoint[] = (() => {
  const N = 500;
  const filmPoints: number[] = [];
  const weights: number[] = [];
  let totalWeight = 0;

  for (let i = 0; i <= N; i++) {
    const f = i / N;
    filmPoints.push(f);
    if (i === 0) {
      weights.push(0);
      continue;
    }
    const mid = (f + (i - 1) / N) * 0.5;
    const inDwell = DWELL_SEGMENTS.some(([a, b]) => mid >= a && mid <= b);
    const w = (1 / N) * (inDwell ? DWELL_FACTOR : 1.0);
    totalWeight += w;
    weights.push(totalWeight);
  }

  return filmPoints.map((film, idx) => ({
    raw: totalWeight > 0 ? weights[idx] / totalWeight : film,
    film,
  }));
})();

/**
 * Maps raw page scroll fraction [0..1] to DWELL-compensated film progress [0..1].
 */
export function remapScrollWithDwell(rawScroll: number): number {
  const clamped = Math.max(0, Math.min(1, rawScroll));
  if (clamped <= 0) return 0;
  if (clamped >= 1) return 1;

  // Binary search in PIECEWISE_TABLE
  let lo = 0;
  let hi = PIECEWISE_TABLE.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (PIECEWISE_TABLE[mid].raw <= clamped) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const p0 = PIECEWISE_TABLE[lo];
  const p1 = PIECEWISE_TABLE[hi];
  const span = p1.raw - p0.raw;
  if (span <= 1e-9) return p0.film;
  const alpha = (clamped - p0.raw) / span;
  return p0.film + alpha * (p1.film - p0.film);
}

/**
 * Inverse map: given target film progress [0..1], returns raw scroll fraction [0..1]
 * so clicking a chapter jumps to the exact scroll position.
 */
export function filmProgressToRawScroll(targetFilm: number): number {
  const clamped = Math.max(0, Math.min(1, targetFilm));
  const N = PIECEWISE_TABLE.length - 1;
  const exactIdx = clamped * N;
  const i0 = Math.floor(exactIdx);
  const i1 = Math.min(N, i0 + 1);
  const frac = exactIdx - i0;
  return (
    PIECEWISE_TABLE[i0].raw +
    frac * (PIECEWISE_TABLE[i1].raw - PIECEWISE_TABLE[i0].raw)
  );
}

export interface SceneMotionStyle {
  visible: boolean;
  opacity: number;
  blurPx: number;
  translateY: number;
  scale: number;
  localProgress: number; // 0..1 within [start, end]
}

/**
 * Computes the signature fairy-tale film text motion for a scene window [start, end]:
 * - Drifts in from blur (16px -> 0) with a slight rise (+28px -> 0) and scale (0.97 -> 1)
 * - Holds cleanly in the middle of the window
 * - Floats up past the camera (-34px) and blurs out (0 -> 16px) at the end
 *   (unless lockAtEnd is true, e.g., Epilogue 0.93-1.00 which stays on screen).
 */
export function computeSceneMotion(
  filmProgress: number,
  start: number,
  end: number,
  lockAtEnd = false
): SceneMotionStyle {
  const margin = 0.006;
  if (filmProgress < start - margin || (!lockAtEnd && filmProgress > end + margin)) {
    return {
      visible: false,
      opacity: 0,
      blurPx: 16,
      translateY: 28,
      scale: 0.97,
      localProgress: 0,
    };
  }

  const duration = Math.max(0.001, end - start);
  const u = Math.max(0, Math.min(1, (filmProgress - start) / duration));

  const enterEnd = 0.22;
  const exitStart = lockAtEnd ? 1.01 : 0.78;

  let opacity = 1;
  let blurPx = 0;
  let translateY = 0;
  let scale = 1;

  if (u < enterEnd) {
    // Ease out cubic on entrance
    const p = u / enterEnd;
    const ease = 1 - Math.pow(1 - p, 3);
    opacity = ease;
    blurPx = (1 - ease) * 16;
    translateY = (1 - ease) * 28;
    scale = 0.97 + ease * 0.03;
  } else if (!lockAtEnd && u > exitStart) {
    // Ease in cubic on exit: floats upward past camera and blurs out
    const p = (u - exitStart) / (1 - exitStart);
    const ease = Math.pow(Math.min(1, Math.max(0, p)), 2.4);
    opacity = 1 - ease;
    blurPx = ease * 16;
    translateY = -ease * 36;
    scale = 1 + ease * 0.015;
  } else {
    // Subtle slow upward drift while holding
    const holdRatio = (u - enterEnd) / Math.max(0.01, exitStart - enterEnd);
    opacity = 1;
    blurPx = 0;
    translateY = (0.5 - holdRatio) * 6;
    scale = 1;
  }

  return {
    visible: opacity > 0.01,
    opacity,
    blurPx,
    translateY,
    scale,
    localProgress: u,
  };
}

/**
 * Returns how much the background canvas should dim (0..0.38) when typography is active.
 */
export function computeCanvasDimAmount(filmProgress: number): number {
  let maxOpacity = 0;
  for (const ch of FILM_CHAPTER_WINDOWS) {
    if (ch.id === 'intro' || ch.id === 'kingdom') continue;
    const m = computeSceneMotion(
      filmProgress,
      ch.start,
      ch.end,
      ch.id === 'epilogue'
    );
    if (m.opacity > maxOpacity) {
      maxOpacity = m.opacity;
    }
  }
  return maxOpacity * 0.28;
}
