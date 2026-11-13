import * as THREE from 'three';

/**
 * RiverScene: Interactive 3D night-river festival scene inspired by TemplateMo 634 Lantern River.
 * Features:
 * - Scroll-scrubbed river journey (Launch Steps -> Covered Bridge -> Lantern Market -> Sampan Pier -> Fireworks Bend -> Wishing Pier)
 * - Free Drift mode with WASD / Arrow key steering, Shift boost, and live km/h speedometer
 * - 7 switchable lantern designs (Lotus, Peony, Star, Bud, Paper Box, Golden Festival, Chain)
 * - Interactive water ripples on canvas click & sky-wish lantern launches
 * - Procedural fireworks at Fireworks Bend and on wish submission
 */

export const RIVER_LENGTH = 300;
const HORIZON_HEX = 0x071a1d;
const WARM = ['#ffb300', '#ffe082', '#ff8f00', '#e2553f', '#ffd27a', '#7ccfb0'];

interface Burst {
  points: THREE.Points;
  vel: Float32Array;
  age: number;
  life: number;
}

interface ClickRipple {
  mesh: THREE.Mesh;
  age: number;
  life: number;
}

interface WishLantern {
  group: THREE.Group;
  vy: number;
  vx: number;
  vz: number;
  age: number;
}

const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

class LightLayer {
  pos: number[] = [];
  col: number[] = [];
  add(x: number, y: number, z: number, hex: string, k = 1) {
    const c = new THREE.Color(hex);
    this.pos.push(x, y, z);
    this.col.push(c.r * k, c.g * k, c.b * k);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    return g;
  }
}

