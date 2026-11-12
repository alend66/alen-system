import React, { useEffect, useRef, useState } from 'react';
import { FILM_PORTFOLIO_DATA } from '../data/portfolio';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  DoorOpen,
  ExternalLink,
  Eye,
  EyeOff,
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
  CheckCircle2,
} from 'lucide-react';

interface BuildingPortfolioProps {
  onOpenResume: () => void;
  onOpenTerminalModal: () => void;
  onSwitchToClassicView: () => void;
}

export interface InfoparkRoom {
  id: string;
  floorBadge: string;
  wingCode: string;
  doorEtching: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackPhotoUrl: string;
  accentColor: string;
}

export const INFOPARK_ROOMS: InfoparkRoom[] = [
  {
    id: 'exterior',
    floorBadge: 'GROUND LEVEL · MAIN PLAZA',
    wingCode: 'INFOPARK CAMPUS // TOWER A',
    doorEtching: 'ALEN SYSTEMS // MAIN ENTRANCE LOBBY',
    title: 'INFOPARK CYBERSECURITY & LINUX HQ',
    subtitle:
      'Welcome to the main glass entrance of Alen Davis K’s corporate campus. Open the automatic glass doors to walk into each department.',
    imageUrl: '/infopark/infopark_exterior.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#38bdf8',
  },
  {
    id: 'skills',
    floorBadge: 'FLOOR 01 · WING A',
    wingCode: 'SOC // SECURITY OPERATIONS',
    doorEtching: 'WING 01 // SIEM & CYBERSECURITY ARSENAL',
    title: 'SECURITY OPERATIONS & SKILLS CENTER',
    subtitle:
      'Inside Wing 01: Enterprise SIEM threat hunting with Splunk, Linux server administration, and network defence.',
    imageUrl: '/infopark/infopark_soc_skills.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#10b981',
  },
  {
    id: 'experience',
    floorBadge: 'FLOOR 02 · WING B',
    wingCode: 'DATA CENTER & FORENSICS LAB',
    doorEtching: 'WING 02 // SERVER OPS & CYBER FORENSICS',
    title: 'EXPERIENCE & SERVER OPERATIONS FLOOR',
    subtitle:
      'Inside Wing 02: Real-world operations across Police Cyber Cell (Thrissur), HashRoot (Kochi), and DNS Solutions.',
    imageUrl: '/infopark/infopark_server_operations.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#0ea5e9',
  },
  {
    id: 'projects',
    floorBadge: 'FLOOR 03 · WING C',
    wingCode: 'R&D ENGINEERING & IOT LAB',
    doorEtching: 'WING 03 // R&D SECURITY & HARDWARE LABS',
    title: 'PROJECTS & ENGINEERING R&D LAB',
    subtitle:
      'Inside Wing 03: Splunk SIEM Threat Detection Lab, Python File Integrity Engine, and ESP32 RFID Access Control.',
    imageUrl: '/infopark/infopark_rd_lab.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#a855f7',
  },
  {
    id: 'credentials',
    floorBadge: 'FLOOR 04 · WING D',
    wingCode: 'ACADEMY & CREDENTIALS GALLERY',
    doorEtching: 'WING 04 // ACADEMIC & CERTIFICATION HALL',
    title: 'EDUCATION & CREDENTIALS BOARDROOM',
    subtitle:
      'Inside Wing 04: B.Sc. Computer Science (Sahrdaya College), ADCD v3 Diploma (Red Team Hackers Academy), and Forensics Certifications.',
    imageUrl: '/infopark/infopark_academy_hall.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#f59e0b',
  },
  {
    id: 'contact',
    floorBadge: 'TOP FLOOR · SKY LOUNGE',
    wingCode: 'EXECUTIVE RECEPTION & COMMS',
    doorEtching: 'WING 05 // EXECUTIVE SKY LOUNGE & HIRING DESK',
    title: 'EXECUTIVE SKY LOUNGE & CONTACT SUITE',
    subtitle:
      'Overlooking the Infopark campus: Connect directly via email, phone, GitHub, or download the complete PDF résumé.',
    imageUrl: '/infopark/infopark_sky_lounge.jpg',
    fallbackPhotoUrl:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=85',
    accentColor: '#ec4899',
  },
];

