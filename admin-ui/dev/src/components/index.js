import ButtonDemo from './button';
import CheckboxDemo from './checkbox';
import CommandDemo from './command';
import NumberInputDemo from './number-input';
import RadioDemo from './radio';
import SelectDemo from './select';
import SwitchDemo from './switch';
import TextInputDemo from './text-input';

export default [
  ButtonDemo,
  CheckboxDemo,
  CommandDemo,
  NumberInputDemo,
  RadioDemo,
  SelectDemo,
  SwitchDemo,
  TextInputDemo,
].sort((a, b) => a.name.localeCompare(b.name, 'en'));
