/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';
import styled from 'styled-components';

import {Panel, Grid, Cell, Button, Checkbox} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  minimal: boolean;
  raised: boolean;
};

const PanelInitialState: State = {
  minimal: false,
  raised: false,
};

const PanelStorageKey = 'condict/ui/panel';

const Separator = styled.div`
  margin-top: 31px;
  margin-bottom: 31px;
  border-top: 2px solid ${p => p.theme.general.borderColor};
`;

const Main = (): JSX.Element => {
  const {state: panelState, set: setPanel, reset: resetPanel} = useDemoState(
    PanelStorageKey,
    PanelInitialState
  );

  return <>
    <Demo
      name='Panel'
      controls={[
        <Checkbox
          label='Minimal'
          checked={panelState.minimal}
          onChange={e => setPanel('minimal', e.target.checked)}
        />,
        <Checkbox
          label='Raised'
          checked={panelState.raised}
          onChange={e => setPanel('raised', e.target.checked)}
        />,
      ]}
      alignX='stretch'
      onReset={resetPanel}
    >
      <Panel
        minimal={panelState.minimal}
        raised={panelState.raised}
      >
        <h3>Heading in panel</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <Checkbox label='Random checkbox'/>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </Panel>
      <Panel
        minimal={panelState.minimal}
        raised={panelState.raised}
        tabIndex={0}
      >
        <p>This panel can be tabbed to, but does not feature any interactive content.</p>
      </Panel>
      <Grid
        as={Panel}
        minimal={panelState.minimal}
        raised={panelState.raised}
        columns='1fr 1fr'
        rows='auto auto'
        alignCellsX='start'
        gap='16px'
      >
        <div>This panel is also a grid, with two columns and two rows.</div>
        <div>Lorem ipsum dolor sit amet.</div>
        <Cell column='span 2'>
          Second row! This cell actually spans multiple columns, as you can probably see by the text wrapping around the end.
        </Cell>
      </Grid>
    </Demo>
    <Demo
      name='Grid'
      alignX='stretch'
    >
      <Grid columns='1fr 2fr' autoRows='auto' gap='16px'>
        <span>Lorem ipsum</span>
        <span>Dolor sit amet</span>
        <span>Consectetur adipisicing elit, sed do eiusmod tempor incididunt</span>
        <span>Ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span>
      </Grid>
      <Separator/>
      <Grid
        columns='auto 1fr 2fr'
        rows='repeat(3, auto)'
        gap='16px 8px'
        alignCellsX='start'
      >
        <Checkbox label='First option'/>
        <span>Description of first option.</span>
        <Checkbox label='Second option'/>
        <span>The second option has a much longer description, which requires word wrapping over several lines.</span>
        <Cell column='2' alignX='end'>
          <Button intent='secondary'>
            Do something
          </Button>
        </Cell>
        <Grid column='3' row='1 / span 3' alignSelfX='stretch'>
          <Panel raised style={{margin: '0'}}>
            A panel inside a nested grid that consumes 3 rows.
          </Panel>
        </Grid>
      </Grid>
    </Demo>
  </>;
};

export default Main;
