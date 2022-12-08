import readline from 'readline';
import {Writable} from 'stream';

import {
  CondictServer,
  ServerConfig,
  Logger,
  UserId,
  NewUserInput,
  EditUserInput,
} from './index.js';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

const withServer = async (
  logger: Logger,
  config: ServerConfig,
  fn: (server: CondictServer) => Promise<void>
) => {
  const server = new CondictServer(logger, config);
  try {
    await server.start();
    await fn(server);
  } finally {
    await server.stop();
  }
};

export const addUser = async (
  logger: Logger,
  config: ServerConfig,
  maybeName?: string | null,
  maybePassword?: string | null
): Promise<void> => {
  const args: NewUserInput = await withPrompt(async prompt => {
    const name = maybeName ??
      await prompt.query('Name of new user: ');
    const password = maybePassword ??
      await prompt.queryPassword('Password: ');

    return {name, password};
  });

  try {
    await withServer(logger, config, async server => {
      logger.info(`Creating user: ${args.name}`);

      const user = await server.addUser(args);

      logger.info(`User created: ${user.name} (id = ${user.id})`);
    });
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error(`An error occurred: ${e.message || e}`);
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
  const args: EditUserInput = await withPrompt(async prompt => {
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
    await withServer(logger, config, async server => {
      const user = typeof userNameOrId === 'string'
        ? await server.getUserByName(userNameOrId)
        : await server.getUserById(userNameOrId as UserId);

      if (!user) {
        throw new Error(`User not found: ${userNameOrId}`);
      }

      logger.info(`Editing user: ${user.name} (id = ${user.id})`);

      const newUser = await server.editUser(user.id, args);

      if (newUser.name !== user.name) {
        logger.debug(`User renamed: ${user.name} => ${newUser.name}`);
      }
      if (args.password) {
        logger.debug(`Password changed for user ${newUser.name}`);
      }
    });
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};

export const logOutUser = async (
  logger: Logger,
  config: ServerConfig,
  userNameOrId: string | number
): Promise<void> => {
  try {
    await withServer(logger, config, async server => {
      let userId: UserId;
      if (typeof userNameOrId === 'number') {
        userId = userNameOrId as UserId;
      } else {
        const user = await server.getUserByName(userNameOrId);
        if (!user) {
          logger.warn(`User does not exist: ${userNameOrId}`);
          return;
        }
        userId = user.id;
      }

      await server.logOutUser(userId);
      logger.info(`User logged out of all sessions: ${userNameOrId}`);
    });
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};

export const deleteUser = async (
  logger: Logger,
  config: ServerConfig,
  userNameOrId: string | number
): Promise<void> => {
  try {
    await withServer(logger, config, async server => {
      let userId: UserId;
      if (typeof userNameOrId === 'number') {
        userId = userNameOrId as UserId;
      } else {
        const user = await server.getUserByName(userNameOrId);
        if (!user) {
          logger.warn(`User does not exist: ${userNameOrId}`);
          process.exitCode = 2;
          return;
        }
        userId = user.id;
      }

      const deleted = await server.deleteUser(userId);
      if (deleted) {
        logger.info(`User deleted: ${userNameOrId}`);
      } else {
        logger.warn(`User not found: ${userNameOrId}`);
        process.exitCode = 2;
      }
    });
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error(`An error occurred: ${e.message || e}`);
    process.exitCode = 1;
  }
};
