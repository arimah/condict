import {ThemeMode, Blue} from '@condict/ui';

export interface TableEditorColors {
  readonly selectedBg: string;
  readonly selectedHeaderBg: string;
  readonly selectedBorder: string;

  readonly braceFg: string;
  readonly disabledBraceFg: string;
}

const Colors: Readonly<Record<ThemeMode, TableEditorColors>> = {
  light: {
    selectedBg: Blue.bold[0],
    selectedHeaderBg: Blue.bold[2],
    selectedBorder: Blue.bold[3],

    braceFg: 'hsl(174, 65%, 35%)',
    disabledBraceFg: 'hsl(174, 40%, 80%)',
  },
  dark: {
    selectedBg: Blue.bold[7],
    selectedHeaderBg: Blue.bold[6],
    selectedBorder: Blue.bold[4],

    braceFg: 'hsl(174, 65%, 60%)',
    disabledBraceFg: 'hsl(174, 40%, 30%)',
  },
};

export default Colors;
