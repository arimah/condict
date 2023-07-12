/* eslint-disable react/jsx-key */
import styled from 'styled-components';

import {FieldInput, Checkbox, Select, SelectOption} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

interface FieldValue {
  readonly id: number;
  readonly name: string;
}

const AllValues: FieldValue[] = [
  {id: 1, name: 'African daisy'},
  {id: 2, name: 'Amaryllis'},
  {id: 3, name: 'Anemone'},
  {id: 4, name: 'Aster'},
  {id: 5, name: 'Begonia'},
  {id: 6, name: 'Carnation'},
  {id: 7, name: 'Chrysanthemum'},
  {id: 8, name: 'Daffodil'},
  {id: 9, name: 'Dahlia'},
  {id: 10, name: 'Daisy'},
  {id: 11, name: 'Elderflower'},
  {id: 12, name: 'Gladiolus'},
  {id: 13, name: 'Hibiscus'},
  {id: 14, name: 'Hyacinth'},
  {id: 15, name: 'Hydrangea'},
  {id: 16, name: 'Iris'},
  {id: 17, name: 'Lavender'},
  {id: 18, name: 'Lily'},
  {id: 19, name: 'Lily-of-the-Valley'},
  {id: 20, name: 'Lotus'},
  {id: 21, name: 'Marigold'},
  {id: 22, name: 'Orchid'},
  {id: 23, name: 'Peony'},
  {id: 24, name: 'Rose'},
  {id: 25, name: 'Sunflower'},
  {id: 26, name: 'Tulip'},
  {id: 27, name: 'Viburnum'},
  {id: 28, name: 'Ylang-ylang'},
];

type State = {
  disabled: boolean;
  minimal: boolean;
  mode: 'single' | 'multi';
  value: FieldValue[];
  valueMode: ValueMode;
};

type ValueMode = 'known' | 'search' | 'empty';

const InitialState: State = {
  disabled: false,
  minimal: false,
  mode: 'multi',
  value: [
    {id: 4, name: 'Aster'},
    {id: 20, name: 'Lotus'},
    {id: 25, name: 'Sunflower'},
  ],
  valueMode: 'known',
};

const ModeOptions: readonly SelectOption<'single' | 'multi'>[] = [
  {value: 'single', name: 'single'},
  {value: 'multi', name: 'multi'},
];

const ValueModeOptions: readonly SelectOption<ValueMode>[] = [
  {value: 'known', name: 'knownValues'},
  {value: 'search', name: 'onSearch'},
  {value: 'empty', name: 'empty'},
];

const StorageKey = 'condict/ui/field-input';

// Need to cast to get type inference working
const FieldInputWithWidth = styled(FieldInput)`
  width: 400px;
` as typeof FieldInput;

const getKey = (value: FieldValue) => value.id;

const getName = (value: FieldValue) => value.name;

const search = (query: string): FieldValue[] => {
  // Copy-pasted from FieldInput's default onSearch, with minor adjustments
  const filterRegex = new RegExp(
    '\\b' + query.replace(
      /([.*+?^${}()|[\]\\])|\s+/gu,
      (_m, metaChar) => metaChar ? `\\${metaChar}` : '\\s+'
    ),
    'iu'
  );
  return AllValues.filter(val => filterRegex.test(val.name));
};

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {disabled, minimal, mode, value, valueMode} = state;
  return (
    <Demo
      name='FieldInput'
      controls={[
        <label>
          Mode: <Select
            value={mode}
            options={ModeOptions}
            onChange={mode => set('mode', mode)}
          />
        </label>,
        <label>
          Values: <Select
            value={valueMode}
            options={ValueModeOptions}
            onChange={valueMode => set('valueMode', valueMode)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          onChange={e => set('disabled', e.target.checked)}
        >
          Disabled
        </Checkbox>,
        <Checkbox
          checked={minimal}
          onChange={e => set('minimal', e.target.checked)}
        >
          Minimal
        </Checkbox>,
      ]}
      onReset={reset}
    >
      <FieldInputWithWidth
        values={value}
        getKey={getKey}
        getName={getName}
        mode={mode}
        disabled={disabled}
        minimal={minimal}
        knownValues={
          valueMode === 'known' ? AllValues :
          valueMode === 'empty' ? [] :
          undefined
        }
        onSearch={valueMode === 'search' ? search : undefined}
        onChange={value => set('value', value)}
      />
    </Demo>
  );
};

export default Main;
