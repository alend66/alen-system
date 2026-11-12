import { CURSOR_COLORS, NAMED_BUILDER_ROLES } from '../content';

export interface GlyphSamplePoint {
  x: number; // Normalized 0..1 of viewport width
  y: number; // Normalized 0..1 of viewport height
  orderX: number; // 0..1 left-to-right sweep order
}

export interface HeroPieceRect {
  id: string;
  jsxLabel: string;
  builderIndex: number;
  startP: number;
  endP: number;
  getRect: () => DOMRect | null;
}

export interface QueuedBuildTask {
  id: string;
  element: HTMLElement;
  builderIndex: number;
  startTime: number;
  duration: number;
  onComplete: () => void;
  completed: boolean;
}

interface RippleEffect {
  x: number;
  y: number;
  color: string;
  birth: number;
  duration: number;
}

interface SimulatedCursor {
  index: number;
  color: string;
  roleName: string | null;
  isNamedBuilder: boolean;
  // Seeded parameters
  seedA: number;
  seedB: number;
  edgeSpawnX: number;
  edgeSpawnY: number;
  arrivalThresholdP: number; // 0..0.18 wave arrival
  // Current state
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  alpha: number;
  labelAlpha: number;
  onFrontCanvas: boolean;
  squishUntil: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function getTargetCursorCount(width: number): number {
  if (width >= 1500) return 300;
  if (width >= 1100) return 250;
  if (width >= 760) return 190;
  return 140;
}

/**
 * Samples exact glyph points of the giant uppercase first name ("ALEN")
 * using an offscreen 2D canvas and getImageData, tuned to the target cursor count.
 */
export function sampleGlyphPointsForName(
  text: string,
  viewportW: number,
  viewportH: number,
  targetCount: number
): { points: GlyphSamplePoint[]; fontSizePx: number; topPx: number } {
  const off = document.createElement('canvas');
  const cw = Math.max(320, Math.floor(viewportW));
  const ch = Math.max(320, Math.floor(viewportH));
  off.width = cw;
  off.height = ch;
  const ctx = off.getContext('2d');

  // Fit to 90% of width, at most 34% of viewport height, top 11vh
  const maxW = cw * 0.9;
  const maxH = ch * 0.34;
  let fontSize = Math.min(maxH, maxW / (text.length * 0.68));
  fontSize = Math.max(64, Math.min(fontSize, 340));
  const topPx = ch * 0.11;

  if (!ctx) {
    return { points: [], fontSizePx: fontSize, topPx };
  }

  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#000000';
  ctx.font = `800 ${fontSize}px "Geist", "Inter", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';

  // Refine font size so measured width <= 90% of viewport width
  const measured = ctx.measureText(text).width;
  if (measured > maxW && measured > 0) {
    fontSize = fontSize * (maxW / measured);
    ctx.font = `800 ${fontSize}px "Geist", "Inter", sans-serif`;
  }

  ctx.fillText(text, cw * 0.5, topPx);

  const imgData = ctx.getImageData(0, 0, cw, ch).data;
  const rawPixels: Array<{ x: number; y: number }> = [];

  // Initial coarse scan to count opaque glyph pixels
  const step = Math.max(3, Math.floor(Math.min(cw, ch) / 140));
  let minX = cw;
  let maxX = 0;

  for (let y = 0; y < ch; y += step) {
    for (let x = 0; x < cw; x += step) {
      const a = imgData[(y * cw + x) * 4 + 3];
      if (a > 128) {
        rawPixels.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (rawPixels.length === 0) {
    return { points: [], fontSizePx: fontSize, topPx };
  }

  // Sort left-to-right (with slight vertical tie-break) and subsample evenly to targetCount
  rawPixels.sort((a, b) => a.x - b.x || a.y - b.y);
  const spanX = Math.max(1, maxX - minX);
  const selected: GlyphSamplePoint[] = [];

  for (let i = 0; i < targetCount; i++) {
    const idx = Math.min(
      rawPixels.length - 1,
      Math.floor((i / Math.max(1, targetCount - 1)) * (rawPixels.length - 1))
    );
    const pt = rawPixels[idx];
    selected.push({
      x: pt.x / cw,
      y: pt.y / ch,
      orderX: (pt.x - minX) / spanX,
    });
  }

  return { points: selected, fontSizePx: fontSize, topPx };
}

/**
 * Single requestAnimationFrame Engine driving up to 300 desktop mouse-pointer arrows
 * across two fixed full-screen canvases (backCanvas & frontCanvas).
 */
export class CursorEngine {
  private backCanvas: HTMLCanvasElement;
  private frontCanvas: HTMLCanvasElement;
  private backCtx: CanvasRenderingContext2D | null;
  private frontCtx: CanvasRenderingContext2D | null;

  private cursors: SimulatedCursor[] = [];
  private glyphPoints: GlyphSamplePoint[] = [];
  private heroPieces: HeroPieceRect[] = [];
  private buildQueue: QueuedBuildTask[] = [];
  private ripples: RippleEffect[] = [];

  private rafId = 0;
  private width = window.innerWidth;
  private height = window.innerHeight;
  private dpr = Math.min(window.devicePixelRatio || 1, 2);

  public heroProgress = 0; // 0..1 inside the 2.4-screen pinned hero
  public isInHero = true;
  public scrollY = 0;
  public reducedMotion = false;

  private mouseX = window.innerWidth * 0.5;
  private mouseY = window.innerHeight * 0.5;
  private mouseActive = false;

  private hoveredRect: DOMRect | null = null;
  private contactCopyRect: (() => DOMRect | null) | null = null;
  private contactRingActive = false;
  private contactClickedOnce = false;
  private onContactAutoClick: (() => void) | null = null;

  constructor(backCanvas: HTMLCanvasElement, frontCanvas: HTMLCanvasElement) {
    this.backCanvas = backCanvas;
    this.frontCanvas = frontCanvas;
    this.backCtx = backCanvas.getContext('2d');
    this.frontCtx = frontCanvas.getContext('2d');

    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initCursors();
    this.resize();
  }

  private initCursors() {
    const count = getTargetCursorCount(this.width);
    this.cursors = [];

    const ambientRoles = [
      'Security Agent',
      'SIEM Hunter',
      'Linux Daemon',
      'Forensics Bot',
      'Log Parser',
      'Packet Inspector',
      'Kernel Auditor',
      'Hash Verifier',
    ];

    for (let i = 0; i < count; i++) {
      const r1 = seededRandom(i * 3 + 1);
      const r2 = seededRandom(i * 3 + 2);
      const r3 = seededRandom(i * 3 + 3);

      const isNamed = i < NAMED_BUILDER_ROLES.length;
      const color = isNamed
        ? NAMED_BUILDER_ROLES[i].color
        : CURSOR_COLORS[i % CURSOR_COLORS.length];
      const roleName = isNamed
        ? NAMED_BUILDER_ROLES[i].name
        : i < 48
        ? ambientRoles[i % ambientRoles.length]
        : null;

      // Spawn along the 4 edges of the screen
      const edge = i % 4;
      let ex = 0;
      let ey = 0;
      if (edge === 0) {
        ex = r1;
        ey = -0.06;
      } else if (edge === 1) {
        ex = 1.06;
        ey = r1;
      } else if (edge === 2) {
        ex = r1;
        ey = 1.06;
      } else {
        ex = -0.06;
        ey = r1;
      }

      // First 14 cursors are online at p = 0; the rest arrive in waves from p = 0.01 to 0.175
      const arrivalThresholdP =
        i < 14 ? 0 : 0.005 + ((i - 14) / Math.max(1, count - 14)) * 0.17;

      this.cursors.push({
        index: i,
        color,
        roleName,
        isNamedBuilder: isNamed,
        seedA: r1 * Math.PI * 2,
        seedB: 0.5 + r2 * 1.5,
        edgeSpawnX: ex,
        edgeSpawnY: ey,
        arrivalThresholdP,
        x: ex * this.width,
        y: ey * this.height,
        vx: 0,
        vy: 0,
        scale: 1,
        alpha: i < 14 ? 1 : 0,
        labelAlpha: isNamed ? 1 : r3 > 0.7 ? 0.85 : 0,
        onFrontCanvas: true,
        squishUntil: 0,
      });
    }
  }

  public resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetCount = getTargetCursorCount(this.width);
    if (this.cursors.length !== targetCount) {
      this.initCursors();
    }

    [this.backCanvas, this.frontCanvas].forEach(c => {
      c.width = Math.floor(this.width * this.dpr);
      c.height = Math.floor(this.height * this.dpr);
    });

    const sampled = sampleGlyphPointsForName(
      'ALEN',
      this.width,
      this.height,
      this.cursors.length
    );
    this.glyphPoints = sampled.points;
  }

  public setHeroPieces(pieces: HeroPieceRect[]) {
    this.heroPieces = pieces;
  }

  public setMousePosition(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
    this.mouseActive = true;
  }

  public setHoveredElement(el: HTMLElement | null) {
    this.hoveredRect = el ? el.getBoundingClientRect() : null;
  }

  public setContactCopyTarget(
    getRect: (() => DOMRect | null) | null,
    active: boolean,
    onAutoClick?: () => void
  ) {
    this.contactCopyRect = getRect;
    if (active && !this.contactRingActive) {
      this.contactClickedOnce = false;
    }
    this.contactRingActive = active;
    if (onAutoClick) {
      this.onContactAutoClick = onAutoClick;
    }
  }

  public queueBlockBuild(element: HTMLElement, onComplete: () => void) {
    if (this.reducedMotion) {
      onComplete();
      return;
    }
    const id = element.dataset.blockId || `block-${Math.random()}`;
    if (this.buildQueue.some(b => b.id === id)) return;

    const builderIndex = this.buildQueue.length % 12;
    this.buildQueue.push({
      id,
      element,
      builderIndex,
      startTime: performance.now(),
      duration: 680,
      onComplete,
      completed: false,
    });
  }

  public clearCompletedBuilds() {
    this.buildQueue = [];
    this.contactClickedOnce = false;
  }

  public spawnRipple(x: number, y: number, color: string) {
    this.ripples.push({
      x,
      y,
      color,
      birth: performance.now(),
      duration: 520,
    });
  }

  public getOnlineAgentCount(): { online: number; total: number } {
    const total = this.cursors.length;
    if (!this.isInHero || this.heroProgress >= 0.18) {
      return { online: total, total };
    }
    const ratio = Math.max(0, Math.min(1, this.heroProgress / 0.18));
    const online = Math.min(total, Math.round(14 + ratio * (total - 14)));
    return { online, total };
  }

  public start() {
    const tick = (now: number) => {
      this.updateAndDraw(now);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stop() {
    cancelAnimationFrame(this.rafId);
  }

  private updateAndDraw(now: number) {
    const bCtx = this.backCtx;
    const fCtx = this.frontCtx;
    if (!bCtx || !fCtx) return;

    bCtx.save();
    fCtx.save();
    bCtx.scale(this.dpr, this.dpr);
    fCtx.scale(this.dpr, this.dpr);

    bCtx.clearRect(0, 0, this.width, this.height);
    fCtx.clearRect(0, 0, this.width, this.height);

    const t = now * 0.001;
    const p = this.heroProgress;
    const w = this.width;
    const h = this.height;

    // Reduced motion mode: show only a few faint still cursors
    if (this.reducedMotion) {
      for (let i = 0; i < Math.min(10, this.cursors.length); i++) {
        const c = this.cursors[i];
        const gx = ((i * 137 + 43) % 90) / 100 * w + w * 0.05;
        const gy = ((i * 79 + 29) % 85) / 100 * h + h * 0.08;
        this.drawCursorSprite(bCtx, gx, gy, 0.9, 0.25, c.color, c.roleName, 0.25);
      }
      bCtx.restore();
      fCtx.restore();
      return;
    }

    // Active below-hero build tasks indexed by builderIndex
    const activeBuildByBuilder = new Map<number, { task: QueuedBuildTask; prog: number }>();
    for (const task of this.buildQueue) {
      if (task.completed) continue;
      const prog = (now - task.startTime) / task.duration;
      if (prog >= 1) {
        task.completed = true;
        const rect = task.element.getBoundingClientRect();
        const builderColor = NAMED_BUILDER_ROLES[task.builderIndex % NAMED_BUILDER_ROLES.length].color;
        this.spawnRipple(rect.right - 12, rect.bottom - 12, builderColor);
        const bCursor = this.cursors[task.builderIndex];
        if (bCursor) bCursor.squishUntil = now + 180;
        task.onComplete();
      } else if (prog >= 0) {
        activeBuildByBuilder.set(task.builderIndex, { task, prog });
      }
    }

    // Active hero piece construction overlays (p between 0.60 and 0.95)
    const activeHeroPieceByBuilder = new Map<
      number,
      { piece: HeroPieceRect; localP: number; rect: DOMRect }
    >();
    if (this.isInHero && p >= 0.58) {
      for (const piece of this.heroPieces) {
        const rect = piece.getRect();
        if (!rect || rect.width < 4) continue;
        const localP = (p - piece.startP) / Math.max(0.01, piece.endP - piece.startP);
        if (localP >= 0 && localP <= 1.04) {
          activeHeroPieceByBuilder.set(piece.builderIndex, {
            piece,
            localP: Math.min(1, localP),
            rect,
          });
        }
      }
    }

    // Update and draw each cursor
    const total = this.cursors.length;
    for (let i = 0; i < total; i++) {
      const c = this.cursors[i];
      const glyph = this.glyphPoints[i % Math.max(1, this.glyphPoints.length)];

      let targetX = c.x;
      let targetY = c.y;
      let targetScale = 1.0;
      let targetAlpha = 1.0;
      let targetLabelAlpha = c.isNamedBuilder ? 0.95 : 0;
      let front = true;

      if (this.isInHero && p < 0.98) {
        // ============================================================
        // HERO SCROLL CHOREOGRAPHY (p: 0.0 -> 0.98)
        // ============================================================
        if (p < c.arrivalThresholdP) {
          // Waiting outside screen edge
          targetX = c.edgeSpawnX * w;
          targetY = c.edgeSpawnY * h;
          targetAlpha = 0;
        } else if (p < 0.17) {
          // p: 0 -> 0.18: Drift in from edges and swirl slowly around the centre
          const swirlAngle = t * 0.55 * c.seedB + c.seedA + i * 0.21;
          const radius = Math.min(w, h) * (0.12 + ((i * 19) % 32) / 100);
          targetX = w * 0.5 + Math.cos(swirlAngle) * radius;
          targetY = h * 0.46 + Math.sin(swirlAngle * 0.9) * (radius * 0.68);
          targetAlpha = 0.95;
          targetLabelAlpha = c.isNamedBuilder ? 0.95 : 0;
        } else if (p <= 0.55 && glyph) {
          // p: 0.17 -> 0.55: Sweep left-to-right onto exact glyph points of "ALEN"
          const sweepProgress = Math.max(0, Math.min(1, (p - 0.17) / 0.34));
          const charTrigger = glyph.orderX * 0.65;
          const lockRatio = Math.max(
            0,
            Math.min(1, (sweepProgress - charTrigger) / 0.35)
          );
          const easeLock = 1 - Math.pow(1 - lockRatio, 3);

          const swirlAngle = t * 0.5 * c.seedB + c.seedA;
          const radius = Math.min(w, h) * (0.14 + ((i * 17) % 28) / 100);
          const swirlX = w * 0.5 + Math.cos(swirlAngle) * radius;
          const swirlY = h * 0.45 + Math.sin(swirlAngle) * (radius * 0.65);

          const gx = glyph.x * w;
          const gy = glyph.y * h;

          targetX = swirlX + (gx - swirlX) * easeLock;
          targetY = swirlY + (gy - swirlY) * easeLock;
          // Scale cursor size so the letters read as solid
          targetScale = 1 + easeLock * (w < 760 ? 0.18 : 0.32);
          targetAlpha = 0.98;
          targetLabelAlpha = c.isNamedBuilder && easeLock < 0.7 ? 0.85 : 0;
        } else {
          // p > 0.55: Real gradient h1 fades in; 8 named builders stay to construct hero pieces while others fly outward/fade
          const heroTask = activeHeroPieceByBuilder.get(i);
          if (heroTask) {
            const { rect, localP } = heroTask;
            front = true;
            targetLabelAlpha = 1;
            targetAlpha = 1;
            if (localP < 0.25) {
              // Fly to top-left corner of the piece
              const u = localP / 0.25;
              targetX = rect.left;
              targetY = rect.top;
              targetScale = 1.05;
              void u;
            } else if (localP < 0.85) {
              // Drag dashed marquee from top-left to bottom-right
              const dragU = (localP - 0.25) / 0.6;
              targetX = rect.left + rect.width * dragU;
              targetY = rect.top + rect.height * dragU;
              targetScale = 0.96;
            } else {
              // Click at bottom-right corner
              targetX = rect.right;
              targetY = rect.bottom;
              targetScale = 0.82;
            }
          } else if (i < 8 && glyph) {
            // Builders waiting on the letters before or after their hero piece window
            targetX = glyph.x * w + Math.cos(t + i) * 8;
            targetY = glyph.y * h + Math.sin(t + i) * 8;
            targetAlpha = p < 0.92 ? 0.95 : 0.55;
            targetLabelAlpha = 0.9;
            front = true;
          } else if (i < 56) {
            // Transition smoothly into the ~56 ambient cursors drifting behind content
            const fadeOut = Math.max(0, Math.min(1, (p - 0.52) / 0.16));
            const ambX = ((c.seedA / (Math.PI * 2)) * 0.9 + 0.05) * w + Math.sin(t * 0.4 + i) * 28;
            const ambY = (((i * 67) % 100) / 100) * h + Math.cos(t * 0.35 + i) * 24;
            const gx = glyph ? glyph.x * w : w * 0.5;
            const gy = glyph ? glyph.y * h : h * 0.3;
            targetX = gx + (ambX - gx) * fadeOut;
            targetY = gy + (ambY - gy) * fadeOut;
            targetAlpha = 0.95 - fadeOut * 0.55;
            targetLabelAlpha = c.roleName ? (Math.sin(t * 0.6 + i) > 0.35 ? 0.75 : 0) : 0;
            front = fadeOut < 0.5;
          } else {
            // Remaining swarm cursors fly outward and fade from p = 0.50 to 0.64
            const flyT = Math.max(0, Math.min(1, (p - 0.5) / 0.15));
            const gx = glyph ? glyph.x * w : w * 0.5;
            const gy = glyph ? glyph.y * h : h * 0.3;
            const outX = c.edgeSpawnX * w;
            const outY = c.edgeSpawnY * h;
            targetX = gx + (outX - gx) * flyT;
            targetY = gy + (outY - gy) * flyT;
            targetAlpha = Math.max(0, 1 - flyT * 1.15);
            targetLabelAlpha = 0;
            front = false;
          }
        }
      } else {
        // ============================================================
        // BELOW THE HERO: Ambient Swarm (~56 cursors), Block Builders, Hover Circle, Contact Ring
        // ============================================================
        const buildTask = activeBuildByBuilder.get(i);
        if (buildTask) {
          // Idle builder flying in to construct a newly visible data-block
          const rect = buildTask.task.element.getBoundingClientRect();
          const u = buildTask.prog;
          front = true;
          targetAlpha = 1;
          targetLabelAlpha = 1;
          if (u < 0.25) {
            targetX = rect.left;
            targetY = rect.top;
          } else {
            const drag = Math.min(1, (u - 0.25) / 0.65);
            targetX = rect.left + rect.width * drag;
            targetY = rect.top + rect.height * drag;
          }
        } else if (this.contactRingActive && this.contactCopyRect && i < 54) {
          // When /contact enters view: ~54 cursors form a ring around the Copy button & Creative Director (i === 0) clicks it!
          const copyRect = this.contactCopyRect();
          if (copyRect) {
            const cx = copyRect.left + copyRect.width * 0.5;
            const cy = copyRect.top + copyRect.height * 0.5;
            front = true;
            if (i === 0) {
              // Creative Director flies straight onto the copy button and clicks it
              targetX = cx + 8;
              targetY = cy + 6;
              targetAlpha = 1;
              targetLabelAlpha = 1;
              if (!this.contactClickedOnce && Math.hypot(c.x - targetX, c.y - targetY) < 18) {
                this.contactClickedOnce = true;
                c.squishUntil = now + 240;
                this.spawnRipple(cx, cy, c.color);
                if (this.onContactAutoClick) this.onContactAutoClick();
              }
            } else {
              const ringAngle = (i / 53) * Math.PI * 2 + t * 0.45;
              const ringRadius = Math.max(copyRect.width, 110) * 0.72 + (i % 3) * 14;
              targetX = cx + Math.cos(ringAngle) * ringRadius;
              targetY = cy + Math.sin(ringAngle) * (ringRadius * 0.58);
              targetAlpha = 0.88;
              targetLabelAlpha = c.isNamedBuilder ? 0.9 : 0;
            }
          }
        } else if (this.hoveredRect && i >= 12 && i < 24) {
          // Hovering a project or milestone makes ~12 cursors circle its border and click
          const hr = this.hoveredRect;
          const perimProg = ((i - 12) / 12 + t * 0.18) % 1;
          const perim = 2 * (hr.width + hr.height);
          let dist = perimProg * perim;
          let bx = hr.left;
          let by = hr.top;
          if (dist < hr.width) {
            bx = hr.left + dist;
            by = hr.top;
          } else if (dist < hr.width + hr.height) {
            bx = hr.right;
            by = hr.top + (dist - hr.width);
          } else if (dist < 2 * hr.width + hr.height) {
            bx = hr.right - (dist - hr.width - hr.height);
            by = hr.bottom;
          } else {
            bx = hr.left;
            by = hr.bottom - (dist - 2 * hr.width - hr.height);
          }
          targetX = bx;
          targetY = by;
          targetAlpha = 0.92;
          targetLabelAlpha = c.roleName ? 0.85 : 0;
          front = true;
          if (Math.sin(t * 5 + i) > 0.96) {
            c.squishUntil = now + 120;
          }
        } else if (i < 56) {
          // ~56 Ambient cursors drifting behind content with scroll parallax & mouse interaction
          front = false;
          const parallaxY = (this.scrollY * (0.08 + (i % 5) * 0.03)) % h;
          const baseX = ((i * 97 + 13) % 92) / 100 * w + w * 0.04;
          const baseY = (((i * 53 + 29) % 92) / 100 * h - parallaxY + h) % h;

          let mxOffset = Math.sin(t * 0.45 * c.seedB + c.seedA) * 26;
          let myOffset = Math.cos(t * 0.38 * c.seedB + c.seedA) * 22;

          if (this.mouseActive) {
            const dx = baseX - this.mouseX;
            const dy = baseY - this.mouseY;
            const d = Math.hypot(dx, dy);
            if (i % 3 === 0 && d < 220) {
              // Curious cursors circle the visitor's mouse
              const ang = t * 1.6 + i;
              targetX = this.mouseX + Math.cos(ang) * 58;
              targetY = this.mouseY + Math.sin(ang) * 58;
            } else if (d < 130 && d > 1) {
              // Others move gently out of its way
              const push = ((130 - d) / 130) * 48;
              mxOffset += (dx / d) * push;
              myOffset += (dy / d) * push;
              targetX = baseX + mxOffset;
              targetY = baseY + myOffset;
            } else {
              targetX = baseX + mxOffset;
              targetY = baseY + myOffset;
            }
          } else {
            targetX = baseX + mxOffset;
            targetY = baseY + myOffset;
          }

          targetAlpha = 0.42;
          // Random role labels fade in and out
          const labelWave = Math.sin(t * 0.55 + i * 1.7);
          targetLabelAlpha = c.roleName && labelWave > 0.45 ? (labelWave - 0.45) * 1.4 : 0;
        } else {
          targetAlpha = 0;
          front = false;
        }
      }

      // Smooth spring-like interpolation toward target position
      const lerpFactor = front ? 0.22 : 0.12;
      c.x += (targetX - c.x) * lerpFactor;
      c.y += (targetY - c.y) * lerpFactor;
      c.alpha += (targetAlpha - c.alpha) * 0.18;
      c.labelAlpha += (targetLabelAlpha - c.labelAlpha) * 0.15;
      c.onFrontCanvas = front;

      const isSquished = now < c.squishUntil;
      const finalScale = (isSquished ? 0.76 : 1.0) * targetScale;
      c.scale += (finalScale - c.scale) * 0.25;

      if (c.alpha > 0.02) {
        const ctxToUse = c.onFrontCanvas ? fCtx : bCtx;
        this.drawCursorSprite(
          ctxToUse,
          c.x,
          c.y,
          c.scale,
          c.alpha,
          c.color,
          c.roleName,
          c.labelAlpha
        );
      }
    }

    // Draw Hero Marquee / Skeleton / JSX Tooltip Overlays on frontCanvas
    for (const [, { piece, localP, rect }] of activeHeroPieceByBuilder) {
      const builder = NAMED_BUILDER_ROLES[piece.builderIndex % NAMED_BUILDER_ROLES.length];
      this.drawMarqueeBuildOverlay(fCtx, rect, localP, piece.jsxLabel, builder.color);
    }

    // Draw Below-Hero Block Marquee Overlays on frontCanvas
    for (const [, { task, prog }] of activeBuildByBuilder) {
      const rect = task.element.getBoundingClientRect();
      const jsxName = task.element.dataset.jsxLabel || '<SectionBlock />';
      const builder = NAMED_BUILDER_ROLES[task.builderIndex % NAMED_BUILDER_ROLES.length];
      this.drawMarqueeBuildOverlay(fCtx, rect, prog, jsxName, builder.color);
    }

    // Draw Click Ripples on frontCanvas
    this.ripples = this.ripples.filter(r => now - r.birth < r.duration);
    for (const r of this.ripples) {
      const rp = (now - r.birth) / r.duration;
      const rad = 4 + rp * 34;
      fCtx.save();
      fCtx.strokeStyle = r.color;
      fCtx.globalAlpha = (1 - rp) * 0.85;
      fCtx.lineWidth = 2;
      fCtx.beginPath();
      fCtx.arc(r.x, r.y, rad, 0, Math.PI * 2);
      fCtx.stroke();
      fCtx.restore();
    }

    bCtx.restore();
    fCtx.restore();
  }

  /**
   * Draws a dashed blue marquee box with a live "W × H" dimension pill,
   * grey skeleton bars, and dark JSX tooltip while an agent cursor constructs a block.
   */
  private drawMarqueeBuildOverlay(
    ctx: CanvasRenderingContext2D,
    rect: DOMRect,
    localP: number,
    jsxLabel: string,
    color: string
  ) {
    if (localP <= 0.18 || localP >= 0.98) return;
    const dragU = Math.max(0.05, Math.min(1, (localP - 0.18) / 0.67));
    const curW = Math.round(rect.width * dragU);
    const curH = Math.round(rect.height * dragU);

    ctx.save();

    // Faint blue fill & dashed border marquee
    ctx.fillStyle = 'rgba(52, 120, 246, 0.04)';
    ctx.fillRect(rect.left, rect.top, curW, curH);

    ctx.strokeStyle = '#3478F6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(rect.left, rect.top, curW, curH);
    ctx.setLineDash([]);

    // Grey skeleton shimmer bars inside while dragging (before click reveal at 0.86)
    if (localP < 0.86 && curH > 26 && curW > 60) {
      ctx.fillStyle = 'rgba(21, 21, 21, 0.07)';
      const barH = Math.min(14, curH * 0.25);
      ctx.beginPath();
      ctx.roundRect(rect.left + 10, rect.top + 10, Math.min(curW - 20, curW * 0.65), barH, 4);
      ctx.fill();
      if (curH > 52) {
        ctx.beginPath();
        ctx.roundRect(rect.left + 10, rect.top + 30, Math.min(curW - 20, curW * 0.45), barH * 0.8, 4);
        ctx.fill();
      }
    }

    // Live "W × H" dimension badge at bottom-right of marquee
    const dimText = `${curW} × ${curH}`;
    ctx.font = '600 10px "Geist Mono", "JetBrains Mono", monospace';
    const dimW = ctx.measureText(dimText).width + 12;
    const dimX = rect.left + curW - dimW;
    const dimY = rect.top + curH + 4;

    ctx.fillStyle = '#3478F6';
    ctx.beginPath();
    ctx.roundRect(dimX, dimY, dimW, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(dimText, dimX + 6, dimY + 12.5);

    // Dark JSX tooltip at top-left of marquee
    ctx.font = '500 10px "Geist Mono", "JetBrains Mono", monospace';
    const tipW = ctx.measureText(jsxLabel).width + 14;
    const tipX = rect.left;
    const tipY = Math.max(6, rect.top - 22);
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.roundRect(tipX, tipY, tipW, 18, 4);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(jsxLabel, tipX + 7, tipY + 12.5);

    ctx.restore();
  }

  /**
   * Draws a classic desktop mouse-pointer arrow sprite with white keyline, soft shadow,
   * and optional rounded coloured role pill.
   */
  private drawCursorSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    alpha: number,
    color: string,
    roleName: string | null,
    labelAlpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Soft drop shadow
    ctx.shadowColor = 'rgba(21, 21, 21, 0.22)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // Classic desktop arrow polygon path
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 16.5);
    ctx.lineTo(4.4, 12.8);
    ctx.lineTo(7.4, 19.2);
    ctx.lineTo(10.1, 18.0);
    ctx.lineTo(7.1, 11.6);
    ctx.lineTo(12.5, 11.6);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Crisp white keyline
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Rounded coloured role tag pill
    if (roleName && labelAlpha > 0.04) {
      ctx.globalAlpha = alpha * labelAlpha;
      ctx.font = '600 10.5px "Geist", "Inter", sans-serif';
      const textW = ctx.measureText(roleName).width;
      const pillW = textW + 14;
      const pillH = 19;
      const px = 11;
      const py = 14;

      ctx.shadowColor = 'rgba(21, 21, 21, 0.16)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px, py, pillW, pillH, 9.5);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'middle';
      ctx.fillText(roleName, px + 7, py + pillH * 0.52);
    }

    ctx.restore();
  }
}

