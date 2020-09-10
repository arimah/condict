import readline from 'readline';
import {Writable} from 'stream';

import {Connection, ConnectionPool} from './database';
import performStartupChecks from './startup-checks';
import {User, UserMut, UserId} from './model';
import {ServerConfig, Logger} from './types';

type Prompt = {
  query(prompt: string): Promise<string>;
  queryPassword(prompt: string): Promise<string>;
};

const withPrompt = async <T>(fn: (prompt: Prompt) => Promise<T>) => {
  let stdoutMuted = false;
  const mutableStdout = new Writable({
    write: (chunk, encoding, callback) => {
      if (stdoutMuted) {
        // Write only newlines (they terminate the input line)
        const text = chunk instanceof Buffer
          ? chunk.toString('utf8')
          : String(chunk);
        const newlines = text.replace(/[^\r\n]/g, '');
        process.stdout.write(newlines, 'utf8');
      } else {
        process.stdout.write(chunk, encoding);
      }
      callback();
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true,
  });

  try {
    const prompt: Prompt = {
      query: prompt => new Promise(resolve => {
        rl.question(prompt, resolve);
      }),
      queryPassword: prompt => new Promise(resolve => {
        rl.question(prompt, result => {
          stdoutMuted = false;
          resolve(result);
        });
        stdoutMuted = true;
      }),
    };

    return await fn(prompt);
  } finally {
    rl.close();
  }
};

const withDatabase = async (
  logger: Logger,
  config: ServerConfig,
  fn: (db: Connection) => Promise<void>
) => {
  const databasePool = new ConnectionPool(logger, config.database);

  try {
    await performStartupChecks(logger, config, databasePool);

    const db = await databasePool.getConnection();
    try {
      await fn(db);
    } finally {
      await db.release();
    }
  } finally {
    await databasePool.close();
  }
};

export const addUser = async (
  logger: Logger,
  config: ServerConfig,
  maybeName?: string | null,
  maybePassword?: string | null
): Promise<void> => {
  const args = await withPrompt(async prompt => {
    const name = maybeName ||
      await prompt.query('Name of new user: ');
    const password = maybePassword ||
      await prompt.queryPassword('Password: ');

    return {name, password};
  });

  try {
    await withDatabase(logger, config, async db => {
      logger.info(`Creating user: ${args.name}`);

      const user = await UserMut.insert(db, args);

      logger.info(`User created: ${user.name} (id = ${user.id})`);
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};

export const editUser = async (
  logger: Logger,
  config: ServerConfig,
  userNameOrId: string | number,
  maybeNewName?: string | null,
  maybeNewPassword?: string | null
): Promise<void> => {
  const args = await withPrompt(async prompt => {
    // If either is specified as an argument, prompt for neither: if the user
    // runs `edit-user x --new-name y`, we assume that's the only thing they
    // want to change.
    if (maybeNewName == null && maybeNewPassword == null) {
      const name =
        await prompt.query('New name (blank to keep current): ') ||
        null;
      const password =
        await prompt.queryPassword('New password (blank to keep current): ') ||
        null;
      return {name, password};
    } else {
      return {
        name: maybeNewName || null,
        password: maybeNewPassword || null,
      };
    }
  });

  try {
    await withDatabase(logger, config, async db => {
      const user = typeof userNameOrId === 'string'
        ? User.byName(db, userNameOrId)
        : User.byId(db, userNameOrId as UserId);

      if (!user) {
        throw new Error(`User not found: ${userNameOrId}`);
      }

      logger.info(`Editing user: ${user.name} (id = ${user.id})`);

      const newUser = await UserMut.update(db, user.id, args);

      if (newUser.name !== user.name) {
        logger.debug(`User renamed: ${user.name} => ${newUser.name}`);
      }
      if (newUser.password_hash !== user.password_hash) {
        logger.debug(`Password changed for user ${newUser.name}`);
      }
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};

export const deleteUser = async (
  logger: Logger,
  config: ServerConfig,
  userNameOrId: string | number
): Promise<void> => {
  try {
    await withDatabase(logger, config, db => {
      let userId: UserId;
      if (typeof userNameOrId === 'number') {
        userId = userNameOrId as UserId;
      } else {
        const user = User.byName(db, userNameOrId);
        if (!user) {
          logger.warn(`User does not exist: ${userNameOrId}`);
          return Promise.resolve();
        }
        userId = user.id;
      }

      const deleted = UserMut.delete(db, userId);
      if (deleted) {
        logger.info(`User deleted: ${userNameOrId}`);
      } else {
        logger.warn(`User not found: ${userNameOrId}`);
      }

      return Promise.resolve();
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};
