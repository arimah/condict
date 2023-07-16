import ChevronRightIcon from 'mdi-react/ChevronRightIcon';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

export type Props = {
  onManageFields: () => void;
};

const CustomFieldList = (props: Props): JSX.Element => {
  const {onManageFields} = props;
  // TODO: Summarize what fields are for
  return (
    <section>
      <h2>
        <Localized id='language-custom-fields-heading'/>
      </h2>
      <Button onClick={onManageFields}>
        <span>
          <Localized id='language-manage-fields-button'/>
        </span>
        <ChevronRightIcon className='rtl-mirror'/>
      </Button>
    </section>
  );
};

export default CustomFieldList;
