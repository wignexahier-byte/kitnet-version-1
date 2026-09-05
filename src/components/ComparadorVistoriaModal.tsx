import React from 'react';
import { Moto, Kitnet } from '../types';
import { CentralVistoriasModal } from './vistorias/CentralVistoriasModal';

export interface ComparadorVistoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: 'moto' | 'kitnet';
  moto?: Moto;
  kitnet?: Kitnet;
  initialTab?: 'registrar' | 'historico' | 'comparador';
}

export const ComparadorVistoriaModal: React.FC<ComparadorVistoriaModalProps> = ({
  isOpen,
  onClose,
  assetType,
  moto,
  kitnet,
  initialTab,
}) => {
  return (
    <CentralVistoriasModal
      isOpen={isOpen}
      onClose={onClose}
      assetType={assetType}
      moto={moto}
      kitnet={kitnet}
      initialTab={initialTab}
    />
  );
};
