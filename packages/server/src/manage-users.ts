import readline from 'readline';
import {Writable} from 'stream';

import {createPool} from './database';
import performStartupChecks from './startup-checks';
import createModelResolvers, {Resolvers} from './model';
import {UserId} from './model/user/types';
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

const withResolvers = async (
  logger: Logger,
  config: ServerConfig,
  fn: (resolvers: Resolvers) => Promise<void>
) => {
  const databasePool = createPool(logger, config.database);

  try {
    await performStartupChecks(logger, config, databasePool);

    const db = await databasePool.getConnection();
    try {
      const resolvers = createModelResolvers(db, logger);
      await fn(resolvers);
    } finally {
      db.release();
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
    await withResolvers(logger, config, async ({mut: {UserMut}}) => {
      logger.info(`Creating user: ${args.name}`);

      const user = await UserMut.insert(args);

      logger.info(`User created: ${user.name} (id = ${user.id})`);
    });
  } catch (e) {
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
    await withResolvers(logger, config, async ({
      model: {User},
      mut: {UserMut},
    }) => {
      const user = typeof userNameOrId === 'string'
        ? User.byName(userNameOrId)
        : User.byId(userNameOrId as UserId);

      if (!user) {
        throw new Error(`User not found: ${userNameOrId}`);
      }

      logger.info(`Editing user: ${user.name} (id = ${user.id})`);

      const newUser = await UserMut.update(user.id, args);

      if (newUser.name !== user.name) {
        logger.debug(`User renamed: ${user.name} => ${newUser.name}`);
      }
      if (newUser.password_hash !== user.password_hash) {
        logger.debug(`Password changed for user ${newUser.name}`);
      }
    });
  } catch (e) {
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
    await withResolvers(logger, config, ({
      model: {User},
      mut: {UserMut},
    }) => {
      let userId: UserId;
      if (typeof userNameOrId === 'number') {
        userId = userNameOrId as UserId;
      } else {
        const user = User.byName(userNameOrId);
        if (!user) {
          logger.warn(`User does not exist: ${userNameOrId}`);
          return Promise.resolve();
        }
        userId = user.id;
      }

      const deleted = UserMut.delete(userId);
      if (deleted) {
        logger.info(`User deleted: ${userNameOrId}`);
      } else {
        logger.warn(`User not found: ${userNameOrId}`);
      }

      return Promise.resolve();
    });
  } catch (e) {
    console.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};
