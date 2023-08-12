import {useCallback} from 'react';
import {Localized} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button} from '@condict/ui';

import {
  FlowContent,
  MainHeader,
  CardList,
  FieldCard,
} from '../ui';
import {PanelParams, PanelProps, useOpenPanel} from '../navigation';
import {FieldId, LanguageId} from '../graphql';
import {useLiveData} from '../data';

import renderFormData from './render-form-data';
import {AllFieldsQuery} from './query';
import {addFieldPanel} from './add-field';
import {editFieldPanel} from './edit-field';

type Props = {
  languageId: LanguageId;
} & PanelProps<void>;

const ManageCustomFieldsPanel = (props: Props): JSX.Element => {
  const {languageId, titleId, onResolve} = props;

  const data = useLiveData(
    AllFieldsQuery,
    {languageId},
    event =>
      (
        event.type === 'field' ||
        event.type === 'definitionField'
      ) && event.languageId === languageId ||
      event.type === 'language' &&
        event.action === 'delete' &&
        event.id === languageId
  );

  const openPanel = useOpenPanel();

  const handleAddField = useCallback(() => {
    void openPanel(addFieldPanel({languageId}));
  }, [openPanel]);

  const handleEditField = useCallback((id: FieldId) => {
    void openPanel(editFieldPanel(id));
  }, [openPanel]);

  // TODO: More onboarding?
  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='language-manage-fields-title'/>
        </h1>
        <Button onClick={() => onResolve()}>
          <Localized id='generic-close-button'/>
        </Button>
      </MainHeader>
      {renderFormData(data, onResolve, ({language}) =>
        language ? <>
          {language.fields.length > 0 ? (
            <CardList>
              {language.fields.map(field =>
                <FieldCard
                  key={field.id}
                  field={field}
                  onClick={handleEditField}
                />
              )}
            </CardList>
          ) : (
            <p>
              <Localized id='language-no-fields'/>
            </p>
          )}
          <Button
            intent={language.fields.length === 0 ? 'accent' : 'general'}
            onClick={handleAddField}
          >
            <AddIcon/>
            <span><Localized id='language-add-field-button'/></span>
          </Button>
        </> : <>
          <p>
            <Localized id='language-not-found-error'/>
          </p>
          <p>
            <Button onClick={() => onResolve()}>
              <Localized id='generic-form-cancel'/>
            </Button>
          </p>
        </>
      )}
    </FlowContent>
  );
};

export const manageCustomFieldsPanel = (
  languageId: LanguageId
): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props =>
    <ManageCustomFieldsPanel {...props} languageId={languageId}/>,
});
