import {ColorName} from '../../types';

import {SidebarColors as SidebarColorGroup} from '../types';

const SidebarColors: Record<ColorName, SidebarColorGroup> = {
  red: {
    fg: '#ffffff',
    bg: '#801922',
    hoverBg: '#af232e',
    activeBg: '#511015',
  },
  yellow: {
    fg: '#ffffff',
    bg: '#544212',
    hoverBg: '#79601b',
    activeBg: '#3b2e0d',
  },
  green: {
    fg: '#ffffff',
    bg: '#16551c',
    hoverBg: '#207928',
    activeBg: '#0e3411',
  },
  blue: {
    fg: '#ffffff',
    bg: '#153f79',
    hoverBg: '#1e58a9',
    activeBg: '#0e294e',
  },
  purple: {
    fg: '#ffffff',
    bg: '#701980',
    hoverBg: '#9d23b3',
    activeBg: '#471051',
  },
  gray: {
    fg: '#ffffff',
    bg: '#363c4a',
    hoverBg: '#4b5468',
    activeBg: '#292e38',
  },
};

export default SidebarColors;
