export type DocumentCategory = 'moto' | 'kitnet' | 'contrato' | 'termo' | 'vistoria' | 'recibo' | 'outro';

export interface DocumentItem {
  id: string;
  isDemo?: boolean;
  title: string;
  category: DocumentCategory;
  relatedId?: string;
  relatedName?: string;
  date: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}
