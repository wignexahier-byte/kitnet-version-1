import React from 'react';
import { FileText, Download, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { MotoTenant, KitnetTenant } from '../../../types';

interface ClientDetailDocumentsTabProps {
  tenant: MotoTenant | KitnetTenant;
}

export const ClientDetailDocumentsTab: React.FC<ClientDetailDocumentsTabProps> = ({ tenant }) => {
  const docs = tenant.documents || ({} as any);

  const docList = [
    { key: 'photo', label: 'Foto de Perfil / Rosto', url: (docs as any).photo || tenant.photoUrl },
    { key: 'cnhFront', label: 'CNH Frente / Identidade', url: (docs as any).cnhFront },
    { key: 'cnhBack', label: 'CNH Verso', url: (docs as any).cnhBack },
    { key: 'proofOfAddress', label: 'Comprovante de Residência', url: (docs as any).proofOfAddress },
    { key: 'proofOfIncome', label: 'Comprovante de Renda', url: (docs as any).proofOfIncome },
    { key: 'paystub', label: 'Holerite / Contracheque', url: (docs as any).paystub },
    { key: 'bankStatement', label: 'Extrato Bancário', url: (docs as any).bankStatement },
    { key: 'socialContract', label: 'Contrato Social / MEI', url: (docs as any).socialContract },
  ].filter((item) => item.url || item.key === 'proofOfAddress' || item.key === 'proofOfIncome' || item.key === 'cnhFront' || item.key === 'photo');

  const totalAttached = docList.filter((d) => Boolean(d.url)).length;

  return (
    <div className="space-y-4 font-sans text-slate-100">
      <div className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Documentos Cadastrais Anexos
              </h3>
              <p className="text-[11px] text-slate-400">Repositório de comprovantes e documentos digitais</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
            {totalAttached} de {docList.length} Anexados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {docList.map((doc) => {
            const hasDoc = Boolean(doc.url);

            return (
              <div
                key={doc.key}
                className="p-3.5 bg-[#161825] hover:bg-[#1a1d2e] rounded-xl border border-white/[0.04] hover:border-white/[0.08] flex items-center justify-between gap-3 transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {hasDoc ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-semibold text-white block truncate">{doc.label}</span>
                    <span className={`text-[11px] font-mono ${hasDoc ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {hasDoc ? 'Arquivo verificado' : 'Não anexado'}
                    </span>
                  </div>
                </div>

                {hasDoc ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-violet-500/30 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </a>
                ) : (
                  <span className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                    Pendente
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

