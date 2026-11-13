import React, { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_CONTENT } from '../content';
import { createTransparentPortraitCutout } from '../utils/cutoutPortrait';
import '../grubo.css';

interface HackPortfolioProps {
  onOpenResume: () => void;
  onOpenCommandPalette: () => void;
}

interface CyberWorld {
  letter: string;
  name: string;
  desc: string;
  trailerTitle: string;
  trailerDesc: string;
  stack: string;
  photoPath: string;
  accent: string;
  secondary: string;
}

const WORLDS: CyberWorld[] = [
  {
    letter: 'H',
    name: 'SIEM LAB',
    desc: 'Splunk Enterprise, Universal Forwarder & Sysmon correlation across Windows & Linux.',
    trailerTitle: 'THREATS CAUGHT LIVE.',
    trailerDesc:
      'Configured Splunk Enterprise with Universal Forwarder and Sysmon to ingest Windows Event Logs (4625/4624) and Linux auth logs, writing custom SPL correlation searches, dashboards, and real-time SOC alerts.',
    stack: 'Splunk Enterprise · Universal Forwarder · Sysmon · SPL · Event IDs 4625/4624',
    photoPath: '/assets/letter-worlds/h-siem.jpg',
    accent: '#00f0ff',
    secondary: '#6d28d9',
  },
  {
    letter: 'A',
    name: 'FORENSICS',
    desc: 'Police Cyber Cell digital evidence triage across 15+ seized devices & 40+ phishing domains.',
    trailerTitle: 'EVERY TRACE PRESERVED.',
    trailerDesc:
      'Supported digital evidence acquisition and forensic triage across 15+ seized mobile and storage devices at the Police Cyber Cell while tracing 40+ phishing email headers via OSINT and preparing Section 65B IT Act reports.',
    stack: 'Digital Forensics · Chain of Custody · OSINT · Phishing Analysis · Section 65B IT Act',
    photoPath: '/assets/letter-worlds/a-forensics.jpg',
    accent: '#ff3d77',
    secondary: '#7c3aed',
  },
  {
    letter: 'C',
    name: 'LINUX OPS',
    desc: 'HashRoot server administration across 20+ Ubuntu, CentOS & Windows Server nodes.',
    trailerTitle: 'HARDENED AT SCALE.',
    trailerDesc:
      'Administered 20+ Linux (Ubuntu, CentOS) and Windows Server instances at HashRoot—configuring user/group IAM, SSH hardening, firewall policies, and Bash/Cron automation that cut manual toil by 60%.',
    stack: 'Ubuntu · CentOS · Windows Server AD · SSH Hardening · Bash & Cron Automation',
    photoPath: '/assets/letter-worlds/c-linux.jpg',
    accent: '#00ff9d',
    secondary: '#4c0aaf',
  },
  {
    letter: 'K',
    name: 'FIM & RFID',
    desc: 'Python SHA-256 file integrity engine & ESP32 MFRC522 hardware access control over SPI.',
    trailerTitle: 'ZERO SILENT TAMPERING.',
    trailerDesc:
      'Built a Python SHA-256 & MD5 file integrity monitor alongside an embedded ESP32 + MFRC522 RFID physical access control system over SPI in C/C++—protecting both server filesystems and physical server doors.',
    stack: 'Python 3 · hashlib (SHA-256 / MD5) · ESP32 · MFRC522 RFID · SPI · Embedded C/C++',
    photoPath: '/assets/letter-worlds/k-hardware.jpg',
    accent: '#c084fc',
    secondary: '#06b6d4',
  },
];

const PROJECT_PREVIEW_PHOTOS: Record<string, string> = {
  siem: '/assets/letter-worlds/h-siem.jpg',
  fim: '/assets/letter-worlds/c-linux.jpg',
  rfid: '/assets/letter-worlds/k-hardware.jpg',
};