export const BuildingPortfolio: React.FC<BuildingPortfolioProps> = ({
  onOpenResume,
  onOpenTerminalModal,
  onSwitchToClassicView,
}) => {
  const [activeRoomIndex, setActiveRoomIndex] = useState<number>(0);
  // Doors start closed at the main entrance so the user sees the real Infopark glass doors slide open!
  const [doorsOpen, setDoorsOpen] = useState<boolean>(false);
  const [doorSensorState, setDoorSensorState] = useState<'locked' | 'unlocking' | 'open'>('locked');
  const [cameraZooming, setCameraZooming] = useState<boolean>(false);
  const [hideHudPanel, setHideHudPanel] = useState<boolean>(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const activeIndexRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const wheelCooldownRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  // Preload all room photographs
  useEffect(() => {
    INFOPARK_ROOMS.forEach(rm => {
      const img = new Image();
      img.src = rm.imageUrl;
    });
  }, []);

  /**
   * Opens the realistic sliding glass doors and steps into the target room!
   */
  const navigateToRoom = (targetIdx: number) => {
    const clamped = Math.max(0, Math.min(INFOPARK_ROOMS.length - 1, targetIdx));
    if (isAnimatingRef.current) return;

    // If we are on the exterior with closed doors and clicking "Enter", first open the doors into the lobby or room 1
    isAnimatingRef.current = true;

    // Step 1: Close doors briefly if changing rooms, or unlock & slide open if currently closed
    if (clamped === activeIndexRef.current && !doorsOpen) {
      setDoorSensorState('unlocking');
      setTimeout(() => {
        setDoorSensorState('open');
        setDoorsOpen(true);
        isAnimatingRef.current = false;
      }, 450);
      return;
    }

    // Close glass doors for transition between floors/wings, switch background photo with walk-in zoom, then slide glass doors wide open!
    setDoorsOpen(false);
    setDoorSensorState('unlocking');
    setCameraZooming(true);

    setTimeout(() => {
      activeIndexRef.current = clamped;
      setActiveRoomIndex(clamped);
    }, 420);

    setTimeout(() => {
      setDoorSensorState('open');
      setDoorsOpen(true);
      setCameraZooming(false);
      isAnimatingRef.current = false;
    }, 920);
  };

  // Auto-open the entrance doors 1.1 seconds after arrival so the user immediately sees the glass doors slide open!
  useEffect(() => {
    const timer = setTimeout(() => {
      setDoorSensorState('unlocking');
      setTimeout(() => {
        setDoorSensorState('open');
        setDoorsOpen(true);
      }, 400);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Scroll wheel & keyboard navigation to walk from room to room
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.infopark-room-scroll')) {
        const el = target.closest('.infopark-room-scroll') as HTMLElement;
        const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
        const canUp = el.scrollTop > 4;
        if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) {
          return;
        }
      }

      const now = performance.now();
      if (now - wheelCooldownRef.current < 1250) return;
      if (Math.abs(e.deltaY) < 30) return;

      wheelCooldownRef.current = now;
      if (e.deltaY > 0 && activeIndexRef.current < INFOPARK_ROOMS.length - 1) {
        navigateToRoom(activeIndexRef.current + 1);
      } else if (e.deltaY < 0 && activeIndexRef.current > 0) {
        navigateToRoom(activeIndexRef.current - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (activeIndexRef.current < INFOPARK_ROOMS.length - 1) {
          navigateToRoom(activeIndexRef.current + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (activeIndexRef.current > 0) {
          navigateToRoom(activeIndexRef.current - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [doorsOpen]);

  const currentRoom = INFOPARK_ROOMS[activeRoomIndex];
  const nextRoom =
    activeRoomIndex < INFOPARK_ROOMS.length - 1
      ? INFOPARK_ROOMS[activeRoomIndex + 1]
      : INFOPARK_ROOMS[0];

  const activePhotoSrc = imgErrors[currentRoom.id]
    ? currentRoom.fallbackPhotoUrl
    : currentRoom.imageUrl;

  return (
    <div
      className="fixed inset-0 w-screen h-[100dvh] bg-[#040710] overflow-hidden select-none"
      onTouchStart={e => {
        if ((e.target as HTMLElement)?.closest('.infopark-room-scroll')) return;
        touchStartYRef.current = e.touches[0].clientY;
      }}
      onTouchEnd={e => {
        if (touchStartYRef.current === null) return;
        const dy = touchStartYRef.current - e.changedTouches[0].clientY;
        touchStartYRef.current = null;
        if (Math.abs(dy) < 50) return;
        if (dy > 0 && activeIndexRef.current < INFOPARK_ROOMS.length - 1) {
          navigateToRoom(activeIndexRef.current + 1);
        } else if (dy < 0 && activeIndexRef.current > 0) {
          navigateToRoom(activeIndexRef.current - 1);
        }
      }}
    >
      {/* ============================================================
          1. PHOTOREALISTIC INFOPARK BUILDING / ROOM BACKGROUND PHOTO
          ============================================================ */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          key={currentRoom.id}
          src={activePhotoSrc}
          alt={currentRoom.title}
          onError={() =>
            setImgErrors(prev => ({
              ...prev,
              [currentRoom.id]: true,
            }))
          }
          className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
            cameraZooming
              ? 'scale-110 blur-[2px] brightness-75'
              : doorsOpen
              ? 'scale-105 blur-0 brightness-95'
              : 'scale-100 blur-[1px] brightness-75'
          }`}
        />

        {/* Subtle Architectural Depth & Legibility Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,7,16,0.68) 0%, rgba(4,7,16,0.12) 38%, rgba(4,7,16,0.22) 62%, rgba(4,7,16,0.82) 100%)',
          }}
        />
      </div>

      {/* ============================================================
          2. REALISTIC CORPORATE AUTOMATIC SLIDING GLASS DOORS RIG
          ============================================================ */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Top Brushed-Aluminum Automatic Door Sensor Transom Beam */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-900/75 border-b-2 border-slate-600/60 shadow-2xl flex items-end justify-center pb-1.5">
          <div className="px-4 py-1 rounded-full bg-slate-950/90 border border-slate-700 flex items-center gap-2.5 shadow-inner">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                doorSensorState === 'open'
                  ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                  : doorSensorState === 'unlocking'
                  ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping'
                  : 'bg-cyan-400 shadow-[0_0_10px_#38bdf8]'
              }`}
            />
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase text-slate-200 font-semibold">
              {doorSensorState === 'open'
                ? `AUTOMATIC GLASS DOORS OPEN · ${currentRoom.wingCode}`
                : 'SENSOR ACTIVE · OPENING GLASS DOORS...'}
            </span>
          </div>
        </div>

        {/* Left & Right Fixed Structural Steel Frame Mullions at Screen Edges */}
        <div className="hidden sm:block absolute top-20 bottom-0 left-0 w-5 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900 border-r border-slate-600/60 z-20" />
        <div className="hidden sm:block absolute top-20 bottom-0 right-0 w-5 bg-gradient-to-l from-slate-950 via-slate-800 to-slate-900 border-l border-slate-600/60 z-20" />

        {/* LEFT AUTOMATIC SLIDING TEMPERED GLASS DOOR WING */}
        <div
          className={`absolute top-20 sm:top-24 bottom-0 left-0 w-1/2 transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            doorsOpen
              ? '-translate-x-[92%] sm:-translate-x-[89%]'
              : 'translate-x-0'
          }`}
        >
          <div className="w-full h-full relative bg-gradient-to-br from-sky-100/[0.11] via-slate-900/[0.45] to-slate-950/[0.65] backdrop-blur-md border-r-[6px] border-slate-300/60 shadow-[20px_0_50px_rgba(0,0,0,0.75)] overflow-hidden">
            {/* Diagonal realistic glass reflection streak */}
            <div className="absolute -inset-y-12 left-1/4 w-32 rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Top & Bottom Brushed Steel Door Shoes */}
            <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-slate-400/50 to-slate-800/80 border-b border-slate-400/40" />
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-slate-400/60 via-slate-700/80 to-slate-900/90 border-t border-slate-400/40" />

            {/* Corporate Frosted Glass Manifestation Band Across Mid-Door */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-24 bg-white/[0.12] backdrop-blur-xl border-y border-white/30 flex flex-col justify-center items-end pr-8 sm:pr-12">
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.28em] text-cyan-200 uppercase font-bold">
                INFOPARK // KOCHI · KERALA
              </span>
              <span className="font-sans font-extrabold text-sm sm:text-xl tracking-wider text-white uppercase mt-0.5">
                ALEN DAVIS K
              </span>
              <span className="font-mono text-[9px] sm:text-[11px] text-slate-300 tracking-widest">
                {currentRoom.doorEtching}
              </span>
            </div>

            {/* Brushed Stainless Steel Vertical Pull Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 w-2.5 sm:w-3 h-40 rounded-full bg-gradient-to-r from-slate-200 via-white to-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-slate-300" />
          </div>
        </div>

        {/* RIGHT AUTOMATIC SLIDING TEMPERED GLASS DOOR WING */}
        <div
          className={`absolute top-20 sm:top-24 bottom-0 right-0 w-1/2 transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            doorsOpen
              ? 'translate-x-[92%] sm:translate-x-[89%]'
              : 'translate-x-0'
          }`}
        >
          <div className="w-full h-full relative bg-gradient-to-bl from-sky-100/[0.11] via-slate-900/[0.45] to-slate-950/[0.65] backdrop-blur-md border-l-[6px] border-slate-300/60 shadow-[-20px_0_50px_rgba(0,0,0,0.75)] overflow-hidden">
            {/* Diagonal realistic glass reflection streak */}
            <div className="absolute -inset-y-12 right-1/3 w-32 rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Top & Bottom Brushed Steel Door Shoes */}
            <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-slate-400/50 to-slate-800/80 border-b border-slate-400/40" />
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-slate-400/60 via-slate-700/80 to-slate-900/90 border-t border-slate-400/40" />

            {/* Corporate Frosted Glass Manifestation Band Across Mid-Door */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-24 bg-white/[0.12] backdrop-blur-xl border-y border-white/30 flex flex-col justify-center items-start pl-8 sm:pl-12">
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.28em] text-emerald-300 uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                AUTHORIZED ACCESS
              </span>
              <span className="font-sans font-extrabold text-sm sm:text-xl tracking-wider text-white uppercase mt-0.5">
                {currentRoom.wingCode}
              </span>
              <span className="font-mono text-[9px] sm:text-[11px] text-slate-300 tracking-widest">
                SOC L1 · LINUX SYSTEMS · CYBER FORENSICS
              </span>
            </div>

            {/* Brushed Stainless Steel Vertical Pull Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-6 w-2.5 sm:w-3 h-40 rounded-full bg-gradient-to-r from-slate-400 via-white to-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-slate-300" />
          </div>
        </div>
      </div>

      {/* ============================================================
          3. TOP INFOPARK CAMPUS DIRECTORY & FLOOR NAVIGATION BAR
          ============================================================ */}
      <header className="fixed top-2 sm:top-3 left-0 right-0 z-30 px-2.5 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 pointer-events-auto shadow-2xl">
            {/* Infopark Campus Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0"
                style={{
                  borderColor: `${currentRoom.accentColor}66`,
                  backgroundColor: `${currentRoom.accentColor}20`,
                }}
              >
                <Building2
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: currentRoom.accentColor }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-extrabold text-xs sm:text-sm text-white tracking-wide truncate">
                    INFOPARK // ALEN DAVIS K HQ
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {doorsOpen ? (
                      <>
                        <Unlock className="w-2.5 h-2.5" /> GLASS DOORS OPEN
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5" /> DOORS CLOSED
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-slate-300 truncate">
                  {currentRoom.floorBadge} · {currentRoom.wingCode}
                </p>
              </div>
            </div>

            {/* Right Controls: Door Toggle, Full Building Photo Toggle, Terminal, Resume */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setDoorsOpen(prev => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors"
                title="Open or Close the Sliding Glass Doors"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {doorsOpen ? 'Close Doors' : 'Open Doors'}
                </span>
              </button>

              <button
                onClick={() => setHideHudPanel(prev => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                title="View Full Real Building Room Unobstructed"
              >
                {hideHudPanel ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Show Info</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Full Room View</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenTerminalModal}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                title="Open Interactive Linux Terminal"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Terminal</span>
              </button>

              <button
                onClick={onOpenResume}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Résumé</span>
              </button>

              <button
                onClick={onSwitchToClassicView}
                className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800 transition-colors"
              >
                Classic Page
              </button>
            </div>
          </div>

          {/* Floor / Wing Directory Bar (Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
            {INFOPARK_ROOMS.map((rm, idx) => {
              const isActive = idx === activeRoomIndex;
              return (
                <button
                  key={rm.id}
                  onClick={() => navigateToRoom(idx)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-slate-950 text-white font-bold shadow-lg scale-[1.02]'
                      : 'bg-slate-950/75 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: rm.accentColor,
                          boxShadow: `0 0 18px ${rm.accentColor}40`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive ? rm.accentColor : '#64748b',
                    }}
                  />
                  <span>
                    {idx === 0
                      ? '00 · Exterior Entrance'
                      : `0${idx} · ${rm.id.toUpperCase()}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ============================================================
          4. ROOM CONTENT OVERLAY PANEL (Inside the Open Glass Doors)
          ============================================================ */}
      {!hideHudPanel && (
        <div
          className={`fixed inset-x-0 bottom-14 sm:bottom-16 z-20 px-3 sm:px-6 pointer-events-none flex justify-center transition-all duration-500 ${
            doorsOpen
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          <div
            className="w-full max-w-4xl bg-slate-950/82 backdrop-blur-xl border rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            style={{
              borderColor: `${currentRoom.accentColor}66`,
              boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 32px ${currentRoom.accentColor}22`,
            }}
          >
            {/* Room Header Bar */}
            <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 border-b border-slate-800/90 flex items-center justify-between gap-2 bg-slate-900/75">
              <div className="flex items-center gap-2.5 min-w-0">
                <DoorOpen
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                  style={{ color: currentRoom.accentColor }}
                />
                <div className="min-w-0">
                  <span
                    className="text-[10px] sm:text-xs font-mono uppercase tracking-widest block truncate"
                    style={{ color: currentRoom.accentColor }}
                  >
                    {currentRoom.floorBadge} — {currentRoom.wingCode}
                  </span>
                  <h2 className="text-sm sm:text-xl font-bold text-white truncate">
                    {currentRoom.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() =>
                  navigateToRoom(
                    activeRoomIndex < INFOPARK_ROOMS.length - 1 ? activeRoomIndex + 1 : 0
                  )
                }
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono font-bold text-xs text-slate-950 flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0"
                style={{ backgroundColor: currentRoom.accentColor }}
              >
                <span>
                  {activeRoomIndex === 0
                    ? 'ENTER BUILDING (WING 01)'
                    : activeRoomIndex < INFOPARK_ROOMS.length - 1
                    ? `NEXT: ${nextRoom.id.toUpperCase()} WING`
                    : 'RETURN TO MAIN ENTRANCE'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Room Body Content */}
            <div className="p-4 sm:p-5 max-h-[46dvh] sm:max-h-[48dvh] overflow-y-auto infopark-room-scroll">
              {/* EXTERIOR: MAIN ENTRANCE LOBBY */}
              {activeRoomIndex === 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <img
                    src="/alen-davis.jpg"
                    alt="Alen Davis K"
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-sky-400 shadow-lg shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-mono mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>SOC Analyst L1 · Cybersecurity & Linux System Engineer</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                      {FILM_PORTFOLIO_DATA.protagonist.tagline}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-800">
                      {FILM_PORTFOLIO_DATA.stats.map((st, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/80 rounded-xl p-2 border border-slate-800"
                        >
                          <div className="font-mono font-extrabold text-base sm:text-xl text-sky-400">
                            {st.value}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-300 leading-tight">
                            {st.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WING 01: SKILLS & SOC ARSENAL */}
              {activeRoomIndex === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.skillConstellations.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      className="bg-slate-900/85 border border-emerald-500/30 rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs sm:text-sm mb-2.5">
                        <Cpu className="w-4 h-4 shrink-0" />
                        <span>{group.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.words.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-slate-100 font-mono text-[11px]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WING 02: EXPERIENCE & SERVER OPERATIONS */}
              {activeRoomIndex === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/85 border border-sky-500/35 rounded-xl p-3.5 flex flex-col justify-between"
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
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {exp.highlight}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WING 03: PROJECTS & R&D ENGINEERING LAB */}
              {activeRoomIndex === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {FILM_PORTFOLIO_DATA.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/85 border border-purple-500/35 rounded-xl p-3.5 flex flex-col justify-between"
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
                        <p className="text-xs text-slate-200 leading-relaxed mb-3">
                          {proj.summary}
                        </p>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {proj.tech.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 font-mono text-[10px]"
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
                          <span>View on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WING 04: EDUCATION & CREDENTIALS BOARDROOM */}
              {activeRoomIndex === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/85 border border-amber-500/35 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs sm:text-sm mb-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>DEGREE & CYBER DEFENCE DIPLOMA</span>
                    </div>
                    <h3 className="font-bold text-base text-white">
                      {FILM_PORTFOLIO_DATA.education.degree}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-300 font-mono mt-0.5">
                      {FILM_PORTFOLIO_DATA.education.institution}
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5 mb-3">
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

                  <div className="bg-slate-900/85 border border-amber-500/35 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs sm:text-sm mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>CERTIFICATIONS & CONFERENCES</span>
                    </div>
                    <div className="space-y-2">
                      {FILM_PORTFOLIO_DATA.achievements.list.map((ach, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
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

              {/* WING 05: EXECUTIVE SKY LOUNGE & CONTACT */}
              {activeRoomIndex === 5 && (
                <div className="flex flex-col items-center text-center py-1">
                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl mb-4">
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
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs sm:text-sm flex items-center gap-2 hover:border-pink-500/50 transition-all"
                    >
                      <Phone className="w-4 h-4 text-pink-400" />
                      <span>{FILM_PORTFOLIO_DATA.contact.phone}</span>
                    </a>

                    <a
                      href={FILM_PORTFOLIO_DATA.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs sm:text-sm flex items-center gap-2 hover:border-pink-500/50 transition-all"
                    >
                      <Code2 className="w-4 h-4 text-pink-400" />
                      <span>GitHub @alend66</span>
                    </a>

                    <a
                      href={FILM_PORTFOLIO_DATA.contact.resumePdf}
                      download="Alen_Davis_K_Resume.pdf"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-sky-400 text-slate-950 font-mono font-bold text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Résumé PDF</span>
                    </a>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
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
          5. BOTTOM FLOOR-TO-FLOOR NAVIGATION BAR
          ============================================================ */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => navigateToRoom(activeRoomIndex - 1)}
          disabled={activeRoomIndex === 0}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 disabled:opacity-35 hover:border-sky-500/50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev Wing</span>
        </button>

        <div className="flex items-center gap-2">
          {INFOPARK_ROOMS.map((rm, idx) => (
            <button
              key={rm.id}
              onClick={() => navigateToRoom(idx)}
              className="group flex items-center gap-1"
              title={rm.title}
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  idx === activeRoomIndex ? 'w-7' : 'w-2 opacity-50 hover:opacity-90'
                }`}
                style={{
                  backgroundColor:
                    idx <= activeRoomIndex ? rm.accentColor : '#475569',
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigateToRoom(activeRoomIndex + 1)}
          disabled={activeRoomIndex === INFOPARK_ROOMS.length - 1}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 disabled:opacity-35 hover:border-sky-500/50 transition-all"
        >
          <span>Next Door</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
