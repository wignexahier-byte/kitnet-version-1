import React from 'react';

interface LogoProps {
  variant?: 'main' | 'compact' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSize?: number;
  className?: string;
  showSubtitle?: boolean;
  animated?: boolean;
  showBackground?: boolean;
}

export const LogoIcon: React.FC<{
  className?: string;
  size?: number;
  animated?: boolean;
  showBackground?: boolean;
}> = ({
  className = '',
  size = 36,
  animated = true,
  showBackground = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 overflow-visible ${animated ? 'animate-logo-glow' : ''} ${className}`}
    >
      <defs>
        {/* Ultra-vibrant Neon Electric Violet to Indigo Gradient */}
        <linearGradient id="mkApexGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="18%" stopColor="#E9D5FF" />
          <stop offset="42%" stopColor="#C084FC" />
          <stop offset="75%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Specular Inner Highlight */}
        <linearGradient id="mkShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Glowing Center Core */}
        <radialGradient id="mkCoreLight" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E9D5FF" />
          <stop offset="85%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>

        {/* High-Impact Neon Bloom Filter */}
        <filter id="mkCrestGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#D8B4FE" floodOpacity="0.75" />
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#A855F7" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#6366F1" floodOpacity="0.3" />
        </filter>

        {/* Optional dark frame gradients (only if showBackground=true) */}
        <linearGradient id="mkObsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#181A2A" />
          <stop offset="50%" stopColor="#11131E" />
          <stop offset="100%" stopColor="#090A10" />
        </linearGradient>

        <linearGradient id="mkBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(192, 132, 252, 0.45)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.25)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.06)" />
        </linearGradient>
      </defs>

      {/* Optional Frame Container (defaults to false: pure standalone logo) */}
      {showBackground && (
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="24"
          fill="url(#mkObsidianGrad)"
          stroke="url(#mkBorderGrad)"
          strokeWidth="1.5"
        />
      )}

      <g filter="url(#mkCrestGlow)">
        {/* 1. KITNETS: Architectural Roof Gable */}
        <path
          id="mk-crest-roof"
          d="M16 46 L50 16 L84 46"
          stroke="url(#mkApexGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-draw-roof' : ''}
        />

        {/* Top Rim Specular Shine */}
        <path
          d="M20 44 L50 17 L80 44"
          stroke="url(#mkShine)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* 2. MOTOS: Kinetic Velocity Wheel Arc */}
        <path
          id="mk-crest-wheel"
          d="M26 56 C28 72 38 82 50 82 C62 82 72 72 74 56"
          stroke="url(#mkApexGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          className={animated ? 'animate-draw-wheel' : ''}
        />

        {/* 3. MOTOS & KITNETS: Interlocking M-Wing & Steering Chevron */}
        <path
          id="mk-crest-chevron"
          d="M32 46 L50 62 L68 46"
          stroke="url(#mkApexGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-draw-chevron' : ''}
        />

        {/* 4. Central Keystone Foundation Stem */}
        <path
          id="mk-crest-stem"
          d="M50 18 V50"
          stroke="url(#mkApexGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          className={animated ? 'animate-draw-stem' : ''}
        />

        {/* 5. Radiant Lights (Keystone Beacon & Center Wheel Hub) */}
        <circle
          cx="50"
          cy="16"
          r="3.5"
          fill="#FFFFFF"
          className={animated ? 'animate-bead-pulse' : ''}
        />
        <circle
          cx="50"
          cy="62"
          r="4.5"
          fill="url(#mkCoreLight)"
          className={animated ? 'animate-fade-in' : ''}
        />
      </g>

      <style>{`
        .animate-draw-roof {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: mkDash 0.75s ease-out forwards;
        }
        .animate-draw-wheel {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: mkDash 0.7s ease-out forwards 0.2s;
        }
        .animate-draw-chevron {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: mkDash 0.55s ease-out forwards 0.35s;
        }
        .animate-draw-stem {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: mkDash 0.45s ease-out forwards 0.45s;
        }
        .animate-bead-pulse {
          animation: mkPulse 3s ease-in-out infinite 0.8s;
        }
        .animate-fade-in {
          opacity: 0;
          animation: mkFadeIn 0.5s ease-out forwards 0.6s;
        }
        @keyframes mkDash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes mkFadeIn {
          to { opacity: 1; }
        }
        @keyframes mkPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255,255,255,0.9)); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 8px rgba(216,180,254,1)); }
        }
        .animate-logo-glow {
          animation: mkGlow 3.5s ease-in-out infinite 1.5s;
        }
        @keyframes mkGlow {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(168,85,247,0)); }
          50% { filter: drop-shadow(0 0 10px rgba(168,85,247,0.5)); }
        }
      `}</style>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'main',
  size = 'md',
  customSize,
  className = '',
  showSubtitle = true,
  animated = true,
  showBackground = false,
}) => {
  // Standardized proportional sizing:
  // xs: 28px (compact tags)
  // sm: 32px (scrolled/sticky header)
  // md: 36px (standard header navigation)
  // lg: 48px (dialogs / cards)
  // xl: 64px (login / lock screen hero)
  const pixelSizes = {
    xs: 28,
    sm: 32,
    md: 36,
    lg: 48,
    xl: 64,
    custom: customSize || 36,
  };

  const currentSize = pixelSizes[size];

  if (variant === 'icon') {
    return (
      <LogoIcon
        size={currentSize}
        animated={animated}
        showBackground={showBackground}
        className={className}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <LogoIcon
        size={currentSize}
        animated={animated}
        showBackground={showBackground}
      />

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-[#F8FAFC] tracking-tight leading-none text-base sm:text-lg">
            Motos <span className="text-[#A78BFA] font-bold">&</span> Kitnets
          </span>
          {variant === 'badge' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30 uppercase tracking-widest ml-1">
              PRO
            </span>
          )}
        </div>

        {showSubtitle && variant !== 'compact' && (
          <span className="text-[11px] sm:text-xs font-medium text-[#A1A1AA] tracking-normal mt-1 leading-tight">
            Gestão Patrimonial
          </span>
        )}
      </div>
    </div>
  );
};

