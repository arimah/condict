import React from 'react';
import {useController, useWatch} from 'react-hook-form';
import {Localized, useLocalization} from '@fluent/react';
import produce from 'immer';
import DefaultStemIcon from 'mdi-react/LinkBoxVariantOutlineIcon';
import CustomStemIcon from 'mdi-react/PencilBoxIcon';

import {SROnly, useUniqueId} from '@condict/ui';

import {Field, Label} from '../../form-fields';

import useActiveStemNames from './active-stem-names';
import {Stems, PartOfSpeechFields} from './types';
import * as S from './styles';

export type Props = {
  partsOfSpeech: readonly PartOfSpeechFields[];
};

const StemsField = React.memo((props: Props): JSX.Element => {
  const {partsOfSpeech} = props;

  const {field, formState} = useController({name: 'stems'});
  const {onChange, onBlur} = field;
  const {isSubmitting} = formState;
  const stems = field.value as Stems;

  const term = useWatch({name: 'term'}) as string;
  const activeStems = useActiveStemNames(partsOfSpeech);

  const handleStemChange = (name: string, value: string | undefined) => {
    onChange(produce(stems, draft => {
      if (value != null) {
        draft.map.set(name, value);
      } else {
        draft.map.delete(name);
      }
    }));
  };

  const id = useUniqueId();

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
            value={stems.map.get(name)}
            term={term}
            readOnly={isSubmitting}
            onChange={handleStemChange}
            onBlur={onBlur}
          />
        )}
      </S.StemsList>
      <S.ListTools id={`${id}-desc`}>
        <Localized id='definition-stems-description'/>
      </S.ListTools>
    </Field>
  );
});

export default StemsField;

type StemProps = {
  name: string;
  value: string | undefined;
  term: string;
  readOnly: boolean;
  onChange: (name: string, value: string | undefined) => void;
  onBlur: () => void;
};

const Stem = React.memo((props: StemProps): JSX.Element => {
  const {name, value, term, readOnly, onChange, onBlur} = props;

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
      onBlur={onBlur}
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
