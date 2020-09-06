/* eslint-disable react/jsx-key */
import React from 'react';

import {Pages, Checkbox, NumberInput} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  disabled: boolean;
  loading: boolean;
  page: number;
  totalPagesString: string;
  totalPages: number;
  contextString: string;
  context: number;
};

const InitialState: State = {
  disabled: false,
  loading: false,
  page: 0,
  totalPagesString: '10',
  totalPages: 10,
  contextString: '2',
  context: 2,
};

const StorageKey = 'condict/ui/pages';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {disabled, loading, page, totalPages, context} = state;
  return (
    <Demo
      name='Pages'
      controls={[
        <Checkbox
          label='Disabled'
          checked={state.disabled}
          onChange={e => set('disabled', e.target.checked  )}
        />,
        <Checkbox
          label='Loading'
          checked={state.loading}
          onChange={e => set('loading', e.target.checked  )}
        />,
        <label>
          Total pages: <NumberInput
            value={state.totalPagesString}
            size={2}
            min={1}
            max={9999}
            step={1}
            onChange={e => {
              set('totalPagesString', e.target.value);
              const totalPages = e.target.valueAsNumber;
              if (!Number.isNaN(totalPages)) {
                set('totalPages', totalPages);
              }
            }}
          />
        </label>,
        <label>
          Context: <NumberInput
            value={state.contextString}
            size={2}
            min={0}
            max={10}
            step={1}
            onChange={e => {
              set('contextString', e.target.value);
              const context = e.target.valueAsNumber;
              if (!Number.isNaN(context)) {
                set('context', context);
              }
            }}
          />
        </label>,
      ]}
      onReset={reset}
    >
      <Pages
        disabled={disabled}
        loading={loading}
        page={page}
        totalPages={totalPages}
        context={context}
        onChange={newPage => set('page', newPage)}
      />
    </Demo>
  );
};

export default Main;
