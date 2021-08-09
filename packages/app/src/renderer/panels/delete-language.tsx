import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {BodyText} from '@condict/ui';

import {FlowContent, DeleteFormButtons} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {LanguageId} from '../graphql';
import {useExecute} from '../data';

import {DeleteLanguageMut} from './query';

type Props = {
  id: LanguageId;
  stats: LanguageStats;
} & PanelProps<boolean>;

interface LanguageStats {
  lemmaCount: number;
  definitionCount: number;
  partOfSpeechCount: number;
}

const DeleteLanguagePanel = (props: Props): JSX.Element => {
  const {id, stats, titleId, onResolve} = props;

  const execute = useExecute();

  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = useCallback(() => {
    setDeleting(true);

    void execute(DeleteLanguageMut, {id}).then(res => {
      setDeleting(false);

      if (res.errors) {
        setError(true);
        console.log('Could not delete language:', res.errors);
      } else {
        onResolve(true);
      }
    });
  }, [execute, id, onResolve]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='language-delete-title'/>
      </h1>
      <BodyText>
        <p>
          <Localized
            id='language-delete-warning'
            elems={{bold: <strong/>}}
          >
            <></>
          </Localized>
        </p>
        <p>
          <Localized id='language-delete-stats-intro'/>
        </p>
        <ul>
          <Localized
            id='language-delete-stats-list'
            vars={{...stats}}
            elems={{'list-item': <li/>}}
          >
            <></>
          </Localized>
        </ul>
        <p>
          <Localized id='language-delete-confirm'/>
        </p>
      </BodyText>
      <DeleteFormButtons
        deleteLabel={<Localized id='language-delete-button'/>}
        deleteError={error && <Localized id='language-delete-error'/>}
        isDeleting={deleting}
        onDelete={handleConfirm}
        onCancel={() => onResolve(false)}
      />
    </FlowContent>
  );
};

export const deleteLanguagePanel = (
  id: LanguageId,
  stats: LanguageStats
): PanelParams<boolean> => ({
  // eslint-disable-next-line react/display-name
  render: props => <DeleteLanguagePanel id={id} stats={stats} {...props}/>,
});
