import React, { useState, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  Send,
  Camera,
  Mic,
  Square,
  Play,
  Pause,
  CheckCircle2,
} from 'lucide-react';
import { MotoTenant, KitnetTenant, ClientOccurrence } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface ClientDetailOccurrencesTabProps {
  tenant: MotoTenant | KitnetTenant;
  tenantType: 'moto' | 'kitnet';
  formatDate: (dateStr: string) => string;
}

export const ClientDetailOccurrencesTab: React.FC<ClientDetailOccurrencesTabProps> = ({
  tenant,
  tenantType,
  formatDate,
}) => {
  const { updateMotoTenant, updateKitnetTenant, addTimelineEvent } = useApp();

  const [newOccurrence, setNewOccurrence] = useState<{
    description: string;
    category: ClientOccurrence['category'];
    photoUrl?: string;
    audioUrl?: string;
    audioDuration?: number;
  }>({
    description: '',
    category: 'outros',
  });

  // Audio Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewOccurrence((prev) => ({
            ...prev,
            audioUrl: reader.result as string,
            audioDuration: recordingTime,
          }));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePlayAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play();
        setPlayingAudioId(id);
        audioPlayerRef.current.onended = () => setPlayingAudioId(null);
      }
    }
  };

  const handleAddOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccurrence.description.trim() && !newOccurrence.audioUrl) return;

    const occ: ClientOccurrence = {
      id: `occ_${Date.now()}`,
      clientId: tenant.id,
      clientType: tenantType,
      date: new Date().toISOString(),
      title: `Ocorrência - ${newOccurrence.category}`,
      description: newOccurrence.description || '(Gravação de áudio em anexo)',
      category: newOccurrence.category,
      attachments: [
        ...(newOccurrence.photoUrl
          ? [
              {
                id: `att_${Date.now()}_img`,
                name: 'Foto',
                type: 'image' as const,
                url: newOccurrence.photoUrl,
              },
            ]
          : []),
        ...(newOccurrence.audioUrl
          ? [
              {
                id: `att_${Date.now()}_aud`,
                name: `Áudio (${newOccurrence.audioDuration || 0}s)`,
                type: 'audio' as const,
                url: newOccurrence.audioUrl,
              },
            ]
          : []),
      ],
    };

    const updatedOccurrences = [occ, ...(tenant.occurrences || [])];
    if (tenantType === 'moto') {
      updateMotoTenant(tenant.id, { occurrences: updatedOccurrences });
    } else {
      updateKitnetTenant(tenant.id, { occurrences: updatedOccurrences });
    }

    addTimelineEvent({
      type: 'ocorrencia_cliente',
      title: `Ocorrência: ${tenant.fullName}`,
      description: `${newOccurrence.category.toUpperCase()}: ${newOccurrence.description.substring(0, 40)}...`,
      entityType: 'cliente',
      entityId: tenant.id,
    });

    setNewOccurrence({
      description: '',
      category: 'outros',
      photoUrl: undefined,
      audioUrl: undefined,
      audioDuration: undefined,
    });
  };

  const occurrences = tenant.occurrences || [];

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* Hidden Global Audio Player */}
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Nova Ocorrência Form */}
      <form onSubmit={handleAddOccurrence} className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Registrar Nova Ocorrência / Relato
            </h3>
            <p className="text-[11px] text-slate-400">Grave áudios, anexe fotos ou descreva ocorrências</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={newOccurrence.category}
            onChange={(e) => setNewOccurrence({ ...newOccurrence, category: e.target.value as any })}
            className="bg-[#161825] border border-white/[0.08] focus:border-violet-500/50 rounded-xl p-2.5 text-white outline-hidden cursor-pointer"
          >
            <option value="outros">ℹ️ Informação / Acordo</option>
            <option value="atraso">⚠️ Atraso / Cobrança</option>
            <option value="sinistro">🚨 Sinistro / Acidente</option>
            <option value="documento">📄 Notificação / Multa</option>
            <option value="vistoria">🔧 Vistoria / Manutenção</option>
          </select>

          <input
            type="text"
            placeholder="Descrição ou observação do ocorrido..."
            value={newOccurrence.description}
            onChange={(e) => setNewOccurrence({ ...newOccurrence, description: e.target.value })}
            className="sm:col-span-2 bg-[#161825] border border-white/[0.08] focus:border-violet-500/50 rounded-xl p-2.5 text-white placeholder-slate-500 outline-hidden"
          />
        </div>

        {/* Audio & Photo Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Record Button */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="px-3.5 py-2 rounded-xl bg-[#161825] hover:bg-[#1f2235] text-slate-300 hover:text-white border border-white/[0.08] hover:border-violet-500/30 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 text-xs font-semibold"
              >
                <Mic className="w-3.5 h-3.5 text-violet-400" />
                <span>Gravar Áudio</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center gap-2 cursor-pointer animate-pulse text-xs font-bold active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar ({recordingTime}s)</span>
              </button>
            )}

            {/* Photo Attachment Input */}
            <label className="px-3.5 py-2 rounded-xl bg-[#161825] hover:bg-[#1f2235] text-slate-300 hover:text-white border border-white/[0.08] hover:border-violet-500/30 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 text-violet-400" />
              <span>Anexar Foto</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewOccurrence((prev) => ({ ...prev, photoUrl: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            {newOccurrence.photoUrl && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Foto pronta
              </span>
            )}

            {newOccurrence.audioUrl && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Áudio pronto ({newOccurrence.audioDuration}s)
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-md shadow-violet-600/20 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </form>

      {/* Timeline List of Occurrences */}
      <div className="space-y-3">
        {occurrences.length === 0 ? (
          <div className="p-8 text-center bg-[#121420] rounded-2xl border border-white/[0.08] space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Nenhuma ocorrência ou relato registrado ainda.</p>
          </div>
        ) : (
          occurrences.map((occ) => {
            const audioAttachment = occ.attachments?.find((a) => a.type === 'audio');
            const photoAttachment = occ.attachments?.find((a) => a.type === 'image');

            return (
              <div key={occ.id} className="p-4 rounded-2xl bg-[#121420] border border-white/[0.08] shadow-lg space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      occ.category === 'sinistro'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : occ.category === 'atraso'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : occ.category === 'documento'
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                    }`}
                  >
                    {occ.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{formatDate(occ.date)}</span>
                </div>

                <p className="text-slate-200 font-medium leading-relaxed">{occ.description}</p>

                {/* Audio Playback Chip */}
                {audioAttachment && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#161825] rounded-xl border border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(occ.id, audioAttachment.url)}
                      className="p-2 rounded-lg bg-violet-600 text-white cursor-pointer hover:bg-violet-500 transition-all active:scale-90"
                    >
                      {playingAudioId === occ.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                    <span className="text-[11px] text-slate-300 font-medium">
                      {audioAttachment.name || 'Mensagem de Voz Gravada'}
                    </span>
                  </div>
                )}

                {/* Photo Preview */}
                {photoAttachment && (
                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-white/[0.12] mt-2 shadow-md">
                    <img
                      src={photoAttachment.url}
                      alt="Foto da ocorrência"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
