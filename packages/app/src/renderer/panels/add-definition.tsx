import {useState, useMemo, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {
  descriptionToGraphQLInput,
  tableCaptionToGraphQLInput,
} from '@condict/rich-text-editor';

import {DataViewer, FlowContent, MainHeader, BlockFields} from '../ui';
import {DefinitionTableValue} from '../form-fields';
import {PanelParams, PanelProps, useOpenPanel} from '../navigation';
import {DefinitionData, DefinitionForm} from '../forms';
import {DefinitionId, LanguageId, PartOfSpeechId} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import {addPartOfSpeechPanel} from './add-part-of-speech';
import {addInflectionTablePanel} from './add-inflection-table';
import {hasTableCaption} from './utils';
import {AddDefinitionQuery, AddDefinitionMut} from './query';

export interface NewDefinition {
  id: DefinitionId;
  term: string;
  description: BlockFields[];
  language: {
    id: LanguageId;
    name: string;
  };
}

type Props = {
  languageId: LanguageId;
} & PanelProps<NewDefinition | null>;

const AddDefinitionPanel = (props: Props): JSX.Element => {
  const {
    languageId,
    updatePanel,
    titleId,
    panelRef,
    entering,
    onResolve,
  } = props;

  const execute = useExecute();

  const data = useData(AddDefinitionQuery, {lang: languageId});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: DefinitionData) => {
    setSubmitError(false);

    if (formData.partOfSpeech === null) {
      throw new Error(`Unexpected partOfSpeech: ${formData.partOfSpeech}`);
    }

    const res = await execute(AddDefinitionMut, {
      data: {
        languageId,
        term: formData.term,
        description: descriptionToGraphQLInput(formData.description),
        partOfSpeechId: formData.partOfSpeech,
        inflectionTables: formData.inflectionTables.map(table => ({
          inflectionTableId: table.tableId,
          customForms: DefinitionTableValue.exportCustomForms(table.table),
          caption: hasTableCaption(table.caption)
            ? tableCaptionToGraphQLInput(table.caption)
            : null,
        })),
        stems: [...formData.stems].map(([name, value]) => ({
          name,
          value,
        })),
        tags: formData.tags,
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not add definition:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have a definition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onResolve(res.data!.addDefinition);
  }, [languageId, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const initialPartsOfSpeech = useMemo(() => {
    if (data.state === 'loading' || !data.result.data?.language) {
      return [];
    }
    return data.result.data.language.partsOfSpeech;
  }, [data]);

  const openPanel = useOpenPanel();

  const createPartOfSpeech = useCallback(() => {
    return openPanel(addPartOfSpeechPanel(languageId));
  }, [languageId, openPanel]);

  const createInflectionTable = useCallback((
    partOfSpeechId: PartOfSpeechId
  ) => {
    return openPanel(addInflectionTablePanel({
      languageId,
      partOfSpeechId,
    }));
  }, [languageId, openPanel]);

  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='language-define-word-title'/>
        </h1>
      </MainHeader>
      <DataViewer
        result={data}
        render={() =>
          <DefinitionForm
            languageId={languageId}
            initialPartsOfSpeech={initialPartsOfSpeech}
            submitError={
              submitError && <Localized id='inflection-table-save-error'/>
            }
            firstFieldRef={firstFieldRef}
            onSubmit={onSubmit}
            onCancel={() => onResolve(null)}
            onDirtyChange={dirty => updatePanel({dirty})}
            onCreatePartOfSpeech={createPartOfSpeech}
            onCreateInflectionTable={createInflectionTable}
          />
        }
      />
    </FlowContent>
  );
};

export const addDefinitionPanel = (
  languageId: LanguageId
): PanelParams<NewDefinition | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddDefinitionPanel {...props} languageId={languageId}/>,
});
