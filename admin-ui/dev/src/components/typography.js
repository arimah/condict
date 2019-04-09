/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import genId from '@condict/gen-id';

const Main = styled.div`
  max-width: 600px;
`;

const randomHref = `#${genId()}`;

export default Object.freeze({
  name: 'Typography',
  initialState: {},
  controls: () => [],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: () =>
    <Main>
      <h1>Heading level 1</h1>
      <p>Short paragraph between headings.</p>
      <h2>Heading level 2</h2>
      <p>Short paragraph between headings.</p>
      <h3>Heading level 3</h3>
      <p>Short paragraph between headings.</p>
      <h4>Heading level 4</h4>
      <p>Short paragraph between headings.</p>
      <h5>Heading level 5</h5>
      <p>Short paragraph between headings.</p>
      <h6>Heading level 6</h6>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis <a href={randomHref}>nostrud exercitation</a> ullamco laboris nisi ut
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
        <li>In <a href={randomHref}>reprehenderit</a>, in voluptate, velit esse cilluum dolore.</li>
        <li>Eu fugia nulla pariatur.</li>
      </ol>
      <p>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </p>
      <p>
        <a href={randomHref}>Unvisited link (href changes on reload)</a>
        {' | '}
        <a href='#visited'>Visited link (static href)</a>
      </p>
    </Main>,
});
