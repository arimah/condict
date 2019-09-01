export const formatDescription = (desc: string): string => {
  // There is no way to embed */ inside a delimited comment, so just bail in
  // the extremely unlikely case that someone tries this.
  if (desc.includes('*/')) {
    throw new Error(`Field description cannot contain '*/'`);
  }
  return (
    `/**\n` +
    ` * ${desc.replace(/\n/g, `\n * `)}\n` +
    ` */`
  );
};

export class TextBuilder {
  private text: string = '';
  private indentation: string = '';
  private needIndentation: boolean = true;

  public append(value: string): this {
    // If the previous part ended in a newline and we're inserting a
    // non-empty string, we need to indent lines (as long as the current
    // indentation level is not zero, in which case we can skip that work).
    if (this.needIndentation && this.indentation && value && !value.startsWith('\n')) {
      this.text += this.indentation;
    }
    // Add indentation after each newline, except at the very end.
    const indentedValue =
      this.indentation && value.includes('\n')
        ? value.replace(/\n(?!$)/g, `\n${this.indentation}`)
        : value;
    this.text += indentedValue;

    // If the value ends with a newline, we need to insert indentation whenever
    // the next part arrives.
    this.needIndentation = value.endsWith('\n');
    return this;
  }

  public appendLine(value: string): this {
    return this.append(value).append('\n');
  }

  public indented(f: (t: this) => void): this {
    this.indent();
    f(this);
    this.unindent();
    return this;
  }

  public indent(): this {
    this.indentation += '  ';
    return this;
  }

  public unindent(): this {
    this.indentation = this.indentation.slice(0, -2);
    return this;
  }

  public toString(): string {
    return this.text;
  }
}
