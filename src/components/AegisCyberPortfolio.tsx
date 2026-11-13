import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PORTFOLIO_CONTENT } from '../content';
import { Terminal } from './Terminal';
import {
  Activity,
  AlertTriangle,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  FileText,
  Fingerprint,
  Globe,
  GraduationCap,
  HardDrive,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Menu,
  Network,
  Play,
  Radar,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal as TerminalIcon,
  Unlock,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

interface AegisCyberPortfolioProps {
  onOpenResume: () => void;
  onOpenCommandPalette: () => void;
}

interface AttackScenario {
  id: 'bruteforce' | 'fim' | 'rfid' | 'forensics';
  code: string;
  name: string;
  mitreId: string;
  threatVector: string;
  attackerOrigin: string;
  targetAsset: string;
  defenseSystem: string;
  detectionQuery: string;
  logs: Array<{
    time: string;
    level: 'CRITICAL' | 'WARN' | 'DEFENSE' | 'RESOLVED';
    msg: string;
  }>;
  outcomeMetric: string;
  accentColor: string;
}

const LIVE_SCENARIOS: AttackScenario[] = [
  {
    id: 'bruteforce',
    code: 'SIM-01 // SIEM',
    name: 'SSH & WinEvent 4625 Brute-Force Flood',
    mitreId: 'MITRE T1110.001 · Password Guessing',
    threatVector: '482 failed authentication attempts in 18 seconds across port 22 & SMB',
    attackerOrigin: '185.220.101.42 (TOR Exit Relay)',
    targetAsset: 'Ubuntu-Prod-01 & WinServer-AD-DC01',
    defenseSystem: 'Splunk Enterprise SIEM + Universal Forwarder + Sysmon',
    detectionQuery:
      'index=main (EventCode=4625 OR "Failed password") | bin _time span=1m | stats count by src_ip, user | where count > 15',
    logs: [
      {
        time: '16:24:01.104',
        level: 'CRITICAL',
        msg: 'EventID=4625 Logon Failure user=administrator src_ip=185.220.101.42 (Attempt 142/min)',
      },
      {
        time: '16:24:01.410',
        level: 'WARN',
        msg: 'sshd[19402]: Failed password for invalid user root from 185.220.101.42 port 51892 ssh2',
      },
      {
        time: '16:24:02.008',
        level: 'DEFENSE',
        msg: 'SPLUNK ALERT TRIGGERED: [ALEN-SOC-RULE-01] High-Velocity Brute Force Detected',
      },
      {
        time: '16:24:02.390',
        level: 'RESOLVED',
        msg: 'FIREWALL ACL APPLIED: iptables -A INPUT -s 185.220.101.42 -j DROP (Threat Neutralized)',
      },
    ],
    outcomeMetric: 'Detected & Blocked in 1.28s via SPL Correlation',
    accentColor: '#00f0ff',
  },
  {
    id: 'fim',
    code: 'SIM-02 // FIM',
    name: 'Unauthorized /etc/ssh/sshd_config Tampering',
    mitreId: 'MITRE T1543 · System Configuration Modification',
    threatVector: 'Silent modification of PermitRootLogin in /etc/ssh/sshd_config',
    attackerOrigin: 'Compromised Service Process (PID 4819)',
    targetAsset: 'CentOS-Core-Node-04 (/etc/ssh/sshd_config)',
    defenseSystem: 'Python File Integrity & SHA-256 Hash Monitor (hashlib)',
    detectionQuery:
      'python3 fim_monitor.py --target /etc/ssh --algo sha256 --verify-baseline /var/lib/fim/baseline.json',
    logs: [
      {
        time: '16:25:10.012',
        level: 'WARN',
        msg: 'inotify_watch: Write close event on /etc/ssh/sshd_config (size +24 bytes)',
      },
      {
        time: '16:25:10.019',
        level: 'CRITICAL',
        msg: 'SHA-256 MISMATCH! Expected: 8f434346648f6b96... Found: e3b0c44298fc1c14...',
      },
      {
        time: '16:25:10.140',
        level: 'DEFENSE',
        msg: 'PYTHON FIM ENGINE: Quarantined modified config & alerted SOC administrator',
      },
      {
        time: '16:25:10.620',
        level: 'RESOLVED',
        msg: 'BASELINE RESTORED: Verified clean SHA-256 hash 8f434346648f6b96 on /etc/ssh/sshd_config',
      },
    ],
    outcomeMetric: 'Tamper Caught in 7ms via SHA-256 Baseline Diff',
    accentColor: '#00ff9d',
  },
  {
    id: 'rfid',
    code: 'SIM-03 // IOT-HW',
    name: 'Cloned RFID Badge Intrusion at Server Room',
    mitreId: 'Physical Layer · Unauthorized UID Spoofing',
    threatVector: 'Unregistered 13.56MHz MIFARE tag presented at Server Room Gate',
    attackerOrigin: 'Physical Perimeter Reader #01 (SPI Bus)',
    targetAsset: 'Datacenter Rack Corridor Door Relay',
    defenseSystem: 'ESP32 Microcontroller + MFRC522 RFID Hardware Access Control',
    detectionQuery:
      'SPI.transfer(MFRC522::PICC_ReadCardSerial) -> verifyUID(uidBuffer, AUTHORIZED_VAULT_UIDS)',
    logs: [
      {
        time: '16:26:44.200',
        level: 'WARN',
        msg: 'MFRC522 RF Field Active: Tag detected on SPI bus (MOSI=23, MISO=19, SCK=18, SDA=5)',
      },
      {
        time: '16:26:44.215',
        level: 'CRITICAL',
        msg: 'UID READ [DE:AD:BE:EF] -> NOT FOUND in ESP32 cryptographic EEPROM whitelist!',
      },
      {
        time: '16:26:44.220',
        level: 'DEFENSE',
        msg: 'ESP32 GPIO-26 RELAY LOCKED: Denied physical strike-plate activation + triggered buzzer',
      },
      {
        time: '16:26:44.500',
        level: 'RESOLVED',
        msg: 'SERIAL TELEMETRY LOGGED: Physical intrusion attempt recorded to SIEM collector',
      },
    ],
    outcomeMetric: 'Physical Intrusion Blocked at Hardware Layer (<15ms)',
    accentColor: '#a855f7',
  },
  {
    id: 'forensics',
    code: 'SIM-04 // CYBER-CELL',
    name: 'Spear-Phishing & Seized Device Forensic Triage',
    mitreId: 'MITRE T1566 · Phishing Infrastructure & Disk Triage',
    threatVector: 'Spoofed banking domain & deleted artifacts across seized storage media',
    attackerOrigin: 'Malicious C2 & Phishing Relay Infrastructure',
    targetAsset: '15+ Seized Devices & 40+ Phishing Email Headers',
    defenseSystem: 'OSINT Header/Domain Analysis + Section 65B Forensic Verification',
    detectionQuery:
      'forensic-triage --verify-image /dev/sdb --hash sha256 --extract-headers --section-65b-report',
    logs: [
      {
        time: '16:28:05.100',
        level: 'WARN',
        msg: 'OSINT Trace: Extracted Received-SPF Fail & rogue registrar hop from phishing header',
      },
      {
        time: '16:28:05.480',
        level: 'DEFENSE',
        msg: 'Correlated suspect IP logs across 10+ financial fraud investigation dockets',
      },
      {
        time: '16:28:06.110',
        level: 'DEFENSE',
        msg: 'Write-blocked forensic acquisition completed; SHA-256 evidentiary image verified',
      },
      {
        time: '16:28:06.890',
        level: 'RESOLVED',
        msg: 'SECTION 65B IT ACT CERTIFICATE GENERATED: Digital evidence admissible for prosecution',
      },
    ],
    outcomeMetric: '15+ Devices & 40+ Phishing Domains Forensically Triaged',
    accentColor: '#f59e0b',
  },
];

export const AegisCyberPortfolio: React.FC<AegisCyberPortfolioProps> = ({
  onOpenResume,
  onOpenCommandPalette,
}) => {
  const globeMountRef = useRef<HTMLDivElement | null>(null);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [simState, setSimState] = useState<'idle' | 'attacking' | 'defended'>('defended');
  const [visibleLogCount, setVisibleLogCount] = useState<number>(4);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  // Interactive Project Sandbox 1 (Splunk SIEM Query Runner)
  const [splunkPreset, setSplunkPreset] = useState<'bruteforce' | 'privesc' | 'sudo'>('bruteforce');

  // Interactive Project Sandbox 2 (Python SHA-256 FIM Tester)
  const [fimFiles, setFimFiles] = useState([
    {
      path: '/etc/ssh/sshd_config',
      baselineHash: '8f434346648f6b96df89dda901c5176b',
      currentHash: '8f434346648f6b96df89dda901c5176b',
      tampered: false,
    },
    {
      path: '/etc/passwd',
      baselineHash: '2c26b46b68ffc68ff99b453c1d304134',
      currentHash: '2c26b46b68ffc68ff99b453c1d304134',
      tampered: false,
    },
    {
      path: '/etc/sudoers',
      baselineHash: '4b227777d4dd1fc61c6f884f48641d02',
      currentHash: '4b227777d4dd1fc61c6f884f48641d02',
      tampered: false,
    },
  ]);

  // Interactive Project Sandbox 3 (ESP32 + MFRC522 RFID Tester)
  const [rfidLastScan, setRfidLastScan] = useState<{
    uid: string;
    owner: string;
    authorized: boolean;
    timestamp: string;
  }>({
    uid: '4A : 8F : 21 : C9',
    owner: 'ALEN DAVIS K (SOC ADMIN)',
    authorized: true,
    timestamp: 'READY — TAP CARD TO TEST SPI BUS',
  });

  // Active Skill Category Filter
  const [selectedSkillGroup, setSelectedSkillGroup] = useState<string>('ALL');

  const simStateRef = useRef<'idle' | 'attacking' | 'defended'>('defended');
  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  // Run animated attack -> defense sequence when user selects a scenario or clicks "Simulate Attack"
  const triggerScenarioSimulation = (idx: number) => {
    setActiveScenarioIdx(idx);
    setSimState('attacking');
    setVisibleLogCount(1);

    setTimeout(() => setVisibleLogCount(2), 450);
    setTimeout(() => {
      setVisibleLogCount(3);
      setSimState('defended');
    }, 950);
    setTimeout(() => setVisibleLogCount(4), 1400);
  };

  // ============================================================
  // THREE.JS 3D CYBER DEFENSE GLOBE & TELEMETRY MATRIX IN HERO
  // ============================================================
  useEffect(() => {
    const container = globeMountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Core dark obsidian sphere
    const coreGeo = new THREE.SphereGeometry(1.78, 36, 36);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050b18,
      transparent: true,
      opacity: 0.92,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Glowing geodesic cyber-grid sphere
    const wireGeo = new THREE.IcosahedronGeometry(1.82, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Outer orbital defense shield rings
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.18, 2.21, 64), ring1Mat);
    ring1.rotation.x = Math.PI * 0.38;
    ring1.rotation.y = 0.25;
    globeGroup.add(ring1);

    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28,
    });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.38, 2.4, 64), ring2Mat);
    ring2.rotation.x = -Math.PI * 0.32;
    ring2.rotation.y = -0.4;
    globeGroup.add(ring2);

    // Surface server & sensor nodes + 3D arcs
    const nodePositions = [
      new THREE.Vector3(0.5, 0.4, 1.72), // Thrissur / Kochi SOC HQ
      new THREE.Vector3(-0.9, 1.1, 1.15),
      new THREE.Vector3(1.2, -0.6, 1.25),
      new THREE.Vector3(-1.3, -0.5, 1.18),
      new THREE.Vector3(0.2, 1.5, 1.05),
      new THREE.Vector3(1.4, 0.8, 0.9),
      new THREE.Vector3(-0.4, -1.4, 1.1),
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    nodePositions.forEach((pos, idx) => {
      const nGeo = new THREE.SphereGeometry(idx === 0 ? 0.08 : 0.055, 16, 16);
      const nMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x00ff9d : 0x00f0ff,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.copy(pos);
      globeGroup.add(nMesh);
      nodeMeshes.push(nMesh);

      // Connect each node to Thrissur SOC HQ (node 0) with a 3D quadratic Bezier arc
      if (idx > 0) {
        const mid = pos.clone().add(nodePositions[0]).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(2.35);
        const curve = new THREE.QuadraticBezierCurve3(nodePositions[0], mid, pos);
        const points = curve.getPoints(32);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        const arcMat = new THREE.LineBasicMaterial({
          color: 0x00ff9d,
          transparent: true,
          opacity: 0.55,
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        globeGroup.add(arcLine);
      }
    });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      const isAttacking = simStateRef.current === 'attacking';

      globeGroup.rotation.y = t * (isAttacking ? 0.45 : 0.18);
      globeGroup.rotation.x = Math.sin(t * 0.4) * 0.12;

      ring1.rotation.z = t * 0.35;
      ring2.rotation.z = -t * 0.28;

      // Dynamic color shift during live attack vs. active defense
      wireMat.color.setHex(isAttacking ? 0xff3b5c : 0x00f0ff);
      ring1Mat.color.setHex(isAttacking ? 0xff3b5c : 0x00ff9d);

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

  const currentScenario = LIVE_SCENARIOS[activeScenarioIdx];

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(PORTFOLIO_CONTENT.identity.email).catch(() => {});
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2400);
  };

  // Interactive Sandbox 2: Toggle Tamper vs Restore on FIM files
  const handleTamperFile = (index: number) => {
    setFimFiles(prev =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              tampered: true,
              currentHash: 'e3b0c44298fc1c149afbf4c8996fb924',
            }
          : f
      )
    );
  };

  const handleRestoreFimBaselines = () => {
    setFimFiles(prev =>
      prev.map(f => ({
        ...f,
        tampered: false,
        currentHash: f.baselineHash,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-geist relative overflow-x-clip">
      {/* Subtle Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-60 z-0" />

      {/* ============================================================
          TOP STICKY CYBER COMMAND HEADER (Mobile & Desktop Responsive)
          ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#050811]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Live Defense Status */}
          <a href="#" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-geist-mono font-bold text-sm sm:text-base tracking-tight text-white truncate">
                  ALEN // AEGIS
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-geist-mono font-semibold border ${
                    simState === 'attacking'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      simState === 'attacking' ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                  {simState === 'attacking' ? 'MITIGATING BREACH' : 'SOC DEFENSE ONLINE'}
                </span>
              </div>
              <p className="text-[10px] font-geist-mono text-slate-400 truncate hidden xs:block">
                Cybersecurity Analyst · SOC L1 · Linux System Engineer
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-geist-mono text-slate-300">
            <a href="#simulator" className="hover:text-emerald-400 transition-colors">
              01.ThreatSim
            </a>
            <a href="#sandboxes" className="hover:text-emerald-400 transition-colors">
              02.CyberLabs
            </a>
            <a href="#experience" className="hover:text-emerald-400 transition-colors">
              03.FieldOps
            </a>
            <a href="#arsenal" className="hover:text-emerald-400 transition-colors">
              04.Arsenal
            </a>
            <a href="#terminal" className="hover:text-emerald-400 transition-colors">
              05.Terminal
            </a>
            <a href="#credentials" className="hover:text-emerald-400 transition-colors">
              06.Vault
            </a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">
              07.Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-geist-mono text-slate-300 hover:border-cyan-500/50 transition-colors"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ctrl+K</span>
            </button>

            <button
              onClick={onOpenResume}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-geist-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Résumé</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#070b18] border-b border-slate-800 px-4 py-3 grid grid-cols-2 gap-2 font-geist-mono text-xs">
            {[
              { label: '01. Live Threat Sim', href: '#simulator' },
              { label: '02. Interactive Labs', href: '#sandboxes' },
              { label: '03. Field Experience', href: '#experience' },
              { label: '04. Security Arsenal', href: '#arsenal' },
              { label: '05. Linux Terminal', href: '#terminal' },
              { label: '06. Credentials Vault', href: '#credentials' },
              { label: '07. Direct Contact', href: '#contact' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-emerald-500/40"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ============================================================
          SECTION 01: HERO + 3D CYBER GLOBE + LIVE ATTACK/DEFENSE SIMULATOR
          ============================================================ */}
      <section
        id="simulator"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-16 sm:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left 7 Columns: Alen Davis K Identity + Real-World Value Proposition + Impact Stats */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <img
                  src={PORTFOLIO_CONTENT.identity.photoUrl}
                  alt={PORTFOLIO_CONTENT.identity.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-geist-mono font-extrabold text-[9px]">
                  VERIFIED
                </span>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-geist-mono text-[11px]">
                  <Radar className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>THRISSUR, KERALA · SOC L1 & LINUX ENGINEER</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Alen Davis K
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-geist-mono">
                  Police Cyber Cell Forensics · HashRoot Linux Admin · Splunk SIEM & ESP32 Security
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-white">
                Don’t just read about my security skills.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400">
                  Test my defenses live.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                I engineer real-world cyber defense systems—from **Splunk SIEM correlation rules**
                and **Python SHA-256 file integrity engines** to **ESP32 RFID hardware access
                controllers** and **Police Cyber Cell digital forensics**. Trigger any attack vector
                below to see how my systems detect and neutralize threats in real time.
              </p>
            </div>

            {/* 4 Verified Real-World Impact Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PORTFOLIO_CONTENT.numbers.map((st, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="font-geist-mono font-extrabold text-2xl sm:text-3xl text-emerald-400">
                    {st.value}
                    {st.suffix}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug mt-1">
                    {st.label.split(' at ')[0]}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#sandboxes"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-geist-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Test Interactive Cyber Labs</span>
              </a>

              <a
                href={PORTFOLIO_CONTENT.identity.resumePdfUrl}
                download="Alen_Davis_K_Resume.pdf"
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-geist-mono text-xs sm:text-sm flex items-center gap-2 hover:border-cyan-400 transition-colors"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Download Résumé PDF</span>
              </a>

              <a
                href="#terminal"
                className="px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-300 font-geist-mono text-xs sm:text-sm flex items-center gap-2 hover:border-emerald-500/50 transition-colors"
              >
                <TerminalIcon className="w-4 h-4" />
                <span>Launch Linux CLI</span>
              </a>
            </div>
          </div>

          {/* Right 5 Columns: 3D Interactive Threat Globe + Live Attack/Defense Simulator Console */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#070d1d]/90 border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
              {/* Top Console Bar */}
              <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-geist-mono font-bold text-xs text-white">
                    LIVE SOC BREACH & DEFENSE SIMULATOR
                  </span>
                </div>
                <button
                  onClick={() => triggerScenarioSimulation(activeScenarioIdx)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-geist-mono text-[10px] font-bold flex items-center gap-1 hover:bg-rose-500/30 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>RE-FIRE ATTACK</span>
                </button>
              </div>

              {/* 3D WebGL Threat Globe Viewport */}
              <div className="relative h-56 sm:h-64 w-full bg-gradient-to-b from-[#050914] to-[#081226]">
                <div ref={globeMountRef} className="w-full h-full" />

                {/* Floating Telemetry Overlay on Globe */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 font-geist-mono text-[10px] text-slate-300">
                  NODE: <span className="text-emerald-400">THRISSUR-SOC-01</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/90 font-geist-mono text-[10px]">
                  <span className="text-slate-400 truncate">
                    TARGET: <strong className="text-white">{currentScenario.targetAsset}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0 ml-2">
                    {currentScenario.outcomeMetric}
                  </span>
                </div>
              </div>

              {/* 4 Attack Vector Selector Buttons */}
              <div className="p-3 bg-slate-950/70 border-y border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {LIVE_SCENARIOS.map((sc, idx) => {
                  const isActive = idx === activeScenarioIdx;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => triggerScenarioSimulation(idx)}
                      className={`p-2 rounded-xl font-geist-mono text-[10px] text-left transition-all border ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div style={{ color: sc.accentColor }} className="truncate">
                        {sc.code}
                      </div>
                      <div className="truncate text-[10px] mt-0.5">
                        {sc.id === 'bruteforce'
                          ? 'Brute-Force'
                          : sc.id === 'fim'
                          ? 'File Tamper'
                          : sc.id === 'rfid'
                          ? 'RFID Clone'
                          : 'Phishing OSINT'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Detection Rule & Real-Time Log Stream */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-white truncate">
                    {currentScenario.name}
                  </span>
                  <span className="font-geist-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 shrink-0">
                    {currentScenario.mitreId}
                  </span>
                </div>

                {/* Detection Query Box */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-geist-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <span className="text-slate-500 select-none">$ </span>
                  {currentScenario.detectionQuery}
                </div>

                {/* Animated Real-Time SOC Telemetry Logs */}
                <div className="space-y-1.5 font-geist-mono text-[11px]">
                  {currentScenario.logs.slice(0, visibleLogCount).map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className={`p-2 rounded-lg border flex items-start gap-2 ${
                        log.level === 'CRITICAL'
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                          : log.level === 'WARN'
                          ? 'bg-amber-950/25 border-amber-500/30 text-amber-200'
                          : log.level === 'DEFENSE'
                          ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                          : 'bg-emerald-950/35 border-emerald-500/40 text-emerald-200 font-semibold'
                      }`}
                    >
                      <span className="text-[10px] opacity-65 shrink-0">{log.time}</span>
                      <span className="leading-snug break-words">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 02: INTERACTIVE HANDS-ON CYBER LAB SANDBOXES (ALEN'S 3 PROJECTS)
          Visitors can actively run SPL queries, tamper/verify SHA-256 files, and swipe RFID cards!
          ============================================================ */}
      <section
        id="sandboxes"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80 space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-geist-mono text-xs text-emerald-400 uppercase tracking-widest mb-2">
              <Cpu className="w-4 h-4" />
              <span>02 // INTERACTIVE PROJECT SANDBOXES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Hands-On Security Engineering Labs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md font-geist-mono">
            Every project on my résumé is interactive below—run a Splunk SPL hunt, test SHA-256
            file integrity tampering, or swipe an RFID badge on the ESP32 SPI bus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LAB 01: SPLUNK SIEM LOG MONITORING & THREAT DETECTION LAB */}
          <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 font-geist-mono text-[10px] font-bold text-cyan-300">
                  LAB 01 · SPLUNK SIEM & SYSMON
                </span>
                <a
                  href={PORTFOLIO_CONTENT.identity.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-geist-mono text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h3 className="text-xl font-bold text-white">
                Splunk SIEM Log Monitoring & Threat Detection Lab
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ingests Windows Security Event Logs (`4625`/`4624`/`4672`), Linux auth logs, and
                Sysmon telemetry via Universal Forwarder to detect brute-force & privilege escalation.
              </p>

              {/* Interactive SPL Preset Selector */}
              <div className="pt-2 space-y-2">
                <span className="font-geist-mono text-[10px] uppercase tracking-wider text-cyan-400 block">
                  Interactive SPL Threat Hunt — Click to Execute:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'bruteforce', label: 'Event 4625 Brute-Force' },
                    { id: 'privesc', label: 'Event 4672 Admin Logon' },
                    { id: 'sudo', label: 'Linux Sudo Escalation' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSplunkPreset(tab.id as typeof splunkPreset)}
                      className={`px-2.5 py-1 rounded-lg font-geist-mono text-[10px] border transition-all ${
                        splunkPreset === tab.id
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Live Simulated SPL Output */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-geist-mono text-[11px] space-y-2">
                  {splunkPreset === 'bruteforce' && (
                    <>
                      <div className="text-cyan-300 text-[10px]">
                        SPL: index=wineventlog EventCode=4625 | stats count by IpAddress, TargetUserName
                      </div>
                      <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[10px]">
                        <div className="flex justify-between text-rose-300">
                          <span>185.220.101.42 → administrator</span>
                          <span className="font-bold">142 failures (ALERT)</span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                          <span>45.155.205.91 → root</span>
                          <span>38 failures (WARN)</span>
                        </div>
                      </div>
                    </>
                  )}
                  {splunkPreset === 'privesc' && (
                    <>
                      <div className="text-cyan-300 text-[10px]">
                        SPL: index=wineventlog EventCode=4672 | table _time, SubjectUserName, Privileges
                      </div>
                      <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[10px]">
                        <div className="flex justify-between text-emerald-300">
                          <span>svc_backup → SeDebugPrivilege</span>
                          <span className="font-bold">FLAGGED FOR TRIAGE</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>SYSTEM → SeTcbPrivilege</span>
                          <span>BASELINE OK</span>
                        </div>
                      </div>
                    </>
                  )}
                  {splunkPreset === 'sudo' && (
                    <>
                      <div className="text-cyan-300 text-[10px]">
                        SPL: index=linux sourcetype=syslog "sudo:" "COMMAND=" | stats count by user, cmd
                      </div>
                      <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[10px]">
                        <div className="flex justify-between text-rose-300">
                          <span>www-data → /bin/bash</span>
                          <span className="font-bold">CRITICAL ALERT</span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                          <span>alen → /usr/bin/systemctl status</span>
                          <span>AUTHORIZED</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
              {['Splunk Enterprise', 'Universal Forwarder', 'Sysmon', 'SPL', 'Event 4625/4624'].map(
                t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-geist-mono text-[10px] text-slate-300"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          {/* LAB 02: PYTHON FILE INTEGRITY & HASH MONITORING TOOL */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-geist-mono text-[10px] font-bold text-emerald-300">
                  LAB 02 · PYTHON SHA-256 FIM
                </span>
                <button
                  onClick={handleRestoreFimBaselines}
                  className="text-[10px] font-geist-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Baselines</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-white">
                Python File Integrity & Hash Monitoring Tool
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Uses Python `hashlib` (`SHA-256` & `MD5`) to baseline critical Linux files and trigger
                instant tamper alerts on unauthorized modifications.
              </p>

              {/* Interactive FIM File Table: Click any file to simulate tampering! */}
              <div className="pt-2 space-y-2">
                <span className="font-geist-mono text-[10px] uppercase tracking-wider text-emerald-400 block">
                  Interactive Hash Verifier — Click a File to Simulate Tampering:
                </span>
                <div className="space-y-2">
                  {fimFiles.map((file, fIdx) => (
                    <div
                      key={file.path}
                      className={`p-2.5 rounded-xl border font-geist-mono text-[11px] transition-all ${
                        file.tampered
                          ? 'bg-rose-950/35 border-rose-500/50 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">{file.path}</span>
                        {file.tampered ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-extrabold text-[9px]">
                            TAMPER ALERT!
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTamperFile(fIdx)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-500/30 border border-slate-700 text-[9px] text-slate-300"
                          >
                            Simulate Modify
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        SHA256: <span className="text-slate-300">{file.currentHash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
              {['Python 3', 'hashlib SHA-256 / MD5', 'Bash Scripting', 'Linux Security'].map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-geist-mono text-[10px] text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* LAB 03: RFID SECURE ACCESS CONTROL SYSTEM USING ESP32 */}
          <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 font-geist-mono text-[10px] font-bold text-purple-300">
                  LAB 03 · ESP32 & MFRC522 SPI
                </span>
                <span className="font-geist-mono text-[10px] text-purple-300">13.56 MHz RF</span>
              </div>

              <h3 className="text-xl font-bold text-white">
                RFID Secure Access Control System using ESP32
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hardware physical authentication unit interfacing an **ESP32** with an **MFRC522**
                RFID reader over **SPI** in C/C++ to verify cryptographic card UIDs.
              </p>

              {/* Interactive RFID Badge Swiper */}
              <div className="pt-2 space-y-2.5">
                <span className="font-geist-mono text-[10px] uppercase tracking-wider text-purple-300 block">
                  Interactive SPI Reader — Tap a Card Below:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setRfidLastScan({
                        uid: '4A : 8F : 21 : C9',
                        owner: 'ALEN DAVIS K (AUTHORIZED)',
                        authorized: true,
                        timestamp: `GRANTED AT ${new Date().toLocaleTimeString()}`,
                      })
                    }
                    className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-geist-mono text-[10px] font-bold hover:bg-emerald-500/25 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span>SWIPE ADMIN TAG</span>
                      <Unlock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[9px] text-slate-300 mt-0.5">UID: 4A:8F:21:C9</div>
                  </button>

                  <button
                    onClick={() =>
                      setRfidLastScan({
                        uid: 'DE : AD : BE : EF',
                        owner: 'UNKNOWN CLONED TAG',
                        authorized: false,
                        timestamp: `DENIED AT ${new Date().toLocaleTimeString()}`,
                      })
                    }
                    className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-geist-mono text-[10px] font-bold hover:bg-rose-500/25 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span>SWIPE ROGUE TAG</span>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[9px] text-slate-300 mt-0.5">UID: DE:AD:BE:EF</div>
                  </button>
                </div>

                {/* Simulated ESP32 Serial Monitor Output */}
                <div
                  className={`p-3 rounded-2xl border font-geist-mono text-[11px] space-y-1 ${
                    rfidLastScan.authorized
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/35 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span>SPI UID: {rfidLastScan.uid}</span>
                    <span className="font-bold">
                      {rfidLastScan.authorized ? 'RELAY: UNLOCKED' : 'RELAY: LOCKED'}
                    </span>
                  </div>
                  <div className="font-bold text-xs">{rfidLastScan.owner}</div>
                  <div className="text-[10px] opacity-80">{rfidLastScan.timestamp}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
              {['ESP32 MCU', 'MFRC522 RFID', 'Embedded C/C++', 'SPI Bus', 'Hardware Auth'].map(
                t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-geist-mono text-[10px] text-slate-300"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 03: FIELD EXPERIENCE WAR-ROOM (Police Cyber Cell, HashRoot, DNS Solutions)
          ============================================================ */}
      <section
        id="experience"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80 space-y-10"
      >
        <div>
          <div className="inline-flex items-center gap-2 font-geist-mono text-xs text-cyan-400 uppercase tracking-widest mb-2">
            <Briefcase className="w-4 h-4" />
            <span>03 // FIELD OPERATIONS & INTERNSHIPS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Real-World Cyber & Server Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PORTFOLIO_CONTENT.experience.map((exp, idx) => (
            <div
              key={exp.company}
              className="rounded-3xl bg-slate-900/75 border border-slate-800 hover:border-cyan-500/40 transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 font-geist-mono text-[10px] font-bold text-cyan-300">
                    0{idx + 1} · {exp.location.toUpperCase()}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <p className="font-geist-mono text-sm text-emerald-400 font-semibold mt-0.5">
                    @ {exp.company}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {exp.summary}
                </p>

                <ul className="space-y-2 pt-2 border-t border-slate-800/90 text-xs text-slate-200">
                  {exp.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">▹</span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 04: CYBERSECURITY & LINUX ARSENAL MATRIX
          ============================================================ */}
      <section
        id="arsenal"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-geist-mono text-xs text-emerald-400 uppercase tracking-widest mb-2">
              <Database className="w-4 h-4" />
              <span>04 // TECHNICAL ARSENAL & TOOLING</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Verified Stack & Operational Mapping
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['ALL', ...PORTFOLIO_CONTENT.stack.map(s => s.group)].map(grp => (
              <button
                key={grp}
                onClick={() => setSelectedSkillGroup(grp)}
                className={`px-3 py-1.5 rounded-xl font-geist-mono text-[11px] border transition-all ${
                  selectedSkillGroup === grp
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PORTFOLIO_CONTENT.stack
            .filter(
              grp => selectedSkillGroup === 'ALL' || grp.group === selectedSkillGroup
            )
            .map((grp, idx) => (
              <div
                key={grp.group}
                className="rounded-3xl bg-slate-900/75 border border-slate-800 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white">{grp.group}</h3>
                  <span className="font-geist-mono text-xs text-emerald-400">
                    0{idx + 1}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {grp.skills.map(sk => (
                    <div
                      key={sk.name}
                      className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <span className="font-semibold text-xs sm:text-sm text-white">
                        {sk.name}
                      </span>
                      <span className="font-geist-mono text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                        {sk.usedIn[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 05: INTERACTIVE LINUX & SOC TERMINAL EMULATOR
          ============================================================ */}
      <section
        id="terminal"
        className="relative z-10 border-t border-slate-800/80 py-8"
      >
        <Terminal
          onOpenResume={onOpenResume}
          onReboot={() => triggerScenarioSimulation(0)}
        />
      </section>

      {/* ============================================================
          SECTION 06: EDUCATION & VERIFIED CREDENTIALS VAULT
          ============================================================ */}
      <section
        id="credentials"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80 space-y-10"
      >
        <div>
          <div className="inline-flex items-center gap-2 font-geist-mono text-xs text-amber-400 uppercase tracking-widest mb-2">
            <Award className="w-4 h-4" />
            <span>06 // ACADEMIC FOUNDATION & CREDENTIALS VAULT</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Education, Diplomas & Conferences
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Academic Education */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-geist-mono text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>ACADEMIC DEGREES</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Bachelor of Science in Computer Science
                </h3>
                <p className="font-geist-mono text-xs text-amber-300 mt-1">
                  Sahrdaya College of Advanced Studies, Kodakara, Kerala
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Advanced Diploma in Cyber Defence (ADCD v3)
                </h3>
                <p className="font-geist-mono text-xs text-emerald-300 mt-1">
                  Red Team Hackers Academy, Thrissur, Kerala
                </p>
              </div>
            </div>
          </div>

          {/* Certifications & Conferences */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PORTFOLIO_CONTENT.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-slate-900/75 border border-slate-800 hover:border-amber-500/40 transition-colors p-5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-geist-mono text-xs text-amber-400 font-bold">
                    CREDENTIAL // 0{idx + 1}
                  </span>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    {cert.name}
                  </h3>
                  <p className="font-geist-mono text-xs text-slate-400 mt-1.5">
                    {cert.issuer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 07: DIRECT HIRING & COMMUNICATIONS COMMAND DECK
          ============================================================ */}
      <section
        id="contact"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80"
      >
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#081226] to-slate-950 border border-emerald-500/30 p-6 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-geist-mono text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>READY FOR IMMEDIATE SOC L1 / CYBERSECURITY / LINUX ROLES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">
            Ready to defend your infrastructure & hunt threats.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Available for SOC Analyst L1, Cybersecurity Analyst, Digital Forensics, and Linux
            System Engineer roles. Reach out directly below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`mailto:${PORTFOLIO_CONTENT.identity.email}`}
              className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-geist-mono font-bold text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>{PORTFOLIO_CONTENT.identity.email}</span>
            </a>

            <button
              onClick={handleCopyEmail}
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-geist-mono text-xs sm:text-sm flex items-center gap-2 hover:border-emerald-400 transition-colors"
            >
              {emailCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <a
              href={`mailto:${PORTFOLIO_CONTENT.identity.email}`}
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-geist-mono text-xs sm:text-sm flex items-center gap-2 hover:border-cyan-400 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>{PORTFOLIO_CONTENT.identity.email}</span>
            </a>

            <a
              href={PORTFOLIO_CONTENT.identity.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-geist-mono text-xs sm:text-sm flex items-center gap-2 hover:border-cyan-400 transition-colors"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>GitHub @alend66</span>
            </a>

            <a
              href={PORTFOLIO_CONTENT.identity.resumePdfUrl}
              download="Alen_Davis_K_Resume.pdf"
              className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-geist-mono font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-cyan-500/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Résumé PDF</span>
            </a>
          </div>

          <div className="pt-4 text-xs font-geist-mono text-slate-400 flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{PORTFOLIO_CONTENT.identity.location}</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center font-geist-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ALEN DAVIS K // AEGIS CYBER DEFENSE & LINUX COMMAND</span>
          <span>ALL METRICS & LABS VERIFIED FROM AUTHORITATIVE RESUME</span>
        </div>
      </footer>
    </div>
  );
};

