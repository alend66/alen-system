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
  period: string;
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

export const PORTFOLIO_DATA = {
  personal: {
    name: 'ALEN DAVIS K',
    location: 'Thrissur, Kerala',
    email: 'alend6622@gmail.com',
    phone: '+91 9745775346',
    linkedin: 'https://www.linkedin.com/in/alen-davis-k-69394a3bb',
    github: 'https://github.com/alend66',
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
      role: 'CYBER SECURITY INTERN',
      organization: 'Police Cyber Cell',
      period: '2023 — 2024',
      type: 'DEFENSIVE INVESTIGATIONS',
      dateBadge: '2023 — 2024 // INTERNSHIP',
      highlight: 'Cybercrime investigation exposure, digital forensics chain-of-custody, and security documentation.',
      details: [
        'Direct cybercrime investigation exposure under seasoned cyber cell officers',
        'Digital evidence handling upholding strict chain of custody protocols',
        'Cybersecurity best practices implementation across public-facing and internal channels',
        'Incident documentation and formal investigative reporting',
        'Cyber awareness and threat prevention education initiatives',
        'Hands-on cyber forensics methodologies and digital artifact examination'
      ]
    },
    {
      role: 'CCTV AND NETWORKING ADMINISTRATOR',
      organization: 'DNS Solutions',
      period: '2024 — PRESENT',
      type: 'OPERATIONAL INFRASTRUCTURE',
      dateBadge: '2024 — PRESENT // ADMINISTRATOR',
      highlight: 'Infrastructure deployment, surveillance telemetry, IP subnets, and real-time hardware diagnostics.',
      details: [
        'CCTV camera installation, cabling, calibration, and routine hardware maintenance',
        'DVR and NVR systems deployment, storage management, and continuous recording integrity',
        'Routers and networking devices configuration across client premises',
        'Network troubleshooting, diagnosing connectivity drops, latency, and packet loss',
        'IP configuration, subnet assignments, and gateway routing',
        'System monitoring to guarantee 24/7 uptime for surveillance and network backbones'
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
      y: 22,
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
      x: 22,
      y: 38,
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
      x: 78,
      y: 38,
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
      x: 22,
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
      y: 54,
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
      x: 35,
      y: 84,
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
      x: 65,
      y: 84,
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
      x: 78,
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
