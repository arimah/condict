import chalk, {Chalk} from 'chalk';
import * as winston from 'winston';
import * as Transport from 'winston-transport';

type Level = 'error' | 'warn' | 'info' | 'debug';

export interface LogFile {
  path: string;
  level?: Level;
}

export interface LoggerOptions {
  files?: LogFile[];
}

const levels: Record<Level, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const levelColors: Record<Level, Chalk> = {
  error: chalk.redBright,
  warn: chalk.yellowBright,
  info: chalk.cyanBright,
  debug: chalk.greenBright,
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(
    info => {
      const timestamp = chalk.gray(`[${info.timestamp}]`);
      const level = levelColors[info.level as Level](`[${info.level}]`);
      return `${timestamp} ${level} ${info.message}`;
    }
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export default (config: LoggerOptions) => {
  const transports: Transport[] = [];

  if (process.env.NODE_ENV === 'development') {
    transports.push(new winston.transports.Console({
      // Always show everything in development
      level: 'debug',
      format: consoleFormat,
    }));
  }

  (config.files || []).forEach(file => {
    transports.push(new winston.transports.File({
      filename: file.path,
      level: file.level || 'info',
      format: fileFormat,
    }));
  });

  return winston.createLogger({levels, transports});
};
