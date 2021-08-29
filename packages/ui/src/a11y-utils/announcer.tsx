import React, {useState, useEffect, useRef} from 'react';

import genUniqueId from '../unique-id';
import {SROnly} from './sr-only';

// The indirect listener design in this component is designed to prevent
// unnecessary re-renders in the component that creates the Announcements
// value, while still allowing the Announcer that listens for changes to
// be notified of new messages.

export type Props = {
  /** The announcement controller that the announcer listens to. */
  controller: Announcements;
  /** If true, suppresses all announcements. */
  silent: boolean;
};

interface Message {
  readonly key: string;
  readonly text: string;
}

type Listener = (message: string) => void;

const Listeners = new WeakMap<Announcements, Listener>();

/**
 * Implements an announcer for screen reader-only messages. This component is
 * used when other components need to announce state changes that cannot easily
 * be communictaed through visible text or ARIA attributes. The messages that an
 * announcer manages are inherently ephemeral and temporary. They cannot be
 * repeated and disappear from the DOM after a short time.
 */
const Announcer = React.memo((props: Props): JSX.Element => {
  const {silent = false, controller} = props;

  const [messages, setMessages] = useState<readonly Message[]>([]);

  const mounted = useRef(true);
  useEffect(() => () => {
    mounted.current = false;
  }, []);

  useEffect(() => {
    const receive = (message: string) => {
      const key = genUniqueId();
      setMessages(all => all.concat({key, text: message}));

      // Remove the message again after a short time, to (hopefully) prevent
      // the user from discovering it by moving through the document.
      window.setTimeout(() => {
        if (!mounted.current) {
          setMessages(all => all.filter(m => m.key !== key));
        }
      }, 750);
    };

    Listeners.set(controller, receive);
    return () => {
      Listeners.delete(controller);
    };
  }, [controller]);

  return (
    <SROnly aria-live={silent ? 'off' : 'polite'}>
      {messages.map(({key, text}) =>
        <span key={key} aria-atomic={true}>
          {text}
        </span>
      )}
    </SROnly>
  );
});

Announcer.displayName = 'Announcer';

export default Announcer;

/** The announcement controller. */
export interface Announcements {
  /** */
  readonly announce: (message: string) => void;
}

export const Announcements = {
  /**
   * Creates an announcement controller, for use in class components.
   * @return The announcement controller.
   */
  create(): Announcements {
    const self: Announcements = {
      announce: message => {
        const listener = Listeners.get(self);
        listener?.(message);
      },
    };
    return self;
  },
};

export const useAnnouncements = (): Announcements =>
  // eslint-disable-next-line @typescript-eslint/unbound-method
  useState(Announcements.create)[0];
