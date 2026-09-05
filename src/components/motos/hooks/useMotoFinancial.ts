import { useState } from 'react';
import { Installment } from '../../../types';

interface UseMotoFinancialProps {
  payMotoInstallment: (
    contractId: string,
    installmentId: string,
    notes?: string,
    receiptUrl?: string
  ) => void;
  terminateMotoContract: (
    contractId: string,
    finalKm: number,
    notes?: string,
    depositAction?: 'retida' | 'devolvida' | 'a_definir'
  ) => void;
}

export function useMotoFinancial({
  payMotoInstallment,
  terminateMotoContract,
}: UseMotoFinancialProps) {
  const [showPaymentModal, setShowPaymentModal] = useState<{
    contractId: string;
    installment: Installment;
  } | null>(null);

  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);

  return {
    showPaymentModal,
    setShowPaymentModal,
    showAdjustmentModal,
    setShowAdjustmentModal,
    payMotoInstallment,
    terminateMotoContract,
  };
}
