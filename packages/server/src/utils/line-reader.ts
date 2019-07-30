import * as readline from 'readline';

interface Pending {
  resolve: (s: string | null) => void;
  reject: (reason: any) => void;
  requireLine: boolean;
}

export default class LineReader {
  private readonly stream: NodeJS.ReadableStream;
  private readonly reader: readline.Interface;
  private ended: boolean = false;
  // Buffer of lines that have emerged out of the fucking aether despite
  // having paused the goddamn reader.
  private buffer: string[] = [];
  // List of pending promise resolvers/rejecters. Lines or errors are
  // delivered to them in turn.
  private pending: Pending[] = [];

  public constructor(stream: NodeJS.ReadableStream) {
    this.stream = stream;
    this.reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    // Pause the reader until the first line is requested.
    this.reader.pause();

    stream.once('error', (err: any) => {
      this.ended = true;

      this.pending.forEach(p => p.reject(err));
      this.pending = [];
    });

    this.reader.on('line', line => {
      const nextPending = this.pending.shift();
      if (!nextPending) {
        this.buffer.push(line);
        return;
      }
      if (this.pending.length === 0) {
        this.reader.pause();
      }
      nextPending.resolve(line);
    });

    this.reader.once('close', () => {
      this.ended = true;

      while (this.buffer.length > 0 && this.pending.length > 0) {
        // We known both pending and buffer have at least one thing
        const p = this.pending.shift() as Pending;
        p.resolve(this.buffer.shift() as string);
      }
      this.pending.forEach(p => this.emitEof(p));
      this.pending = [];
    });
  }

  private emitEof(p: Pending) {
    if (p.requireLine) {
      p.reject(new Error('Unexpected EOF'));
    } else {
      p.resolve(null);
    }
  }

  private eatFromBuffer(p: Pending): boolean {
    const nextLine = this.buffer.shift();
    if (nextLine !== undefined) {
      p.resolve(nextLine);
      return true;
    }
    return false;
  }

  public read(requireLine: true): Promise<string>;
  public read(requireLine: false): Promise<string | null>;
  public read(requireLine: boolean): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const p: Pending = {requireLine, resolve, reject};

      if (this.eatFromBuffer(p)) {
        return;
      }

      if (this.ended) {
        this.emitEof(p);
        return;
      }

      this.pending.push(p);
      this.reader.resume();
    });
  }
}
