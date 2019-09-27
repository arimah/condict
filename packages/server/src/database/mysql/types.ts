import {ConnectionConfig} from 'mysql';

export type Options = Pick<
  ConnectionConfig,
  'user' | 'password' | 'database' | 'host' | 'port'
>;

const isValidPort = (port: number) =>
  !isNaN(port) &&
  isFinite(port) &&
  1 <= port && port <= 65535;

const optional = <T>(value: any, transform: (value: any) => T) =>
  value != null ? transform(value) : undefined;

export const validateOptions = (options: { [k: string]: any }): Options => {
  const user = optional(options.user, String);
  const password = optional(options.password, String);
  const database = optional(options.database, String);
  const host = optional(options.host, String);
  const port = optional(options.port, port => Number(port) | 0);

  if (port !== undefined && !isValidPort(port)) {
    throw new Error('The database port, if specified, must be an integer between 1 and 65535 (inclusive).');
  }

  return {
    user,
    password,
    database,
    host,
    port,
  };
};
