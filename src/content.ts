/**
 * Authoritative Resume Content for Alen Davis K
 * Source: Alen_Davis_K_Resume.pdf & Alen_Davis_K_Resume_final (1).pdf
 * Zero invented dates, numbers, links, or credentials.
 */

export const CURSOR_COLORS = [
  '#3478F6',
  '#8758FF',
  '#FF5A70',
  '#13B89A',
  '#FF963B',
  '#E84CB8',
  '#28BCE8',
  '#A5C940',
  '#6741D9',
  '#F26B38',
] as const;

export const NAMED_BUILDER_ROLES = [
  { name: 'Creative Director', color: '#3478F6' },
  { name: 'Frontend Agent', color: '#8758FF' },
  { name: 'UI Designer', color: '#FF5A70' },
  { name: 'AI Engineer', color: '#13B89A' },
  { name: 'Backend Agent', color: '#FF963B' },
  { name: 'Motion Agent', color: '#E84CB8' },
  { name: 'Research Agent', color: '#28BCE8' },
  { name: 'Code Architect', color: '#A5C940' },
  { name: 'Vision Agent', color: '#6741D9' },
  { name: 'Data Agent', color: '#F26B38' },
  { name: 'Product Strategist', color: '#3478F6' },
  { name: 'Quality Agent', color: '#13B89A' },
] as const;

export interface CollectiveProject {
  id: string;
  index: string;
  name: string;
  hook: string;
  problem: string;
  built: string;
  stack: string[];
  githubUrl: string;
  accentColor: string;
  illustrationType: 'siem' | 'fim' | 'rfid';
}

export interface CollectiveSkillGroup {
  group: string;
  skills: Array<{
    name: string;
    usedIn: string[];
  }>;
}

export interface CollectiveExperience {
  role: string;
  company: string;
  location: string;
  summary: string;
  bullets: string[];
}

