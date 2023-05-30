// This file is one of very few places where private members (#foo) are used,
// in an attempt to ensure that the contents of locks and guards truly are
// impossible to mess with in ways that would horrendously break the only
// real synchronization primitive we have.

export type Disposition = 'read' | 'write';

interface Request {
  readonly type: Disposition;
  readonly resolve: (disposition: Disposition) => void;
  readonly reject: (error: Error) => void;
}

/**
 * Internal lock methods that are only exposed to RwGuard instances, for
 * managing the lock through the guard.
 */
interface RwLockInternals<T> {
  /** Gets the resource protected by the lock. */
  readonly resource: () => T;
  /**
   * Requests to upgrade a reader guard to a writer guard. If there are any
   * other active readers, the returned promise will resolve once there are
   * none left. When the promise resolves, the calling guard will have write
   * disposition until it is invalidated by calling `unlock` or downgraded
   * by calling `downgrade`.
   *
   * Prerequisite: The calling guard must ensure it is a reader. Attempting
   * to upgrade a writer would cause a deadlock, and a finished guard cannot
   * be used.
   * @return A promise that resolves once exclusive write access has been
   *         acquired. The promise is rejected if the lock is closed before
   *         write access could be acquired.
   */
  readonly upgrade: () => Promise<Disposition>;
  /**
   * Requests to downgrade a writer guard to a reader guard. Other readers can
   * proceed with their work. The calling guard will have read disposition
   * until it is invalidated by passing it to `finish`.
   *
   * Unlike `upgrade`, this function returns a value immediately, since the
   * writer is guaranteed to have had exclusive access.
   *
   * Prerequisite: The calling guard must ensure it is a writer. Attempting
   * to downgrade a reader is a no-op, and a finished guard cannot be used.
   */
  readonly downgrade: () => void;
  /**
   * Unlocks the lock. If the lock currently has outstanding readers, then
   * the reader count is decremented. If the lock has a writer, then it is
   * invalidated.
   *
   * Prerequisite: The calling guard must be valid. A finished guard cannot
   * be used.
   */
  readonly unlock: () => void;
}

/**
 * Implements a generic readers-writer lock. The lock protects a single resource
 * which is accessed through guards issued by the lock.
 *
 * This class allows any number of concurrent readers, and exactly one writer
 * at any time. If there is a writer, there cannot be any readers: write access
 * is exclusive. Reader guards obtained through the lock can be upgraded to
 * writers, which creates a new guard and invalidates the reader. When a reader
 * is upgraded, the promise resolves once all other readers have been returned.
 * Requests are processed in the order they are received.
 *
 * Guards *must* be returned to the lock once the owner is finished with them.
 * Failure to return a guard *will* result in hard-to-debug deadlocks.
 */
export default class RwLock<T> {
  /** The resource protected by the lock. */
  readonly #resource: T;
  /** Number of currently active readers. */
  #readers = 0;
  /** True if there is currently a reader. When this is true, readers is 0. */
  #writer = false;
  /** Current pending reader and writer requests. */
  readonly #queue: Request[] = [];
  /** Set to true when the lock is closed. */
  #closed = false;
  /**
   * The resolve function for the close promise. Called when there are no
   * readers and no writer left.
   */
  #resolveClose: ((value: T) => void) | null = null;

  public constructor(resource: T) {
    this.#resource = resource;
  }

  /**
   * True if the lock is closed. A closed lock rejects all requests for reader
   * and writer guards.
   */
  public get isClosed(): boolean {
    return this.#closed;
  }

  /**
   * Requests a reader guard for this lock. If there is a current writer, then
   * the returned promise will resolve as soon as that writer has finished its
   * work.
   * @return A promise that resolves to a reader guard once there is no writer.
   *         The promise is rejected if the lock is closed before the guard
   *         could be acquired.
   */
  public reader(): Promise<RwGuard<T>> {
    return this.#lock('read').then(this.#createGuard);
  }

  /**
   * Requests a writer guard for this lock. If there is already a writer, or if
   * there are any active readers, the returned promise will resolve once there
   * are no active readers *and* no active writer.
   * @return A promise that resolves with a writer guard once exclusive write
   *         access has been acquired. The promise is rejected if the lock is
   *         closed before the guard could be acquired.
   */
  public writer(): Promise<RwGuard<T>> {
    return this.#lock('write').then(this.#createGuard);
  }

  /**
   * Closes the lock. The returned promise will resolve once all current guards
   * have been returned. Pending and future requests will be rejected.
   * @return A promise that resolves once the current writer or current readers
   *         have finished their work. The promise resolves with the protected
   *         resource, as the lock no longer protects it.
   */
  public close(): Promise<T> {
    if (this.#closed) {
      throw new Error('The lock is already closed');
    }
    this.#closed = true;

    const err = new Error('The lock has been closed');
    for (const request of this.#queue) {
      request.reject(err);
    }
    this.#queue.length = 0;

    if (!this.#writer && this.#readers === 0) {
      // We have no readers and no writer. We don't need to wait for anything,
      // so resolve the promise immediately.
      return Promise.resolve(this.#resource);
    }

    // There is at least one reader or a current writer. We have to wait until
    // they're finished.
    return new Promise(resolve => {
      this.#resolveClose = resolve;
    });
  }

  #internals: RwLockInternals<T> = {
    resource: () => this.#resource,

    upgrade: (): Promise<Disposition> => {
      // Even if the lock is closed, we *must* invalidate the reader, to make
      // sure we resolve the `close()` promise.
      this.#internals.unlock();

      // This call can now safely throw if the lock is closed.
      return this.#lock('write');
    },

    downgrade: (): void => {
      if (this.#closed) {
        // If the lock is closed, we *must* invalidate the writer guard first,
        // to make sure we resolve the `close()` promise.
        this.#internals.unlock();
        // We can't acquire a reader guard, as the lock is closed, and the
        // writer has been invalidated. Now it's safe to throw.
        throw new Error('The lock is closed');
      }

      // Special handling: if we call `this.#internals.unlock()`, the queue will
      // be processed immediately. We specifically *don't* want that, as that
      // might allow another writer request to be processed first.

      // Clear the current writer
      this.#writer = false;
      // And add a new reader
      this.#readers++;

      // Now we can try to advance the queue. If the next item in the queue
      // is a reader, it can be resolved since we no longer have a writer.
      this.#tryAdvance();
    },

    unlock: (): void => {
      if (this.#readers > 0) {
        this.#readers--;
      } else if (this.#writer) {
        this.#writer = false;
      } else {
        throw new Error('Cannot unlock: not locked');
      }

      if (this.#closed) {
        if (this.#readers === 0 && !this.#writer) {
          this.#resolveClose?.(this.#resource);
          this.#resolveClose = null;
        }
      } else {
        this.#tryAdvance();
      }
    },
  };

