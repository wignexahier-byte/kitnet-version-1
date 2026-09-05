import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface DashboardPerformanceChartProps {
  chartViewMode: 'evolution' | 'comparison';
  setChartViewMode: (mode: 'evolution' | 'comparison') => void;
  monthlyEvolutionData: any[];
  revenueExpenseData: any[];
}

/**
 * Calcula ticks redondos, proporcionais e não-duplicados para o eixo Y
 */
function calculateYAxisTicks(data: Array<{ receita?: number; despesa?: number; lucro?: number }>): number[] {
  if (!data || data.length === 0) {
    return [0, 1000, 2000, 3000];
  }

  let minVal = 0;
  let maxVal = 0;

  data.forEach((d) => {
    const vals = [d.receita || 0, d.despesa || 0, d.lucro || 0];
    vals.forEach((v) => {
      if (typeof v === 'number' && !isNaN(v)) {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    });
  });

  // Se não houver valores positivos
  if (maxVal <= 0 && minVal >= 0) {
    return [0, 1000, 2000, 3000];
  }

  const range = maxVal - minVal;
  const targetIntervals = 4;
  const roughStep = (range || 1000) / targetIntervals;

  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep || 100)));
  const normalized = roughStep / magnitude;

  let niceStep = magnitude;
  if (normalized <= 1.2) niceStep = 1 * magnitude;
  else if (normalized <= 2.5) niceStep = 2 * magnitude;
  else if (normalized <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  if (niceStep < 100) niceStep = 100;

  const bottomTick = Math.floor(minVal / niceStep) * niceStep;
  const topTick = Math.ceil(maxVal / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let t = bottomTick; t <= topTick; t += niceStep) {
    ticks.push(t);
  }

  // Garantir pelo menos 3 ticks para equilíbrio visual
  if (ticks.length === 1) {
    ticks.unshift(ticks[0] - niceStep);
    ticks.push(ticks[ticks.length - 1] + niceStep);
  } else if (ticks.length === 2) {
    ticks.push(ticks[1] + niceStep);
  }

  return ticks;
}

/**
 * Formata os ticks do eixo Y de forma limpa, evitando rótulos repetidos
 */
function formatYAxisTick(val: number): string {
  if (val === 0) return 'R$ 0';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const prefix = isNegative ? '-R$ ' : 'R$ ';

  if (absVal >= 1000) {
    if (absVal % 1000 === 0) {
      return `${prefix}${absVal / 1000}k`;
    }
    const inK = absVal / 1000;
    return `${prefix}${inK.toFixed(1).replace('.', ',')}k`;
  }
  return `${prefix}${absVal}`;
}

