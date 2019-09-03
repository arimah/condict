import {ConnectionConfig} from 'mysql';

export type Options = Pick<
  ConnectionConfig,
  'user' | 'password' | 'database' | 'host' | 'port'
>;

const isValidPort = (port: number) =>
  !isNaN(port) &&
  isFinite(port) &&
  1 <= port && port <= 65535;

export const validateOptions = (options: { [k: string]: any }): Options => {
  const user = options.user != null ? String(options.user) : undefined;
  const password = options.password != null ? String(options.password) : undefined;
  const database = options.database != null ? String(options.database) : undefined;
  const host = options.host != null ? String(options.host) : undefined;
  const port = options.port != null ? Number(options.port) | 0 : undefined;

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
