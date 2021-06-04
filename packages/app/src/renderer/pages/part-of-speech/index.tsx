import {Link} from '../../ui';
import {LanguagePage, PartOfSpeechPage as PartOfSpeechTarget} from '../../pages';

// FIXME: Remove when we can GraphQL
import {PartOfSpeechId, PartsOfSpeech} from '../../sample-data';

export type Props = {
  id: PartOfSpeechId;
};

const PartOfSpeechPage = (props: Props): JSX.Element => {
  const {id} = props;

  const pos = PartsOfSpeech[id];
  const lang = pos.language;

  const otherPosInLanguage =
    Object.values(PartsOfSpeech)
      .filter(p => p.language.id === lang.id && p.id !== pos.id)
      .sort((a, b) => a.name.localeCompare(b.name));

  const langPage = LanguagePage(lang.id, lang.name);

  return <>
    <p>This is the page for part of speech {id}.</p>
    <p>Other parts of speech in the language <Link to={langPage}>{lang.name}</Link>:</p>
    <ul>
      {otherPosInLanguage.map(pos =>
        <li key={pos.id}>
          <Link to={PartOfSpeechTarget(pos.id, pos.name, langPage)}>
            {pos.name}
          </Link>
        </li>
      )}
    </ul>
  </>;
};

export default PartOfSpeechPage;
