const {UserInputError} = require('apollo-server');

const defaultLengthBetweenMessage = (value, minLength, maxLength) =>
  `must be between ${minLength} and ${maxLength} characters`;

const defaultUniqueMessage = value =>
  `value already in use: ${value}`;

const ensureLengthBetween = (
  value,
  minLength,
  maxLength,
  paramName,
  message
) => {
  if (value.length < minLength || value.length > maxLength) {
    throw new UserInputError(`${paramName}: ${message(value)}`, {
      invalidArgs: [paramName],
    });
  }
};

const ensureMatches = (value, regex, paramName, message) => {
  if (!regex.test(value)) {
    throw new UserInputError(`${paramName}: ${message(value)}`, {
      invalidArgs: [paramName]
    });
  }
};

class Validator {
  constructor(paramName, validate) {
    this.paramName = paramName;
    this.validate = validate;
  }

  map(mapper) {
    return new Validator(
      this.paramName,
      value => {
        value = this.validate(value);
        return mapper(value);
      },
    );
  }

  lengthBetween(
    minLength,
    maxLength,
    message = defaultLengthBetweenMessage
  ) {
    return new Validator(
      this.paramName,
      value => {
        value = this.validate(value);
        ensureLengthBetween(
          value,
          minLength,
          maxLength,
          this.paramName,
          message
        );
        return value;
      }
    );
  }

  matches(regex, message) {
    return new Validator(
      this.paramName,
      value => {
        value = this.validate(value);
        ensureMatches(value, regex, this.paramName, message);
        return value;
      }
    );
  }

  unique(
    currentId,
    getExistingValue,
    message = defaultUniqueMessage
  ) {
    return (
      new AsyncValidator(this.paramName, this.validate)
        .unique(currentId, getExistingValue, message)
    );
  }
}

class AsyncValidator {
  constructor(paramName, validate) {
    this.paramName = paramName;
    this.validate = validate;
  }

  map(mapper) {
    return new AsyncValidator(
      this.paramName,
      async value => {
        value = await this.validate(value);
        return await mapper(value);
      },
    );
  }

  lengthBetween(
    minLength,
    maxLength,
    message = defaultLengthBetweenMessage
  ) {
    return new AsyncValidator(
      this.paramName,
      async value => {
        value = await this.validate(value);
        ensureLengthBetween(
          value,
          minLength,
          maxLength,
          this.paramName,
          message
        );
        return value;
      }
    );
  }

  matches(regex, message) {
    return new AsyncValidator(
      this.paramName,
      async value => {
        value = await this.validate(value);
        ensureMatches(value, regex, this.paramName, message);
        return value;
      }
    );
  }

  unique(
    currentId,
    getExistingValue,
    message = defaultUniqueMessage
  ) {
    return new AsyncValidator(
      this.paramName,
      async value => {
        value = await this.validate(value);

        const existingValue = await getExistingValue(value);

        if (existingValue && existingValue.id !== currentId) {
          throw new UserInputError(`${this.paramName}: ${message(value)}`, {
            invalidArgs: [this.paramName],
            existingId: existingValue.id,
          });
        }
        return value;
      }
    );
  }
}

const createValidator = paramName =>
  new Validator(paramName, value => value);

createValidator.Validator = Validator;
createValidator.AsyncValidator = AsyncValidator;

module.exports = createValidator;
