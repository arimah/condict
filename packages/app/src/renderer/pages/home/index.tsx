import {Fragment, useState} from 'react';

import {Button} from '@condict/ui';

import {Link} from '../../ui';
import {useData} from '../../data';
import {LanguagePage, PartOfSpeechPage} from '../../pages';
import {PanelProps, PanelParams, useOpenPanel} from '../../navigation';
import {useOpenDialog} from '../../dialog-stack';
import {YesNo, OKCancel, messageBox} from '../../dialogs';

import HomeQuery from './query';
// import * as S from './styles';

type TestResponse = 'yes' | 'no' | 'cancel';

const TestPanel = (props: PanelProps<TestResponse>): JSX.Element => {
  const {onResolve} = props;

  const [childResponse, setChildResponse] = useState<TestResponse | null>(null);

  const openPanel = useOpenPanel();

  return <>
    <p>Hello, I am a test panel!</p>
    <p>I contain a small amount of mostly meaningless content, including this long paragraph:</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>There are three possible responses:</p>
    <p>
      <Button
        label='Yes'
        intent='accent'
        bold
        onClick={() => onResolve('yes')}
      />
      {' '}
      <Button label='No' onClick={() => onResolve('no')}/>
      {' '}
      <Button
        label='Cancel'
        intent='danger'
        onClick={() => onResolve('cancel')}
      />
    </p>
    <hr/>
    <p>
      {'For the adventurous: '}
      <Button
        label='Open a nested panel'
        slim
        onClick={() => openPanel(TestPanelParams).then(setChildResponse)}
      />
    </p>
    {childResponse && <p>Nested panel response: {childResponse}</p>}
  </>;
};

const TestPanelParams: PanelParams<TestResponse> = {
  initialTitle: 'Testing things',
  // eslint-disable-next-line react/display-name
  render: props => <TestPanel {...props}/>,
};

const HomePage = (): JSX.Element => {
  const data = useData(HomeQuery, null);

  const openPanel = useOpenPanel();
  const openDialog = useOpenDialog();

  const [panelResponse, setPanelResponse] = useState<TestResponse | null>(null);
  const [dialogResponse, setDialogResponse] = useState<boolean | null>(null);

  const languages = data.state === 'data'
    ? data.result.data?.languages
    : undefined;

  return <>
    <p>This is the content of the home page.</p>
    <ul>
      {languages?.map(lang => {
        const langPage = LanguagePage(lang.id, lang.name);
        return (
          <li key={lang.id}>
            Language: <Link to={langPage}>{lang.name}</Link>
            {' - '}
            {lang.partsOfSpeech.map((pos, i) =>
              <Fragment key={pos.id}>
                {i > 0 && ', '}
                <Link to={PartOfSpeechPage(pos.id, pos.name, langPage)}>
                  {pos.name}
                </Link>
              </Fragment>
            )}
          </li>
        );
      })}
    </ul>
    <hr/>
    <p>
      <Button
        label='Open a test panel'
        bold
        onClick={() => openPanel(TestPanelParams).then(setPanelResponse)}
      />
    </p>
    {panelResponse && <p>Test panel response: {panelResponse}</p>}
    <hr/>
    <p>
      <Button
        label='Open a Yes/No dialog'
        bold
        onClick={() => {
          void openDialog(messageBox({
            titleKey: 'test-dialog-title',
            message: <>
              <p>The primary response is true. The secondary response is false.</p>
              <p>Choose wisely.</p>
            </>,
            buttons: YesNo,
          })).then(setDialogResponse);
        }}
      />
      {' '}
      <Button
        label='Open an OK/Cancel dialog'
        bold
        onClick={() => {
          void openDialog(messageBox({
            titleKey: 'test-dialog-title',
            message: <>
              <p>This dialog can be dismissed by pressing <kbd>Escape</kbd>, which is equivalent to clicking the Cancel button.</p>
            </>,
            buttons: OKCancel,
          })).then(setDialogResponse);
        }}
      />
    </p>
    {dialogResponse !== null && <p>Last dialog response: {String(dialogResponse)}</p>}
  </>;
};

export default HomePage;
