import React from 'react';
import {Localized, useLocalization} from '@fluent/react';
import DefaultStemIcon from 'mdi-react/LinkBoxVariantOutlineIcon';
import CustomStemIcon from 'mdi-react/PencilBoxIcon';

import {SROnly, useUniqueId} from '@condict/ui';

import {useNearestForm, useField, useFormValue, useFormState} from '../../form';
import {Field, Label} from '../../form-fields';

import useActiveStemNames from './active-stem-names';
import {PartOfSpeechFields} from './types';
import * as S from './styles';

export type Props = {
  partsOfSpeech: readonly PartOfSpeechFields[];
};

const StemsField = React.memo((props: Props): JSX.Element => {
  const {partsOfSpeech} = props;

  const form = useNearestForm();

  const id = useUniqueId();

  const {isSubmitting} = useFormState(form);
  const field = useField<Map<string, string>>(form, 'stems');

  const term = useFormValue<string>(form, 'term');
  const activeStems = useActiveStemNames(form, partsOfSpeech);

  const handleStemChange = (name: string, value: string | undefined) => {
    field.update(draft => {
      if (value != null) {
        draft.set(name, value);
      } else {
        draft.delete(name);
      }
    });
  };

  const stems = field.value;

  return (
    <Field>
      <Label as='span' id={`${id}-label`}>
        <Localized id='definition-stems-label'/>
      </Label>
      <S.StemsList
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
      >
        {activeStems.map(name =>
          <Stem
            key={name}
            name={name}
            value={stems.get(name)}
            term={term}
            readOnly={isSubmitting}
            onChange={handleStemChange}
          />
        )}
      </S.StemsList>
      <S.ListTools id={`${id}-desc`}>
        <Localized id='definition-stems-description'/>
      </S.ListTools>
    </Field>
  );
});

StemsField.displayName = 'StemsField';

export default StemsField;

type StemProps = {
  name: string;
  value: string | undefined;
  term: string;
  readOnly: boolean;
  onChange: (name: string, value: string | undefined) => void;
};

const Stem = React.memo((props: StemProps): JSX.Element => {
  const {name, value, term, readOnly, onChange} = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();
  const usesTerm = value == null;

  return <>
    <S.StemName htmlFor={`${id}-name`}>
      {name}
    </S.StemName>
    <S.StemValue
      id={`${id}-name`}
      value={value ?? term}
      readOnly={readOnly}
      usesTerm={usesTerm}
      aria-describedby={`${id}-status`}
      onChange={e => onChange(name, e.target.value)}
    />
    <S.StemStatus>
      <SROnly id={`${id}-status`}>
        <Localized
          id={
            usesTerm
              ? 'definition-stem-same-as-term-status'
              : 'definition-stem-custom-status'
          }
        />
      </SROnly>
      <S.StemAction
        label={l10n.getString('definition-stem-source-label')}
        aria-pressed={usesTerm}
        usesTerm={usesTerm}
        title={l10n.getString(
          usesTerm
            ? 'definition-stem-same-as-term-tooltip'
            : 'definition-stem-custom-tooltip'
        )}
        onClick={() => onChange(name, usesTerm ? term : undefined)}
      >
        {value != null ? <CustomStemIcon/> : <DefaultStemIcon/>}
      </S.StemAction>
    </S.StemStatus>
  </>;
});

Stem.displayName = 'Stem';
