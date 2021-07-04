import React, {useImperativeHandle} from 'react';
import LanguageIcon from 'mdi-react/TranslateIcon';

import {Section, SectionComponent} from './types';

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  return (
    <p>This section is not yet implemented</p>
  );
});

Content.displayName = 'LanguageSection';

const LanguageSection: Section = {
  key: 'language',
  icon: <LanguageIcon/>,
  content: Content,
};

export default LanguageSection;
