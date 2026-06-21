import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

export type AppTab = {
  route: 'index' | 'gamezone' | 'fpl' | 'my-profile';
  webName: string;
  href: `/${string}` | '/';
  label: string;
  icon: {
    sf: { default: SFSymbol; selected: SFSymbol };
    md: AndroidSymbol;
    web: AndroidSymbol;
  };
};

export const appTabs: AppTab[] = [
  {
    route: 'index',
    webName: 'dashboard',
    href: '/',
    label: 'Dashboard',
    icon: {
      sf: { default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' },
      md: 'dashboard',
      web: 'dashboard',
    },
  },
  {
    route: 'gamezone',
    webName: 'gamezone',
    href: '/gamezone',
    label: 'GameZone',
    icon: {
      sf: { default: 'gamecontroller', selected: 'gamecontroller.fill' },
      md: 'sports_esports',
      web: 'sports_esports',
    },
  },
  {
    route: 'fpl',
    webName: 'fpl',
    href: '/fpl',
    label: 'FPL',
    icon: {
      sf: { default: 'soccerball', selected: 'soccerball.circle.fill' },
      md: 'sports_soccer',
      web: 'sports_soccer',
    },
  },
  {
    route: 'my-profile',
    webName: 'my-profile',
    href: '/my-profile',
    label: 'My Profile',
    icon: {
      sf: { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
      md: 'person',
      web: 'person',
    },
  },
];
