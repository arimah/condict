import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {FlowContent} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {FieldData, FieldForm} from '../forms';
import {useData, useExecute} from '../data';
import {
  FieldId,
  FieldValueType,
  LanguageId,
} from '../graphql';

import renderFormData from './render-form-data';
import {AddFieldQuery, AddFieldMut} from './query';

export interface NewField {
  id: FieldId;
  name: string;
  nameAbbr: string;
  valueType: FieldValueType;
  language: {
    id: LanguageId;
    name: string;
  };
}

type Props = {
  languageId: LanguageId;
} & PanelProps<NewField | null>;

const AddFieldPanel = (props: Props): JSX.Element => {
  const {languageId, updatePanel, titleId, onResolve} = props;

  const execute = useExecute();

  const data = useData(AddFieldQuery, {lang: languageId});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: FieldData) => {
    setSubmitError(false);

    const res = await execute(AddFieldMut, {
      data: {
        languageId,
        name: formData.name,
        nameAbbr: formData.nameAbbr,
        partOfSpeechIds: formData.partOfSpeechIds ?? [],
        valueType: formData.valueType,
        listValues: formData.listValues,
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not add field:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have a field.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onResolve(res.data!.addField);
  }, [onResolve]);

  const handleCancel = () => onResolve(null);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='language-add-field-title'/>
      </h1>
      {renderFormData(data, handleCancel, ({language}) =>
        <FieldForm
          languageId={languageId}
          initialPartsOfSpeech={language?.partsOfSpeech ?? []}
          submitError={submitError && <Localized id='field-save-error'/>}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          onDirtyChange={dirty => updatePanel({dirty})}
        />
      )}
    </FlowContent>
  );
};

export const addFieldPanel = (ids: {
  languageId: LanguageId;
}): PanelParams<NewField | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddFieldPanel {...props} {...ids}/>,
});
