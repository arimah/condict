import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';
import {Node as SlateNode} from 'slate';

import {
  Switch,
  Checkbox,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
  Intent,
  useUniqueId,
} from '@condict/ui';

import {DescriptionEditor, TableCaptionEditor} from '../src';

import * as S from './styles';
import searchDictionary from './search';
import InitialDescription from './initial-value-multi.json';
import InitialTableCaption from './initial-value-single.json';

type State = {
  darkTheme: boolean;
  descriptionValue: SlateNode[];
  descriptionToolbar: boolean;
  captionValue: SlateNode[];
  captionToolbar: boolean;
};

const App = () => {
  const id = useUniqueId();
  const [darkTheme, setDarkTheme] = useState(false);

  const [descriptionValue, setDescriptionValue] = useState(
    InitialDescription as SlateNode[]
  );
  const [descriptionToolbar, setDescriptionToolbar] = useState(true);

  const [captionValue, setCaptionValue] = useState(
    InitialTableCaption as SlateNode[]
  );
  const [captionToolbar, setCaptionToolbar] = useState(false);

  return (
    <ThemeProvider theme={darkTheme ? DarkTheme : LightTheme}>
      <h1>Rich-text editor</h1>

      <p>
        <Switch
          intent={Intent.SECONDARY}
          checked={darkTheme}
          label='Dark theme'
          onChange={e => setDarkTheme(e.target.checked)}
        />
      </p>

      <section aria-labelledby={`${id}-description`}>
        <h2 id={`${id}-description`}>Description editor</h2>

        <p>
          <Checkbox
            label='Toolbar always visible'
            checked={descriptionToolbar}
            onChange={e => setDescriptionToolbar(e.target.checked)}
          />
        </p>

        <DescriptionEditor
          value={descriptionValue}
          toolbarAlwaysVisible={descriptionToolbar}
          onChange={setDescriptionValue}
          onFindLinkTarget={searchDictionary}
        />
      </section>

      <section aria-labelledby={`${id}-caption`}>
        <h2 id={`${id}-caption`}>Table caption editor</h2>

        <p>
          <Checkbox
            label='Toolbar always visible'
            checked={captionToolbar}
            onChange={e => setCaptionToolbar(e.target.checked)}
          />
        </p>

        <TableCaptionEditor
          value={captionValue}
          toolbarAlwaysVisible={captionToolbar}
          onChange={setCaptionValue}
        />
      </section>

      <S.AppStyles/>
      <ComponentStyles/>
    </ThemeProvider>
  );
};

ReactDOM.render(<App/>, document.getElementById('app-root'));
