import {IncomingHttpHeaders} from 'http';

/**
 * The custom header that we read the Condict session ID from. It takes
 * precedence over the Authorization header.
 */
const SessionIdHeader = 'x-condict-session-id';

const getSessionId = (headers: IncomingHttpHeaders): string | null => {
  const token = headers[SessionIdHeader];
  if (typeof token === 'string') {
    return token;
  }

  const auth = headers.authorization;
  if (auth) {
    const match = auth.trim().match(/^bearer\s+(\S+)$/i);
    if (match) {
      return match[1];
    }
  }
  return null;
};

export default getSessionId;
