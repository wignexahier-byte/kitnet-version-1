import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { CategoryStamp } from '../CategoryIcons';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category?: 'moto' | 'kitnet';
  text: string;
  subtext: string;
  contractId?: string;
  installmentId?: string;
}

interface DashboardAlertsListProps {
  alertItems: AlertItem[];
  onOpenWhatsAppModal: (contractId?: string, installmentId?: string) => void;
}

export const DashboardAlertsList: React.FC<DashboardAlertsListProps> = ({
  alertItems,
  onOpenWhatsAppModal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="lg:col-span-1 app-card p-5 flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-sm font-bold text-[#F5F5F7]">Alertas Operacionais</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 tabular-nums">
          {alertItems.length} ativos
        </span>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-80 pr-1">
        {alertItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9A9AA2]">
            <CheckCircle2 className="w-7 h-7 text-[#10B981] mx-auto mb-2 opacity-80" />
            Sem alertas pendentes no momento!
          </div>
        ) : (
          alertItems.map((alert) => {
            const isMoto = alert.category === 'moto';
            const isCritical = alert.type === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-all ${
                  isCritical
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/25 text-[#EF4444]'
                    : isMoto
                    ? 'bg-[#E07A3F]/10 border-[#E07A3F]/25 text-[#E07A3F]'
                    : 'bg-[#0EA5E9]/10 border-[#0EA5E9]/25 text-[#0EA5E9]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {alert.category && (
                      <CategoryStamp category={alert.category} size="xs" iconOnly />
                    )}
                    <span className="font-bold text-[#F5F5F7] truncate">{alert.text}</span>
                  </div>
                  {alert.contractId && (
                    <button
                      type="button"
                      onClick={() => onOpenWhatsAppModal(alert.contractId!, alert.installmentId)}
                      className="h-7 px-2.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shrink-0 shadow-xs select-none"
                      title="Enviar cobrança via WhatsApp"
                    >
                      <Send className="w-3 h-3 shrink-0" />
                      <span>Cobrar</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-[#9A9AA2]">{alert.subtext}</span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
