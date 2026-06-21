/**
 * AfroAngel Fantasy Football brand palette.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const BrandColors = {
  black: '#000000',
  neonGreen: '#39FF14',
  purple: '#A020F0',
  purpleDark: '#1A0A2E',
  silver: '#C0C0C0',
  cardBg: '#0D0D0F',
  border: '#2A1F3D',
} as const;

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: BrandColors.black,
    backgroundElement: BrandColors.cardBg,
    backgroundSelected: BrandColors.purpleDark,
    textSecondary: BrandColors.silver,
  },
  dark: {
    text: '#FFFFFF',
    background: BrandColors.black,
    backgroundElement: BrandColors.cardBg,
    backgroundSelected: BrandColors.purpleDark,
    textSecondary: BrandColors.silver,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Orbitron_400Regular',
    serif: 'Orbitron_400Regular',
    rounded: 'Orbitron_500Medium',
    mono: 'monospace',
  },
  default: {
    sans: 'Orbitron_400Regular',
    serif: 'Orbitron_400Regular',
    rounded: 'Orbitron_500Medium',
    mono: 'monospace',
  },
  web: {
    sans: 'Orbitron, var(--font-display)',
    serif: 'Orbitron, var(--font-serif)',
    rounded: 'Orbitron, var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
