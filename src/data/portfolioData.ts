export interface ProjectIncident {
  id: string;
  incidentNumber: string;
  title: string;
  status: 'RESOLVED' | 'DEPLOYED' | 'MONITORING';
  statusColor: string;
  technology: string;
  tags: string[];
  problem: string;
  approach: string;
  implementation: string[];
  whatILearned: string;
  socVisualization?: {
    type: 'splunk-pipeline';
    steps: { name: string; detail: string; icon: string }[];
  };
}

export interface NetworkNode {
  id: string;
  label: string;
  category: string;
  x: number; // percentage
  y: number; // percentage
  details: {
    headline: string;
    points: string[];
    connections: string[];
  };
}

export interface ExperienceItem {
  role: string;
  organization: string;
  type: string;
  dateBadge: string;
  details: string[];
  highlight: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  date: string;
  badgeCode: string;
  type: 'diploma' | 'workshop' | 'conference';
}

export interface EducationItem {
  degree: string;
  institution: string;
  location: string;
  focus: string;
}

export interface CityScene {
  index: number;
  code: string;
  id: string;
  title: string;
  districtName: string;
  subtitle: string;
  visualAction: string;
  roadMarking: string;
  carZ: number;
  cameraOffset: { x: number; y: number; z: number };
  lookAtOffset: { x: number; y: number; z: number };
  accentColor: string;
  summary: string;
  badges: string[];
}

