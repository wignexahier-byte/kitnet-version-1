import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { maskCPFInput, formatCPF, formatCurrency } from '../../utils/formatters';
import { NumericInput, CurrencyInput } from '../NumericInput';
import { UnifiedClient } from './types';
import {
  Users,
  User,
  UserX,
  Search,
  Check,
  X,
  ChevronDown,
  Home,
  Motorbike,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DocumentCustomFieldsProps {
  docType: string;
  activeTenantName: string;
  activeTenantCpf: string;
  customTenantName: string;
  setCustomTenantName: (val: string) => void;
  customTenantCpf: string;
  setCustomTenantCpf: (val: string) => void;
  customAmount: number;
  setCustomAmount: (val: number) => void;
  customPaymentFrequency?: 'mensal' | 'semanal';
  setCustomPaymentFrequency?: (val: 'mensal' | 'semanal') => void;
  customMonthlyValue?: number;
  setCustomMonthlyValue?: (val: number) => void;
  customDueDay?: number;
  setCustomDueDay?: (val: number) => void;
  customDaysLate: number;
  setCustomDaysLate: (val: number) => void;
  customRefundAmount: number;
  setCustomRefundAmount: (val: number) => void;
  customCleaningFee: number;
  setCustomCleaningFee: (val: number) => void;
  customRepairs: number;
  setCustomRepairs: (val: number) => void;
  customWeeklyValue: number;
  setCustomWeeklyValue: (val: number) => void;
  customDueDayOfWeek: string;
  setCustomDueDayOfWeek: (val: string) => void;
  customDueLimitTime: string;
  setCustomDueLimitTime: (val: string) => void;
  customDeposit: number;
  setCustomDeposit: (val: number) => void;
  customInsuranceDeductible: string;
  setCustomInsuranceDeductible: (val: string) => void;
  customContractCity: string;
  setCustomContractCity: (val: string) => void;
  customInitialKm: number;
  setCustomInitialKm: (val: number) => void;
  customTenantAddress: string;
  setCustomTenantAddress: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  witnessesCount?: number;
  setWitnessesCount?: (val: number) => void;
  witness1Name?: string;
  setWitness1Name?: (val: string) => void;
  witness1Cpf?: string;
  setWitness1Cpf?: (val: string) => void;
  witness2Name?: string;
  setWitness2Name?: (val: string) => void;
  witness2Cpf?: string;
  setWitness2Cpf?: (val: string) => void;
  unifiedClients?: UnifiedClient[];
  selectedClient?: UnifiedClient;
  onSelectClient?: (clientKey: string) => void;
  onClearClient?: () => void;
}

export const DocumentCustomFields: React.FC<DocumentCustomFieldsProps> = ({
  docType,
  activeTenantName,
  activeTenantCpf,
  customTenantName,
  setCustomTenantName,
  customTenantCpf,
  setCustomTenantCpf,
  customAmount,
  setCustomAmount,
  customPaymentFrequency = 'mensal',
  setCustomPaymentFrequency,
  customMonthlyValue = 0,
  setCustomMonthlyValue,
  customDueDay = 10,
  setCustomDueDay,
  customDaysLate,
  setCustomDaysLate,
  customRefundAmount,
  setCustomRefundAmount,
  customCleaningFee,
  setCustomCleaningFee,
  customRepairs,
  setCustomRepairs,
  customWeeklyValue,
  setCustomWeeklyValue,
  customDueDayOfWeek,
  setCustomDueDayOfWeek,
  customDueLimitTime,
  setCustomDueLimitTime,
  customDeposit,
  setCustomDeposit,
  customInsuranceDeductible,
  setCustomInsuranceDeductible,
  customContractCity,
  setCustomContractCity,
  customInitialKm,
  setCustomInitialKm,
  customTenantAddress,
  setCustomTenantAddress,
  customStartDate,
  setCustomStartDate,
  witnessesCount = 2,
  setWitnessesCount,
  witness1Name = '',
  setWitness1Name,
  witness1Cpf = '',
  setWitness1Cpf,
  witness2Name = '',
  setWitness2Name,
  witness2Cpf = '',
  setWitness2Cpf,
  unifiedClients = [],
  selectedClient,
  onSelectClient,
  onClearClient,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isLinked = Boolean(selectedClient);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients based on customTenantName or searchTerm
  const query = (searchTerm || customTenantName || '').toLowerCase().trim();
  const matchingClients = unifiedClients.filter((c) => {
    if (!query) return true;
    const nameMatch = c.fullName.toLowerCase().includes(query);
    const cpfMatch = c.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
    const assetMatch = c.assetLabel.toLowerCase().includes(query);
    return nameMatch || cpfMatch || assetMatch;
  });

  const handlePickClient = (client: UnifiedClient) => {
    if (onSelectClient) {
      onSelectClient(client.id);
    } else {
      setCustomTenantName(client.fullName);
      setCustomTenantCpf(formatCPF(client.cpf));
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Integrated Smart Tenant Input & Autocomplete */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {/* Name input with live autocomplete */}
        <div className="min-w-0 relative" ref={wrapperRef}>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="tenant-name-input"
              className="text-[11px] font-semibold text-[#D4D4D8] flex items-center gap-1.5"
            >
              <span>Nome do Locatário / Inquilino:</span>
            </label>

            {selectedClient && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/20 font-medium"
              >
                <LinkIcon className="w-2.5 h-2.5" />
                <span className="truncate max-w-[130px]">{selectedClient.assetLabel}</span>
                {onClearClient && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearClient();
                    }}
                    className="ml-1 text-[#9C9CA3] hover:text-[#EF4444] cursor-pointer"
                    title="Desvincular e digitar manualmente"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </motion.span>
            )}
          </div>

          <div className="relative">
            <input
              id="tenant-name-input"
              type="text"
              placeholder={activeTenantName || 'Digite o nome para buscar ou preencher...'}
              value={customTenantName}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setCustomTenantName(e.target.value);
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="w-full min-w-0 bg-[#121214] border border-[#2A2A2E] hover:border-[#8B5CF6]/50 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9CA3] hover:text-[#F2F1ED] p-1 cursor-pointer"
              title="Ver lista de locatários cadastrados"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Autocomplete Suggestions Menu with Smooth Motion Opening */}
          <AnimatePresence>
            {isDropdownOpen && unifiedClients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-1.5 bg-[#18181B] border border-[#3E3E45] rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
              >
                <div className="p-2 border-b border-[#2A2A2E] bg-[#141417] flex items-center justify-between text-[10px] text-[#9C9CA3]">
                  <span className="font-semibold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                    Locatários Cadastrados
                  </span>
                  <span>{matchingClients.length} encontrados</span>
                </div>

                {matchingClients.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#9C9CA3]">
                    Nenhum cadastro encontrado. Você pode continuar digitando o nome livremente.
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {matchingClients.map((client, idx) => {
                      const isClientActive = selectedClient?.id === client.id;
                      const Icon = client.type === 'kitnet' ? Home : Motorbike;
                      return (
                        <motion.button
                          key={client.id}
                          type="button"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.12, delay: idx * 0.02 }}
                          onClick={() => handlePickClient(client)}
                          className={`w-full text-left px-3 py-2.5 hover:bg-[#222226] transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                            isClientActive ? 'bg-[#8B5CF6]/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                client.type === 'kitnet'
                                  ? 'bg-sky-500/10 text-sky-400'
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#F2F1ED] truncate">
                                {client.fullName}
                              </div>
                              <div className="text-[10px] text-[#9C9CA3] flex items-center gap-2 truncate">
                                <span>CPF: {formatCPF(client.cpf)}</span>
                                <span>•</span>
                                <span className="text-[#D4D4D8]">{client.assetLabel}</span>
                              </div>
                            </div>
                          </div>

                          {isClientActive && (
                            <div className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CPF input with live mask */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="tenant-cpf-input"
              className="block text-[11px] font-semibold text-[#D4D4D8]"
            >
              CPF do Locatário:
            </label>
            {isLinked && (
              <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                <Lock className="w-2.5 h-2.5" /> Sincronizado
              </span>
            )}
          </div>
          <input
            id="tenant-cpf-input"
            type="text"
            placeholder={activeTenantCpf || '000.000.000-00'}
            value={customTenantCpf}
            readOnly={isLinked}
            onChange={(e) => !isLinked && setCustomTenantCpf(maskCPFInput(e.target.value))}
            className={`w-full min-w-0 border rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
              isLinked
                ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                : 'bg-[#121214] border-[#2A2A2E] hover:border-[#8B5CF6]/50 text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]'
            }`}
          />
        </div>
      </div>

      {/* 2. Specific Parameters by Document Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 pt-1">
        {docType === 'contrato_locacao_moto_completo' && (
          <>
            {isLinked ? (
              <div className="sm:col-span-2 bg-[#141418] p-3.5 rounded-xl border border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">Frequência do Contrato</span>
                      <span className="text-[10px] text-[#10B981] font-semibold px-2 py-0.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/25 inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      Cobrança {customPaymentFrequency === 'semanal' ? 'Semanal' : 'Mensal'} vinculada ao contrato do locatário
                    </p>
                  </div>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#8B5CF6]/20 text-[#DDD6FE] border border-[#8B5CF6]/40 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                    {customPaymentFrequency === 'semanal' ? 'Semanal' : 'Mensal'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="sm:col-span-2 bg-[#141418] p-3 rounded-xl border border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-[#E4E4E7] block">Frequência do Contrato:</span>
                  <span className="text-[11px] text-[#9C9CA3]">
                    {customPaymentFrequency === 'semanal' ? 'Cobrança Semanal (por semana)' : 'Cobrança Mensal (por mês)'}
                  </span>
                </div>
                <div className="flex rounded-xl bg-[#0F0F12] p-1 border border-[#27272A] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCustomPaymentFrequency && setCustomPaymentFrequency('mensal')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      customPaymentFrequency === 'mensal'
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPaymentFrequency && setCustomPaymentFrequency('semanal')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      customPaymentFrequency === 'semanal'
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
            )}

            {customPaymentFrequency === 'semanal' ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                      Valor Semanal do Aluguel (R$):
                    </label>
                    {isLinked && (
                      <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    )}
                  </div>
                  <CurrencyInput
                    value={customWeeklyValue}
                    readOnly={isLinked}
                    onChange={(val) => !isLinked && setCustomWeeklyValue(val)}
                    placeholder="Ex: 312,50"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                      isLinked
                        ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                        : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                      Dia de Pagamento Semanal:
                    </label>
                    {isLinked && (
                      <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    )}
                  </div>
                  {isLinked ? (
                    <div className="w-full bg-[#16161A] border border-[#333338] rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold flex items-center justify-between">
                      <span>{customDueDayOfWeek || 'Segunda-feira'}</span>
                      <span className="text-[10px] text-[#A1A1AA] font-normal">Fixo no contrato</span>
                    </div>
                  ) : (
                    <select
                      value={customDueDayOfWeek}
                      onChange={(e) => setCustomDueDayOfWeek(e.target.value)}
                      className="w-full bg-[#121214] border border-[#2A2A2E] text-[#F2F1ED] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                    >
                      <option value="Segunda-feira">Segunda-feira</option>
                      <option value="Terça-feira">Terça-feira</option>
                      <option value="Quarta-feira">Quarta-feira</option>
                      <option value="Quinta-feira">Quinta-feira</option>
                      <option value="Sexta-feira">Sexta-feira</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                      Valor Mensal do Aluguel (R$):
                    </label>
                    {isLinked && (
                      <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    )}
                  </div>
                  <CurrencyInput
                    value={customMonthlyValue}
                    readOnly={isLinked}
                    onChange={(val) => !isLinked && setCustomMonthlyValue && setCustomMonthlyValue(val)}
                    placeholder="Ex: 1.250,00"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                      isLinked
                        ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                        : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                      Dia de Vencimento Mensal:
                    </label>
                    {isLinked && (
                      <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    )}
                  </div>
                  {isLinked ? (
                    <div className="w-full bg-[#16161A] border border-[#333338] rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold flex items-center justify-between">
                      <span>{customDueDay ? `Todo dia ${customDueDay} de cada mês` : 'Dia 10'}</span>
                      <span className="text-[10px] text-[#A1A1AA] font-normal">Fixo no contrato</span>
                    </div>
                  ) : (
                    <select
                      value={customDueDay}
                      onChange={(e) => setCustomDueDay && setCustomDueDay(Number(e.target.value))}
                      className="w-full bg-[#121214] border border-[#2A2A2E] text-[#F2F1ED] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Todo dia {d} de cada mês
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Horário Limite de Pagamento:
              </label>
              <input
                type="text"
                value={customDueLimitTime}
                onChange={(e) => setCustomDueLimitTime(e.target.value)}
                placeholder="18:00"
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Valor da Caução (R$):
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <CurrencyInput
                value={customDeposit}
                readOnly={isLinked}
                onChange={(val) => !isLinked && setCustomDeposit(val)}
                placeholder="Ex: 800,00"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Franquia do Seguro (R$):
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <input
                type="text"
                value={customInsuranceDeductible}
                readOnly={isLinked}
                onChange={(e) => !isLinked && setCustomInsuranceDeductible(e.target.value)}
                placeholder="1.500,00"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Data de Início:
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <input
                type="date"
                value={customStartDate}
                readOnly={isLinked}
                onChange={(e) => !isLinked && setCustomStartDate(e.target.value)}
                className={`w-full flex items-center border rounded-xl px-3.5 py-2.5 text-xs leading-normal [color-scheme:dark] transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  KM Inicial na Vistoria / Retirada:
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <NumericInput
                mode="integer"
                min={0}
                value={customInitialKm}
                readOnly={isLinked}
                onChange={(val) => !isLinked && setCustomInitialKm(val)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Cidade da Comarca / Foro:
              </label>
              <input
                type="text"
                value={customContractCity}
                onChange={(e) => setCustomContractCity(e.target.value)}
                placeholder="Barra Velha - SC"
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Endereço Completo do Locatário:
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <input
                type="text"
                value={customTenantAddress}
                readOnly={isLinked}
                onChange={(e) => !isLinked && setCustomTenantAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>
          </>
        )}

        {docType === 'recibo_caucao' && (
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                Valor da Caução (R$):
              </label>
              {isLinked && (
                <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5" /> Sincronizado
                </span>
              )}
            </div>
            <CurrencyInput
              value={customAmount}
              readOnly={isLinked}
              onChange={(val) => !isLinked && setCustomAmount(val)}
              placeholder="Ex: 1000,00"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                isLinked
                  ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                  : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]'
              }`}
            />
          </div>
        )}

        {docType === 'notificacao_cobranca' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Valor do Aluguel em Atraso (R$):
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <CurrencyInput
                value={customAmount}
                readOnly={isLinked}
                onChange={(val) => !isLinked && setCustomAmount(val)}
                placeholder="Ex: 600,00"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Dias de Atraso:
              </label>
              <NumericInput
                mode="integer"
                min={1}
                max={365}
                value={customDaysLate}
                onChange={(val) => setCustomDaysLate(val)}
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </>
        )}

        {docType === 'termo_rescisao' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                  Caução Original (R$):
                </label>
                {isLinked && (
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Sincronizado
                  </span>
                )}
              </div>
              <CurrencyInput
                value={customAmount}
                readOnly={isLinked}
                onChange={(val) => {
                  if (!isLinked) {
                    setCustomAmount(val);
                    setCustomRefundAmount(Math.max(0, val - customCleaningFee - customRepairs));
                  }
                }}
                placeholder="Ex: 1000,00"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                  isLinked
                    ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Desconto Taxa de Limpeza (R$):
              </label>
              <CurrencyInput
                value={customCleaningFee}
                onChange={(val) => {
                  setCustomCleaningFee(val);
                  setCustomRefundAmount(Math.max(0, customAmount - val - customRepairs));
                }}
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Desconto Reparos / Avarias (R$):
              </label>
              <CurrencyInput
                value={customRepairs}
                onChange={(val) => {
                  setCustomRepairs(val);
                  setCustomRefundAmount(Math.max(0, customAmount - customCleaningFee - val));
                }}
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D4D4D8] mb-1.5">
                Valor Líquido a Devolver (R$):
              </label>
              <CurrencyInput
                value={customRefundAmount}
                onChange={(val) => setCustomRefundAmount(val)}
                placeholder="Calculado automaticamente"
                className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </>
        )}

        {(docType === 'recibo_parcela' ||
          docType === 'contrato_kitnet' ||
          docType === 'contrato_moto') && (
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-[#D4D4D8]">
                Valor Mensal / Parcela (R$):
              </label>
              {isLinked && (
                <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5" /> Sincronizado
                </span>
              )}
            </div>
            <CurrencyInput
              value={customAmount}
              readOnly={isLinked}
              onChange={(val) => !isLinked && setCustomAmount(val)}
              placeholder="Ex: 1250,00"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                isLinked
                  ? 'bg-[#16161A] border-[#333338] text-white font-semibold cursor-default select-text'
                  : 'bg-[#121214] border-[#2A2A2E] text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]'
              }`}
            />
          </div>
        )}
      </div>

      {/* Witness Configuration Section for Contracts & Terms */}
      {(docType === 'contrato_locacao_moto_completo' ||
        docType === 'contrato_kitnet' ||
        docType === 'contrato_moto' ||
        docType === 'termo_rescisao' ||
        docType === 'termo_quitacao' ||
        docType === 'termo_entrega_moto' ||
        docType === 'vistoria_kitnet') &&
        setWitnessesCount && (
          <div className="mt-5 pt-4 border-t border-[#2A2A2E]/80 space-y-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A78BFA]" />
                <label className="text-xs font-bold text-[#F2F1ED] tracking-wide">
                  Testemunhas no Documento / PDF
                </label>
              </div>
              <p className="text-[11px] text-[#9C9CA3] mt-0.5">
                Defina a quantidade de testemunhas instrumentárias (Art. 784, III do CPC para força executiva).
              </p>
            </div>

            {/* Modern 3-Option Responsive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 0: Sem Testemunhas */}
              <button
                type="button"
                onClick={() => setWitnessesCount(0)}
                className={`relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  witnessesCount === 0
                    ? 'bg-[#27272A]/70 border-zinc-400/60 ring-1 ring-zinc-400/40 shadow-sm'
                    : 'bg-[#121214] border-[#2A2A2E] hover:border-[#3E3E44] hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      witnessesCount === 0
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-[#18181B] text-[#9C9CA3]'
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`block text-xs font-bold whitespace-nowrap ${
                        witnessesCount === 0 ? 'text-[#F2F1ED]' : 'text-[#D4D4D8]'
                      }`}
                    >
                      Sem Testemunhas
                    </span>
                    <span className="block text-[10.5px] text-[#71717A] whitespace-nowrap">
                      0 assinaturas extras
                    </span>
                  </div>
                </div>
                {witnessesCount === 0 && (
                  <div className="w-4 h-4 rounded-full bg-zinc-400 text-zinc-900 flex items-center justify-center shrink-0 sm:absolute sm:top-2.5 sm:right-2.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option 1: 1 Testemunha */}
              <button
                type="button"
                onClick={() => setWitnessesCount(1)}
                className={`relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  witnessesCount === 1
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40 shadow-sm'
                    : 'bg-[#121214] border-[#2A2A2E] hover:border-[#3E3E44] hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      witnessesCount === 1
                        ? 'bg-[#8B5CF6]/30 text-[#C4B5FD]'
                        : 'bg-[#18181B] text-[#9C9CA3]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`block text-xs font-bold whitespace-nowrap ${
                        witnessesCount === 1 ? 'text-[#A78BFA]' : 'text-[#D4D4D8]'
                      }`}
                    >
                      1 Testemunha
                    </span>
                    <span className="block text-[10.5px] text-[#71717A] whitespace-nowrap">
                      1 assinatura formal
                    </span>
                  </div>
                </div>
                {witnessesCount === 1 && (
                  <div className="w-4 h-4 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 sm:absolute sm:top-2.5 sm:right-2.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option 2: 2 Testemunhas (Padrão) */}
              <button
                type="button"
                onClick={() => setWitnessesCount(2)}
                className={`relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  witnessesCount === 2
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40 shadow-sm'
                    : 'bg-[#121214] border-[#2A2A2E] hover:border-[#3E3E44] hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      witnessesCount === 2
                        ? 'bg-[#8B5CF6]/30 text-[#C4B5FD]'
                        : 'bg-[#18181B] text-[#9C9CA3]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`block text-xs font-bold whitespace-nowrap ${
                          witnessesCount === 2 ? 'text-[#A78BFA]' : 'text-[#D4D4D8]'
                        }`}
                      >
                        2 Testemunhas
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30 uppercase tracking-tight">
                        Padrão
                      </span>
                    </div>
                    <span className="block text-[10.5px] text-[#71717A] whitespace-nowrap">
                      Validade jurídica plena
                    </span>
                  </div>
                </div>
                {witnessesCount === 2 && (
                  <div className="w-4 h-4 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 sm:absolute sm:top-2.5 sm:right-2.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {/* Inputs for Witness 1 and Witness 2 */}
            {witnessesCount > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Witness 1 */}
                <div className="bg-[#121214] p-3 rounded-xl border border-[#2A2A2E] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      1ª Testemunha
                    </span>
                    <span className="text-[10px] text-[#71717A] italic">
                      Opcional
                    </span>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={witness1Name}
                      onChange={(e) => setWitness1Name && setWitness1Name(e.target.value)}
                      placeholder="Nome completo da 1ª testemunha"
                      className="w-full bg-[#18181B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={witness1Cpf}
                      onChange={(e) => setWitness1Cpf && setWitness1Cpf(maskCPFInput(e.target.value))}
                      placeholder="CPF da 1ª testemunha (000.000.000-00)"
                      maxLength={14}
                      className="w-full bg-[#18181B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                {/* Witness 2 (if witnessesCount === 2) */}
                {witnessesCount === 2 && (
                  <div className="bg-[#121214] p-3 rounded-xl border border-[#2A2A2E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        2ª Testemunha
                      </span>
                      <span className="text-[10px] text-[#71717A] italic">
                        Opcional
                      </span>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={witness2Name}
                        onChange={(e) => setWitness2Name && setWitness2Name(e.target.value)}
                        placeholder="Nome completo da 2ª testemunha"
                        className="w-full bg-[#18181B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={witness2Cpf}
                        onChange={(e) => setWitness2Cpf && setWitness2Cpf(maskCPFInput(e.target.value))}
                        placeholder="CPF da 2ª testemunha (000.000.000-00)"
                        maxLength={14}
                        className="w-full bg-[#18181B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F2F1ED] placeholder:text-[#5F5F66] focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