export const HackPortfolio: React.FC<HackPortfolioProps> = ({
  onOpenResume,
  onOpenCommandPalette,
}) => {
  const { identity, projects } = PORTFOLIO_CONTENT;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cutoutUrl, setCutoutUrl] = useState<string>(identity.photoUrl);
  const [activeWorldPhoto, setActiveWorldPhoto] = useState<string>(WORLDS[0].photoPath);
  const [serverCount, setServerCount] = useState<number>(20);

  const introCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const introInnerRef = useRef<HTMLDivElement | null>(null);
  const founderFxRef = useRef<HTMLCanvasElement | null>(null);
  const founderImgRef = useRef<HTMLImageElement | null>(null);
  const worldVideoRef = useRef<HTMLCanvasElement | null>(null);

  const activeWorldRef = useRef<number>(0);
  const isWorldOpenRef = useRef<boolean>(false);

  // Strip white/grey circular background cleanly while preserving Alen's real portrait
  useEffect(() => {
    let active = true;
    createTransparentPortraitCutout(identity.photoUrl).then(url => {
      if (active) setCutoutUrl(url);
    });
    return () => {
      active = false;
    };
  }, [identity.photoUrl]);

  // Close mobile menu on Escape or viewport resize above mobile breakpoint
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 750) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('is-intro');
    let rafId = 0;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    // =========================================================================
    // 1. HACK WEBGL DEPTH-OF-FIELD 3D GLYPH ENGINE (H - A - C - K)
    // =========================================================================
    const initWebGL = () => {
      const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
      if (!canvas) return;
      const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        depth: true,
        stencil: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
      if (!gl) return;

      const vert = `attribute vec3 aPosition; uniform mat4 uProjection,uView,uModel; varying vec3 vWorldPos; varying vec3 vNormal; varying vec2 vTex; void main(){vec4 wp=uModel*vec4(aPosition,1.); vWorldPos=wp.xyz; vTex=vec2((aPosition.x+3.9)/7.8,(aPosition.y+1.0)/2.0); vNormal=normalize((uModel*vec4(0.,0.,1.,0.)).xyz); gl_Position=uProjection*uView*wp;}`;
      const frag = `precision highp float;varying vec3 vWorldPos,vNormal;varying vec2 vTex;uniform sampler2D uPhoto;uniform vec3 uEye;uniform float uOpacity,uTime,uGlyphIndex;void main(){vec3 n=normalize(vNormal);float light=0.90+0.14*dot(n,normalize(vec3(-.30,.55,1.)))+0.12*max(0.,dot(n,normalize(vec3(.45,-.3,1.))));float viewDist=distance(vWorldPos,uEye);float atmospheric=1.-smoothstep(8.,25.,viewDist)*0.30;float drift=0.09*sin(uTime*0.35+uGlyphIndex*1.7);vec2 uv=vec2(clamp(vTex.x,0.0,1.0),clamp(0.24+0.52*vTex.y+drift,0.02,0.98));vec3 photo=texture2D(uPhoto,uv).rgb;float sheen=0.055*pow(max(0.,sin(vTex.x*3.14159+uTime*0.65+uGlyphIndex)),4.0);vec3 col=(photo*min(1.14,light)+vec3(0.42,0.22,0.75)*sheen)*atmospheric*uOpacity;gl_FragColor=vec4(col,clamp(viewDist/28.,0.02,1.));}`;
      const quadVert = `attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;
      const blurFrag = `precision mediump float;varying vec2 vUV;uniform sampler2D uTexture;uniform vec2 uStep;void main(){vec4 c=texture2D(uTexture,vUV)*.1974;c+=(texture2D(uTexture,vUV+uStep*1.)+texture2D(uTexture,vUV-uStep*1.))*.1747;c+=(texture2D(uTexture,vUV+uStep*2.)+texture2D(uTexture,vUV-uStep*2.))*.1209;c+=(texture2D(uTexture,vUV+uStep*3.)+texture2D(uTexture,vUV-uStep*3.))*.0651;c+=(texture2D(uTexture,vUV+uStep*4.)+texture2D(uTexture,vUV-uStep*4.))*.0263;gl_FragColor=c;}`;
      const compositeFrag = `precision highp float;varying vec2 vUV;uniform sampler2D uSharp,uBlur;uniform float uFocus,uDof;uniform vec2 uResolution;void main(){vec4 sharp=texture2D(uSharp,vUV);vec4 blurred=texture2D(uBlur,vUV);float isGeo=step(.012,sharp.a);float depth=sharp.a>.012?sharp.a:blurred.a;float radius=abs(depth-uFocus);float blurFactor=smoothstep(.017,.105,radius)*uDof;blurFactor=clamp(blurFactor,0.,1.);float bgBlur=clamp((blurred.a-.012)*15.,0.,1.);vec3 color=mix(sharp.rgb,blurred.rgb,blurFactor*mix(bgBlur,1.,isGeo));vec2 p=vUV*2.-1.;float vignette=1.-.17*smoothstep(.5,1.25,length(p*vec2(.8,1.)));color*=vignette;gl_FragColor=vec4(color,1.);}`;

      const shader = (type: number, src: string) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(sh) || 'Shader error');
        }
        return sh;
      };
      const makeProgram = (v: string, f: string) => {
        const p = gl.createProgram()!;
        gl.attachShader(p, shader(gl.VERTEX_SHADER, v));
        gl.attachShader(p, shader(gl.FRAGMENT_SHADER, f));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(p) || 'Link error');
        }
        return p;
      };

      let sceneProgram: WebGLProgram;
      let blurProgram: WebGLProgram;
      let compositeProgram: WebGLProgram;
      try {
        sceneProgram = makeProgram(vert, frag);
        blurProgram = makeProgram(quadVert, blurFrag);
        compositeProgram = makeProgram(quadVert, compositeFrag);
      } catch (e) {
        console.error(e);
        return;
      }

      const L = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
      const sceneLoc = {
        projection: L(sceneProgram, 'uProjection'),
        view: L(sceneProgram, 'uView'),
        model: L(sceneProgram, 'uModel'),
        eye: L(sceneProgram, 'uEye'),
        opacity: L(sceneProgram, 'uOpacity'),
        time: L(sceneProgram, 'uTime'),
        glyphIndex: L(sceneProgram, 'uGlyphIndex'),
        photo: L(sceneProgram, 'uPhoto'),
        pos: gl.getAttribLocation(sceneProgram, 'aPosition'),
      };
      const blurLoc = {
        texture: L(blurProgram, 'uTexture'),
        step: L(blurProgram, 'uStep'),
        pos: gl.getAttribLocation(blurProgram, 'aPos'),
      };
      const compLoc = {
        sharp: L(compositeProgram, 'uSharp'),
        blur: L(compositeProgram, 'uBlur'),
        focus: L(compositeProgram, 'uFocus'),
        dof: L(compositeProgram, 'uDof'),
        resolution: L(compositeProgram, 'uResolution'),
        pos: gl.getAttribLocation(compositeProgram, 'aPos'),
      };

      interface RenderTarget {
        w: number;
        h: number;
        texture: WebGLTexture | null;
        fbo: WebGLFramebuffer | null;
        depth: WebGLRenderbuffer | null;
      }

      const framebuffer = (w: number, h: number, needsDepth = false): RenderTarget => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        let depth: WebGLRenderbuffer | null = null;
        if (needsDepth) {
          depth = gl.createRenderbuffer();
          gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
          gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
        }
        return { w, h, texture, fbo, depth };
      };

      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      const drawQuad = (position: number) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };

      const RT: {
        full: RenderTarget | null;
        half1: RenderTarget | null;
        half2: RenderTarget | null;
      } = {
        full: null,
        half1: null,
        half2: null,
      };
      let cw = 0;
      let ch = 0;
      const release = (rt: RenderTarget | null) => {
        if (!rt) return;
        gl.deleteTexture(rt.texture);
        gl.deleteFramebuffer(rt.fbo);
        if (rt.depth) gl.deleteRenderbuffer(rt.depth);
      };
      const resize = () => {
        const w = Math.round(window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.6));
        const h = Math.round(window.innerHeight * Math.min(window.devicePixelRatio || 1, 1.6));
        if (w === cw && h === ch) return;
        cw = w;
        ch = h;
        canvas.width = w;
        canvas.height = h;
        release(RT.full);
        release(RT.half1);
        release(RT.half2);
        const sw = Math.max(w, Math.min(3000, Math.round(w * 1.5)));
        const sh = Math.max(h, Math.min(2000, Math.round(h * 1.5)));
        RT.full = framebuffer(sw, sh, true);
        RT.half1 = framebuffer(Math.max(2, sw >> 1), Math.max(2, sh >> 1));
        RT.half2 = framebuffer(Math.max(2, sw >> 1), Math.max(2, sh >> 1));
      };

      const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
      const dot = (a: number[], b: number[]) => a.reduce((v, x, i) => v + x * b[i], 0);
      const cross = (a: number[], b: number[]) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ];
      const norm = (a: number[]) => {
        const l = Math.hypot(...a) || 1;
        return a.map(x => x / l);
      };
      const mul = (a: Float32Array, b: Float32Array) => {
        const o = new Float32Array(16);
        for (let c = 0; c < 4; c++)
          for (let r = 0; r < 4; r++)
            for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
        return o;
      };
      const translate = (x: number, y: number, z: number) =>
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
      const scale = (s: number) =>
        new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
      const rx = (a: number) => {
        const c = Math.cos(a),
          s = Math.sin(a);
        return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
      };
      const ry = (a: number) => {
        const c = Math.cos(a),
          s = Math.sin(a);
        return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
      };
      const rz = (a: number) => {
        const c = Math.cos(a),
          s = Math.sin(a);
        return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      };
      const persp = (fovy: number, aspect: number, near: number, far: number) => {
        const f = 1 / Math.tan(fovy / 2),
          nf = 1 / (near - far);
        return new Float32Array([
          f / aspect,
          0,
          0,
          0,
          0,
          f,
          0,
          0,
          0,
          0,
          (far + near) * nf,
          -1,
          0,
          0,
          2 * near * far * nf,
          0,
        ]);
      };
      const lookAt = (eye: number[], target: number[], up: number[]) => {
        const z = norm(sub(eye, target)),
          x = norm(cross(up, z)),
          y = cross(z, x);
        return new Float32Array([
          x[0],
          y[0],
          z[0],
          0,
          x[1],
          y[1],
          z[1],
          0,
          x[2],
          y[2],
          z[2],
          0,
          -dot(x, eye),
          -dot(y, eye),
          -dot(z, eye),
          1,
        ]);
      };

      const svgOrder = [0, 1, 2, 3]; // H, A, C, K
      const gap = 4.4;
      const ASSEMBLY_START = 0.72;
      const ASSEMBLY_END = 0.94;
      const LOGO_LETTER_STEP = 1.98;
      const saturate = (x: number) => Math.max(0, Math.min(1, x));
      const smoothstep = (x: number) => {
        x = saturate(x);
        return x * x * (3 - 2 * x);
      };
      const poses = [
        { x: -0.7, y: 0, z: -1.0, rx: -0.13, ry: 0.56, rz: -0.09 },
        { x: 0.24, y: -gap, z: -3.0, rx: 0.17, ry: -0.41, rz: 0.12 },
        { x: -0.58, y: -2 * gap, z: -0.7, rx: -0.22, ry: 0.48, rz: -0.07 },
        { x: 0.28, y: -3 * gap, z: -2.4, rx: 0.11, ry: -0.44, rz: 0.1 },
      ];
      const CAMERA_Z = 7.1;

      // Load the 4 photorealistic cyber images inside the 3D H-A-C-K letters
      const glyphPhotos = WORLDS.map(world => {
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Dark obsidian-violet 1x1 seed pixel before image finishes decoding
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([26, 16, 48, 255])
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const img = new Image();
        img.onload = () => {
          if (disposed) return;
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        };
        img.src = world.photoPath;
        return texture;
      });

      const meshes: Array<{ buffer: WebGLBuffer; count: number }> = [];
      let meshRaw: number[][] = [];
      let ready = false;
      let lastTime = 0;
      let smoothScroll = 0;
      let requestedScroll = 0;
      let activeIndex = -1;
      let chapterAnimTimer = 0;
      const mouse = { x: 0, y: 0 };
      const sm = { x: 0, y: 0 };
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dofStrength = 0.65;
      const mouseStrength = 0.75;
      const letterScale = 0.8;
      let currentEye = [1, 0, CAMERA_Z];
      let currentTarget = [0, 0, -1];
      let currentView: Float32Array | null = null;
      let currentProjection: Float32Array | null = null;
      const currentModel: Float32Array[] = [];
      const TRAVEL_MS = 1150;
      const TRAILER_MS = 15000;

      const journey: {
        mode: 'idle' | 'enter' | 'playing' | 'exit';
        start: number;
        selected: number;
        eye: number[];
        target: number[];
        point: number[];
        returnStart: number[];
        returnTarget: number[];
      } = {
        mode: 'idle',
        start: 0,
        selected: 0,
        eye: [1, 0, CAMERA_Z],
        target: [0, 0, -1],
        point: [0, 0, -1],
        returnStart: [1, 0, CAMERA_Z],
        returnTarget: [0, 0, -1],
      };

      const worldScreen = document.getElementById('worldScreen');
      const progressEl = document.getElementById('worldProgress');
      const timeEl = document.getElementById('worldTime');
      const track = document.getElementById('work');
      const chapter = document.getElementById('chapter');

      const eased = (v: number) => {
        v = Math.max(0, Math.min(1, v));
        return v * v * (3 - 2 * v);
      };
      const mix3 = (a: number[], b: number[], f: number) => a.map((x, i) => x + (b[i] - x) * f);
      const multVec = (m: Float32Array, v: number[]) => [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
      ];
      const projected = (
        x: number,
        y: number,
        z: number,
        model: Float32Array,
        view: Float32Array,
        projection: Float32Array
      ) => {
        const p = multVec(projection, multVec(view, multVec(model, [x, y, z, 1])));
        if (p[3] <= 0.03) return null;
        return [
          (p[0] / p[3] * 0.5 + 0.5) * window.innerWidth,
          (-p[1] / p[3] * 0.5 + 0.5) * window.innerHeight,
          p[2] / p[3],
        ];
      };
      const insideTri = (px: number, py: number, A: number[], B: number[], C: number[]) => {
        const d = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]);
        if (Math.abs(d) < 0.000001) return null;
        const w1 = ((B[1] - C[1]) * (px - C[0]) + (C[0] - B[0]) * (py - C[1])) / d;
        const w2 = ((C[1] - A[1]) * (px - C[0]) + (A[0] - C[0]) * (py - C[1])) / d;
        const w3 = 1 - w1 - w2;
        return w1 >= -0.0001 && w2 >= -0.0001 && w3 >= -0.0001 ? [w1, w2, w3] : null;
      };

      const pickGlyph = (x: number, y: number) => {
        if (
          !ready ||
          !currentView ||
          !currentProjection ||
          !track ||
          journey.mode !== 'idle' ||
          document.body.classList.contains('is-intro') ||
          document.body.classList.contains('is-about')
        )
          return null;
        const workRect = track.getBoundingClientRect();
        if (workRect.top > window.innerHeight * 0.4 || workRect.bottom < window.innerHeight * 0.15)
          return null;
        const view = currentView;
        const projection = currentProjection;
        let nearest: { index: number; point: number[] } | null = null;
        let nearestDepth = Infinity;
        for (let i = 0; i < 4; i++) {
          const mesh = meshRaw[i];
          const model = currentModel[i];
          if (
            !mesh ||
            !model ||
            (smoothScroll < ASSEMBLY_START &&
              Math.abs(i - (smoothScroll / ASSEMBLY_START) * 3) > 1.5)
          )
            continue;
          for (let j = 0; j < mesh.length; j += 9) {
            const A = projected(mesh[j], mesh[j + 1], 0, model, view, projection);
            const B = projected(mesh[j + 3], mesh[j + 4], 0, model, view, projection);
            const C = projected(mesh[j + 6], mesh[j + 7], 0, model, view, projection);
            if (!A || !B || !C) continue;
            const weights = insideTri(x, y, A, B, C);
            if (!weights) continue;
            const depth = weights[0] * A[2] + weights[1] * B[2] + weights[2] * C[2];
            if (depth >= nearestDepth) continue;
            const vertex = [
              mesh[j] * weights[0] + mesh[j + 3] * weights[1] + mesh[j + 6] * weights[2],
              mesh[j + 1] * weights[0] + mesh[j + 4] * weights[1] + mesh[j + 7] * weights[2],
              0,
              1,
            ];
            const world = multVec(model, vertex);
            nearestDepth = depth;
            nearest = { index: i, point: world.slice(0, 3) };
          }
        }
        return nearest;
      };

      const anchorPoint = (i: number) => {
        const raw = meshRaw[i];
        if (!raw || !currentModel[i]) return [poses[i].x, poses[i].y, poses[i].z];
        const j = Math.floor(raw.length / 18) * 9;
        const v = multVec(currentModel[i], [raw[j], raw[j + 1], 0, 1]);
        return v.slice(0, 3);
      };

      const finishWorld = () => {
        document.body.classList.add('world-active');
        document.body.classList.remove('world-transitioning');
        journey.mode = 'playing';
        journey.start = performance.now();
        worldScreen?.setAttribute('aria-hidden', 'false');
        document.getElementById('close')?.focus({ preventScroll: true });
      };

      const endWorld = () => {
        if (journey.mode === 'idle' || journey.mode === 'exit') return;
        journey.mode = 'exit';
        journey.start = performance.now();
        journey.returnStart = currentEye.slice();
        journey.returnTarget = currentTarget.slice();
        document.body.classList.remove('world-active');
        document.body.classList.add('world-transitioning', 'world-exiting');
        worldScreen?.setAttribute('aria-hidden', 'true');
      };

      const finishExit = () => {
        journey.mode = 'idle';
        isWorldOpenRef.current = false;
        document.body.classList.remove('world-transitioning', 'world-exiting');
        chapter?.classList.remove('is-entering');
        document.getElementById('enter')?.focus({ preventScroll: true });
      };

      const beginWorld = (i: number, point?: number[]) => {
        if (journey.mode !== 'idle') return;
        i = Math.max(0, Math.min(3, i));
        activeWorldRef.current = i;
        isWorldOpenRef.current = true;
        setActiveWorldPhoto(WORLDS[i].photoPath);
        journey.mode = 'enter';
        journey.start = performance.now();
        journey.selected = i;
        journey.eye = currentEye.slice();
        journey.target = currentTarget.slice();
        journey.point = point || anchorPoint(i);
        chapter?.classList.add('is-entering');
        document.body.classList.remove('world-exiting');
        document.body.classList.add('world-transitioning');
        canvas.classList.remove('is-pickable');
        worldScreen?.setAttribute('aria-hidden', 'true');
        const idxEl = document.getElementById('overlayIndex');
        const titleEl = document.getElementById('overlayTitle');
        const descEl = document.getElementById('overlayDesc');
        const stackEl = document.getElementById('overlayStack');
        if (idxEl)
          idxEl.textContent =
            String(i + 1).padStart(2, '0') + ' / 04 · GLYPH [' + WORLDS[i].letter + ']';
        if (titleEl) titleEl.textContent = WORLDS[i].trailerTitle;
        if (descEl) descEl.textContent = WORLDS[i].trailerDesc;
        if (stackEl) stackEl.textContent = WORLDS[i].stack;
        if (progressEl) progressEl.style.width = '0%';
        if (timeEl) timeEl.textContent = '00:15';
      };

      const cameraJourney = (now: number, eye: number[], target: number[]) => {
        if (journey.mode === 'idle') return { eye, target };
        if (journey.mode === 'playing') {
          const elapsed = now - journey.start;
          const duration = TRAILER_MS / 1000;
          const seconds = elapsed / 1000;
          const amount = Math.min(1, seconds / duration);
          if (progressEl) progressEl.style.width = (amount * 100).toFixed(2) + '%';
          if (timeEl)
            timeEl.textContent =
              '00:' + String(Math.max(0, Math.ceil(duration - seconds))).padStart(2, '0');
          if (elapsed >= TRAILER_MS) {
            endWorld();
            return { eye: currentEye, target: currentTarget };
          }
          return { eye: currentEye, target: currentTarget };
        }
        const p = journey.point;
        const through = [p[0], p[1], p[2] - 1.0];
        const lookDeep = [p[0], p[1], p[2] - 5.0];
        if (journey.mode === 'enter') {
          const f = eased((now - journey.start) / (prefersReduced ? 200 : TRAVEL_MS));
          const result = {
            eye: mix3(journey.eye, through, f),
            target: mix3(journey.target, lookDeep, f),
          };
          if (f >= 1) finishWorld();
          return result;
        }
        const f = eased((now - journey.start) / (prefersReduced ? 200 : TRAVEL_MS));
        const result = {
          eye: mix3(journey.returnStart, eye, f),
          target: mix3(journey.returnTarget, target, f),
        };
        if (f >= 1) finishExit();
        return result;
      };

      const createMesh = (array: number[]) => {
        const data = new Float32Array(array);
        const buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return { buffer, count: data.length / 3 };
      };

      const setChapter = (i: number) => {
        if (i === activeIndex) return;
        const hadPrevious = activeIndex !== -1;
        activeIndex = i;
        const item = WORLDS[i];
        const idxEl = document.getElementById('chapterIndex');
        const titleEl = document.getElementById('chapterTitle');
        const descEl = document.getElementById('chapterDesc');
        if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0') + ' / 04';
        if (titleEl) titleEl.textContent = item.name;
        if (descEl) descEl.textContent = item.desc;
        chapter?.classList.toggle('right', poses[i].ry > 0);
        chapter?.classList.toggle('left', poses[i].ry <= 0);
        if (hadPrevious && chapter && !prefersReduced) {
          chapter.classList.remove('chapter-kinetic-in');
          void chapter.offsetWidth;
          chapter.classList.add('chapter-kinetic-in');
          window.clearTimeout(chapterAnimTimer);
          chapterAnimTimer = window.setTimeout(() => {
            chapter.classList.remove('chapter-kinetic-in');
          }, 680);
        }
      };

      const interpolate = (arr: number[], t: number) => {
        const n = Math.min(3, Math.floor(t)),
          f = t - n;
        const b = Math.min(3, n + 1);
        const s = f * f * (3 - 2 * f);
        return arr[n] * (1 - s) + arr[b] * s;
      };

      const frame = (t: number) => {
        if (disposed || !ready || !track) return;
        const dt = Math.min(0.05, (t - lastTime) / 1000 || 0.016);
        lastTime = t;
        resize();
        if (!RT.full || !RT.half1 || !RT.half2) return;

        const rect = track.getBoundingClientRect();
        document.body.classList.toggle('is-intro', rect.top > window.innerHeight * 0.36);
        const usable = Math.max(1, track.offsetHeight - window.innerHeight);
        requestedScroll = Math.min(1, Math.max(0, -rect.top / usable));
        const k = 1 - Math.exp(-dt * (prefersReduced ? 30 : 2.6));
        smoothScroll += (requestedScroll - smoothScroll) * k;
        const m = 1 - Math.exp(-dt * (prefersReduced ? 30 : 2.6));
        sm.x += (mouse.x - sm.x) * m;
        sm.y += (mouse.y - sm.y) * m;

        const introReveal = Math.max(
          0,
          Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight * 0.9))
        );
        const progress = Math.min(3, (smoothScroll / ASSEMBLY_START) * 3);
        const assembly = smoothstep(
          (smoothScroll - ASSEMBLY_START) / (ASSEMBLY_END - ASSEMBLY_START)
        );
        const i = Math.min(3, Math.max(0, Math.round(progress)));
        setChapter(i);
        if (chapter) {
          const chOpacity = 1 - smoothstep((smoothScroll - ASSEMBLY_START) / 0.065);
          chapter.style.opacity = String(chOpacity);
          chapter.style.pointerEvents = chOpacity < 0.08 ? 'none' : '';
        }
        const pageProg = document.getElementById('progress');
        if (pageProg) pageProg.style.width = (smoothScroll * 100).toFixed(2) + '%';

        const isPortrait = window.innerWidth < window.innerHeight;
        const isMobile = window.innerWidth <= 820;
        const zBoost = isPortrait ? 3.5 : window.innerWidth < 1024 ? 1.3 : 0;
        const mobileYShift = isMobile && isPortrait ? -0.45 : 0;

        const camY = -gap * progress;
        const camSway = interpolate([0.35, -0.45, 0.42, -0.35], progress);
        const eye = [
          (isMobile ? 0.25 : 1.0) + camSway + (prefersReduced ? 0 : sm.x * 0.5 * mouseStrength),
          camY + 0.22 + mobileYShift + (prefersReduced ? 0 : sm.y * 0.32 * mouseStrength),
          CAMERA_Z + zBoost,
        ];
        const target = [
          (isMobile ? -0.05 : -0.38) + camSway * 0.3,
          camY - 0.1 + mobileYShift,
          -1.35,
        ];

        const glyphScale = letterScale * 1.7;
        const logoStep = LOGO_LETTER_STEP * glyphScale;
        const finalCenter = [0, -1.5 * logoStep, -1.9];
        const fovy = ((window.innerWidth < 730 ? 43 : 41) * Math.PI) / 180;
        const aspect = Math.max(0.25, window.innerWidth / Math.max(window.innerHeight, 1));
        const fullWidth = (3 * LOGO_LETTER_STEP + 2.05) * glyphScale;
        const fullHeight = 7.85 * glyphScale;
        const fitZ =
          Math.max(
            fullWidth / (2 * Math.tan(fovy / 2) * aspect * 0.84),
            fullHeight / (2 * Math.tan(fovy / 2) * 0.8)
          ) + 2.0;
        const finalEyeGoal = [finalCenter[0], finalCenter[1], finalCenter[2] + fitZ];
        const finalEyeBase = mix3(eye, finalEyeGoal, assembly);
        const finalTargetBase = mix3(target, finalCenter, assembly);
        const cameraPos = cameraJourney(t, finalEyeBase, finalTargetBase);
        const finalEye = cameraPos.eye;
        const finalTarget = cameraPos.target;
        currentEye = finalEye.slice();
        currentTarget = finalTarget.slice();

        const projection = persp(
          ((window.innerWidth < 730 ? 43 : 41) * Math.PI) / 180,
          cw / ch,
          0.1,
          80
        );
        const cameraRoll = -Math.PI * 0.5 * assembly;
        const viewUp = [-Math.sin(cameraRoll), Math.cos(cameraRoll), 0];
        const view = lookAt(finalEye, finalTarget, viewUp);
        currentView = view;
        currentProjection = projection;

        const activePose = poses[i];
        const focusPos = [activePose.x, activePose.y, activePose.z];
        const focusDist = Math.hypot(...sub(finalEye, focusPos));

        // PASS 1: 3D sculpted HACK glyphs with photorealistic cyber photography
        gl.bindFramebuffer(gl.FRAMEBUFFER, RT.full.fbo);
        gl.viewport(0, 0, RT.full.w, RT.full.h);
        gl.clearColor(0.012, 0.009, 0.022, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(sceneProgram);
        gl.uniformMatrix4fv(sceneLoc.projection, false, projection);
        gl.uniformMatrix4fv(sceneLoc.view, false, view);
        gl.uniform3fv(sceneLoc.eye, finalEye);
        gl.uniform1f(sceneLoc.time, prefersReduced ? 0 : t * 0.001);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(sceneLoc.photo, 0);

        for (let j = 3; j >= 0; j--) {
          const pose = poses[j];
          const originalDrift = prefersReduced ? 0 : Math.sin(t * 0.00039 + j * 1.1) * 0.032;
          const originalX = pose.x + (prefersReduced ? 0 : sm.x * 0.11 * mouseStrength);
          const originalY = pose.y + (prefersReduced ? 0 : Math.sin(t * 0.00042 + j * 2) * 0.08);
          const originalZ = pose.z;
          const alignedY = -j * logoStep;
          const originalRX = pose.rx + (prefersReduced ? 0 : sm.y * 0.2 * mouseStrength);
          const originalRY = pose.ry + (prefersReduced ? 0 : sm.x * 0.26 * mouseStrength);
          const originalRZ =
            pose.rz + originalDrift + (prefersReduced ? 0 : sm.x * 0.062 * mouseStrength);
          const arriving =
            j < 2 && !prefersReduced
              ? eased((introReveal - (j === 0 ? 0.12 : 0.34)) / (j === 0 ? 0.67 : 0.62))
              : 1;
          const far = (1 - arriving) * (1 - assembly);
          const entryX = far * (j === 0 ? -1.15 : 1.2);
          const entryY = far * (j === 0 ? 1.24 : -0.62);
          const entryZ = far * -3.1;
          const transform = mul(
            translate(
              originalX * (1 - assembly) + entryX,
              originalY * (1 - assembly) + alignedY * assembly + entryY,
              originalZ * (1 - assembly) - 1.9 * assembly + entryZ
            ),
            mul(
              rz((originalRZ + far * (j === 0 ? -0.16 : 0.12)) * (1 - assembly)),
              mul(
                ry((originalRY + far * (j === 0 ? 0.22 : -0.2)) * (1 - assembly)),
                mul(rx(originalRX * (1 - assembly)), scale(glyphScale))
              )
            )
          );
          currentModel[j] = transform;
          gl.uniformMatrix4fv(sceneLoc.model, false, transform);
          gl.uniform1f(sceneLoc.glyphIndex, j);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, glyphPhotos[j]);
          gl.uniform1f(sceneLoc.opacity, 0.56 + 0.44 * arriving);
          gl.bindBuffer(gl.ARRAY_BUFFER, meshes[svgOrder[j]].buffer);
          gl.enableVertexAttribArray(sceneLoc.pos);
          gl.vertexAttribPointer(sceneLoc.pos, 3, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, meshes[svgOrder[j]].count);
        }
        gl.disable(gl.DEPTH_TEST);

        // PASS 2 & 3: Separable lens blur
        gl.useProgram(blurProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(blurLoc.texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, RT.half1.fbo);
        gl.viewport(0, 0, RT.half1.w, RT.half1.h);
        gl.bindTexture(gl.TEXTURE_2D, RT.full.texture);
        gl.uniform2f(blurLoc.step, 3.0 / RT.full.w, 0);
        drawQuad(blurLoc.pos);

        gl.bindFramebuffer(gl.FRAMEBUFFER, RT.half2.fbo);
        gl.viewport(0, 0, RT.half2.w, RT.half2.h);
        gl.bindTexture(gl.TEXTURE_2D, RT.half1.texture);
        gl.uniform2f(blurLoc.step, 0, 3.0 / RT.half1.h);
        drawQuad(blurLoc.pos);

        // PASS 4: Depth-of-field composite
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, cw, ch);
        gl.useProgram(compositeProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, RT.full.texture);
        gl.uniform1i(compLoc.sharp, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, RT.half2.texture);
        gl.uniform1i(compLoc.blur, 1);
        gl.uniform1f(compLoc.focus, focusDist / 28);
        gl.uniform1f(
          compLoc.dof,
          (prefersReduced ? 0.7 : dofStrength * 1.45) * (1 - 0.92 * assembly)
        );
        gl.uniform2f(compLoc.resolution, cw, ch);
        drawQuad(compLoc.pos);

        const about = rect.bottom < window.innerHeight * 0.12;
        document.body.classList.toggle('is-about', about);
        rafId = requestAnimationFrame(frame);
      };

      fetch('/geometry.json')
        .then(r => r.json())
        .then((data: number[][]) => {
          if (disposed || !Array.isArray(data) || data.length !== 4) return;
          data.forEach(arr => meshes.push(createMesh(arr)));
          meshRaw = svgOrder.map(ix => data[ix]);
          ready = true;
          rafId = requestAnimationFrame(frame);
        })
        .catch(err => console.error('Failed to load geometry.json', err));

      const isOnControls = (target: EventTarget | null) =>
        !!(target as HTMLElement | null)?.closest?.(
          'a,button,nav,.intro,.about,.insights,.team,.contact,.site-header,.world-screen,.mobile-nav-drawer'
        );

      const onPointerMove = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        if (e.pointerType === 'touch') return;
        const hover = isOnControls(e.target) ? null : pickGlyph(e.clientX, e.clientY);
        const yes = !!hover;
        canvas.classList.toggle('is-pickable', yes);
        document.body.classList.toggle('glyph-hover', yes);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (isOnControls(e.target)) return;
        const hit = pickGlyph(e.clientX, e.clientY);
        if (hit) {
          e.preventDefault();
          document.body.classList.remove('glyph-hover');
          beginWorld(hit.index, hit.point);
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && journey.mode !== 'idle') {
          e.preventDefault();
          endWorld();
        }
      };

      const enterBtn = document.getElementById('enter');
      const closeBtn = document.getElementById('close');
      const onEnterClick = () => beginWorld(Math.max(0, activeIndex));
      const onCloseClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        endWorld();
      };

      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('keydown', onKeyDown);
      enterBtn?.addEventListener('click', onEnterClick);
      closeBtn?.addEventListener('click', onCloseClick);

      cleanups.push(() => {
        window.clearTimeout(chapterAnimTimer);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('keydown', onKeyDown);
        enterBtn?.removeEventListener('click', onEnterClick);
        closeBtn?.removeEventListener('click', onCloseClick);
        release(RT.full);
        release(RT.half1);
        release(RT.half2);
        glyphPhotos.forEach(tex => gl.deleteTexture(tex));
        meshes.forEach(m => gl.deleteBuffer(m.buffer));
        gl.deleteBuffer(quad);
      });
    };

    // =========================================================================
    // 2. LIVE ANIMATED BACKGROUNDS (INTRO MESH, FOUNDER FX, WORLD TELEMETRY)
    // =========================================================================
    const initLiveCanvases = () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 2A. Intro interactive cyber mesh & packet pulse field
      const introCanvas = introCanvasRef.current;
      const introSection = document.getElementById('intro');
      if (introCanvas && introSection) {
        const ctx = introCanvas.getContext('2d');
        if (ctx) {
          let w = 0;
          let h = 0;
          let introVisible = true;
          let introRaf = 0;
          const pointer = { x: 0.65, y: 0.45, tx: 0.65, ty: 0.45 };

          const nodes = Array.from({ length: 34 }, (_, idx) => ({
            x: ((idx * 73) % 100) / 100,
            y: ((idx * 41 + 17) % 100) / 100,
            vx: (((idx % 7) - 3) * 0.00018) || 0.00012,
            vy: (((idx % 5) - 2) * 0.00016) || -0.00011,
            r: 1.4 + (idx % 3) * 0.8,
            cyan: idx % 3 === 0,
          }));

          const resizeIntro = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = introCanvas.clientWidth || window.innerWidth;
            h = introCanvas.clientHeight || window.innerHeight;
            introCanvas.width = Math.round(w * dpr);
            introCanvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };

          const drawIntro = (now: number) => {
            if (disposed) return;
            if (introVisible) {
              if (!w || !h) resizeIntro();
              pointer.x += (pointer.tx - pointer.x) * 0.06;
              pointer.y += (pointer.ty - pointer.y) * 0.06;

              ctx.clearRect(0, 0, w, h);

              const gridGap = w < 640 ? 44 : 64;
              const offsetX = (pointer.x - 0.5) * -18;
              const offsetY = (pointer.y - 0.5) * -14;
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.07)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              for (let x = offsetX % gridGap; x < w; x += gridGap) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
              }
              for (let y = offsetY % gridGap; y < h; y += gridGap) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
              }
              ctx.stroke();

              const rx = w * pointer.x;
              const ry = h * pointer.y;
              const radarGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, Math.min(w, h) * 0.45);
              radarGrad.addColorStop(0, 'rgba(76, 10, 175, 0.22)');
              radarGrad.addColorStop(0.55, 'rgba(0, 240, 255, 0.05)');
              radarGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = radarGrad;
              ctx.fillRect(0, 0, w, h);

              const maxDist = Math.min(185, w * 0.24);
              for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                if (!reduceMotion) {
                  n.x = (n.x + n.vx + 1) % 1;
                  n.y = (n.y + n.vy + 1) % 1;
                }
                const px = n.x * w + offsetX * 0.4;
                const py = n.y * h + offsetY * 0.4;
                for (let j = i + 1; j < nodes.length; j++) {
                  const m = nodes[j];
                  const mx = m.x * w + offsetX * 0.4;
                  const my = m.y * h + offsetY * 0.4;
                  const d = Math.hypot(px - mx, py - my);
                  if (d < maxDist) {
                    const alpha = (1 - d / maxDist) * 0.24;
                    ctx.strokeStyle = n.cyan
                      ? `rgba(0, 240, 255, ${alpha})`
                      : `rgba(195, 160, 236, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(mx, my);
                    ctx.stroke();
                  }
                }
                const pulse = 0.55 + 0.45 * Math.sin(now * 0.002 + i);
                ctx.fillStyle = n.cyan
                  ? `rgba(0, 240, 255, ${0.42 * pulse})`
                  : `rgba(195, 160, 236, ${0.45 * pulse})`;
                ctx.beginPath();
                ctx.arc(px, py, n.r, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            if (!reduceMotion) introRaf = requestAnimationFrame(drawIntro);
          };

          const onIntroPointer = (e: PointerEvent) => {
            pointer.tx = e.clientX / Math.max(1, window.innerWidth);
            pointer.ty = e.clientY / Math.max(1, window.innerHeight);
          };
          const introObserver = new IntersectionObserver(
            entries => {
              introVisible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0.02 }
          );
          introObserver.observe(introSection);
          resizeIntro();
          window.addEventListener('resize', resizeIntro, { passive: true });
          window.addEventListener('pointermove', onIntroPointer, { passive: true });
          introRaf = requestAnimationFrame(drawIntro);

          cleanups.push(() => {
            cancelAnimationFrame(introRaf);
            introObserver.disconnect();
            window.removeEventListener('resize', resizeIntro);
            window.removeEventListener('pointermove', onIntroPointer);
          });
        }
      }

      // 2B. Founder portrait backdrop live telemetry FX canvas
      const founderCanvas = founderFxRef.current;
      const teamSection = document.getElementById('team');
      if (founderCanvas && teamSection) {
        const ctx = founderCanvas.getContext('2d');
        if (ctx) {
          let w = 0;
          let h = 0;
          let teamVisible = false;
          let founderRaf = 0;
          const sparks = Array.from({ length: 30 }, (_, i) => ({
            x: ((i * 53) % 100) / 100,
            y: ((i * 37) % 100) / 100,
            speed: 0.00035 + (i % 5) * 0.00012,
            size: 1.2 + (i % 3) * 0.75,
            cyan: i % 4 === 0,
          }));

          const resizeFounder = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = founderCanvas.clientWidth || window.innerWidth;
            h = founderCanvas.clientHeight || window.innerHeight;
            founderCanvas.width = Math.round(w * dpr);
            founderCanvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };

          const drawFounder = (now: number) => {
            if (disposed) return;
            if (teamVisible) {
              if (!w || !h) resizeFounder();
              ctx.clearRect(0, 0, w, h);

              const scanY = ((now * 0.04) % (h + 180)) - 90;
              const beam = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
              beam.addColorStop(0, 'transparent');
              beam.addColorStop(0.5, 'rgba(139, 92, 246, 0.14)');
              beam.addColorStop(1, 'transparent');
              ctx.fillStyle = beam;
              ctx.fillRect(0, scanY - 70, w, 140);

              sparks.forEach((s, idx) => {
                if (!reduceMotion) {
                  s.y = (s.y - s.speed + 1) % 1;
                }
                const px = s.x * w + Math.sin(now * 0.0008 + idx) * 14;
                const py = s.y * h;
                ctx.fillStyle = s.cyan ? 'rgba(0, 240, 255, 0.35)' : 'rgba(195, 160, 236, 0.38)';
                ctx.beginPath();
                ctx.arc(px, py, s.size, 0, Math.PI * 2);
                ctx.fill();
              });
            }
            if (!reduceMotion) founderRaf = requestAnimationFrame(drawFounder);
          };

          const teamObserver = new IntersectionObserver(
            entries => {
              teamVisible = entries[0]?.isIntersecting ?? false;
            },
            { threshold: 0.01 }
          );
          teamObserver.observe(teamSection);
          resizeFounder();
          window.addEventListener('resize', resizeFounder, { passive: true });
          founderRaf = requestAnimationFrame(drawFounder);

          cleanups.push(() => {
            cancelAnimationFrame(founderRaf);
            teamObserver.disconnect();
            window.removeEventListener('resize', resizeFounder);
          });
        }
      }

      // 2C. World Screen live animated domain telemetry canvas overlay
      const worldCanvas = worldVideoRef.current;
      if (worldCanvas) {
        const ctx = worldCanvas.getContext('2d');
        if (ctx) {
          let w = 0;
          let h = 0;
          let worldRaf = 0;

          const resizeWorld = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = worldCanvas.clientWidth || window.innerWidth;
            h = worldCanvas.clientHeight || window.innerHeight;
            worldCanvas.width = Math.round(w * dpr);
            worldCanvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };

          const drawWorld = (now: number) => {
            if (disposed) return;
            if (isWorldOpenRef.current) {
              if (!w || !h) resizeWorld();
              const world = WORLDS[activeWorldRef.current] || WORLDS[0];
              ctx.clearRect(0, 0, w, h);

              const cx = w > 750 ? w * 0.72 : w * 0.5;
              const cy = w > 750 ? h * 0.48 : h * 0.35;
              const rad = Math.max(w, h) * 0.55;

              const tSec = reduceMotion ? 0 : now * 0.001;
              for (let r = 1; r <= 5; r++) {
                const radius = r * (Math.min(w, h) * 0.11) + Math.sin(tSec + r) * 6;
                ctx.strokeStyle = world.accent;
                ctx.globalAlpha = 0.14 + (5 - r) * 0.03;
                ctx.lineWidth = r === 3 ? 1.8 : 1;
                ctx.beginPath();
                ctx.arc(cx, cy, Math.max(20, radius), 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.globalAlpha = 1;

              const angle = tSec * 0.65;
              ctx.strokeStyle = world.accent + '66';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
              ctx.stroke();

              ctx.beginPath();
              ctx.strokeStyle = world.accent + '55';
              ctx.lineWidth = 2;
              for (let x = 0; x <= w; x += 14) {
                const y =
                  h * 0.78 +
                  Math.sin(x * 0.014 + tSec * 2.1) * 26 +
                  Math.cos(x * 0.037 - tSec * 1.4) * 14;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
            if (!reduceMotion) worldRaf = requestAnimationFrame(drawWorld);
          };

          resizeWorld();
          window.addEventListener('resize', resizeWorld, { passive: true });
          worldRaf = requestAnimationFrame(drawWorld);

          cleanups.push(() => {
            cancelAnimationFrame(worldRaf);
            window.removeEventListener('resize', resizeWorld);
          });
        }
      }
    };

    // =========================================================================
    // 3. 7-TILE SERVICE-FX ENGINE (DESKTOP HOVER + MOBILE TOUCH SUPPORT)
    // =========================================================================
    const initServiceFx = () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.gg-svc__tile[data-fx]'));
      if (!cards.length) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      const glyphs = '▓▒░#%&@$0123456789ABCDEFXYZ';
      const random = (min: number, max: number) => min + Math.random() * (max - min);
      const stamp = (frames: number) => {
        const h = Math.floor(frames / 90000),
          m = Math.floor(frames / 1500) % 60;
        const s = Math.floor(frames / 25) % 60,
          f = frames % 25;
        return [h, m, s, f].map(n => String(n).padStart(2, '0')).join(':');
      };

      const split = (title: HTMLElement, breakAfterAmp = false) => {
        const text = title.textContent || '';
        title.setAttribute('aria-label', text);
        const letters: Node[] = [];
        let index = 0;
        for (const letter of text) {
          if (breakAfterAmp && letter === ' ' && text.slice(0, index).trimEnd().endsWith('&')) {
            index++;
            continue;
          }
          const span = document.createElement('span');
          span.className = 'gg-fx-ch';
          span.style.setProperty('--i', String(index));
          span.setAttribute('aria-hidden', 'true');
          span.textContent = letter;
          letters.push(span);
          if (breakAfterAmp && letter === '&') {
            const br = document.createElement('br');
            br.setAttribute('aria-hidden', 'true');
            letters.push(br);
          }
          index++;
        }
        title.replaceChildren(...letters);
        return text;
      };

      const deactivators: Array<() => void> = [];

      cards.forEach(card => {
        const fx = card.dataset.fx;
        const title = card.querySelector<HTMLElement>('.gg-svc__title');
        if (!title || !fx) return;
        const state: {
          running: boolean;
          raf: number;
          interval: number;
          timeout: number;
          start: number;
          count: number;
          original: string;
          clock?: HTMLElement;
          hearts?: HTMLElement;
          likes?: HTMLElement;
          score?: HTMLElement;
        } = {
          running: false,
          raf: 0,
          interval: 0,
          timeout: 0,
          start: 0,
          count: 1204,
          original: title.textContent || '',
        };

        const add = (className: string, parent: HTMLElement = card, text = '') => {
          const el = document.createElement('span');
          el.className = className;
          el.setAttribute('aria-hidden', 'true');
          el.textContent = text;
          parent.append(el);
          return el;
        };

        if (fx === 'film') {
          const hud = add('gg-fx-film-hud');
          add('gg-fx-rec', hud, 'REC');
          state.clock = add('gg-fx-time', hud, '00:00:00:00');
        }
        if (fx === 'social') {
          const original = title.textContent || '';
          title.setAttribute('aria-label', original);
          const visual = document.createElement('span');
          visual.className = 'gg-fx-social-track';
          visual.setAttribute('aria-hidden', 'true');
          add('gg-fx-social-line', visual, original);
          add('gg-fx-social-line gg-fx-social-alt', visual, original);
          title.append(visual);
          state.hearts = add('gg-fx-hearts');
          state.likes = add('gg-fx-likes', card, '⚡ 40+ OSINT');
        }
        if (fx === 'anim' || fx === 'ai' || fx === 'game') {
          state.original = split(title, fx === 'game');
        }
        if (fx === 'game') {
          const hud = add('gg-fx-game-hud');
          add('gg-fx-game-up', hud, '1UP');
          state.score = add('gg-fx-game-score', hud, 'SCORE 000000');
          add('gg-fx-game-start', card, '▶ PRESS START');
        }
        if (fx === 'drama') {
          add('gg-fx-spotlight');
          add('gg-fx-episode', card, 'SHA-256 · VERIFIED');
        }
        if (fx === 'cgi') add('gg-fx-grid');
        if (fx === 'ai') {
          const prompt = add('gg-fx-prompt', card, 'prompt: ./harden_fleet.sh --cron');
          add('gg-fx-caret', prompt, ' ▍');
        }

        const activate = () => {
          if (reduce.matches || state.running) return;
          state.running = true;
          state.start = performance.now();
          if (fx === 'game' && state.score) {
            let score = 0,
              steps = 0;
            state.score.textContent = 'SCORE 000000';
            const tick = () => {
              if (!state.running || reduce.matches || !state.score) return;
              if (steps < 12) {
                score += 100;
                steps++;
              } else score += 10;
              state.score.textContent = 'SCORE ' + String(score).padStart(6, '0');
              state.timeout = window.setTimeout(tick, steps < 12 ? 70 : 400);
            };
            state.timeout = window.setTimeout(tick, 70);
          }
          if (fx === 'film' && state.clock) {
            const tick = (now: number) => {
              if (!state.running || !state.clock) return;
              state.clock.textContent = stamp(Math.floor((now - state.start) / 40));
              state.raf = requestAnimationFrame(tick);
            };
            state.raf = requestAnimationFrame(tick);
          }
          if (fx === 'social' && state.hearts && state.likes) {
            const burst = () => {
              if (!state.running || !state.hearts || !state.likes) return;
              for (let i = 0; i < 3; i++) {
                const heart = add('gg-fx-heart', state.hearts, '◆');
                heart.style.left = random(55, 85) + '%';
                heart.style.setProperty('--dx', random(-25, 25) + 'px');
                heart.addEventListener('animationend', () => heart.remove(), { once: true });
              }
              state.count += Math.floor(random(1, 10));
              state.likes.textContent = '⚡ ' + state.count.toLocaleString();
            };
            burst();
            state.interval = window.setInterval(burst, 900);
          }
          if (fx === 'ai') {
            const letters = Array.from(title.querySelectorAll<HTMLElement>('.gg-fx-ch'));
            const original = Array.from(state.original);
            const tick = (now: number) => {
              if (!state.running) return;
              const progress = Math.min((now - state.start) / 900, 1);
              letters.forEach((el, i) => {
                const threshold = 0.25 + (i / Math.max(1, letters.length - 1)) * 0.75;
                const resolved = progress >= threshold || original[i] === ' ';
                el.textContent = resolved
                  ? original[i]
                  : glyphs[Math.floor(Math.random() * glyphs.length)];
                el.classList.toggle('gg-fx-noise', !resolved);
              });
              if (progress < 1) state.raf = requestAnimationFrame(tick);
            };
            state.raf = requestAnimationFrame(tick);
          }
        };

        const deactivate = () => {
          card.classList.remove('is-active');
          state.running = false;
          cancelAnimationFrame(state.raf);
          clearInterval(state.interval);
          clearTimeout(state.timeout);
          if (fx === 'film' && state.clock) state.clock.textContent = '00:00:00:00';
          if (fx === 'game' && state.score) state.score.textContent = 'SCORE 000000';
          if (fx === 'social' && state.hearts) state.hearts.replaceChildren();
          if (fx === 'ai') {
            const orig = Array.from(state.original);
            title.querySelectorAll<HTMLElement>('.gg-fx-ch').forEach((el, i) => {
              el.textContent = orig[i];
              el.classList.remove('gg-fx-noise');
            });
          }
          if (fx === 'cgi') {
            title.style.removeProperty('--rx');
            title.style.removeProperty('--ry');
          }
        };

        deactivators.push(deactivate);

        const onEnter = (e: PointerEvent) => {
          if (e.pointerType !== 'touch') activate();
        };
        const onLeave = (e: PointerEvent) => {
          if (e.pointerType !== 'touch') deactivate();
        };
        const onPointerDown = (e: PointerEvent) => {
          if (e.pointerType !== 'touch') return;
          const wasActive = card.classList.contains('is-active');
          deactivators.forEach(fn => fn());
          if (!wasActive) {
            card.classList.add('is-active');
            activate();
          }
        };
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (fx === 'drama') {
            card.style.setProperty('--mx', x + 'px');
            card.style.setProperty('--my', y + 'px');
          }
          if (fx === 'cgi' && !reduce.matches) {
            title.style.setProperty('--ry', (x / rect.width - 0.5) * 40 + 'deg');
            title.style.setProperty('--rx', (0.5 - y / rect.height) * 30 + 'deg');
          }
        };

        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointerleave', onLeave);
        card.addEventListener('pointerdown', onPointerDown);
        card.addEventListener('focusin', activate);
        card.addEventListener('focusout', deactivate);
        card.addEventListener('pointermove', onMove, { passive: true });

        cleanups.push(() => {
          deactivate();
          card.removeEventListener('pointerenter', onEnter);
          card.removeEventListener('pointerleave', onLeave);
          card.removeEventListener('pointerdown', onPointerDown);
          card.removeEventListener('focusin', activate);
          card.removeEventListener('focusout', deactivate);
          card.removeEventListener('pointermove', onMove);
        });
      });
    };

    // =========================================================================
    // 4. GRUBO-STYLE SCROLL REVEALS, COUNT-UP, PORTRAIT PARALLAX & FOOTER ADAPT
    // =========================================================================
    const initScrollIntegrations = () => {
      const revealTargets = document.querySelectorAll<HTMLElement>(
        [
          '#about .about-eyebrow',
          '#about #aboutTitle',
          '#about .about-grid p',
          '#about .about-links span',
          '#about .gg-svc__tile',
          '#insights .insights-eyebrow',
          '#insights #insightsTitle',
          '#insights .insights-intro',
          '#insights .article-card',
          '#insights .insights-bottom',
          '#team .team-eyebrow',
          '#team .team-heading h2',
          '#team .team-lead',
          '#team .team-kicker',
          '#team .team-profile h3',
          '#team .team-counter',
          '#team .team-bio',
          '#team .team-awards-label',
          '#team .team-award',
          '#team .team-note',
          '#team .founder-signature',
          '#contact .contact-heading',
          '#contact .contact-cta',
        ].join(',')
      );

      revealTargets.forEach((el, i) => {
        el.classList.add('motion-reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(i % 5, 4) * 65}ms`);
      });

      const observer = new IntersectionObserver(
        entries =>
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
      );
      revealTargets.forEach(t => observer.observe(t));
      cleanups.push(() => observer.disconnect());

      // Count-up animation for 20+ servers when #team enters view
      const counterEl = document.querySelector('#team .team-counter');
      let countStarted = false;
      let countRaf = 0;
      if (counterEl) {
        const countObserver = new IntersectionObserver(
          entries => {
            if (entries[0]?.isIntersecting && !countStarted) {
              countStarted = true;
              const start = performance.now();
              const duration = 1100;
              const step = (now: number) => {
                const p = Math.min(1, (now - start) / duration);
                const easedP = 1 - Math.pow(1 - p, 3);
                setServerCount(Math.round(easedP * 20));
                if (p < 1) countRaf = requestAnimationFrame(step);
              };
              countRaf = requestAnimationFrame(step);
              countObserver.disconnect();
            }
          },
          { threshold: 0.25 }
        );
        countObserver.observe(counterEl);
        cleanups.push(() => {
          cancelAnimationFrame(countRaf);
          countObserver.disconnect();
        });
      }

      const introSection = document.getElementById('intro');
      const teamSection = document.getElementById('team');
      const founderBar = document.getElementById('founderVideoProgress');
      const contactSection = document.getElementById('contact');

      const onScroll = () => {
        const vh = window.innerHeight || 1;
        if (introSection && introInnerRef.current) {
          const ir = introSection.getBoundingClientRect();
          const leaveFrac = Math.min(1, Math.max(0, -ir.top / Math.max(1, vh * 0.85)));
          introInnerRef.current.style.transform = `translate3d(0, ${(leaveFrac * -38).toFixed(1)}px, 0)`;
          introInnerRef.current.style.opacity = String(1 - leaveFrac * 0.72);
        }
        if (teamSection && founderBar) {
          const r = teamSection.getBoundingClientRect();
          const frac = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, r.height)));
          founderBar.style.width = (frac * 100).toFixed(2) + '%';
          if (founderImgRef.current) {
            const zoom = 1 + frac * 0.055;
            const shiftY = (frac - 0.5) * -14;
            founderImgRef.current.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${zoom.toFixed(3)})`;
          }
        }
        if (contactSection) {
          const r = contactSection.getBoundingClientRect();
          document.body.classList.toggle('is-contact', r.top <= 76 && r.bottom > 76);
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    };

    initWebGL();
    initLiveCanvases();
    initServiceFx();
    initScrollIntegrations();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanups.forEach(fn => fn());
      document.body.classList.remove(
        'is-intro',
        'is-about',
        'is-contact',
        'world-active',
        'world-transitioning',
        'world-exiting',
        'glyph-hover'
      );
    };
  }, []);

  const handleMobileNav = (targetSelector: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(targetSelector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <canvas
        id="scene"
        aria-label="Interactive 3D sculptural HACK lettering in three-dimensional space"
      />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* HACK SITE HEADER */}
      <header className={`site-header${mobileMenuOpen ? ' has-open-menu' : ''}`}>
        <a className="brand" href="#intro" aria-label="HACK — Alen Davis K home">
          <svg
            className="brand-hack-svg"
            viewBox="0 0 184 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* H */}
            <path d="M4 6H17V24H29V6H42V50H29V34H17V50H4V6Z" fill="currentColor" />
            {/* A */}
            <path
              d="M50 50V14C50 8.8 53.6 6 59 6H79C84.4 6 88 8.8 88 14V50H75V35H63V50H50ZM63 25H75V16H63V25Z"
              fill="currentColor"
            />
            {/* C */}
            <path
              d="M96 15C96 9.2 100.2 6 106 6H124C129.8 6 134 9.2 134 15V21H121V16H109V40H121V35H134V41C134 46.8 129.8 50 124 50H106C100.2 50 96 46.8 96 41V15Z"
              fill="currentColor"
            />
            {/* K */}
            <path d="M142 6H155V24L168 6H182L166 27L183 50H168L155 32V50H142V6Z" fill="currentColor" />
          </svg>
        </a>
        <p className="manifest">
          WE TURN
          <br />
          RAW TELEMETRY &amp; LOGS
          <br />
          INTO RESILIENT DEFENSE.
        </p>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#work">WORK</a>
          <a href="#about">CAPABILITIES</a>
          <a href="#insights">PROJECTS</a>
          <a href="#team">ABOUT ME</a>
          <button type="button" className="nav-action-btn" onClick={onOpenResume}>
            RESUME
          </button>
          <a className="contact-nav" href="#contact">
            CONTACT ↗
          </a>
          <div className="lang-selector">
            <button
              type="button"
              className="lang-toggle"
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Ctrl+K)"
            >
              ⌘K <span aria-hidden="true">⌄</span>
            </button>
          </div>
          <button
            type="button"
            className="nav-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </nav>
      </header>

      {/* RESPONSIVE MOBILE NAVIGATION DRAWER */}
      <div
        className={`mobile-nav-drawer${mobileMenuOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-drawer__inner">
          <div className="mobile-nav-drawer__eyebrow">ALEN DAVIS K // HACK NAVIGATION</div>
          <div className="mobile-nav-drawer__links">
            <button type="button" onClick={() => handleMobileNav('#intro')}>
              <span>00</span> HOME
            </button>
            <button type="button" onClick={() => handleMobileNav('#work')}>
              <span>01</span> 3D SECURITY DOMAINS
            </button>
            <button type="button" onClick={() => handleMobileNav('#about')}>
              <span>02</span> CAPABILITIES
            </button>
            <button type="button" onClick={() => handleMobileNav('#insights')}>
              <span>03</span> PROJECTS
            </button>
            <button type="button" onClick={() => handleMobileNav('#team')}>
              <span>04</span> ABOUT ALEN
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResume();
              }}
            >
              <span>05</span> RESUME PDF
            </button>
            <button type="button" onClick={() => handleMobileNav('#contact')}>
              <span>06</span> CONTACT ↗
            </button>
          </div>
        </div>
      </div>

      {/* VIEWPORT UI FOR 3D LETTER SCROLL TRACK (H - A - C - K) */}
      <div className="viewport-ui">
        <div className="chapter right" id="chapter">
          <div className="chapter-index" id="chapterIndex">
            01 / 04
          </div>
          <div className="chapter-rule" />
          <h1 id="chapterTitle">SIEM LAB</h1>
          <p id="chapterDesc">
            Splunk Enterprise, Universal Forwarder &amp; Sysmon correlation across Windows &amp;
            Linux.
          </p>
          <button id="enter" className="chapter-enter" aria-label="Explore security domain">
            ↗
          </button>
        </div>
        <div className="scroll-hint">
          <span>SCROLL TO EXPLORE</span>
          <span className="line" />
        </div>
        <div className="studio-credit">
          SOC ANALYST L1
          <br />
          &amp; LINUX SYSTEM ENGINEER
        </div>
        <div className="page-progress">
          <span id="progress" />
        </div>
      </div>

      <main className="hack-main">
        {/* 1. INTRO SECTION WITH LIVE CYBER MESH & KINETIC ENTRANCE */}
        <section className="intro" id="intro" aria-labelledby="introHeadline">
          <canvas className="intro-bg-canvas" ref={introCanvasRef} aria-hidden="true" />
          <div className="intro-orbit" aria-hidden="true" />
          <div className="intro-inner" ref={introInnerRef}>
            <div className="intro-label hack-intro-anim hack-delay-1">
              <span>CYBERSECURITY &amp; LINUX ENGINEER</span> <b>/</b>{' '}
              <span>THRISSUR, KERALA, INDIA</span>
            </div>
            <h1 id="introHeadline">
              <span className="hero-line-mask">
                <span className="hero-line-inner hack-delay-2">I DON&apos;T</span>
              </span>
              <span className="hero-line-mask">
                <span className="hero-line-inner hack-delay-3">
                  MISS <em>THREATS.</em>
                </span>
              </span>
            </h1>
            <div className="intro-bottom hack-intro-anim hack-delay-4">
              <p>
                Splunk SIEM. Linux Servers. Digital Forensics. SHA-256 FIM. ESP32 Hardware.
                <br />
                Whatever the attack surface, I lock it down — <strong>ALEN DAVIS K.</strong>
              </p>
              <a
                href="#work"
                className="explore-link"
                aria-label="Explore interactive 3D security domains"
              >
                <span>SCROLL TO EXPLORE</span> <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="intro-line" aria-hidden="true" />
        </section>

        {/* 2. 3D HACK GLYPH SCROLL TRACK */}
        <div
          className="scroll-area"
          id="work"
          aria-label="Scroll to move through the four 3D HACK security chapters"
        />

        {/* 3. ABOUT & 7-TILE INTERACTIVE SERVICE-FX GRID */}
        <section className="about" id="about" aria-labelledby="aboutTitle">
          <div className="about-eyebrow">NOT JUST TEXTBOOK THEORY.</div>
          <h2 id="aboutTitle">
            DEFENSE
            <br />
            COMES <i>FIRST.</i>
          </h2>
          <div className="about-grid">
            <p>
              I don&apos;t start with buzzwords. I start with what happens on the wire and in the
              logs:{' '}
              <strong>
                how do Linux servers, networks, and authentication events behave under real
                pressure?
              </strong>
            </p>
            <p>
              From triaging 15+ seized devices at the Police Cyber Cell to administering 20+
              production servers at HashRoot and engineering custom SPL detection rules in Splunk, I
              build security that holds up in the field.
            </p>
          </div>
          <div className="about-links" aria-label="Core competencies">
            <span>SPLUNK SIEM &amp; SPL</span>
            <span>LINUX SERVER ADMIN</span>
            <span>DIGITAL FORENSICS &amp; OSINT</span>
            <span>PYTHON &amp; BASH AUTOMATION</span>
            <span>VAPT &amp; ESP32 HARDWARE</span>
          </div>

          <div className="gg-svc" aria-label="Cybersecurity & Engineering Capabilities">
            <div className="gg-svc__grid">
              <div className="gg-svc__tile" data-fx="film" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">01</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">Splunk SIEM &amp; SOC</h3>
                  <p className="gg-svc__desc">
                    Ingesting Windows Event Logs (4625/4624), Sysmon telemetry, and Linux auth logs
                    via Universal Forwarder with custom SPL correlation searches and real-time
                    brute-force alerts.
                  </p>
                  <p className="gg-svc__tags">Splunk Enterprise · SPL · Sysmon · Event 4625/4624</p>
                </div>
              </div>

              <div className="gg-svc__tile" data-fx="social" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">02</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">Forensics &amp; OSINT</h3>
                  <p className="gg-svc__desc">
                    Digital evidence acquisition and forensic triage across 15+ seized devices at
                    Police Cyber Cell, OSINT tracing of 40+ phishing domains, and Section 65B IT Act
                    reporting.
                  </p>
                  <p className="gg-svc__tags">15+ Devices · 40+ Phishing Domains · Section 65B</p>
                </div>
              </div>

              <div className="gg-svc__tile" data-fx="anim" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">03</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">Linux Administration</h3>
                  <p className="gg-svc__desc">
                    Administering 20+ Ubuntu, CentOS, and Windows Server instances at HashRoot.
                    User/group IAM, SSH hardening, firewall policies, and 15+ node availability
                    monitoring.
                  </p>
                  <p className="gg-svc__tags">Ubuntu · CentOS · Windows AD · SSH Hardening</p>
                </div>
              </div>

              <div className="gg-svc__tile" data-fx="drama" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">04</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">SHA-256 File Integrity</h3>
                  <p className="gg-svc__desc">
                    Cryptographic file integrity monitoring utility built in Python using hashlib
                    (SHA-256 &amp; MD5) to baseline critical system directories and alert on
                    unauthorized tampering.
                  </p>
                  <p className="gg-svc__tags">Python 3 · hashlib SHA-256 · MD5 · Baseline FIM</p>
                </div>
              </div>

              <div className="gg-svc__tile" data-fx="cgi" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">05</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">ESP32 &amp; RFID Security</h3>
                  <p className="gg-svc__desc">
                    Hardware-level physical access control system interfacing an ESP32
                    microcontroller with an MFRC522 13.56MHz RFID reader over SPI in Embedded C/C++.
                  </p>
                  <p className="gg-svc__tags">ESP32 · MFRC522 RFID · SPI · Embedded C/C++</p>
                </div>
              </div>

              <div className="gg-svc__tile" data-fx="game" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">06</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">
                    VAPT &amp;
                    <br />
                    NETWORKS
                  </h3>
                  <p className="gg-svc__desc">
                    Packet analysis and vulnerability assessment with Wireshark, Nmap, Burp Suite,
                    and Metasploit (ADCD v3), plus routers, managed switches, and Layer 1–3 fault
                    isolation.
                  </p>
                  <p className="gg-svc__tags">Wireshark · Nmap · Burp Suite · Metasploit</p>
                </div>
              </div>

              <div className="gg-svc__tile gg-svc__tile--accent" data-fx="ai" tabIndex={0}>
                <div className="gg-svc__top">
                  <span className="gg-svc__num">07 · 60% Less Toil</span>
                  <span className="gg-svc__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="gg-svc__body">
                  <h3 className="gg-svc__title">Bash &amp; Cron Automation</h3>
                  <p className="gg-svc__desc">
                    Authored automated Bash and Cron daemons for log rotation, backups, and health
                    checks at HashRoot—reducing manual server maintenance tasks by 60%.
                  </p>
                  <p className="gg-svc__tags">Bash Scripting · Cron · Systemd · Log Rotation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURED PROJECTS SECTION */}
        <section className="insights" id="insights" aria-labelledby="insightsTitle">
          <div className="insights-header">
            <div>
              <div className="insights-eyebrow">ENGINEERED SYSTEMS &amp; LABS / 03</div>
              <h2 id="insightsTitle">
                BUILT &amp; <em>DEPLOYED.</em>
              </h2>
            </div>
            <p className="insights-intro">
              Three real-world security engineering builds spanning enterprise SIEM correlation,
              cryptographic file integrity, and embedded hardware access control.
            </p>
          </div>

          <div className="article-grid" id="articleGrid">
            {projects.map((p, idx) => (
              <article className="article-card" key={p.id}>
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                  <div className="article-count">
                    <span>0{idx + 1} / 03</span>
                    <span>{p.illustrationType.toUpperCase()}</span>
                  </div>
                  <div className="article-card-graphic" aria-hidden="true">
                    <img
                      className="article-card-photo"
                      src={PROJECT_PREVIEW_PHOTOS[p.illustrationType]}
                      alt=""
                      loading="lazy"
                    />
                    <span>{p.index}</span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>
                    {p.built} ({p.stack.join(' · ')})
                  </p>
                  <div className="article-bottom">
                    <span>VIEW GITHUB REPOSITORY</span>
                    <span className="arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                </a>
              </article>
            ))}
          </div>

          <div className="insights-bottom">
            <span>All source code and lab configurations documented on GitHub.</span>
            <a href={identity.githubUrl} target="_blank" rel="noopener noreferrer">
              EXPLORE GITHUB ({identity.githubUrl.replace('https://', '')}) ↗
            </a>
          </div>
        </section>

        {/* 5. FOUNDER CINEMATIC SECTION — CLEAN LEFT CUTOUT PORTRAIT + RIGHT BIO */}
        <section className="team founder-cinematic" id="team" aria-labelledby="teamTitle">
          <div className="founder-backdrop" aria-hidden="true">
            <div className="founder-studio-halo" />
            <canvas className="founder-fx-canvas" ref={founderFxRef} aria-hidden="true" />
            <div className="founder-portrait-stage">
              <img
                ref={founderImgRef}
                className="founder-scroll-video"
                src={cutoutUrl}
                alt={identity.fullName}
              />
            </div>
            <div className="founder-video-shade" />
            <div className="founder-video-progress">
              <span id="founderVideoProgress" />
            </div>
          </div>

          <div className="founder-content">
            <div className="team-heading">
              <div className="team-eyebrow">THE ENGINEER BEHIND THE CONSOLE / 01</div>
              <h2 id="teamTitle">
                SECURITY IS
                <br />
                <em>HUMAN.</em>
              </h2>
              <p className="team-lead">{PORTFOLIO_CONTENT.about.statement}</p>
            </div>

            <div className="team-grid">
              <div className="team-profile">
                <div className="team-kicker">SOC ANALYST L1 &amp; LINUX SYSTEM ENGINEER</div>
                <h3>
                  {identity.fullName}
                  <span className="team-dot">.</span>
                </h3>
                <div className="team-counter">
                  <strong>
                    {serverCount}
                    <span>+</span>
                  </strong>
                  <span>LINUX &amp; WINDOWS SERVERS ADMINISTERED AT HASHROOT</span>
                </div>
                <p className="team-bio">
                  B.Sc. in Computer Science graduate from Sahrdaya College of Advanced Studies,
                  Kodakara, trained in Advanced Diploma in Cyber Defence (ADCD v3) at Red Team
                  Hackers Academy, Thrissur.
                </p>
                <p className="team-bio team-bio-second">
                  Hands-on experience across law enforcement digital forensics at the Police Cyber
                  Cell, multi-distro Linux &amp; Windows Server administration at HashRoot, and IP
                  surveillance network engineering at DNS Solutions.
                </p>
                <div className="team-awards">
                  <div className="team-awards-label">EXPERIENCE &amp; CREDENTIALS</div>
                  <div className="team-award">
                    <span>01</span>
                    <p>
                      <strong>Cyber Security Intern — Police Cyber Cell (Thrissur):</strong>{' '}
                      Forensically triaged 15+ seized devices, analyzed 40+ phishing domains via
                      OSINT, and prepared Section 65B IT Act reports.
                    </p>
                  </div>
                  <div className="team-award">
                    <span>02</span>
                    <p>
                      <strong>Server Administrator Intern — HashRoot (Kochi):</strong> Administered
                      20+ Ubuntu, CentOS &amp; Windows Server instances and reduced manual toil by
                      60% via Bash &amp; Cron scripts.
                    </p>
                  </div>
                  <div className="team-award">
                    <span>03</span>
                    <p>
                      <strong>CCTV &amp; Networking Administrator — DNS Solutions:</strong>{' '}
                      Configured NVR/DVR systems, routers, managed switches, subnetting, and Layer
                      1–3 fault isolation.
                    </p>
                  </div>
                  <div className="team-award">
                    <span>04</span>
                    <p>
                      <strong>Certifications:</strong> ADCD v3 Cyber Defence · Splunk Core Certified
                      User (Lab Trained) · Trazada Cyber Forensic Workshop · Seasides Cyber Security
                      Conference (Goa).
                    </p>
                  </div>
                  <p className="team-note">
                    Based in {identity.location} · Open to SOC Analyst L1, Cybersecurity &amp; Linux
                    System Engineering roles.
                  </p>
                </div>
              </div>
            </div>

            <div className="founder-signature">
              <span>ALEN DAVIS K / CYBER DEFENSE &amp; LINUX ENGINEERING</span>
              <div className="founder-social" aria-label="Social & Resume profiles">
                <a
                  className="social-icon"
                  aria-label="GitHub — Alen Davis K"
                  title="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={identity.githubUrl}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a
                  className="social-icon"
                  aria-label="Email — Alen Davis K"
                  title="Email"
                  href={`mailto:${identity.email}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>
                <button
                  type="button"
                  className="social-icon"
                  aria-label="Open Resume PDF Modal"
                  title="Resume"
                  onClick={onOpenResume}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BRUTALIST PAPER CONTACT FOOTER */}
        <footer className="contact" id="contact" aria-labelledby="contactTitle">
          <div className="contact-heading" id="contactTitle">
            LET&apos;S LOCK IT
            <br />
            <em>DOWN.</em>
          </div>
          <div className="contact-links">
            <a href={`mailto:${identity.email}`} className="contact-cta contact-cta-email">
              <span>{identity.email}</span>
              <svg
                className="contact-cta-arrow"
                viewBox="0 0 32 32"
                width="31"
                height="31"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M7 25L25 7M10 7h15v15"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </a>
            <a
              href={identity.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-cta contact-cta-github"
            >
              <span>{identity.githubUrl.replace('https://', '')}</span>
              <svg
                className="contact-cta-arrow"
                viewBox="0 0 32 32"
                width="31"
                height="31"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M7 25L25 7M10 7h15v15"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </a>
          </div>
          <div className="contact-bottom">
            <span>ALEN DAVIS K / SOC ANALYST &amp; LINUX SYSTEM ENGINEER · THRISSUR, KERALA</span>
            <a href="#intro">BACK TO TOP ↑</a>
            <span>© 2026 ALEN DAVIS K</span>
          </div>
        </footer>
      </main>

      {/* WORLD-SCREEN OVERLAY WITH REALISTIC PHOTO + LIVE TELEMETRY CANVAS */}
      <div
        className="world-screen has-trailer-video"
        id="worldScreen"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-label="Security domain deep dive"
      >
        <img
          className="world-photo-bg"
          src={activeWorldPhoto}
          alt=""
          aria-hidden="true"
        />
        <canvas className="world-video" ref={worldVideoRef} aria-hidden="true" />
        <div className="world-video-shade" aria-hidden="true" />
        <div className="world-ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="world-body">
          <div className="world-number" id="overlayIndex">
            01 / 04 · GLYPH [H]
          </div>
          <h2 id="overlayTitle">THREATS CAUGHT LIVE.</h2>
          <p id="overlayDesc">{WORLDS[0].trailerDesc}</p>
          <p id="overlayStack" className="world-stack">
            {WORLDS[0].stack}
          </p>
        </div>
        <div className="world-footer">
          <span>ALEN DAVIS K // HACK SECURITY DOMAINS</span>
          <span className="world-placeholder">PRESS ESC OR CLOSE TO RETURN TO 3D SCENE</span>
          <span id="worldTime">00:15</span>
        </div>
        <div className="world-progress">
          <span id="worldProgress" />
        </div>
      </div>

      <button
        className="world-close"
        id="close"
        type="button"
        aria-label="Back to 3D letters — Escape"
      >
        CLOSE <span aria-hidden="true">×</span>
      </button>
    </>
  );
};

export const GruboPortfolio = HackPortfolio;
export default HackPortfolio;
