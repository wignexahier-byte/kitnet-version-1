import React from 'react';
import { Shield, ShieldCheck, AlertTriangle, Award, CheckCircle2, Clock, FileCheck, AlertCircle } from 'lucide-react';
import { calculateClientScore } from '../../../utils/scoreCalculator';

interface ClientDetailScoreTabProps {
  clientScore: ReturnType<typeof calculateClientScore>;
  scoreBadgeColors: Record<string, string>;
}

export const ClientDetailScoreTab: React.FC<ClientDetailScoreTabProps> = ({
  clientScore,
}) => {
  const isExcelente = clientScore.classification === 'excelente';
  const isMedio = clientScore.classification === 'medio';
  const isAltoRisco = clientScore.classification === 'alto_risco';

  const scoreBadgeStyle = isExcelente
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    : isMedio
    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
    : 'bg-red-500/15 border-red-500/30 text-red-400';

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* Top Gauge Hero Card - Clean Layout */}
      <div className="bg-[#121420] p-6 rounded-2xl border border-white/[0.08] text-center shadow-lg space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-inner">
          <Shield className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Score de Avaliação Contratual
          </span>
          <div className="text-5xl font-black text-white font-mono tracking-tight mt-1">
            {clientScore.score}
            <span className="text-lg text-slate-500 font-normal">/100</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Pontuação calculada com base no histórico</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-xs mt-1">
          {isExcelente ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : isAltoRisco ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <Award className="w-4 h-4 text-amber-400" />
          )}
          <span className={scoreBadgeStyle.split(' ')[2]}>
            {isExcelente
              ? 'Excelente (Baixo Risco)'
              : isMedio
              ? 'Médio (Acompanhamento)'
              : 'Alto Risco (Atenção)'}
          </span>
        </div>

        <div className="pt-3 mt-3 border-t border-white/[0.06] text-xs text-slate-300 max-w-lg mx-auto text-left leading-relaxed">
          <span className="font-semibold text-white block mb-1">Diagnóstico do Perfil:</span>
          <p className="text-slate-300">{clientScore.summary}</p>
        </div>
      </div>

      {/* Score Factors Breakdown Card - Clean List */}
      <div className="bg-[#121420] p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
            Composição Detalhada da Pontuação
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Total: {clientScore.score} pts</span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Pontualidade */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Pontualidade de Pagamentos (Máx 40 pts)</span>
              </span>
              <strong className="text-emerald-400 font-mono font-bold">
                +{clientScore.factors.punctuality} pts
              </strong>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(clientScore.factors.punctuality / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Longevidade */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-medium">Tempo & Longevidade de Contrato (Máx 25 pts)</span>
              </span>
              <strong className="text-violet-300 font-mono font-bold">
                +{clientScore.factors.longevity} pts
              </strong>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(clientScore.factors.longevity / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Documentação */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium">Documentação & Análise Cadastral (Máx 20 pts)</span>
              </span>
              <strong className="text-sky-300 font-mono font-bold">
                +{clientScore.factors.documentation} pts
              </strong>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(clientScore.factors.documentation / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Penalidades */}
          {clientScore.factors.occurrencesPenalty > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 mt-2">
              <div className="flex justify-between items-center text-rose-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Penalidade por Atrasos / Ocorrências Recentes</span>
                </span>
                <strong className="font-mono font-bold">
                  -{clientScore.factors.occurrencesPenalty} pts
                </strong>
              </div>
              <p className="text-[11px] text-rose-300/80">
                Descontos aplicados por histórico de atrasos ou sinistros em aberto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

