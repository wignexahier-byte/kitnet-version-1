import React, { useRef, useState } from 'react';
import { Kitnet } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { compressImage } from '../../../utils/imageUtils';
import { StandardizedPhotoGallery, PhotoGalleryItem } from '../../common/StandardizedPhotoGallery';
import { PhotoZoomPreviewModal } from '../modals/PhotoZoomPreviewModal';

interface KitnetDetailPhotosTabProps {
  kitnet: Kitnet;
  setSelectedPhotoPreview?: (photo: { url: string; title: string } | null) => void;
}

export const KitnetDetailPhotosTab: React.FC<KitnetDetailPhotosTabProps> = ({
  kitnet,
  setSelectedPhotoPreview,
}) => {
  const { updateKitnet } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoKey, setActivePhotoKey] = useState<string | null>(null);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<{ url: string; title: string } | null>(null);

  const photoItems: PhotoGalleryItem[] = [
    { key: 'livingRoom', label: 'Sala de Estar', url: kitnet.photos?.livingRoom },
    { key: 'bedroom', label: 'Dormitório', url: kitnet.photos?.bedroom },
    { key: 'bathroom', label: 'Banheiro', url: kitnet.photos?.bathroom },
    { key: 'kitchen', label: 'Cozinha / Pia', url: kitnet.photos?.kitchen },
    { key: 'outdoor', label: 'Área Ext. / Varanda', url: kitnet.photos?.outdoor },
    { key: 'installations', label: 'Instalações / Luz', url: kitnet.photos?.installations },
  ];

  const handleTriggerUpload = (key: string) => {
    setActivePhotoKey(key);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoKey) return;

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      const updatedPhotos = {
        ...kitnet.photos,
        [activePhotoKey]: compressed,
      };
      updateKitnet(kitnet.id, { photos: updatedPhotos });
    } catch (err) {
      console.error('Erro ao salvar foto da kitnet:', err);
    } finally {
      setActivePhotoKey(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (key: string) => {
    const updatedPhotos = { ...kitnet.photos };
    delete (updatedPhotos as any)[key];
    updateKitnet(kitnet.id, { photos: updatedPhotos });
  };

  const handlePreviewPhoto = (url: string, title: string) => {
    const previewData = { url, title: `${title} - ${kitnet.name}` };
    if (setSelectedPhotoPreview) {
      setSelectedPhotoPreview(previewData);
    } else {
      setLocalPhotoPreview(previewData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for photo capture / selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <StandardizedPhotoGallery
        title="Fotos dos Ambientes"
        subtitle="Fotos reais dos cômodos da kitnet. Toque para ampliar, alterar ou remover."
        items={photoItems}
        columnsCount={6}
        badgeThemeColor="purple"
        onPreview={handlePreviewPhoto}
        onUpload={handleTriggerUpload}
        onDelete={handleDeletePhoto}
      />

      {/* Local fallback preview modal if parent didn't provide preview handler */}
      {localPhotoPreview && (
        <PhotoZoomPreviewModal
          photoPreview={localPhotoPreview}
          onClose={() => setLocalPhotoPreview(null)}
        />
      )}
    </div>
  );
};
