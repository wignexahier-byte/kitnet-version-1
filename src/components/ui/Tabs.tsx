import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
  variant: 'pills' | 'underline' | 'segmented';
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  variant = 'pills',
  children,
  className = '',
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange, variant }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const ctx = useContext(TabsContext);
  const variant = ctx?.variant || 'pills';

  const containerStyles = {
    pills: 'flex items-center gap-1.5 p-1.5 bg-[#121824] rounded-2xl border border-white/10 overflow-x-auto no-scrollbar',
    underline: 'flex items-center gap-6 border-b border-white/10 overflow-x-auto no-scrollbar',
    segmented: 'grid grid-flow-col auto-cols-fr gap-1 p-1 bg-[#121824] rounded-xl border border-white/10',
  };

  return (
    <div role="tablist" className={`${containerStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badge?: React.ReactNode;
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  badge,
  className = '',
  ...props
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabTrigger must be used within Tabs');

  const isActive = ctx.value === value;
  const variant = ctx.variant;

  const triggerStyles = {
    pills: isActive
      ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 font-bold'
      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-semibold',
    underline: isActive
      ? 'border-b-2 border-[#8B5CF6] text-white font-bold pb-2.5 -mb-[1px]'
      : 'text-slate-400 hover:text-slate-200 font-semibold pb-2.5 -mb-[1px]',
    segmented: isActive
      ? 'bg-[#1E293B] text-white font-bold shadow-sm'
      : 'text-slate-400 hover:text-slate-200 font-medium',
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange(value)}
      className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-2 select-none whitespace-nowrap cursor-pointer ${
        triggerStyles[variant]
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
};

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  children,
  className = '',
  ...props
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabContent must be used within Tabs');

  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-4 focus:outline-none animate-fadeIn ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
