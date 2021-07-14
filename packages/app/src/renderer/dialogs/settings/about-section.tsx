import React, {useImperativeHandle} from 'react';
import {Localized} from '@fluent/react';
import AboutIcon from 'mdi-react/ScriptTextIcon';

import {BodyText} from '@condict/ui';

import {Section, SectionComponent} from './types';

const RepositoryUrl = 'https://github.com/arimah/condict';

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }));

  return <>
    <BodyText>
      <p>
        <Localized
          id='settings-about-authors'
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          elems={{'repo-link': <a href={RepositoryUrl}/>}}
        >
          <></>
        </Localized>
      </p>
      <p>
        <Localized id='settings-about-special-thanks'/>
      </p>
      <ul>
        <Localized
          id='settings-about-special-thanks-list'
          elems={{'list-item': <li/>}}
        >
          <></>
        </Localized>
      </ul>

      <h3>
        <Localized id='settings-about-third-party-licenses-title'/>
      </h3>
      <p>
        <Localized id='settings-about-third-party-licenses-intro'/>
      </p>
    </BodyText>
  </>;
});

Content.displayName = 'AboutSection';

const AboutSection: Section = {
  key: 'about',
  icon: <AboutIcon/>,
  content: Content,
};

export default AboutSection;
