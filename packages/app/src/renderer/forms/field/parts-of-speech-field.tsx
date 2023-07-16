import React, {ChangeEvent, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {useUniqueId} from '@condict/ui';

import {useNearestForm, useField} from '../../form';
import {Field, Label, FieldGroup} from '../../form-fields';
import {LanguageId, PartOfSpeechId} from '../../graphql';

import {PartOfSpeechFields, useCurrentPartsOfSpeech} from '../utils';

import {FieldFormState} from './types';
import * as S from './styles';

export type Props = {
  languageId: LanguageId;
  initialPartsOfSpeech: readonly PartOfSpeechFields[];
};

const PartsOfSpeechField = React.memo((props: Props): JSX.Element => {
  const {languageId, initialPartsOfSpeech} = props;

  const form = useNearestForm<FieldFormState>();

  const field = useField<PartOfSpeechId[]>(form, 'partsOfSpeech');

  const {partsOfSpeech} = useCurrentPartsOfSpeech(
    languageId,
    initialPartsOfSpeech,
    partsOfSpeech => {
      const currentIds = partsOfSpeech.map(pos => pos.id);
      if (field.value.some(id => !currentIds.includes(id))) {
        // At least one selected ID has been deleted - we must remove such IDs
        // from the field value.
        field.update(value => value.filter(id => currentIds.includes(id)));
      }
    }
  );

  const handleChangeAll = useCallback(() => {
    if (field.value.length === 0) {
      field.set(partsOfSpeech.map(pos => pos.id));
    } else {
      field.set([]);
    }
  }, [partsOfSpeech]);

  const handleChangePOS = (
    e: ChangeEvent<HTMLInputElement>,
    id: PartOfSpeechId
  ) => {
    const {value} = field;
    if (value.length === 0) {
      // When "All" is selected, the checkbox is shown as implicitly checked
      // and clicking on it selects only that option.
      field.set([id]);
    } else if (e.target.checked) {
      field.update(value => {
        value.push(id);
      });
    } else {
      field.update(value => value.filter(v => v !== id));
    }
  };

  const id = useUniqueId();

  const {value} = field;

  return (
    <Field
      role='group'
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-desc`}
    >
      <Label id={`${id}-label`}>
        <Localized id='field-parts-of-speech-label'/>
      </Label>
      <FieldGroup>
        <S.PartOfSpeechList>
          <S.PartOfSpeechOption
            checked={value.length === 0}
            onChange={handleChangeAll}
          >
            <Localized id='field-parts-of-speech-all-label'/>
          </S.PartOfSpeechOption>
          {partsOfSpeech.map(pos =>
            <S.PartOfSpeechOption
              key={pos.id}
              checked={value.length === 0 || value.includes(pos.id)}
              $implicitlyChecked={value.length === 0}
              onChange={e => handleChangePOS(e, pos.id)}
            >
              {pos.name}
            </S.PartOfSpeechOption>
          )}
        </S.PartOfSpeechList>
        <div id={`${id}-desc`}>
          <Localized id='field-parts-of-speech-description'/>
        </div>
      </FieldGroup>
    </Field>
  );
});

PartsOfSpeechField.displayName = 'PartsOfSpeechField';

export default PartsOfSpeechField;
