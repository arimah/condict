/* eslint-disable react/jsx-key */
import React from 'react';

import {Pages, Checkbox, NumberInput} from '../../src';

import {ComponentDemo} from './types';

export interface State {
  disabled: boolean;
  loading: boolean;
  page: number;
  totalPagesString: string;
  totalPages: number;
  contextString: string;
  context: number;
}

const demo: ComponentDemo<State> = {
  name: 'Pages',
  initialState: {
    disabled: false,
    loading: false,
    page: 0,
    totalPagesString: '10',
    totalPages: 10,
    contextString: '2',
    context: 2,
  },
  controls: (state, setState, toggleState) => [
    <Checkbox
      label='Disabled'
      checked={state.disabled}
      onChange={() => toggleState('disabled')}
    />,
    <Checkbox
      label='Loading'
      checked={state.loading}
      onChange={() => toggleState('loading')}
    />,
    <label>
      Total pages: <NumberInput
        value={state.totalPagesString}
        size={2}
        min={1}
        max={9999}
        step={1}
        onChange={e => {
          const totalPages = e.target.valueAsNumber;
          const partialState = {
            totalPagesString: e.target.value,
            totalPages: !Number.isNaN(totalPages) ? totalPages : state.totalPages,
          };
          setState(partialState);
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
          const context = e.target.valueAsNumber;
          const partialState = {
            contextString: e.target.value,
            context: !Number.isNaN(context) ? context : state.context,
          };
          setState(partialState);
        }}
      />
    </label>,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({disabled, loading, page, totalPages, context}, setState) =>
    <Pages
      disabled={disabled}
      loading={loading}
      page={page}
      totalPages={totalPages}
      context={context}
      onChange={newPage => setState({page: newPage})}
    />,
};

export default demo;
