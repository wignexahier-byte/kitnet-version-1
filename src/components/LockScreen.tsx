import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { LogoIcon } from './Logo';

export const LockScreen: React.FC = () => {
  const { loginWithGoogle, settings } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const adminEmail = settings.adminEmail || 'wleal0131@gmail.com';
  const adminName = settings.adminName || 'Wigne Leal Xavier Macedo';

  const handleGoogleLogin = () => {
    if (isLoading || authSuccess) return;
    setIsLoading(true);
    setAuthError(null);

    // Realistic Google Auth feedback with smooth entrance animation
    setTimeout(() => {
      const res = loginWithGoogle(adminEmail, adminName);
      if (res.success) {
        setAuthSuccess(true);
        // Short pause to show success transition
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      } else {
        setIsLoading(false);
        setAuthError(res.error || 'Acesso negado. Conta não autorizada.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08070D] flex flex-col items-center justify-between p-6 select-none text-white overflow-hidden min-h-screen font-sans">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#7C3AED]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8B5CF6]/8 rounded-full blur-[90px] pointer-events-none" />

      {/* Top spacing */}
      <div className="w-full pt-8 sm:pt-12" />

      {/* Center Section: App Logo, Title, Subtitle, Google Login Button */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm flex flex-col items-center z-10 my-auto"
      >
        {/* App Icon Card */}
        {/* Standalone Logo Mark with Neon Highlight - No dark background container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="mb-5 relative flex items-center justify-center"
        >
          {/* Subtle soft purple ambient aura in the air (no black ball/box) */}
          <div className="absolute w-28 h-28 rounded-full bg-[#8B5CF6]/20 blur-2xl pointer-events-none animate-pulse" />

          {/* Standalone Logo Icon in Neon Violet Highlight (standardized 64px hero size) */}
          <LogoIcon size={64} showBackground={false} animated={true} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight"
        >
          Motos <span className="text-[#A855F7] font-bold">&</span> Kitnets
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-sm sm:text-[15px] text-[#9CA3AF] mt-2 text-center font-normal tracking-tight"
        >
          Gestão Patrimonial & Financeira
        </motion.p>

        {/* Error notification if any */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="mt-6 w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="w-full mt-12 sm:mt-14"
        >
          <button
            id="btn-login-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || authSuccess}
            className={`w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3.5 transition-all duration-300 cursor-pointer active:scale-[0.98] relative overflow-hidden ${
              authSuccess
                ? 'bg-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.45)]'
                : 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] hover:opacity-95 shadow-[0_0_35px_rgba(124,58,237,0.45)] hover:shadow-[0_0_45px_rgba(124,58,237,0.6)]'
            }`}
          >
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            {isLoading ? (
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Conectando com o Google...</span>
              </div>
            ) : authSuccess ? (
              <div className="flex items-center gap-2.5 text-white font-bold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Acesso Autorizado</span>
              </div>
            ) : (
              <>
                {/* Official Google G SVG */}
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* Footer: Shield Icon with lock + "Acesso seguro e protegido" matching image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="w-full flex flex-col items-center justify-center pb-6 sm:pb-8 z-10"
      >
        <div className="relative flex items-center justify-center text-[#A855F7] mb-2">
          {/* Shield Outline with Lock Icon */}
          <div className="relative">
            <Shield className="w-8 h-8 text-[#A855F7] stroke-[1.75]" />
            <Lock className="w-3.5 h-3.5 text-[#A855F7] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 stroke-[2.5]" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] font-normal tracking-tight">
          Acesso seguro e protegido
        </p>
      </motion.div>
    </div>
  );
};
