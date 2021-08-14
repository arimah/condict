import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {FlowContent, InflectionTableValue} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {InflectionTablePage, LanguagePage} from '../page';
import {InflectionTableData, InflectionTableForm} from '../forms';
import {useExecute} from '../data';
import {LanguageId, PartOfSpeechId} from '../graphql';

import {AddInflectionTableMut} from './query';

type Props = {
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
} & PanelProps<InflectionTablePage | null>;

const AddInflectionTablePanel = (props: Props) => {
  const {languageId, partOfSpeechId, updatePanel, titleId, onResolve} = props;

  const execute = useExecute();

  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: InflectionTableData) => {
    setSubmitError(false);

    const res = await execute(AddInflectionTableMut, {
      data: {
        partOfSpeechId,
        name: formData.name,
        layout: InflectionTableValue.toGraphQLInput(formData.layout),
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not add inflection table:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have a part of speech.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const table = res.data!.addInflectionTable!;
    const pos = table.partOfSpeech;
    const lang = LanguagePage(pos.language.id, pos.language.name);
    onResolve(InflectionTablePage(table.id, table.name, lang));
  }, [partOfSpeechId, onResolve]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='part-of-speech-add-table-title'/>
      </h1>
      <InflectionTableForm
        languageId={languageId}
        partOfSpeechId={partOfSpeechId}
        submitError={submitError && <Localized id='inflection-table-save-error'/>}
        onSubmit={onSubmit}
        onCancel={() => onResolve(null)}
        onDirtyChange={dirty => updatePanel({dirty})}
      />
    </FlowContent>
  );
};

export const addInflectionTablePanel = (ids: {
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
}): PanelParams<InflectionTablePage | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddInflectionTablePanel {...props} {...ids}/>,
});
