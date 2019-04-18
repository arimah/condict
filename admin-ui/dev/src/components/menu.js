/* eslint-disable react/jsx-key */
import React from 'react';
import FileIcon from 'mdi-react/FileOutlineIcon';
import OpenIcon from 'mdi-react/FolderOpenIcon';
import SaveIcon from 'mdi-react/FloppyIcon';
import PrintIcon from 'mdi-react/PrinterIcon';
import PageNumbersIcon from 'mdi-react/Numeric1BoxMultipleOutlineIcon';

import {
  Menu,
  MenuTrigger,
  Button,
  Shortcut,
  Placement,
  Select,
  Checkbox,
} from '../../../src';

const {Item, CheckItem, Separator} = Menu;

const Placements = [
  {value: Placement.BELOW_LEFT, name: 'Below left'},
  {value: Placement.BELOW_RIGHT, name: 'Below right'},
  {value: Placement.ABOVE_LEFT, name: 'Above left'},
  {value: Placement.ABOVE_RIGHT, name: 'Above right'},
  {value: Placement.LEFT_TOP, name: 'Left top'},
  {value: Placement.LEFT_BOTTOM, name: 'Left bottom'},
  {value: Placement.RIGHT_TOP, name: 'Right top'},
  {value: Placement.RIGHT_BOTTOM, name: 'Right bottom'},
];

const NewShortcut = Shortcut.parse('Primary+N n');
const OpenShortcut = Shortcut.parse('Primary+O o');
const SaveShortcut = Shortcut.parse('Primary+S s');
const PrintShortcut = Shortcut.parse('Primary+P p');
const CloseShortcut = Shortcut.parse('Primary+W w');

export default Object.freeze({
  name: 'Menu',
  initialState: {
    placement: Placement.BELOW_LEFT,
    keepOpen: false,
    // Checkable menu item states
    lineStyle: 'dashed',
    printHeaders: true,
    printFooters: true,
    printPageNumbers: false,
    printGridLines: false,
    printGuides: false,
  },
  importState: state => {
    window.__CONDICT_DEV_KEEP_MENUS_OPEN__ = state.keepOpen;
    return state;
  },
  controls: (state, setState) => [
    <label>
      Placement: <Select
        value={state.placement}
        options={Placements}
        onChange={e => setState({placement: e.target.value})}
      />
    </label>,
    <Checkbox
      label='Keep menu open when window loses focus (dev only)'
      checked={window.__CONDICT_DEV_KEEP_MENUS_OPEN__}
      onChange={e => {
        window.__CONDICT_DEV_KEEP_MENUS_OPEN__ = e.target.checked;
        setState({keepOpen: e.target.checked});
      }}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: (state, setState, toggleState) =>
    <MenuTrigger
      menu={
        // Please never design a menu like this in real life.
        <Menu placement={state.placement}>
          <Item label='New file' icon={<FileIcon/>} shortcut={NewShortcut}/>
          <Item label='Open file...' icon={<OpenIcon/>} shortcut={OpenShortcut}/>
          <Item label='Open recent'>
            <Item label='1. some_random_file.txt'/>
            <Item label='2. foobar_baz.txt'/>
            <Item label='3. location_of_atlantis.md'/>
            <Separator/>
            <Item label='Clear recent'/>
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
                onActivate={() => setState({lineStyle: 'dotted'})}
              />
              <CheckItem
                radio
                label='Dashed'
                checked={state.lineStyle === 'dashed'}
                onActivate={() => setState({lineStyle: 'dashed'})}
              />
              <CheckItem
                radio
                label='Solid'
                checked={state.lineStyle === 'solid'}
                onActivate={() => setState({lineStyle: 'solid'})}
              />
            </div>
          </Item>
          <Separator/>
          <Item label='Print' icon={<PrintIcon/>} shortcut={PrintShortcut}/>
          <Item label='Print options'>
            <CheckItem
              label='Headers'
              checked={state.printHeaders}
              onActivate={() => toggleState('printHeaders')}
            />
            <CheckItem
              label='Footers'
              checked={state.printFooters}
              onActivate={() => toggleState('printFooters')}
            />
            <CheckItem
              label='Page numbers'
              icon={<PageNumbersIcon/>}
              checked={state.printPageNumbers}
              onActivate={() => toggleState('printPageNumbers')}
            />
            <Separator/>
            <Item label='More options'>
              <CheckItem
                label='Grid lines'
                checked={state.printGridLines}
                onActivate={() => toggleState('printGridLines')}
              />
              <CheckItem
                label='Guides and markers'
                checked={state.printGuides}
                onActivate={() => toggleState('printGuides')}
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
      }
    >
      <Button label='Open menu'/>
    </MenuTrigger>,
});
