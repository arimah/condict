export type Disposition = 'read' | 'write';

interface Request {
  readonly type: 'reader' | 'writer';
  readonly resolve: (token: RwToken) => void;
  readonly reject: (error: Error) => void;
}

/**
 * Implements a generic readers-writer lock. This lock does *not* manage the
 * resource that needs to be locked: instead, it returns *tokens* that can be
 * used to negotiate with the lock.
 *
 * This class allows any number of concurrent readers, and exactly one writer
 * at any time. If there is a writer, there cannot be any readers: write access
 * is exclusive. Reader tokens obtained through the lock can be upgraded to
 * writers, which creates a new token and invalidates the reader. When a reader
 * is upgraded, the promise resolves once all other readers have been returned.
 * Requests are processed in the order they are received.
 *
 * Tokens *must* be returned to the lock once the owner is finished with them.
 * Failure to return a token *will* result in hard-to-debug deadlocks.
 */
export default class RwLock {
  /** All currently active readers. */
  private readonly readers = new Set<RwToken>();
  /** The current writer token. */
  private currentWriter: RwToken | null = null;
  /** Current pending reader and writer requests. */
  private readonly queue: Request[] = [];
  /** Set to true when the lock is closed. */
  private closed = false;
  /**
   * The resolve function for the close promise. Called when there are no
   * readers and no writer left.
   */
  private resolveClose: (() => void) | null = null;

  /**
   * Gets the read or write disposition of a token.
   * @return The token's disposition (read or write). If the token is not valid
   *         for this lock, the return value is null.
   */
  public disposition(token: RwToken): Disposition | null {
    if (token === this.currentWriter) {
      return 'write';
    }
    if (this.readers.has(token)) {
      return 'read';
    }
    return null;
  }

  /**
   * True if the lock is closed. A closed lock rejects all requests for reader
   * and writer tokens.
   */
  public get isClosed(): boolean {
    return this.closed;
  }

  /**
   * Determines whether a token is reader or writer controlled by this lock.
   * @param token The token.
   * @return True if the token is controlled by this lock.
   */
  public isValid(token: RwToken): boolean {
    return this.readers.has(token) || this.currentWriter === token;
  }

  /**
   * Determines whether the token is a reader controlled by this lock.
   * @param token The token.
   * @return True if the token is a reader controlled by this lock.
   */
  public isReader(token: RwToken): boolean {
    return this.readers.has(token);
  }

  /**
   * Determines whether the token is the currently active writer of this lock.
   * @param token The token.
   * @return True if the token is this lock's current writer.
   */
  public isWriter(token: RwToken): boolean {
    return this.currentWriter === token;
  }

  /**
   * Requests a reader token for this lock. If there is a current writer, then
   * the returned promise will resolve as soon as that writer has finished its
   * work.
   * @return A promise that resolves to a reader token once there is no writer.
   *         The promise is rejected if the lock is closed before the token
   *         could be acquired.
   */
  public reader(): Promise<RwToken> {
    if (this.closed) {
      return Promise.reject(new Error('The lock is closed'));
    }

    const result = new Promise<RwToken>((resolve, reject) => {
      this.queue.push({
        type: 'reader',
        resolve,
        reject,
      });
    });

    this.tryAdvance();

    return result;
  }

  /**
   * Requests a writer token for this lock. If there is already a writer, or if
   * there are any active readers, the returned promise will resolve once there
   * are no active readers *and* no active writer.
   * @return A promise that resolves with a writer token once exclusive write
   *         access has been acquired. The promise is rejected if the lock is
   *         closed before the token could be acquired.
   */
  public writer(): Promise<RwToken> {
    if (this.closed) {
      return Promise.reject(new Error('The lock is closed'));
    }

    const result = new Promise<RwToken>((resolve, reject) => {
      this.queue.push({
        type: 'writer',
        resolve,
        reject,
      });
    });

    this.tryAdvance();

    return result;
  }

  /**
   * Requests to upgrade a reader token to a writer token. If there are any
   * other active readers, the returned promise will resolve once there are none
   * left. When the promise resolves, the returned token will have write
   * disposition until it is invalidated by passing it to `finish`.
   *
   * If the token is already the current writer, the promise resolves
   * immediately, with the same token.
   *
   * This function is equivalent to:
   *
   *     if (!lock.isWriter(token)) {
   *       lock.finish(token);
   *       token = await lock.writer();
   *     }
   * @param token The token to upgrade.
   * @return A promise that resolves with a writer token once exclusive write
   *         access has been acquired. The promise is rejected if the lock is
   *         closed before the token could be acquired.
   */
  public upgrade(token: RwToken): Promise<RwToken> {
    if (!this.isValid(token)) {
      throw new Error('Invalid token');
    }

    if (!this.isWriter(token)) {
      // Even if the lock is closed, we *must* invalidate the reader token, to
      // make sure we resolve the `close()` promise.
      this.finish(token);
      // This call can now safely throw if the lock is closed.
      return this.writer();
    }
    return Promise.resolve(token);
  }

