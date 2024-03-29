// TODO: Find better icons or create our own. Many of these are pretty arbitrary
// and probably don't fit the resource type very well.
import LanguageIcon from 'mdi-react/BookOpenPageVariantOutlineIcon';
import LemmaIcon from 'mdi-react/CardMultipleOutlineIcon';
import DefinitionIcon from 'mdi-react/CardBulletedOutlineIcon';
import PartOfSpeechIcon from 'mdi-react/ShapeOutlineIcon';
import InflectionTableIcon from 'mdi-react/TableIcon';
import TagIcon from 'mdi-react/PoundIcon';

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
  const {type, className = ''} = props;
  switch (type) {
    case 'language':
      return <LanguageIcon className={`rtl-mirror ${className}`}/>;
    case 'lemma':
      return <LemmaIcon className={`rtl-mirror ${className}`}/>;
    case 'definition':
      return <DefinitionIcon className={`rtl-mirror ${className}`}/>;
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
