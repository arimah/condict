/* eslint-disable react/jsx-key */
import React from 'react';
import BoldIcon from 'mdi-react/FormatBoldIcon';
import ItalicIcon from 'mdi-react/FormatItalicIcon';
import UnderlineIcon from 'mdi-react/FormatUnderlineIcon';
import SubscriptIcon from 'mdi-react/FormatSubscriptIcon';
import SuperscriptIcon from 'mdi-react/FormatSuperscriptIcon';
import AlignLeftIcon from 'mdi-react/FormatAlignLeftIcon';
import AlignCenterIcon from 'mdi-react/FormatAlignCenterIcon';
import AlignRightIcon from 'mdi-react/FormatAlignRightIcon';
import IndentMoreIcon from 'mdi-react/FormatIndentIncreaseIcon';
import IndentLessIcon from 'mdi-react/FormatIndentDecreaseIcon';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';

import {
  Toolbar,
  Menu,
  MenuProps,
  Shortcut,
  Shortcuts,
  SelectOption,
} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  subscript: boolean;
  superscript: boolean;
  align: string;
  blockStyle: string;
};

const InitialState: State = {
  bold: false,
  italic: true,
  underline: false,
  subscript: false,
  superscript: false,
  align: 'left',
  blockStyle: 'paragraph',
};

const StorageKey = 'condict/ui/toolbar';

const BlockStyles: readonly SelectOption<string>[] = [
  {value: 'paragraph', name: 'Paragraph'},
  {value: 'heading1', name: 'Heading 1'},
  {value: 'heading2', name: 'Heading 2'},
  {value: 'bullist', name: 'Bullet list'},
  {value: 'ordlist', name: 'Numbered list'},
];

const BoldShortcut = Shortcut.parse('Primary+B b');
const ItalicShortcut = Shortcut.parse('Primary+I i');
const UnderlineShortcut = Shortcut.parse('Primary+U u');

type Props = {
  state: State;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
} & Omit<MenuProps, 'children'>;

// eslint-disable-next-line react/display-name
const MoreOptionsMenu = ({state, set, ...otherProps}: Props) =>
  <Menu {...otherProps}>
    <Menu.Item label='Example menu'/>
    <Menu.Item label='Not suitable for real world'/>
    <Menu.Separator/>
    <Menu.CheckItem
      label='Bold'
      icon={<BoldIcon/>}
      checked={state.bold}
      shortcut={BoldShortcut}
      onActivate={() => set('bold', !state.bold)}
    />
    <Menu.CheckItem
      label='Italic'
      icon={<ItalicIcon/>}
      checked={state.italic}
      shortcut={ItalicShortcut}
      onActivate={() => set('italic', !state.italic)}
    />
    <Menu.CheckItem
      label='Underline'
      icon={<UnderlineIcon/>}
      checked={state.underline}
      shortcut={UnderlineShortcut}
      onActivate={() => set('underline', !state.underline)}
    />
    <Menu.CheckItem
      label='Subscript'
      icon={<SubscriptIcon/>}
      checked={state.subscript}
      onActivate={() => {
        set('subscript', !state.subscript);
        set('superscript', false);
      }}
    />
    <Menu.CheckItem
      label='Superscript'
      icon={<SuperscriptIcon/>}
      checked={state.superscript}
      onActivate={() => {
        set('superscript', !state.superscript);
        set('subscript', false);
      }}
    />
    <Menu.Separator/>
    <Menu.Item label='Block formatting'>
      <div role='group'>
        <Menu.CheckItem
          radio
          checked={state.blockStyle === 'paragraph'}
          label='Paragraph'
          onActivate={() => set('blockStyle', 'paragraph')}
        />
        <Menu.CheckItem
          radio
          checked={state.blockStyle === 'heading1'}
          label='Heading 1'
          onActivate={() => set('blockStyle', 'heading1')}
        />
        <Menu.CheckItem
          radio
          checked={state.blockStyle === 'heading2'}
          label='Heading 2'
          onActivate={() => set('blockStyle', 'heading2')}
        />
        <Menu.CheckItem
          radio
          checked={state.blockStyle === 'bullist'}
          label='Bullet list'
          onActivate={() => set('blockStyle', 'bullist')}
        />
        <Menu.CheckItem
          radio
          checked={state.blockStyle === 'ordlist'}
          label='Numbered list'
          onActivate={() => set('blockStyle', 'ordlist')}
        />
      </div>
      <Menu.Separator/>
      <Menu.Item label='Increase indentation'/>
      <Menu.Item label='Decrease indentation'/>
    </Menu.Item>
  </Menu>;

const {
  Button,
  Group,
  MenuButton,
  RadioButton,
  RadioGroup,
  Select,
  Spacer,
} = Toolbar;

const Main = (): JSX.Element => {
  const {state, set} = useDemoState(StorageKey, InitialState);
  const {
    bold,
    italic,
    underline,
    subscript,
    superscript,
    align,
    blockStyle,
  } = state;
  return (
    <Demo name='Toolbar' alignX='stretch'>
      <Toolbar>
        <Group>
          <Button shortcut={Shortcuts.undo}>Undo</Button>
          <Button disabled shortcut={Shortcuts.redo}>Redo</Button>
        </Group>
        <Group name='Text formatting'>
          <Button
            title='Bold'
            checked={bold}
            shortcut={BoldShortcut}
            onClick={() => set('bold', !bold)}
          >
            <BoldIcon/>
          </Button>
          <Button
            title='Italic'
            checked={italic}
            shortcut={ItalicShortcut}
            onClick={() => set('italic', !italic)}
          >
            <ItalicIcon/>
          </Button>
          <Button
            title='Underline'
            checked={underline}
            shortcut={UnderlineShortcut}
            onClick={() => set('underline', !underline)}
          >
            <UnderlineIcon/>
          </Button>
          <Button
            title='Subscript'
            checked={subscript}
            onClick={() => {
              set('subscript', !subscript);
              set('superscript', false);
            }}
          >
            <SubscriptIcon/>
          </Button>
          <Button
            title='Superscript'
            checked={superscript}
            onClick={() => {
              set('superscript', !superscript);
              set('subscript', false);
            }}
          >
            <SuperscriptIcon/>
          </Button>
        </Group>
        <RadioGroup name='Text alignment'>
          <RadioButton
            title='Align left'
            checked={align === 'left'}
            onClick={() => set('align', 'left')}
          >
            <AlignLeftIcon/>
          </RadioButton>
          <RadioButton
            title='Center text'
            checked={align === 'center'}
            onClick={() => set('align', 'center')}
          >
            <AlignCenterIcon/>
          </RadioButton>
          <RadioButton
            title='Align right'
            checked={align === 'right'}
            onClick={() => set('align', 'right')}
          >
            <AlignRightIcon/>
          </RadioButton>
        </RadioGroup>
        <Group name='Block formatting'>
          <Select
            label='Block type: '
            value={blockStyle}
            options={BlockStyles}
            onChange={blockStyle => set('blockStyle', blockStyle)}
          />
          <Button title='Increase indentation'>
            <IndentMoreIcon className='rtl-mirror'/>
          </Button>
          <Button title='Decrease indentation'>
            <IndentLessIcon className='rtl-mirror'/>
          </Button>
        </Group>
        <Spacer/>
        <MenuButton
          title='More options'
          menu={<MoreOptionsMenu state={state} set={set}/>}
        >
          <DotsVerticalIcon/>
        </MenuButton>
      </Toolbar>
    </Demo>
  );
};

export default Main;
