import {Localized} from '@fluent/react';

export type Props = {
  of: ResourceWithTime;
  time?: 'latest' | 'created' | 'updated';
  createdLabelId: string;
  updatedLabelId: string;
};

interface ResourceWithTime {
  readonly timeCreated: number;
  readonly timeUpdated: number;
}

const ResourceTime = (props: Props): JSX.Element => {
  const {of, time: kind = 'latest', createdLabelId, updatedLabelId} = props;

  let time: number;
  let labelId: string;
  if (
    // If kind is 'created', always show the creation time.
    kind === 'created' ||
    // If kind is 'latest', show the creation time if the resource has never
    // been edited (creation time equals update time).
    kind === 'latest' && of.timeCreated === of.timeUpdated
  ) {
    time = of.timeCreated;
    labelId = createdLabelId;
  } else {
    // We get here in one of two cases:
    //   1. kind is 'updated', in which case we always show the updated time.
    //   2. kind is 'latest' and the resource has been updated. Assuming the
    //      update time can't be less than the creation time, we should show
    //      the update time.
    time = of.timeUpdated;
    labelId = updatedLabelId;
  }
  return <Localized id={labelId} vars={{time: new Date(time)}}/>;
};

export default ResourceTime;