export class RiverScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private glowTex: THREE.CanvasTexture;
  private rng = mulberry(634);

  private lantern = new THREE.Group();
  private lanternMeshGroup = new THREE.Group();
  private halo!: THREE.Sprite;
  private rings: THREE.Mesh[] = [];
  private clickRipples: ClickRipple[] = [];
  private wishLanterns: WishLantern[] = [];
  private waterMat!: THREE.ShaderMaterial;
  private waterMesh!: THREE.Mesh;
  private sky!: THREE.Mesh;

  private floaterGeo!: THREE.BufferGeometry;
  private floaterBase: Float32Array = new Float32Array(0);
  private skyLanternGeo!: THREE.BufferGeometry;
  private skyLanternSpeed: Float32Array = new Float32Array(0);

  private bursts: Burst[] = [];
  private lastBurst = 0;

  private targetP = 0;
  private curP = 0;
  private zone = 0;
  private sideTarget = 0;
  private side = 0;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private free = false;
  private freeX = 0;
  private freeZ = 0;
  private freeVx = 0;
  private freeVz = 0;
  private speedKmh = 0;
  private boosting = false;
  private designIndex = 0;
  private speedMult = 1;
  private keys: Record<string, boolean> = {};
  private joyVec = { x: 0, y: 0 };

  private portrait = false;
  private reduced: boolean;
  private onSpeedChange?: (kmh: number, boost: boolean) => void;
  private raycaster = new THREE.Raycaster();

  private visibilityHandler = () => {
    if (document.hidden) this.pause();
    else if (this.wantRun) this.start();
  };
  private wantRun = false;

  constructor(
    private canvas: HTMLCanvasElement,
    reduced = false,
    onSpeedChange?: (kmh: number, boost: boolean) => void
  ) {
    this.reduced = reduced;
    this.onSpeedChange = onSpeedChange;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.scene.background = new THREE.Color(HORIZON_HEX);
    this.scene.fog = new THREE.FogExp2(HORIZON_HEX, 0.011);
    this.camera = new THREE.PerspectiveCamera(56, 1, 0.1, 900);
    this.glowTex = this.makeGlow();

    this.buildSky();
    this.buildWater();
    this.buildBanks();
    this.buildLights();
    this.buildStructures();
    this.buildFloaters();
    this.buildLantern();

    this.resize();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /* ------------------------------ public API ------------------------------ */

  setProgress(p: number) {
    this.targetP = Math.max(0, Math.min(1, p));
  }
  getProgress() {
    return this.curP;
  }
  setZone(zone: number, side: number) {
    this.zone = zone;
    this.sideTarget = side;
  }
  setMouse(x: number, y: number) {
    this.mouse.tx = x;
    this.mouse.ty = y;
  }
  setKey(code: string, down: boolean) {
    this.keys[code] = down;
  }
  setJoystick(x: number, y: number) {
    this.joyVec.x = x;
    this.joyVec.y = y;
  }
  setFree(on: boolean) {
    this.free = on;
    if (on) {
      this.freeZ = -this.curP * RIVER_LENGTH;
      this.freeX = Math.sin(this.freeZ * 0.045) * 1.3 + Math.sin(this.freeZ * 0.11) * 0.3;
      this.freeVx = 0;
      this.freeVz = -1.5;
    } else {
      this.curP = Math.max(0, Math.min(1, -this.lantern.position.z / RIVER_LENGTH));
      this.targetP = this.curP;
      this.keys = {};
    }
  }
  setLanternDesign(index: number) {
    this.designIndex = index;
    const speeds = [1.0, 1.0, 1.25, 1.0, 0.8, 1.65, 1.3];
    this.speedMult = speeds[index] ?? 1.0;
    this.populateLanternShape(index);
    this.spawnRippleAt(this.lantern.position.x, this.lantern.position.z, 0xffd27a);
  }
  clickWater(clientX: number, clientY: number): boolean {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.waterMesh);
    if (hits.length > 0) {
      const pt = hits[0].point;
      this.spawnRippleAt(pt.x, pt.z, 0xffe082);
      return true;
    }
    return false;
  }
  spawnRippleAt(x: number, z: number, hex = 0xffc66b) {
    for (let i = 0; i < 2; i++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.25, 0.34, 48),
        new THREE.MeshBasicMaterial({
          color: hex,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          fog: false,
        })
      );
      r.rotation.x = -Math.PI / 2;
      r.position.set(x, 0.035, z);
      this.scene.add(r);
      this.clickRipples.push({ mesh: r, age: -i * 0.18, life: 1.8 });
    }
  }
  releaseSkyWish(colorHex = '#FFB300') {
    const g = new THREE.Group();
    const col = new THREE.Color(colorHex);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, 0.42, 14),
      new THREE.MeshBasicMaterial({ color: col })
    );
    body.position.y = 0.25;
    g.add(body);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTex,
        color: col,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    sprite.scale.set(2.2, 2.2, 1);
    sprite.position.y = 0.22;
    g.add(sprite);

    g.position.set(
      this.lantern.position.x + (Math.random() - 0.5) * 0.8,
      0.5,
      this.lantern.position.z - 0.6
    );
    this.scene.add(g);
    this.wishLanterns.push({
      group: g,
      vy: 1.45 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.35,
      vz: -0.6 - Math.random() * 0.4,
      age: 0,
    });
    this.spawnRippleAt(this.lantern.position.x, this.lantern.position.z, col.getHex());
  }
  captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }
  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.portrait = w < 820 || w / h < 0.9;
    this.camera.fov = this.portrait ? 66 : 56;
    this.camera.updateProjectionMatrix();
  }
  burst(color: string | number, nearLantern = false) {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const lx = this.lantern.position.x;
    const lz = this.lantern.position.z;
    const ox = lx + (nearLantern ? this.rand(-3, 3) : this.rand(-9, 9));
    const oy = this.rand(6.5, 12);
    const oz = lz - this.rand(14, 30);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = ox;
      pos[i * 3 + 1] = oy;
      pos[i * 3 + 2] = oz;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const sp = this.rand(3.5, 7);
      vel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
      vel[i * 3 + 1] = Math.cos(ph) * sp;
      vel[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      size: 0.7,
      map: this.glowTex,
      color,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const points = new THREE.Points(g, m);
    points.frustumCulled = false;
    this.scene.add(points);
    this.bursts.push({ points, vel, age: 0, life: 2.4 });
  }
  start() {
    this.wantRun = true;
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.raf = requestAnimationFrame(loop);
  }
  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  dispose() {
    this.wantRun = false;
    this.pause();
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.scene.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach(x => x.dispose());
      else if (mat) mat.dispose();
    });
    this.glowTex.dispose();
    this.renderer.dispose();
  }

  /* ------------------------------ helpers ------------------------------ */

  private rand(a: number, b: number) {
    return a + this.rng() * (b - a);
  }

  private makeGlow() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.22, 'rgba(255,255,255,.6)');
    gr.addColorStop(0.55, 'rgba(255,255,255,.14)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  private pointsMat(size: number, opacity = 1) {
    return new THREE.PointsMaterial({
      size,
      map: this.glowTex,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
  }

  private basic(hex: number) {
    return new THREE.MeshBasicMaterial({ color: hex });
  }

  /* ------------------------------ build ------------------------------ */

  private buildSky() {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        varying vec3 vP;
        void main(){
          vec3 n = normalize(vP);
          float h = n.y;
          vec3 hor = vec3(.027,.102,.114);
          vec3 zen = vec3(.010,.035,.048);
          vec3 col = mix(hor, zen, smoothstep(0., .75, h));
          float warm = pow(max(0., 1. - abs(h) * 2.6), 3.) * smoothstep(0.1, -1., n.z);
          col += vec3(.34,.18,.06) * warm;
          if (h < 0.) col = hor;
          gl_FragColor = vec4(col, 1.);
        }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), mat);
    this.sky.renderOrder = -10;
    this.scene.add(this.sky);

    const n = 900;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = this.rng() * Math.PI * 2;
      const y = 0.08 + this.rng() * 0.92;
      const r = Math.sqrt(1 - y * y);
      p[i * 3] = Math.cos(th) * r * 420;
      p[i * 3 + 1] = y * 420;
      p[i * 3 + 2] = Math.sin(th) * r * 420;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const stars = new THREE.Points(
      sg,
      new THREE.PointsMaterial({
        size: 1.7,
        sizeAttenuation: false,
        color: 0xe8f4f2,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        fog: false,
      })
    );
    this.sky.add(stars);

    const moonMat = new THREE.SpriteMaterial({
      map: this.glowTex,
      color: 0xfff8e1,
      transparent: true,
      depthWrite: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(moonMat);
    halo.position.set(-110, 150, -360);
    halo.scale.set(150, 150, 1);
    halo.material.opacity = 0.35;
    this.sky.add(halo);
    const moon = new THREE.Sprite(moonMat.clone());
    moon.position.copy(halo.position);
    moon.scale.set(30, 30, 1);
    moon.material.opacity = 1;
    this.sky.add(moon);
  }

  private buildWater() {
    this.waterMat = new THREE.ShaderMaterial({
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uLantern: { value: new THREE.Vector3() },
        uHorizon: { value: new THREE.Color(HORIZON_HEX) },
      },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `
        varying vec3 vW;
        uniform float uTime; uniform vec3 uLantern; uniform vec3 uHorizon;
        float ripple(vec2 p){
          return sin(p.x*1.7 + uTime*.8 + sin(p.y*.9))
               + sin(p.y*.55 - uTime*.6 + p.x*.8)*.7
               + sin((p.x+p.y)*2.3 + uTime*1.3)*.4;
        }
        void main(){
          vec2 p = vW.xz;
          float r = ripple(p)*.33 + .5;
          vec3 deep = vec3(.018,.055,.068);
          vec3 mid  = vec3(.042,.120,.136);
          vec3 col = mix(deep, mid, r*.65);
          vec3 V = normalize(cameraPosition - vW);
          float fres = pow(1. - max(V.y, 0.), 3.);
          col = mix(col, vec3(.07,.18,.20), fres*.55);
          float d = distance(p, uLantern.xz);
          float glow = exp(-d*d*.045);
          col += vec3(1.,.68,.18) * glow * (.45 + .55*r) * .85;
          float dx = p.x - uLantern.x;
          float streak = exp(-dx*dx*1.6) * exp(-abs(p.y - uLantern.z - 3.)*.09);
          float shimmer = .5 + .5*sin(p.y*7. - uTime*2.2 + dx*3.);
          col += vec3(1.,.76,.28) * streak * (.12 + .28*shimmer);
          float dist = length(cameraPosition - vW);
          col = mix(col, uHorizon, 1. - exp(-dist*dist*.00012));
          gl_FragColor = vec4(col, 1.);
        }`,
    });
    this.waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 440), this.waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, 0, -150);
    this.scene.add(this.waterMesh);
  }

  private buildBanks() {
    const groundMat = this.basic(0x051215);
    for (const s of [-1, 1]) {
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 440), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(s * (8.2 + 45), 0.3, -150);
      this.scene.add(ground);

      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 440), this.basic(0x0a1e22));
      wall.position.set(s * 8.6, -0.05, -150);
      this.scene.add(wall);
    }

    const hillMat = this.basic(0x041013);
    for (let i = 0; i < 26; i++) {
      const s = i % 2 === 0 ? -1 : 1;
      const h = this.rand(18, 46);
      const hill = new THREE.Mesh(new THREE.ConeGeometry(this.rand(18, 34), h, 6), hillMat);
      hill.position.set(s * this.rand(48, 110), h / 2 - 2, -this.rand(-20, 340));
      this.scene.add(hill);
    }
  }

  private buildLights() {
    const small = new LightLayer();
    const big = new LightLayer();

    const boxes: Array<{ x: number; y: number; z: number; w: number; h: number; d: number; s: number }> = [];
    for (const s of [-1, 1]) {
      let z = 16;
      while (z > -345) {
        const w = this.rand(3, 4.4);
        const h = this.rand(2.6, 5.2);
        const d = this.rand(3.6, 5);
        const x = s * (10.2 + w / 2 + this.rand(0, 1.2));
        boxes.push({ x, y: 0.3 + h / 2, z, w, h, d, s });

        const faceX = s * (Math.abs(x) - w / 2) - s * 0.04;
        const wins = 2 + Math.floor(this.rng() * 3);
        for (let k = 0; k < wins; k++) {
          small.add(
            faceX,
            0.3 + this.rand(0.9, Math.max(1.2, h - 0.5)),
            z + this.rand(-d / 2 + 0.6, d / 2 - 0.6),
            WARM[Math.floor(this.rng() * WARM.length)],
            this.rand(0.55, 1)
          );
        }
        big.add(faceX, 1.1, z + this.rand(-1, 1), WARM[Math.floor(this.rng() * 4)], 0.9);
        z -= this.rand(6.2, 8.8);
      }
    }

    const houseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const houses = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), houseMat, boxes.length);
    const roofGeo = new THREE.ConeGeometry(0.72, 1, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofs = new THREE.InstancedMesh(roofGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), boxes.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    boxes.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      houses.setMatrixAt(i, m);
      houses.setColorAt(i, c.setHSL(0.52, 0.35, 0.05 + this.rng() * 0.05));
      const rh = 0.9 + this.rng() * 0.8;
      m.compose(
        new THREE.Vector3(b.x, 0.3 + b.h + rh / 2, b.z),
        q,
        new THREE.Vector3(b.w * 1.04, rh, b.d * 1.04)
      );
      roofs.setMatrixAt(i, m);
      roofs.setColorAt(i, c.setHSL(0.06, 0.28, 0.06 + this.rng() * 0.04));
    });
    this.scene.add(houses, roofs);

    for (const s of [-1, 1]) {
      for (let z = 10; z > -340; z -= 7) {
        big.add(s * 8.9, 1.5, z + this.rand(-1, 1), '#ffcf6b', 0.9);
      }
    }

    const garlandZ: number[] = [];
    for (let z = -12; z > -320; z -= 22) garlandZ.push(z);
    for (let z = -92; z > -150; z -= 7) garlandZ.push(z);
    garlandZ.forEach(z => {
      for (let x = -8.2; x <= 8.21; x += 1.15) {
        const y = 4.6 - 1.3 * (1 - (x / 8.2) * (x / 8.2));
        big.add(x, y, z, WARM[Math.floor(this.rng() * WARM.length)], this.rand(0.7, 1));
      }
    });

    this.finishLights(small, big);
  }

  private buildStructures() {
    const small = new LightLayer();
    const big = new LightLayer();
    const wood = this.basic(0x1b1412);
    const roofMat = this.basic(0x281c18);

    const bridge = (z: number) => {
      const g = new THREE.Group();
      const deck = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 3.4), wood);
      deck.position.y = 3.1;
      g.add(deck);
      for (let x = -8.5; x <= 8.51; x += 2.4) {
        for (const dz of [-1.5, 1.5]) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.5, 0.28), wood);
          post.position.set(x, 3.95, dz);
          g.add(post);
        }
      }
      const shape = new THREE.Shape();
      shape.moveTo(-2.1, 0);
      shape.lineTo(0, 1.4);
      shape.lineTo(2.1, 0);
      shape.lineTo(-2.1, 0);
      const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 19.6, bevelEnabled: false });
      roofGeo.translate(0, 0, -9.8);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 2;
      roof.position.y = 4.7;
      g.add(roof);
      for (const s of [-1, 1]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 3.2), this.basic(0x0c1e22));
        pier.position.set(s * 8.8, 1.5, 0);
        g.add(pier);
      }
      g.position.z = z;
      this.scene.add(g);
      for (let x = -8; x <= 8.01; x += 2) {
        big.add(x, 2.55, z + (x % 4 === 0 ? 0.9 : -0.9), x % 4 === 0 ? '#ffb300' : '#e2553f', 1);
      }
      for (let x = -8.4; x <= 8.41; x += 1.4) small.add(x, 5.95, z, '#ffd27a', 0.6);
    };
    bridge(-60);
    bridge(-215);

    const pierZ = -180;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, 2.2), wood);
    deck.position.set(5.6, 0.6, pierZ);
    this.scene.add(deck);
    for (let x = 2.8; x <= 8.4; x += 1.8) {
      for (const dz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.16), wood);
        post.position.set(x, 0.1, pierZ + dz);
        this.scene.add(post);
      }
    }
    big.add(2.6, 1.7, pierZ, '#ffb300', 1);
    const boatSpots: Array<[number, number, number]> = [
      [2.4, pierZ + 3.2, 0.1],
      [-2.6, pierZ - 5, -0.15],
      [0.6, pierZ - 9, 0.05],
    ];
    boatSpots.forEach(([x, z, rot]) => {
      const b = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 2.9), this.basic(0x2a1a14));
      hull.position.y = 0.14;
      b.add(hull);
      const canopy = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 1.5, 10, 1, true, 0, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0x3a2a1a, side: THREE.DoubleSide })
      );
      canopy.rotation.z = Math.PI / 2;
      canopy.rotation.y = Math.PI / 2;
      canopy.position.y = 0.32;
      b.add(canopy);
      b.position.set(x, 0, z);
      b.rotation.y = rot;
      this.scene.add(b);
      big.add(x, 0.75, z - 1.5, '#ffb300', 1);
      small.add(x, 0.55, z, '#ffe082', 0.7);
    });

    const wz = -300;
    const wdeck = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 2.6), wood);
    wdeck.position.set(3, 0.6, wz);
    this.scene.add(wdeck);
    for (let x = -2; x <= 8.1; x += 2) {
      for (const dz of [-1.2, 1.2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), wood);
        post.position.set(x, 0.1, wz + dz);
        this.scene.add(post);
      }
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 6, 6), wood);
    pole.position.set(-2.2, 3.6, wz);
    this.scene.add(pole);
    for (let i = 0; i < 26; i++) {
      const a = this.rng() * Math.PI * 2;
      const r = this.rand(0.3, 1.6);
      big.add(-2.2 + Math.cos(a) * r, this.rand(1.2, 6), wz + Math.sin(a) * r, WARM[i % WARM.length], 1);
    }
    const gz = -312;
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 6.4, 0.55), this.basic(0x2b1218));
      p.position.set(s * 6.8, 2.9, gz);
      this.scene.add(p);
      for (let y = 1; y < 6; y += 1.1) big.add(s * 6.4, y, gz + 0.5, '#e2553f', 0.9);
    }
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.38, 0.6), this.basic(0x2b1218));
    b1.position.set(0, 6.2, gz);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.26, 0.5), this.basic(0x2b1218));
    b2.position.set(0, 5.4, gz);
    this.scene.add(b1, b2);
    for (let x = -7; x <= 7.01; x += 1.4) big.add(x, 5.0, gz + 0.4, WARM[Math.floor(this.rng() * WARM.length)], 1);

    this.finishLights(small, big);
  }

  private finishLights(small: LightLayer, big: LightLayer) {
    const mk = (layer: LightLayer, size: number, refl: boolean) => {
      const g = layer.geometry();
      const pts = new THREE.Points(g, this.pointsMat(size));
      pts.frustumCulled = false;
      this.scene.add(pts);
      if (refl) {
        const rg = new THREE.Group();
        rg.scale.y = -1;
        const rp = new THREE.Points(g, this.pointsMat(size * 0.9, 0.3));
        rp.frustumCulled = false;
        rg.add(rp);
        this.scene.add(rg);
      }
    };
    mk(small, 0.75, true);
    mk(big, 1.25, true);
  }

  private buildFloaters() {
    const n = 80;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    this.floaterBase = new Float32Array(n * 2);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = this.rand(-6.8, 6.8);
      const z = this.rand(-340, 20);
      pos.set([x, 0.14, z], i * 3);
      this.floaterBase[i * 2] = x;
      this.floaterBase[i * 2 + 1] = this.rng() * 10;
      c.set(WARM[i % WARM.length]);
      col.set([c.r, c.g, c.b], i * 3);
    }
    this.floaterGeo = new THREE.BufferGeometry();
    this.floaterGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.floaterGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const fp = new THREE.Points(this.floaterGeo, this.pointsMat(0.95));
    fp.frustumCulled = false;
    this.scene.add(fp);
    const rg = new THREE.Group();
    rg.scale.y = -1;
    const rp = new THREE.Points(this.floaterGeo, this.pointsMat(0.8, 0.3));
    rp.frustumCulled = false;
    rg.add(rp);
    this.scene.add(rg);

    const m = 90;
    const sp = new Float32Array(m * 3);
    const sc = new Float32Array(m * 3);
    this.skyLanternSpeed = new Float32Array(m);
    for (let i = 0; i < m; i++) {
      sp.set([this.rand(-16, 16), this.rand(3, 26), this.rand(-340, 10)], i * 3);
      this.skyLanternSpeed[i] = this.rand(0.35, 0.9);
      c.set(WARM[i % WARM.length]);
      sc.set([c.r, c.g, c.b], i * 3);
    }
    this.skyLanternGeo = new THREE.BufferGeometry();
    this.skyLanternGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.skyLanternGeo.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    const sl = new THREE.Points(this.skyLanternGeo, this.pointsMat(1.2, 0.9));
    sl.frustumCulled = false;
    this.scene.add(sl);
  }

  private populateLanternShape(design: number) {
    while (this.lanternMeshGroup.children.length > 0) {
      const ch = this.lanternMeshGroup.children[0] as THREE.Mesh;
      if (ch.geometry) ch.geometry.dispose();
      this.lanternMeshGroup.remove(ch);
    }

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.3, 0.06, 20),
      this.basic(design === 5 ? 0x996515 : 0x4a321e)
    );
    base.position.y = 0.02;
    this.lanternMeshGroup.add(base);

    const addPetalRing = (
      count: number,
      radius: number,
      y: number,
      tilt: number,
      color: number,
      scale: number,
      parent: THREE.Object3D = this.lanternMeshGroup
    ) => {
      for (let i = 0; i < count; i++) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 12, 8),
          new THREE.MeshBasicMaterial({ color })
        );
        const a = (i / count) * Math.PI * 2;
        petal.scale.set(0.55 * scale, 1 * scale, 0.26 * scale);
        petal.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
        petal.rotation.y = -a + Math.PI / 2;
        petal.rotation.x = tilt;
        parent.add(petal);
      }
    };

    if (design === 1) {
      // Peony (layered rose/coral)
      addPetalRing(12, 0.32, 0.18, -0.45, 0xe2553f, 1.15);
      addPetalRing(10, 0.22, 0.3, -0.22, 0xff8a65, 1.0);
      addPetalRing(8, 0.12, 0.42, -0.05, 0xffe082, 0.85);
    } else if (design === 2) {
      // Star lantern
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42, 0),
        new THREE.MeshBasicMaterial({ color: 0xffe082 })
      );
      star.position.y = 0.34;
      star.scale.set(1.15, 0.85, 1.15);
      const star2 = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38, 0),
        new THREE.MeshBasicMaterial({ color: 0xffb300 })
      );
      star2.position.y = 0.34;
      star2.rotation.y = Math.PI / 4;
      this.lanternMeshGroup.add(star, star2);
    } else if (design === 3) {
      // Bud (tall jade & warm gold)
      const bud = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.62, 16),
        new THREE.MeshBasicMaterial({ color: 0xffe082 })
      );
      bud.position.y = 0.34;
      this.lanternMeshGroup.add(bud);
      addPetalRing(6, 0.22, 0.18, -0.25, 0x7ccfb0, 0.95);
    } else if (design === 4) {
      // Paper box (traditional wooden frame + glowing paper cube)
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.52, 0.46),
        new THREE.MeshBasicMaterial({ color: 0xfff3cd })
      );
      box.position.y = 0.3;
      this.lanternMeshGroup.add(box);
    } else if (design === 5) {
      // Golden Festival (radiant multi-tier lotus)
      addPetalRing(12, 0.36, 0.18, -0.42, 0xffb300, 1.25);
      addPetalRing(10, 0.25, 0.34, -0.2, 0xffd54f, 1.1);
      addPetalRing(8, 0.14, 0.48, 0, 0xfff8e1, 0.95);
    } else if (design === 6) {
      // Chain of 3 lanterns
      addPetalRing(9, 0.3, 0.2, -0.35, 0xff9a52, 1.1);
      addPetalRing(7, 0.18, 0.35, -0.12, 0xffe082, 0.95);
      for (const tz of [0.9, 1.7]) {
        const sub = new THREE.Group();
        sub.position.set(0, 0, tz);
        sub.scale.setScalar(0.62);
        addPetalRing(8, 0.28, 0.2, -0.3, 0xffb300, 1.0, sub);
        this.lanternMeshGroup.add(sub);
      }
    } else {
      // Default 0: Classic Lotus
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 24, 18),
        new THREE.MeshBasicMaterial({ color: 0xffd36e })
      );
      body.scale.set(1, 0.8, 1);
      body.position.y = 0.3;
      this.lanternMeshGroup.add(body);
      addPetalRing(9, 0.3, 0.2, -0.35, 0xff9a52, 1.1);
      addPetalRing(9, 0.2, 0.34, -0.15, 0xffc27a, 1);
      addPetalRing(7, 0.1, 0.46, 0, 0xffe6b0, 0.85);
    }
  }

  private buildLantern() {
    this.lantern.add(this.lanternMeshGroup);
    this.populateLanternShape(0);

    const haloMat = new THREE.SpriteMaterial({
      map: this.glowTex,
      color: 0xffa81f,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    this.halo = new THREE.Sprite(haloMat);
    this.halo.position.y = 0.35;
    this.halo.scale.set(2.6, 2.6, 1);
    this.lantern.add(this.halo);
    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTex,
        color: 0xfff1c0,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    core.position.y = 0.34;
    core.scale.set(0.9, 0.9, 1);
    this.lantern.add(core);

    this.lantern.scale.setScalar(1.7);
    this.scene.add(this.lantern);

    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 0.96, 48),
        new THREE.MeshBasicMaterial({
          color: 0xffc66b,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          fog: false,
        })
      );
      r.rotation.x = -Math.PI / 2;
      this.rings.push(r);
      this.scene.add(r);
    }
  }

  /* ------------------------------ frame ------------------------------ */

  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime * (this.reduced ? 0.35 : 1);

    let lx = 0;
    let lz = 0;

    if (this.free) {
      const up = this.keys['KeyW'] || this.keys['ArrowUp'];
      const down = this.keys['KeyS'] || this.keys['ArrowDown'];
      const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
      const right = this.keys['KeyD'] || this.keys['ArrowRight'];
      const boost = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']);
      this.boosting = boost;

      const ax = ((right ? 1 : 0) - (left ? 1 : 0) + this.joyVec.x) * 9.5;
      const az = ((down ? 1 : 0) - (up ? 1 : 0) + this.joyVec.y) * 12.5 - 1.6;
      const mult = this.speedMult * (boost ? 1.75 : 1);

      this.freeVx += ax * mult * dt;
      this.freeVz += az * mult * dt;
      this.freeVx *= Math.exp(-dt * 3.2);
      this.freeVz *= Math.exp(-dt * 2.6);

      this.freeX = Math.max(-6.4, Math.min(6.4, this.freeX + this.freeVx * dt));
      this.freeZ += this.freeVz * dt;
      if (this.freeZ < -RIVER_LENGTH - 15) this.freeZ = 8;
      if (this.freeZ > 12) this.freeZ = 12;

      lx = this.freeX;
      lz = this.freeZ;
      this.curP = Math.max(0, Math.min(1, -lz / RIVER_LENGTH));

      const spd = Math.hypot(this.freeVx, this.freeVz) * 2.4;
      this.speedKmh = spd;
      if (this.onSpeedChange) this.onSpeedChange(spd, boost);
    } else {
      this.curP += (this.targetP - this.curP) * (1 - Math.exp(-dt * (this.reduced ? 20 : 3.6)));
      lz = -this.curP * RIVER_LENGTH;
      lx = Math.sin(lz * 0.045) * 1.3 + Math.sin(lz * 0.11) * 0.3;
    }

    this.side += ((this.free ? 0 : this.sideTarget) - this.side) * (1 - Math.exp(-dt * 2.4));
    this.mouse.x += (this.mouse.tx - this.mouse.x) * (1 - Math.exp(-dt * 3));
    this.mouse.y += (this.mouse.ty - this.mouse.y) * (1 - Math.exp(-dt * 3));

    const bob = Math.sin(t * 1.4) * 0.05;
    this.lantern.position.set(lx, 0.04 + bob, lz);
    this.lantern.rotation.z = Math.sin(t * 0.9) * 0.05 - (this.free ? this.freeVx * 0.03 : 0);
    this.lantern.rotation.x = Math.sin(t * 0.7 + 1) * 0.03;
    this.lantern.rotation.y = t * 0.15;
    const flick = 1 + 0.06 * Math.sin(t * 7) + 0.04 * Math.sin(t * 13.3);
    this.halo.scale.set(2.6 * flick, 2.6 * flick, 1);

    this.rings.forEach((r, i) => {
      const ph = (t * 0.32 + i / 3) % 1;
      r.position.set(lx, 0.03, lz);
      r.scale.setScalar(0.6 + ph * 3.6);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.42;
    });

    // Click ripples
    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const cr = this.clickRipples[i];
      cr.age += dt;
      if (cr.age < 0) continue;
      const p = cr.age / cr.life;
      cr.mesh.scale.setScalar(1 + p * 11);
      (cr.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p) * 0.65);
      if (cr.age >= cr.life) {
        this.scene.remove(cr.mesh);
        cr.mesh.geometry.dispose();
        (cr.mesh.material as THREE.Material).dispose();
        this.clickRipples.splice(i, 1);
      }
    }

    // Wish sky lanterns
    for (let i = this.wishLanterns.length - 1; i >= 0; i--) {
      const wl = this.wishLanterns[i];
      wl.age += dt;
      wl.group.position.x += (wl.vx + Math.sin(t + i) * 0.15) * dt;
      wl.group.position.y += wl.vy * dt;
      wl.group.position.z += wl.vz * dt;
      wl.group.rotation.y += dt * 0.4;
      if (wl.age > 16) {
        this.scene.remove(wl.group);
        this.wishLanterns.splice(i, 1);
      }
    }

    // Camera
    const shift = this.portrait ? 0 : this.side * 1.9;
    const back = this.portrait ? 6.6 : 5.4;
    const px = lx + shift + this.mouse.x * 0.45;
    this.camera.position.set(px, 1.55 + this.mouse.y * 0.18 + Math.sin(t * 0.6) * 0.04, lz + back);
    this.camera.lookAt(lx + shift, this.portrait ? 1.7 : 1.05, lz - 3.2);

    this.sky.position.copy(this.camera.position);

    this.waterMat.uniforms.uTime.value = t;
    (this.waterMat.uniforms.uLantern.value as THREE.Vector3).set(lx, 0, lz);

    const fp = this.floaterGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < fp.count; i++) {
      let z = fp.getZ(i) - 0.45 * dt;
      if (z < -345) z = 22;
      fp.setZ(i, z);
      fp.setX(i, this.floaterBase[i * 2] + Math.sin(t * 0.5 + this.floaterBase[i * 2 + 1]) * 0.35);
      fp.setY(i, 0.14 + Math.sin(t * 1.2 + this.floaterBase[i * 2 + 1]) * 0.03);
    }
    fp.needsUpdate = true;

    const sp = this.skyLanternGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < sp.count; i++) {
      let y = sp.getY(i) + this.skyLanternSpeed[i] * dt;
      if (y > 28) y = 3;
      sp.setY(i, y);
      sp.setX(i, sp.getX(i) + Math.sin(t * 0.3 + i) * 0.004);
    }
    sp.needsUpdate = true;

    if (this.zone === 4 && !this.reduced && t - this.lastBurst > 1.7) {
      this.lastBurst = t;
      this.burst(WARM[Math.floor(Math.random() * WARM.length)]);
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      const pa = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let k = 0; k < pa.count; k++) {
        b.vel[k * 3 + 1] -= 3.2 * dt;
        pa.setXYZ(
          k,
          pa.getX(k) + b.vel[k * 3] * dt,
          pa.getY(k) + b.vel[k * 3 + 1] * dt,
          pa.getZ(k) + b.vel[k * 3 + 2] * dt
        );
        b.vel[k * 3] *= 1 - dt * 0.6;
        b.vel[k * 3 + 2] *= 1 - dt * 0.6;
      }
      pa.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - b.age / b.life);
      if (b.age >= b.life) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
