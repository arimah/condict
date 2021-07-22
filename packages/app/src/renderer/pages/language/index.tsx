import {BodyText, Spinner} from '@condict/ui';

import {LanguagePage as LanguageTarget, PartOfSpeechPage} from '../../page';
import {Link, RichContent} from '../../ui';
import {LanguageId} from '../../graphql-shared';
import {useData} from '../../data';

import LanguageQuery from './query';

export type Props = {
  id: LanguageId;
};

const LanguagePage = (props: Props): JSX.Element => {
  const {id} = props;

  const data = useData(LanguageQuery, {id});

  if (data.state === 'loading') {
    // TODO: Better loading screen
    // TODO: l10n
    return <p><Spinner/> Loading...</p>;
  }

  const lang = data.result.data?.language;
  if (!lang) {
    // TODO: Better error screen
    // TODO: l10n
    return <p>Language not found.</p>;
  }

  const langPage = LanguageTarget(id, lang.name);

  return <>
    <p>This is the page for language {lang.name} (ID: {id}).</p>
    <BodyText>
      <RichContent value={lang.description}/>
    </BodyText>
    <p>Parts of speech in this language:</p>
    <ul>
      {lang.partsOfSpeech.map(pos =>
        <li key={pos.id}>
          <Link to={PartOfSpeechPage(pos.id, pos.name, langPage)}>
            {pos.name}
          </Link>
        </li>
      )}
    </ul>
  </>;
};

export default LanguagePage;
