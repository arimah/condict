import {useCallback, useEffect} from 'react';
import {Localized, useLocalization} from '@fluent/react';

import {Button, BodyText, useUniqueId} from '@condict/ui';

import {LanguagePage as LanguageTarget} from '../../page';
import {useOpenPanel, useUpdateTab} from '../../navigation';
import {
  DataViewer,
  FlowContent,
  Selectable,
  RichContent,
  hasRichContent,
} from '../../ui';
import {LanguageId} from '../../graphql';
import {EventPredicate, useData} from '../../data';

import LanguageQuery from './query';
import PartOfSpeechList from './part-of-speech-list';
import editLanguagePanel from './edit-language-panel';
import * as S from './styles';

export type Props = {
  id: LanguageId;
};

const LanguagePage = (props: Props): JSX.Element => {
  const {id} = props;

  const shouldReloadPage = useCallback<EventPredicate>(
    event =>
      event.type === 'language' && event.id === id ||
      (
        event.type === 'definition' ||
        event.type === 'definitionTag' ||
        event.type === 'partOfSpeech' ||
        event.type === 'inflectionTable'
      ) && event.languageId === id,
    [id]
  );

  const data = useData(LanguageQuery, {id}, shouldReloadPage);

  const {l10n} = useLocalization();

  const openPanel = useOpenPanel();
  const handleEditLanguage = useCallback(() => {
    void openPanel(editLanguagePanel(id, l10n));
  }, [id, l10n]);

  const updateTab = useUpdateTab();
  const title = data.state === 'data' && data.result.data?.language?.name;
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  const htmlId = useUniqueId();

  return (
    <DataViewer
      result={data}
      render={({language}) => {
        if (!language) {
          // TODO: Better error screen
          // TODO: l10n
          return <p>Language not found.</p>;
        }

        const langPage = LanguageTarget(id, language.name);
        return (
          <FlowContent>
            <S.Header>
              <S.LanguageName>{language.name}</S.LanguageName>
              <Button onClick={handleEditLanguage}>
                <Localized id='generic-edit-button'/>
              </Button>
            </S.Header>

            {hasRichContent(language.description) && <>
              <h2>
                <Localized id='language-about-heading'/>
              </h2>
              <Selectable as={BodyText}>
                <RichContent
                  value={language.description}
                  heading1='h3'
                  heading2='h4'
                />
              </Selectable>
            </>}

            <h2 id={`${htmlId}-pos-title`}>
              <Localized id='language-parts-of-speech-heading'/>
            </h2>
            <PartOfSpeechList
              aria-labelledby={`${htmlId}-pos-title`}
              parent={langPage}
              partsOfSpeech={language.partsOfSpeech}
              onAddPartOfSpeech={() => {/* TODO */}}
            />
          </FlowContent>
        );
      }}
    />
  );
};

export default LanguagePage;
