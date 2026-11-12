import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { FILM_PORTFOLIO_DATA } from '../data/portfolio';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  DoorOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Terminal as TerminalIcon,
  Unlock,
  Briefcase,
  Code2,
} from 'lucide-react';

interface BuildingPortfolioProps {
  onOpenResume: () => void;
  onOpenTerminalModal: () => void;
  onSwitchToClassicView: () => void;
}

export interface BuildingRoom {
  id: string;
  floorLabel: string;
  roomCode: string;
  title: string;
  subtitle: string;
  doorZ: number; // Z position of the door leading into this room
  camZ: number; // Camera Z position when inside this room
  camY: number;
  accentHex: string;
  accentNum: number;
}

export const BUILDING_ROOMS: BuildingRoom[] = [
  {
    id: 'exterior',
    floorLabel: 'MAIN ENTRANCE',
    roomCode: 'LOBBY // 00',
    title: 'ALEN DAVIS K — HQ BUILDING',
    subtitle: 'Stand before the main gates. Scroll or click "Open Doors" to step inside each room of my portfolio.',
    doorZ: 0,
    camZ: 14,
    camY: 3.4,
    accentHex: '#00f0ff',
    accentNum: 0x00f0ff,
  },
  {
    id: 'skills',
    floorLabel: 'ROOM 01 · SOC & ARSENAL',
    roomCode: 'SECTOR // 01',
    title: 'SKILLS & CYBER ARSENAL LAB',
    subtitle: 'Inside the Security Operations Center: SIEM threat detection, Linux administration, and network defence.',
    doorZ: 0,
    camZ: -11,
    camY: 3.2,
    accentHex: '#00ff9d',
    accentNum: 0x00ff9d,
  },
  {
    id: 'experience',
    floorLabel: 'ROOM 02 · COMMAND & FORENSICS',
    roomCode: 'SECTOR // 02',
    title: 'EXPERIENCE & SERVER OPERATIONS',
    subtitle: 'Inside the Forensics & Server Command Room: Police Cyber Cell, HashRoot, and DNS Solutions.',
    doorZ: -22,
    camZ: -33,
    camY: 3.2,
    accentHex: '#38bdf8',
    accentNum: 0x38bdf8,
  },
  {
    id: 'projects',
    floorLabel: 'ROOM 03 · R&D ENGINEERING LAB',
    roomCode: 'SECTOR // 03',
    title: 'PROJECTS & INCIDENT LABS',
    subtitle: 'Inside the R&D Lab: Splunk SIEM Threat Detection, Python File Integrity Engine, and ESP32 RFID Access Control.',
    doorZ: -44,
    camZ: -55,
    camY: 3.2,
    accentHex: '#a855f7',
    accentNum: 0xa855f7,
  },
  {
    id: 'credentials',
    floorLabel: 'ROOM 04 · VAULT & ACADEMY',
    roomCode: 'SECTOR // 04',
    title: 'EDUCATION & CREDENTIALS VAULT',
    subtitle: 'Inside the Reinforced Vault: Computer Science Degree, ADCD v3 Diploma, and Cyber Forensics Certifications.',
    doorZ: -66,
    camZ: -77,
    camY: 3.2,
    accentHex: '#f59e0b',
    accentNum: 0xf59e0b,
  },
  {
    id: 'contact',
    floorLabel: 'ROOM 05 · EXECUTIVE COMMS DECK',
    roomCode: 'SECTOR // 05',
    title: 'COMMUNICATIONS & RÉSUMÉ SUITE',
    subtitle: 'Inside the Executive Observatory: Direct hiring channels, email, phone, GitHub, and full PDF résumé.',
    doorZ: -88,
    camZ: -99,
    camY: 3.2,
    accentHex: '#ec4899',
    accentNum: 0xec4899,
  },
];

interface DoorRig {
  doorZ: number;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  lockRing: THREE.Mesh;
  statusLightMat: THREE.MeshBasicMaterial;
  openProgress: number; // 0 = closed, 1 = open
}

