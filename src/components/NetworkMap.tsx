import React, { useState } from 'react';
import { PORTFOLIO_DATA, NetworkNode } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  Network, 
  Terminal, 
  Shield, 
  Server, 
  Cpu, 
  Code, 
  Workflow, 
  CheckCircle2,
  Info,
  Radio
} from 'lucide-react';

export const NetworkMap: React.FC = () => {
  const nodes = PORTFOLIO_DATA.networkNodes;
  const [activeNodeId, setActiveNodeId] = useState<string>('linux');

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  const handleSelectNode = (id: string) => {
    sound.playBeep(640, 0.04, 'sine', 0.03);
    setActiveNodeId(id);
  };

  // Pre-calculated connections between nodes
  const connections: [string, string][] = [
    ['linux', 'shell'],
    ['linux', 'networking'],
    ['linux', 'sysadmin'],
    ['linux', 'cybersecurity'],
    ['networking', 'infrastructure'],
    ['networking', 'siem'],
    ['sysadmin', 'infrastructure'],
    ['cybersecurity', 'siem'],
    ['cybersecurity', 'python'],
    ['python', 'shell'],
    ['shell', 'linux'],
  ];

  return (
    <section id="network-map" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          FEATURE 02 // TOPOLOGY TELEMETRY
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Infrastructure & Skill Map
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl mx-auto">
          Interactive topology visualizing technical focus domains and interconnects. Select any node to inspect authoritative competency details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Main: Interactive Graph Visualizer */}
        <div className="lg:col-span-8 bg-[#090d14]/90 border border-cyan-500/30 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[460px] flex flex-col justify-between">
          
          {/* Top telemetry bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>NODAL MESH // {nodes.length} ACTIVE CLUSTERS</span>
            </div>
            <div className="text-[11px] text-slate-500">
              CLICK A NODE TO INSPECT
            </div>
          </div>

          {/* SVG Canvas Map (Responsive on desktop/tablet) */}
          <div className="relative w-full h-[360px] sm:h-[400px] my-2">
            
            {/* SVG Lines between nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {connections.map(([fromId, toId], idx) => {
                const fromNode = nodes.find(n => n.id === fromId);
                const toNode = nodes.find(n => n.id === toId);
                if (!fromNode || !toNode) return null;

                const isConnectedToActive = fromId === activeNodeId || toId === activeNodeId;

                return (
                  <g key={`${fromId}-${toId}-${idx}`}>
                    <line
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      stroke={isConnectedToActive ? '#00f0ff' : 'rgba(56, 189, 248, 0.15)'}
                      strokeWidth={isConnectedToActive ? 2 : 1}
                      strokeDasharray={isConnectedToActive ? '4 2' : undefined}
                      className={isConnectedToActive ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === activeNodeId;
              const isNeighbor = activeNode.details.connections.includes(node.id);

              return (
                <button
                  key={node.id}
                  onClick={() => handleSelectNode(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform focus:outline-none ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                  }`}
                  aria-label={`Inspect ${node.label} node`}
                >
                  <div className="flex flex-col items-center">
                    {/* Circle Node */}
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-lg ${
                        isSelected
                          ? 'bg-cyan-500 text-black border-2 border-white ring-4 ring-cyan-500/40 shadow-cyan-500/50'
                          : isNeighbor
                          ? 'bg-[#0e1626] text-cyan-300 border border-cyan-400/60 ring-2 ring-cyan-500/20'
                          : 'bg-[#0e141f] text-slate-300 border border-slate-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {node.id === 'linux' && <Terminal className="w-5 h-5" />}
                      {node.id === 'networking' && <Network className="w-5 h-5" />}
                      {node.id === 'sysadmin' && <Server className="w-5 h-5" />}
                      {node.id === 'cybersecurity' && <Shield className="w-5 h-5" />}
                      {node.id === 'siem' && <Radio className="w-5 h-5" />}
                      {node.id === 'python' && <Code className="w-5 h-5" />}
                      {node.id === 'shell' && <Terminal className="w-5 h-5" />}
                      {node.id === 'infrastructure' && <Cpu className="w-5 h-5" />}
                    </div>

                    {/* Node Label Pill */}
                    <span
                      className={`mt-1.5 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                          : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {node.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Node Switcher chips for mobile / touch accessibility */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 py-1 mr-1">QUICK SELECT:</span>
            {nodes.map(node => (
              <button
                key={node.id}
                onClick={() => handleSelectNode(node.id)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                  node.id === activeNodeId
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {node.label}
              </button>
            ))}
          </div>

        </div>

        {/* Right: Node Telemetry Dossier Panel */}
        <div className="lg:col-span-4 bg-[#0d1117] border border-cyan-500/30 rounded-xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                NODE INSPECTOR
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
              {activeNode.category}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
                {activeNode.label}
              </h3>
              <p className="text-xs font-mono text-cyan-300 mt-1">
                {activeNode.details.headline}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Core Capabilities & Scope:
              </span>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                {activeNode.details.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Mesh Interconnects:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.details.connections.map(connId => {
                  const target = nodes.find(n => n.id === connId);
                  return (
                    <button
                      key={connId}
                      onClick={() => handleSelectNode(connId)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      → {target?.label || connId}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-500 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sourced strictly from Alen Davis K&apos;s verified resume.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
