import { useState } from 'react';
import { Moto, MotoDelivery } from '../../../types';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';

interface UseMotosActionsProps {
  duplicateMoto: (id: string) => void;
  deleteMoto: (id: string) => void;
  deleteMotoMaintenance: (motoId: string, maintenanceId: string) => void;
  addKmLog: (motoId: string, km: number, date?: string, notes?: string) => void;
  recordMotoDelivery: (motoId: string, delivery: MotoDelivery) => void;
  // External modal open conditions (from creation, financial, documents)
  externalModalStates?: boolean[];
}

export function useMotosActions({
  duplicateMoto,
  deleteMoto,
  deleteMotoMaintenance,
  addKmLog,
  recordMotoDelivery,
  externalModalStates = [],
}: UseMotosActionsProps) {
  const [showNewMotoModal, setShowNewMotoModal] = useState<boolean>(false);
  const [showNewContractModal, setShowNewContractModal] = useState<boolean>(false);
  const [showNewKmModal, setShowNewKmModal] = useState<boolean>(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [motoToDelete, setMotoToDelete] = useState<Moto | null>(null);

  const isAnyModalOpen = Boolean(
    showNewMotoModal ||
      showNewContractModal ||
      showNewKmModal ||
      showDeliveryModal ||
      showCompareModal ||
      showMaintenanceModal ||
      motoToDelete ||
      externalModalStates.some(Boolean)
  );

  useBodyScrollLock(isAnyModalOpen);

  return {
    showNewMotoModal,
    setShowNewMotoModal,
    showNewContractModal,
    setShowNewContractModal,
    showNewKmModal,
    setShowNewKmModal,
    showDeliveryModal,
    setShowDeliveryModal,
    showCompareModal,
    setShowCompareModal,
    showMaintenanceModal,
    setShowMaintenanceModal,
    motoToDelete,
    setMotoToDelete,
    duplicateMoto,
    deleteMoto,
    deleteMotoMaintenance,
    addKmLog,
    recordMotoDelivery,
    isAnyModalOpen,
  };
}
