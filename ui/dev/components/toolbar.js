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

import {Toolbar, Menu, Placement, Shortcut, Shortcuts} from '../../src';

const {
  Button,
  Group,
  MenuButton,
  RadioButton,
  RadioGroup,
  Select,
  Spacer,
} = Toolbar;

const BlockStyles = [
  {value: 'paragraph', name: 'Paragraph'},
  {value: 'heading1', name: 'Heading 1'},
  {value: 'heading2', name: 'Heading 2'},
  {value: 'bullist', name: 'Bullet list'},
  {value: 'ordlist', name: 'Numbered list'},
];

const BoldShortcut = Shortcut.parse('Primary+B b');
const ItalicShortcut = Shortcut.parse('Primary+I i');
const UnderlineShortcut = Shortcut.parse('Primary+U u');

// eslint-disable-next-line react/display-name
const MoreOptionsMenu = React.forwardRef(
  // eslint-disable-next-line react/prop-types
  ({state, setState, toggleState, ...otherProps}, ref) =>
    <Menu {...otherProps} placement={Placement.BELOW_RIGHT} ref={ref}>
      <Menu.Item label='Example menu'/>
      <Menu.Item label='Not suitable for real world'/>
      <Menu.Separator/>
      <Menu.CheckItem
        label='Bold'
        icon={<BoldIcon/>}
        checked={state.bold}
        shortcut={BoldShortcut}
        onActivate={() => toggleState('bold')}
      />
      <Menu.CheckItem
        label='Italic'
        icon={<ItalicIcon/>}
        checked={state.italic}
        shortcut={ItalicShortcut}
        onActivate={() => toggleState('italic')}
      />
      <Menu.CheckItem
        label='Underline'
        icon={<UnderlineIcon/>}
        checked={state.underline}
        shortcut={UnderlineShortcut}
        onActivate={() => toggleState('underline')}
      />
      <Menu.CheckItem
        label='Subscript'
        icon={<SubscriptIcon/>}
        checked={state.subscript}
        onActivate={() => setState({
          subscript: !state.subscript,
          superscript: false,
        })}
      />
      <Menu.CheckItem
        label='Superscript'
        icon={<SuperscriptIcon/>}
        checked={state.superscript}
        onActivate={() => setState({
          superscript: !state.superscript,
          subscript: false,
        })}
      />
      <Menu.Separator/>
      <Menu.Item label='Block formatting'>
        <div role='group'>
          <Menu.CheckItem
            radio
            checked={state.blockStyle === 'paragraph'}
            label='Paragraph'
            onActivate={() => setState({blockStyle: 'paragraph'})}
          />
          <Menu.CheckItem
            radio
            checked={state.blockStyle === 'heading1'}
            label='Heading 1'
            onActivate={() => setState({blockStyle: 'heading1'})}
          />
          <Menu.CheckItem
            radio
            checked={state.blockStyle === 'heading2'}
            label='Heading 2'
            onActivate={() => setState({blockStyle: 'heading2'})}
          />
          <Menu.CheckItem
            radio
            checked={state.blockStyle === 'bullist'}
            label='Bullet list'
            onActivate={() => setState({blockStyle: 'bullist'})}
          />
          <Menu.CheckItem
            radio
            checked={state.blockStyle === 'ordlist'}
            label='Numbered list'
            onActivate={() => setState({blockStyle: 'ordlist'})}
          />
        </div>
        <Menu.Separator/>
        <Menu.Item label='Increase indentation'/>
        <Menu.Item label='Decrease indentation'/>
      </Menu.Item>
    </Menu>
);

export default Object.freeze({
  name: 'Toolbar',
  initialState: {
    bold: false,
    italic: true,
    underline: false,
    subscript: false,
    superscript: false,
    align: 'left',
    blockStyle: 'paragraph',
  },
  alignX: 'stretch',
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: (state, setState, toggleState) =>
    <Toolbar>
      <Group>
        <Button label='Undo' shortcut={Shortcuts.undo}/>
        <Button disabled label='Redo' shortcut={Shortcuts.redo}/>
      </Group>
      <Group name='Text formatting'>
        <Button
          label='Bold'
          checked={state.bold}
          shortcut={BoldShortcut}
          onClick={() => toggleState('bold')}
        >
          <BoldIcon/>
        </Button>
        <Button
          label='Italic'
          checked={state.italic}
          shortcut={ItalicShortcut}
          onClick={() => toggleState('italic')}
        >
          <ItalicIcon/>
        </Button>
        <Button
          label='Underline'
          checked={state.underline}
          shortcut={UnderlineShortcut}
          onClick={() => toggleState('underline')}
        >
          <UnderlineIcon/>
        </Button>
        <Button
          label='Subscript'
          checked={state.subscript}
          onClick={() => setState({
            subscript: !state.subscript,
            superscript: false,
          })}
        >
          <SubscriptIcon/>
        </Button>
        <Button
          label='Superscript'
          checked={state.superscript}
          onClick={() => setState({
            superscript: !state.superscript,
            subscript: false,
          })}
        >
          <SuperscriptIcon/>
        </Button>
      </Group>
      <RadioGroup name='Text alignment'>
        <RadioButton
          label='Align left'
          checked={state.align === 'left'}
          onClick={() => setState({align: 'left'})}
        >
          <AlignLeftIcon/>
        </RadioButton>
        <RadioButton
          label='Center text'
          checked={state.align === 'center'}
          onClick={() => setState({align: 'center'})}
        >
          <AlignCenterIcon/>
        </RadioButton>
        <RadioButton
          label='Align right'
          checked={state.align === 'right'}
          onClick={() => setState({align: 'right'})}
        >
          <AlignRightIcon/>
        </RadioButton>
      </RadioGroup>
      <Group name='Block formatting'>
        <Select
          label='Block type: '
          value={state.blockStyle}
          options={BlockStyles}
          onChange={e => setState({blockStyle: e.target.value})}
        />
        <Button label='Increase indentation'>
          <IndentMoreIcon/>
        </Button>
        <Button label='Decrease indentation'>
          <IndentLessIcon/>
        </Button>
      </Group>
      <Spacer/>
      <MenuButton
        label='More options'
        menu={
          <MoreOptionsMenu
            state={state}
            setState={setState}
            toggleState={toggleState}
          />
        }
      >
        <DotsVerticalIcon/>
      </MenuButton>
    </Toolbar>,
});
