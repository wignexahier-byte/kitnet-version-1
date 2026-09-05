export * from './colors';
export * from './spacing';
export * from './radius';
export * from './typography';
export * from './breakpoints';
export * from './shadows';
export * from './animations';
export * from './zIndex';

import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { shadows } from './shadows';
import { animations } from './animations';
import { zIndex } from './zIndex';

export const TOKENS = {
  colors,
  spacing,
  radius,
  typography,
  breakpoints,
  shadows,
  animation: animations,
  zIndex,
} as const;

export default TOKENS;
