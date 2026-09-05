/**
 * PaymentService - Serviço Centralizado de Regras e Gestão de Pagamentos e Parcelas
 * 
 * Regra Fundamental: Cadastro de contrato ≠ recebimento de dinheiro.
 * O primeiro pagamento só é registrado como 'pago' se explicitamente confirmado no cadastro.
 */

import { Installment, InstallmentStatus } from '../types';
import { getTodayLocalDateString } from '../utils/formatters';

export interface FirstPaymentSetupOptions {
  firstPaymentReceived?: boolean;
  firstPaymentPaidDate?: string;
  firstPaymentMethod?: string;
  firstPaymentNotes?: string;
}

export const paymentService = {
  /**
   * Constrói a lista oficial de parcelas aplicando com rigor a regra de primeiro pagamento.
   * Se firstPaymentReceived === true: Parcela 1 é 'pago', com paidDate e paymentMethod.
   * Se firstPaymentReceived === false: Parcela 1 é 'pendente', sem paidDate e sem paymentMethod.
   */
  buildContractInstallments(
    contractId: string,
    rawInstallments: Array<{
      number: number;
      totalInstallments: number;
      dueDate: string;
      amount: number;
      status?: InstallmentStatus;
      isPartial?: boolean;
      partialDays?: number;
    }>,
    options: FirstPaymentSetupOptions = {},
    prefix: 'k-inst' | 'inst' = 'inst'
  ): Installment[] {
    const isFirstReceived = Boolean(options.firstPaymentReceived);
    const paidDate = options.firstPaymentPaidDate || getTodayLocalDateString();
    const paidMethod = options.firstPaymentMethod || 'PIX Instantâneo';
    const notes = options.firstPaymentNotes || '1º Pagamento recebido no cadastro / entrada';

    return rawInstallments.map((inst, index) => {
      const isFirst = index === 0;
      const isPaid = isFirst && isFirstReceived;

      return {
        id: `${prefix}-${contractId}-${inst.number}`,
        number: inst.number,
        totalInstallments: inst.totalInstallments,
        dueDate: inst.dueDate,
        amount: inst.amount,
        status: isPaid ? ('pago' as const) : ('pendente' as const),
        paidDate: isPaid ? paidDate : undefined,
        paymentMethod: isPaid ? paidMethod : undefined,
        notes: isPaid ? notes : undefined,
        isPartial: inst.isPartial,
        partialDays: inst.partialDays,
      };
    });
  },

  /**
   * Registra a baixa/pagamento de uma parcela existente
   */
  markInstallmentAsPaid(
    installment: Installment,
    paymentMethod: string = 'PIX Instantâneo',
    paidDate: string = getTodayLocalDateString(),
    notes?: string,
    receiptUrl?: string
  ): Installment {
    return {
      ...installment,
      status: 'pago',
      paidDate: paidDate || getTodayLocalDateString(),
      paymentMethod: paymentMethod || installment.paymentMethod || 'PIX Instantâneo',
      notes: notes || installment.notes,
      receiptUrl: receiptUrl || installment.receiptUrl,
    };
  },

  /**
   * Estorna ou reverte uma parcela para pendente
   */
  markInstallmentAsPending(installment: Installment): Installment {
    return {
      ...installment,
      status: 'pendente',
      paidDate: undefined,
      paymentMethod: undefined,
      notes: undefined,
      receiptUrl: undefined,
    };
  },
};
