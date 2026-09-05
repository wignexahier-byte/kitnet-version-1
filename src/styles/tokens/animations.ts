export const animations = {
  transitionFast: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  transitionNormal: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  transitionSlow: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  springTransition: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
  modalEnter: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 8 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  drawerEnter: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
} as const;
