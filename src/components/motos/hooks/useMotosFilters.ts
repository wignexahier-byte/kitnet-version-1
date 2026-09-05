import { useState, useMemo } from 'react';
import { Moto, MotoContract, MotoStatus } from '../../../types';

export type MotoSubTab =
  | 'geral'
  | 'contrato'
  | 'km'
  | 'locatario'
  | 'vistoria'
  | 'manutencoes'
  | 'fotos'
  | 'documentos';

export function useMotosFilters(motos: Moto[], motoContracts: MotoContract[]) {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<MotoSubTab>('geral');

  // Filtered Motos based on status and search query
  const filteredMotos = useMemo(() => {
    return motos.filter((moto) => {
      const matchesStatus = filterStatus === 'todos' || moto.status === filterStatus;
      const matchesSearch =
        moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moto.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moto.chassi.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [motos, filterStatus, searchTerm]);

  // Selected moto and its active contract
  const selectedMoto = useMemo(() => {
    return motos.find((m) => m.id === selectedMotoId) || filteredMotos[0] || motos[0];
  }, [motos, selectedMotoId, filteredMotos]);

  const activeContract = useMemo(() => {
    return motoContracts.find(
      (c) => c.motoId === selectedMoto?.id && c.status === 'ativo'
    );
  }, [motoContracts, selectedMoto?.id]);

  return {
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    selectedMotoId,
    setSelectedMotoId,
    activeSubTab,
    setActiveSubTab,
    filteredMotos,
    selectedMoto,
    activeContract,
  };
}
