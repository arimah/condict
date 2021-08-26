/* eslint-disable react/jsx-key, react/display-name */
import React, {Ref, useEffect} from 'react';
import FileIcon from 'mdi-react/FileOutlineIcon';
import OpenIcon from 'mdi-react/FolderOpenIcon';
import SaveIcon from 'mdi-react/FloppyIcon';
import PrintIcon from 'mdi-react/PrinterIcon';
import PageNumbersIcon from 'mdi-react/Numeric1BoxMultipleOutlineIcon';

import {
  Menu,
  MenuType,
  MenuProps,
  MenuTrigger,
  ContextMenuTrigger,
  Button,
  Shortcut,
  Placement,
  Select,
  Checkbox,
} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';

type State = {
  placement: Placement;
  keepOpen: boolean;
  // Checkable menu item states
  lineStyle: 'dotted' | 'dashed' | 'solid';
  printHeaders: boolean;
  printFooters: boolean;
  printPageNumbers: boolean;
  printGridLines: boolean;
  printGuides: boolean;
};

const InitialState: State = {
  placement: 'BELOW_LEFT',
  keepOpen: false,
  // Checkable menu item states
  lineStyle: 'dashed',
  printHeaders: true,
  printFooters: true,
  printPageNumbers: false,
  printGridLines: false,
  printGuides: false,
};

const StorageKey = 'condict/ui/menu';

const Placements = [
  {value: 'BELOW_LEFT', name: 'Below left'},
  {value: 'BELOW_RIGHT', name: 'Below right'},
  {value: 'ABOVE_LEFT', name: 'Above left'},
  {value: 'ABOVE_RIGHT', name: 'Above right'},
  {value: 'LEFT_TOP', name: 'Left top'},
  {value: 'LEFT_BOTTOM', name: 'Left bottom'},
  {value: 'RIGHT_TOP', name: 'Right top'},
  {value: 'RIGHT_BOTTOM', name: 'Right bottom'},
];

const NewShortcut = Shortcut.parse('Primary+N n');
const OpenShortcut = Shortcut.parse('Primary+O o');
const SaveShortcut = Shortcut.parse('Primary+S s');
const PrintShortcut = Shortcut.parse('Primary+P p');
const CloseShortcut = Shortcut.parse('Primary+W w');
const ClearRecentShortcut = Shortcut.parse('Ctrl+Shift+Delete');
const GridLinesShortcut = Shortcut.parse('Alt+G');

const {Item, CheckItem, Separator} = Menu;

type DemoMenuProps = {
  state: State;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
} & Omit<MenuProps, 'children'>;

const DemoMenu = React.forwardRef((
  {state, set, ...otherProps}: DemoMenuProps,
  ref: Ref<MenuType>
) =>
  // Please never design a menu like this in real life.
  <Menu {...otherProps} placement={state.placement} ref={ref}>
    <Item label='New file' icon={<FileIcon/>} shortcut={NewShortcut}/>
    <Item label='Open file...' icon={<OpenIcon/>} shortcut={OpenShortcut}/>
    <Item label='Open recent'>
      <Item label='1. some_random_file.txt'/>
      <Item label='2. foobar_baz.txt'/>
      <Item label='3. location_of_atlantis.md'/>
      <Separator/>
      <Item label='Clear recent' shortcut={ClearRecentShortcut}/>
    </Item>
    <Separator/>
    <Item disabled label='Save' icon={<SaveIcon/>} shortcut={SaveShortcut}/>
    <Item label='Save as...'/>
    <Separator/>
    <Item label='Line style'>
      <div role='group'>
        <CheckItem
          radio
          label='Dotted'
          checked={state.lineStyle === 'dotted'}
          onActivate={() => set('lineStyle', 'dotted')}
        />
        <CheckItem
          radio
          label='Dashed'
          checked={state.lineStyle === 'dashed'}
          onActivate={() => set('lineStyle', 'dashed')}
        />
        <CheckItem
          radio
          label='Solid'
          checked={state.lineStyle === 'solid'}
          onActivate={() => set('lineStyle', 'solid')}
        />
      </div>
    </Item>
    <Separator/>
    <Item label='Print' icon={<PrintIcon/>} shortcut={PrintShortcut}/>
    <Item label='Print options'>
      <CheckItem
        label='Headers'
        checked={state.printHeaders}
        onActivate={() => set('printHeaders', !state.printHeaders)}
      />
      <CheckItem
        label='Footers'
        checked={state.printFooters}
        onActivate={() => set('printFooters', !state.printFooters)}
      />
      <CheckItem
        label='Page numbers'
        icon={<PageNumbersIcon/>}
        checked={state.printPageNumbers}
        onActivate={() => set('printPageNumbers', !state.printPageNumbers)}
      />
      <Separator/>
      <Item label='More options'>
        <CheckItem
          label='Grid lines'
          checked={state.printGridLines}
          shortcut={GridLinesShortcut}
          onActivate={() => set('printGridLines', !state.printGridLines)}
        />
        <CheckItem
          label='Guides and markers'
          checked={state.printGuides}
          onActivate={() => set('printGuides', !state.printGuides)}
        />
        <Separator/>
        <Item label='Full print options...'/>
      </Item>
    </Item>
    <Item disabled label='Additional things'>
      <Item label='If this shows up, something has gone wrong'/>
    </Item>
    <Separator/>
    <Item label='Close file' shortcut={CloseShortcut}/>
    <Separator/>
    <Item label='Exit'/>
  </Menu>
);

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);

  useEffect(() => {
    window.__CONDICT_DEV_KEEP_MENUS_OPEN__ = state.keepOpen;
  }, [state.keepOpen]);

  return (
    <Demo
      name='Menu'
      controls={[
        <label>
          Placement: <Select
            value={state.placement}
            options={Placements}
            onChange={e => set('placement', e.target.value as Placement)}
          />
        </label>,
        <Checkbox
          label='Keep menu open when window loses focus (dev only)'
          checked={state.keepOpen}
          onChange={e => set('keepOpen', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <MenuTrigger
            openClass='force-active'
            menu={<DemoMenu state={state} set={set}/>}
          >
            <Button label='Open menu'/>
          </MenuTrigger>
        </Row>
        <Row>
          <ContextMenuTrigger menu={<DemoMenu state={state} set={set}/>}>
            <Button label='I have a context menu'/>
          </ContextMenuTrigger>
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
