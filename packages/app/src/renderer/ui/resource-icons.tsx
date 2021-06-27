// TODO: Find better icons or create our own. Many of these are pretty arbitrary
// and probably don't fit the resource type very well.
import LanguageIcon from 'mdi-react/BookOpenPageVariantOutlineIcon';
import LemmaIcon from 'mdi-react/TextBoxMultipleOutlineIcon';
import DefinitionIcon from 'mdi-react/CardBulletedOutlineIcon';
import PartOfSpeechIcon from 'mdi-react/SelectGroupIcon';
import InflectionTableIcon from 'mdi-react/TableLargeIcon';
import TagIcon from 'mdi-react/TagTextOutlineIcon';

// TODO: Expand with more as necessary
export type ResourceType =
  | 'language'
  | 'lemma'
  | 'definition'
  | 'partOfSpeech'
  | 'inflectionTable'
  | 'tag';

export type ResourceIconProps = {
  type: ResourceType;
  className?: string;
};

export const ResourceIcon = (props: ResourceIconProps): JSX.Element => {
  const {type, className} = props;
  switch (type) {
    case 'language':
      return <LanguageIcon className={className}/>;
    case 'lemma':
      return <LemmaIcon className={className}/>;
    case 'definition':
      return <DefinitionIcon className={className}/>;
    case 'partOfSpeech':
      return <PartOfSpeechIcon className={className}/>;
    case 'inflectionTable':
      return <InflectionTableIcon className={className}/>;
    case 'tag':
      return <TagIcon className={className}/>;
  }
};

export {
  LanguageIcon,
  LemmaIcon,
  DefinitionIcon,
  PartOfSpeechIcon,
  InflectionTableIcon,
  TagIcon,
};