export const BuildingPortfolio: React.FC<BuildingPortfolioProps> = ({
  onOpenResume,
  onOpenTerminalModal,
  onSwitchToClassicView,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number>(0);
  const [doorOpenState, setDoorOpenState] = useState<boolean[]>([false, false, false, false, false]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [cardMinimizedOnMobile, setCardMinimizedOnMobile] = useState<boolean>(false);

  const activeIndexRef = useRef<number>(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const doorRigsRef = useRef<DoorRig[]>([]);
  const wheelCooldownRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Navigate to a specific room index: opens all doors up to that room and flies camera inside!
  const goToRoom = (targetIndex: number) => {
    const clamped = Math.max(0, Math.min(BUILDING_ROOMS.length - 1, targetIndex));
    activeIndexRef.current = clamped;
    setActiveRoomIndex(clamped);
    setIsTransitioning(true);

    const targetRoom = BUILDING_ROOMS[clamped];

    // Determine which doors should open (Door 0 at z=0 opens for Room >=1, Door 1 at z=-22 for Room >=2, etc.)
    const newDoorStates = doorRigsRef.current.map((_, dIdx) => clamped > dIdx);
    setDoorOpenState(newDoorStates);

    // Animate each 3D door wing sliding open or closing via GSAP
    doorRigsRef.current.forEach((rig, dIdx) => {
      const shouldOpen = clamped > dIdx;
      const targetXOffset = shouldOpen ? 3.9 : 0;

      // Update lock ring & status light color (Green when unlocked/open, Amber/Cyan when locked)
      rig.statusLightMat.color.setHex(shouldOpen ? 0x00ff9d : 0x00f0ff);

      gsap.to(rig.leftWing.position, {
        x: -2.05 - targetXOffset,
        duration: 1.05,
        ease: 'power3.inOut',
      });
      gsap.to(rig.rightWing.position, {
        x: 2.05 + targetXOffset,
        duration: 1.05,
        ease: 'power3.inOut',
      });
      gsap.to(rig.lockRing.rotation, {
        z: shouldOpen ? Math.PI : 0,
        duration: 0.9,
        ease: 'back.out(1.6)',
      });
      gsap.to(rig.lockRing.scale, {
        x: shouldOpen ? 0.01 : 1,
        y: shouldOpen ? 0.01 : 1,
        z: shouldOpen ? 0.01 : 1,
        duration: 0.65,
        delay: shouldOpen ? 0.15 : 0,
      });
    });

    // Move camera through the opened doors into the target room
    if (cameraRef.current) {
      const mobileZOffset = window.innerWidth < 768 ? 2.6 : 0;
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: targetRoom.camY,
        z: targetRoom.camZ + mobileZOffset,
        duration: 1.45,
        ease: 'power3.inOut',
        onComplete: () => setIsTransitioning(false),
      });
    } else {
      setIsTransitioning(false);
    }
  };

  // Build the 3D Building exterior + 5 interior rooms + 5 animated sliding vault/glass doors
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.018);

    const camera = new THREE.PerspectiveCamera(
      window.innerWidth < 768 ? 68 : 58,
      container.clientWidth / container.clientHeight,
      0.1,
      220
    );
    const initZOffset = window.innerWidth < 768 ? 2.6 : 0;
    camera.position.set(0, BUILDING_ROOMS[0].camY, BUILDING_ROOMS[0].camZ + initZOffset);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient + directional + room point lights
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(8, 18, 22);
    scene.add(dirLight);

    const textureLoader = new THREE.TextureLoader();
    const portraitTex = textureLoader.load('/alen-davis.jpg');
    portraitTex.colorSpace = THREE.SRGBColorSpace;

    // ============================================================
    // 1. EXTERIOR FACADE OF ALEN HQ BUILDING (around z = 0..18)
    // ============================================================
    const facadeGroup = new THREE.Group();
    scene.add(facadeGroup);

    // Exterior approach plaza floor (z = 0 to z = 24)
    const plazaGeo = new THREE.PlaneGeometry(36, 26);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x090d1a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0, 13);
    facadeGroup.add(plaza);

    // Glowing cyan carpet/walkway leading to the main front doors
    const walkwayGeo = new THREE.PlaneGeometry(5.5, 22);
    const walkwayMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.14,
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.set(0, 0.02, 11);
    facadeGroup.add(walkway);

    // Walkway edge neon strips
    [-2.75, 2.75].forEach(xPos => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 22),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      strip.position.set(xPos, 0.03, 11);
      facadeGroup.add(strip);
    });

    // Towering HQ Building Front Towers flanking the entrance (z = 0.5)
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0b1325,
      roughness: 0.35,
      metalness: 0.65,
    });
    [-8.5, 8.5].forEach(xPos => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 24, 4), towerMat);
      tower.position.set(xPos, 12, 0.5);
      facadeGroup.add(tower);

      // Vertical neon architectural fins on the building towers
      for (let i = -2; i <= 2; i++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 22, 0.18),
          new THREE.MeshBasicMaterial({ color: i === 0 ? 0x00ff9d : 0x00f0ff })
        );
        fin.position.set(xPos + i * 1.3, 11.5, 2.55);
        facadeGroup.add(fin);
      }
    });

    // Upper bridge header above the main entrance door (y = 8.5 to 20)
    const headerWall = new THREE.Mesh(new THREE.BoxGeometry(9, 13, 2.5), towerMat);
    headerWall.position.set(0, 13.5, 0.5);
    facadeGroup.add(headerWall);

    // Glowing 3D Portrait Emblem & Building Sign above Main Entrance Door
    const signFrame = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 2.2, 0.25),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    signFrame.position.set(0, 8.6, 1.85);
    facadeGroup.add(signFrame);

    const signInner = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.95, 0.28),
      new THREE.MeshBasicMaterial({ color: 0x060b18 })
    );
    signInner.position.set(0, 8.6, 1.87);
    facadeGroup.add(signInner);

    // Circular/Square Portrait Hologram above the entrance
    const portraitPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: portraitTex })
    );
    portraitPlane.position.set(0, 11.2, 1.9);
    facadeGroup.add(portraitPlane);

    const portraitBorder = new THREE.Mesh(
      new THREE.RingGeometry(1.12, 1.24, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ff9d, side: THREE.DoubleSide })
    );
    portraitBorder.position.set(0, 11.2, 1.92);
    facadeGroup.add(portraitBorder);

    // ============================================================
    // 2. CONTINUOUS INTERIOR CORRIDOR & 5 THEMED ROOMS (z = 0 to -110)
    // ============================================================
    const corridorLength = 115;
    const corridorWidth = 14;
    const corridorHeight = 8.5;

    // Reflective Interior Floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080d1a,
      roughness: 0.22,
      metalness: 0.8,
    });
    const interiorFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorWidth, corridorLength),
      floorMat
    );
    interiorFloor.rotation.x = -Math.PI / 2;
    interiorFloor.position.set(0, 0, -corridorLength / 2);
    scene.add(interiorFloor);

    // Floor Grid Helper for strong 3D depth perception
    const grid = new THREE.GridHelper(corridorLength, 55, 0x00f0ff, 0x1e293b);
    grid.position.set(0, 0.01, -corridorLength / 2 + 10);
    scene.add(grid);

    // Interior Ceiling
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x060a14,
      roughness: 0.6,
      metalness: 0.4,
    });
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorWidth, corridorLength),
      ceilingMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, corridorHeight, -corridorLength / 2);
    scene.add(ceiling);

    // Left & Right Interior Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0b1224,
      roughness: 0.45,
      metalness: 0.55,
    });
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, corridorHeight, corridorLength),
      wallMat
    );
    leftWall.position.set(-corridorWidth / 2, corridorHeight / 2, -corridorLength / 2);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, corridorHeight, corridorLength),
      wallMat
    );
    rightWall.position.set(corridorWidth / 2, corridorHeight / 2, -corridorLength / 2);
    scene.add(rightWall);

    // Back Panorama Window at the end of Room 5 (z = -108)
    const backWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(corridorWidth, corridorHeight),
      new THREE.MeshBasicMaterial({ color: 0x0d1b3a })
    );
    backWindow.position.set(0, corridorHeight / 2, -108);
    scene.add(backWindow);

    // ============================================================
    // 3. BUILD 5 ANIMATED SLIDING DOORS (z = 0, -22, -44, -66, -88)
    // ============================================================
    const makeSignTexture = (topLabel: string, mainTitle: string, hexColor: string) => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = hexColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

      ctx.fillStyle = hexColor;
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(topLabel, c.width / 2, 78);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(mainTitle, c.width / 2, 168);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const doorZPositions = [0, -22, -44, -66, -88];
    const doorAccents = [0x00f0ff, 0x00ff9d, 0x38bdf8, 0xa855f7, 0xf59e0b];
    const doorSignData = [
      { top: 'MAIN ENTRANCE // DOOR 01', title: 'SKILLS & SOC ARSENAL', hex: '#00f0ff' },
      { top: 'SECTOR 02 // DOOR 02', title: 'EXPERIENCE & SERVER OPS', hex: '#00ff9d' },
      { top: 'SECTOR 03 // DOOR 03', title: 'PROJECTS & R&D LAB', hex: '#38bdf8' },
      { top: 'SECTOR 04 // DOOR 04', title: 'EDUCATION & VAULT', hex: '#a855f7' },
      { top: 'SECTOR 05 // DOOR 05', title: 'EXECUTIVE CONTACT SUITE', hex: '#f59e0b' },
    ];
    const rigs: DoorRig[] = [];

    doorZPositions.forEach((zPos, idx) => {
      const accent = doorAccents[idx];
      const signInfo = doorSignData[idx];
      const doorGroup = new THREE.Group();
      doorGroup.position.set(0, 0, zPos);
      scene.add(doorGroup);

      // Partition wall on Left and Right of the doorway opening (opening width = 8.2, height = 6.6)
      const sidePartitionMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.35,
        metalness: 0.75,
      });

      const leftWallPart = new THREE.Mesh(new THREE.BoxGeometry(3.0, corridorHeight, 0.7), sidePartitionMat);
      leftWallPart.position.set(-5.5, corridorHeight / 2, 0);
      doorGroup.add(leftWallPart);

      const rightWallPart = new THREE.Mesh(new THREE.BoxGeometry(3.0, corridorHeight, 0.7), sidePartitionMat);
      rightWallPart.position.set(5.5, corridorHeight / 2, 0);
      doorGroup.add(rightWallPart);

      const topHeaderPart = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.9, 0.7), sidePartitionMat);
      topHeaderPart.position.set(0, corridorHeight - 0.95, 0);
      doorGroup.add(topHeaderPart);

      // 3D Overhead Room Signboard mounted right above each doorway
      const signTex = makeSignTexture(signInfo.top, signInfo.title, signInfo.hex);
      const signBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 1.45),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signBoard.position.set(0, 7.55, 0.42);
      doorGroup.add(signBoard);

      // Glowing Neon Doorframe Arch
      const frameColorMat = new THREE.MeshBasicMaterial({ color: accent });
      const leftPillarGlow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.6, 0.76), frameColorMat);
      leftPillarGlow.position.set(-4.05, 3.3, 0);
      doorGroup.add(leftPillarGlow);

      const rightPillarGlow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.6, 0.76), frameColorMat);
      rightPillarGlow.position.set(4.05, 3.3, 0);
      doorGroup.add(rightPillarGlow);

      const topBarGlow = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.16, 0.76), frameColorMat);
      topBarGlow.position.set(0, 6.6, 0);
      doorGroup.add(topBarGlow);

      // Status Light Bar above the door
      const statusLightMat = new THREE.MeshBasicMaterial({ color: accent });
      const statusBar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.32, 0.8), statusLightMat);
      statusBar.position.set(0, 7.25, 0);
      doorGroup.add(statusBar);

      // Left Sliding Door Wing (width 4.05, height 6.5)
      const leftWing = new THREE.Group();
      leftWing.position.set(-2.05, 3.25, 0);
      doorGroup.add(leftWing);

      const wingPanelMat = new THREE.MeshStandardMaterial({
        color: 0x111c35,
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: 0.92,
      });
      const leftMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.5, 0.28), wingPanelMat);
      leftWing.add(leftMesh);

      // Glowing trim & cyber lines on Left Door Wing
      const leftEdgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.4, 0.32), frameColorMat);
      leftEdgeGlow.position.set(1.96, 0, 0);
      leftWing.add(leftEdgeGlow);

      const leftWindowPane = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 3.8, 0.3),
        new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.16,
        })
      );
      leftWindowPane.position.set(-0.2, 0.3, 0);
      leftWing.add(leftWindowPane);

      // Right Sliding Door Wing (width 4.05, height 6.5)
      const rightWing = new THREE.Group();
      rightWing.position.set(2.05, 3.25, 0);
      doorGroup.add(rightWing);

      const rightMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.5, 0.28), wingPanelMat);
      rightWing.add(rightMesh);

      const rightEdgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.4, 0.32), frameColorMat);
      rightEdgeGlow.position.set(-1.96, 0, 0);
      rightWing.add(rightEdgeGlow);

      const rightWindowPane = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 3.8, 0.3),
        new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.16,
        })
      );
      rightWindowPane.position.set(0.2, 0.3, 0);
      rightWing.add(rightWindowPane);

      // Center Cyber Lock Medallion where the two doors meet
      const lockRing = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.68, 6),
        new THREE.MeshBasicMaterial({ color: accent, side: THREE.DoubleSide })
      );
      lockRing.position.set(0, 3.25, 0.22);
      doorGroup.add(lockRing);

      rigs.push({
        doorZ: zPos,
        leftWing,
        rightWing,
        lockRing,
        statusLightMat,
        openProgress: 0,
      });
    });

    doorRigsRef.current = rigs;

    // ============================================================
    // 4. POPULATE EACH OF THE 5 ROOMS WITH 3D PROPS & LIGHTING
    // ============================================================
    const animatedProps: THREE.Object3D[] = [];

    BUILDING_ROOMS.slice(1).forEach((room, rIdx) => {
      const roomCenterZ = room.camZ - 3.5;

      // Room Point Light
      const ptLight = new THREE.PointLight(room.accentNum, 2.4, 22);
      ptLight.position.set(0, 6.8, roomCenterZ);
      scene.add(ptLight);

      // Glowing Ceiling Neon Halo in each room
      const ceilingRing = new THREE.Mesh(
        new THREE.RingGeometry(2.6, 2.85, 32),
        new THREE.MeshBasicMaterial({ color: room.accentNum, side: THREE.DoubleSide })
      );
      ceilingRing.rotation.x = Math.PI / 2;
      ceilingRing.position.set(0, corridorHeight - 0.08, roomCenterZ);
      scene.add(ceilingRing);

      // Side Wall Server Racks / Cyber Pillars / Hologram Pedestals inside each room
      [-5.4, 5.4].forEach((xSide, sIdx) => {
        for (let k = -1; k <= 1; k++) {
          const zProp = roomCenterZ + k * 4.2;
          const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 5.2, 1.4),
            new THREE.MeshStandardMaterial({
              color: 0x0f172a,
              roughness: 0.3,
              metalness: 0.8,
            })
          );
          pillar.position.set(xSide, 2.6, zProp);
          scene.add(pillar);

          // Glowing horizontal LED blades on server racks
          for (let led = 0; led < 4; led++) {
            const blade = new THREE.Mesh(
              new THREE.BoxGeometry(1.46, 0.08, 1.46),
              new THREE.MeshBasicMaterial({ color: room.accentNum })
            );
            blade.position.set(xSide, 1.2 + led * 1.05, zProp);
            scene.add(blade);
          }
        }

        // Floating 3D Hologram Crystal in each room's corners
        const holo = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.65, 0),
          new THREE.MeshBasicMaterial({
            color: room.accentNum,
            wireframe: true,
          })
        );
        holo.position.set(xSide * 0.72, 3.8, roomCenterZ - 1.5 + sIdx * 1.2);
        scene.add(holo);
        animatedProps.push(holo);
      });
    });

    //Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.fov = window.innerWidth < 768 ? 68 : 58;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let rafId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      // Rotate floating room holograms
      animatedProps.forEach((obj, idx) => {
        obj.rotation.y = t * 0.9 + idx;
        obj.rotation.x = Math.sin(t * 0.7 + idx) * 0.4;
      });

      // Subtle breathing camera hover
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(t * 0.6) * 0.12;
      }

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

  // Mouse wheel & mobile swipe navigation to walk forward/backward through doors
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Allow scrolling inside the room content card if it's overflowing
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.room-scrollable-content')) {
        const el = target.closest('.room-scrollable-content') as HTMLElement;
        const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
        const canScrollUp = el.scrollTop > 4;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return;
        }
      }

      const now = performance.now();
      if (now - wheelCooldownRef.current < 1100) return;
      if (Math.abs(e.deltaY) < 28) return;

      wheelCooldownRef.current = now;
      if (e.deltaY > 0 && activeIndexRef.current < BUILDING_ROOMS.length - 1) {
        goToRoom(activeIndexRef.current + 1);
      } else if (e.deltaY < 0 && activeIndexRef.current > 0) {
        goToRoom(activeIndexRef.current - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (activeIndexRef.current < BUILDING_ROOMS.length - 1) {
          goToRoom(activeIndexRef.current + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (activeIndexRef.current > 0) {
          goToRoom(activeIndexRef.current - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentRoom = BUILDING_ROOMS[activeRoomIndex];

  return (
    <div
      className="fixed inset-0 w-screen h-[100dvh] bg-[#050811] overflow-hidden select-none"
      onTouchStart={e => {
        if ((e.target as HTMLElement)?.closest('.room-scrollable-content')) return;
        touchStartYRef.current = e.touches[0].clientY;
      }}
      onTouchEnd={e => {
        if (touchStartYRef.current === null) return;
        const dy = touchStartYRef.current - e.changedTouches[0].clientY;
        touchStartYRef.current = null;
        if (Math.abs(dy) < 50) return;
        if (dy > 0 && activeIndexRef.current < BUILDING_ROOMS.length - 1) {
          goToRoom(activeIndexRef.current + 1);
        } else if (dy < 0 && activeIndexRef.current > 0) {
          goToRoom(activeIndexRef.current - 1);
        }
      }}
    >
      {/* 3D BUILDING & DOORS WEBGL CANVAS */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* ============================================================
          TOP BUILDING DIRECTORY / ELEVATOR FLOOR SELECTOR BAR
          ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-30 px-2.5 sm:px-6 pt-2.5 sm:pt-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 bg-[#070b16]/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 pointer-events-auto shadow-2xl">
            {/* Building Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0"
                style={{
                  borderColor: `${currentRoom.accentHex}66`,
                  backgroundColor: `${currentRoom.accentHex}18`,
                }}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: currentRoom.accentHex }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-white truncate">
                    ALEN HQ // BUILDING TOUR
                  </span>
                  <span
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border"
                    style={{
                      color: currentRoom.accentHex,
                      borderColor: `${currentRoom.accentHex}55`,
                      backgroundColor: `${currentRoom.accentHex}15`,
                    }}
                  >
                    {activeRoomIndex === 0 ? (
                      <>
                        <Lock className="w-2.5 h-2.5" /> EXTERIOR GATES
                      </>
                    ) : (
                      <>
                        <Unlock className="w-2.5 h-2.5" /> DOOR 0{activeRoomIndex} OPEN
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                  {currentRoom.floorLabel} — {currentRoom.roomCode}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={onOpenTerminalModal}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] sm:text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                title="Open Interactive Linux Terminal"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Terminal</span>
              </button>
              <button
                onClick={onOpenResume}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] sm:text-xs flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors"
                title="Open Résumé"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Résumé</span>
              </button>
              <button
                onClick={onSwitchToClassicView}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 font-mono text-[11px] sm:text-xs hover:bg-slate-800 transition-colors"
              >
                Classic Page
              </button>
            </div>
          </div>

          {/* Room-by-Room Door Navigation Pills (Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
            {BUILDING_ROOMS.map((rm, idx) => {
              const isActive = idx === activeRoomIndex;
              const isVisited = idx <= activeRoomIndex;
              return (
                <button
                  key={rm.id}
                  onClick={() => goToRoom(idx)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-lg scale-[1.02]'
                      : isVisited
                      ? 'bg-[#070b16]/80 text-slate-300 border-slate-700/80 hover:border-cyan-500/40'
                      : 'bg-[#070b16]/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: rm.accentHex,
                          boxShadow: `0 0 16px ${rm.accentHex}33`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive || isVisited ? rm.accentHex : '#475569',
                    }}
                  />
                  <span>
                    {idx === 0 ? '00 · Entrance' : `0${idx} · ${rm.id.toUpperCase()}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ============================================================
          ROOM CONTENT HUD PANEL (Shows What Is Inside Each Room!)
          ============================================================ */}
      <div className="fixed inset-x-0 bottom-14 sm:bottom-16 z-20 px-3 sm:px-6 pointer-events-none flex justify-center">
        <div
          className={`w-full max-w-4xl bg-[#070b16]/88 backdrop-blur-xl border rounded-2xl shadow-2xl pointer-events-auto transition-all duration-500 overflow-hidden ${
            isTransitioning ? 'opacity-90 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
          style={{
            borderColor: `${currentRoom.accentHex}55`,
            boxShadow: `0 20px 55px rgba(0,0,0,0.8), 0 0 30px ${currentRoom.accentHex}1f`,
          }}
        >
          {/* Room Header Bar */}
          <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 border-b border-slate-800/90 flex items-center justify-between gap-2 bg-slate-950/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: currentRoom.accentHex }} />
              <div className="min-w-0">
                <span
                  className="text-[10px] sm:text-xs font-mono uppercase tracking-widest block truncate"
                  style={{ color: currentRoom.accentHex }}
                >
                  {currentRoom.floorLabel}
                </span>
                <h2 className="text-sm sm:text-xl font-bold text-white truncate">
                  {currentRoom.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isMobile && (
                <button
                  onClick={() => setCardMinimizedOnMobile(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300"
                >
                  {cardMinimizedOnMobile ? 'Expand Room' : 'See 3D Room'}
                </button>
              )}

              {activeRoomIndex < BUILDING_ROOMS.length - 1 ? (
                <button
                  onClick={() => goToRoom(activeRoomIndex + 1)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono font-bold text-xs text-slate-950 flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  style={{ backgroundColor: currentRoom.accentHex }}
                >
                  <span>
                    {activeRoomIndex === 0
                      ? 'OPEN DOORS & ENTER'
                      : `OPEN DOOR 0${activeRoomIndex + 1}`}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => goToRoom(0)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono font-bold text-xs bg-slate-800 text-white border border-pink-500/40 flex items-center gap-1.5 hover:bg-slate-700 transition-all"
                >
                  <span>EXIT TO LOBBY</span>
                </button>
              )}
            </div>
          </div>

          {/* Room Interior Content Body */}
          {(!isMobile || !cardMinimizedOnMobile) && (
            <div className="p-4 sm:p-6 max-h-[52dvh] sm:max-h-[54dvh] overflow-y-auto room-scrollable-content">
              {/* ROOM 0: EXTERIOR / LOBBY ENTRANCE */}
              {activeRoomIndex === 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <img
                    src="/alen-davis.jpg"
                    alt="Alen Davis K"
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>SOC Analyst L1 · Cybersecurity & Linux System Engineer</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                      {FILM_PORTFOLIO_DATA.protagonist.tagline}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-800">
                      {FILM_PORTFOLIO_DATA.stats.map((st, i) => (
                        <div key={i} className="bg-slate-900/70 rounded-xl p-2 border border-slate-800">
                          <div className="font-mono font-extrabold text-base sm:text-xl text-cyan-400">
                            {st.value}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                            {st.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROOM 1: SKILLS & ARSENAL LAB */}
              {activeRoomIndex === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.skillConstellations.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      className="bg-slate-900/75 border border-emerald-500/25 rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs sm:text-sm mb-2.5">
                        <Cpu className="w-4 h-4 shrink-0" />
                        <span>{group.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.words.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/25 text-slate-200 font-mono text-[11px]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ROOM 2: EXPERIENCE & SERVER COMMAND */}
              {activeRoomIndex === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/75 border border-sky-500/30 rounded-xl p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono text-[10px]">
                            {exp.location}
                          </span>
                          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          {exp.role}
                        </h3>
                        <p className="font-mono text-xs text-sky-400 mb-2">
                          @ {exp.organization}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {exp.highlight}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ROOM 3: PROJECTS R&D LAB */}
              {activeRoomIndex === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300">
                            {proj.kicker}
                          </span>
                          <span className="font-mono font-extrabold text-sm text-purple-400">
                            #{proj.numeral}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white mb-1.5">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {proj.summary}
                        </p>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {proj.tech.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-200 font-mono text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-300 hover:text-white"
                        >
                          <span>Inspect Repository</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ROOM 4: EDUCATION & CREDENTIALS VAULT */}
              {activeRoomIndex === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs sm:text-sm mb-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>ACADEMIC DEGREE & DIPLOMA</span>
                    </div>
                    <h3 className="font-bold text-base text-white">
                      {FILM_PORTFOLIO_DATA.education.degree}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-300 font-mono mt-0.5">
                      {FILM_PORTFOLIO_DATA.education.institution}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">
                      {FILM_PORTFOLIO_DATA.education.location}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FILM_PORTFOLIO_DATA.education.credentials.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-200 font-mono text-[11px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs sm:text-sm mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>VERIFIED CERTIFICATIONS & WORKSHOPS</span>
                    </div>
                    <div className="space-y-2">
                      {FILM_PORTFOLIO_DATA.achievements.list.map((ach, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                        >
                          <span className="font-semibold text-xs text-white">
                            ✦ {ach.title}
                          </span>
                          <span className="font-mono text-[11px] text-amber-300">
                            {ach.issuer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROOM 5: EXECUTIVE PENTHOUSE CONTACT & RÉSUMÉ */}
              {activeRoomIndex === 5 && (
                <div className="flex flex-col items-center text-center py-1">
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-4">
                    {FILM_PORTFOLIO_DATA.contact.invitation}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                    <a
                      href={`mailto:${FILM_PORTFOLIO_DATA.contact.email}`}
                      className="px-4 py-2.5 rounded-xl bg-pink-500/20 border border-pink-500/50 text-white font-mono text-xs sm:text-sm flex items-center gap-2 hover:bg-pink-500/30 transition-all"
                    >
                      <Mail className="w-4 h-4 text-pink-400" />
                      <span>{FILM_PORTFOLIO_DATA.contact.email}</span>
                    </a>

                    <a
                      href={`tel:${FILM_PORTFOLIO_DATA.contact.phone.replace(/\s+/g, '')}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs sm:text-sm flex items-center gap-2 hover:border-pink-500/50 transition-all"
                    >
                      <Phone className="w-4 h-4 text-pink-400" />
                      <span>{FILM_PORTFOLIO_DATA.contact.phone}</span>
                    </a>

                    <a
                      href={FILM_PORTFOLIO_DATA.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs sm:text-sm flex items-center gap-2 hover:border-pink-500/50 transition-all"
                    >
                      <Code2 className="w-4 h-4 text-pink-400" />
                      <span>GitHub @alend66</span>
                    </a>

                    <a
                      href={FILM_PORTFOLIO_DATA.contact.resumePdf}
                      download="Alen_Davis_K_Resume.pdf"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-slate-950 font-mono font-bold text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Résumé PDF</span>
                    </a>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" />
                    <span>{FILM_PORTFOLIO_DATA.protagonist.location}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          BOTTOM DOOR WALKTHROUGH CONTROLS & PROGRESS DOTS
          ============================================================ */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 py-2.5 bg-[#050811]/90 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => goToRoom(activeRoomIndex - 1)}
          disabled={activeRoomIndex === 0}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 disabled:opacity-35 hover:border-cyan-500/50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev Room</span>
        </button>

        <div className="flex items-center gap-2">
          {BUILDING_ROOMS.map((rm, idx) => (
            <button
              key={rm.id}
              onClick={() => goToRoom(idx)}
              className="group flex items-center gap-1"
              title={rm.title}
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  idx === activeRoomIndex ? 'w-7' : 'w-2 opacity-50 hover:opacity-90'
                }`}
                style={{
                  backgroundColor:
                    idx <= activeRoomIndex ? rm.accentHex : '#475569',
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => goToRoom(activeRoomIndex + 1)}
          disabled={activeRoomIndex === BUILDING_ROOMS.length - 1}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 disabled:opacity-35 hover:border-cyan-500/50 transition-all"
        >
          <span>Next Door</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
