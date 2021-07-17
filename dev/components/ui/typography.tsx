/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {BodyText, genUniqueId} from '@condict/ui';

import Demo from '../demo';

const BodyTextWithMaxWidth = styled(BodyText)`
  max-width: 50em;
`;

const RandomHref = `#${genUniqueId()}`;

const Main = (): JSX.Element =>
  <Demo name='Typography'>
    <BodyTextWithMaxWidth underlineLinks>
      <h1>Heading level 1</h1>
      <p>Short paragraph between headings.</p>
      <h2>Heading level 2</h2>
      <p>Short paragraph between headings.</p>
      <h3>Heading <em>level</em> 3</h3>
      <p>Short paragraph between headings.</p>
      <h4>Heading <strong>level</strong> 4</h4>
      <p>Short paragraph between headings.</p>
      <h5>Heading level 5</h5>
      <p>Short paragraph between headings.</p>
      <h6>Heading level 6</h6>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis <a href={RandomHref}>nostrud exercitation</a> ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
      <ul>
        <li>Lorem ipsum dolor sit amet.</li>
        <li>Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
        <li>Ut enum ad minim veniam, quis nostrud exercitation ullamo laboris.</li>
      </ul>
      <p>
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
        deserunt mollit anim id est laborum.
      </p>
      <ol>
        <li>Duis aute irure dolor.</li>
        <li>In <a href={RandomHref}>reprehenderit</a>, in voluptate, velit esse cilluum dolore.</li>
        <li>Eu fugia nulla pariatur.</li>
      </ol>
      <p>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </p>
      <p>
        <a href={RandomHref}>Unvisited link (href changes on reload)</a>
        {' | '}
        <a href='#visited'>Visited link (static href)</a>
      </p>
    </BodyTextWithMaxWidth>
  </Demo>;

export default Main;
