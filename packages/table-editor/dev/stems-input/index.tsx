import React, {useState} from 'react';
import {Map} from 'immutable';

import genId from '@condict/gen-id';

import * as S from './styles';

export type Props = {
  value: Map<string, string>;
  stemNames: string[];
  onChange: (newValue: Map<string, string>) => void;
};

const StemsInput = (props: Props) => {
  const {value, stemNames, onChange} = props;

  const [id] = useState(genId);

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
                value={value.get(name, '')}
                onChange={e => onChange(value.set(name, e.target.value))}
              />
            </label>
          </S.Item>
        )}
      </S.List>
    </div>
  );
};

export default StemsInput;
