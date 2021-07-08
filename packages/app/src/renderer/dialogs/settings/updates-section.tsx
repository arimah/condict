import React, {
  Fragment,
  ChangeEvent,
  useCallback,
  useImperativeHandle,
} from 'react';
import {Localized} from '@fluent/react';
import UpdatesIcon from 'mdi-react/CloudDownloadIcon';

import {Radio, useUniqueId} from '@condict/ui';

import {UpdatePolicy} from '../../../types';

import {useConfig} from '../../app-contexts';

import UpdateStatus from './update-status';
import {Section, SectionComponent} from './types';
import * as S from './styles';

// FIXME: Change to a more appropriate link once Condict has a website
const PrivacyPolicyUrl = 'https://github.com/arimah/condict';

const UpdateOptions: readonly UpdatePolicy[] = [
  'download',
  'check',
  'manual',
];

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  const {config, updateConfig} = useConfig();

  const id = useUniqueId();

  const handleChangePolicy = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextPolicy = e.target.value as UpdatePolicy;
    updateConfig(config => {
      config.updates = nextPolicy;
    });
  }, [updateConfig]);

  return <>
    <Localized
      id='settings-updates-about'
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      elems={{'privacy-link': <a href={PrivacyPolicyUrl}/>}}
    >
      <S.IntroText/>
    </Localized>

    <S.OptionList>
      {UpdateOptions.map(key =>
        <Fragment key={key}>
          <Radio
            name={`${id}-updates`}
            value={key}
            checked={key === config.updates}
            aria-describedby={`${id}-${key}-desc`}
            onChange={handleChangePolicy}
          >
            <Localized id={`settings-updates-${key}-label`}/>
          </Radio>
          <S.OptionDescription id={`${id}-${key}-desc`}>
            <Localized id={`settings-updates-${key}-description`}/>
          </S.OptionDescription>
        </Fragment>
      )}
    </S.OptionList>

    <UpdateStatus/>
  </>;
});

Content.displayName = 'UpdatesSection';

const UpdatesSection: Section = {
  key: 'updates',
  icon: <UpdatesIcon/>,
  content: Content,
};

export default UpdatesSection;
