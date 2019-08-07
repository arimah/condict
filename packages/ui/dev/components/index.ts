import ButtonDemo from './button';
import CheckboxDemo from './checkbox';
import CommandDemo from './command';
import ConlangFlagDemo from './conlang-flag';
import MenuDemo from './menu';
import NonIdealStateDemo from './non-ideal-state';
import NumberInputDemo from './number-input';
import PagesDemo from './pages';
import RadioDemo from './radio';
import SelectDemo from './select';
import SpinnerDemo from './spinner';
import SwitchDemo from './switch';
import TagInputDemo from './tag-input';
import TextInputDemo from './text-input';
import ToolbarDemo from './toolbar';
import TypographyDemo from './typography';

import {ComponentDemo} from './types';

const AllDemos: ComponentDemo<any>[] = [
  ButtonDemo,
  CheckboxDemo,
  CommandDemo,
  ConlangFlagDemo,
  MenuDemo,
  NonIdealStateDemo,
  NumberInputDemo,
  PagesDemo,
  RadioDemo,
  SelectDemo,
  SpinnerDemo,
  SwitchDemo,
  TagInputDemo,
  TextInputDemo,
  ToolbarDemo,
  TypographyDemo,
];

AllDemos.sort((a, b) => a.name.localeCompare(b.name, 'en'));

export default AllDemos;
