import {Button, Spinner} from '@condict/ui';

import {Link} from '../../ui';
import {LanguagePage, PartOfSpeechPage as PartOfSpeechTarget} from '../../pages';
import {useUpdateTab} from '../../navigation';
import {PartOfSpeechId} from '../../graphql-shared';
import {useData} from '../../data';

import PartOfSpeechQuery from './query';

export type Props = {
  id: PartOfSpeechId;
};

const PartOfSpeechPage = (props: Props): JSX.Element => {
  const {id} = props;

  const data = useData(PartOfSpeechQuery, {id});

  const updateTab = useUpdateTab();

  if (data.state === 'loading') {
    // TODO: Better loading screen
    // TODO: l10n
    return <p><Spinner/> Loading...</p>;
  }

  const pos = data.result.data?.partOfSpeech;
  if (!pos) {
    // TODO: Better error screen
    // TODO: l10n
    return <p>Part of speech not found.</p>;
  }

  const lang = pos.language;
  const otherPosInLanguage = lang.partsOfSpeech.filter(p => p.id !== id);

  const langPage = LanguagePage(lang.id, lang.name);

  return <>
    <p>This is the page for part of speech {pos.name} (ID: {id}).</p>
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
    <hr/>
    <p>
      <Button
        label='Mark tab as dirty'
        bold
        onClick={() => updateTab({dirty: true})}
      />
      {' '}
      <Button
        label='Mark tab as not dirty'
        bold
        onClick={() => updateTab({dirty: false})}
      />
    </p>
  </>;
};

export default PartOfSpeechPage;
