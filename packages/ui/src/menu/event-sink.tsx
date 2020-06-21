import React, {ReactNode, SyntheticEvent} from 'react';

export type Props = {
  children: ReactNode;
};

const stopEvent = (e: SyntheticEvent) => {
  e.stopPropagation();
};

// The only purpose of this component is to stop the propagation of key events,
// so they don't escape the menu system. An event sink must be put around the
// top-level ManagedMenu.
const EventSink = ({children}: Props): JSX.Element =>
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div
    onKeyDown={stopEvent}
    onKeyUp={stopEvent}
    onKeyPress={stopEvent}
  >
    {children}
  </div>;

export default EventSink;
