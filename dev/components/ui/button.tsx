/* eslint-disable react/jsx-key */
import React from 'react';
import HandHeartIcon from 'mdi-react/HandHeartIcon';
import RobotLoveIcon from 'mdi-react/RobotIcon';
import CakeIcon from 'mdi-react/CakeVariantIcon';
import DeathStarIcon from 'mdi-react/DeathStarVariantIcon';
import PuzzleIcon from 'mdi-react/PuzzleIcon';
import PaletteIcon from 'mdi-react/PaletteIcon';

import {Button, LinkButton, ButtonIntent, Select, Checkbox} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';

type State = {
  intent: ButtonIntent;
  disabled: boolean;
  slim: boolean;
};

interface IntentOption {
  readonly value: ButtonIntent;
  readonly name: string;
}

const InitialState: State = {
  intent: 'general',
  disabled: false,
  slim: false,
};

const Intents: readonly IntentOption[] = [
  {value: 'general', name: 'general'},
  {value: 'accent', name: 'accent'},
  {value: 'bold', name: 'bold'},
  {value: 'danger', name: 'danger'},
];

const StorageKey = 'condict/ui/button';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {intent, disabled, slim} = state;
  return (
    <Demo
      name='Button'
      controls={[
        <label>
          Intent: <Select
            value={intent}
            options={Intents}
            onChange={e => set('intent', e.target.value as ButtonIntent)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
        <Checkbox
          checked={slim}
          label='Slim'
          onChange={e => set('slim', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <Button intent={intent} disabled={disabled} slim={slim}>
            Regular button
          </Button>
        </Row>
        <Row>
          <Button intent={intent} disabled={disabled}>
            <HandHeartIcon/>
            <span>Icon before</span>
          </Button>
          <Button intent={intent} disabled={disabled}>
            <span>Icon after</span>
            <RobotLoveIcon/>
          </Button>
          <Button intent={intent} disabled={disabled} label='Icon only'>
            <CakeIcon/>
          </Button>
        </Row>
        <Row>
          <LinkButton intent={intent} slim={slim} href='#'>
            Link button
          </LinkButton>
        </Row>
        <Row>
          <LinkButton intent={intent} href='#'>
            <DeathStarIcon/>
            <span>Icon before</span>
          </LinkButton>
          <LinkButton intent={intent} href='#'>
            <span>Icon after</span>
            <PuzzleIcon/>
          </LinkButton>
          <LinkButton intent={intent} href='#' label='Icon only'>
            <PaletteIcon/>
          </LinkButton>
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
