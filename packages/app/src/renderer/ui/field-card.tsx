import React from 'react';
import {useLocalization} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';

import {FieldId, FieldValueId, FieldValueType} from '../graphql';

import {ActionCard} from './card';
import * as S from './styles';

export type Props = {
  field: FieldCardData;
  onClick: (id: FieldId) => void;
};

export interface FieldCardData {
  readonly id: FieldId;
  readonly name: string;
  readonly nameAbbr: string;
  readonly valueType: FieldValueType;
  readonly listValues: readonly {
    readonly id: FieldValueId;
  }[] | null;
}

const FieldCardTypes: Record<FieldValueType, string> = {
  FIELD_BOOLEAN: 'field-card-type-boolean',
  FIELD_LIST_ONE: 'field-card-type-list-one',
  FIELD_LIST_MANY: 'field-card-type-list-many',
  FIELD_PLAIN_TEXT: 'field-card-type-text-plain',
};

const FieldCard = React.memo((props: Props): JSX.Element => {
  const {field, onClick} = props;

  const {l10n} = useLocalization();

  const cardTypeMessageId = FieldCardTypes[field.valueType];

  return (
    <ActionCard
      title={<>
        {field.name}
        {field.nameAbbr &&
          <S.CardTitleContext>
            {' '}
            {field.nameAbbr}
          </S.CardTitleContext>
        }
      </>}
      iconAfter={<LinkArrow className='rtl-mirror'/>}
      onClick={() => onClick(field.id)}
    >
      <p>
        {l10n.getString(cardTypeMessageId, {
          listValueCount: field.listValues?.length ?? 0,
        })}
      </p>
    </ActionCard>
  );
});

FieldCard.displayName = 'FieldCard';

export default FieldCard;
