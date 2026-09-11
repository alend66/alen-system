import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { 
  Cpu, 
  Terminal, 
  Network, 
  LifeBuoy, 
  ShieldAlert, 
  Shield, 
  Brain, 
  Search,
  CheckCircle,
  Tag
} from 'lucide-react';

export const TechStack: React.FC = () => {
  const categories = PORTFOLIO_DATA.skillCategories;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFilterSelect = (catName: string) => {
    sound.playTone(680, 0.02, 'sine', 0.02);
    setSelectedCategory(catName);
  };

  const filteredCategories = categories
    .map(cat => {
      const isCatMatch = selectedCategory === 'ALL' || selectedCategory === cat.category;
      if (!isCatMatch) return null;

      const filteredSkills = cat.skills.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filteredSkills.length === 0) return null;

      return {
        ...cat,
        skills: filteredSkills
      };
    })
    .filter(Boolean);

  const getCategoryIcon = (badge: string) => {
    switch (badge) {
      case 'OS_KERNEL': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'BASH_CLI': return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'NET_IP': return <Network className="w-4 h-4 text-blue-400" />;
      case 'IT_SUPPORT': return <LifeBuoy className="w-4 h-4 text-purple-400" />;
      case 'SEC_TOOLKIT': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'DEF_OPS': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'COGNITIVE': return <Brain className="w-4 h-4 text-pink-400" />;
      default: return <Tag className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <section id="stack" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-mono">
      
      {/* Section Header */}
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          SYSTEM CAPABILITIES // TECHNOLOGY STACK
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Technology Stack
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          No arbitrary percentage meters. Categorized operational proficiencies across systems, networks, cybersecurity toolchains, and root-cause analysis.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#090d14]/90 border border-cyan-500/30 rounded-xl p-4 sm:p-5 shadow-xl backdrop-blur-md mb-8 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill / tool..."
              className="w-full bg-[#0e131d] border border-slate-800 focus:border-cyan-500/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 outline-none transition-colors"
            />
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AUTHORITATIVE RESUME DATASET</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          <button
            onClick={() => handleFilterSelect('ALL')}
            className={`px-3 py-1 rounded text-xs transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            [ALL CATEGORIES]
          </button>

          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => handleFilterSelect(cat.category)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                selectedCategory === cat.category
                  ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Grid of Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          if (!cat) return null;

          return (
            <div
              key={cat.category}
              className="bg-[#090d14]/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 shadow-xl backdrop-blur-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.badge)}
                    <h3 className="font-bold text-white tracking-wider uppercase">
                      {cat.category}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                    {cat.badge}
                  </span>
                </div>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill}
                      onMouseEnter={() => sound.playTone(900, 0.015, 'sine', 0.01)}
                      className="px-2.5 py-1 rounded bg-[#0f1420] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-xs text-slate-300 hover:text-cyan-200 transition-all cursor-default flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>{cat.skills.length} item{cat.skills.length > 1 ? 's' : ''} verified</span>
                <span className="text-emerald-400">READY</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
