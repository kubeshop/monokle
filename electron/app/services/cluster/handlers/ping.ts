import log from 'loglevel';

import type {PingParams, PingResult} from '@shared/ipc';

export async function ping({context, kubeconfig}: PingParams): Promise<PingResult> {
  log.info('fake ping for', context, kubeconfig);
  return {ok: false};
}
