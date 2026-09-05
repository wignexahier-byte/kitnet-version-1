import React, { useState, useRef } from 'react';
import { Moto, MotoTenant, MotoContract } from '../../../types';
import { compressImage } from '../../../utils/imageUtils';

export type MotoPhotoAngle = 'front' | 'rear' | 'right' | 'left' | 'dashboard';

interface UseMotoDocumentsProps {
  selectedMoto: Moto | undefined;
  updateMoto: (id: string, updates: Partial<Moto>) => void;
}

export function useMotoDocuments({ selectedMoto, updateMoto }: UseMotoDocumentsProps) {
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadAngle, setActiveUploadAngle] = useState<MotoPhotoAngle | null>(null);

  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [newContractSuccessData, setNewContractSuccessData] = useState<{
    moto: Moto;
    tenant: MotoTenant;
    contract: MotoContract;
  } | null>(null);

  const handleDirectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadAngle || !selectedMoto) return;

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      const updatedPhotos = {
        ...selectedMoto.photos,
        [activeUploadAngle]: compressed,
      };
      updateMoto(selectedMoto.id, { photos: updatedPhotos });
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
    } finally {
      setActiveUploadAngle(null);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleTriggerQuickUpload = (angle: MotoPhotoAngle) => {
    setActiveUploadAngle(angle);
    galleryFileInputRef.current?.click();
  };

  const handleRemovePhotoAngle = (angle: MotoPhotoAngle) => {
    if (!selectedMoto) return;
    const updatedPhotos = { ...selectedMoto.photos };
    delete updatedPhotos[angle];
    updateMoto(selectedMoto.id, { photos: updatedPhotos });
  };

  return {
    galleryFileInputRef,
    activeUploadAngle,
    setActiveUploadAngle,
    selectedPhotoPreview,
    setSelectedPhotoPreview,
    newContractSuccessData,
    setNewContractSuccessData,
    handleDirectGalleryUpload,
    handleTriggerQuickUpload,
    handleRemovePhotoAngle,
  };
}
