import ButtonDemo from './button';
import CheckboxDemo from './checkbox';
import CommandDemo from './command';
import NonIdealStateDemo from './non-ideal-state';
import NumberInputDemo from './number-input';
import RadioDemo from './radio';
import SelectDemo from './select';
import SpinnerDemo from './spinner';
import SwitchDemo from './switch';
import TagInputDemo from './tag-input';
import TextInputDemo from './text-input';

export default [
  ButtonDemo,
  CheckboxDemo,
  CommandDemo,
  NonIdealStateDemo,
  NumberInputDemo,
  RadioDemo,
  SelectDemo,
  SpinnerDemo,
  SwitchDemo,
  TagInputDemo,
  TextInputDemo,
].sort((a, b) => a.name.localeCompare(b.name, 'en'));
