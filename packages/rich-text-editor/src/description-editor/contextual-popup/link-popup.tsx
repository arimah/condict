import React, {MouseEvent} from 'react';
import {Element} from 'slate';
import EditIcon from 'mdi-react/PencilIcon';
import RemoveLinkIcon from 'mdi-react/LinkOffIcon';

import Popup, {PlacementRect} from '../popup';

import * as S from './styles';

export type Props = {
  placement: PlacementRect;
  link: Element;
  onEditLink: () => void;
  onRemoveLink: () => void;
};

const Width = 340;

const preventMouseFocus = (e: MouseEvent) => {
  e.preventDefault();
};

const LinkPopup = (props: Props): JSX.Element => {
  const {placement, link, onEditLink, onRemoveLink} = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const target = link.target!;

  return (
    <Popup
      width={Width}
      placement={placement}
      onMouseDown={preventMouseFocus}
    >
      <S.LinkMain>
        <S.LinkTarget>
          {target.name || target.url}
        </S.LinkTarget>
        <S.LinkType>
          {target.type}
        </S.LinkType>
        <S.LinkActions>
          <S.LinkButton title='Edit link' onClick={onEditLink}>
            <EditIcon/>
          </S.LinkButton>
          <S.LinkButton title='Remove link' onClick={onRemoveLink}>
            <RemoveLinkIcon/>
          </S.LinkButton>
        </S.LinkActions>
      </S.LinkMain>
    </Popup>
  );
};

export default LinkPopup;
