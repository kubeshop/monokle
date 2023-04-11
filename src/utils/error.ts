import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';

export function errorMsg(err: unknown) {
  return err instanceof Error ? err.message : ERROR_MSG_FALLBACK;
}

export class ErrorWithCause extends Error {
  constructor(message: string, cause: unknown) {
    super(message, {cause: cause instanceof Error ? cause : undefined});
  }
}
