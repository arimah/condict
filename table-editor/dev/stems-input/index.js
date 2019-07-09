import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Map} from 'immutable';

import genId from '@condict/gen-id';

import * as S from './styles';

const StemsInput = props => {
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

StemsInput.propTypes = {
  value: PropTypes.instanceOf(Map).isRequired,
  stemNames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StemsInput;
