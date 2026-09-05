import React from 'react';
import { Moto } from '../../../types';
import { FileText, ExternalLink } from 'lucide-react';

interface MotoDetailDocumentsTabProps {
  moto: Moto;
}

export const MotoDetailDocumentsTab: React.FC<MotoDetailDocumentsTabProps> = ({ moto }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA2]">
        Arquivos & Comprovantes da Moto
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { name: 'CRLV Digital', key: 'crlv', url: moto.documents?.crlv },
          { name: 'Nota Fiscal de Compra', key: 'nf', url: moto.documents?.notaFiscal },
          { name: 'Apólice do Seguro', key: 'seg', url: moto.documents?.seguro },
        ].map((doc, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#101012] rounded-xl border border-white/[0.08] flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-[#F5F5F7]">{doc.name}</span>
            </div>
            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#25242C] text-[11px] text-emerald-400 font-medium flex items-center gap-1 border border-white/[0.08]"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-[10px] text-[#5F5F66]">Pendente</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
