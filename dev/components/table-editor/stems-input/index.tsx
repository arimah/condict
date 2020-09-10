import React from 'react';
import produce from 'immer';

import {useUniqueId} from '@condict/ui';

import * as S from './styles';

export type Props = {
  value: ReadonlyMap<string, string>;
  stemNames: readonly string[];
  term: string;
  onChange: (newValue: ReadonlyMap<string, string>) => void;
};

const StemsInput = (props: Props): JSX.Element => {
  const {value, stemNames, term, onChange} = props;

  const id = useUniqueId();

  return (
    <div role='group' aria-labelledby={`${id}-desc`}>
      <p id={`${id}-desc`}>Stems:</p>
      <S.List>
        {stemNames.map(name =>
          <S.Item key={name}>
            <label>
              {name}
              {': '}
              <S.ValueInput
                value={value.has(name) ? value.get(name) || '' : term}
                onChange={e => {
                  onChange(produce(value, value => {
                    value.set(name, e.target.value);
                  }));
                }}
              />
            </label>
          </S.Item>
        )}
      </S.List>
    </div>
  );
};

export default StemsInput;
