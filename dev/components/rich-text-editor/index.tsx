import React, {useState} from 'react';

import {Switch, useUniqueId} from '@condict/ui';
import {
  DescriptionEditor,
  TableCaptionEditor,
  BlockElement,
} from '@condict/rich-text-editor';

import searchDictionary from './search';
import InitialDescription from './initial-description.json';
import InitialTableCaption from './initial-table-caption.json';

const Main = (): JSX.Element => {
  const id = useUniqueId();

  const [descriptionValue, setDescriptionValue] = useState(
    InitialDescription as BlockElement[]
  );
  const [descriptionToolbar, setDescriptionToolbar] = useState(true);

  const [captionValue, setCaptionValue] = useState(
    InitialTableCaption as BlockElement[]
  );
  const [captionToolbar, setCaptionToolbar] = useState(false);

  return <>
    <h2>Rich-text editor</h2>

    <section aria-labelledby={`${id}-description`}>
      <h3 id={`${id}-description`}>Description editor</h3>

      <p>
        <Switch
          checked={descriptionToolbar}
          onChange={e => setDescriptionToolbar(e.target.checked)}
        >
          Toolbar always visible
        </Switch>
      </p>

      <DescriptionEditor
        value={descriptionValue}
        toolbarAlwaysVisible={descriptionToolbar}
        onChange={setDescriptionValue}
        onFindLinkTarget={searchDictionary}
      />
    </section>

    <section aria-labelledby={`${id}-caption`}>
      <h3 id={`${id}-caption`}>Table caption editor</h3>

      <p>
        <Switch
          checked={captionToolbar}
          onChange={e => setCaptionToolbar(e.target.checked)}
        >
          Toolbar always visible
        </Switch>
      </p>

      <TableCaptionEditor
        value={captionValue}
        toolbarAlwaysVisible={captionToolbar}
        onChange={setCaptionValue}
      />
    </section>
  </>;
};

export default Main;
