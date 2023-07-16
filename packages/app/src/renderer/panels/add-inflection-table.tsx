import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {InflectionTable, InflectionTableJson} from '@condict/table-editor';

import {FlowContent} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {InflectionTableData, InflectionTableForm} from '../forms';
import {useExecute} from '../data';
import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectionTableRowInput,
  LanguageId,
} from '../graphql';

import {AddInflectionTableMut} from './query';

export interface NewInflectionTable {
  id: InflectionTableId;
  name: string;
  layout: {
    id: InflectionTableLayoutId;
    stems: string[];
    rows: InflectionTableJson;
  };
  language: {
    id: LanguageId;
    name: string;
  };
}

type Props = {
  languageId: LanguageId;
} & PanelProps<NewInflectionTable | null>;

const AddInflectionTablePanel = (props: Props) => {
  const {languageId, updatePanel, titleId, onResolve} = props;

  const execute = useExecute();

  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: InflectionTableData) => {
    setSubmitError(false);

    const res = await execute(AddInflectionTableMut, {
      data: {
        languageId,
        name: formData.name,
        layout:
          InflectionTable.export(formData.layout) as
            InflectionTableRowInput[],
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not add inflection table:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an inflection table.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onResolve(res.data!.addInflectionTable);
  }, [onResolve]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='part-of-speech-add-table-title'/>
      </h1>
      <InflectionTableForm
        languageId={languageId}
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
}): PanelParams<NewInflectionTable | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddInflectionTablePanel {...props} {...ids}/>,
});
