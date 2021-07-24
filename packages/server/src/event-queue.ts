import {
  DictionaryEvent,
  DictionaryEventBatch,
  DictionaryEventEmitter,
} from './event';

/**
 * Implements a dictionary event queue, which batches events for a single
 * request request. At the end of the request, the `flush()` method is called
 * to produce an event batch. The events in the queue are automatically
 * deduplicated.
 */
export default class DictionaryEventQueue implements DictionaryEventEmitter {
  private events = new Map<string, DictionaryEvent>();

  /**
   * Adds an event to the queue.
   * @param event The event to schedule.
   */
  public emit(event: DictionaryEvent): void {
    const key = DictionaryEvent.key(event);
    if (!this.events.has(key)) {
      this.events.set(key, event);
    }
  }

  /**
   * Adds every event in the specified iterable to the queue.
   * @param events the events to schedule.
   */
  public emitAll(events: Iterable<DictionaryEvent>): void {
    for (const event of events) {
      this.emit(event);
    }
  }

  /**
   * Flushes the queue, returning a batch of the scheduled events. After this
   * call, the queue will be empty.
   * @return A batch of all scheduled events, or null if the queue is empty.
   */
  public flush(): DictionaryEventBatch | null {
    if (this.events.size === 0) {
      return null;
    }

    const events = Array.from(this.events.values());
    this.events.clear();
    return {type: 'batch', events};
  }

  /**
   * Flushes the queue, draining the events into the specified emitter. After
   * this call, the queue will be empty.
   */
  public drainInto(emitter: DictionaryEventEmitter): void {
    emitter.emitAll(this.events.values());
    this.events.clear();
  }
}