  /**
   * Requests read or write access from the lock.
   * @param type The type of access that is requested.
   * @return A promise promise that resolves when the request access has been
   *         granted. The promise is rejected if the lock has been closed, or
   *         is closed while waiting for access to become available.
   */
  #lock(type: Disposition): Promise<Disposition> {
    if (this.#closed) {
      return Promise.reject(new Error('The lock is closed'));
    }

    const result = new Promise<Disposition>((resolve, reject) => {
      this.#queue.push({
        type,
        resolve: d => {
          resolve(d);
        },
        reject,
      });
    });

    this.#tryAdvance();

    return result;
  }

  #createGuard = (disposition: Disposition): RwGuard<T> =>
    new RwGuard(this.#internals, disposition);

  #tryAdvance(): void {
    const queue = this.#queue;
    switch (queue[0]?.type) {
      case 'read':
        if (!this.#writer) {
          // There is no writer, so we can resolve *all* pending readers in
          // one go, up to the next queued writer.
          do {
            this.#readers++;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            queue.shift()!.resolve('read');
          } while (queue[0]?.type === 'read');
        }
        break;
      case 'write':
        if (this.#readers === 0 && !this.#writer) {
          this.#writer = true;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          queue.shift()!.resolve('write');
        }
        break;
    }
  }
}

/**
 * Represents a reader-writer guard. The guard affords access to the locked
 * resource. Every guard has a disposition, which determines whether the guard
 * is used for reading or writing. A reader guard can be upgraded to a writer,
 * and a writer can be downgraded to a reader.
 */
export class RwGuard<T> {
  /** The owner lock. */
  #lock: RwLockInternals<T>;
  /** The current read/write disposition, or null if finished. */
  #disposition: Disposition | null;

  public constructor(lock: RwLockInternals<T>, disposition: Disposition) {
    this.#lock = lock;
    this.#disposition = disposition;
  }

  /**
   * Whether the lock is valid. Guards are invalidated by calling the `finish`
   * method, which marks the work as completed.
   */
  public get isValid(): boolean {
    return this.#disposition !== null;
  }

  /** True if the guard is a reader. */
  public get isReader(): boolean {
    return this.#disposition === 'read';
  }

  /** True if the guard is the exlusive writer. */
  public get isWriter(): boolean {
    return this.#disposition === 'write';
  }

  /**
   * Retrieves the protected resource.
   * @return The resource protected by the lock.
   * @throws Error: If the lock has been revoked.
   */
  public get(): T {
    this.#ensureValid();
    return this.#lock.resource();
  }

  /**
   * Requests to upgrade a reader guard to a writer guard. If there are any
   * other active readers, the returned promise will resolve once there are none
   * left. When the promise resolves, the returned guard will have write
   * disposition until it is invalidated by calling `finish`.
   *
   * If the guard is already the current writer, the promise resolves
   * immediately.
   * @return A promise that resolves with a writer guard once exclusive write
   *         access has been acquired.
   *
   *         The promise is rejected if the lock is closed before the guard
   *         could be acquired. In this case, the guard is revoked and no longer
   *         has read access.
   */
  public async upgrade(): Promise<void> {
    this.#ensureValid();
    if (this.#disposition !== 'write') {
      // The guard becomes invalid until the upgrade has succeeded
      this.#disposition = null;

      await this.#lock.upgrade();
      this.#disposition = 'write';
    }
  }

  /**
   * Requests to downgrade a writer guard to a reader guard. Other readers can
   * proceed with their work. The guard will then have read disposition until
   * it is invalidated by calling `finish`.
   *
   * If the guard is already a reader, this function is a no-op.
   *
   * Unlike `upgrade`, this function returns immediately, since the writer is
   * guaranteed to have had exclusive access.
   * @throws Error: If the lock has been closed, the downgrade fails. In this
   *         case, the guard is revoked and no longer has exclusive write
   *         access.
   */
  public downgrade(): void {
    this.#ensureValid();
    if (this.#disposition !== 'read') {
      // The guard becomes invalid until the downgrade has succeeded
      this.#disposition = null;

      this.#lock.downgrade();
      this.#disposition = 'read';
    }
  }

  /**
   * Invalidates the guard, marking its work as complete. The guard cannot be
   * used after being invalidated. Attempting to invalidate a finished guard
   * will throw an error.
   */
  public finish(): void {
    this.#ensureValid();
    this.#disposition = null;
    this.#lock.unlock();
  }

  #ensureValid(): void {
    if (this.#disposition === null) {
      throw new Error('Invalid guard');
    }
  }
}
