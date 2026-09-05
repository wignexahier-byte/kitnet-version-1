import React from 'react';
import { Moto } from '../../../types';
import { MotoPhotoAngle } from '../hooks/useMotoDocuments';
import { StandardizedPhotoGallery, PhotoGalleryItem } from '../../common/StandardizedPhotoGallery';

interface MotoDetailPhotosTabProps {
  moto: Moto;
  setSelectedPhotoPreview: (photo: { url: string; title: string } | null) => void;
  handleTriggerQuickUpload: (angle: MotoPhotoAngle) => void;
  handleRemovePhotoAngle: (angle: MotoPhotoAngle) => void;
}

export const MotoDetailPhotosTab: React.FC<MotoDetailPhotosTabProps> = ({
  moto,
  setSelectedPhotoPreview,
  handleTriggerQuickUpload,
  handleRemovePhotoAngle,
}) => {
  const photoItems: PhotoGalleryItem[] = [
    { key: 'front', label: 'Frente', url: moto.photos?.front },
    { key: 'rear', label: 'Traseira', url: moto.photos?.rear },
    { key: 'right', label: 'Lat. Direita', url: moto.photos?.right },
    { key: 'left', label: 'Lat. Esquerda', url: moto.photos?.left },
    { key: 'dashboard', label: 'Painel / KM', url: moto.photos?.dashboard },
  ];

  return (
    <div className="space-y-4">
      <StandardizedPhotoGallery
        title="Fotos Oficiais do Veículo"
        subtitle="Fotos registradas dos 5 ângulos da motocicleta. Toque para ampliar, atualizar ou remover."
        items={photoItems}
        columnsCount={5}
        badgeThemeColor="amber"
        onPreview={(url, label) =>
          setSelectedPhotoPreview({
            url,
            title: `Foto ${label} - ${moto.model} (${moto.plate})`,
          })
        }
        onUpload={(key) => handleTriggerQuickUpload(key as MotoPhotoAngle)}
        onDelete={(key) => handleRemovePhotoAngle(key as MotoPhotoAngle)}
      />
    </div>
  );
};
