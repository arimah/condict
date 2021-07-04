import React, {useImperativeHandle} from 'react';
import StorageIcon from 'mdi-react/SdIcon';

import {Section, SectionComponent} from './types';

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  return (
    <p>This section is not yet implemented</p>
  );
});

Content.displayName = 'StorageSection';

const StorageSection: Section = {
  key: 'storage',
  icon: <StorageIcon/>,
  content: Content,
};

export default StorageSection;