export const CITY_SCENES: CityScene[] = [
  {
    index: 0,
    code: '01',
    id: 'city-reveal',
    title: 'City Reveal',
    districtName: 'ALEN CITY // AERIAL REVEAL',
    subtitle: 'Linux System & Cybersecurity Metropolis',
    visualAction: 'Aerial city establishing shot; slow camera descent over the cyber highway',
    roadMarking: 'WELCOME TO ALEN CITY // KERNEL 6.8 READY',
    carZ: 18,
    cameraOffset: { x: 0, y: 26, z: 46 },
    lookAtOffset: { x: 0, y: 4, z: -30 },
    accentColor: '#00f0ff',
    summary: 'Welcome to ALEN CITY — an interactive 3D cyber metropolis where the world is the interface. Drive through 9 story districts to explore Alen Davis K’s education, technical skills, engineering projects, verified credentials, and field experience.',
    badges: ['ALEN CITY', 'THRISSUR, KERALA', 'LINUX SYSTEM ENGINEER', 'INTERACTIVE 3D WORLD']
  },
  {
    index: 1,
    code: '02',
    id: 'character',
    title: 'Character Reveal',
    districtName: 'OPERATOR // ALEN DAVIS K',
    subtitle: 'Beside the Hero Cyber-Cruiser',
    visualAction: 'Main character stands beside the hero car before departure',
    roadMarking: 'OPERATOR: ALEN DAVIS K // ROOT AUTH',
    carZ: 0,
    cameraOffset: { x: 6.5, y: 3.4, z: 9.5 },
    lookAtOffset: { x: -1.2, y: 1.8, z: -1 },
    accentColor: '#00ff9d',
    summary: 'Computer Science graduate specializing in Linux systems, system administration, networking, IT infrastructure, troubleshooting, and cybersecurity. "Building reliable systems. Understanding how they break. Making them stronger."',
    badges: ['ALEN DAVIS K', 'BSc COMPUTER SCIENCE', 'ADCD v3 CYBER DEFENCE', 'ROOT CAUSE MINDSET']
  },
  {
    index: 2,
    code: '03',
    id: 'start-journey',
    title: 'Start Journey',
    districtName: 'IGNITION // DEPARTURE GATE',
    subtitle: 'Headlights On • Telemetry Active • Explore My World',
    visualAction: 'Ignition, character enters car, headlights turn on, car begins moving',
    roadMarking: '>>> IGNITION // EXPLORE MY WORLD >>>',
    carZ: -25,
    cameraOffset: { x: 0, y: 4.5, z: -12 },
    lookAtOffset: { x: 0, y: 1.5, z: -45 },
    accentColor: '#38bdf8',
    summary: 'Engine online and telemetry locked. Follow the illuminated boulevard ahead: OBSERVE → IDENTIFY → ISOLATE → TEST → FIX → VERIFY. Use Next Scene, Scroll, W/A/S/D, Arrow Keys, or Touch Pedals to drive through every district.',
    badges: ['OBSERVE', 'IDENTIFY', 'ISOLATE', 'TEST', 'FIX', 'VERIFY']
  },
  {
    index: 3,
    code: '04',
    id: 'education',
    title: 'Education District',
    districtName: 'EDUCATION CAMPUS // FOUNDATION',
    subtitle: 'Sahrdaya CAS & Red Team Hackers Academy',
    visualAction: 'Drive toward campus; stop at the illuminated university entrance',
    roadMarking: '04 // EDUCATION CAMPUS • BSc CS & ADCD v3',
    carZ: -70,
    cameraOffset: { x: 0, y: 5.2, z: -54 },
    lookAtOffset: { x: 0, y: 3.2, z: -82 },
    accentColor: '#00f0ff',
    summary: 'Academic Computer Science foundation at Sahrdaya College of Advanced Studies (Kodakara) paired with specialized offensive & defensive security training through the Advanced Diploma in Cyber Defence (ADCD v3) at Red Team Hackers Academy (Thrissur).',
    badges: ['BSc Computer Science', 'Sahrdaya CAS, Kodakara', 'ADCD v3 Diploma', 'Red Team Hackers Academy']
  },
  {
    index: 4,
    code: '05',
    id: 'skills',
    title: 'Technology District',
    districtName: 'TECH TOWERS // SKILL MATRIX',
    subtitle: 'Linux, Networking, Scripting & Cybersecurity Tooling',
    visualAction: 'Drive past tech towers and illuminated skill signage on the road and facades',
    roadMarking: '05 // LINUX • BASH • TCP/IP • SPLUNK • VAPT',
    carZ: -125,
    cameraOffset: { x: 0, y: 5.8, z: -108 },
    lookAtOffset: { x: 0, y: 4.0, z: -138 },
    accentColor: '#00ff9d',
    summary: 'High-rise telemetry towers display verified technical capabilities across Operating Systems (Linux, Ubuntu, CentOS, Windows), Bash CLI & File Permissions, Networking (Routers, Switches, IP Subnetting), and Security Toolkits (Splunk, Wireshark, Burp Suite, Nmap, Metasploit, Nessus, Nikto, Hydra, Aircrack-ng).',
    badges: ['Linux / Ubuntu / CentOS', 'Shell Scripting', 'Router & Switch Setup', 'Splunk SIEM', 'Wireshark & Nmap', 'VAPT & Burp Suite']
  },
  {
    index: 5,
    code: '06',
    id: 'projects',
    title: 'Projects Boulevard',
    districtName: 'PROJECTS BOULEVARD // INCIDENTS',
    subtitle: 'File Integrity Checker • RFID Access • Splunk SIEM',
    visualAction: 'Drive along a boulevard of 3 engineering project landmarks',
    roadMarking: '06 // PROJECTS BOULEVARD • 03 ACTIVE LANDMARKS',
    carZ: -180,
    cameraOffset: { x: 0, y: 5.5, z: -163 },
    lookAtOffset: { x: 0, y: 3.5, z: -194 },
    accentColor: '#f59e0b',
    summary: 'Three landmark structures represent real engineering investigations: [01] File Integrity Checker (Python + Shell MD5 hashing), [02] RFID Access Control System (ESP32 microcontroller + RFID hardware), and [03] Splunk SIEM Log Monitoring System (Linux + Universal Forwarder + Brute-force alerting).',
    badges: ['01: File Integrity Checker', '02: RFID Access Control', '03: Splunk SIEM Monitoring', 'Python • ESP32 • Splunk']
  },
  {
    index: 6,
    code: '07',
    id: 'achievements',
    title: 'Achievements Plaza',
    districtName: 'ACHIEVEMENTS PLAZA // VAULT',
    subtitle: 'Diplomas, Forensic Workshops & Security Conferences',
    visualAction: 'Enter plaza with illuminated trophy monoliths and holo-screens',
    roadMarking: '07 // ACHIEVEMENTS PLAZA • VERIFIED CREDENTIALS',
    carZ: -235,
    cameraOffset: { x: 0, y: 5.4, z: -218 },
    lookAtOffset: { x: 0, y: 3.5, z: -248 },
    accentColor: '#10b981',
    summary: 'Illuminated trophy structures celebrate verified milestones: Advanced Diploma in Cyber Defence (ADCD v3) at Red Team Hacker Academy (June 2026), Cyber Forensic Workshop "Trazada: The Last Trace" at Offenso Hackers Academy (June 2026), and Seasides Conference at International Centre Goa (February 2026).',
    badges: ['ADCD v3 (June 2026)', 'Trazada Forensic Workshop', 'Seasides Conference Goa', 'Verified Accreditations']
  },
  {
    index: 7,
    code: '08',
    id: 'experience',
    title: 'Experience District',
    districtName: 'EXPERIENCE HQ // OPERATIONS',
    subtitle: 'DNS Solutions & Police Cyber Cell',
    visualAction: 'Pass operations & cyber investigation headquarters buildings',
    roadMarking: '08 // EXPERIENCE DISTRICT • INFRASTRUCTURE & FORENSICS',
    carZ: -290,
    cameraOffset: { x: 0, y: 5.4, z: -273 },
    lookAtOffset: { x: 0, y: 3.5, z: -302 },
    accentColor: '#38bdf8',
    summary: 'Real-world operational track record across two key headquarters: CCTV & Networking Administrator at DNS Solutions (DVR/NVR deployment, router/switch setup, IP subnetting, network troubleshooting) and Cyber Security Intern at Police Cyber Cell (cybercrime investigation exposure, digital forensics chain of custody).',
    badges: ['DNS Solutions (Admin)', 'Police Cyber Cell (Intern)', 'Network Troubleshooting', 'Digital Forensics']
  },
  {
    index: 8,
    code: '09',
    id: 'contact',
    title: 'Contact Garage',
    districtName: 'CONTACT GARAGE // TERMINAL BAY',
    subtitle: 'Direct Hire, Resume Download, GitHub & Dispatch',
    visualAction: 'Arrive at the cyber garage destination with contact portals and resume bay',
    roadMarking: '09 // CONTACT GARAGE • OPEN TO OPPORTUNITIES',
    carZ: -345,
    cameraOffset: { x: 0, y: 4.8, z: -328 },
    lookAtOffset: { x: 0, y: 2.8, z: -358 },
    accentColor: '#00ff9d',
    summary: 'Destination reached! Connect directly with Alen Davis K for Linux System Engineer, System Administration, Network Engineering, or SOC/Cybersecurity opportunities. Inspect or download the full resume, open the Unix CLI terminal, or transmit a message.',
    badges: ['alend6622@gmail.com', '+91 9745775346', 'Thrissur, Kerala', 'Open to Opportunities']
  }
];

