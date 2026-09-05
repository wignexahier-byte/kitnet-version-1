import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  FileText,
  Settings,
  Lock,
  Bell,
  BadgeAlert,
  Layers,
  Users,
  Calendar,
  FileSpreadsheet,
  Bot,
  Search,
  Phone,
  ShieldAlert,
  MoreHorizontal,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getCNHStatus, getDaysUntil, isInstallmentOverdue } from '../utils/formatters';
import { Logo } from './Logo';
import { MotoIcon, KitnetIcon } from './CategoryIcons';
import { MoreMenuDrawer } from './MoreMenuDrawer';
import { useRenderTracker } from '../utils/perfLogger';

export type TabType =
  | 'dashboard'
  | 'cobrancas'
  | 'motos'
  | 'kitnets'
  | 'clientes'
  | 'calendario'
  | 'financeiro'
  | 'relatorios'
  | 'documentos'
  | 'configuracoes';

interface NavigationProps {
  activeTab?: TabType;
  currentTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenSettings?: () => void;
  onOpenNotifications: () => void;
  onOpenSearch?: () => void;
  onOpenContacts?: () => void;
  onOpenSimulator?: () => void;
  onOpenPwaGuide?: () => void;
}

export const NavigationComponent: React.FC<NavigationProps> = ({
  activeTab,
  currentTab,
  onTabChange,
  onSelectTab,
  onOpenSettings,
  onOpenNotifications,
  onOpenSearch,
  onOpenContacts,
  onOpenSimulator,
  onOpenPwaGuide,
}) => {
  useRenderTracker('Navigation');
  const current = activeTab || currentTab || 'dashboard';
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Dynamic Scroll Overlay & Header Glow
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const scrollY =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        window.scrollY ||
        0;
      setIsScrolled(scrollY > 15);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSelect = (tab: TabType) => {
    if (onTabChange) onTabChange(tab);
    else if (onSelectTab) onSelectTab(tab);
  };
  const handleSettings = () => {
    if (onOpenSettings) onOpenSettings();
    else handleSelect('configuracoes');
  };

  const handleLogoClick = () => {
    handleSelect('dashboard');
  };

  const {
    lockApp,
    motos,
    kitnets,
    motoTenants,
    motoContracts,
    kitnetContracts,
    expenses,
    isReadOnlyMode,
    toggleReadOnlyMode,
    isDemoMode,
    toggleDemoMode,
  } = useApp();

  // Overdue and active alerts count for badge (memoized)
  const { overdueCount, alertCount } = useMemo(() => {
    let overdue = 0;
    let upcomingRentals = 0;

    motoContracts.forEach((c) => {
      c.installments.forEach((i) => {
        if (i.status === 'pago') return;
        if (isInstallmentOverdue(i)) {
          overdue++;
        } else {
          const days = getDaysUntil(i.dueDate);
          if (days <= 3) upcomingRentals++;
        }
      });
    });

    kitnetContracts.forEach((c) => {
      c.installments.forEach((i) => {
        if (i.status === 'pago') return;
        if (isInstallmentOverdue(i)) {
          overdue++;
        } else {
          const days = getDaysUntil(i.dueDate);
          if (days <= 3) upcomingRentals++;
        }
      });
    });

    let alerts = overdue + upcomingRentals;
    const today = new Date();
    const activeMotoTenantIds = new Set(
      motoContracts.filter((c) => c.status === 'ativo').map((c) => c.tenantId)
    );

    motoTenants.forEach((t) => {
      if (activeMotoTenantIds.has(t.id) && t.cnh?.expirationDate) {
        const cnh = getCNHStatus(t.cnh.expirationDate);
        if (cnh.status === 'vencendo' || cnh.status === 'vencida') alerts++;
      }
    });

    motos.forEach((m) => {
      if (m.ipvaDueDate) {
        const days = Math.ceil((new Date(m.ipvaDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 15) alerts++;
      }
    });

    expenses.forEach((e) => {
      if (e.status === 'pendente') {
        const days = getDaysUntil(e.dueDate);
        if (days <= 3) alerts++;
      }
    });

    return { overdueCount: overdue, alertCount: alerts };
  }, [motoContracts, kitnetContracts, motoTenants, motos, expenses]);

  // Centralized theme colors for tabs and indicators
  const TAB_THEMES: Record<string, {
    activeText: string;
    activeGlow: string;
    activeBg: string;
    activeBorder: string;
    activeColor: string;
  }> = {
    dashboard: {
      activeText: 'text-[#8B5CF6]',
      activeGlow: 'bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]',
      activeBg: 'bg-[#8B5CF6]/15',
      activeBorder: 'border-[#8B5CF6]/30',
      activeColor: '#8B5CF6',
    },
    motos: {
      activeText: 'text-[#E07A3F]',
      activeGlow: 'bg-[#E07A3F] shadow-[0_0_10px_#E07A3F]',
      activeBg: 'bg-[#E07A3F]/15',
      activeBorder: 'border-[#E07A3F]/30',
      activeColor: '#E07A3F',
    },
    kitnets: {
      activeText: 'text-[#0EA5E9]',
      activeGlow: 'bg-[#0EA5E9] shadow-[0_0_10px_#0EA5E9]',
      activeBg: 'bg-[#0EA5E9]/15',
      activeBorder: 'border-[#0EA5E9]/30',
      activeColor: '#0EA5E9',
    },
    financeiro: {
      activeText: 'text-[#10B981]',
      activeGlow: 'bg-[#10B981] shadow-[0_0_10px_#10B981]',
      activeBg: 'bg-[#10B981]/15',
      activeBorder: 'border-[#10B981]/30',
      activeColor: '#10B981',
    },
    cobrancas: {
      activeText: 'text-[#EF4444]',
      activeGlow: 'bg-[#EF4444] shadow-[0_0_10px_#EF4444]',
      activeBg: 'bg-[#EF4444]/15',
      activeBorder: 'border-[#EF4444]/30',
      activeColor: '#EF4444',
    },
    clientes: {
      activeText: 'text-[#8B5CF6]',
      activeGlow: 'bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]',
      activeBg: 'bg-[#8B5CF6]/15',
      activeBorder: 'border-[#8B5CF6]/30',
      activeColor: '#8B5CF6',
    },
    calendario: {
      activeText: 'text-[#F59E0B]',
      activeGlow: 'bg-[#F59E0B] shadow-[0_0_10px_#F59E0B]',
      activeBg: 'bg-[#F59E0B]/15',
      activeBorder: 'border-[#F59E0B]/30',
      activeColor: '#F59E0B',
    },
    relatorios: {
      activeText: 'text-[#10B981]',
      activeGlow: 'bg-[#10B981] shadow-[0_0_10px_#10B981]',
      activeBg: 'bg-[#10B981]/15',
      activeBorder: 'border-[#10B981]/30',
      activeColor: '#10B981',
    },
    ia: {
      activeText: 'text-[#A78BFA]',
      activeGlow: 'bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]',
      activeBg: 'bg-[#8B5CF6]/15',
      activeBorder: 'border-[#8B5CF6]/30',
      activeColor: '#8B5CF6',
    },
    documentos: {
      activeText: 'text-[#38BDF8]',
      activeGlow: 'bg-[#38BDF8] shadow-[0_0_10px_#38BDF8]',
      activeBg: 'bg-[#38BDF8]/15',
      activeBorder: 'border-[#38BDF8]/30',
      activeColor: '#38BDF8',
    },
    configuracoes: {
      activeText: 'text-[#F5F5F7]',
      activeGlow: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]',
      activeBg: 'bg-white/10',
      activeBorder: 'border-white/20',
      activeColor: '#FFFFFF',
    },
    mais: {
      activeText: 'text-[#8B5CF6]',
      activeGlow: 'bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]',
      activeBg: 'bg-[#8B5CF6]/15',
      activeBorder: 'border-[#8B5CF6]/30',
      activeColor: '#8B5CF6',
    },
  };

  // Desktop Navigation Items
  const desktopNavItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number; color?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'cobrancas',
      label: 'Cobranças',
      icon: BadgeAlert,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-[#EF4444] text-white',
    },
    {
      id: 'motos',
      label: 'Motos',
      icon: (props) => <MotoIcon {...props} size={15} color="#E07A3F" />,
      badge: motos.length,
      badgeColor: 'bg-[#E07A3F]/20 text-[#E07A3F] border border-[#E07A3F]/30',
    },
    {
      id: 'kitnets',
      label: 'Kitnets',
      icon: (props) => <KitnetIcon {...props} size={15} color="#0EA5E9" />,
      badge: kitnets.length,
      badgeColor: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/30',
    },
    { id: 'clientes', label: 'Clientes & Score', icon: Users },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'financeiro', label: 'Financeiro', icon: Wallet },
    { id: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'documentos', label: 'Documentos', icon: FileText },
  ];

  // Mobile bottom items matching exact 5 tabs from screenshot
  const mobileBottomItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutGrid },
    {
      id: 'motos' as TabType,
      label: 'Motos',
      icon: (props: any) => <MotoIcon {...props} size={20} color="#E07A3F" />,
      badge: motos.filter((m) => m.status === 'alugada').length,
    },
    {
      id: 'kitnets' as TabType,
      label: 'Kitnets',
      icon: (props: any) => <KitnetIcon {...props} size={20} color="#0EA5E9" />,
      badge: kitnets.filter((k) => k.status === 'alugada').length,
    },
    { id: 'financeiro' as TabType, label: 'Financeiro', icon: Wallet },
    { id: 'mais' as any, label: 'Mais', icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Top Navbar: Permanently fixed at top-0 with fixed, stable dimensions */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 pointer-events-none">
        {/* Soft dark frosted backdrop across full width so content scrolling beneath header never clashes */}
        <div
          className={`absolute inset-0 bg-[#090A0F]/85 backdrop-blur-md pointer-events-none -z-10 transition-opacity duration-300 ease-in-out ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Elegant Clean Card Container wrapping around the header */}
        <div
          className={`relative max-w-7xl mx-auto rounded-2xl pointer-events-auto transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'header-box-scrolled'
              : 'header-box'
          }`}
        >
          <div className="relative z-20 px-3 sm:px-6 lg:px-7 flex items-center justify-between gap-3 sm:gap-4 h-15 sm:h-16">
          {/* Main Logo & Brand */}
          <div
            className="cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center gap-2.5 group relative"
            onClick={handleLogoClick}
            title="Ir para o Dashboard"
          >
            <Logo
              variant="main"
              size="md"
              showSubtitle={true}
              animated={true}
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = current === item.id;
              const theme = TAB_THEMES[item.id] || TAB_THEMES.dashboard;

              const activeClass = `${theme.activeBg} ${theme.activeText} border ${theme.activeBorder} shadow-xs`;
              const iconActiveClass = theme.activeText;

              return (
                <button
                  type="button"
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? activeClass
                      : 'text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? iconActiveClass : ''}`}
                    color={
                      item.id === 'motos'
                        ? '#E07A3F'
                        : item.id === 'kitnets'
                        ? '#0EA5E9'
                        : isActive
                        ? theme.activeColor
                        : undefined
                    }
                  />
                  <span className="shrink-0">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold inline-flex items-center justify-center shrink-0 leading-none ${
                        item.badgeColor || 'bg-white/10 text-[#9A9AA2]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons (Search, Notification with red badge, User Profile) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search circular button */}
            {onOpenSearch && (
              <button
                type="button"
                id="header-btn-search"
                onClick={onOpenSearch}
                className="w-10 h-10 rounded-full bg-[#18181B] hover:bg-[#222228] border border-white/[0.08] text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Busca Unificada (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-[#F5F5F7]" />
              </button>
            )}

            {/* Notifications circular button with badge */}
            <button
              type="button"
              id="header-btn-notifications"
              onClick={onOpenNotifications}
              className="w-10 h-10 relative rounded-full bg-[#18181B] hover:bg-[#222228] border border-white/[0.08] text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Alertas e Notificações"
            >
              <Bell className="w-4 h-4 text-[#F5F5F7]" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0E0E12] shadow-sm animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>

            {/* User Profile / Settings circular button */}
            <button
              type="button"
              id="header-btn-user"
              onClick={handleSettings}
              className="w-10 h-10 rounded-full bg-[#18181B] hover:bg-[#222228] border border-white/[0.08] text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Perfil & Configurações"
            >
              <User className="w-4 h-4 text-[#F5F5F7]" />
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Structural layout spacer ensuring page content starts cleanly below the fixed header */}
    <div
      className="w-full shrink-0 pointer-events-none h-18 sm:h-20"
      aria-hidden="true"
    />

      {/* Mobile Sticky Bottom Tab Bar - Exact 5 Items with High Precision */}
      <nav
        aria-label="Menu Principal"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E12]/95 border-t border-white/[0.08] backdrop-blur-md px-3 pt-1.5 pb-safe shadow-2xl"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isMais = item.id === 'mais';
            const isTabActive = !isMais && current === item.id;
            const theme = TAB_THEMES[item.id] || TAB_THEMES.dashboard;

            return (
              <button
                type="button"
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => {
                  if (isMais) {
                    setIsMoreMenuOpen(true);
                  } else {
                    handleSelect(item.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px] min-h-[48px] active:scale-90 ${
                  isTabActive
                    ? theme.activeText
                    : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                }`}
              >
                {/* Active Indicator Top Glow Line with dynamic themed color */}
                {isTabActive && (
                  <motion.div
                    layoutId="mobileTopIndicator"
                    className={`absolute -top-1.5 w-8 h-0.5 rounded-full ${theme.activeGlow}`}
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isTabActive ? `${theme.activeText} scale-105` : 'text-[#9A9AA2]'
                    }`}
                    color={
                      item.id === 'motos'
                        ? '#E07A3F'
                        : item.id === 'kitnets'
                        ? '#0EA5E9'
                        : isTabActive
                        ? theme.activeColor
                        : undefined
                    }
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`absolute -top-1 -right-1.5 w-2 h-2 rounded-full ring-2 ring-[#0E0E12] ${
                        item.id === 'motos'
                          ? 'bg-[#E07A3F]'
                          : item.id === 'kitnets'
                          ? 'bg-[#0EA5E9]'
                          : 'bg-[#EF4444]'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 tracking-tight transition-colors duration-150 ${
                    isTabActive ? `${theme.activeText} font-bold` : 'text-[#9A9AA2] font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Drawer Menu for "Mais" */}
      <MoreMenuDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={handleSelect}
        onOpenSimulator={() => {
          if (onOpenSimulator) onOpenSimulator();
        }}
        onOpenContacts={() => {
          if (onOpenContacts) onOpenContacts();
        }}
        onOpenPwaGuide={() => {
          if (onOpenPwaGuide) onOpenPwaGuide();
        }}
        overdueCount={overdueCount}
      />
    </>
  );
};

export const Navigation = memo(NavigationComponent);


