import React, {ComponentType} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

import ButtonDemo from './button';
import CheckboxDemo from './checkbox';
import CommandDemo from './command';
import ConlangFlagDemo from './conlang-flag';
import FocusDemo from './focus';
import LayoutDemo from './layout';
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

type ComponentDemo = {
  readonly name: string;
  readonly demo: ComponentType<{}>;
};

const D = (
  name: string,
  demo: ComponentType<{}>
): ComponentDemo => ({name, demo});

const Components: Record<string, ComponentDemo> = {
  button: D('Button', ButtonDemo),
  checkbox: D('Checkbox', CheckboxDemo),
  command: D('Command', CommandDemo),
  'conlang-flag': D('ConlangFlag', ConlangFlagDemo),
  focus: D('Focus management', FocusDemo),
  layout: D('Layout', LayoutDemo),
  menu: D('Menu', MenuDemo),
  'non-ideal-state': D('NonIdealState', NonIdealStateDemo),
  'number-input': D('NumberInput', NumberInputDemo),
  pages: D('Pages', PagesDemo),
  radio: D('Radio', RadioDemo),
  select: D('Select', SelectDemo),
  spinner: D('Spinner', SpinnerDemo),
  switch: D('Switch', SwitchDemo),
  'tag-input': D('TagInput', TagInputDemo),
  'text-input': D('TextInput', TextInputDemo),
  toolbar: D('Toolbar', ToolbarDemo),
  typography: D('Typography', TypographyDemo),
};

export default Components;

export const ComponentNav = (): JSX.Element => {
  const {asPath} = useRouter();
  return (
    <ul>
      {Object.entries(Components).map(([key, {name}]) =>
        <li key={key}>
          <Link href='/ui/[component]' as={`/ui/${key}`}>
            <a className={asPath === `/ui/${key}` ? 'current' : ''}>
              {name}
            </a>
          </Link>
        </li>
      )}
    </ul>
  );
};