export const PORTFOLIO_DATA = {
  personal: {
    name: 'ALEN DAVIS K',
    location: 'Thrissur, Kerala',
    email: 'alend6622@gmail.com',
    phone: '+91 9745775346',
    careerGoal: 'Linux System Engineer',
    professionalIdentity: 'Computer Science graduate interested in Linux systems, system administration, networking, IT infrastructure, troubleshooting and cybersecurity.',
    headlineQuote: 'Building reliable systems. Understanding how they break. Making them stronger.',
    mindsetQuote: 'I enjoy understanding the root cause of technical problems rather than simply treating the symptoms.',
    statusPanel: [
      { label: 'SYSTEM STATUS', value: 'ONLINE', status: 'optimal' },
      { label: 'LINUX', value: 'READY', status: 'optimal' },
      { label: 'NETWORK', value: 'STABLE', status: 'optimal' },
      { label: 'SECURITY', value: 'ACTIVE', status: 'optimal' },
      { label: 'PROJECTS', value: '03', status: 'info' },
      { label: 'MODE', value: 'LEARNING', status: 'warning' },
    ]
  },

  projects: [
    {
      id: 'file-integrity-checker',
      incidentNumber: 'PROJECT 01 // INCIDENT-FIC-01',
      title: 'FILE INTEGRITY CHECKER',
      status: 'RESOLVED',
      statusColor: 'emerald',
      technology: 'Python + Shell',
      tags: ['Python', 'Shell Scripting', 'MD5 Cryptography', 'Data Integrity', 'CLI'],
      problem: 'Detecting unauthorized modifications, silent data corruption, and tampering across critical system files without manual inspection overhead.',
      approach: 'Constructed an automated cryptographic verification engine utilizing MD5 digest algorithms, comparing baseline file signatures against live filesystem state.',
      implementation: [
        'Python-based MD5 hash generation and identification',
        'Hash comparison and lookup algorithms for altered files',
        'Command-line workflows for automated directory sweeps',
        'Data integrity verification and discrepancy logging',
        'Cryptographic concepts & secure password handling principles'
      ],
      whatILearned: 'Practical mastery of cryptographic hashing workflows, shell piping integration, and designing defensive validation tooling for system files.'
    },
    {
      id: 'rfid-access-control',
      incidentNumber: 'PROJECT 02 // INCIDENT-RFID-02',
      title: 'RFID ACCESS CONTROL SYSTEM',
      status: 'DEPLOYED',
      statusColor: 'cyan',
      technology: 'ESP32 + RFID',
      tags: ['ESP32', 'RFID Hardware', 'Microcontroller', 'Access Control', 'Authentication'],
      problem: 'Enforcing strict physical perimeter security and validating access credentials at edge device entry points in real time.',
      approach: 'Interfaced an RFID reader module with an ESP32 microcontroller running embedded validation logic to authenticate UID tokens against an access roster.',
      implementation: [
        'Hardware authentication and UID credential extraction',
        'Physical access control gate and relay activation logic',
        'ESP32 microcontroller firmware and interface programming',
        'Authorized-user verification and instant rejection of unauthorized tags'
      ],
      whatILearned: 'Embedded device programming, real-time signal handling, hardware-software handshakes, and perimeter access verification.'
    },
    {
      id: 'splunk-siem-monitoring',
      incidentNumber: 'PROJECT 03 // INCIDENT-SOC-03',
      title: 'SPLUNK SIEM LOG MONITORING SYSTEM',
      status: 'MONITORING',
      statusColor: 'amber',
      technology: 'Splunk + Linux + Universal Forwarder',
      tags: ['Splunk Enterprise', 'Universal Forwarder', 'Linux', 'Windows Logs', 'Brute-Force Detection'],
      problem: 'Isolated endpoint event logs fail to alert security administrators when automated brute-force logon attacks strike network services.',
      approach: 'Deployed a telemetry pipeline shipping Windows event logs through Splunk Universal Forwarder to a central Linux Splunk Enterprise instance with detection triggers.',
      implementation: [
        'Windows security event log extraction (Event ID 4625 / logon failures)',
        'Universal Forwarder deployment and secure data transmission',
        'Splunk Enterprise indexing on Linux environment',
        'Correlation search rules for repetitive authentication anomalies',
        'Real-time automated Brute-force Alert generation and dashboard triage'
      ],
      whatILearned: 'Full-cycle enterprise log forwarding architectures, query structuring in Splunk, SIEM correlation alerting, and Linux server log monitoring.',
      socVisualization: {
        type: 'splunk-pipeline',
        steps: [
          { name: 'Windows Logs', detail: 'Event ID 4625 & security audit streams', icon: 'FileText' },
          { name: 'Universal Forwarder', detail: 'Lightweight agent forwarding via port 9997', icon: 'Send' },
          { name: 'Splunk Enterprise', detail: 'Linux-hosted indexing & parser engine', icon: 'Cpu' },
          { name: 'Detection Engine', detail: 'Threshold correlation for repeated auth fails', icon: 'Search' },
          { name: 'Brute-force Alert', detail: 'High-priority SOC dashboard notification', icon: 'ShieldAlert' },
        ]
      }
    }
  ] as ProjectIncident[],

  howIThinkSteps: [
    {
      step: '01',
      title: 'OBSERVE',
      command: 'syslog --tail -f',
      description: 'Gather raw telemetry, error codes, and symptoms without making premature assumptions about the fault.',
      icon: 'Eye'
    },
    {
      step: '02',
      title: 'IDENTIFY',
      command: 'inspect --error-type',
      description: 'Pinpoint anomalous patterns, failed services, dropped packets, or mismatched cryptographic hashes.',
      icon: 'Search'
    },
    {
      step: '03',
      title: 'ISOLATE',
      command: 'quarantine --segment',
      description: 'Separate the failing subsystem from healthy components to minimize blast radius and reproduce reliably.',
      icon: 'Shield'
    },
    {
      step: '04',
      title: 'TEST',
      command: 'probe --hypothesis',
      description: 'Formulate hypotheses and conduct controlled experiments to prove the exact root cause of the failure.',
      icon: 'Terminal'
    },
    {
      step: '05',
      title: 'FIX',
      command: 'patch --apply-config',
      description: 'Implement a targeted configuration change, patch, or repair rather than an ephemeral quick workaround.',
      icon: 'Wrench'
    },
    {
      step: '06',
      title: 'VERIFY',
      command: 'assert --integrity-check',
      description: 'Confirm stability under load, validate log output, and ensure the root cause is permanently mitigated.',
      icon: 'CheckCircle2'
    }
  ],

  experience: [
    {
      role: 'CCTV AND NETWORKING ADMINISTRATOR',
      organization: 'DNS Solutions',
      type: 'OPERATIONAL INFRASTRUCTURE',
      dateBadge: 'ADMINISTRATOR ROLE',
      highlight: 'Infrastructure deployment, surveillance telemetry, IP subnets, and real-time hardware diagnostics.',
      details: [
        'CCTV camera installation, cabling, calibration, and routine hardware maintenance',
        'DVR and NVR systems deployment, storage management, and continuous recording integrity',
        'Routers and networking devices configuration across client premises',
        'Network troubleshooting, diagnosing connectivity drops, latency, and packet loss',
        'IP configuration, subnet assignments, and gateway routing',
        'System monitoring to guarantee 24/7 uptime for surveillance and network backbones'
      ]
    },
    {
      role: 'CYBER SECURITY INTERN',
      organization: 'Police Cyber Cell',
      type: 'DEFENSIVE INVESTIGATIONS',
      dateBadge: 'INVESTIGATIVE INTERNSHIP',
      highlight: 'Cybercrime investigation exposure, digital forensics chain-of-custody, and security documentation.',
      details: [
        'Direct cybercrime investigation exposure under seasoned cyber cell officers',
        'Digital evidence handling upholding strict chain of custody protocols',
        'Cybersecurity best practices implementation across public-facing and internal channels',
        'Incident documentation and formal investigative reporting',
        'Cyber awareness and threat prevention education initiatives',
        'Hands-on cyber forensics methodologies and digital artifact examination'
      ]
    }
  ] as ExperienceItem[],

  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Sahrdaya College of Advanced Studies',
      location: 'Kodakara, India',
      focus: 'Foundational computer science, algorithms, operating systems, networking fundamentals, and computer architecture.'
    },
    {
      degree: 'Advanced Diploma in Cyber Defence (ADCD v3)',
      institution: 'Red Team Hackers Academy',
      location: 'Thrissur, India',
      focus: 'Defensive security, penetration testing, network defense architectures, VAPT methodologies, and incident response.'
    }
  ] as EducationItem[],

  certifications: [
    {
      title: 'Advanced Diploma in Cyber Defence (ADCD v3)',
      issuer: 'Red Team Hacker Academy, India',
      date: 'June 2026',
      badgeCode: 'CERT-ADCD-2026',
      type: 'diploma'
    },
    {
      title: 'Cyber Forensic Workshop – "Trazada: The Last Trace"',
      issuer: 'Offenso Hackers Academy, Trivandrum',
      date: 'June 2026',
      badgeCode: 'WRKSHP-TRAZADA-2026',
      type: 'workshop'
    },
    {
      title: 'Seasides Conference',
      issuer: 'International Centre Goa',
      date: 'February 2026',
      badgeCode: 'CONF-SEASIDES-2026',
      type: 'conference'
    }
  ] as CertificationItem[],

  networkNodes: [
    {
      id: 'linux',
      label: 'LINUX',
      category: 'Core OS',
      x: 50,
      y: 13,
      details: {
        headline: 'Command-line Workflows & System Administration',
        points: [
          'Command-line workflows & environment optimization',
          'File permissions (POSIX chmod, chown, ACLs)',
          'Linux installation, filesystem partitioning & kernel init',
          'System troubleshooting, service management (systemd)',
          'Distributions: Ubuntu, CentOS'
        ],
        connections: ['shell', 'networking', 'infrastructure', 'cybersecurity']
      }
    },
    {
      id: 'networking',
      label: 'NETWORKING',
      category: 'Connectivity',
      x: 24,
      y: 32,
      details: {
        headline: 'IP Architecture & Network Device Engineering',
        points: [
          'IP addressing, CIDR subnetting, DHCP & DNS configuration',
          'Router & switch setup and physical cabling topology',
          'Network troubleshooting (ping, traceroute, tcpdump, netstat)',
          'Surveillance network segmentation and gateway routing'
        ],
        connections: ['linux', 'infrastructure', 'cybersecurity', 'siem']
      }
    },
    {
      id: 'sysadmin',
      label: 'SYS ADMIN',
      category: 'Operations',
      x: 76,
      y: 32,
      details: {
        headline: 'System Maintenance & Operational Health',
        points: [
          'OS installation, configuration & packaging',
          'Desktop support & remote assistance workflows',
          'IT help desk diagnostics and issue escalation',
          'Surveillance DVR/NVR infrastructure operation'
        ],
        connections: ['linux', 'networking', 'infrastructure']
      }
    },
    {
      id: 'cybersecurity',
      label: 'CYBERSECURITY',
      category: 'Defense',
      x: 24,
      y: 68,
      details: {
        headline: 'Offensive & Defensive Security Methodologies',
        points: [
          'VAPT (Vulnerability Assessment & Penetration Testing)',
          'Penetration testing fundamentals',
          'Basic Web Application Security (OWASP Top 10 concepts)',
          'Cyber forensics and digital evidence handling'
        ],
        connections: ['networking', 'siem', 'linux', 'python']
      }
    },
    {
      id: 'siem',
      label: 'SIEM',
      category: 'Detection',
      x: 50,
      y: 50,
      details: {
        headline: 'Splunk Log Ingestion & Threat Monitoring',
        points: [
          'Splunk Enterprise configuration on Linux',
          'Universal Forwarder deployment & pipeline optimization',
          'Windows Security Event Log monitoring (Event 4625)',
          'Brute-force logon anomaly alert generation'
        ],
        connections: ['linux', 'cybersecurity', 'networking']
      }
    },
    {
      id: 'python',
      label: 'PYTHON',
      category: 'Scripting',
      x: 32,
      y: 87,
      details: {
        headline: 'Security Automation & Integrity Verification',
        points: [
          'MD5 cryptographic hash generation and identification',
          'Automated hash lookup and file discrepancy comparison',
          'Defensive verification script authoring',
          'Secure password handling concepts'
        ],
        connections: ['linux', 'cybersecurity', 'shell']
      }
    },
    {
      id: 'shell',
      label: 'SHELL',
      category: 'Automation',
      x: 68,
      y: 87,
      details: {
        headline: 'Bash Automation & CLI Tooling',
        points: [
          'Automated Bash scripting for scheduled workflows',
          'Pipes, redirections, grep, awk, and sed text processing',
          'System integrity check automation',
          'CLI-first operational discipline'
        ],
        connections: ['linux', 'python', 'sysadmin']
      }
    },
    {
      id: 'infrastructure',
      label: 'INFRASTRUCTURE',
      category: 'Hardware & Edge',
      x: 76,
      y: 68,
      details: {
        headline: 'Perimeter Hardware & Edge Systems',
        points: [
          'CCTV camera arrays, DVR & NVR storage backbones',
          'ESP32 microcontroller integration & circuit wiring',
          'RFID access reader hardware authentication',
          'Switching, routing and edge appliance diagnostics'
        ],
        connections: ['networking', 'sysadmin', 'linux']
      }
    }
  ] as NetworkNode[],

  skillCategories: [
    {
      category: 'OPERATING SYSTEMS',
      badge: 'OS_KERNEL',
      skills: ['Linux', 'Ubuntu', 'CentOS', 'Windows']
    },
    {
      category: 'LINUX & SCRIPTING',
      badge: 'BASH_CLI',
      skills: ['Shell Scripting', 'Linux Command Line', 'File Permissions', 'Linux Installation & Troubleshooting']
    },
    {
      category: 'NETWORKING',
      badge: 'NET_IP',
      skills: ['Network Configuration', 'Router & Switch Setup', 'IP Addressing', 'Network Troubleshooting']
    },
    {
      category: 'TECHNICAL SUPPORT',
      badge: 'IT_SUPPORT',
      skills: ['Desktop Support', 'Software Installation', 'Windows Support', 'IT Help Desk', 'Remote Support']
    },
    {
      category: 'CYBERSECURITY TOOLS',
      badge: 'SEC_TOOLKIT',
      skills: ['Splunk', 'Wireshark', 'Burp Suite', 'Nmap', 'Metasploit', 'Nessus', 'Nikto', 'Hydra', 'Aircrack-ng']
    },
    {
      category: 'CYBERSECURITY',
      badge: 'DEF_OPS',
      skills: ['Penetration Testing', 'Vulnerability Assessment', 'Basic Web Application Security', 'VAPT']
    },
    {
      category: 'SOFT SKILLS',
      badge: 'COGNITIVE',
      skills: ['Communication', 'Teamwork', 'Critical Thinking', 'Problem Solving', 'Observation', 'Time Management']
    }
  ]
};