  /**
   * Requests to downgrade a writer token to a reader token. Other readers can
   * proceed with their work. The returned token will have read disposition
   * until it is invalidated by passing it to `finish`.
   *
   * If the token is already a reader, this function is a no-op.
   *
   * Unlike `upgrade`, this function returns a value immediately, since the
   * writer is guaranteed to have had exclusive access.
   * @param token The token to downgrade.
   * @return The reader token.
   */
  public downgrade(token: RwToken): RwToken {
    if (!this.isValid(token)) {
      throw new Error('Invalid token');
    }

    if (this.closed) {
      // If the lock is closed, we *must* invalidate the writer token first, to
      // make sure we resolve the `close()` promise.
      this.finish(token);
      // We can't acquire a reader token, as the lock is closed, and the writer
      // has been invalidated. Now it's safe to throw.
      throw new Error('The lock is closed');
    }

    if (token === this.currentWriter) {
      // Special handling: if we call `this.finish(token)`, the queue will be
      // processed immediately. We specifically *don't* want that, as that might
      // allow a writer to take over with an outstanding reader token.

      // Clear the current writer
      this.currentWriter = null;

      // And allocate a new reader
      token = new RwToken(this);
      this.readers.add(token);

      // Now we can try to advance the queue. If the next item in the queue is
      // a reader, it can be resolved since we no longer have a writer.
      this.tryAdvance();
    }
    return token;
  }

  /**
   * Invalidates a token, marking its work as complete. The token cannot be
   * used after being invalidated. Attempting to invalidate a finished token
   * will throw an error.
   * @param token The token to invalidate.
   */
  public finish(token: RwToken): void {
    if (this.readers.has(token)) {
      if (this.currentWriter !== null) {
        throw new Error('Unexpected reader token with active writer');
      }
      this.readers.delete(token);
    } else if (this.currentWriter === token) {
      this.currentWriter = null;
    } else {
      throw new Error('Invalid token');
    }

    if (this.closed) {
      if (this.currentWriter === null && this.readers.size === 0) {
        this.resolveClose?.();
        this.resolveClose = null;
      }
    } else {
      this.tryAdvance();
    }
  }

  /**
   * Closes the lock. The returned promise will resolve once all current tokens
   * have been returned. Pending and future requests will be rejected.
   * @return A promise that resolves once the current writer or current readers
   *         have finished their work.
   */
  public close(): Promise<void> {
    if (this.closed) {
      throw new Error('The lock is already closed');
    }

    const err = new Error('The lock has been closed');
    for (const request of this.queue) {
      request.reject(err);
    }
    this.queue.length = 0;

    this.closed = true;
    if (this.currentWriter === null && this.readers.size === 0) {
      // We have no readers and no writer. We don't need to wait for anything,
      // so resolve the promise immediately.
      return Promise.resolve();
    }

    // There is at least one reader or a current writer. We have to wait until
    // they're finished.
    return new Promise(resolve => {
      this.resolveClose = resolve;
    });
  }

  private tryAdvance(): void {
    const queue = this.queue;
    switch (queue[0]?.type) {
      case 'reader':
        if (this.currentWriter === null) {
          // There is no writer, so we can resolve *all* pending readers in
          // one go, up to the next queued writer.
          do {
            const token = new RwToken(this);
            this.readers.add(token);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            queue.shift()!.resolve(token);
          } while (queue[0]?.type === 'reader');
        }
        break;
      case 'writer':
        if (this.currentWriter === null && this.readers.size === 0) {
          const token = new RwToken(this);
          this.currentWriter = token;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          queue.shift()!.resolve(token);
        }
        break;
    }
  }
}

/**
 * Represents a reader-writer token. The token affords access to the locked
 * resource. Every token has a disposition, which determines whether the token
 * is used for reading or writing. The disposition of a token cannot be changed,
 * but a token can be upgraded to a write token by exchanging it.
 */
export class RwToken {
  /** The owner lock. */
  private lock: RwLock;

  public constructor(lock: RwLock) {
    this.lock = lock;
  }

  /** The owner lock. */
  public get owner(): RwLock {
    return this.lock;
  }

  /** The disposition of the token. */
  public get disposition(): Disposition | null {
    return this.lock.disposition(this);
  }

  /**
   * Whether the lock is valid. Tokens are invalidated by calling the `finish`
   * method, which marks the work as completed.
   */
  public get isValid(): boolean {
    return this.lock.isValid(this);
  }

  /** True if the token is a reader. */
  public get isReader(): boolean {
    return this.lock.isReader(this);
  }

  /** True if the token is the exlusive writer. */
  public get isWriter(): boolean {
    return this.lock.isWriter(this);
  }

  /**
   * Requests to upgrade a reader token to a writer token. If there are any
   * other active readers, the returned promise will resolve once there are none
   * left. When the promise resolves, the returned token will have write
   * disposition until it is invalidated by calling `finish`.
   *
   * If the token is already the current writer, the promise resolves
   * immediately, with the same token.
   *
   * This function is equivalent to:
   *
   *     if (!token.isWriter) {
   *       token.finish();
   *       token = await lock.writer();
   *     }
   * @return A promise that resolves with a writer token once exclusive write
   *         access has been acquired. The promise is rejected if the lock is
   *         closed before the token could be acquired.
   */
  public upgrade(): Promise<RwToken> {
    return this.lock.upgrade(this);
  }

  /**
   * Requests to downgrade a writer token to a reader token. Other readers can
   * proceed with their work. The returned token will have read disposition
   * until it is invalidated by calling `finish`.
   *
   * If the token is already a reader, this function is a no-op.
   *
   * Unlike `upgrade`, this function returns a value immediately, since the
   * writer is guaranteed to have had exclusive access.
   * @return The reader token.
   */
  public downgrade(): RwToken {
    return this.lock.downgrade(this);
  }

  /**
   * Invalidates the token, marking its work as complete. The token cannot be
   * used after being invalidated. Attempting to invalidate a finished token
   * will throw an error.
   */
  public finish(): void {
    return this.lock.finish(this);
  }
}
