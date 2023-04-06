import type {PingParams, PingResult} from '@shared/ipc';

export async function ping({context, kubeconfig}: PingParams): Promise<PingResult> {
  // eslint-disable-next-line no-console
  console.log('fake ping for', context, kubeconfig);
  return {ok: false};
}
