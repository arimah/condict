const chalk = require('chalk');
const winston = require('winston');
const {createLogger, format} = winston;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const levelColors = {
  error: chalk.redBright,
  warn: chalk.yellowBright,
  info: chalk.cyanBright,
  debug: chalk.greenBright,
};

const consoleFormat = format.combine(
  format.timestamp(),
  format.printf(
    info => {
      const timestamp = chalk.gray(`[${info.timestamp}]`);
      const level = levelColors[info.level](`[${info.level}]`);
      return `${timestamp} ${level} ${info.message}`;
    }
  )
);

const fileFormat = format.combine(
  format.timestamp(),
  format.json()
);

module.exports = config => {
  const transports = [];

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

  return createLogger({levels, transports});
};
