import React, { useState, useMemo } from 'react';
import { Clock, Trash2, Home, Motorbike, DollarSign, Settings as SettingsIcon, Activity, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { TimelineEvent } from '../../types';
import { formatDate } from '../../utils/formatters';

interface SettingsAuditTimelineSectionProps {
  timeline: TimelineEvent[];
  onOpenClearTimelineModal: () => void;
}

export const SettingsAuditTimelineSection: React.FC<SettingsAuditTimelineSectionProps> = ({
  timeline,
  onOpenClearTimelineModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterCategories = [
    { id: 'todos', label: 'Todos', icon: Activity, count: timeline.length, color: 'violet' },
    { id: 'kitnet', label: 'Kitnets', icon: Home, count: timeline.filter((t) => t.entityType === 'kitnet').length, color: 'sky' },
    { id: 'moto', label: 'Motos', icon: Motorbike, count: timeline.filter((t) => t.entityType === 'moto').length, color: 'amber' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, count: timeline.filter((t) => t.entityType === 'financeiro').length, color: 'emerald' },
    { id: 'sistema', label: 'Sistema', icon: SettingsIcon, count: timeline.filter((t) => t.entityType === 'sistema').length, color: 'indigo' },
  ];

  const filteredTimeline = useMemo(() => {
    return timeline.filter((event) => {
      const matchesCategory = selectedCategory === 'todos' || event.entityType === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        (event.entityType && event.entityType.toLowerCase().includes(q))
      );
    });
  }, [timeline, selectedCategory, searchQuery]);

  const getEntityBadge = (type?: string) => {
    switch (type) {
      case 'kitnet':
        return {
          icon: Home,
          label: 'Kitnet',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
          dot: 'bg-sky-400 ring-sky-400/30',
        };
      case 'moto':
        return {
          icon: Motorbike,
          label: 'Moto',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
          dot: 'bg-amber-400 ring-amber-400/30',
        };
      case 'financeiro':
        return {
          icon: DollarSign,
          label: 'Financeiro',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
          dot: 'bg-emerald-400 ring-emerald-400/30',
        };
      case 'sistema':
      default:
        return {
          icon: SettingsIcon,
          label: 'Sistema',
          color: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
          dot: 'bg-violet-400 ring-violet-400/30',
        };
    }
  };

  const getCategoryBtnStyles = (cat: typeof filterCategories[0], isActive: boolean) => {
    if (isActive) {
      switch (cat.color) {
        case 'sky':
          return 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border-sky-400 font-bold';
        case 'amber':
          return 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border-amber-400 font-bold';
        case 'emerald':
          return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 border-emerald-400 font-bold';
        case 'indigo':
        case 'violet':
        default:
          return 'bg-violet-600 text-white shadow-md shadow-violet-600/25 border-violet-500 font-bold';
      }
    }
    return 'bg-[#0d0f17] text-slate-400 hover:text-slate-200 hover:bg-[#161a27] border-white/[0.08]';
  };

  return (
    <div className="rounded-2xl bg-[#11141e]/90 border border-white/[0.08] p-4 sm:p-6 shadow-xl shadow-black/30 space-y-4.5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Timeline de Auditoria
            </h3>
            <p className="text-[11px] text-slate-400">Registro contínuo e rastreável de todas as ações operacionais</p>
          </div>
        </div>

        {/* Destructive Clear History Button */}
        {timeline.length > 0 && (
          <button
            type="button"
            onClick={onOpenClearTimelineModal}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto active:scale-95 shadow-xs shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Top Banner & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Status Indicator */}
        <div className="px-3 py-2 bg-[#0a0c13] border border-white/[0.06] rounded-xl flex items-center gap-2 text-xs text-slate-400 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">
            Auditoria ativa: <strong className="text-slate-200">{timeline.length} eventos</strong> registrados
          </span>
        </div>

        {/* Quick Search */}
        {timeline.length > 3 && (
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no histórico..."
              className="w-full bg-[#0a0c13] border border-white/[0.08] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-hidden transition-all font-sans"
            />
          </div>
        )}
      </div>

      {/* Category Filter Chips Bar (Unbreakable, smoothly scrollable on mobile) */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-2 w-max sm:w-auto">
          {filterCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${getCategoryBtnStyles(
                  cat,
                  isActive
                )}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="shrink-0">{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                    isActive ? 'bg-black/25 text-white' : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern Activity Feed Box with Decent Custom Scroll */}
      <div className="relative rounded-xl bg-[#090b11] border border-white/[0.07] overflow-hidden shadow-inner">
        {/* Scrollable Container */}
        <div className="custom-scroll max-h-[460px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredTimeline.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-9 h-9 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-400">
                {searchQuery ? 'Nenhum evento encontrado para esta busca.' : 'Nenhum evento registrado nesta categoria.'}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-7 space-y-3 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-violet-500/40 before:via-slate-700/40 before:to-transparent">
              {filteredTimeline.map((event) => {
                const badge = getEntityBadge(event.entityType);
                const Icon = badge.icon;

                return (
                  <div
                    key={event.id}
                    className="relative group bg-[#0d101a]/90 hover:bg-[#131724] border border-white/[0.06] hover:border-violet-500/30 rounded-xl p-3.5 sm:p-4 transition-all duration-200 shadow-sm"
                  >
                    {/* Node Dot on vertical timeline */}
                    <div
                      className={`absolute -left-6 sm:-left-7 top-4 w-3.5 h-3.5 rounded-full ring-4 ring-[#090b11] ${badge.dot} group-hover:scale-125 transition-transform shrink-0`}
                    />

                    {/* Event Content */}
                    <div className="space-y-1.5">
                      {/* Header Row: Title, Badge, Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-violet-200 transition-colors leading-snug">
                            {event.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-flex items-center gap-1 shrink-0 ${badge.color}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0" />
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1 self-start sm:self-auto">
                          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      {/* Event Description */}
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtle Bottom Fade / Footer Info */}
        {filteredTimeline.length > 4 && (
          <div className="px-3.5 py-2 bg-[#0b0e17] border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500">
            <span>Exibindo {filteredTimeline.length} eventos</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Sincronizado
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


