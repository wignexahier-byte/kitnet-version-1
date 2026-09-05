import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, LogOut, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { LogoIcon } from './Logo';

interface DisconnectingScreenProps {
  onComplete?: () => void;
  durationMs?: number;
  isLogout?: boolean;
}

// 16 radial light particles for luxurious dispersion effect
const PARTICLES = Array.from({ length: 16 }).map((_, i) => {
  const angle = (i * 360) / 16;
  const rad = (angle * Math.PI) / 180;
  const distance = 90 + (i % 4) * 28;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 4 + (i % 3) * 2,
    delay: (i % 4) * 0.03,
    color: i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#10B981' : '#6366F1',
  };
});

export const DisconnectingScreen: React.FC<DisconnectingScreenProps> = ({
  onComplete,
  durationMs = 1400,
  isLogout = false,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [isDisconnectedEffect, setIsDisconnectedEffect] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();
    const progressDuration = durationMs * 0.72;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / progressDuration) * 100), 100);
      setProgress(pct);

      if (pct >= 35 && pct < 80) {
        setStep(2);
      } else if (pct >= 80) {
        setStep(3);
        if (!isDisconnectedEffect) {
          setIsDisconnectedEffect(true);
        }
      }

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [durationMs, onComplete, isDisconnectedEffect]);

  const stepsList = [
    {
      id: 1,
      label: 'Criptografando e salvando estado local...',
      icon: KeyRound,
      done: progress >= 35,
    },
    {
      id: 2,
      label: isLogout
        ? 'Revogando token de sessão Google...'
        : 'Isolando chaves de segurança...',
      icon: ShieldAlert,
      done: progress >= 80,
    },
    {
      id: 3,
      label: isLogout
        ? 'Sessão finalizada com sucesso.'
        : 'Aplicativo bloqueado com segurança.',
      icon: CheckCircle2,
      done: progress >= 95,
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-[#0A0A0D] flex flex-col items-center justify-center p-4 select-none text-[#F5F5F7] overflow-hidden font-sans">
      {/* Dynamic ambient pulsing backdrop orbs */}
      <motion.div
        animate={{
          scale: isDisconnectedEffect ? [1, 1.25, 0.95] : [1, 1.12, 1],
          opacity: isDisconnectedEffect ? [0.6, 0.25] : [0.35, 0.65, 0.35],
        }}
        transition={{ duration: 1.4, repeat: isDisconnectedEffect ? 0 : Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-gradient-to-tr from-[#7C3AED]/20 via-[#6366F1]/15 to-[#10B981]/15 rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#EF4444]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Center card with glassmorphic refinement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-[#121216]/90 backdrop-blur-xl border border-white/[0.09] rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 flex flex-col items-center text-center ring-1 ring-white/[0.05]"
      >
        {/* Animated Badge, Logo & Disconnection Particles */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Shockwave ripple on disconnection completion */}
          {isDisconnectedEffect && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 2.3, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-[#10B981] pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 2.9, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.08 }}
                className="absolute inset-0 rounded-full border border-[#8B5CF6] pointer-events-none"
              />

              {/* Particle Dissipation Effect */}
              {PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                    delay: p.delay,
                  }}
                  style={{
                    backgroundColor: p.color,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                  }}
                  className="absolute rounded-full pointer-events-none shadow-[0_0_8px_currentColor]"
                />
              ))}
            </>
          )}

          {/* Orbiting dashed aura ring */}
          {!isDisconnectedEffect && (
            <div className="absolute -inset-3.5 rounded-full border-2 border-dashed border-[#8B5CF6]/40 animate-spin [animation-duration:5s] pointer-events-none" />
          )}

          {/* Logo container with Disconnection Fade-Out Transition - Standalone, no dark box */}
          <div className="w-22 h-22 flex items-center justify-center relative">
            <div className="absolute w-20 h-20 rounded-full bg-[#8B5CF6]/25 blur-xl pointer-events-none" />
            <motion.div
              animate={
                isDisconnectedEffect
                  ? {
                      opacity: [1, 0.4],
                      scale: [1, 0.92],
                      filter: 'blur(0.5px)',
                    }
                  : {
                      rotate: [0, -3, 3, 0],
                      scale: [1, 1.03, 1],
                    }
              }
              transition={
                isDisconnectedEffect
                  ? { duration: 0.45, ease: 'easeOut' }
                  : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <LogoIcon size={56} showBackground={false} animated={!isDisconnectedEffect} />
            </motion.div>

            {/* Lock / Logout overlay badge snapping into place */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isDisconnectedEffect ? [0.8, 1.2, 1.05] : 1,
                opacity: 1,
                backgroundColor: isDisconnectedEffect ? '#10B981' : isLogout ? '#EF4444' : '#8B5CF6',
              }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-1.5 right-1.5 p-1.5 rounded-full text-white shadow-lg ring-2 ring-[#121216]"
            >
              {isDisconnectedEffect ? (
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : isLogout ? (
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F5F7]">
          {isDisconnectedEffect
            ? isLogout
              ? 'Sessão Encerrada'
              : 'Acesso Protegido'
            : isLogout
            ? 'Desconectando da Conta...'
            : 'Bloqueando Aplicativo...'}
        </h2>
        <p className="text-xs text-[#9A9AA2] mt-1.5 leading-relaxed">
          {isDisconnectedEffect
            ? 'Redirecionando para a tela de autenticação segura'
            : 'Isolando chaves de acesso e protegendo dados'}
        </p>

        {/* Progress Bar Container with percentage counter */}
        <div className="w-full mt-6 space-y-2">
          <div className="h-2 w-full bg-[#18181D] rounded-full overflow-hidden border border-white/[0.08] p-0.5 shadow-inner">
            <motion.div
              className={`h-full rounded-full transition-all ${
                isDisconnectedEffect
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#EF4444] shadow-[0_0_12px_rgba(139,92,246,0.6)]'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-[#9A9AA2]">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDisconnectedEffect ? 'bg-emerald-400 animate-ping' : 'bg-[#8B5CF6] animate-pulse'}`} />
              {isDisconnectedEffect ? 'Status: Concluído' : 'Processando segurança'}
            </span>
            <span className={`font-bold ${isDisconnectedEffect ? 'text-emerald-400' : 'text-[#A855F7]'}`}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Micro Step Checklist */}
        <div className="mt-5 w-full bg-[#18181D] border border-white/[0.06] rounded-2xl p-3 text-left space-y-2">
          {stepsList.map((item) => {
            const Icon = item.icon;
            const isCurrent = step === item.id && !item.done;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between text-xs transition-colors duration-200 ${
                  item.done
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-[#F5F5F7] font-semibold'
                    : 'text-[#9A9AA2]/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {item.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#A855F7] border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                  )}
                  <span className="truncate text-[11px]">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-[#9A9AA2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Proteção criptográfica e auditoria local</span>
        </div>
      </motion.div>
    </div>
  );
};

