import ButtonDemo from './button';
import CheckboxDemo from './checkbox';
import CommandDemo from './command';
import ConlangFlagDemo from './conlang-flag';
import NonIdealStateDemo from './non-ideal-state';
import NumberInputDemo from './number-input';
import PagesDemo from './pages';
import RadioDemo from './radio';
import SelectDemo from './select';
import SpinnerDemo from './spinner';
import SwitchDemo from './switch';
import TagInputDemo from './tag-input';
import TextInputDemo from './text-input';
import TypographyDemo from './typography';

export default [
  ButtonDemo,
  CheckboxDemo,
  CommandDemo,
  ConlangFlagDemo,
  NonIdealStateDemo,
  NumberInputDemo,
  PagesDemo,
  RadioDemo,
  SelectDemo,
  SpinnerDemo,
  SwitchDemo,
  TagInputDemo,
  TextInputDemo,
  TypographyDemo,
].sort((a, b) => a.name.localeCompare(b.name, 'en'));
