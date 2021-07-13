/* eslint-disable react/jsx-key */
import React from 'react';
import HandHeartIcon from 'mdi-react/HandHeartIcon';
import RobotLoveIcon from 'mdi-react/RobotIcon';
import CakeIcon from 'mdi-react/CakeVariantIcon';
import DeathStarIcon from 'mdi-react/DeathStarVariantIcon';
import PuzzleIcon from 'mdi-react/PuzzleIcon';
import PaletteIcon from 'mdi-react/PaletteIcon';

import {Button, LinkButton, Select, Checkbox, Intent} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import Intents from '../intent-options';

type State = {
  intent: Intent;
  disabled: boolean;
  bold: boolean;
  slim: boolean;
  borderless: boolean;
};

const InitialState: State = {
  intent: 'general',
  disabled: false,
  bold: false,
  slim: false,
  borderless: false,
};

const StorageKey = 'condict/ui/button';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {intent, disabled, bold, slim, borderless} = state;
  return (
    <Demo
      name='Button'
      controls={[
        <label>
          Intent: <Select
            value={intent}
            options={Intents}
            onChange={e => set('intent', e.target.value as Intent)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
        <Checkbox
          checked={bold}
          label='Bold'
          onChange={e => set('bold', e.target.checked)}
        />,
        <Checkbox
          checked={slim}
          label='Slim'
          onChange={e => set('slim', e.target.checked)}
        />,
        <Checkbox
          checked={borderless}
          label='Borderless'
          onChange={e => set('borderless', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <Button
            intent={intent}
            disabled={disabled}
            bold={bold}
            slim={slim}
            borderless={borderless}
            label='Regular button'
          />
        </Row>
        <Row>
          <Button
            intent={intent}
            disabled={disabled}
            bold={bold}
            borderless={borderless}
          >
            <HandHeartIcon/>
            <span>Icon before</span>
          </Button>
          <Button
            intent={intent}
            disabled={disabled}
            bold={bold}
            borderless={borderless}
          >
            <span>Icon after</span>
            <RobotLoveIcon/>
          </Button>
          <Button
            intent={intent}
            disabled={disabled}
            bold={bold}
            borderless={borderless}
            label='Icon only'
          >
            <CakeIcon/>
          </Button>
        </Row>
        <Row>
          <LinkButton
            intent={intent}
            bold={bold}
            slim={slim}
            borderless={borderless}
            label='Link button'
            href='#'
          />
        </Row>
        <Row>
          <LinkButton
            intent={intent}
            bold={bold}
            borderless={borderless}
            href='#'
          >
            <DeathStarIcon/>
            <span>Icon before</span>
          </LinkButton>
          <LinkButton
            intent={intent}
            bold={bold}
            borderless={borderless}
            href='#'
          >
            <span>Icon after</span>
            <PuzzleIcon/>
          </LinkButton>
          <LinkButton
            intent={intent}
            bold={bold}
            borderless={borderless}
            href='#'
            label='Icon only'
          >
            <PaletteIcon/>
          </LinkButton>
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
