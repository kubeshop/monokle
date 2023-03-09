import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';

export function errorMsg(err: unknown) {
  return err instanceof Error ? err.message : ERROR_MSG_FALLBACK;
}
