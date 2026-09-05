import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Motorbike,
  Home,
  ShieldCheck,
  Phone,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
  UserCheck,
  Award,
  Sparkles,
  AlertTriangle,
  X,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateClientScore } from '../utils/scoreCalculator';
import { formatCPF, formatPhone } from '../utils/formatters';

interface ClientesViewProps {
  onOpenClientProfile: (tenantId: string, type: 'moto' | 'kitnet') => void;
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  onOpenClientProfile,
  onOpenWhatsApp,
  onNavigateTab,
}) => {
  const { motoTenants, kitnetTenants, motoContracts, kitnetContracts, isDemoMode, toggleDemoMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'moto' | 'kitnet'>('todos');
  const [filterScore, setFilterScore] = useState<'todos' | 'excelente' | 'medio' | 'alto_risco'>('todos');

  // Unified Client List with Calculated Scores
  const clientList = useMemo(() => {
    const list: {
      id: string;
      fullName: string;
      cpf: string;
      phone: string;
      whatsapp: string;
      photoUrl?: string;
      type: 'moto' | 'kitnet';
      profession: string;
      scoreData: ReturnType<typeof calculateClientScore>;
      activeContractsCount: number;
      primaryContractId?: string;
    }[] = [];

    motoTenants.forEach((t) => {
      const contracts = motoContracts.filter((c) => c.tenantId === t.id && c.status === 'ativo');
      const score = calculateClientScore(t, motoContracts);
      list.push({
        id: t.id,
        fullName: t.fullName,
        cpf: t.cpf,
        phone: t.phone,
        whatsapp: t.whatsapp || t.phone,
        photoUrl: t.photoUrl,
        type: 'moto',
        profession: t.profession || 'Locatário',
        scoreData: score,
        activeContractsCount: contracts.length,
        primaryContractId: contracts[0]?.id,
      });
    });

    kitnetTenants.forEach((t) => {
      const contracts = kitnetContracts.filter((c) => c.tenantId === t.id && c.status === 'ativo');
      const score = calculateClientScore(t, kitnetContracts);
      list.push({
        id: t.id,
        fullName: t.fullName,
        cpf: t.cpf,
        phone: t.phone,
        whatsapp: t.whatsapp || t.phone,
        photoUrl: t.photoUrl,
        type: 'kitnet',
        profession: t.incomeType?.toUpperCase() || 'Inquilino',
        scoreData: score,
        activeContractsCount: contracts.length,
        primaryContractId: contracts[0]?.id,
      });
    });

    return list;
  }, [motoTenants, kitnetTenants, motoContracts, kitnetContracts]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = clientList.length;
    const motos = clientList.filter((c) => c.type === 'moto').length;
    const kitnets = clientList.filter((c) => c.type === 'kitnet').length;
    const avgScore =
      total > 0
        ? Math.round(clientList.reduce((acc, c) => acc + c.scoreData.score, 0) / total)
        : 100;
    const excelenteCount = clientList.filter((c) => c.scoreData.classification === 'excelente').length;
    return { total, motos, kitnets, avgScore, excelenteCount };
  }, [clientList]);

  // Filtered List
  const filteredClients = useMemo(() => {
    return clientList.filter((c) => {
      if (filterType !== 'todos' && c.type !== filterType) return false;
      if (filterScore !== 'todos' && c.scoreData.classification !== filterScore) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.cpf.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          c.phone.includes(q) ||
          c.whatsapp.includes(q)
        );
      }
      return true;
    });
  }, [clientList, filterType, filterScore, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-slate-100 max-w-7xl mx-auto pb-4">
      {/* Top Header Card - Clean & Sophisticated */}
      <div className="p-4 sm:p-5 bg-[#121420] border border-white/[0.08] rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="p-2 sm:p-2.5 rounded-xl bg-[#181a28] hover:bg-[#202336] border border-white/[0.08] hover:border-violet-500/30 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 active:scale-95 shadow-xs"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <div className="p-2.5 sm:p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              Gestão de Clientes & Score
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Perfis cadastrais, pontuação de crédito, contratos e cobranças
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Chips & Clientes Demo Button - Standardized h-9 and no text truncation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
          <button
            type="button"
            id="clientes-view-toggle-demo"
            onClick={() => toggleDemoMode()}
            className={`h-9 px-3 rounded-xl border inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-95 text-xs font-semibold select-none whitespace-nowrap shrink-0 ${
              isDemoMode
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 hover:bg-purple-500/30'
                : 'bg-[#161825] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-[#202336]'
            }`}
            title={
              isDemoMode
                ? 'Clientes Demo Ativos: clique para desligar'
                : 'Clientes Demo Desligados: clique para ligar'
            }
          >
            <Users className={`w-3.5 h-3.5 shrink-0 ${isDemoMode ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="shrink-0">Demo</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 tabular-nums ${
                isDemoMode ? 'bg-purple-500/30 text-purple-200 ring-1 ring-purple-400/40' : 'bg-white/5 text-slate-400'
              }`}
            >
              {isDemoMode ? 'LIG' : 'OFF'}
            </span>
          </button>

          <div className="h-9 px-3 rounded-xl bg-[#161825] border border-white/[0.08] inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium shrink-0">Total:</span>
            <span className="text-xs font-bold text-white font-mono tabular-nums shrink-0">{stats.total}</span>
          </div>

          <div className="h-9 px-3 rounded-xl bg-[#161825] border border-white/[0.08] inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
            <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium shrink-0">Score Médio:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums shrink-0">{stats.avgScore} pts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar - Mobile Ergonomic & Standardized h-9 Buttons */}
      <div className="bg-[#121420] border border-white/[0.08] p-3 sm:p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-[#161825] border border-white/[0.08] hover:border-white/[0.15] rounded-xl pl-9 pr-9 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segment & Score Filter Controls - Standardized h-9 and Centered */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar">
            {/* Segment Filter Buttons - Matching icon-specific palettes */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className={`h-9 px-3.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none active:scale-95 ${
                  filterType === 'todos'
                    ? 'bg-violet-500/20 text-violet-200 border-violet-500/50 shadow-xs font-bold'
                    : 'bg-[#161825] hover:bg-[#1E2032] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="shrink-0">Todos</span>
                <span
                  className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold inline-flex items-center justify-center shrink-0 leading-none tabular-nums ${
                    filterType === 'todos'
                      ? 'bg-violet-500/30 text-violet-100 border border-violet-500/30'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {clientList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('moto')}
                className={`h-9 px-3.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none active:scale-95 ${
                  filterType === 'moto'
                    ? 'bg-orange-500/20 text-orange-200 border-orange-500/50 shadow-xs font-bold'
                    : 'bg-[#161825] hover:bg-[#1E2032] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                }`}
              >
                <Motorbike className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="shrink-0">Motos</span>
                <span
                  className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold inline-flex items-center justify-center shrink-0 leading-none tabular-nums ${
                    filterType === 'moto'
                      ? 'bg-orange-500/30 text-orange-100 border border-orange-500/30'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {stats.motos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('kitnet')}
                className={`h-9 px-3.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none active:scale-95 ${
                  filterType === 'kitnet'
                    ? 'bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-xs font-bold'
                    : 'bg-[#161825] hover:bg-[#1E2032] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="shrink-0">Kitnets</span>
                <span
                  className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold inline-flex items-center justify-center shrink-0 leading-none tabular-nums ${
                    filterType === 'kitnet'
                      ? 'bg-sky-500/30 text-sky-100 border border-sky-500/30'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {stats.kitnets}
                </span>
              </button>
            </div>

            {/* Score Selector Dropdown - Standardized h-9 and rounded-xl */}
            <div className="relative shrink-0">
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as any)}
                aria-label="Filtrar por Score"
                className="h-9 bg-[#161825] hover:bg-[#1E2032] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-xs font-semibold rounded-xl pl-3 pr-8 focus:outline-none focus:border-violet-500 cursor-pointer transition-all appearance-none"
              >
                <option value="todos">Todos os Scores</option>
                <option value="excelente">Excelente (80+)</option>
                <option value="medio">Médio (50-79)</option>
                <option value="alto_risco">Alto Risco (&lt;50)</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Client Cards Grid - Clean & Uncluttered (No box inside box) */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#121420] border border-white/[0.08] rounded-2xl p-10 text-center shadow-lg animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-7 h-7 opacity-80" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">Nenhum cliente encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Não foram encontrados clientes cadastrados correspondentes aos filtros ou termo de busca informado.
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => toggleDemoMode(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isDemoMode ? 'Recarregar Clientes Demo' : 'Ligar Clientes Demo para Testes'}</span>
            </button>
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('motos')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Motorbike className="w-3.5 h-3.5" />
                  <span>Cadastrar Moto</span>
                </button>
                <button
                  onClick={() => onNavigateTab('kitnets')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Cadastrar Kitnet</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClients.map((client) => {
            const score = client.scoreData;
            const isExcelente = score.classification === 'excelente';
            const isMedio = score.classification === 'medio';

            const scoreBadgeStyle = isExcelente
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : isMedio
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400';

            const isMoto = client.type === 'moto';

            return (
              <div
                key={client.id}
                id={`client-card-${client.id}`}
                onClick={() => onOpenClientProfile(client.id, client.type)}
                className="bg-[#121420] border border-white/[0.08] hover:border-violet-500/40 p-4 sm:p-4.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 group shadow-sm hover:shadow-lg hover:shadow-violet-950/20 active:scale-[0.99]"
              >
                {/* Top Profile & Score Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Photo or Monogram */}
                    {client.photoUrl ? (
                      <img
                        src={client.photoUrl}
                        alt={client.fullName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover border border-white/[0.12] shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/30 border border-violet-500/30 flex items-center justify-center font-bold text-sm text-violet-200 group-hover:from-violet-600 group-hover:to-purple-600 group-hover:text-white transition-all shrink-0 shadow-xs">
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {client.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                        CPF: {formatCPF(client.cpf)}
                      </p>
                    </div>
                  </div>

                  {/* Clean Score Pill */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border tabular-nums shrink-0 flex items-center gap-1 ${scoreBadgeStyle}`}
                  >
                    {isExcelente ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Award className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{score.score} pts</span>
                  </div>
                </div>

                {/* Clean Key Details (NO nested box, elegant divider list) */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs">
                  {/* Segment & Active Contracts */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Segmento:</span>
                    {isMoto ? (
                      <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-[11px] flex items-center gap-1">
                        <Motorbike className="w-3 h-3" />
                        <span>Locação Moto</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium text-[11px] flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        <span>Locação Kitnet</span>
                      </span>
                    )}
                  </div>

                  {/* WhatsApp / Contato */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Contato:</span>
                    <span className="text-slate-200 font-medium font-mono tabular-nums flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{formatPhone(client.whatsapp || client.phone)}</span>
                    </span>
                  </div>

                  {/* Classificação & Contratos */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Classificação:</span>
                    <span
                      className={`font-semibold ${
                        isExcelente
                          ? 'text-emerald-400'
                          : isMedio
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isExcelente ? 'Excelente' : isMedio ? 'Médio Risco' : 'Alto Risco'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Contratos Ativos:</span>
                    <span className="font-semibold text-white font-mono">
                      {client.activeContractsCount}{' '}
                      {client.activeContractsCount === 1 ? 'ativo' : 'ativos'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs">
                  <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all">
                    <span>Ver Perfil</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  {client.primaryContractId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWhatsApp(client.primaryContractId!);
                      }}
                      className="p-1.5 sm:p-2 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 rounded-xl border border-[#25D366]/30 hover:border-[#25D366] transition-all cursor-pointer active:scale-90 shadow-xs flex items-center justify-center"
                      title="Cobrança via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