export const PORTFOLIO_CONTENT = {
  identity: {
    firstNameCaps: 'ALEN',
    fullName: 'Alen Davis K',
    fullNameMono: 'ALEN DAVIS K · SOC ANALYST & LINUX SYSTEM ENGINEER',
    logo: 'ALEN.K',
    location: 'Thrissur, Kerala, India',
    statusPill: 'Thrissur, KL · Open to Roles',
    futurePill: 'CURRENTLY BUILDING THE FUTURE',
    tagline: '100+ minds. One digital identity.',
    headlinePrefix: 'I build products ',
    headlineAccent: 'that think.',
    heroDescription:
      'Engineering Splunk SIEM threat detection labs, Python SHA-256 file integrity monitors, and ESP32 RFID hardware access control.',
    studyingRow:
      'B.Sc. in Computer Science — Sahrdaya College of Advanced Studies, Kodakara · ADCD v3 Cyber Defence (Red Team Hackers Academy)',
    standingRow:
      'Cyber Security Intern (Police Cyber Cell) · Server Admin Intern (HashRoot) · Networking Admin (DNS Solutions)',
    photoUrl: '/alen-davis.jpg',
    resumePdfUrl: '/Alen_Davis_K_Resume.pdf',
    email: 'alend6622@gmail.com',
    phone: '+91 9745775346',
    githubUrl: 'https://github.com/alend66',
    repoUrl: 'https://github.com/alend66/alen-system',
  },

  about: {
    label: '/about',
    heading: 'The human in the loop.',
    statement:
      'I am a Computer Science graduate and Cybersecurity & Linux System Engineer from Thrissur, Kerala who believes reliable security starts with understanding how Linux servers, networks, and logs behave under real pressure—from triaging digital evidence at the Police Cyber Cell to administering production servers at HashRoot and building custom SIEM detection rules in Splunk.',
    columns: [
      {
        title: 'Education',
        items: [
          'Bachelor of Science in Computer Science — Sahrdaya College of Advanced Studies, Kodakara, Kerala',
          'Advanced Diploma in Cyber Defence (ADCD v3) — Red Team Hackers Academy, Thrissur, Kerala',
        ],
      },
      {
        title: 'Craft',
        items: [
          'SIEM Log Ingestion & SPL Threat Hunting in Splunk Enterprise',
          'Ubuntu & CentOS Linux Server Administration, SSH Hardening & Bash Automation',
          'Digital Forensics, OSINT Phishing Analysis & Network Packet Inspection',
        ],
      },
      {
        title: 'Habits',
        items: [
          'Automating repetitive server maintenance with Bash and Python scripts',
          'Baselining critical system files with cryptographic SHA-256 / MD5 hashes',
          'Investigating authentication anomalies (Event IDs 4625/4624) down to root cause',
        ],
      },
    ],
  },

  numbers: [
    {
      value: 20,
      suffix: '+',
      label: 'Linux & Windows Server instances administered across Ubuntu, CentOS & Active Directory at HashRoot',
      color: '#3478F6',
    },
    {
      value: 15,
      suffix: '+',
      label: 'Seized digital devices forensically imaged & triaged with chain-of-custody at Police Cyber Cell',
      color: '#8758FF',
    },
    {
      value: 40,
      suffix: '+',
      label: 'Phishing email headers & malicious domains analyzed via OSINT during live cybercrime investigations',
      color: '#13B89A',
    },
    {
      value: 60,
      suffix: '%',
      label: 'Reduction in manual server maintenance tasks achieved through automated Bash & Cron scripts',
      color: '#FF5A70',
    },
  ],

  projects: [
    {
      id: 'splunk-siem',
      index: '01',
      name: 'Splunk SIEM Log Monitoring & Threat Detection Lab',
      hook: 'Real-time brute-force and privilege-escalation correlation across Windows & Linux endpoints.',
      problem:
        'Distributed authentication logs across Windows and Linux endpoints make it difficult to spot brute-force bursts, anomalous logons, and privilege escalations in real time.',
      built:
        'Configured Splunk Enterprise with Universal Forwarder and Sysmon to ingest Windows Event Logs (4625/4624) and Linux auth logs, writing custom SPL correlation searches, dashboards, and real-time SOC alerts.',
      stack: [
        'Splunk Enterprise',
        'Universal Forwarder',
        'Sysmon',
        'SPL',
        'Windows Event Logs',
        'Linux Auth Logs',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      accentColor: '#3478F6',
      illustrationType: 'siem',
    },
    {
      id: 'python-fim',
      index: '02',
      name: 'Python File Integrity & Hash Monitoring Tool',
      hook: 'Cryptographic SHA-256 & MD5 baseline verification for critical system directories.',
      problem:
        'Unauthorized file modifications, backdoors, or configuration tampering on Linux servers can go unnoticed without continuous cryptographic integrity verification.',
      built:
        'Developed a Python & Shell security utility using hashlib (SHA-256 and MD5) that records cryptographic baselines of target directories and triggers immediate alerts on file creation, modification, or deletion.',
      stack: [
        'Python',
        'hashlib (SHA-256 / MD5)',
        'Bash Shell Scripting',
        'Linux Filesystem',
        'Integrity Monitoring',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      accentColor: '#13B89A',
      illustrationType: 'fim',
    },
    {
      id: 'esp32-rfid',
      index: '03',
      name: 'RFID Secure Access Control System using ESP32',
      hook: 'Hardware-level physical authentication using embedded SPI communication.',
      problem:
        'Sensitive server rooms and lab zones require fast, tamper-resistant physical credential verification at the door hardware layer.',
      built:
        'Built an embedded access control prototype interfacing an ESP32 microcontroller with an MFRC522 RFID reader over SPI in C/C++, validating authorized UIDs in real time and rejecting unknown tags.',
      stack: [
        'ESP32',
        'MFRC522 RFID',
        'Embedded C / C++',
        'SPI Protocol',
        'Hardware Security',
      ],
      githubUrl: 'https://github.com/alend66/alen-system',
      accentColor: '#8758FF',
      illustrationType: 'rfid',
    },
  ] as CollectiveProject[],

  stack: [
    {
      group: 'SIEM & Security Operations',
      skills: [
        {
          name: 'Splunk Enterprise',
          usedIn: ['Splunk SIEM Log Monitoring & Threat Detection Lab'],
        },
        {
          name: 'SPL (Search Processing Language)',
          usedIn: ['Splunk SIEM Log Monitoring & Threat Detection Lab'],
        },
        {
          name: 'Sysmon & Event IDs 4625/4624',
          usedIn: ['Splunk SIEM Log Monitoring & Threat Detection Lab'],
        },
        {
          name: 'OSINT & Phishing Analysis',
          usedIn: ['Police Cyber Cell Internship'],
        },
        {
          name: 'Digital Forensics & Section 65B',
          usedIn: ['Police Cyber Cell Internship'],
        },
      ],
    },
    {
      group: 'Linux & Server Administration',
      skills: [
        {
          name: 'Ubuntu & CentOS Linux',
          usedIn: ['HashRoot Server Admin Internship', 'Splunk SIEM Log Monitoring & Threat Detection Lab'],
        },
        {
          name: 'Windows Server & Active Directory',
          usedIn: ['HashRoot Server Admin Internship', 'Splunk SIEM Log Monitoring & Threat Detection Lab'],
        },
        {
          name: 'SSH Hardening & User IAM',
          usedIn: ['HashRoot Server Admin Internship'],
        },
        {
          name: 'Systemd, Cron & Log Rotation',
          usedIn: ['HashRoot Server Admin Internship', 'Python File Integrity & Hash Monitoring Tool'],
        },
      ],
    },
    {
      group: 'Scripting & Cryptographic Tooling',
      skills: [
        {
          name: 'Python 3',
          usedIn: ['Python File Integrity & Hash Monitoring Tool'],
        },
        {
          name: 'hashlib (SHA-256 & MD5)',
          usedIn: ['Python File Integrity & Hash Monitoring Tool'],
        },
        {
          name: 'Bash Shell Scripting',
          usedIn: ['HashRoot Server Admin Internship', 'Python File Integrity & Hash Monitoring Tool'],
        },
        {
          name: 'Embedded C / C++',
          usedIn: ['RFID Secure Access Control System using ESP32'],
        },
      ],
    },
    {
      group: 'Networking, VAPT & Hardware',
      skills: [
        {
          name: 'Wireshark & Nmap',
          usedIn: ['ADCD v3 Cyber Defence Lab', 'DNS Solutions Networking'],
        },
        {
          name: 'Burp Suite & Metasploit',
          usedIn: ['ADCD v3 Cyber Defence Lab'],
        },
        {
          name: 'TCP/IP, DNS, DHCP, NAT & Firewalls',
          usedIn: ['DNS Solutions Networking', 'HashRoot Server Admin Internship'],
        },
        {
          name: 'ESP32 & MFRC522 RFID (SPI)',
          usedIn: ['RFID Secure Access Control System using ESP32'],
        },
      ],
    },
  ] as CollectiveSkillGroup[],

  processStages: [
    {
      step: '01',
      agent: 'Idea',
      role: 'Product Strategist',
      color: '#3478F6',
      detail: 'Define threat model, operational bottleneck, or physical access requirement.',
    },
    {
      step: '02',
      agent: 'Research',
      role: 'Research Agent',
      color: '#28BCE8',
      detail: 'Inspect MITRE ATT&CK patterns, Windows/Linux event schemas, and RFC specs.',
    },
    {
      step: '03',
      agent: 'Architecture',
      role: 'Code Architect',
      color: '#A5C940',
      detail: 'Design forwarder pipelines, SHA-256 baseline schemas, or SPI pinout topologies.',
    },
    {
      step: '04',
      agent: 'UI Design',
      role: 'UI Designer',
      color: '#FF5A70',
      detail: 'Structure clean SOC telemetry views, alert tables, and operator console output.',
    },
    {
      step: '05',
      agent: 'Frontend',
      role: 'Frontend Agent',
      color: '#8758FF',
      detail: 'Build interactive dashboards, visual correlation panels, and status indicators.',
    },
    {
      step: '06',
      agent: 'Backend',
      role: 'Backend Agent',
      color: '#FF963B',
      detail: 'Implement Python hashlib scanners, Bash daemons, and log ingestion pipelines.',
    },
    {
      step: '07',
      agent: 'AI Engineering',
      role: 'AI Engineer',
      color: '#13B89A',
      detail: 'Tune SPL anomaly thresholds and automated triage heuristics to cut false positives.',
    },
    {
      step: '08',
      agent: 'Quality',
      role: 'Quality Agent',
      color: '#E84CB8',
      detail: 'Simulate brute-force attacks, file tampering, and unauthorized RFID tags.',
    },
    {
      step: '09',
      agent: 'Deployment',
      role: 'Creative Director',
      color: '#6741D9',
      detail: 'Harden services, schedule Cron jobs, and document incident response playbooks.',
    },
  ],

  experience: [
    {
      role: 'Cyber Security Intern',
      company: 'Police Cyber Cell',
      location: 'Thrissur, Kerala',
      summary:
        'Assisted law enforcement cybercrime investigators with digital evidence collection, forensic triage, and OSINT phishing analysis.',
      bullets: [
        'Supported digital evidence acquisition and forensic triage across 15+ seized mobile and storage devices while preserving strict chain of custody.',
        'Analyzed 40+ phishing email headers and malicious domains using OSINT tools to trace threat infrastructure.',
        'Examined IP access logs across 10+ financial fraud cases and assisted in preparing Section 65B IT Act compliant documentation.',
      ],
    },
    {
      role: 'Server Administrator Intern',
      company: 'HashRoot',
      location: 'Kochi, Kerala',
      summary:
        'Administered Linux (Ubuntu/CentOS) and Windows Server infrastructure, automating maintenance and hardening access.',
      bullets: [
        'Administered and configured 20+ Linux (Ubuntu, CentOS) and Windows Server instances including user/group IAM, SSH hardening, and firewall policies.',
        'Monitored 15+ host nodes for CPU, memory, disk, and service availability, resolving system bottlenecks.',
        'Authored automated Bash & Cron scripts for log rotation, backups, and health checks, reducing manual tasks by 60%.',
      ],
    },
    {
      role: 'CCTV & Networking Administrator',
      company: 'DNS Solutions',
      location: 'Kerala, India',
      summary:
        'Deployed and maintained IP surveillance networks, routers, switches, and structured cabling.',
      bullets: [
        'Installed, configured, and maintained NVR/DVR systems, IP cameras, routers, and managed switches.',
        'Performed subnetting, static/DHCP IP allocation, port forwarding, and Layer 1–3 fault isolation.',
      ],
    },
  ] as CollectiveExperience[],

  certifications: [
    {
      name: 'Advanced Diploma in Cyber Defence (ADCD v3)',
      issuer: 'Red Team Hackers Academy, Thrissur',
    },
    {
      name: 'Cyber Forensic Workshop — "Trazada: The Last Trace"',
      issuer: 'Offenso Hackers Academy, Trivandrum',
    },
    {
      name: 'Seasides Cyber Security Conference Delegate',
      issuer: 'International Centre Goa',
    },
    {
      name: 'Splunk Core Certified User (Lab Trained)',
      issuer: 'Enterprise SIEM & SPL Log Analytics',
    },
  ],
};

