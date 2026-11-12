import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { CITY_SCENES, PORTFOLIO_DATA, CityScene } from '../data/portfolioData';
import { sound } from '../utils/sound';
import {
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Compass,
  Terminal as TerminalIcon,
  FileText,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Navigation,
  ShieldCheck,
  Award,
  Briefcase,
  GraduationCap,
  Cpu,
  Layers,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Car,
  Eye,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Radio
} from 'lucide-react';

interface CinematicCityProps {
  onOpenResume: () => void;
  onOpenTerminalModal: () => void;
  onOpenCommandPalette: () => void;
  onSwitchToClassicView: () => void;
}

// Helper to create crisp high-DPI canvas textures for 3D road typography & building billboards
function createTextCanvasTexture(options: {
  width?: number;
  height?: number;
  bgColor?: string;
  borderColor?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  lines?: string[];
  accentColor?: string;
  isRoad?: boolean;
}): THREE.CanvasTexture {
  const width = options.width || 1024;
  const height = options.height || 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const accent = options.accentColor || '#00f0ff';

  if (options.isRoad) {
    // Transparent road stencil
    ctx.clearRect(0, 0, width, height);

    // Road stencil border lines
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Inner dashed line
    ctx.setLineDash([24, 16]);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    ctx.setLineDash([]);

    // Badge / Code
    if (options.badge) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 42px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(options.badge, width / 2, 110);
    }

    // Main Road Marking Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.title, width / 2, 195);

    if (options.subtitle) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 34px "JetBrains Mono", monospace';
      ctx.fillText(options.subtitle, width / 2, 255);
    }

    // Directional arrows painted on road
    ctx.fillStyle = accent;
    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.fillText('▲   ▲   ▲', width / 2, height - 55);
  } else {
    // Building Billboard / Facade Sign
    ctx.fillStyle = options.bgColor || '#070b14';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glowing outer frame
    ctx.strokeStyle = options.borderColor || accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Top header bar
    ctx.fillStyle = accent;
    ctx.fillRect(10, 10, width - 20, 14);

    // Badge pill
    if (options.badge) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 30px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`[ ${options.badge} ]`, 48, 78);
    }

    // Main Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(options.title, 48, 150, width - 96);

    // Subtitle
    if (options.subtitle) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(options.subtitle, 48, 205, width - 96);
    }

    // Divider
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, 232);
    ctx.lineTo(width - 48, 232);
    ctx.stroke();

    // Bullet lines
    if (options.lines && options.lines.length > 0) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 28px "JetBrains Mono", monospace';
      options.lines.slice(0, 5).forEach((line, i) => {
        ctx.fillStyle = accent;
        ctx.fillText('▸', 48, 282 + i * 44);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(line, 82, 282 + i * 44, width - 130);
      });
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const CinematicCity: React.FC<CinematicCityProps> = ({
  onOpenResume,
  onOpenTerminalModal,
  onOpenCommandPalette,
  onSwitchToClassicView
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isAutoTour, setIsAutoTour] = useState<boolean>(false);
  const [isFreeDrive, setIsFreeDrive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(true);
  const [webglReady, setWebglReady] = useState<boolean>(true);
  const [carZPosition, setCarZPosition] = useState<number>(18);
  const [selectedProjectIdx, setSelectedProjectIdx] = useState<number>(0);

  // Refs for Three.js objects manipulated by GSAP and Free Drive loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headlightsRef = useRef<THREE.SpotLight[]>([]);
  const headBeamsRef = useRef<THREE.Mesh[]>([]);
  const lookAtTargetRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 4, z: -30 });
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const touchDriveRef = useRef<{ forward: boolean; backward: boolean; left: boolean; right: boolean }>({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  const isFreeDriveRef = useRef<boolean>(false);
  const currentSceneIdxRef = useRef<number>(0);
  const gsapTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const activeScene: CityScene = CITY_SCENES[currentSceneIndex] || CITY_SCENES[0];
  const { personal, education, skillCategories, projects, certifications, experience } = PORTFOLIO_DATA;

  // Keep ref in sync
  useEffect(() => {
    isFreeDriveRef.current = isFreeDrive;
  }, [isFreeDrive]);

  useEffect(() => {
    currentSceneIdxRef.current = currentSceneIndex;
  }, [currentSceneIndex]);

  // Choreographed GSAP transition to any of the 9 scenes
  const goToScene = useCallback((targetIndex: number, immediate = false) => {
    const clamped = Math.max(0, Math.min(CITY_SCENES.length - 1, targetIndex));
    const targetScene = CITY_SCENES[clamped];
    setCurrentSceneIndex(clamped);
    setIsFreeDrive(false);
    isFreeDriveRef.current = false;

    sound.playTone(460 + clamped * 45, 0.05, 'sine', 0.03);

    const camera = cameraRef.current;
    const car = carGroupRef.current;
    const character = characterGroupRef.current;
    if (!camera || !car) return;

    if (gsapTimelineRef.current) {
      gsapTimelineRef.current.kill();
    }

    // Adjust camera for mobile portrait screens so wide billboards and road fit cleanly
    const isPortraitMobile = window.innerWidth < 640;
    const camX = isPortraitMobile ? targetScene.cameraOffset.x * 0.65 : targetScene.cameraOffset.x;
    const camY = isPortraitMobile ? targetScene.cameraOffset.y + 1.8 : targetScene.cameraOffset.y;
    const camZ = isPortraitMobile ? targetScene.cameraOffset.z + 5.5 : targetScene.cameraOffset.z;

    const dur = immediate ? 0.1 : 2.2;

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => {
        if (carGroupRef.current) {
          setCarZPosition(Math.round(carGroupRef.current.position.z));
        }
      }
    });

    gsapTimelineRef.current = tl;

    // 1. Animate Car to target Z along the boulevard
    tl.to(
      car.position,
      {
        x: 0,
        z: targetScene.carZ,
        duration: dur
      },
      0
    );

    // 2. Animate Camera Position
    tl.to(
      camera.position,
      {
        x: camX,
        y: camY,
        z: camZ,
        duration: dur
      },
      0
    );

    // 3. Animate Camera LookAt target
    tl.to(
      lookAtTargetRef.current,
      {
        x: targetScene.lookAtOffset.x,
        y: targetScene.lookAtOffset.y,
        z: targetScene.lookAtOffset.z,
        duration: dur
      },
      0
    );

    // 4. Character visibility: visible beside car in Scene 01, 02, and at Contact Garage (09); inside car during driving (03-08)
    if (character) {
      const showOutsideCar = clamped <= 1 || clamped === 8;
      if (clamped === 8) {
        character.position.set(-3.2, 0, targetScene.carZ - 1);
      } else {
        character.position.set(-2.8, 0, targetScene.carZ + 0.5);
      }
      gsap.to(character.scale, {
        x: showOutsideCar ? 1 : 0.001,
        y: showOutsideCar ? 1 : 0.001,
        z: showOutsideCar ? 1 : 0.001,
        duration: 0.5
      });
    }

    // 5. Headlights ignition from Scene 03 onwards
    const lightsOn = clamped >= 2;
    headlightsRef.current.forEach((light) => {
      gsap.to(light, { intensity: lightsOn ? 35 : 4, duration: 0.6 });
    });
    headBeamsRef.current.forEach((beam) => {
      const mat = beam.material as THREE.MeshBasicMaterial;
      gsap.to(mat, { opacity: lightsOn ? 0.16 : 0.02, duration: 0.6 });
    });
  }, []);

  // Auto-Tour timer
  useEffect(() => {
    if (!isAutoTour) return;
    const interval = setInterval(() => {
      const next = (currentSceneIdxRef.current + 1) % CITY_SCENES.length;
      goToScene(next);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoTour, goToScene]);

  // Build the 3D City in Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setWebglReady(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04070d');
    scene.fog = new THREE.FogExp2('#04070d', 0.0095);
    sceneRef.current = scene;

    const isPortrait = container.clientWidth < 640;
    const camera = new THREE.PerspectiveCamera(
      isPortrait ? 68 : 55,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, isPortrait ? 28 : 26, isPortrait ? 52 : 46);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#1e293b', 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38bdf8', 1.5);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    // Ground Plane & Cyber Grid
    const groundGeo = new THREE.PlaneGeometry(300, 520);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#050811',
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -160);
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(500, 120, '#00f0ff', '#0f172a');
    gridHelper.position.set(0, -0.02, -160);
    scene.add(gridHelper);

    // Main Asphalt Highway (Z from +60 down to -390)
    const roadLength = 460;
    const roadWidth = 14;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({
      color: '#0b0f19',
      roughness: 0.6,
      metalness: 0.3
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -165);
    scene.add(road);

    // Glowing Cyan & Emerald Road Curbs / Neon Side Strips
    const curbGeo = new THREE.BoxGeometry(0.35, 0.18, roadLength);
    const leftCurbMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const rightCurbMat = new THREE.MeshBasicMaterial({ color: '#00ff9d' });

    const leftCurb = new THREE.Mesh(curbGeo, leftCurbMat);
    leftCurb.position.set(-roadWidth / 2 - 0.2, 0.09, -165);
    scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, rightCurbMat);
    rightCurb.position.set(roadWidth / 2 + 0.2, 0.09, -165);
    scene.add(rightCurb);

    // Sidewalks
    const sidewalkGeo = new THREE.BoxGeometry(6, 0.14, roadLength);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });
    const leftSidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    leftSidewalk.position.set(-roadWidth / 2 - 3.3, 0.07, -165);
    scene.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    rightSidewalk.position.set(roadWidth / 2 + 3.3, 0.07, -165);
    scene.add(rightSidewalk);

    // Center Dashed Lane Dividers
    const dashGeo = new THREE.PlaneGeometry(0.22, 3.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    for (let z = 45; z > -375; z -= 7) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      scene.add(dash);
    }

    // Streetlights along the boulevard
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 7.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8 });
    const lampGeo = new THREE.BoxGeometry(1.4, 0.18, 0.4);
    const lampCyanMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const lampGreenMat = new THREE.MeshBasicMaterial({ color: '#00ff9d' });

    for (let z = 30; z >= -365; z -= 22) {
      [-8.5, 8.5].forEach((xPos, idx) => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(xPos, 3.75, z);
        scene.add(pole);

        const lamp = new THREE.Mesh(lampGeo, idx === 0 ? lampCyanMat : lampGreenMat);
        lamp.position.set(xPos + (idx === 0 ? 0.6 : -0.6), 7.5, z);
        scene.add(lamp);
      });
    }

    // ========================================================================
    // ROAD TYPOGRAPHY (Section 6 of PDF: Painted district names & lane labels)
    // ========================================================================
    CITY_SCENES.forEach((sc) => {
      const roadTex = createTextCanvasTexture({
        width: 1024,
        height: 380,
        badge: `SCENE ${sc.code} // ${sc.title.toUpperCase()}`,
        title: sc.districtName,
        subtitle: sc.roadMarking,
        accentColor: sc.accentColor,
        isRoad: true
      });
      const signPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(11.5, 4.3),
        new THREE.MeshBasicMaterial({ map: roadTex, transparent: true })
      );
      signPlane.rotation.x = -Math.PI / 2;
      signPlane.position.set(0, 0.03, sc.carZ - 6.5);
      scene.add(signPlane);
    });

    // ========================================================================
    // HERO CAR (Cyber-Cruiser Vehicle with Headlights, Taillights & Wheels)
    // ========================================================================
    const carGroup = new THREE.Group();
    carGroup.position.set(0, 0, CITY_SCENES[0].carZ);
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Car Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.65, 4.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.55;
    carGroup.add(chassis);

    // Cabin / Canopy
    const cabinGeo = new THREE.BoxGeometry(1.85, 0.55, 2.3);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: '#020617',
      metalness: 0.95,
      roughness: 0.1
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.1, 0.2);
    carGroup.add(cabin);

    // Cyan Neon Underglow & Side Trim
    const trimGeo = new THREE.BoxGeometry(2.38, 0.08, 4.65);
    const trimMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.28;
    carGroup.add(trim);

    // Rear Red Taillight Strip
    const tailGeo = new THREE.BoxGeometry(2.1, 0.16, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const tailLight = new THREE.Mesh(tailGeo, tailMat);
    tailLight.position.set(0, 0.68, 2.31);
    carGroup.add(tailLight);

    // Front Cyan Headlight Strip
    const frontLightGeo = new THREE.BoxGeometry(2.1, 0.14, 0.1);
    const frontLightMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const frontLight = new THREE.Mesh(frontLightGeo, frontLightMat);
    frontLight.position.set(0, 0.62, -2.31);
    carGroup.add(frontLight);

    // 4 Wheels with glowing rims
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.7 });
    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.34, 12);
    const rimMat = new THREE.MeshBasicMaterial({ color: '#00ff9d' });

    const wheelOffsets: [number, number, number][] = [
      [-1.18, 0.42, -1.45],
      [1.18, 0.42, -1.45],
      [-1.18, 0.42, 1.45],
      [1.18, 0.42, 1.45]
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wy, wz);
      carGroup.add(rim);
    });

    // Headlight Spotlights & Volumetric Cones
    const lights: THREE.SpotLight[] = [];
    const beams: THREE.Mesh[] = [];
    [-0.75, 0.75].forEach((lx) => {
      const spot = new THREE.SpotLight('#00f0ff', 6, 45, Math.PI / 5, 0.5, 1.2);
      spot.position.set(lx, 0.65, -2.2);
      spot.target.position.set(lx, 0.1, -18);
      carGroup.add(spot);
      carGroup.add(spot.target);
      lights.push(spot);

      const coneGeo = new THREE.ConeGeometry(2.2, 11, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.03,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.rotation.x = Math.PI / 2;
      cone.position.set(lx, 0.45, -7.8);
      carGroup.add(cone);
      beams.push(cone);
    });
    headlightsRef.current = lights;
    headBeamsRef.current = beams;

    // ========================================================================
    // MAIN CHARACTER BESIDE THE HERO CAR (Scene 02 Character Reveal)
    // ========================================================================
    const charGroup = new THREE.Group();
    charGroup.position.set(-2.8, 0, 0.5);
    scene.add(charGroup);
    characterGroupRef.current = charGroup;

    // Holo pedestal under character
    const pedGeo = new THREE.CylinderGeometry(0.85, 1.0, 0.12, 24);
    const pedMat = new THREE.MeshBasicMaterial({ color: '#00ff9d' });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = 0.06;
    charGroup.add(pedestal);

    // Stylized 3D Cyber Engineer Avatar
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.85, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#0e1726', metalness: 0.6, roughness: 0.3 })
    );
    torso.position.y = 1.1;
    charGroup.add(torso);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.5 })
    );
    headMesh.position.y = 1.9;
    charGroup.add(headMesh);

    // Character Portrait Holo-Billboard right above/beside the character
    const portraitBadgeTex = createTextCanvasTexture({
      width: 768,
      height: 384,
      badge: 'OPERATOR // ADK-01',
      title: 'ALEN DAVIS K',
      subtitle: 'Linux System Engineer',
      lines: [
        'Location: Thrissur, Kerala',
        'BSc Computer Science • ADCD v3',
        '"Building reliable systems."'
      ],
      accentColor: '#00ff9d'
    });
    const charHoloSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 2.2),
      new THREE.MeshBasicMaterial({ map: portraitBadgeTex, side: THREE.DoubleSide })
    );
    charHoloSign.position.set(-1.6, 3.2, -0.5);
    charHoloSign.rotation.y = 0.28;
    charGroup.add(charHoloSign);

    // Also load actual `/alen-davis.jpg` portrait texture onto a floating holo-disc beside the character!
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/alen-davis.jpg', (photoTex) => {
      const photoMesh = new THREE.Mesh(
        new THREE.CircleGeometry(1.05, 32),
        new THREE.MeshBasicMaterial({ map: photoTex, side: THREE.DoubleSide })
      );
      photoMesh.position.set(1.4, 3.2, -0.2);
      charGroup.add(photoMesh);

      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.06, 1.16, 32),
        new THREE.MeshBasicMaterial({ color: '#00f0ff', side: THREE.DoubleSide })
      );
      ringMesh.position.set(1.4, 3.2, -0.19);
      charGroup.add(ringMesh);
    });

    // ========================================================================
    // DISTRICT ARCHITECTURE, FACADE TYPOGRAPHY & BILLBOARDS (Scenes 01 - 09)
    // ========================================================================
    const addBillboardBuilding = (opts: {
      x: number;
      z: number;
      width: number;
      height: number;
      depth: number;
      rotY?: number;
      badge: string;
      title: string;
      subtitle: string;
      lines: string[];
      accent: string;
    }) => {
      const group = new THREE.Group();
      group.position.set(opts.x, 0, opts.z);
      if (opts.rotY) group.rotation.y = opts.rotY;

      // Building Tower Mesh
      const bldgGeo = new THREE.BoxGeometry(opts.width, opts.height, opts.depth);
      const bldgMat = new THREE.MeshStandardMaterial({
        color: '#080d18',
        roughness: 0.4,
        metalness: 0.7
      });
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.y = opts.height / 2;
      group.add(bldg);

      // Glowing wireframe edges
      const edges = new THREE.EdgesGeometry(bldgGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: opts.accent });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = opts.height / 2;
      group.add(wireframe);

      // Illuminated Facade Billboard
      const tex = createTextCanvasTexture({
        badge: opts.badge,
        title: opts.title,
        subtitle: opts.subtitle,
        lines: opts.lines,
        accentColor: opts.accent
      });
      const boardW = Math.min(opts.width * 0.92, 9.5);
      const boardH = boardW * 0.5;
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(boardW, boardH),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      board.position.set(0, Math.min(opts.height * 0.62, 6.2), opts.depth / 2 + 0.08);
      group.add(board);

      scene.add(group);
    };

    // Overhead Highway Gantry Helper
    const addHighwayGantry = (z: number, badge: string, title: string, subtitle: string, accent: string) => {
      const gantryGroup = new THREE.Group();
      gantryGroup.position.set(0, 0, z);

      const pillarGeo = new THREE.BoxGeometry(0.5, 8.5, 0.5);
      const pillarMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8 });

      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-8.2, 4.25, 0);
      gantryGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(8.2, 4.25, 0);
      gantryGroup.add(rightPillar);

      const beamGeo = new THREE.BoxGeometry(17.2, 0.45, 0.45);
      const beamMat = new THREE.MeshBasicMaterial({ color: accent });
      const topBeam = new THREE.Mesh(beamGeo, beamMat);
      topBeam.position.set(0, 8.5, 0);
      gantryGroup.add(topBeam);

      const signTex = createTextCanvasTexture({
        width: 1024,
        height: 280,
        badge,
        title,
        subtitle,
        accentColor: accent
      });
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(13.5, 3.6),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signMesh.position.set(0, 6.8, 0.28);
      gantryGroup.add(signMesh);

      scene.add(gantryGroup);
    };

    // SCENE 01 & 03: Welcome Arch & Ignition Gantry
    addHighwayGantry(
      6,
      'SCENE 01 // WORLD PORTAL',
      'ALEN CITY',
      'LINUX • NETWORKING • CYBERSECURITY • INFRASTRUCTURE',
      '#00f0ff'
    );

    addHighwayGantry(
      -34,
      'SCENE 03 // DEPARTURE GATE',
      'EXPLORE MY WORLD',
      'OBSERVE → IDENTIFY → ISOLATE → TEST → FIX → VERIFY',
      '#00ff9d'
    );

    // SCENE 04: EDUCATION DISTRICT (-70)
    addBillboardBuilding({
      x: -13.5,
      z: -78,
      width: 10,
      height: 12,
      depth: 8,
      rotY: 0.35,
      badge: 'DEGREE 01 // UNIVERSITY CAMPUS',
      title: 'BSc Computer Science',
      subtitle: 'Sahrdaya College of Advanced Studies',
      lines: [
        'Location: Kodakara, India',
        'Operating Systems & Computer Architecture',
        'Networking Fundamentals & Algorithms'
      ],
      accent: '#00f0ff'
    });

    addBillboardBuilding({
      x: 13.5,
      z: -78,
      width: 10,
      height: 12,
      depth: 8,
      rotY: -0.35,
      badge: 'DIPLOMA 02 // CYBER ACADEMY',
      title: 'ADCD v3 Cyber Defence',
      subtitle: 'Red Team Hackers Academy',
      lines: [
        'Location: Thrissur, India',
        'Defensive Security & Penetration Testing',
        'Network Defense & VAPT Methodologies'
      ],
      accent: '#00ff9d'
    });

    // SCENE 05: SKILLS / TECHNOLOGY DISTRICT (-125)
    addBillboardBuilding({
      x: -14,
      z: -128,
      width: 10,
      height: 16,
      depth: 8,
      rotY: 0.32,
      badge: 'TOWER 01 // OS & LINUX CLI',
      title: 'LINUX & NETWORKING',
      subtitle: 'Ubuntu • CentOS • Shell • TCP/IP',
      lines: [
        'Linux Command Line & File Permissions',
        'Bash Automation & System Troubleshooting',
        'Router & Switch Setup • IP Addressing'
      ],
      accent: '#00ff9d'
    });

    addBillboardBuilding({
      x: 14,
      z: -128,
      width: 10,
      height: 16,
      depth: 8,
      rotY: -0.32,
      badge: 'TOWER 02 // CYBER TOOLKIT',
      title: 'SECURITY & SIEM OPS',
      subtitle: 'Splunk • Wireshark • Burp Suite • Nmap',
      lines: [
        'Metasploit • Nessus • Nikto • Hydra',
        'Aircrack-ng • Vulnerability Assessment',
        'Penetration Testing & Web App Security'
      ],
      accent: '#00f0ff'
    });

    // SCENE 06: PROJECTS BOULEVARD (-180)
    addBillboardBuilding({
      x: -14.5,
      z: -182,
      width: 10.5,
      height: 14,
      depth: 8,
      rotY: 0.35,
      badge: 'PROJECT 01 & 02 // LANDMARKS',
      title: 'FIC-01 & RFID-02',
      subtitle: 'Python + Shell • ESP32 + RFID',
      lines: [
        '01: File Integrity Checker (MD5 Hashing)',
        '02: RFID Access Control (ESP32 Hardware)',
        'Automated Verification & Edge Security'
      ],
      accent: '#f59e0b'
    });

    addBillboardBuilding({
      x: 14.5,
      z: -182,
      width: 10.5,
      height: 14,
      depth: 8,
      rotY: -0.35,
      badge: 'PROJECT 03 // SOC LANDMARK',
      title: 'SPLUNK SIEM SYSTEM',
      subtitle: 'Splunk Enterprise + Universal Forwarder',
      lines: [
        'Windows Event ID 4625 Log Extraction',
        'Linux Indexing & Correlation Rules',
        'Real-Time Brute-Force Alert Generation'
      ],
      accent: '#00f0ff'
    });

    // SCENE 07: ACHIEVEMENTS PLAZA (-235)
    addBillboardBuilding({
      x: -14,
      z: -238,
      width: 10,
      height: 13,
      depth: 8,
      rotY: 0.35,
      badge: 'VAULT 01 // DIPLOMA & FORENSICS',
      title: 'ADCD v3 & TRAZADA',
      subtitle: 'Red Team & Offenso Hackers Academy',
      lines: [
        'Advanced Diploma in Cyber Defence (June 2026)',
        'Workshop: "Trazada: The Last Trace" (June 2026)',
        'Verified Cyber Forensics & Defense'
      ],
      accent: '#10b981'
    });

    addBillboardBuilding({
      x: 14,
      z: -238,
      width: 10,
      height: 13,
      depth: 8,
      rotY: -0.35,
      badge: 'VAULT 02 // NATIONAL CONFERENCE',
      title: 'SEASIDES CONFERENCE',
      subtitle: 'International Centre Goa',
      lines: [
        'Date: February 2026',
        'Cybersecurity Community & Research',
        'Hands-on Security Training Exposure'
      ],
      accent: '#00f0ff'
    });

    // Rotating Trophy Monolith in Center Median of Achievements Plaza
    const trophyMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.2, 0),
      new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#d97706',
        emissiveIntensity: 0.6,
        wireframe: true
      })
    );
    trophyMesh.position.set(0, 5.5, -242);
    scene.add(trophyMesh);

    // SCENE 08: EXPERIENCE DISTRICT (-290)
    addBillboardBuilding({
      x: -14,
      z: -294,
      width: 10.5,
      height: 14,
      depth: 8,
      rotY: 0.35,
      badge: 'EXP 01 // INFRASTRUCTURE ADMIN',
      title: 'DNS SOLUTIONS',
      subtitle: 'CCTV & Networking Administrator',
      lines: [
        'CCTV, DVR & NVR Deployment & Maintenance',
        'Routers, Switches & IP Subnet Routing',
        'Network Troubleshooting & 24/7 Monitoring'
      ],
      accent: '#38bdf8'
    });

    addBillboardBuilding({
      x: 14,
      z: -294,
      width: 10.5,
      height: 14,
      depth: 8,
      rotY: -0.35,
      badge: 'EXP 02 // CYBER INVESTIGATIONS',
      title: 'POLICE CYBER CELL',
      subtitle: 'Cyber Security Intern',
      lines: [
        'Direct Cybercrime Investigation Exposure',
        'Digital Evidence & Chain of Custody',
        'Cyber Forensics & Incident Documentation'
      ],
      accent: '#00ff9d'
    });

    // SCENE 09: CONTACT GARAGE (-345)
    addHighwayGantry(
      -348,
      'SCENE 09 // DESTINATION GARAGE',
      'CONTACT ALEN DAVIS K',
      'alend6622@gmail.com • +91 9745775346 • THRISSUR, KERALA',
      '#00ff9d'
    );

    addBillboardBuilding({
      x: 0,
      z: -368,
      width: 16,
      height: 12,
      depth: 8,
      rotY: 0,
      badge: 'COMMAND GARAGE // OPEN TO OPPORTUNITIES',
      title: 'HIRE LINUX SYSTEM ENGINEER',
      subtitle: 'alend6622@gmail.com | +91 9745775346',
      lines: [
        'GitHub: github.com/alend66/alen-system',
        'Location: Thrissur, Kerala, India',
        'Click "View Resume" or "Terminal" below'
      ],
      accent: '#00f0ff'
    });

    // Background Atmospheric Skyline Silhouette Towers
    const bgBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 70; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (24 + Math.random() * 45);
      const z = 30 - i * 6.2;
      const w = 4 + Math.random() * 6;
      const h = 8 + Math.random() * 28;
      const d = 4 + Math.random() * 6;

      const mat = new THREE.MeshStandardMaterial({
        color: '#060a12',
        roughness: 0.8
      });
      const tower = new THREE.Mesh(bgBoxGeo, mat);
      tower.scale.set(w, h, d);
      tower.position.set(x, h / 2, z);
      scene.add(tower);
    }

    // Floating Cyber Particles in Sky
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 1] = 6 + Math.random() * 55;
      starPositions[i * 3 + 2] = 40 - Math.random() * 430;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: '#38bdf8', size: 0.45, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Keyboard Controls for Free Drive & Scene Switching
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const k = e.key.toLowerCase();
      keysPressedRef.current[k] = true;

      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        if (gsapTimelineRef.current) gsapTimelineRef.current.kill();
        setIsFreeDrive(true);
        isFreeDriveRef.current = true;
        setIsAutoTour(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressedRef.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize Handler (Responsive aspect & FOV for mobile portrait vs desktop)
    const handleResize = () => {
      if (!container || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.fov = w < 640 ? 68 : 55;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Rotate trophy in Achievements Plaza
      trophyMesh.rotation.y = elapsed * 0.8;
      trophyMesh.position.y = 5.5 + Math.sin(elapsed * 2) * 0.35;

      // Free Drive Physics when active
      if (isFreeDriveRef.current && carGroupRef.current && cameraRef.current) {
        const keys = keysPressedRef.current;
        const touch = touchDriveRef.current;
        const speed = 34 * delta;
        const steer = 9 * delta;

        let moved = false;
        if (keys['w'] || keys['arrowup'] || touch.forward) {
          carGroupRef.current.position.z -= speed;
          moved = true;
        }
        if (keys['s'] || keys['arrowdown'] || touch.backward) {
          carGroupRef.current.position.z += speed;
          moved = true;
        }
        if (keys['a'] || keys['arrowleft'] || touch.left) {
          carGroupRef.current.position.x -= steer;
          moved = true;
        }
        if (keys['d'] || keys['arrowright'] || touch.right) {
          carGroupRef.current.position.x += steer;
          moved = true;
        }

        // Clamp road boundaries
        carGroupRef.current.position.x = Math.max(-4.8, Math.min(4.8, carGroupRef.current.position.x));
        carGroupRef.current.position.z = Math.max(-355, Math.min(25, carGroupRef.current.position.z));

        // Smoothly damp camera behind the car
        const isMobile = window.innerWidth < 640;
        const targetCamX = carGroupRef.current.position.x * 0.6;
        const targetCamY = isMobile ? 6.2 : 4.8;
        const targetCamZ = carGroupRef.current.position.z + (isMobile ? 16 : 12.5);

        cameraRef.current.position.x += (targetCamX - cameraRef.current.position.x) * 0.08;
        cameraRef.current.position.y += (targetCamY - cameraRef.current.position.y) * 0.08;
        cameraRef.current.position.z += (targetCamZ - cameraRef.current.position.z) * 0.1;

        lookAtTargetRef.current.x = carGroupRef.current.position.x * 0.4;
        lookAtTargetRef.current.y = 2.0;
        lookAtTargetRef.current.z = carGroupRef.current.position.z - 22;

        if (moved) {
          const cz = carGroupRef.current.position.z;
          setCarZPosition(Math.round(cz));

          // Automatically update active district based on closest Z coordinate
          let closestIdx = 0;
          let minDist = Infinity;
          CITY_SCENES.forEach((sc, idx) => {
            const dist = Math.abs(sc.carZ - cz);
            if (dist < minDist) {
              minDist = dist;
              closestIdx = idx;
            }
          });
          if (closestIdx !== currentSceneIdxRef.current) {
            currentSceneIdxRef.current = closestIdx;
            setCurrentSceneIndex(closestIdx);
          }
        }
      }

      if (cameraRef.current) {
        cameraRef.current.lookAt(
          lookAtTargetRef.current.x,
          lookAtTargetRef.current.y,
          lookAtTargetRef.current.z
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // Trigger initial Scene 01 camera framing
    goToScene(0, true);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [goToScene]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const enableFreeDrive = () => {
    sound.playExecute();
    if (gsapTimelineRef.current) gsapTimelineRef.current.kill();
    setIsAutoTour(false);
    setIsFreeDrive(true);
    isFreeDriveRef.current = true;
    // Turn headlights on
    headlightsRef.current.forEach((l) => (l.intensity = 35));
    headBeamsRef.current.forEach((b) => ((b.material as THREE.MeshBasicMaterial).opacity = 0.16));
    if (characterGroupRef.current) {
      characterGroupRef.current.scale.set(0.001, 0.001, 0.001);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[600px] bg-[#04070d] text-slate-100 overflow-hidden select-none font-mono">
      {/* 3D WebGL World Canvas */}
      {webglReady ? (
        <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-[#060911]">
          <div className="max-w-md space-y-3 p-6 rounded-xl border border-cyan-500/30 bg-slate-900/80">
            <div className="text-cyan-400 font-bold">3D WEBGL FALLBACK MODE</div>
            <p className="text-xs text-slate-300">
              WebGL hardware acceleration is unavailable. You can still navigate all 9 districts using the interactive controls below or switch to Classic OS View.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================
          TOP HUD BAR (Mobile & Desktop Responsive Alignment)
         ==================================================================== */}
      <header className="relative z-20 px-3 sm:px-6 pt-2.5 sm:pt-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-2 pointer-events-auto">
          {/* Primary Top Bar */}
          <div className="bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl flex items-center justify-between gap-2">
            {/* Brand & World Status */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                <Navigation className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-sans font-extrabold tracking-tight text-white truncate">
                    ALEN <span className="text-cyan-400">//</span> CITY
                  </span>
                  <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold shrink-0">
                    3D WORLD
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Scene {activeScene.code}/09: <span className="text-cyan-300 font-bold">{activeScene.title}</span>
                </div>
              </div>
            </div>

            {/* Action Controls (Aligned for Mobile & Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Skip Intro / Jump to Projects or Contact */}
              {currentSceneIndex < 3 && (
                <button
                  onClick={() => goToScene(3)}
                  className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-[10px] sm:text-xs text-cyan-300 flex items-center gap-1 transition-all"
                  title="Skip Intro to Education District"
                >
                  <SkipForward className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">Skip Intro</span>
                </button>
              )}

              {/* Free Drive Toggle */}
              <button
                onClick={() => (isFreeDrive ? goToScene(currentSceneIndex) : enableFreeDrive())}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isFreeDrive
                    ? 'bg-emerald-500 text-black border-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300'
                }`}
                title="Toggle Free Drive Mode"
              >
                <Car className="w-3.5 h-3.5 shrink-0" />
                <span>{isFreeDrive ? 'Driving' : 'Drive'}</span>
              </button>

              {/* Terminal Trigger */}
              <button
                onClick={() => {
                  sound.playKeypress();
                  onOpenTerminalModal();
                }}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 text-xs flex items-center gap-1.5 transition-all"
                title="Open Interactive CLI Terminal"
              >
                <TerminalIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">CLI</span>
              </button>

              {/* Resume Trigger */}
              <button
                onClick={() => {
                  sound.playKeypress();
                  onOpenResume();
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Open Authoritative Resume"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Resume</span>
              </button>

              {/* Switch to Classic Full-Page OS View */}
              <button
                onClick={() => {
                  sound.playKeypress();
                  onSwitchToClassicView();
                }}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white text-[10px] sm:text-xs flex items-center gap-1.5 transition-all"
                title="Switch to Classic Grid / Scroll View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden xl:inline">Classic View</span>
              </button>

              {/* Sound Mute/Unmute */}
              <button
                onClick={toggleSound}
                aria-label="Toggle Audio"
                className={`p-2 rounded-lg border transition-colors ${
                  isMuted
                    ? 'border-slate-800 bg-slate-900/80 text-slate-500'
                    : 'border-cyan-500/40 bg-cyan-950/50 text-cyan-400'
                }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 9-Scene District Teleport Bar (Horizontally scrollable on mobile, centered on desktop) */}
          <div className="bg-[#070b14]/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-lg">
            {CITY_SCENES.map((sc) => {
              const active = sc.index === currentSceneIndex;
              return (
                <button
                  key={sc.id}
                  onClick={() => goToScene(sc.index)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <span className={active ? 'text-black/80' : 'text-cyan-400'}>{sc.code}</span>
                  <span>{sc.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ====================================================================
          BOTTOM HUD & LANDMARK DOSSIER PANEL (Mobile & Desktop Aligned)
         ==================================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-6 pb-3 sm:pb-5 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5 pointer-events-auto">
          {/* Mobile On-Screen Touch Drive Controls when in Free Drive Mode */}
          {isFreeDrive && (
            <div className="flex items-center justify-between gap-2 bg-[#070b14]/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-2 shadow-xl">
              <div className="flex items-center gap-1.5">
                <button
                  onPointerDown={() => (touchDriveRef.current.left = true)}
                  onPointerUp={() => (touchDriveRef.current.left = false)}
                  onPointerLeave={() => (touchDriveRef.current.left = false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 active:bg-cyan-500 active:text-black border border-slate-700 text-xs font-bold"
                >
                  ◀ LEFT
                </button>
                <button
                  onPointerDown={() => (touchDriveRef.current.right = true)}
                  onPointerUp={() => (touchDriveRef.current.right = false)}
                  onPointerLeave={() => (touchDriveRef.current.right = false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 active:bg-cyan-500 active:text-black border border-slate-700 text-xs font-bold"
                >
                  RIGHT ▶
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>FREE DRIVE ACTIVE (W/A/S/D or Arrows) • Z: {carZPosition}m</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onPointerDown={() => (touchDriveRef.current.backward = true)}
                  onPointerUp={() => (touchDriveRef.current.backward = false)}
                  onPointerLeave={() => (touchDriveRef.current.backward = false)}
                  className="px-3 py-2 rounded-lg bg-slate-900 active:bg-amber-500 active:text-black border border-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowDown className="w-3.5 h-3.5" /> REV
                </button>
                <button
                  onPointerDown={() => (touchDriveRef.current.forward = true)}
                  onPointerUp={() => (touchDriveRef.current.forward = false)}
                  onPointerLeave={() => (touchDriveRef.current.forward = false)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/30 active:scale-95"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> GAS
                </button>
              </div>
            </div>
          )}

          {/* Landmark Dossier Sheet */}
          <div className="bg-[#070b14]/92 backdrop-blur-xl border border-cyan-500/35 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
            {/* Dossier Header Bar */}
            <div className="bg-[#0c1220] px-3.5 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold shrink-0">
                  SCENE {activeScene.code}
                </span>
                <h2 className="text-xs sm:text-base font-extrabold text-white font-sans truncate">
                  {activeScene.districtName}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden md:inline text-[10px] text-slate-400 mr-1">
                  {activeScene.subtitle}
                </span>
                <button
                  onClick={() => setIsCardExpanded(!isCardExpanded)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 flex items-center gap-1"
                  title={isCardExpanded ? 'Minimize panel to view full 3D world' : 'Expand district details'}
                >
                  {isCardExpanded ? (
                    <>
                      <Minimize2 className="w-3 h-3" />
                      <span>Hide Info</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3" />
                      <span>Show Info</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable District Content Body */}
            {isCardExpanded && (
              <div className="p-3.5 sm:p-5 max-h-[38dvh] sm:max-h-[34dvh] overflow-y-auto space-y-3">
                {/* Scene 01 & 02 & 03: Intro / Character / Ignition */}
                {currentSceneIndex <= 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-8 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <img
                          src="/alen-davis.jpg"
                          alt="Alen Davis K"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-cyan-400 shrink-0"
                        />
                        <div>
                          <div className="text-sm sm:text-lg font-extrabold text-white font-sans">
                            {personal.name} — <span className="text-cyan-400">{personal.careerGoal}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>{personal.location}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {activeScene.summary}
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex flex-wrap gap-1.5">
                      {activeScene.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene 04: Education District */}
                {currentSceneIndex === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {education.map((edu, i) => (
                      <div
                        key={edu.degree}
                        className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> CAMPUS LANDMARK 0{i + 1}
                          </span>
                          <span>{edu.location}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white font-sans">{edu.degree}</div>
                        <div className="text-xs text-emerald-400 font-semibold">{edu.institution}</div>
                        <p className="text-[11px] text-slate-300 font-sans pt-0.5">{edu.focus}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scene 05: Technology / Skills District */}
                {currentSceneIndex === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {skillCategories.slice(0, 4).map((cat) => (
                      <div
                        key={cat.category}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                      >
                        <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                          <Cpu className="w-3 h-3 shrink-0" />
                          <span className="truncate">{cat.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cat.skills.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scene 06: Projects Boulevard */}
                {currentSceneIndex === 5 && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {projects.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProjectIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                            selectedProjectIdx === idx
                              ? 'bg-cyan-500 text-black'
                              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/40'
                          }`}
                        >
                          0{idx + 1}: {p.title}
                        </button>
                      ))}
                    </div>

                    {projects[selectedProjectIdx] && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-400 font-bold">
                              {projects[selectedProjectIdx].incidentNumber}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                              {projects[selectedProjectIdx].status}
                            </span>
                          </div>
                          <div className="text-sm font-extrabold text-white font-sans">
                            {projects[selectedProjectIdx].title}
                          </div>
                          <div className="text-[11px] text-amber-300">
                            Stack: {projects[selectedProjectIdx].technology}
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans">
                            {projects[selectedProjectIdx].approach}
                          </p>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {projects[selectedProjectIdx].implementation.slice(0, 4).map((imp, i) => (
                            <div
                              key={i}
                              className="p-2 rounded bg-slate-950/90 border border-slate-800/80 text-[10px] text-slate-300 flex items-start gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{imp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scene 07: Achievements Plaza */}
                {currentSceneIndex === 6 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {certifications.map((cert) => (
                      <div
                        key={cert.title}
                        className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 uppercase font-bold">
                            {cert.type}
                          </span>
                          <span className="text-slate-400">{cert.date}</span>
                        </div>
                        <div className="text-xs font-bold text-white font-sans">{cert.title}</div>
                        <div className="text-[11px] text-cyan-300">{cert.issuer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scene 08: Experience District */}
                {currentSceneIndex === 7 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.map((exp) => (
                      <div
                        key={exp.organization}
                        className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-white font-sans">
                            {exp.role}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                            {exp.organization}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">{exp.highlight}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scene 09: Contact Garage */}
                {currentSceneIndex === 8 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <a
                      href={`mailto:${personal.email}`}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/40 flex items-center gap-2.5 transition-all"
                    >
                      <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">EMAIL ALEN</div>
                        <div className="text-xs font-bold text-white truncate">{personal.email}</div>
                      </div>
                    </a>

                    <a
                      href={`tel:${personal.phone}`}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2.5 transition-all"
                    >
                      <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">DIRECT PHONE</div>
                        <div className="text-xs font-bold text-white truncate">{personal.phone}</div>
                      </div>
                    </a>

                    <a
                      href="https://github.com/alend66/alen-system"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/40 flex items-center gap-2.5 transition-all"
                    >
                      <ExternalLink className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">GITHUB REPOSITORY</div>
                        <div className="text-xs font-bold text-white truncate">github.com/alend66</div>
                      </div>
                    </a>

                    <button
                      onClick={onOpenResume}
                      className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="text-xs">OPEN / SAVE RESUME</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Story Controls Bar (Aligned for Mobile & Desktop) */}
            <div className="bg-[#090e1a] px-3.5 sm:px-5 py-2.5 border-t border-slate-800/90 flex items-center justify-between gap-2">
              {/* Prev District */}
              <button
                onClick={() => goToScene(currentSceneIndex - 1)}
                disabled={currentSceneIndex === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  currentSceneIndex === 0
                    ? 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Prev</span>
              </button>

              {/* Center Auto-Tour & Mode Status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playKeypress();
                    setIsAutoTour(!isAutoTour);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isAutoTour
                      ? 'bg-amber-500 text-black border-amber-300'
                      : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60'
                  }`}
                >
                  {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoTour ? 'Pause Tour' : 'Auto Tour'}</span>
                </button>
              </div>

              {/* Next District */}
              <button
                onClick={() => goToScene((currentSceneIndex + 1) % CITY_SCENES.length)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black text-xs font-extrabold flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <span>{currentSceneIndex === CITY_SCENES.length - 1 ? 'Restart' : 'Next'}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
