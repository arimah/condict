const readline = require('readline');

class LineReader {
  constructor(stream) {
    this.stream = stream;
    this.reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });
    this.ended = false;
    // Buffer of lines that have emerged out of the fucking aether despite
    // having paused the goddamn reader.
    this.buffer = [];
    // List of pending promise resolvers/rejecters. Lines or errors are
    // delivered to them in turn.
    this.pending = [];

    // Pause the reader until the first line is requested
    this.reader.pause();

    stream.once('error', err => {
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
        const p = this.pending.shift();
        p.resolve(this.buffer.shift());
      }
      this.pending.forEach(p => this.emitEof(p));
      this.pending = [];
    });
  }

  emitEof(p) {
    if (p.requireLine) {
      p.reject(new Error('Unexpected EOF'));
    } else {
      p.resolve(null);
    }
  }

  eatFromBuffer(p) {
    const nextLine = this.buffer.shift();
    if (nextLine !== undefined) {
      p.resolve(nextLine);
      return true;
    }
    return false;
  }

  read(requireLine = false) {
    return new Promise((resolve, reject) => {
      const p = {requireLine, resolve, reject};

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

module.exports = LineReader;
