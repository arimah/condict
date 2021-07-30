import {ReactNode} from 'react';
import {FieldError} from 'react-hook-form';

const getErrorMessage = (
  error: FieldError,
  errorMessages: Record<string, ReactNode> | undefined,
  defaultError: ReactNode
): ReactNode => {
  // Always prefer the error's own message.
  if (error.message) {
    return error.message;
  }

  // See if there's an error for this type specifically.
  const message = errorMessages?.[error.type];
  if (message) {
    return message;
  }

  // If all else fails, fall back to the default error.
  return defaultError;
};

export default getErrorMessage;
