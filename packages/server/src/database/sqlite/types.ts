export type Options = {
  file: string;
};

export const validateOptions = (options: { [k: string]: any }): Options => {
  const file = options.file;
  if (typeof file !== 'string') {
    throw new Error('Database file name must be a string.');
  }
  if (file === '') {
    throw new Error('Database file name cannot be empty.');
  }
  return {file};
};
