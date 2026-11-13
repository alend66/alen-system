import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FILM_PORTFOLIO_DATA } from '../data/portfolio';
import {
  Building2,
  Briefcase,
  ChevronDown,
  Code2,
  Cpu,
  DoorOpen,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Footprints,
  GraduationCap,
  Mail,
  MapPin,
  ShieldAlert,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react';

interface BuildingPortfolioProps {
  onOpenResume: () => void;
  onOpenTerminalModal: () => void;
  onSwitchToClassicView: () => void;
}

export interface WalkStation {
  id: string;
  badge: string;
  roomCode: string;
  title: string;
  subtitle: string;
  range: [number, number]; // Scroll progress range [0..1]
  targetZ: number; // 3D Z position along the walk path
  accentColor: string;
  accentHexNum: number;
}

export const WALK_STATIONS: WalkStation[] = [
  {
    id: 'exterior',
    badge: '00 · INFOPARK PLAZA WALKWAY',
    roomCode: 'CAMPUS EXTERIOR // MAIN GATE',
    title: 'ALEN DAVIS K — WALKING TO INFOPARK HQ',
    subtitle:
      'Scroll downwards to walk with Alen Davis K across the Infopark campus plaza and through the automatic glass doors into his office.',
    range: [0.0, 0.15],
    targetZ: 18,
    accentColor: '#38bdf8',
    accentHexNum: 0x38bdf8,
  },
  {
    id: 'skills',
    badge: '01 · FLOOR 1 · SOC OFFICE',
    roomCode: 'DOOR 01 // SIEM & SECURITY OPS',
    title: 'TECHNICAL SKILLS & CYBER ARSENAL',
    subtitle:
      'Alen enters the Security Operations Center: SIEM log correlation, Linux server administration, Bash/Python automation, and VAPT.',
    range: [0.15, 0.33],
    targetZ: -11,
    accentColor: '#10b981',
    accentHexNum: 0x10b981,
  },
  {
    id: 'experience',
    badge: '02 · FLOOR 2 · SERVER & FORENSICS WING',
    roomCode: 'DOOR 02 // OPERATIONS & FORENSICS',
    title: 'PROFESSIONAL EXPERIENCE & INTERNSHIPS',
    subtitle:
      'Walking through the Server & Digital Forensics Wing: Police Cyber Cell (Thrissur), HashRoot (Kochi), and DNS Solutions.',
    range: [0.33, 0.52],
    targetZ: -35,
    accentColor: '#0ea5e9',
    accentHexNum: 0x0ea5e9,
  },
  {
    id: 'projects',
    badge: '03 · FLOOR 3 · R&D CYBER LAB',
    roomCode: 'DOOR 03 // ENGINEERING PROJECTS',
    title: 'FEATURED SECURITY & HARDWARE PROJECTS',
    subtitle:
      'Inside the R&D Engineering Lab: Splunk SIEM Threat Detection Lab, Python File Integrity Tool, and ESP32 RFID Access Control.',
    range: [0.52, 0.72],
    targetZ: -59,
    accentColor: '#a855f7',
    accentHexNum: 0xa855f7,
  },
  {
    id: 'credentials',
    badge: '04 · FLOOR 4 · ACADEMY & VAULT',
    roomCode: 'DOOR 04 // EDUCATION & CERTIFICATIONS',
    title: 'EDUCATION, CERTIFICATIONS & CONFERENCES',
    subtitle:
      'Walking through the Academy Gallery: B.Sc. Computer Science (Sahrdaya College), ADCD v3 (Red Team Hackers Academy), and Forensics Workshops.',
    range: [0.72, 0.87],
    targetZ: -83,
    accentColor: '#f59e0b',
    accentHexNum: 0xf59e0b,
  },
  {
    id: 'contact',
    badge: '05 · EXECUTIVE SKY OFFICE',
    roomCode: 'DOOR 05 // DIRECT CONTACT & RÉSUMÉ',
    title: 'EXECUTIVE WORKSTATION & CONTACT',
    subtitle:
      'Alen arrives at his Executive Sky Office overlooking Infopark Kochi. Connect directly via Email or GitHub, or download his Résumé PDF.',
    range: [0.87, 1.0],
    targetZ: -107,
    accentColor: '#ec4899',
    accentHexNum: 0xec4899,
  },
];

interface SlidingGlassDoor3D {
  zPos: number;
  leftDoor: THREE.Group;
  rightDoor: THREE.Group;
  sensorLightMat: THREE.MeshBasicMaterial;
}

export const BuildingPortfolio: React.FC<BuildingPortfolioProps> = ({
  onOpenResume,
  onOpenTerminalModal,
  onSwitchToClassicView,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [hideDetailsCard, setHideDetailsCard] = useState<boolean>(false);

  const targetScrollRef = useRef<number>(0);
  const smoothScrollRef = useRef<number>(0);
  const prevCharacterZRef = useRef<number>(22);

  // Track viewport size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Track page scroll [0..1]
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const frac = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      targetScrollRef.current = frac;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToStation = (stationIdx: number) => {
    const st = WALK_STATIONS[stationIdx];
    if (!st) return;
    const midFrac =
      stationIdx === 0
        ? 0.02
        : stationIdx === WALK_STATIONS.length - 1
        ? 0.96
        : (st.range[0] + st.range[1]) * 0.5;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    window.scrollTo({
      top: midFrac * maxScroll,
      behavior: 'smooth',
    });
  };

  // ============================================================
  // THREE.JS 3D INFOPARK BUILDING + 3D WALKING ALEN DAVIS K
  // ============================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071120);
    scene.fog = new THREE.FogExp2(0x071120, 0.012);

    const camera = new THREE.PerspectiveCamera(
      window.innerWidth < 768 ? 64 : 54,
      container.clientWidth / container.clientHeight,
      0.1,
      260
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting: Warm Kerala Golden-Hour Sun + Skylight + Interior Office Lights
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d1, 1.65);
    sunLight.position.set(18, 34, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const texLoader = new THREE.TextureLoader();
    const loadTex = (url: string) => {
      const t = texLoader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const portraitTex = loadTex('/alen-davis.jpg');
    const exteriorTex = loadTex('/infopark/infopark_exterior.jpg');
    const roomTextures = [
      loadTex('/infopark/infopark_soc_skills.jpg'),
      loadTex('/infopark/infopark_server_operations.jpg'),
      loadTex('/infopark/infopark_rd_lab.jpg'),
      loadTex('/infopark/infopark_academy_hall.jpg'),
      loadTex('/infopark/infopark_sky_lounge.jpg'),
    ];

    // Helper to create crisp 3D architectural signage textures
    const createSignTexture = (
      topSub: string,
      mainHeading: string,
      accentHex: string,
      bgHex = '#071022'
    ) => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, c.width - 20, c.height - 20);

      ctx.fillStyle = accentHex;
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(topSub, c.width / 2, 78);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText(mainHeading, c.width / 2, 166);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // ============================================================
    // 1. INFOPARK EXTERIOR CAMPUS PLAZA, PALM TREES & GLASS TOWER (z = +30 to 0)
    // ============================================================
    const campusGroup = new THREE.Group();
    scene.add(campusGroup);

    // Lush Kerala Green Lawn on Left & Right of Campus Plaza
    const lawnGeo = new THREE.PlaneGeometry(90, 44);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x0b291e,
      roughness: 0.85,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(0, -0.04, 18);
    campusGroup.add(lawn);

    // Polished Granite Pedestrian Walkway Leading to the Main Entrance Doors (z = +32 to 0)
    const walkwayMesh = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.08, 34),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.28,
        metalness: 0.45,
      })
    );
    walkwayMesh.position.set(0, 0, 16);
    walkwayMesh.receiveShadow = true;
    campusGroup.add(walkwayMesh);

    // Glowing Walkway Guide Strips
    [-3.4, 3.4].forEach(xEdge => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.1, 34),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      strip.position.set(xEdge, 0.02, 16);
      campusGroup.add(strip);
    });

    // Reflective Water Fountain Pools on Both Sides of the Plaza Walkway
    [-8.2, 8.2].forEach(poolX => {
      const poolFrame = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 0.35, 18),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
      );
      poolFrame.position.set(poolX, 0.12, 13);
      campusGroup.add(poolFrame);

      const waterSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(5.8, 17.4),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.08,
          metalness: 0.85,
        })
      );
      waterSurface.rotation.x = -Math.PI / 2;
      waterSurface.position.set(poolX, 0.31, 13);
      campusGroup.add(waterSurface);
    });

    // 3D Tropical Kerala Palm Trees lining the Infopark Campus Plaza
    const buildPalmTree = (tx: number, tz: number, scale = 1) => {
      const palm = new THREE.Group();
      palm.position.set(tx, 0, tz);
      palm.scale.setScalar(scale);

      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.9,
      });
      for (let seg = 0; seg < 7; seg++) {
        const segMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22 - seg * 0.018, 0.25 - seg * 0.018, 1.15, 8),
          trunkMat
        );
        segMesh.position.set(Math.sin(seg * 0.25) * 0.22, seg * 1.05 + 0.55, 0);
        palm.add(segMesh);
      }

      const frondMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      const topY = 7.4;
      for (let f = 0; f < 8; f++) {
        const angle = (f * Math.PI * 2) / 8;
        const frond = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.55), frondMat);
        frond.position.set(
          Math.cos(angle) * 1.35 + 0.22,
          topY - 0.2,
          Math.sin(angle) * 1.35
        );
        frond.rotation.y = -angle;
        frond.rotation.z = -0.38;
        palm.add(frond);
      }
      campusGroup.add(palm);
    };

    [6, 13, 20, 26].forEach((zPalm, idx) => {
      buildPalmTree(-13.5, zPalm, 0.95 + (idx % 2) * 0.15);
      buildPalmTree(13.5, zPalm, 0.95 + ((idx + 1) % 2) * 0.15);
    });

    // ============================================================
    // 2. 3D REAL INFOPARK GLASS-AND-STEEL HEADQUARTERS BUILDING (at z = 0)
    // ============================================================
    // Full 3D Sky & Infopark Campus Panorama Dome behind the building so the 3D world looks like a real photograph!
    const skyBackdropWall = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 56),
      new THREE.MeshBasicMaterial({
        map: exteriorTex,
      })
    );
    skyBackdropWall.position.set(0, 22, -6);
    campusGroup.add(skyBackdropWall);

    const glassFacadeMat = new THREE.MeshStandardMaterial({
      color: 0x0c2442,
      roughness: 0.12,
      metalness: 0.88,
      transparent: true,
      opacity: 0.88,
    });
    const steelMullionMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85,
    });

    // Multi-Story Curved 3D Infopark Glass Curtain-Wall Building Towers flanking the Main Glass Doors
    [-12.5, 12.5].forEach(wingX => {
      const wingTower = new THREE.Mesh(
        new THREE.BoxGeometry(16, 26, 5),
        glassFacadeMat
      );
      wingTower.position.set(wingX, 13, -1.8);
      campusGroup.add(wingTower);

      // Photorealistic Infopark Glass Facade Texture mapped onto the 3D Tower
      const photoFacade = new THREE.Mesh(
        new THREE.PlaneGeometry(15.6, 25),
        new THREE.MeshBasicMaterial({
          map: exteriorTex,
        })
      );
      photoFacade.position.set(wingX, 13, 0.72);
      campusGroup.add(photoFacade);

      // 3D Protruding Steel Curtain-Wall Floor Slabs & Vertical Fins
      for (let floorY = 4; floorY <= 24; floorY += 4) {
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(16.2, 0.24, 0.45),
          steelMullionMat
        );
        beam.position.set(wingX, floorY, 0.82);
        campusGroup.add(beam);
      }
      for (let colX = -6; colX <= 6; colX += 3) {
        const vMullion = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 25.5, 0.35),
          steelMullionMat
        );
        vMullion.position.set(wingX + colX, 13, 0.8);
        campusGroup.add(vMullion);
      }
    });

    // Central Upper Glass Tower Bridge above the Main Entrance (y = 8 to 26)
    const centerUpperTower = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 18, 4.2),
      glassFacadeMat
    );
    centerUpperTower.position.set(0, 17, -1.4);
    campusGroup.add(centerUpperTower);

    const centerUpperPhoto = new THREE.Mesh(
      new THREE.PlaneGeometry(9.0, 16),
      new THREE.MeshBasicMaterial({ map: exteriorTex })
    );
    centerUpperPhoto.position.set(0, 17.5, 0.75);
    campusGroup.add(centerUpperPhoto);

    // Grand Glass Overhang Canopy & Building Title Sign above Main Entrance (z = 0)
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.35, 4.5),
      steelMullionMat
    );
    canopy.position.set(0, 7.2, 1.8);
    campusGroup.add(canopy);

    const hqSignTex = createSignTexture(
      'INFOPARK KOCHI · KERALA',
      'ALEN DAVIS K // CYBER & LINUX HQ',
      '#38bdf8'
    );
    const hqSignMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9.6, 2.2),
      new THREE.MeshBasicMaterial({ map: hqSignTex })
    );
    hqSignMesh.position.set(0, 9.2, 1.15);
    campusGroup.add(hqSignMesh);

    // ============================================================
    // 3. CONTINUOUS 3D OFFICE INTERIOR CORRIDOR & 5 GLASS-WALLED ROOMS (z = 0 to -125)
    // ============================================================
    const corridorLen = 132;
    const corridorW = 16;
    const corridorH = 9.0;

    // Polished Corporate Porcelain/Granite Interior Floor
    const officeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorW, corridorLen),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.18,
        metalness: 0.65,
      })
    );
    officeFloor.rotation.x = -Math.PI / 2;
    officeFloor.position.set(0, 0, -corridorLen / 2);
    officeFloor.receiveShadow = true;
    scene.add(officeFloor);

    // Central Carpet Runner path where Alen walks inside the building
    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, corridorLen),
      new THREE.MeshStandardMaterial({
        color: 0x132038,
        roughness: 0.7,
      })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(-1.2, 0.015, -corridorLen / 2);
    scene.add(runner);

    // Modern Recessed Acoustic Office Ceiling
    const officeCeiling = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorW, corridorLen),
      new THREE.MeshStandardMaterial({
        color: 0x090e1a,
        roughness: 0.5,
      })
    );
    officeCeiling.rotation.x = Math.PI / 2;
    officeCeiling.position.set(0, corridorH, -corridorLen / 2);
    scene.add(officeCeiling);

    // Build 5 Photorealistic 3D Office Rooms along z = -12, -36, -60, -84, -108
    const roomCentersZ = [-12, -36, -60, -84, -108];
    const roomAccents = [0x10b981, 0x0ea5e9, 0xa855f7, 0xf59e0b, 0xec4899];

    roomCentersZ.forEach((rz, idx) => {
      const rTex = roomTextures[idx];
      const accent = roomAccents[idx];

      // Warm + Accent Point Light inside each room
      const roomLight = new THREE.PointLight(0xffffff, 1.5, 24);
      roomLight.position.set(0, corridorH - 0.8, rz);
      scene.add(roomLight);

      // Linear LED Ceiling Light Strip
      const ledStrip = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 0.1, 0.4),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      ledStrip.position.set(0, corridorH - 0.06, rz);
      scene.add(ledStrip);

      // Left & Right Panoramic Photorealistic Room Walls (shows real Infopark SOC, Server Room, Lab, Hall, Sky Lounge!)
      [-corridorW / 2 + 0.1, corridorW / 2 - 0.1].forEach((wallX, sideIdx) => {
        const wallPanel = new THREE.Mesh(
          new THREE.PlaneGeometry(22, corridorH - 0.5),
          new THREE.MeshBasicMaterial({
            map: rTex,
          })
        );
        wallPanel.position.set(wallX, corridorH / 2, rz);
        wallPanel.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(wallPanel);
      });

      // 3D Office Desk, Chair & Dual Ultrawide Monitors in Each Department (Positioned on left x = -3.8 so Alen walks right past them!)
      const deskGroup = new THREE.Group();
      deskGroup.position.set(-4.2, 0, rz);
      scene.add(deskGroup);

      // Desk tabletop
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.12, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
      );
      deskTop.position.set(0, 1.45, 0);
      deskGroup.add(deskTop);

      // Desk legs
      [-1.5, 1.5].forEach(lx => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 1.45, 1.4),
          steelMullionMat
        );
        leg.position.set(lx, 0.725, 0);
        deskGroup.add(leg);
      });

      // Dual Glowing Ultrawide Monitors on the Desk
      [-0.75, 0.75].forEach(mx => {
        const monitorFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.35, 0.82, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x090d16 })
        );
        monitorFrame.position.set(mx, 2.08, -0.35);
        monitorFrame.rotation.y = mx < 0 ? 0.15 : -0.15;
        deskGroup.add(monitorFrame);

        const screenGlow = new THREE.Mesh(
          new THREE.PlaneGeometry(1.26, 0.74),
          new THREE.MeshBasicMaterial({ map: rTex })
        );
        screenGlow.position.set(mx, 2.08, -0.31);
        screenGlow.rotation.y = mx < 0 ? 0.15 : -0.15;
        deskGroup.add(screenGlow);
      });

      // Accent LED under-desk glow strip
      const deskLed = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 0.05, 0.05),
        new THREE.MeshBasicMaterial({ color: accent })
      );
      deskLed.position.set(0, 1.38, 0.78);
      deskGroup.add(deskLed);
    });

    // End of Building Panoramic Sky-Lounge Window Wall at z = -122
    const skyBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorW, corridorH),
      new THREE.MeshBasicMaterial({ map: roomTextures[4] })
    );
    skyBackdrop.position.set(0, corridorH / 2, -122);
    scene.add(skyBackdrop);

    // ============================================================
    // 4. FIVE 3D AUTOMATIC SLIDING GLASS DOORS (z = 0, -24, -48, -72, -96)
    // ============================================================
    const doorPositionsZ = [0, -24, -48, -72, -96];
    const doorSignConfigs = [
      { sub: 'MAIN ENTRANCE // DOOR 01', title: '01 · SOC & SKILLS CENTER', hex: '#10b981' },
      { sub: 'FLOOR 02 // DOOR 02', title: '02 · EXPERIENCE & SERVER OPS', hex: '#0ea5e9' },
      { sub: 'FLOOR 03 // DOOR 03', title: '03 · PROJECTS & R&D LAB', hex: '#a855f7' },
      { sub: 'FLOOR 04 // DOOR 04', title: '04 · EDUCATION & CREDENTIALS', hex: '#f59e0b' },
      { sub: 'TOP FLOOR // DOOR 05', title: '05 · EXECUTIVE CONTACT SUITE', hex: '#ec4899' },
    ];

    const slidingDoors: SlidingGlassDoor3D[] = [];

    doorPositionsZ.forEach((dz, idx) => {
      const cfg = doorSignConfigs[idx];
      const dGroup = new THREE.Group();
      dGroup.position.set(0, 0, dz);
      scene.add(dGroup);

      // Fixed Glass & Steel Partition Walls on Left and Right of the Doorway
      const sideGlassMat = new THREE.MeshStandardMaterial({
        color: 0x0f2942,
        roughness: 0.15,
        metalness: 0.8,
        transparent: true,
        opacity: 0.72,
      });

      const leftFixedWall = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, corridorH, 0.25),
        sideGlassMat
      );
      leftFixedWall.position.set(-5.9, corridorH / 2, 0);
      dGroup.add(leftFixedWall);

      const rightFixedWall = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, corridorH, 0.25),
        sideGlassMat
      );
      rightFixedWall.position.set(5.9, corridorH / 2, 0);
      dGroup.add(rightFixedWall);

      // Brushed Aluminum Door Transom Header Beam at y = 5.8
      const transomBeam = new THREE.Mesh(
        new THREE.BoxGeometry(corridorW, 0.32, 0.45),
        steelMullionMat
      );
      transomBeam.position.set(0, 5.8, 0);
      dGroup.add(transomBeam);

      // Overhead Department Signboard above each sliding glass door
      const dSignTex = createSignTexture(cfg.sub, cfg.title, cfg.hex);
      const dSignMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(6.8, 1.55),
        new THREE.MeshBasicMaterial({ map: dSignTex })
      );
      dSignMesh.position.set(0, 7.1, 0.22);
      dGroup.add(dSignMesh);

      // Automatic Motion Sensor Indicator Light
      const sensorLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const sensorLight = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.16, 0.5),
        sensorLightMat
      );
      sensorLight.position.set(0, 5.98, 0);
      dGroup.add(sensorLight);

      // Left & Right Sliding Tempered Glass Door Panels (each width = 3.8, height = 5.65)
      const doorGlassMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.08,
        metalness: 0.3,
        transparent: true,
        opacity: 0.34,
      });
      const frostedStripeMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.55,
      });

      const buildDoorLeaf = (isLeft: boolean) => {
        const leaf = new THREE.Group();
        leaf.position.set(isLeft ? -1.9 : 1.9, 2.82, 0);

        const glassPane = new THREE.Mesh(
          new THREE.BoxGeometry(3.76, 5.6, 0.12),
          doorGlassMat
        );
        leaf.add(glassPane);

        // Metal frame edges
        const topRail = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 0.18, 0.18),
          steelMullionMat
        );
        topRail.position.set(0, 2.75, 0);
        leaf.add(topRail);

        const bottomRail = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 0.24, 0.18),
          steelMullionMat
        );
        bottomRail.position.set(0, -2.7, 0);
        leaf.add(bottomRail);

        // Frosted Corporate Safety Band across the glass door
        const safetyStripe = new THREE.Mesh(
          new THREE.BoxGeometry(3.74, 0.45, 0.14),
          frostedStripeMat
        );
        safetyStripe.position.set(0, 0.15, 0);
        leaf.add(safetyStripe);

        // Stainless steel vertical pull handle
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.35, 12),
          steelMullionMat
        );
        handle.position.set(isLeft ? 1.55 : -1.55, 0.1, 0.12);
        leaf.add(handle);

        dGroup.add(leaf);
        return leaf;
      };

      const leftDoor = buildDoorLeaf(true);
      const rightDoor = buildDoorLeaf(false);

      slidingDoors.push({
        zPos: dz,
        leftDoor,
        rightDoor,
        sensorLightMat,
      });
    });

    // ============================================================
    // 5. BUILD ARTICULATED 3D CHARACTER OF ALEN DAVIS K (Walking to the Office!)
    // ============================================================
    const alenGroup = new THREE.Group();
    alenGroup.position.set(-1.1, 0, 22);
    scene.add(alenGroup);

    // Materials for Alen's 3D Avatar (Smart Navy Tech Blazer, Crisp Shirt, Dark Chinos, Infopark ID Lanyard, Backpack)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd99b72, roughness: 0.55 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.7 });
    const blazerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const lanyardMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35 });
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4, metalness: 0.3 });

    // Subtle glowing floor ring under Alen's feet
    const footHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.72, 32),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    footHalo.rotation.x = -Math.PI / 2;
    footHalo.position.y = 0.03;
    alenGroup.add(footHalo);

    // Upper body container (bobs slightly with each step)
    const bodyRig = new THREE.Group();
    alenGroup.add(bodyRig);

    // Torso (Blazer + Shirt + Infopark ID Badge Lanyard)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.96, 0.42), blazerMat);
    torso.position.set(0, 1.52, 0);
    torso.castShadow = true;
    bodyRig.add(torso);

    // Shirt stripe visible on front/back
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.44), shirtMat);
    collar.position.set(0, 1.88, 0);
    bodyRig.add(collar);

    // Tech Laptop Backpack on Alen's back (since camera follows from behind!)
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.26), bagMat);
    backpack.position.set(0, 1.55, 0.28);
    backpack.castShadow = true;
    bodyRig.add(backpack);

    // Glowing cyan cyber strip on backpack
    const bagGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.05, 0.04),
      lanyardMat
    );
    bagGlow.position.set(0, 1.72, 0.42);
    bodyRig.add(bagGlow);

    // Head & Hair Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 2.08, 0);
    bodyRig.add(headPivot);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.46), skinMat);
    headMesh.position.set(0, 0.24, 0);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), hairMat);
    hairTop.position.set(0, 0.46, 0.02);
    headPivot.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.14), hairMat);
    hairBack.position.set(0, 0.28, 0.21);
    headPivot.add(hairBack);

    // Floating 3D Employee Badge + Portrait Hologram above Alen so the user unmistakably sees Alen Davis K!
    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(0, 3.05, 0);
    bodyRig.add(badgeGroup);

    const portraitBadge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.58),
      new THREE.MeshBasicMaterial({ map: portraitTex, side: THREE.DoubleSide })
    );
    portraitBadge.position.set(-0.72, 0, 0);
    badgeGroup.add(portraitBadge);

    const nameTagTex = createSignTexture(
      'INFOPARK ID // VERIFIED',
      'ALEN DAVIS K',
      '#38bdf8'
    );
    const nameTagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.44),
      new THREE.MeshBasicMaterial({ map: nameTagTex, side: THREE.DoubleSide })
    );
    nameTagMesh.position.set(0.42, 0, 0);
    badgeGroup.add(nameTagMesh);

    // Left & Right Arm Pivots (at shoulders y = 1.92)
    const buildArm = (isLeft: boolean) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(isLeft ? -0.48 : 0.48, 1.92, 0);

      const upperArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.72, 0.2),
        blazerMat
      );
      upperArm.position.set(0, -0.32, 0);
      upperArm.castShadow = true;
      armPivot.add(upperArm);

      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), skinMat);
      hand.position.set(0, -0.74, 0);
      armPivot.add(hand);

      bodyRig.add(armPivot);
      return armPivot;
    };

    const leftArmPivot = buildArm(true);
    const rightArmPivot = buildArm(false);

    // Left & Right Leg Pivots (at hips y = 1.04)
    const buildLeg = (isLeft: boolean) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(isLeft ? -0.2 : 0.2, 1.04, 0);

      const thighAndShin = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.92, 0.26),
        pantsMat
      );
      thighAndShin.position.set(0, -0.46, 0);
      thighAndShin.castShadow = true;
      legPivot.add(thighAndShin);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.14, 0.4), shoeMat);
      shoe.position.set(0, -0.96, -0.06);
      legPivot.add(shoe);

      alenGroup.add(legPivot);
      return legPivot;
    };

    const leftLegPivot = buildLeg(true);
    const rightLegPivot = buildLeg(false);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      camera.fov = window.innerWidth < 768 ? 64 : 54;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ============================================================
    // 6. REAL-TIME 60FPS ANIMATION LOOP: SCROLL -> ALEN WALKS -> DOORS OPEN
    // ============================================================
    let rafId = 0;
    const clock = new THREE.Clock();
    let walkPhase = 0;

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smoothly interpolate scroll progress
      const diff = targetScrollRef.current - smoothScrollRef.current;
      smoothScrollRef.current += diff * 0.1;
      const p = smoothScrollRef.current;
      setScrollProgress(p);

      // Map scroll progress [0..1] to Alen's Z position along the walkway:
      // Starts at z = +22 (outside on Infopark plaza walkway) and walks to z = -107 (Executive Sky Office)
      const startZ = 22;
      const endZ = -107;
      const charZ = startZ + p * (endZ - startZ);
      const velocityZ = (charZ - prevCharacterZRef.current) / Math.max(dt, 0.008);
      prevCharacterZRef.current = charZ;

      const speed = Math.abs(velocityZ);
      const isMoving = speed > 0.18;

      // Advance walk cycle phase proportional to distance walked + subtle idle motion
      if (isMoving) {
        walkPhase += Math.min(speed * 0.65, 14) * dt;
      }

      // Position Alen along the path (slightly left of center on desktop so the right-side detail cards never cover him!)
      const mobileScreen = window.innerWidth < 768;
      const targetCharX = mobileScreen ? 0 : -1.55;
      alenGroup.position.x += (targetCharX - alenGroup.position.x) * 0.12;
      alenGroup.position.z = charZ;

      // Articulated Walking Animation on Alen's Legs, Arms, Torso & Head
      const swingAmp = Math.min(1, speed / 3.5) * 0.68;
      if (swingAmp > 0.02) {
        leftLegPivot.rotation.x = Math.sin(walkPhase) * swingAmp;
        rightLegPivot.rotation.x = -Math.sin(walkPhase) * swingAmp;
        leftArmPivot.rotation.x = -Math.sin(walkPhase) * swingAmp * 0.85;
        rightArmPivot.rotation.x = Math.sin(walkPhase) * swingAmp * 0.85;
        bodyRig.position.y = Math.abs(Math.cos(walkPhase)) * 0.07 * (swingAmp / 0.68);
        bodyRig.rotation.z = Math.sin(walkPhase) * 0.025;
        headPivot.rotation.y = Math.sin(walkPhase * 0.5) * 0.08;
      } else {
        // Smoothly return to natural standing posture looking slightly toward the office workstation on the left
        leftLegPivot.rotation.x *= 0.85;
        rightLegPivot.rotation.x *= 0.85;
        leftArmPivot.rotation.x *= 0.85;
        rightArmPivot.rotation.x *= 0.85;
        bodyRig.position.y = Math.sin(elapsed * 2) * 0.015;
        bodyRig.rotation.z *= 0.85;
        headPivot.rotation.y = Math.sin(elapsed * 0.9) * 0.18;
      }

      // Automatically slide open each 3D glass door when Alen approaches within 9.5 units!
      slidingDoors.forEach(door => {
        const dist = charZ - door.zPos;
        // Open as Alen approaches (dist < 9.5) and stay open after he walks through
        const shouldOpen = dist < 9.5;
        const targetOffset = shouldOpen ? 3.45 : 0;

        door.leftDoor.position.x +=
          (-1.9 - targetOffset - door.leftDoor.position.x) * 0.12;
        door.rightDoor.position.x +=
          (1.9 + targetOffset - door.rightDoor.position.x) * 0.12;

        door.sensorLightMat.color.setHex(shouldOpen ? 0x10b981 : 0x38bdf8);
      });

      // Third-Person Follow Camera behind Alen
      // On mobile: elevate camera slightly and angle down so Alen is framed cleanly in the top half of the screen above the bottom detail card!
      const camX = mobileScreen ? 0 : 0.45;
      const camY = mobileScreen ? 3.45 : 2.85;
      const camZ = charZ + (mobileScreen ? 6.2 : 5.6);

      camera.position.set(camX, camY, camZ);
      const lookAtX = mobileScreen ? 0 : 0.35;
      const lookAtY = mobileScreen ? 1.15 : 1.95;
      const lookAtZ = charZ - 6.0;
      camera.lookAt(lookAtX, lookAtY, lookAtZ);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Determine which station Alen is currently in based on scrollProgress
  const activeStationIndex = Math.max(
    0,
    WALK_STATIONS.findIndex(
      (st, idx) =>
        scrollProgress >= st.range[0] &&
        (scrollProgress <= st.range[1] || idx === WALK_STATIONS.length - 1)
    )
  );
  const currentStation = WALK_STATIONS[activeStationIndex] || WALK_STATIONS[0];

  return (
    <div
      className={`relative w-full select-none ${
        isMobile ? 'h-[5200vh]' : 'h-[6200vh]'
      }`}
    >
      {/* FIXED FULL-SCREEN 3D VIEWPORT */}
      <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-[#071120]">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* ============================================================
            TOP INFOPARK CAMPUS HUD & ROOM JUMP DIRECTORY
            ============================================================ */}
        <header className="fixed top-2 sm:top-3 left-0 right-0 z-30 px-2.5 sm:px-6 pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 pointer-events-auto shadow-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0"
                  style={{
                    borderColor: `${currentStation.accentColor}66`,
                    backgroundColor: `${currentStation.accentColor}20`,
                  }}
                >
                  <Building2
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: currentStation.accentColor }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-white tracking-wide truncate">
                      INFOPARK 3D // ALEN DAVIS K
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      <Footprints className="w-3 h-3" />
                      SCROLL TO WALK IN 3D
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-mono text-slate-300 truncate">
                    {currentStation.badge} — {currentStation.roomCode}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setHideDetailsCard(prev => !prev)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                >
                  {hideDetailsCard ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Show Details</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">3D Only</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenTerminalModal}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Terminal</span>
                </button>

                <button
                  onClick={onOpenResume}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-300 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-sky-500/20 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Résumé</span>
                </button>

                <button
                  onClick={onSwitchToClassicView}
                  className="hidden lg:inline-flex px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800 transition-colors"
                >
                  Classic Page
                </button>
              </div>
            </div>

            {/* Station Pills Bar (Click any station to smoothly walk Alen there!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
              {WALK_STATIONS.map((st, idx) => {
                const isActive = idx === activeStationIndex;
                return (
                  <button
                    key={st.id}
                    onClick={() => jumpToStation(idx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-slate-950 text-white font-bold shadow-lg scale-[1.02]'
                        : 'bg-slate-950/75 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                    style={
                      isActive
                        ? {
                            borderColor: st.accentColor,
                            boxShadow: `0 0 16px ${st.accentColor}40`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive ? st.accentColor : '#64748b',
                      }}
                    />
                    <span>
                      {idx === 0
                        ? '00 · Plaza Walk'
                        : `0${idx} · ${st.id.toUpperCase()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ============================================================
            SCROLL-DRIVEN PORTFOLIO DETAILS CARD
            - Desktop: Right side of viewport so 3D Walking Alen on the left is always visible!
            - Mobile: Bottom docked panel (max-h-[44dvh]) so 3D Walking Alen in upper screen is never covered!
            ============================================================ */}
        {!hideDetailsCard && (
          <div className="fixed inset-x-2.5 bottom-11 md:inset-x-auto md:right-6 lg:right-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[470px] lg:w-[540px] z-20 pointer-events-auto">
            <div
              className="bg-slate-950/84 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                borderColor: `${currentStation.accentColor}66`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 28px ${currentStation.accentColor}24`,
              }}
            >
              {/* Card Header */}
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800/90 flex items-center justify-between gap-2 bg-slate-900/80">
                <div className="flex items-center gap-2 min-w-0">
                  <DoorOpen
                    className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                    style={{ color: currentStation.accentColor }}
                  />
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-mono uppercase tracking-widest block truncate"
                      style={{ color: currentStation.accentColor }}
                    >
                      {currentStation.badge}
                    </span>
                    <h2 className="text-xs sm:text-base font-bold text-white truncate">
                      {currentStation.title}
                    </h2>
                  </div>
                </div>

                {activeStationIndex < WALK_STATIONS.length - 1 ? (
                  <button
                    onClick={() => jumpToStation(activeStationIndex + 1)}
                    className="px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10px] sm:text-xs text-slate-950 flex items-center gap-1 shrink-0 hover:brightness-110 transition-all"
                    style={{ backgroundColor: currentStation.accentColor }}
                  >
                    <span>Walk Next</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => jumpToStation(0)}
                    className="px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10px] sm:text-xs bg-slate-800 text-white border border-pink-500/40 shrink-0"
                  >
                    Restart Walk
                  </button>
                )}
              </div>

              {/* Card Scrollable Details Body */}
              <div className="p-3.5 sm:p-5 max-h-[38dvh] md:max-h-[64dvh] overflow-y-auto space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStation.subtitle}
                </p>

                {/* STATION 0: EXTERIOR PLAZA WALKWAY (PROFILE & STATS) */}
                {activeStationIndex === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <img
                        src="/alen-davis.jpg"
                        alt="Alen Davis K"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-sky-400 shrink-0"
                      />
                      <div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-mono mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>SOC Analyst L1 & Linux System Engineer</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          Alen Davis K
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {FILM_PORTFOLIO_DATA.protagonist.location}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {FILM_PORTFOLIO_DATA.stats.map((st, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-center"
                        >
                          <div className="font-mono font-extrabold text-base sm:text-lg text-sky-400">
                            {st.value}
                          </div>
                          <div className="text-[10px] text-slate-300 leading-tight mt-0.5">
                            {st.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STATION 1: SKILLS & SOC ARSENAL */}
                {activeStationIndex === 1 && (
                  <div className="space-y-2.5">
                    {FILM_PORTFOLIO_DATA.skillConstellations.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="bg-slate-900/85 border border-emerald-500/30 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs mb-2">
                          <Cpu className="w-3.5 h-3.5 shrink-0" />
                          <span>{group.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.words.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-2 py-0.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-slate-100 font-mono text-[10px] sm:text-[11px]"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STATION 2: EXPERIENCE & SERVER OPERATIONS */}
                {activeStationIndex === 2 && (
                  <div className="space-y-2.5">
                    {FILM_PORTFOLIO_DATA.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/85 border border-sky-500/35 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {exp.role}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono text-[10px]">
                            {exp.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-sky-400 mb-1.5">
                          <Briefcase className="w-3 h-3" />
                          <span>{exp.organization}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed">
                          {exp.highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* STATION 3: PROJECTS & R&D LAB */}
                {activeStationIndex === 3 && (
                  <div className="space-y-2.5">
                    {FILM_PORTFOLIO_DATA.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/85 border border-purple-500/35 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300">
                            {proj.kicker}
                          </span>
                          <span className="font-mono font-extrabold text-xs text-purple-400">
                            #{proj.numeral}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-white mb-1">
                          {proj.title}
                        </h3>
                        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                          {proj.summary}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {proj.tech.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 font-mono text-[9px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300 hover:text-white shrink-0"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STATION 4: EDUCATION & CREDENTIALS */}
                {activeStationIndex === 4 && (
                  <div className="space-y-2.5">
                    <div className="bg-slate-900/85 border border-amber-500/35 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs mb-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>EDUCATION</span>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-white">
                        {FILM_PORTFOLIO_DATA.education.degree}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono">
                        {FILM_PORTFOLIO_DATA.education.institution}
                      </p>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {FILM_PORTFOLIO_DATA.education.location}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {FILM_PORTFOLIO_DATA.education.credentials.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30 text-amber-200 font-mono text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/85 border border-amber-500/35 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs mb-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>CERTIFICATIONS & WORKSHOPS</span>
                      </div>
                      <div className="space-y-1.5">
                        {FILM_PORTFOLIO_DATA.achievements.list.map((ach, i) => (
                          <div
                            key={i}
                            className="p-1.5 rounded bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5"
                          >
                            <span className="font-semibold text-[11px] text-white">
                              ✦ {ach.title}
                            </span>
                            <span className="font-mono text-[10px] text-amber-300">
                              {ach.issuer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STATION 5: EXECUTIVE WORKSTATION & CONTACT */}
                {activeStationIndex === 5 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`mailto:${FILM_PORTFOLIO_DATA.contact.email}`}
                        className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/50 text-white font-mono text-xs flex items-center gap-2 hover:bg-pink-500/30 transition-all truncate"
                      >
                        <Mail className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="truncate">{FILM_PORTFOLIO_DATA.contact.email}</span>
                      </a>

                      <a
                        href={FILM_PORTFOLIO_DATA.contact.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs flex items-center gap-2 hover:border-pink-500/50 transition-all"
                      >
                        <Code2 className="w-4 h-4 text-pink-400 shrink-0" />
                        <span>GitHub @alend66</span>
                      </a>

                      <a
                        href={FILM_PORTFOLIO_DATA.contact.resumePdf}
                        download="Alen_Davis_K_Resume.pdf"
                        className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-sky-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>Download Résumé PDF</span>
                      </a>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      <span>{FILM_PORTFOLIO_DATA.protagonist.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            BOTTOM SCROLL PROGRESS & WALK INDICATOR BAR
            ============================================================ */}
        <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 py-2 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-sky-300">
            <Footprints className="w-3.5 h-3.5 animate-bounce" />
            <span>
              {scrollProgress < 0.03
                ? 'Scroll down to walk Alen into Infopark HQ'
                : `Walking Progress: ${Math.round(scrollProgress * 100)}%`}
            </span>
          </div>

          <div className="flex-1 max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-none rounded-full"
              style={{
                width: `${Math.min(100, Math.max(2, scrollProgress * 100)).toFixed(1)}%`,
                background: 'linear-gradient(90deg, #38bdf8, #10b981, #a855f7, #ec4899)',
              }}
            />
          </div>

          <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
            {currentStation.roomCode}
          </span>
        </footer>
      </div>
    </div>
  );
};
