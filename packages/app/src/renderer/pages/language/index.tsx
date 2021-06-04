import {Link} from '../../ui';
import {LanguagePage as LanguageTarget, PartOfSpeechPage} from '../../pages';

// FIXME: Remove when we can GraphQL
import {LanguageId, Languages, PartsOfSpeech} from '../../sample-data';

export type Props = {
  id: LanguageId;
};

const LanguagePage = (props: Props): JSX.Element => {
  const {id} = props;

  const lang = Languages[id];
  const partsOfSpeech =
    Object.values(PartsOfSpeech)
      .filter(pos => pos.language.id === lang.id)
      .sort((a, b) => a.name.localeCompare(b.name));

  const langPage = LanguageTarget(lang.id, lang.name);

  return <>
    <p>This is the page for language {id}.</p>
    <p>Parts of speech in this language:</p>
    <ul>
      {partsOfSpeech.map(pos =>
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
