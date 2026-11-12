export interface FilmStat {
  value: string;
  label: string;
}

export interface FilmEducation {
  degree: string;
  institution: string;
  location: string;
  credentials: string[];
}

export interface FilmSkillGroup {
  label: string;
  wave: 'left' | 'right' | 'lower';
  words: string[];
}

export interface FilmProject {
  numeral: '01' | '02' | '03';
  kicker: string;
  title: string;
  summary: string;
  tech: string[];
  githubUrl: string;
  placement: 'right-middle' | 'top-right' | 'bottom-right';
  range: [number, number];
}

export interface FilmAchievement {
  title: string;
  issuer: string;
}

export interface FilmExperienceItem {
  role: string;
  organization: string;
  location: string;
  highlight: string;
}

export const FILM_PORTFOLIO_DATA = {
  protagonist: {
    name: 'Alen Davis K',
    filmCredit: 'An Alen Davis K Film',
    kingdomTitle: 'The Kingdom of Alen',
    starringCredit: 'Starring Alen Davis K',
    tagline:
      'Cybersecurity Analyst, SOC L1 & Linux System Engineer crafting resilient infrastructure, SIEM threat detection, and digital forensics.',
    location: 'Thrissur, Kerala, India',
    portraitUrl: '/alen-davis.jpg',
  },

  stats: [
    { value: '20+', label: 'Linux & Windows Servers Administered' },
    { value: '15+', label: 'Forensic Devices Triaged (Cyber Cell)' },
    { value: '60%', label: 'Ops Toil Reduced via Bash Automation' },
  ] as FilmStat[],

  education: {
    degree: 'Bachelor of Science in Computer Science',
    institution: 'Sahrdaya College of Advanced Studies',
    location: 'Kodakara, Thrissur, Kerala, India',
    credentials: [
      'B.Sc. Computer Science — Sahrdaya College',
      'ADCD v3 — Red Team Hackers Academy',
      'Splunk Core Certified User (Lab Trained)',
      'Digital Forensics & Incident Response',
    ],
  } as FilmEducation,

  skillConstellations: [
    {
      label: 'SIEM & Security Operations',
      wave: 'left',
      words: [
        'Splunk Enterprise SIEM',
        'SPL Threat Hunting',
        'Sysmon Telemetry',
        'Brute-Force Detection',
        'Incident Triage',
        'Event ID 4625 / 4624',
        'Digital Forensics',
        'OSINT Investigation',
      ],
    },
    {
      label: 'Linux, Systems & Automation',
      wave: 'right',
      words: [
        'Ubuntu & CentOS Linux',
        'Bash Shell Scripting',
        'Python Security Tooling',
        'SHA-256 File Integrity',
        'Systemd & Cron Daemons',
        'SSH Hardening & IAM',
        'Windows Server AD',
        'Log Rotation & Auditing',
      ],
    },
    {
      label: 'Networking, VAPT & Hardware',
      wave: 'lower',
      words: [
        'Wireshark Packet Analysis',
        'Nmap Reconnaissance',
        'Burp Suite & Metasploit',
        'TCP/IP, DNS & DHCP',
        'Firewall ACLs & NAT',
        'ESP32 & RFID Security',
        'CCTV / NVR Infrastructure',
        'Section 65B Compliance',
      ],
    },
  ] as FilmSkillGroup[],

  projects: [
    {
      numeral: '01',
      kicker: 'SIEM Engineering & Threat Detection',
      title: 'Splunk SIEM Log Monitoring & Threat Detection Lab',
      summary:
        'Architected a centralized Splunk SIEM lab ingesting Windows Security Event Logs (4625/4624), Linux auth logs, and Sysmon telemetry via Universal Forwarder with real-time SPL correlation alerts for brute-force and privilege escalation.',
      tech: [
        'Splunk Enterprise',
        'Universal Forwarder',
        'Sysmon',
        'SPL Queries',
        'Windows & Linux Logs',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      placement: 'right-middle',
      range: [0.648, 0.698],
    },
    {
      numeral: '02',
      kicker: 'Endpoint Security & Cryptography',
      title: 'Python File Integrity & Hash Monitoring Tool',
      summary:
        'Built an automated File Integrity Monitoring (FIM) engine in Python using hashlib (SHA-256 & MD5) to baseline critical system directories and trigger instant tamper alerts on unauthorized modifications, additions, or deletions.',
      tech: [
        'Python 3',
        'hashlib SHA-256 / MD5',
        'Shell Scripting',
        'Baseline Verification',
        'Linux Security',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      placement: 'top-right',
      range: [0.699, 0.749],
    },
    {
      numeral: '03',
      kicker: 'IoT Hardware & Embedded Access Control',
      title: 'RFID Secure Access Control System using ESP32',
      summary:
        'Engineered a physical hardware authentication gateway integrating an ESP32 microcontroller with an MFRC522 RFID module over SPI, verifying cryptographic UIDs in real time with instant unauthorized entry denial.',
      tech: [
        'ESP32 Microcontroller',
        'MFRC522 RFID',
        'Embedded C / C++',
        'SPI Protocol',
        'Hardware Security',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      placement: 'bottom-right',
      range: [0.75, 0.8],
    },
  ] as FilmProject[],

  achievements: {
    featuredNumber: '40+',
    featuredCaption: 'Phishing Campaigns, Seized Devices & Live Cybercrime Cases Investigated',
    list: [
      {
        title: 'Advanced Diploma in Cyber Defence (ADCD v3)',
        issuer: 'Red Team Hackers Academy, Thrissur',
      },
      {
        title: 'Cyber Forensic Workshop — "Trazada: The Last Trace"',
        issuer: 'Offenso Hackers Academy, Trivandrum',
      },
      {
        title: 'Seasides Cyber Security Conference Delegate',
        issuer: 'International Centre Goa',
      },
      {
        title: 'Splunk Core Certified User (Lab Trained)',
        issuer: 'Enterprise SIEM & Log Analytics',
      },
    ] as FilmAchievement[],
  },

  experience: [
    {
      role: 'Cyber Security Intern',
      organization: 'Police Cyber Cell',
      location: 'Thrissur, Kerala',
      highlight:
        'Assisted law enforcement officers with digital forensics across 15+ seized devices, analyzed 40+ phishing domains via OSINT, and prepared Section 65B IT Act evidentiary reports.',
    },
    {
      role: 'Server Administrator Intern',
      organization: 'HashRoot',
      location: 'Kochi, Kerala',
      highlight:
        'Administered 20+ Ubuntu, CentOS & Windows Server instances, monitored 15+ production nodes, and authored Bash automation scripts cutting manual operational toil by 60%.',
    },
    {
      role: 'CCTV & Networking Administrator',
      organization: 'DNS Solutions',
      location: 'Kerala, India',
      highlight:
        'Configured enterprise routers, switches, IP subnets, and NVR/DVR surveillance networks while resolving Layer 1–3 connectivity faults.',
    },
  ] as FilmExperienceItem[],

  certificationsCredits:
    'ADCD v3 (Red Team Hackers Academy)  •  Trazada Cyber Forensics (Offenso)  •  Seasides Cyber Security Conference (Goa)  •  Splunk Core Certified User Lab',

  contact: {
    invitation:
      'Ready to defend infrastructure, hunt threats in SIEM, and engineer resilient Linux systems.',
    email: 'alend6622@gmail.com',
    phone: '+91 9745775346',
    github: 'https://github.com/alend66',
    repo: 'https://github.com/alend66/alen-system',
    resumePdf: '/Alen_Davis_K_Resume.pdf',
    aiCredit: 'Visuals created with AI (Google Gemini)',
  },
};
