import {useState} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';

import {BodyText, Button, LinkButton, useUniqueId} from '@condict/ui';

import {Selectable} from '../styles';

import * as S from './styles';

export type Props = {
  error: Error;
  isGlobalError?: boolean;
  onReload: () => void;
};

// TODO: Better error reporting
const ReportErrorUrl = 'https://github.com/arimah/condict/issues/new';

const RuntimeError = (props: Props): JSX.Element => {
  const {error, isGlobalError = false, onReload} = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();

  const [expandDetails, setExpandDetails] = useState(false);

  return <>
    <S.Heading>
      <Localized id='error-title'/>
    </S.Heading>
    <BodyText>
      <p>
        <Localized id='error-message' elems={{bold: <strong/>}}>
          <></>
        </Localized>
      </p>

      <Selectable as='p'>
        <strong>{error.message}</strong>
      </Selectable>

      <S.DetailsWrapper>
        <p>
          <Button
            slim
            aria-expanded={expandDetails}
            aria-controls={`${id}-details`}
            onClick={() => setExpandDetails(x => !x)}
          >
            {expandDetails ? <ChevronDownIcon/> : <ChevronRightIcon/>}
            <span><Localized id='error-details-button'/></span>
          </Button>
        </p>
        <S.Details
          id={`${id}-details`}
          aria-label={l10n.getString('error-details-label')}
          expanded={expandDetails}
        >
          {error.stack}
        </S.Details>
      </S.DetailsWrapper>

      <p>
        <Localized
          id={isGlobalError ? 'error-global-next-step' : 'error-tab-next-step'}
        />
      </p>

      <p>
        <Button intent='accent' onClick={onReload}>
          <Localized
            id={
              isGlobalError
                ? 'error-reload-app-button'
                : 'error-reload-tab-button'
            }
          />
        </Button>
        {' '}
        <LinkButton href={ReportErrorUrl} intent='accent'>
          <Localized id='error-report-error-button'/>
        </LinkButton>
      </p>
    </BodyText>
  </>;
};

export default RuntimeError;
