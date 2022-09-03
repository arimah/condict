import styled from 'styled-components';

import {Button as ButtonBase, BodyText} from '@condict/ui';

import StandardDialog from '../standard-dialog';

export const Main = styled(StandardDialog)`
  max-width: 640px;
  min-width: 360px;
`;

export const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 21px;
  line-height: 24px;
`;

export const Message = styled(BodyText)`
  margin-top: 16px;
  margin-bottom: 16px;
  max-height: 75vh;
  overflow: auto;

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  gap: 8px;
`;

export const Button = styled(ButtonBase)`
  min-width: 112px;
`;
