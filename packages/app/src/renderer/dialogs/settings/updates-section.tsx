import React, {useImperativeHandle} from 'react';
import UpdatesIcon from 'mdi-react/CloudDownloadIcon';

import {Section, SectionComponent} from './types';

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  return (
    <p>This section is not yet implemented</p>
  );
});

Content.displayName = 'UpdatesSection';

const UpdatesSection: Section = {
  key: 'updates',
  icon: <UpdatesIcon/>,
  content: Content,
};

export default UpdatesSection;