export const DashboardPerformanceChart: React.FC<DashboardPerformanceChartProps> = ({
  chartViewMode,
  setChartViewMode,
  monthlyEvolutionData,
  revenueExpenseData,
}) => {
  // Formata os dados de evolução adicionando a indicação visual '(parcial)' no mês atual
  const formattedEvolutionData = useMemo(() => {
    if (!monthlyEvolutionData || monthlyEvolutionData.length === 0) return [];
    const now = new Date();
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthLabel = `${monthsNames[now.getMonth()]}/${String(now.getFullYear()).slice(2)}`;

    return monthlyEvolutionData.map((item, index) => {
      const isCurrentMonth = index === monthlyEvolutionData.length - 1 || item.mes === currentMonthLabel;
      return {
        ...item,
        displayMes: isCurrentMonth ? `${item.mes} (parcial)` : item.mes,
        isCurrentMonth,
      };
    });
  }, [monthlyEvolutionData]);

  // Ticks calculados explicitamente para o modo Evolução
  const evolutionTicks = useMemo(() => {
    return calculateYAxisTicks(monthlyEvolutionData);
  }, [monthlyEvolutionData]);

  // Ticks calculados explicitamente para o modo Comparação
  const comparisonTicks = useMemo(() => {
    return calculateYAxisTicks(revenueExpenseData);
  }, [revenueExpenseData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.18 }}
      className="lg:col-span-2 app-card p-5 flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h3 className="text-sm font-bold text-[#F5F5F7] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
            <span>
              {chartViewMode === 'evolution'
                ? 'Evolução Mensal do Fluxo Financeiro (6 Meses)'
                : 'Receitas Previstas vs Custos Operacionais'}
            </span>
          </h3>
          <p className="text-xs text-[#9A9AA2] flex items-center gap-1.5 mt-0.5">
            <span>
              {chartViewMode === 'evolution'
                ? 'Receitas pagas, despesas e lucro líquido mensal consolidado'
                : 'Demonstrativo analítico discriminado por segmento'}
            </span>
            {chartViewMode === 'evolution' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#A78BFA] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded-md border border-[#8B5CF6]/20">
                <Info className="w-3 h-3" />
                Mês atual em andamento
              </span>
            )}
          </p>
        </div>

        {/* Toggle View Mode */}
        <div className="flex items-center gap-1 p-1 bg-[#141418] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setChartViewMode('evolution')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              chartViewMode === 'evolution'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
            }`}
          >
            Evolução (6M)
          </button>
          <button
            type="button"
            onClick={() => setChartViewMode('comparison')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              chartViewMode === 'comparison'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
            }`}
          >
            Por Segmento
          </button>
        </div>
      </div>

      <div className="h-64 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartViewMode === 'evolution' ? (
            <AreaChart data={formattedEvolutionData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              <XAxis dataKey="displayMes" stroke="#9A9AA2" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#9A9AA2"
                fontSize={11}
                tickLine={false}
                ticks={evolutionTicks}
                domain={[evolutionTicks[0], evolutionTicks[evolutionTicks.length - 1]]}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1D24',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#F5F5F7',
                  fontSize: '12px',
                }}
                labelFormatter={(label: any) => {
                  const isParcial = typeof label === 'string' && label.includes('(parcial)');
                  return isParcial ? `${label} • Mês em andamento` : label;
                }}
                formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9A9AA2' }} />
              <Area
                type="monotone"
                dataKey="receita"
                name="Receita Recebida"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorReceita)"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  const isLast = index === formattedEvolutionData.length - 1;
                  if (isLast) {
                    return (
                      <g key={`dot-receita-${index}`}>
                        <circle cx={cx} cy={cy} r={5} fill="#10B981" stroke="#121214" strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={8} fill="none" stroke="#10B981" strokeWidth={1.5} strokeDasharray="2 2" />
                      </g>
                    );
                  }
                  return <circle key={`dot-receita-${index}`} cx={cx} cy={cy} r={3} fill="#10B981" />;
                }}
              />
              <Area
                type="monotone"
                dataKey="lucro"
                name="Lucro Líquido"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#colorLucro)"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  const isLast = index === formattedEvolutionData.length - 1;
                  if (isLast) {
                    return (
                      <g key={`dot-lucro-${index}`}>
                        <circle cx={cx} cy={cy} r={5} fill="#8B5CF6" stroke="#121214" strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={8} fill="none" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="2 2" />
                      </g>
                    );
                  }
                  return <circle key={`dot-lucro-${index}`} cx={cx} cy={cy} r={3} fill="#8B5CF6" />;
                }}
              />
              <Area
                type="monotone"
                dataKey="despesa"
                name="Despesa"
                stroke="#EF4444"
                fillOpacity={0}
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  const isLast = index === formattedEvolutionData.length - 1;
                  return (
                    <circle
                      key={`dot-despesa-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isLast ? 4 : 2.5}
                      fill="#EF4444"
                    />
                  );
                }}
              />
            </AreaChart>
          ) : (
            <BarChart data={revenueExpenseData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#9A9AA2" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#9A9AA2"
                fontSize={11}
                tickLine={false}
                ticks={comparisonTicks}
                domain={[comparisonTicks[0], comparisonTicks[comparisonTicks.length - 1]]}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1D24',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#F5F5F7',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9A9AA2' }} />
              <Bar dataKey="receita" name="Receita Prevista" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa Operacional" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

