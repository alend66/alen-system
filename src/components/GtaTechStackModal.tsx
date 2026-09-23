import React, { useState } from 'react';
import { X, Search, Cpu, Terminal, Network, Shield, ShieldAlert, Brain, Tag } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { gtaAudio } from '../utils/gtaAudio';

interface GtaTechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GtaTechStackModal: React.FC<GtaTechStackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const categories = PORTFOLIO_DATA.skillCategories;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

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
      case 'SEC_TOOLKIT': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'DEF_OPS': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'COGNITIVE': return <Brain className="w-4 h-4 text-pink-400" />;
      default: return <Tag className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-amber-500/40 rounded-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 text-slate-200 font-mono">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                ARSENAL & REPOSITORY
              </span>
            </div>
            <h3 className="gta-heading text-3xl sm:text-4xl text-white tracking-wide">
              CYBER & SYSTEMS TOOLKIT
            </h3>
          </div>

          <button
            onClick={() => {
              gtaAudio.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tools (e.g. Splunk, Bash)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            <button
              onClick={() => {
                gtaAudio.playClick();
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-black/50 border-white/10 text-slate-400'
              }`}
            >
              ALL
            </button>
            {categories.map(c => (
              <button
                key={c.category}
                onClick={() => {
                  gtaAudio.playClick();
                  setSelectedCategory(c.category);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedCategory === c.category
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-black/50 border-white/10 text-slate-400'
                }`}
              >
                {c.category}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredCategories.map(cat => {
            if (!cat) return null;
            return (
              <div
                key={cat.category}
                className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-3 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.badge)}
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {cat.category}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                    {cat.badge}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:border-amber-400/50 hover:text-amber-200 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
